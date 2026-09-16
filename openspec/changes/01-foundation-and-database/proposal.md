# Mudança 01: Fundação do Projeto, Design Tokens e Modelagem Relacional

## Why
Para viabilizar a arquitetura do **TechTrack** em monólito modular de 4 camadas (Presentation, Application, Domain e Infrastructure) com integridade ACID, é fundamental estabelecer a fundação estrutural do projeto antes de qualquer implementação de negócio. Esta mudança cria o esqueleto da aplicação com Next.js App Router, configura os tokens do Design System oficial (*Technical Precision System*), estabelece o schema relacional no PostgreSQL/Supabase via Prisma ORM e configura a infraestrutura de linters e testes (Vitest e Playwright).

## What Changes
- **Setup e Tooling:** Configuração do Next.js (TypeScript em modo `strict: true`), ESLint, Prettier e scripts de validação de qualidade no `package.json`.
- **Design Tokens & Estilização:** Configuração do Tailwind CSS integrando a paleta de cores (`#2563EB`, variações de superfícies e estados), escala tipográfica com fonte Inter e grade de 4px conforme documentado em [`stitch_techtrack/technical_precision_system`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/technical_precision_system).
- **Esquema Relacional Prisma:** Criação do arquivo `prisma/schema.prisma` modelando as entidades `User`, `Customer`, `Equipment`, `ServiceOrder`, `Budget` e `ServiceOrderHistory`, com enums para `UserRole` (`ADMIN`, `ATTENDANT`, `TECHNICIAN`, `CUSTOMER`), `OrderStatus` e `BudgetStatus`, além de índices e chaves estrangeiras.
- **Harness de Testes:** Configuração do Vitest para testes unitários/integração e do Playwright para testes end-to-end com mocks e fixtures iniciais.
- **Asset da Marca:** Integração do logotipo oficial extraído de [`stitch_techtrack/techtrack_logo`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_logo).

## Capabilities

### New Capabilities
- `foundation-core`: Configuração base do monólito modular em 4 camadas, clientes de infraestrutura (Prisma Client singleton) e scripts de ciclo de desenvolvimento.
- `database-schema`: Definição e migração inicial do banco relacional PostgreSQL com integridade referencial estrita e auditoria imutável.

### Modified Capabilities
*Nenhuma (projeto inicial).*

## Impact
- **Código Afetado:** Criação da estrutura de pastas em `src/` (`src/app/`, `src/modules/`, `src/shared/`), `prisma/` e arquivos de configuração raiz.
- **APIs:** Setup do roteador base da API REST `/api/v1`.
- **Dependências:** `@prisma/client`, `prisma`, `tailwindcss`, `@types/node`, `typescript`, `vitest`, `@playwright/test`, `zod`, `lucide-react`.

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Criação da infraestrutura base, arquivos de configuração e schema de banco. |
| **Complexidade** | **Média** | Modelagem relacional completa com integridade referencial e setup de múltiplos runners de teste. |
| **Risco** | **Baixo** | Não envolve migração de dados legados ou regras de negócio em produção. |

### Escopo Funcional
- Inicialização do projeto Next.js com App Router.
- Configuração do Tailwind CSS com tokens do Technical Precision System.
- Definição do schema relacional no Prisma com relacionamentos 1:N e chaves estrangeiras.
- Configuração de conexões com PostgreSQL/Supabase.
- Configuração dos ambientes de teste (Vitest e Playwright).

### Dependências
- Nenhuma (Mudança inaugural).

### Riscos e Mitigações
- **Incompatibilidade de drivers ou conexão com Supabase:** Utilização de pooling de conexões recomendado na documentação do Supabase e Prisma.
- **Divergência de tokens visuais:** Uso dos valores exatos extraídos do arquivo `DESIGN.md` do Stitch.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Zero erros de tipagem estática e zero advertências de linter.

#### 2. Testes Unitários Necessários
- Teste de instanciação do singleton do Prisma Client.
- Teste de parsing e validação de variáveis de ambiente obrigatórias (`DATABASE_URL`, etc.).
- Testes unitários de utilitários de formatação de moeda (BRL) e datas.

#### 3. Testes de Integração Necessários
- Teste de conexão efetiva com o banco de dados de teste via Prisma.
- Teste de migração (`prisma migrate dev`) gerando tabelas, constraints e enums corretamente.
- Teste de inserção e consulta relacional básica (garantindo foreign keys ativas).

#### 4. Testes E2E Necessários
- Playwright smoke test: Abertura da aplicação na rota `/` verificando renderização inicial do layout e carregamento dos estilos Tailwind sem erros no console do navegador.

