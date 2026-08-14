import dotenv from 'dotenv';
dotenv.config();
export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number(process.env.PORT) ?? 3000,
    MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/librarysystem',
    JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
    BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS) ?? 12,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: Number(process.env.EMAIL_PORT) ?? 587,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM ?? 'Library System <noreply@librarysystem.com>',
    FRONTEND_POS_URL: process.env.FRONTEND_POS_URL ?? 'http://localhost:5173',
    FRONTEND_ADMIN_URL: process.env.FRONTEND_ADMIN_URL ?? 'http://localhost:5174',
};
//# sourceMappingURL=env.js.map