import mongoose, { Document, Types } from 'mongoose';
export type CashShiftStatus = 'open' | 'closed';
export interface ICashShift extends Document {
    seller: Types.ObjectId;
    openedAt: Date;
    closedAt?: Date;
    openingAmount: number;
    closingAmount?: number;
    expectedAmount?: number;
    difference?: number;
    status: CashShiftStatus;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CashShiftModel: mongoose.Model<ICashShift, {}, {}, {}, mongoose.Document<unknown, {}, ICashShift, {}, {}> & ICashShift & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type CashShiftDocument = ICashShift;
export type CashShiftLean = mongoose.FlattenMaps<ICashShift> & {
    id: string;
};
//# sourceMappingURL=index.d.ts.map