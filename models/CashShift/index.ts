import mongoose, { Document, Schema, Types } from 'mongoose';

export type CashShiftStatus = 'open' | 'closed';

export interface ICashShift extends Document {
  seller: Types.ObjectId;
  school: Types.ObjectId;
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

const cashShiftSchema = new Schema<ICashShift>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    openingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    closingAmount: {
      type: Number,
      min: 0,
    },
    expectedAmount: {
      type: Number,
    },
    difference: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cashShiftSchema.index({ school: 1, seller: 1, status: 1 });
cashShiftSchema.index({ school: 1, openedAt: -1 });
cashShiftSchema.index({ school: 1, status: 1 });

cashShiftSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CashShiftModel = mongoose.model<ICashShift>('CashShift', cashShiftSchema);

export type CashShiftDocument = ICashShift;
export type CashShiftLean = mongoose.FlattenMaps<ICashShift> & { id: string };