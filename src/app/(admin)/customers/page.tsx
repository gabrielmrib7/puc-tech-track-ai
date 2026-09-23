"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Search, UserPlus, Mail, Phone, FileText, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/shared/components/AdminShell";
import { LoadingState, SkeletonRow } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { apiGet, apiPost } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { formatLocalDate } from "@/shared/utils/formatters";
import type { Customer, PaginatedResponse } from "@/shared/types/api";

export default function CustomersPage() {
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Customer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("page", String(page));
    params.set("limit", "15");

    const res = await apiGet<PaginatedResponse<Customer>>(
      `${ROUTES.api.customers}?${params.toString()}`
    );

    if (!res.ok) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    setData(res.data);
    setIsLoading(false);
  }, [query, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput.trim());
    setPage(1);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      document: document.trim() ? document.trim() : undefined,
    };

    const res = await apiPost<Customer>(ROUTES.api.customers, payload);

    if (!res.ok) {
      setFormError(res.error);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(`Cliente "${res.data.name}" cadastrado com sucesso!`);
    setIsSubmitting(false);
    setIsModalOpen(false);

    // Reset Form
    setName("");
    setEmail("");
    setPhone("");
    setDocument("");

    // Refresh list
    fetchCustomers();
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <AdminShell active="Clientes">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#131b2e]">Clientes</h1>
          <p className="mt-1 text-sm text-[#434655]">
            Base unificada de clientes com identificação e histórico de atendimentos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003ea8]"
        >
          <Plus size={18} />
          Cadastrar Cliente
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#08783d]/20 bg-[#c9f5dc]/30 p-4 text-sm font-medium text-[#08783d]">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="mb-6 rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686]"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome, e-mail ou documento..."
              className="h-10 w-full rounded-lg border border-[#c3c6d7] bg-white pl-10 pr-4 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#2563eb]/10 px-5 text-sm font-semibold text-[#004ac6] hover:bg-[#2563eb]/20"
          >
            Buscar
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setQuery("");
                setPage(1);
              }}
              className="rounded-lg border border-[#c3c6d7] px-4 text-xs font-semibold text-[#515f74] hover:bg-[#f2f3ff]"
            >
              Limpar
            </button>
          )}
        </form>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] shadow-sm">
        {error ? (
          <ErrorState
            title="Falha ao carregar clientes"
            message={error}
            onRetry={fetchCustomers}
            className="my-6"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-[#c3c6d7]/30 bg-[#f2f3ff] text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                  <tr>
                    <th className="px-5 py-3.5">Nome do Cliente</th>
                    <th className="px-5 py-3.5">E-mail</th>
                    <th className="px-5 py-3.5">Telefone</th>
                    <th className="px-5 py-3.5">Documento</th>
                    <th className="px-5 py-3.5">Cadastrado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d7]/20">
                  {isLoading ? (
                    <>
                      <SkeletonRow cols={5} />
                      <SkeletonRow cols={5} />
                      <SkeletonRow cols={5} />
                    </>
                  ) : !data || data.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8">
                        <EmptyState
                          title="Nenhum cliente cadastrado"
                          description={
                            query
                              ? "Nenhum cliente corresponde aos termos da pesquisa."
                              : "Cadastre o primeiro cliente para iniciar a triagem de ordens de serviço."
                          }
                          action={
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#003ea8]"
                            >
                              <Plus size={15} /> Cadastrar Cliente
                            </button>
                          }
                          className="border-0"
                        />
                      </td>
                    </tr>
                  ) : (
                    data.items.map((customer) => (
                      <tr key={customer.id} className="transition hover:bg-[#f8fafc]">
                        <td className="px-5 py-4 font-bold text-[#131b2e]">{customer.name}</td>
                        <td className="px-5 py-4 text-[#434655]">
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} className="text-[#737686]" />
                            {customer.email}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#434655]">
                          <span className="flex items-center gap-1.5">
                            <Phone size={14} className="text-[#737686]" />
                            {customer.phone}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#434655]">
                          {customer.document ? (
                            <span className="flex items-center gap-1.5 font-mono text-xs">
                              <FileText size={14} className="text-[#737686]" />
                              {customer.document}
                            </span>
                          ) : (
                            <span className="text-xs text-[#737686]">Não informado</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-[#515f74]">
                          {formatLocalDate(customer.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-[#c3c6d7]/30 px-6 py-4 text-xs text-[#434655] sm:flex-row">
                <span>
                  Mostrando{" "}
                  <strong>{Math.min((data.page - 1) * data.limit + 1, data.total)}</strong> a{" "}
                  <strong>{Math.min(data.page * data.limit, data.total)}</strong> de{" "}
                  <strong>{data.total}</strong> clientes
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={data.page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                    onClick={() => setPage((p) => p + 1)}
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

      {/* Modal: New Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#c3c6d7]/30 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563eb]/10 text-[#004ac6]">
                <UserPlus size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Novo Cliente</h3>
                <p className="text-xs text-[#515f74]">
                  Preencha os dados de contato do cliente para abertura de ordens.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg bg-[#ffdad6]/40 p-3 text-xs font-semibold text-[#ba1a1a]">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#434655]">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ana Clara Silva"
                  className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#434655]">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ana@exemplo.com"
                    className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434655]">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434655]">
                  CPF / CNPJ (Opcional)
                </label>
                <input
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="000.000.000-00"
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
                  Salvar Cliente
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

