import { describe, it, expect } from 'vitest';
import {
  aggregateSales,
  aggregateReturns,
  calculateProfitability,
  buildSeries,
  aggregateTopProducts,
  getRange,
  daysBetween,
} from '../../../../Services/Dashboard/dashboard-logic.js';

describe('Dashboard Overview Logic - Pure Functions', () => {
  describe('aggregateSales', () => {
    it('should aggregate sales correctly', () => {
      const sales = [
        { total: 1000, paymentMethod: 'cash', items: [{ quantity: 2 }] },
        { total: 2000, paymentMethod: 'transfer', items: [{ quantity: 1 }] },
        { total: 1500, paymentMethod: 'credit', items: [{ quantity: 3 }] },
      ];

      const result = aggregateSales(sales);

      expect(result.count).toBe(3);
      expect(result.total).toBe(4500);
      expect(result.cash).toBe(1000);
      expect(result.transfer).toBe(2000);
      expect(result.credit).toBe(1500);
      expect(result.avgTicket).toBe(1500);
      expect(result.productsSold).toBe(6);
    });

    it('should handle empty sales', () => {
      const result = aggregateSales([]);

      expect(result.count).toBe(0);
      expect(result.total).toBe(0);
      expect(result.cash).toBe(0);
      expect(result.transfer).toBe(0);
      expect(result.credit).toBe(0);
      expect(result.avgTicket).toBe(0);
      expect(result.productsSold).toBe(0);
    });

    it('should handle single sale', () => {
      const sales = [{ total: 500, paymentMethod: 'cash', items: [{ quantity: 1 }] }];
      const result = aggregateSales(sales);

      expect(result.count).toBe(1);
      expect(result.total).toBe(500);
      expect(result.cash).toBe(500);
      expect(result.transfer).toBe(0);
      expect(result.credit).toBe(0);
      expect(result.avgTicket).toBe(500);
      expect(result.productsSold).toBe(1);
    });
  });

  describe('aggregateReturns', () => {
    it('should aggregate returns correctly', () => {
      const returns = [
        { total: -100 },
        { total: -200 },
      ];

      const result = aggregateReturns(returns);

      expect(result.count).toBe(2);
      expect(result.amount).toBe(300);
    });

    it('should handle empty returns', () => {
      const result = aggregateReturns([]);

      expect(result.count).toBe(0);
      expect(result.amount).toBe(0);
    });
  });

  describe('calculateProfitability', () => {
    it('should calculate profitability correctly', () => {
      const revenue = 10000;
      const cost = 6000;

      const result = calculateProfitability(revenue, cost);

      expect(result.revenue).toBe(10000);
      expect(result.cogs).toBe(6000);
      expect(result.grossProfit).toBe(4000);
      expect(result.grossMarginPercent).toBe(40);
    });

    it('should handle zero revenue', () => {
      const result = calculateProfitability(0, 1000);

      expect(result.revenue).toBe(0);
      expect(result.cogs).toBe(1000);
      expect(result.grossProfit).toBe(-1000);
      expect(result.grossMarginPercent).toBeNull();
    });

    it('should handle negative profit', () => {
      const result = calculateProfitability(5000, 8000);

      expect(result.revenue).toBe(5000);
      expect(result.cogs).toBe(8000);
      expect(result.grossProfit).toBe(-3000);
      expect(result.grossMarginPercent).toBe(-60);
    });
  });

  describe('buildSeries', () => {
    it('should build daily series correctly', () => {
      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-01-03T23:59:59.999Z');
      const sales = [
        { createdAt: new Date('2024-01-01T10:00:00.000Z'), total: 1000 },
        { createdAt: new Date('2024-01-01T15:00:00.000Z'), total: 500 },
        { createdAt: new Date('2024-01-02T10:00:00.000Z'), total: 2000 },
      ];

      const result = buildSeries(sales, startDate, endDate);

      expect(result.labels).toEqual(['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04']);
      expect(result.total).toEqual([1500, 2000, 0, 0]);
    });

    it('should handle empty sales', () => {
      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-01-02T23:59:59.999Z');
      const sales: Array<{ createdAt: Date; total: number }> = [];

      const result = buildSeries(sales, startDate, endDate);

      expect(result.labels).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
      expect(result.total).toEqual([0, 0, 0]);
    });
  });

  describe('aggregateTopProducts', () => {
    it('should aggregate top products correctly', () => {
      const sales = [
        {
          items: [
            { product: 'prod1', name: 'Product A', quantity: 5, subtotal: 5000 },
            { product: 'prod2', name: 'Product B', quantity: 2, subtotal: 2000 },
          ],
        },
        {
          items: [
            { product: 'prod1', name: 'Product A', quantity: 3, subtotal: 3000 },
            { product: 'prod3', name: 'Product C', quantity: 10, subtotal: 10000 },
          ],
        },
      ];

      const result = aggregateTopProducts(sales, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ productId: 'prod3', name: 'Product C', quantity: 10, revenue: 10000 });
      expect(result[1]).toEqual({ productId: 'prod1', name: 'Product A', quantity: 8, revenue: 8000 });
      expect(result[2]).toEqual({ productId: 'prod2', name: 'Product B', quantity: 2, revenue: 2000 });
    });

    it('should limit to top N', () => {
      const sales = [
        { items: [{ product: 'p1', name: 'P1', quantity: 10, subtotal: 100 }] },
        { items: [{ product: 'p2', name: 'P2', quantity: 8, subtotal: 80 }] },
        { items: [{ product: 'p3', name: 'P3', quantity: 6, subtotal: 60 }] },
        { items: [{ product: 'p4', name: 'P4', quantity: 4, subtotal: 40 }] },
      ];

      const result = aggregateTopProducts(sales, 2);

      expect(result).toHaveLength(2);
      expect(result[0].productId).toBe('p1');
      expect(result[1].productId).toBe('p2');
    });

    it('should handle empty sales', () => {
      const result = aggregateTopProducts([], 5);
      expect(result).toEqual([]);
    });
  });

  describe('getRange', () => {
    it('should return today range when no dates provided', () => {
      const { from, to } = getRange();

      expect(from.getHours()).toBe(0);
      expect(from.getMinutes()).toBe(0);
      expect(from.getSeconds()).toBe(0);
      expect(to.getHours()).toBe(23);
      expect(to.getMinutes()).toBe(59);
      expect(to.getSeconds()).toBe(59);
    });

    it('should use provided from date', () => {
      const from = new Date('2024-01-10T15:30:00.000Z');
      const { from: resultFrom } = getRange(from, undefined);

      expect(resultFrom.getHours()).toBe(0);
      expect(resultFrom.getMinutes()).toBe(0);
    });

    it('should use provided to date', () => {
      const to = new Date('2024-01-10T15:30:00.000Z');
      const { to: resultTo } = getRange(undefined, to);

      expect(resultTo.getHours()).toBe(23);
      expect(resultTo.getMinutes()).toBe(59);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days correctly', () => {
      const from = new Date('2024-01-01T00:00:00.000Z');
      const to = new Date('2024-01-01T23:59:59.999Z');
      expect(daysBetween(from, to)).toBe(2);
    });

    it('should calculate multiple days', () => {
      const from = new Date('2024-01-01T00:00:00.000Z');
      const to = new Date('2024-01-03T23:59:59.999Z');
      expect(daysBetween(from, to)).toBe(4);
    });
  });
});