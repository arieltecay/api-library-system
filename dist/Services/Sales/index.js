import { SaleModel } from '../../models/Sale/index.js';
import { ProductModel } from '../../models/Product/index.js';
import { ClientModel } from '../../models/Client/index.js';
import { CashShiftModel } from '../../models/CashShift/index.js';
import { CreditMovementModel } from '../../models/CreditMovement/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';
export async function previewSale(items, clientId, discount, paymentMethod, amountReceived) {
    const [products, client, activeShift] = await Promise.all([
        ProductModel.find({ _id: { $in: items.map(i => i.product) } }).lean(),
        clientId ? ClientModel.findById(clientId).lean() : Promise.resolve(null),
        CashShiftModel.findOne({ status: 'open' }).lean(),
    ]);
    if (paymentMethod === 'credit' && !client) {
        throw new NotFoundError('Cliente requerido para venta a crédito');
    }
    if (!activeShift) {
        throw new ConflictError('No hay turno de caja abierto');
    }
    const saleItems = [];
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
        saleItems.push({
            product: product._id.toString(),
            name: product.name,
            type: product.type,
            quantity: item.quantity,
            unitPrice,
            subtotal: itemSubtotal,
        });
    }
    if (discount > subtotal) {
        throw new ValidationError('El descuento no puede ser mayor al subtotal');
    }
    const total = subtotal - discount;
    let change = 0;
    let creditBalanceAfter;
    if (paymentMethod === 'cash' || paymentMethod === 'transfer') {
        if (amountReceived === undefined || amountReceived < total) {
            throw new ValidationError('Monto recibido insuficiente para pago');
        }
        change = amountReceived - total;
    }
    else if (paymentMethod === 'credit') {
        creditBalanceAfter = client.balance + total;
    }
    return {
        items: saleItems,
        subtotal,
        discount,
        total,
        amountReceived,
        change,
        paymentMethod,
        creditBalanceAfter,
    };
}
export async function createSale(sellerId, cashShiftId, items, clientId, discount, paymentMethod, amountReceived) {
    let effectiveClientId = clientId;
    // Default to "consumidor final" client for cash/transfer if not specified
    if (paymentMethod !== 'credit' && !clientId) {
        const defaultClient = await ClientModel.findOne({ fullName: 'Consumidor Final' }).lean();
        if (defaultClient) {
            effectiveClientId = defaultClient._id.toString();
        }
    }
    const preview = await previewSale(items, clientId, discount, paymentMethod, amountReceived);
    const session = await SaleModel.db.startSession();
    session.startTransaction();
    try {
        // Update product stock
        for (const item of items) {
            const product = await ProductModel.findById(item.product).session(session);
            if (!product)
                throw new Error(`Product not found: ${item.product}`);
            if (product.type === 'product') {
                product.stock -= item.quantity;
                await product.save({ session });
            }
        }
        // Generate sequential receipt number within the transaction
        const lastNumber = await SaleModel.findOne({}, { number: 1 }).sort({ number: -1 }).session(session);
        const nextNumber = (lastNumber?.number ?? 0) + 1;
        // Create sale
        const sale = await SaleModel.create([{
                items: preview.items.map(i => ({
                    product: i.product,
                    name: i.name,
                    type: i.type,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    subtotal: i.subtotal,
                })),
                number: nextNumber,
                subtotal: preview.subtotal,
                discount: preview.discount,
                total: preview.total,
                amountReceived: preview.amountReceived ?? 0,
                change: preview.change ?? 0,
                paymentMethod: preview.paymentMethod,
                type: 'sale',
                client: clientId ?? undefined,
                seller: sellerId,
                cashShift: cashShiftId,
                settled: paymentMethod !== 'credit',
            }], { session });
        let creditMovement;
        if (paymentMethod === 'credit' && clientId) {
            const client = await ClientModel.findById(clientId).session(session);
            if (!client)
                throw new Error('Client not found');
            const newBalance = client.balance + preview.total;
            client.balance = newBalance;
            await client.save({ session });
            creditMovement = await CreditMovementModel.create([{
                    client: clientId,
                    sale: sale[0]._id,
                    type: 'debt',
                    amount: preview.total,
                    balanceAfter: newBalance,
                    admin: sellerId,
                }], { session });
        }
        await session.commitTransaction();
        return {
            sale: sale[0].toJSON(),
            creditMovement: creditMovement?.[0]?.toJSON(),
        };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
}
export async function voidSale(saleId, adminId, reason) {
    const sale = await SaleModel.findById(saleId);
    if (!sale) {
        throw new NotFoundError('Venta no encontrada');
    }
    if (sale.voided) {
        throw new ConflictError('La venta ya está anulada');
    }
    if (sale.type === 'return') {
        throw new ValidationError('No se puede anular una devolución');
    }
    const session = await SaleModel.db.startSession();
    session.startTransaction();
    try {
        // Restore stock
        for (const item of sale.items) {
            const product = await ProductModel.findById(item.product).session(session);
            if (product && product.type === 'product') {
                product.stock += item.quantity;
                await product.save({ session });
            }
        }
        // Reverse credit if applicable
        if (sale.paymentMethod === 'credit' && !sale.settled) {
            const client = await ClientModel.findById(sale.client).session(session);
            if (client) {
                client.balance -= sale.total;
                await client.save({ session });
                await CreditMovementModel.create([{
                        client: sale.client,
                        sale: sale._id,
                        type: 'payment',
                        amount: sale.total,
                        balanceAfter: client.balance,
                        method: 'cash',
                        note: `Anulación: ${reason}`,
                        admin: adminId,
                    }], { session });
            }
        }
        sale.voided = true;
        sale.voidedAt = new Date();
        sale.voidReason = reason;
        await sale.save({ session });
        await session.commitTransaction();
        return sale.toJSON();
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
}
export async function returnSale(saleId, adminId, reason, returnItems, method) {
    const originalSale = await SaleModel.findById(saleId);
    if (!originalSale) {
        throw new NotFoundError('Venta original no encontrada');
    }
    if (originalSale.voided) {
        throw new ConflictError('No se puede devolver una venta anulada');
    }
    if (originalSale.type === 'return') {
        throw new ValidationError('No se puede devolver una devolución');
    }
    // Validate return items against original sale
    for (const returnItem of returnItems) {
        const originalItem = originalSale.items.find(i => i.product.toString() === returnItem.productId);
        if (!originalItem) {
            throw new ValidationError(`Producto no encontrado en la venta original: ${returnItem.productId}`);
        }
        if (returnItem.quantity > originalItem.quantity) {
            throw new ValidationError(`Cantidad a devolver (${returnItem.quantity}) supera la comprada (${originalItem.quantity})`);
        }
    }
    const session = await SaleModel.db.startSession();
    session.startTransaction();
    try {
        // Calculate return amounts
        let returnSubtotal = 0;
        const returnSaleItems = [];
        for (const returnItem of returnItems) {
            const originalItem = originalSale.items.find(i => i.product.toString() === returnItem.productId);
            const itemSubtotal = originalItem.unitPrice * returnItem.quantity;
            returnSubtotal += itemSubtotal;
            returnSaleItems.push({
                product: returnItem.productId,
                name: originalItem.name,
                type: originalItem.type,
                quantity: returnItem.quantity,
                unitPrice: originalItem.unitPrice,
                subtotal: itemSubtotal,
            });
            // Restore stock
            const product = await ProductModel.findById(returnItem.productId).session(session);
            if (product && product.type === 'product') {
                product.stock += returnItem.quantity;
                await product.save({ session });
            }
        }
        const returnDiscount = 0; // No discount on returns
        const returnTotal = returnSubtotal;
        // Create return sale
        const returnSale = await SaleModel.create([{
                items: returnSaleItems,
                subtotal: returnSubtotal,
                discount: returnDiscount,
                total: returnTotal,
                amountReceived: 0,
                change: 0,
                paymentMethod: method,
                type: 'return',
                client: originalSale.client,
                seller: adminId,
                cashShift: originalSale.cashShift,
                originalSale: originalSale._id,
                settled: method !== 'credit',
            }], { session });
        let creditMovement;
        if (method === 'credit') {
            const client = await ClientModel.findById(originalSale.client).session(session);
            if (!client)
                throw new Error('Client not found');
            const newBalance = client.balance - returnTotal;
            client.balance = newBalance;
            await client.save({ session });
            creditMovement = await CreditMovementModel.create([{
                    client: originalSale.client,
                    sale: returnSale[0]._id,
                    type: 'payment',
                    amount: returnTotal,
                    balanceAfter: newBalance,
                    method,
                    note: `Devolución: ${reason}`,
                    admin: adminId,
                }], { session });
        }
        else if (method === 'cash') {
            // For cash returns, we create a credit movement of type payment
            // but the actual cash comes from the register
            creditMovement = await CreditMovementModel.create([{
                    client: originalSale.client,
                    sale: returnSale[0]._id,
                    type: 'payment',
                    amount: returnTotal,
                    balanceAfter: (await ClientModel.findById(originalSale.client).session(session))?.balance ?? 0,
                    method: 'cash',
                    note: `Devolución en efectivo: ${reason}`,
                    admin: adminId,
                }], { session });
        }
        await session.commitTransaction();
        return {
            sale: returnSale[0].toJSON(),
            creditMovement: creditMovement?.[0]?.toJSON(),
        };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
}
export async function listSales(params) {
    const filter = {};
    if (params.clientId)
        filter.client = params.clientId;
    if (params.sellerId)
        filter.seller = params.sellerId;
    if (params.paymentMethod)
        filter.paymentMethod = params.paymentMethod;
    if (params.type)
        filter.type = params.type;
    if (params.voided !== undefined)
        filter.voided = params.voided;
    if (params.fromDate || params.toDate) {
        filter.createdAt = {};
        if (params.fromDate)
            filter.createdAt.$gte = params.fromDate;
        if (params.toDate)
            filter.createdAt.$lte = params.toDate;
    }
    if (params.search) {
        const asNumber = Number(params.search);
        if (!Number.isNaN(asNumber)) {
            filter.number = asNumber;
        }
    }
    const sort = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
    const [items, total] = await Promise.all([
        SaleModel.find(filter)
            .sort(sort)
            .skip((params.page - 1) * params.limit)
            .limit(params.limit)
            .populate('client', 'fullName balance')
            .populate('seller', 'name role')
            .lean(),
        SaleModel.countDocuments(filter),
    ]);
    return {
        items: withIds(items),
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
    };
}
export async function getSaleById(id) {
    const sale = await SaleModel.findById(id)
        .populate('client', 'fullName balance')
        .populate('seller', 'name role')
        .lean();
    if (!sale) {
        throw new NotFoundError('Venta no encontrada');
    }
    return withId(sale);
}
//# sourceMappingURL=index.js.map