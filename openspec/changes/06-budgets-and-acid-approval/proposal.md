# Mudança 06: Gestão de Orçamentos e Transação Atômica de Decisão (ACID)

## Why
A aprovação ou rejeição de um orçamento é a operação de maior impacto financeiro e operacional da assistência. Conforme os invariantes arquiteturais do TechTrack (seção 6.2 do `AGENTS.md` e seção 16 de `docs/architecture.md`), esta operação nunca pode ser parcial: a atualização do orçamento, a transição da ordem de serviço e a gravação da auditoria devem ocorrer dentro de uma transação com garantias ACID completas (`prisma.$transaction`), com rollback total em qualquer falha. Esta mudança implementa a emissão de orçamentos (UC05), a transação atômica de decisão (UC06) e a tela mobile de aprovação de orçamento em 1 clique.

## What Changes
- **Emissão e Discriminação de Orçamento (UC05):** Caso de uso `CreateBudgetUseCase` permitindo discriminar peças de reposição, valor de mão de obra, condições de pagamento e prazo de garantia legal/adicional.
- **Transação Atômica de Decisão (UC06):** Caso de uso `DecideBudgetUseCase` (`ApproveBudget` / `RejectBudget`) executado estritamente em `prisma.$transaction`:
  1. Valida se a OS está no status `WAITING_APPROVAL` e se o orçamento está `PENDING`.
  2. Atualiza `Budget.status` para `APPROVED` ou `REJECTED`.
  3. Atualiza `ServiceOrder.status` para `IN_REPAIR` (se aprovado) ou `REJECTED` (se recusado).
  4. Insere registro imutável em `ServiceOrderHistory`.
  5. Se qualquer etapa falhar, executa **ROLLBACK** integral.
- **Proteção contra Idempotência e Concorrência:** Rejeição de aprovações duplicadas com HTTP 409 Conflict.
- **Interface Mobile de Aprovação:** Implementação da tela mobile-first baseada no protótipo [`stitch_techtrack/techtrack_aprova_o_de_or_amento_mobile`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_aprova_o_de_or_amento_mobile).

## Capabilities

### New Capabilities
- `budget-management`: Cadastro, cálculo de totais, validação de prazos e discriminação detalhada de peças e serviços.
- `acid-approval-transaction`: Transação atômica isolada para aprovação ou recusa de orçamento com rollback automático e auditoria garantida.

### Modified Capabilities
- `finite-state-machine-engine`: Integração da decisão do orçamento como gatilho oficial para as transições `WAITING_APPROVAL ──► IN_REPAIR` ou `WAITING_APPROVAL ──► REJECTED`.

## Impact
- **Código Afetado:** Módulo `src/modules/budgets/`, endpoints `/api/v1/service-orders/:id/budget`, tela do cliente em `src/app/(customer)/orders/[id]/budget`.
- **APIs:** `POST /api/v1/service-orders/:id/budget`, `POST /api/v1/service-orders/:id/budget/approve`, `POST /api/v1/service-orders/:id/budget/reject`.
- **Protótipo Associado:** [`stitch_techtrack/techtrack_aprova_o_de_or_amento_mobile`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_aprova_o_de_or_amento_mobile).

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Criação do módulo financeiro de orçamentos, transação ACID e interface mobile de decisão. |
| **Complexidade** | **Média** | Garantir integridade atômica absoluta e prevenção contra concorrência e race conditions. |
| **Risco** | **Médio** | Operação financeira crítica; orçamentos em estado inconsistente geram prejuízo material. |

### Escopo Funcional
- Cadastro de orçamento técnico com cálculo automático do valor total (peças + mão de obra).
- Visualização discriminada para o cliente no dispositivo móvel.
- Botão de ação rápida para aprovação ou recusa com justificativa opcional.
- Transação atômica no banco de dados com rollback integral garantido.
- Bloqueio de qualquer decisão em orçamentos já decididos anteriormente.

### Dependências
- `01-foundation-and-database`: Tabela `Budget` e relacionamento 1:1/1:N com `ServiceOrder`.
- `02-auth-and-rbac`: Perfil `CUSTOMER` para aprovação e `TECHNICIAN`/`ADMIN` para emissão.
- `05-diagnosis-and-state-machine`: OS no estado `WAITING_APPROVAL`.

### Riscos e Mitigações
- **Race condition de duplo clique em "Aprovar":** Uso de lock otimista no registro de orçamento e idempotency key na requisição.
- **Falha parcial na gravação do histórico:** Uso mandatório de `prisma.$transaction` abrangendo Budget, ServiceOrder e ServiceOrderHistory.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Tipagem estrita de valores monetários (decimais/centavos em integer) e zero erros.

#### 2. Testes Unitários Necessários
- Teste de cálculo da soma de itens de peças e valor de mão de obra.
- Teste de validação de datas de expiração da validade do orçamento.
- Teste da lógica de bloqueio de aprovação em orçamento já aprovado/rejeitado.

#### 3. Testes de Integração Necessários
- **Teste ACID de Sucesso:** Executa aprovação de orçamento e valida que `Budget.status = APPROVED`, `ServiceOrder.status = IN_REPAIR` e `ServiceOrderHistory` foi criado.
- **Teste ACID de Falha/Rollback:** Simulação de erro intencional ao gravar o histórico e validação de que nem o Budget nem a ServiceOrder sofreram alteração no banco (ROLLBACK confirmado).
- **Teste de Concorrência:** Duas requisições simultâneas de aprovação; a primeira sucede (`200 OK`) e a segunda é rejeitada (`409 Conflict`).
- **Teste de Segurança:** Cliente tentando aprovar orçamento de ordem pertencente a outro cliente recebe `403 Forbidden`.

#### 4. Testes E2E Necessários
- Playwright E2E:
  - Cliente acessa a tela de aprovação de orçamento em viewport mobile (375x667).
  - Confere os valores discriminados de peças e mão de obra.
  - Clica em "Aprovar Orçamento"; a interface exibe feedback de sucesso imediato e a OS transita para "Em Reparo".

