import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { assertTransition } from "@/modules/service-orders/domain/state-machine";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
  if (!actor || !["ADMIN", "TECHNICIAN", "ATTENDANT"].includes(actor.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json() as { status?: OrderStatus; description?: string };
  if (!body.status || !Object.values(OrderStatus).includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 422 });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.serviceOrder.findUnique({ where: { id: params.id } });
      if (!current) throw new Error("NOT_FOUND");
      if (body.status === "IN_DIAGNOSIS" && !["ADMIN", "TECHNICIAN"].includes(actor.role)) throw new Error("FORBIDDEN");
      assertTransition(current.status, body.status as OrderStatus);
      const order = await tx.serviceOrder.update({ where: { id: params.id }, data: { status: body.status } });
      await tx.serviceOrderHistory.create({ data: { service_order_id: order.id, user_id: actor.id, action: "STATUS_CHANGED", old_status: current.status, new_status: body.status, description: body.description } });
      return order;
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Invalid transition" }, { status: 422 });
  }
}
