"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Wrench, ArrowLeft, AlertCircle } from "lucide-react";
import { AdminShell } from "@/shared/components/AdminShell";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { apiGet, apiPost } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import type { Customer, Equipment, PaginatedResponse, ServiceOrder } from "@/shared/types/api";

export default function NewServiceOrderPage() {
  const router = useRouter();

  // Data sources
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form Fields
  const [customerId, setCustomerId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial customers
  useEffect(() => {
    async function loadCustomers() {
      setIsLoadingData(true);
      const res = await apiGet<PaginatedResponse<Customer>>(
        `${ROUTES.api.customers}?limit=100`
      );
      if (res.ok) {
        setCustomers(res.data.items);
      }
      setIsLoadingData(false);
    }
    loadCustomers();
  }, []);

  // Fetch equipment when customerId changes
  const loadEquipmentForCustomer = useCallback(async (selectedId: string) => {
    if (!selectedId) {
      setEquipmentList([]);
      setEquipmentId("");
      return;
    }

    const res = await apiGet<{ items: Equipment[] }>(
      `${ROUTES.api.equipment}?customerId=${selectedId}`
    );

    if (res.ok) {
      setEquipmentList(res.data.items);
      if (res.data.items.length > 0) {
        setEquipmentId(res.data.items[0].id);
      } else {
        setEquipmentId("");
      }
    }
  }, []);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCustomerId(val);
    loadEquipmentForCustomer(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerId) {
      setErrorMessage("Por favor, selecione um cliente.");
      return;
    }
    if (!equipmentId) {
      setErrorMessage("Por favor, selecione um equipamento cadastrado para este cliente.");
      return;
    }
    if (diagnosis.trim().length < 3) {
      setErrorMessage("O laudo ou problema inicial deve ter pelo menos 3 caracteres.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customerId,
      equipmentId,
      diagnosis: diagnosis.trim(),
      estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion).toISOString() : undefined,
    };

    const res = await apiPost<ServiceOrder>(ROUTES.api.serviceOrders, payload);

    if (!res.ok) {
      setErrorMessage(res.error);
      setIsSubmitting(false);
      return;
    }

    // Success: redirect to order detail page
    router.push(ROUTES.admin.orderDetail(res.data.id));
  };

  return (
    <AdminShell active="Ordens de Serviço">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={ROUTES.admin.orders}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#004ac6] hover:underline"
            >
              <ArrowLeft size={14} /> Voltar para Ordens
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#131b2e]">
            Nova Ordem de Serviço
          </h1>
          <p className="mt-1 text-sm text-[#434655]">
            Registre a entrada do equipamento na assistência e inicie a triagem técnica.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#004ac6]/20 bg-[#dbe1ff]/60 px-4 py-1.5 text-xs font-bold text-[#004ac6]">
          <span className="h-2 w-2 rounded-full bg-[#004ac6]" />
          STATUS INICIAL: RECEBIDO
        </span>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/30 p-4 text-sm font-semibold text-[#ba1a1a]">
          <AlertCircle size={20} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm md:p-8"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#434655]">
              Cliente *
            </label>
            <select
              required
              value={customerId}
              onChange={handleCustomerChange}
              disabled={isLoadingData || isSubmitting}
              className="mt-2 h-11 w-full rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6] disabled:opacity-60"
            >
              <option value="">Selecione um cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            {customers.length === 0 && !isLoadingData && (
              <p className="mt-1.5 text-xs text-[#ba1a1a]">
                Nenhum cliente cadastrado.{" "}
                <Link href={ROUTES.admin.customers} className="underline">
                  Cadastrar cliente primeiro.
                </Link>
              </p>
            )}
          </div>

          {/* Equipment Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#434655]">
              Equipamento *
            </label>
            <select
              required
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              disabled={!customerId || equipmentList.length === 0 || isSubmitting}
              className="mt-2 h-11 w-full rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6] disabled:opacity-60"
            >
              {!customerId ? (
                <option value="">Selecione um cliente primeiro...</option>
              ) : equipmentList.length === 0 ? (
                <option value="">Nenhum equipamento cadastrado para este cliente</option>
              ) : (
                equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.type} — {eq.brand} {eq.model} {eq.serial_number ? `(SN: ${eq.serial_number})` : ""}
                  </option>
                ))
              )}
            </select>
            {customerId && equipmentList.length === 0 && (
              <p className="mt-1.5 text-xs text-[#ba1a1a]">
                Este cliente não possui equipamentos.{" "}
                <Link href={ROUTES.admin.equipment} className="underline">
                  Cadastrar equipamento agora.
                </Link>
              </p>
            )}
          </div>

          {/* Diagnosis / Problem description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#434655]">
              Problema Relatado / Laudo de Entrada *
            </label>
            <textarea
              required
              rows={4}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={isSubmitting}
              placeholder="Descreva detalhadamente os sintomas reportados pelo cliente e observações preliminares..."
              className="mt-2 w-full rounded-lg border border-[#c3c6d7] bg-white p-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6] disabled:opacity-60"
            />
          </div>

          {/* Estimated Completion Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#434655]">
              Previsão de Conclusão (Opcional)
            </label>
            <input
              type="date"
              value={estimatedCompletion}
              onChange={(e) => setEstimatedCompletion(e.target.value)}
              disabled={isSubmitting}
              className="mt-2 h-11 w-full rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6] disabled:opacity-60"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3 border-t border-[#c3c6d7]/30 pt-6">
          <Link
            href={ROUTES.admin.orders}
            className="rounded-lg border border-[#c3c6d7] bg-white px-5 py-2.5 text-sm font-semibold text-[#515f74] hover:bg-[#f2f3ff]"
          >
            Cancelar
          </Link>
          <SubmitButton
            isLoading={isSubmitting}
            loadingText="Gerando Ordem de Serviço..."
            disabled={!customerId || !equipmentId || diagnosis.trim().length < 3}
          >
            <PlusCircle size={18} />
            Criar Ordem de Serviço
          </SubmitButton>
        </div>
      </form>
    </AdminShell>
  );
}
