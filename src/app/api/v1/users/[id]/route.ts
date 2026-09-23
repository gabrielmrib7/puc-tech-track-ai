import { NextResponse } from "next/server";
import { requireAdmin } from "@/shared/infrastructure/auth/guards";
import { userUpdateSchema } from "@/modules/auth/domain/schemas";
import { prisma } from "@/shared/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

const safeUserSelect = {
  id: true,
  clerk_id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  created_at: true,
  updated_at: true,
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAdmin();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: safeUserSelect,
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in GET /api/v1/users/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar usuário" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAdmin();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const body = await request.json();
    const parsed = userUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Protection: Prevent demoting or deactivating the last active ADMIN
    if (
      existing.role === "ADMIN" &&
      (parsed.data.active === false || (parsed.data.role && parsed.data.role !== "ADMIN"))
    ) {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", active: true },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Não é possível inativar ou alterar o papel do único administrador ativo do sistema.",
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: parsed.data,
      select: safeUserSelect,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/v1/users/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar usuário" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await requireAdmin();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (existing.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", active: true },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            error: "Não é possível desativar o único administrador ativo do sistema.",
          },
          { status: 409 }
        );
      }
    }

    // Soft-delete to preserve foreign key references in ServiceOrderHistory
    await prisma.user.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json({
      success: true,
      message: "Usuário desativado com sucesso (histórico preservado)",
    });
  } catch (error) {
    console.error("Error in DELETE /api/v1/users/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno ao desativar usuário" },
      { status: 500 }
    );
  }
}
