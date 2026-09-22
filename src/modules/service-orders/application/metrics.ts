import type { OrderStatus } from "@prisma/client";

export type DashboardCounts = Partial<Record<OrderStatus, number>>;

export function buildDashboardCounts(rows: Array<{ status: OrderStatus; _count?: { _all?: number } }>): DashboardCounts {
  return Object.fromEntries(rows.map((row) => [row.status, row._count?._all ?? 0]));
}
