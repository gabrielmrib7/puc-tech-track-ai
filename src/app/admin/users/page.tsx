"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  UserCog,
  Search,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  UserX,
  UserCheck,
  Mail,
  Calendar,
} from "lucide-react";
import { AdminShell } from "@/shared/components/AdminShell";
import { LoadingState, SkeletonRow } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { apiGet, apiPatch, apiDelete } from "@/shared/lib/api-client";
import { ROUTES } from "@/shared/constants/routes";
import { formatLocalDate } from "@/shared/utils/formatters";
import type { UserResponse, UserRole } from "@/shared/types/api";

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  ADMIN: { label: "Administrador", color: "bg-[#7941dc]/10 text-[#7941dc] border-[#7941dc]/30" },
  ATTENDANT: { label: "Atendente", color: "bg-[#004ac6]/10 text-[#004ac6] border-[#004ac6]/30" },
  TECHNICIAN: { label: "Técnico", color: "bg-[#9a5a00]/10 text-[#9a5a00] border-[#9a5a00]/30" },
  CUSTOMER: { label: "Cliente", color: "bg-[#515f74]/10 text-[#515f74] border-[#515f74]/30" },
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Filters
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("ATTENDANT");
  const [editActive, setEditActive] = useState<boolean>(true);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Deactivate User Modal State
  const [deactivatingUser, setDeactivatingUser] = useState<UserResponse | null>(null);
  const [isDeactivateSubmitting, setIsDeactivateSubmitting] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (roleFilter) params.set("role", roleFilter);

    const res = await apiGet<{ items: UserResponse[]; total: number }>(
      `${ROUTES.api.users}?${params.toString()}`
    );

    if (!res.ok) {
      if (res.status === 403) {
        setIsForbidden(true);
      } else {
        setError(res.error);
      }
      setIsLoading(false);
      return;
    }

    setUsers(res.data.items);
    setTotal(res.data.total);
    setIsLoading(false);
  }, [query, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput.trim());
  };

  const handleOpenEdit = (user: UserResponse) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditActive(user.active);
    setEditFormError(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsEditSubmitting(true);
    setEditFormError(null);

    const res = await apiPatch<UserResponse>(ROUTES.api.userDetail(editingUser.id), {
      role: editRole,
      active: editActive,
    });

    if (!res.ok) {
      setEditFormError(res.error);
      setIsEditSubmitting(false);
      return;
    }

    setSuccessMessage(`Usuário "${res.data.name}" atualizado com sucesso!`);
    setIsEditSubmitting(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleOpenDeactivate = (user: UserResponse) => {
    setDeactivatingUser(user);
    setDeactivateError(null);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingUser) return;

    setIsDeactivateSubmitting(true);
    setDeactivateError(null);

    // Call DELETE /api/v1/users/[id] which sets active: false
    const res = await apiDelete(ROUTES.api.userDetail(deactivatingUser.id));

    if (!res.ok) {
      setDeactivateError(res.error);
      setIsDeactivateSubmitting(false);
      return;
    }

    setSuccessMessage(`Usuário "${deactivatingUser.name}" desativado com sucesso.`);
    setIsDeactivateSubmitting(false);
    setDeactivatingUser(null);
    fetchUsers();
  };

  const handleReactivateUser = async (user: UserResponse) => {
    const res = await apiPatch<UserResponse>(ROUTES.api.userDetail(user.id), {
      active: true,
    });

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setSuccessMessage(`Usuário "${user.name}" reativado com sucesso!`);
    fetchUsers();
  };

  return (
    <AdminShell active="Usuários">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#131b2e]">Gestão de Usuários</h1>
          <p className="mt-1 text-sm text-[#434655]">
            Administração de operadores, técnicos, perfis de acesso e status de contas da equipe.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#08783d]/20 bg-[#c9f5dc]/30 p-4 text-sm font-medium text-[#08783d]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* 403 Forbidden State */}
      {isForbidden ? (
        <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-[#ffdad6] bg-white p-12 text-center shadow-sm">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#ffdad6]/50 text-[#ba1a1a]">
            <ShieldAlert size={36} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-[#131b2e]">Acesso Restrito a Administradores</h2>
          <p className="mt-2 max-w-md text-sm text-[#434655]">
            Você não possui o papel de <strong>ADMIN</strong> necessário para visualizar e gerenciar
            a equipe de usuários da plataforma.
          </p>
        </div>
      ) : (
        <>
          {/* Filters Toolbar */}
          <div className="mb-6 grid gap-3 rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-4 shadow-sm md:grid-cols-[1fr_200px_auto]">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686]"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por nome ou e-mail..."
                  className="h-10 w-full rounded-lg border border-[#c3c6d7] bg-white pl-10 pr-4 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#2563eb]/10 px-4 text-sm font-semibold text-[#004ac6] hover:bg-[#2563eb]/20"
              >
                Buscar
              </button>
            </form>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
            >
              <option value="">Todos os Perfis</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
              <option value="ATTENDANT">Atendente (ATTENDANT)</option>
              <option value="TECHNICIAN">Técnico (TECHNICIAN)</option>
              <option value="CUSTOMER">Cliente (CUSTOMER)</option>
            </select>

            {(query || roleFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setQuery("");
                  setRoleFilter("");
                }}
                className="h-10 rounded-lg border border-[#c3c6d7] px-4 text-xs font-semibold text-[#515f74] hover:bg-[#f2f3ff]"
              >
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] shadow-sm">
            {error ? (
              <ErrorState
                title="Falha ao carregar usuários"
                message={error}
                onRetry={fetchUsers}
                className="my-6"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="border-b border-[#c3c6d7]/30 bg-[#f2f3ff] text-[11px] font-bold uppercase tracking-wider text-[#434655]">
                    <tr>
                      <th className="px-5 py-3.5">Nome</th>
                      <th className="px-5 py-3.5">E-mail</th>
                      <th className="px-5 py-3.5">Perfil de Acesso</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Cadastrado em</th>
                      <th className="px-5 py-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c6d7]/20">
                    {isLoading ? (
                      <>
                        <SkeletonRow cols={6} />
                        <SkeletonRow cols={6} />
                        <SkeletonRow cols={6} />
                      </>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8">
                          <EmptyState
                            icon={Shield}
                            title="Nenhum usuário encontrado"
                            description={
                              query || roleFilter
                                ? "Nenhum usuário corresponde aos filtros aplicados."
                                : "Nenhum usuário cadastrado no sistema."
                            }
                            className="border-0"
                          />
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const roleMeta = ROLE_LABELS[u.role] || {
                          label: u.role,
                          color: "bg-slate-100 text-slate-700 border-slate-200",
                        };

                        return (
                          <tr key={u.id} className="transition hover:bg-[#f8fafc]">
                            <td className="px-5 py-4 font-bold text-[#131b2e]">{u.name}</td>
                            <td className="px-5 py-4 text-[#434655]">
                              <span className="flex items-center gap-1.5">
                                <Mail size={14} className="text-[#737686]" />
                                {u.email}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleMeta.color}`}
                              >
                                {roleMeta.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {u.active ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#c9f5dc]/60 px-2.5 py-0.5 text-xs font-semibold text-[#08783d]">
                                  <UserCheck size={13} /> Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#ffdad6]/60 px-2.5 py-0.5 text-xs font-semibold text-[#ba1a1a]">
                                  <UserX size={13} /> Inativo
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs text-[#515f74]">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#737686]" />
                                {formatLocalDate(u.created_at)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(u)}
                                  aria-label={`Editar usuário ${u.name}`}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#c3c6d7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#004ac6] hover:bg-[#f2f3ff]"
                                >
                                  <Pencil size={13} />
                                  <span>Editar</span>
                                </button>
                                {u.active ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDeactivate(u)}
                                    aria-label={`Desativar usuário ${u.name}`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#ffdad6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/20"
                                  >
                                    <UserX size={13} />
                                    <span>Desativar</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleReactivateUser(u)}
                                    aria-label={`Reativar usuário ${u.name}`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#c9f5dc] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#08783d] hover:bg-[#c9f5dc]/30"
                                  >
                                    <UserCheck size={13} />
                                    <span>Reativar</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal: Edit User Role & Active */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#c3c6d7]/30 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563eb]/10 text-[#004ac6]">
                <UserCog size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Editar Permissões do Usuário</h3>
                <p className="text-xs text-[#515f74]">
                  {editingUser.name} ({editingUser.email})
                </p>
              </div>
            </div>

            {editFormError && (
              <div className="mt-4 rounded-lg bg-[#ffdad6]/40 p-3 text-xs font-semibold text-[#ba1a1a]">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#434655]">Perfil de Acesso (RBAC) *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="mt-1 h-10 w-full rounded-lg border border-[#c3c6d7] bg-white px-3 text-sm text-[#131b2e] outline-none focus:border-[#004ac6]"
                >
                  <option value="ADMIN">Administrador (ADMIN) — Acesso total</option>
                  <option value="ATTENDANT">Atendente (ATTENDANT) — Abertura e triagem de OS</option>
                  <option value="TECHNICIAN">Técnico (TECHNICIAN) — Laudos e reparos</option>
                  <option value="CUSTOMER">Cliente (CUSTOMER) — Acesso ao portal restrito</option>
                </select>
              </div>

              <div className="rounded-xl border border-[#c3c6d7]/40 bg-[#faf8ff] p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="h-4 w-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]"
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#131b2e]">Conta Ativa</span>
                    <span className="block text-xs text-[#515f74]">
                      Usuários inativos não conseguem autenticar ou executar ações no sistema.
                    </span>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[#c3c6d7]/30 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74] hover:bg-[#f2f3ff]"
                >
                  Cancelar
                </button>
                <SubmitButton isLoading={isEditSubmitting} loadingText="Salvando...">
                  Atualizar Usuário
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deactivate Confirmation */}
      {deactivatingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#ffdad6] bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#ffdad6] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffdad6] text-[#ba1a1a]">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#ba1a1a]">Confirmar Desativação</h3>
                <p className="text-xs text-[#515f74]">Esta ação bloqueia o acesso do usuário.</p>
              </div>
            </div>

            {deactivateError ? (
              <div className="mt-4 rounded-lg bg-[#ffdad6]/40 p-3 text-xs font-semibold text-[#ba1a1a]">
                {deactivateError}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#434655]">
                Deseja desativar o usuário{" "}
                <strong className="text-[#131b2e]">{deactivatingUser.name}</strong> (
                {deactivatingUser.email})? Seus dados e vínculos históricos com ordens de serviço
                serão preservados para auditoria.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-[#c3c6d7]/30 pt-4">
              <button
                type="button"
                onClick={() => setDeactivatingUser(null)}
                className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-semibold text-[#515f74] hover:bg-[#f2f3ff]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeactivateSubmitting}
                onClick={handleConfirmDeactivate}
                className="inline-flex items-center justify-center rounded-lg bg-[#ba1a1a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#93000a] disabled:opacity-50"
              >
                {isDeactivateSubmitting ? "Desativando..." : "Confirmar Desativação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
