import { AlertTriangle, CheckCircle2, ClipboardList, Search, Wrench } from "lucide-react";
import { AdminShell, StatusBadge } from "@/shared/components/AdminShell";

const stats = [
  ["TOTAL OS", "124", "+12 esta semana", ClipboardList, "text-[#004ac6] bg-[#dbe1ff]"],
  ["EM DIAGNÓSTICO", "18", "", Search, "text-[#005a89] bg-[#cce5ff]"],
  ["AGUARDANDO APROVAÇÃO", "12", "", AlertTriangle, "text-[#ba1a1a] bg-[#ffdad6]"],
  ["EM REPARO", "24", "", Wrench, "text-[#004ac6] bg-[#dbe1ff]"],
  ["PRONTOS PARA RETIRADA", "9", "", CheckCircle2, "text-[#08783d] bg-[#c9f5dc]"],
] as const;

export default function AdminDashboardPage() {
  return <AdminShell active="Dashboard">
    <div className="mb-10"><h1 className="text-[32px] font-bold tracking-tight">Overview</h1><p className="mt-2 text-base text-[#434655]">Monitore o status das ordens de serviço e operações da sua assistência.</p></div>
    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{stats.map(([label, value, note, Icon, iconStyle]) => <div key={label} className="rounded-lg border border-[#c3c6d7]/30 bg-[#faf8ff] p-6 shadow-[0_1px_3px_rgba(15,23,42,.08),0_4px_6px_rgba(15,23,42,.05)]"><div className="flex items-start justify-between"><p className="text-[11px] font-semibold tracking-widest text-[#434655]">{label}</p><span className={`rounded-full p-2 ${iconStyle}`}><Icon size={17} /></span></div><p className="mt-5 text-5xl font-bold tracking-tight">{value}</p>{note && <p className="mt-1 text-sm text-[#515f74]">{note}</p>}</div>)}</div>
    <section className="overflow-hidden rounded-lg border border-[#c3c6d7]/30 bg-[#faf8ff] shadow-[0_1px_3px_rgba(15,23,42,.08),0_4px_6px_rgba(15,23,42,.05)]"><div className="border-b border-[#c3c6d7]/30 px-6 py-5"><div className="flex items-center gap-2"><AlertTriangle size={19} className="text-[#ba1a1a]" /><h2 className="text-lg font-semibold">Ordens que precisam de atenção</h2></div><p className="mt-1 text-sm text-[#434655]">Ações requeridas para não atrasar o fluxo de trabalho.</p></div>{[["OS-2023-401", "Empresa Alpha Ltda", "Orçamento pendente há 2 dias", "URGENTE", "red"], ["OS-2023-389", "João Silva", "Peça em falta no estoque", "ATENÇÃO", "amber"], ["OS-2023-412", "Maria Oliveira", "Prazo de entrega vence hoje", "URGENTE", "red"]].map(([id, client, issue, badge, tone]) => <div key={id} className="flex items-center justify-between border-b border-[#c3c6d7]/20 px-6 py-5 last:border-0"><div><p className="font-semibold">{id} <span className="ml-2 text-[10px] font-semibold text-[#ba1a1a]">{badge}</span></p><p className="mt-1 text-sm text-[#434655]">Cliente: {client}</p></div><div className="flex items-center gap-5"><div className="text-right"><p className="text-sm font-medium">{issue}</p><p className="text-xs text-[#434655]">Aguardando ação operacional</p></div><StatusBadge tone={tone as "red" | "amber"}>Ação</StatusBadge></div></div>)}</section>
  </AdminShell>;
}
