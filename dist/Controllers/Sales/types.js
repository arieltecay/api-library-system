import { z } from 'zod';
export const saleItemSchema = z.object({
    product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de producto inválido'),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
});
export const previewSaleSchema = z.object({
    body: z.object({
        items: z.array(saleItemSchema).min(1, 'Al menos un item requerido'),
        clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente inválido').optional(),
        discount: z.number().min(0).default(0),
        paymentMethod: z.enum(['cash', 'transfer', 'credit']).default('cash'),
        amountReceived: z.number().min(0),
    }).refine((data) => data.paymentMethod !== 'credit' || data.clientId, {
        message: 'Cliente requerido para venta a crédito',
        path: ['clientId'],
    }),
});
export const createSaleSchema = z.object({
    body: z.object({
        items: z.array(saleItemSchema).min(1, 'Al menos un item requerido'),
        clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de cliente inválido').optional(),
        discount: z.number().min(0).default(0),
        paymentMethod: z.enum(['cash', 'transfer', 'credit']).default('cash'),
        amountReceived: z.number().min(0),
    }).refine((data) => data.paymentMethod !== 'credit' || data.clientId, {
        message: 'Cliente requerido para venta a crédito',
        path: ['clientId'],
    }),
});
export const voidSaleSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
    }),
    body: z.object({
        reason: z.string().min(1, 'Motivo requerido').max(200),
    }),
});
export const returnSaleSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
    }),
    body: z.object({
        reason: z.string().min(1, 'Motivo requerido').max(200),
        items: z.array(z.object({
            productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de producto inválido'),
            quantity: z.number().int().min(1),
        })).min(1, 'Al menos un item a devolver'),
        method: z.enum(['cash', 'credit']),
    }),
});
export const listSalesSchema = z.object({
    query: z.object({
        clientId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        sellerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        paymentMethod: z.enum(['cash', 'transfer', 'credit']).optional(),
        type: z.enum(['sale', 'return']).optional(),
        voided: z.coerce.boolean().optional(),
        fromDate: z.string().datetime().optional(),
        toDate: z.string().datetime().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        sortBy: z.enum(['createdAt', 'total']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        search: z.string().optional(),
    }),
});
//# sourceMappingURL=types.js.map