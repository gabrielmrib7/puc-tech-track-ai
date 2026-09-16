<p align="center">
  <img src="stitch_techtrack/techtrack_logo/screen.png" alt="TechTrack Logo" width="180" />
</p>

<h1 align="center">TechTrack</h1>

<p align="center">
  <strong>Plataforma inteligente e transparente para gestão de ordens de serviço e rastreamento em tempo real para assistências técnicas.</strong>
</p>

<p align="center">
  <a href="#-visão-geral-e-problema">Visão Geral</a> •
  <a href="#-principais-funcionalidades">Funcionalidades</a> •
  <a href="#-demonstração-visual-uiux">Demonstração</a> •
  <a href="#-ciclo-de-vida-da-ordem-de-serviço">Ciclo da OS</a> •
  <a href="#-arquitetura-e-modelo-de-dados">Arquitetura</a> •
  <a href="#-stack-tecnológica">Stack</a> •
  <a href="#-como-executar-o-projeto">Como Executar</a> •
  <a href="#-variáveis-de-ambiente">Configuração</a> •
  <a href="#-endpoints-da-api">API</a> •
  <a href="#-contribuição">Contribuição</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-MVP%20v1.0-2563EB?style=for-the-badge" alt="Status MVP" />
  <img src="https://img.shields.io/badge/Architecture-Modular%20Monolith-0F172A?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%20%7C%20TypeScript-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Auth-Clerk%20(RBAC)-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT" />
</p>

---

## 📌 Visão Geral e Problema

Em pequenas e médias assistências técnicas de computadores, smartphones e eletrônicos em geral, os clientes enfrentam uma **baixa visibilidade sobre o andamento dos reparos**. O fluxo comum após entregar um equipamento depende de ligações, mensagens de WhatsApp ou visitas presenciais para saber se o diagnóstico foi feito, se há orçamento, se o reparo iniciou ou se o produto está pronto para retirada.

Para a assistência técnica, isso gera:
- Sobrecarga no atendimento com perguntas repetitivas de status.
- Dispersão de informações entre papéis, planilhas e aplicativos de mensagem.
- Risco de retrabalho, inconsistências de prazos e insegurança jurídica (em desacordo com as diretrizes do Procon para comprovação de ordens de serviço).

### A Solução TechTrack

O **TechTrack** é uma solução web modular e responsiva que centraliza todo o ciclo de vida das ordens de serviço:
1. **Painel Administrativo Desktop:** Focado em alta eficiência operacional para atendentes, técnicos e administradores cadastrarem clientes, registrarem diagnósticos, emitirem orçamentos e atualizarem status.
2. **Portal do Cliente Mobile-First:** Ambiente direto onde o cliente acompanha em tempo real a linha do tempo do conserto, consulta detalhes do defeito e do diagnóstico, e **aprova ou recusa orçamentos com apenas 1 clique**.

---

## 🎯 Objetivos e Métricas de Sucesso

| Métrica | Meta do MVP | Descrição |
| :--- | :--- | :--- |
| **Redução de Contatos** | **≥ 30%** | Queda em contatos manuais feitos exclusivamente para perguntar *"Como está meu aparelho?"*. |
| **Adesão Digital** | **≥ 80%** | Percentual de clientes que utilizam o link digital para acompanhar o reparo. |
| **Precisão de Status** | **≥ 90%** | Ordens de serviço mantidas com status atualizado pela equipe técnica em tempo hábil. |
| **Tempo de Consulta** | **< 1 minuto** | Tempo médio para um cliente ou atendente localizar e consultar a situação da OS. |
| **Satisfação (CSAT)** | **≥ 4 / 5** | Avaliação média da experiência de acompanhamento reportada pelos clientes. |

---

## 👥 Perfis de Usuário (RBAC)

O sistema conta com controle de acesso baseado em funções (*Role-Based Access Control*):

* 👑 **Administrador (`ADMIN`):** Gestão integral da plataforma, gerenciamento de colaboradores e usuários, controle operacional e auditoria completa.
* 📋 **Atendente (`ATTENDANT`):** Cadastro de clientes e equipamentos, abertura de Ordens de Serviço, atendimento inicial e entrega final de equipamentos.
* 🔧 **Técnico (`TECHNICIAN`):** Execução e registro de laudo/diagnóstico técnico, elaboração de orçamentos, execução dos reparos e sinalização de conclusão.
* 📱 **Cliente (`CUSTOMER`):** Acesso estrito às suas próprias ordens de serviço, visualização da linha do tempo, histórico do reparo e aprovação/recusa de orçamentos.

---

## ✨ Principais Funcionalidades

### 🖥️ Painel Administrativo
- **Dashboard com Indicadores em Tempo Real:** Quantidade de OS abertas, em diagnóstico, aguardando aprovação, em reparo e prontas para retirada.
- **Seção "Ordens que Precisam de Atenção":** Alertas imediatos para orçamentos pendentes há mais de 48h, prazos próximos do vencimento e peças aguardando peças.
- **Gestão de Ordens de Serviço (OS):** Emissão com identificador exclusivo formatado (`OS-AAAA-XXXXXX`), vinculação cliente-equipamento, checklist de acessórios e defeito relatado.
- **Diagnóstico & Orçamento:** Lançamento de diagnósticos técnicos, valores de mão de obra e peças, além de prazos estimados de entrega.
- **Filtros e Busca Rápida:** Localização de ordens por cliente, número da OS, equipamento ou status em segundos.

### 📱 Portal do Cliente (Mobile-First)
- **Linha do Tempo Visual:** Progresso intuitivo etapa por etapa (*Recebido → Diagnóstico → Orçamento → Em Reparo → Concluído → Pronto para Retirada*).
- **Módulo de Decisão de Orçamento:** Interface clara exibindo o valor total, descrição dos serviços/peças e botões diretos de **Aprovar** ou **Recusar** com modal de confirmação.
- **Previsão de Conclusão e Orientações:** Informações sobre prazos previstos e instruções claras para retirada na loja.
- **Histórico Auditável:** Registro transparente das atualizações já ocorridas.

---

## 📱 Demonstração Visual (UI/UX)

Desenvolvido sob o design system **Technical Precision System** (tipografia *Inter*, grade base de 4px, paleta azul corporativa `#2563EB` e alto contraste WCAG).

<table align="center">
  <tr>
    <th width="65%">🖥️ Dashboard Administrativo</th>
    <th width="35%">📱 Portal do Cliente (Mobile)</th>
  </tr>
  <tr>
    <td align="center">
      <img src="stitch_techtrack/techtrack_dashboard_administrativo/screen.png" alt="Dashboard Administrativo" width="100%" />
    </td>
    <td align="center">
      <img src="stitch_techtrack/techtrack_portal_do_cliente_mobile/screen.png" alt="Portal do Cliente Mobile" width="100%" />
    </td>
  </tr>
  <tr>
    <th width="65%">🔧 Detalhes da Ordem de Serviço</th>
    <th width="35%">💰 Aprovação de Orçamento (Mobile)</th>
  </tr>
  <tr>
    <td align="center">
      <img src="stitch_techtrack/techtrack_detalhes_da_ordem_adm/screen.png" alt="Detalhes da Ordem Administrativa" width="100%" />
    </td>
    <td align="center">
      <img src="stitch_techtrack/techtrack_aprova_o_de_or_amento_mobile/screen.png" alt="Aprovação de Orçamento Mobile" width="100%" />
    </td>
  </tr>
</table>

---

## 🔄 Ciclo de Vida da Ordem de Serviço

As ordens de serviço funcionam sob uma **máquina de estados finita** estritamente validada pela camada de domínio do backend:

```mermaid
stateDiagram-v2
    [*] --> RECEIVED: Entrada do Equipamento
    RECEIVED --> WAITING_DIAGNOSIS: Triagem Inicial
    WAITING_DIAGNOSIS --> IN_DIAGNOSIS: Técnico inicia análise
    
    state has_budget <<choice>>
    IN_DIAGNOSIS --> has_budget: Laudo emitido
    
    has_budget --> WAITING_APPROVAL: Exige orçamento
    has_budget --> IN_REPAIR: Sem custo / Garantia
    
    state client_decision <<choice>>
    WAITING_APPROVAL --> client_decision: Cliente analisa orçamento
    
    client_decision --> APPROVED: Cliente aprova
    client_decision --> REJECTED: Cliente recusa
    
    REJECTED --> CANCELLED: Devolução sem reparo
    
    APPROVED --> IN_REPAIR: Reparo iniciado
    IN_REPAIR --> COMPLETED: Reparo concluído pelo técnico
    COMPLETED --> READY_FOR_PICKUP: Equipamento pronto
    READY_FOR_PICKUP --> DELIVERED: Entregue ao cliente
    
    RECEIVED --> CANCELLED: Cancelamento administrativo
    WAITING_DIAGNOSIS --> CANCELLED: Cancelamento administrativo
    IN_DIAGNOSIS --> CANCELLED: Cancelamento administrativo
    
    DELIVERED --> [*]
    CANCELLED --> [*]
```

> [!IMPORTANT]
> **Transação Atômica de Aprovação:** A aprovação ou recusa de orçamento opera em uma única transação ACID no banco de dados. Atualiza o status do orçamento, o status da OS e insere o evento imutável na tabela de histórico simultaneamente.

---

## 🏗️ Arquitetura e Modelo de Dados

O projeto adota uma arquitetura de **Monólito Modular** em camadas, garantindo baixo custo operacional e alta manutenibilidade:

```text
techtrack/
├── Presentation Layer    --> Controllers REST API, DTOs, Middlewares de Autenticação/RBAC
├── Application Layer     --> Casos de Uso (CreateOrder, RegisterDiagnosis, ApproveBudget, etc.)
├── Domain Layer          --> Entidades de Domínio, Validações de Máquina de Estados, Regras de Negócio
└── Infrastructure Layer  --> Repositórios SQL/Prisma, Conexão Supabase/PostgreSQL, Logs e Serviços Externos
```

### Diagrama Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    USER ||--o{ CUSTOMER : "associa"
    CUSTOMER ||--|{ EQUIPMENT : "possui"
    CUSTOMER ||--|{ SERVICE_ORDER : "solicita"
    EQUIPMENT ||--|{ SERVICE_ORDER : "objeto_de"
    USER ||--o{ SERVICE_ORDER : "tecnico_responsavel"
    SERVICE_ORDER ||--o| BUDGET : "possui"
    SERVICE_ORDER ||--|{ SERVICE_ORDER_HISTORY : "registra"
    USER ||--o{ SERVICE_ORDER_HISTORY : "autor_da_acao"

    USER {
        uuid id PK
        string name
        string email
        string role "ADMIN | ATTENDANT | TECHNICIAN | CUSTOMER"
        boolean active
        datetime created_at
    }

    CUSTOMER {
        uuid id PK
        uuid user_id FK
        string name
        string email
        string phone
        string document
        datetime created_at
    }

    EQUIPMENT {
        uuid id PK
        uuid customer_id FK
        string type "Notebook, Smartphone, Desktop, etc."
        string brand
        string model
        string serial_number
        text reported_problem
        text accessories
    }

    SERVICE_ORDER {
        uuid id PK
        string order_number UK "Ex: OS-2026-000123"
        uuid customer_id FK
        uuid equipment_id FK
        uuid technician_id FK
        string status "RECEIVED, IN_DIAGNOSIS, WAITING_APPROVAL, IN_REPAIR, etc."
        datetime entry_date
        date estimated_completion
        text diagnosis
        datetime completed_at
        datetime delivered_at
    }

    BUDGET {
        uuid id PK
        uuid service_order_id FK
        decimal amount
        text description
        string status "PENDING | APPROVED | REJECTED"
        datetime decided_at
    }

    SERVICE_ORDER_HISTORY {
        uuid id PK
        uuid service_order_id FK
        uuid user_id FK
        string action
        string old_status
        string new_status
        text description
        datetime created_at
    }
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React 18+) & TypeScript | Renderização híbrida (SSR/CSR), performance e tipagem estática. |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) & Lucide Icons | Design system responsivo e biblioteca moderna de ícones vetoriais. |
| **Backend** | Node.js / TypeScript (Next.js API Routes / NestJS) | API REST escalável organizada em módulos funcionais. |
| **Banco de Dados**| [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) | Banco relacional robusto com integridade referencial e suporte a transações. |
| **Autenticação** | [Clerk](https://clerk.com/) | Gestão de sessões seguras, tokens JWT, MFA e RBAC. |
| **Deploy & Cloud** | [Vercel](https://vercel.com/) & Docker | Plataforma de hospedagem serverless com pipeline de CI/CD contínuo. |
| **Prototipação** | Stitch by Google | Especificação de componentes e design visual funcional. |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18.x ou superior
- Gerenciador de pacotes [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)
- Instância PostgreSQL ou conta no [Supabase](https://supabase.com/)
- Conta configurada no [Clerk](https://clerk.com/)

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/tech_Track.git
cd tech_Track/tech_Track
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha as variáveis de autenticação e banco:
```bash
cp .env.example .env
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Executar Migrações do Banco de Dados
```bash
npx prisma migrate dev
# ou executar os scripts SQL no Supabase Dashboard
```

### 5. Iniciar o Ambiente de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em:
- **Frontend / Portal:** [http://localhost:3000](http://localhost:3000)
- **API Endpoint:** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

---

## 🔐 Variáveis de Ambiente

As variáveis necessárias para configuração da aplicação estão presentes no arquivo `.env`:

| Variável | Descrição | Exemplo / Padrão |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Nome identificador da aplicação | `tech_Track` |
| `GLOBAL_PREFIX` | Prefixo global dos endpoints REST | `api/v1` |
| `FRONTEND_PORT` | Porta de execução do frontend | `3000` |
| `BACKEND_PORT` | Porta de execução do backend | `3001` |
| `NEXT_PUBLIC_API_URL` | URL base consumida pelo frontend | `http://localhost:3000/api/v1` |
| `DATABASE_URL` | String de conexão com o PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Conexão direta com Supabase para migrações | `postgresql://...` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública da API do Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública anônima do Supabase | `eyJhbGciOi...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`| Chave pública da aplicação Clerk | `pk_test_...` |
| `CLERK_SECRET_KEY` | Chave secreta de backend Clerk | `sk_test_...` |
| `CLERK_JWT_KEY` | Chave pública RSA para validação JWT | `-----BEGIN PUBLIC KEY----- ...` |

> [!CAUTION]
> **Segurança:** Nunca comite chaves secretas ou credenciais em repositórios públicos. Utilize o arquivo `.env` estritamente local e configure *Environment Secrets* na Vercel/GitHub Actions.

---

## 📡 Endpoints da API

A API segue os padrões REST com respostas em formato JSON e códigos HTTP semânticos:

### 🔑 Autenticação & Sessão
- `POST /api/v1/auth/login` — Autenticação de usuários e geração de sessão/token.
- `POST /api/v1/auth/logout` — Encerramento de sessão ativa.
- `POST /api/v1/auth/forgot-password` — Solicitação de redefinição de senha.

### 👤 Clientes
- `GET /api/v1/customers` — Listagem paginada de clientes.
- `POST /api/v1/customers` — Cadastro de novo cliente.
- `GET /api/v1/customers/:id` — Detalhes do cliente e histórico de OS.
- `PUT /api/v1/customers/:id` — Atualização de dados cadastrais.

### 💻 Equipamentos
- `GET /api/v1/equipment` — Listagem de equipamentos.
- `POST /api/v1/equipment` — Vínculo de equipamento a um cliente.
- `GET /api/v1/equipment/:id` — Ficha técnica e histórico do equipamento.

### 📋 Ordens de Serviço
- `GET /api/v1/service-orders` — Listagem com filtros por status, cliente e período.
- `POST /api/v1/service-orders` — Abertura de nova OS com identificador exclusivo.
- `GET /api/v1/service-orders/:id` — Detalhes completos da OS.
- `PATCH /api/v1/service-orders/:id/status` — Atualização de status com validação de transição.
- `PATCH /api/v1/service-orders/:id/diagnosis` — Registro de laudo técnico pelo profissional.
- `GET /api/v1/service-orders/:id/history` — Trilha de auditoria da ordem.

### 💰 Orçamentos
- `POST /api/v1/service-orders/:id/budget` — Emissão de orçamento pela assistência.
- `PATCH /api/v1/service-orders/:id/budget/approve` — Aprovação formal pelo cliente.
- `PATCH /api/v1/service-orders/:id/budget/reject` — Recusa do orçamento pelo cliente.

---

## 🧪 Estratégia de Testes

Para garantir a confiabilidade operacional e evitar quebras de regras de negócio, o TechTrack adota a pirâmide de testes automatizados:

- **Testes Unitários:** Validação das regras de domínio (máquina de estados, bloqueio de transições inválidas, cálculo de orçamentos).
- **Testes de Integração:** Validação dos endpoints REST, autenticação com Clerk, restrições RBAC e persistência com rollback em caso de falha.
- **Testes End-to-End (E2E):** Cobertura dos fluxos completos (*Abertura de OS → Diagnóstico → Envio de Orçamento → Aprovação pelo Cliente → Conclusão do Reparo → Retirada*).

Comandos para execução:
```bash
# Executar testes unitários e de integração
npm run test

# Executar testes com cobertura de código
npm run test:coverage

# Executar testes E2E (Playwright)
npm run test:e2e
```

---

## 🗺️ Roadmap (Pós-MVP)

- [ ] 📲 Notificações automáticas via WhatsApp (Meta Cloud API) e E-mail a cada avanço de status.
- [ ] 💳 Pagamento online integrado via Pix e Cartão de Crédito diretamente pelo portal do cliente.
- [ ] 📦 Controle básico de estoque de peças e reposição de insumos.
- [ ] 🧾 Emissão de recibos e integração com emissão de Nota Fiscal de Serviço (NFS-e).
- [ ] 🤖 Assistente com IA para apoio na categorização de defeitos e sugestão de diagnósticos.
- [ ] 📱 Aplicativo móvel nativo (iOS / Android) para técnicos realizarem fotos do estado inicial do aparelho.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir com o projeto:

1. Faça um **Fork** do projeto.
2. Crie uma branch para sua funcionalidade ou correção:
   ```bash
   git checkout -b feat/nova-funcionalidade
   ```
3. Realize seus commits seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
   ```bash
   git commit -m "feat(service-order): adiciona validacao de transicao de status"
   ```
4. Envie sua branch para o repositório remoto:
   ```bash
   git push origin feat/nova-funcionalidade
   ```
5. Abra um **Pull Request** detalhando as alterações e referenciando as issues relacionadas.

---

## 💬 Suporte e Dúvidas

Se você encontrar algum bug ou tiver sugestões de melhorias:
- Abra uma [Issue no GitHub](https://github.com/seu-usuario/tech_Track/issues).
- Consulte a documentação técnica detalhada no diretório [`docs/`](docs/):
  - [`problem.md`](docs/problem.md) — Definição do problema e público-alvo.
  - [`prd.md`](docs/prd.md) — Requisitos do produto e regras de negócio.
  - [`spec.md`](docs/spec.md) — Especificação técnica detalhada e casos de uso.
  - [`architecture.md`](docs/architecture.md) — Arquitetura de software e ADRs.
  - [`design.md`](docs/design.md) — Design system e diretrizes de UI/UX.

---

## 📄 Licença

Este projeto está licenciado sob os termos da licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

<p align="center">
  Desenvolvido com foco em precisão técnica, confiabilidade e transparência.
</p>

