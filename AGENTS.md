# AGENTS.md — Diretrizes para Agentes de IA (TechTrack)

> Guia de comportamento, arquitetura, governança e padrões operacionais para agentes de Inteligência Artificial atuando no projeto **TechTrack**.  
> Inspirado nas diretrizes de alto sinal de [Karpathy (CLAUDE.md)](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md) e nos padrões de governança de [devai (AGENTS.md Guidelines)](https://github.com/valuedriven/devai/tree/main/.fluxo/concepts/agents-md-guidelines.md).

---

## 1. 🎯 Visão e Identidade do Projeto

O **TechTrack** é uma plataforma inteligente e modular para gestão completa de ordens de serviço (OS) e rastreamento em tempo real do ciclo de reparos em assistências técnicas de eletrônicos.

### Pilares Fundamentais
* **Transparência e Rastreabilidade:** Eliminar contatos repetitivos ("Como está meu aparelho?") permitindo ao cliente acompanhar a linha do tempo em tempo real com aprovação/recusa de orçamentos com 1 clique.
* **Precisão Operacional:** Painel desktop de alta densidade de informação para atendimento, triagem, laudo técnico e entrega.
* **Integridade Transacional (ACID):** Decisões de orçamento e transições de status são imutáveis e auditadas atomicamente.

### Perfis de Usuário (RBAC)
* 👑 **`ADMIN`:** Acesso total, auditoria, configurações operacionais e gestão de usuários.
* 📋 **`ATTENDANT`:** Cadastro de clientes/equipamentos, abertura de OS, atendimento inicial e entrega.
* 🔧 **`TECHNICIAN`:** Diagnóstico/laudo técnico, emissão de orçamento e execução de reparos.
* 📱 **`CUSTOMER`:** Visualização restrita das suas próprias ordens, linha do tempo e aprovação/recusa de orçamento.

---

## 2. 🧠 Comportamento e Mindset do Agente

Ao atuar no TechTrack, todo agente de IA deve seguir estas diretrizes:

1. **Alto Sinal, Zero Fluff:** Seja direto, técnico e conciso. Não escreva explicações genéricas ou rodeios desnecessários. Foque no código, em contratos tipados e na validação por testes.
2. **Pragmatismo e Menor Surpresa:** Não adicione bibliotecas externas sem justificativa técnica clara. Aproveite a stack existente (Next.js, Prisma, Tailwind, Clerk).
3. **Respeito aos Invariantes de Domínio:** Nunca contorne as validações da máquina de estados ou permita operações não atômicas em orçamentos.
4. **Validação Antes de Declarar Sucesso:** Nenhuma alteração é considerada pronta sem passar por verificação de tipagem (`tsc --noEmit`), linter (`npm run lint`) e testes relevantes (`npm run test`).
5. **Preservação de Contexto e Documentação:** Mantenha comentários úteis, docstrings e documentos de especificação sincronizados com o código produzido.

---

## 3. 🛠️ Stack Tecnológica Oficial

| Camada | Tecnologia | Especificação & Propósito |
| :--- | :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React 18+) & TypeScript | App Router, SSR/CSR híbrido, tipagem estática rigorosa (`strict: true`). |
| **Estilização & UI** | [Tailwind CSS](https://tailwindcss.com/) & Lucide Icons | Design system **Technical Precision System** (`#2563EB`, grade 4px, WCAG AA). |
| **Backend API** | Node.js & TypeScript | REST API modular (`/api/v1`), Monólito Modular em 4 camadas. |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) | Banco relacional com integridade referencial e transações ACID. |
| **ORM & Migrations** | [Prisma](https://www.prisma.io/) | Modelagem relacional, queries tipadas e histórico de migrações (`prisma/schema.prisma`). |
| **Autenticação** | [Clerk](https://clerk.com/) | Gestão de sessões, MFA, tokens JWT e RBAC (`ADMIN`, `ATTENDANT`, `TECHNICIAN`, `CUSTOMER`). |
| **Testes** | Jest / Vitest & Playwright | Testes unitários de domínio, testes de integração de API e E2E de fluxos críticos. |
| **Deploy & Cloud** | [Vercel](https://vercel.com/) & Supabase | Hospedagem serverless com CI/CD contínuo e banco gerenciado. |
| **Prototipação** | Stitch by Google | Especificações visuais e componentes em `stitch_techtrack/`. |

---

## 4. 📁 Estrutura do Monorepo e Arquitetura

O projeto adota a arquitetura de **Monólito Modular** dividida em 4 camadas limpas:

```text
tech_Track/
├── docs/                               # Documentação oficial de produto e arquitetura
│   ├── problem.md                      # Definição do problema e público-alvo
│   ├── prd.md                          # Product Requirements Document
│   ├── spec.md                         # Especificação técnica detalhada e casos de uso
│   ├── architecture.md                 # Arquitetura de software, ADRs e diagramas
│   └── design.md                       # Design system e diretrizes de UI/UX
├── stitch_techtrack/                   # Telas e assets gerados no Stitch by Google
│   ├── technical_precision_system/     # Documento de design visual
│   ├── techtrack_dashboard_administrativo/
│   ├── techtrack_portal_do_cliente_mobile/
│   ├── techtrack_detalhes_da_ordem_adm/
│   ├── techtrack_aprova_o_de_or_amento_mobile/
│   └── techtrack_nova_ordem_de_servi_o/
├── prisma/                             # Schemas do banco e migrações SQL
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                            # Next.js App Router (Páginas e API Routes)
│   │   ├── (admin)/                    # Rotas do painel administrativo desktop
│   │   ├── (customer)/                 # Rotas do portal do cliente mobile-first
│   │   └── api/v1/                     # Endpoints REST públicos e autenticados
│   ├── modules/                        # Monólito Modular (Camadas de Domínio e Aplicação)
│   │   ├── auth/                       # Autenticação, guards e RBAC
│   │   ├── customers/                  # Gestão de clientes
│   │   ├── equipment/                  # Gestão de equipamentos
│   │   ├── service-orders/             # Ciclo de vida da OS, máquina de estados e histórico
│   │   └── budgets/                    # Orçamentos e transações atômicas de aprovação
│   └── shared/                         # Utilitários, lib do Prisma, middlewares e tipos comuns
├── .env.example                        # Modelo de variáveis de ambiente
├── package.json
└── tsconfig.json
```

### Divisão de Responsabilidades por Camada
1. **Presentation Layer:** Controllers REST, Next.js route handlers, DTOs, schemas de validação de payload (ex: Zod) e middlewares de autenticação/RBAC.
2. **Application Layer:** Casos de uso (Use Cases / Services) orquestrando o fluxo de dados (ex: `CreateServiceOrderUseCase`, `ApproveBudgetUseCase`).
3. **Domain Layer:** Entidades de negócio, invariantes, máquina de estados finita e regras de validação. Não depende de frameworks externos.
4. **Infrastructure Layer:** Repositórios Prisma, conexões com Supabase, cliente Clerk, serviços de log e integrações externas.

---

## 5. ⚡ Cheatsheet de Comandos Principais

Todos os comandos devem ser executados a partir do diretório onde reside o `package.json`:

### Setup e Dependências
```bash
# Instalação de dependências do projeto
npm install

# Configuração de variáveis de ambiente
cp .env.example .env
```

### Banco de Dados & Prisma
```bash
# Executar migrações pendentes em desenvolvimento
npx prisma migrate dev

# Atualizar e gerar os tipos do Prisma Client
npx prisma generate

# Abrir interface visual do banco de dados
npx prisma studio

# Executar seeds de dados iniciais (quando disponível)
npx prisma db seed
```

### Desenvolvimento e Build
```bash
# Iniciar ambiente de desenvolvimento (Frontend :3000 | Backend :3001)
npm run dev

# Build de produção
npm run build

# Iniciar build gerado em modo de produção
npm run start
```

### Qualidade, Lint e Testes
```bash
# Validação estática de tipos TypeScript (sem emitir arquivos)
npx tsc --noEmit

# Executar linter ESLint
npm run lint

# Executar suíte de testes unitários e de integração
npm run test

# Executar testes com relatório de cobertura de código
npm run test:coverage

# Executar testes End-to-End com Playwright
npm run test:e2e
```

---

## 6. 🛡️ Regras de Qualidade, Domínio, Testes e Logging

### 6.1 Máquina de Estados da Ordem de Serviço (OS)
A transição de status de uma OS obedece a uma máquina de estados finita rigorosa. O backend **deve rejeitar** qualquer transição fora do fluxo permitido retornando HTTP `400` ou `422`:

```text
RECEIVED ──► WAITING_DIAGNOSIS ──► IN_DIAGNOSIS
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
     (Exige Orçamento)                                   (Sem custo / Garantia)
             │                                                     │
             ▼                                                     │
      WAITING_APPROVAL                                             │
             │                                                     │
       ┌─────┴─────┐                                               │
       ▼           ▼                                               │
    APPROVED    REJECTED ──► CANCELLED                             │
       │                                                           │
       └──────────────────────────┬────────────────────────────────┘
                                  ▼
                              IN_REPAIR ──► COMPLETED ──► READY_FOR_PICKUP ──► DELIVERED
```
* **Cancelamento Administrativo:** O status `CANCELLED` só pode ser acionado por perfis autorizados a partir de estados anteriores à conclusão (`RECEIVED`, `WAITING_DIAGNOSIS`, `IN_DIAGNOSIS`, `REJECTED`).
* **Estado Final:** `DELIVERED` e `CANCELLED` são estados finais imutáveis.

### 6.2 Transações Atômicas (ACID)
A aprovação ou recusa de orçamento é uma operação de alto risco financeiro e operacional:
* A operação **deve** rodar dentro de uma transação (`prisma.$transaction`).
* Deve atualizar simultaneamente:
  1. O status do `Budget` para `APPROVED` ou `REJECTED`.
  2. O status da `ServiceOrder` correspondente para `APPROVED` (ou `IN_REPAIR`) / `REJECTED`.
  3. A criação de um registro imutável em `ServiceOrderHistory` contendo `user_id`, data/hora, status anterior, novo status e descrição da ação.
* Se qualquer etapa falhar, toda a operação deve sofrer **ROLLBACK**.

### 6.3 Regras de Segurança e RBAC
* **Backend Authority:** Nunca confie no frontend. Todas as permissões e isolamentos devem ser validados na camada de Presentation/Application.
* **Isolamento de Clientes:** Usuários com role `CUSTOMER` só podem consultar ordens cujo `customer.user_id` corresponda ao seu ID autenticado. Qualquer tentativa de acesso cruzado deve retornar HTTP `403` ou `404`.

### 6.4 Estratégia de Testes
* **Unitários:** Regras puras de domínio (cálculo de valores, máquina de estados, validações de DTO). Execução rápida e sem dependências externas.
* **Integração:** Validação dos use cases com banco de testes e validação de middlewares RBAC.
* **E2E:** Fluxos completos no Playwright (ex: login de cliente → visualização de orçamento → aprovação → conferência na linha do tempo).

### 6.5 Padrão de Logging e Observabilidade
* Registros estruturados em formato JSON com timestamp UTC, nível (`INFO`, `WARN`, `ERROR`), `contexto` do módulo e identificadores correlacionados (`order_number`, `user_id`).
* **Privacidade e LGPD:** Nunca registre senhas, tokens de autenticação (JWT), chaves de API ou dados de identificação sensíveis desnecessários nos logs de aplicação.

---

## 7. 🚦 Governança e Autonomia no Terminal

Para maximizar a produtividade sem comprometer a estabilidade do sistema, o agente deve operar sob os seguintes níveis de autorização:

### ✅ Autonomia Total (Executar sem pedir confirmação)
* Ler, buscar e analisar arquivos (`view_file`, `list_dir`, `find_by_name`, `grep_search`).
* Executar testes unitários e de integração (`npm run test`, `npm run test:coverage`).
* Executar checagem de tipos (`npx tsc --noEmit`) e linters (`npm run lint`).
* Executar builds locais e validar scripts (`npm run build`).
* Consultar status do git, branches e diffs (`git status`, `git diff`, `git log`).
* Criar e editar arquivos dentro do escopo da solicitação do usuário.

### ⛔ Ações Restritas (Exigem confirmação explícita do usuário)
* Executar comandos de exclusão destrutiva (`rm -rf`, deleção de diretórios inteiros fora do escopo, `git clean -fdx`).
* Comandos de reset ou reescrita de histórico no git (`git reset --hard`, `git checkout -- .`, `git push --force`).
* Executar migrações ou comandos destrutivos contra bancos de dados de produção (`prisma migrate reset`, `drop database`).
* Adicionar, expor ou comitar chaves de API secretas ou variáveis de ambiente reais no repositório.

---

## 8. 🌐 Uso do Context7 MCP para Documentação Atualizada

O projeto conta com integração ao **Context7** para consulta em tempo real a documentações oficiais atualizadas.

### Quando Consultar o Context7 MCP
* Antes de implementar novas funcionalidades que dependam de recursos recentes de:
  * **Next.js (App Router, Server Actions, Route Handlers, Middlewares)**
  * **Prisma (Transactions, Extensions, Accelerate, Migrations)**
  * **Clerk SDK (Next.js auth wrappers, RBAC helpers, JWT verification)**
  * **Supabase Client & Auth**
  * **Tailwind CSS & componentes de acessibilidade**
  * **Playwright (locators, fixtures, mocks)**
* Sempre que encontrar erros de depreciação de bibliotecas ou mudanças de API entre versões major.

### Como Operar
1. Verifique se a variável `CONTEXT7_API_KEY` está configurada no arquivo `.env`.
2. Utilize as ferramentas do MCP Context7 (`get_docs`, `search_docs` ou equivalentes) informando o nome da biblioteca e a consulta específica.
3. Aplique os exemplos canônicos recomendados pela documentação oficial obtida, evitando alucinações de sintaxes ultrapassadas.

---

## 9. 📚 Índice de Referências da Documentação do Projeto

Consulte os arquivos na pasta [`docs/`](docs/) para obter especificações completas de produto, arquitetura e interface:

* [`docs/problem.md`](docs/problem.md) — Definição do problema de negócio, dores dos clientes e das assistências técnicas.
* [`docs/prd.md`](docs/prd.md) — Requisitos de produto, personas (`ADMIN`, `ATTENDANT`, `TECHNICIAN`, `CUSTOMER`) e métricas de sucesso.
* [`docs/spec.md`](docs/spec.md) — Especificação técnica detalhada, modelo de dados, contratos de endpoints da API e casos de uso (UC01 a UC08).
* [`docs/architecture.md`](docs/architecture.md) — Decisões de arquitetura (ADRs), monólito modular em 4 camadas, segurança, transação ACID de aprovação e diagramas ERD/estado.
* [`docs/design.md`](docs/design.md) — Design system **Technical Precision System**, paleta de cores, tipografia e diretrizes visuais.
* [`stitch_techtrack/`](stitch_techtrack/) — Protótipos visuais e especificações de tela criadas no Stitch by Google.

---

## 10. 🔄 Aprendizado Contínuo e Protocolo Pós-Mudança

Após realizar qualquer alteração relevante no código (criação de funcionalidade, refatoração ou correção de bug), o agente de IA deve executar o seguinte ciclo de reflexão estruturado:

```text
┌─────────────────────────┐
│ 1. Validação Técnica     │ ➔ Testes passando, tipagem OK, invariantes preservados
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 2. Reflexão de Impacto  │ ➔ Análise de efeitos colaterais, integridade e débitos técnicos
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3. Sugestões de Evolução│ ➔ Próximos passos práticos e melhorias de arquitetura
└─────────────────────────┘
```

### Estrutura do Resumo Final ao Usuário
Ao concluir uma tarefa, o agente deve incluir no final de sua resposta:
1. **O que foi implementado/alterado:** Lista concisa dos arquivos modificados e objetivos atendidos.
2. **Resultados das validações:** Confirmação da execução de testes, linter e typecheck.
3. **Reflexão Técnica:** Lições aprendidas, possíveis pontos de atenção ou débitos técnicos notados.
4. **Sugestões de Melhoria Contínua:** 1 a 3 sugestões pragmáticas de melhorias futuras para o projeto (ex: cobertura adicional de testes, otimização de queries, novos índices no banco).

