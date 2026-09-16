# Especificação Técnica do Produto

## 1. Informações do Documento

**Produto:** TechTrack  
**Documento:** Especificação Técnica  
**Versão:** 1.0  
**Escopo:** MVP

---

# 2. Visão Geral

O TechTrack será uma aplicação web responsiva destinada ao gerenciamento de ordens de serviço de assistências técnicas.

O sistema terá dois ambientes principais:

1. **Painel administrativo:** utilizado por funcionários da assistência técnica.
2. **Portal do cliente:** utilizado para acompanhar uma ou mais ordens de serviço.

A aplicação será responsável por armazenar e disponibilizar informações sobre clientes, equipamentos, ordens de serviço, diagnósticos, orçamentos, aprovações e histórico de alterações.

---

# 3. Perfis de Usuário

O sistema deverá possuir quatro perfis.

## 3.1 Administrador

Possui acesso completo ao sistema.

### Permissões

- Gerenciar usuários.
- Gerenciar clientes.
- Gerenciar equipamentos.
- Criar e editar ordens de serviço.
- Consultar todas as ordens.
- Atualizar status.
- Consultar histórico.
- Gerenciar configurações da assistência.

---

## 3.2 Atendente

Responsável pelo atendimento e gerenciamento das ordens.

### Permissões

- Criar clientes.
- Editar clientes.
- Criar equipamentos.
- Criar ordens de serviço.
- Consultar ordens.
- Atualizar informações administrativas.
- Consultar histórico.
- Alterar determinados status.

Não poderá alterar informações técnicas restritas ao técnico.

---

## 3.3 Técnico

Responsável pelo diagnóstico e execução do reparo.

### Permissões

- Visualizar ordens atribuídas.
- Registrar diagnóstico.
- Registrar observações técnicas.
- Registrar orçamento.
- Atualizar status relacionados ao reparo.
- Informar conclusão do serviço.

---

## 3.4 Cliente

Usuário final do sistema.

### Permissões

- Consultar suas próprias ordens.
- Visualizar dados do equipamento.
- Visualizar diagnóstico disponibilizado.
- Visualizar orçamento.
- Aprovar orçamento.
- Recusar orçamento.
- Visualizar histórico disponibilizado ao cliente.
- Visualizar previsão de conclusão.

O cliente não poderá acessar dados internos da assistência.

---

# 4. Arquitetura Funcional

O sistema será dividido nos seguintes módulos:

```text
TechTrack
│
├── Autenticação
│
├── Usuários
│
├── Clientes
│
├── Equipamentos
│
├── Ordens de Serviço
│   ├── Dados básicos
│   ├── Diagnóstico
│   ├── Orçamento
│   ├── Status
│   └── Histórico
│
└── Portal do Cliente
    ├── Minhas Ordens
    ├── Detalhes da Ordem
    └── Aprovação de Orçamento
```

---

# 5. Modelo de Dados

## 5.1 User

Representa um usuário que possui acesso autenticado ao sistema.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador |
| name | VARCHAR | Sim | Nome |
| email | VARCHAR | Sim | E-mail |
| password_hash | VARCHAR | Sim | Senha criptografada |
| role | ENUM | Sim | Perfil |
| active | BOOLEAN | Sim | Situação |
| created_at | DATETIME | Sim | Data de criação |
| updated_at | DATETIME | Sim | Última atualização |

### Valores de `role`

```text
ADMIN
ATTENDANT
TECHNICIAN
CUSTOMER
```

---

# 6. Customer

Representa o cliente da assistência.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador |
| user_id | UUID | Não | Usuário associado |
| name | VARCHAR | Sim | Nome |
| email | VARCHAR | Sim | E-mail |
| phone | VARCHAR | Sim | Telefone |
| document | VARCHAR | Não | Documento |
| created_at | DATETIME | Sim | Data |
| updated_at | DATETIME | Sim | Data |

Um cliente poderá possuir várias ordens de serviço.

```text
Customer 1 ─────── N ServiceOrder
```

---

# 7. Equipment

Representa o equipamento entregue à assistência.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador |
| customer_id | UUID | Sim | Proprietário |
| type | VARCHAR | Sim | Tipo |
| brand | VARCHAR | Sim | Marca |
| model | VARCHAR | Sim | Modelo |
| serial_number | VARCHAR | Não | Número de série |
| reported_problem | TEXT | Sim | Problema relatado |
| accessories | TEXT | Não | Acessórios |
| created_at | DATETIME | Sim | Data |

Relacionamento:

```text
Customer 1 ─────── N Equipment
```

---

# 8. ServiceOrder

Representa a ordem de serviço.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador interno |
| order_number | VARCHAR | Sim | Número da OS |
| customer_id | UUID | Sim | Cliente |
| equipment_id | UUID | Sim | Equipamento |
| technician_id | UUID | Não | Técnico responsável |
| status | ENUM | Sim | Status |
| entry_date | DATETIME | Sim | Entrada |
| estimated_completion | DATE | Não | Previsão |
| diagnosis | TEXT | Não | Diagnóstico |
| budget_amount | DECIMAL | Não | Valor |
| budget_description | TEXT | Não | Descrição |
| budget_status | ENUM | Não | Situação |
| completed_at | DATETIME | Não | Conclusão |
| delivered_at | DATETIME | Não | Entrega |
| created_at | DATETIME | Sim | Criação |
| updated_at | DATETIME | Sim | Atualização |

Relacionamentos:

```text
Customer 1 ─────── N ServiceOrder

Equipment 1 ────── N ServiceOrder

Technician 1 ───── N ServiceOrder
```

---

# 9. Status da Ordem

O status deverá ser representado por um ENUM.

```text
RECEIVED
WAITING_DIAGNOSIS
IN_DIAGNOSIS
WAITING_APPROVAL
APPROVED
REJECTED
IN_REPAIR
COMPLETED
READY_FOR_PICKUP
DELIVERED
CANCELLED
```

## 9.1 Fluxo permitido

```text
RECEIVED
    ↓
WAITING_DIAGNOSIS
    ↓
IN_DIAGNOSIS
    ↓
WAITING_APPROVAL
    ↓
APPROVED
    ↓
IN_REPAIR
    ↓
COMPLETED
    ↓
READY_FOR_PICKUP
    ↓
DELIVERED
```

Fluxos alternativos:

```text
WAITING_APPROVAL
       ↓
   REJECTED
```

ou:

```text
Qualquer estado permitido
       ↓
   CANCELLED
```

O backend deverá validar as transições para impedir mudanças inválidas.

---

# 10. Budget

O orçamento poderá possuir os seguintes estados:

```text
PENDING
APPROVED
REJECTED
```

### Regras

- Um orçamento somente poderá ser aprovado quando estiver `PENDING`.
- Um orçamento somente poderá ser recusado quando estiver `PENDING`.
- Uma ordem somente poderá entrar em `IN_REPAIR` após aprovação.
- A aprovação deverá registrar data e usuário responsável.

---

# 11. ServiceOrderHistory

Registra alterações importantes realizadas na ordem.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador |
| service_order_id | UUID | Sim | Ordem |
| user_id | UUID | Sim | Autor |
| action | VARCHAR | Sim | Ação |
| old_status | VARCHAR | Não | Status anterior |
| new_status | VARCHAR | Não | Novo status |
| description | TEXT | Não | Detalhes |
| created_at | DATETIME | Sim | Data |

Exemplo:

```text
10/08/2026 09:30
Atendente João
Status alterado:
"Recebido" → "Aguardando diagnóstico"
```

---

# 12. Casos de Uso

## UC01 — Criar cliente

**Ator:** Atendente/Administrador

### Fluxo

1. Usuário acessa clientes.
2. Seleciona "Novo cliente".
3. Informa os dados.
4. Sistema valida os dados.
5. Sistema cria o cliente.
6. Sistema apresenta confirmação.

### Validações

- Nome obrigatório.
- Telefone obrigatório.
- E-mail deve possuir formato válido quando informado.

---

# 13. UC02 — Criar ordem de serviço

**Ator:** Atendente/Administrador

### Fluxo

1. Usuário seleciona cliente.
2. Seleciona ou cadastra equipamento.
3. Informa problema relatado.
4. Informa acessórios entregues.
5. Confirma abertura.
6. Sistema gera número único.
7. Sistema cria a ordem com status `RECEIVED`.
8. Sistema registra evento no histórico.

---

# 14. UC03 — Registrar diagnóstico

**Ator:** Técnico

### Fluxo

1. Técnico acessa suas ordens.
2. Seleciona uma ordem.
3. Inicia diagnóstico.
4. Sistema altera status para `IN_DIAGNOSIS`.
5. Técnico registra diagnóstico.
6. Técnico informa se existe necessidade de orçamento.
7. Sistema atualiza a ordem.

Se houver orçamento:

```text
IN_DIAGNOSIS
       ↓
WAITING_APPROVAL
```

Se não houver:

```text
IN_DIAGNOSIS
       ↓
IN_REPAIR
```

---

# 15. UC04 — Registrar orçamento

**Ator:** Técnico/Atendente

### Dados

- Valor.
- Descrição.
- Prazo estimado.
- Observações.

Ao enviar o orçamento:

```text
status = WAITING_APPROVAL
budget_status = PENDING
```

O cliente deverá ser informado de que existe um orçamento aguardando aprovação.

---

# 16. UC05 — Aprovar orçamento

**Ator:** Cliente

### Fluxo

1. Cliente acessa sua ordem.
2. Visualiza o orçamento.
3. Seleciona "Aprovar".
4. Sistema solicita confirmação.
5. Cliente confirma.
6. Sistema altera orçamento para `APPROVED`.
7. Sistema registra histórico.
8. Sistema permite avanço para `IN_REPAIR`.

---

# 17. UC06 — Recusar orçamento

**Ator:** Cliente

### Fluxo

1. Cliente visualiza orçamento.
2. Seleciona "Recusar".
3. Sistema solicita confirmação.
4. Cliente confirma.
5. Sistema altera orçamento para `REJECTED`.
6. Ordem passa para `REJECTED`.
7. Sistema registra a ação no histórico.

---

# 18. UC07 — Atualizar reparo

**Ator:** Técnico

O técnico poderá atualizar a ordem conforme o andamento do serviço.

Exemplo:

```text
APPROVED
    ↓
IN_REPAIR
    ↓
COMPLETED
    ↓
READY_FOR_PICKUP
```

Cada alteração deverá gerar um registro no histórico.

---

# 19. UC08 — Consultar ordem

**Ator:** Cliente

O cliente deverá visualizar:

- Número da ordem.
- Equipamento.
- Problema informado.
- Status atual.
- Diagnóstico disponibilizado.
- Orçamento.
- Previsão de conclusão.
- Histórico relevante.
- Orientação para retirada.

Informações internas da assistência não deverão ser exibidas.

---

# 20. API

A comunicação entre frontend e backend será realizada através de uma API REST.

## Autenticação

```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
```

---

## Clientes

```http
GET    /api/customers
GET    /api/customers/{id}
POST   /api/customers
PUT    /api/customers/{id}
DELETE /api/customers/{id}
```

---

## Equipamentos

```http
GET  /api/equipment
GET  /api/equipment/{id}
POST /api/equipment
PUT  /api/equipment/{id}
```

---

## Ordens de Serviço

```http
GET  /api/service-orders
GET  /api/service-orders/{id}
POST /api/service-orders
PUT  /api/service-orders/{id}
```

---

## Status

```http
PATCH /api/service-orders/{id}/status
```

---

## Diagnóstico

```http
PATCH /api/service-orders/{id}/diagnosis
```

---

## Orçamento

```http
POST  /api/service-orders/{id}/budget
PATCH /api/service-orders/{id}/budget/approve
PATCH /api/service-orders/{id}/budget/reject
```

---

## Histórico

```http
GET /api/service-orders/{id}/history
```

---

# 21. Formato das Respostas

A API deverá utilizar JSON.

### Exemplo

```json
{
  "id": "8d6f7f7e-3a7d-4b9e-91a5-123456789abc",
  "orderNumber": "OS-2026-000123",
  "status": "IN_REPAIR",
  "equipment": {
    "type": "Notebook",
    "brand": "Dell",
    "model": "Inspiron 15"
  },
  "estimatedCompletion": "2026-08-20"
}
```

---

# 22. Tratamento de Erros

A API deverá utilizar códigos HTTP apropriados.

| Código | Significado |
|---:|---|
| 200 | Operação realizada |
| 201 | Recurso criado |
| 204 | Operação realizada sem conteúdo |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito |
| 422 | Dados inválidos |
| 500 | Erro interno |

Formato padrão:

```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "A ordem não pode ser alterada para este status."
  }
}
```

---

# 23. Autenticação e Autorização

A aplicação deverá utilizar autenticação baseada em sessão segura ou token.

Para uma arquitetura baseada em API REST, recomenda-se a utilização de:

```text
Access Token
+
Refresh Token
```

O backend deverá validar:

1. Identidade do usuário.
2. Validade do token.
3. Perfil do usuário.
4. Permissão para executar a operação.
5. Associação do recurso ao usuário quando aplicável.

---

# 24. Segurança

## 24.1 Senhas

Senhas nunca deverão ser armazenadas em texto puro.

Deverá ser utilizado algoritmo moderno de hashing, como:

```text
Argon2id
```

ou equivalente adequado.

## 24.2 Comunicação

Toda comunicação em produção deverá utilizar HTTPS.

## 24.3 Autorização

As permissões deverão ser verificadas no backend.

A interface não deverá ser considerada mecanismo de segurança.

## 24.4 Dados do cliente

Um cliente somente poderá acessar suas próprias ordens.

Exemplo:

```text
Cliente A
   ↓
OS 001
OS 002

Cliente B
   ↓
OS 003
```

O Cliente A não poderá consultar a OS 003 apenas alterando o identificador da requisição.

---

# 25. Validações

## Cliente

- Nome obrigatório.
- Telefone obrigatório.
- E-mail válido quando informado.

## Equipamento

- Tipo obrigatório.
- Marca obrigatória.
- Modelo obrigatório.
- Problema relatado obrigatório.

## Ordem

- Cliente obrigatório.
- Equipamento obrigatório.
- Status inicial obrigatório.
- Número da ordem único.

## Orçamento

- Valor maior ou igual a zero.
- Descrição obrigatória.
- Aprovação somente quando `PENDING`.

---

# 26. Auditoria

As seguintes ações deverão ser registradas:

- Criação da ordem.
- Alteração de status.
- Alteração de diagnóstico.
- Criação de orçamento.
- Aprovação do orçamento.
- Recusa do orçamento.
- Cancelamento.
- Conclusão.
- Entrega.

Cada registro deverá conter:

```text
Usuário
Data/hora
Ação
Ordem relacionada
Informações relevantes
```

---

# 27. Requisitos de Interface

## Painel Administrativo

O painel deverá apresentar:

- Menu lateral.
- Dashboard.
- Lista de ordens.
- Filtros.
- Pesquisa.
- Cadastro de clientes.
- Cadastro de equipamentos.
- Detalhes da ordem.
- Histórico.
- Gerenciamento de usuários.

### Dashboard

O dashboard deverá apresentar indicadores como:

```text
Ordens abertas
Em diagnóstico
Aguardando aprovação
Em reparo
Prontas para retirada
```

---

# 28. Portal do Cliente

A tela principal deverá apresentar:

```text
Minha Ordem

OS-2026-000123

Notebook Dell Inspiron 15

Status:
████████████████░░░░
Reparo em andamento

Previsão:
20/08/2026
```

Abaixo deverão aparecer:

- Problema informado.
- Diagnóstico.
- Orçamento.
- Histórico.
- Previsão.
- Instruções para retirada.

---

# 29. Responsividade

A interface deverá utilizar abordagem responsiva.

### Desktop

Priorizar:

- Dashboard.
- Tabelas.
- Filtros.
- Gerenciamento administrativo.

### Mobile

Priorizar:

- Status da ordem.
- Informações do equipamento.
- Orçamento.
- Aprovação.
- Histórico.

O portal do cliente deverá ser projetado inicialmente com abordagem **mobile-first**.

---

# 30. Estados da Interface

A aplicação deverá tratar os seguintes estados:

### Loading

Enquanto os dados estiverem sendo carregados.

### Empty State

Quando não existirem registros.

Exemplo:

> Nenhuma ordem de serviço encontrada.

### Error State

Quando ocorrer uma falha.

Exemplo:

> Não foi possível carregar a ordem de serviço. Tente novamente.

### Success State

Após uma operação concluída.

Exemplo:

> Orçamento aprovado com sucesso.

### Confirmation

Operações importantes deverão solicitar confirmação.

Exemplo:

> Deseja realmente recusar este orçamento?

---

# 31. Notificações

No MVP, o sistema deverá apresentar notificações dentro da própria aplicação.

Exemplos:

```text
Seu orçamento está aguardando aprovação.

Seu equipamento está em reparo.

Seu equipamento está pronto para retirada.
```

Integrações externas de WhatsApp e e-mail ficam fora do escopo inicial.

---

# 32. Requisitos de Performance

O sistema deverá buscar:

- Tempo de resposta inferior a 2 segundos para operações comuns em condições normais.
- Paginação em listas extensas.
- Consultas indexadas no banco de dados.
- Carregamento sob demanda de informações secundárias.

Listagens administrativas não deverão carregar todos os registros simultaneamente.

---

# 33. Persistência

Os dados deverão ser armazenados em banco de dados relacional.

Entidades principais:

```text
users
customers
equipment
service_orders
budgets
service_order_history
```

Relacionamentos deverão utilizar chaves estrangeiras.

---

# 34. Integridade dos Dados

O sistema deverá garantir:

- IDs únicos.
- Integridade referencial.
- Transações para operações críticas.
- Validação de estados.
- Consistência entre ordem e orçamento.
- Registro das alterações relevantes.

Operações como aprovação de orçamento e alteração de status deverão ser tratadas de forma transacional.

---

# 35. Testes

O sistema deverá possuir diferentes níveis de testes.

## Testes unitários

Validar:

- Regras de negócio.
- Transições de status.
- Cálculos.
- Validações.

## Testes de integração

Validar:

- API + banco de dados.
- Autenticação.
- Persistência.
- Permissões.

## Testes end-to-end

Validar fluxos completos:

```text
Criar cliente
    ↓
Criar equipamento
    ↓
Criar OS
    ↓
Diagnóstico
    ↓
Orçamento
    ↓
Aprovação
    ↓
Reparo
    ↓
Conclusão
    ↓
Retirada
```

---

# 36. Critérios Técnicos para o MVP

O MVP será considerado tecnicamente concluído quando:

- Todas as funcionalidades obrigatórias estiverem implementadas.
- Os perfis de acesso estiverem funcionando.
- As transições de status forem validadas pelo backend.
- Os dados estiverem persistidos corretamente.
- O histórico de alterações estiver funcionando.
- O cliente conseguir acompanhar uma ordem.
- O cliente conseguir aprovar ou recusar um orçamento.
- A interface for responsiva.
- Os principais fluxos possuírem testes automatizados.
- Não existirem vulnerabilidades críticas conhecidas.

---

# 37. Fluxo Completo do Sistema

```text
                    ┌──────────────┐
                    │    Cliente   │
                    └──────┬───────┘
                           │
                           ▼
                    Entrega equipamento
                           │
                           ▼
                 ┌─────────────────────┐
                 │ Criação da OS       │
                 │ Status: RECEIVED    │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Aguardando           │
                 │ diagnóstico          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Técnico realiza      │
                 │ diagnóstico          │
                 └──────────┬──────────┘
                            │
                       ┌────┴────┐
                       │         │
                    Orçamento   Sem orçamento
                       │         │
                       ▼         ▼
              Aguardando       Em reparo
              aprovação           │
                  │               │
             ┌────┴────┐          │
             │         │          │
          Aprova     Recusa       │
             │         │          │
             ▼         ▼          │
         Em reparo  Rejeitado     │
             │                    │
             └────────┬───────────┘
                      │
                      ▼
                Reparo concluído
                      │
                      ▼
               Pronto para retirada
                      │
                      ▼
                   Entregue
```

---

# 38. Considerações para Arquitetura

A especificação foi estruturada para permitir uma arquitetura baseada em:

```text
Frontend
    ↓
API REST
    ↓
Backend
    ↓
Banco de dados relacional
```

Os módulos de autenticação, clientes, equipamentos, ordens de serviço e histórico deverão permanecer separados logicamente, permitindo evolução futura sem necessidade de alterar toda a aplicação.

A arquitetura detalhada deverá ser definida no documento `architecture.md`.