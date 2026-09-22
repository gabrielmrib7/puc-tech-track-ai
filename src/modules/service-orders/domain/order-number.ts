import type { Prisma } from "@prisma/client";

export function formatOrderNumber(year: number, sequence: number) {
  return `OS-${year}-${String(sequence).padStart(6, "0")}`;
}

export async function allocateOrderNumber(tx: Prisma.TransactionClient, year = new Date().getUTCFullYear()) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('techtrack:service-order-number'))`;
  const count = await tx.serviceOrder.count({ where: { order_number: { startsWith: `OS-${year}-` } } });
  return formatOrderNumber(year, count + 1);
}
