import { NextResponse } from "next/server";
import { requireStaff } from "@/shared/infrastructure/auth/guards";
import { customerUpdateSchema } from "@/modules/customers/domain/schemas";
import { prisma } from "@/shared/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireStaff();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        equipment: { orderBy: { created_at: "desc" } },
        _count: {
          select: { service_orders: true, equipment: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error in GET /api/v1/customers/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar cliente" },
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
    const parsed = customerUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const { email, document } = parsed.data;
    if (email || document) {
      const duplicateConditions = [];
      if (email) duplicateConditions.push({ email });
      if (document) duplicateConditions.push({ document });

      const duplicate = await prisma.customer.findFirst({
        where: {
          id: { not: params.id },
          OR: duplicateConditions,
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Já existe outro cliente cadastrado com este e-mail ou documento" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/v1/customers/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar cliente" },
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
      const customer = await tx.customer.findUnique({
        where: { id: params.id },
        include: {
          _count: {
            select: { service_orders: true },
          },
        },
      });

      if (!customer) {
        return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
      }

      if (customer._count.service_orders > 0) {
        return NextResponse.json(
          {
            error:
              "Não é possível excluir um cliente que possui ordens de serviço vinculadas. O histórico de atendimentos deve ser preservado.",
            dependencyCount: customer._count.service_orders,
          },
          { status: 409 }
        );
      }

      // Safe delete: delete any equipment with no orders, then delete customer
      await tx.equipment.deleteMany({
        where: { customer_id: params.id },
      });

      await tx.customer.delete({
        where: { id: params.id },
      });

      return NextResponse.json({ success: true, message: "Cliente excluído com sucesso" });
    });
  } catch (error) {
    console.error("Error in DELETE /api/v1/customers/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir cliente" },
      { status: 500 }
    );
  }
}
