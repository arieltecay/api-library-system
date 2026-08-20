import { z } from 'zod';

export const createCashMovementSchema = z.object({
  params: z.object({
    cashShiftId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de turno inválido'),
  }),
  body: z.object({
    type: z.enum(['in', 'out']),
    category: z.enum(['lunch', 'supplies', 'personal_withdrawal', 'change', 'expense', 'other']),
    amount: z.number().positive('El monto debe ser mayor a 0'),
    description: z.string().min(3, 'Descripción obligatoria (mínimo 3 caracteres)').max(500),
  }),
});

export const getCashMovementsByShiftSchema = z.object({
  params: z.object({
    cashShiftId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de turno inválido'),
  }),
});

export const listCashMovementsSchema = z.object({
  query: z.object({
    sellerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    cashShiftId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    type: z.enum(['in', 'out']).optional(),
    category: z.enum(['lunch', 'supplies', 'personal_withdrawal', 'change', 'expense', 'other']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const deleteCashMovementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de movimiento inválido'),
  }),
  body: z.object({
    note: z.string().max(500).optional(),
  }).optional(),
});

export type CreateCashMovementInput = z.infer<typeof createCashMovementSchema>;
export type GetCashMovementsByShiftInput = z.infer<typeof getCashMovementsByShiftSchema>;
export type ListCashMovementsInput = z.infer<typeof listCashMovementsSchema>;
export type DeleteCashMovementInput = z.infer<typeof deleteCashMovementSchema>;