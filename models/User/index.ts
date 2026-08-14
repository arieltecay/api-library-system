import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';

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

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    pinHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'seller'],
      required: true,
      default: 'seller',
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, env.BCRYPT_ROUNDS);
  }
  if (this.isModified('pinHash')) {
    this.pinHash = await bcrypt.hash(this.pinHash, env.BCRYPT_ROUNDS);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.comparePin = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.pinHash);
};

userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.pinHash;
    return ret;
  },
});

export const UserModel = mongoose.model<IUser>('User', userSchema);

export type UserDocument = IUser;
export type UserLean = mongoose.FlattenMaps<IUser> & { id: string };