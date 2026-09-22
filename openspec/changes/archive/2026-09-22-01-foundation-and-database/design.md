# Technical Design: Fundação do Projeto, Design Tokens e Modelagem Relacional

## Context
Consulte `proposal.md` para a motivação de negócio e escopo. O projeto está sendo inicializado a partir de uma estrutura limpa com Next.js (App Router), exigindo a montagem da arquitetura de 4 camadas:
- `src/app/` (Presentation / HTTP Routes)
- `src/modules/` (Modular Monolith: Domain + Application + Infrastructure)
- `src/shared/` (Shared Kernel, Prisma singleton, utilitários comuns)
- `prisma/` (Schema relacional e migrações SQL)

## Goals / Non-Goals

**Goals:**
- Configurar Next.js com TypeScript em modo estrito (`strict: true`).
- Configurar Tailwind CSS integrando os tokens exatos do *Technical Precision System* (cor primária `#2563EB`, superfícies, escala tipográfica Inter, grade de 4px).
- Modelar o schema relacional no `prisma/schema.prisma` cobrindo todas as entidades principais do sistema (`User`, `Customer`, `Equipment`, `ServiceOrder`, `Budget`, `ServiceOrderHistory`) com enums e índices.
- Configurar o harness de testes automatizados com Vitest (testes unitários e de integração) e Playwright (E2E).
- Estabelecer scripts padronizados de validação de qualidade (`tsc`, `lint`, `test`).

**Non-Goals:**
- Implementar fluxos de autenticação completos (escopo da Mudança 02).
- Desenvolver telas de CRUD de clientes ou ordens de serviço (escopo das Mudanças 03 e 04).
- Configurar pipelines de CI/CD em nuvem (GitHub Actions/Vercel) neste momento.

## Decisions

### 1. Monólito Modular em 4 Camadas
- **Decisão:** Separar o código dentro de `src/modules/<feature>/` em `domain`, `application` e `infrastructure`, mantendo a camada de apresentação desacoplada no Next.js App Router (`src/app/`).
- **Alternativas consideradas:**
  - *Arquitetura tradicional em camadas horizontais (`controllers/`, `services/`, `models/`)*: Rejeitada por favorecer alto acoplamento à medida que o sistema cresce.
  - *Microsserviços*: Rejeitada no ADR-001 por complexidade desnecessária para o escopo do MVP.
- **Justificativa:** Proporciona isolamento de domínio puro, testes unitários sem dependências de infraestrutura e transição fácil para microsserviços caso necessário no futuro.

### 2. Prisma ORM sobre PostgreSQL/Supabase
- **Decisão:** Utilizar Prisma com pooling de conexões recomendado pelo Supabase (`DATABASE_URL` para runtime e `DIRECT_URL` para migrations).
- **Alternativas consideradas:**
  - *TypeORM / Drizzle*: Drizzle é moderno, mas o ecossistema e tipagem declarativa do Prisma com gerador de schema simplificam o histórico de migrações e garantia de integridade ACID.
- **Justificativa:** O Prisma oferece validação estática de schema, geração automática de tipos TypeScript e suporte nativo a transações atômicas (`prisma.$transaction`).

### 3. Estrutura dos Modelos Relacionais
- **Modelos:**
  - `User`: Mapeia usuários autenticados via Clerk com `role` (`UserRole`).
  - `Customer`: Dados cadastrais do cliente vinculados opcionalmente ao `User` (`user_id`).
  - `Equipment`: Aparelhos associados 1:N ao `Customer`.
  - `ServiceOrder`: Ordem central com chave estrangeira para `Customer`, `Equipment`, técnico atribuído e enum de status (`OrderStatus`).
  - `Budget`: Orçamento financeiro com relação 1:1/1:N à OS e enum `BudgetStatus`.
  - `ServiceOrderHistory`: Tabela imutável de auditoria ligada a `ServiceOrder` e `User`.
- **Índices:** Índices em `ServiceOrder(order_number)`, `ServiceOrder(status)`, `ServiceOrder(created_at)`, `Customer(document)` e `Equipment(serial_number)`.

### 4. Harness de Testes Híbrido (Vitest + Playwright)
- **Decisão:** Vitest para testes unitários de domínio e testes de integração com banco de dados; Playwright para testes end-to-end de navegadores reais.
- **Alternativas consideradas:**
  - *Jest + Cypress*: Vitest possui execução significativamente mais rápida com Vite/ESBuild, e Playwright oferece melhor suporte a múltiplos viewports (mobile/desktop).

## Risks / Trade-offs

- **[Risco: Conexões esgotadas no Supabase em ambiente serverless]** $\rightarrow$ Mitigação: Configurar `connection_limit` e utilizar o PgBouncer/Supabase Connection Pooler (`DIRECT_URL` exclusiva para migrações).
- **[Risco: Desvio dos tokens visuais em relação ao protótipo do Stitch]** $\rightarrow$ Mitigação: Importar diretamente os valores hexadecimais e escalas tipográficas documentados em `stitch_techtrack/technical_precision_system/DESIGN.md`.
- **[Risco: Divergência entre enums do Prisma e a máquina de estados]** $\rightarrow$ Mitigação: Declarar os enums estritos no Prisma e tipá-los no TypeScript na camada de shared types.

