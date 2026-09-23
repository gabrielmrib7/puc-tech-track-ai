import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/infrastructure/database/prisma";

const statusLabels: Record<string, string> = {
  RECEIVED: "Recebido",
  WAITING_DIAGNOSIS: "Aguardando diagnóstico",
  IN_DIAGNOSIS: "Em diagnóstico",
  WAITING_APPROVAL: "Aguardando aprovação",
  APPROVED: "Aprovado",
  IN_REPAIR: "Em reparo",
  COMPLETED: "Reparo concluído",
  READY_FOR_PICKUP: "Pronto para retirada",
  DELIVERED: "Entregue",
};

export default async function CustomerPortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { clerk_id: userId }, select: { id: true, name: true, role: true } });
  if (!user || user.role !== "CUSTOMER") redirect("/post-login");

  const customer = await prisma.customer.findFirst({
    where: { user_id: user.id },
    include: { service_orders: { include: { equipment: true, history: { orderBy: { created_at: "asc" } } }, orderBy: { created_at: "desc" } } },
  });
  const order = customer?.service_orders[0];
  const formatDate = (date: Date) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);

  return <main className="min-h-screen bg-[#faf8ff] text-[#131b2e]"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#c3c6d7]/50 bg-[#faf8ff] px-4 shadow-sm"><strong className="text-xl text-[#004ac6]">TechTrack</strong><span className="text-sm text-[#434655]">Olá, {user.name}</span></header><div className="mx-auto max-w-lg space-y-6 p-4 pb-10">{order ? <><section className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm"><div className="absolute inset-y-0 left-0 w-1 bg-[#004ac6]" /><div className="flex items-start justify-between"><div><h1 className="text-xl font-semibold">{order.equipment.brand} {order.equipment.model}</h1><p className="mt-1 text-sm text-[#434655]">{order.order_number}</p></div><span className="rounded-full bg-[#dbe1ff] px-3 py-1 text-xs font-semibold uppercase text-[#004ac6]">{statusLabels[order.status] ?? order.status}</span></div><div className="mt-5 rounded bg-[#f2f3ff] p-4"><p className="text-xs font-semibold uppercase text-[#434655]">Previsão de entrega</p><p className="text-xl font-semibold">{order.estimated_completion ? order.estimated_completion.toLocaleDateString("pt-BR") : "A definir"}</p></div></section><section className="rounded-lg bg-white p-6 shadow-sm"><h2 className="mb-6 border-b border-[#c3c6d7]/30 pb-4 text-xl font-semibold">Linha do Tempo</h2>{order.history.length ? <div className="space-y-5">{order.history.map((item) => <div className="flex gap-3" key={item.id}><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#004ac6] text-xs text-white">✓</span><div><p className="text-sm font-semibold">{item.description || item.action}</p><p className="text-sm text-[#434655]">{formatDate(item.created_at)}</p></div></div>)}</div> : <p className="text-sm text-[#434655]">Ainda não há movimentações registradas.</p>}</section></> : <section className="rounded-lg bg-white p-6 text-center shadow-sm"><h1 className="text-xl font-semibold">Nenhuma ordem encontrada</h1><p className="mt-2 text-sm text-[#434655]">Ainda não há uma ordem vinculada ao seu cadastro.</p></section>}<Link className="block text-center text-sm font-semibold text-[#004ac6]" href="/portal/orders">Ver todas as ordens</Link></div></main>;
}
