import { SchoolModel } from '../../models/School/index.js';
import type { SchoolLean } from '../../models/School/index.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { withId, withIds } from '../../utils/lean.js';
import { slugify } from '../../utils/slug.js';

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
      { slug: { $regex: params.search, $options: 'i' } },
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

export async function getPublicSchoolBySlug(slug: string): Promise<{ id: string; name: string; slug: string }> {
  const school = await SchoolModel.findOne({ slug, active: true }).lean();
  if (!school) {
    throw new NotFoundError('Negocio no encontrado');
  }
  const schoolWithId = withId(school) as SchoolLean;
  return { id: schoolWithId.id, name: schoolWithId.name, slug: schoolWithId.slug };
}

export async function createSchool(data: {
  name: string;
  code: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
}): Promise<SchoolLean> {
  const existing = await SchoolModel.findOne({ code: data.code.toUpperCase() }).lean();
  if (existing) {
    throw new ConflictError('Ya existe una escuela con ese código');
  }

  let slug = data.slug?.trim().toLowerCase();
  if (!slug) {
    slug = slugify(data.name);
  } else {
    slug = slugify(slug);
  }

  const existingSlug = await SchoolModel.findOne({ slug }).lean();
  if (existingSlug) {
    throw new ConflictError('Ya existe una escuela con ese slug');
  }

  const school = await SchoolModel.create({
    ...data,
    code: data.code.toUpperCase(),
    slug,
  });

  return school.toJSON() as SchoolLean;
}

export async function updateSchool(id: string, data: Partial<{
  name: string;
  code: string;
  slug: string;
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

  if (data.slug) {
    const normalizedSlug = slugify(data.slug);
    const existing = await SchoolModel.findOne({ slug: normalizedSlug, _id: { $ne: id } }).lean();
    if (existing) {
      throw new ConflictError('Ya existe una escuela con ese slug');
    }
    data.slug = normalizedSlug;
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