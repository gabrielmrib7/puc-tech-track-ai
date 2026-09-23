# Plano de Testes: Login com Clerk

## Objetivo

Validar o fluxo de autenticação integrado ao Clerk e os contratos definidos em `openspec/specs/user-authentication/spec.md`:

- bloquear acesso sem sessão a rotas protegidas;
- sincronizar usuários Clerk com o modelo local de forma idempotente;
- redirecionar usuários autenticados conforme o papel, especialmente `CUSTOMER` para `/portal` e papéis de equipe para `/admin/dashboard`.

## Escopo

Incluído:

- tela `/login` e autenticação por senha do Clerk;
- proteção de `/portal`, `/admin/*` e `/api/v1/*`;
- retorno de sessão inválida ou ausente;
- webhook `POST /api/webhooks/clerk` para `user.created` e `user.updated`;
- sincronização por `clerk_id`;
- redirecionamento pós-login por papel.

Fora do escopo:

- MFA, login social e recuperação de senha, pois não estão especificados nem configurados no fluxo atual;
- autorização detalhada de cada endpoint após o login;
- criação de dados de OS, orçamento ou equipamentos.

## Pré-condições e dados

1. Executar os testes a partir de `tech_Track/` com dependências instaladas.
2. Iniciar o servidor com `npm run dev` ou deixar o `webServer` do Playwright iniciá-lo.
3. Configurar `PLAYWRIGHT_BASE_URL` quando a aplicação não estiver em `http://127.0.0.1:3000`.
4. Para cenários Clerk autenticados, configurar `E2E_CLERK_USER_IDENTIFIER` e `E2E_CLERK_USER_PASSWORD` com uma conta de teste real.
5. Preparar contas independentes no Clerk para pelo menos:
   - um usuário `CUSTOMER` sincronizado localmente;
   - um usuário `ADMIN`, `ATTENDANT` ou `TECHNICIAN` sincronizado localmente.
6. Garantir banco de teste limpo antes de cada cenário ou usar identificadores únicos. O estado inicial de cada cenário é sempre uma sessão de navegador nova e sem `storageState`, salvo quando o cenário disser o contrário.
7. Para o webhook, configurar `CLERK_WEBHOOK_SECRET` e gerar assinatura Svix válida para o payload. Nunca registrar senha, token ou segredo no relatório.

## Observabilidade e critérios gerais

- Registrar URL final, status HTTP, papel usado e identificador local do usuário, sem expor credenciais ou tokens.
- Considerar falha qualquer acesso a conteúdo protegido sem autenticação, qualquer redirect para área incompatível com o papel ou qualquer duplicação de usuário após reprocessamento do evento.
- Em cada execução, coletar trace do Playwright quando houver retry ou falha.
- Os seletores devem priorizar roles, labels e URLs; não depender de classes Tailwind ou texto visual incidental.

## Cenários

### AUTH-001: Usuário não autenticado é enviado para o login ao abrir a raiz

**Tipo:** E2E navegador  
**Prioridade:** Crítica  
**Pré-condição:** Contexto de navegador novo, sem cookies ou `storageState`.

**Passos:**

1. Abrir `/`.
2. Aguardar a navegação terminar.
3. Verificar a URL final.
4. Verificar que o componente de login Clerk está visível, incluindo o campo de identificação ou a mensagem equivalente de login.

**Resultado esperado:**

- A aplicação redireciona para `/login`.
- Nenhum conteúdo de portal ou painel administrativo é exibido.
- O login pode ser iniciado pelo componente `SignIn` do Clerk.

**Sucesso:** URL final em `/login` e formulário Clerk visível.  
**Falha:** página protegida renderizada sem sessão, erro 5xx ou ausência do formulário.

### AUTH-002: Usuário não autenticado não acessa o portal do cliente

**Tipo:** E2E navegador  
**Prioridade:** Crítica  
**Pré-condição:** Contexto novo, sem sessão.

**Passos:**

1. Abrir diretamente `/portal`.
2. Aguardar a resposta de navegação.
3. Verificar a URL final e a ausência do título `Acompanhe seus reparos`.

**Resultado esperado:**

- O middleware Clerk redireciona a navegação para `/login` ou retorna o fluxo de autenticação equivalente.
- O conteúdo protegido do portal não fica acessível.

**Sucesso:** não há acesso anônimo ao portal.  
**Falha:** status 200 com conteúdo do portal sem autenticação ou acesso a dados do cliente.

### AUTH-003: Requisição sem sessão recebe 401 em endpoint protegido

**Tipo:** E2E/API Playwright  
**Prioridade:** Crítica  
**Pré-condição:** `APIRequestContext` sem cookies de autenticação.

**Passos:**

1. Enviar `GET /api/v1/customer/orders` sem cabeçalho `Authorization` nem cookies Clerk.
2. Capturar o status e o corpo da resposta.
3. Repetir contra `GET /api/v1/admin/dashboard`.

**Resultado esperado:**

- Cada requisição é rejeitada com `401`, ou com o comportamento de proteção documentado pelo Clerk para route handlers.
- A resposta não contém ordens, indicadores ou dados de outro usuário.

**Sucesso:** ambos os endpoints permanecem inacessíveis sem sessão.  
**Falha:** status 200, dados de negócio no corpo ou erro 5xx causado pela ausência de usuário.

### AUTH-004: CUSTOMER conclui login e vai para o portal

**Tipo:** E2E navegador com Clerk real  
**Prioridade:** Crítica  
**Pré-condição:** usuário Clerk de teste com credenciais válidas e registro local com `clerk_id` correspondente e papel `CUSTOMER`.

**Passos:**

1. Abrir `/login` em um contexto novo.
2. Aguardar `clerk.loaded`.
3. Preencher o identificador e a senha da conta CUSTOMER usando variáveis de ambiente do teste.
4. Submeter o formulário.
5. Aguardar a conclusão da sessão.
6. Verificar a URL final e o título do portal.
7. Recarregar `/portal` para confirmar que a sessão persiste.

**Resultado esperado:**

- O login é concluído sem mensagem de credencial inválida.
- O usuário é redirecionado para `/portal`.
- O portal exibe `Acompanhe seus reparos`.
- A recarga continua autenticada.

**Sucesso:** URL final `/portal`, conteúdo de CUSTOMER visível e sessão persistente.  
**Falha:** redirect para `/admin/dashboard`, `/login`, área de outro usuário ou sessão perdida após recarga.

### AUTH-005: Usuário de equipe conclui login e vai para o painel administrativo

**Tipo:** E2E navegador com Clerk real  
**Prioridade:** Alta  
**Pré-condição:** conta independente com papel local `ADMIN`, `ATTENDANT` ou `TECHNICIAN` e `clerk_id` correspondente.

**Passos:**

1. Abrir `/login` em um contexto novo.
2. Autenticar usando a conta de equipe.
3. Aguardar a navegação pós-login.
4. Verificar a URL final.
5. Verificar a presença do heading `Dashboard`.
6. Tentar abrir `/portal` no mesmo contexto.

**Resultado esperado:**

- Qualquer papel de equipe é redirecionado para `/admin/dashboard`.
- O dashboard é exibido.
- A tentativa de acessar o portal não concede conteúdo de CUSTOMER que dependa do papel.

**Sucesso:** redirect administrativo correto e ausência de cross-role indevido.  
**Falha:** papel de equipe vai para `/portal`, permanece em `/login` ou acessa dados de cliente.

### AUTH-006: Credenciais inválidas não criam sessão

**Tipo:** E2E navegador com Clerk real  
**Prioridade:** Alta  
**Pré-condição:** contexto novo e identificador/senha inválidos controlados pelo ambiente de teste.

**Passos:**

1. Abrir `/login`.
2. Informar credenciais inválidas.
3. Submeter o formulário.
4. Aguardar a mensagem de erro do Clerk.
5. Tentar abrir `/portal` em seguida.

**Resultado esperado:**

- O Clerk mostra erro de autenticação no formulário.
- O usuário permanece em `/login`.
- `/portal` continua protegido.

**Sucesso:** nenhuma sessão aplicável é criada.  
**Falha:** redirect autenticado ou acesso a qualquer área protegida após falha de login.

### AUTH-007: Evento user.created sincroniza um usuário local

**Tipo:** API/integrado  
**Prioridade:** Crítica  
**Pré-condição:** banco de teste sem usuário com o `clerk_id` do payload; assinatura Svix válida; payload `user.created` com e-mail e nome.

**Passos:**

1. Montar payload `user.created` com `id`, primeiro nome, sobrenome e um e-mail de teste.
2. Assinar o corpo com `CLERK_WEBHOOK_SECRET` e cabeçalhos `svix-id`, `svix-timestamp` e `svix-signature`.
3. Enviar `POST /api/webhooks/clerk`.
4. Verificar status e corpo da resposta.
5. Consultar o banco pelo `clerk_id`.

**Resultado esperado:**

- O endpoint responde `200` com `{ "received": true }`.
- Existe exatamente um User com o `clerk_id` enviado.
- E-mail e nome foram persistidos.
- O papel padrão é `ATTENDANT` quando o payload não informa papel local.

**Sucesso:** sincronização completa e um único registro.  
**Falha:** usuário não criado, duplicação, dados incorretos ou resposta 5xx.

### AUTH-008: Reprocessamento de user.updated é idempotente

**Tipo:** API/integrado  
**Prioridade:** Crítica  
**Pré-condição:** usuário criado pelo cenário AUTH-007 ou fixture equivalente.

**Passos:**

1. Enviar um evento `user.updated` assinado com o mesmo `clerk_id`, mas novo nome e/ou e-mail.
2. Verificar resposta `200`.
3. Reenviar o mesmo evento uma segunda vez.
4. Consultar o banco por `clerk_id`.
5. Contar registros com esse `clerk_id` e verificar o papel anterior.

**Resultado esperado:**

- As duas entregas são aceitas.
- Continua existindo exatamente um User para o `clerk_id`.
- Nome e e-mail refletem os valores mais recentes.
- O papel já existente não é sobrescrito pelo valor padrão de sincronização.

**Sucesso:** atualização idempotente, sem duplicação e sem perda do papel.  
**Falha:** criação de segundo usuário, mudança indevida de papel ou dados antigos após o update.

### AUTH-009: Webhook sem assinatura válida é rejeitado

**Tipo:** API/integrado  
**Prioridade:** Crítica  
**Pré-condição:** banco de teste disponível e nenhum efeito esperado sobre os dados.

**Passos:**

1. Enviar um payload `user.created` sem cabeçalhos Svix.
2. Verificar a resposta.
3. Repetir com assinatura inválida.
4. Consultar o banco pelo `clerk_id` usado no payload.

**Resultado esperado:**

- Cada requisição responde `400` com erro de assinatura inválida.
- Nenhum usuário é criado ou atualizado.

**Sucesso:** evento não autenticado não altera o banco.  
**Falha:** status 200, persistência de usuário ou qualquer efeito colateral.

### AUTH-010: Webhook sem e-mail rejeita o evento sem criar usuário

**Tipo:** API/integrado  
**Prioridade:** Alta  
**Pré-condição:** assinatura Svix válida e payload `user.created` sem `email_addresses` ou com lista vazia.

**Passos:**

1. Enviar o evento assinado.
2. Verificar status e corpo.
3. Consultar o banco pelo `clerk_id` do evento.

**Resultado esperado:**

- O endpoint responde `422` com indicação de que o e-mail é obrigatório.
- Nenhum registro local é criado.

**Sucesso:** validação rejeita dados incompletos sem efeito colateral.  
**Falha:** usuário criado com e-mail vazio, status 200 ou erro 5xx.

### AUTH-011: Evento Clerk não relacionado é aceito sem sincronização

**Tipo:** API/integrado  
**Prioridade:** Média  
**Pré-condição:** assinatura Svix válida e evento como `session.created` ou outro tipo não tratado.

**Passos:**

1. Enviar o evento assinado com identificador de usuário que não existe localmente.
2. Verificar a resposta.
3. Consultar o banco.

**Resultado esperado:**

- O endpoint responde `200` com `{ "received": true }`.
- Nenhum User é criado ou alterado.

**Sucesso:** eventos não suportados são reconhecidos sem processamento indevido.  
**Falha:** criação de usuário ou erro 4xx/5xx para evento ignorável.

## Matriz de cobertura

| Requisito | Cenários |
|---|---|
| Sessão ausente em rota protegida | AUTH-001, AUTH-002 |
| Sessão ausente em API protegida | AUTH-003 |
| Login CUSTOMER | AUTH-004 |
| Redirect de equipe | AUTH-005 |
| Falha de credenciais | AUTH-006 |
| Sincronização `user.created` | AUTH-007 |
| Atualização idempotente por `clerk_id` | AUTH-008 |
| Assinatura inválida | AUTH-009 |
| Payload sem e-mail | AUTH-010 |
| Evento não suportado | AUTH-011 |

## Execução planejada

- Listar testes: `npx playwright test --list`.
- Executar cenários sem credenciais Clerk: `npx playwright test --project=chromium`.
- Habilitar o setup Clerk e os projetos autenticados definindo `E2E_CLERK_USER_IDENTIFIER` e `E2E_CLERK_USER_PASSWORD`, depois executar `npx playwright test --project=clerk-auth-setup --project=chromium-authenticated`.
- Rodar a suíte completa com `npm run test:e2e` após cadastrar as fixtures de CUSTOMER e equipe.

## Lacunas e riscos conhecidos

1. O `playwright.config.ts` habilita apenas um usuário autenticado por execução; AUTH-004 e AUTH-005 precisam de projetos/fixtures separados ou execução com variáveis diferentes.
2. A regra de papel é armazenada no User local, enquanto o Clerk fornece a identidade; o teste de redirect depende de os registros locais estarem sincronizados antes do login.
3. O cenário de sincronização exige assinatura Svix válida e acesso controlado ao banco de teste; ele não deve usar o segredo de produção.
4. A especificação aceita `401` ou redirect para requisição protegida, então os asserts devem refletir o tipo de chamada, sem fixar um comportamento incompatível com o middleware Clerk.
5. O teste atual `apps/frontend/tests/seed.spec.ts` é apenas um placeholder e não cobre autenticação; os cenários acima devem ser implementados em arquivos independentes, por exemplo `auth.spec.ts` e `clerk-webhook.spec.ts`.
