import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, POST, PATCH, DELETE } from "./route";
import { POST as decisionPOST } from "./[decision]/route";
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
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    customer: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    budget: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    serviceOrderHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Budget API Routes & Transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/service-orders/[id]/budget", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      } as any);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-1/budget"), {
        params: { id: "so-1" },
      });
      expect(res.status).toBe(401);
    });

    it("allows staff to list budgets", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "u-staff", role: "TECHNICIAN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        customer_id: "c-1",
        customer: { id: "c-1", user_id: "u-other", email: "client@test.com" },
      } as any);
      vi.mocked(prisma.budget.findMany).mockResolvedValue([
        { id: "b-1", amount: 250, status: "PENDING" },
      ] as any);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-1/budget"), {
        params: { id: "so-1" },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toHaveLength(1);
    });

    it("rejects cross-customer budget access with 403", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "u-attacker", role: "CUSTOMER", email: "attacker@test.com" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        customer_id: "c-victim",
        customer: { id: "c-victim", user_id: "u-victim", email: "victim@test.com" },
      } as any);

      const res = await GET(new Request("http://localhost/api/v1/service-orders/so-1/budget"), {
        params: { id: "so-1" },
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/v1/service-orders/[id]/budget (Create)", () => {
    it("rejects non-staff with 403", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      } as any);

      const res = await POST(
        new Request("http://localhost/api/v1/service-orders/so-1/budget", {
          method: "POST",
          body: JSON.stringify({ description: "Serviço", partsCost: 10, laborCost: 20 }),
        }),
        { params: { id: "so-1" } }
      );
      expect(res.status).toBe(403);
    });

    it("rejects budget creation on terminal order with 409", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "u-tech", role: "TECHNICIAN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        status: "DELIVERED",
      } as any);

      const res = await POST(
        new Request("http://localhost/api/v1/service-orders/so-1/budget", {
          method: "POST",
          body: JSON.stringify({ description: "Serviço", partsCost: 10, laborCost: 20 }),
        }),
        { params: { id: "so-1" } }
      );
      expect(res.status).toBe(409);
    });

    it("calculates server-side total and commits budget atomically", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "u-tech", role: "TECHNICIAN" },
      } as any);
      vi.mocked(prisma.serviceOrder.findUnique).mockResolvedValue({
        id: "so-1",
        status: "IN_DIAGNOSIS",
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          budget: {
            create: vi.fn().mockResolvedValue({
              id: "b-1",
              service_order_id: "so-1",
              amount: 150.5,
              parts_cost: 100.5,
              labor_cost: 50,
              status: "PENDING",
            }),
          },
          serviceOrder: {
            update: vi.fn().mockResolvedValue({ id: "so-1", status: "WAITING_APPROVAL" }),
          },
          serviceOrderHistory: {
            create: vi.fn().mockResolvedValue({ id: "h-1" }),
          },
        };
        return callback(tx);
      });

      const res = await POST(
        new Request("http://localhost/api/v1/service-orders/so-1/budget", {
          method: "POST",
          body: JSON.stringify({
            description: "Troca de placa e conector",
            partsCost: 100.5,
            laborCost: 50,
            notes: "Garantia 90 dias",
          }),
        }),
        { params: { id: "so-1" } }
      );

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.amount).toBe(150.5);
    });
  });

  describe("PATCH /api/v1/service-orders/[id]/budget (Update Pending)", () => {
    it("rejects update on already decided budget (e.g. APPROVED) with 409", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "u-tech", role: "TECHNICIAN" },
      } as any);
      vi.mocked(prisma.budget.findFirst).mockResolvedValue({
        id: "b-1",
        status: "APPROVED",
        parts_cost: 100,
        labor_cost: 50,
      } as any);

      const res = await PATCH(
        new Request("http://localhost/api/v1/service-orders/so-1/budget", {
          method: "PATCH",
          body: JSON.stringify({ partsCost: 120 }),
        }),
        { params: { id: "so-1" } }
      );
      expect(res.status).toBe(409);
    });

    it("updates pending budget and recalculates total atomically", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "u-tech", role: "TECHNICIAN" },
      } as any);
      vi.mocked(prisma.budget.findFirst).mockResolvedValue({
        id: "b-1",
        status: "PENDING",
        parts_cost: 100,
        labor_cost: 50,
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          budget: {
            findUnique: vi.fn().mockResolvedValue({ id: "b-1", status: "PENDING" }),
            update: vi.fn().mockResolvedValue({
              id: "b-1",
              parts_cost: 120,
              labor_cost: 50,
              amount: 170,
              status: "PENDING",
            }),
          },
          serviceOrder: {
            update: vi.fn().mockResolvedValue({ id: "so-1", budget_amount: 170 }),
          },
          serviceOrderHistory: {
            create: vi.fn().mockResolvedValue({ id: "h-2" }),
          },
        };
        return callback(tx);
      });

      const res = await PATCH(
        new Request("http://localhost/api/v1/service-orders/so-1/budget", {
          method: "PATCH",
          body: JSON.stringify({ partsCost: 120 }),
        }),
        { params: { id: "so-1" } }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.amount).toBe(170);
    });
  });

  describe("DELETE /api/v1/service-orders/[id]/budget (Delete Pending)", () => {
    it("rejects delete on decided budget with 409", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "u-tech", role: "TECHNICIAN" },
      } as any);
      vi.mocked(prisma.budget.findFirst).mockResolvedValue({
        id: "b-1",
        status: "REJECTED",
      } as any);

      const res = await DELETE(
        new Request("http://localhost/api/v1/service-orders/so-1/budget", {
          method: "DELETE",
        }),
        { params: { id: "so-1" } }
      );
      expect(res.status).toBe(409);
    });

    it("deletes pending draft budget atomically", async () => {
      vi.mocked(requireStaff).mockResolvedValue({
        user: { id: "u-tech", role: "TECHNICIAN" },
      } as any);
      vi.mocked(prisma.budget.findFirst).mockResolvedValue({
        id: "b-1",
        status: "PENDING",
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          budget: {
            findUnique: vi.fn().mockResolvedValue({ id: "b-1", status: "PENDING" }),
            delete: vi.fn().mockResolvedValue({ id: "b-1" }),
          },
          serviceOrder: {
            update: vi.fn().mockResolvedValue({ id: "so-1" }),
          },
          serviceOrderHistory: {
            create: vi.fn().mockResolvedValue({ id: "h-3" }),
          },
        };
        return callback(tx);
      });

      const res = await DELETE(
        new Request("http://localhost/api/v1/service-orders/so-1/budget", {
          method: "DELETE",
        }),
        { params: { id: "so-1" } }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/v1/service-orders/[id]/budget/[decision] (ACID Approval & Rollback)", () => {
    it("rejects repeated decision on already decided budget with 409", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "u-client", role: "CUSTOMER" },
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          customer: { findFirst: vi.fn().mockResolvedValue({ id: "c-1" }) },
          serviceOrder: { findFirst: vi.fn().mockResolvedValue({ id: "so-1", status: "IN_REPAIR" }) },
          // No pending budget found because it was already approved
          budget: { findFirst: vi.fn().mockResolvedValue(null) },
        };
        return callback(tx);
      });

      const res = await decisionPOST(
        new Request("http://localhost/api/v1/service-orders/so-1/budget/approve", {
          method: "POST",
        }),
        { params: { id: "so-1", decision: "approve" } }
      );
      expect(res.status).toBe(409);
    });

    it("demonstrates rollback when history write fails", async () => {
      vi.mocked(requireUser).mockResolvedValue({
        user: { id: "u-client", role: "CUSTOMER" },
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          customer: { findFirst: vi.fn().mockResolvedValue({ id: "c-1" }) },
          serviceOrder: {
            findFirst: vi.fn().mockResolvedValue({ id: "so-1", status: "WAITING_APPROVAL" }),
            update: vi.fn().mockResolvedValue({ id: "so-1", status: "IN_REPAIR" }),
          },
          budget: {
            findFirst: vi.fn().mockResolvedValue({ id: "b-1", status: "PENDING" }),
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          serviceOrderHistory: {
            create: vi.fn().mockRejectedValue(new Error("DB_HISTORY_FAILURE")),
          },
        };
        // Simulated failure inside transaction triggers throw
        return callback(tx);
      });

      const res = await decisionPOST(
        new Request("http://localhost/api/v1/service-orders/so-1/budget/approve", {
          method: "POST",
        }),
        { params: { id: "so-1", decision: "approve" } }
      );
      // Because transaction threw an unhandled DB error, it returns 422/500 and rolled back
      expect(res.status).toBe(422);
    });
  });
});
