import { z } from 'zod';

export const loginPinSchema = z.object({
  body: z.object({
    pin: z.string().length(4, 'El PIN debe tener 4 dígitos').regex(/^\d{4}$/, 'El PIN debe ser numérico'),
    schoolId: z.string().min(1, 'schoolId requerido'),
  }),
});

export const loginEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export type LoginPinInput = z.infer<typeof loginPinSchema>['body'];
export type LoginEmailInput = z.infer<typeof loginEmailSchema>['body'];