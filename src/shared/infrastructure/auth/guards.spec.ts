import { describe, expect, it, vi, beforeEach } from "vitest";
import { requireUser, requireStaff, requireAdmin } from "./guards";
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

describe("Auth Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session exists", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    const result = await requireUser();
    expect(result.errorResponse).toBeDefined();
    expect(result.errorResponse?.status).toBe(401);
  });

  it("returns 403 when local user is inactive", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_123" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-1",
      clerk_id: "clerk_123",
      role: "ADMIN",
      active: false,
    } as any);

    const result = await requireUser();
    expect(result.errorResponse).toBeDefined();
    expect(result.errorResponse?.status).toBe(403);
  });

  it("allows active user with authorized role in requireStaff", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_123" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-1",
      clerk_id: "clerk_123",
      role: "ATTENDANT",
      active: true,
    } as any);

    const result = await requireStaff(["ADMIN", "ATTENDANT"]);
    expect(result.user).toBeDefined();
    expect(result.user?.role).toBe("ATTENDANT");
  });

  it("rejects unauthorized role in requireAdmin", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "clerk_123" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-1",
      clerk_id: "clerk_123",
      role: "ATTENDANT",
      active: true,
    } as any);

    const result = await requireAdmin();
    expect(result.errorResponse).toBeDefined();
    expect(result.errorResponse?.status).toBe(403);
  });
});
