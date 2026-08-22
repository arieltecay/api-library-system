import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICreditMovement extends Document {
  client: Types.ObjectId;
  sale: Types.ObjectId;
  school: Types.ObjectId;
  type: 'debt' | 'payment';
  amount: number;
  balanceAfter: number;
  method?: 'cash' | 'transfer' | 'credit';
  note?: string;
  admin: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const creditMovementSchema = new Schema<ICreditMovement>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    sale: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    type: { type: String, enum: ['debt', 'payment'], required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'transfer', 'credit'] },
    note: String,
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

creditMovementSchema.index({ school: 1, client: 1, createdAt: -1 });
creditMovementSchema.index({ school: 1, sale: 1 });
creditMovementSchema.index({ school: 1, type: 1 });
creditMovementSchema.index({ school: 1, admin: 1 });

creditMovementSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CreditMovementModel = mongoose.model<ICreditMovement>('CreditMovement', creditMovementSchema);

export type CreditMovementDocument = ICreditMovement;
export type CreditMovementLean = mongoose.FlattenMaps<ICreditMovement> & { id: string };