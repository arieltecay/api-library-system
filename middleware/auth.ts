import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { UserRole } from '../models/User/index.js';

export interface AuthPayload {
  sub: string;
  role: UserRole;
  schoolId: string;
  posId?: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      schoolId?: string;
      posId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Token de autorización requerido');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    req.schoolId = payload.schoolId;
    req.posId = payload.posId;
    next();
  } catch {
    throw new AuthenticationError('Token inválido o expirado');
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
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