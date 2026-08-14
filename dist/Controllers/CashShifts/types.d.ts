import { z } from 'zod';
export declare const openCashShiftSchema: z.ZodObject<{
    body: z.ZodObject<{
        openingAmount: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const closeCashShiftSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        closingAmount: z.ZodNumber;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listCashShiftsSchema: z.ZodObject<{
    query: z.ZodObject<{
        sellerId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            open: "open";
            closed: "closed";
        }>>;
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        sortBy: z.ZodDefault<z.ZodEnum<{
            openedAt: "openedAt";
            closedAt: "closedAt";
        }>>;
        sortOrder: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type OpenCashShiftInput = z.infer<typeof openCashShiftSchema>['body'];
export type CloseCashShiftInput = z.infer<typeof closeCashShiftSchema>['body'];
export type ListCashShiftsInput = z.infer<typeof listCashShiftsSchema>['query'];
//# sourceMappingURL=types.d.ts.map