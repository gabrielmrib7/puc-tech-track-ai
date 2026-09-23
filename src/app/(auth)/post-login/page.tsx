import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { getPostLoginPath } from "@/modules/auth/domain/roles";

export default async function PostLoginPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { role: true },
  });

  redirect(user ? getPostLoginPath(user.role) : "/login");
}
