import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { budgetInputSchema, calculateBudgetTotal } from "@/modules/budgets/domain/budget";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, role: true } });
  if (!actor || !["ADMIN", "TECHNICIAN"].includes(actor.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = budgetInputSchema.safeParse({ ...(await request.json()), serviceOrderId: params.id });
  if (!parsed.success) return NextResponse.json({ error: "Invalid budget", details: parsed.error.flatten() }, { status: 422 });
  const amount = calculateBudgetTotal(parsed.data.partsCost, parsed.data.laborCost);
  const budget = await prisma.budget.create({ data: { service_order_id: params.id, description: parsed.data.description, amount, parts_cost: parsed.data.partsCost, labor_cost: parsed.data.laborCost, notes: parsed.data.notes } });
  return NextResponse.json(budget, { status: 201 });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const budgets = await prisma.budget.findMany({ where: { service_order_id: params.id }, orderBy: { created_at: "desc" } });
  return NextResponse.json({ items: budgets });
}

export const budgetStatusForDecision = (decision: "approve" | "reject") => ({ budget: decision === "approve" ? "APPROVED" : "REJECTED", order: decision === "approve" ? "IN_REPAIR" : "REJECTED" } as const);
