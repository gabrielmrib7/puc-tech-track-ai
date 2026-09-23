import { describe, expect, it, vi } from "vitest";
import { syncClerkUser, isAutoAdminEmail } from "./sync-clerk-user";
import type { PrismaClient } from "@prisma/client";

describe("syncClerkUser", () => {
  it("automatically assigns ADMIN role to admin@techtrack.com", async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "u-admin",
          clerk_id: "clerk_admin",
          email: "admin@techtrack.com",
          name: "Admin User",
          role: "ADMIN",
        }),
      },
    } as unknown as PrismaClient;

    const user = await syncClerkUser(prisma, {
      clerkId: "clerk_admin",
      email: "admin@techtrack.com",
      name: "Admin User",
    });

    expect(user.role).toBe("ADMIN");
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerk_id: "clerk_admin",
        email: "admin@techtrack.com",
        name: "Admin User",
        role: "ADMIN",
      },
    });
  });

  it("checks isAutoAdminEmail correctly", () => {
    expect(isAutoAdminEmail("admin@techtrack.com")).toBe(true);
    expect(isAutoAdminEmail(" ADMIN@TECHTRACK.COM ")).toBe(true);
    expect(isAutoAdminEmail("other@example.com")).toBe(false);
  });
  it("creates a new user when no record exists by clerk_id or email", async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "u-1",
          clerk_id: "clerk_123",
          email: "test@example.com",
          name: "Test User",
          role: "ATTENDANT",
        }),
      },
    } as unknown as PrismaClient;

    const user = await syncClerkUser(prisma, {
      clerkId: "clerk_123",
      email: "test@example.com",
      name: "Test User",
    });

    expect(user.role).toBe("ATTENDANT");
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerk_id: "clerk_123",
        email: "test@example.com",
        name: "Test User",
        role: "ATTENDANT",
      },
    });
  });

  it("updates existing user found by clerk_id without overwriting role unless specified", async () => {
    const existing = {
      id: "u-2",
      clerk_id: "clerk_123",
      email: "old@example.com",
      name: "Old Name",
      role: "ADMIN",
    };

    const prisma = {
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.clerk_id === "clerk_123") return Promise.resolve(existing);
          return Promise.resolve(null);
        }),
        update: vi.fn().mockResolvedValue({
          ...existing,
          email: "new@example.com",
          name: "New Name",
        }),
      },
    } as unknown as PrismaClient;

    const user = await syncClerkUser(prisma, {
      clerkId: "clerk_123",
      email: "new@example.com",
      name: "New Name",
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u-2" },
      data: {
        email: "new@example.com",
        name: "New Name",
      },
    });
  });

  it("associates clerk_id to pre-existing email record", async () => {
    const existing = {
      id: "u-3",
      clerk_id: null,
      email: "legacy@example.com",
      name: "Legacy User",
      role: "TECHNICIAN",
    };

    const prisma = {
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.clerk_id === "clerk_999") return Promise.resolve(null);
          if (where.email === "legacy@example.com") return Promise.resolve(existing);
          return Promise.resolve(null);
        }),
        update: vi.fn().mockResolvedValue({
          ...existing,
          clerk_id: "clerk_999",
          name: "Legacy Updated",
        }),
      },
    } as unknown as PrismaClient;

    const user = await syncClerkUser(prisma, {
      clerkId: "clerk_999",
      email: "legacy@example.com",
      name: "Legacy Updated",
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u-3" },
      data: {
        clerk_id: "clerk_999",
        name: "Legacy Updated",
      },
    });
  });
});

