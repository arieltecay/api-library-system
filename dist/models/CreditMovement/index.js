import mongoose, { Schema } from 'mongoose';
const creditMovementSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    sale: {
        type: Schema.Types.ObjectId,
        ref: 'Sale',
        required: true,
    },
    type: {
        type: String,
        enum: ['debt', 'payment'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    balanceAfter: {
        type: Number,
        required: true,
    },
    method: {
        type: String,
        enum: ['cash', 'transfer'],
    },
    note: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
creditMovementSchema.index({ client: 1, createdAt: -1 });
creditMovementSchema.index({ sale: 1 });
creditMovementSchema.index({ type: 1 });
creditMovementSchema.index({ admin: 1 });
creditMovementSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const CreditMovementModel = mongoose.model('CreditMovement', creditMovementSchema);
//# sourceMappingURL=index.js.map