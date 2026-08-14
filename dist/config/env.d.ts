export interface Env {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    BCRYPT_ROUNDS: number;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    MERCADOPAGO_ACCESS_TOKEN?: string;
    EMAIL_HOST?: string;
    EMAIL_PORT: number;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    EMAIL_FROM: string;
    FRONTEND_POS_URL: string;
    FRONTEND_ADMIN_URL: string;
}
export declare const env: Env;
//# sourceMappingURL=env.d.ts.map