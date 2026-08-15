import mongoose, { Document, Schema, Types } from 'mongoose';

export type PaymentMethod = 'cash' | 'transfer' | 'credit';
export type SaleType = 'sale' | 'return';

export interface ISaleItem {
  product: Types.ObjectId;
  name: string;
  type: 'product' | 'service';
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ISale extends Document {
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountReceived: number;
  change: number;
  paymentMethod: PaymentMethod;
  type: SaleType;
  number: number;
  client: Types.ObjectId;
  seller: Types.ObjectId;
  cashShift: Types.ObjectId;
  school: Types.ObjectId;
  originalSale?: Types.ObjectId;
  settled: boolean;
  settledAt?: Date;
  voided: boolean;
  voidedAt?: Date;
  voidReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['product', 'service'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items: ISaleItem[]) => items.length > 0,
        message: 'Una venta debe tener al menos un item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    amountReceived: {
      type: Number,
      required: true,
      min: 0,
    },
    change: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer', 'credit'],
      required: true,
    },
    number: {
      type: Number,
      index: true,
    },
    type: {
      type: String,
      enum: ['sale', 'return'],
      default: 'sale',
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cashShift: {
      type: Schema.Types.ObjectId,
      ref: 'CashShift',
      required: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    originalSale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
    },
    settled: {
      type: Boolean,
      default: false,
    },
    settledAt: {
      type: Date,
    },
    voided: {
      type: Boolean,
      default: false,
    },
    voidedAt: {
      type: Date,
    },
    voidReason: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

saleSchema.index({ school: 1, seller: 1, createdAt: -1 });
saleSchema.index({ school: 1, client: 1, createdAt: -1 });
saleSchema.index({ school: 1, cashShift: 1 });
saleSchema.index({ school: 1, paymentMethod: 1 });
saleSchema.index({ school: 1, type: 1 });
saleSchema.index({ school: 1, voided: 1 });
saleSchema.index({ school: 1, settled: 1 });

saleSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SaleModel = mongoose.model<ISale>('Sale', saleSchema);

export type SaleDocument = ISale;
export type SaleLean = mongoose.FlattenMaps<ISale> & { id: string };