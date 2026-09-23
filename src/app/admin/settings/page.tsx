"use client";

import React from "react";
import { Settings, Shield, Bell, Wrench, Database } from "lucide-react";
import { AdminShell } from "@/shared/components/AdminShell";

export default function SettingsPage() {
  return (
    <AdminShell active="Configurações">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#131b2e]">Configurações</h1>
        <p className="mt-1 text-sm text-[#434655]">
          Preferências gerais do sistema, parâmetros operacionais e regras de assistência técnica.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#c3c6d7]/30 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb]/10 text-[#004ac6]">
              <Shield size={20} />
            </span>
            <div>
              <h3 className="font-bold text-[#131b2e]">Controle de Acesso (RBAC)</h3>
              <p className="text-xs text-[#515f74]">Papéis autorizados: ADMIN, ATTENDANT, TECHNICIAN, CUSTOMER</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-[#434655]">
            <p>• Gestão centralizada via Clerk Authentication.</p>
            <p>• Validações de integridade com autoridade no backend.</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#c3c6d7]/30 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb]/10 text-[#004ac6]">
              <Database size={20} />
            </span>
            <div>
              <h3 className="font-bold text-[#131b2e]">Dados & Integridade</h3>
              <p className="text-xs text-[#515f74]">PostgreSQL via Supabase com transações ACID</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-[#434655]">
            <p>• Máquina de estados estrita para Ordens de Serviço.</p>
            <p>• Histórico imutável de transições auditadas.</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#c3c6d7]/30 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb]/10 text-[#004ac6]">
              <Wrench size={20} />
            </span>
            <div>
              <h3 className="font-bold text-[#131b2e]">Operações Técnicas</h3>
              <p className="text-xs text-[#515f74]">Parâmetros padrão de diagnóstico e orçamento</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-[#434655]">
            <p>• Prazos padrão de orçamento: 3 dias úteis.</p>
            <p>• Aprovação de orçamento em 1 clique no portal mobile.</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#c3c6d7]/30 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb]/10 text-[#004ac6]">
              <Bell size={20} />
            </span>
            <div>
              <h3 className="font-bold text-[#131b2e]">Notificações & Alertas</h3>
              <p className="text-xs text-[#515f74]">Webhooks e alertas de mudança de status</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-[#434655]">
            <p>• Webhooks de sincronização de usuários ativos.</p>
            <p>• Alertas de ordens aguardando aprovação no dashboard.</p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
