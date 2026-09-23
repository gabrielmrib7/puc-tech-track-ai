"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Plus, Filter, ArrowUpDown } from "lucide-react";
import { AdminShell, StatusBadge } from "@/shared/components/AdminShell";
import { LoadingState, SkeletonRow } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { apiGet } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { humanizeStatus } from "@/modules/service-orders/presentation/customer/timeline";
import { formatLocalDate } from "@/shared/utils/formatters";
import type { PaginatedResponse, ServiceOrderWithRelations, OrderStatus } from "@/shared/types/api";

const STATUS_OPTIONS: Array<{ value: OrderStatus | ""; label: string }> = [
  { value: "", label: "Todos os Status" },
  { value: "RECEIVED", label: "Recebido" },
  { value: "WAITING_DIAGNOSIS", label: "Aguardando diagnóstico" },
  { value: "IN_DIAGNOSIS", label: "Em diagnóstico" },
  { value: "WAITING_APPROVAL", label: "Aguardando aprovação" },
  { value: "APPROVED", label: "Orçamento aprovado" },
  { value: "REJECTED", label: "Orçamento recusado" },
  { value: "IN_REPAIR", label: "Em reparo" },
  { value: "COMPLETED", label: "Reparo concluído" },
  { value: "READY_FOR_PICKUP", label: "Pronto para retirada" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
];

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

export default function ServiceOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentQuery = searchParams.get("query") ?? "";
  const currentPage = Math.max(Number(searchParams.get("page") ?? 1), 1);

  const [searchInput, setSearchInput] = useState(currentQuery);
  const [data, setData] = useState<PaginatedResponse<ServiceOrderWithRelations> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (currentStatus) params.set("status", currentStatus);
    if (currentQuery) params.set("query", currentQuery);
    params.set("page", String(currentPage));
    params.set("limit", "10");

    const res = await apiGet<PaginatedResponse<ServiceOrderWithRelations>>(
      `${ROUTES.api.serviceOrders}?${params.toString()}`
    );

    if (!res.ok) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    setData(res.data);
    setIsLoading(false);
  }, [currentStatus, currentQuery, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateFilters = (newStatus?: string, newQuery?: string, newPage?: number) => {
    const params = new URLSearchParams();
    const status = newStatus !== undefined ? newStatus : currentStatus;
    const query = newQuery !== undefined ? newQuery : currentQuery;
    const page = newPage !== undefined ? newPage : 1;

    if (status) params.set("status", status);
    if (query) params.set("query", query);
    if (page > 1) params.set("page", String(page));

    router.push(`${ROUTES.admin.orders}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, searchInput.trim(), 1);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <AdminShell active="Ordens de Serviço">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#131b2e]">
            Ordens de Serviço
          </h1>
          <p className="mt-1 text-sm text-[#434655]">
            Gerencie o ciclo completo de reparos, diagnósticos e entrega.
          </p>
        </div>
        <Link
          href={ROUTES.admin.newOrder}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003ea8]"
        >
          <Plus size={18} />
          Nova Ordem
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-4 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-[#434655]">
              Filtrar por Status
            </label>
            <select
              value={currentStatus}
              onChange={(e) => updateFilters(e.target.value, undefined, 1)}
              className="mt-1.5 h-10 w-full rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-[#434655]">
              Buscar por Número da OS ou Cliente
            </label>
            <div className="relative mt-1.5">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: OS-2026-000001 ou Maria..."
                className="h-10 w-full rounded-lg border border-[#c3c6d7] bg-white pl-9 pr-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#2563eb]/10 px-4 text-sm font-semibold text-[#004ac6] hover:bg-[#2563eb]/20"
            >
              <Filter size={15} />
              Filtrar
            </button>
            {(currentStatus || currentQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  router.push(ROUTES.admin.orders);
                }}
                className="h-10 rounded-lg border border-[#c3c6d7] px-3 text-xs font-semibold text-[#515f74] hover:bg-[#f2f3ff]"
              >
                Limpar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Orders Table Container */}
      <div className="overflow-hidden rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] shadow-sm">
        {error ? (
          <ErrorState
            title="Não foi possível carregar as ordens"
            message={error}
            onRetry={fetchOrders}
            className="my-6"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-[#c3c6d7]/30 bg-[#f2f3ff] text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                  <tr>
                    <th className="px-5 py-3.5">Número da OS</th>
                    <th className="px-5 py-3.5">Cliente</th>
                    <th className="px-5 py-3.5">Equipamento</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Data de Entrada</th>
                    <th className="px-5 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d7]/20">
                  {isLoading ? (
                    <>
                      <SkeletonRow cols={6} />
                      <SkeletonRow cols={6} />
                      <SkeletonRow cols={6} />
                    </>
                  ) : !data || data.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <EmptyState
                          title="Nenhuma ordem de serviço encontrada"
                          description={
                            currentStatus || currentQuery
                              ? "Nenhuma ordem coincide com os filtros aplicados. Tente alterar os termos de busca."
                              : "Nenhuma ordem de serviço foi registrada ainda."
                          }
                          action={
                            <Link
                              href={ROUTES.admin.newOrder}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#003ea8]"
                            >
                              <Plus size={15} /> Cadastrar Nova Ordem
                            </Link>
                          }
                          className="border-0"
                        />
                      </td>
                    </tr>
                  ) : (
                    data.items.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-[#f8fafc]"
                      >
                        <td className="px-5 py-4 font-bold text-[#004ac6]">
                          <Link
                            href={ROUTES.admin.orderDetail(order.id)}
                            className="hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#131b2e]">
                          {order.customer?.name ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-[#434655]">
                          {order.equipment?.brand} {order.equipment?.model}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={getBadgeTone(order.status)}>
                            {humanizeStatus(order.status)}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-4 text-xs text-[#515f74]">
                          {formatLocalDate(order.created_at)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={ROUTES.admin.orderDetail(order.id)}
                            className="inline-block rounded-lg border border-[#c3c6d7] bg-white px-3 py-1.5 text-xs font-semibold text-[#131b2e] shadow-sm hover:bg-[#f2f3ff]"
                          >
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {data && data.total > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-[#c3c6d7]/30 px-6 py-4 text-xs text-[#434655] sm:flex-row">
                <span>
                  Mostrando{" "}
                  <strong>
                    {Math.min((data.page - 1) * data.limit + 1, data.total)}
                  </strong>{" "}
                  a{" "}
                  <strong>
                    {Math.min(data.page * data.limit, data.total)}
                  </strong>{" "}
                  de <strong>{data.total}</strong> ordens
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={data.page <= 1}
                    onClick={() => updateFilters(undefined, undefined, data.page - 1)}
                    className="rounded-lg border border-[#c3c6d7] bg-white px-3 py-1.5 font-semibold text-[#131b2e] hover:bg-[#f2f3ff] disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="px-2 font-medium">
                    Página {data.page} de {Math.max(totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    disabled={data.page >= totalPages}
                    onClick={() => updateFilters(undefined, undefined, data.page + 1)}
                    className="rounded-lg border border-[#c3c6d7] bg-white px-3 py-1.5 font-semibold text-[#131b2e] hover:bg-[#f2f3ff] disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
