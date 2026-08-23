import { z } from 'zod';

export const createPosSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre requerido').max(100),
    code: z
      .string()
      .min(1, 'Código requerido')
      .max(20)
      .regex(/^[A-Z0-9_-]+$/i, 'Solo letras, números y guiones'),
  }),
});

export const updatePosSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    active: z.boolean().optional(),
  }),
});

export type CreatePosInput = z.infer<typeof createPosSchema>['body'];
export type UpdatePosInput = z.infer<typeof updatePosSchema>['body'];