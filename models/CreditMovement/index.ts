import mongoose, { Document, Schema, Types } from 'mongoose';

export type CreditMovementType = 'debt' | 'payment';

export interface ICreditMovement extends Document {
  client: Types.ObjectId;
  sale: Types.ObjectId;
  school: Types.ObjectId;
  type: CreditMovementType;
  amount: number;
  balanceAfter: number;
  method?: 'cash' | 'transfer';
  note?: string;
  admin: Types.ObjectId;
  createdAt: Date;
}

const creditMovementSchema = new Schema<ICreditMovement>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    sale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    type: {
      type: String,
      enum: ['debt', 'payment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['cash', 'transfer'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
  transform: (_doc, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CreditMovementModel = mongoose.model<ICreditMovement>('CreditMovement', creditMovementSchema);

export type CreditMovementDocument = ICreditMovement;
export type CreditMovementLean = mongoose.FlattenMaps<ICreditMovement> & { id: string };