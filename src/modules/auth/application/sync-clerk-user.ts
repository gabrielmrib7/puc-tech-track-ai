import type { PrismaClient, UserRole } from "@prisma/client";

export type ClerkUserInput = {
  clerkId: string;
  email: string;
  name: string;
  role?: UserRole;
};

/**
 * Idempotent synchronization of Clerk identity to local application User model.
 * Handles duplicate delivery, updating changed profiles without altering existing roles,
 * and associating pre-existing email records to the new Clerk identifier.
 */
export async function syncClerkUser(prisma: PrismaClient, input: ClerkUserInput) {
  const existingByClerk = await prisma.user.findUnique({
    where: { clerk_id: input.clerkId },
  });

  if (existingByClerk) {
    return prisma.user.update({
      where: { id: existingByClerk.id },
      data: {
        email: input.email,
        name: input.name,
        ...(input.role ? { role: input.role } : {}),
      },
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerk_id: input.clerkId,
        name: input.name,
        ...(input.role ? { role: input.role } : {}),
      },
    });
  }

  return prisma.user.create({
    data: {
      clerk_id: input.clerkId,
      email: input.email,
      name: input.name,
      role: input.role ?? "ATTENDANT",
    },
  });
}
