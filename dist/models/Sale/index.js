import mongoose, { Schema } from 'mongoose';
const saleItemSchema = new Schema({
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
}, { _id: false });
const saleSchema = new Schema({
    items: {
        type: [saleItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
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
}, {
    timestamps: true,
    versionKey: false,
});
saleSchema.index({ seller: 1, createdAt: -1 });
saleSchema.index({ client: 1, createdAt: -1 });
saleSchema.index({ cashShift: 1 });
saleSchema.index({ paymentMethod: 1 });
saleSchema.index({ type: 1 });
saleSchema.index({ voided: 1 });
saleSchema.index({ settled: 1 });
saleSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const SaleModel = mongoose.model('Sale', saleSchema);
//# sourceMappingURL=index.js.map