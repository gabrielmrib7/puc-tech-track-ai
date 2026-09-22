# Tarefas de Implementação: Mudança 01 — Fundação e Modelagem Relacional

## 1. Setup do Projeto e Tooling

- [x] 1.1 Inicializar `package.json` com dependências de produção (`next`, `react`, `react-dom`, `@prisma/client`, `zod`, `lucide-react`) e desenvolvimento (`typescript`, `@types/node`, `@types/react`, `prisma`, `tailwindcss`, `eslint`, `vitest`, `@playwright/test`) e verificar a integridade da instalação com `npm install`.
- [x] 1.2 Configurar `tsconfig.json` com modo estrito (`strict: true`, `target: ES2022`, aliases de caminho `@/*`) e verificar ausência de erros de sintaxe com `npx tsc --noEmit`.
- [x] 1.3 Configurar ESLint (`.eslintrc.json`) e scripts padronizados de validação no `package.json` (`lint`, `typecheck`, `test`, `test:e2e`), verificando execução limpa com `npm run lint`.

## 2. Design System e Estilização Base

- [x] 2.1 Configurar `tailwind.config.ts` com tokens do *Technical Precision System* (cor primária `#2563EB`, superfícies, escala tipográfica Inter e grade de 4px) e verificar a compilação do CSS global em `src/app/globals.css`.
- [x] 2.2 Criar layout raiz da aplicação (`src/app/layout.tsx`) com suporte a fontes Inter, metadados e estrutura HTML semântica, verificando inicialização no navegador.
- [x] 2.3 Integrar o logotipo oficial a partir de `stitch_techtrack/techtrack_logo/screen.png` em componente reutilizável `Logo` e verificar sua exibição correta na página de boas-vindas.

## 3. Modelagem Relacional e Banco de Dados (Prisma)

- [x] 3.1 Criar `prisma/schema.prisma` declarando enums (`UserRole`, `OrderStatus`, `BudgetStatus`) e entidades relacionais (`User`, `Customer`, `Equipment`, `ServiceOrder`, `Budget`, `ServiceOrderHistory`) com chaves estrangeiras e índices, verificando geração de tipos com `npx prisma generate`.
- [x] 3.2 Implementar cliente singleton do Prisma em `src/shared/infrastructure/database/prisma.ts` evitando múltiplas instâncias em ambiente de desenvolvimento e validar sua instanciação.
- [x] 3.3 Executar migração inicial no banco de dados PostgreSQL/Supabase (`npx prisma migrate dev --name init`) e verificar tabelas, enums e constraints criados com sucesso.

## 4. Testes Automatizados e Gates de Qualidade

- [x] 4.1 Configurar Vitest (`vitest.config.ts`) com suporte a paths `@/*` e implementar testes unitários para helpers de formatação monetária (BRL) e datas locais, verificando aprovação com `npm run test`.
- [x] 4.2 Implementar testes de integração para o singleton do Prisma testando inserção, consulta relacional 1:N e integridade de foreign keys, verificando aprovação com `npm run test`.
- [x] 4.3 Configurar Playwright (`playwright.config.ts`) e implementar smoke test da rota inicial `/` validando renderização de layout e estilos Tailwind sem exceções no console.
- [x] 4.4 Executar a suíte completa de verificação estática e testes (`npx tsc --noEmit`, `npm run lint`, `npm run test`), verificando que todos os critérios de aceite foram atendidos.
