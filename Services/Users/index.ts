import { UserModel } from '../../models/User/index.js';
import type { UserLean } from '../../models/User/index.js';
import { SaleModel } from '../../models/Sale/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface UserListResult {
  items: (UserLean & { salesCount?: number })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersSummary {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  sellers: number;
}

export interface UserResult {
  user: UserLean;
}

export async function listUsers(params: {
  search?: string;
  role?: 'admin' | 'seller';
  active?: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}): Promise<UserListResult> {
  const filter: Record<string, unknown> = {};

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

  const sort: Record<string, 1 | -1> = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    UserModel.find(filter).sort(sort).skip((params.page - 1) * params.limit).limit(params.limit).lean(),
    UserModel.countDocuments(filter),
  ]);

  const userIds = items.map(u => u._id);
  const salesAgg: { _id: unknown; count: number }[] = await SaleModel.aggregate([
    { $match: { seller: { $in: userIds }, type: 'sale', voided: false } },
    { $group: { _id: '$seller', count: { $sum: 1 } } },
  ]);
  const salesMap = new Map(salesAgg.map(s => [String(s._id), s.count]));

  return {
    items: (withIds(items) as UserLean[]).map(u => ({
      ...u,
      salesCount: salesMap.get(u.id) ?? 0,
    })),
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function getUsersSummary(): Promise<UsersSummary> {
  const [total, active, admins] = await Promise.all([
    UserModel.countDocuments({}),
    UserModel.countDocuments({ active: true }),
    UserModel.countDocuments({ role: 'admin', active: true }),
  ]);
  const inactive = total - active;
  const sellers = active - admins;
  return { total, active, inactive, admins, sellers };
}

export async function getUserById(id: string): Promise<UserResult> {
  const user = await UserModel.findById(id).lean();
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return { user: withId(user) as UserLean };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  pin: string;
  role: 'admin' | 'seller';
}): Promise<UserResult> {
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

  return { user: user.toJSON() as UserLean };
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    pin?: string;
    role?: 'admin' | 'seller';
    active?: boolean;
  }
): Promise<UserResult> {
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

  if (data.name) user.name = data.name;
  if (data.password) user.passwordHash = data.password;
  if (data.pin) user.pinHash = data.pin;
  if (data.role) user.role = data.role;
  if (data.active !== undefined) user.active = data.active;

  await user.save();

  return { user: user.toJSON() as UserLean };
}

export async function deleteUser(id: string): Promise<{ deleted: boolean }> {
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