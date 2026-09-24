import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { buildDashboardCounts } from "@/modules/service-orders/application/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { role: true } });
  if (!actor || !["ADMIN", "ATTENDANT"].includes(actor.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [grouped, newToday, pendingBudgets, readyForPickup] = await prisma.$transaction([
    prisma.serviceOrder.groupBy({ by: ["status"], orderBy: { status: "asc" }, _count: { _all: true } }),
    prisma.serviceOrder.count({ where: { created_at: { gte: today } } }),
    prisma.budget.count({ where: { status: "PENDING" } }),
    prisma.serviceOrder.count({ where: { status: "READY_FOR_PICKUP" } }),
  ]);
  const counts = grouped.map((row) => ({ status: row.status, _count: typeof row._count === "object" && row._count ? { _all: row._count._all } : undefined }));
  return NextResponse.json({ newOrdersToday: newToday, pendingBudgets, readyForPickup, byStatus: buildDashboardCounts(counts) });
}
