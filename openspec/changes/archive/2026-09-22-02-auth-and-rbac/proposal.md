# Mudança 02: Autenticação, Gestão de Sessão e Controle de Acesso (RBAC)

## Why
O TechTrack possui 4 personas distintas com níveis de acesso estritamente segregados (`ADMIN`, `ATTENDANT`, `TECHNICIAN`, `CUSTOMER`). De acordo com os requisitos de segurança e arquitetura, o acesso ao painel administrativo e ao portal do cliente exige autenticação robusta e autorização validada no backend (Backend Authority). Esta mudança implementa a camada de autenticação com Clerk, mapeia os perfis de acesso no banco de dados e introduz a interface de login conforme o protótipo do Stitch.

## What Changes
- **Integração com Clerk:** Configuração do Clerk Next.js SDK (`@clerk/nextjs`), sincronização/webhook para persistência do usuário local na tabela `User` com seu respectivo `role`.
- **RBAC Guards e Middlewares:** Implementação de middlewares de rota no Next.js para proteger `/admin/*`, `/technician/*`, `/attendant/*` e `/portal/*`, rejeitando acessos não autorizados com HTTP 401/403.
- **Interface de Login:** Implementação da tela de autenticação responsiva baseada no protótipo [`stitch_techtrack/techtrack_login`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_login).
- **Sessão do Usuário:** Contexto global de autenticação no frontend e decoradores/helpers no backend para extração segura do `userId` e `role` a partir do token de sessão.

## Capabilities

### New Capabilities
- `user-authentication`: Fluxo de login, logout, recuperação de acesso e validação de sessão ativa.
- `rbac-guards`: Controle de permissões granular por papel no nível de rotas e use cases (Backend Authority).

### Modified Capabilities
*Nenhuma.*

## Impact
- **Código Afetado:** Criação do módulo `src/modules/auth/`, middleware de roteamento `src/middleware.ts`, e páginas de autenticação em `src/app/(auth)/login`.
- **APIs:** Endpoints de verificação de sessão e webhook de sincronização de usuários Clerk.
- **Dependências:** `@clerk/nextjs`, `svix` (para validação de webhooks).
- **Protótipo Associado:** [`stitch_techtrack/techtrack_login`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_login).

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Setup de SDK, criação de middlewares, sincronização com banco e tela de login. |
| **Complexidade** | **Média** | Gestão de sessão assíncrona, sincronização de webhook e isolamento de 4 roles. |
| **Risco** | **Médio** | Falhas de autorização podem comprometer a segurança de dados de ordens de serviço. |

### Escopo Funcional
- Login com credenciais seguras e autenticação gerenciada via Clerk.
- Mapeamento do usuário autenticado para a entidade relacional `User`.
- Redirecionamento condicional pós-login baseado no papel:
  - `ADMIN`, `ATTENDANT`, `TECHNICIAN` $\rightarrow$ Painel Administrativo.
  - `CUSTOMER` $\rightarrow$ Portal do Cliente.
- Proteção estrita de rotas administrativas contra acessos de clientes.

### Dependências
- `01-foundation-and-database`: Necessita da tabela `User` e enums do Prisma schema.

### Riscos e Mitigações
- **Dessincronia entre Clerk e PostgreSQL:** Implementação de webhook idempotente com tratamento de retry para criação do registro `User`.
- **Bypass de segurança no frontend:** Validação de permissões repetida na camada de Application/Controller (Backend Authority).

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Tipagem estrita em guards e zero erros de ESLint.

#### 2. Testes Unitários Necessários
- Teste da lógica de validação de RBAC (`hasRole(user, allowedRoles)`).
- Teste de decodificação e extração de payload de claims do usuário.
- Teste de redirecionamento de rotas baseado no perfil do usuário.

#### 3. Testes de Integração Necessários
- Teste do webhook do Clerk garantindo inserção/atualização do registro `User` no banco de dados.
- Teste de rota protegida: requisição sem token retorna `401 Unauthorized`.
- Teste de rota restrita: usuário com role `CUSTOMER` tentando acessar rota com guard `ADMIN` retorna `403 Forbidden`.

#### 4. Testes E2E Necessários
- Playwright E2E:
  - Tentativa de acesso direto à rota administrativa sem autenticação redirecionando para a tela de login.
  - Fluxo de login com perfil `ATTENDANT` validando redirecionamento para o dashboard.
  - Fluxo de login com perfil `CUSTOMER` validando redirecionamento para o portal do cliente.

