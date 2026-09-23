import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { humanizeStatus } from "@/modules/service-orders/presentation/customer/timeline";

async function getStaff() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { id: true, role: true },
  });
  return user && ["ADMIN", "ATTENDANT", "TECHNICIAN"].includes(user.role) ? user : null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const staff = await getStaff();
  if (!staff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const order = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      equipment: true,
      technician: { select: { id: true, name: true, email: true, role: true } },
      budgets: { orderBy: { created_at: "desc" } },
      history: {
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...order,
    status_label: humanizeStatus(order.status),
  });
}

