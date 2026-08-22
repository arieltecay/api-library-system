import { describe, it, expect } from "vitest";
import { cogs, grossProfit, grossMarginPercent, unitGrossProfit, unitMarginPercent, markupPercent } from "../../../../utils/profit.js";

describe("profit utils", () => {
  describe("cogs", () => {
    it("suma unitCost * quantity correctamente", () => {
      const items = [{ unitCost: 10, quantity: 5 }];
      const result = cogs(items);
      expect(result).toBe(50);
    });

    it("trata unitCost ausente como 0", () => {
      const items = [{ quantity: 5 }];
      const result = cogs(items);
      expect(result).toBe(0);
    });

    it("devuelve 0 para array vacío", () => {
      const items: Array<{ unitCost?: number; quantity: number }> = [];
      const result = cogs(items);
      expect(result).toBe(0);
    });
  });

  describe("grossProfit", () => {
    it("devuelve revenue - cogs", () => {
      const result = grossProfit(100, 60);
      expect(result).toBe(40);
    });
  });

  describe("grossMarginPercent", () => {
    it("calcula (revenue - cogs) / revenue * 100", () => {
      const result = grossMarginPercent(100, 60);
      expect(result).toBeCloseTo(40);
    });

    it("devuelve null cuando revenue <= 0", () => {
      const result1 = grossMarginPercent(0, 60);
      const result2 = grossMarginPercent(-10, 60);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe("unitGrossProfit", () => {
    it("devuelve price - cost", () => {
      const result = unitGrossProfit(100, 60);
      expect(result).toBe(40);
    });
  });

  describe("unitMarginPercent", () => {
    it("calcula el margen sobre precio", () => {
      const result = unitMarginPercent(100, 60);
      expect(result).toBeCloseTo(40);
    });

    it("devuelve null cuando price <= 0", () => {
      const result1 = unitMarginPercent(0, 60);
      const result2 = unitMarginPercent(-10, 60);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe("markupPercent", () => {
    it("calcula el margen sobre costo", () => {
      const result = markupPercent(100, 60);
      expect(result).toBeCloseTo(66.66666666666666);
    });

    it("devuelve null cuando cost <= 0", () => {
      const result1 = markupPercent(100, 0);
      const result2 = markupPercent(100, -10);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
});