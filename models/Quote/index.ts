import mongoose, { Document, Schema, Types } from 'mongoose';

export type QuoteStatus = 'active' | 'cancelled';

export interface IQuote extends Document {
  items: Array<{
    product: Types.ObjectId;
    name: string;
    type: 'product' | 'service';
    quantity: number;
    unitPrice: number;
    unitCost?: number;
    subtotal: number;
  }>;
  number: number;
  subtotal: number;
  discount: number;
  total: number;
  client?: Types.ObjectId;
  seller: Types.ObjectId;
  school: Types.ObjectId;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        type: { type: String, enum: ['product', 'service'], required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        unitCost: { type: Number, min: 0, default: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    number: { type: Number, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    status: { type: String, enum: ['active', 'cancelled'], required: true, default: 'active' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

quoteSchema.index({ school: 1, number: 1 }, { unique: true });
quoteSchema.index({ school: 1, createdAt: -1 });
quoteSchema.index({ school: 1, seller: 1, createdAt: -1 });
quoteSchema.index({ school: 1, client: 1, createdAt: -1 });
quoteSchema.index({ school: 1, status: 1 });

quoteSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const QuoteModel = mongoose.model<IQuote>('Quote', quoteSchema);

export type QuoteDocument = IQuote;
export type QuoteLean = mongoose.FlattenMaps<IQuote> & { id: string };