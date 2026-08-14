import type { UserLean } from '../../models/User/index.js';
export interface UserListResult {
    items: (UserLean & {
        salesCount?: number;
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface UsersSummary {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    sellers: number;
}
export interface UserResult {
    user: UserLean;
}
export declare function listUsers(params: {
    search?: string;
    role?: 'admin' | 'seller';
    active?: boolean;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}): Promise<UserListResult>;
export declare function getUsersSummary(): Promise<UsersSummary>;
export declare function getUserById(id: string): Promise<UserResult>;
export declare function createUser(data: {
    name: string;
    email: string;
    password: string;
    pin: string;
    role: 'admin' | 'seller';
}): Promise<UserResult>;
export declare function updateUser(id: string, data: {
    name?: string;
    email?: string;
    password?: string;
    pin?: string;
    role?: 'admin' | 'seller';
    active?: boolean;
}): Promise<UserResult>;
export declare function deleteUser(id: string): Promise<{
    deleted: boolean;
}>;
//# sourceMappingURL=index.d.ts.map