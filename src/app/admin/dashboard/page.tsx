"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Search,
  Wrench,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AdminShell, StatusBadge } from "@/shared/components/AdminShell";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { apiGet } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import type { AdminDashboardResponse, ServiceOrderWithRelations, PaginatedResponse } from "@/shared/types/api";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardResponse | null>(null);
  const [attentionOrders, setAttentionOrders] = useState<ServiceOrderWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [metricsRes, ordersRes] = await Promise.all([
      apiGet<AdminDashboardResponse>(ROUTES.api.dashboard),
      apiGet<PaginatedResponse<ServiceOrderWithRelations>>(
        `${ROUTES.api.serviceOrders}?status=WAITING_APPROVAL&limit=5`
      ),
    ]);

    if (!metricsRes.ok) {
      setError(metricsRes.error);
      setIsLoading(false);
      return;
    }

    setMetrics(metricsRes.data);
    if (ordersRes.ok) {
      setAttentionOrders(ordersRes.data.items);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalOrders = metrics
    ? Object.values(metrics.byStatus).reduce((acc, count) => acc + (count || 0), 0)
    : 0;

  const statCards = [
    {
      label: "TOTAL DE ORDENS",
      value: totalOrders,
      note: `${metrics?.newOrdersToday ?? 0} novas hoje`,
      icon: ClipboardList,
      color: "text-[#004ac6] bg-[#dbe1ff]",
    },
    {
      label: "EM DIAGNÓSTICO",
      value: metrics?.byStatus?.IN_DIAGNOSIS ?? 0,
      note: "Análise técnica",
      icon: Search,
      color: "text-[#005a89] bg-[#cce5ff]",
    },
    {
      label: "AGUARDANDO APROVAÇÃO",
      value: metrics?.byStatus?.WAITING_APPROVAL ?? metrics?.pendingBudgets ?? 0,
      note: "Decisão do cliente",
      icon: AlertTriangle,
      color: "text-[#ba1a1a] bg-[#ffdad6]",
    },
    {
      label: "EM REPARO",
      value: metrics?.byStatus?.IN_REPAIR ?? 0,
      note: "Bancada ativa",
      icon: Wrench,
      color: "text-[#004ac6] bg-[#dbe1ff]",
    },
    {
      label: "PRONTO P/ RETIRADA",
      value: metrics?.readyForPickup ?? metrics?.byStatus?.READY_FOR_PICKUP ?? 0,
      note: "Aguardando entrega",
      icon: CheckCircle2,
      color: "text-[#08783d] bg-[#c9f5dc]",
    },
  ];

  return (
    <AdminShell active="Dashboard">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#131b2e]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#434655]">
            Monitore em tempo real as métricas operacionais e o fluxo de trabalho da assistência.
          </p>
        </div>
        <Link
          href={ROUTES.admin.newOrder}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003ea8]"
        >
          + Nova Ordem de Serviço
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Carregando indicadores operacionais..." className="py-20" />
      ) : error ? (
        <ErrorState
          title="Falha ao carregar dashboard"
          message={error}
          onRetry={fetchDashboardData}
          className="my-10"
        />
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-5 shadow-sm transition hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold tracking-wider text-[#434655]">
                      {card.label}
                    </p>
                    <span className={`grid h-8 w-8 place-items-center rounded-lg ${card.color}`}>
                      <Icon size={18} />
                    </span>
                  </div>
                  <p className="mt-4 text-4xl font-extrabold tracking-tight text-[#131b2e]">
                    {card.value}
                  </p>
                  <p className="mt-1.5 text-xs text-[#515f74]">{card.note}</p>
                </div>
              );
            })}
          </div>

          {/* Attention Section */}
          <section className="overflow-hidden rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#c3c6d7]/30 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-[#ba1a1a]" />
                <h2 className="text-base font-bold text-[#131b2e]">
                  Ordens que precisam de atenção
                </h2>
              </div>
              <Link
                href={`${ROUTES.admin.orders}?status=WAITING_APPROVAL`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#004ac6] hover:underline"
              >
                Ver todas <ArrowRight size={14} />
              </Link>
            </div>

            {attentionOrders.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Tudo em dia!"
                description="Não há ordens pendentes de aprovação ou em situação crítica no momento."
                className="py-10 border-0"
              />
            ) : (
              <div className="divide-y divide-[#c3c6d7]/20">
                {attentionOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#f8fafc]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#004ac6]">{order.order_number}</span>
                        <StatusBadge tone="amber">Aguardando Aprovação</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[#434655]">
                        Cliente:{" "}
                        <strong className="text-[#131b2e]">
                          {order.customer?.name ?? "Cliente"}
                        </strong>{" "}
                        • Equipamento: {order.equipment?.brand} {order.equipment?.model}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-[#515f74] flex items-center gap-1 justify-end">
                          <Clock size={13} />
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Link
                        href={ROUTES.admin.orderDetail(order.id)}
                        className="rounded-lg border border-[#c3c6d7] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#131b2e] shadow-sm hover:bg-[#f2f3ff]"
                      >
                        Abrir OS
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
