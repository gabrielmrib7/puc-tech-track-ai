import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/infrastructure/database/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("@/shared/infrastructure/database/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/v1/ai/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/ai/estimate - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    const req = createRequest({
      equipment_type: "Smartphone",
      brand: "Apple",
      model: "iPhone 13",
      reported_defect: "Não liga",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Autenticação obrigatória");
  });

  it("returns 403 Forbidden when requested by CUSTOMER role", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_customer" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-customer",
      clerk_id: "clerk_customer",
      role: "CUSTOMER",
      active: true,
    } as any);

    const req = createRequest({
      equipment_type: "Smartphone",
      brand: "Apple",
      model: "iPhone 13",
      reported_defect: "Não liga",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Acesso não autorizado para o papel do usuário");
  });

  it("returns 400 Bad Request when request body is missing required fields", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_tech" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-tech",
      clerk_id: "clerk_tech",
      role: "TECHNICIAN",
      active: true,
    } as any);

    const req = createRequest({
      equipment_type: "",
      brand: "",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Dados de requisição inválidos");
    expect(json.issues).toBeDefined();
  });

  it("returns 200 OK with estimate for authorized ATTENDANT or TECHNICIAN", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_attendant" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-attendant",
      clerk_id: "clerk_attendant",
      role: "ATTENDANT",
      active: true,
    } as any);

    const req = createRequest({
      equipment_type: "Smartphone",
      brand: "Apple",
      model: "iPhone 13",
      reported_defect: "Aparelho não liga após queda na piscina com água",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.probable_defect).toBeDefined();
    expect(json.confidence_score).toBeGreaterThan(0);
    expect(json.estimated_cost_min).toBeGreaterThan(0);
    expect(json.estimated_cost_max).toBeGreaterThanOrEqual(json.estimated_cost_min);
    expect(Array.isArray(json.suggested_parts)).toBe(true);
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(json.complexity);
  });
});
