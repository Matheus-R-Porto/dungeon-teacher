# Iteração 34 — matriz de balanceamento

## Configuração e mecânicas

| Encontro | Original | Final escolar | Preservado |
| --- | --- | --- | --- |
| Lobo Branco, 2º andar | 1800 HP; ataque26; defesa8 | 48000 HP; ataque850; defesa8 | Mordida, investida multialvo, uivo/reforços, frenesi<30%, covil público, reset, XP210, baú20%, reaparecimento15min |
| Cavaleiro do Último Juramento, 3º andar | 1500 HP; ataque24; defesa7 | Base3000 HP e ataque180; por participante extra +65% da vida-base e +6% do ataque-base; máximo6 | Espada, arco, ruptura, investida, fase2<40%, arena/roster, XP300 e desbloqueio do 4º andar |

A campanha solo anterior mantém o Cavaleiro em1500/24, com os testes de armas básicas preservados. A composição da arena escolar aplica os novos valores antes de criar o mesmo controlador. Não se criou outro boss.

## Participação efetiva

Dano positivo ao chefe, receber impacto dele, Provocação válida, cura que realmente restaura HP e proteção/buff de um aliado engajado contam. Buff ativo aplicado antes do engajamento mantém a ligação até expirar; overheal, autobuff isolado e mera presença não contam. Alvos mortos ou desconectados não criam nova participação. O corpo desconectado continua vulnerável conforme a regra anterior.

A contagem é acumulada por identidade até o fim do encontro. Não cai por morte, desconexão ou reconexão; não conta a mesma identidade duas vezes. Entrada de participante tardio acrescenta somente o orçamento de HP correspondente, conservando todo o dano já causado. Não restaura o HP previamente perdido nem alterna continuamente a escala. O snapshot expõe a contagem. Com1/2/4/6 participantes, os máximos são3000/4950/8850/12750 HP e180/190,8/212,4/234 de ataque. A elegibilidade de recompensas continua ligada ao roster original, separada da escala.

## Resultados antes/depois

| Boss | Cenário | Vitórias antes | Tempo médio antes s | Vitórias depois | Tempo médio depois s | Mortes depois | Cura média depois | Contatos área depois |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| wolf | balanced | 3/3 | 5.1 | 3/3 | 67.0 | 5 | 3794.2 | 31 |
| wolf | offensive | 3/3 | 2.7 | 3/3 | 58.7 | 5 | 426.4 | 16 |
| wolf | alternative | 3/3 | 7.8 | 3/3 | 64.1 | 5 | 998.1 | 21 |
| wolf | size-1 | 3/3 | 107.7 | 0/3 | 29.7 | 3 | 274.1 | 0 |
| wolf | size-2 | 3/3 | 59.4 | 0/3 | 156.3 | 2 | 1415.2 | 13 |
| wolf | size-4 | 3/3 | 8.5 | 3/3 | 84.4 | 1 | 1024.5 | 9 |
| wolf | new | 3/3 | 15.3 | 1/3 | 171.4 | 11 | 0.0 | 14 |
| wolf | intermediate | 3/3 | 12.6 | 3/3 | 106.3 | 3 | 669.5 | 14 |
| wolf | underprepared-four | 3/3 | 21.4 | 2/3 | 122.0 | 6 | 0.0 | 6 |
| wolf | uncoordinated | 1/3 | 122.0 | 0/3 | 34.8 | 18 | 2028.9 | 26 |
| wolf | exceptional-solo | 3/3 | 25.2 | 0/3 | 79.1 | 2 | 759.2 | 0 |
| knight | balanced | 3/3 | 13.3 | 3/3 | 18.4 | 0 | 16.0 | 3 |
| knight | offensive | 3/3 | 5.3 | 3/3 | 15.8 | 0 | 0.0 | 3 |
| knight | alternative | 3/3 | 5.0 | 3/3 | 11.7 | 0 | 30.7 | 3 |
| knight | size-1 | 1/3 | 173.2 | 3/3 | 80.3 | 0 | 182.8 | 20 |
| knight | size-2 | 3/3 | 34.0 | 3/3 | 22.1 | 0 | 0.0 | 4 |
| knight | size-4 | 3/3 | 13.6 | 3/3 | 17.0 | 0 | 0.0 | 0 |
| knight | new | 3/3 | 12.4 | 3/3 | 34.4 | 0 | 1104.8 | 46 |
| knight | intermediate | 3/3 | 5.7 | 3/3 | 22.1 | 0 | 60.9 | 16 |
| knight | underprepared-four | 3/3 | 16.3 | 3/3 | 23.7 | 0 | 0.0 | 0 |
| knight | uncoordinated | 3/3 | 79.2 | 3/3 | 12.1 | 0 | 375.6 | 28 |

Os tempos médios incluem derrotas e limites de180s: consultar cada resultado antes de interpretá-los como tempo de vitória. `new`=seis Base24/Job5; `underprepared-four`=quatro desse perfil; `intermediate`=seis Base30/Job15. “size” usa preparados Base38/Job25. Os dados finais preservam MP, flechas, dano/curas por classe, habilidades, fichas e resultado de cada semente. A referência contém o bloqueio de habilidade encontrado; portanto esta tabela compara o comportamento do sistema completo, não apenas a troca de HP.

## Candidatos e coordenação

| HP candidato | Ataque | Grupo | Vitórias | Tempo médio s | Mortes |
| --- | --- | --- | --- | --- | --- |
| 24000 | 350 | 4 | 3/3 | 39.5 | 0 |
| 24000 | 350 | 6 | 3/3 | 28.1 | 0 |
| 36000 | 450 | 4 | 3/3 | 60.1 | 0 |
| 36000 | 450 | 6 | 3/3 | 42.8 | 1 |
| 48000 | 550 | 4 | 3/3 | 78.0 | 0 |
| 48000 | 550 | 6 | 3/3 | 62.9 | 0 |

| 48000HP/850ataque | Vitórias | Tempo médio s, limite300s | Mortes |
| --- | --- | --- | --- |
| prepared-four | 3/3 | 84.4 | 1 |
| prepared-six | 3/3 | 67.0 | 5 |
| without-healer | 3/3 | 58.7 | 5 |
| underprepared-four | 2/3 | 122.0 | 6 |
| uncoordinated-four | 0/3 | 37.1 | 12 |
| uncoordinated-six | 0/3 | 34.8 | 18 |
| exceptional-solo | 0/3 | 81.3 | 3 |

| Solo Base71/Job50 | Semente | Resultado | Tempo s |
| --- | --- | --- | --- |
| mage | 11 | victory | 73.9 |
| mage | 29 | victory | 83.55 |
| mage | 47 | victory | 80.95 |
| rogue | 11 | defeat | 65.8 |
| rogue | 29 | victory | 142.9 |
| rogue | 47 | victory | 136.05 |

A escolha final mantém chance real para quatro preparados e reduz a tolerância a erros de posicionamento: sem esquivas, quatro e seis perderam as três repetições. Seis têm mais opções e dano, mas agrupamento na investida pode aumentar as mortes. Grupos menos preparados demoraram mais e nem sempre concluíram no limite; não há bloqueio artificial de vitória por Job. O mago excepcional venceu os três solos medidos; o guerreiro não foi referência de solo garantido.

O Cavaleiro escolar é mais acessível nos mesmos perfis e equipamentos. Os ataques em área continuam existentes e foram verificados com múltiplos alvos, aviso anterior ao impacto, posição fora da área, obstáculos e não repetição de contato na mesma investida. A dificuldade de humanos e outras builds exige observação futura; não se afirma que três sementes representem uma taxa universal de vitória.
