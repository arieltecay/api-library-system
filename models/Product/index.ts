import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProductType = 'product' | 'service';
export type ProductUnit = 'unit' | 'sheet' | 'binding';

export interface IProduct extends Document {
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  unit?: ProductUnit;
  code?: string;
  active: boolean;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['product', 'service'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 10,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['unit', 'sheet', 'binding'],
    },
    code: {
      type: String,
      trim: true,
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

productSchema.index({ school: 1, name: 1 });
productSchema.index({ school: 1, active: 1, type: 1 });
productSchema.index({ school: 1, code: 1 });

productSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);

export type ProductDocument = IProduct;
export type ProductLean = mongoose.FlattenMaps<IProduct> & { id: string };

// Types already exported above