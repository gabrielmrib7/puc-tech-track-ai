import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiPost, requestApi } from "./api-client";

describe("api-client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("handles successful JSON response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: vi.fn().mockResolvedValue({ id: "123", name: "Alpha" }),
    });

    const res = await apiGet<{ id: string; name: string }>("/api/v1/test");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toEqual({ id: "123", name: "Alpha" });
      expect(res.status).toBe(200);
    }
  });

  it("handles structured JSON errors and validation details", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: new Headers({ "content-type": "application/json" }),
      json: vi.fn().mockResolvedValue({
        error: "Invalid input",
        details: { fieldErrors: { email: ["Invalid email"] } },
      }),
    });

    const res = await apiPost("/api/v1/test", { email: "invalid" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.status).toBe(422);
      expect(res.error).toBe("Invalid input");
      expect(res.details).toEqual({ fieldErrors: { email: ["Invalid email"] } });
    }
  });

  it("handles non-JSON error responses gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "text/html" }),
      text: vi.fn().mockResolvedValue("Internal Server Error"),
    });

    const res = await requestApi("/api/v1/test");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.status).toBe(500);
      expect(res.error).toBe("Internal Server Error");
    }
  });

  it("handles network failure gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const res = await apiGet("/api/v1/test");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.status).toBe(0);
      expect(res.error).toBe("Connection refused");
    }
  });
});

