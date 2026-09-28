# ITERAÇÃO 07 — PRIMEIRO LOOP COMPLETO DE JOGATINA

Quero iniciar agora a ITERAÇÃO 07 de Dungeon Master.

A Iteração 06 ampliada está concluída e deve ser preservada.

O objetivo desta iteração NÃO é adicionar classes definitivas, conteúdo educacional, multiplayer ou sistemas avançados.

O objetivo é construir o PRIMEIRO LOOP COMPLETO DE UMA JOGATINA.

==================================================
OBJETIVO PRINCIPAL
==================================================

Quero que um personagem novo consiga realizar este fluxo completo:

ENTRAR NO JOGO
↓
VER “PRIMEIROS PASSOS”
↓
TESTAR MOVIMENTO E CÂMERA
↓
CONVERSAR COM O ARMEIRO
↓
OBTER UMA ARMA
↓
EQUIPAR A ARMA
↓
ENTRAR NA TORRE
↓
EXPLORAR UM ANDAR GERADO PROCEDURALMENTE
↓
DERROTAR TODOS OS INIMIGOS
↓
SUBIR PARA O PRÓXIMO ANDAR
↓
REPETIR A EXPERIÊNCIA
↓
CHEGAR AO TERCEIRO ANDAR
↓
DERROTAR OS INIMIGOS
↓
ENFRENTAR UM BOSS PROVISÓRIO
↓
BOSS DROPA UM BAÚ
↓
PEGAR O BAÚ
↓
VOLTAR AO REFÚGIO
↓
USAR XP E OURO PARA EVOLUIR ATRIBUTOS
↓
ABRIR O BAÚ PELO INVENTÁRIO
↓
JOGAR UMA ROLETA HORIZONTAL DE RECOMPENSA
↓
RECEBER UM ITEM + OURO
↓
ESTAR PRONTO PARA UMA NOVA EXPEDIÇÃO.

Esse é o primeiro loop real de progressão do jogo.

==================================================
REGRA FUNDAMENTAL
==================================================

Preserve todos os sistemas funcionais da Iteração 06.

Não reescreva sem necessidade:

- inventário;
- equipamento;
- árvore de habilidades;
- AbilityRuntime;
- combate;
- navegação;
- câmera;
- persistência;
- AreaSession;
- HUD;
- Armeiro;
- hotbar;
- pause;
- targeting;
- projéteis;
- efeitos periódicos.

A Iteração 07 deve ser construída SOBRE o que já existe.

==================================================
FASE 0 — AUDITORIA
==================================================

Antes de alterar código:

1. leia toda a implementação atual;
2. rode todos os testes;
3. jogue o fluxo atual;
4. confirme o Refúgio;
5. confirme Armeiro;
6. confirme inventário;
7. confirme árvore;
8. confirme Portal;
9. confirme o Andar 1 atual;
10. confirme comportamento atual dos Slimes;
11. confirme morte/retorno;
12. confirme save/load.

Só depois inicie a Iteração 07.

==================================================
1. PRIMEIROS PASSOS
==================================================

O painel “Primeiros passos” deve continuar aparecendo logo no começo.

Por enquanto ainda pode ser PLACEHOLDER visual.

Não quero investir muito tempo em apresentação final nesta iteração.

O mais importante é que:

- apareça naturalmente;
- explique os primeiros objetivos;
- acompanhe o jogador;
- desapareça ou conclua quando o onboarding terminar.

A estrutura atual de sete etapas pode ser reaproveitada/adaptada.

==================================================
OBJETIVO DO ONBOARDING
==================================================

O jogador novo deve naturalmente:

1. movimentar-se;
2. testar a câmera;
3. encontrar o Armeiro;
4. pegar uma arma;
5. equipá-la;
6. aprender pelo menos uma habilidade;
7. entrar na Torre.

Não adicione uma sequência excessiva de popups.

==================================================
2. TORRE — NOVO CONCEITO
==================================================

A Torre deixa de ser apenas uma única sala fixa.

Nesta iteração quero:

3 ANDARES JOGÁVEIS.

Andar 1
Andar 2
Andar 3

Cada andar deve ser uma pequena área gerada proceduralmente.

==================================================
3. GERAÇÃO PROCEDURAL
==================================================

Quero uma PRIMEIRA VERSÃO SIMPLES E CONTROLADA de geração procedural.

Não quero:

- roguelike gigantesco;
- geração infinita;
- algoritmo acadêmico complexo;
- salas impossíveis;
- geometria completamente aleatória.

Quero algo previsível e testável.

==================================================
OBJETIVO DA GERAÇÃO
==================================================

Cada andar deve gerar:

- espaço jogável;
- limites;
- obstáculos;
- algumas estruturas;
- posição inicial;
- posição da saída;
- posições válidas para inimigos.

A geração precisa garantir:

SEMPRE EXISTE CAMINHO DO SPAWN ATÉ A SAÍDA.

==================================================
SEED
==================================================

Implemente seed.

A geração deve poder ser reproduzida.

Por exemplo:

runSeed
+
floorNumber

→ layout determinístico.

Isso será importante para:

- testes;
- debug;
- reprodução de bugs.

==================================================
DEBUG DA SEED
==================================================

No modo debug:

mostrar:

- seed da run;
- andar atual;
- seed derivada do andar.

Se possível, permitir iniciar com seed específica por query/debug.

==================================================
COMPLEXIDADE INICIAL
==================================================

Prefiro:

algumas dezenas de layouts convincentes

a

“infinita variedade” ruim.

Use módulos, células, rooms, grid ou abordagem compatível com a arquitetura atual.

==================================================
4. PROGRESSÃO ENTRE ANDARES
==================================================

O fluxo deve ser:

ANDAR 1
↓
matar todos os inimigos obrigatórios
↓
saída/liberação
↓
ANDAR 2
↓
matar todos
↓
saída
↓
ANDAR 3
↓
matar inimigos
↓
BOSS.

==================================================
INIMIGOS NÃO RESPAWNAM DURANTE O ANDAR
==================================================

Esta é uma mudança importante.

Durante uma visita à Torre:

INIMIGOS DERROTADOS NÃO DEVEM RESPAWNAR.

Enquanto o jogador permanece naquela run:

dead = dead.

Isso continua até:

- subir de andar;
- morrer;
- abandonar/retornar;
- iniciar nova run.

==================================================
OBJETIVO DO ANDAR
==================================================

O jogador precisa eliminar TODOS os inimigos daquele andar para liberar a progressão.

Pode existir contador:

INIMIGOS RESTANTES: X

ou equivalente.

Não precisa ser apresentação final.

==================================================
SAÍDA BLOQUEADA
==================================================

Enquanto ainda existirem inimigos vivos:

a subida para o próximo andar fica bloqueada.

Ao derrotar o último:

- feedback visual;
- feedback sonoro;
- saída liberada.

==================================================
5. IA DOS INIMIGOS — PRIMEIRO ANDAR
==================================================

No primeiro andar, os inimigos devem ser PASSIVOS.

Isso significa:

ELES NÃO INICIAM COMBATE.

Não atacam o jogador apenas porque ele chegou perto.

==================================================
ESTADO PASSIVO
==================================================

Antes de serem provocados:

os inimigos podem:

- ficar parados;
- andar;
- parar;
- mudar direção;
- olhar ao redor;
- vagar por pequena região;
- permanecer algum tempo ociosos.

Quero que pareçam criaturas existentes naquele espaço.

Não estátuas aguardando o Player.

==================================================
COMPORTAMENTO AMBIENTAL
==================================================

Crie algo equivalente a:

IDLE
↓
WANDER
↓
PAUSE
↓
TURN
↓
WANDER

com pequenas variações temporais.

Não precisa ser sofisticado.

==================================================
AGGRO POR PROVOCAÇÃO
==================================================

Um inimigo do primeiro andar só entra em combate após o jogador:

- atacá-lo;
- acertá-lo;
- ou provocar diretamente conforme regra inequívoca.

A proximidade sozinha NÃO basta.

==================================================
DEPOIS DE PROVOCADO
==================================================

Depois do primeiro ataque do jogador:

o inimigo utiliza a IA de combate já existente:

- perseguição;
- ataque;
- leash;
- targeting;
- demais comportamentos atuais.

Não construa uma segunda IA de combate.

==================================================
AGGRO INDIVIDUAL
==================================================

Por padrão:

acertar Slime A
não significa automaticamente que TODOS os Slimes do andar ataquem.

Cada inimigo possui estado próprio.

Se dois estiverem extremamente próximos e já houver mecanismo de aggro compartilhado no código, mantenha apenas se fizer sentido.

Mas a regra inicial desejada é:

PASSIVIDADE INDIVIDUAL.

==================================================
ANDAR 2 E 3
==================================================

Nesta iteração, os inimigos podem continuar utilizando a mesma lógica básica.

Não precisamos ainda criar comportamentos complexos por andar.

Porém, é aceitável aumentar:

- quantidade;
- composição;
- pressão;

nos andares superiores.

Sem rebalanceamento extremo.

==================================================
6. ESTRUTURA DOS TRÊS ANDARES
==================================================

ANDAR 1:
introdução.

Poucos inimigos.

Espaço mais simples.

Todos passivos até provocação.

ANDAR 2:
um pouco maior ou mais denso.

Mais inimigos.

Layout ligeiramente mais complexo.

ANDAR 3:
maior pressão.

Após eliminar inimigos comuns:

BOSS aparece/é liberado.

==================================================
7. BOSS PROVISÓRIO
==================================================

NÃO quero desenvolver ainda o boss definitivo.

Crie um BOSS DE TESTE.

Ele pode ser literalmente baseado no inimigo existente.

==================================================
CONCEITO
==================================================

Boss provisório:

“versão grande do Slime”

ou equivalente ao inimigo atual.

A finalidade é testar:

- boss health;
- boss flow;
- recompensa;
- conclusão da run.

Não é conteúdo final.

==================================================
BOSS — DIFERENÇAS
==================================================

Pode possuir:

- escala maior;
- HP maior;
- dano maior;
- modelo/sprite maior;
- boss health bar.

Evite criar dez habilidades exclusivas.

==================================================
BOSS SPAWN
==================================================

No Andar 3:

primeiro eliminar os inimigos normais.

Depois:

boss aparece ou fica disponível.

Fluxo:

normal enemies remaining > 0
→ boss não inicia.

remaining == 0
→ pequeno delay
→ boss encounter.

==================================================
BOSS HEALTH BAR
==================================================

Adicionar apresentação simples.

Pode usar:

BOSS
[████████████]

Placeholder é suficiente.

==================================================
8. MORTE DURANTE A RUN
==================================================

Se jogador morrer:

retorna ao Refúgio conforme regra atual.

HP/MP restaurados.

Itens permanentes já possuídos continuam.

==================================================
PROGRESSO TEMPORÁRIO DA RUN
==================================================

Ao morrer:

resetar:

- andar atual;
- inimigos da Torre;
- boss;
- layouts da run conforme decisão de seed;
- progresso daquela expedição.

Não retomar no meio do Andar 2 nesta versão.

==================================================
9. DERROTA DO BOSS
==================================================

Quando boss morrer:

dropa UM BAÚ.

Nesta iteração:

há apenas UM TIPO DE BAÚ.

Sem:

- raridade de baú;
- bronze/prata/ouro;
- tiers;
- qualidade.

Apenas:

BAÚ.

==================================================
10. BAÚ COMO ITEM
==================================================

Ao pegar o baú:

ele entra no INVENTÁRIO.

Deve existir como item real.

==================================================
FEEDBACK DE COLETA
==================================================

Quando Player coleta:

mostrar temporariamente algo equivalente a:

BAÚ OBTIDO

ou

+ BAÚ

Depois:

a mensagem desaparece.

Não deixar banner permanente.

==================================================
BAÚ NÃO ABRE NA TORRE
==================================================

Nesta primeira versão:

o baú só pode ser aberto no REFÚGIO.

Se tentar usar dentro da Torre:

informar:

“Abra este baú no Refúgio.”

ou equivalente.

==================================================
11. APÓS O BOSS
==================================================

Depois de coletar o baú:

a única progressão disponível nesta versão é:

VOLTAR AO REFÚGIO.

Não existe Andar 4.

==================================================
PORTAL / SAÍDA FINAL
==================================================

Depois da vitória:

liberar retorno.

Pode utilizar portal/saída equivalente.

==================================================
12. XP
==================================================

Agora o jogo precisa começar a utilizar XP como progressão real.

==================================================
GANHO DE XP
==================================================

Inimigos devem conceder XP.

Boss concede mais.

Valores são provisórios.

Colocar em configuração central.

Não espalhar números mágicos.

==================================================
QUANDO XP É RECEBIDO
==================================================

Defina regra simples.

Nesta iteração:

XP pode ser concedido imediatamente na morte do inimigo.

É aceitável.

==================================================
13. OURO
==================================================

Introduzir OURO como moeda do jogo.

Ouro precisa existir como recurso persistente do personagem.

==================================================
USO INICIAL DO OURO
==================================================

Nesta versão:

ouro é utilizado principalmente para:

UPAR ATRIBUTOS.

Não crie economia completa.

Não altere loja gratuita do Armeiro ainda, salvo necessidade explícita.

==================================================
GANHO DE OURO
==================================================

Nesta iteração:

a principal fonte pode ser:

ABERTURA DE BAÚ.

Se quiser que inimigos concedam pequenas quantidades, só faça se isso já tiver sido previsto em configuração clara.

Não é obrigatório.

==================================================
14. LEVEL DO PERSONAGEM
==================================================

No Refúgio:

adicionar primeiro sistema real de evolução de atributos.

O jogador pode gastar:

XP
+
OURO

para evoluir.

==================================================
IMPORTANTE:
LEVEL ≠ CLASSE
==================================================

Aumentar level NÃO transforma Novato em Guerreiro/Arqueiro/etc.

O personagem continua:

NOVATO.

Classes continuam fora desta iteração.

==================================================
15. ATRIBUTOS QUE PODEM SER EVOLUÍDOS
==================================================

Utilize os atributos que já existem no sistema atual.

NÃO invente 20 novos stats.

Audite:

- HP;
- MP;
- ataque físico;
- ataque mágico;
- defesa;
- defesa mágica;
- velocidade, se já apropriada;
- demais stats atuais.

==================================================
INTERFACE DE LEVEL UP
==================================================

No Refúgio:

crie interface simples.

Pode ser acessada por:

NPC placeholder
ou
painel provisório.

Não precisamos de arte final.

==================================================
CUSTO
==================================================

Aumentar atributo custa:

XP
+
OURO.

Coloque a fórmula em configuração central.

Exemplo conceitual:

nextUpgradeXpCost
nextUpgradeGoldCost

Não hardcode valores em UI.

==================================================
LEVEL GERAL
==================================================

Defina se cada compra:

A) aumenta o level geral;

ou

B) pontos acumulados determinam level.

Escolha a solução mais simples e coerente com o sistema atual.

Documente.

==================================================
NÃO CRIAR BUILD SYSTEM COMPLEXO
==================================================

Nesta versão:

o objetivo é validar:

matar
→ ganhar recursos
→ voltar
→ ficar mais forte.

Não precisamos ainda:

- respec;
- caps sofisticados;
- soft caps;
- diminishing returns;
- árvores de atributo complexas.

==================================================
16. ABRINDO O BAÚ
==================================================

Esta é uma parte importante da experiência.

O baú deve ser aberto pelo INVENTÁRIO no Refúgio.

==================================================
FLUXO
==================================================

Inventário
↓
seleciona Baú
↓
ABRIR
↓
abre interface de recompensa
↓
role uma RROLETA HORIZONTAL
↓
jogador pressiona ESPAÇO
↓
roleta começa a desacelerar
↓
para
↓
item escolhido
+
ouro
↓
recompensa adicionada.

==================================================
17. ROLETA HORIZONTAL
==================================================

Quero uma pequena apresentação semelhante a uma esteira/roleta horizontal.

Visual:

[item][item][item][item][item][item][item]

Os itens se deslocam horizontalmente.

Existe um indicador central.

==================================================
INÍCIO
==================================================

Ao abrir o baú:

a roleta começa a girar.

Itens passam:

direita → esquerda

ou equivalente.

==================================================
INPUT
==================================================

O jogador pressiona:

ESPAÇO.

Depois disso:

a roleta NÃO para instantaneamente.

Ela começa a desacelerar.

==================================================
DESACELERAÇÃO
==================================================

Movimento:

rápido
→
médio
→
lento
→
para.

O item alinhado com o indicador central é:

A RECOMPENSA.

==================================================
RESULTADO NÃO DEVE SER DECIDIDO VISUALMENTE POR FPS
==================================================

IMPORTANTE:

não faça o resultado depender de:

“qual frame estava no meio quando apertou Espaço”.

Defina o resultado de forma lógica/determinística antes ou no momento apropriado.

Depois:

a animação apenas converge visualmente para o resultado.

Isso evita:

- inconsistência por FPS;
- manipulação por lag;
- resultados diferentes entre máquinas.

==================================================
RNG
==================================================

Utilize RNG controlável.

Idealmente associado à run/baú.

Se houver seed:

resultado pode ser reproduzível em debug.

==================================================
18. POOL DE ITENS
==================================================

Para esta primeira versão:

pode haver um pool PEQUENO de itens.

Não crie centenas.

==================================================
ITENS DO BAÚ
==================================================

A recompensa pode ser:

- arma existente;
- equipamento placeholder para slots já preparados;
- ou poucos itens novos simples.

Como o sistema já possui slots de:

head
chest
legs
boots
ring
necklace
talisman

é aceitável começar a introduzir alguns itens simples.

==================================================
MAS NÃO IMPLEMENTAR SISTEMA DE RARIDADE AINDA
==================================================

Por enquanto:

SEM RARIDADE.

Todos os itens pertencem ao mesmo nível qualitativo básico.

Não implementar:

common
rare
epic
legendary.

==================================================
19. OURO DO BAÚ
==================================================

Além do item:

o jogador recebe uma quantidade de OURO.

Apresentar claramente:

ITEM OBTIDO:
X

OURO:
+Y

==================================================
20. INVENTÁRIO CHEIO
==================================================

Esse caso precisa ser tratado.

Se inventário estiver cheio:

NÃO perca a recompensa.

Escolha uma solução segura.

Preferência simples:

não permitir abrir o baú até existir espaço para o item.

Mostrar:

“Libere um espaço no inventário.”

==================================================
21. CONSUMO DO BAÚ
==================================================

O baú só é consumido quando a recompensa for efetivamente concedida.

Não remova o baú antes de validar:

- espaço;
- estado;
- recompensa.

==================================================
22. SAVE / PERSISTÊNCIA
==================================================

Passam a ser persistentes:

- XP;
- ouro;
- level;
- melhorias de atributos;
- itens recebidos;
- baús no inventário;
- equipamentos;
- habilidades conhecidas.

==================================================
NÃO PERSISTIR
==================================================

Não persistir no meio de uma run:

- inimigos vivos;
- mapa procedural;
- andar atual;
- boss HP;
- projéteis;
- aggro.

Ao recarregar:

começa no Refúgio.

==================================================
23. ESTADO DE RUN
==================================================

Crie uma estrutura explícita para a expedição atual.

Algo conceitualmente como:

runState = {
    seed,
    floor,
    floors,
    enemiesRemaining,
    bossDefeated,
    rewardCollected
}

Não precisa usar exatamente isso.

==================================================
24. CICLO DE VIDA DA RUN
==================================================

START RUN
→ gerar seed
→ gerar Andar 1
→ jogar
→ Andar 2
→ Andar 3
→ boss
→ reward
→ return
→ END RUN.

Ao morrer:

END RUN FAILURE.

==================================================
25. MAPA PROCEDURAL E INIMIGOS
==================================================

Enemy spawns precisam acontecer apenas em posições válidas.

Não permitir:

- dentro de parede;
- dentro de obstáculo;
- sobre outro inimigo;
- fora do mapa;
- inacessível.

==================================================
26. PASSIVIDADE E MOVIMENTO
==================================================

Os inimigos passivos precisam continuar parecendo vivos.

Use timers aleatórios determinísticos ou pseudoaleatórios para:

- caminhar;
- parar;
- virar;
- ficar parado.

Não sincronizar todos.

==================================================
27. LEASH
==================================================

Depois de provocado:

preserve leash atual.

Se desistir do Player:

defina se volta a PASSIVE ou ALERT/IDLE.

Para o primeiro andar, preferência:

retorna gradualmente ao PASSIVE.

==================================================
28. BOSS NÃO É PASSIVO
==================================================

O boss é encontro explícito.

Quando inicia:

entra em combate normalmente.

Não precisa esperar Player atacá-lo.

==================================================
29. PORTAL DO REFÚGIO
==================================================

Preserve requisito:

ARMA EQUIPADA.

Sem arma:

não entra na Torre.

==================================================
30. PRIMEIROS PASSOS — CONCLUSÃO
==================================================

A missão inicial deve ser revisada para acompanhar o novo fluxo.

Não precisa cobrir TODA a run.

Pode continuar focada em:

- Armeiro;
- arma;
- equipar;
- habilidade;
- entrar na Torre;
- derrotar inimigos;
- voltar.

Mas ajuste os critérios para o sistema de andares.

==================================================
31. PRIMEIRA JOGATINA
==================================================

O objetivo desta Iteração 07 é que uma pessoa possa entrar sem conhecimento e entender:

“pego arma”
→
“entro na torre”
→
“mato monstros”
→
“subo”
→
“chego ao boss”
→
“pego loot”
→
“volto”
→
“fico mais forte”
→
“posso entrar novamente”.

Esse loop precisa ser legível sem documentação externa.

==================================================
32. HUD DA TORRE
==================================================

Mostrar apenas informação útil.

Algo como:

ANDAR 1
INIMIGOS: 4/6

ou

RESTANTES: 2.

No boss:

BOSS HP.

==================================================
33. HUD DE RECURSOS
==================================================

Adicionar apresentação simples para:

- level;
- XP;
- ouro.

Não redesenhar toda UI.

==================================================
34. ÁUDIO/VFX
==================================================

Placeholder é suficiente.

Feedback necessário para:

- subir andar;
- concluir andar;
- spawn boss;
- matar boss;
- coletar baú;
- abrir baú;
- resultado da roleta;
- ouro recebido;
- atributo evoluído.

==================================================
35. TESTES — GERAÇÃO PROCEDURAL
==================================================

Adicionar testes para:

- mesma seed → mesmo mapa;
- seeds diferentes → possibilidade de mapas diferentes;
- spawn válido;
- exit alcançável;
- inimigos em posições válidas;
- nenhuma geometria impossível;
- três andares geráveis.

==================================================
36. TESTES — INIMIGOS
==================================================

Testar:

- não atacam antes de provocação;
- vagam;
- param;
- viram;
- aggro após ataque;
- morte reduz contador;
- não respawnam durante run;
- conclusão libera saída.

==================================================
37. TESTES — ANDARES
==================================================

Testar:

Andar 1 concluído
→ Andar 2.

Andar 2
→ Andar 3.

Andar 3 enemies cleared
→ boss.

Boss morto
→ baú.

==================================================
38. TESTES — BAÚ
==================================================

Testar:

- drop;
- pickup;
- inventário;
- mensagem;
- persistência;
- só abre no Refúgio;
- inventário cheio;
- roleta;
- resultado;
- consumo;
- item recebido;
- ouro recebido.

==================================================
39. TESTES — XP / OURO / LEVEL
==================================================

Testar:

- ganho XP;
- ganho ouro;
- save/load;
- custo;
- sem recursos suficientes;
- upgrade;
- stats atualizados;
- não acumular bônus incorretamente.

==================================================
40. TESTES — MORTE
==================================================

Testar morte:

Andar 1;
Andar 2;
Andar 3;
Boss.

Sempre:

→ Refúgio
→ HP/MP restaurados
→ progressão permanente preservada
→ run encerrada.

==================================================
41. PLAYTEST MANUAL
==================================================

Depois de implementar:

faça uma run completa no navegador.

COMECE COM PERSONAGEM NOVO.

Não utilize debug para pular passos.

==================================================
PLAYTEST OBRIGATÓRIO
==================================================

Fluxo:

1. entrar;
2. ler Primeiros passos;
3. testar movimento/câmera;
4. falar Armeiro;
5. pegar arma;
6. equipar;
7. aprender habilidade;
8. entrar na Torre;
9. explorar procedural;
10. provocar inimigo;
11. confirmar passividade dos outros;
12. matar todos;
13. subir;
14. concluir Andar 2;
15. concluir inimigos do 3;
16. derrotar boss;
17. pegar baú;
18. voltar ao Refúgio;
19. abrir inventário;
20. abrir baú;
21. rodar roleta;
22. apertar Espaço;
23. receber item;
24. receber ouro;
25. usar XP + ouro em atributo;
26. confirmar stat alterado;
27. salvar;
28. recarregar;
29. confirmar persistência.

==================================================
42. NÃO IMPLEMENTAR NESTA ITERAÇÃO
==================================================

NÃO implementar ainda:

- classes jogáveis;
- troca Novato → classe;
- quests de classe;
- segundo bioma;
- boss definitivo;
- múltiplos bosses;
- raridades;
- qualidade de baús;
- affixes;
- crafting;
- vendedor real;
- economia complexa;
- mercado;
- multiplayer;
- perguntas educacionais;
- 13 semanas completas;
- progressão final da árvore;
- drop individual complexo de monstros;
- procedural infinito.

==================================================
43. PRIORIDADES
==================================================

Se precisar reduzir escopo:

1. loop completo;
2. procedural robusto;
3. inimigos passivos funcionais;
4. três andares;
5. boss;
6. baú;
7. retorno;
8. XP/ouro;
9. upgrade;
10. roleta;
11. polish.

Não sacrifique estabilidade para efeitos cosméticos.

==================================================
44. CRITÉRIOS DE ACEITAÇÃO
==================================================

A Iteração 07 só está concluída quando:

[ ] personagem novo começa corretamente;

[ ] Primeiros passos aparece;

[ ] Armeiro funciona;

[ ] arma é necessária;

[ ] Portal funciona;

[ ] Torre gera Andar 1 procedural;

[ ] mapa é atravessável;

[ ] inimigos vagam passivamente;

[ ] inimigos não atacam primeiro;

[ ] atacar provoca;

[ ] inimigos mortos não respawnam na run;

[ ] matar todos libera progressão;

[ ] Andar 2 funciona;

[ ] Andar 3 funciona;

[ ] boss provisório aparece;

[ ] boss pode ser derrotado;

[ ] boss dropa baú;

[ ] baú entra no inventário;

[ ] retorno ao Refúgio funciona;

[ ] XP existe;

[ ] ouro existe;

[ ] atributos podem ser melhorados;

[ ] baú pode ser aberto no Refúgio;

[ ] roleta horizontal aparece;

[ ] Espaço inicia desaceleração;

[ ] roleta para corretamente;

[ ] recompensa é determinística do ponto de vista lógico;

[ ] item entra no inventário;

[ ] ouro é concedido;

[ ] baú é consumido;

[ ] save/load preserva progressão permanente;

[ ] morrer reinicia run;

[ ] fluxo completo funciona sem debug.

==================================================
45. ENTREGA FINAL
==================================================

Ao finalizar, entregue relatório contendo:

1. LOOP COMPLETO
Descrição da primeira jogatina.

2. PROCEDURAL
Algoritmo utilizado, seed e garantias.

3. ANDARES
Diferenças entre 1, 2 e 3.

4. IA PASSIVA
Estados e transições.

5. BOSS
Implementação provisória.

6. XP
Fontes e valores provisórios.

7. OURO
Fontes e uso.

8. LEVEL UP
Custos e atributos disponíveis.

9. BAÚ
Item, pickup e persistência.

10. ROLETA
Funcionamento lógico e visual.

11. LOOT POOL
Itens possíveis atualmente.

12. SAVE
Novos campos persistentes.

13. TESTES
Quantidade e resultados.

14. PLAYTEST
Resultado da run manual completa.

15. LIMITAÇÕES
O que continua provisório.

==================================================
OBJETIVO FINAL
==================================================

No final da Iteração 07, Dungeon Master precisa finalmente ter um loop que faça sentido como jogo:

REFÚGIO
→
PREPARAÇÃO
→
TORRE
→
COMBATE
→
SUBIR
→
COMBATE
→
SUBIR
→
BOSS
→
BAÚ
→
REFÚGIO
→
ABRIR RECOMPENSA
→
GANHAR ITEM + OURO
→
EVOLUIR
→
ENTRAR NOVAMENTE.

A sensação que quero validar é:

“eu entro na Torre para ficar mais forte e volto ao Refúgio para transformar aquilo em progressão permanente.”

Não considere esta tarefa concluída apenas porque cada sistema funciona isoladamente.

O LOOP COMPLETO precisa funcionar de ponta a ponta.