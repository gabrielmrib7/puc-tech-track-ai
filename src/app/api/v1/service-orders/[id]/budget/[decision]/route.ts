import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { assertTransition } from "@/modules/service-orders/domain/state-machine";

export async function POST(_request: Request, { params }: { params: { id: string; decision: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (params.decision !== "approve" && params.decision !== "reject") return NextResponse.json({ error: "Invalid decision" }, { status: 422 });
  const actor = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
  if (!actor || actor.role !== "CUSTOMER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({ where: { user_id: actor.id }, select: { id: true } });
      const order = await tx.serviceOrder.findFirst({ where: { id: params.id, customer_id: customer?.id }, select: { id: true, status: true } });
      if (!order) throw new Error("NOT_FOUND");
      const budget = await tx.budget.findFirst({ where: { service_order_id: order.id, status: "PENDING" }, orderBy: { created_at: "desc" } });
      if (!budget) throw new Error("CONFLICT");
      const nextStatus = params.decision === "approve" ? "IN_REPAIR" : "REJECTED";
      assertTransition(order.status, nextStatus);
      const changed = await tx.budget.updateMany({ where: { id: budget.id, status: "PENDING" }, data: { status: params.decision === "approve" ? "APPROVED" : "REJECTED" } });
      if (changed.count !== 1) throw new Error("CONFLICT");
      const updatedOrder = await tx.serviceOrder.update({ where: { id: order.id }, data: { status: nextStatus, budget_status: params.decision === "approve" ? "APPROVED" : "REJECTED" } });
      await tx.serviceOrderHistory.create({ data: { service_order_id: order.id, user_id: actor.id, action: `BUDGET_${params.decision.toUpperCase()}`, old_status: order.status, new_status: nextStatus, description: `Customer ${params.decision}d budget` } });
      return updatedOrder;
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (error instanceof Error && error.message === "CONFLICT") return NextResponse.json({ error: "Budget already decided" }, { status: 409 });
    return NextResponse.json({ error: "Budget decision is not allowed" }, { status: 422 });
  }
}
