# Mudança 09: Empacotamento em Contêineres OCI e Infraestrutura como Código (IaC)

## Why

Para atender aos padrões corporativos de portabilidade, reprodutibilidade de ambientes e requisitos formais de infraestrutura (RNF-06 / RNF09), a plataforma **TechTrack** necessita de empacotamento declarativo padronizado em contêineres OCI e provisionamento declarativo via Infraestrutura como Código (IaC). Atualmente o deploy depende de ambientes de desenvolvimento locais ou serverless diretos sem uma especificação portável de contêiner ou governança de infraestrutura declarativa por código.

Esta mudança introduz o empacotamento oficial da aplicação em contêiner multi-stage compatível com a Open Container Initiative (OCI), orquestração para desenvolvimento local via Docker Compose e módulos declarativos de Terraform para provisionamento de infraestrutura em nuvem.

## What Changes

- **Empacotamento OCI Multi-Stage (`Dockerfile`):**
  - Criação do `Dockerfile` multi-stage padronizado utilizando Node.js LTS Alpine.
  - Estágio `base` (dependências comuns e libc).
  - Estágio `deps` (instalação de dependências via `npm ci` respeitando cache).
  - Estágio `builder` (geração dos tipos Prisma e compilação Next.js otimizada em modo `standalone`).
  - Estágio `runner` (imagem enxuta de produção, sem dependências de compilação, executando sob usuário sem privilégios `nextjs:nodejs` UID/GID 1001).
- **Controle de Build e Contexto (`.dockerignore`):**
  - Isolamento de `node_modules`, `.next`, `.git`, arquivos `.env*` reais e relatórios locais de teste.
- **Orquestração de Desenvolvimento (`docker-compose.yml`):**
  - Definição do serviço da aplicação (`techtrack-app`) mapeando porta 3000.
  - Definição de serviço auxiliar de banco relacional PostgreSQL com volume persistente para desenvolvimento e homologação isolada.
- **Infraestrutura como Código Declarativa com Terraform (`terraform/`):**
  - `terraform/main.tf`: Configuração do backend, providers e recursos estruturais de computação e banco de dados.
  - `terraform/variables.tf`: Parametrização de ambiente (`environment`), região, instâncias e credenciais sem valores sensíveis hardcoded.
  - `terraform/outputs.tf`: Exportação de endpoints públicos, URLs de conexão e IDs de recursos gerados.
- **Não-Objetivos (Non-Goals):**
  - Não inclui criação de pipelines de Kubernetes (K8s) ou clusters complexos de malha de serviços (service mesh), mantendo a complexidade e risco estritamente dentro da faixa média.

## Capabilities

### New Capabilities

- `containerization-and-iac`: Especificação e empacotamento da aplicação em contêiner OCI multi-stage e infraestrutura declarativa com Terraform para provisionamento reprodutível.

### Modified Capabilities

*Nenhuma (infraestrutura e portabilidade sem alteração nos contratos de regras de negócio das capabilities anteriores).*

## Impact

- **Código Afetado:** Criação de `Dockerfile`, `.dockerignore`, `docker-compose.yml` na raiz do projeto e estrutura `terraform/` com `main.tf`, `variables.tf` e `outputs.tf`.
- **Configuração:** Ativação de `output: 'standalone'` no `next.config.mjs` para geração de pacote enxuto pelo builder.
- **Segurança e Conformidade:** Execução do contêiner como non-root (`nextjs`), proteção de variáveis sensíveis em tempo de build/execução.
- **Personas / RBAC:** Transparente para usuários finais; beneficia operadores e engenheiros DevOps com deploy consistente.

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Criação de Dockerfile multi-stage, docker-compose e módulo Terraform completo. |
| **Complexidade** | **Média** | Otimização do build Next.js com Prisma Client no contêiner e separação de variáveis no Terraform. |
| **Risco** | **Baixo** | Não altera a lógica de domínio ou banco de dados relacional existente. |

### Escopo Funcional
- Construção de imagem Docker OCI funcional com `docker build -t techtrack:latest .`.
- Execução do contêiner expondo a porta 3000 e respondendo a requisições HTTP.
- Execução local via `docker-compose up -d`.
- Validação e formatação de sintaxe dos manifests Terraform (`terraform fmt` e `terraform validate`).

### Dependências
- `01-foundation-and-database`: Acesso ao `package.json`, `prisma/schema.prisma` e configuração do Next.js.

### Riscos e Mitigações
- **Tamanho excessivo da imagem Docker:** Uso de compilação multi-stage com `output: 'standalone'` no Next.js e imagem final Alpine pura (tamanho inferior a 250MB).
- **Falha de inicialização do Prisma no contêiner:** Inclusão de `npx prisma generate` no estágio de build garantindo que o Prisma Client esteja pronto no runner.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
terraform fmt -check
terraform validate
```

#### 2. Testes Unitários Necessários
- Validação estática da configuração de compilação `next.config.mjs` garantindo flag `standalone`.
- Validação dos arquivos de variáveis do Terraform.

#### 3. Testes de Integração Necessários
- Execução de `docker build` gerando a imagem OCI sem falhas.
- Subida de contêiner de teste via `docker compose` e teste de healthcheck.

#### 4. Testes E2E Necessários
- Smoke test HTTP contra o contêiner em execução confirmando status `200 OK` na rota raiz `/` e carregamento de assets estáticos.
