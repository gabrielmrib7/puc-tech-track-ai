# Plano de Testes: Fluxo de Ordens de Serviço (Service Order Operations UI)

## Objetivo

Validar o fluxo completo de ponta a ponta de criação, consulta, detalhamento e operação de ordens de serviço (OS) de acordo com a especificação em `openspec/changes/restore-functional-product/specs/service-order-operations-ui/spec.md`:
- Bloqueio de acesso não autenticado às telas administrativas e endpoints da API de ordens de serviço;
- Criação e triagem de ordens de serviço vinculando cliente e equipamento com laudo inicial;
- Rejeição de requisições de criação inválidas ou inconsistentes sem efeitos colaterais;
- Listagem com suporte a filtros, busca e estado vazio explicativo;
- Exibição de detalhes da ordem, equipamento, cliente e histórico cronológico imutável;
- Execução de transições de status válidas pela máquina de estados com atualização em tempo real;
- Rejeição de transições inválidas e garantia de imutabilidade para ordens no estado terminal `DELIVERED`.

## Escopo

### Incluído:
- Telas de ordens de serviço:
  - Listagem: `/service-orders`
  - Criação: `/service-orders/new`
  - Detalhe e operação: `/service-orders/[id]`
- Proteção de rotas pelo middleware (`/service-orders/*` e `/api/v1/service-orders*`);
- Endpoints de API REST:
  - `GET /api/v1/service-orders` (com filtros por query e status)
  - `POST /api/v1/service-orders` (criação de OS atômica com validação de cliente/equipamento)
  - `GET /api/v1/service-orders/[id]` (detalhe com relações e timeline)
  - `PATCH /api/v1/service-orders/[id]/status` (transições de máquina de estados)
  - `POST /api/v1/service-orders/[id]/diagnosis` (registro/atualização de laudo)
  - `POST /api/v1/service-orders/[id]/budget` (emissão de orçamento)
  - `POST /api/v1/service-orders/[id]/deliver` (registro de entrega e identificação de retirada)
- Validações de domínio:
  - Alocação sequencial de número de OS (`OS-YYYY-XXXXXX`);
  - Pertencimento de equipamento ao cliente indicado;
  - Respeito à máquina de estados estrita (`assertTransition`);
  - Bloqueio de mutações após encerramento (`DELIVERED`).

### Fora do escopo:
- Fluxos de autenticação detalhados do Clerk (cobertos em `specs/login-flow-test-plan.md`);
- Impressão física de comprovantes de entrada/saída.

## Pré-condições e Dados

1. Execução a partir da raiz do repositório (`tech_Track/`) com dependências instaladas.
2. Servidor Next.js em execução na URL base (`http://127.0.0.1:3000` ou configurado em `PLAYWRIGHT_BASE_URL`).
3. Banco de dados relacional configurado e sincronizado com o schema Prisma.
4. Para testes não-autenticados e de segurança: contexto limpo, sem cookies de sessão ou tokens.
5. Para testes autenticados com credenciais reais ou mocks: credenciais de equipe (`ADMIN` ou `ATTENDANT`) configuradas em variáveis de ambiente (`E2E_CLERK_STAFF_IDENTIFIER`, `E2E_CLERK_STAFF_PASSWORD`).

## Observabilidade e Critérios Gerais

- Respeito aos contratos de segurança: rotas `/service-orders/*` devem redirecionar para `/login` quando acessadas sem sessão.
- APIs `/api/v1/service-orders*` devem responder com status 401 ou 403 para requisições não autenticadas.
- Mensagens de erro de validação devem ser visíveis para o usuário em caso de dados inválidos.
- Transições de estado devem atualizar a interface e a linha do tempo (timeline) imediatamente.
- Ordens no estado `DELIVERED` devem exibir indicador de estado terminal e desabilitar botões de mutação.

---

## Cenários de Teste

### ORD-001: Bloqueio de acesso não autenticado à listagem de ordens de serviço

**Tipo:** E2E Navegador  
**Prioridade:** Crítica  
**Pré-condição:** Contexto de navegador anônimo, sem autenticação/cookies.

**Passos:**
1. Acessar diretamente a URL `/service-orders`.
2. Aguardar a conclusão do redirecionamento.
3. Verificar a URL final.

**Resultado Esperado:**
- O sistema redireciona o usuário anônimo para a página de login (`/login`).
- A listagem de ordens de serviço não é exibida.

**Critérios de Sucesso:** Redirecionamento para `/login`.  
**Critérios de Falha:** Renderização da página administrativa ou exibição de ordens de serviço.

---

### ORD-002: Bloqueio de acesso não autenticado ao formulário de nova ordem

**Tipo:** E2E Navegador  
**Prioridade:** Crítica  
**Pré-condição:** Contexto de navegador anônimo, sem autenticação/cookies.

**Passos:**
1. Acessar diretamente a URL `/service-orders/new`.
2. Aguardar a conclusão do redirecionamento.
3. Verificar a URL final.

**Resultado Esperado:**
- O sistema redireciona o usuário anônimo para `/login`.
- O formulário de criação de OS não é acessível sem autenticação.

**Critérios de Sucesso:** Redirecionamento para `/login`.  
**Critérios de Falha:** Exibição do formulário sem autenticação.

---

### ORD-003: Bloqueio de acesso não autenticado ao detalhe de ordem de serviço

**Tipo:** E2E Navegador  
**Prioridade:** Crítica  
**Pré-condição:** Contexto de navegador anônimo, sem autenticação/cookies.

**Passos:**
1. Acessar diretamente a URL `/service-orders/test-id-123`.
2. Aguardar a conclusão do redirecionamento.
3. Verificar a URL final.

**Resultado Esperado:**
- O sistema redireciona o usuário anônimo para `/login`.
- Dados confidenciais da ordem, histórico e cliente não são expostos.

**Critérios de Sucesso:** Redirecionamento para `/login`.  
**Critérios de Falha:** Exibição dos detalhes ou de dados do cliente sem sessão válida.

---

### ORD-004: Rejeição de requisições de API não autenticadas para ordens de serviço

**Tipo:** E2E API / Playwright  
**Prioridade:** Crítica  
**Pré-condição:** `APIRequestContext` sem cabeçalhos de autorização ou cookies de sessão.

**Passos:**
1. Enviar requisição `GET /api/v1/service-orders`.
2. Enviar requisição `POST /api/v1/service-orders` com payload de teste.
3. Enviar requisição `GET /api/v1/service-orders/sample-id`.
4. Enviar requisição `PATCH /api/v1/service-orders/sample-id/status` com `{ "status": "IN_DIAGNOSIS" }`.
5. Enviar requisição `POST /api/v1/service-orders/sample-id/deliver` com `{ "recipientName": "Teste" }`.

**Resultado Esperado:**
- Todas as requisições não autenticadas devem ser rejeitadas com status HTTP 401 ou 403.
- Nenhuma alteração no banco de dados deve ocorrer.

**Critérios de Sucesso:** Status code 401 ou 403 em todos os endpoints testados.  
**Critérios de Falha:** Qualquer status 2xx ou vazamento de dados confidenciais.

---

### ORD-005: Exibição de estado vazio na listagem de ordens de serviço

**Tipo:** E2E Navegador (com sessão de Staff autenticada ou mocks de API)  
**Prioridade:** Média  
**Pré-condição:** Usuário autenticado como Staff em base sem ordens cadastradas ou com filtro sem resultados.

**Passos:**
1. Acessar `/service-orders`.
2. Aplicar um filtro de busca por termo inexistente (ex.: `busca_inexistente_xyz_123`).
3. Clicar em "Filtrar".
4. Verificar o conteúdo renderizado na tabela.

**Resultado Esperado:**
- A interface exibe a mensagem de estado vazio: "Nenhuma ordem de serviço encontrada".
- O botão de atalho "Cadastrar Nova Ordem" está visível e operável.

**Critérios de Sucesso:** Componente `EmptyState` visível com mensagem descritiva.  
**Critérios de Falha:** Erro 500, tela travada em carregamento indefinido ou ausência de mensagem indicativa.

---

### ORD-006: Criação válida de ordem de serviço (Intake) com vínculo cliente/equipamento

**Tipo:** E2E Navegador / API  
**Prioridade:** Crítica  
**Pré-condição:** Usuário Staff autenticado; cliente existente com pelo menos um equipamento cadastrado.

**Passos:**
1. Acessar `/service-orders/new`.
2. Selecionar o cliente na caixa de seleção.
3. Verificar o carregamento dos equipamentos pertencentes ao cliente.
4. Selecionar o equipamento desejado.
5. Preencher o campo de "Problema Relatado / Laudo de Entrada" com texto detalhado (> 3 caracteres).
6. Opcionalmente informar data de previsão de conclusão.
7. Clicar em "Criar Ordem de Serviço".

**Resultado Esperado:**
- A API cria o registro com status inicial `RECEIVED`, aloca número sequencial no formato `OS-YYYY-XXXXXX` e grava a entrada inicial no histórico de forma atômica.
- A interface redireciona para a página de detalhes da ordem (`/service-orders/[id]`).
- O número da OS e o badge "Recebido" são exibidos no topo.

**Critérios de Sucesso:** Criação confirmada, redirecionamento para o detalhe e status `RECEIVED`.  
**Critérios de Falha:** Falha na criação, erro silencioso, status incorreto ou descompasso cliente/equipamento.

---

### ORD-007: Validação e rejeição de intake inválido

**Tipo:** E2E Navegador / API  
**Prioridade:** Alta  
**Pré-condição:** Usuário Staff autenticado.

**Passos:**
1. Enviar requisição `POST /api/v1/service-orders` com payload vazio `{}`.
2. Enviar requisição com equipamento que não pertence ao cliente informado.
3. Tentar submeter o formulário em `/service-orders/new` sem preencher os campos obrigatórios.

**Resultado Esperado:**
- A API rejeita a requisição com status 422 e mensagem descritiva do erro de validação.
- No formulário da UI, a submissão é bloqueada pelos atributos de validação ou exibe mensagem de alerta clara (`AlertCircle`).
- Nenhuma ordem ou registro de histórico parcial é persistido no banco de dados.

**Critérios de Sucesso:** Status 422 da API e bloqueio de criação na UI com exibição de erro.  
**Critérios de Falha:** Criação de ordem inconsistente ou código 500.

---

### ORD-008: Detalhamento da ordem de serviço e visualização de timeline

**Tipo:** E2E Navegador  
**Prioridade:** Alta  
**Pré-condição:** Ordem de serviço existente no sistema; usuário Staff autenticado.

**Passos:**
1. Acessar a página `/service-orders/[id]` da ordem existente.
2. Verificar a presença dos blocos de informação:
   - Número da OS e Status atual;
   - Dados do Cliente (nome, email, telefone);
   - Dados do Equipamento (tipo, marca, modelo, número de série);
   - Laudo Técnico / Problema relatado;
   - Linha do tempo de histórico (timeline) exibindo os eventos cronológicos com usuário e data.

**Resultado Esperado:**
- Todas as seções são renderizadas corretamente sem dados indefinidos ou erros de formatação.
- A timeline exibe o evento de abertura com o autor da ação.

**Critérios de Sucesso:** Renderização completa dos dados da OS e sua timeline.  
**Critérios de Falha:** Tela de erro `ErrorState`, dados vazios ou campos omitidos.

---

### ORD-009: Transições válidas da máquina de estados na interface

**Tipo:** E2E Navegador / API  
**Prioridade:** Crítica  
**Pré-condição:** Ordem de serviço no status `RECEIVED`; usuário Staff autenticado.

**Passos:**
1. Na página de detalhes da ordem (`/service-orders/[id]`), clicar em "Encaminhar para Diagnóstico".
2. Aguardar a atualização do estado da página.
3. Verificar se o status mudou para `Aguardando diagnóstico` (`WAITING_DIAGNOSIS`).
4. Clicar em "Iniciar Diagnóstico Técnico".
5. Verificar se o status mudou para `Em diagnóstico` (`IN_DIAGNOSIS`).
6. Conferir se a timeline foi incrementada com os eventos correspondentes.

**Resultado Esperado:**
- O backend persiste a transição e o evento de histórico em transação atômica.
- A UI atualiza o badge de status e os botões de ação contextuais disponíveis para o novo estado.

**Critérios de Sucesso:** Atualização visual instantânea do status e histórico persistido.  
**Critérios de Falha:** Estado não atualizado, botões desalinhados com o estado atual ou erro 422.

---

### ORD-010: Rejeição de transição ilegal e tratamento de ordem entregue (DELIVERED)

**Tipo:** E2E Navegador / API  
**Prioridade:** Crítica  
**Pré-condição:** Ordem de serviço com status `DELIVERED`.

**Passos:**
1. Acessar `/service-orders/[id]` de uma ordem entregue.
2. Tentar disparar via API `PATCH /api/v1/service-orders/[id]/status` com `{ "status": "IN_REPAIR" }`.
3. Tentar disparar `POST /api/v1/service-orders/[id]/diagnosis` ou emissão de orçamento.
4. Verificar os elementos interativos na página da UI.

**Resultado Esperado:**
- A API rejeita qualquer tentativa de transição ou mutação a partir de `DELIVERED` com status 422 (`Invalid transition`).
- A interface exibe aviso explicativo de que a OS atingiu o estado final e é imutável.
- Botões de alteração de status são ocultados ou desativados.

**Critérios de Sucesso:** Rejeição 422 pela API e interface exibindo aviso de estado terminal.  
**Critérios de Falha:** Sucesso em alterar uma ordem já finalizada.

---

### ORD-011: Registro de entrega de equipamento (DELIVERED) com confirmação de recebedor

**Tipo:** E2E Navegador  
**Prioridade:** Alta  
**Pré-condição:** Ordem no status `READY_FOR_PICKUP`; usuário Staff autenticado.

**Passos:**
1. No detalhe da ordem pronta para retirada, clicar no botão "Registrar Entrega".
2. Preencher os dados de conferência:
   - Nome do recebedor (`recipientName`)
   - Documento do recebedor (`recipientDocument`)
3. Submeter o formulário de entrega.

**Resultado Esperado:**
- O sistema valida a identidade informada.
- A ordem transita para `DELIVERED` com data de entrega gravada.
- O evento `ORDER_DELIVERED` é registrado no histórico com os dados do recebedor.
- A tela entra em modo imutável/terminal.

**Critérios de Sucesso:** Transição para `DELIVERED` e registro completo na timeline.  
**Critérios de Falha:** Entrega permitida sem identificação ou falha na gravação do histórico.

