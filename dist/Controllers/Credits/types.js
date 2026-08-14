import { z } from 'zod';
export const settleDebtSchema = z.object({
    params: z.object({
        clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente inválido'),
    }),
    body: z.object({
        amount: z.number().min(0.01, 'El monto debe ser > 0'),
        method: z.enum(['cash', 'transfer']),
        note: z.string().max(500).optional(),
    }),
});
export const listCreditsSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        overdue: z.coerce.boolean().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        sortBy: z.enum(['balance', 'fullName', 'lastPaymentAt']).default('balance'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }),
});
export const getClientCreditSchema = z.object({
    params: z.object({
        clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente inválido'),
    }),
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    }),
});
//# sourceMappingURL=types.js.map