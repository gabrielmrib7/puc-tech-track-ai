import type { PrismaClient, UserRole } from "@prisma/client";

export type ClerkUserInput = {
  clerkId: string;
  email: string;
  name: string;
  role?: UserRole;
};

/**
 * Checks if the given email is designated as an auto-provisioned ADMIN.
 * Defaults to including 'admin@techtrack.com' and any comma-separated emails in ADMIN_EMAILS.
 */
export function isAutoAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const envAdminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return normalized === "admin@techtrack.com" || envAdminEmails.includes(normalized);
}

/**
 * Idempotent synchronization of Clerk identity to local application User model.
 * Handles duplicate delivery, updating changed profiles without altering existing roles,
 * and associating pre-existing email records to the new Clerk identifier.
 * Automatically assigns ADMIN role if the email matches designated auto-admin emails.
 */
export async function syncClerkUser(prisma: PrismaClient, input: ClerkUserInput) {
  const shouldBeAdmin = isAutoAdminEmail(input.email);
  const targetRole: UserRole | undefined = shouldBeAdmin ? "ADMIN" : input.role;

  const existingByClerk = await prisma.user.findUnique({
    where: { clerk_id: input.clerkId },
  });

  if (existingByClerk) {
    return prisma.user.update({
      where: { id: existingByClerk.id },
      data: {
        email: input.email,
        name: input.name,
        ...(targetRole ? { role: targetRole } : {}),
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
        ...(targetRole ? { role: targetRole } : {}),
      },
    });
  }

  return prisma.user.create({
    data: {
      clerk_id: input.clerkId,
      email: input.email,
      name: input.name,
      role: targetRole ?? "ATTENDANT",
    },
  });
}
