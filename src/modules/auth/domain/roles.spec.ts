import { describe, expect, it } from "vitest";
import { getPostLoginPath, hasRole, isStaffRole } from "./roles";

describe("auth roles", () => {
  it("checks allowed roles", () => {
    expect(hasRole("ADMIN", ["ADMIN"])).toBe(true);
    expect(hasRole("CUSTOMER", ["ADMIN"])).toBe(false);
  });

  it("identifies staff roles", () => {
    expect(isStaffRole("TECHNICIAN")).toBe(true);
    expect(isStaffRole("CUSTOMER")).toBe(false);
  });

  it("selects the post-login area", () => {
    expect(getPostLoginPath("CUSTOMER")).toBe("/portal");
    expect(getPostLoginPath("ATTENDANT")).toBe("/admin/dashboard");
  });
});
