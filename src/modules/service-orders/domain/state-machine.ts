import type { OrderStatus } from "@prisma/client";

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  RECEIVED: ["WAITING_DIAGNOSIS", "CANCELLED"],
  WAITING_DIAGNOSIS: ["IN_DIAGNOSIS", "CANCELLED"],
  IN_DIAGNOSIS: ["WAITING_APPROVAL", "IN_REPAIR", "CANCELLED"],
  WAITING_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["IN_REPAIR"],
  REJECTED: ["CANCELLED", "IN_REPAIR"],
  IN_REPAIR: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return transitions[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransition(from, to)) throw new Error(`INVALID_TRANSITION:${from}:${to}`);
}
