import { UserRole } from '../../models/User/index.js';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare function loginWithPin(pin: string): Promise<AuthTokens & {
    user: {
        id: string;
        name: string;
        role: UserRole;
    };
}>;
export declare function loginWithEmail(email: string, password: string): Promise<AuthTokens & {
    user: {
        id: string;
        name: string;
        role: UserRole;
        email: string;
    };
}>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
}>;
export declare function getMe(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
}>;
//# sourceMappingURL=index.d.ts.map