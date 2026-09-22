# Mudança 08: Dashboard Administrativo e Fluxo de Entrega Final

## Why
Para que a gerência e os atendentes da assistência técnica tenham controle em tempo real sobre a operação, é necessário um painel desktop de alta densidade informativa consolidando métricas chave (número de ordens abertas, distribuição por status, tempo médio de permanência e orçamentos aguardando aprovação). Além disso, é indispensável fechar o ciclo operacional com o registro seguro da entrega do equipamento ao cliente (`DELIVERED`), tornando a ordem finalizada e imutável. Esta mudança implementa o dashboard operacional e o encerramento de entrega baseado no Stitch.

## What Changes
- **Dashboard Analítico Operacional:** Caso de uso `GetOperationalDashboardMetricsUseCase` agregando:
  - Total de ordens ativas e concluídas no dia/mês.
  - Distribuição de ordens por status (`RECEIVED`, `IN_DIAGNOSIS`, `WAITING_APPROVAL`, `IN_REPAIR`, etc.).
  - Volume financeiro em orçamentos pendentes e aprovados.
  - Indicadores de SLA (tempo médio de reparo).
- **Fluxo de Entrega Final:** Caso de uso `DeliverServiceOrderUseCase` transitando a OS de `READY_FOR_PICKUP` para o estado terminal imutável `DELIVERED`, registrando assinatura/documento de quem retirou e auditoria em `ServiceOrderHistory`.
- **Interface Desktop de Alta Densidade:** Implementação do dashboard gerencial baseado no protótipo [`stitch_techtrack/techtrack_dashboard_administrativo`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_dashboard_administrativo).

## Capabilities

### New Capabilities
- `admin-analytics-dashboard`: Painel com cards de KPIs, gráficos de distribuição e atalhos operacionais rápidos.
- `order-delivery-and-closure`: Fluxo de baixa de entrega no balcão e trancamento definitivo da ordem de serviço.

### Modified Capabilities
- `finite-state-machine-engine`: Efetivação da transição final `READY_FOR_PICKUP ──► DELIVERED`.

## Impact
- **Código Afetado:** Página principal administrativa `src/app/(admin)/dashboard/page.tsx`, módulo de relatórios/métricas `src/modules/service-orders/application/metrics/`, endpoint `/api/v1/admin/dashboard`.
- **APIs:** `GET /api/v1/admin/dashboard`, `POST /api/v1/service-orders/:id/deliver`.
- **Protótipo Associado:** [`stitch_techtrack/techtrack_dashboard_administrativo`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_dashboard_administrativo).

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Tela desktop de indicadores, agregação de dados no banco e fluxo de entrega final. |
| **Complexidade** | **Média** | Queries analíticas otimizadas com agrupamento e trancamento imutável de estado. |
| **Risco** | **Baixo** | Não altera regras centrais de transação; fecha o ciclo de vida da OS. |

### Escopo Funcional
- Exibição de cards operacionais: "Novas OS hoje", "Aguardando Diagnóstico", "Orçamentos Pendentes", "Prontos para Retirada".
- Acesso rápido às ordens que demandam ação imediata.
- Modal de confirmação de entrega do equipamento: conferência de documento do cliente e confirmação de entrega.
- Bloqueio permanente de qualquer edição posterior após a transição para `DELIVERED`.

### Dependências
- `01-foundation-and-database`: Índices em `created_at` e `status`.
- `02-auth-and-rbac`: Perfil `ADMIN` e `ATTENDANT`.
- `05-diagnosis-and-state-machine`: Estado `READY_FOR_PICKUP`.

### Riscos e Mitigações
- **Lentidão em queries analíticas:** Uso de agregações indexadas (`COUNT` com `GROUP BY status`) e cache de curta duração se necessário.
- **Edição acidental de OS já entregue:** Bloqueio mandatório no backend de qualquer mutação para ordens com status `DELIVERED`.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Conformidade estrita dos tipos de resposta do dashboard.

#### 2. Testes Unitários Necessários
- Teste de cálculo de métricas de agregação (taxa de aprovação, contadores por status).
- Teste de validação da transição para `DELIVERED` (exigindo que a OS esteja em `READY_FOR_PICKUP`).
- Teste de rejeição de mutações para OS no status `DELIVERED`.

#### 3. Testes de Integração Necessários
- Teste do endpoint `GET /api/v1/admin/dashboard` retornando estrutura agregada correta com base no banco populado.
- Teste do endpoint `POST /api/v1/service-orders/:id/deliver`: valida atualização do status, gravação do histórico e bloqueio de novas edições.

#### 4. Testes E2E Necessários
- Playwright E2E:
  - Atendente faz login, visualiza o dashboard com os indicadores atualizados.
  - Localiza uma ordem em "Pronto para Retirada", clica em "Registrar Entrega", confirma os dados.
  - A OS é atualizada para "Entregue", os contadores do dashboard são atualizados e os botões de edição da OS ficam desabilitados.

