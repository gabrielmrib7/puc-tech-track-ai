"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Laptop,
  Truck,
  User,
  Wrench,
  AlertTriangle,
  Send,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { AdminShell, StatusBadge } from "@/shared/components/AdminShell";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { humanizeStatus } from "@/modules/service-orders/presentation/customer/timeline";
import { formatCurrencyBRL, formatLocalDateTime } from "@/shared/utils/formatters";
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

function getBudgetBadgeTone(status: string): "blue" | "amber" | "green" | "red" {
  switch (status) {
    case "PENDING":
      return "amber";
    case "APPROVED":
      return "green";
    case "REJECTED":
      return "red";
    default:
      return "blue";
  }
}

export default function ServiceOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<ServiceOrderWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action Modals State
  const [activeModal, setActiveModal] = useState<
    "diagnosis" | "budget" | "deliver" | "edit-intake" | "cancel" | "edit-budget" | "delete-budget" | null
  >(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Diagnosis / Intake Form
  const [diagnosisText, setDiagnosisText] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  // Cancel Form
  const [cancelReason, setCancelReason] = useState("");

  // Budget Form
  const [budgetDescription, setBudgetDescription] = useState("");
  const [partsCost, setPartsCost] = useState("0");
  const [laborCost, setLaborCost] = useState("0");
  const [budgetNotes, setBudgetNotes] = useState("");

  // Deliver Form
  const [recipientName, setRecipientName] = useState("");
  const [recipientDocument, setRecipientDocument] = useState("");

  const fetchOrderDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const res = await apiGet<ServiceOrderWithRelations>(
      ROUTES.api.serviceOrderDetail(params.id)
    );

    if (!res.ok) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    setOrder(res.data);
    setDiagnosisText(res.data.diagnosis || "");
    if (res.data.estimated_completion) {
      setCompletionDate(new Date(res.data.estimated_completion).toISOString().split("T")[0]);
    } else {
      setCompletionDate("");
    }

    if (res.data.budgets && res.data.budgets.length > 0) {
      const b = res.data.budgets[0];
      setBudgetDescription(b.description || "");
      setPartsCost(String(b.parts_cost || 0));
      setLaborCost(String(b.labor_cost || 0));
      setBudgetNotes(b.notes || "");
    }

    setIsLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Status transition handler
  const handleTransition = async (nextStatus: OrderStatus, description?: string) => {
    if (!order) return;
    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiPatch(ROUTES.api.serviceOrderStatus(order.id), {
      status: nextStatus,
      description: description || `Status alterado para ${humanizeStatus(nextStatus)}`,
    });

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    fetchOrderDetail();
  };

  // Submit Technical Diagnosis
  const handleDiagnosisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiPost(ROUTES.api.serviceOrderDiagnosis(order.id), {
      diagnosis: diagnosisText.trim(),
      estimatedCompletion: completionDate ? new Date(completionDate).toISOString() : undefined,
    });

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    setActiveModal(null);
    fetchOrderDetail();
  };

  // Open Budget Modals
  const openNewBudgetModal = () => {
    setBudgetDescription(order?.diagnosis || "");
    setPartsCost("0");
    setLaborCost("0");
    setBudgetNotes("");
    setActionError(null);
    setActiveModal("budget");
  };

  const openEditBudgetModal = () => {
    if (order?.budgets && order.budgets.length > 0) {
      const b = order.budgets[0];
      setBudgetDescription(b.description || "");
      setPartsCost(String(b.parts_cost ?? 0));
      setLaborCost(String(b.labor_cost ?? 0));
      setBudgetNotes(b.notes || "");
    }
    setActionError(null);
    setActiveModal("edit-budget");
  };

  const openDeleteBudgetModal = () => {
    setActionError(null);
    setActiveModal("delete-budget");
  };

  // Submit Budget Create
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiPost(ROUTES.api.serviceOrderBudget(order.id), {
      description: budgetDescription.trim(),
      partsCost: parseFloat(partsCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
      notes: budgetNotes.trim() || undefined,
    });

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    setActiveModal(null);
    fetchOrderDetail();
  };

  // Submit Budget Edit
  const handleBudgetEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiPatch(ROUTES.api.serviceOrderBudget(order.id), {
      description: budgetDescription.trim(),
      partsCost: parseFloat(partsCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
      notes: budgetNotes.trim() || undefined,
    });

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    setActiveModal(null);
    fetchOrderDetail();
  };

  // Submit Budget Delete
  const handleBudgetDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiDelete(ROUTES.api.serviceOrderBudget(order.id));

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    setActiveModal(null);
    fetchOrderDetail();
  };

  // Submit Deliver
  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiPost(ROUTES.api.serviceOrderDeliver(order.id), {
      recipientName: recipientName.trim(),
      recipientDocument: recipientDocument.trim(),
    });

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    setActiveModal(null);
    fetchOrderDetail();
  };

  // Submit Pre-Diagnosis Intake Edit
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiPatch<ServiceOrderWithRelations>(
      ROUTES.api.serviceOrderDetail(order.id),
      {
        diagnosis: diagnosisText.trim(),
        estimatedCompletion: completionDate ? new Date(completionDate).toISOString() : null,
      }
    );

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    setActiveModal(null);
    fetchOrderDetail();
  };

  // Submit Order Cancellation
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const res = await apiDelete<{ success: boolean; status: OrderStatus }>(
      ROUTES.api.serviceOrderDetail(order.id),
      { reason: cancelReason.trim() || undefined }
    );

    if (!res.ok) {
      setActionError(res.error);
      setIsSubmittingAction(false);
      return;
    }

    setIsSubmittingAction(false);
    setActiveModal(null);
    setCancelReason("");
    fetchOrderDetail();
  };

  const isTerminal = order?.status === "DELIVERED" || order?.status === "CANCELLED";

  return (
    <AdminShell active="Ordens de Serviço">
      {/* Header Breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={ROUTES.admin.orders}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004ac6] hover:underline"
        >
          <ArrowLeft size={15} /> Voltar para Ordens
        </Link>
        {order && (
          <span className="font-mono text-xs text-[#515f74]">ID: {order.id}</span>
        )}
      </div>

      {isLoading ? (
        <LoadingState message="Carregando detalhes da ordem de serviço..." className="py-24" />
      ) : error || !order ? (
        <ErrorState
          title="Ordem não encontrada"
          message={error || "Não foi possível localizar os dados desta ordem de serviço."}
          onRetry={fetchOrderDetail}
          className="my-12"
        />
      ) : (
        <>
          {/* Order Title and Status Bar */}
          <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#004ac6]">
                  {order.order_number}
                </h1>
                <StatusBadge tone={getBadgeTone(order.status)}>
                  {humanizeStatus(order.status)}
                </StatusBadge>
              </div>
              <p className="mt-1 text-sm text-[#434655]">
                Entrada registrada em {formatLocalDateTime(order.created_at)}
              </p>
            </div>

            {/* Quick Transition Action Buttons */}
            {!isTerminal && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Pre-diagnosis intake edit button */}
                {(order.status === "RECEIVED" || order.status === "WAITING_DIAGNOSIS") && (
                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setDiagnosisText(order.diagnosis || "");
                      setCompletionDate(
                        order.estimated_completion
                          ? new Date(order.estimated_completion).toISOString().split("T")[0]
                          : ""
                      );
                      setActiveModal("edit-intake");
                    }}
                    className="rounded-lg border border-[#004ac6] bg-white px-3.5 py-2 text-xs font-bold text-[#004ac6] shadow-sm hover:bg-[#f2f3ff]"
                  >
                    Editar Dados de Entrada
                  </button>
                )}

                {order.status === "RECEIVED" && (
                  <button
                    type="button"
                    onClick={() => handleTransition("WAITING_DIAGNOSIS")}
                    className="rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003ea8]"
                  >
                    Encaminhar para Diagnóstico
                  </button>
                )}

                {order.status === "WAITING_DIAGNOSIS" && (
                  <button
                    type="button"
                    onClick={() => handleTransition("IN_DIAGNOSIS")}
                    className="rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003ea8]"
                  >
                    Iniciar Diagnóstico Técnico
                  </button>
                )}

                {order.status === "IN_DIAGNOSIS" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setActiveModal("diagnosis");
                      }}
                      className="rounded-lg border border-[#c3c6d7] bg-white px-3.5 py-2 text-xs font-bold text-[#131b2e] hover:bg-[#f2f3ff]"
                    >
                      Editar Laudo
                    </button>
                    <button
                      type="button"
                      onClick={openNewBudgetModal}
                      className="rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003ea8]"
                    >
                      Emitir Orçamento
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransition("IN_REPAIR", "Reparo aprovado sem custo / garantia")}
                      className="rounded-lg bg-[#16a34a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#15803d]"
                    >
                      Reparo Direto (Garantia)
                    </button>
                  </>
                )}

                {order.status === "WAITING_APPROVAL" && (!order.budgets || order.budgets.length === 0) && (
                  <button
                    type="button"
                    onClick={openNewBudgetModal}
                    className="flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#003ea8]"
                  >
                    <DollarSign size={15} /> Emitir Orçamento
                  </button>
                )}

                {order.status === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => handleTransition("IN_REPAIR")}
                    className="rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003ea8]"
                  >
                    Iniciar Execução do Reparo
                  </button>
                )}

                {order.status === "IN_REPAIR" && (
                  <button
                    type="button"
                    onClick={() => handleTransition("COMPLETED")}
                    className="rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-bold text-white hover:bg-[#003ea8]"
                  >
                    Concluir Reparo
                  </button>
                )}

                {order.status === "COMPLETED" && (
                  <button
                    type="button"
                    onClick={() => handleTransition("READY_FOR_PICKUP")}
                    className="rounded-lg bg-[#16a34a] px-4 py-2 text-xs font-bold text-white hover:bg-[#15803d]"
                  >
                    Marcar Pronto p/ Retirada
                  </button>
                )}

                {order.status === "READY_FOR_PICKUP" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setRecipientName(order.customer?.name || "");
                      setActiveModal("deliver");
                    }}
                    className="rounded-lg bg-[#16a34a] px-4 py-2 text-xs font-bold text-white hover:bg-[#15803d]"
                  >
                    Registrar Entrega
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActionError(null);
                    setCancelReason("");
                    setActiveModal("cancel");
                  }}
                  className="rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6]/20 px-3 py-2 text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]"
                >
                  Cancelar OS
                </button>
              </div>
            )}
          </div>

          {actionError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 p-4 text-xs font-bold text-[#ba1a1a]">
              <AlertTriangle size={16} />
              <span>{actionError}</span>
            </div>
          )}

          {isTerminal && (
            <div
              className={`mb-8 rounded-xl border p-4 text-sm font-semibold shadow-sm ${
                order.status === "DELIVERED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              ● Esta ordem de serviço atingiu o estado final ({humanizeStatus(order.status)}) e é imutável.
            </div>
          )}

          {/* Details Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Customer & Equipment Cards */}
            <div className="space-y-6 lg:col-span-1">
              {/* Customer Card */}
              <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-3">
                  <User size={18} className="text-[#004ac6]" />
                  <h3 className="font-bold text-[#131b2e]">Dados do Cliente</h3>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-bold text-[#131b2e]">{order.customer?.name}</p>
                  <p className="text-xs text-[#434655]">E-mail: {order.customer?.email}</p>
                  <p className="text-xs text-[#434655]">Telefone: {order.customer?.phone}</p>
                  {order.customer?.document && (
                    <p className="text-xs font-mono text-[#515f74]">
                      Doc: {order.customer.document}
                    </p>
                  )}
                </div>
              </div>

              {/* Equipment Card */}
              <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-3">
                  <Laptop size={18} className="text-[#004ac6]" />
                  <h3 className="font-bold text-[#131b2e]">Equipamento</h3>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-bold text-[#131b2e]">
                    {order.equipment?.brand} {order.equipment?.model}
                  </p>
                  <p className="text-xs text-[#434655]">Tipo: {order.equipment?.type}</p>
                  <p className="text-xs font-mono text-[#515f74]">
                    Série: {order.equipment?.serial_number || "Não informado"}
                  </p>
                  <p className="text-xs text-[#434655]">
                    Acessórios: {order.equipment?.accessories || "Nenhum"}
                  </p>
                </div>
              </div>

              {/* Budget Card */}
              {order.budgets && order.budgets.length > 0 && (
                <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#c3c6d7]/30 pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign size={18} className="text-[#16a34a]" />
                      <h3 className="font-bold text-[#131b2e]">Orçamento</h3>
                    </div>
                    <StatusBadge tone={getBudgetBadgeTone(order.budgets[0].status)}>
                      {order.budgets[0].status === "PENDING"
                        ? "Pendente"
                        : order.budgets[0].status === "APPROVED"
                        ? "Aprovado"
                        : order.budgets[0].status === "REJECTED"
                        ? "Recusado"
                        : order.budgets[0].status}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {order.budgets[0].description && (
                      <p className="text-xs font-medium text-[#434655]">
                        {order.budgets[0].description}
                      </p>
                    )}
                    <div className="flex justify-between border-t border-[#c3c6d7]/20 pt-2">
                      <span className="text-xs text-[#434655]">Peças:</span>
                      <span className="text-xs font-semibold">
                        {formatCurrencyBRL(Number(order.budgets[0].parts_cost || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#434655]">Mão de Obra:</span>
                      <span className="text-xs font-semibold">
                        {formatCurrencyBRL(Number(order.budgets[0].labor_cost || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#c3c6d7]/20 pt-2 text-base font-bold text-[#004ac6]">
                      <span>Total:</span>
                      <span>{formatCurrencyBRL(Number(order.budgets[0].amount))}</span>
                    </div>
                    {order.budgets[0].notes && (
                      <div className="mt-2 rounded-lg bg-[#f2f3ff] p-2 text-xs text-[#434655]">
                        <span className="font-semibold text-[#131b2e]">Obs: </span>
                        {order.budgets[0].notes}
                      </div>
                    )}

                    {/* Pending Budget Actions */}
                    {order.budgets[0].status === "PENDING" && !isTerminal && (
                      <div className="mt-4 flex gap-2 border-t border-[#c3c6d7]/20 pt-3">
                        <button
                          type="button"
                          onClick={openEditBudgetModal}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#c3c6d7] bg-white py-1.5 text-xs font-semibold text-[#004ac6] hover:bg-[#f2f3ff]"
                        >
                          <Pencil size={13} /> Editar Orçamento
                        </button>
                        <button
                          type="button"
                          onClick={openDeleteBudgetModal}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6]/20 px-3 py-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]"
                        >
                          <Trash2 size={13} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis & Timeline */}
            <div className="space-y-6 lg:col-span-2">
              {/* Technical Diagnosis */}
              <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#c3c6d7]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench size={18} className="text-[#004ac6]" />
                    <h3 className="font-bold text-[#131b2e]">Laudo Técnico e Diagnóstico</h3>
                  </div>
                  {order.technician && (
                    <span className="text-xs text-[#515f74]">
                      Responsável: <strong>{order.technician.name}</strong>
                    </span>
                  )}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#131b2e]">
                  {order.diagnosis || "Nenhum laudo técnico detalhado registrado."}
                </p>
              </div>

              {/* Immutable Timeline */}
              <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#c3c6d7]/30 pb-4">
                  <Clock size={18} className="text-[#004ac6]" />
                  <h3 className="font-bold text-[#131b2e]">Linha do Tempo Auditável</h3>
                </div>

                <div className="mt-6 flow-root">
                  {!order.history || order.history.length === 0 ? (
                    <p className="text-xs text-[#515f74]">Nenhum histórico registrado.</p>
                  ) : (
                    <ul className="-mb-8">
                      {order.history.map((event, eventIdx) => (
                        <li key={event.id}>
                          <div className="relative pb-8">
                            {eventIdx !== order.history!.length - 1 ? (
                              <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-[#c3c6d7]/40"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2563eb]/10 text-[#004ac6]">
                                <CheckCircle2 size={16} />
                              </span>
                              <div className="min-w-0 flex-1 pt-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-[#131b2e]">
                                    {event.action}
                                    {event.new_status ? ` ➔ ${humanizeStatus(event.new_status)}` : ""}
                                  </span>
                                  <span className="text-[#737686]">
                                    {formatLocalDateTime(event.created_at)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-[#434655]">
                                  {event.description || "Transição de estado"}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[#737686]">
                                  Operador: {event.user?.name || "Sistema"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal: Diagnosis */}
          {activeModal === "diagnosis" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#131b2e]">Atualizar Laudo Técnico</h3>
                <form onSubmit={handleDiagnosisSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">Laudo Detalhado *</label>
                    <textarea
                      required
                      rows={5}
                      value={diagnosisText}
                      onChange={(e) => setDiagnosisText(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#c3c6d7] p-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">
                      Previsão de Conclusão
                    </label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74]"
                    >
                      Cancelar
                    </button>
                    <SubmitButton isLoading={isSubmittingAction} loadingText="Salvando...">
                      Salvar Laudo
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Budget */}
          {activeModal === "budget" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#131b2e]">Lançar Orçamento</h3>
                <form onSubmit={handleBudgetSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">
                      Descrição do Serviço *
                    </label>
                    <input
                      type="text"
                      required
                      value={budgetDescription}
                      onChange={(e) => setBudgetDescription(e.target.value)}
                      placeholder="Ex: Troca de tela e reparo de alimentação"
                      className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#434655]">Custo de Peças (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={partsCost}
                        onChange={(e) => setPartsCost(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#434655]">Mão de Obra (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[#f2f3ff] p-3 text-xs font-semibold text-[#004ac6]">
                    <span>Total Previsto:</span>
                    <span className="text-sm font-bold">
                      {formatCurrencyBRL((parseFloat(partsCost) || 0) + (parseFloat(laborCost) || 0))}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">Observações Técnicas</label>
                    <textarea
                      rows={3}
                      value={budgetNotes}
                      onChange={(e) => setBudgetNotes(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#c3c6d7] p-2 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74]"
                    >
                      Cancelar
                    </button>
                    <SubmitButton isLoading={isSubmittingAction} loadingText="Emitindo...">
                      Emitir e Notificar Cliente
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Budget */}
          {activeModal === "edit-budget" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#131b2e]">Editar Orçamento Pendente</h3>
                <p className="mt-1 text-xs text-[#434655]">
                  Altere os custos ou a descrição dos serviços deste orçamento em rascunho.
                </p>
                <form onSubmit={handleBudgetEditSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">Descrição dos Serviços *</label>
                    <input
                      type="text"
                      required
                      value={budgetDescription}
                      onChange={(e) => setBudgetDescription(e.target.value)}
                      placeholder="Ex: Troca de tela e reparo de placa"
                      className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#434655]">Custo de Peças (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={partsCost}
                        onChange={(e) => setPartsCost(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#434655]">Mão de Obra (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[#f2f3ff] p-3 text-xs font-semibold text-[#004ac6]">
                    <span>Total Recalculado:</span>
                    <span className="text-sm font-bold">
                      {formatCurrencyBRL((parseFloat(partsCost) || 0) + (parseFloat(laborCost) || 0))}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">Observações Técnicas</label>
                    <textarea
                      rows={3}
                      value={budgetNotes}
                      onChange={(e) => setBudgetNotes(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#c3c6d7] p-2 text-sm text-[#131b2e]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74]"
                    >
                      Cancelar
                    </button>
                    <SubmitButton isLoading={isSubmittingAction} loadingText="Salvando...">
                      Salvar Alterações
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Delete Budget */}
          {activeModal === "delete-budget" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertTriangle size={24} />
                  <h3 className="text-lg font-bold text-[#131b2e]">Excluir Orçamento</h3>
                </div>
                <p className="mt-2 text-xs text-[#515f74]">
                  Tem certeza de que deseja excluir este orçamento em rascunho? O valor e os dados do orçamento serão removidos da ordem de serviço.
                </p>
                <form onSubmit={handleBudgetDeleteSubmit} className="mt-4">
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74]"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAction}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {isSubmittingAction ? "Excluindo..." : "Confirmar Exclusão"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Deliver */}
          {activeModal === "deliver" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#131b2e]">Confirmar Entrega do Aparelho</h3>
                <p className="mt-1 text-xs text-[#434655]">
                  Informe a identificação da pessoa que está retirando o equipamento na assistência.
                </p>
                <form onSubmit={handleDeliverSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">
                      Nome do Recebedor *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">
                      Documento (RG / CPF) *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientDocument}
                      onChange={(e) => setRecipientDocument(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74]"
                    >
                      Cancelar
                    </button>
                    <SubmitButton isLoading={isSubmittingAction} loadingText="Finalizando Entrega...">
                      Confirmar Entrega
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Intake */}
          {activeModal === "edit-intake" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#131b2e]">Editar Dados de Entrada da OS</h3>
                <p className="mt-1 text-xs text-[#434655]">
                  Edição permitida somente na triagem inicial (antes do início do diagnóstico técnico).
                </p>
                <form onSubmit={handleIntakeSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">Defeito / Relato Inicial *</label>
                    <textarea
                      required
                      rows={4}
                      value={diagnosisText}
                      onChange={(e) => setDiagnosisText(e.target.value)}
                      placeholder="Descreva o problema relatado..."
                      className="mt-1 w-full rounded-lg border border-[#c3c6d7] p-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">Previsão de Conclusão</label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74]"
                    >
                      Cancelar
                    </button>
                    <SubmitButton isLoading={isSubmittingAction} loadingText="Salvando...">
                      Salvar Alterações
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Cancel Order */}
          {activeModal === "cancel" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertTriangle size={24} />
                  <h3 className="text-lg font-bold text-[#131b2e]">Cancelar Ordem de Serviço</h3>
                </div>
                <p className="mt-2 text-xs text-[#515f74]">
                  Esta ação é irreversível. O status da OS passará para <strong>CANCELADO</strong> e um registro imutável será gravado no histórico de auditoria.
                </p>
                <form onSubmit={handleCancelSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#434655]">Motivo do Cancelamento (opcional)</label>
                    <textarea
                      rows={3}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Ex: Cliente desistiu do reparo antes da análise..."
                      className="mt-1 w-full rounded-lg border border-[#c3c6d7] p-2.5 text-sm text-[#131b2e] outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74]"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAction}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {isSubmittingAction ? "Cancelando..." : "Confirmar Cancelamento"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
