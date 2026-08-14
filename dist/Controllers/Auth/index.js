import * as authService from '../../Services/Auth/index.js';
export async function loginPin(req, res) {
    const { pin } = req.body;
    const result = await authService.loginWithPin(pin);
    res.json(result);
}
export async function loginEmail(req, res) {
    const { email, password } = req.body;
    const result = await authService.loginWithEmail(email, password);
    res.json(result);
}
export async function refresh(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new Error('Refresh token requerido');
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
}
export async function me(req, res) {
    if (!req.user) {
        throw new Error('Usuario no autenticado');
    }
    const result = await authService.getMe(req.user.sub);
    res.json(result);
}
//# sourceMappingURL=index.js.map