import { SchoolModel } from '../../models/School/index.js';
import type { SchoolLean } from '../../models/School/index.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';

export interface SchoolListResult {
  items: SchoolLean[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listSchools(params: {
  search?: string;
  active?: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}): Promise<SchoolListResult> {
  const filter: Record<string, unknown> = {};

  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: 'i' } },
      { code: { $regex: params.search, $options: 'i' } },
    ];
  }
  if (params.active !== undefined) filter.active = params.active;

  const sort: Record<string, 1 | -1> = { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    SchoolModel.find(filter)
      .sort(sort)
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean(),
    SchoolModel.countDocuments(filter),
  ]);

  return {
    items: withIds(items) as SchoolLean[],
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function listPublicSchools(): Promise<{ items: SchoolLean[] }> {
  const items = await SchoolModel.find({ active: true }).sort({ name: 1 }).lean();
  return { items: withIds(items) as SchoolLean[] };
}

export async function getSchoolById(id: string): Promise<SchoolLean> {
  const school = await SchoolModel.findById(id).lean();
  if (!school) {
    throw new NotFoundError('Escuela no encontrada');
  }
  return withId(school) as SchoolLean;
}

export async function createSchool(data: {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
}): Promise<SchoolLean> {
  const existing = await SchoolModel.findOne({ code: data.code.toUpperCase() }).lean();
  if (existing) {
    throw new ConflictError('Ya existe una escuela con ese código');
  }

  const school = await SchoolModel.create({
    ...data,
    code: data.code.toUpperCase(),
  });

  return school.toJSON() as SchoolLean;
}

export async function updateSchool(id: string, data: Partial<{
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}>): Promise<SchoolLean> {
  if (data.code) {
    const existing = await SchoolModel.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } }).lean();
    if (existing) {
      throw new ConflictError('Ya existe una escuela con ese código');
    }
    data.code = data.code.toUpperCase();
  }

  const school = await SchoolModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!school) {
    throw new NotFoundError('Escuela no encontrada');
  }
  return withId(school) as SchoolLean;
}

export async function deleteSchool(id: string): Promise<void> {
  const school = await SchoolModel.findByIdAndDelete(id);
  if (!school) {
    throw new NotFoundError('Escuela no encontrada');
  }
}