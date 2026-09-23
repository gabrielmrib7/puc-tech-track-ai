import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { getPostLoginPath } from "@/modules/auth/domain/roles";
import { syncClerkUser, isAutoAdminEmail } from "@/modules/auth/application/sync-clerk-user";
import { bootstrapAdminIfEligible } from "@/modules/auth/application/bootstrap-admin";

export default async function PostLoginPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  let user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { id: true, role: true },
  });

  // Provisioning fallback: if webhook hasn't executed yet, sync from authenticated session
  if (!user) {
    const clerkUser = await currentUser();
    const primaryEmail =
      clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      "";

    const fullName =
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      primaryEmail ||
      "TechTrack User";

    if (primaryEmail) {
      const created = await syncClerkUser(prisma, {
        clerkId: userId,
        email: primaryEmail,
        name: fullName,
      });
      user = { id: created.id, role: created.role };
    }
  }

  // Safe server-authoritative first ADMIN bootstrap check
  if (user) {
    const bootstrap = await bootstrapAdminIfEligible(prisma, userId);
    if (bootstrap.bootstrapped) {
      user.role = "ADMIN";
    }
  }

  // Auto-admin email verification (e.g. admin@techtrack.com or ADMIN_EMAILS)
  if (user && user.role !== "ADMIN") {
    const clerkUser = await currentUser();
    const primaryEmail =
      clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      "";

    if (primaryEmail && isAutoAdminEmail(primaryEmail)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      user.role = "ADMIN";
    }
  }

  if (!user) {
    redirect("/login");
  }

  redirect(getPostLoginPath(user.role));
}
