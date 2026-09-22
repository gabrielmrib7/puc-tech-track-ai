# Mudança 07: Portal do Cliente Mobile-First e Linha do Tempo Humanizada

## Why
O pilar fundamental de transparência do TechTrack visa eliminar contatos repetitivos ("Como está meu aparelho?") fornecendo ao cliente uma linha do tempo clara, em tempo real e acessível via smartphone. De acordo com o PRD e as diretrizes de design, o cliente não deve ver códigos de enum brutos (como `IN_REPAIR`), mas sim descrições transparentes e acolhedoras ("Reparo em andamento"). Além disso, o isolamento de dados de clientes (Backend Authority) é mandatório para conformidade com a LGPD e segurança da informação. Esta mudança implementa o portal do cliente e a linha do tempo responsiva baseada no Stitch.

## What Changes
- **Portal do Cliente (UC08):** Caso de uso `GetCustomerServiceOrdersUseCase` e `GetCustomerServiceOrderDetailUseCase` filtrando exclusivamente ordens cujo `customer.user_id` corresponda ao usuário autenticado.
- **Linha do Tempo Humanizada:** Mapeamento no frontend e DTO de status técnicos para rótulos e ícones de alta clareza (ex: "Recebido na Assistência", "Diagnóstico Realizado", "Aguardando sua Aprovação", "Reparo em Andamento", "Pronto para Retirada").
- **Visualização de Detalhes:** Apresentação de modelo do equipamento, número de série, laudo técnico resumido, previsão estimada de entrega e atalhos para orçamento.
- **Interface Mobile-First:** Construção do portal responsivo otimizado para dispositivos móveis baseado no protótipo [`stitch_techtrack/techtrack_portal_do_cliente_mobile`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_portal_do_cliente_mobile).

## Capabilities

### New Capabilities
- `customer-tracking-portal`: Painel de visualização exclusiva das ordens do cliente com dados resumidos e cards responsivos.
- `humanized-status-timeline`: Componente visual de esteira de progresso com etapas concluídas, atual e futuras.

### Modified Capabilities
*Nenhuma.*

## Impact
- **Código Afetado:** Rotas em `src/app/(customer)/portal/`, módulo de apresentação `src/modules/service-orders/presentation/customer/`, endpoint `/api/v1/customer/orders`.
- **APIs:** `GET /api/v1/customer/orders`, `GET /api/v1/customer/orders/:id`.
- **Protótipo Associado:** [`stitch_techtrack/techtrack_portal_do_cliente_mobile`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_portal_do_cliente_mobile).

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Portal mobile completo, timeline reativa de status e endpoints com isolamento estrito. |
| **Complexidade** | **Média** | Garantia de isolamento multi-inquilino de dados entre clientes e responsividade móvel estrita. |
| **Risco** | **Médio** | Vazamento de dados cruzados entre clientes (cross-tenant data breach) se o isolamento falhar. |

### Escopo Funcional
- Lista das ordens de serviço ativas e concluídas pertencentes ao cliente autenticado.
- Visualização da timeline com status humanizado e horário das etapas concluídas.
- Card de identificação do equipamento (marca, modelo e serial).
- Indicação de prontidão para retirada quando o status for `READY_FOR_PICKUP`.
- Rejeição imediata de qualquer consulta à OS de terceiros com `HTTP 403` ou `HTTP 404`.

### Dependências
- `01-foundation-and-database`: Estrutura de dados de ordens e histórico.
- `02-auth-and-rbac`: Perfil `CUSTOMER` autenticado via Clerk.
- `05-diagnosis-and-state-machine`: Histórico populado para renderização da timeline.

### Riscos e Mitigações
- **Vazamento de dados entre clientes (IDOR):** A query do banco obrigatoriamente inclui a cláusula `WHERE customer.user_id = :authenticatedUserId`.
- **Experiência ruim em telas pequenas:** Uso rigoroso de Tailwind CSS Mobile-First conforme o protótipo do Stitch.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Zero erros de acessibilidade e tipagem estrita de status humanizado.

#### 2. Testes Unitários Necessários
- Teste do transformador de status técnico para status amigável ao cliente (ex: `READY_FOR_PICKUP` $\rightarrow$ "Pronto para Retirada").
- Teste de ordenação cronológica dos itens da timeline.
- Teste de formatação de datas locais (PT-BR).

#### 3. Testes de Integração Necessários
- **Teste de Isolamento de Dados:**
  - Cliente 1 autenticado consulta `GET /api/v1/customer/orders` e só recebe suas próprias ordens.
  - Cliente 1 tenta acessar `GET /api/v1/customer/orders/OS-CLIENTE-2` e recebe obrigatoriamente `403 Forbidden` ou `404 Not Found`.
- Teste de resposta completa da timeline contendo todos os passos auditados em `ServiceOrderHistory`.

#### 4. Testes E2E Necessários
- Playwright E2E:
  - Cliente faz login pelo smartphone (emulação mobile), visualiza seu aparelho na tela inicial e clica para ver detalhes.
  - A timeline exibe os passos concluídos (verde) e o status atual com destaque.
  - Teste de tentativa forçada de navegação por URL para ordem de outro cliente resultando em página de erro 403/404.

