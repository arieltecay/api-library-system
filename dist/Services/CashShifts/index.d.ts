import type { CashShiftLean } from '../../models/CashShift/index.js';
export interface CashShiftListResult {
    items: CashShiftLean[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface CloseCashShiftResult {
    cashShift: CashShiftLean;
    expectedAmount: number;
    difference: number;
}
export declare function openCashShift(sellerId: string, openingAmount: number): Promise<CashShiftLean>;
export declare function getActiveCashShift(sellerId: string): Promise<CashShiftLean | null>;
export declare function closeCashShift(cashShiftId: string, sellerId: string, closingAmount: number, note?: string): Promise<CloseCashShiftResult>;
export declare function getCashShiftById(id: string): Promise<CashShiftLean>;
export declare function listCashShifts(params: {
    sellerId?: string;
    status?: 'open' | 'closed';
    hasDifference?: boolean;
    fromDate?: Date;
    toDate?: Date;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}): Promise<{
    items: (CashShiftLean & {
        sellerName?: string;
        shiftNumber?: number;
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export declare function getActiveCashShiftWithDetails(sellerId: string): Promise<{
    cashShift: CashShiftLean | null;
    aggregated: {
        cashTotal: number;
        transferTotal: number;
        creditTotal: number;
        salesCount: number;
        productsSold: number;
        avgTicket: number;
        expectedCash: number;
    } | null;
}>;
export interface DailySummary {
    date: string;
    totalOpening: number;
    cashSales: number;
    returns: number;
    creditPayments: number;
    totalExpected: number;
    finalCount: number;
    difference: number;
    shiftsWithDifference: number;
    totalShifts: number;
    pendingShifts: Array<{
        sellerName: string;
        id: string;
    }>;
}
export declare function getDailySummary(date?: Date): Promise<DailySummary>;
//# sourceMappingURL=index.d.ts.map