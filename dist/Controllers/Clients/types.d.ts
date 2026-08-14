import { z } from 'zod';
export declare const createClientSchema: z.ZodObject<{
    body: z.ZodObject<{
        fullName: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        dni: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateClientSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        dni: z.ZodOptional<z.ZodString>;
        active: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listClientsSchema: z.ZodObject<{
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        hasDebt: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        active: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        sortBy: z.ZodDefault<z.ZodEnum<{
            createdAt: "createdAt";
            fullName: "fullName";
            dni: "dni";
            balance: "balance";
        }>>;
        sortOrder: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getClientHistorySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateClientInput = z.infer<typeof createClientSchema>['body'];
export type UpdateClientInput = z.infer<typeof updateClientSchema>['body'];
export type ListClientsInput = z.infer<typeof listClientsSchema>['query'];
//# sourceMappingURL=types.d.ts.map