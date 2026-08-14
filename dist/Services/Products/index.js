import { ProductModel } from '../../models/Product/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';
export function deriveCode(type, id) {
    const prefix = type === 'service' ? 'SRV' : 'PRD';
    return `${prefix}-${id.toString().slice(-5).toUpperCase()}`;
}
function withCode(item) {
    if (!item.code) {
        return { ...item, code: deriveCode(item.type, item.id) };
    }
    return item;
}
export async function listProducts(params) {
    const filter = {};
    if (params.search) {
        filter.$or = [
            { name: { $regex: params.search, $options: 'i' } },
            { description: { $regex: params.search, $options: 'i' } },
        ];
    }
    if (params.type)
        filter.type = params.type;
    if (params.active !== undefined)
        filter.active = params.active;
    if (params.lowStock) {
        filter.$expr = { $lte: ['$stock', { $ifNull: ['$minStock', 10] }] };
    }
    const sort = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
    const [items, total] = await Promise.all([
        ProductModel.find(filter)
            .sort(sort)
            .skip((params.page - 1) * params.limit)
            .limit(params.limit)
            .lean(),
        ProductModel.countDocuments(filter),
    ]);
    return {
        items: withIds(items).map(withCode),
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
    };
}
export async function getProductById(id) {
    const product = await ProductModel.findById(id).lean();
    if (!product) {
        throw new NotFoundError('Producto no encontrado');
    }
    return withCode(withId(product));
}
export async function createProduct(data) {
    const existing = await ProductModel.findOne({ name: data.name }).lean();
    if (existing) {
        throw new ConflictError('Ya existe un producto con ese nombre');
    }
    const product = await ProductModel.create({
        ...data,
        stock: data.type === 'service' ? 0 : data.stock,
    });
    return withCode(product.toJSON());
}
export async function updateProduct(id, data) {
    if (data.name) {
        const existing = await ProductModel.findOne({ name: data.name, _id: { $ne: id } }).lean();
        if (existing) {
            throw new ConflictError('Ya existe un producto con ese nombre');
        }
    }
    if (data.type === 'service' && data.stock !== undefined && data.stock > 0) {
        throw new ValidationError('Los servicios no pueden tener stock');
    }
    const product = await ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!product) {
        throw new NotFoundError('Producto no encontrado');
    }
    return withCode(withId(product));
}
export async function deleteProduct(id) {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
        throw new NotFoundError('Producto no encontrado');
    }
}
export async function updateStock(id, quantity, operation) {
    const product = await ProductModel.findById(id);
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
        product: product.toJSON(),
        previousStock,
        newStock,
    };
}
export async function getLowStockProducts() {
    const products = await ProductModel.find({
        active: true,
        type: 'product',
        $expr: { $lte: ['$stock', { $ifNull: ['$minStock', 10] }] },
    }).lean();
    return withIds(products);
}
//# sourceMappingURL=index.js.map