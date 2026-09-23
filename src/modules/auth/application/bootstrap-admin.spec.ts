import { describe, expect, it, vi } from "vitest";
import { bootstrapAdminIfEligible } from "./bootstrap-admin";
import type { PrismaClient } from "@prisma/client";

describe("bootstrapAdminIfEligible", () => {
  it("returns NOT_CONFIGURED when bootstrapClerkId is not set", async () => {
    const prisma = {} as PrismaClient;
    const result = await bootstrapAdminIfEligible(prisma, "user_123", undefined);
    expect(result).toEqual({ bootstrapped: false, reason: "NOT_CONFIGURED" });
  });

  it("returns NOT_ELIGIBLE when clerkId does not match bootstrapClerkId", async () => {
    const prisma = {} as PrismaClient;
    const result = await bootstrapAdminIfEligible(prisma, "user_other", "user_admin_target");
    expect(result).toEqual({ bootstrapped: false, reason: "NOT_ELIGIBLE" });
  });

  it("returns ADMIN_ALREADY_EXISTS when an admin already exists in the database", async () => {
    const mockTx = {
      user: {
        findFirst: vi.fn().mockResolvedValue({ id: "admin-1" }),
      },
    };
    const prisma = {
      $transaction: vi.fn().mockImplementation((cb) => cb(mockTx)),
    } as unknown as PrismaClient;

    const result = await bootstrapAdminIfEligible(prisma, "user_target", "user_target");
    expect(result).toEqual({ bootstrapped: false, reason: "ADMIN_ALREADY_EXISTS" });
    expect(mockTx.user.findFirst).toHaveBeenCalledWith({
      where: { role: "ADMIN" },
      select: { id: true },
    });
  });

  it("returns USER_NOT_FOUND when target user has not been provisioned", async () => {
    const mockTx = {
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    const prisma = {
      $transaction: vi.fn().mockImplementation((cb) => cb(mockTx)),
    } as unknown as PrismaClient;

    const result = await bootstrapAdminIfEligible(prisma, "user_target", "user_target");
    expect(result).toEqual({ bootstrapped: false, reason: "USER_NOT_FOUND" });
  });

  it("successfully promotes eligible user to ADMIN when no admin exists", async () => {
    const mockTx = {
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue({ id: "local-user-1" }),
        update: vi.fn().mockResolvedValue({ id: "local-user-1", role: "ADMIN" }),
      },
    };
    const prisma = {
      $transaction: vi.fn().mockImplementation((cb) => cb(mockTx)),
    } as unknown as PrismaClient;

    const result = await bootstrapAdminIfEligible(prisma, "user_target", "user_target");
    expect(result).toEqual({ bootstrapped: true, role: "ADMIN" });
    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "local-user-1" },
      data: { role: "ADMIN" },
    });
  });
});

