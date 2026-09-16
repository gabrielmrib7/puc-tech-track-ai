# 🗺️ Roadmap de Implementação Incremental — TechTrack

> **Resumo do Planejamento e Estratégia de Entregas**  
> Documento orientador para o desenvolvimento incremental full stack da plataforma TechTrack.  
> Baseado em [`docs/prd.md`](docs/prd.md), [`docs/spec.md`](docs/spec.md), [`docs/architecture.md`](docs/architecture.md), [`docs/design.md`](docs/design.md) e protótipos em [`stitch_techtrack/`](stitch_techtrack/).

---

## 1. 🎯 Visão Geral e Princípios de Governança

Para garantir que o produto seja entregue com alta confiabilidade, estabilidade e sem débitos técnicos, todas as mudanças foram dimensionadas respeitando os seguintes critérios:
* **Teto de Complexidade:** Nenhuma mudança possui tamanho, complexidade ou risco classificado como **Alto** (todas classificadas entre **Baixo** e **Médio**).
* **Invariantes Arquiteturais:** Arquitetura em 4 camadas (*Presentation*, *Application*, *Domain*, *Infrastructure*), Backend Authority estrito, máquina de estados finita no domínio e transações atômicas ACID para orçamentos.
* **Governança de Qualidade (Definição de Feito):** Nenhuma mudança é considerada concluída sem a aprovação estática de linter/tipos (`npm run lint`, `npx tsc --noEmit`) e sem a passagem total de seus respectivos **Testes Unitários**, **Testes de Integração** e **Testes End-to-End (Playwright)**.

---

## 2. 📊 Matriz Comparativa do Planejamento

| ID | Mudança | Tamanho | Complexidade | Risco | Protótipo Stitch | Dependências |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- |
| **01** | **Fundação e Modelagem Relacional** | Médio | Média | Baixo | `technical_precision_system`, `techtrack_logo` | *Nenhuma* |
| **02** | **Autenticação e RBAC** | Médio | Média | Médio | `techtrack_login` | `01` |
| **03** | **Gestão de Clientes e Equipamentos** | Médio | Baixa | Baixo | `techtrack_nova_ordem_de_servi_o` (seção cadastral) | `01`, `02` |
| **04** | **Abertura, Triagem e Listagem de OS** | Médio | Média | Médio | `techtrack_nova_ordem_de_servi_o`, `techtrack_lista_de_ordens` | `03` |
| **05** | **Diagnóstico Técnico e Máquina de Estados** | Médio | Média | Médio | `techtrack_detalhes_da_ordem_adm` | `04` |
| **06** | **Orçamentos e Transação ACID de Decisão** | Médio | Média | Médio | `techtrack_aprova_o_de_or_amento_mobile` | `05` |
| **07** | **Portal do Cliente Mobile-First** | Médio | Média | Médio | `techtrack_portal_do_cliente_mobile` | `06` |
| **08** | **Dashboard Administrativo e Entrega Final** | Médio | Média | Baixo | `techtrack_dashboard_administrativo` | `07` |

---

## 3. 🧩 Detalhamento Incremental das Mudanças

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

---

### [Mudança 01: Fundação do Projeto, Design Tokens e Modelagem Relacional](openspec/changes/01-foundation-and-database/proposal.md)
* **Escopo Funcional:** Setup inicial Next.js App Router (TypeScript `strict: true`), configuração do Tailwind CSS com tokens do Technical Precision System (`#2563EB`, grade 4px, WCAG AA, fonte Inter), modelagem relacional completa em `prisma/schema.prisma` com PostgreSQL/Supabase e setup dos runners Vitest e Playwright.
* **Dependências:** Nenhuma.
* **Riscos (Baixo):** Incompatibilidade inicial de conexão ou pooling com Supabase.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Validação de instanciação do singleton do Prisma, validação de variáveis de ambiente e utilitários de formatação.
* **Testes de Integração:** Conexão com banco de dados de teste, execução e validação da migração inicial do Prisma e integridade referencial.
* **Testes E2E:** Smoke test Playwright validando inicialização do servidor, renderização da rota base e carregamento dos estilos.

---

### [Mudança 02: Autenticação, Gestão de Sessão e Controle de Acesso (RBAC)](openspec/changes/02-auth-and-rbac/proposal.md)
* **Escopo Funcional:** Autenticação via Clerk, sincronização bidirecional de usuários locais na tabela `User`, aplicação de RBAC estrito (`ADMIN`, `ATTENDANT`, `TECHNICIAN`, `CUSTOMER`) em rotas e use cases, e implementação da interface de login responsiva.
* **Protótipo Stitch:** [`stitch_techtrack/techtrack_login`](stitch_techtrack/techtrack_login/)
* **Dependências:** `01-foundation-and-database`.
* **Riscos (Médio):** Dessincronia entre sessão Clerk e registro local no banco; brechas de autorização em rotas de API.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Lógica de decodificação de claims, guard de papéis (`hasRole`) e regras de redirecionamento.
* **Testes de Integração:** Webhook de provisionamento de usuário, teste de rotas protegidas (rejeição com `401 Unauthorized` e `403 Forbidden`).
* **Testes E2E:** Fluxo de login de diferentes perfis (`ATTENDANT` e `CUSTOMER`) validando redirecionamentos corretos e bloqueio de rotas não autorizadas.

---

### [Mudança 03: Gestão de Clientes e Cadastro de Equipamentos](openspec/changes/03-customers-and-equipment/proposal.md)
* **Escopo Funcional:** UC01 (Cadastrar/Editar Cliente) e UC02 (Cadastrar/Editar Equipamento). Endpoints REST `/api/v1/customers` e `/api/v1/equipment`, schemas de validação Zod (CPF/CNPJ, telefone, serial number) e componentes de seleção e cadastro ágil.
* **Protótipo Stitch:** Componentes de busca e cadastro em [`stitch_techtrack/techtrack_nova_ordem_de_servi_o`](stitch_techtrack/techtrack_nova_ordem_de_servi_o/)
* **Dependências:** `01-foundation-and-database`, `02-auth-and-rbac`.
* **Riscos (Baixo):** Inconsistência ou duplicidade no cadastro de documentos/seriais.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Schemas Zod de cliente e equipamento, validação de documento fiscal e regras de domínio puro.
* **Testes de Integração:** Persistência relacional 1:N no Prisma (cliente com múltiplos aparelhos), queries de busca com paginação.
* **Testes E2E:** Atendente autenticado realiza o cadastro de um novo cliente e vincula um equipamento com sucesso.

---

### [Mudança 04: Abertura, Triagem e Listagem de Ordens de Serviço](openspec/changes/04-service-order-intake/proposal.md)
* **Escopo Funcional:** UC03 (Criar OS). Geração do identificador sequencial `OS-YYYY-XXXXXX`, checklist de triagem (defeito reclamado, estado de conservação, acessórios deixados), status inicial `RECEIVED`, e interface tabular desktop para listagem, filtros avançados e busca rápida.
* **Protótipos Stitch:** [`stitch_techtrack/techtrack_nova_ordem_de_servi_o`](stitch_techtrack/techtrack_nova_ordem_de_servi_o/) e [`stitch_techtrack/techtrack_lista_de_ordens`](stitch_techtrack/techtrack_lista_de_ordens/)
* **Dependências:** `03-customers-and-equipment`.
* **Riscos (Médio):** Colisão concorrente na geração do número de OS; lentidão na busca e filtragem da tabela.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Formatação do identificador de OS, validação de campos obrigatórios de triagem e cálculo de paginação.
* **Testes de Integração:** Criação de OS via API (`POST /api/v1/service-orders`), auditoria inicial em `ServiceOrderHistory` e endpoints de listagem paginada.
* **Testes E2E:** Atendente preenche o formulário de triagem, abre uma nova OS e valida sua presença imediata na tabela de ordens de serviço.

---

### [Mudança 05: Diagnóstico Técnico e Motor da Máquina de Estados Finita](openspec/changes/05-diagnosis-and-state-machine/proposal.md)
* **Escopo Funcional:** UC04 (Registrar Diagnóstico) e UC07 (Atualizar Status). Motor rígido de máquina de estados no domínio com validação de transições válidas e rejeição estrita de saltos ilegais (HTTP 400/422). Registro imutável de histórico a cada evento. Tela desktop de detalhes da OS.
* **Protótipo Stitch:** [`stitch_techtrack/techtrack_detalhes_da_ordem_adm`](stitch_techtrack/techtrack_detalhes_da_ordem_adm/)
* **Dependências:** `04-service-order-intake`.
* **Riscos (Médio):** Inconsistência de fluxo caso requisições externas burlem a máquina de estados.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Matriz de transições de status válidas e inválidas, imutabilidade de estados finais e controle de permissões por perfil.
* **Testes de Integração:** Endpoint `PATCH /api/v1/service-orders/:id/status` garantindo persistência em `ServiceOrderHistory` e rollback em caso de transição rejeitada.
* **Testes E2E:** Técnico inicia o diagnóstico de uma OS, registra laudo técnico e conclui a transição para `WAITING_APPROVAL`, validando a timeline na tela de detalhes.

---

### [Mudança 06: Gestão de Orçamentos e Transação Atômica de Decisão (ACID)](openspec/changes/06-budgets-and-acid-approval/proposal.md)
* **Escopo Funcional:** UC05 (Emitir Orçamento) e UC06 (Aprovar/Recusar Orçamento). Discriminação de peças e mão de obra. Execução atômica via `prisma.$transaction` sincronizando Budget, ServiceOrder e ServiceOrderHistory com rollback integral em qualquer falha. Tela mobile de aprovação em 1 clique.
* **Protótipo Stitch:** [`stitch_techtrack/techtrack_aprova_o_de_or_amento_mobile`](stitch_techtrack/techtrack_aprova_o_de_or_amento_mobile/)
* **Dependências:** `05-diagnosis-and-state-machine`.
* **Riscos (Médio):** Inconsistência financeira por atualizações parciais ou race conditions de aprovação duplicada.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Cálculo aritmético de itens e totais do orçamento, regras de expiração e bloqueio de decisão em ordens já concluídas.
* **Testes de Integração:** Validação da transação ACID (sucesso e rollback forçado), teste de concorrência com rejeição de clique duplo (`409 Conflict`), isolamento de cliente (`403 Forbidden`).
* **Testes E2E:** Cliente recebe e visualiza orçamento no smartphone, clica em "Aprovar Orçamento" e verifica a transição instantânea para "Em Reparo".

---

### [Mudança 07: Portal do Cliente Mobile-First e Linha do Tempo Humanizada](openspec/changes/07-customer-portal-mobile/proposal.md)
* **Escopo Funcional:** UC08 (Consultar OS pelo Cliente). Portal mobile responsivo, isolamento multi-inquilino estrito (`customer.user_id = authenticatedUserId`), apresentação de timeline transparente e humanizada ("Reparo em Andamento", "Pronto para Retirada").
* **Protótipo Stitch:** [`stitch_techtrack/techtrack_portal_do_cliente_mobile`](stitch_techtrack/techtrack_portal_do_cliente_mobile/)
* **Dependências:** `06-budgets-and-acid-approval`.
* **Riscos (Médio):** Vazamento de ordens entre clientes (cross-tenant data breach / IDOR) e quebra de layout mobile.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Mapeador de enums para status humanizados e ordenação temporal de eventos da timeline.
* **Testes de Integração:** Isolamento estrito no backend (Cliente A consultando ordem de Cliente B recebe `403 Forbidden` ou `404 Not Found`).
* **Testes E2E:** Cliente autenticado navega pelo portal em viewport mobile, visualiza o card do aparelho e confere as etapas concluídas na linha do tempo.

---

### [Mudança 08: Dashboard Administrativo e Fluxo de Entrega Final](openspec/changes/08-admin-dashboard-and-delivery/proposal.md)
* **Escopo Funcional:** Painel analítico gerencial com métricas operacionais consolidadas (OS por status, tempo médio de permanência, faturamento pendente). Encerramento do ciclo de atendimento no balcão com transição de `READY_FOR_PICKUP` para o estado terminal imutável `DELIVERED`.
* **Protótipo Stitch:** [`stitch_techtrack/techtrack_dashboard_administrativo`](stitch_techtrack/techtrack_dashboard_administrativo/)
* **Dependências:** `07-customer-portal-mobile`.
* **Riscos (Baixo):** Lentidão em agregações analíticas; necessidade de trancamento definitivo contra mutações pós-entrega.
* **Execução de Linter:** `npx tsc --noEmit` e `npm run lint`.
* **Testes Unitários:** Fórmulas de métricas de agregação e validação de bloqueio total de edição para ordens `DELIVERED`.
* **Testes de Integração:** Endpoint `/api/v1/admin/dashboard` com agregações indexadas e endpoint `/api/v1/service-orders/:id/deliver`.
* **Testes E2E:** Atendente autenticado acessa o dashboard administrativo, visualiza os indicadores do dia, realiza a baixa de entrega no balcão e valida a imutabilidade final da OS.

---

## 4. 🚀 Próximos Passos de Execução

Cada uma das 8 mudanças acima já possui seu respectivo artefato `proposal.md` estruturado no diretório [`openspec/changes/`](openspec/changes/).

Para iniciar o ciclo de especificação e desenvolvimento de qualquer uma das mudanças, utilize o fluxo padrão do OpenSpec:
1. `openspec status --change <nome-da-mudança>`
2. `openspec instructions specs --change <nome-da-mudança>`
3. `openspec instructions design --change <nome-da-mudança>`
4. `openspec instructions tasks --change <nome-da-mudança>`
5. `/opsx-apply <nome-da-mudança>`

