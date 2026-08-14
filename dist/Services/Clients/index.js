import { ClientModel } from '../../models/Client/index.js';
import { SaleModel } from '../../models/Sale/index.js';
import { CreditMovementModel } from '../../models/CreditMovement/index.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';
export async function listClients(params) {
    const filter = {};
    if (params.search) {
        filter.$or = [
            { fullName: { $regex: params.search, $options: 'i' } },
            { dni: { $regex: params.search, $options: 'i' } },
            { phone: { $regex: params.search, $options: 'i' } },
        ];
    }
    if (params.hasDebt)
        filter.balance = { $gt: 0 };
    if (params.active !== undefined)
        filter.active = params.active;
    // Exclude default client from general listing unless explicitly searched
    if (!params.search) {
        filter.isDefault = { $ne: true };
    }
    const sort = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
    const [items, total] = await Promise.all([
        ClientModel.find(filter)
            .sort(sort)
            .skip((params.page - 1) * params.limit)
            .limit(params.limit)
            .lean(),
        ClientModel.countDocuments(filter),
    ]);
    return {
        items: withIds(items),
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
    };
}
export async function getClientById(id) {
    const client = await ClientModel.findById(id).lean();
    if (!client) {
        throw new NotFoundError('Cliente no encontrado');
    }
    return withId(client);
}
export async function createClient(data) {
    const existing = await ClientModel.findOne({ dni: data.dni }).lean();
    if (existing) {
        throw new ConflictError('Ya existe un cliente con ese DNI');
    }
    const client = await ClientModel.create(data);
    return client.toJSON();
}
export async function updateClient(id, data) {
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
    return withId(client);
}
export async function deleteClient(id) {
    const client = await ClientModel.findById(id).lean();
    if (!client) {
        throw new NotFoundError('Cliente no encontrado');
    }
    if (client.isDefault) {
        throw new Error('No se puede eliminar el cliente por defecto');
    }
    await ClientModel.findByIdAndDelete(id);
}
export async function getClientHistory(id, page, limit) {
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
        sales: withIds(sales),
        creditMovements: withIds(creditMovements),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
export async function getDebtors() {
    const clients = await ClientModel.find({ balance: { $gt: 0 }, active: true }).lean();
    return withIds(clients);
}
export async function getClientWithDebt(id) {
    const client = await ClientModel.findById(id).lean();
    if (!client) {
        throw new NotFoundError('Cliente no encontrado');
    }
    return { ...withId(client), debt: client.balance };
}
//# sourceMappingURL=index.js.map