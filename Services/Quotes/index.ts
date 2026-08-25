import { QuoteModel } from '../../models/Quote/index.js';
import type { QuoteLean } from '../../models/Quote/index.js';
import { ProductModel } from '../../models/Product/index.js';
import { ClientModel } from '../../models/Client/index.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface QuotePreviewResult {
  items: Array<{
    product: string;
    name: string;
    type: 'product' | 'service';
    quantity: number;
    unitPrice: number;
    unitCost?: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
}

export interface QuoteResult {
  quote: QuoteLean;
}

export interface QuoteItemInfo {
  product: string;
  name: string;
  type: 'product' | 'service';
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  subtotal: number;
}

export interface PopulatedClientInfo {
  id: string;
  fullName: string;
  balance: number;
}

export interface PopulatedUserInfo {
  id: string;
  name: string;
  role: string;
}

export type PopulatedQuoteLean = Omit<QuoteLean, 'client' | 'seller'> & {
  number: number;
  client?: PopulatedClientInfo | null;
  seller: PopulatedUserInfo;
  items: QuoteItemInfo[];
};

export interface QuoteListResult {
  items: PopulatedQuoteLean[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function previewQuote(
  schoolId: string,
  items: Array<{ product: string; quantity: number }>,
  clientId: string | undefined,
  discount: number
): Promise<QuotePreviewResult> {
  const [products, client] = await Promise.all([
    ProductModel.find({ _id: { $in: items.map(i => i.product) }, school: schoolId }).lean(),
    clientId ? ClientModel.findOne({ _id: clientId, school: schoolId }).lean() : Promise.resolve(null),
  ]);

  const quoteItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find(p => p._id.toString() === item.product);
    if (!product) {
      throw new NotFoundError(`Producto no encontrado: ${item.product}`);
    }
    if (!product.active) {
      throw new ValidationError(`Producto no disponible: ${product.name}`);
    }

    const unitPrice = product.price;
    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    quoteItems.push({
      product: product._id.toString(),
      name: product.name,
      type: product.type,
      quantity: item.quantity,
      unitPrice,
      unitCost: product.cost ?? 0,
      subtotal: itemSubtotal,
    });
  }

  if (discount > subtotal) {
    throw new ValidationError('El descuento no puede ser mayor al subtotal');
  }

  const total = subtotal - discount;

  return {
    items: quoteItems,
    subtotal,
    discount,
    total,
  };
}

export async function createQuote(
  schoolId: string,
  sellerId: string,
  items: Array<{ product: string; quantity: number }>,
  clientId: string | undefined,
  discount: number
): Promise<QuoteResult> {
  const preview = await previewQuote(schoolId, items, clientId, discount);

  const session = await QuoteModel.db.startSession();
  session.startTransaction();

  try {
    // Generate sequential quote number within the transaction
    const lastNumber = await QuoteModel.findOne({ school: schoolId }, { number: 1 }).sort({ number: -1 }).session(session);
    const nextNumber = (lastNumber?.number ?? 0) + 1;

    // Create quote
    const quote = await QuoteModel.create([{
      items: preview.items.map(i => ({
        product: i.product,
        name: i.name,
        type: i.type,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        unitCost: i.unitCost,
        subtotal: i.subtotal,
      })),
      number: nextNumber,
      subtotal: preview.subtotal,
      discount: preview.discount,
      total: preview.total,
      client: clientId ?? undefined,
      seller: sellerId,
      school: schoolId,
      status: 'active',
    }], { session });

    await session.commitTransaction();

    return {
      quote: quote[0]!.toJSON() as QuoteLean,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getQuoteById(schoolId: string, id: string): Promise<QuoteLean> {
  const quote = await QuoteModel.findOne({ _id: id, school: schoolId })
    .populate('client', 'fullName balance')
    .populate('seller', 'name role')
    .lean();
  if (!quote) {
    throw new NotFoundError('Presupuesto no encontrado');
  }
  return withId(quote) as QuoteLean;
}

export async function listQuotes(params: {
  schoolId: string;
  clientId?: string;
  sellerId?: string;
  status?: 'active' | 'cancelled';
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}): Promise<QuoteListResult> {
  const filter: Record<string, unknown> = { school: params.schoolId };

  if (params.clientId) filter.client = params.clientId;
  if (params.sellerId) filter.seller = params.sellerId;
  if (params.status) filter.status = params.status;
  if (params.fromDate || params.toDate) {
    filter.createdAt = {};
    if (params.fromDate) (filter.createdAt as Record<string, Date>).$gte = params.fromDate;
    if (params.toDate) (filter.createdAt as Record<string, Date>).$lte = params.toDate;
  }
  if (params.search) {
    const asNumber = Number(params.search);
    if (!Number.isNaN(asNumber)) {
      filter.number = asNumber;
    }
  }

  const sort: Record<string, 1 | -1> = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    QuoteModel.find(filter)
      .sort(sort)
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .populate('client', 'fullName balance')
      .populate('seller', 'name role')
      .lean(),
    QuoteModel.countDocuments(filter),
  ]);

  return {
    items: withIds(items) as PopulatedQuoteLean[],
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function cancelQuote(schoolId: string, id: string): Promise<QuoteLean> {
  const quote = await QuoteModel.findOne({ _id: id, school: schoolId });
  if (!quote) {
    throw new NotFoundError('Presupuesto no encontrado');
  }
  if (quote.status === 'cancelled') {
    throw new ValidationError('El presupuesto ya está cancelado');
  }

  quote.status = 'cancelled';
  await quote.save();

  return quote.toJSON() as QuoteLean;
}