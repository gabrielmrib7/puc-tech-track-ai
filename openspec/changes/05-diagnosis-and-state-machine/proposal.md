# Mudança 05: Diagnóstico Técnico e Motor da Máquina de Estados Finita

## Why
O coração operacional do TechTrack é o ciclo de vida das ordens de serviço. Permitir transições arbitrárias de status gera inconsistências graves (por exemplo, marcar como entregue um aparelho que sequer foi diagnosticado). Conforme definido na seção 6.1 do `AGENTS.md` e na seção 17 de `docs/architecture.md`, as transições devem ser governadas por uma máquina de estados finita estrita no domínio, auditada atomicamente em `ServiceOrderHistory`. Esta mudança implementa o motor da máquina de estados, o laudo de diagnóstico técnico (UC04) e a tela desktop de detalhes da OS.

## What Changes
- **Motor da Máquina de Estados (Domain Layer):** Implementação de entidade pura com regras de transição permitidas:
  ```text
  RECEIVED ──► WAITING_DIAGNOSIS ──► IN_DIAGNOSIS ──► WAITING_APPROVAL
                                        │
                                        ▼ (sem custo / garantia)
                                    IN_REPAIR ──► COMPLETED ──► READY_FOR_PICKUP ──► DELIVERED
  ```
  - Rejeição obrigatória com HTTP 400 ou 422 para qualquer transição não autorizada.
  - Imutabilidade absoluta para estados finais (`DELIVERED` e `CANCELLED`).
- **Diagnóstico Técnico (UC04):** Casos de uso `StartDiagnosisUseCase` e `RegisterTechnicalDiagnosisUseCase` registrando parecer técnico, tempo estimado e causas identificadas por usuário com papel `TECHNICIAN`.
- **Histórico e Auditoria Imutável:** Inserção obrigatória de registro em `ServiceOrderHistory` a cada transição de status.
- **Interface de Detalhes Administrativos:** Implementação da tela baseada no protótipo [`stitch_techtrack/techtrack_detalhes_da_ordem_adm`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_detalhes_da_ordem_adm), exibindo laudo, ações de transição de status e timeline interna.

## Capabilities

### New Capabilities
- `finite-state-machine-engine`: Motor puro de validação de ciclo de vida de OS e rejeição de transições inválidas.
- `technical-diagnosis`: Registro de laudo técnico, causa do defeito e estimativa de reparo por técnicos autorizados.

### Modified Capabilities
- `service-order-intake`: Acesso aos dados detalhados e transição do status inicial `RECEIVED` para os próximos estágios.

## Impact
- **Código Afetado:** `src/modules/service-orders/domain/` (State Machine), use cases em `src/modules/service-orders/application/`, endpoints em `/api/v1/service-orders/:id/status` e página `src/app/(admin)/service-orders/[id]`.
- **APIs:** `PATCH /api/v1/service-orders/:id/status`, `POST /api/v1/service-orders/:id/diagnosis`, `GET /api/v1/service-orders/:id`.
- **Protótipo Associado:** [`stitch_techtrack/techtrack_detalhes_da_ordem_adm`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_detalhes_da_ordem_adm).

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Motor de máquina de estados, regras de auditoria, laudo técnico e tela rica de detalhes. |
| **Complexidade** | **Média** | Garantir que o backend rejeite com precisão todas as transições fora do grafo permitido. |
| **Risco** | **Médio** | Se as regras falharem, o ciclo operacional da assistência entra em estado inconsistente. |

### Escopo Funcional
- Validação no backend de todas as transições de status da OS.
- Bloqueio de transição para `IN_DIAGNOSIS` se o usuário logado não for `TECHNICIAN` ou `ADMIN`.
- Registro do laudo técnico descritivo com parecer e causa provável.
- Criação atômica de eventos em `ServiceOrderHistory` com carimbo de data/hora UTC e ID do operador.
- Exibição visual da timeline completa na tela de detalhes da OS.

### Dependências
- `01-foundation-and-database`: Tabela `ServiceOrderHistory` e enums de status.
- `02-auth-and-rbac`: Perfil `TECHNICIAN` e permissões de atualização técnica.
- `04-service-order-intake`: Ordens criadas prontas para diagnóstico.

### Riscos e Mitigações
- **Tentativa de contornar a máquina de estados via chamada direta à API:** Validação 100% isolada no Domain Layer; a camada de Controller não pode alterar o status sem passar pelo método de domínio.
- **Histórico corrompido ou omitido:** Atualização de status e criação de histórico envelopadas em transação de banco.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Garantir que todos os enums do Prisma estão sincronizados com a máquina de estados tipada.

#### 2. Testes Unitários Necessários
- Teste da matriz exaustiva de transições permitidas (ex: `RECEIVED` $\rightarrow$ `WAITING_DIAGNOSIS`, `WAITING_DIAGNOSIS` $\rightarrow$ `IN_DIAGNOSIS`).
- Teste de rejeição de transições inválidas (ex: `DELIVERED` $\rightarrow$ `IN_DIAGNOSIS`, `RECEIVED` $\rightarrow$ `COMPLETED`).
- Teste de imutabilidade dos estados terminais (`DELIVERED`, `CANCELLED`).
- Teste de permissão por perfil para cada transição (apenas técnico/admin pode iniciar diagnóstico).

#### 3. Testes de Integração Necessários
- Teste do endpoint `PATCH /api/v1/service-orders/:id/status` com transição válida: confere status retornado e registro persistido em `ServiceOrderHistory`.
- Teste do endpoint com transição inválida: retorno `400 Bad Request` ou `422 Unprocessable Entity` sem alterar o status da OS.
- Teste de registro de laudo técnico (`POST /api/v1/service-orders/:id/diagnosis`).

#### 4. Testes E2E Necessários
- Playwright E2E:
  - Técnico faz login, acessa uma OS com status `WAITING_DIAGNOSIS`, inicia o diagnóstico (`IN_DIAGNOSIS`), preenche o laudo técnico e confirma a transição para `WAITING_APPROVAL`.
  - Verificação visual da timeline exibindo os dois novos eventos com data e nome do técnico.

