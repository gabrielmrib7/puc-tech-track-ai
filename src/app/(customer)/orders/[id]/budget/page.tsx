"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Info,
  XCircle,
} from "lucide-react";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { apiGet, apiPost } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { formatCurrencyBRL } from "@/shared/utils/formatters";
import type { ServiceOrderWithRelations } from "@/shared/types/api";

export default function CustomerBudgetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<ServiceOrderWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeciding, setIsDeciding] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await apiGet<ServiceOrderWithRelations>(
      ROUTES.api.customerOrderDetail(params.id)
    );

    if (!res.ok) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    setOrder(res.data);
    setIsLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleDecision = async (decision: "approve" | "reject") => {
    if (!order) return;
    setIsDeciding(true);
    setDecisionError(null);

    const res = await apiPost(
      ROUTES.api.serviceOrderBudgetDecision(order.id, decision)
    );

    if (!res.ok) {
      setDecisionError(res.error);
      setIsDeciding(false);
      return;
    }

    setDecisionSuccess(
      decision === "approve"
        ? "Orçamento aprovado com sucesso! A assistência iniciará o reparo em breve."
        : "Orçamento recusado. O status foi atualizado."
    );
    setIsDeciding(false);
    fetchOrder();
  };

  const latestBudget = order?.budgets && order.budgets.length > 0 ? order.budgets[0] : null;
  const isPending = latestBudget?.status === "PENDING" && order?.status === "WAITING_APPROVAL";

  return (
    <main className="min-h-screen bg-[#faf8ff] pb-44 text-[#131b2e]">
      {/* Top Header */}
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

      <div className="mx-auto max-w-lg space-y-5 p-4">
        {isLoading ? (
          <LoadingState message="Carregando informações do orçamento..." className="py-20" />
        ) : error || !order ? (
          <ErrorState
            title="Orçamento não encontrado"
            message={error || "Não foi possível carregar os detalhes deste orçamento."}
            onRetry={fetchOrder}
            className="my-10"
          />
        ) : (
          <>
            {/* Decision Status Banner */}
            {decisionSuccess ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#08783d]/20 bg-[#c9f5dc]/40 p-4 text-sm font-semibold text-[#08783d]">
                <CheckCircle2 size={20} />
                <span>{decisionSuccess}</span>
              </div>
            ) : isPending ? (
              <section className="flex items-start gap-3 rounded-xl border border-[#0073ae]/30 bg-[#0073ae]/10 p-4">
                <AlertTriangle size={20} className="shrink-0 text-[#005a89]" />
                <div>
                  <h2 className="text-sm font-bold text-[#005a89]">Aguardando sua decisão</h2>
                  <p className="mt-0.5 text-xs text-[#434655]">
                    Revise os detalhes abaixo para aprovar ou recusar a realização do serviço.
                  </p>
                </div>
              </section>
            ) : (
              <section className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-100 p-4">
                <Info size={20} className="shrink-0 text-slate-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Orçamento {latestBudget?.status === "APPROVED" ? "Aprovado" : "Finalizado"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Este orçamento já foi processado e sua decisão foi registrada no sistema.
                  </p>
                </div>
              </section>
            )}

            {decisionError && (
              <div className="flex items-center gap-2 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 p-3 text-xs font-semibold text-[#ba1a1a]">
                <XCircle size={16} />
                <span>{decisionError}</span>
              </div>
            )}

            {/* Equipment Context */}
            <div className="rounded-xl border border-[#c3c6d7]/30 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold text-[#004ac6]">{order.order_number}</span>
              <h2 className="mt-1 text-lg font-bold text-[#131b2e]">
                {order.equipment?.brand} {order.equipment?.model}
              </h2>
              <p className="mt-0.5 text-xs text-[#434655]">
                Tipo: {order.equipment?.type} • Defeito relatado: {order.equipment?.reported_problem}
              </p>
            </div>

            {/* Budget Values Breakdown */}
            <section className="rounded-xl border border-[#c3c6d7]/30 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-3">
                <DollarSign size={18} className="text-[#004ac6]" />
                <h3 className="font-bold text-[#131b2e]">Orçamento Detalhado</h3>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#434655]">Descrição do Serviço:</span>
                  <span className="font-medium text-right text-[#131b2e]">
                    {latestBudget?.description || order.diagnosis || "Manutenção técnica"}
                  </span>
                </div>

                {latestBudget?.parts_cost !== undefined && Number(latestBudget.parts_cost) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#434655]">Peças e Componentes:</span>
                    <span className="font-semibold text-[#131b2e]">
                      {formatCurrencyBRL(Number(latestBudget.parts_cost))}
                    </span>
                  </div>
                )}

                {latestBudget?.labor_cost !== undefined && Number(latestBudget.labor_cost) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#434655]">Mão de Obra Especializada:</span>
                    <span className="font-semibold text-[#131b2e]">
                      {formatCurrencyBRL(Number(latestBudget.labor_cost))}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg bg-[#f2f3ff] p-4 text-base font-bold text-[#004ac6]">
                  <span>Valor Total:</span>
                  <span className="text-xl">
                    {formatCurrencyBRL(Number(latestBudget?.amount ?? order.budget_amount ?? 0))}
                  </span>
                </div>
              </div>

              {latestBudget?.notes && (
                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-[#434655]">
                  <strong className="block text-slate-700">Observações do Técnico:</strong>
                  {latestBudget.notes}
                </div>
              )}
            </section>

            {/* Bottom Actions Bar (if pending) */}
            {isPending && !decisionSuccess && (
              <div className="fixed inset-x-0 bottom-0 z-20 space-y-2.5 border-t border-[#c3c6d7]/40 bg-[#faf8ff] p-4 shadow-lg">
                <SubmitButton
                  onClick={() => handleDecision("approve")}
                  isLoading={isDeciding}
                  loadingText="Aprovando..."
                  variant="success"
                  className="w-full py-3.5 text-base"
                >
                  ✓ Aprovar Orçamento
                </SubmitButton>
                <button
                  type="button"
                  disabled={isDeciding}
                  onClick={() => handleDecision("reject")}
                  className="w-full rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] py-3 text-sm font-semibold text-[#93000a] hover:bg-[#ffdad6]/80 disabled:opacity-50"
                >
                  ✕ Recusar Orçamento
                </button>
                <p className="text-center text-[11px] text-[#737686]">
                  *A aprovação autoriza o início imediato do serviço.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
