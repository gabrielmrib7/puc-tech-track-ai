# Definição do Problema

## Problema

### Descrição

Clientes que deixam computadores, celulares e outros dispositivos eletrônicos em assistências técnicas possuem pouca visibilidade sobre o andamento do serviço. Após entregar o equipamento, o cliente geralmente depende de ligações, mensagens pelo WhatsApp ou contato presencial para descobrir se o diagnóstico foi realizado, se o orçamento está disponível, se o reparo foi autorizado ou se o equipamento está pronto para retirada.

Para a assistência técnica, essa situação gera uma quantidade significativa de interações repetitivas, dificulta a organização das informações e pode causar falhas na comunicação entre atendentes, técnicos e clientes.

O problema central é a **falta de um canal digital simples e centralizado para acompanhamento do ciclo de uma ordem de serviço pelo cliente e pela assistência técnica**.

### Contexto Atual

O processo de atendimento normalmente começa com a entrega do equipamento pelo cliente e a abertura de uma ordem de serviço contendo informações como identificação do cliente, equipamento, defeito relatado, acessórios entregues e data de entrada.

Atualmente, especialmente em pequenas assistências técnicas, o acompanhamento pode depender de ferramentas distintas, como planilhas, sistemas internos, papel, telefone e aplicativos de mensagens.

Quando o cliente deseja saber o andamento do reparo, precisa entrar em contato diretamente com a assistência. O atendente, por sua vez, precisa localizar a ordem de serviço e consultar o técnico ou sistema utilizado internamente.

Esse processo pode resultar em informações desatualizadas, retrabalho e dificuldade para manter um histórico organizado das interações.

A necessidade de manter uma ordem de serviço e registrar informações sobre a entrega e o reparo também é relevante do ponto de vista do consumidor. O Procon-MG recomenda que o cliente exija uma ordem de serviço que comprove a data em que o produto foi deixado na assistência técnica e que o documento contenha informações do serviço. O Procon-SP também destaca a importância da ordem de serviço para comprovação do prazo do reparo.

### Impactos

- Clientes precisam entrar em contato repetidamente com a assistência para obter informações sobre seus equipamentos.
- Funcionários gastam tempo respondendo perguntas sobre o status de ordens de serviço que poderiam ser consultadas diretamente pelo cliente.
- Informações podem ficar dispersas entre sistemas, planilhas, documentos físicos e conversas por aplicativos de mensagens.
- A ausência de atualizações claras pode gerar insegurança e insatisfação por parte do cliente.
- A assistência pode ter dificuldade para identificar rapidamente quais equipamentos estão aguardando diagnóstico, orçamento, aprovação, reparo ou retirada.
- Falhas de comunicação podem gerar atrasos, retrabalho e conflitos relacionados aos prazos e serviços realizados.

### Evidências

- O Procon-MG orienta consumidores a exigirem uma ordem de serviço contendo informações sobre o serviço e as datas de início e término, demonstrando a importância do registro formal do atendimento.
- O Procon-SP considera a ordem de serviço um documento importante para comprovar o prazo do reparo quando um produto é encaminhado para assistência técnica.
- Soluções comerciais existentes no mercado já oferecem recursos de gerenciamento de ordens de serviço e rastreamento online para clientes, indicando uma demanda por digitalização desse processo.
- A necessidade de acompanhamento não está restrita ao momento da abertura do atendimento: o cliente precisa saber quando o equipamento foi recebido, quando o diagnóstico foi realizado, quando um orçamento está disponível, se o reparo foi autorizado e quando o produto está pronto para retirada.

## Objetivo

### Objetivo Principal

Desenvolver uma plataforma digital que permita às assistências técnicas gerenciar ordens de serviço e disponibilizar aos clientes informações atualizadas sobre o andamento do reparo, reduzindo a necessidade de contatos manuais e aumentando a transparência durante todo o processo de atendimento.

### Objetivos Específicos

- Permitir que a assistência técnica cadastre e gerencie ordens de serviço de forma centralizada.
- Permitir que técnicos e atendentes atualizem o status de uma ordem de serviço.
- Permitir que clientes consultem o andamento do reparo por meio de um código ou acesso autenticado.
- Disponibilizar informações importantes sobre o equipamento, serviço solicitado, orçamento e status do reparo.
- Registrar um histórico das alterações realizadas na ordem de serviço.
- Reduzir a quantidade de solicitações manuais de informação feitas pelos clientes.
- Melhorar a comunicação entre assistência técnica e cliente.
- Criar uma base organizada de informações que possa ser utilizada pela assistência para acompanhar sua operação.

### Critérios de Sucesso

- Pelo menos 80% dos clientes conseguirem consultar o status de sua ordem de serviço sem precisar entrar em contato diretamente com a assistência.
- Redução de pelo menos 30% das solicitações relacionadas exclusivamente à consulta de status das ordens de serviço após a implantação do sistema.
- Pelo menos 90% das ordens de serviço possuírem status atualizado durante o processo de atendimento.
- O cliente conseguir identificar claramente o status atual e as principais informações de sua ordem de serviço.
- A assistência técnica conseguir localizar uma ordem de serviço em poucos segundos utilizando identificadores como número da ordem, cliente ou equipamento.

## Público-Alvo

### Perfil Principal

O público-alvo principal é composto por **clientes de pequenas e médias assistências técnicas de computadores, celulares, notebooks e outros equipamentos eletrônicos**, que precisam acompanhar o andamento de serviços de manutenção ou reparo.

Como público secundário, o produto atende os funcionários das assistências técnicas responsáveis pelo atendimento ao cliente, gerenciamento das ordens de serviço e execução dos reparos.

### Características

- Clientes que deixam equipamentos eletrônicos para diagnóstico, manutenção ou reparo.
- Pessoas que precisam acompanhar o andamento de um serviço sem precisar comparecer presencialmente à assistência.
- Pequenas e médias assistências técnicas que possuem processos de atendimento que podem envolver planilhas, papel, sistemas internos ou aplicativos de mensagens.
- Atendentes responsáveis por registrar clientes, equipamentos e ordens de serviço.
- Técnicos responsáveis pelo diagnóstico, orçamento e execução dos reparos.

### Necessidades

- Saber se o equipamento já foi diagnosticado.
- Saber se existe um orçamento aguardando aprovação.
- Saber se o orçamento foi aprovado e o reparo foi iniciado.
- Saber se o reparo foi concluído.
- Saber quando o equipamento está disponível para retirada.
- Ter acesso ao histórico do atendimento.
- Receber informações confiáveis sem precisar entrar em contato repetidamente com a assistência.

### Restrições

- O sistema deve possuir uma interface simples o suficiente para ser utilizada por clientes com diferentes níveis de familiaridade tecnológica.
- O acesso às informações do cliente e do equipamento deve ser protegido contra acesso não autorizado.
- O sistema deve preservar o histórico das alterações realizadas nas ordens de serviço.
- A solução deve ser compatível com dispositivos móveis, considerando que grande parte dos clientes poderá realizar o acompanhamento pelo celular.
- O MVP deve evitar funcionalidades excessivamente complexas para manter o custo e o tempo de desenvolvimento controlados.
- O sistema não deve substituir completamente os processos técnicos internos da assistência no MVP; seu foco inicial será o gerenciamento básico da ordem de serviço e a transparência para o cliente.