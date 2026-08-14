import mongoose, { Document } from 'mongoose';
export interface IClient extends Document {
    fullName: string;
    phone?: string;
    dni: string;
    isDefault: boolean;
    balance: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ClientModel: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient, {}, {}> & IClient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type ClientDocument = IClient;
export type ClientLean = mongoose.FlattenMaps<IClient> & {
    id: string;
};
//# sourceMappingURL=index.d.ts.map