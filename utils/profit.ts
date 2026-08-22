export interface CostedItem {
  unitCost?: number;
  quantity: number;
}

export function cogs(items: CostedItem[]): number {
  return items.reduce((sum, item) => sum + (item.unitCost ?? 0) * item.quantity, 0);
}

export function grossProfit(revenue: number, costOfGoods: number): number {
  return revenue - costOfGoods;
}

export function grossMarginPercent(revenue: number, costOfGoods: number): number | null {
  if (revenue <= 0) return null;
  return (grossProfit(revenue, costOfGoods) / revenue) * 100;
}

export function unitGrossProfit(price: number, cost: number): number {
  return price - cost;
}

export function unitMarginPercent(price: number, cost: number): number | null {
  if (price <= 0) return null;
  return (unitGrossProfit(price, cost) / price) * 100;
}

export function markupPercent(price: number, cost: number): number | null {
  if (cost <= 0) return null;
  return (unitGrossProfit(price, cost) / cost) * 100;
}