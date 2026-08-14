import mongoose, { Schema } from 'mongoose';
const cashShiftSchema = new Schema({
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    openedAt: {
        type: Date,
        default: Date.now,
    },
    closedAt: {
        type: Date,
    },
    openingAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    closingAmount: {
        type: Number,
        min: 0,
    },
    expectedAmount: {
        type: Number,
    },
    difference: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
    },
    note: {
        type: String,
        trim: true,
        maxlength: 500,
    },
}, {
    timestamps: true,
    versionKey: false,
});
cashShiftSchema.index({ seller: 1, status: 1 });
cashShiftSchema.index({ openedAt: -1 });
cashShiftSchema.index({ status: 1 });
cashShiftSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const CashShiftModel = mongoose.model('CashShift', cashShiftSchema);
//# sourceMappingURL=index.js.map