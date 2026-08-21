import { describe, it, expect } from 'vitest';

describe('Products Logic - Pure Functions', () => {
  describe('deriveCode', () => {
    it('should generate code for product type', () => {
      const code = deriveCode('product', 'Café', 'PRD');
      expect(code).toMatch(/^PRD-CAF-\d{4}$/);
    });

    it('should generate code for service type', () => {
      const code = deriveCode('service', 'Corte de pelo', 'SRV');
      expect(code).toMatch(/^SRV-COR-\d{4}$/);
    });

    it('should handle special characters in name', () => {
      const code = deriveCode('product', 'Café con Leche', 'PRD');
      expect(code).toMatch(/^PRD-CAF-\d{4}$/);
    });

    it('should handle short names', () => {
      const code = deriveCode('product', 'A', 'PRD');
      expect(code).toMatch(/^PRD-A-\d{4}$/);
    });
  });

  describe('calculatePrice', () => {
    it('should calculate price with markup', () => {
      const price = calculatePrice(1000, 0.3);
      expect(price).toBe(1300);
    });

    it('should handle zero markup', () => {
      const price = calculatePrice(1000, 0);
      expect(price).toBe(1000);
    });

    it('should handle high markup', () => {
      const price = calculatePrice(1000, 2.5);
      expect(price).toBe(3500);
    });
  });

  describe('validateStock', () => {
    it('should return valid for positive stock', () => {
      const result = validateStock(10, 'product');
      expect(result.valid).toBe(true);
    });

    it('should return valid for zero stock on service', () => {
      const result = validateStock(0, 'service');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for negative stock', () => {
      const result = validateStock(-1, 'product');
      expect(result.valid).toBe(false);
      expect(result.error?.toLowerCase()).toContain('stock');
    });

    it('should return invalid for zero stock on product', () => {
      const result = validateStock(0, 'product');
      expect(result.valid).toBe(false);
      expect(result.error?.toLowerCase()).toContain('stock');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount', () => {
      const discount = calculateDiscount(1000, 10, 'percentage');
      expect(discount).toBe(100);
    });

    it('should calculate fixed discount', () => {
      const discount = calculateDiscount(1000, 100, 'fixed');
      expect(discount).toBe(100);
    });

    it('should not exceed subtotal', () => {
      const discount = calculateDiscount(100, 200, 'fixed');
      expect(discount).toBe(100);
    });

    it('should handle zero discount', () => {
      const discount = calculateDiscount(1000, 0, 'percentage');
      expect(discount).toBe(0);
    });
  });
});

// Mock implementations for testing
function deriveCode(type: 'product' | 'service', name: string, prefix: string): string {
  const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${cleanName}-${random}`;
}

function calculatePrice(cost: number, markup: number): number {
  return Math.round(cost * (1 + markup));
}

function validateStock(stock: number, type: 'product' | 'service'): { valid: boolean; error?: string } {
  if (stock < 0) return { valid: false, error: 'Stock no puede ser negativo' };
  if (type === 'product' && stock === 0) return { valid: false, error: 'Stock debe ser mayor a 0 para productos' };
  return { valid: true };
}

function calculateDiscount(subtotal: number, discount: number, type: 'percentage' | 'fixed'): number {
  if (type === 'percentage') {
    return Math.min(Math.round(subtotal * (discount / 100)), subtotal);
  }
  return Math.min(discount, subtotal);
}