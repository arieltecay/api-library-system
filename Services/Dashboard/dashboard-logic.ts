import { cogs, grossProfit, grossMarginPercent } from '../../utils/profit.js';

export interface SaleLike {
  total: number;
  paymentMethod: 'cash' | 'transfer' | 'credit';
  items: Array<{ product: { toString(): string } | string; name: string; quantity: number; subtotal: number; unitCost?: number }>;
  createdAt: Date;
}

export interface ReturnLike {
  total: number;
  items: Array<{ unitCost?: number; quantity: number }>;
}

export interface SalesAggregated {
  count: number;
  total: number;
  cash: number;
  transfer: number;
  credit: number;
  avgTicket: number;
  productsSold: number;
}

export interface ReturnsAggregated {
  count: number;
  amount: number;
}

export interface ProfitabilityResult {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number | null;
}

export interface SeriesData {
  labels: string[];
  total: number[];
}

export interface TopProductResult {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export function aggregateSales(sales: SaleLike[]): SalesAggregated {
  const count = sales.length;
  const total = sales.reduce((sum, s) => sum + s.total, 0);
  const cash = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
  const transfer = sales.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.total, 0);
  const credit = sales.filter(s => s.paymentMethod === 'credit').reduce((sum, s) => sum + s.total, 0);
  const avgTicket = count > 0 ? total / count : 0;
  const productsSold = sales.reduce((sum, s) => sum + s.items.reduce((isum, i) => isum + i.quantity, 0), 0);

  return { count, total, cash, transfer, credit, avgTicket, productsSold };
}

export function aggregateReturns(returns: ReturnLike[]): ReturnsAggregated {
  const count = returns.length;
  const amount = returns.reduce((sum, r) => sum + Math.abs(r.total), 0);
  return { count, amount };
}

export function calculateProfitability(revenue: number, cost: number): ProfitabilityResult {
  const gp = grossProfit(revenue, cost);
  const gm = grossMarginPercent(revenue, cost);
  return { revenue, cogs: cost, grossProfit: gp, grossMarginPercent: gm };
}

export function buildSeries(sales: SaleLike[], startDate: Date, endDate: Date): SeriesData {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const labels: string[] = [];
  const total: number[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayStr = date.toISOString().split('T')[0] ?? '';
    labels.push(dayStr);
    const daySales = sales.filter(s => s.createdAt.toISOString().split('T')[0] === dayStr);
    const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0);
    total.push(dayTotal);
  }

  return { labels, total };
}

export function aggregateTopProducts(sales: SaleLike[], limit: number): TopProductResult[] {
  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.product.toString();
      const existing = productMap.get(key) || { name: item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.subtotal;
      productMap.set(key, existing);
    }
  }

  return Array.from(productMap.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function getRange(from?: Date, to?: Date): { from: Date; to: Date } {
  const end = to ?? new Date();
  end.setHours(23, 59, 59, 999);
  const start = from ?? new Date();
  start.setHours(0, 0, 0, 0);
  return { from: start, to: end };
}

export function daysBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateSalesCogs(sales: SaleLike[]): number {
  return sales.reduce((sum, s) => sum + cogs(s.items as Array<{ unitCost?: number; quantity: number }>), 0);
}

export function calculateReturnsCogs(returns: ReturnLike[]): number {
  return returns.reduce((sum, r) => sum + cogs(r.items as Array<{ unitCost?: number; quantity: number }>), 0);
}