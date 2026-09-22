export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-sm text-brand-text-secondary">Operação TechTrack</p>
      <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-4"><div className="rounded-lg border bg-white p-5"><p className="text-sm text-brand-text-secondary">Novas OS hoje</p><strong className="mt-2 block text-3xl">--</strong></div><div className="rounded-lg border bg-white p-5"><p className="text-sm text-brand-text-secondary">Orçamentos pendentes</p><strong className="mt-2 block text-3xl">--</strong></div><div className="rounded-lg border bg-white p-5"><p className="text-sm text-brand-text-secondary">Prontos para retirada</p><strong className="mt-2 block text-3xl">--</strong></div></div>
    </main>
  );
}
