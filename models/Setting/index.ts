import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISetting extends Document {
  school: Types.ObjectId;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

settingSchema.index({ school: 1 }, { unique: true });

settingSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SettingModel = mongoose.model<ISetting>('Setting', settingSchema);

export type SettingDocument = ISetting;
export type SettingLean = mongoose.FlattenMaps<ISetting> & { id: string };