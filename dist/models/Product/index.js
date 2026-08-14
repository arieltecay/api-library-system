import mongoose, { Schema } from 'mongoose';
const productSchema = new Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});
productSchema.index({ name: 1 });
productSchema.index({ active: 1, type: 1 });
productSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const ProductModel = mongoose.model('Product', productSchema);
//# sourceMappingURL=index.js.map