"use client";

import React, { useState } from "react";
import { Sparkles, Check, AlertCircle, RefreshCw, Wrench } from "lucide-react";
import { AiEstimateResponse } from "../domain/schemas";
import { formatCurrencyBRL } from "@/shared/utils/formatters";

interface AiDiagnosisCardProps {
  equipmentType: string;
  brand: string;
  model: string;
  reportedDefect: string;
  onApplySuggestion: (suggestionText: string, costMin?: number, costMax?: number) => void;
}

export function AiDiagnosisCard({
  equipmentType,
  brand,
  model,
  reportedDefect,
  onApplySuggestion,
}: AiDiagnosisCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<AiEstimateResponse | null>(null);
  const [applied, setApplied] = useState(false);

  const canRequest =
    Boolean(equipmentType?.trim()) &&
    Boolean(brand?.trim()) &&
    Boolean(model?.trim()) &&
    Boolean(reportedDefect?.trim() && reportedDefect.trim().length >= 3);

  async function handleFetchEstimate() {
    if (!canRequest) return;
    setLoading(true);
    setError(null);
    setApplied(false);

    try {
      const res = await fetch("/api/v1/ai/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment_type: equipmentType,
          brand,
          model,
          reported_defect: reportedDefect,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Não foi possível obter a estimativa da IA.");
      }

      const data: AiEstimateResponse = await res.json();
      setEstimate(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro de conexão ao solicitar estimativa.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!estimate) return;
    const partsText =
      estimate.suggested_parts.length > 0
        ? `\nPeças sugeridas: ${estimate.suggested_parts.join(", ")}`
        : "";
    const fullText = `[Pré-Diagnóstico IA - Complexidade ${estimate.complexity}]\n${estimate.probable_defect}${partsText}\nEstimativa prévia de custos: ${formatCurrencyBRL(estimate.estimated_cost_min)} a ${formatCurrencyBRL(estimate.estimated_cost_max)}`;

    onApplySuggestion(fullText, estimate.estimated_cost_min, estimate.estimated_cost_max);
    setApplied(true);
  }

  const complexityBadge = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-rose-50 text-rose-700 border-rose-200",
  }[estimate?.complexity || "MEDIUM"];

  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Assistente Técnico de IA
            </h4>
            <p className="text-xs text-slate-500">
              Tecnologia de Fronteira: Sugestão de pré-diagnóstico, peças e custos em BRL
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFetchEstimate}
          disabled={!canRequest || loading}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
            canRequest && !loading
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Obter Pré-Diagnóstico com IA
            </>
          )}
        </button>
      </div>

      {!canRequest && !estimate && !loading && (
        <p className="mt-2 text-xs text-slate-400">
          * Preencha o tipo de aparelho, marca, modelo e defeito relatado para ativar o assistente.
        </p>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={handleFetchEstimate}
            className="ml-auto underline font-medium hover:text-red-900"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {estimate && (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${complexityBadge}`}
              >
                Complexidade {estimate.complexity}
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                {Math.round(estimate.confidence_score * 100)}% de confiança
              </span>
            </div>

            <span className="text-[11px] font-medium text-slate-400">
              {estimate.provider_source === "ai_generative"
                ? "✨ IA Generativa (Online)"
                : "⚙️ Catálogo Técnico Heurístico"}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Diagnóstico Provável:
            </span>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {estimate.probable_defect}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <span className="text-xs font-medium text-slate-500">
                Faixa Estimada de Custo:
              </span>
              <p className="text-sm font-bold text-blue-700">
                {formatCurrencyBRL(estimate.estimated_cost_min)} —{" "}
                {formatCurrencyBRL(estimate.estimated_cost_max)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5">
              <span className="text-xs font-medium text-slate-500">
                Componentes Sugeridos:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {estimate.suggested_parts.map((part, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200"
                  >
                    <Wrench className="h-2.5 w-2.5 text-slate-400" />
                    {part}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleApply}
              disabled={applied}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
                applied
                  ? "bg-emerald-100 text-emerald-800 cursor-default"
                  : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              {applied ? "Sugestão Aplicada" : "Aplicar Sugestão no Laudo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
