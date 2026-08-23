import { z } from 'zod';

export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre requerido').max(100),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    pin: z
      .string()
      .length(4, 'El PIN debe tener 4 dígitos')
      .regex(/^\d{4}$/, 'El PIN debe ser numérico'),
    schoolName: z.string().min(2, 'Nombre del negocio requerido').max(100),
    schoolCode: z
      .string()
      .min(2, 'Código del negocio requerido')
      .max(20)
      .regex(/^[A-Z0-9_-]+$/i, 'Solo letras, números y guiones'),
  }),
});

export const updateAdminSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    pin: z.string().length(4).regex(/^\d{4}$/).optional(),
    active: z.boolean().optional(),
  }),
});

export const listAdminsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    active: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>['body'];
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>['body'];
export type ListAdminsInput = z.infer<typeof listAdminsSchema>['query'];