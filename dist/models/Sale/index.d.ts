import mongoose, { Document, Types } from 'mongoose';
export type PaymentMethod = 'cash' | 'transfer' | 'credit';
export type SaleType = 'sale' | 'return';
export interface ISaleItem {
    product: Types.ObjectId;
    name: string;
    type: 'product' | 'service';
    quantity: number;
    unitPrice: number;
    subtotal: number;
}
export interface ISale extends Document {
    items: ISaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    amountReceived: number;
    change: number;
    paymentMethod: PaymentMethod;
    type: SaleType;
    number: number;
    client: Types.ObjectId;
    seller: Types.ObjectId;
    cashShift: Types.ObjectId;
    originalSale?: Types.ObjectId;
    settled: boolean;
    settledAt?: Date;
    voided: boolean;
    voidedAt?: Date;
    voidReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SaleModel: mongoose.Model<ISale, {}, {}, {}, mongoose.Document<unknown, {}, ISale, {}, {}> & ISale & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type SaleDocument = ISale;
export type SaleLean = mongoose.FlattenMaps<ISale> & {
    id: string;
};
//# sourceMappingURL=index.d.ts.map