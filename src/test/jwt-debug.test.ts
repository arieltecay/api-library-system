import { describe, it, expect, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  role: string;
  schoolId: string;
  posId: string;
  iat: number;
  exp: number;
}

describe('JWT Debug', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  });

  it('should decode token with user role', () => {
    const token = jwt.sign({
      sub: 'user-123',
      role: 'user',
      schoolId: 'school-123',
      posId: 'pos-123',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }, process.env.JWT_SECRET!);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log('Decoded token:', decoded);
    expect(decoded.role).toBe('user');
  });
});