import mongoose, { Document, Schema } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

schoolSchema.index({ code: 1 });
schoolSchema.index({ active: 1 });

schoolSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SchoolModel = mongoose.model<ISchool>('School', schoolSchema);

export type SchoolDocument = ISchool;
export type SchoolLean = mongoose.FlattenMaps<ISchool> & { id: string };