export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly code: string;
    constructor(message: string, statusCode: number, code: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    readonly details?: Record<string, string[]>;
    constructor(message?: string, details?: Record<string, string[]>);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class PaymentError extends AppError {
    constructor(message?: string);
}
export declare const errorCodes: {
    readonly AUTHENTICATION_ERROR: 401;
    readonly AUTHORIZATION_ERROR: 403;
    readonly NOT_FOUND_ERROR: 404;
    readonly VALIDATION_ERROR: 400;
    readonly CONFLICT_ERROR: 409;
    readonly PAYMENT_ERROR: 402;
};
//# sourceMappingURL=errors.d.ts.map