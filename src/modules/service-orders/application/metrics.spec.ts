import { describe, expect, it } from "vitest";
import { buildDashboardCounts } from "./metrics";

describe("dashboard counts", () => {
  it("maps grouped database rows", () => {
    expect(buildDashboardCounts([{ status: "IN_REPAIR", _count: { _all: 3 } }])).toEqual({ IN_REPAIR: 3 });
  });
});
