import type { OrderStatus } from "@prisma/client";

export const statusLabels: Record<OrderStatus, string> = {
  RECEIVED: "Recebido na assistência",
  WAITING_DIAGNOSIS: "Aguardando diagnóstico",
  IN_DIAGNOSIS: "Diagnóstico em andamento",
  WAITING_APPROVAL: "Aguardando sua aprovação",
  APPROVED: "Orçamento aprovado",
  REJECTED: "Orçamento recusado",
  IN_REPAIR: "Reparo em andamento",
  COMPLETED: "Reparo concluído",
  READY_FOR_PICKUP: "Pronto para retirada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export function humanizeStatus(status: OrderStatus) {
  return statusLabels[status];
}

export function sortTimeline<T extends { created_at: Date }>(items: T[]) {
  return [...items].sort((left, right) => left.created_at.getTime() - right.created_at.getTime());
}
