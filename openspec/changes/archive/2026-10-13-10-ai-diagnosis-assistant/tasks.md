## 1. Módulo de Domínio e Gateway Desacoplado de IA

- [x] 1.1 Criar schemas Zod e tipos de domínio em `src/modules/ai-assistant/domain/schemas.ts` para validação de entrada (`AiEstimateRequest`) e saída (`AiEstimateResponse`).
- [x] 1.2 Definir a interface `AiDiagnosisGateway` em `src/modules/ai-assistant/application/ai-diagnosis-gateway.ts` e implementar o caso de uso `GenerateAiEstimateUseCase` com orquestração e timeout de 5 segundos.
- [x] 1.3 Implementar o adaptador de infraestrutura `GeminiAiDiagnosisProviderGateway` em `src/modules/ai-assistant/infrastructure/gemini-gateway.ts` com chamada estruturada e fallback automático baseado em catálogo técnico heurístico.

## 2. Rota de API REST e Controle de Acesso RBAC

- [x] 2.1 Criar o route handler `POST /api/v1/ai/estimate` em `src/app/api/v1/ai/estimate/route.ts` com validação de payload Zod, autenticação Clerk e guard de permissão (`requireRole(['ADMIN', 'ATTENDANT', 'TECHNICIAN'])`).
- [x] 2.2 Criar testes unitários para schemas e caso de uso em `src/modules/ai-assistant/application/generate-ai-estimate.spec.ts` cobrindo cenários de sucesso, timeout e acionamento de fallback.
- [x] 2.3 Criar testes de integração da rota em `src/app/api/v1/ai/estimate/route.spec.ts` validando bloqueio para perfil `CUSTOMER` (HTTP 403), anônimo (HTTP 401) e sucesso para perfis autorizados.

## 3. Componente Interativo no Formulário de Abertura de OS

- [x] 3.1 Criar o componente `AiDiagnosisCard` em `src/modules/ai-assistant/presentation/ai-diagnosis-card.tsx` com botões de ação ("Obter Pré-Diagnóstico com IA" e "Aplicar Sugestão"), badge de confiança e estados de carregamento.
- [x] 3.2 Integrar o `AiDiagnosisCard` no formulário de criação de OS em `src/app/service-orders/new/page.tsx`, conectando o botão ao preenchimento automático do campo de laudo prévio/defeito relatado.

## 4. Verificação de Qualidade e Portões de Aceite

- [x] 4.1 Executar validação estática de tipos (`npx tsc --noEmit`) e linter (`npm run lint`), garantindo zero erros.
- [x] 4.2 Executar suíte completa de testes unitários e de integração (`npm run test`) validando a nova suíte do assistente de IA em conjunto com os testes existentes do monólito.
