## Context

O TechTrack possui fluxo completo de abertura de ordem de serviço (`service-order-intake`), diagnóstico técnico e emissão de orçamentos. No momento da triagem inicial no balcão, o operador necessita de apoio para estimar a complexidade e peças potenciais.

Para atender ao critério de Tecnologia de Fronteira (RF3 / RF16), esta arquitetura adiciona o módulo de IA sem acoplamento direto a nenhum vendor proprietário no domínio.

Veja `proposal.md` para a motivação de negócio e `specs/ai-diagnosis-assistant/spec.md` para os critérios comportamentais.

## Goals / Non-Goals

**Goals:**
- Implementar o padrão **Gateway Adapter** (`AiDiagnosisGateway` na camada de Application e `GeminiAiDiagnosisProviderGateway` na camada de Infrastructure).
- Suportar prompt de sistema com JSON Schema estrito para evitar alucinações de formato.
- Fornecer endpoint `POST /api/v1/ai/estimate` com validação Zod e proteção RBAC.
- Disponibilizar fallback determinístico com catálogo técnico quando a API de IA estiver indisponível, sem chave ou com timeout.
- Renderizar card de sugestão intuitivo no formulário de OS sem bloquear o envio manual.

**Non-Goals:**
- Não automatiza a aprovação de orçamentos nem a transição da máquina de estados.
- Não substitui o laudo técnico definitivo elaborado pelo técnico presencial.

## Decisions

### 1. Padrão Gateway com Inversão de Dependência
* **Decisão:** A camada de aplicação define a interface `AiDiagnosisGateway`. O adaptador de infraestrutura consome o modelo Gemini (ou serviço compatível via SDK `@google/genai` ou fetch REST direto com timeout).
* **Alternativas Consideradas:** Chamar a API de IA diretamente dentro do route handler (descartada por violar a arquitetura em 4 camadas e impedir testes unitários com mocks limpos).

### 2. Resiliência por Fallback Baseado em Conhecimento Técnico
* **Decisão:** Em caso de erro de rede, timeout (> 5000ms) ou chave ausente (`GEMINI_API_KEY`), o gateway chaveia automaticamente para um catálogo técnico heurístico determinístico mapeando padrões comuns (ex: tela quebrada, bateria inchada, falha de carga).
* **Alternativas Consideradas:** Retornar erro 500 para a interface (descartada porque a indisponibilidade de um serviço terceiro não deve prejudicar a operação física da oficina).

### 3. Autorização RBAC Estrita no Backend
* **Decisão:** Apenas usuários autenticados com `ADMIN`, `ATTENDANT` ou `TECHNICIAN` podem invocar `/api/v1/ai/estimate`. Clientes (`CUSTOMER`) e anônimos recebem HTTP 403/401.

## Risks / Trade-offs

- **[Latência da inferência de LLM]** $\rightarrow$ *Mitigação:* `AbortController` com limite de 5000ms e UI com esqueleto visual de carregamento.
- **[Exaustão de cota de API]** $\rightarrow$ *Mitigação:* Resposta de contingência do catálogo técnico garante que o usuário sempre receba uma faixa de valor útil mesmo com quota zero.
- **[Formatação inconsistente de preços]** $\rightarrow$ *Mitigação:* O schema exige `estimated_cost_min` e `estimated_cost_max` como números reais (float) e a camada de apresentação formata para Real brasileiro (`R$`).

## Migration Plan

1. Criar `src/modules/ai-assistant/domain` e `src/modules/ai-assistant/application`.
2. Implementar `src/modules/ai-assistant/infrastructure/gemini-gateway.ts`.
3. Criar route handler `src/app/api/v1/ai/estimate/route.ts`.
4. Integrar o card de sugestão de IA em `src/app/service-orders/new/page.tsx`.
5. Adicionar testes unitários e de integração.
