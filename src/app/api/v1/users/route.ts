import { NextResponse } from "next/server";
import { requireAdmin } from "@/shared/infrastructure/auth/guards";
import { prisma } from "@/shared/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAdmin();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim() ?? "";
    const role = url.searchParams.get("role")?.trim() ?? "";

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }
    if (role && ["ADMIN", "ATTENDANT", "TECHNICIAN", "CUSTOMER"].includes(role)) {
      where.role = role;
    }

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          clerk_id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("Error in GET /api/v1/users:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar usuários" },
      { status: 500 }
    );
  }
}
