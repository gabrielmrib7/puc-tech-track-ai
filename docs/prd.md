# Product Requirements Document (PRD)

## 1. Visão do Produto

### 1.1 Nome

**TechTrack**

### 1.2 Descrição

O TechTrack é uma plataforma web responsiva para gerenciamento de ordens de serviço de assistências técnicas e acompanhamento do andamento dos reparos pelos clientes.

A plataforma centraliza informações sobre clientes, equipamentos, ordens de serviço, diagnósticos, orçamentos, aprovações e etapas do reparo.

O cliente poderá acompanhar o status de seu equipamento por meio de uma área própria, enquanto funcionários da assistência poderão administrar todo o ciclo de atendimento através de um painel administrativo.

### 1.3 Problema

Clientes de assistências técnicas possuem pouca visibilidade sobre o andamento dos serviços realizados em seus equipamentos. Para obter informações, frequentemente precisam entrar em contato com a assistência por telefone, WhatsApp ou presencialmente.

Ao mesmo tempo, os funcionários precisam responder repetidamente às mesmas solicitações de informação e consultar diferentes fontes para descobrir o status de uma ordem de serviço.

O TechTrack busca solucionar esse problema oferecendo uma fonte centralizada e atualizada de informações.

---

# 2. Objetivos do Produto

## 2.1 Objetivo Principal

Permitir que assistências técnicas gerenciem suas ordens de serviço e que seus clientes acompanhem o andamento dos reparos de forma simples, rápida e transparente.

## 2.2 Objetivos Específicos

- Centralizar o gerenciamento das ordens de serviço.
- Reduzir contatos relacionados exclusivamente à consulta de status.
- Permitir atualização do status do reparo pelos funcionários.
- Disponibilizar ao cliente informações atualizadas sobre seu equipamento.
- Registrar o histórico de alterações da ordem de serviço.
- Permitir o gerenciamento de clientes e equipamentos.
- Disponibilizar informações sobre orçamento e aprovação.
- Informar quando o equipamento estiver pronto para retirada.
- Criar uma experiência de acompanhamento adequada para dispositivos móveis.

---

# 3. Público e Personas

## 3.1 Cliente

### Descrição

Pessoa que deixa um equipamento eletrônico na assistência técnica e deseja acompanhar o serviço.

### Necessidades

- Consultar o status do equipamento.
- Saber o que está acontecendo com o reparo.
- Visualizar o diagnóstico.
- Visualizar o orçamento.
- Aprovar ou rejeitar o orçamento.
- Saber quando o equipamento está pronto.
- Consultar informações básicas do serviço.

### Dores

- Precisa entrar em contato com a assistência para obter informações.
- Não sabe se o equipamento já foi diagnosticado.
- Não sabe quanto tempo o reparo pode levar.
- Pode receber informações desatualizadas.
- Pode ter dificuldade para localizar informações do atendimento.

---

## 3.2 Atendente

### Descrição

Funcionário responsável pelo atendimento ao cliente e gerenciamento inicial das ordens de serviço.

### Necessidades

- Cadastrar clientes.
- Registrar equipamentos.
- Criar ordens de serviço.
- Consultar ordens existentes.
- Atualizar informações.
- Acompanhar o fluxo de atendimento.

### Dores

- Recebe muitas solicitações de atualização.
- Precisa procurar informações manualmente.
- Pode utilizar diferentes ferramentas para registrar informações.
- Está sujeito a erros de comunicação.

---

## 3.3 Técnico

### Descrição

Profissional responsável pelo diagnóstico e reparo dos equipamentos.

### Necessidades

- Visualizar ordens atribuídas.
- Registrar diagnóstico.
- Registrar observações técnicas.
- Atualizar o andamento do serviço.
- Informar conclusão do reparo.

### Dores

- Pode receber informações incompletas sobre o equipamento.
- Pode precisar informar o atendente manualmente sobre mudanças no serviço.
- Atualizações podem não chegar imediatamente ao cliente.

---

## 3.4 Administrador

### Descrição

Usuário responsável pela administração da assistência dentro do sistema.

### Necessidades

- Gerenciar usuários.
- Gerenciar funcionários.
- Visualizar todas as ordens.
- Consultar indicadores.
- Configurar informações da assistência.

---

# 4. Escopo do Produto

## 4.1 Funcionalidades do MVP

O MVP será composto pelas seguintes funcionalidades:

### Autenticação

- Login de funcionários.
- Cadastro de funcionários.
- Controle de acesso baseado em perfil.
- Recuperação de senha.
- Acesso do cliente à sua ordem de serviço.

### Clientes

- Cadastro de cliente.
- Edição de cliente.
- Consulta de cliente.
- Histórico de ordens associadas.

### Equipamentos

- Cadastro do equipamento.
- Tipo do equipamento.
- Marca.
- Modelo.
- Número de série, quando disponível.
- Descrição do problema informado pelo cliente.
- Acessórios entregues.

### Ordens de Serviço

- Criação de ordem de serviço.
- Número único da ordem.
- Associação com cliente.
- Associação com equipamento.
- Data de entrada.
- Previsão de conclusão.
- Descrição do problema.
- Diagnóstico.
- Orçamento.
- Status atual.
- Histórico de alterações.

### Status da Ordem

A ordem poderá possuir os seguintes estados:

1. **Recebido**
2. **Aguardando diagnóstico**
3. **Em diagnóstico**
4. **Aguardando aprovação**
5. **Orçamento aprovado**
6. **Orçamento recusado**
7. **Em reparo**
8. **Reparo concluído**
9. **Pronto para retirada**
10. **Entregue**
11. **Cancelado**

### Acompanhamento do Cliente

O cliente poderá:

- Consultar sua ordem de serviço.
- Visualizar o equipamento.
- Visualizar o problema informado.
- Visualizar o diagnóstico.
- Visualizar orçamento.
- Aprovar orçamento.
- Recusar orçamento.
- Visualizar status atual.
- Visualizar histórico do serviço.
- Visualizar previsão de conclusão.
- Identificar quando o equipamento estiver pronto para retirada.

---

# 5. Fluxo Principal

O fluxo principal do produto será:

```text
Cliente entrega equipamento
          ↓
Assistência cria OS
          ↓
Aguardando diagnóstico
          ↓
Técnico realiza diagnóstico
          ↓
Diagnóstico registrado
          ↓
Existe orçamento?
      ↙           ↘
    Não            Sim
    ↓               ↓
  Reparo       Aguardando aprovação
                      ↓
              Cliente decide
                 ↙       ↘
             Aprova      Recusa
                ↓           ↓
            Em reparo    Cancelado
                ↓
        Reparo concluído
                ↓
        Pronto para retirada
                ↓
             Entregue
```

---

# 6. Requisitos Funcionais

## RF01 — Autenticação

O sistema deve permitir que funcionários autenticados acessem o painel administrativo.

## RF02 — Controle de acesso

O sistema deve controlar as funcionalidades disponíveis de acordo com o perfil do usuário.

## RF03 — Cadastro de clientes

O sistema deve permitir cadastrar, editar, consultar e desativar clientes.

## RF04 — Cadastro de equipamentos

O sistema deve permitir registrar equipamentos associados a clientes.

## RF05 — Criação de ordem de serviço

O sistema deve permitir criar uma ordem de serviço contendo cliente, equipamento, problema relatado e informações de entrada.

## RF06 — Identificação da ordem

Cada ordem de serviço deve possuir um identificador único.

## RF07 — Atualização de status

Funcionários autorizados devem conseguir alterar o status da ordem.

## RF08 — Diagnóstico

O técnico deve conseguir registrar o diagnóstico realizado no equipamento.

## RF09 — Orçamento

O sistema deve permitir registrar o valor e as informações do orçamento.

## RF10 — Aprovação

O cliente deve conseguir aprovar ou recusar um orçamento disponível.

## RF11 — Histórico

O sistema deve registrar alterações importantes realizadas na ordem.

## RF12 — Consulta pelo cliente

O cliente deve conseguir visualizar as informações de sua ordem de serviço.

## RF13 — Previsão

A assistência deve conseguir informar uma previsão de conclusão do serviço.

## RF14 — Conclusão

O sistema deve permitir registrar a conclusão do reparo.

## RF15 — Retirada

O sistema deve permitir marcar o equipamento como entregue ao cliente.

---

# 7. Requisitos Não Funcionais

## RNF01 — Responsividade

A interface deve funcionar adequadamente em computadores, tablets e smartphones.

## RNF02 — Segurança

Informações de clientes e equipamentos devem ser protegidas contra acesso não autorizado.

## RNF03 — Controle de acesso

O sistema deve utilizar autorização baseada em funções/perfis.

## RNF04 — Desempenho

Operações comuns, como consulta de uma ordem de serviço, devem apresentar resposta rápida em condições normais de utilização.

## RNF05 — Disponibilidade

O sistema deve estar disponível durante o horário de operação da assistência e possuir mecanismos adequados de recuperação em caso de falha.

## RNF06 — Integridade

As alterações realizadas nas ordens de serviço devem preservar a consistência dos dados.

## RNF07 — Auditoria

Alterações relevantes devem possuir registro de usuário, data e ação realizada.

## RNF08 — Usabilidade

O sistema deve utilizar linguagem simples e apresentar claramente o status atual da ordem.

---

# 8. Regras de Negócio

## RN01

Uma ordem de serviço deve estar associada obrigatoriamente a um cliente e a um equipamento.

## RN02

Uma ordem de serviço deve possuir um identificador único.

## RN03

Somente funcionários autorizados podem alterar informações técnicas.

## RN04

Somente funcionários autorizados podem alterar o status da ordem.

## RN05

O cliente somente pode visualizar ordens associadas à sua conta.

## RN06

Um orçamento somente poderá ser aprovado ou recusado enquanto estiver aguardando aprovação.

## RN07

Uma ordem com orçamento recusado não poderá avançar para o status "Em reparo" sem uma nova autorização.

## RN08

Uma ordem marcada como "Entregue" não poderá retornar para um estado anterior sem uma ação administrativa específica.

## RN09

Toda mudança de status deve ser registrada no histórico.

## RN10

O cliente deve visualizar somente informações apropriadas para o acompanhamento do serviço, não necessariamente todas as informações internas da assistência.

---

# 9. MVP

## Incluído

- Autenticação.
- Clientes.
- Equipamentos.
- Ordens de serviço.
- Status.
- Diagnóstico.
- Orçamento.
- Aprovação do cliente.
- Histórico.
- Painel administrativo.
- Área de acompanhamento do cliente.
- Interface responsiva.

## Fora do MVP

As seguintes funcionalidades poderão ser consideradas posteriormente:

- Integração com WhatsApp.
- Pagamentos online.
- Emissão de nota fiscal.
- Controle de estoque de peças.
- Controle financeiro.
- Integração com fornecedores.
- Aplicativo mobile nativo.
- Inteligência artificial para diagnóstico.
- Relatórios avançados.
- Integração com sistemas externos.

---

# 10. Métricas de Sucesso

## Métrica 1 — Redução de contatos

Reduzir em pelo menos 30% os contatos realizados exclusivamente para consultar o status de uma ordem.

## Métrica 2 — Adoção

Pelo menos 80% dos clientes devem utilizar o acompanhamento digital durante o período de avaliação do produto.

## Métrica 3 — Atualização

Pelo menos 90% das ordens devem possuir seu status atualizado corretamente durante o processo de atendimento.

## Métrica 4 — Tempo de consulta

O cliente deve conseguir encontrar o status atual de sua ordem em menos de 1 minuto.

## Métrica 5 — Satisfação

Obter avaliação média mínima de 4 em uma escala de 1 a 5 na experiência de acompanhamento.

---

# 11. Critérios de Aceitação do MVP

### CA01 — Criação de OS

**Dado** que um funcionário esteja autenticado,

**quando** cadastrar um novo atendimento,

**então** o sistema deve criar uma ordem de serviço com identificador único.

### CA02 — Atualização

**Dado** que exista uma ordem de serviço,

**quando** um funcionário autorizado alterar seu status,

**então** o novo status deve ser armazenado e registrado no histórico.

### CA03 — Consulta

**Dado** que uma ordem esteja associada a um cliente,

**quando** o cliente acessar sua área,

**então** ele deve conseguir visualizar o status atual da ordem.

### CA04 — Orçamento

**Dado** que o técnico tenha registrado um orçamento,

**quando** a ordem for enviada para aprovação,

**então** o cliente deve conseguir visualizar o orçamento e escolher entre aprovar ou recusar.

### CA05 — Reparo

**Dado** que o cliente tenha aprovado o orçamento,

**quando** a assistência iniciar o serviço,

**então** a ordem poderá ser alterada para "Em reparo".

### CA06 — Conclusão

**Dado** que o reparo tenha sido concluído,

**quando** o funcionário atualizar a ordem,

**então** o cliente deverá visualizar que o equipamento está pronto para retirada.

### CA07 — Histórico

**Dado** que uma alteração relevante seja realizada,

**quando** a alteração for confirmada,

**então** o sistema deve registrar a ação, usuário e data.

---

# 12. Riscos

## Risco 1 — Baixa adoção pelos clientes

Clientes podem continuar utilizando WhatsApp ou telefone.

**Mitigação:** tornar o acompanhamento simples, responsivo e acessível por um link direto para a ordem.

## Risco 2 — Falta de atualização

Funcionários podem esquecer de atualizar o status.

**Mitigação:** destacar ordens pendentes de atualização no painel e futuramente implementar notificações e lembretes.

## Risco 3 — Informações incorretas

Dados podem ser registrados incorretamente.

**Mitigação:** utilizar validações, confirmações e histórico de alterações.

## Risco 4 — Segurança

Dados de clientes e equipamentos podem ser acessados indevidamente.

**Mitigação:** autenticação, autorização por perfil, proteção das APIs e controle de acesso aos registros.

## Risco 5 — Escopo excessivo

A inclusão de funcionalidades financeiras, estoque, pagamentos e integrações pode aumentar significativamente a complexidade.

**Mitigação:** manter o MVP focado no gerenciamento e acompanhamento das ordens de serviço.

---

# 13. Escopo Futuro

Após a validação do MVP, o produto poderá evoluir para uma plataforma completa de gestão de assistências técnicas.

Possíveis funcionalidades:

- Notificações por WhatsApp.
- Notificações por e-mail.
- Pagamento online.
- Controle de estoque.
- Gestão de peças.
- Controle financeiro.
- Relatórios gerenciais.
- Dashboard de indicadores.
- Aplicativo mobile.
- Integração com emissão de notas fiscais.
- Integração com gateways de pagamento.
- Inteligência artificial para auxiliar na classificação de defeitos.
- Previsão de prazo de conclusão baseada no histórico da assistência.

---

# 14. Visão de Futuro

O TechTrack pretende transformar o acompanhamento de serviços técnicos em um processo transparente e digital.

Em vez de o cliente precisar perguntar:

> "Como está o meu computador?"

ele deverá conseguir acessar o sistema e visualizar imediatamente:

**Recebido → Diagnóstico → Orçamento → Aprovação → Reparo → Concluído → Retirada**

Dessa forma, a plataforma cria uma comunicação mais transparente entre assistência técnica e cliente, reduzindo tarefas repetitivas para os funcionários e proporcionando maior previsibilidade para o consumidor.