import { z } from 'zod';

export const todaySchema = z.object({});
export const salesChartSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(90).default(7),
  }),
});
export const topProductsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});
export const dailyClosingSchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});
export const shiftsSchema = z.object({
  query: z.object({
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
  }),
});
export const overviewSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export type TodayInput = z.infer<typeof todaySchema>;
export type SalesChartInput = z.infer<typeof salesChartSchema>['query'];
export type TopProductsInput = z.infer<typeof topProductsSchema>['query'];
export type DailyClosingInput = z.infer<typeof dailyClosingSchema>['query'];
export type ShiftsInput = z.infer<typeof shiftsSchema>['query'];
export type OverviewInput = z.infer<typeof overviewSchema>['query'];