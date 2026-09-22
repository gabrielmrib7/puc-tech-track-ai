import { describe, expect, it } from "vitest";
import { calculateBudgetTotal } from "./budget";

describe("budget totals", () => {
  it("adds parts and labor with two decimal precision", () => {
    expect(calculateBudgetTotal(450, 120)).toBe(570);
    expect(calculateBudgetTotal(10.105, 0)).toBe(10.11);
  });
});
