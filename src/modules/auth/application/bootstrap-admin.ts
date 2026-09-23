import type { PrismaClient } from "@prisma/client";

export type BootstrapResult =
  | { bootstrapped: true; role: "ADMIN" }
  | { bootstrapped: false; reason: "NOT_CONFIGURED" | "NOT_ELIGIBLE" | "ADMIN_ALREADY_EXISTS" | "USER_NOT_FOUND" };

/**
 * Server-authoritative first-ADMIN bootstrap mechanism.
 * Only promotes the user if:
 * 1. ADMIN_BOOTSTRAP_CLERK_ID matches the authenticated clerk_id.
 * 2. No user with role ADMIN exists yet in the database.
 */
export async function bootstrapAdminIfEligible(
  prisma: PrismaClient,
  clerkId: string,
  bootstrapClerkId = process.env.ADMIN_BOOTSTRAP_CLERK_ID
): Promise<BootstrapResult> {
  if (!bootstrapClerkId) {
    return { bootstrapped: false, reason: "NOT_CONFIGURED" };
  }

  if (clerkId !== bootstrapClerkId) {
    return { bootstrapped: false, reason: "NOT_ELIGIBLE" };
  }

  return prisma.$transaction(async (tx) => {
    const existingAdmin = await tx.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (existingAdmin) {
      return { bootstrapped: false, reason: "ADMIN_ALREADY_EXISTS" };
    }

    const user = await tx.user.findUnique({
      where: { clerk_id: clerkId },
      select: { id: true },
    });

    if (!user) {
      return { bootstrapped: false, reason: "USER_NOT_FOUND" };
    }

    await tx.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return { bootstrapped: true, role: "ADMIN" };
  });
}

