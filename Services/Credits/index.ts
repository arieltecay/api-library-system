import { ClientModel } from '../../models/Client/index.js';
import type { ClientLean } from '../../models/Client/index.js';
import { CreditMovementModel } from '../../models/CreditMovement/index.js';
import type { CreditMovementLean } from '../../models/CreditMovement/index.js';
import { SaleModel } from '../../models/Sale/index.js';
import type { SaleLean } from '../../models/Sale/index.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface CreditListResult {
  items: Array<{
    client: ClientLean;
    balance: number;
    lastPaymentAt?: Date;
    lastCreditAt?: Date;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalOutstanding: number;
    overdueCount: number;
    overdueAmount: number;
  };
}

export interface ClientCreditResult {
  client: ClientLean;
  movements: CreditMovementLean[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SettleDebtResult {
  creditMovement: CreditMovementLean;
  client: ClientLean;
  sale?: SaleLean;
}

export async function listCredits(params: {
  search?: string;
  overdue?: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}): Promise<CreditListResult> {
  const filter: Record<string, unknown> = { balance: { $gt: 0 }, active: true };

  if (params.search) {
    filter.$or = [
      { fullName: { $regex: params.search, $options: 'i' } },
      { dni: { $regex: params.search, $options: 'i' } },
    ];
  }

  // For overdue, we'd need to check credit movements older than 30 days
  // Simplified: just return all with balance > 0
  const clients = await ClientModel.find(filter).lean();
  
  // Calculate summary
  const totalOutstanding = clients.reduce((sum, c) => sum + c.balance, 0);
  const overdueCount = 0; // Would need more complex logic
  const overdueAmount = 0;

  const sort: Record<string, 1 | -1> = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
  const sortedClients = clients.sort((a, b) => {
    const aVal = a[params.sortBy as keyof typeof a];
    const bVal = b[params.sortBy as keyof typeof b];
    if (aVal < bVal) return sort[params.sortBy] === 1 ? -1 : 1;
    if (aVal > bVal) return sort[params.sortBy] === 1 ? 1 : -1;
    return 0;
  });

  const paginated = sortedClients.slice((params.page - 1) * params.limit, params.page * params.limit);

  return {
    items: paginated.map(c => ({ client: withId(c) as ClientLean, balance: c.balance })),
    total: clients.length,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(clients.length / params.limit),
    summary: { totalOutstanding, overdueCount, overdueAmount },
  };
}

export async function getClientCredit(clientId: string, page: number, limit: number): Promise<ClientCreditResult> {
  const client = await ClientModel.findById(clientId).lean();
  if (!client) {
    throw new NotFoundError('Cliente no encontrado');
  }

  const [movements, total] = await Promise.all([
    CreditMovementModel.find({ client: clientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CreditMovementModel.countDocuments({ client: clientId }),
  ]);

  return {
    client: withId(client) as ClientLean,
    movements: withIds(movements) as CreditMovementLean[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function settleDebt(
  clientId: string,
  adminId: string,
  amount: number,
  method: 'cash' | 'transfer',
  note?: string
): Promise<SettleDebtResult> {
  const client = await ClientModel.findById(clientId);
  if (!client) {
    throw new NotFoundError('Cliente no encontrado');
  }
  if (client.balance <= 0) {
    throw new ValidationError('El cliente no tiene deuda pendiente');
  }
  if (amount > client.balance) {
    throw new ValidationError('El monto a pagar supera la deuda del cliente');
  }

  const newBalance = client.balance - amount;
  client.balance = newBalance;
  await client.save();

  // Find the oldest unsettled sale to mark as settled
  let settledSale: SaleLean | undefined;
  if (newBalance === 0) {
    const unsettledSale = await SaleModel.findOne({
      client: clientId,
      paymentMethod: 'credit',
      settled: false,
      type: 'sale',
    }).sort({ createdAt: 1 }).lean();
    
    if (unsettledSale) {
      await SaleModel.findByIdAndUpdate(unsettledSale._id, { settled: true, settledAt: new Date() });
      settledSale = withId(unsettledSale) as SaleLean;
    }
  }

  const creditMovement = await CreditMovementModel.create({
    client: clientId,
    sale: settledSale?._id,
    type: 'payment',
    amount,
    balanceAfter: newBalance,
    method,
    note: note || `Pago de deuda (${method})`,
    admin: adminId,
  });

  return {
    creditMovement: creditMovement.toJSON() as CreditMovementLean,
    client: client.toJSON() as ClientLean,
    sale: settledSale ?? undefined,
  };
}

export async function getCreditsSummary(): Promise<{
  totalOutstanding: number;
  clientsWithDebt: number;
  totalCreditsThisMonth: number;
  totalPaymentsThisMonth: number;
  overdueCount: number;
  overdueAmount: number;
}> {
  const [clients, movementsThisMonth] = await Promise.all([
    ClientModel.find({ balance: { $gt: 0 }, active: true }).lean(),
    CreditMovementModel.find({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }).lean(),
  ]);

  const totalOutstanding = clients.reduce((sum, c) => sum + c.balance, 0);
  const clientsWithDebt = clients.length;

  const creditsThisMonth = movementsThisMonth
    .filter(m => m.type === 'debt')
    .reduce((sum, m) => sum + m.amount, 0);
  const paymentsThisMonth = movementsThisMonth
    .filter(m => m.type === 'payment')
    .reduce((sum, m) => sum + m.amount, 0);

  // Calcular vencidos (+30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const overdueSales = await SaleModel.find({
    paymentMethod: 'credit',
    settled: false,
    createdAt: { $lt: thirtyDaysAgo }
  }).lean();

  const overdueAmount = overdueSales.reduce((sum, s) => sum + s.total, 0);
  const overdueClientIds = new Set(overdueSales.map(s => String(s.client)));
  const overdueCount = overdueClientIds.size;

  return {
    totalOutstanding,
    clientsWithDebt,
    totalCreditsThisMonth: creditsThisMonth,
    totalPaymentsThisMonth: paymentsThisMonth,
    overdueCount,
    overdueAmount,
  };
}

export async function getRecentHistory(limit: number = 5): Promise<CreditMovementLean[]> {
  const movements = await CreditMovementModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: 'client',
      select: 'fullName dni balance',
    })
    .lean();

  return withIds(movements) as CreditMovementLean[];
}