export default function ServiceOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm text-brand-text-secondary">Ordem de Serviço</p>
      <h1 className="text-3xl font-semibold">Detalhes da OS</h1>
      <p className="mt-3 text-brand-text-secondary">A ordem {params.id} exibe diagnóstico, orçamento, transições autorizadas e histórico auditável.</p>
    </main>
  );
}
