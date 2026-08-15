import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UserModel } from '../../models/User/index.js';
import { AuthenticationError, NotFoundError } from '../../utils/errors.js';
import { UserRole } from '../../models/User/index.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginWithPin(pin: string): Promise<AuthTokens & { user: { id: string; name: string; role: UserRole; schoolId: string; posId?: string } }> {
  const users = await UserModel.find({ active: true }).select('+pinHash +school +pos');
  let matchedUser = null;

  for (const user of users) {
    const isMatch = await user.comparePin(pin);
    if (isMatch) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw new AuthenticationError('PIN inválido');
  }

  matchedUser.lastLoginAt = new Date();
  await matchedUser.save();

  const tokens = generateTokens(matchedUser._id.toString(), matchedUser.role, matchedUser.school.toString(), matchedUser.pos?.toString());
  return {
    ...tokens,
    user: {
      id: matchedUser._id.toString(),
      name: matchedUser.name,
      role: matchedUser.role,
      schoolId: matchedUser.school.toString(),
      posId: matchedUser.pos?.toString(),
    },
  };
}

export async function loginWithEmail(email: string, password: string): Promise<AuthTokens & { user: { id: string; name: string; role: UserRole; email: string; schoolId: string; posId?: string } }> {
  const user = await UserModel.findOne({ email: email.toLowerCase(), active: true }).select('+passwordHash +school +pos');

  if (!user) {
    throw new AuthenticationError('Credenciales inválidas');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthenticationError('Credenciales inválidas');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = generateTokens(user._id.toString(), user.role, user.school.toString(), user.pos?.toString());
  return {
    ...tokens,
    user: {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      email: user.email,
      schoolId: user.school.toString(),
      posId: user.pos?.toString(),
    },
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_SECRET) as { sub: string; role: UserRole; schoolId: string; posId?: string };
    const user = await UserModel.findById(payload.sub).lean();

    if (!user || !user.active) {
      throw new AuthenticationError('Usuario no encontrado o inactivo');
    }

    const accessToken = jwt.sign({ sub: payload.sub, role: payload.role, schoolId: payload.schoolId, posId: payload.posId }, env.JWT_SECRET, {
      expiresIn: '12h',
    });

    return { accessToken };
  } catch {
    throw new AuthenticationError('Token de actualización inválido');
  }
}

export async function getMe(userId: string): Promise<{ id: string; name: string; email: string; role: UserRole; schoolId: string; posId?: string }> {
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.school.toString(),
    posId: user.pos?.toString(),
  };
}

function generateTokens(userId: string, role: UserRole, schoolId: string, posId?: string): AuthTokens {
  const accessToken = jwt.sign({ sub: userId, role, schoolId, posId }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ sub: userId, role, schoolId, posId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as '7d',
  });
  return { accessToken, refreshToken };
}