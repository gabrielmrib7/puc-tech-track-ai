import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { requireUser } from "@/shared/infrastructure/auth/guards";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const authResult = await requireUser();
  if (authResult.errorResponse) return authResult.errorResponse;
  const user = authResult.user!;

  // 1. Tentar localizar cliente já vinculado pelo user_id
  let customer = await prisma.customer.findFirst({
    where: { user_id: user.id },
    select: { id: true },
  });

  // 2. Se não estiver vinculado, verificar se existe cadastro de cliente com o mesmo e-mail e auto-vincular
  if (!customer && user.email) {
    const customerByEmail = await prisma.customer.findFirst({
      where: { email: { equals: user.email, mode: "insensitive" } },
      select: { id: true, user_id: true },
    });

    if (customerByEmail) {
      if (!customerByEmail.user_id) {
        await prisma.customer.update({
          where: { id: customerByEmail.id },
          data: { user_id: user.id },
        });
      }
      customer = { id: customerByEmail.id };
    }
  }

  // 3. Se o cliente ainda não possui ordens ou cadastro, retorna lista vazia amigavelmente (200 OK)
  if (!customer) {
    return NextResponse.json({ items: [] });
  }

  const orders = await prisma.serviceOrder.findMany({
    where: { customer_id: customer.id },
    include: {
      equipment: true,
      history: { orderBy: { created_at: "asc" } },
      budgets: { orderBy: { created_at: "desc" } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ items: orders });
}
