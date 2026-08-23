import { ProductModel } from '../../models/Product/index.js';
import type { ProductLean } from '../../models/Product/index.js';
import { ProductType, ProductUnit } from '../../models/Product/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';
import { Types } from 'mongoose';

export function deriveCode(type: ProductType, id: string): string {
  const prefix = type === 'service' ? 'SRV' : 'PRD';
  return `${prefix}-${id.toString().slice(-5).toUpperCase()}`;
}

function withCode<T extends { id: string; type: ProductType; code?: string }>(item: T): T {
  if (!item.code) {
    return { ...item, code: deriveCode(item.type, item.id) };
  }
  return item;
}

export interface ProductListResult {
  items: ProductLean[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockUpdateResult {
  product: ProductLean;
  previousStock: number;
  newStock: number;
}

export async function listProducts(params: {
  schoolId: string;
  search?: string;
  type?: 'product' | 'service';
  active?: boolean;
  lowStock?: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}): Promise<ProductListResult> {
  const filter: Record<string, unknown> = { school: params.schoolId };

  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: 'i' } },
      { description: { $regex: params.search, $options: 'i' } },
      { code: { $regex: params.search, $options: 'i' } },
    ];
  }
  if (params.type) filter.type = params.type;
  if (params.active !== undefined) filter.active = params.active;
  if (params.lowStock) {
    filter.$expr = { $lte: ['$stock', { $ifNull: ['$minStock', 10] }] };
  }

  const sort: Record<string, 1 | -1> = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .sort(sort)
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    items: (withIds(items) as ProductLean[]).map(withCode),
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function getProductById(schoolId: string, id: string): Promise<ProductLean> {
  const product = await ProductModel.findOne({ _id: id, school: schoolId }).lean();
  if (!product) {
    throw new NotFoundError('Producto no encontrado');
  }
  return withCode(withId(product) as ProductLean);
}

export async function createProduct(schoolId: string, data: {
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  unit?: ProductUnit;
  code?: string;
}): Promise<ProductLean> {
  const existing = await ProductModel.findOne({ name: data.name, school: schoolId }).lean();
  if (existing) {
    throw new ConflictError('Ya existe un producto con ese nombre en esta escuela');
  }

  let finalCode = data.code?.toUpperCase().trim();
  if (finalCode) {
    const codeExists = await ProductModel.findOne({ code: finalCode, school: schoolId }).lean();
    if (codeExists) {
      throw new ConflictError('El código ya existe en esta escuela');
    }
  } else {
    finalCode = deriveCode(data.type, new Types.ObjectId().toString());
  }

  const product = await ProductModel.create({
    ...data,
    code: finalCode,
    school: schoolId,
    stock: data.type === 'service' ? 0 : data.stock,
  });

  return withCode(product.toJSON() as ProductLean);
}

export async function updateProduct(schoolId: string, id: string, data: Partial<{
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  unit?: ProductUnit;
  active: boolean;
  code?: string;
}>): Promise<ProductLean> {
  if (data.name) {
    const existing = await ProductModel.findOne({ name: data.name, school: schoolId, _id: { $ne: id } }).lean();
    if (existing) {
      throw new ConflictError('Ya existe un producto con ese nombre en esta escuela');
    }
  }

  if (data.code !== undefined) {
    const finalCode = data.code.toUpperCase().trim();
    if (finalCode) {
      const codeExists = await ProductModel.findOne({ code: finalCode, school: schoolId, _id: { $ne: id } }).lean();
      if (codeExists) {
        throw new ConflictError('El código ya existe en esta escuela');
      }
      data.code = finalCode;
    } else {
      data.code = undefined;
    }
  }

  if (data.type === 'service' && data.stock !== undefined && data.stock > 0) {
    throw new ValidationError('Los servicios no pueden tener stock');
  }

  const product = await ProductModel.findOneAndUpdate({ _id: id, school: schoolId }, data, { new: true, runValidators: true }).lean();
  if (!product) {
    throw new NotFoundError('Producto no encontrado');
  }
  return withCode(withId(product) as ProductLean);
}

export async function deleteProduct(schoolId: string, id: string): Promise<void> {
  const product = await ProductModel.findOneAndDelete({ _id: id, school: schoolId });
  if (!product) {
    throw new NotFoundError('Producto no encontrado');
  }
}

export async function updateStock(schoolId: string, id: string, quantity: number, operation: 'add' | 'set'): Promise<StockUpdateResult> {
  const product = await ProductModel.findOne({ _id: id, school: schoolId });
  if (!product) {
    throw new NotFoundError('Producto no encontrado');
  }

  if (product.type === 'service') {
    throw new ValidationError('No se puede modificar stock de un servicio');
  }

  const previousStock = product.stock;
  const newStock = operation === 'add' ? product.stock + quantity : quantity;

  if (newStock < 0) {
    throw new ValidationError('El stock no puede ser negativo');
  }

  product.stock = newStock;
  await product.save();

  return {
    product: product.toJSON() as ProductLean,
    previousStock,
    newStock,
  };
}

export async function getLowStockProducts(schoolId: string): Promise<ProductLean[]> {
  const products = await ProductModel.find({
    school: schoolId,
    active: true,
    type: 'product',
    $expr: { $lte: ['$stock', { $ifNull: ['$minStock', 10] }] },
  }).lean();
  return withIds(products) as ProductLean[];
}