import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { customerInputSchema } from "@/modules/customers/domain/schemas";
import { prisma } from "@/shared/infrastructure/database/prisma";

async function requireStaff() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { role: true } });
  return user && ["ADMIN", "ATTENDANT"].includes(user.role) ? user : null;
}

export async function GET(request: Request) {
  if (!(await requireStaff())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
  const page = Math.max(Number(new URL(request.url).searchParams.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit") ?? 20), 1), 100);
  const where = query ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { email: { contains: query, mode: "insensitive" as const } }, { document: { contains: query } }] } : {};
  const [items, total] = await prisma.$transaction([prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: "asc" } }), prisma.customer.count({ where })]);
  return NextResponse.json({ items, page, limit, total });
}

export async function POST(request: Request) {
  if (!(await requireStaff())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = customerInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid customer", details: parsed.error.flatten() }, { status: 422 });
  const duplicate = await prisma.customer.findFirst({ where: { OR: [{ email: parsed.data.email }, ...(parsed.data.document ? [{ document: parsed.data.document }] : [])] } });
  if (duplicate) return NextResponse.json({ error: "Customer already exists" }, { status: 409 });
  const customer = await prisma.customer.create({ data: parsed.data });
  return NextResponse.json(customer, { status: 201 });
}
