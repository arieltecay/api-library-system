import type { CashShiftLean } from '../../models/CashShift/index.js';

export interface CashShiftListResult {
  items: (CashShiftLean & { sellerName?: string; shiftNumber?: number })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CloseCashShiftResult {
  cashShift: CashShiftLean;
  expectedAmount: number;
  difference: number;
  cashInTotal: number;
  cashOutTotal: number;
  netMovements: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number | null;
}

export interface DailySummary {
  date: string;
  totalOpening: number;
  cashSales: number;
  transferSales: number;
  returns: number;
  creditPayments: number;
  cashInTotal: number;
  cashOutTotal: number;
  netMovements: number;
  totalExpected: number;
  finalCount: number;
  difference: number;
  shiftsWithDifference: number;
  totalShifts: number;
  pendingShifts: Array<{ sellerName: string; id: string }>;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number | null;
}

export interface ListCashShiftsParams {
  schoolId: string;
  sellerId?: string;
  status?: 'open' | 'closed';
  hasDifference?: boolean;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}