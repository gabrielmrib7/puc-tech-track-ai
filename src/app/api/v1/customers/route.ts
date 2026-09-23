import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { customerInputSchema } from "@/modules/customers/domain/schemas";
import { syncClerkUser } from "@/modules/auth/application/sync-clerk-user";
import { prisma } from "@/shared/infrastructure/database/prisma";

async function requireStaff() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    try {
      const clerkUser = await currentUser();
      const primaryEmail =
        clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ??
        clerkUser?.emailAddresses?.[0]?.emailAddress ??
        "";

      if (primaryEmail) {
        const created = await syncClerkUser(prisma, {
          clerkId: userId,
          email: primaryEmail,
          name:
            [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
            primaryEmail,
        });
        user = { id: created.id, role: created.role };
      }
    } catch (e) {
      console.error("Auto-provisioning error in requireStaff:", e);
    }
  }

  return user && ["ADMIN", "ATTENDANT"].includes(user.role) ? user : null;
}

export async function GET(request: Request) {
  try {
    const staff = await requireStaff();
    if (!staff) {
      return NextResponse.json({ error: "Acesso não autorizado para esta função" }, { status: 403 });
    }

    const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
    const page = Math.max(Number(new URL(request.url).searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit") ?? 20), 1), 100);

    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            { document: { contains: query } },
          ],
        }
      : {};

    // Auto-sync unlinked users with role CUSTOMER into customers table
    const unlinkedUsers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        customers: { none: {} },
      },
      select: { id: true, name: true, email: true },
    });

    for (const u of unlinkedUsers) {
      const existingByEmail = await prisma.customer.findFirst({
        where: { email: { equals: u.email, mode: "insensitive" } },
      });
      if (existingByEmail) {
        if (!existingByEmail.user_id) {
          await prisma.customer.update({
            where: { id: existingByEmail.id },
            data: { user_id: u.id },
          });
        }
      } else {
        await prisma.customer.create({
          data: {
            name: u.name,
            email: u.email,
            phone: "Não informado",
            user_id: u.id,
          },
        });
      }
    }

    const [items, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({ items, page, limit, total });
  } catch (error) {
    console.error("Error in GET /api/v1/customers:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar clientes", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const staff = await requireStaff();
    if (!staff) {
      return NextResponse.json({ error: "Acesso não autorizado para esta função" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = customerInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos para o cliente", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const duplicate = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: parsed.data.email },
          ...(parsed.data.document ? [{ document: parsed.data.document }] : []),
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: "Já existe um cliente cadastrado com este e-mail ou documento" }, { status: 409 });
    }

    const customer = await prisma.customer.create({
      data: parsed.data,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/customers:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar cliente", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
