## Why

As changes anteriores foram arquivadas, mas o produto atual ainda contém fluxos críticos incompletos: telas administrativas com dados fixos, navegação sem destinos reais e autenticação que pode devolver o usuário ao login quando a sincronização local não ocorreu. Isso impede validar o produto de ponta a ponta e torna o cadastro de usuários e a operação diária inviáveis.

Esta change recupera a funcionalidade mínima de produção do produto existente, conectando o frontend aos casos de uso e endpoints reais, corrigindo o bootstrap de identidade e transformando os fluxos principais em operações testáveis.

## What Changes

- Corrigir o fluxo Clerk de login, cadastro e pós-login, incluindo sincronização idempotente e tratamento explícito para usuário ainda não provisionado.
- Criar um bootstrap seguro para o primeiro usuário `ADMIN`, sem permitir que o cliente escolha privilégios administrativos livremente.
- Substituir mocks do dashboard e da lista de ordens por consultas reais, filtros funcionais, paginação, estados de loading/erro/vazio e atualização após mutações.
- Implementar telas navegáveis para clientes e equipamentos usando os endpoints existentes, com criação, busca, validação e mensagens de conflito.
- Completar o fluxo de nova ordem de serviço, incluindo seleção/criação de cliente e equipamento, envio, confirmação e atualização da listagem.
- Corrigir rotas e navegação do shell administrativo, removendo links `#` para fluxos que fazem parte do produto.
- Alinhar contratos de API, tratamento de erros e cobertura E2E aos comportamentos reais esperados.
- Revalidar tipagem, lint, testes unitários, integração e fluxos Playwright antes de considerar a change concluída.

## Capabilities

### New Capabilities

- `functional-auth-bootstrap`: cadastro, provisionamento local, bootstrap do primeiro administrador e redirecionamento pós-login.
- `operational-frontend-data`: integração do frontend com dados reais, estados de interface, filtros, paginação e navegação operacional.
- `customer-equipment-workflows`: operações funcionais de clientes e equipamentos no painel autorizado.
- `service-order-operations-ui`: criação, listagem, filtragem, detalhe e atualização operacional de ordens de serviço.

### Modified Capabilities

- Nenhuma. As specs de domínio arquivadas permanecem como histórico; esta change define os comportamentos de recuperação da camada funcional atual.

## Impact

- Frontend Next.js em `tech_Track/src/app`, componentes compartilhados e estilos.
- Módulos de autenticação, clientes, equipamentos e ordens de serviço em `tech_Track/src/modules`.
- Route handlers sob `tech_Track/src/app/api`, webhook Clerk e configuração de ambiente.
- Prisma User/Customer/Equipment/ServiceOrder e seus contratos de autorização, sem migrações destrutivas.
- Testes Vitest e Playwright, incluindo setup de autenticação e cenários de erro.
- Possível adição de uma variável de ambiente para bootstrap administrativo, documentada apenas como configuração e sem segredo real versionado.