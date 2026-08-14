import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre requerido').max(100),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    pin: z.string().length(4, 'El PIN debe tener 4 dígitos').regex(/^\d{4}$/, 'El PIN debe ser numérico'),
    role: z.enum(['admin', 'seller']).default('seller'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    pin: z.string().length(4).regex(/^\d{4}$/).optional(),
    role: z.enum(['admin', 'seller']).optional(),
    active: z.boolean().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    role: z.enum(['admin', 'seller']).optional(),
    active: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['name', 'email', 'role', 'createdAt']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersInput = z.infer<typeof listUsersSchema>['query'];