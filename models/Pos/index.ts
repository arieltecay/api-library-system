import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPos extends Document {
  code: string;
  name: string;
  school: Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const posSchema = new Schema<IPos>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
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

posSchema.index({ school: 1, code: 1 }, { unique: true });
posSchema.index({ school: 1, active: 1 });

posSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: unknown, ret: any) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const PosModel = mongoose.model<IPos>('Pos', posSchema);

export type PosDocument = IPos;
export type PosLean = mongoose.FlattenMaps<IPos> & { id: string };