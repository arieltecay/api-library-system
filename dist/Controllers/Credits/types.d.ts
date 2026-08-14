import { z } from 'zod';
export declare const settleDebtSchema: z.ZodObject<{
    params: z.ZodObject<{
        clientId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        amount: z.ZodNumber;
        method: z.ZodEnum<{
            cash: "cash";
            transfer: "transfer";
        }>;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listCreditsSchema: z.ZodObject<{
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        overdue: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        sortBy: z.ZodDefault<z.ZodEnum<{
            fullName: "fullName";
            balance: "balance";
            lastPaymentAt: "lastPaymentAt";
        }>>;
        sortOrder: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getClientCreditSchema: z.ZodObject<{
    params: z.ZodObject<{
        clientId: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SettleDebtInput = z.infer<typeof settleDebtSchema>['body'];
export type ListCreditsInput = z.infer<typeof listCreditsSchema>['query'];
//# sourceMappingURL=types.d.ts.map