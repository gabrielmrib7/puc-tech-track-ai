# Mudança 03: Gestão de Clientes e Cadastro de Equipamentos

## Why
Ordens de serviço dependem obrigatoriamente de um cliente cadastrado e do respectivo equipamento eletrônico a ser reparado. Para permitir a abertura ágil de atendimentos sem duplicidade de dados cadastrais, esta mudança implementa os módulos de domínio, repositórios e endpoints para gerenciamento de clientes e equipamentos (UC01 e UC02 da especificação técnica).

## What Changes
- **Módulo de Clientes (UC01):** Casos de uso `CreateCustomerUseCase`, `UpdateCustomerUseCase`, `FindCustomerByDocumentOrEmailUseCase`. Validações de CPF/CNPJ, telefone e formato de e-mail via Zod.
- **Módulo de Equipamentos (UC02):** Casos de uso `CreateEquipmentUseCase`, `ListCustomerEquipmentsUseCase`. Cadastro de tipo (smartphone, notebook, tablet, etc.), marca, modelo e número de série com validação de unicidade.
- **Camada REST API:** Criação dos endpoints `/api/v1/customers` e `/api/v1/equipment` com suporte a paginação e busca incremental por nome, documento ou serial.
- **Componentes de UI:** Formulários e seletores de busca rápida de cliente e cadastro de novos equipamentos em conformidade com o design system do Stitch.

## Capabilities

### New Capabilities
- `customer-management`: CRUD completo de clientes com validação de unicidade de documento e integridade cadastral.
- `equipment-management`: Cadastro e vinculação relacional de múltiplos aparelhos a um cliente (relação 1:N).

### Modified Capabilities
*Nenhuma.*

## Impact
- **Código Afetado:** Criação dos módulos `src/modules/customers/` e `src/modules/equipment/` (Domain, Application, Infrastructure).
- **APIs:** Novos endpoints REST `/api/v1/customers` e `/api/v1/equipment`.
- **Dependências:** `zod` para schemas de validação.
- **Protótipo Associado:** Componentes de busca de cliente e dados do aparelho integrados em [`stitch_techtrack/techtrack_nova_ordem_de_servi_o`](file:///d:/workspace/tech_Track/tech_Track/stitch_techtrack/techtrack_nova_ordem_de_servi_o).

---

## Dimensionamento e Critérios de Aceite

| Dimensão | Classificação | Justificativa |
| :--- | :--- | :--- |
| **Tamanho** | **Médio** | Criação de dois submódulos de domínio, use cases, repositórios e endpoints REST. |
| **Complexidade** | **Baixa** | Operações relacionais diretas com validações de integridade referencial. |
| **Risco** | **Baixo** | Operações sem impacto financeiro ou transições complexas de máquina de estados. |

### Escopo Funcional
- Cadastro de novos clientes com validação de dados obrigatórios (Nome, CPF/CNPJ, Telefone, E-mail).
- Busca rápida de clientes existentes por documento ou telefone para evitar cadastros duplicados.
- Cadastro de equipamentos vinculados ao cliente com modelo, fabricante e número de série.
- Listagem dos equipamentos pertencentes a um determinado cliente.

### Dependências
- `01-foundation-and-database`: Tabelas `Customer` e `Equipment` no Prisma.
- `02-auth-and-rbac`: Autorização para perfis `ADMIN` e `ATTENDANT`.

### Riscos e Mitigações
- **Cadastro duplicado de cliente:** Criação de índice único no documento/e-mail e checagem prévia no caso de uso.
- **Inconsistência de serial number:** Normalização de strings (trim, uppercase) no DTO de entrada.

### Verificação de Qualidade Obrigatória

#### 1. Execução de Linters e Tipos
```bash
npx tsc --noEmit
npm run lint
```
*Critério:* Zero erros nos DTOs tipados e nas interfaces de repositório.

#### 2. Testes Unitários Necessários
- Validação do schema Zod de cliente (formato de CPF/CNPJ, telefone brasileiro válido e e-mail).
- Validação do schema Zod de equipamento (campos obrigatórios, comprimento mínimo).
- Teste unitário do caso de uso `CreateCustomerUseCase` com mock de repositório (cenário de sucesso e rejeição por duplicidade).

#### 3. Testes de Integração Necessários
- Teste de persistência real com Prisma: criação de um `Customer` e inserção de múltiplos `Equipment` relacionados.
- Teste do endpoint `POST /api/v1/customers` (retornando `201 Created` e payload com id gerado).
- Teste de busca `GET /api/v1/customers?query=...` validando filtros e paginação.

#### 4. Testes E2E Necessários
- Playwright E2E:
  - Atendente autenticado cadastra um novo cliente com sucesso.
  - Atendente registra um novo equipamento associado ao cliente recém-criado e valida sua exibição na listagem.

