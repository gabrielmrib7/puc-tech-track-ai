import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, PATCH, DELETE } from "./route";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { requireUser, requireStaff } from "@/shared/infrastructure/auth/guards";
import { NextResponse } from "next/server";

vi.mock("@/shared/infrastructure/auth/guards", () => ({
  requireUser: vi.fn(),
  requireStaff: vi.fn(),
}));

vi.mock("@/shared/infrastructure/database/prisma", () => ({
  prisma: {
    serviceOrder: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    equipment: {
      findUnique: vi.fn(),
    },
    serviceOrderHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Service Order [id] API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/service-orders/[id]", () => {
    it("returns 401 when requireUser fails", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      } as any);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-1"), {
        params: { id: "so-1" },
      });
      expect(res.status).toBe(401);
    });

    it("returns 404 when order does not exist", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "user-1", role: "ADMIN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue(null);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-404"), {
        params: { id: "so-404" },
      });
      expect(res.status).toBe(404);
    });

    it("allows staff to view any order", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "staff-1", role: "ATTENDANT" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        order_number: "OS-2026-0001",
        status: "RECEIVED",
        customer: { id: "cust-1", user_id: "other-user-999" },
        equipment: { id: "eq-1" },
        history: [],
      } as any);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-1"), {
        params: { id: "so-1" },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.order_number).toBe("OS-2026-0001");
      expect(data.status_label).toBeDefined();
    });

    it("allows CUSTOMER to view own order", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "user-cust-1", role: "CUSTOMER" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        order_number: "OS-2026-0001",
        status: "RECEIVED",
        customer: { id: "cust-1", user_id: "user-cust-1" },
        equipment: { id: "eq-1" },
        history: [],
      } as any);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-1"), {
        params: { id: "so-1" },
      });
      expect(res.status).toBe(200);
    });

    it("rejects CUSTOMER viewing other customer's order with 403", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "attacker-cust", role: "CUSTOMER" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        order_number: "OS-2026-0001",
        status: "RECEIVED",
        customer: { id: "cust-1", user_id: "victim-cust" },
        equipment: { id: "eq-1" },
        history: [],
      } as any);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-1"), {
        params: { id: "so-1" },
      });
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/service-orders/[id]", () => {
    it("rejects non-staff user with 403", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      } as any);

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "PATCH",
        body: JSON.stringify({ diagnosis: "Novo relato" }),
      });
      const res = await PATCH(req, { params: { id: "so-1" } });
      expect(res.status).toBe(403);
    });

    it("rejects protected field writes (e.g. status, order_number) with 422", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "staff-1", role: "ADMIN" },
      } as any);

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const res = await PATCH(req, { params: { id: "so-1" } });
      expect(res.status).toBe(422);
    });

    it("rejects edit if order is not in pre-diagnosis status with 409", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "staff-1", role: "ADMIN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        status: "IN_DIAGNOSIS",
        customer_id: "cust-1",
        equipment_id: "eq-1",
      } as any);

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "PATCH",
        body: JSON.stringify({ diagnosis: "Tentativa de atualizar laudo iniciado" }),
      });
      const res = await PATCH(req, { params: { id: "so-1" } });
      expect(res.status).toBe(409);
    });

    it("rejects if equipment does not belong to customer with 422", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "staff-1", role: "ADMIN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        status: "RECEIVED",
        customer_id: "d9e2b101-9a74-4b82-8419-158a74e54881",
        equipment_id: "e1a2b3c4-1111-2222-3333-444455556666",
      } as any);
      vi.mocked(prisma.equipment.findUnique).mockResolvedValue({
        customer_id: "d9e2b101-9a74-4b82-8419-158a74e54881",
      } as any);

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "PATCH",
        body: JSON.stringify({
          customerId: "b1b2c3d4-0000-1111-2222-333344445555", // different customer
        }),
      });
      // equipment belonging to original customer won't match new customerId
      const res = await PATCH(req, { params: { id: "so-1" } });
      expect(res.status).toBe(422);
    });

    it("updates pre-diagnosis order and creates history atomically in transaction", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "staff-1", role: "ADMIN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        status: "RECEIVED",
        customer_id: "cust-1",
        equipment_id: "eq-1",
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          serviceOrder: {
            findUnique: vi.fn().mockResolvedValue({ id: "so-1", status: "RECEIVED" }),
            update: vi.fn().mockResolvedValue({
              id: "so-1",
              status: "RECEIVED",
              diagnosis: "Novo defeito relatado",
            }),
          },
          serviceOrderHistory: {
            create: vi.fn().mockResolvedValue({ id: "hist-1" }),
          },
        };
        return callback(tx);
      });

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "PATCH",
        body: JSON.stringify({ diagnosis: "Novo defeito relatado" }),
      });
      const res = await PATCH(req, { params: { id: "so-1" } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.diagnosis).toBe("Novo defeito relatado");
    });
  });

  describe("DELETE /api/v1/service-orders/[id]", () => {
    it("rejects non-staff user with 403", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      } as any);

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "DELETE",
      });
      const res = await DELETE(req, { params: { id: "so-1" } });
      expect(res.status).toBe(403);
    });

    it("rejects cancellation of terminal or non-cancellable order (e.g. DELIVERED) with 409", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "staff-1", role: "ADMIN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        status: "DELIVERED",
      } as any);

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "DELETE",
      });
      const res = await DELETE(req, { params: { id: "so-1" } });
      expect(res.status).toBe(409);
    });

    it("cancels active order and records history atomically", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "staff-1", role: "ADMIN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        status: "RECEIVED",
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          serviceOrder: {
            findUnique: vi.fn().mockResolvedValue({ id: "so-1", status: "RECEIVED" }),
            update: vi.fn().mockResolvedValue({ id: "so-1", status: "CANCELLED" }),
          },
          serviceOrderHistory: {
            create: vi.fn().mockResolvedValue({ id: "hist-cancel-1" }),
          },
        };
        return callback(tx);
      });

      const req = new Request("http://localhost/api/v1/service-orders/so-1", {
        method: "DELETE",
        body: JSON.stringify({ reason: "Cliente desistiu antes do início" }),
      });
      const res = await DELETE(req, { params: { id: "so-1" } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("CANCELLED");
    });
  });
});
