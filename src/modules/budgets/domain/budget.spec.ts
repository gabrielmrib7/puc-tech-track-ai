import { describe, expect, it } from "vitest";
import {
  calculateBudgetTotal,
  budgetInputSchema,
  budgetUpdateSchema,
  isBudgetPending,
  canMutateBudget,
  canDecideBudget,
  canManageBudgets,
} from "./budget";

describe("Budget Domain Rules & Contracts", () => {
  describe("calculateBudgetTotal", () => {
    it("adds parts and labor with two decimal precision", () => {
      expect(calculateBudgetTotal(450, 120)).toBe(570);
      expect(calculateBudgetTotal(10.105, 0)).toBe(10.11);
      expect(calculateBudgetTotal(129.99, 70.01)).toBe(200);
      expect(calculateBudgetTotal(0, 0)).toBe(0);
    });

    it("handles negative or invalid inputs gracefully", () => {
      expect(calculateBudgetTotal(-10, 50)).toBe(50);
      expect(calculateBudgetTotal(50, -10)).toBe(50);
      expect(calculateBudgetTotal(NaN, 50)).toBe(50);
    });
  });

  describe("budgetInputSchema (Create)", () => {
    it("accepts valid input without amount and status", () => {
      const result = budgetInputSchema.safeParse({
        description: "Troca de display e conector",
        partsCost: 150.5,
        laborCost: 100,
        notes: "Peça original",
      });
      expect(result.success).toBe(true);
    });

    it("rejects client-supplied amount or status", () => {
      const withAmount = budgetInputSchema.safeParse({
        description: "Serviço padrão",
        partsCost: 100,
        laborCost: 50,
        amount: 150,
      });
      expect(withAmount.success).toBe(false);

      const withStatus = budgetInputSchema.safeParse({
        description: "Serviço padrão",
        partsCost: 100,
        laborCost: 50,
        status: "APPROVED",
      });
      expect(withStatus.success).toBe(false);
    });

    it("validates minimum description length and negative costs", () => {
      const shortDesc = budgetInputSchema.safeParse({
        description: "ab",
        partsCost: 10,
        laborCost: 10,
      });
      expect(shortDesc.success).toBe(false);

      const negParts = budgetInputSchema.safeParse({
        description: "Troca de tela",
        partsCost: -5,
        laborCost: 10,
      });
      expect(negParts.success).toBe(false);
    });
  });

  describe("budgetUpdateSchema (Update)", () => {
    it("allows partial updates of allowed fields", () => {
      const result = budgetUpdateSchema.safeParse({
        partsCost: 200,
        notes: "Peça importada de alta qualidade",
      });
      expect(result.success).toBe(true);
    });

    it("rejects updates to protected fields (amount, status, serviceOrderId, id)", () => {
      expect(budgetUpdateSchema.safeParse({ amount: 500 }).success).toBe(false);
      expect(budgetUpdateSchema.safeParse({ status: "APPROVED" }).success).toBe(false);
      expect(budgetUpdateSchema.safeParse({ serviceOrderId: "uuid" }).success).toBe(false);
      expect(budgetUpdateSchema.safeParse({ id: "uuid" }).success).toBe(false);
    });
  });

  describe("Mutability & Status Guards", () => {
    it("allows mutation ONLY for PENDING status", () => {
      expect(canMutateBudget("PENDING")).toBe(true);
      expect(canMutateBudget("APPROVED")).toBe(false);
      expect(canMutateBudget("REJECTED")).toBe(false);
      expect(canMutateBudget("EXPIRED")).toBe(false);
    });

    it("identifies pending budgets", () => {
      expect(isBudgetPending("PENDING")).toBe(true);
      expect(isBudgetPending("APPROVED")).toBe(false);
    });

    it("evaluates canDecideBudget conditions", () => {
      expect(canDecideBudget("PENDING", "WAITING_APPROVAL")).toBe(true);
      expect(canDecideBudget("PENDING", "IN_REPAIR")).toBe(false);
      expect(canDecideBudget("APPROVED", "WAITING_APPROVAL")).toBe(false);
      expect(canDecideBudget("REJECTED", "WAITING_APPROVAL")).toBe(false);
    });

    it("checks role permissions for budget management", () => {
      expect(canManageBudgets("ADMIN")).toBe(true);
      expect(canManageBudgets("TECHNICIAN")).toBe(true);
      expect(canManageBudgets("ATTENDANT")).toBe(false);
      expect(canManageBudgets("CUSTOMER")).toBe(false);
    });
  });
});
