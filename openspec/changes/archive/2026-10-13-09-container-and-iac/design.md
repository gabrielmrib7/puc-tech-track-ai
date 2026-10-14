## Context

A plataforma TechTrack opera atualmente como um monólito modular em Next.js 14 com banco PostgreSQL/Supabase e ORM Prisma. Para garantir conformidade com os requisitos de portabilidade (RNF09 / RNF-06) e permitir implantação reproduzível em qualquer provedor de nuvem (AWS, GCP, Azure ou servidores bare-metal), é necessário encapsular a aplicação em imagem OCI padronizada e declarar a infraestrutura necessária com Terraform.

Veja `proposal.md` para a motivação de negócio e `specs/containerization-and-iac/spec.md` para os critérios de aceitação comportamentais.

## Goals / Non-Goals

**Goals:**
- Implementar `Dockerfile` multi-stage eficiente (`node:20-alpine`) reduzindo a superfície de ataque e o tamanho final da imagem (< 250MB).
- Configurar Next.js `output: 'standalone'` em `next.config.mjs` para empacotar apenas dependências essenciais de runtime.
- Executar o contêiner sob o usuário sem privilégios `nextjs` (UID/GID 1001).
- Criar `docker-compose.yml` para orquestração local de desenvolvimento conectando a aplicação a um PostgreSQL isolado.
- Estruturar código Terraform modular em `terraform/` (`main.tf`, `variables.tf`, `outputs.tf`) definindo recursos computacionais e de banco de dados sem segredos estáticos.

**Non-Goals:**
- Não inclui setup de pipelines complexos de Kubernetes (K8s), Helm charts ou service meshes.
- Não substitui o banco gerenciado Supabase existente em produção, servindo como especificação declarativa de infraestrutura e portabilidade.

## Decisions

### 1. Dockerfile Multi-Stage com Build Standalone do Next.js
* **Decisão:** Dividir o build em 4 estágios (`base`, `deps`, `builder`, `runner`). O estágio `builder` gera os clientes Prisma e o build do Next.js standalone. O estágio `runner` copia apenas `.next/standalone`, `.next/static` e `public`.
* **Alternativas Consideradas:** Imagem monolítica única contendo Node completo e ferramentas de build (descartada por gerar imagens > 1.2GB e vulnerabilidades desnecessárias).

### 2. Execução como Usuário Não-Root (`nextjs`)
* **Decisão:** Criação de grupo `nodejs` (GID 1001) e usuário `nextjs` (UID 1001), ajustando permissões de `.next` antes do ponto de entrada `node server.js`.
* **Alternativas Consideradas:** Executar como `root` padrão (rejeitada por violar boas práticas de segurança OCI/CIS).

### 3. Terraform Declarativo Enxuto e Parametrizado
* **Decisão:** Módulos em `terraform/` utilizando provider `aws` ou genérico, parametrizando instâncias, VPCs e banco relacional via variáveis com tipos estritos e descrição.
* **Alternativas Consideradas:** Usar scripts Bash imperativos (rejeitada por violar o requisito de Infraestrutura como Código declarativa e idempotente).

## Risks / Trade-offs

- **[Geração do Prisma Client no Alpine]** $\rightarrow$ *Mitigação:* Instalar `libc6-compat` e `openssl` no estágio `base` do Dockerfile para suportar as engines binárias do Prisma no Alpine Linux.
- **[Exposição acidental de credenciais em `.tf`]** $\rightarrow$ *Mitigação:* Variáveis sensíveis declaradas com `sensitive = true` e sem valor `default` em `variables.tf`, orientando uso de `.tfvars` ignorado pelo `.gitignore`.
- **[Falta de sincronização de schema no contêiner]** $\rightarrow$ *Mitigação:* Script de entrada ou comando de inicialização executa `npx prisma migrate deploy` antes de subir o servidor se configurado.

## Migration Plan

1. Ativar `output: 'standalone'` no `next.config.mjs`.
2. Adicionar `Dockerfile`, `.dockerignore` e `docker-compose.yml`.
3. Criar diretório `terraform/` com `main.tf`, `variables.tf` e `outputs.tf`.
4. Testar localmente a compilação com `docker build` e validação com `terraform validate`.
