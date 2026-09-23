import { describe, expect, it } from "vitest";
import {
  assertTransition,
  canTransition,
  canCancelOrder,
  isPreDiagnosisStatus,
  isTerminalStatus,
} from "./state-machine";

describe("service order state machine", () => {
  it.each([
    ["RECEIVED", "WAITING_DIAGNOSIS"],
    ["WAITING_DIAGNOSIS", "IN_DIAGNOSIS"],
    ["WAITING_APPROVAL", "IN_REPAIR"],
    ["WAITING_APPROVAL", "APPROVED"],
    ["IN_REPAIR", "COMPLETED"],
    ["READY_FOR_PICKUP", "DELIVERED"],
  ] as const)("allows %s to %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it("rejects invalid and terminal transitions", () => {
    expect(() => assertTransition("RECEIVED", "COMPLETED")).toThrow("INVALID_TRANSITION");
    expect(() => assertTransition("DELIVERED", "IN_REPAIR")).toThrow("INVALID_TRANSITION");
  });

  it("identifies pre-diagnosis statuses", () => {
    expect(isPreDiagnosisStatus("RECEIVED")).toBe(true);
    expect(isPreDiagnosisStatus("WAITING_DIAGNOSIS")).toBe(true);
    expect(isPreDiagnosisStatus("IN_DIAGNOSIS")).toBe(false);
    expect(isPreDiagnosisStatus("IN_REPAIR")).toBe(false);
    expect(isPreDiagnosisStatus("DELIVERED")).toBe(false);
  });

  it("identifies terminal statuses", () => {
    expect(isTerminalStatus("DELIVERED")).toBe(true);
    expect(isTerminalStatus("CANCELLED")).toBe(true);
    expect(isTerminalStatus("RECEIVED")).toBe(false);
    expect(isTerminalStatus("COMPLETED")).toBe(false);
  });

  it("determines whether order can be cancelled", () => {
    expect(canCancelOrder("RECEIVED")).toBe(true);
    expect(canCancelOrder("WAITING_DIAGNOSIS")).toBe(true);
    expect(canCancelOrder("IN_DIAGNOSIS")).toBe(true);
    expect(canCancelOrder("WAITING_APPROVAL")).toBe(true);
    expect(canCancelOrder("REJECTED")).toBe(true);
    expect(canCancelOrder("IN_REPAIR")).toBe(true);
    expect(canCancelOrder("COMPLETED")).toBe(false);
    expect(canCancelOrder("READY_FOR_PICKUP")).toBe(false);
    expect(canCancelOrder("DELIVERED")).toBe(false);
    expect(canCancelOrder("CANCELLED")).toBe(false);
  });
});
