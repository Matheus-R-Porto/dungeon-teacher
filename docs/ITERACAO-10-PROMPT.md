# DUNGEON MASTER — BETA 0.1.0
# ITERAÇÃO 10 — LIFE SKILLS FOUNDATION + FISHING
## Dar propósito aos lagos e aos desvios da Torre

Continue o desenvolvimento da implementação atual de Dungeon Master.

A Iteração 09 está concluída.

A Torre agora possui:

- FloorGraph;
- regiões conectadas;
- 9/10/11 regiões principais nos Floors 1/2/3;
- regiões opcionais;
- bifurcações;
- landmarks;
- encontros obrigatórios;
- encontros opcionais;
- gates de raízes;
- caminho principal;
- boss region;
- geração procedural determinística;
- lagos e regiões aquáticas já existentes;
- POIs `futureResource`;
- aproximadamente 247 testes aprovados.

IMPORTANTE:

A Iteração 09 revelou que o problema atual NÃO é simplesmente tamanho do mapa.

Os andares já possuem caminhos principais medianos de aproximadamente:

- Floor 1: 299 m;
- Floor 2: 345 m;
- Floor 3: 390 m.

O problema observado é:

# DENSIDADE DE ATIVIDADES.

Trechos longos podem parecer apenas caminhada.

Os desvios opcionais atualmente oferecem principalmente:

- inimigos;
- XP;
- landmarks.

A Iteração 10 deve começar a resolver isso introduzindo a primeira atividade não relacionada a combate:

# FISHING.

---

# 1. VISÃO DAS LIFE SKILLS

As quatro Life Skills planejadas inicialmente são:

## Obtenção

Fishing
→ peixes.

Mining
→ minérios.

## Transformação

Cooking
→ utiliza principalmente peixes/ingredientes
→ pratos
→ cura / recuperação / buffs.

Smithing
→ utiliza principalmente minérios
→ criação e melhoria de equipamentos.

Fluxos futuros:

Fishing
→ Cooking.

Mining
→ Smithing.

Os produtos dessas atividades poderão futuramente participar do mercado entre jogadores.

---

# 2. ESCOPO DESTA ITERAÇÃO

Implementar somente:

# LIFE SKILL FOUNDATION

e:

# FISHING.

NÃO implementar:

- Cooking;
- receitas;
- comida;
- buffs;
- Mining;
- minérios;
- Smithing;
- upgrades;
- crafting;
- marketplace.

A arquitetura deve permitir essas expansões sem tentar implementá-las antecipadamente.

---

# 3. PERGUNTA DE DESIGN

Esta iteração deve responder:

> “Encontrar um lago durante uma aventura cria vontade de sair do caminho principal para fazer alguma coisa diferente?”

Fishing não existe para inflar artificialmente a duração da run.

Fishing existe para transformar:

DESVIO OPCIONAL
→ LUGAR INTERESSANTE
→ ATIVIDADE
→ RECURSO
→ PROGRESSÃO.

---

# 4. AUDITORIA OBRIGATÓRIA

Antes de implementar:

1. executar todos os testes existentes;
2. confirmar o build;
3. estudar `FloorGraph`;
4. estudar `tower.js`;
5. estudar regiões opcionais;
6. localizar `futureResource`;
7. estudar exatamente como `Lago dos vaga-lumes` é representado;
8. estudar exatamente como `Lago das raízes` é representado;
9. identificar geometria real da água;
10. identificar limites/margens navegáveis;
11. estudar interação universal por F;
12. estudar Inventory;
13. estudar ItemDefinition;
14. estudar save/load;
15. estudar AreaSession;
16. estudar RunState;
17. estudar streams RNG atuais.

Não criar Fishing antes de entender como os lagos atuais realmente existem.

---

# 5. NÃO REDESENHAR A TORRE

CRÍTICO:

NÃO refazer FloorGraph.

NÃO aumentar os mapas.

NÃO alongar trilhas.

NÃO adicionar mais regiões apenas para Fishing.

NÃO criar um segundo gerador de mapa.

A Iteração 09 já produziu escala suficiente para esta fase.

Fishing deve adicionar:

# DENSIDADE DE GAMEPLAY

ao mundo existente.

---

# 6. USAR OS LAGOS QUE JÁ EXISTEM

A geração atual já possui elementos aquáticos.

Reutilizá-los.

Particularmente investigar:

- Lago dos vaga-lumes;
- Lago das raízes;
- outros water features equivalentes existentes.

Não gerar uma poça artificial ao lado do jogador apenas para garantir Fishing.

---

# 7. DIFERENCIAR LANDMARK DE ÁGUA PESCÁVEL

Nem todo objeto chamado "lago" precisa automaticamente possuir gameplay.

Adicionar uma representação semântica clara.

Algo equivalente a:

WaterFeature

com propriedades como:

- fishingCompatible;
- shoreline;
- waterBounds;
- regionId.

Usar estrutura coerente com o código existente.

Gameplay NÃO deve inferir Fishing através do nome textual:

if (landmark.name === "Lago...")

Isso seria frágil.

---

# 8. REGIÕES AQUÁTICAS

Uma região que contenha água pescável pode declarar semanticamente:

- water feature;
- margem;
- Fishing compatibility;
- candidatos a Fishing Spot.

FloorGraph continua responsável pela estrutura.

Materialização continua responsável pela geometria.

Fishing utiliza esses dados.

Manter responsabilidades separadas.

---

# 9. FISHING COMO MOTIVO PARA DESVIO

Priorizar Fishing em:

# REGIÕES OPCIONAIS.

Exemplo desejado:

caminho principal
→ jogador percebe bifurcação azul
→ segue desvio
→ encontra Lago dos vaga-lumes
→ vê oportunidade de Fishing
→ decide parar para pescar
→ obtém recurso
→ retorna ao caminho principal.

Fishing não precisa ficar no meio obrigatório da rota.

---

# 10. FUTURERESOURCE

A Iteração 09 já possui:

`futureResource`

como metadata.

Revisar essa estrutura.

Se apropriado, evoluí-la para suportar recursos reais.

Porém:

NÃO transformar `futureResource` numa classe gigantesca genérica.

Fishing deve possuir dados suficientes para funcionar.

A abstração precisa ser útil futuramente para Mining, mas não especulativa.

---

# 11. LIFE SKILL FOUNDATION

Criar fundação pequena para representar progressão de profissão.

Conceitualmente:

LifeSkillDefinition

LifeSkillProgress

com:

- id;
- name;
- level;
- xp;
- xpToNextLevel.

Não é obrigatório utilizar esses nomes.

---

# 12. LIFE SKILLS PLANEJADAS

O domínio deve poder futuramente representar:

- Fishing;
- Cooking;
- Mining;
- Smithing.

Somente Fishing fica ativa.

Não criar:

- CookingRuntime;
- MiningRuntime;
- SmithingRuntime;

vazios apenas para antecipação.

---

# 13. PROGRESSÃO INDEPENDENTE

Fishing possui:

# Fishing Level

e:

# Fishing XP.

Isso é independente de:

- Character Level;
- Character XP;
- atributos;
- Espaços de Habilidade.

Personagem pode ser:

Level 5

Fishing Level 2.

---

# 14. ESTADO INICIAL

Personagem começa:

Fishing Level 1.

Fishing XP:

0.

Fishing não precisa ser "aprendida".

Qualquer personagem pode pescar se possuir ferramenta adequada.

---

# 15. FISHING NÃO DÁ CHARACTER XP

Captura concede:

- peixe;
- Fishing XP.

Não concede:

- Character XP;
- pontos de atributo;
- Espaço de Habilidade;
- ouro.

Manter progressões separadas.

---

# 16. CURVA DE FISHING

Criar curva simples e configurável.

Precisamos conseguir observar Fishing Level Up durante testes sem banalizar progressão.

Não tentar balancear semanas de jogo agora.

Registrar:

- XP por peixe;
- thresholds;
- tempo aproximado observado por level.

---

# 17. EFEITO DO FISHING LEVEL

Nesta primeira versão, Fishing Level deve possuir pelo menos UMA consequência real.

Preferência:

# liberar espécies adicionais.

Exemplo:

Fishing Level 1
→ peixes básicos.

Fishing Level 2
→ adiciona espécies à tabela.

Fishing Level 3
→ adiciona outras espécies.

Não aumentar artificialmente dano/atributos do personagem.

---

# 18. VARA DE PESCA

Criar item:

# Vara de Pesca.

Categoria:

tool

ou equivalente.

Não é:

- Weapon;
- Armor;
- Consumable.

---

# 19. AQUISIÇÃO DA VARA

Adicionar forma simples de obter a primeira Vara no Refúgio.

Nesta fase:

# gratuita.

Preferir NPC/serviço existente ou pequeno fornecedor apropriado.

Não criar economia de ferramentas ainda.

---

# 20. NÃO EQUIPAR NO WEAPON SLOT

Possuir a Vara no inventário é suficiente.

NÃO exigir:

I
→ remover arma
→ equipar vara
→ pescar
→ reequipar arma.

Fishing deve respeitar o fluxo da exploração.

---

# 21. SEM TOOL EQUIPMENT AINDA

Não criar painel complexo de ferramentas.

Futuramente podem existir:

- varas melhores;
- picaretas;
- ferramentas especializadas.

Não agora.

---

# 22. FISHING SPOTS

Água pescável deve possuir um número pequeno de Fishing Spots.

Fishing Spot deve representar:

- posição do jogador na margem;
- direção para água;
- ponto da boia;
- waterFeature associado.

---

# 23. POSICIONAMENTO DOS SPOTS

Spot precisa:

- estar na margem;
- ser alcançável;
- possuir espaço para Player;
- apontar para água;
- não ficar dentro de árvore;
- não ficar dentro de pedra;
- não ficar dentro de gate;
- não ficar dentro de encounter obrigatório;
- não ficar em terreno inválido;
- não exigir entrar na água.

Usar validação física/navegação existente.

---

# 24. QUANTIDADE

Poucos spots por lago.

Algo provisório:

lago pequeno
→ 1.

lago médio
→ 1–2.

lago grande
→ 2–3.

Centralizar configuração.

Não transformar margem em fileira de ícones `[F]`.

---

# 25. DISPONIBILIDADE PARA PLAYTEST

Precisamos conseguir testar Fishing consistentemente.

Em vez de alterar arbitrariamente toda a topologia para garantir água:

preferir regras como:

durante esta fase de desenvolvimento, pelo menos uma das regiões opcionais da run deve selecionar uma variante aquática Fishing-compatible.

Isso deve utilizar:

# o sistema de regiões existente.

Não gerar água fora da lógica do FloorGraph.

---

# 26. DETERMINISMO DO SPOT

Mesma:

runSeed + floor

deve reproduzir:

- região aquática;
- lago;
- Fishing Spots.

Fishing não deve alterar aleatoriamente:

- topology;
- encontros;
- landmarks não relacionados.

Utilizar RNG stream separado.

---

# 27. INTERAÇÃO

Próximo de spot válido:

[F] PESCAR

Sem Vara:

ao tentar:

> Você precisa de uma Vara de Pesca.

Inventário sem capacidade:

> Sua mochila está cheia.

Em combate:

> Você não pode pescar durante o combate.

---

# 28. ESTADO DO PLAYER

Fishing deve integrar o sistema atual de ações/estados.

Durante Fishing:

- movimento bloqueado;
- ataques bloqueados;
- habilidades bloqueadas;
- interação concorrente bloqueada;
- troca de equipamento bloqueada quando necessário.

Câmera pode continuar funcional.

O mundo:

# NÃO PAUSA.

---

# 29. FISHING NÃO DÁ SEGURANÇA

Fishing não concede invulnerabilidade.

Se Player sofrer impacto hostil válido:

# CANCELAR Fishing.

Não conceder:

- peixe;
- Fishing XP.

Controle retorna normalmente.

---

# 30. NÃO INICIAR EM COMBATE

Player em combate ativo não pode começar Fishing.

Isso evita usar Fishing como exploit para quebrar estados de combate.

---

# 31. CANCELAMENTO SEGURO

Fishing deve cancelar por:

- dano;
- morte;
- troca de área;
- subida de andar;
- abandono;
- comando de cancelamento apropriado.

Nenhum cancelamento concede recompensa.

---

# 32. MINIGAME — FILOSOFIA

Fishing precisa ser:

# UMA ATIVIDADE CURTA.

O relatório da Iteração 09 já identificou caminhada passiva como ponto fraco.

NÃO substituir:

“caminhar sem fazer nada”

por:

“ficar esperando sem fazer nada”.

---

# 33. LOOP DA PESCA

Primeira versão:

APROXIMAR
→ F
→ LANÇAR
→ PEQUENA ESPERA
→ MORDIDA
→ REAGIR
→ RESULTADO.

Simples.

Responsivo.

Repetível.

---

# 34. LANÇAMENTO

Apresentar placeholder:

- linha;
- boia;
- pequeno splash.

Não simular corda física.

Não criar sistema de casting baseado em força.

---

# 35. TEMPO DE ESPERA

Usar duração variável curta.

Como ponto inicial:

aproximadamente:

# 1–3 segundos.

Configurar.

Durante playtest avaliar:

- expectativa;
- tédio;
- ritmo.

Não aumentar espera para alongar artificialmente Fishing.

---

# 36. MORDIDA

Quando houver mordida:

feedback claro e imediato.

Combinar quando disponível:

- boia;
- splash;
- som;
- pequeno indicador.

O jogador deve pensar:

# AGORA!

---

# 37. REAÇÃO

Depois da mordida:

janela curta.

Exemplo inicial:

0,8–1,2 s.

Configurar.

F ou SPACE:

puxa a linha.

---

# 38. PUXAR CEDO

Se Player apertar antes da mordida:

falha.

Feedback:

> Muito cedo!

ou equivalente.

---

# 39. PUXAR TARDE

Se janela acabar:

falha.

Feedback:

> O peixe escapou.

---

# 40. ACERTAR

Input dentro da janela:

captura bem-sucedida.

Conceder:

- exatamente um resultado de Fishing;
- Fishing XP correspondente.

Mostrar:

PESCADO!

[Nome]

Fishing XP +X

---

# 41. NÃO ADICIONAR SEGUNDA FASE AINDA

Não implementar:

- barra de tensão;
- stamina;
- peixe movendo cursor;
- mash;
- combo;
- sequência de QTE;
- linha quebrando;
- durabilidade.

Primeiro validar se o microloop é prazeroso.

---

# 42. RNG LÓGICO

Resultado do peixe deve ser decidido pelo domínio.

Não pela animação.

Não por:

- FPS;
- instante exato do render;
- duração de animação.

Seguir a mesma filosofia já utilizada pela Reward Reel.

---

# 43. RNG DA CAPTURA

Fishing Spot é derivado da seed do mapa.

Tentativas de Fishing usam RNG de atividade da run ou mecanismo equivalente.

Não fazer:

mesma seed
→ mesmo peixe eternamente em toda tentativa.

Também não usar Math.random espalhado pela UI.

---

# 44. FISH DEFINITION

Criar estrutura data-driven.

Cada espécie deve possuir pelo menos:

- id;
- nome;
- descrição;
- Fishing Level mínimo;
- peso;
- Fishing XP;
- itemDefinition;
- tags.

---

# 45. ESPÉCIES INICIAIS

Criar aproximadamente:

# 5 espécies.

Exemplo temático, ajustável:

## Lambari do Limiar
Fishing 1.
Muito frequente.

## Carpa dos Vaga-lumes
Fishing 1.
Frequente.

## Bagre Musgoso
Fishing 1 ou 2.
Menos frequente.

## Peixe-Lua
Fishing 2.
Menos frequente.

## Peixe Rúnico
Fishing 3.
Difícil de encontrar.

Nomes podem ser adaptados.

Não criar dezenas.

---

# 46. PROGRESSÃO DA TABELA

Fishing Level determina elegibilidade.

Exemplo:

Level 1:
3 espécies.

Level 2:
+1 espécie.

Level 3:
+1 espécie.

Isso não significa que peixe novo seja garantido.

Apenas entra na tabela ponderada.

---

# 47. SEM RARIDADE GLOBAL

Não criar:

Common
Uncommon
Rare
Epic
Legendary

como sistema global.

Peso de Fishing é apenas frequência de captura.

---

# 48. PEIXES COMO ITEM

Cada peixe capturado vira item real.

Categoria apropriada:

resource

com tags como:

fish
ingredient

Isso prepara:

Fishing
→ Cooking.

---

# 49. STACK

Peixes iguais devem empilhar.

Não criar uma instância individual ocupando slot para cada Lambari.

Stack máximo configurável.

Exemplo:

99.

---

# 50. INVENTÁRIO

Antes da tentativa:

verificar se pelo menos um resultado possível pode ser armazenado de forma segura.

Considerar:

- slot vazio;
- stack existente.

Não permitir recompensa silenciosamente perdida.

---

# 51. CONCESSÃO ATÔMICA

Sucesso concede:

PEIXE + FISHING XP

como uma única mutação lógica sempre que arquitetura permitir.

Se save falhar:

utilizar rollback existente.

Não deixar:

peixe salvo / XP perdido

ou:

XP salvo / peixe perdido.

---

# 52. COOLDOWN DO SPOT

Depois de uma tentativa:

spot possui pequeno cooldown.

Algo como:

2–4 segundos.

Configurar.

O cooldown não precisa bloquear outros spots do lago.

---

# 53. SEM ESGOTAMENTO DO LAGO

Não implementar população ecológica.

Não implementar:

“este lago ficou sem peixes”.

Fishing Spot volta a ficar disponível.

---

# 54. SEM ISCA

Não implementar bait.

---

# 55. SEM VARA AVANÇADA

Uma Vara.

Sem:

- tier;
- rarity;
- durability;
- upgrade.

---

# 56. SEM STAMINA

Fishing não consome:

- energia;
- ticket;
- limite diário;
- moeda.

---

# 57. PAINEL DE LIFE SKILLS

Adicionar UI simples para consultar:

LIFE SKILLS

Fishing
Level X
XP atual / próximo nível.

Não criar tela gigantesca.

---

# 58. FUTURAS SKILLS NA UI

Não é necessário exibir Cooking/Mining/Smithing ainda.

Se forem exibidas:

devem aparecer claramente como indisponíveis/futuras.

Não criar interação falsa.

---

# 59. FEEDBACK DE LEVEL UP

Quando Fishing sobe:

PESCA NÍVEL X!

Feedback simples.

Não interromper exageradamente a run.

---

# 60. INTEGRAÇÃO COM LAGO DOS VAGA-LUMES

O Lago dos vaga-lumes já existe como região opcional.

Ele deve ser um dos principais casos de aceitação desta iteração.

Durante playtest:

o jogador deve conseguir:

seguir desvio
→ chegar ao Lago dos vaga-lumes
→ identificar água
→ encontrar spot
→ pescar
→ voltar ao caminho principal.

---

# 61. LANDMARK LAGO DAS RAÍZES

Auditar o atual Lago das raízes.

Se sua geometria representar água real e possuir margem válida:

pode ser Fishing-compatible.

Se for apenas decoração sem estrutura adequada:

não criar hacks para torná-lo pescável.

Documentar a decisão.

---

# 62. FISHING E OPTIONAL ENCOUNTERS

Algumas regiões aquáticas já podem conter encontro opcional.

Isso cria uma dinâmica interessante:

cheguei ao lago
→ existem Slimes
→ posso resolver/evitar ameaça
→ depois pescar.

Mas Fishing não deve começar se Player estiver em combate.

---

# 63. NÃO OBRIGAR A MATAR OPCIONAIS

Se for possível evitar os inimigos e sair de combate de forma legítima:

Player pode pescar depois.

Não transformar Fishing em:

“mate todos os inimigos do lago”.

A regra é:

# não estar em combate.

---

# 64. NÃO COLOCAR FISHING EM GATE

Fishing nunca:

- abre raiz;
- completa encontro;
- libera saída;
- ativa boss.

É atividade opcional.

---

# 65. IMPACTO NO RITMO

O relatório da Iteração 09 identificou:

- longas trilhas;
- caminhada repetitiva;
- ramos de ida/volta;
- pouca atividade não relacionada a combate.

Fishing deve ser avaliada como resposta PARCIAL a esse problema.

Não afirmar que Fishing resolve toda a variedade da Torre.

---

# 66. NÃO AUMENTAR A DURAÇÃO COMO KPI PRINCIPAL

Não usar:

“a run ficou X minutos maior”

como único sinal de sucesso.

Pergunta melhor:

> “Os minutos adicionais tiveram decisões e atividade?”

Se Fishing adicionar 2 minutos de espera passiva:

falhou.

Se adicionar 2 minutos porque o jogador:

- percebeu lago;
- desviou;
- lidou com risco;
- pescou;
- ganhou recursos;
- evoluiu profissão;

funcionou.

---

# 67. TESTES — LIFE SKILL

Testar:

- Fishing Level inicial 1;
- XP inicial 0;
- XP independente;
- Fishing level up;
- múltiplos levels;
- persistência;
- reload;
- não concede Character XP;
- não concede atributos;
- não concede Espaço de Habilidade;
- não concede ouro.

---

# 68. TESTES — VARA

Testar:

- item existe;
- categoria correta;
- não é Weapon;
- aquisição;
- persistência;
- sem Vara bloqueia;
- com Vara permite;
- não precisa remover arma.

---

# 69. TESTES — WATER FEATURES

Para muitas seeds:

- região aquática identificada;
- Fishing-compatible corretamente;
- Fishing Spot pertence à água;
- margem válida;
- posição alcançável;
- ponto de lançamento dentro da água;
- Player fora da água;
- ausência de sobreposição inválida.

---

# 70. TESTES — FLOORGRAPH

Adicionar Fishing NÃO deve quebrar:

- caminho principal;
- bifurcações;
- encounters;
- gates;
- boss region;
- opcionais.

Mesma seed deve manter estrutura anterior quando a mudança não exigir alteração deliberada.

---

# 71. TESTES — FISHING SPOTS

Testar:

- determinismo;
- quantidade configurável;
- colisão;
- navegação;
- obstáculos;
- gates;
- interação;
- cooldown.

---

# 72. TESTES — MINIGAME

Testar:

- cast;
- waiting;
- bite;
- early pull;
- successful pull;
- late pull;
- cancel;
- cooldown;
- restart.

---

# 73. TESTES — TIMING

Testar comportamento equivalente em:

30 FPS;
60 FPS;
144 FPS.

Não depender de render delta incorreto.

---

# 74. TESTES — INTERRUPÇÃO

Testar:

- dano cancela;
- morte cancela;
- combate bloqueia início;
- troca de andar cancela;
- retorno ao Refúgio cancela;
- abandono cancela;
- nenhuma interrupção concede recompensa.

---

# 75. TESTES — FISH TABLE

Testar:

- pesos;
- eligibility por level;
- espécie bloqueada;
- desbloqueio;
- resultado válido;
- XP correspondente.

---

# 76. TESTES — INVENTÁRIO

Testar:

- peixe entra;
- stack;
- stack máximo;
- stack parcial;
- slot vazio;
- inventário cheio;
- rollback;
- save;
- reload.

---

# 77. REGRESSÃO

Preservar todos os testes da Iteração 09.

Base esperada:

aproximadamente 247 testes.

Não remover cobertura para fazer a nova implementação passar.

---

# 78. PLAYTEST 1 — IGNORANDO FISHING

Executar uma run normal.

Mesmo existindo oportunidade:

# IGNORAR.

Confirmar:

- Floor 1;
- Floor 2;
- Floor 3;
- boss;
- baú;
- retorno;

funcionam normalmente.

Registrar duração.

Fishing precisa ser 100% opcional.

---

# 79. PLAYTEST 2 — FISHING

Executar nova run.

Durante ela:

1. localizar desvio aquático;
2. chegar ao lago;
3. identificar Fishing Spot;
4. tentar sem Vara se possível em cenário controlado;
5. possuir Vara;
6. lançar;
7. puxar cedo uma vez;
8. falhar;
9. tentar novamente;
10. esperar mordida;
11. acertar;
12. capturar peixe;
13. repetir várias vezes;
14. ganhar Fishing XP;
15. continuar aventura;
16. completar os três andares;
17. derrotar boss;
18. voltar;
19. verificar peixes;
20. reload;
21. verificar peixes;
22. verificar Fishing Level/XP.

---

# 80. PLAYTEST 3 — LAGO DOS VAGA-LUMES

Realizar teste focado especificamente no:

# Lago dos vaga-lumes.

Responder:

- Fishing ficou visualmente associado ao lago?
- foi fácil encontrar margem pescável?
- interação pareceu parte daquele lugar?
- inimigos opcionais criaram risco interessante?
- foi fácil voltar à rota principal?
- o desvio pareceu mais valioso do que na Iteração 09?

---

# 81. AVALIAÇÃO SUBJETIVA OBRIGATÓRIA

Registrar no relatório:

### DESCOBERTA
O lago gerou curiosidade?

### LEGIBILIDADE
Ficou claro que era possível pescar?

### RITMO
Fishing quebrou positivamente a caminhada?

### ESPERA
O tempo até mordida ficou tedioso?

### REAÇÃO
A janela parece justa?

### RECOMPENSA
Ganhar peixe + XP foi satisfatório mesmo sem Cooking?

### REPETIÇÃO
Depois de três capturas ainda houve vontade de fazer outra?

### EXPLORAÇÃO
O desvio passou a ter mais propósito?

---

# 82. PERFORMANCE

Fishing adiciona poucos objetos.

Não deve causar regressão significativa.

Medir:

- geração;
- número de spots;
- FPS perto do lago;
- efeitos/boia;
- impacto no save.

Não iniciar otimização estrutural sem necessidade.

---

# 83. NÃO CORRIGIR TODA ITERAÇÃO 09 AGORA

Não transformar esta iteração numa reescrita de exploração.

Problemas conhecidos:

- zigue-zague perceptível;
- trilhas longas;
- sinalização lateral;
- cliques sobre cobertura;
- árvores/painéis ocultando regiões.

Só corrigir nesta iteração se:

- bloquear Fishing;
- tornar lago ilegível;
- impedir acesso ao spot;
- causar regressão grave.

Caso contrário:

documentar para iteração futura.

---

# 84. NÃO IMPLEMENTAR

NÃO implementar:

- Cooking;
- pratos;
- buffs;
- cura por comida;
- Mining;
- Smithing;
- crafting;
- upgrade de arma;
- marketplace;
- venda;
- preço de peixe;
- isca;
- varas avançadas;
- durability;
- stamina;
- daily limits;
- ranking;
- quests de Fishing;
- achievements;
- Floor 4;
- Cave;
- classes;
- multiplayer;
- party;
- conteúdo educacional.

---

# 85. CRITÉRIOS DE ACEITAÇÃO

A Iteração 10 termina quando:

[ ] Life Skill Foundation existir;

[ ] Fishing Level existir;

[ ] Fishing XP existir;

[ ] progressão for independente;

[ ] Fishing persistir;

[ ] Vara existir;

[ ] Vara for Tool;

[ ] Vara não substituir Weapon;

[ ] lagos existentes forem reutilizados;

[ ] água pescável possuir representação semântica;

[ ] Lago dos vaga-lumes suportar Fishing;

[ ] Fishing Spots existirem em margens válidas;

[ ] spots forem alcançáveis;

[ ] geração continuar determinística;

[ ] Fishing não quebrar FloorGraph;

[ ] F iniciar Fishing;

[ ] sem Vara bloquear;

[ ] combate bloquear;

[ ] dano cancelar;

[ ] mundo não pausar;

[ ] existir cast;

[ ] existir espera curta;

[ ] existir bite;

[ ] existir reação;

[ ] early pull falhar;

[ ] late pull falhar;

[ ] reação correta capturar;

[ ] captura conceder peixe;

[ ] captura conceder Fishing XP;

[ ] não conceder Character XP;

[ ] peixes forem itens reais;

[ ] peixes empilharem;

[ ] aproximadamente cinco espécies existirem;

[ ] Fishing Level liberar espécies;

[ ] inventário cheio for tratado;

[ ] concessão for segura;

[ ] cooldown funcionar;

[ ] Fishing for opcional;

[ ] Fishing não abrir gates;

[ ] Fishing não liberar boss;

[ ] run sem Fishing funcionar;

[ ] run com Fishing funcionar;

[ ] Lago dos vaga-lumes for validado manualmente;

[ ] save/reload preservar progresso;

[ ] todos os testes anteriores continuarem passando;

[ ] testes novos passarem;

[ ] build passar.

---

# 86. RELATÓRIO FINAL

Ao concluir:

PARE.

Não iniciar Cooking.

Entregar:

## 1. AUDITORIA
Como Fishing foi integrada à Iteração 09.

## 2. LIFE SKILL FOUNDATION
Estrutura criada.

## 3. FISHING PROGRESSION
Level, XP e curva.

## 4. VARA DE PESCA
Item e aquisição.

## 5. WATER FEATURES
Como lagos passaram a possuir significado de gameplay.

## 6. LAGO DOS VAGA-LUMES
Integração específica.

## 7. LAGO DAS RAÍZES
Se foi ou não considerado pescável e por quê.

## 8. FISHING SPOTS
Geração e validação.

## 9. MINIGAME
Estados e timings.

## 10. INTERRUPÇÕES
Combate/dano/morte/transição.

## 11. ESPÉCIES
Tabela inicial completa.

## 12. INVENTÁRIO
Stacks e persistência.

## 13. RNG
Determinismo e seleção.

## 14. PLAYTEST SEM FISHING
Resultado e duração.

## 15. PLAYTEST COM FISHING
Resultado, duração, capturas e progressão.

## 16. PLAYTEST DO LAGO DOS VAGA-LUMES
Resultado específico.

## 17. IMPACTO NA EXPLORAÇÃO
Se o desvio ficou mais interessante.

## 18. RITMO
Quanto tempo foi atividade e quanto foi espera.

## 19. TESTES
Quantidade e resultados.

## 20. PERFORMANCE
Impacto.

## 21. LIMITAÇÕES
Problemas restantes.

---

# REGRA FINAL

A Iteração 09 já tornou a Torre grande.

Portanto a Iteração 10 NÃO deve perguntar:

> “Como fazemos o jogador permanecer mais tempo aqui?”

Ela deve perguntar:

> “O que interessante existe para fazer enquanto ele está aqui?”

Fishing é a primeira resposta.

O resultado ideal é:

CAMINHANDO
→ PERCEBO UM DESVIO
→ VEJO UM LAGO
→ DECIDO EXPLORAR
→ ENCONTRO UM PONTO DE PESCA
→ PESCO
→ OBTENHO ALGO
→ MINHA PROFISSÃO EVOLUI
→ VOLTO À AVENTURA.

Se o jogador pensar:

> “Tem um lago ali. Vou dar uma passada antes de continuar.”

a Iteração cumpriu seu papel.

Ao terminar:

# PARE.