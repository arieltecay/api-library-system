import type { ProductLean } from '../../models/Product/index.js';
import { ProductType, ProductUnit } from '../../models/Product/index.js';
export declare function deriveCode(type: ProductType, id: string): string;
export interface ProductListResult {
    items: ProductLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface StockUpdateResult {
    product: ProductLean;
    previousStock: number;
    newStock: number;
}
export declare function listProducts(params: {
    search?: string;
    type?: 'product' | 'service';
    active?: boolean;
    lowStock?: boolean;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}): Promise<ProductListResult>;
export declare function getProductById(id: string): Promise<ProductLean>;
export declare function createProduct(data: {
    name: string;
    description?: string;
    type: ProductType;
    price: number;
    cost?: number;
    stock: number;
    minStock?: number;
    unit?: ProductUnit;
}): Promise<ProductLean>;
export declare function updateProduct(id: string, data: Partial<{
    name: string;
    description?: string;
    type: ProductType;
    price: number;
    cost?: number;
    stock: number;
    minStock?: number;
    unit?: ProductUnit;
    active: boolean;
}>): Promise<ProductLean>;
export declare function deleteProduct(id: string): Promise<void>;
export declare function updateStock(id: string, quantity: number, operation: 'add' | 'set'): Promise<StockUpdateResult>;
export declare function getLowStockProducts(): Promise<ProductLean[]>;
//# sourceMappingURL=index.d.ts.map