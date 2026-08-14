import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
export function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AuthenticationError('Token de autorización requerido');
    }
    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        throw new AuthenticationError('Token inválido o expirado');
    }
}
export function requireRole(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AuthenticationError('Usuario no autenticado');
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new AuthorizationError('Rol insuficiente para esta acción');
        }
        next();
    };
}
export const requireAdmin = requireRole('admin');
export const requireSellerOrAdmin = requireRole('seller', 'admin');
//# sourceMappingURL=auth.js.map