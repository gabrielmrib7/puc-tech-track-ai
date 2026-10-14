# Mudança 10: Tecnologia de Fronteira — Assistente de IA para Pré-Diagnóstico e Orçamento

## Why

No atendimento de assistência técnica, o atendente ou técnico inicial frequentemente tem dúvidas ao estimar a faixa de complexidade, prováveis componentes danificados e custo prévio no momento da triagem do equipamento. Essa incerteza gera expectativas desalinhadas com os clientes e orçamentos preliminares imprecisos.

Esta mudança introduz um recurso funcional de Tecnologia de Fronteira (RF3 / RF16 — 14 pontos): um **Assistente de Inteligência Artificial para Pré-Diagnóstico e Estimativa de Preços**, integrado de forma desacoplada via Gateway ao monólito modular do TechTrack. Ele analisa a marca, modelo e defeito relatado para sugerir diagnósticos prováveis, componentes de substituição comuns e faixa estimada de preços em Reais (BRL), com total tolerância a falhas.

## What Changes

- **Gateway de Diagnóstico de IA Desacoplado (`AiDiagnosisProviderGateway`):**
  - Criação da interface de domínio `AiDiagnosisGateway` isolando o provedor externo (Google Gemini / OpenAI).
  - Implementação do adaptador com tratamento de timeout estrito (5 segundos), retry seguro e fallback gracioso sem bloquear o fluxo operacional manual do atendente.
- **Endpoint REST de Inferência Técnica (`POST /api/v1/ai/estimate`):**
  - Rota autenticada acessível exclusivamente aos perfis operacionais (`ADMIN`, `ATTENDANT`, `TECHNICIAN`).
  - Validação estrita de entrada via Zod (`equipment_type`, `brand`, `model`, `reported_defect`).
  - Resposta tipada contendo:
    - `probable_defect`: descrição técnica concisa do problema mais provável.
    - `confidence_score`: índice de confiança da inferência (0.0 a 1.0).
    - `estimated_cost_min` e `estimated_cost_max`: faixa de valores em BRL.
    - `suggested_parts`: lista de peças e componentes sugeridos.
    - `complexity`: nível de complexidade do reparo (`LOW`, `MEDIUM`, `HIGH`).
- **Componente de Interface do Assistente de IA no Formulário de OS:**
  - Card interativo na tela de abertura de OS (`src/app/service-orders/new/page.tsx`).
  - Botão "Obter Pré-Diagnóstico com IA" acionado sob demanda (não intrusivo).
  - Estados claros de feedback visual: loading (esqueleto animado), erro de conectividade/timeout com aviso amigável e exibição do card de resultado.
  - Ação em 1 clique "Aplicar Sugestão" preenchendo automaticamente o campo de observações técnicas/defeito.
- **Não-Objetivos (Non-Goals):**
  - Não toma decisões autônomas de alteração de status da OS ou emissão final de orçamento fiscal. O assistente é puramente consultivo para apoiar a decisão humana.

## Capabilities

### New Capabilities

- `ai-diagnosis-assistant`: Pré-diagnóstico automatizado e estimativa técnica de preços e peças com inteligência artificial generativa e arquitetura de fallback resiliente.

### Modified Capabilities

*Nenhuma (a abertura de OS convencional continua idêntica e compatível com a capability `service-order-intake`).*

## Impact

- **Código Afetado:** Novo módulo `src/modules/ai-assistant/` (domain, application, infrastructure), novo route handler `src/app/api/v1/ai/estimate/route.ts` e atualização do formulário `src/app/service-orders/new/page.tsx`.
- **Dependências:** Inclusão de `@google/genai` (ou SDK de IA oficial) para geração estruturada com JSON schema.
- **Segurança e RBAC:** Bloqueio mandatório para role `CUSTOMER` (retorna HTTP 403 Forbidden). Apenas equipe da assistência técnica pode solicitar estimativas.
- **Performance e Resiliência:** Arquitetura desacoplada garante que se o serviço de IA estiver indisponível ou com quota excedida, a abertura e edição de ordens de serviço continuam funcionando perfeitamente sem falhas.

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Módulo de domínio, gateway de integração, rota REST e card na UI. |
| **Complexidade** | **Média** | Integração com LLM estruturado, validação estrita de JSON e fallback resiliente. |
| **Risco** | **Médio** | Dependência de serviço de IA externo, mitigada por timeout de 5s e isolamento por interface. |

### Escopo Funcional
- Requisições autenticadas para `POST /api/v1/ai/estimate` retornando diagnóstico probabilístico e faixa de preço.
- Fallback automático para modo manual quando o provedor externo falhar ou demorar mais de 5 segundos.
- Interface rica com exibição de badge de confiança e aplicação em 1 clique dos valores sugeridos.

### Dependências
- `04-service-order-intake`: Formulário de criação de OS e modelos de entrada.

### Riscos e Mitigações
- **Latência alta da API de IA:** Timeout estrito de 5000ms configurado na chamada HTTP do provedor.
- **Alucinação de valores fora da realidade:** Prompt de sistema com delimitação estrita de faixas aceitáveis e estruturação via `responseSchema` JSON.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```

#### 2. Testes Unitários Necessários
- Teste do caso de uso `GenerateAiEstimateUseCase` com mock do gateway (sucesso com resposta estruturada e tratamento de erro/timeout).
- Teste de validação dos schemas Zod de request e response do endpoint de IA.

#### 3. Testes de Integração Necessários
- Teste do endpoint `POST /api/v1/ai/estimate` validando autenticação RBAC (`ADMIN`, `ATTENDANT`, `TECHNICIAN` permitidos; `CUSTOMER` e anônimo bloqueados com 403/401).
- Teste de resiliência: simulação de erro no provedor retornando código de erro tratável ou fallback gracioso sem quebrar o servidor.

#### 4. Testes E2E Necessários
- Fluxo de preenchimento na interface de nova OS: digitação do defeito, clique em "Obter Pré-Diagnóstico com IA", exibição do resultado e clique em "Aplicar Sugestão".
