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
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['product', 'service'],
      required: true,
      default: 'product',
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
      required: true,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['unit', 'sheet', 'binding'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    code: {
      type: String,
      trim: true,
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

productSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);

export type ProductDocument = IProduct;
export type ProductLean = mongoose.FlattenMaps<IProduct> & { id: string };