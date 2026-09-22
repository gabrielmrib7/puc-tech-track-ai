import { describe, it, expect } from "vitest";
import { validateEnv } from "./env";

describe("Environment Variables Validator", () => {
  it("validates valid configuration successfully", () => {
    const result = validateEnv({
      PROJECT_NAME: "tech_Track",
      GLOBAL_PREFIX: "api/v1",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/techtrack",
      DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/techtrack",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PROJECT_NAME).toBe("tech_Track");
      expect(result.data.FRONTEND_PORT).toBe(3000);
    }
  });

  it("fails when DATABASE_URL is missing or empty", () => {
    const result = validateEnv({
      DATABASE_URL: "",
    });

    expect(result.success).toBe(false);
  });
});

