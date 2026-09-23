import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/infrastructure/auth/guards";
import { equipmentUpdateSchema } from "@/modules/equipment/domain/schemas";
import { prisma } from "@/shared/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireStaff();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        _count: {
          select: { service_orders: true },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: "Equipamento não encontrado" }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error in GET /api/v1/equipment/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar equipamento" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireStaff();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const body = await request.json();
    const parsed = equipmentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await prisma.equipment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Equipamento não encontrado" }, { status: 404 });
    }

    const { customerId, serialNumber, ...rest } = parsed.data;

    if (customerId) {
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customerExists) {
        return NextResponse.json(
          { error: "Cliente associado não existe" },
          { status: 404 }
        );
      }
    }

    if (serialNumber) {
      const duplicateSerial = await prisma.equipment.findFirst({
        where: {
          id: { not: params.id },
          serial_number: serialNumber,
        },
      });

      if (duplicateSerial) {
        return NextResponse.json(
          { error: "Já existe outro equipamento cadastrado com este número de série" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.equipment.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(customerId ? { customer_id: customerId } : {}),
        ...(serialNumber !== undefined ? { serial_number: serialNumber } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/v1/equipment/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar equipamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireStaff();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    return await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.findUnique({
        where: { id: params.id },
        include: {
          _count: {
            select: { service_orders: true },
          },
        },
      });

      if (!equipment) {
        return NextResponse.json({ error: "Equipamento não encontrado" }, { status: 404 });
      }

      if (equipment._count.service_orders > 0) {
        return NextResponse.json(
          {
            error:
              "Não é possível excluir um equipamento que possui ordens de serviço vinculadas. O histórico de reparos deve ser preservado.",
            dependencyCount: equipment._count.service_orders,
          },
          { status: 409 }
        );
      }

      await tx.equipment.delete({
        where: { id: params.id },
      });

      return NextResponse.json({ success: true, message: "Equipamento excluído com sucesso" });
    });
  } catch (error) {
    console.error("Error in DELETE /api/v1/equipment/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir equipamento" },
      { status: 500 }
    );
  }
}
