import { describe, expect, it } from "vitest";
import { equipmentInputSchema } from "./schemas";

describe("equipmentInputSchema", () => {
  it("accepts a valid equipment", () => {
    expect(equipmentInputSchema.parse({ customerId: "00000000-0000-0000-0000-000000000000", type: "Notebook", brand: "Dell", model: "R740", reportedProblem: "Does not start" }).model).toBe("R740");
  });
});
