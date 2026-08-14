import { z } from 'zod';
export declare const loginPinSchema: z.ZodObject<{
    body: z.ZodObject<{
        pin: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginEmailSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        refreshToken: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type LoginPinInput = z.infer<typeof loginPinSchema>['body'];
export type LoginEmailInput = z.infer<typeof loginEmailSchema>['body'];
//# sourceMappingURL=types.d.ts.map