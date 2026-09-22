import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { humanizeStatus } from "@/modules/service-orders/presentation/customer/timeline";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
  if (!user || user.role !== "CUSTOMER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const customer = await prisma.customer.findFirst({ where: { user_id: user.id }, select: { id: true } });
  const order = customer ? await prisma.serviceOrder.findFirst({ where: { id: params.id, customer_id: customer.id }, include: { equipment: true, history: { orderBy: { created_at: "asc" } }, budgets: true } }) : null;
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...order, status_label: humanizeStatus(order.status) });
}
