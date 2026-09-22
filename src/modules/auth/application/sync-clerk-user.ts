import type { PrismaClient, UserRole } from "@prisma/client";

export type ClerkUserInput = {
  clerkId: string;
  email: string;
  name: string;
  role?: UserRole;
};

export async function syncClerkUser(prisma: PrismaClient, input: ClerkUserInput) {
  return prisma.user.upsert({
    where: { clerk_id: input.clerkId },
    create: {
      clerk_id: input.clerkId,
      email: input.email,
      name: input.name,
      role: input.role ?? "ATTENDANT",
    },
    update: {
      email: input.email,
      name: input.name,
    },
  });
}
