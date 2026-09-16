# Mudança 04: Abertura, Triagem e Listagem de Ordens de Serviço

## Why
O ponto de partida do ciclo operacional da assistência técnica é a recepção do equipamento e a emissão da Ordem de Serviço (OS). Esta mudança implementa o caso de uso UC03 (Criar Ordem de Serviço), gera o identificador oficial sequencial (`OS-YYYY-XXXXXX`), registra os detalhes de triagem inicial (defeito reclamado, estado de conservação e acessórios deixados) e fornece a interface desktop de alta densidade para listagem, busca e filtragem de ordens de serviço.

## What Changes
- **Geração de Número de OS:** Algoritmo sequencial atômico para identificador legível de OS no formato `OS-YYYY-XXXXXX`.
- **Abertura e Triagem de OS (UC03):** Caso de uso `CreateServiceOrderUseCase` registrando cliente, equipamento, defeito relatado, observações de triagem e acessórios, iniciando com status `RECEIVED`.
- **Listagem e Filtragem de OS:** Caso de uso `ListServiceOrdersUseCase` com suporte a filtros combinados (status, prioridade, período de entrada, cliente), ordenação e paginação.
- **Telas Administrativas:**
  - Implementação da tela de abertura baseada no protótipo [`stitch_techtrack/techtrack_nova_ordem_de_servi_o`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_nova_ordem_de_servi_o).
  - Implementação da tabela de listagem baseada no protótipo [`stitch_techtrack/techtrack_lista_de_ordens`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_lista_de_ordens).

## Capabilities

### New Capabilities
- `service-order-intake`: Abertura de ordens com identificador único, registro do checklist de triagem e persistência no status `RECEIVED`.
- `service-order-listing`: Painel tabular com filtros reativos por status, paginação server-side e busca em tempo real.

### Modified Capabilities
*Nenhuma.*

## Impact
- **Código Afetado:** Módulo `src/modules/service-orders/`, rotas de API `/api/v1/service-orders`, páginas `src/app/(admin)/service-orders/new` e `src/app/(admin)/service-orders`.
- **APIs:** `POST /api/v1/service-orders` e `GET /api/v1/service-orders`.
- **Protótipos Associados:**
  - [`stitch_techtrack/techtrack_nova_ordem_de_servi_o`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_nova_ordem_de_servi_o)
  - [`stitch_techtrack/techtrack_lista_de_ordens`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_lista_de_ordens)

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Duas telas completas (formulário de triagem e tabela com filtros) e lógica de numeração de OS. |
| **Complexidade** | **Média** | Geração sequencial concorrente de número de OS e queries com filtros compostos. |
| **Risco** | **Médio** | Risco de colisões na numeração de OS em acessos simultâneos de múltiplos atendentes. |

### Escopo Funcional
- Formulário de abertura com busca de cliente, seleção/cadastro de equipamento e checklist de triagem física.
- Geração atômica e determinística do número da OS.
- Gravação do primeiro evento no histórico imutável (`ServiceOrderHistory` com status `RECEIVED`).
- Tabela com filtros rápidos por status (Aguardando Diagnóstico, Em Reparo, etc.), busca por texto livre e paginação.

### Dependências
- `01-foundation-and-database`: Tabela `ServiceOrder` e índices.
- `02-auth-and-rbac`: Autorização para `ADMIN` e `ATTENDANT`.
- `03-customers-and-equipment`: Seleção de cliente e equipamento válidos.

### Riscos e Mitigações
- **Colisão de `order_number` sob concorrência:** Utilização de sequência do PostgreSQL ou lock transacional otimista com índice `UNIQUE`.
- **Performance na listagem de ordens:** Paginação no banco de dados (`skip`/`take`) e índices compostos em `(status, created_at)`.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Conformidade estrita dos tipos de DTO de entrada e saída.

#### 2. Testes Unitários Necessários
- Teste do gerador de formato de número de OS (`OS-2026-000001`).
- Validação Zod do formulário de triagem (bloqueio se faltar cliente, equipamento ou relato do defeito).
- Teste de filtros e ordenação na camada de aplicação.

#### 3. Testes de Integração Necessários
- Teste de criação de OS via API (`POST /api/v1/service-orders`): retorno `201 Created` e validação do registro em `ServiceOrderHistory`.
- Teste de unicidade: tentativa de inserir duplicidade de `order_number` é prevenida pelo banco.
- Teste de busca com query params (`GET /api/v1/service-orders?status=RECEIVED&limit=10`).

#### 4. Testes E2E Necessários
- Playwright E2E:
  - Atendente preenche formulário de nova OS, confirma abertura e é redirecionado para a lista de ordens.
  - A nova OS aparece na tabela de ordens de serviço com status "Recebido" e número sequencial formatado.
  - Teste de filtro por status e teste de busca por texto livre na tabela.

