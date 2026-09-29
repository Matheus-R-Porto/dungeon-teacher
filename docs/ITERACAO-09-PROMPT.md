# DUNGEON MASTER — BETA 0.1.0
# ITERAÇÃO 09 — A TORRE COMO AVENTURA
## Exploração, regiões, caminhos, encontros e andares maiores

Continue o desenvolvimento da implementação atual de Dungeon Master.

A Iteração 08 está concluída.

Preserve o loop funcional existente:

REFÚGIO
→ preparação
→ Torre
→ Andar 1
→ Andar 2
→ Andar 3
→ Boss
→ Baú
→ Refúgio
→ recompensa
→ progressão
→ nova expedição.

A Iteração 09 NÃO deve adicionar classes, novo bioma, conteúdo educacional ou sistemas econômicos complexos.

O objetivo desta iteração é transformar os atuais andares relativamente compactos em:

# PEQUENAS AVENTURAS EXPLORÁVEIS.

A pergunta desta iteração é:

> “Entrar em um andar da Torre parece entrar em um lugar para explorar?”

---

# 1. PRINCÍPIO CENTRAL

NÃO aumentar simplesmente as dimensões atuais e espalhar monstros pelo espaço.

Um mapa grande e vazio NÃO é uma aventura.

Cada andar precisa possuir:

- começo;
- progressão espacial;
- caminhos;
- decisões;
- encontros;
- desvios;
- pontos de interesse;
- sensação de descoberta;
- conclusão.

O jogador deve sentir que:

> “Atravessei um lugar.”

e não apenas:

> “Andei por uma arena maior.”

---

# 2. AUDITORIA

Antes de modificar código:

1. ler implementação atual;
2. executar todos os testes;
3. confirmar os 231 testes atuais ou número equivalente;
4. jogar uma run atual;
5. medir duração aproximada dos três andares;
6. confirmar FloorGenerator;
7. confirmar EncounterGenerator;
8. confirmar seed;
9. confirmar navegação;
10. confirmar LOS;
11. confirmar IA passiva;
12. confirmar transições;
13. confirmar boss;
14. confirmar morte;
15. confirmar save/load.

Somente depois alterar o procedural.

---

# 3. PRESERVAR SISTEMAS EXISTENTES

Não reescrever sem necessidade:

- Character;
- Stats;
- Inventory;
- Equipment;
- Skill Tree;
- Espaços de Habilidade;
- AbilityRuntime;
- Combat;
- Projectiles;
- EnemyAI;
- RunState;
- AreaSession;
- Reward Reel;
- Loot;
- XP;
- Level;
- Save;
- Primeiros Passos;
- câmera;
- controles.

Esta é principalmente uma iteração de:

# WORLD / FLOOR DESIGN / EXPLORATION.

---

# 4. NOVA ESCALA DOS ANDARES

Os três andares devem ficar:

# BEM MAIORES.

Não apenas 20% maiores.

O jogador deve perceber claramente que entrou em uma área explorável.

Entretanto:

NÃO definir o tamanho apenas por largura × altura.

A métrica importante é:

- distância percorrida;
- quantidade de regiões;
- quantidade de decisões;
- encontros;
- desvios;
- tempo de exploração.

---

# 5. META DE DURAÇÃO

Não precisamos alcançar ainda os ~8 minutos definitivos por andar do projeto completo.

Nesta iteração, usar como objetivo inicial:

## aproximadamente 4–6 minutos por andar

para um jogador novo explorando normalmente.

Isso é META DE PLAYTEST.

Não implementar cronômetro artificial.

Não adicionar paredes invisíveis para atrasar.

Não aumentar duração apenas adicionando HP aos inimigos.

Queremos ganhar tempo através de:

# exploração.

---

# 6. ANDAR COMO GRAFO DE REGIÕES

Antes de construir geometria, gerar uma estrutura lógica do andar.

Algo conceitualmente equivalente a:

FloorGraph

com:

- regiões;
- conexões;
- caminho principal;
- bifurcações;
- regiões opcionais;
- entrada;
- saída;
- encontros;
- pontos de interesse.

Não precisa utilizar exatamente esses nomes.

---

# 7. REGIÕES

Um andar deve ser composto por várias regiões conectadas.

Exemplos conceituais:

- clareira;
- corredor natural;
- passagem estreita;
- área com árvores;
- ruínas;
- pequeno campo;
- bifurcação;
- enclave opcional;
- arena de encontro;
- área da saída.

Continuamos no:

# BIOMA FLORESTA.

Não criar Cave/Mines ainda.

---

# 8. NÃO FAZER SALAS QUADRADAS REPETIDAS

Evitar resultado visual:

[quadrado]
→ corredor
→ [quadrado]
→ corredor
→ [quadrado]

O mundo deve continuar parecendo um ambiente natural.

As regiões são uma ferramenta lógica.

Visualmente podem ser:

- clareiras irregulares;
- caminhos;
- árvores;
- pedras;
- ruínas;
- elevações visuais simples;
- vegetação;
- obstáculos.

---

# 9. CAMINHO PRINCIPAL

Todo andar deve possuir um caminho principal garantido:

ENTRADA
→ progressão
→ encontros necessários
→ região final
→ SAÍDA.

Esse caminho deve ser sempre:

- válido;
- atravessável;
- navegável;
- possível para Player;
- possível para inimigos quando apropriado.

---

# 10. CAMINHO NÃO PRECISA SER RETO

Evitar:

spawn
→ corredor reto
→ saída.

O caminho pode:

- virar;
- contornar obstáculos;
- atravessar regiões;
- passar por gargalos;
- abrir em clareiras;
- oferecer bifurcações.

---

# 11. BIFURCAÇÕES

Cada andar deve possuir pelo menos alguma oportunidade de escolha espacial.

Exemplo:

            caminho principal
                  |
        ┌─────────┴─────────┐
        |                   |
      desvio             continuação
        |                   |
   encontro/POI          progresso
        |
      retorno

Não é necessário que todo desvio tenha recompensa poderosa.

O objetivo inicial é criar:

> “O que será que tem ali?”

---

# 12. ÁREAS OPCIONAIS

Algumas regiões NÃO precisam ser visitadas para terminar o andar.

Podem conter:

- inimigos opcionais;
- pequeno ponto de interesse;
- cenário diferente;
- futuro espaço de recurso;
- futuro segredo;
- futuro baú secundário.

Nesta iteração:

NÃO implementar sistemas completos para todas essas possibilidades.

Mas o mapa deve começar a possuir lugares onde elas poderão existir.

---

# 13. NOVA REGRA DE PROGRESSÃO

REMOVER a regra:

> “Todos os inimigos do mapa precisam morrer para liberar a saída.”

Isso funcionava nas arenas pequenas.

Não funciona em mapas grandes.

---

# 14. INIMIGOS OPCIONAIS

Agora podem existir inimigos que:

- vivem em regiões opcionais;
- podem nunca ser encontrados;
- podem ser evitados;
- podem ser enfrentados por XP.

Não derrotá-los NÃO impede necessariamente a conclusão do andar.

---

# 15. ENCONTROS OBRIGATÓRIOS

O caminho principal pode possuir alguns:

# ENCONTROS OBRIGATÓRIOS.

Esses encontros controlam a progressão.

Exemplo:

Player entra numa clareira importante.

Existem:

- 2 Slimes comuns;
- 1 Saltador.

Para continuar pelo caminho principal:

o encontro precisa ser resolvido.

---

# 16. ENCONTRO ≠ TODO O ANDAR

Um encontro possui seu próprio conjunto de inimigos.

Quando todos os inimigos daquele encontro obrigatório forem derrotados:

o caminho correspondente é liberado.

Outros inimigos do andar permanecem independentes.

---

# 17. CONTROLE DE PROGRESSÃO

Criar conceito genérico equivalente a:

EncounterGate

ou:

ProgressionGate

ou estrutura melhor compatível com o projeto.

Não hardcodar:

if floor == 1 && slimeCount == 3.

O sistema deve entender:

- encontro;
- inimigos pertencentes ao encontro;
- estado;
- condição concluída;
- gate associado.

---

# 18. GATES NATURAIS

O bloqueio não precisa parecer uma porta de videogame futurista.

No bioma Floresta pode ser placeholder como:

- barreira mágica;
- raízes;
- névoa;
- energia;
- passagem bloqueada.

Arte definitiva NÃO é prioridade.

Precisamos apenas comunicar:

> “Resolva este encontro para continuar.”

---

# 19. NÃO TRANCAR O JOGADOR SEM NECESSIDADE

Nem todo encontro precisa fechar o jogador numa arena.

Preferir integração natural com o mapa.

Use bloqueios apenas quando necessários para garantir progressão.

Não transformar todos os caminhos em:

entra
→ parede fecha
→ mata
→ parede abre.

---

# 20. ENCONTROS OPCIONAIS

Também suportar encontros sem gate.

Exemplo:

desvio
→ grupo de Slimes
→ jogador pode lutar ou sair.

Isso será importante para:

- XP;
- exploração;
- recursos futuros;
- loot futuro.

---

# 21. PASSIVIDADE DOS INIMIGOS

Preservar comportamento atual.

Inimigos normais continuam:

- vivendo no ambiente;
- idle;
- wander;
- pause;
- turn;
- passivos antes da provocação.

Não transformar o novo mapa em corredor cheio de inimigos automaticamente agressivos.

---

# 22. SENSAÇÃO DE VIDA

Distribuir inimigos de maneira contextual.

Evitar:

Slime a cada exatamente 10 metros.

Algumas regiões podem ter:

- nenhum inimigo;
- um inimigo;
- pequeno grupo;
- encontro.

O silêncio entre encontros também faz parte da aventura.

---

# 23. POPULAÇÃO CONTROLADA

NÃO aumentar drasticamente a quantidade total de inimigos só porque o mapa ficou maior.

Preferir:

espaço
→ exploração
→ encontro significativo
→ espaço
→ decisão
→ outro encontro.

Não:

50 Slimes espalhados.

---

# 24. IDENTIDADE DOS ANDARES

Os três andares continuam Floresta.

Mas devem possuir diferenças perceptíveis.

---

# 25. ANDAR 1 — BORDA DA FLORESTA

Sensação:

entrada na Torre.

Mais aberto.

Mais legível.

Menos bifurcações.

Predomínio:

- Slime comum;
- poucos encontros;
- exploração simples.

Objetivo:

ensinar que o jogador agora precisa:

# seguir pelo mundo.

---

# 26. ANDAR 2 — FLORESTA MAIS DENSA

Sensação:

estamos entrando mais fundo.

Mais:

- árvores;
- pedras;
- caminhos estreitos;
- bifurcações;
- cobertura.

Introduzir mais presença de:

Slime Saltador.

Pode possuir:

- rota principal;
- um desvio opcional relevante.

---

# 27. ANDAR 3 — CORAÇÃO DA FLORESTA

Sensação:

região mais perigosa.

Mais:

- ruínas;
- vegetação;
- cobertura;
- caminhos menos diretos;
- Slime Mágico;
- encontros mistos.

O caminho culmina na região do:

# SLIME GUARDIÃO.

---

# 28. BOSS COMO DESTINO

O boss não deve simplesmente aparecer no mesmo espaço genérico depois de matar inimigos.

O Andar 3 deve conduzir espacialmente até:

# uma região de boss.

Exemplo:

floresta
→ ruínas
→ passagem
→ grande clareira
→ Guardião.

O jogador deve perceber:

> “Cheguei em algum lugar importante.”

---

# 29. BOSS

Preservar Slime Guardião atual.

NÃO criar boss novo.

NÃO adicionar dez habilidades.

Podem ser feitos pequenos ajustes de apresentação necessários para a nova arena.

A prioridade é:

# jornada até o boss.

---

# 30. SAÍDA DOS ANDARES

A saída deve existir fisicamente no mundo.

Pode ser:

- portal;
- passagem;
- escadaria;
- estrutura mágica.

Deve ser visualmente reconhecível.

Não depender apenas de texto na HUD.

---

# 31. DESCOBERTA DA SAÍDA

O jogador não precisa necessariamente enxergar a saída do spawn.

Idealmente:

precisa atravessar parte significativa do andar para encontrá-la.

Não esconder de maneira frustrante.

---

# 32. ORIENTAÇÃO SEM MINIMAPA COMPLEXO

NÃO implementar minimapa completo ainda.

Usar world design.

Exemplos:

- caminhos;
- iluminação;
- estruturas;
- abertura da vegetação;
- marcos visuais;
- ruínas;
- portal visível ao entrar na região final.

O jogador deve conseguir construir uma noção básica de direção.

---

# 33. LANDMARKS

Adicionar conceito simples de:

# LANDMARK.

Uma região pode possuir algo visualmente distinto.

Exemplos:

- árvore enorme;
- pedra rúnica;
- ruína;
- lago/poça placeholder;
- estátua quebrada;
- formação rochosa;
- cristal;
- tronco caído.

Não precisam possuir gameplay ainda.

Servem para:

- orientação;
- memória espacial;
- personalidade.

---

# 34. VARIAÇÃO PROCEDURAL

Seed deve determinar:

- FloorGraph;
- seleção de regiões;
- conexões permitidas;
- obstáculos;
- landmarks;
- encounters;
- inimigos;
- posições.

Mas respeitando regras de design.

---

# 35. PROCEDURAL CONTROLADO

Não buscar:

“qualquer coisa pode acontecer.”

Buscar:

“cada seed produz uma aventura válida dentro de regras.”

Preferir:

100 bons mapas possíveis

a

1 milhão de mapas ruins.

---

# 36. TEMPLATES DE REGIÃO

É aceitável utilizar templates/módulos.

Exemplo:

- clearing_small;
- clearing_large;
- forest_path;
- ruins;
- fork;
- narrow_pass;
- optional_pocket;
- encounter_clearing;
- exit_region;
- boss_clearing.

Cada template pode aceitar variações internas.

Isso é preferível a aleatoriedade sem estrutura.

---

# 37. CONECTIVIDADE

A geração deve garantir:

entrada
→ saída.

Também garantir:

- encontros obrigatórios alcançáveis;
- gates coerentes;
- áreas opcionais conectadas;
- nenhum jogador preso;
- nenhum inimigo obrigatório inacessível.

---

# 38. VALIDAÇÃO DO FLOORGRAPH

Antes de materializar/renderizar o andar:

validar estrutura lógica.

Exemplos:

- exatamente uma entrada;
- saída válida;
- caminho principal existente;
- nenhuma região obrigatória desconectada;
- boss region válida no Floor 3;
- optional regions retornam/conectam corretamente.

Falha:

regenerar deterministicamente com estratégia/fallback controlado.

Não criar loop infinito de geração.

---

# 39. VALIDAÇÃO FÍSICA

Depois da materialização:

validar também navegação real.

Usar A* existente quando apropriado.

Garantir que geometria não destruiu conectividade lógica.

---

# 40. BACKTRACKING

Desvios opcionais devem permitir retorno.

Não gerar:

entra no desvio
→ fica preso.

O jogador deve poder voltar ao caminho principal.

---

# 41. CÂMERA

Preservar câmera livre atual.

Testar novos ambientes com:

- árvores;
- obstáculos;
- regiões estreitas.

Evitar geometria constantemente cobrindo Player.

Não iniciar ainda sistema sofisticado de transparência de paredes, salvo correção pequena indispensável.

---

# 42. ÁRVORES E OBSTÁCULOS

Como o jogo utiliza câmera isométrica rotacionável:

posicionar elementos altos com cuidado.

Não criar floresta tão densa que o Player desapareça atrás da geometria constantemente.

Floresta densa deve ser comunicada também por:

- bordas;
- vegetação baixa;
- distribuição;
- sombras/placeholder;
- pedras;
- caminhos.

---

# 43. EXPLORAÇÃO E XP

Inimigos opcionais continuam concedendo XP normalmente.

Isso cria decisão:

rota rápida
versus
explorar e lutar mais.

Não adicionar bônus artificial por “100% do mapa”.

---

# 44. NÃO RECOMPENSAR EXTERMÍNIO TOTAL

Não criar nesta iteração:

“Mate 100% para ganhar bônus.”

Queremos abandonar a expectativa de que todo andar precisa ser limpo completamente.

---

# 45. ROTA PRINCIPAL E ROTA EXPLORATÓRIA

Idealmente:

um jogador focado pode seguir a rota principal.

Um jogador curioso pode:

- desviar;
- encontrar inimigos;
- explorar landmarks;
- obter XP adicional;
- retornar.

Isso já cria estilos diferentes de jogar.

---

# 46. PONTOS DE INTERESSE

Criar infraestrutura leve para:

PointOfInterest

ou equivalente.

Tipos atuais podem ser apenas:

- landmark;
- optionalEncounter;
- futureResource;
- futureTreasure.

Não implementar recursos/tesouros futuros de verdade se não forem necessários.

O objetivo é preparar regiões semanticamente interessantes.

---

# 47. SEM BAÚ SECUNDÁRIO AINDA

Nesta iteração:

manter o baú real de recompensa ligado ao boss.

Não adicionar múltiplos baús abríveis.

Isso será importante quando o sistema educacional for implementado.

Áreas opcionais podem preparar locais para futuros baús sem concedê-los agora.

---

# 48. SEM LIFE SKILLS AINDA

Não implementar:

- pesca;
- mineração;
- coleta.

Mas é aceitável reservar POIs futuros como dados.

Não criar UI ou recursos funcionais.

---

# 49. HUD DA TORRE

Remover dependência de:

INIMIGOS RESTANTES NO ANDAR.

Agora mostrar informação contextual.

Exemplo:

ANDAR 2

Objetivo:
ATRAVESSE A FLORESTA

Quando encontro obrigatório ativo:

ENCONTRO
2 inimigos restantes

Depois:

CAMINHO LIBERADO

Não mostrar contador de todos os monstros opcionais do mapa.

---

# 50. FEEDBACK DE ENCONTRO

Ao concluir encontro obrigatório:

feedback simples:

CAMINHO LIBERADO

ou equivalente.

Pode haver:

- pequeno VFX;
- som placeholder;
- gate desaparecendo/abrindo.

Não exagerar.

---

# 51. PRIMEIROS PASSOS

Preservar onboarding atual.

Adaptar qualquer texto que diga:

“Derrote todos os inimigos do andar.”

Agora deve comunicar algo como:

“Explore a Torre e avance pelo andar.”

Não transformar onboarding em tutorial longo.

---

# 52. RUNSTATE

Atualizar RunState para representar:

- andar atual;
- FloorGraph atual;
- encontros;
- encontros concluídos;
- boss;
- recompensa;
- seed.

Mas:

NÃO persistir a run entre sessões.

Reload continua retornando ao Refúgio.

---

# 53. FUTURA PERSISTÊNCIA DOS ANDARES

Preservar decisão arquitetural:

FloorGenerator separado de RunState.

Nesta versão:

layout continua pertencendo somente à run.

Futuramente:

andar descoberto será persistido para aquele personagem.

NÃO implementar isso agora.

Apenas não acoplar geração ao descarte permanente.

---

# 54. MORTE

Preservar:

morte
→ encerra run
→ Refúgio
→ HP/MP restaurados
→ progressão permanente preservada.

Nenhuma mudança econômica ainda.

---

# 55. ABANDONAR RUN

Preservar forma existente de abandonar/retornar quando apropriado.

Não exigir morte para sair.

Se abandonar:

run termina.

---

# 56. PERFORMANCE

Mapas ficarão muito maiores.

Portanto:

não renderizar/simular ingenuamente centenas de elementos caros.

Mas NÃO iniciar grande otimização prematura.

Medir primeiro.

Avaliar:

- quantidade de geometria;
- pathfinding;
- inimigos ativos;
- draw calls quando disponível;
- FPS;
- geração.

---

# 57. SIMULAÇÃO DE INIMIGOS

Mesmo com mapa grande:

não precisamos de dezenas de inimigos simultâneos.

Manter população controlada.

Se arquitetura atual naturalmente atualiza todos os poucos inimigos, tudo bem.

Não implementar sistema complexo de streaming/chunks sem necessidade medida.

---

# 58. TEMPO DE GERAÇÃO

Floor generation deve permanecer rápida.

Medir aproximadamente:

- FloorGraph;
- materialização;
- validação;
- renderização inicial.

Não aceitar travamento longo para gerar um andar simples.

---

# 59. TESTES — FLOORGRAPH

Adicionar testes para muitas seeds:

- entrada existe;
- saída existe;
- caminho principal existe;
- número mínimo de regiões;
- regiões opcionais válidas;
- nenhuma região obrigatória desconectada;
- Floor 3 possui boss region;
- Floor 1 não possui boss;
- grafo determinístico para mesma seed;
- seeds diferentes podem gerar estruturas diferentes.

---

# 60. TESTES — NAVEGAÇÃO

Para várias seeds:

- Player alcança encontro obrigatório;
- Player alcança saída;
- Player entra e sai de região opcional;
- boss é alcançável;
- gates não criam deadlock;
- inimigos obrigatórios são alcançáveis;
- geometria não bloqueia caminho lógico.

---

# 61. TESTES — ENCONTROS

Testar:

- encontro obrigatório inicia corretamente;
- inimigos corretos pertencem ao encontro;
- inimigo opcional NÃO conta;
- derrotar parte não conclui;
- derrotar todos do encontro conclui;
- gate libera;
- conclusão acontece uma vez;
- save permanente não recebe estado temporário do encontro;
- morte limpa estado;
- próxima run cria encontros novos.

---

# 62. TESTES — INIMIGOS OPCIONAIS

Testar:

- podem permanecer vivos;
- saída ainda pode ser alcançada;
- não impedem mudança de andar;
- concedem XP se derrotados;
- não reaparecem durante run.

---

# 63. TESTES — SEED

Mesma:

runSeed + floor

deve reproduzir:

- grafo;
- templates;
- landmarks;
- encounters;
- spawns;
- geometria relevante.

Separar RNGs quando necessário para evitar que adicionar decoração altere completamente a composição de inimigos.

Preferir streams/derivações independentes para:

- topology;
- geometry;
- encounters;
- decoration;
- enemy ambient behavior.

---

# 64. TESTES — REGRESSÃO

Todos os sistemas da Iteração 08 devem continuar funcionando:

- reset já realizado;
- progressão;
- Espaços de Habilidade;
- armas;
- projéteis;
- Slime;
- Saltador;
- Mágico;
- boss;
- loot;
- roleta;
- inventário;
- save;
- reload.

Não remover testes para passar.

---

# 65. PLAYTEST MANUAL — REGRA PRINCIPAL

Executar pelo menos:

# 3 RUNS COMPLETAS.

Não apenas uma.

Porque estamos testando variedade procedural.

Usar personagem normal conforme estado atual do save.

Não utilizar debug para:

- teleportar;
- matar inimigos;
- abrir gates;
- pular andar;
- revelar caminho.

Debug pode apenas observar informações técnicas.

---

# 66. PLAYTEST — O QUE OBSERVAR

Para cada andar registrar:

- duração;
- quantidade de regiões visitadas;
- encontros obrigatórios;
- encontros opcionais encontrados;
- desvios escolhidos;
- momentos de desorientação;
- momentos vazios;
- repetição percebida;
- landmarks memoráveis;
- distância aproximada;
- dificuldade.

---

# 67. TESTE DE ROTA DIRETA

Em uma das runs:

tentar seguir apenas o caminho principal.

Medir duração.

Confirmar:

não é necessário exterminar o mapa.

---

# 68. TESTE EXPLORATÓRIO

Em outra run:

explorar deliberadamente os desvios.

Comparar:

- duração;
- XP;
- inimigos encontrados;
- sensação de descoberta.

O caminho exploratório deve naturalmente oferecer mais atividade sem ser obrigatório.

---

# 69. TESTE DE ORIENTAÇÃO

Durante playtest perguntar objetivamente:

- ficou claro para onde avançar?
- bifurcações pareciam escolhas?
- algum caminho parecia importante mas não levava a nada?
- foi necessário procurar “o último inimigo”?
- a saída foi descoberta naturalmente?
- landmarks ajudaram a reconhecer regiões?

Registrar no relatório.

---

# 70. TESTE DE ESCALA

Queremos verificar se:

# BEM MAIOR

também significa:

# MAIS INTERESSANTE.

Se o mapa aumentou 4× mas a experiência ganhou apenas caminhada vazia:

a implementação NÃO atingiu o objetivo.

Ajustar antes de concluir.

---

# 71. NÃO IMPLEMENTAR

NÃO implementar nesta iteração:

- Floor 4+;
- Cave/Mines;
- classes;
- missão de classe;
- evolução;
- novos skills;
- raridades;
- perguntas educacionais;
- múltiplos baús reais;
- mineração;
- pesca;
- coleta;
- crafting;
- multiplayer;
- party;
- Arena;
- PvP;
- mapa/minimapa completo;
- fast travel;
- persistência definitiva dos layouts;
- herança de floors;
- procedural infinito;
- arte final.

---

# 72. CRITÉRIOS DE ACEITAÇÃO

A Iteração 09 estará concluída quando:

[ ] mapas forem significativamente maiores;

[ ] FloorGraph existir como estrutura lógica ou equivalente;

[ ] cada andar possuir múltiplas regiões;

[ ] existir caminho principal garantido;

[ ] existirem bifurcações;

[ ] existirem regiões opcionais;

[ ] saída não exigir matar todos os inimigos do mapa;

[ ] inimigos opcionais puderem permanecer vivos;

[ ] encontros obrigatórios controlarem progressão quando necessário;

[ ] encontros opcionais funcionarem;

[ ] gates não criarem deadlocks;

[ ] Floor 1 parecer entrada da Floresta;

[ ] Floor 2 parecer mais denso;

[ ] Floor 3 parecer coração da Floresta;

[ ] boss possuir região própria;

[ ] landmarks existirem;

[ ] orientação funcionar sem minimapa completo;

[ ] procedural continuar determinístico;

[ ] mesma seed reproduzir aventura;

[ ] diferentes seeds produzirem variação estrutural;

[ ] todos os mapas forem atravessáveis;

[ ] regiões opcionais permitirem retorno;

[ ] inimigos continuarem passivos antes de provocação;

[ ] XP opcional funcionar;

[ ] run principal puder ser concluída sem exterminar mapa;

[ ] primeira run manual completa funcionar;

[ ] rota direta funcionar;

[ ] rota exploratória funcionar;

[ ] pelo menos três runs forem avaliadas;

[ ] duração aumentar principalmente por exploração;

[ ] não houver grandes trechos de caminhada vazia;

[ ] sistemas da Iteração 08 continuarem funcionando;

[ ] todos os testes automatizados passarem;

[ ] build de produção passar.

---

# 73. RELATÓRIO FINAL

Ao terminar:

PARE.

Não iniciar Iteração 10.

Entregar relatório contendo:

## 1. ARQUITETURA DO ANDAR
FloorGraph, regiões e conexões.

## 2. GERAÇÃO
Como topology/geometry/encounters são gerados.

## 3. ESCALA
Dimensões e comparação com Iteração 08.

## 4. CAMINHO PRINCIPAL
Como é garantido.

## 5. BIFURCAÇÕES
Como escolhas são geradas.

## 6. REGIÕES OPCIONAIS
Tipos e comportamento.

## 7. ENCONTROS
Obrigatórios versus opcionais.

## 8. GATES
Funcionamento e prevenção de deadlock.

## 9. LANDMARKS
Tipos atuais e função de orientação.

## 10. IDENTIDADE DOS ANDARES
Diferenças entre Floors 1, 2 e 3.

## 11. BOSS REGION
Como a jornada culmina no Guardião.

## 12. PROCEDURAL
Seed, determinismo e streams independentes.

## 13. NAVEGAÇÃO
Garantias e validação.

## 14. PERFORMANCE
Tempo de geração, FPS e custos relevantes.

## 15. PLAYTEST — RUN 1
Duração e observações.

## 16. PLAYTEST — RUN 2
Duração e observações.

## 17. PLAYTEST — RUN 3
Duração e observações.

## 18. ROTA DIRETA VS EXPLORAÇÃO
Comparação.

## 19. TESTES
Número total e resultados.

## 20. LIMITAÇÕES
O que permanece provisório.

---

# REGRA FINAL DA ITERAÇÃO 09

Não confundir:

MAPA GRANDE

com

AVENTURA.

Um bom andar precisa criar uma sequência:

CHEGAR
→ OBSERVAR
→ ESCOLHER UM CAMINHO
→ EXPLORAR
→ ENCONTRAR ALGO
→ LUTAR
→ CONTINUAR
→ DESVIAR OU PROSSEGUIR
→ RECONHECER QUE ESTÁ AVANÇANDO
→ ENCONTRAR A SAÍDA.

O jogador NÃO precisa matar tudo.

O jogador precisa sentir:

> “Eu explorei um andar da Torre.”

A Iteração 07 provou que existe um loop.

A Iteração 08 provou que repetir o loop pode variar.

A Iteração 09 deve provar:

# “Cada andar pode ser uma pequena aventura.”

Ao terminar, PARE.