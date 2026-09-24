import { NextResponse } from "next/server";
import { OrderStatus, BudgetStatus } from "@prisma/client";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { requireUser, requireStaff } from "@/shared/infrastructure/auth/guards";
import {
  budgetInputSchema,
  budgetUpdateSchema,
  calculateBudgetTotal,
  canMutateBudget,
} from "@/modules/budgets/domain/budget";
import { isTerminalStatus } from "@/modules/service-orders/domain/state-machine";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireUser();
  if (authResult.errorResponse) return authResult.errorResponse;
  const { user } = authResult;

  const order = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      customer_id: true,
      customer: { select: { id: true, user_id: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  // Authorization: Staff (ADMIN, ATTENDANT, TECHNICIAN) can view;
  // CUSTOMER can view ONLY if they own the order.
  const isStaff = ["ADMIN", "ATTENDANT", "TECHNICIAN"].includes(user.role);
  if (!isStaff) {
    const isOwner =
      order.customer.user_id === user.id ||
      (order.customer.email && user.email && order.customer.email.toLowerCase() === user.email.toLowerCase());

    if (!isOwner) {
      return NextResponse.json({ error: "Acesso não autorizado a este orçamento" }, { status: 403 });
    }
  }

  const budgets = await prisma.budget.findMany({
    where: { service_order_id: params.id },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ items: budgets });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireStaff(["ADMIN", "TECHNICIAN"]);
  if (authResult.errorResponse) return authResult.errorResponse;
  const { user } = authResult;

  const order = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  if (isTerminalStatus(order.status)) {
    return NextResponse.json(
      { error: "Não é possível emitir orçamento para uma ordem de serviço em estado terminal" },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = budgetInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos para emissão de orçamento", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const amount = calculateBudgetTotal(parsed.data.partsCost, parsed.data.laborCost);

  try {
    const budget = await prisma.$transaction(async (tx) => {
      const created = await tx.budget.create({
        data: {
          service_order_id: params.id,
          description: parsed.data.description,
          amount,
          parts_cost: parsed.data.partsCost,
          labor_cost: parsed.data.laborCost,
          notes: parsed.data.notes,
          status: BudgetStatus.PENDING,
        },
      });

      await tx.serviceOrder.update({
        where: { id: params.id },
        data: {
          budget_amount: amount,
          budget_description: parsed.data.description,
          budget_status: BudgetStatus.PENDING,
          status: OrderStatus.WAITING_APPROVAL,
        },
      });

      await tx.serviceOrderHistory.create({
        data: {
          service_order_id: params.id,
          user_id: user.id,
          action: "BUDGET_CREATED",
          old_status: order.status,
          new_status: OrderStatus.WAITING_APPROVAL,
          description: `Orçamento emitido no valor de R$ ${amount.toFixed(2)} (Aguardando aprovação)`,
        },
      });

      return created;
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget transaction:", error);
    return NextResponse.json({ error: "Falha ao registrar orçamento" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireStaff(["ADMIN", "TECHNICIAN"]);
  if (authResult.errorResponse) return authResult.errorResponse;
  const { user } = authResult;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = budgetUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos para atualização de orçamento", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const url = new URL(request.url);
  const targetBudgetId = body.budgetId || url.searchParams.get("budgetId");

  const budget = targetBudgetId
    ? await prisma.budget.findFirst({
        where: { id: targetBudgetId, service_order_id: params.id },
      })
    : await prisma.budget.findFirst({
        where: { service_order_id: params.id },
        orderBy: { created_at: "desc" },
      });

  if (!budget) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }

  // Decided budgets are strictly immutable
  if (!canMutateBudget(budget.status)) {
    return NextResponse.json(
      { error: `Orçamento com status ${budget.status} não pode ser alterado. Decisões são imutáveis.` },
      { status: 409 }
    );
  }

  const newParts =
    parsed.data.partsCost !== undefined ? parsed.data.partsCost : Number(budget.parts_cost ?? 0);
  const newLabor =
    parsed.data.laborCost !== undefined ? parsed.data.laborCost : Number(budget.labor_cost ?? 0);
  const newAmount = calculateBudgetTotal(newParts, newLabor);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Concurrency check within transaction
      const current = await tx.budget.findUnique({ where: { id: budget.id } });
      if (!current || !canMutateBudget(current.status)) {
        throw new Error("CONFLICT");
      }

      const budgetUpdated = await tx.budget.update({
        where: { id: budget.id },
        data: {
          ...(parsed.data.description ? { description: parsed.data.description } : {}),
          ...(parsed.data.partsCost !== undefined ? { parts_cost: parsed.data.partsCost } : {}),
          ...(parsed.data.laborCost !== undefined ? { labor_cost: parsed.data.laborCost } : {}),
          ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
          amount: newAmount,
        },
      });

      await tx.serviceOrder.update({
        where: { id: params.id },
        data: {
          budget_amount: newAmount,
          ...(parsed.data.description ? { budget_description: parsed.data.description } : {}),
        },
      });

      await tx.serviceOrderHistory.create({
        data: {
          service_order_id: params.id,
          user_id: user.id,
          action: "BUDGET_UPDATED",
          description: `Orçamento atualizado para R$ ${newAmount.toFixed(2)}`,
        },
      });

      return budgetUpdated;
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return NextResponse.json(
        { error: "Orçamento já foi processado ou alterado concorrentemente" },
        { status: 409 }
      );
    }
    console.error("Error updating budget:", error);
    return NextResponse.json({ error: "Erro ao atualizar orçamento" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireStaff(["ADMIN", "TECHNICIAN"]);
  if (authResult.errorResponse) return authResult.errorResponse;
  const { user } = authResult;

  const url = new URL(request.url);
  let targetBudgetId = url.searchParams.get("budgetId");

  if (!targetBudgetId) {
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        const json = JSON.parse(text);
        targetBudgetId = json.budgetId;
      }
    } catch {
      // Optional body
    }
  }

  const budget = targetBudgetId
    ? await prisma.budget.findFirst({
        where: { id: targetBudgetId, service_order_id: params.id },
      })
    : await prisma.budget.findFirst({
        where: { service_order_id: params.id, status: BudgetStatus.PENDING },
        orderBy: { created_at: "desc" },
      });

  if (!budget) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }

  // Decided budgets are strictly immutable
  if (!canMutateBudget(budget.status)) {
    return NextResponse.json(
      { error: `Orçamento com status ${budget.status} não pode ser excluído. Decisões são imutáveis.` },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Concurrency check within transaction
      const current = await tx.budget.findUnique({ where: { id: budget.id } });
      if (!current || !canMutateBudget(current.status)) {
        throw new Error("CONFLICT");
      }

      await tx.budget.delete({ where: { id: budget.id } });

      await tx.serviceOrder.update({
        where: { id: params.id },
        data: {
          budget_amount: null,
          budget_description: null,
          budget_status: null,
        },
      });

      await tx.serviceOrderHistory.create({
        data: {
          service_order_id: params.id,
          user_id: user.id,
          action: "BUDGET_DELETED",
          description: "Rascunho de orçamento pendente excluído",
        },
      });
    });

    return NextResponse.json({ success: true, message: "Orçamento pendente excluído com sucesso" });
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return NextResponse.json(
        { error: "Orçamento já foi processado ou alterado concorrentemente" },
        { status: 409 }
      );
    }
    console.error("Error deleting budget:", error);
    return NextResponse.json({ error: "Erro ao excluir orçamento" }, { status: 500 });
  }
}
