import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<{
            product: "product";
            service: "service";
        }>>;
        price: z.ZodNumber;
        cost: z.ZodOptional<z.ZodNumber>;
        stock: z.ZodDefault<z.ZodNumber>;
        minStock: z.ZodOptional<z.ZodNumber>;
        unit: z.ZodOptional<z.ZodEnum<{
            unit: "unit";
            sheet: "sheet";
            binding: "binding";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            product: "product";
            service: "service";
        }>>;
        price: z.ZodOptional<z.ZodNumber>;
        cost: z.ZodOptional<z.ZodNumber>;
        stock: z.ZodOptional<z.ZodNumber>;
        minStock: z.ZodOptional<z.ZodNumber>;
        unit: z.ZodOptional<z.ZodEnum<{
            unit: "unit";
            sheet: "sheet";
            binding: "binding";
        }>>;
        active: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateStockSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        quantity: z.ZodNumber;
        operation: z.ZodDefault<z.ZodEnum<{
            set: "set";
            add: "add";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listProductsSchema: z.ZodObject<{
    query: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<{
            product: "product";
            service: "service";
        }>>;
        active: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        lowStock: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        sortBy: z.ZodDefault<z.ZodEnum<{
            name: "name";
            createdAt: "createdAt";
            price: "price";
            stock: "stock";
        }>>;
        sortOrder: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type UpdateStockInput = z.infer<typeof updateStockSchema>['body'];
export type ListProductsInput = z.infer<typeof listProductsSchema>['query'];
//# sourceMappingURL=types.d.ts.map