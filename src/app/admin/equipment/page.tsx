"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Boxes, Laptop, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/shared/components/AdminShell";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { apiGet, apiPost } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { formatLocalDate } from "@/shared/utils/formatters";
import type { Customer, Equipment, PaginatedResponse } from "@/shared/types/api";

export default function EquipmentPage() {
  // Customer selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");

  // Equipment list for selected customer
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);

  // New Equipment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [type, setType] = useState("Notebook");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [reportedProblem, setReportedProblem] = useState("");
  const [accessories, setAccessories] = useState("");

  // Fetch Customers for selector
  const fetchCustomers = useCallback(async (query = "") => {
    const res = await apiGet<PaginatedResponse<Customer>>(
      `${ROUTES.api.customers}?query=${encodeURIComponent(query)}&limit=50`
    );
    if (res.ok) {
      setCustomers(res.data.items);
      if (!selectedCustomerId && res.data.items.length > 0) {
        setSelectedCustomerId(res.data.items[0].id);
      }
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch Equipment for selected customer
  const fetchEquipment = useCallback(async (customerId: string) => {
    if (!customerId) {
      setEquipmentList([]);
      return;
    }

    setIsLoadingEquipment(true);
    setEquipmentError(null);

    const res = await apiGet<{ items: Equipment[] }>(
      `${ROUTES.api.equipment}?customerId=${customerId}`
    );

    if (!res.ok) {
      setEquipmentError(res.error);
      setIsLoadingEquipment(false);
      return;
    }

    setEquipmentList(res.data.items);
    setIsLoadingEquipment(false);
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchEquipment(selectedCustomerId);
    }
  }, [selectedCustomerId, fetchEquipment]);

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setFormError("Por favor, selecione um cliente.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    const payload = {
      customerId: selectedCustomerId,
      type: type.trim(),
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim() ? serialNumber.trim().toUpperCase() : undefined,
      reportedProblem: reportedProblem.trim(),
      accessories: accessories.trim() ? accessories.trim() : undefined,
    };

    const res = await apiPost<Equipment>(ROUTES.api.equipment, payload);

    if (!res.ok) {
      setFormError(res.error);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(`Equipamento "${res.data.brand} ${res.data.model}" cadastrado com sucesso!`);
    setIsSubmitting(false);
    setIsModalOpen(false);

    // Reset Form fields
    setBrand("");
    setModel("");
    setSerialNumber("");
    setReportedProblem("");
    setAccessories("");

    // Refresh equipment list
    fetchEquipment(selectedCustomerId);
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <AdminShell active="Equipamentos">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#131b2e]">Equipamentos</h1>
          <p className="mt-1 text-sm text-[#434655]">
            Gerencie o parque de equipamentos vinculados a cada cliente.
          </p>
        </div>
        <button
          type="button"
          disabled={!selectedCustomerId}
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003ea8] disabled:opacity-50"
        >
          <Plus size={18} />
          Cadastrar Equipamento
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#08783d]/20 bg-[#c9f5dc]/30 p-4 text-sm font-medium text-[#08783d]">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Customer Scoping Bar */}
      <div className="mb-6 rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-5 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#434655]">
          Selecione o Cliente para Visualizar Equipamentos:
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm font-medium text-[#131b2e] outline-none focus:border-[#004ac6]"
          >
            {customers.length === 0 ? (
              <option value="">Nenhum cliente disponível</option>
            ) : (
              customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email} ({c.phone})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="overflow-hidden rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] shadow-sm">
        {!selectedCustomerId ? (
          <EmptyState
            icon={Boxes}
            title="Selecione um cliente"
            description="Escolha um cliente acima para listar e registrar seus equipamentos."
            className="my-10 border-0"
          />
        ) : isLoadingEquipment ? (
          <LoadingState message="Carregando equipamentos do cliente..." className="py-16" />
        ) : equipmentError ? (
          <ErrorState
            title="Falha ao carregar equipamentos"
            message={equipmentError}
            onRetry={() => fetchEquipment(selectedCustomerId)}
            className="my-6"
          />
        ) : equipmentList.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="Nenhum equipamento cadastrado"
            description={`O cliente ${selectedCustomer?.name} ainda não possui nenhum equipamento vinculado.`}
            action={
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#003ea8]"
              >
                <Plus size={15} /> Cadastrar Equipamento
              </button>
            }
            className="my-8 border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-[#c3c6d7]/30 bg-[#f2f3ff] text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                <tr>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Marca / Modelo</th>
                  <th className="px-5 py-3.5">Número de Série</th>
                  <th className="px-5 py-3.5">Problema Relatado</th>
                  <th className="px-5 py-3.5">Acessórios</th>
                  <th className="px-5 py-3.5">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d7]/20">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="transition hover:bg-[#f8fafc]">
                    <td className="px-5 py-4 font-semibold text-[#004ac6]">{eq.type}</td>
                    <td className="px-5 py-4 font-bold text-[#131b2e]">
                      {eq.brand} {eq.model}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-[#515f74]">
                      {eq.serial_number || "—"}
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-[#434655]">
                      {eq.reported_problem}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#737686]">
                      {eq.accessories || "Nenhum"}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#515f74]">
                      {formatLocalDate(eq.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Equipment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#c3c6d7]/30 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563eb]/10 text-[#004ac6]">
                <Boxes size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Novo Equipamento</h3>
                <p className="text-xs text-[#515f74]">
                  Vinculando ao cliente: <strong>{selectedCustomer?.name}</strong>
                </p>
              </div>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg bg-[#ffdad6]/40 p-3 text-xs font-semibold text-[#ba1a1a]">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateEquipment} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#434655]">Tipo do Aparelho *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                  >
                    <option value="Notebook">Notebook</option>
                    <option value="Desktop">Desktop / PC</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Servidor">Servidor</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434655]">Marca *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Dell, Apple, Samsung"
                    className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#434655]">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ex: Inspiron 15, iPhone 13"
                    className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434655]">
                    Número de Série (Opcional)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Ex: SN-123456"
                    className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm font-mono text-[#131b2e] outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434655]">
                  Defeito / Problema Relatado *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportedProblem}
                  onChange={(e) => setReportedProblem(e.target.value)}
                  placeholder="Descreva o sintoma ou defeito reportado..."
                  className="mt-1 w-full rounded-lg border border-[#c3c6d7] p-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434655]">
                  Acessórios Entregues (Opcional)
                </label>
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="Ex: Carregador, cabo USB, capa protetora"
                  className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[#c3c6d7]/30 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74] hover:bg-[#f2f3ff]"
                >
                  Cancelar
                </button>
                <SubmitButton isLoading={isSubmitting} loadingText="Cadastrando...">
                  Salvar Equipamento
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

