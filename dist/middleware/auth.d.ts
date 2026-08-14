import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User/index.js';
export interface AuthPayload {
    sub: string;
    role: UserRole;
    iat: number;
    exp: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): void;
export declare function requireRole(...allowedRoles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireSellerOrAdmin: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map