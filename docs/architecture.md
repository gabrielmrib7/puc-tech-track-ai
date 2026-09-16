# Arquitetura de Software — TechTrack

## 1. Informações do Documento

**Produto:** TechTrack  
**Documento:** Arquitetura de Software  
**Versão:** 1.0  
**Escopo:** MVP

---

# 2. Visão Geral

O TechTrack será desenvolvido como uma aplicação web baseada em uma arquitetura **monolítica modular**, composta por:

- Frontend web responsivo.
- Backend com API REST.
- Banco de dados relacional.
- Serviço de autenticação e autorização.
- Camada de persistência.
- Módulos independentes dentro do backend.

A arquitetura foi escolhida considerando o escopo do MVP, o tamanho esperado da aplicação e a necessidade de permitir evolução futura.

A estrutura lógica será:

```text
┌──────────────────────────────────────┐
│              Usuários                │
│                                      │
│ Cliente | Atendente | Técnico | Admin│
└──────────────────┬───────────────────┘
                   │
                   │ HTTPS
                   ▼
┌──────────────────────────────────────┐
│             Frontend Web             │
│                                      │
│ Portal do Cliente                    │
│ Painel Administrativo                │
└──────────────────┬───────────────────┘
                   │
                   │ REST / JSON
                   ▼
┌──────────────────────────────────────┐
│             Backend API              │
│                                      │
│ ┌────────────┐ ┌───────────────────┐ │
│ │Autenticação │ │ Usuários          │ │
│ ├────────────┤ ├───────────────────┤ │
│ │ Clientes   │ │ Equipamentos      │ │
│ ├────────────┤ ├───────────────────┤ │
│ │ Ordens     │ │ Orçamentos        │ │
│ ├────────────┤ ├───────────────────┤ │
│ │ Histórico  │ │ Notificações      │ │
│ └────────────┘ └───────────────────┘ │
└──────────────────┬───────────────────┘
                   │
                   │ ORM / SQL
                   ▼
┌──────────────────────────────────────┐
│        Banco de Dados Relacional     │
│                                      │
│ Users                                │
│ Customers                            │
│ Equipment                            │
│ Service Orders                       │
│ Budgets                              │
│ History                              │
└──────────────────────────────────────┘
```

---

# 3. Estilo Arquitetural

## 3.1 Monólito Modular

O backend será executado como uma única aplicação, mas dividido em módulos funcionais.

```text
Backend
│
├── Authentication
├── Users
├── Customers
├── Equipment
├── Service Orders
├── Budgets
├── History
└── Notifications
```

Cada módulo deverá possuir responsabilidades bem definidas.

### Justificativa

A utilização de microsserviços neste momento adicionaria complexidade desnecessária relacionada a:

- Comunicação entre serviços.
- Descoberta de serviços.
- Deploy independente.
- Monitoramento distribuído.
- Gerenciamento de múltiplos bancos.
- Tratamento de falhas entre serviços.

Para o MVP, o monólito modular oferece uma relação melhor entre simplicidade e organização.

---

# 4. Camadas da Aplicação

O backend deverá utilizar uma arquitetura em camadas.

```text
┌─────────────────────────────┐
│       Presentation          │
│ Controllers / REST API      │
├─────────────────────────────┤
│       Application           │
│ Use Cases / Services        │
├─────────────────────────────┤
│          Domain             │
│ Entities / Business Rules   │
├─────────────────────────────┤
│      Infrastructure         │
│ Database / External APIs    │
└─────────────────────────────┘
```

---

# 5. Camada de Apresentação

Responsável por receber as requisições HTTP e retornar respostas.

Componentes:

- Controllers.
- DTOs.
- Validação de entrada.
- Tratamento de erros.
- Middleware de autenticação.

Exemplo:

```text
POST /api/service-orders
        │
        ▼
ServiceOrderController
        │
        ▼
CreateServiceOrderUseCase
```

Os controllers não deverão conter regras de negócio complexas.

---

# 6. Camada de Aplicação

Responsável pela execução dos casos de uso.

Exemplos:

```text
CreateCustomer
CreateServiceOrder
UpdateServiceOrderStatus
RegisterDiagnosis
CreateBudget
ApproveBudget
RejectBudget
GetCustomerServiceOrders
```

Cada caso de uso deverá coordenar as operações necessárias para executar uma ação do sistema.

---

# 7. Camada de Domínio

Responsável pelas regras de negócio.

Principais entidades:

```text
User
Customer
Equipment
ServiceOrder
Budget
ServiceOrderHistory
```

As regras de transição de status deverão permanecer nessa camada ou em serviços de domínio específicos.

Exemplo:

```text
RECEIVED
    ↓
WAITING_DIAGNOSIS
```

é uma transição válida.

Porém:

```text
DELIVERED
    ↓
IN_DIAGNOSIS
```

é inválida.

Essa regra deverá ser aplicada independentemente de a alteração vir do frontend ou de uma integração externa.

---

# 8. Camada de Infraestrutura

Responsável pelos recursos externos utilizados pela aplicação.

Componentes:

- Banco de dados.
- ORM.
- Repositórios.
- Serviço de autenticação.
- Serviço de envio de notificações.
- Logs.
- Configurações externas.

Exemplo:

```text
ServiceOrderRepository
CustomerRepository
UserRepository
BudgetRepository
```

---

# 9. Frontend

O frontend será uma aplicação web responsiva.

Ele terá duas áreas principais.

## 9.1 Portal do Cliente

Telas:

```text
Login
  ↓
Dashboard
  ↓
Minhas Ordens
  ↓
Detalhes da Ordem
  ├── Status
  ├── Equipamento
  ├── Diagnóstico
  ├── Orçamento
  └── Histórico
```

---

## 9.2 Painel Administrativo

Telas:

```text
Login
  ↓
Dashboard
  ├── Indicadores
  ├── Ordens
  ├── Clientes
  ├── Equipamentos
  └── Usuários
```

Detalhamento da ordem:

```text
Ordem de Serviço
├── Informações
├── Cliente
├── Equipamento
├── Diagnóstico
├── Orçamento
├── Status
└── Histórico
```

---

# 10. Comunicação Frontend/Backend

A comunicação será realizada através de HTTPS utilizando API REST.

Formato:

```text
Frontend
   │
   │ HTTPS
   │ JSON
   ▼
Backend API
```

Exemplo:

```http
GET /api/service-orders/OS-2026-000123
```

Resposta:

```json
{
  "orderNumber": "OS-2026-000123",
  "status": "IN_REPAIR",
  "estimatedCompletion": "2026-08-20"
}
```

---

# 11. API Gateway

No MVP não será necessário um API Gateway independente.

A própria aplicação backend ficará responsável por:

- Receber requisições.
- Autenticar usuários.
- Autorizar operações.
- Encaminhar requisições aos módulos.
- Retornar respostas.

Uma camada de gateway poderá ser adicionada posteriormente caso o produto evolua para múltiplos serviços.

---

# 12. Autenticação

A autenticação será baseada em tokens.

Fluxo:

```text
Usuário
   │
   │ Login
   ▼
POST /api/auth/login
   │
   ▼
Backend
   │
   ├── Valida credenciais
   │
   └── Gera tokens
          │
          ├── Access Token
          └── Refresh Token
```

O Access Token será utilizado nas requisições autenticadas.

---

# 13. Autorização

Será utilizado **Role-Based Access Control — RBAC**.

Perfis:

```text
ADMIN
ATTENDANT
TECHNICIAN
CUSTOMER
```

Exemplo:

```text
POST /api/service-orders
        │
        ▼
     RBAC
        │
    ┌───┴────┐
    │        │
 Admin    Atendente
    │        │
    └───┬────┘
        │
      Permitido
```

Um cliente não poderá criar uma ordem de serviço através dessa API.

---

# 14. Banco de Dados

Será utilizado um banco de dados relacional.

A estrutura principal será:

```text
users
  │
  ├──────────────┐
  │              │
customers     technicians
  │
  │
  ▼
equipment
  │
  ▼
service_orders
  │
  ├───────────────┐
  │               │
  ▼               ▼
budgets       service_order_history
```

---

# 15. Modelo Entidade-Relacionamento

```text
┌───────────────┐
│     USER      │
├───────────────┤
│ id            │
│ name          │
│ email         │
│ password_hash │
│ role          │
└───────┬───────┘
        │
        │ 1:N
        ▼
┌───────────────┐
│   CUSTOMER    │
├───────────────┤
│ id            │
│ user_id       │
│ name          │
│ email         │
│ phone         │
└───────┬───────┘
        │
        │ 1:N
        ▼
┌───────────────┐
│   EQUIPMENT   │
├───────────────┤
│ id            │
│ customer_id   │
│ type          │
│ brand         │
│ model         │
│ serial_number │
└───────┬───────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│  SERVICE_ORDER   │
├──────────────────┤
│ id               │
│ order_number     │
│ customer_id      │
│ equipment_id     │
│ technician_id    │
│ status           │
│ diagnosis        │
│ budget_amount    │
│ estimated_date   │
└───────┬──────────┘
        │
        ├───────────────┐
        │               │
        ▼               ▼
┌───────────────┐ ┌──────────────────────┐
│    BUDGET     │ │ SERVICE_ORDER_HISTORY│
├───────────────┤ ├──────────────────────┤
│ id            │ │ id                   │
│ order_id      │ │ order_id             │
│ amount        │ │ user_id              │
│ status        │ │ action               │
│ description   │ │ old_status           │
└───────────────┘ │ new_status           │
                  └──────────────────────┘
```

---

# 16. Transação de Aprovação

A aprovação de orçamento é uma operação crítica.

O fluxo deverá ser:

```text
Cliente solicita aprovação
          │
          ▼
Verifica autenticação
          │
          ▼
Verifica propriedade da OS
          │
          ▼
Verifica orçamento PENDING
          │
          ▼
BEGIN TRANSACTION
          │
          ├── Atualiza orçamento
          │
          ├── Atualiza ordem
          │
          └── Cria histórico
          │
          ▼
COMMIT
```

Caso qualquer operação falhe:

```text
ROLLBACK
```

Isso evita situações inconsistentes, como o orçamento estar aprovado enquanto a ordem continua aguardando aprovação.

---

# 17. Máquina de Estados

A ordem de serviço deverá ser tratada como uma máquina de estados.

```text
                    ┌──────────────┐
                    │   RECEIVED   │
                    └──────┬───────┘
                           ↓
                 ┌────────────────────┐
                 │ WAITING_DIAGNOSIS  │
                 └─────────┬──────────┘
                           ↓
                 ┌────────────────────┐
                 │   IN_DIAGNOSIS     │
                 └─────────┬──────────┘
                           ↓
                 ┌────────────────────┐
                 │ WAITING_APPROVAL   │
                 └─────────┬──────────┘
                           ↓
                     ┌─────┴─────┐
                     ↓           ↓
                APPROVED       REJECTED
                     │
                     ↓
                 IN_REPAIR
                     │
                     ↓
                 COMPLETED
                     │
                     ↓
              READY_FOR_PICKUP
                     │
                     ↓
                 DELIVERED
```

Cada transição deverá ser validada pelo backend.

---

# 18. Segurança

## 18.1 HTTPS

Toda comunicação de produção deverá utilizar HTTPS.

## 18.2 Senhas

Senhas deverão ser armazenadas utilizando hashing seguro.

Recomendação:

```text
Argon2id
```

## 18.3 SQL Injection

Consultas ao banco deverão utilizar parâmetros ou ORM.

## 18.4 XSS

Entradas fornecidas pelos usuários deverão ser tratadas adequadamente antes de serem exibidas.

## 18.5 CSRF

Caso a autenticação utilize cookies, deverão ser adotadas medidas de proteção contra CSRF.

## 18.6 Rate Limiting

Endpoints sensíveis, especialmente autenticação, deverão possuir limitação de requisições.

Exemplo:

```text
POST /api/auth/login
```

deverá possuir proteção contra tentativas automatizadas de login.

---

# 19. Proteção de Dados

O sistema deverá seguir princípios de proteção de dados aplicáveis ao contexto brasileiro.

Deverão ser considerados:

- Minimização de dados coletados.
- Controle de acesso.
- Proteção de informações pessoais.
- Registro de acesso quando necessário.
- Política de retenção.
- Exclusão ou anonimização quando aplicável.

A implementação deverá considerar os princípios da LGPD.

---

# 20. Logs

A aplicação deverá registrar eventos importantes.

Exemplo:

```text
2026-08-16 09:20:15
INFO
User 3827 updated ServiceOrder OS-2026-000123
```

Eventos de erro deverão possuir informações suficientes para diagnóstico sem registrar dados sensíveis desnecessários.

---

# 21. Monitoramento

A aplicação deverá possuir mecanismos para monitorar:

- Disponibilidade.
- Erros.
- Tempo de resposta.
- Uso da API.
- Falhas de autenticação.
- Erros de banco de dados.

No MVP, uma solução simples de logging centralizado poderá ser utilizada.

---

# 22. Backup

O banco de dados deverá possuir backups periódicos.

Estratégia inicial:

```text
Backup diário
      ↓
Armazenamento externo
      ↓
Retenção definida
```

Os backups deverão ser testados periodicamente para garantir que possam ser restaurados.

---

# 23. Deployment

A arquitetura de implantação poderá ser:

```text
                 Internet
                    │
                    ▼
              HTTPS / DNS
                    │
                    ▼
             Reverse Proxy
                    │
            ┌───────┴───────┐
            │               │
            ▼               ▼
        Frontend         Backend API
                            │
                            ▼
                        Database
```

O frontend e backend poderão inicialmente ser hospedados em uma infraestrutura de nuvem.

---

# 24. Ambientes

Deverão existir pelo menos três ambientes:

```text
Development
     ↓
Staging
     ↓
Production
```

## Development

Utilizado pelos desenvolvedores.

## Staging

Utilizado para testes antes da publicação.

## Production

Ambiente utilizado pelos usuários reais.

---

# 25. CI/CD

O projeto deverá possuir uma pipeline de integração contínua.

Fluxo:

```text
Developer
    │
    ▼
Git Repository
    │
    ▼
Pull Request
    │
    ├── Testes
    ├── Lint
    ├── Build
    └── Validações
          │
          ▼
       Staging
          │
          ▼
      Production
```

Nenhum código deverá ser enviado diretamente para produção sem passar pelas validações definidas.

---

# 26. Estratégia de Testes

A pirâmide de testes deverá priorizar testes unitários.

```text
           /\
          /  \
         / E2E\
        /------\
       /Integr. \
      /----------\
     / Unitários  \
    /______________\
```

Distribuição esperada:

- Muitos testes unitários.
- Quantidade moderada de testes de integração.
- Poucos testes end-to-end cobrindo os fluxos críticos.

---

# 27. Testes Críticos

Os seguintes fluxos deverão obrigatoriamente possuir testes:

### Autenticação

```text
Login válido
Login inválido
Token expirado
Usuário sem permissão
```

### Ordem

```text
Criar OS
Atualizar status
Transição inválida
Cancelar OS
Concluir OS
```

### Orçamento

```text
Criar orçamento
Aprovar orçamento
Recusar orçamento
Aprovação sem permissão
Aprovação duplicada
```

### Segurança

```text
Cliente acessando OS de outro cliente
Técnico acessando recurso não autorizado
Atendente acessando funcionalidade administrativa
```

---

# 28. Escalabilidade

O MVP será projetado para permitir crescimento horizontal futuro.

Inicialmente:

```text
1 Frontend
1 Backend
1 Banco
```

Com crescimento:

```text
             Load Balancer
                  │
          ┌───────┴───────┐
          │               │
     Backend 01      Backend 02
          │               │
          └───────┬───────┘
                  │
              Database
```

Como o backend será inicialmente stateless, novas instâncias poderão ser adicionadas conforme a demanda.

---

# 29. Cache

Cache não será obrigatório no MVP.

Caso seja identificado um problema de desempenho, poderá ser introduzido posteriormente para informações que possuem alta frequência de leitura.

Exemplos:

- Configurações da assistência.
- Dados estáticos.
- Consultas frequentes.

Informações críticas da ordem de serviço não deverão depender exclusivamente do cache.

---

# 30. Armazenamento de Arquivos

O MVP poderá inicialmente armazenar somente informações textuais.

Em uma evolução futura, o sistema poderá permitir:

- Fotos do equipamento.
- Fotos de defeitos.
- Comprovantes.
- Documentos.
- Anexos técnicos.

Esses arquivos deverão ser armazenados em serviço próprio de armazenamento de objetos, e não diretamente no banco de dados.

---

# 31. Notificações Futuras

A arquitetura deverá permitir a inclusão futura de um módulo de notificações.

```text
ServiceOrder
     │
     ▼
Notification Service
     │
     ├── E-mail
     ├── WhatsApp
     └── Push
```

No MVP, serão utilizadas somente notificações internas.

---

# 32. Decisões Arquiteturais

## ADR-001 — Monólito Modular

**Decisão:** utilizar monólito modular.

**Motivo:** o MVP possui escopo limitado e não necessita da complexidade de microsserviços.

---

## ADR-002 — API REST

**Decisão:** utilizar REST/JSON.

**Motivo:** tecnologia amplamente suportada, simples de integrar e adequada ao domínio.

---

## ADR-003 — Banco Relacional

**Decisão:** utilizar banco de dados relacional.

**Motivo:** o domínio possui relacionamentos claros e necessidade de integridade transacional.

---

## ADR-004 — RBAC

**Decisão:** utilizar controle de acesso baseado em papéis.

**Motivo:** existem perfis bem definidos com diferentes permissões.

---

## ADR-005 — Frontend Responsivo

**Decisão:** aplicação web responsiva.

**Motivo:** permite acesso tanto por computadores utilizados pela assistência quanto por smartphones utilizados pelos clientes.

---

# 33. Tecnologias Sugeridas

A implementação poderá utilizar:

### Frontend

```text
React
TypeScript
HTML
CSS
```

### Backend

```text
Java
Spring Boot
Spring Security
JPA / Hibernate
```

### Banco de dados

```text
PostgreSQL
```

### Infraestrutura

```text
Docker
Git
CI/CD
Cloud
```

### Testes

```text
JUnit
Mockito
Testcontainers
Playwright
```

Essas tecnologias são sugestões arquiteturais e poderão ser substituídas por alternativas equivalentes.

---

# 34. Estrutura do Projeto

Uma possível estrutura do backend:

```text
techtrack-backend/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/techtrack/
│   │   │       │
│   │   │       ├── auth/
│   │   │       ├── user/
│   │   │       ├── customer/
│   │   │       ├── equipment/
│   │   │       ├── serviceorder/
│   │   │       ├── budget/
│   │   │       ├── history/
│   │   │       └── notification/
│   │   │
│   │   └── resources/
│   │       └── application.yml
│   │
│   └── test/
│
├── Dockerfile
├── pom.xml
└── README.md
```

Uma possível estrutura do frontend:

```text
techtrack-frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── routes/
│   ├── types/
│   └── utils/
│
├── public/
├── package.json
└── README.md
```

---

# 35. Fluxo de uma Requisição

Exemplo: cliente consulta uma ordem.

```text
Cliente
   │
   ▼
Frontend
   │
   │ GET /api/service-orders/{id}
   ▼
Controller
   │
   ▼
Authorization
   │
   ▼
Use Case
   │
   ▼
ServiceOrderRepository
   │
   ▼
PostgreSQL
   │
   ▼
Repository
   │
   ▼
Use Case
   │
   ▼
DTO
   │
   ▼
Controller
   │
   ▼
Frontend
   │
   ▼
Cliente
```

---

# 36. Fluxo de Aprovação de Orçamento

```text
Cliente
   │
   ▼
Frontend
   │
   ▼
POST /budget/approve
   │
   ▼
Authentication
   │
   ▼
Authorization
   │
   ▼
ApproveBudgetUseCase
   │
   ├── Verifica cliente
   ├── Verifica OS
   ├── Verifica orçamento
   └── Valida estado
           │
           ▼
      Transaction
       ┌───┼────┐
       │   │    │
       ▼   ▼    ▼
    Budget OS History
       │   │    │
       └───┼────┘
           │
           ▼
         Commit
           │
           ▼
        Response
```

---

# 37. Considerações de Evolução

A arquitetura deverá permitir que o sistema evolua sem exigir uma reescrita completa.

Possíveis evoluções:

```text
MVP
 │
 ├── Notificações
 │
 ├── WhatsApp
 │
 ├── Pagamentos
 │
 ├── Estoque
 │
 ├── Relatórios
 │
 └── Aplicativo Mobile
```

Caso o volume de utilização aumente significativamente, módulos específicos poderão posteriormente ser extraídos para serviços independentes.

A separação lógica atual deverá facilitar essa migração.

---

# 38. Conclusão

A arquitetura proposta atende aos requisitos definidos no PRD e na especificação técnica.

O uso de um monólito modular permite:

- Desenvolvimento mais simples.
- Menor custo operacional.
- Facilidade de manutenção.
- Separação clara de responsabilidades.
- Segurança centralizada.
- Evolução futura.

A arquitetura também estabelece uma base adequada para implementação do MVP e posterior expansão do TechTrack.

O próximo estágio do projeto será a definição do **Design System (`docs/design.md`)** e dos protótipos das principais telas.