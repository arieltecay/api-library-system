import { PosModel } from '../../models/Pos/index.js';
import type { PosLean } from '../../models/Pos/index.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface PosListResult {
  items: PosLean[];
  total: number;
}

export interface CreatePosInput {
  name: string;
  code: string;
}

export interface UpdatePosInput {
  name?: string;
  active?: boolean;
}

/** Lista todos los POS de un negocio, ordenados por nombre. */
export async function listPos(schoolId: string): Promise<PosListResult> {
  const items = await PosModel.find({ school: schoolId }).sort({ name: 1 }).lean();
  return { items: withIds(items) as PosLean[], total: items.length };
}

/** Crea un nuevo POS. El código es único por negocio. */
export async function createPos(
  schoolId: string,
  data: CreatePosInput
): Promise<{ pos: PosLean }> {
  const existing = await PosModel.findOne({ school: schoolId, code: data.code.toUpperCase() });
  if (existing) {
    throw new ConflictError('Ya existe un POS con ese código en este negocio');
  }
  const pos = await PosModel.create({
    name: data.name,
    code: data.code.toUpperCase(),
    school: schoolId,
    active: true,
  });
  return { pos: withId(pos.toObject()) as PosLean };
}

/** Actualiza nombre o estado activo de un POS del negocio. */
export async function updatePos(
  schoolId: string,
  id: string,
  data: UpdatePosInput
): Promise<{ pos: PosLean }> {
  const pos = await PosModel.findOne({ _id: id, school: schoolId });
  if (!pos) {
    throw new NotFoundError('POS no encontrado');
  }
  if (data.name) pos.name = data.name;
  if (data.active !== undefined) pos.active = data.active;
  await pos.save();
  return { pos: withId(pos.toObject()) as PosLean };
}

/** Desactiva un POS (baja lógica). */
export async function deletePos(schoolId: string, id: string): Promise<{ deleted: boolean }> {
  const pos = await PosModel.findOne({ _id: id, school: schoolId });
  if (!pos) {
    throw new NotFoundError('POS no encontrado');
  }
  pos.active = false;
  await pos.save();
  return { deleted: true };
}