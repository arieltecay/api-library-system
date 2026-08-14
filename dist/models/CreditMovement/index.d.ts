import mongoose, { Document, Types } from 'mongoose';
export type CreditMovementType = 'debt' | 'payment';
export interface ICreditMovement extends Document {
    client: Types.ObjectId;
    sale: Types.ObjectId;
    type: CreditMovementType;
    amount: number;
    balanceAfter: number;
    method?: 'cash' | 'transfer';
    note?: string;
    admin: Types.ObjectId;
    createdAt: Date;
}
export declare const CreditMovementModel: mongoose.Model<ICreditMovement, {}, {}, {}, mongoose.Document<unknown, {}, ICreditMovement, {}, {}> & ICreditMovement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type CreditMovementDocument = ICreditMovement;
export type CreditMovementLean = mongoose.FlattenMaps<ICreditMovement> & {
    id: string;
};
//# sourceMappingURL=index.d.ts.map