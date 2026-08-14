import { z } from 'zod';
export const createClientSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
        phone: z.string().max(30).optional(),
        dni: z.string().min(1, 'DNI requerido').max(20),
    }),
});
export const updateClientSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
    }),
    body: z.object({
        fullName: z.string().min(2).max(120).optional(),
        phone: z.string().max(30).optional(),
        dni: z.string().min(1).max(20).optional(),
        active: z.boolean().optional(),
    }),
});
export const listClientsSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        hasDebt: z.coerce.boolean().optional(),
        active: z.coerce.boolean().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        sortBy: z.enum(['fullName', 'dni', 'balance', 'createdAt']).default('fullName'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }),
});
export const getClientHistorySchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
    }),
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
});
//# sourceMappingURL=types.js.map