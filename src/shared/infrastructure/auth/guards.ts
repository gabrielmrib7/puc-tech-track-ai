import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { syncClerkUser } from "@/modules/auth/application/sync-clerk-user";
import type { User, UserRole } from "@prisma/client";

export type AuthResult =
  | { user: User; errorResponse?: never }
  | { errorResponse: NextResponse; user?: never };

/**
 * Validates authenticated session and ensures local user exists and is active.
 * Rejects inactive users with HTTP 403 Forbidden.
 */
export async function requireUser(): Promise<AuthResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      errorResponse: NextResponse.json(
        { error: "Autenticação obrigatória" },
        { status: 401 }
      ),
    };
  }

  let user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  if (!user) {
    try {
      const clerkUser = await currentUser();
      const primaryEmail =
        clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ??
        clerkUser?.emailAddresses?.[0]?.emailAddress ??
        "";

      if (primaryEmail) {
        user = await syncClerkUser(prisma, {
          clerkId: userId,
          email: primaryEmail,
          name:
            [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
            primaryEmail,
        });
      }
    } catch (e) {
      console.error("Auto-provisioning error in guard:", e);
    }
  }

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Usuário não localizado no sistema" },
        { status: 403 }
      ),
    };
  }

  if (user.active === false) {
    return {
      errorResponse: NextResponse.json(
        { error: "Conta de usuário inativa ou desativada" },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Requires an active user with one of the allowed staff roles.
 */
export async function requireStaff(
  allowedRoles: UserRole[] = ["ADMIN", "ATTENDANT"]
): Promise<AuthResult> {
  const result = await requireUser();
  if ("errorResponse" in result) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Acesso não autorizado para o papel do usuário" },
        { status: 403 }
      ),
    };
  }

  return result;
}

/**
 * Requires an active user with ADMIN role.
 */
export async function requireAdmin(): Promise<AuthResult> {
  return requireStaff(["ADMIN"]);
}
