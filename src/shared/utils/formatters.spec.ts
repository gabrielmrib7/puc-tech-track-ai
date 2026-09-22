import { describe, it, expect } from "vitest";
import {
  formatCurrencyBRL,
  formatLocalDate,
  formatLocalDateTime,
} from "./formatters";

describe("Formatters and Localization Utilities", () => {
  describe("formatCurrencyBRL", () => {
    it("formats integer amounts in BRL currency format", () => {
      const formatted = formatCurrencyBRL(150);
      expect(formatted).toContain("150,00");
      expect(formatted).toContain("R$");
    });

    it("formats decimal amounts properly with two decimal places", () => {
      const formatted = formatCurrencyBRL(1250.75);
      expect(formatted).toContain("1.250,75");
      expect(formatted).toContain("R$");
    });

    it("handles zero, null, undefined, and NaN gracefully", () => {
      expect(formatCurrencyBRL(0)).toContain("0,00");
      expect(formatCurrencyBRL(null)).toContain("0,00");
      expect(formatCurrencyBRL(undefined)).toContain("0,00");
      expect(formatCurrencyBRL("not-a-number")).toContain("0,00");
    });

    it("formats string numbers correctly", () => {
      const formatted = formatCurrencyBRL("499.90");
      expect(formatted).toContain("499,90");
    });
  });

  describe("formatLocalDate", () => {
    it("formats ISO date string into DD/MM/YYYY", () => {
      const formatted = formatLocalDate("2026-09-22T10:00:00Z");
      expect(formatted).toBe("22/09/2026");
    });

    it("formats Date object into DD/MM/YYYY", () => {
      const date = new Date("2026-12-25T00:00:00Z");
      expect(formatLocalDate(date)).toBe("25/12/2026");
    });

    it("returns empty string for invalid date, null, or undefined", () => {
      expect(formatLocalDate(null)).toBe("");
      expect(formatLocalDate(undefined)).toBe("");
      expect(formatLocalDate("invalid-date")).toBe("");
    });
  });

  describe("formatLocalDateTime", () => {
    it("formats date and time into DD/MM/YYYY HH:mm", () => {
      const formatted = formatLocalDateTime("2026-09-22T14:30:00Z");
      expect(formatted).toBe("22/09/2026 14:30");
    });

    it("returns empty string for invalid or missing values", () => {
      expect(formatLocalDateTime(null)).toBe("");
      expect(formatLocalDateTime(undefined)).toBe("");
      expect(formatLocalDateTime("invalid-date")).toBe("");
    });
  });
});

