import { z } from 'zod';

export const openCashShiftSchema = z.object({
  body: z.object({
    openingAmount: z.number().min(0, 'El monto de apertura debe ser >= 0'),
  }),
});

export const closeCashShiftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
  body: z.object({
    closingAmount: z.number().min(0, 'El monto de cierre debe ser >= 0'),
    note: z.string().max(500).optional(),
  }),
});

export const listCashShiftsSchema = z.object({
  query: z.object({
    sellerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(['open', 'closed']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['openedAt', 'closedAt']).default('openedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// Cash Movement schemas
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

export const getCashShiftDetailSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

export const getCashMovementsAggregatedSchema = z.object({
  params: z.object({
    cashShiftId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de turno inválido'),
  }),
});

export type OpenCashShiftInput = z.infer<typeof openCashShiftSchema>['body'];
export type CloseCashShiftInput = z.infer<typeof closeCashShiftSchema>['body'];
export type ListCashShiftsInput = z.infer<typeof listCashShiftsSchema>['query'];
export type CreateCashMovementInput = z.infer<typeof createCashMovementSchema>;
export type GetCashMovementsByShiftInput = z.infer<typeof getCashMovementsByShiftSchema>;
export type GetCashMovementsAggregatedInput = z.infer<typeof getCashMovementsAggregatedSchema>;
export type GetCashShiftDetailInput = z.infer<typeof getCashShiftDetailSchema>;