import { describe, expect, it } from "vitest";
import { serviceOrderUpdateSchema, serviceOrderCancelSchema } from "./schemas";

describe("serviceOrderUpdateSchema", () => {
  it("accepts valid editable intake fields", () => {
    const valid = serviceOrderUpdateSchema.parse({
      diagnosis: "Novo relato de defeito detalhado",
      estimatedCompletion: new Date().toISOString(),
    });
    expect(valid.diagnosis).toBe("Novo relato de defeito detalhado");
  });

  it("rejects attempts to change status via generic PATCH", () => {
    expect(() =>
      serviceOrderUpdateSchema.parse({
        status: "COMPLETED",
      })
    ).toThrow();
  });

  it("rejects attempts to change order_number or orderNumber", () => {
    expect(() =>
      serviceOrderUpdateSchema.parse({
        order_number: "OS-9999",
      })
    ).toThrow();

    expect(() =>
      serviceOrderUpdateSchema.parse({
        orderNumber: "OS-9999",
      })
    ).toThrow();
  });

  it("rejects attempts to change budget fields", () => {
    expect(() =>
      serviceOrderUpdateSchema.parse({
        budget_amount: 500,
      })
    ).toThrow();
  });
});

describe("serviceOrderCancelSchema", () => {
  it("accepts valid reason", () => {
    const res = serviceOrderCancelSchema.parse({ reason: "Cliente desistiu do reparo" });
    expect(res.reason).toBe("Cliente desistiu do reparo");
  });

  it("accepts empty or omitted reason", () => {
    const res = serviceOrderCancelSchema.parse({});
    expect(res.reason).toBeUndefined();
  });
});
