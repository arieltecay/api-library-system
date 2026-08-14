import { z } from 'zod';
export declare const todaySchema: z.ZodObject<{}, z.core.$strip>;
export declare const salesChartSchema: z.ZodObject<{
    query: z.ZodObject<{
        days: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const topProductsSchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const dailyClosingSchema: z.ZodObject<{
    query: z.ZodObject<{
        date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const shiftsSchema: z.ZodObject<{
    query: z.ZodObject<{
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TodayInput = z.infer<typeof todaySchema>;
export type SalesChartInput = z.infer<typeof salesChartSchema>['query'];
export type TopProductsInput = z.infer<typeof topProductsSchema>['query'];
export type DailyClosingInput = z.infer<typeof dailyClosingSchema>['query'];
export type ShiftsInput = z.infer<typeof shiftsSchema>['query'];
//# sourceMappingURL=types.d.ts.map