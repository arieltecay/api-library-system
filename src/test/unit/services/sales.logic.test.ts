import { describe, it, expect } from 'vitest';

describe('Sales Logic - Pure Functions', () => {
  describe('calculatePreview', () => {
    it('should calculate preview for cash sale', () => {
      const items = [
        { product: 'prod-1', quantity: 2, unitPrice: 1000, type: 'product' as const },
        { product: 'prod-2', quantity: 1, unitPrice: 500, type: 'product' as const },
      ];
      const result = calculatePreview(items, 'cash', 3000, undefined, 0);
      
      expect(result.subtotal).toBe(2500);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(2500);
      expect(result.change).toBe(500);
    });

    it('should calculate preview with discount', () => {
      const items = [{ product: 'prod-1', quantity: 1, unitPrice: 1000, type: 'product' as const }];
      const result = calculatePreview(items, 'cash', 1000, undefined, 100);
      
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(100);
      expect(result.total).toBe(900);
      expect(result.change).toBe(100);
    });

    it('should calculate preview for credit sale', () => {
      const items = [{ product: 'prod-1', quantity: 1, unitPrice: 1000, type: 'product' as const }];
      const result = calculatePreview(items, 'credit', 0, 'client-1', 0);
      
      expect(result.total).toBe(1000);
      expect(result.creditBalanceAfter).toBeDefined();
    });

    it('should calculate preview for transfer', () => {
      const items = [{ product: 'prod-1', quantity: 1, unitPrice: 1000, type: 'product' as const }];
      const result = calculatePreview(items, 'transfer', 1500, undefined, 0);
      
      expect(result.change).toBe(500);
    });

    it('should handle percentage discount', () => {
      const items = [{ product: 'prod-1', quantity: 1, unitPrice: 1000, type: 'product' as const }];
      const result = calculatePreview(items, 'cash', 1000, undefined, 10, 'percentage');
      
      expect(result.discount).toBe(100);
      expect(result.total).toBe(900);
    });
  });

  describe('calculateStockChanges', () => {
    it('should calculate stock changes for products', () => {
      const items = [
        { product: 'prod-1', quantity: 2, type: 'product' as const },
        { product: 'prod-2', quantity: 1, type: 'service' as const },
      ];
      const products = [
        { id: 'prod-1', stock: 10, type: 'product' as const },
        { id: 'prod-2', stock: 0, type: 'service' as const },
      ];
      
      const changes = calculateStockChanges(items, products);
      
      expect(changes).toHaveLength(2);
      expect(changes[0]).toEqual({ productId: 'prod-1', change: -2, newStock: 8 });
      expect(changes[1]).toEqual({ productId: 'prod-2', change: 0, newStock: 0 });
    });

    it('should not change stock for services', () => {
      const items = [{ product: 'prod-1', quantity: 5, type: 'service' as const }];
      const products = [{ id: 'prod-1', stock: 0, type: 'service' as const }];
      
      const changes = calculateStockChanges(items, products);
      
      expect(changes[0].change).toBe(0);
      expect(changes[0].newStock).toBe(0);
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
  });

  describe('calculateChange', () => {
    it('should calculate change for cash payment', () => {
      const change = calculateChange(1000, 1500, 'cash');
      expect(change).toBe(500);
    });

    it('should calculate change for transfer', () => {
      const change = calculateChange(1000, 1500, 'transfer');
      expect(change).toBe(500);
    });

    it('should return zero for credit payment', () => {
      const change = calculateChange(1000, 0, 'credit');
      expect(change).toBe(0);
    });

    it('should return zero when amount received equals total', () => {
      const change = calculateChange(1000, 1000, 'cash');
      expect(change).toBe(0);
    });
  });

  describe('generateReceiptNumber', () => {
    it('should generate sequential number', () => {
      const num1 = generateReceiptNumber(0);
      const num2 = generateReceiptNumber(1);
      const num3 = generateReceiptNumber(99);
      
      expect(num1).toBe(1);
      expect(num2).toBe(2);
      expect(num3).toBe(100);
    });
  });

  describe('validateSaleItems', () => {
    it('should validate valid items', () => {
      const items = [{ product: 'prod-1', quantity: 2 }];
      const products = [{ id: 'prod-1', stock: 10, active: true, type: 'product' as const }];
      
      const result = validateSaleItems(items, products);
      expect(result.valid).toBe(true);
    });

    it('should reject empty items', () => {
      const result = validateSaleItems([], []);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Items requeridos');
    });

    it('should reject invalid quantity', () => {
      const items = [{ product: 'prod-1', quantity: 0 }];
      const products = [{ id: 'prod-1', stock: 10, active: true, type: 'product' as const }];
      
      const result = validateSaleItems(items, products);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Items inválidos');
    });

    it('should reject inactive product', () => {
      const items = [{ product: 'prod-1', quantity: 1 }];
      const products = [{ id: 'prod-1', stock: 10, active: false, type: 'product' as const }];
      
      const result = validateSaleItems(items, products);
      expect(result.valid).toBe(false);
    });

    it('should reject insufficient stock', () => {
      const items = [{ product: 'prod-1', quantity: 15 }];
      const products = [{ id: 'prod-1', stock: 10, active: true, type: 'product' as const }];
      
      const result = validateSaleItems(items, products);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('insuficiente');
    });
  });

  describe('calculateCreditBalance', () => {
    it('should calculate new credit balance', () => {
      const client = { creditLimit: 10000, currentBalance: 2000 };
      const total = 500;
      
      const balance = calculateCreditBalance(client, total);
      expect(balance).toBe(2500);
    });

    it('should not exceed credit limit', () => {
      const client = { creditLimit: 1000, currentBalance: 800 };
      const total = 500;
      
      const balance = calculateCreditBalance(client, total);
      expect(balance).toBe(1000);
    });
  });
});

// Mock implementations
interface SaleItem {
  product: string;
  quantity: number;
  unitPrice: number;
  type: 'product' | 'service';
}

interface Product {
  id: string;
  stock: number;
  type: 'product' | 'service';
  active?: boolean;
}

interface Client {
  creditLimit: number;
  currentBalance: number;
}

function calculatePreview(
  items: { product: string; quantity: number; unitPrice: number; type: 'product' | 'service' }[],
  paymentMethod: 'cash' | 'transfer' | 'credit',
  amountReceived: number,
  clientId?: string,
  discountAmount: number = 0,
  discountType: 'fixed' | 'percentage' = 'fixed'
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const calculatedDiscount = discountType === 'percentage' 
    ? Math.round(subtotal * discountAmount / 100)
    : discountAmount;
  const total = subtotal - calculatedDiscount;
  
  let change = 0;
  let creditBalanceAfter: number | undefined;
  
  if (paymentMethod === 'cash' || paymentMethod === 'transfer') {
    change = amountReceived - total;
  } else if (paymentMethod === 'credit') {
    creditBalanceAfter = 5000; // mock
  }
  
  return { subtotal, discount: calculatedDiscount, total, amountReceived, change, paymentMethod, creditBalanceAfter };
}

function calculateStockChanges(items: { product: string; quantity: number; type: 'product' | 'service' }[], products: { id: string; stock: number; type: 'product' | 'service' }[]) {
  return items.map(item => {
    const product = products.find(p => p.id === item.product);
    if (!product || product.type === 'service') {
      return { productId: item.product, change: 0, newStock: product?.stock || 0 };
    }
    const change = -item.quantity;
    return {
      productId: item.product,
      change,
      newStock: Math.max(0, (product?.stock || 0) + change),
    };
  });
}

function calculateDiscount(subtotal: number, discount: number, type: 'fixed' | 'percentage'): number {
  if (type === 'percentage') {
    return Math.min(Math.round(subtotal * discount / 100), subtotal);
  }
  return Math.min(discount, subtotal);
}

function calculateChange(total: number, amountReceived: number, paymentMethod: 'cash' | 'transfer' | 'credit'): number {
  if (paymentMethod === 'credit') return 0;
  return Math.max(0, amountReceived - total);
}

function generateReceiptNumber(lastNumber: number): number {
  return lastNumber + 1;
}

function validateSaleItems(items: { product: string; quantity: number }[], products: { id: string; stock: number; active?: boolean; type: 'product' | 'service' }[]): { valid: boolean; error?: string } {
  if (!items || items.length === 0) return { valid: false, error: 'Items requeridos' };
  
  for (const item of items) {
    if (!item.product || item.quantity <= 0) return { valid: false, error: 'Items inválidos' };
    
    const product = products.find(p => p.id === item.product);
    if (!product || !product.active) return { valid: false, error: 'Producto no disponible' };
    
    if (product.type === 'product' && product.stock < item.quantity) {
      return { valid: false, error: `Stock insuficiente para ${product.id}` };
    }
  }
  return { valid: true };
}

function calculateCreditBalance(client: { creditLimit: number; currentBalance: number }, total: number): number {
  return Math.min(client.currentBalance + total, client.creditLimit);
}