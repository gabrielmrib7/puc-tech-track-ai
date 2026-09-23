import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { requireUser } from "@/shared/infrastructure/auth/guards";
import { assertTransition } from "@/modules/service-orders/domain/state-machine";

export async function POST(
  _request: Request,
  { params }: { params: { id: string; decision: string } }
): Promise<NextResponse> {
  const authResult = await requireUser();
  if (authResult.errorResponse) return authResult.errorResponse;
  const { user } = authResult;

  if (params.decision !== "approve" && params.decision !== "reject") {
    return NextResponse.json({ error: "Decisão inválida. Use 'approve' ou 'reject'." }, { status: 422 });
  }

  if (user.role !== "CUSTOMER" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Apenas clientes ou administradores podem registrar decisão de orçamento" },
      { status: 403 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: { user_id: user.id },
        select: { id: true },
      });

      if (!customer && user.email) {
        customer = await tx.customer.findFirst({
          where: { email: { equals: user.email, mode: "insensitive" } },
          select: { id: true },
        });
      }

      const order = await tx.serviceOrder.findFirst({
        where:
          user.role === "ADMIN"
            ? { id: params.id }
            : { id: params.id, customer_id: customer?.id ?? "impossible-id" },
        select: { id: true, status: true },
      });

      if (!order) throw new Error("NOT_FOUND");

      const budget = await tx.budget.findFirst({
        where: { service_order_id: order.id, status: "PENDING" },
        orderBy: { created_at: "desc" },
      });

      if (!budget) throw new Error("CONFLICT");

      const nextStatus = params.decision === "approve" ? "IN_REPAIR" : "REJECTED";
      assertTransition(order.status, nextStatus);

      // Concurrency protection: exactly-once update
      const changed = await tx.budget.updateMany({
        where: { id: budget.id, status: "PENDING" },
        data: { status: params.decision === "approve" ? "APPROVED" : "REJECTED" },
      });

      if (changed.count !== 1) throw new Error("CONFLICT");

      const updatedOrder = await tx.serviceOrder.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          budget_status: params.decision === "approve" ? "APPROVED" : "REJECTED",
        },
      });

      await tx.serviceOrderHistory.create({
        data: {
          service_order_id: order.id,
          user_id: user.id,
          action: `BUDGET_${params.decision.toUpperCase()}`,
          old_status: order.status,
          new_status: nextStatus,
          description:
            params.decision === "approve"
              ? "Orçamento aprovado pelo cliente. Reparo iniciado."
              : "Orçamento recusado pelo cliente.",
        },
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "CONFLICT") {
      return NextResponse.json(
        { error: "Este orçamento já foi processado ou está em um estado que não permite nova decisão" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Não foi possível registrar a decisão do orçamento" }, { status: 422 });
  }
}
