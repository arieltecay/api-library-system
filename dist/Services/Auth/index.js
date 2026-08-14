import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UserModel } from '../../models/User/index.js';
import { AuthenticationError, NotFoundError } from '../../utils/errors.js';
export async function loginWithPin(pin) {
    const users = await UserModel.find({ active: true }).select('+pinHash');
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
    const tokens = generateTokens(matchedUser._id.toString(), matchedUser.role);
    return {
        ...tokens,
        user: {
            id: matchedUser._id.toString(),
            name: matchedUser.name,
            role: matchedUser.role,
        },
    };
}
export async function loginWithEmail(email, password) {
    const user = await UserModel.findOne({ email: email.toLowerCase(), active: true }).select('+passwordHash');
    if (!user) {
        throw new AuthenticationError('Credenciales inválidas');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AuthenticationError('Credenciales inválidas');
    }
    user.lastLoginAt = new Date();
    await user.save();
    const tokens = generateTokens(user._id.toString(), user.role);
    return {
        ...tokens,
        user: {
            id: user._id.toString(),
            name: user.name,
            role: user.role,
            email: user.email,
        },
    };
}
export async function refreshAccessToken(refreshToken) {
    try {
        const payload = jwt.verify(refreshToken, env.JWT_SECRET);
        const user = await UserModel.findById(payload.sub).lean();
        if (!user || !user.active) {
            throw new AuthenticationError('Usuario no encontrado o inactivo');
        }
        const accessToken = jwt.sign({ sub: payload.sub, role: payload.role }, env.JWT_SECRET, {
            expiresIn: '12h',
        });
        return { accessToken };
    }
    catch {
        throw new AuthenticationError('Token de actualización inválido');
    }
}
export async function getMe(userId) {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
        throw new NotFoundError('Usuario no encontrado');
    }
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };
}
function generateTokens(userId, role) {
    const accessToken = jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
        expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
}
//# sourceMappingURL=index.js.map