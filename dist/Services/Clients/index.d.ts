import type { ClientLean } from '../../models/Client/index.js';
import type { SaleLean } from '../../models/Sale/index.js';
import type { CreditMovementLean } from '../../models/CreditMovement/index.js';
export interface ClientListResult {
    items: ClientLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ClientHistoryResult {
    sales: SaleLean[];
    creditMovements: CreditMovementLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare function listClients(params: {
    search?: string;
    hasDebt?: boolean;
    active?: boolean;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}): Promise<ClientListResult>;
export declare function getClientById(id: string): Promise<ClientLean>;
export declare function createClient(data: {
    fullName: string;
    phone?: string;
    dni: string;
}): Promise<ClientLean>;
export declare function updateClient(id: string, data: Partial<{
    fullName: string;
    phone?: string;
    dni: string;
    active: boolean;
}>): Promise<ClientLean>;
export declare function deleteClient(id: string): Promise<void>;
export declare function getClientHistory(id: string, page: number, limit: number): Promise<ClientHistoryResult>;
export declare function getDebtors(): Promise<ClientLean[]>;
export declare function getClientWithDebt(id: string): Promise<ClientLean & {
    debt: number;
}>;
//# sourceMappingURL=index.d.ts.map