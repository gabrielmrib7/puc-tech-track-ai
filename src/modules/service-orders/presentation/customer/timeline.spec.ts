import { describe, expect, it } from "vitest";
import { humanizeStatus, sortTimeline } from "./timeline";

describe("customer timeline", () => {
  it("humanizes technical status", () => {
    expect(humanizeStatus("READY_FOR_PICKUP")).toBe("Pronto para retirada");
  });

  it("sorts events chronologically", () => {
    const later = new Date("2026-01-02");
    const earlier = new Date("2026-01-01");
    expect(sortTimeline([{ created_at: later }, { created_at: earlier }])[0].created_at).toBe(earlier);
  });
});
