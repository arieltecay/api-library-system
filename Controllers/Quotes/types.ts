import { z } from 'zod';

export const quoteItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de producto inválido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
});

export const previewQuoteSchema = z.object({
  body: z.object({
    items: z.array(quoteItemSchema).min(1, 'Al menos un item requerido'),
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente inválido').optional(),
    discount: z.number().min(0).default(0),
  }),
});

export const createQuoteSchema = z.object({
  body: z.object({
    items: z.array(quoteItemSchema).min(1, 'Al menos un item requerido'),
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente inválido').optional(),
    discount: z.number().min(0).default(0),
  }),
});

export const cancelQuoteSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

export const listQuotesSchema = z.object({
  query: z.object({
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    sellerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(['active', 'cancelled']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'total']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type PreviewQuoteInput = z.infer<typeof previewQuoteSchema>['body'];
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>['body'];
export type CancelQuoteInput = z.infer<typeof cancelQuoteSchema>['params'];
export type ListQuotesInput = z.infer<typeof listQuotesSchema>['query'];