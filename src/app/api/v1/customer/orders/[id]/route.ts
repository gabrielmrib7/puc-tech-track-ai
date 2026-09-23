import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { requireUser } from "@/shared/infrastructure/auth/guards";
import { humanizeStatus } from "@/modules/service-orders/presentation/customer/timeline";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireUser();
  if (authResult.errorResponse) return authResult.errorResponse;
  const user = authResult.user!;

  // 1. Localizar cliente vinculado ou auto-vincular por e-mail
  let customer = await prisma.customer.findFirst({
    where: { user_id: user.id },
    select: { id: true },
  });

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

  // 2. Se for staff ou admin, permite localizar a ordem mesmo que não seja o customer
  const isStaff = ["ADMIN", "ATTENDANT", "TECHNICIAN"].includes(user.role);

  const order = await prisma.serviceOrder.findFirst({
    where: isStaff
      ? { id: params.id }
      : customer
      ? { id: params.id, customer_id: customer.id }
      : { id: "impossible-id" },
    include: {
      equipment: true,
      history: { orderBy: { created_at: "asc" } },
      budgets: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    ...order,
    status_label: humanizeStatus(order.status),
  });
}
