import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        pin: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<{
            admin: "admin";
            seller: "seller";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        pin: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<{
            admin: "admin";
            seller: "seller";
        }>>;
        active: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listUsersSchema: z.ZodObject<{
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<{
            admin: "admin";
            seller: "seller";
        }>>;
        active: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        sortBy: z.ZodDefault<z.ZodEnum<{
            name: "name";
            email: "email";
            role: "role";
            createdAt: "createdAt";
        }>>;
        sortOrder: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersInput = z.infer<typeof listUsersSchema>['query'];
//# sourceMappingURL=types.d.ts.map