# Design System — TechTrack

## 1. Visão Geral

O Design System do TechTrack define os padrões visuais e componentes utilizados na plataforma.

O sistema possui dois públicos principais:

- Funcionários da assistência técnica.
- Clientes que acompanham suas ordens de serviço.

O design deverá transmitir:

- Confiança.
- Organização.
- Transparência.
- Eficiência.
- Simplicidade.

A interface deverá evitar excesso de elementos visuais e priorizar informações importantes para a tomada de decisão.

---

# 2. Princípios de Design

## 2.1 Clareza

O usuário deve conseguir identificar rapidamente:

- O que está acontecendo.
- Qual é o próximo passo.
- Qual ação precisa realizar.

---

## 2.2 Transparência

O status da ordem deverá ser sempre evidente.

Exemplo:

**Reparo em andamento**

em vez de simplesmente:

**Status: IN_REPAIR**

---

## 2.3 Consistência

Componentes semelhantes deverão possuir aparência e comportamento semelhantes em todo o sistema.

---

## 2.4 Responsividade

A experiência deverá funcionar em:

- Desktop.
- Tablet.
- Smartphone.

O portal do cliente deverá ser desenvolvido seguindo abordagem mobile-first.

---

# 3. Identidade Visual

## 3.1 Nome

**TechTrack**

## 3.2 Conceito

O nome combina:

**Tech** → tecnologia e assistência técnica.

**Track** → acompanhar, rastrear e monitorar.

O conceito visual deverá utilizar elementos relacionados a:

- Progresso.
- Linha do tempo.
- Status.
- Conectividade.
- Organização.

---

# 4. Paleta de Cores

## 4.1 Cor Primária

**Azul tecnológico**

```text
Primary: #2563EB
```

Utilização:

- Botões principais.
- Links.
- Elementos selecionados.
- Indicadores de progresso.
- Ações principais.

---

## 4.2 Cor Primária Escura

```text
Primary Dark: #1D4ED8
```

Utilização:

- Hover.
- Estados ativos.
- Elementos de destaque.

---

## 4.3 Fundo

```text
Background: #F8FAFC
```

Utilização:

- Fundo geral das páginas.

---

## 4.4 Superfície

```text
Surface: #FFFFFF
```

Utilização:

- Cards.
- Formulários.
- Tabelas.
- Modais.

---

## 4.5 Texto

```text
Text Primary: #0F172A

Text Secondary: #475569

Text Muted: #94A3B8
```

---

# 5. Cores Semânticas

As cores semânticas serão utilizadas principalmente para indicar estados.

## Sucesso

```text
Success: #16A34A
```

Exemplos:

- Reparo concluído.
- Orçamento aprovado.
- Equipamento entregue.

## Atenção

```text
Warning: #D97706
```

Exemplos:

- Aguardando aprovação.
- Aguardando diagnóstico.

## Erro

```text
Error: #DC2626
```

Exemplos:

- Orçamento recusado.
- Operação inválida.
- Erro do sistema.

## Informação

```text
Info: #0284C7
```

Exemplos:

- Informações gerais.
- Atualizações.

---

# 6. Tipografia

A fonte principal será:

**Inter**

Motivos:

- Excelente legibilidade.
- Boa disponibilidade.
- Adequada para interfaces SaaS.
- Boa leitura em telas pequenas.

## Escala

### Heading 1

```text
32px
Weight: 700
```

### Heading 2

```text
24px
Weight: 700
```

### Heading 3

```text
20px
Weight: 600
```

### Body

```text
16px
Weight: 400
```

### Small

```text
14px
Weight: 400
```

### Caption

```text
12px
Weight: 500
```

---

# 7. Espaçamento

Será utilizado um sistema baseado em múltiplos de 4px.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

O espaçamento de 16px deverá ser considerado o padrão para elementos relacionados.

---

# 8. Border Radius

## Pequeno

```text
4px
```

Utilizado para:

- Inputs.
- Pequenos elementos.

## Médio

```text
8px
```

Utilizado para:

- Botões.
- Cards.
- Campos.

## Grande

```text
12px
```

Utilizado para:

- Cards destacados.
- Modais.
- Elementos importantes.

---

# 9. Sombras

As sombras deverão ser discretas.

## Pequena

Utilizada em:

- Cards.
- Dropdowns.

## Média

Utilizada em:

- Modais.
- Menus flutuantes.

A interface deverá evitar sombras excessivas.

---

# 10. Botões

## Primary

Utilizado para ações principais.

Exemplo:

**Criar ordem**

## Secondary

Utilizado para ações secundárias.

Exemplo:

**Cancelar**

## Destructive

Utilizado para ações potencialmente destrutivas.

Exemplo:

**Cancelar ordem**

## Success

Utilizado para confirmações importantes.

Exemplo:

**Aprovar orçamento**

---

# 11. Campos de Formulário

Todos os campos deverão possuir:

- Label.
- Área de entrada.
- Estado normal.
- Estado focado.
- Estado de erro.
- Mensagem de validação.

Exemplo:

```text
Nome do cliente *

┌─────────────────────────────┐
│ João da Silva               │
└─────────────────────────────┘

Nome válido
```

---

# 12. Status Badge

Os status deverão ser representados por badges.

Exemplos:

```text
● Recebido
● Em diagnóstico
● Aguardando aprovação
● Em reparo
● Concluído
● Pronto para retirada
● Entregue
● Cancelado
```

A cor deverá acompanhar o significado sem depender exclusivamente dela.

---

# 13. Timeline

O acompanhamento do cliente utilizará uma timeline.

Exemplo:

```text
✓ Equipamento recebido
│
✓ Diagnóstico realizado
│
✓ Orçamento aprovado
│
● Reparo em andamento
│
○ Reparo concluído
│
○ Pronto para retirada
```

A etapa atual deverá possuir maior destaque visual.

---

# 14. Cards

Cards serão utilizados para agrupar informações relacionadas.

Exemplos:

### Card de equipamento

```text
Notebook Dell Inspiron 15

Problema relatado:
Equipamento não liga.

Número de série:
XXXXXX
```

### Card de orçamento

```text
Orçamento

R$ 450,00

Troca da placa de alimentação.

[Aprovar] [Recusar]
```

---

# 15. Tabelas

O painel administrativo deverá utilizar tabelas para grandes volumes de dados.

Exemplo:

| Ordem | Cliente | Equipamento | Status | Previsão |
|---|---|---|---|---|
| OS-001 | João | Dell Inspiron | Em reparo | 20/08 |
| OS-002 | Maria | iPhone 13 | Diagnóstico | 18/08 |

Em dispositivos móveis, tabelas deverão ser transformadas em cards ou permitir rolagem horizontal controlada.

---

# 16. Navegação

## Desktop

O painel administrativo utilizará:

```text
┌──────────────────────┐
│ TechTrack            │
├──────────────────────┤
│ Dashboard            │
│ Ordens de Serviço    │
│ Clientes             │
│ Equipamentos         │
│ Usuários             │
│ Configurações        │
└──────────────────────┘
```

## Mobile

O menu deverá utilizar navegação compacta, podendo utilizar:

- Menu lateral recolhível.
- Bottom navigation para funções principais.

---

# 17. Dashboard

O dashboard administrativo deverá apresentar:

```text
Olá, João

Resumo da assistência

┌────────────┐
│ 42         │
│ Ordens     │
└────────────┘

┌────────────┐
│ 8          │
│ Diagnóstico│
└────────────┘

┌────────────┐
│ 6          │
│ Aprovação  │
└────────────┘

┌────────────┐
│ 12         │
│ Em reparo  │
└────────────┘
```

Abaixo:

**Ordens que precisam de atenção**

- Orçamentos aguardando aprovação.
- Ordens sem atualização recente.
- Equipamentos prontos para retirada.

---

# 18. Tela de Lista de Ordens

Deverá possuir:

- Campo de pesquisa.
- Filtros.
- Ordenação.
- Paginação.
- Botão "Nova ordem".

Filtros:

```text
Status
Técnico
Data
Cliente
```

---

# 19. Tela de Detalhes da Ordem

Estrutura:

```text
← Voltar

OS-2026-000123

[Em reparo]

Cliente
João da Silva

Equipamento
Dell Inspiron 15

Problema
Notebook não liga.

Diagnóstico
Falha na placa de alimentação.

Orçamento
R$ 450,00

Previsão
20/08/2026

Histórico
────────────────────
16/08  Diagnóstico realizado
15/08  Equipamento recebido
```

---

# 20. Portal do Cliente

A experiência do cliente deverá ser mais simples.

Tela principal:

```text
Olá, João!

Acompanhe seu equipamento

┌─────────────────────────────┐
│ Dell Inspiron 15            │
│ OS-2026-000123              │
│                             │
│ ● Reparo em andamento       │
│                             │
│ Previsão: 20/08/2026        │
└─────────────────────────────┘
```

---

# 21. Tela de Acompanhamento

A tela deverá priorizar a evolução do serviço.

```text
Seu equipamento está em reparo

✓ Recebido
✓ Diagnóstico
✓ Orçamento aprovado
● Reparo em andamento
○ Reparo concluído
○ Pronto para retirada
```

Abaixo:

### Equipamento

Dell Inspiron 15

### Diagnóstico

Falha na placa de alimentação.

### Previsão

20 de agosto de 2026.

---

# 22. Aprovação de Orçamento

Quando houver orçamento:

```text
Orçamento disponível

Reparo da placa de alimentação

Valor

R$ 450,00

Prazo estimado

3 dias úteis

──────────────────

[Recusar orçamento]

[Aprovar orçamento]
```

A aprovação deverá possuir confirmação antes de ser efetivada.

---

# 23. Responsividade

## Desktop

Prioridade:

- Gestão.
- Tabelas.
- Dashboard.
- Informações detalhadas.

## Tablet

Prioridade:

- Cards.
- Tabelas adaptadas.
- Formulários.

## Smartphone

Prioridade:

- Status.
- Informações essenciais.
- Aprovação.
- Histórico.

---

# 24. Acessibilidade

O sistema deverá buscar conformidade com as boas práticas WCAG.

Requisitos:

- Contraste adequado.
- Navegação por teclado.
- Labels associados aos campos.
- Foco visível.
- Textos alternativos quando necessário.
- Não depender exclusivamente de cores para transmitir informações.
- Tamanhos de toque adequados em dispositivos móveis.

---

# 25. Feedback do Sistema

Operações importantes deverão gerar feedback visual.

### Sucesso

> Orçamento aprovado com sucesso.

### Erro

> Não foi possível atualizar a ordem.

### Aviso

> Este orçamento ainda aguarda aprovação.

### Confirmação

> Deseja realmente recusar este orçamento?

---

# 26. Empty States

Exemplo:

```text
Nenhuma ordem encontrada.

Não existem ordens correspondentes
aos filtros selecionados.

[Limpar filtros]
```

O sistema deverá evitar telas completamente vazias sem orientação ao usuário.

---

# 27. Loading States

Durante carregamentos:

- Skeleton screens para conteúdos complexos.
- Spinners para ações pontuais.
- Botões deverão apresentar estado de processamento.

Exemplo:

```text
[Aprovando...]
```

em vez de permitir múltiplos cliques.

---

# 28. Design Mobile-First

O portal do cliente será projetado inicialmente para smartphones.

Prioridade:

1. Status.
2. Previsão.
3. Equipamento.
4. Diagnóstico.
5. Orçamento.
6. Histórico.

Informações secundárias deverão aparecer posteriormente.

---

# 29. Componentes Principais

O Design System deverá possuir:

```text
Button
Input
Select
Textarea
Checkbox
Radio
Badge
Card
Modal
Toast
Alert
Table
Pagination
Dropdown
Tabs
Timeline
Avatar
Navbar
Sidebar
Breadcrumb
Skeleton
EmptyState
```

---

# 30. Ícones

Os ícones deverão possuir estilo consistente.

Recomenda-se utilizar uma biblioteca de ícones como:

**Lucide Icons**

Os ícones deverão complementar o texto e não substituir informações importantes.

---

# 31. Tom da Interface

A comunicação deverá ser:

- Clara.
- Direta.
- Profissional.
- Amigável.
- Sem excesso de linguagem técnica.

Exemplo ruim:

> `ERROR: INVALID_STATUS_TRANSITION`

Exemplo adequado:

> **Não é possível avançar a ordem para essa etapa.**

---

# 32. Princípio de Transparência

O cliente deverá sempre saber:

**Onde está o equipamento?**

**O que está sendo feito?**

**Qual é o próximo passo?**

**Existe alguma ação necessária?**

**Quando o serviço deverá estar pronto?**

Essas perguntas deverão orientar o design do portal.

---

# 33. Hierarquia Visual

A hierarquia deverá seguir:

```text
1. Status atual
2. Ação necessária
3. Informações principais
4. Detalhes
5. Histórico
```

Isso evita que informações secundárias escondam ações importantes.

---

# 34. Conclusão

O Design System do TechTrack foi projetado para equilibrar eficiência operacional para a assistência técnica e simplicidade para o cliente.

O painel administrativo será orientado à produtividade, enquanto o portal do cliente será orientado à transparência e acompanhamento.

O sistema visual deverá permanecer consistente entre todas as telas e permitir evolução futura sem necessidade de reconstrução da interface.