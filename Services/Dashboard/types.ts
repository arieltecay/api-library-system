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

import type { ProductLean } from '../../models/Product/index.js';

export interface DashboardOverview {
  range: { from: string; to: string; days: number };
  sales: {
    count: number;
    total: number;
    cash: number;
    transfer: number;
    credit: number;
    avgTicket: number;
    productsSold: number;
  };
  returns: { count: number; amount: number };
  profitability: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMarginPercent: number | null;
  };
  series: {
    labels: string[];
    total: number[];
  };
  topProducts: TopProduct[];
  lowStock: ProductLean[];
  credit: {
    totalOutstanding: number;
    clientsWithDebt: number;
  };
}