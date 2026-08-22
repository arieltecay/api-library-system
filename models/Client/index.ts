import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClient extends Document {
  fullName: string;
  phone?: string;
  dni: string;
  isDefault: boolean;
  balance: number;
  active: boolean;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    phone: {
      type: String,
      trim: true,
    },
    dni: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

clientSchema.index({ school: 1, dni: 1 }, { unique: true });
clientSchema.index({ school: 1, fullName: 1 });
clientSchema.index({ school: 1, balance: 1 });
clientSchema.index({ school: 1, active: 1 });

clientSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ClientModel = mongoose.model<IClient>('Client', clientSchema);

export type ClientDocument = IClient;
export type ClientLean = mongoose.FlattenMaps<IClient> & { id: string };