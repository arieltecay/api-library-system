import { ClientModel } from '../../models/Client/index.js';
import type { ClientLean } from '../../models/Client/index.js';
import { SaleModel } from '../../models/Sale/index.js';
import type { SaleLean } from '../../models/Sale/index.js';
import { CreditMovementModel } from '../../models/CreditMovement/index.js';
import type { CreditMovementLean } from '../../models/CreditMovement/index.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface ClientListResult {
  items: ClientLean[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientHistoryResult {
  sales: SaleLean[];
  creditMovements: CreditMovementLean[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listClients(params: {
  search?: string;
  hasDebt?: boolean;
  active?: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}): Promise<ClientListResult> {
  const filter: Record<string, unknown> = {};

  if (params.search) {
    filter.$or = [
      { fullName: { $regex: params.search, $options: 'i' } },
      { dni: { $regex: params.search, $options: 'i' } },
      { phone: { $regex: params.search, $options: 'i' } },
    ];
  }
  if (params.hasDebt) filter.balance = { $gt: 0 };
  if (params.active !== undefined) filter.active = params.active;

  // Exclude default client from general listing unless explicitly searched
  if (!params.search) {
    filter.isDefault = { $ne: true };
  }

  const sort: Record<string, 1 | -1> = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    ClientModel.find(filter)
      .sort(sort)
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean(),
    ClientModel.countDocuments(filter),
  ]);

  return {
    items: withIds(items) as ClientLean[],
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function getClientById(id: string): Promise<ClientLean> {
  const client = await ClientModel.findById(id).lean();
  if (!client) {
    throw new NotFoundError('Cliente no encontrado');
  }
  return withId(client) as ClientLean;
}

export async function createClient(data: {
  fullName: string;
  phone?: string;
  dni: string;
}): Promise<ClientLean> {
  const existing = await ClientModel.findOne({ dni: data.dni }).lean();
  if (existing) {
    throw new ConflictError('Ya existe un cliente con ese DNI');
  }

  const client = await ClientModel.create(data);
  return client.toJSON() as ClientLean;
}

export async function updateClient(id: string, data: Partial<{
  fullName: string;
  phone?: string;
  dni: string;
  active: boolean;
}>): Promise<ClientLean> {
  if (data.dni) {
    const existing = await ClientModel.findOne({ dni: data.dni, _id: { $ne: id } }).lean();
    if (existing) {
      throw new ConflictError('Ya existe un cliente con ese DNI');
    }
  }

  const client = await ClientModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!client) {
    throw new NotFoundError('Cliente no encontrado');
  }
  return withId(client) as ClientLean;
}

export async function deleteClient(id: string): Promise<void> {
  const client = await ClientModel.findById(id).lean();
  if (!client) {
    throw new NotFoundError('Cliente no encontrado');
  }
  if (client.isDefault) {
    throw new Error('No se puede eliminar el cliente por defecto');
  }
  await ClientModel.findByIdAndDelete(id);
}

export async function getClientHistory(id: string, page: number, limit: number): Promise<ClientHistoryResult> {
  const client = await ClientModel.findById(id).lean();
  if (!client) {
    throw new NotFoundError('Cliente no encontrado');
  }

  const [sales, creditMovements, totalSales] = await Promise.all([
    SaleModel.find({ client: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CreditMovementModel.find({ client: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    SaleModel.countDocuments({ client: id }),
  ]);

  const total = totalSales + await CreditMovementModel.countDocuments({ client: id });

  return {
    sales: withIds(sales) as SaleLean[],
    creditMovements: withIds(creditMovements) as CreditMovementLean[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getDebtors(): Promise<ClientLean[]> {
  const clients = await ClientModel.find({ balance: { $gt: 0 }, active: true }).lean();
  return withIds(clients) as ClientLean[];
}

export async function getClientWithDebt(id: string): Promise<ClientLean & { debt: number }> {
  const client = await ClientModel.findById(id).lean();
  if (!client) {
    throw new NotFoundError('Cliente no encontrado');
  }
  return { ...(withId(client) as ClientLean), debt: client.balance };
}