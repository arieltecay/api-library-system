import type { SaleLean } from '../../models/Sale/index.js';
import { PaymentMethod, SaleType } from '../../models/Sale/index.js';
import type { CreditMovementLean } from '../../models/CreditMovement/index.js';
export interface SalePreviewResult {
    items: Array<{
        product: string;
        name: string;
        type: 'product' | 'service';
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    amountReceived?: number;
    change?: number;
    paymentMethod: PaymentMethod;
    creditBalanceAfter?: number;
}
export interface SaleResult {
    sale: SaleLean;
    creditMovement?: CreditMovementLean;
}
export interface SaleItemInfo {
    product: string;
    name: string;
    type: 'product' | 'service';
    quantity: number;
    unitPrice: number;
    subtotal: number;
}
export interface PopulatedClientInfo {
    id: string;
    fullName: string;
    balance: number;
}
export interface PopulatedUserInfo {
    id: string;
    name: string;
    role: string;
}
export type PopulatedSaleLean = Omit<SaleLean, 'client' | 'seller'> & {
    number: number;
    type: SaleType;
    client?: PopulatedClientInfo | null;
    seller: PopulatedUserInfo;
    items: SaleItemInfo[];
};
export interface SaleListResult {
    items: PopulatedSaleLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare function previewSale(items: Array<{
    product: string;
    quantity: number;
}>, clientId: string | undefined, discount: number, paymentMethod: PaymentMethod, amountReceived?: number): Promise<SalePreviewResult>;
export declare function createSale(sellerId: string, cashShiftId: string, items: Array<{
    product: string;
    quantity: number;
}>, clientId: string | undefined, discount: number, paymentMethod: PaymentMethod, amountReceived?: number): Promise<SaleResult>;
export declare function voidSale(saleId: string, adminId: string, reason: string): Promise<SaleLean>;
export declare function returnSale(saleId: string, adminId: string, reason: string, returnItems: Array<{
    productId: string;
    quantity: number;
}>, method: 'cash' | 'credit'): Promise<SaleResult>;
export declare function listSales(params: {
    clientId?: string;
    sellerId?: string;
    paymentMethod?: 'cash' | 'transfer' | 'credit';
    type?: 'sale' | 'return';
    voided?: boolean;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}): Promise<SaleListResult>;
export declare function getSaleById(id: string): Promise<SaleLean>;
//# sourceMappingURL=index.d.ts.map