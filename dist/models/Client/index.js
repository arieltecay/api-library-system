import mongoose, { Schema } from 'mongoose';
const clientSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 30,
    },
    dni: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 20,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    balance: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
clientSchema.index({ dni: 1 }, { unique: true });
clientSchema.index({ fullName: 1 });
clientSchema.index({ balance: 1 });
clientSchema.index({ isDefault: 1 });
clientSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const ClientModel = mongoose.model('Client', clientSchema);
//# sourceMappingURL=index.js.map