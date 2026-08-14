import { z } from 'zod';
export declare const saleItemSchema: z.ZodObject<{
    product: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const previewSaleSchema: z.ZodObject<{
    body: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            product: z.ZodString;
            quantity: z.ZodNumber;
        }, z.core.$strip>>;
        clientId: z.ZodOptional<z.ZodString>;
        discount: z.ZodDefault<z.ZodNumber>;
        paymentMethod: z.ZodDefault<z.ZodEnum<{
            cash: "cash";
            transfer: "transfer";
            credit: "credit";
        }>>;
        amountReceived: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createSaleSchema: z.ZodObject<{
    body: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            product: z.ZodString;
            quantity: z.ZodNumber;
        }, z.core.$strip>>;
        clientId: z.ZodOptional<z.ZodString>;
        discount: z.ZodDefault<z.ZodNumber>;
        paymentMethod: z.ZodDefault<z.ZodEnum<{
            cash: "cash";
            transfer: "transfer";
            credit: "credit";
        }>>;
        amountReceived: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const voidSaleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        reason: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const returnSaleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        reason: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            quantity: z.ZodNumber;
        }, z.core.$strip>>;
        method: z.ZodEnum<{
            cash: "cash";
            credit: "credit";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listSalesSchema: z.ZodObject<{
    query: z.ZodObject<{
        clientId: z.ZodOptional<z.ZodString>;
        sellerId: z.ZodOptional<z.ZodString>;
        paymentMethod: z.ZodOptional<z.ZodEnum<{
            cash: "cash";
            transfer: "transfer";
            credit: "credit";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            sale: "sale";
            return: "return";
        }>>;
        voided: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        sortBy: z.ZodDefault<z.ZodEnum<{
            createdAt: "createdAt";
            total: "total";
        }>>;
        sortOrder: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
        search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type PreviewSaleInput = z.infer<typeof previewSaleSchema>['body'];
export type CreateSaleInput = z.infer<typeof createSaleSchema>['body'];
export type VoidSaleInput = z.infer<typeof voidSaleSchema>['body'];
export type ReturnSaleInput = z.infer<typeof returnSaleSchema>['body'];
export type ListSalesInput = z.infer<typeof listSalesSchema>['query'];
//# sourceMappingURL=types.d.ts.map