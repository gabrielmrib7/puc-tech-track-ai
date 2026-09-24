import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { assertTransition } from "@/modules/service-orders/domain/state-machine";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
  if (!actor || !["ADMIN", "ATTENDANT"].includes(actor.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json() as { recipientName?: string; recipientDocument?: string };
  if (!body.recipientName?.trim() || !body.recipientDocument?.trim()) return NextResponse.json({ error: "Pickup identity is required" }, { status: 422 });
  const recipientName = body.recipientName.trim();
  const recipientDocument = body.recipientDocument.trim();
  try {
    const delivered = await prisma.$transaction(async (tx) => {
      const current = await tx.serviceOrder.findUnique({ where: { id: params.id } });
      if (!current) throw new Error("NOT_FOUND");
      assertTransition(current.status, "DELIVERED");
      const order = await tx.serviceOrder.update({ where: { id: params.id }, data: { status: "DELIVERED", delivered_at: new Date(), completed_at: current.completed_at ?? new Date() } });
      await tx.serviceOrderHistory.create({ data: { service_order_id: order.id, user_id: actor.id, action: "ORDER_DELIVERED", old_status: current.status, new_status: "DELIVERED", description: `Pickup confirmed by ${recipientName} (${recipientDocument})` } });
      return order;
    });
    return NextResponse.json(delivered);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Order is not ready for delivery" }, { status: 422 });
  }
}
