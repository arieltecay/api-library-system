import { describe, it, expect } from 'vitest';

describe('CashShifts Logic - Pure Functions', () => {
  describe('calculateExpectedAmount', () => {
    it('should calculate expected amount correctly', () => {
      const result = calculateExpectedAmount(10000, 5000, 3000, 200);
      expect(result).toBe(17800);
    });

    it('should handle zero values', () => {
      const result = calculateExpectedAmount(0, 0, 0, 0);
      expect(result).toBe(0);
    });

    it('should handle only opening amount', () => {
      const result = calculateExpectedAmount(10000, 0, 0, 0);
      expect(result).toBe(10000);
    });

    it('should subtract cash out', () => {
      const result = calculateExpectedAmount(10000, 5000, 0, 1000);
      expect(result).toBe(14000);
    });
  });

  describe('calculateDifference', () => {
    it('should calculate positive difference', () => {
      const diff = calculateDifference(15000, 14000);
      expect(diff).toBe(1000);
    });

    it('should calculate negative difference', () => {
      const diff = calculateDifference(13000, 14000);
      expect(diff).toBe(-1000);
    });

    it('should return zero for exact match', () => {
      const diff = calculateDifference(15000, 15000);
      expect(diff).toBe(0);
    });
  });

  describe('calculateDailySummary', () => {
    it('should calculate daily summary correctly', () => {
      const shifts = [
        { openingAmount: 10000, closingAmount: 15000, status: 'closed' as const },
        { openingAmount: 5000, closingAmount: 7000, status: 'closed' as const },
      ];
      const sales = [
        { total: 5000, paymentMethod: 'cash' as const },
        { total: 3000, paymentMethod: 'transfer' as const },
        { total: 2000, paymentMethod: 'credit' as const },
      ];
      const movements = [
        { type: 'in' as const, amount: 500 },
        { type: 'out' as const, amount: 200 },
      ];
      const creditMovements = [
        { amount: 2000 },
      ];

      const summary = calculateDailySummary(shifts, sales, movements, []);

      expect(summary.cashSales).toBe(5000);
      expect(summary.transferSales).toBe(3000);
      expect(summary.creditSales).toBe(2000);
      expect(summary.cashInTotal).toBe(500);
      expect(summary.cashOutTotal).toBe(200);
      expect(summary.netMovements).toBe(300);
      expect(summary.totalExpected).toBe(15000 + 5000 + 500 - 200); // opening + cashSales + in - out
    });

    it('should handle empty arrays', () => {
      const summary = calculateDailySummary([], [], [], []);

      expect(summary.cashSales).toBe(0);
      expect(summary.transferSales).toBe(0);
      expect(summary.creditSales).toBe(0);
      expect(summary.cashInTotal).toBe(0);
      expect(summary.cashOutTotal).toBe(0);
      expect(summary.netMovements).toBe(0);
    });
  });

  describe('generateShiftNumber', () => {
    it('should generate sequential number', () => {
      const shifts = [
        { id: '1', shiftNumber: 1 },
        { id: '2', shiftNumber: 2 },
      ];
      const num = generateShiftNumber(shifts, 'new-id');
      expect(num).toBe(3);
    });

    it('should return 1 for empty array', () => {
      const num = generateShiftNumber([], 'new-id');
      expect(num).toBe(1);
    });

    it('should handle gaps in sequence', () => {
      const shifts = [
        { id: '1', shiftNumber: 1 },
        { id: '2', shiftNumber: 5 },
      ];
      const num = generateShiftNumber(shifts, 'new-id');
      expect(num).toBe(6);
    });
  });
});

// Mock implementations
interface Shift {
  id: string;
  shiftNumber: number;
  openingAmount: number;
  closingAmount?: number;
  status: 'open' | 'closed';
}

interface Sale {
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'credit';
}

interface CashMovement {
  type: 'in' | 'out';
  amount: number;
}

interface CreditMovement {
  amount: number;
}

function calculateExpectedAmount(
  openingAmount: number,
  cashSales: number,
  cashInTotal: number,
  cashOutTotal: number
): number {
  return openingAmount + cashSales + cashInTotal - cashOutTotal;
}

function calculateDifference(closingAmount: number, expectedAmount: number): number {
  return closingAmount - expectedAmount;
}

function calculateDailySummary(
  shifts: { openingAmount: number; closingAmount?: number; status: 'open' | 'closed' }[],
  sales: { total: number; paymentMethod: 'cash' | 'transfer' | 'credit' }[],
  movements: { type: 'in' | 'out'; amount: number }[],
  creditMovements: { amount: number }[]
) {
  const cashSales = sales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.total, 0);

  const transferSales = sales
    .filter(s => s.paymentMethod === 'transfer')
    .reduce((sum, s) => sum + s.total, 0);

  const creditSales = sales
    .filter(s => s.paymentMethod === 'credit')
    .reduce((sum, s) => sum + s.total, 0);

  const cashInTotal = movements
    .filter(m => m.type === 'in')
    .reduce((sum, m) => sum + m.amount, 0);

  const cashOutTotal = movements
    .filter(m => m.type === 'out')
    .reduce((sum, m) => sum + m.amount, 0);

  const netMovements = cashInTotal - cashOutTotal;

  const totalOpening = shifts
    .filter(s => s.status === 'closed')
    .reduce((sum, s) => sum + s.openingAmount, 0);

  const totalExpected = totalOpening + cashSales + cashInTotal - cashOutTotal;

  return {
    cashSales,
    transferSales,
    creditSales,
    cashInTotal,
    cashOutTotal,
    netMovements,
    totalExpected,
  };
}

function generateShiftNumber(shifts: { shiftNumber: number }[], shiftId: string): number {
  if (shifts.length === 0) return 1;
  const maxNumber = Math.max(...shifts.map(s => s.shiftNumber));
  return maxNumber + 1;
}