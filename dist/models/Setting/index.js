import mongoose, { Schema } from 'mongoose';
const settingSchema = new Schema({
    libraryName: { type: String, required: true, default: 'Biblioteca Central' },
    currency: { type: String, required: true, default: 'ARS - Peso Argentino' },
    language: { type: String, required: true, default: 'Español (Argentina)' },
    dateFormat: { type: String, required: true, default: 'DD/MM/YYYY' },
    defaultClient: { type: String, required: true, default: 'Consumidor Final' },
    maxDiscountPerSeller: { type: Number, required: true, default: 20 },
    allowSaleWithoutStock: { type: Boolean, required: true, default: false },
    scanSound: { type: Boolean, required: true, default: true },
}, {
    timestamps: true,
    versionKey: false,
});
settingSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const SettingModel = mongoose.model('Setting', settingSchema);
//# sourceMappingURL=index.js.map