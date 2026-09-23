# 🗺️ Roadmap de Implementação Incremental e Catálogo de Mudanças (OpenSpec) — TechTrack

> **Documento Oficial de Engenharia, Planejamento e Rastreabilidade de Artefatos**  
> Mapeamento de entregas incrementais do sistema **TechTrack** utilizando a metodologia de *Spec-Driven Development* (OpenSpec).  
> Baseado em [`docs/prd.md`](docs/prd.md), [`docs/spec.md`](docs/spec.md), [`docs/architecture.md`](docs/architecture.md), [`docs/design.md`](docs/design.md) e protótipos visuais em [`stitch_techtrack/`](stitch_techtrack/).

---

## 1. 🎯 Visão Geral, Metodologia e Princípios de Governança

Para garantir a entrega de um produto robusto, estável e em conformidade estrita com as diretrizes do [`AGENTS.md`](AGENTS.md), todas as etapas de desenvolvimento do **TechTrack** foram conduzidas por meio de **Mudanças Estruturadas (*Changes*) via OpenSpec**.

### Pilares de Governança
* **Arquitetura em 4 Camadas (Monólito Modular):** *Presentation*, *Application*, *Domain* e *Infrastructure*.
* **Backend Authority Estrito:** Nenhuma autorização ou validação de integridade depende exclusivamente da interface gráfica.
* **Integridade Transacional (ACID):** Transições de status de OS e decisões de orçamento executadas atomicamente (`prisma.$transaction`) com histórico imutável (`ServiceOrderHistory`).
* **Qualidade e Portões de Aceite (*Definition of Done*):** Cada mudança só é aprovada e arquivada após validação total de:
  * Checagem estática de tipos (`npx tsc --noEmit` — 0 erros).
  * Análise estática de código (`npm run lint` — 0 avisos/erros).
  * Testes unitários e de integração de API (`npm run test` via Vitest — 100% aprovados).
  * Testes ponta a ponta E2E (`npx playwright test` — fluxos críticos de negócio e segurança validados).

---

## 2. 📊 Matriz Comparativa do Planejamento Inicial

| ID | Mudança (*Change*) | Tamanho | Complexidade | Risco | Protótipo Stitch | Dependências | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **01** | **Fundação e Modelagem Relacional** | Médio | Média | Baixo | `technical_precision_system`, `techtrack_logo` | *Nenhuma* | Concluída / Arquivada |
| **02** | **Autenticação e RBAC** | Médio | Média | Médio | `techtrack_login` | `01` | Concluída / Arquivada |
| **03** | **Gestão de Clientes e Equipamentos** | Médio | Baixa | Baixo | `techtrack_nova_ordem_de_servi_o` (cadastro) | `01`, `02` | Concluída / Arquivada |
| **04** | **Abertura, Triagem e Listagem de OS** | Médio | Média | Médio | `techtrack_nova_ordem_de_servi_o`, `techtrack_lista_de_ordens` | `03` | Concluída / Arquivada |
| **05** | **Diagnóstico Técnico e Máquina de Estados** | Médio | Média | Médio | `techtrack_detalhes_da_ordem_adm` | `04` | Concluída / Arquivada |
| **06** | **Orçamentos e Transação ACID de Decisão** | Médio | Média | Médio | `techtrack_aprova_o_de_or_amento_mobile` | `05` | Concluída / Arquivada |
| **07** | **Portal do Cliente Mobile-First** | Médio | Média | Médio | `techtrack_portal_do_cliente_mobile` | `06` | Concluída / Arquivada |
| **08** | **Dashboard Administrativo e Entrega Final** | Médio | Média | Baixo | `techtrack_dashboard_administrativo` | `07` | Concluída / Arquivada |

---

## 3. 🧩 Detalhamento das Mudanças da Estrutura Inicial e Seus Artefatos

O ciclo inicial de desenvolvimento estabeleceu as fundações arquiteturais e o núcleo do produto:

```text
┌──────────────────────────────────────┐
│ 01. Fundação e Modelagem Relacional │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 02. Autenticação e RBAC (Clerk)      │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 03. Gestão de Clientes e Aparelhos   │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 04. Abertura, Triagem e Listagem OS  │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 05. Diagnóstico e Máquina de Estados │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 06. Orçamentos e Transação ACID      │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 07. Portal do Cliente Mobile-First   │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│ 08. Dashboard Admin e Entrega Final  │
└──────────────────────────────────────┘
```

### [Mudança 01: Fundação do Projeto, Design Tokens e Modelagem Relacional](openspec/changes/archive/2026-09-22-01-foundation-and-database/)
* **Objetivo:** Setup do Next.js App Router (TypeScript `strict: true`), configuração do Tailwind CSS com tokens do *Technical Precision System*, modelagem relacional PostgreSQL via Prisma/Supabase e ambiente de testes.
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Schema do Banco: [`prisma/schema.prisma`](prisma/schema.prisma) (entidades `User`, `Customer`, `Equipment`, `ServiceOrder`, `Budget`, `ServiceOrderHistory`).
  * Singleton do Banco: [`src/shared/infrastructure/database/prisma.ts`](src/shared/infrastructure/database/prisma.ts).
  * Validação de Variáveis de Ambiente: [`src/shared/infrastructure/env.ts`](src/shared/infrastructure/env.ts).
  * Design Tokens e Layout Base: [`tailwind.config.ts`](tailwind.config.ts), [`src/app/globals.css`](src/app/globals.css).
  * Testes de Fundação: [`src/shared/infrastructure/database/prisma.spec.ts`](src/shared/infrastructure/database/prisma.spec.ts), [`src/shared/infrastructure/env.spec.ts`](src/shared/infrastructure/env.spec.ts).

---

### [Mudança 02: Autenticação, Gestão de Sessão e Controle de Acesso (RBAC)](openspec/changes/archive/2026-09-22-02-auth-and-rbac/)
* **Objetivo:** Autenticação via Clerk, sincronização bidirecional idempotente de identidades, papéis RBAC (`ADMIN`, `ATTENDANT`, `TECHNICIAN`, `CUSTOMER`) e tela de login responsiva.
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Guards de Autorização: [`src/shared/infrastructure/auth/guards.ts`](src/shared/infrastructure/auth/guards.ts).
  * Sincronização de Usuários: [`src/modules/auth/application/sync-clerk-user.ts`](src/modules/auth/application/sync-clerk-user.ts).
  * Bootstrap do Primeiro Administrador: [`src/modules/auth/application/bootstrap-admin.ts`](src/modules/auth/application/bootstrap-admin.ts).
  * Interface de Login: [`src/app/(auth)/login/[[...rest]]/page.tsx`](src/app/(auth)/login/[[...rest]]/page.tsx), [`src/app/(auth)/post-login/page.tsx`](src/app/(auth)/post-login/page.tsx).
  * Testes Unitários de Autenticação: [`src/modules/auth/application/sync-clerk-user.spec.ts`](src/modules/auth/application/sync-clerk-user.spec.ts), [`src/modules/auth/domain/roles.spec.ts`](src/modules/auth/domain/roles.spec.ts).

---

### [Mudança 03: Gestão de Clientes e Cadastro de Equipamentos](openspec/changes/archive/2026-09-22-03-customers-and-equipment/)
* **Objetivo:** Casos de uso UC01 (Cadastrar Cliente) e UC02 (Cadastrar Equipamento) com schemas Zod estritos, endpoints REST e formulários assistidos.
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Schemas de Domínio: [`src/modules/customers/domain/schemas.ts`](src/modules/customers/domain/schemas.ts), [`src/modules/equipment/domain/schemas.ts`](src/modules/equipment/domain/schemas.ts).
  * Endpoints REST: [`src/app/api/v1/customers/route.ts`](src/app/api/v1/customers/route.ts), [`src/app/api/v1/equipment/route.ts`](src/app/api/v1/equipment/route.ts).
  * Interfaces Administrativas: [`src/app/admin/customers/page.tsx`](src/app/admin/customers/page.tsx), [`src/app/admin/equipment/page.tsx`](src/app/admin/equipment/page.tsx).
  * Testes de Validação: [`src/modules/customers/domain/schemas.spec.ts`](src/modules/customers/domain/schemas.spec.ts), [`src/modules/equipment/domain/schemas.spec.ts`](src/modules/equipment/domain/schemas.spec.ts).

---

### [Mudança 04: Abertura, Triagem e Listagem de Ordens de Serviço](openspec/changes/archive/2026-09-22-04-service-order-intake/)
* **Objetivo:** UC03 (Criar OS). Gerador determinístico de número de ordem (`OS-YYYY-XXXXXX`), triagem técnica e painel tabular desktop com paginação e busca rápida.
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Domínio de OS: [`src/modules/service-orders/domain/order-number.ts`](src/modules/service-orders/domain/order-number.ts), [`src/modules/service-orders/domain/schemas.ts`](src/modules/service-orders/domain/schemas.ts).
  * Endpoints REST: [`src/app/api/v1/service-orders/route.ts`](src/app/api/v1/service-orders/route.ts).
  * Páginas do Frontend: [`src/app/service-orders/new/page.tsx`](src/app/service-orders/new/page.tsx), [`src/app/service-orders/page.tsx`](src/app/service-orders/page.tsx).
  * Testes Unitários: [`src/modules/service-orders/domain/order-number.spec.ts`](src/modules/service-orders/domain/order-number.spec.ts), [`src/modules/service-orders/domain/schemas.spec.ts`](src/modules/service-orders/domain/schemas.spec.ts).

---

### [Mudança 05: Diagnóstico Técnico e Motor da Máquina de Estados Finita](openspec/changes/archive/2026-09-22-05-diagnosis-and-state-machine/)
* **Objetivo:** UC04 (Registrar Diagnóstico) e UC07 (Atualizar Status). Máquina de estados determinística no domínio, rejeição de saltos ilegais (HTTP 400/422) e auditoria imutável na timeline.
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Motor da Máquina de Estados: [`src/modules/service-orders/domain/state-machine.ts`](src/modules/service-orders/domain/state-machine.ts).
  * Endpoints REST: [`src/app/api/v1/service-orders/[id]/status/route.ts`](src/app/api/v1/service-orders/[id]/status/route.ts), [`src/app/api/v1/service-orders/[id]/diagnosis/route.ts`](src/app/api/v1/service-orders/[id]/diagnosis/route.ts).
  * Tela de Detalhes da OS: [`src/app/service-orders/[id]/page.tsx`](src/app/service-orders/[id]/page.tsx).
  * Testes de Transição: [`src/modules/service-orders/domain/state-machine.spec.ts`](src/modules/service-orders/domain/state-machine.spec.ts).

---

### [Mudança 06: Gestão de Orçamentos e Transação Atômica de Decisão (ACID)](openspec/changes/archive/2026-09-22-06-budgets-and-acid-approval/)
* **Objetivo:** UC05 (Emitir Orçamento) e UC06 (Aprovar/Recusar Orçamento). Transação atômica (`prisma.$transaction`) sincronizando Budget, ServiceOrder e ServiceOrderHistory.
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Domínio de Orçamento: [`src/modules/budgets/domain/budget.ts`](src/modules/budgets/domain/budget.ts).
  * Endpoints Atômicos: [`src/app/api/v1/service-orders/[id]/budget/route.ts`](src/app/api/v1/service-orders/[id]/budget/route.ts), [`src/app/api/v1/service-orders/[id]/budget/[decision]/route.ts`](src/app/api/v1/service-orders/[id]/budget/[decision]/route.ts).
  * Tela Mobile de Aprovação: [`src/app/(customer)/orders/[id]/budget/page.tsx`](src/app/(customer)/orders/[id]/budget/page.tsx).
  * Testes Unitários e Rollback: [`src/modules/budgets/domain/budget.spec.ts`](src/modules/budgets/domain/budget.spec.ts), [`src/app/api/v1/service-orders/[id]/budget/route.spec.ts`](src/app/api/v1/service-orders/[id]/budget/route.spec.ts).

---

### [Mudança 07: Portal do Cliente Mobile-First e Linha do Tempo Humanizada](openspec/changes/archive/2026-09-22-07-customer-portal-mobile/)
* **Objetivo:** UC08 (Consultar OS pelo Cliente). Portal mobile responsivo, prevenção de vulnerabilidades IDOR/Cross-tenant, apresentação de timeline humanizada.
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Apresentação da Linha do Tempo: [`src/modules/service-orders/presentation/customer/timeline.ts`](src/modules/service-orders/presentation/customer/timeline.ts).
  * Endpoints Seguros do Portal: [`src/app/api/v1/customer/orders/route.ts`](src/app/api/v1/customer/orders/route.ts), [`src/app/api/v1/customer/orders/[id]/route.ts`](src/app/api/v1/customer/orders/[id]/route.ts).
  * Telas do Portal: [`src/app/(customer)/portal/page.tsx`](src/app/(customer)/portal/page.tsx), [`src/app/(customer)/portal/orders/page.tsx`](src/app/(customer)/portal/orders/page.tsx).
  * Testes de Apresentação: [`src/modules/service-orders/presentation/customer/timeline.spec.ts`](src/modules/service-orders/presentation/customer/timeline.spec.ts).

---

### [Mudança 08: Dashboard Administrativo e Fluxo de Entrega Final](openspec/changes/archive/2026-09-22-08-admin-dashboard-and-delivery/)
* **Objetivo:** Painel de indicadores gerenciais operacionais, encerramento de ciclo no balcão com entrega (`READY_FOR_PICKUP` para `DELIVERED`).
* **Artefatos OpenSpec:** `proposal.md`, `specs/`, `design.md`, `tasks.md`.
* **Artefatos Implementados:**
  * Métricas de Domínio: [`src/modules/service-orders/application/metrics.ts`](src/modules/service-orders/application/metrics.ts).
  * Endpoints REST: [`src/app/api/v1/admin/dashboard/route.ts`](src/app/api/v1/admin/dashboard/route.ts), [`src/app/api/v1/service-orders/[id]/deliver/route.ts`](src/app/api/v1/service-orders/[id]/deliver/route.ts).
  * Painel Dashboard: [`src/app/admin/dashboard/page.tsx`](src/app/admin/dashboard/page.tsx).
  * Testes de Agregação: [`src/modules/service-orders/application/metrics.spec.ts`](src/modules/service-orders/application/metrics.spec.ts).

---

## 4. 🔄 Mudanças de Consolidação Funcional e CRUD Completo

Após a estruturação inicial, foram executadas 4 mudanças complementares de ciclo completo de vida de dados:

| Mudança | Escopo & Artefatos Principais | Status |
| :--- | :--- | :---: |
| **`restore-functional-product`** | Unificação do App Router, correção de layouts híbridos e validação de 28 tarefas essenciais de produto. | Arquivada |
| **`master-data-crud`** | Edição/exclusão com integridade referencial para Clientes (`/customers/:id`), Equipamentos (`/equipment/:id`) e Gestão de Usuários (`/users/:id`). | Arquivada |
| **`service-order-crud`** | Edição de dados de entrada na triagem (`PATCH /service-orders/:id`) e Cancelamento administrativo com auditoria imutável (`DELETE /service-orders/:id`). | Arquivada |
| **`budget-management-crud`** | CRUD completo de orçamentos, cálculo server-side à prova de manipulação, imutabilidade estrita pós-decisão e concorrência ACID. | Arquivada |

---

## 5. 🔑 Conta Admin Padrão e Credenciais de Acesso (Ambiente de Avaliação)

Para avaliação da aplicação no ambiente local ou de staging com permissões totais de administrador, utilize a credencial pré-configurada no Clerk (modo de desenvolvimento):

| Perfil / Papel | E-mail de Acesso | Método de Login | Código de Verificação Padrão (OTP) | Acesso e Permissões |
| :--- | :--- | :--- | :---: | :--- |
| 👑 **Administrador Padrão (`ADMIN`)** | `admin+clerk_test@techtrack.com` | E-mail + OTP | **`424242`** | Acesso total: `/service-orders`, `/admin/*`, gestão de usuários e métricas |

> [!TIP]
> **Código Padrão do Clerk (`424242`):** No ambiente de desenvolvimento do Clerk, o e-mail de teste `admin+clerk_test@techtrack.com` utiliza o código padrão **`424242`** para verificação instantânea sem necessidade de envio ou recebimento de e-mail real.
