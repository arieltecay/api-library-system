import mongoose from 'mongoose';
import { UserModel } from '../../models/User/index.js';
import type { UserLean } from '../../models/User/index.js';
import { SaleModel } from '../../models/Sale/index.js';
import { PosModel } from '../../models/Pos/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface UserListResult {
  items: (UserLean & { salesCount?: number; posName?: string })[];
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
  schoolId: string;
  search?: string;
  role?: 'admin' | 'seller';
  active?: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}): Promise<UserListResult> {
  const filter: Record<string, unknown> = { school: params.schoolId };

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

  const posIds = items.filter(u => u.pos).map(u => u.pos!);
  const posList = await PosModel.find({ _id: { $in: posIds } }).lean();
  const posMap = new Map(posList.map(p => [String(p._id), p.name]));

  return {
    items: (withIds(items) as UserLean[]).map(u => ({
      ...u,
      salesCount: salesMap.get(u.id) ?? 0,
      posName: u.pos ? posMap.get(String(u.pos)) : undefined,
    })),
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function getUsersSummary(schoolId: string): Promise<UsersSummary> {
  const [total, active, admins] = await Promise.all([
    UserModel.countDocuments({ school: schoolId }),
    UserModel.countDocuments({ school: schoolId, active: true }),
    UserModel.countDocuments({ school: schoolId, role: 'admin', active: true }),
  ]);
  const inactive = total - active;
  const sellers = active - admins;
  return { total, active, inactive, admins, sellers };
}

export async function getUserById(schoolId: string, id: string): Promise<{ user: UserLean }> {
  const user = await UserModel.findOne({ _id: id, school: schoolId }).lean();
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return { user: withId(user) as UserLean };
}

export async function createUser(schoolId: string, data: {
  name: string;
  email: string;
  password: string;
  pin: string;
  role: 'seller';
  pos?: string;
}): Promise<{ user: UserLean }> {
  const existingEmail = await UserModel.findOne({ email: data.email, school: schoolId });
  if (existingEmail) {
    throw new ConflictError('Ya existe un usuario con ese email en esta escuela');
  }

  const user = await UserModel.create({
    name: data.name,
    email: data.email,
    passwordHash: data.password,
    pinHash: data.pin,
    role: data.role,
    active: true,
    school: schoolId,
    pos: data.pos,
  });

  return { user: user.toJSON() as UserLean };
}

export async function updateUser(
  schoolId: string,
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    pin?: string;
    role?: 'admin' | 'seller';
    active?: boolean;
    pos?: string;
  }
): Promise<{ user: UserLean }> {
  const user = await UserModel.findOne({ _id: id, school: schoolId });
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (data.email && data.email !== user.email) {
    const existing = await UserModel.findOne({ email: data.email, school: schoolId });
    if (existing) {
      throw new ConflictError('Ya existe un usuario con ese email en esta escuela');
    }
    user.email = data.email;
  }

  if (data.name) user.name = data.name;
  if (data.password) user.passwordHash = data.password;
  if (data.pin) user.pinHash = data.pin;
  if (data.role) user.role = data.role;
  if (data.active !== undefined) user.active = data.active;
  if (data.pos !== undefined) {
    user.pos = data.pos ? new mongoose.Types.ObjectId(data.pos) : undefined;
  }

  await user.save();

  return { user: user.toJSON() as UserLean };
}

export async function deleteUser(schoolId: string, id: string): Promise<{ deleted: boolean }> {
  const user = await UserModel.findOne({ _id: id, school: schoolId });
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (user.role === 'superadmin') {
    throw new ValidationError('No se puede eliminar el superadministrador');
  }
  if (user.role === 'admin') {
    throw new ValidationError('Para desactivar un admin, usa el endpoint de admins');
  }

  user.active = false;
  await user.save();

  return { deleted: true };
}