import mongoose from 'mongoose';
import { UserModel } from '../../models/User/index.js';
import { SchoolModel } from '../../models/School/index.js';
import { SettingModel } from '../../models/Setting/index.js';
import type { UserLean } from '../../models/User/index.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface AdminListResult {
  items: (UserLean & { schoolName?: string })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  pin: string;
  schoolName: string;
  schoolCode: string;
}

export interface UpdateAdminInput {
  name?: string;
  email?: string;
  password?: string;
  pin?: string;
  active?: boolean;
}

/** Lista todos los admins con el nombre de su School. */
export async function listAdmins(params: {
  search?: string;
  active?: boolean;
  page: number;
  limit: number;
}): Promise<AdminListResult> {
  const filter: Record<string, unknown> = { role: 'admin' };

  if (params.search) {
    filter['$or'] = [
      { name: { $regex: params.search, $options: 'i' } },
      { email: { $regex: params.search, $options: 'i' } },
    ];
  }
  if (params.active !== undefined) {
    filter['active'] = params.active;
  }

  const [items, total] = await Promise.all([
    UserModel.find(filter)
      .populate('school', 'name code')
      .sort({ name: 1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  return {
    items: withIds(items) as (UserLean & { schoolName?: string })[],
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

/** Crea un admin con su School y Setting por defecto en una transacción atómica. */
export async function createAdmin(data: CreateAdminInput): Promise<{ user: UserLean }> {
  const existingEmail = await UserModel.findOne({ email: data.email.toLowerCase() });
  if (existingEmail) {
    throw new ConflictError('Ya existe un usuario con ese email');
  }

  const existingCode = await SchoolModel.findOne({ code: data.schoolCode.toUpperCase() });
  if (existingCode) {
    throw new ConflictError('Ya existe un negocio con ese código');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [school] = await SchoolModel.create(
      [{ name: data.schoolName, code: data.schoolCode.toUpperCase(), active: true }],
      { session }
    );

    await SettingModel.create([{ school: school._id, key: 'default', value: '{}' }], { session });

    const [user] = await UserModel.create(
      [{
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.password,
        pinHash: data.pin,
        role: 'admin',
        active: true,
        school: school._id,
      }],
      { session }
    );

    await session.commitTransaction();
    return { user: withId(user.toObject()) as UserLean };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/** Actualiza datos de un admin (nombre, email, password, pin, activo). */
export async function updateAdmin(
  id: string,
  data: UpdateAdminInput
): Promise<{ user: UserLean }> {
  const user = await UserModel.findOne({ _id: id, role: 'admin' });
  if (!user) {
    throw new NotFoundError('Admin no encontrado');
  }

  if (data.email && data.email !== user.email) {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('Ya existe un usuario con ese email');
    }
    user.email = data.email.toLowerCase();
  }

  if (data.name) user.name = data.name;
  if (data.password) user.passwordHash = data.password;
  if (data.pin) user.pinHash = data.pin;
  if (data.active !== undefined) user.active = data.active;

  await user.save();
  return { user: user.toJSON() as UserLean };
}

/** Desactiva un admin (baja lógica, nunca se borra físicamente). */
export async function deleteAdmin(id: string): Promise<{ deleted: boolean }> {
  const user = await UserModel.findOne({ _id: id, role: 'admin' });
  if (!user) {
    throw new NotFoundError('Admin no encontrado');
  }
  user.active = false;
  await user.save();
  return { deleted: true };
}