import type { ClientLean } from '../../models/Client/index.js';
import type { CreditMovementLean } from '../../models/CreditMovement/index.js';
import type { SaleLean } from '../../models/Sale/index.js';
export interface CreditListResult {
    items: Array<{
        client: ClientLean;
        balance: number;
        lastPaymentAt?: Date;
        lastCreditAt?: Date;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: {
        totalOutstanding: number;
        overdueCount: number;
        overdueAmount: number;
    };
}
export interface ClientCreditResult {
    client: ClientLean;
    movements: CreditMovementLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface SettleDebtResult {
    creditMovement: CreditMovementLean;
    client: ClientLean;
    sale?: SaleLean;
}
export declare function listCredits(params: {
    search?: string;
    overdue?: boolean;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}): Promise<CreditListResult>;
export declare function getClientCredit(clientId: string, page: number, limit: number): Promise<ClientCreditResult>;
export declare function settleDebt(clientId: string, adminId: string, amount: number, method: 'cash' | 'transfer', note?: string): Promise<SettleDebtResult>;
export declare function getCreditsSummary(): Promise<{
    totalOutstanding: number;
    clientsWithDebt: number;
    totalCreditsThisMonth: number;
    totalPaymentsThisMonth: number;
    overdueCount: number;
    overdueAmount: number;
}>;
export declare function getRecentHistory(limit?: number): Promise<CreditMovementLean[]>;
//# sourceMappingURL=index.d.ts.map