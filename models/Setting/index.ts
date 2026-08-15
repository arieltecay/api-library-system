import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISetting extends Document {
  // General
  libraryName: string;
  currency: string;
  language: string;
  dateFormat: string;
  
  // POS
  defaultClient: string;
  maxDiscountPerSeller: number;
  allowSaleWithoutStock: boolean;
  scanSound: boolean;
  school: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    libraryName: { type: String, required: true, default: 'Biblioteca Central' },
    currency: { type: String, required: true, default: 'ARS - Peso Argentino' },
    language: { type: String, required: true, default: 'Español (Argentina)' },
    dateFormat: { type: String, required: true, default: 'DD/MM/YYYY' },
    
    defaultClient: { type: String, required: true, default: 'Consumidor Final' },
    maxDiscountPerSeller: { type: Number, required: true, default: 20 },
    allowSaleWithoutStock: { type: Boolean, required: true, default: false },
    scanSound: { type: Boolean, required: true, default: true },
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

settingSchema.index({ school: 1 }, { unique: true });

settingSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SettingModel = mongoose.model<ISetting>('Setting', settingSchema);
export type SettingDocument = ISetting;
export type SettingLean = mongoose.FlattenMaps<ISetting> & { id: string };
