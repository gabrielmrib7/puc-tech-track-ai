import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { requireUser, requireStaff } from "@/shared/infrastructure/auth/guards";
import { humanizeStatus } from "@/modules/service-orders/presentation/customer/timeline";
import {
  serviceOrderUpdateSchema,
  serviceOrderCancelSchema,
} from "@/modules/service-orders/domain/schemas";
import {
  isPreDiagnosisStatus,
  isTerminalStatus,
  canCancelOrder,
} from "@/modules/service-orders/domain/state-machine";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireUser();
  if (authResult.errorResponse) return authResult.errorResponse;
  const user = authResult.user!;

  const order = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      equipment: true,
      technician: { select: { id: true, name: true, email: true, role: true } },
      budgets: { orderBy: { created_at: "desc" } },
      history: {
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  const isStaff = ["ADMIN", "ATTENDANT", "TECHNICIAN"].includes(user.role);
  if (!isStaff) {
    if (user.role === "CUSTOMER") {
      if (order.customer.user_id !== user.id) {
        return NextResponse.json({ error: "Acesso não autorizado a esta ordem de serviço" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Acesso não autorizado a esta ordem de serviço" }, { status: 403 });
    }
  }

  return NextResponse.json({
    ...order,
    status_label: humanizeStatus(order.status),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireStaff(["ADMIN", "ATTENDANT", "TECHNICIAN"]);
  if (authResult.errorResponse) return authResult.errorResponse;
  const user = authResult.user!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = serviceOrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos para atualização", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const existingOrder = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, customer_id: true, equipment_id: true },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  if (!isPreDiagnosisStatus(existingOrder.status)) {
    return NextResponse.json(
      { error: "A ordem de serviço só pode ter os dados de entrada editados antes do início do diagnóstico" },
      { status: 409 }
    );
  }

  const targetCustomerId = parsed.data.customerId ?? existingOrder.customer_id;
  const targetEquipmentId = parsed.data.equipmentId ?? existingOrder.equipment_id;

  if (parsed.data.customerId || parsed.data.equipmentId) {
    const equipment = await prisma.equipment.findUnique({
      where: { id: targetEquipmentId },
      select: { customer_id: true },
    });

    if (!equipment || equipment.customer_id !== targetCustomerId) {
      return NextResponse.json(
        { error: "O equipamento informado não pertence ao cliente selecionado" },
        { status: 422 }
      );
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.serviceOrder.findUnique({
        where: { id: params.id },
        select: { status: true },
      });

      if (!current) throw new Error("NOT_FOUND");
      if (!isPreDiagnosisStatus(current.status)) throw new Error("CONFLICT_STATUS");

      const order = await tx.serviceOrder.update({
        where: { id: params.id },
        data: {
          ...(parsed.data.customerId ? { customer_id: parsed.data.customerId } : {}),
          ...(parsed.data.equipmentId ? { equipment_id: parsed.data.equipmentId } : {}),
          ...(parsed.data.estimatedCompletion !== undefined
            ? { estimated_completion: parsed.data.estimatedCompletion }
            : {}),
          ...(parsed.data.diagnosis !== undefined
            ? { diagnosis: parsed.data.diagnosis }
            : {}),
        },
        include: {
          customer: true,
          equipment: true,
          technician: { select: { id: true, name: true, email: true, role: true } },
          budgets: { orderBy: { created_at: "desc" } },
          history: {
            include: {
              user: { select: { id: true, name: true, role: true } },
            },
            orderBy: { created_at: "asc" },
          },
        },
      });

      await tx.serviceOrderHistory.create({
        data: {
          service_order_id: order.id,
          user_id: user.id,
          action: "ORDER_UPDATED",
          old_status: current.status,
          new_status: current.status,
          description: "Dados de entrada da ordem de serviço atualizados",
        },
      });

      return order;
    });

    return NextResponse.json({
      ...updated,
      status_label: humanizeStatus(updated.status),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
      }
      if (err.message === "CONFLICT_STATUS") {
        return NextResponse.json(
          { error: "A ordem de serviço não pode mais ser alterada nesta fase" },
          { status: 409 }
        );
      }
    }
    throw err;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const authResult = await requireStaff(["ADMIN", "ATTENDANT", "TECHNICIAN"]);
  if (authResult.errorResponse) return authResult.errorResponse;
  const user = authResult.user!;

  let reason: string | undefined;
  try {
    const text = await request.text();
    if (text && text.trim().length > 0) {
      const json = JSON.parse(text);
      const parsed = serviceOrderCancelSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos para cancelamento", details: parsed.error.flatten() },
          { status: 422 }
        );
      }
      reason = parsed.data.reason;
    }
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const existingOrder = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  if (isTerminalStatus(existingOrder.status) || !canCancelOrder(existingOrder.status)) {
    return NextResponse.json(
      { error: `Ordens no estado ${existingOrder.status} não podem ser canceladas` },
      { status: 409 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.serviceOrder.findUnique({
        where: { id: params.id },
        select: { id: true, status: true },
      });

      if (!current) throw new Error("NOT_FOUND");
      if (isTerminalStatus(current.status) || !canCancelOrder(current.status)) {
        throw new Error("CONFLICT_STATUS");
      }

      const order = await tx.serviceOrder.update({
        where: { id: params.id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.serviceOrderHistory.create({
        data: {
          service_order_id: order.id,
          user_id: user.id,
          action: "ORDER_CANCELLED",
          old_status: current.status,
          new_status: OrderStatus.CANCELLED,
          description: reason || "Cancelamento administrativo da ordem de serviço",
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      status_label: humanizeStatus(result.status),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
      }
      if (err.message === "CONFLICT_STATUS") {
        return NextResponse.json(
          { error: "A ordem de serviço não pode ser cancelada no estado atual" },
          { status: 409 }
        );
      }
    }
    throw err;
  }
}
