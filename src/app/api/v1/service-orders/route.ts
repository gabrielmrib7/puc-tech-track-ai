import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { allocateOrderNumber } from "@/modules/service-orders/domain/order-number";
import { serviceOrderInputSchema } from "@/modules/service-orders/domain/intake";

export const dynamic = "force-dynamic";

async function getStaff() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
}

export async function POST(request: Request) {
  const actor = await getStaff();
  if (!actor || !["ADMIN", "ATTENDANT"].includes(actor.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = serviceOrderInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid service order", details: parsed.error.flatten() }, { status: 422 });

  const order = await prisma.$transaction(async (tx) => {
    const equipment = await tx.equipment.findUnique({ where: { id: parsed.data.equipmentId }, select: { customer_id: true } });
    if (!equipment || equipment.customer_id !== parsed.data.customerId) throw new Error("INVALID_EQUIPMENT_CUSTOMER");
    const orderNumber = await allocateOrderNumber(tx);
    const created = await tx.serviceOrder.create({ data: { order_number: orderNumber, customer_id: parsed.data.customerId, equipment_id: parsed.data.equipmentId, status: OrderStatus.RECEIVED, estimated_completion: parsed.data.estimatedCompletion, diagnosis: parsed.data.diagnosis } });
    await tx.serviceOrderHistory.create({ data: { service_order_id: created.id, user_id: actor.id, action: "ORDER_RECEIVED", new_status: OrderStatus.RECEIVED, description: "Service order received" } });
    return created;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "INVALID_EQUIPMENT_CUSTOMER") return null;
    throw error;
  });

  if (!order) return NextResponse.json({ error: "Equipment does not belong to customer" }, { status: 422 });
  return NextResponse.json(order, { status: 201 });
}

export async function GET(request: Request) {
  const actor = await getStaff();
  if (!actor || !["ADMIN", "ATTENDANT", "TECHNICIAN"].includes(actor.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const page = Math.max(Number(params.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 20), 1), 100);
  const status = params.get("status") as OrderStatus | null;
  const query = params.get("query")?.trim();
  const where = { ...(status && Object.values(OrderStatus).includes(status) ? { status } : {}), ...(query ? { OR: [{ order_number: { contains: query, mode: "insensitive" as const } }, { customer: { name: { contains: query, mode: "insensitive" as const } } }] } : {}) };
  const [items, total] = await prisma.$transaction([prisma.serviceOrder.findMany({ where, include: { customer: true, equipment: true }, orderBy: { created_at: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.serviceOrder.count({ where })]);
  return NextResponse.json({ items, page, limit, total });
}
