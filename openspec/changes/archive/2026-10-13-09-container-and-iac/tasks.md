## 1. Configuração de Build do Next.js e Contexto Docker

- [x] 1.1 Configurar `output: 'standalone'` no `next.config.mjs` e validar que a compilação local continua gerando `.next` sem erros.
- [x] 1.2 Criar arquivo `.dockerignore` na raiz excluindo `node_modules`, `.next`, `.git`, `.env*` reais e relatórios de cobertura.

## 2. Empacotamento em Contêiner OCI Multi-Stage

- [x] 2.1 Criar o `Dockerfile` multi-stage com estágios `base`, `deps`, `builder` e `runner` baseado em `node:20-alpine`, configurando usuário sem privilégios `nextjs:nodejs` e porta 3000.
- [x] 2.2 Criar arquivo `docker-compose.yml` para orquestração local de desenvolvimento integrando serviço `web` e banco `db` (PostgreSQL 15 Alpine).
- [x] 2.3 Validar a compilação da imagem executando `docker build -t techtrack:latest .` ou simulação de build verificando ausência de dependências de desenvolvimento no runner.

## 3. Infraestrutura como Código com Terraform

- [x] 3.1 Criar diretório `terraform/` e o arquivo `terraform/variables.tf` com variáveis parametrizadas (`environment`, `aws_region`, `instance_type`, `db_name`) com tipagem e descrições.
- [x] 3.2 Criar o arquivo `terraform/main.tf` definindo provedor, VPC/subnets básicas, recurso computacional para o contêiner e banco relacional.
- [x] 3.3 Criar o arquivo `terraform/outputs.tf` exportando endpoint da aplicação e connection string parametrizada.
- [x] 3.4 Validar a formatação e sintaxe dos arquivos declarativos executando `terraform fmt -check` e `terraform validate` (quando CLI do terraform disponível) ou validação estática estrutural.

## 4. Verificação de Qualidade e Portões de Aceite

- [x] 4.1 Executar checagem estática de tipos (`npx tsc --noEmit`) e linter (`npm run lint`), garantindo zero erros.
- [x] 4.2 Executar suíte de testes unitários e de integração (`npm run test`) para assegurar que as configurações de build não causaram regressões.
- [x] 4.3 Testar a inicialização do contêiner e verificar que a rota `/` responde com HTTP 200 via healthcheck/curl.
