import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 150,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    pinHash: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'seller'],
        required: true,
        default: 'seller',
    },
    active: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.index({ email: 1 }, { unique: true });
userSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash')) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, env.BCRYPT_ROUNDS);
    }
    if (this.isModified('pinHash')) {
        this.pinHash = await bcrypt.hash(this.pinHash, env.BCRYPT_ROUNDS);
    }
    next();
});
userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
};
userSchema.methods.comparePin = async function (candidate) {
    return bcrypt.compare(candidate, this.pinHash);
};
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.pinHash;
        return ret;
    },
});
export const UserModel = mongoose.model('User', userSchema);
//# sourceMappingURL=index.js.map