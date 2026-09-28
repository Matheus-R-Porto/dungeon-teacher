# DUNGEON MASTER — BETA 0.1.0
## Iteração 06 — Inventário, Equipamentos, Árvore de Habilidades e Primeiro Andar de Combate

Continue o desenvolvimento da implementação atual de **Dungeon Master Beta 0.1.0**.

As Iterações 01–05 estão concluídas.

Preserve todos os sistemas existentes e trabalhe incrementalmente sobre a arquitetura atual.

A Iteração 06 deve começar a transformar os sistemas isolados já construídos em um pequeno loop real de RPG.

---

# 1. OBJETIVO PRINCIPAL

Ao final desta iteração deve existir este fluxo:

**Entrar no Hub**

→ encontrar NPC de armas

→ interagir com F

→ adquirir gratuitamente uma arma de teste

→ arma vai para o inventário

→ abrir inventário

→ equipar arma

→ abrir árvore de habilidades com TAB

→ adquirir habilidades disponíveis

→ colocar/usar habilidades

→ entrar no Portal

→ carregar uma sala separada de combate

→ encontrar Slimes nessa sala

→ lutar utilizando arma + habilidades

→ poder retornar ao Hub.

Este é o primeiro pequeno loop funcional de Dungeon Master.

---

# 2. HUB NÃO É MAIS ÁREA DE COMBATE

Remover os Slimes atualmente presentes no Hub/Refúgio.

O Refúgio deve ser tratado como:

## área segura.

Não deve haver monstros hostis espalhados nele.

Preservar:

- cenário;
- portal;
- NPCs existentes;
- câmera;
- movimentação;
- interface;
- sistemas anteriores.

Apenas remover os inimigos de teste do Hub.

---

# 3. SEPARAÇÃO CONCEITUAL

A partir desta iteração existem pelo menos dois ambientes:

## HUB

Área segura e persistente.

Contém:

- jogador;
- Portal;
- NPC de armas;
- interfaces;
- futuramente lojas, armazém, arena etc.

## TORRE / SALA DE TESTE

Área de combate.

Contém:

- jogador;
- inimigos;
- combate;
- futuramente loot;
- futuramente geração procedural.

Não confundir os dois contextos.

---

# 4. PORTAL

O Portal atual deixa de ser apenas uma interação demonstrativa.

Ao aproximar-se e pressionar:

`F`

deve permitir entrar na Torre.

Nesta iteração ainda NÃO existe geração procedural completa.

O Portal deve carregar:

## uma sala/andar placeholder de combate.

---

# 5. SALA PLACEHOLDER

Criar um ambiente separado do Hub.

Pode ser visualmente simples.

Não gastar tempo produzindo arte final.

O objetivo é provar:

**Hub → Portal → Torre**

A sala pode utilizar elementos provisórios como:

- chão;
- paredes;
- obstáculos;
- iluminação;
- spawn do jogador;
- alguns Slimes.

---

# 6. PRIMEIRO "ANDAR"

Tratar essa sala conceitualmente como:

`Floor 1`

ou estrutura equivalente.

Mesmo sendo placeholder.

Não hardcodar toda a lógica como:

`loadSlimeRoom()`.

Preparar conceito genérico equivalente a:

- scene/area;
- floorId;
- spawnPoint;
- enemySpawns;
- exits;
- environment.

Isso será substituído/expandido futuramente pela geração procedural.

---

# 7. SLIMES

Mover os Slimes de teste para essa sala.

Não precisamos necessariamente manter os 20 inimigos do stress test como gameplay normal.

Criar quantidade razoável para testar combate.

Algo como:

**4–6 Slimes**

é suficiente.

O cenário de stress com 20 inimigos pode continuar existindo apenas através das ferramentas de debug/teste.

---

# 8. IA EXISTENTE

Os Slimes da sala devem continuar utilizando tudo da Iteração 05:

- percepção;
- aggro;
- perseguição;
- ataque;
- leash;
- retorno;
- regeneração;
- morte;
- respawn;
- colisão;
- separação.

Não reimplementar IA.

---

# 9. RETORNO AO HUB

Nesta etapa deve existir uma forma simples de retornar ao Hub.

Lembrando a regra de design do jogo:

> O jogador poderá retornar ao Hub ao final de cada andar.

Como existe apenas uma sala placeholder nesta versão, adicionar uma saída simples após o objetivo apropriado.

Pode ser:

- portal de retorno;
- interação;
- saída da sala.

Não criar ainda sistema completo de progressão de andares.

---

# 10. INVENTÁRIO — PROTÓTIPO

Criar o primeiro protótipo funcional de inventário.

O inventário deve possuir slots e armazenar objetos reais do domínio.

Não criar apenas elementos visuais falsos.

Estruturar algo equivalente a:

`Inventory`

`InventoryItem`

`ItemDefinition`

---

# 11. ITEM DEFINITION

Preparar definição genérica de item.

Campos podem incluir:

- id;
- name;
- description;
- type;
- rarity;
- icon;
- stackable;
- maxStack;
- sellValue;
- weight;
- equipSlot;
- weaponType;
- stats;
- requirements.

Não é necessário utilizar todos imediatamente.

Não superarquitetar.

---

# 12. CATEGORIAS FUTURAS

O inventário deve poder futuramente receber:

- armas;
- cabeça;
- peitoral;
- calças;
- botas;
- anel;
- colar;
- talismã;
- consumíveis;
- materiais;
- baús;
- itens especiais.

Nesta iteração o foco são:

## armas.

---

# 13. TAMANHO DO INVENTÁRIO

Criar uma capacidade razoavelmente grande.

Não precisamos balancear o tamanho definitivo ainda.

Lembrar que futuramente:

- inventário poderá aumentar através de atributo;
- Hub terá armazém alugável.

Não implementar essas expansões agora.

---

# 14. INTERFACE DO INVENTÁRIO

Criar uma interface simples e funcional.

Escolha uma tecla livre e coerente para abrir/fechar o inventário.

Preferencialmente:

`I`

Mostrar:

- grid de slots;
- itens;
- tooltip;
- quantidade quando aplicável;
- equipamento atual.

Não produzir UI final.

---

# 15. EQUIPAMENTOS

Criar protótipo real de equipamentos.

Preparar os slots futuros:

## Equipamentos

- Weapon
- Head
- Chest
- Legs
- Boots

## Acessórios

- Ring
- Necklace
- Talisman

Por enquanto apenas:

## Weapon

precisa possuir itens funcionais.

Os demais slots podem aparecer como vazios/placeholder ou permanecer apenas no domínio.

---

# 16. EQUIPAR

O jogador deve conseguir:

- selecionar arma no inventário;
- equipá-la;
- substituir arma atual;
- devolver arma anterior ao inventário.

Não permitir perda acidental de item.

---

# 17. ARMAS DE TESTE

Criar quatro armas provisórias:

## Espada de Treino

`weaponType = sword`

## Adaga de Treino

`weaponType = dagger`

## Arco de Treino

`weaponType = bow`

## Cajado de Treino

`weaponType = staff`

Nomes podem ser adaptados mantendo essa função.

---

# 18. ARMAS E ESTATÍSTICAS

As armas devem possuir estatísticas.

Não precisam estar balanceadas.

Exemplo:

Espada:
- Physical Attack.

Adaga:
- Physical Attack;
- talvez Attack Speed.

Arco:
- Physical Attack;
- alcance apropriado futuramente.

Cajado:
- Magic Attack.

Não criar ainda um sistema gigantesco de affixes.

Precisamos apenas provar:

**item equipado → modifica estatísticas do personagem.**

---

# 19. RECÁLCULO

Ao equipar/remover/trocar arma:

as estatísticas derivadas devem ser recalculadas corretamente.

Não modificar permanentemente os atributos base.

A arquitetura deve distinguir:

- atributos base;
- modificadores de equipamento;
- modificadores temporários;
- estatísticas derivadas.

---

# 20. NPC DE ARMAS

Adicionar ao Hub um NPC protótipo.

Pode possuir sprite/visual placeholder.

Não criar arte final.

Sugestão funcional:

## Ferreiro / Mercador de Armas

O nome definitivo pode ser decidido posteriormente.

---

# 21. INTERAÇÃO COM NPC

Aproximar-se do NPC deve mostrar o sistema universal existente de interação:

`F`

Pressionar F abre sua interface.

Não criar uma tecla exclusiva para o NPC.

---

# 22. LOJA PROTÓTIPO

Criar interface de loja simples.

O NPC oferece:

- Espada de Treino;
- Adaga de Treino;
- Arco de Treino;
- Cajado de Treino.

Todas custam:

## 0 moedas.

Isso é deliberado.

Nesta fase queremos testar builds sem economia interferindo.

---

# 23. AQUISIÇÃO

Ao escolher uma arma:

ela deve ser adicionada ao inventário.

Não simplesmente equipá-la automaticamente.

Fluxo:

NPC

→ adquirir

→ inventário

→ jogador decide equipar.

---

# 24. EVITAR DUPLICAÇÃO ACIDENTAL

Como são gratuitas, definir comportamento simples para evitar encher o inventário acidentalmente.

Por exemplo:

se o jogador já possuir aquela arma de treino, indicar:

**Já possuído**

ou permitir apenas uma cópia das armas de teste.

Isso é específico do protótipo.

---

# 25. SISTEMA UNIVERSAL DE HABILIDADES

Nesta mesma iteração implementar o Ability System planejado.

Ele deve ser independente da classe.

As habilidades devem possuir definições data-driven.

Suportar:

- requisito de arma;
- custo;
- cooldown;
- alcance;
- targeting;
- cast;
- multi-hit;
- projétil;
- efeito periódico;
- interrupção;
- fila/intenção.

---

# 26. ÁRVORE DE HABILIDADES — PROTÓTIPO

Criar o primeiro protótipo da Skill Tree.

Abrir/fechar através de:

# TAB

Nesta versão, TAB deve abrir a interface da árvore de habilidades.

Evitar conflito com comportamento padrão do navegador.

---

# 27. OBJETIVO DA ÁRVORE

A árvore ainda NÃO representa progressão final.

Queremos validar:

- nós;
- aquisição;
- estado bloqueado/desbloqueado;
- habilidade aprendida;
- relação com hotbar;
- arquitetura futura.

---

# 28. TODAS PODEM SER ADQUIRIDAS

Durante esta iteração:

## todas as habilidades do Novato podem ser adquiridas imediatamente.

Não exigir:

- nível;
- pontos;
- quests;
- pré-requisitos;
- outras habilidades.

Isso é temporário.

O objetivo é testar a infraestrutura.

---

# 29. PREPARAR PRÉ-REQUISITOS FUTUROS

Apesar de estarem todas disponíveis agora, a estrutura da Skill Tree deve suportar futuramente:

- levelRequirement;
- skillPointCost;
- prerequisites;
- classRequirement;
- evolutionRequirement;
- mutuallyExclusive;
- outros requisitos quando necessários.

Não implementar regras sem uso.

Apenas não criar uma arquitetura que impossibilite isso.

---

# 30. NÓS DO NOVATO

A árvore inicial deve conter:

## Golpe Poderoso
Representação inicial do Guerreiro.

## Ataque Duplo
Representação inicial do Assassino.

## Tiro Duplo
Representação inicial do Arqueiro.

## Bola de Energia
Representação inicial do Feiticeiro.

## Regeneração
Representação inicial do Sacerdote.

---

# 31. ORGANIZAÇÃO VISUAL

Como protótipo, podemos aproveitar a própria filosofia das cinco futuras classes.

Uma estrutura visual possível:

                  NOVATO
                     |
        ┌────────────┼────────────┐
        |            |            |
     combate       distância     suporte
        |            |            |
    habilidades   habilidades   Regeneração

Não é obrigatório utilizar exatamente esse desenho.

Uma alternativa ainda melhor é posicionar as cinco habilidades ao redor de um nó central:

                    Golpe Poderoso
                          |
       Ataque Duplo — [ NOVATO ] — Tiro Duplo
                          |
                   Bola de Energia
                          |
                     Regeneração

O importante é comunicar:

> O Novato está experimentando caminhos diferentes.

Não comunicar ainda que uma dessas escolhas bloqueia as outras.

---

# 32. APRENDER HABILIDADE

Ao clicar em um nó disponível:

mostrar informações da habilidade.

Permitir:

**Aprender**

Como nesta versão não existem custos:

a aquisição é imediata.

Depois disso o nó muda visualmente para:

**Aprendida**

---

# 33. SKILLS E SAVE

Habilidades aprendidas devem ser persistidas.

Se o jogador:

- aprende Golpe Poderoso;
- salva;
- recarrega;

Golpe Poderoso continua aprendido.

Preparar migração segura do save atual.

Não quebrar saves anteriores da Beta.

---

# 34. INVENTÁRIO E SAVE

Também persistir:

- itens possuídos;
- arma equipada.

Ao recarregar:

inventário e equipamento devem ser restaurados.

---

# 35. HOTBAR

Criar hotbar de:

`1 2 3 4 5 6 7 8`

Uma habilidade somente pode ser usada se:

- foi aprendida;
- atende requisito de arma;
- possui MP;
- não está em cooldown;
- possui target válido quando necessário;
- demais condições forem satisfeitas.

---

# 36. HOTBAR E ÁRVORE

Ao aprender uma habilidade, permitir que ela seja utilizada na hotbar.

Para esta primeira versão, pode haver associação automática simples.

Exemplo:

1 — Golpe Poderoso  
2 — Ataque Duplo  
3 — Tiro Duplo  
4 — Bola de Energia  
5 — Regeneração  
6 — vazio  
7 — vazio  
8 — vazio

Mas a arquitetura deve permitir reconfiguração futura.

---

# 37. REQUISITOS DE ARMA

Aplicar:

Golpe Poderoso → Espada

Ataque Duplo → Adaga

Tiro Duplo → Arco

Bola de Energia → Cajado

Regeneração → sem requisito.

Se arma incompatível:

habilidade permanece aprendida, mas indisponível.

---

# 38. GOLPE PODEROSO

Implementar habilidade real do Novato:

## Golpe Poderoso

- requer espada;
- target inimigo;
- melee;
- dano físico;
- um impacto;
- mais forte que ataque básico;
- custo/cooldown provisórios.

---

# 39. ATAQUE DUPLO

## Ataque Duplo

- requer adaga;
- melee;
- dano físico;
- dois impactos;
- cada impacto resolvido individualmente.

Cada impacto pode:

- acertar;
- errar;
- critar.

Se alvo morrer no primeiro:

segundo não produz dano fantasma.

---

# 40. TIRO DUPLO

## Tiro Duplo

- requer arco;
- ranged;
- dois projéteis;
- dano físico;
- impactos independentes;
- LOS.

---

# 41. BOLA DE ENERGIA

## Bola de Energia

- requer cajado;
- ranged;
- pequeno cast;
- projétil;
- dano mágico;
- utiliza Magic Attack;
- utiliza Magic Defense do alvo.

---

# 42. REGENERAÇÃO

## Regeneração

- não exige arma;
- Self;
- custo de MP;
- aplica Heal over Time;
- efeito periódico.

Criar infraestrutura genérica de efeitos periódicos.

Não criar um timer especial exclusivo para Regeneração.

---

# 43. AUTO-ATTACK E ARMA

Começar a preparar o ataque básico para respeitar a arma equipada.

Não é necessário finalizar todas as animações/particularidades.

Mas evitar arquitetura onde:

arco equipado

→ jogador obrigatoriamente continua usando ataque corpo a corpo de 1.45 para sempre.

Ao menos estruturar os dados para futuramente armas definirem:

- attackRange;
- damageType;
- attackSpeedModifier;
- outras propriedades.

---

# 44. FILA DE AÇÕES

Preservar filosofia:

auto-attack

→ skill solicitada

→ ação atual termina de maneira válida

→ skill executa

→ recovery

→ auto-attack retorna.

Manter no máximo uma habilidade pendente.

---

# 45. TROCA DE ARMA

Trocar arma NÃO deve ser permitido de forma explorável no meio de uma execução já iniciada.

Definir regra simples.

Recomendação para esta Beta:

## Fora de combate

Troca normal.

## Durante combate

Pode abrir inventário, mas equipamento fica bloqueado enquanto estiver em estado de combate/ação relevante.

Mostrar:

**Não é possível trocar equipamento durante combate.**

Isso pode ser revisado futuramente.

---

# 46. TAB E GAMEPLAY

Quando Skill Tree estiver aberta:

- bloquear inputs de combate;
- bloquear movimento;
- impedir habilidades;
- pausar simulação conforme padrão dos outros painéis.

Ao fechar:

retomar normalmente sem delta gigante.

---

# 47. INVENTÁRIO E GAMEPLAY

Aplicar comportamento semelhante ao abrir inventário.

A interface não deve causar:

- ataques acidentais;
- movimento;
- targeting;
- skills.

---

# 48. NPC E GAMEPLAY

Enquanto loja estiver aberta:

jogo deve respeitar o sistema de interação existente.

Não permitir combate/movimento acidental através da interface.

---

# 49. TRANSIÇÃO HUB → TORRE

A transição deve possuir estado claro.

Ao entrar no Portal:

1. interromper movimento;
2. interromper ações;
3. limpar target;
4. remover contexto do Hub;
5. carregar sala;
6. posicionar jogador no spawn;
7. carregar inimigos;
8. atualizar câmera;
9. retornar controle.

Não precisa existir loading screen sofisticada.

Um fade simples é suficiente se útil.

---

# 50. TRANSIÇÃO TORRE → HUB

Ao retornar:

1. limpar inimigos da sala;
2. cancelar ataques;
3. limpar projéteis;
4. limpar target;
5. limpar efeitos específicos da sala quando apropriado;
6. carregar Hub;
7. posicionar jogador no ponto correto;
8. restaurar contexto seguro.

Evitar vazamentos de estado entre ambientes.

---

# 51. MORTE NA TORRE

A regra conceitual do jogo já é:

**morreu → retorna ao Hub.**

Agora a morte provisória da Iteração 04 deve ser adaptada para o novo contexto.

Se morrer na sala:

- cancelar combate;
- limpar target;
- limpar ações;
- sair da sala;
- retornar ao Hub.

Ainda NÃO implementar perda de dinheiro.

Ainda NÃO existem drops/baús definitivos.

---

# 52. MORTE NO HUB

Como o Hub não possui combate normal, isso não deve ocorrer em gameplay comum.

Não criar lógica especial desnecessária.

---

# 53. DEBUG

Manter ferramentas existentes.

Adicionar informações úteis:

- areaId;
- floorId;
- arma equipada;
- inventário;
- habilidades aprendidas;
- habilidade pendente;
- cooldowns;
- efeitos ativos.

O stress test de 20 inimigos deve continuar acessível como debug e NÃO fazer parte da sala normal.

---

# 54. PERFORMANCE

Não fazer grande otimização nesta etapa.

Entretanto, agora temos uma vantagem:

os inimigos não existem mais no Hub.

Portanto o Hub não deve gastar recursos simulando IA que não deveria existir ali.

Quando estiver no Hub:

- nenhuma simulação de Slimes;
- nenhum pathfinding de Slimes;
- nenhum respawn de Slimes.

Quando estiver na sala:

somente entidades pertencentes àquela área devem ser simuladas.

Isso é importante para a arquitetura futura.

---

# 55. TESTES — INVENTÁRIO

Adicionar testes para:

- adicionar item;
- inventário cheio;
- evitar duplicação das armas gratuitas quando aplicável;
- equipar;
- desequipar;
- trocar;
- recalcular stats;
- save/load;
- item inválido;
- slot incompatível.

---

# 56. TESTES — LOJA

Testar:

- interação F;
- abrir loja;
- quatro armas disponíveis;
- custo zero;
- aquisição;
- inventário recebendo item;
- arma não equipando automaticamente;
- fechar loja;
- persistência.

---

# 57. TESTES — SKILL TREE

Testar:

- TAB abre;
- TAB fecha;
- cinco nós;
- todos disponíveis;
- aprender;
- estado aprendido;
- persistência;
- habilidade não aprendida não executa;
- habilidade aprendida executa;
- requisitos de arma.

---

# 58. TESTES — HABILIDADES

Testar:

- Golpe Poderoso;
- Ataque Duplo;
- impactos independentes;
- Tiro Duplo;
- projéteis independentes;
- Bola de Energia;
- dano mágico;
- Regeneração;
- HoT;
- MP;
- cooldown;
- cast;
- range;
- LOS;
- fila;
- auto-attack → skill → auto-attack;
- target morto;
- interrupção;
- pausa.

---

# 59. TESTES — ÁREAS

Testar:

Hub:

- zero Slimes;
- NPC presente;
- Portal presente.

Torre:

- Slimes presentes;
- IA ativa;
- combate ativo.

Transição:

- Hub → Torre;
- Torre → Hub;
- morte → Hub;
- nenhuma entidade antiga vazando entre áreas.

---

# 60. REGRESSÃO

Todos os:

## 93 testes existentes

devem continuar aprovados ou ser adaptados somente quando uma mudança desta especificação alterar legitimamente o comportamento esperado.

Não remover testes apenas para fazer a suíte passar.

---

# 61. NÃO IMPLEMENTAR AINDA

Não implementar:

- classes;
- missões de classe;
- evolução de classe;
- árvore definitiva;
- pontos de habilidade definitivos;
- requisitos de level na árvore;
- equipamentos finais;
- raridades completas;
- loot;
- baús;
- perguntas educacionais;
- economia real;
- crafting;
- forja;
- pesca;
- mineração;
- Torre procedural;
- segundo andar;
- boss;
- checkpoints;
- multiplayer;
- party;
- PvP;
- Arena;
- arte final.

---

# 62. CRITÉRIOS DE CONCLUSÃO

A Iteração 06 estará concluída quando:

1. não existirem Slimes no Hub;
2. existir NPC de armas no Hub;
3. F abrir a loja;
4. existirem quatro armas gratuitas;
5. aquisição adicionar item ao inventário;
6. existir inventário funcional;
7. existir slot de arma;
8. arma puder ser equipada;
9. arma alterar stats corretamente;
10. inventário persistir;
11. equipamento persistir;
12. TAB abrir Skill Tree;
13. existirem cinco habilidades do Novato;
14. todas puderem ser aprendidas imediatamente;
15. habilidades aprendidas persistirem;
16. existir hotbar 1–8;
17. requisitos de arma funcionarem;
18. Golpe Poderoso funcionar;
19. Ataque Duplo funcionar;
20. Tiro Duplo funcionar;
21. Bola de Energia funcionar;
22. Regeneração funcionar;
23. MP funcionar;
24. cooldown funcionar;
25. multi-hit funcionar;
26. projéteis funcionarem;
27. efeitos periódicos funcionarem;
28. Portal carregar uma sala diferente;
29. Slimes existirem nessa sala;
30. IA da Iteração 05 funcionar na sala;
31. existir retorno ao Hub;
32. morte na sala retornar ao Hub;
33. entidades não vazarem entre áreas;
34. stress test continuar disponível separadamente;
35. sistemas anteriores continuarem funcionando;
36. suíte automatizada completa passar.

---

# 63. RELATÓRIO FINAL

Ao terminar:

PARE.

Não iniciar Iteração 07.

Produza relatório detalhando:

- arquivos criados;
- arquivos modificados;
- arquitetura de áreas;
- arquitetura do inventário;
- ItemDefinition;
- equipamento;
- recálculo de atributos;
- NPC/loja;
- Ability System;
- Skill Tree;
- AbilityDefinition;
- requisitos de arma;
- multi-hit;
- projéteis;
- efeitos periódicos;
- hotbar;
- transição Hub/Torre;
- morte e retorno;
- save/migração;
- testes;
- performance;
- limitações conhecidas.

Também informar o número total de testes aprovados.

---

# REGRA PRINCIPAL DA ITERAÇÃO 06

Esta iteração deve produzir o primeiro pequeno loop de RPG reconhecível de Dungeon Master:

**Hub seguro**
→ **NPC**
→ **obter arma**
→ **inventário**
→ **equipar**
→ **aprender habilidade**
→ **Portal**
→ **andar de combate**
→ **usar build contra Slimes**
→ **retornar ao Hub**

Não precisamos ainda de profundidade.

Precisamos que todas essas peças conversem corretamente entre si.

O objetivo é terminar a Iteração 06 e poder olhar para o protótipo e dizer:

> "Agora existe um pequeno RPG aqui."