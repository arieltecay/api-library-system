import { describe, it, expect } from 'vitest';
import {
  calculateSalesTotals,
  buildMovementAggregated,
  resolveExpectedAmount,
} from '../../../../Services/CashShifts/cashShiftDetail.js';

describe('cashShiftDetail logic', () => {
  describe('calculateSalesTotals', () => {
    it('should separate payment methods and returns', () => {
      const totals = calculateSalesTotals([
        { type: 'sale', paymentMethod: 'cash', total: 1000 },
        { type: 'sale', paymentMethod: 'cash', total: 500 },
        { type: 'sale', paymentMethod: 'transfer', total: 2000 },
        { type: 'sale', paymentMethod: 'credit', total: 300 },
        { type: 'return', paymentMethod: 'cash', total: 100 },
      ]);

      expect(totals.cashTotal).toBe(1500);
      expect(totals.transferTotal).toBe(2000);
      expect(totals.creditTotal).toBe(300);
      expect(totals.salesCount).toBe(4);
      expect(totals.returnsTotal).toBe(100);
    });

    it('should handle empty arrays', () => {
      const totals = calculateSalesTotals([]);
      expect(totals).toEqual({
        cashTotal: 0,
        transferTotal: 0,
        creditTotal: 0,
        salesCount: 0,
        returnsTotal: 0,
      });
    });
  });

  describe('buildMovementAggregated', () => {
    it('should initialize all six categories to zero', () => {
      const agg = buildMovementAggregated([]);
      expect(Object.keys(agg.byCategory).sort()).toEqual([
        'change',
        'expense',
        'lunch',
        'other',
        'personal_withdrawal',
        'supplies',
      ]);
      expect(agg.cashInTotal).toBe(0);
      expect(agg.cashOutTotal).toBe(0);
      expect(agg.netMovements).toBe(0);
      expect(agg.movementsCount).toBe(0);
    });

    it('should sum in, out and count per category', () => {
      const agg = buildMovementAggregated([
        { type: 'in', category: 'change', amount: 100 },
        { type: 'in', category: 'change', amount: 50 },
        { type: 'out', category: 'lunch', amount: 200 },
      ]);

      expect(agg.cashInTotal).toBe(150);
      expect(agg.cashOutTotal).toBe(200);
      expect(agg.netMovements).toBe(-50);
      expect(agg.movementsCount).toBe(3);
      expect(agg.byCategory.change).toEqual({ in: 150, out: 0, count: 2 });
      expect(agg.byCategory.lunch).toEqual({ in: 0, out: 200, count: 1 });
      expect(agg.byCategory.other).toEqual({ in: 0, out: 0, count: 0 });
    });
  });

  describe('resolveExpectedAmount', () => {
    it('should use saved values for closed shifts', () => {
      const result = resolveExpectedAmount(
        'closed',
        10000,
        5000,
        200,
        100,
        14900,
        -100
      );

      expect(result.expectedAmount).toBe(14900);
      expect(result.difference).toBe(-100);
    });

    it('should calculate live value for open shifts and return undefined difference', () => {
      const result = resolveExpectedAmount(
        'open',
        10000,
        5000,
        200,
        100
      );

      expect(result.expectedAmount).toBe(14900);
      expect(result.difference).toBeUndefined();
    });
  });
});
