# Iteração 32 — Matrizes de pré-requisitos

28/10/2026. Geradas do catálogo compartilhado pelo servidor e pela interface. Valores de balanceamento provisórios. Cada nível custa um ponto da origem correspondente; a primeira classe ganha até 49 pontos (Job 50). Uma árvore tem 70 níveis possíveis, exigindo escolhas.

As colunas Job mostram a sequência exigida para cada nível. Os requisitos das habilidades e dos caminhos se acumulam. Nenhum ponto de Novato financia a primeira classe.

## Guerreiro

Resiste na linha de frente e cresce em combates longos.

| Habilidade | Caminho | Tipo | Máximo | Job por nível | Dependências |
|---|---|---|---:|---|---|
| Golpe Rompedor | Ofensiva | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Domínio das Armas | Ofensiva | Passiva | 5 | 5, 7, 9, 11, 13 | Golpe Rompedor 2 |
| Postura Agressiva | Ofensiva | Ativa | 5 | 10, 12, 14, 16, 18 | Domínio das Armas 2 |
| Precisão Letal | Ofensiva | Passiva | 5 | 15, 17, 19, 21, 23 | Postura Agressiva 2 |
| Pele de Ferro | Defesa | Passiva | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Vitalidade de Ferro | Defesa | Passiva | 5 | 5, 7, 9, 11, 13 | Pele de Ferro 2 |
| Postura Inabalável | Defesa | Passiva | 5 | 10, 12, 14, 16, 18 | Vitalidade de Ferro 2 |
| Provocação | Defesa | Ativa | 5 | 15, 17, 19, 21, 23 | Postura Inabalável 2 |
| Ritmo de Batalha | Persistência | Passiva | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Fôlego de Combate | Persistência | Passiva | 5 | 5, 7, 9, 11, 13 | Ritmo de Batalha 2 |
| Segundo Fôlego | Persistência | Ativa | 5 | 10, 12, 14, 16, 18 | Fôlego de Combate 2 |
| Resistência Prolongada | Persistência | Passiva | 5 | 15, 17, 19, 21, 23 | Segundo Fôlego 2 |
| Contra-ataque | Ofensiva + Defesa | Ativa | 3 | 20, 22, 24 | Domínio das Armas 2; Vitalidade de Ferro 2; 6 pontos em Ofensiva; 6 pontos em Defesa |
| Determinação Final | Defesa + Persistência | Passiva | 3 | 20, 22, 24 | Vitalidade de Ferro 2; Fôlego de Combate 2; 6 pontos em Defesa; 6 pontos em Persistência |
| Ímpeto Crescente | Ofensiva + Persistência | Passiva | 3 | 20, 22, 24 | Domínio das Armas 2; Fôlego de Combate 2; 6 pontos em Ofensiva; 6 pontos em Persistência |
| Espírito Inquebrável | Ofensiva + Defesa + Persistência | Passiva | 1 | 30 | Contra-ataque 1; Determinação Final 1; Ímpeto Crescente 1; 8 pontos em Ofensiva; 8 pontos em Defesa; 8 pontos em Persistência |

## Arqueiro

Controla a distância com flechas e posicionamento.

| Habilidade | Caminho | Tipo | Máximo | Job por nível | Dependências |
|---|---|---|---:|---|---|
| Disparo Perfurante | Precisão | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Olhos de Águia | Precisão | Passiva | 5 | 5, 7, 9, 11, 13 | Disparo Perfurante 2 |
| Disparo Concentrado | Precisão | Ativa | 5 | 10, 12, 14, 16, 18 | Olhos de Águia 2 |
| Conhecimento de Pontos Fracos | Precisão | Passiva | 5 | 15, 17, 19, 21, 23 | Disparo Concentrado 2 |
| Passos Leves | Mobilidade | Passiva | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Recuo Tático | Mobilidade | Ativa | 5 | 5, 7, 9, 11, 13 | Passos Leves 2 |
| Reflexos de Caçador | Mobilidade | Passiva | 5 | 10, 12, 14, 16, 18 | Recuo Tático 2 |
| Disparo Ágil | Mobilidade | Ativa | 5 | 15, 17, 19, 21, 23 | Reflexos de Caçador 2 |
| Flecha Retardante | Controle | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Domínio de Distância | Controle | Passiva | 5 | 5, 7, 9, 11, 13 | Flecha Retardante 2 |
| Chuva de Flechas | Controle | Ativa | 5 | 10, 12, 14, 16, 18 | Domínio de Distância 2 |
| Conservação de Flechas | Controle | Passiva | 5 | 15, 17, 19, 21, 23 | Chuva de Flechas 2 |
| Disparo em Retirada | Precisão + Mobilidade | Ativa | 3 | 20, 22, 24 | Olhos de Águia 2; Recuo Tático 2; 6 pontos em Precisão; 6 pontos em Mobilidade |
| Flecha Transpassante | Precisão + Controle | Ativa | 3 | 20, 22, 24 | Olhos de Águia 2; Domínio de Distância 2; 6 pontos em Precisão; 6 pontos em Controle |
| Caçada Implacável | Mobilidade + Controle | Passiva | 3 | 20, 22, 24 | Recuo Tático 2; Domínio de Distância 2; 6 pontos em Mobilidade; 6 pontos em Controle |
| Instinto do Predador | Precisão + Mobilidade + Controle | Ativa | 1 | 30 | Disparo em Retirada 1; Flecha Transpassante 1; Caçada Implacável 1; 8 pontos em Precisão; 8 pontos em Mobilidade; 8 pontos em Controle |

## Ladino

Prepara emboscadas e explora as fraquezas do alvo.

| Habilidade | Caminho | Tipo | Máximo | Job por nível | Dependências |
|---|---|---|---:|---|---|
| Ocultação | Furtividade | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Ataque Surpresa | Furtividade | Passiva | 5 | 5, 7, 9, 11, 13 | Ocultação 2 |
| Presença Discreta | Furtividade | Passiva | 5 | 10, 12, 14, 16, 18 | Ataque Surpresa 2 |
| Preparação Letal | Furtividade | Passiva | 5 | 15, 17, 19, 21, 23 | Presença Discreta 2 |
| Investida Rápida | Agilidade | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Reflexos Aguçados | Agilidade | Passiva | 5 | 5, 7, 9, 11, 13 | Investida Rápida 2 |
| Sequência de Adagas | Agilidade | Ativa | 5 | 10, 12, 14, 16, 18 | Reflexos Aguçados 2 |
| Ritmo Acelerado | Agilidade | Passiva | 5 | 15, 17, 19, 21, 23 | Sequência de Adagas 2 |
| Lâmina Envenenada | Oportunismo | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Conhecimento de Fraquezas | Oportunismo | Passiva | 5 | 5, 7, 9, 11, 13 | Lâmina Envenenada 2 |
| Golpe Traiçoeiro | Oportunismo | Ativa | 5 | 10, 12, 14, 16, 18 | Conhecimento de Fraquezas 2 |
| Toxinas Persistentes | Oportunismo | Passiva | 5 | 15, 17, 19, 21, 23 | Golpe Traiçoeiro 2 |
| Passo das Sombras | Furtividade + Agilidade | Ativa | 3 | 20, 22, 24 | Ataque Surpresa 2; Reflexos Aguçados 2; 6 pontos em Furtividade; 6 pontos em Agilidade |
| Emboscada Tóxica | Furtividade + Oportunismo | Ativa | 3 | 20, 22, 24 | Ataque Surpresa 2; Conhecimento de Fraquezas 2; 6 pontos em Furtividade; 6 pontos em Oportunismo |
| Dança das Lâminas | Agilidade + Oportunismo | Ativa | 3 | 20, 22, 24 | Reflexos Aguçados 2; Conhecimento de Fraquezas 2; 6 pontos em Agilidade; 6 pontos em Oportunismo |
| Predador Invisível | Furtividade + Agilidade + Oportunismo | Passiva | 1 | 30 | Passo das Sombras 1; Emboscada Tóxica 1; Dança das Lâminas 1; 8 pontos em Furtividade; 8 pontos em Agilidade; 8 pontos em Oportunismo |

## Sacerdote

Sustenta aliados e pune inimigos com luz sagrada.

| Habilidade | Caminho | Tipo | Máximo | Job por nível | Dependências |
|---|---|---|---:|---|---|
| Cura | Restauração | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Toque Purificador | Restauração | Ativa | 5 | 5, 7, 9, 11, 13 | Cura 2 |
| Expansão Sagrada | Restauração | Passiva | 5 | 10, 12, 14, 16, 18 | Toque Purificador 2 |
| Renovação | Restauração | Ativa | 5 | 15, 17, 19, 21, 23 | Expansão Sagrada 2 |
| Bênção da Coragem | Bênçãos | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Proteção Divina | Bênçãos | Ativa | 5 | 5, 7, 9, 11, 13 | Bênção da Coragem 2 |
| Teleporte | Bênçãos | Ativa | 5 | 10, 12, 14, 16, 18 | Proteção Divina 2 |
| Aura de Esperança | Bênçãos | Ativa | 5 | 15, 17, 19, 21, 23 | Teleporte 2 |
| Luz Punitiva | Julgamento | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Conhecimento Sagrado | Julgamento | Passiva | 5 | 5, 7, 9, 11, 13 | Luz Punitiva 2 |
| Selo da Condenação | Julgamento | Ativa | 5 | 10, 12, 14, 16, 18 | Conhecimento Sagrado 2 |
| Convicção | Julgamento | Passiva | 5 | 15, 17, 19, 21, 23 | Selo da Condenação 2 |
| Santuário | Restauração + Bênçãos | Ativa | 3 | 20, 22, 24 | Toque Purificador 2; Proteção Divina 2; 6 pontos em Restauração; 6 pontos em Bênçãos |
| Luz da Redenção | Restauração + Julgamento | Ativa | 3 | 20, 22, 24 | Toque Purificador 2; Conhecimento Sagrado 2; 6 pontos em Restauração; 6 pontos em Julgamento |
| Arma Consagrada | Bênçãos + Julgamento | Ativa | 3 | 20, 22, 24 | Proteção Divina 2; Conhecimento Sagrado 2; 6 pontos em Bênçãos; 6 pontos em Julgamento |
| Milagre da Fé | Restauração + Bênçãos + Julgamento | Passiva | 1 | 30 | Santuário 1; Luz da Redenção 1; Arma Consagrada 1; 8 pontos em Restauração; 8 pontos em Bênçãos; 8 pontos em Julgamento |

## Mago

Combina fogo, gelo e eletricidade com preparo arcano.

| Habilidade | Caminho | Tipo | Máximo | Job por nível | Dependências |
|---|---|---|---:|---|---|
| Projétil Mágico | Destruição Elemental | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Maestria Elemental | Destruição Elemental | Passiva | 5 | 5, 7, 9, 11, 13 | Projétil Mágico 2 |
| Bola de Fogo | Destruição Elemental | Ativa | 5 | 10, 12, 14, 16, 18 | Maestria Elemental 2 |
| Corrente Elétrica | Destruição Elemental | Ativa | 5 | 15, 17, 19, 21, 23 | Bola de Fogo 2 |
| Lança de Gelo | Controle Arcano | Ativa | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Campo de Gelo | Controle Arcano | Ativa | 5 | 5, 7, 9, 11, 13 | Lança de Gelo 2 |
| Barreira Arcana | Controle Arcano | Ativa | 5 | 10, 12, 14, 16, 18 | Campo de Gelo 2 |
| Passo Arcano | Controle Arcano | Ativa | 5 | 15, 17, 19, 21, 23 | Barreira Arcana 2 |
| Conjuração Acelerada | Concentração Mística | Passiva | 5 | 1, 3, 5, 7, 9 | Sem dependência anterior |
| Reserva Arcana | Concentração Mística | Passiva | 5 | 5, 7, 9, 11, 13 | Conjuração Acelerada 2 |
| Meditação Arcana | Concentração Mística | Passiva | 5 | 10, 12, 14, 16, 18 | Reserva Arcana 2 |
| Sobrecarga Arcana | Concentração Mística | Ativa | 5 | 15, 17, 19, 21, 23 | Meditação Arcana 2 |
| Explosão Glacial | Destruição Elemental + Controle Arcano | Ativa | 3 | 20, 22, 24 | Maestria Elemental 2; Campo de Gelo 2; 6 pontos em Destruição Elemental; 6 pontos em Controle Arcano |
| Fluxo Arcano | Destruição Elemental + Concentração Mística | Passiva | 3 | 20, 22, 24 | Maestria Elemental 2; Reserva Arcana 2; 6 pontos em Destruição Elemental; 6 pontos em Concentração Mística |
| Concentração Defensiva | Controle Arcano + Concentração Mística | Passiva | 3 | 20, 22, 24 | Campo de Gelo 2; Reserva Arcana 2; 6 pontos em Controle Arcano; 6 pontos em Concentração Mística |
| Trindade Arcana | Destruição Elemental + Controle Arcano + Concentração Mística | Passiva | 1 | 30 | Explosão Glacial 1; Fluxo Arcano 1; Concentração Defensiva 1; 8 pontos em Destruição Elemental; 8 pontos em Controle Arcano; 8 pontos em Concentração Mística |
