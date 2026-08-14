import mongoose, { Document } from 'mongoose';
export type ProductType = 'product' | 'service';
export type ProductUnit = 'unit' | 'sheet' | 'binding';
export interface IProduct extends Document {
    name: string;
    description?: string;
    type: ProductType;
    price: number;
    cost?: number;
    stock: number;
    minStock?: number;
    unit?: ProductUnit;
    code?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProductModel: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type ProductDocument = IProduct;
export type ProductLean = mongoose.FlattenMaps<IProduct> & {
    id: string;
};
//# sourceMappingURL=index.d.ts.map