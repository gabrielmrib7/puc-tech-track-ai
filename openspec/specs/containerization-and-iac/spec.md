# Containerization and IaC Specification

## Purpose

Fornece empacotamento declarativo da aplicação em contêiner OCI multi-stage e infraestrutura como código (IaC) via Terraform para reprodutibilidade de deploys e portabilidade em nuvem.

## Requirements

### Requirement: OCI Multi-Stage Container Packaging
A aplicação TechTrack SHALL disponibilizar um arquivo `Dockerfile` multi-stage padronizado OCI capaz de compilar a aplicação Next.js no modo `standalone` e executá-la com Node.js LTS sobre imagem base Alpine.

#### Scenario: Successful image build
- **WHEN** o comando `docker build -t techtrack:latest .` for executado na raiz do repositório
- **THEN** a imagem de contêiner é compilada com sucesso sem conter ferramentas de build (`devDependencies`) na camada final e com tamanho total inferior a 250MB

#### Scenario: Non-root execution
- **WHEN** o contêiner for instanciado
- **THEN** o processo Node.js principal executa sob o usuário sem privilégios `nextjs` (UID 1001)

### Requirement: Local Multi-Container Orchestration
O projeto SHALL disponibilizar arquivo `docker-compose.yml` para orquestrar localmente o contêiner da aplicação e as dependências necessárias para desenvolvimento isolado.

#### Scenario: Local stack startup
- **WHEN** o comando `docker compose up -d` for executado
- **THEN** o serviço da aplicação inicia e fica acessível na porta 3000 respondendo requisições HTTP

### Requirement: Declarative Infrastructure as Code with Terraform
O projeto SHALL fornecer manifests declarativos Terraform estruturados no diretório `terraform/` com separação de responsabilidades em `main.tf`, `variables.tf` e `outputs.tf`.

#### Scenario: Terraform configuration validation
- **WHEN** os comandos `terraform fmt -check` e `terraform validate` forem executados em `terraform/`
- **THEN** a sintaxe e os recursos declarados são validados com sucesso sem erros ou advertências

#### Scenario: Terraform variables parametrization
- **WHEN** as variáveis de infraestrutura forem configuradas
- **THEN** nenhum dado sensível (chaves secretas, senhas) está codificado estaticamente nos arquivos `.tf` versionados
