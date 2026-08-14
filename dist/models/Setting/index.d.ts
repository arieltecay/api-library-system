import mongoose, { Document } from 'mongoose';
export interface ISetting extends Document {
    libraryName: string;
    currency: string;
    language: string;
    dateFormat: string;
    defaultClient: string;
    maxDiscountPerSeller: number;
    allowSaleWithoutStock: boolean;
    scanSound: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SettingModel: mongoose.Model<ISetting, {}, {}, {}, mongoose.Document<unknown, {}, ISetting, {}, {}> & ISetting & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type SettingDocument = ISetting;
export type SettingLean = mongoose.FlattenMaps<ISetting> & {
    id: string;
};
//# sourceMappingURL=index.d.ts.map