import { describe, expect, it } from "vitest";
import { customerInputSchema, customerUpdateSchema } from "./schemas";

describe("customerInputSchema", () => {
  it("normalizes email", () => {
    expect(customerInputSchema.parse({ name: "Ana Silva", email: " ANA@EXAMPLE.COM ", phone: "11999999999" }).email).toBe("ana@example.com");
  });

  it("rejects an invalid email", () => {
    expect(() => customerInputSchema.parse({ name: "Ana", email: "invalid", phone: "11999999999" })).toThrow();
  });
});

describe("customerUpdateSchema", () => {
  it("allows partial updates", () => {
    const res = customerUpdateSchema.parse({ name: "Novo Nome" });
    expect(res.name).toBe("Novo Nome");
    expect(res.email).toBeUndefined();
  });

  it("normalizes partial email", () => {
    const res = customerUpdateSchema.parse({ email: " UPDATE@EXAMPLE.COM " });
    expect(res.email).toBe("update@example.com");
  });

  it("rejects invalid email in partial update", () => {
    expect(() => customerUpdateSchema.parse({ email: "not-an-email" })).toThrow();
  });
});
