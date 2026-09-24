import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { assertTransition } from "@/modules/service-orders/domain/state-machine";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
  if (!actor || !["ADMIN", "TECHNICIAN"].includes(actor.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json() as { diagnosis?: string; estimatedCompletion?: string };
  if (!body.diagnosis?.trim()) return NextResponse.json({ error: "Diagnosis is required" }, { status: 422 });
  const diagnosis = body.diagnosis.trim();
  try {
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.serviceOrder.findUnique({ where: { id: params.id } });
      if (!current) throw new Error("NOT_FOUND");
      const nextStatus = current.status === "IN_DIAGNOSIS" ? "WAITING_APPROVAL" : "IN_DIAGNOSIS";
      assertTransition(current.status, nextStatus);
      const updated = await tx.serviceOrder.update({ where: { id: params.id }, data: { diagnosis, estimated_completion: body.estimatedCompletion ? new Date(body.estimatedCompletion) : undefined, status: nextStatus, technician_id: actor.id } });
      await tx.serviceOrderHistory.create({ data: { service_order_id: updated.id, user_id: actor.id, action: "DIAGNOSIS_RECORDED", old_status: current.status, new_status: nextStatus, description: diagnosis } });
      return updated;
    });
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Invalid diagnosis transition" }, { status: 422 });
  }
}
