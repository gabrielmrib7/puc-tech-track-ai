import { describe, expect, it } from "vitest";
import { formatOrderNumber } from "./order-number";

describe("service order number", () => {
  it("formats a six-digit sequence", () => {
    expect(formatOrderNumber(2026, 1)).toBe("OS-2026-000001");
    expect(formatOrderNumber(2026, 42)).toBe("OS-2026-000042");
  });
});
