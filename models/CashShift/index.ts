import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICashShift extends Document {
  seller: Types.ObjectId;
  school: Types.ObjectId;
  openingAmount: number;
  closingAmount?: number;
  expectedAmount?: number;
  difference?: number;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cashShiftSchema = new Schema<ICashShift>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    openingAmount: { type: Number, required: true, min: 0 },
    closingAmount: { type: Number, min: 0 },
    expectedAmount: { type: Number },
    difference: { type: Number },
    status: { type: String, enum: ['open', 'closed'], required: true, default: 'open' },
    openedAt: { type: Date, default: Date.now },
    closedAt: Date,
    note: String,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CashShiftModel = mongoose.model<ICashShift>('CashShift', cashShiftSchema);

export type CashShiftDocument = ICashShift;
export type CashShiftLean = mongoose.FlattenMaps<ICashShift> & { id: string };