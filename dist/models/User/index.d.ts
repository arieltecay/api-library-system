import mongoose, { Document, Types } from 'mongoose';
export type UserRole = 'admin' | 'seller';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    pinHash: string;
    role: UserRole;
    active: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
    comparePin(candidate: string): Promise<boolean>;
}
export declare const UserModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type UserDocument = IUser;
export type UserLean = mongoose.FlattenMaps<IUser> & {
    id: string;
};
//# sourceMappingURL=index.d.ts.map