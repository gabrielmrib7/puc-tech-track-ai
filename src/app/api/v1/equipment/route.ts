import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { equipmentInputSchema } from "@/modules/equipment/domain/schemas";
import { prisma } from "@/shared/infrastructure/database/prisma";

async function requireStaff() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { role: true } });
  return Boolean(user && ["ADMIN", "ATTENDANT"].includes(user.role));
}

export async function GET(request: Request) {
  if (!(await requireStaff())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const customerId = new URL(request.url).searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 422 });
  const equipment = await prisma.equipment.findMany({ where: { customer_id: customerId }, orderBy: { created_at: "desc" } });
  return NextResponse.json({ items: equipment });
}

export async function POST(request: Request) {
  if (!(await requireStaff())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = equipmentInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid equipment", details: parsed.error.flatten() }, { status: 422 });
  const serial = parsed.data.serialNumber?.toUpperCase();
  if (serial && await prisma.equipment.findFirst({ where: { serial_number: serial } })) return NextResponse.json({ error: "Serial already exists" }, { status: 409 });
  const equipment = await prisma.equipment.create({ data: { customer_id: parsed.data.customerId, type: parsed.data.type, brand: parsed.data.brand, model: parsed.data.model, serial_number: serial, reported_problem: parsed.data.reportedProblem, accessories: parsed.data.accessories } });
  return NextResponse.json(equipment, { status: 201 });
}
