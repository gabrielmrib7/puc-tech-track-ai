import { describe, expect, it } from "vitest";
import { userUpdateSchema } from "./schemas";

describe("userUpdateSchema", () => {
  it("allows valid role update", () => {
    const res = userUpdateSchema.parse({ role: "TECHNICIAN" });
    expect(res.role).toBe("TECHNICIAN");
    expect(res.active).toBeUndefined();
  });

  it("allows active toggle", () => {
    const res = userUpdateSchema.parse({ active: false });
    expect(res.active).toBe(false);
    expect(res.role).toBeUndefined();
  });

  it("allows updating both role and active", () => {
    const res = userUpdateSchema.parse({ role: "ADMIN", active: true });
    expect(res.role).toBe("ADMIN");
    expect(res.active).toBe(true);
  });

  it("rejects unknown role", () => {
    expect(() => userUpdateSchema.parse({ role: "SUPERUSER" })).toThrow();
  });
});
