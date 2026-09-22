export default function CustomerBudgetPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <p className="text-sm text-brand-text-secondary">Orçamento da ordem {params.id}</p>
      <h1 className="mt-2 text-2xl font-semibold">Orçamento disponível</h1>
      <p className="mt-3 text-brand-text-secondary">Revise os itens e escolha aprovar ou recusar. Uma confirmação será solicitada antes da decisão.</p>
    </main>
  );
}
