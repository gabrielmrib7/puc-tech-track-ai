import Link from "next/link";

export default function ServiceOrdersPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div><p className="text-sm text-brand-text-secondary">Operação</p><h1 className="text-3xl font-semibold">Ordens de Serviço</h1></div>
        <Link className="rounded bg-brand-primary px-4 py-2 text-white" href="/service-orders/new">Nova Ordem</Link>
      </div>
      <p className="mt-8 text-brand-text-secondary">Use a API de ordens para buscar, filtrar e paginar o fluxo de atendimento.</p>
    </main>
  );
}
