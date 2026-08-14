import { UserModel } from '../../models/User/index.js';
import { SaleModel } from '../../models/Sale/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';
export async function listUsers(params) {
    const filter = {};
    if (params.search) {
        filter['$or'] = [
            { name: { $regex: params.search, $options: 'i' } },
            { email: { $regex: params.search, $options: 'i' } },
        ];
    }
    if (params.role) {
        filter['role'] = params.role;
    }
    if (params.active !== undefined) {
        filter['active'] = params.active;
    }
    const sort = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
    const [items, total] = await Promise.all([
        UserModel.find(filter).sort(sort).skip((params.page - 1) * params.limit).limit(params.limit).lean(),
        UserModel.countDocuments(filter),
    ]);
    const userIds = items.map(u => u._id);
    const salesAgg = await SaleModel.aggregate([
        { $match: { seller: { $in: userIds }, type: 'sale', voided: false } },
        { $group: { _id: '$seller', count: { $sum: 1 } } },
    ]);
    const salesMap = new Map(salesAgg.map(s => [String(s._id), s.count]));
    return {
        items: withIds(items).map(u => ({
            ...u,
            salesCount: salesMap.get(u.id) ?? 0,
        })),
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
    };
}
export async function getUsersSummary() {
    const [total, active, admins] = await Promise.all([
        UserModel.countDocuments({}),
        UserModel.countDocuments({ active: true }),
        UserModel.countDocuments({ role: 'admin', active: true }),
    ]);
    const inactive = total - active;
    const sellers = active - admins;
    return { total, active, inactive, admins, sellers };
}
export async function getUserById(id) {
    const user = await UserModel.findById(id).lean();
    if (!user) {
        throw new NotFoundError('Usuario no encontrado');
    }
    return { user: withId(user) };
}
export async function createUser(data) {
    const existingEmail = await UserModel.findOne({ email: data.email });
    if (existingEmail) {
        throw new ConflictError('Ya existe un usuario con ese email');
    }
    const user = await UserModel.create({
        name: data.name,
        email: data.email,
        passwordHash: data.password,
        pinHash: data.pin,
        role: data.role,
        active: true,
    });
    return { user: user.toJSON() };
}
export async function updateUser(id, data) {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new NotFoundError('Usuario no encontrado');
    }
    if (data.email && data.email !== user.email) {
        const existing = await UserModel.findOne({ email: data.email });
        if (existing) {
            throw new ConflictError('Ya existe un usuario con ese email');
        }
        user.email = data.email;
    }
    if (data.name)
        user.name = data.name;
    if (data.password)
        user.passwordHash = data.password;
    if (data.pin)
        user.pinHash = data.pin;
    if (data.role)
        user.role = data.role;
    if (data.active !== undefined)
        user.active = data.active;
    await user.save();
    return { user: user.toJSON() };
}
export async function deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new NotFoundError('Usuario no encontrado');
    }
    if (user.email === 'admin@modista.com') {
        throw new ValidationError('No se puede eliminar el usuario administrador principal');
    }
    user.active = false;
    await user.save();
    return { deleted: true };
}
//# sourceMappingURL=index.js.map