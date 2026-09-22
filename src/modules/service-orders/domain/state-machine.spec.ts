import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "./state-machine";

describe("service order state machine", () => {
  it.each([["RECEIVED", "WAITING_DIAGNOSIS"], ["WAITING_DIAGNOSIS", "IN_DIAGNOSIS"], ["IN_REPAIR", "COMPLETED"], ["READY_FOR_PICKUP", "DELIVERED"]] as const)("allows %s to %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it("rejects invalid and terminal transitions", () => {
    expect(() => assertTransition("RECEIVED", "COMPLETED")).toThrow("INVALID_TRANSITION");
    expect(() => assertTransition("DELIVERED", "IN_REPAIR")).toThrow("INVALID_TRANSITION");
  });
});
