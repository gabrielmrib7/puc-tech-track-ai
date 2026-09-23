import { describe, expect, it } from "vitest";
import { equipmentInputSchema, equipmentUpdateSchema } from "./schemas";

describe("equipmentInputSchema", () => {
  it("accepts a valid equipment", () => {
    expect(equipmentInputSchema.parse({ customerId: "00000000-0000-0000-0000-000000000000", type: "Notebook", brand: "Dell", model: "R740", reportedProblem: "Does not start" }).model).toBe("R740");
  });
});

describe("equipmentUpdateSchema", () => {
  it("allows partial updates", () => {
    const res = equipmentUpdateSchema.parse({ brand: "HP", model: "Pavilion" });
    expect(res.brand).toBe("HP");
    expect(res.model).toBe("Pavilion");
    expect(res.reportedProblem).toBeUndefined();
  });

  it("normalizes serial number to uppercase if provided", () => {
    const res = equipmentUpdateSchema.parse({ serialNumber: " sn-abc-123 " });
    expect(res.serialNumber).toBe("SN-ABC-123");
  });
});
