import type { CashMovementCategory, CashMovementType } from '../../models/CashMovement/index.js';

export interface SaleLike {
  type: string;
  paymentMethod: 'cash' | 'transfer' | 'credit';
  total: number;
}

export interface MovementLike {
  type: CashMovementType;
  category: CashMovementCategory;
  amount: number;
}

export interface SalesTotals {
  cashTotal: number;
  transferTotal: number;
  creditTotal: number;
  salesCount: number;
  returnsTotal: number;
  returnsCashTotal: number;
  returnsTransferTotal: number;
  returnsCreditTotal: number;
}

export interface MovementAggregated {
  cashInTotal: number;
  cashOutTotal: number;
  netMovements: number;
  movementsCount: number;
  byCategory: Record<CashMovementCategory, { in: number; out: number; count: number }>;
}

export function calculateSalesTotals(allSales: SaleLike[]): SalesTotals {
  const sales = allSales.filter(s => s.type === 'sale');
  const returns = allSales.filter(s => s.type === 'return');

  const cashTotal = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const transferTotal = sales.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.total, 0);
  const creditTotal = sales.filter(s => s.paymentMethod === 'credit').reduce((sum, s) => sum + s.total, 0);

  const returnsCashTotal = returns.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const returnsTransferTotal = returns.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.total, 0);
  const returnsCreditTotal = returns.filter(s => s.paymentMethod === 'credit').reduce((sum, s) => sum + s.total, 0);
  const returnsTotal = returnsCashTotal + returnsTransferTotal + returnsCreditTotal;

  return {
    cashTotal,
    transferTotal,
    creditTotal,
    salesCount: sales.length,
    returnsTotal,
    returnsCashTotal,
    returnsTransferTotal,
    returnsCreditTotal,
  };
}

export function buildMovementAggregated(movements: MovementLike[]): MovementAggregated {
  const allCategories: CashMovementCategory[] = ['lunch', 'supplies', 'personal_withdrawal', 'change', 'expense', 'other'];

  const byCategory = allCategories.reduce((acc, cat) => {
    acc[cat] = { in: 0, out: 0, count: 0 };
    return acc;
  }, {} as Record<CashMovementCategory, { in: number; out: number; count: number }>);

  let cashInTotal = 0;
  let cashOutTotal = 0;

  for (const m of movements) {
    if (m.type === 'in') {
      cashInTotal += m.amount;
      byCategory[m.category].in += m.amount;
    } else {
      cashOutTotal += m.amount;
      byCategory[m.category].out += m.amount;
    }
    byCategory[m.category].count += 1;
  }

  return {
    cashInTotal,
    cashOutTotal,
    netMovements: cashInTotal - cashOutTotal,
    movementsCount: movements.length,
    byCategory,
  };
}

export function resolveExpectedAmount(
  status: 'open' | 'closed',
  openingAmount: number,
  cashTotal: number,
  cashOutTotal: number,
  cashInTotal: number,
  returnsCashTotal: number,
  savedExpectedAmount?: number,
  savedDifference?: number
): { expectedAmount: number | undefined; difference: number | undefined } {
  if (status === 'closed') {
    return {
      expectedAmount: savedExpectedAmount,
      difference: savedDifference,
    };
  }

  return {
    expectedAmount: openingAmount + cashTotal - returnsCashTotal - cashOutTotal + cashInTotal,
    difference: undefined,
  };
}