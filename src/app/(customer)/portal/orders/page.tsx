"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/components/AdminShell";
import { apiGet } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { humanizeStatus } from "@/modules/service-orders/presentation/customer/timeline";
import { formatLocalDate } from "@/shared/utils/formatters";
import type { OrderStatus, ServiceOrderWithRelations } from "@/shared/types/api";

function getBadgeTone(status: OrderStatus): "blue" | "amber" | "green" | "red" {
  switch (status) {
    case "WAITING_APPROVAL":
      return "amber";
    case "READY_FOR_PICKUP":
    case "DELIVERED":
    case "COMPLETED":
      return "green";
    case "REJECTED":
    case "CANCELLED":
      return "red";
    default:
      return "blue";
  }
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrderWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await apiGet<{ items: ServiceOrderWithRelations[] }>(
      ROUTES.api.customerOrders
    );

    if (!res.ok) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    setOrders(res.data.items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <main className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#c3c6d7]/50 bg-[#faf8ff] px-4 shadow-sm">
        <Link
          href={ROUTES.portal.home}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004ac6] hover:underline"
        >
          <ArrowLeft size={16} /> Voltar ao Portal
        </Link>
        <h1 className="text-lg font-bold text-[#004ac6]">TechTrack</h1>
        <div className="w-16" />
      </header>

      <div className="mx-auto max-w-lg space-y-4 p-4 pb-12">
        <div className="mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#131b2e]">
            Minhas Ordens de Serviço
          </h2>
          <p className="mt-1 text-xs text-[#434655]">
            Histórico completo de equipamentos e reparos registrados para você.
          </p>
        </div>

        {isLoading ? (
          <LoadingState message="Buscando suas ordens de serviço..." className="py-20" />
        ) : error ? (
          <ErrorState
            title="Não foi possível carregar as ordens"
            message={error}
            onRetry={fetchOrders}
            className="my-8"
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem encontrada"
            description="Você ainda não possui ordens de serviço registradas em seu nome."
            className="my-10"
          />
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-[#c3c6d7]/30 bg-white p-5 shadow-sm transition hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#004ac6]">
                    {order.order_number}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-[#131b2e]">
                    {order.equipment?.brand} {order.equipment?.model}
                  </h3>
                </div>
                <StatusBadge tone={getBadgeTone(order.status)}>
                  {humanizeStatus(order.status)}
                </StatusBadge>
              </div>

              <p className="mt-2 text-xs text-[#434655]">
                {order.equipment?.reported_problem || order.diagnosis}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#c3c6d7]/20 pt-3 text-xs text-[#515f74]">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {formatLocalDate(order.created_at)}
                </span>

                {order.status === "WAITING_APPROVAL" ? (
                  <Link
                    href={ROUTES.portal.budgetApproval(order.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#004ac6] px-3 py-1.5 font-bold text-white shadow-sm hover:bg-[#003ea8]"
                  >
                    <DollarSign size={13} /> Ver Orçamento
                  </Link>
                ) : (
                  <Link
                    href={ROUTES.portal.home}
                    className="text-xs font-semibold text-[#004ac6] hover:underline"
                  >
                    Ver detalhes
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
