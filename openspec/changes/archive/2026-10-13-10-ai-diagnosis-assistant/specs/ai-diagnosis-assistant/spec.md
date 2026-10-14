## Purpose

Fornece serviço inteligente de inferência técnica e estimativa prévia de custos de reparo baseado em IA com arquitetura desacoplada via Gateway para triagem e abertura de OS.

## ADDED Requirements

### Requirement: AI Diagnostic and Pricing Estimation Endpoint
O backend SHALL disponibilizar um endpoint REST autenticado `POST /api/v1/ai/estimate` que recebe dados do equipamento e defeito relatado, retornando um diagnóstico provável, faixa de preço em BRL, lista de peças sugeridas e nível de confiança.

#### Scenario: Successful technical estimate generation
- **WHEN** um usuário com perfil `ADMIN`, `ATTENDANT` ou `TECHNICIAN` enviar um payload válido com `equipment_type`, `brand`, `model` e `reported_defect`
- **THEN** o sistema responde com status HTTP 200 contendo `probable_defect`, `confidence_score` (entre 0.0 e 1.0), `estimated_cost_min`, `estimated_cost_max`, `suggested_parts` e `complexity`

#### Scenario: Unauthorized access by customer or anonymous
- **WHEN** uma requisição para `POST /api/v1/ai/estimate` for realizada sem autenticação válida ou por um usuário com papel `CUSTOMER`
- **THEN** o sistema rejeita a operação com status HTTP 401 ou 403 Forbidden

#### Scenario: Invalid input payload
- **WHEN** o corpo da requisição não contiver os campos obrigatórios ou contiver valores vazios
- **THEN** o sistema rejeita a requisição com status HTTP 400 Bad Request detalhando os erros de validação Zod

### Requirement: Gateway Resilience and Fallback
A camada de aplicação SHALL orquestrar a chamada ao provedor de IA através de uma interface desacoplada (`AiDiagnosisGateway`) com timeout estrito de 5000 milissegundos e estratégia de contingência transparente.

#### Scenario: External provider timeout or failure
- **WHEN** o provedor de IA externo falhar, estiver inacessível ou exceder 5000ms de tempo de resposta
- **THEN** o sistema aciona fallback determinístico retornando uma estimativa baseada em catálogo técnico pré-definido ou erro tratável sem interromper a disponibilidade do sistema

### Requirement: Interactive AI Suggestion UI on Service Order Intake
A interface de abertura de OS SHALL disponibilizar um componente interativo permitindo ao atendente solicitar a estimativa de IA e aplicar o laudo preliminar em um único clique.

#### Scenario: Requesting suggestion in intake form
- **WHEN** o atendente preenche os dados do aparelho e clica em "Obter Pré-Diagnóstico com IA"
- **THEN** a interface exibe indicador de carregamento e apresenta o card com o laudo sugerido e a faixa de preço estimada

#### Scenario: Applying suggestion into form
- **WHEN** o operador clica no botão "Aplicar Sugestão" do card de IA
- **THEN** o texto do defeito constatado/observações é automaticamente preenchido com as recomendações da IA
