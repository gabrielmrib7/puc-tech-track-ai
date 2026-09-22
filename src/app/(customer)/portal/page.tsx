import Link from "next/link";

export default function CustomerPortalPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <header><p className="text-sm text-brand-primary">TechTrack</p><h1 className="mt-2 text-2xl font-semibold">Acompanhe seus reparos</h1></header>
      <section className="mt-8 rounded-lg border border-brand-border bg-white p-5 shadow-sm"><p className="font-medium">Suas ordens de serviço</p><p className="mt-2 text-sm text-brand-text-secondary">Consulte status, histórico e orçamentos pelo portal.</p><Link className="mt-5 inline-block text-brand-primary" href="/portal/orders">Ver ordens</Link></section>
    </main>
  );
}
