export interface TodayKPIs {
    totalSales: number;
    totalAmount: number;
    cashAmount: number;
    transferAmount: number;
    creditAmount: number;
    returnsCount: number;
    returnsAmount: number;
    avgTicket: number;
    productsSold: number;
    yesterdayAmount: number;
    yesterdayReturns: number;
    yesterdayCount: number;
}
export interface SalesChartData {
    labels: string[];
    datasets: {
        cash: number[];
        transfer: number[];
        credit: number[];
        total: number[];
    };
}
export interface TopProduct {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
}
export interface DailyClosing {
    date: string;
    totalSales: number;
    cashSales: number;
    transferSales: number;
    creditSales: number;
    totalChange: number;
    shifts: CashShiftSummary[];
    expectedCash: number;
    countedCash: number;
    difference: number;
}
export interface CashShiftSummary {
    id: string;
    seller: string;
    openedAt: string;
    closedAt?: string;
    openingAmount: number;
    expectedAmount: number;
    closingAmount?: number;
    difference?: number;
    status: 'open' | 'closed';
}
export declare function getTodayKPIs(): Promise<TodayKPIs>;
export declare function getSalesChart(days: number): Promise<SalesChartData>;
export declare function getSalesByHour(): Promise<SalesChartData>;
export declare function getTopProducts(limit: number): Promise<TopProduct[]>;
export declare function getDailyClosing(date?: string): Promise<DailyClosing>;
export declare function getShifts(fromDate?: Date, toDate?: Date): Promise<CashShiftSummary[]>;
//# sourceMappingURL=index.d.ts.map