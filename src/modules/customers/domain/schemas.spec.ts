import { describe, expect, it } from "vitest";
import { customerInputSchema } from "./schemas";

describe("customerInputSchema", () => {
  it("normalizes email", () => {
    expect(customerInputSchema.parse({ name: "Ana Silva", email: " ANA@EXAMPLE.COM ", phone: "11999999999" }).email).toBe("ana@example.com");
  });

  it("rejects an invalid email", () => {
    expect(() => customerInputSchema.parse({ name: "Ana", email: "invalid", phone: "11999999999" })).toThrow();
  });
});
