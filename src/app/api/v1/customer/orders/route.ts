import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";

async function getCustomerId() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
  if (!user || user.role !== "CUSTOMER") return null;
  const customer = await prisma.customer.findFirst({ where: { user_id: user.id }, select: { id: true } });
  return customer?.id ?? null;
}

export async function GET() {
  const customerId = await getCustomerId();
  if (!customerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const orders = await prisma.serviceOrder.findMany({ where: { customer_id: customerId }, include: { equipment: true, history: { orderBy: { created_at: "asc" } } }, orderBy: { created_at: "desc" } });
  return NextResponse.json({ items: orders });
}
