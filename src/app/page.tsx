import { Logo } from "@/shared/components/Logo";
import { ShieldCheck, Wrench, Clock, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12">
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-surface-dim">
        <Logo width={180} height={48} />
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-primary">
            v1.0 MVP
          </span>
        </div>
      </header>

      <section className="w-full max-w-4xl my-auto py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Technical Precision System
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-brand-text-primary mb-4">
          Gestão Inteligente de <span className="text-primary">Ordens de Serviço</span>
        </h1>

        <p className="text-base md:text-lg text-brand-text-secondary max-w-2xl mb-8">
          Acompanhamento em tempo real do ciclo de reparos, orçamentos com aprovação transparente e integridade transacional garantida.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6 text-left">
          <div className="p-6 bg-surface rounded-xl border border-surface-dim shadow-sm hover:border-primary transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-brand-text-primary text-base mb-1">Rastreamento Transparente</h3>
            <p className="text-sm text-brand-text-secondary">
              Linha do tempo em tempo real para os clientes acompanharem cada etapa do conserto.
            </p>
          </div>

          <div className="p-6 bg-surface rounded-xl border border-surface-dim shadow-sm hover:border-primary transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-brand-text-primary text-base mb-1">Aprovação em 1 Clique</h3>
            <p className="text-sm text-brand-text-secondary">
              Orçamentos detalhados aprovados diretamente pelo portal mobile do cliente.
            </p>
          </div>

          <div className="p-6 bg-surface rounded-xl border border-surface-dim shadow-sm hover:border-primary transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary mb-4">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-brand-text-primary text-base mb-1">Precisão Operacional</h3>
            <p className="text-sm text-brand-text-secondary">
              Triagem ágil, laudos técnicos padronizados e controle rigoroso por máquina de estados.
            </p>
          </div>
        </div>
      </section>

      <footer className="w-full max-w-5xl py-6 border-t border-surface-dim flex flex-col sm:flex-row items-center justify-between text-xs text-brand-text-muted">
        <p>© 2026 TechTrack. Todos os direitos reservados.</p>
        <div className="flex items-center gap-6 mt-4 sm:mt-0">
          <span>PostgreSQL + Prisma</span>
          <span>Next.js App Router</span>
          <span>Tailwind CSS</span>
        </div>
      </footer>
    </main>
  );
}

