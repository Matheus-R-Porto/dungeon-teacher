# DUNGEON MASTER — ITERAÇÃO 12
## Bioma Caverna + Sistema de Transição de Biomas da Torre

O Dungeon Master já possui uma Torre procedural funcional com o bioma atual de Floresta.

Também já foram implementados e validados sistemas como combate, progressão, inventário, equipamentos, Fishing, Cooking, Hub persistente local e presença multiplayer no Refúgio.

O Multiplayer 01 também já foi validado em teste real utilizando dois computadores em redes diferentes. Os jogadores conseguiram conectar simultaneamente, conectar em momentos diferentes, visualizar um ao outro e movimentar seus personagens. Saves locais, itens, Fishing e demais dados persistentes permaneceram intactos após fechar e abrir o jogo.

Nesta iteração, NÃO continuar desenvolvendo Multiplayer.

A próxima expansão será ambiental e procedural.

O objetivo é criar:

1. o segundo bioma principal da Torre: **Caverna**;
2. andares puros de Caverna;
3. andares especiais de transição **Floresta → Caverna**;
4. andares especiais de transição **Caverna → Floresta**;
5. uma regra procedural que controle corretamente a sequência dos biomas.

Esta iteração prepara a arquitetura necessária para futuramente implementar:

```text
Caverna
   ↓
Mineração
   ↓
Minérios
   ↓
Forja no Refúgio
```

Porém:

> NÃO implementar Mining nem Smithing nesta iteração.

Primeiro precisamos provar que o novo sistema de biomas e a Caverna funcionam corretamente.

---

# 1. OBJETIVO PRINCIPAL

Expandir a geração procedural atual da Torre para deixar de assumir implicitamente que todos os andares pertencem ao mesmo bioma.

A Torre deve passar a compreender explicitamente quatro tipos ambientais:

```text
FOREST
CAVE
FOREST_TO_CAVE
CAVE_TO_FOREST
```

Conceitualmente:

```text
FOREST
=
andar puro de Floresta

CAVE
=
andar puro de Caverna

FOREST_TO_CAVE
=
andar especial que começa visualmente como Floresta
e termina visualmente como Caverna

CAVE_TO_FOREST
=
andar especial que começa visualmente como Caverna
e termina visualmente como Floresta
```

O sistema deve preservar a geração procedural existente e reutilizar sua arquitetura sempre que possível.

Não criar um segundo gerador completamente independente se o atual puder ser generalizado.

---

# 2. AUDITORIA OBRIGATÓRIA ANTES DE IMPLEMENTAR

Antes de modificar código, audite a implementação atual da Torre.

Identifique:

- representação atual de Floor;
- FloorGraph;
- seed;
- geração de salas;
- corredores;
- obstáculos;
- decoração;
- spawn do jogador;
- saída do andar;
- spawn de inimigos;
- navegação;
- colisão;
- câmera;
- portal;
- progressão entre andares;
- boss floor;
- regras especiais de Floor 1–3;
- qualquer dependência explícita de Floresta;
- assets atualmente usados;
- testes procedurais existentes;
- mecanismos determinísticos existentes;
- sistema atual de tamanho/densidade dos mapas.

Antes das mudanças:

1. executar a suíte completa;
2. registrar quantidade de testes;
3. registrar zero ou quaisquer falhas preexistentes;
4. executar a build atual;
5. não alterar sistemas não relacionados.

Não reescrever sistemas estáveis sem necessidade.

---

# 3. PRINCÍPIO DE DESIGN

O novo sistema deve pensar em:

```text
BIOMA ATUAL
```

e não apenas:

```text
andar atual
```

O bioma funciona como um estado entre andares.

Exemplo:

```text
Floor 01 — Forest
Floor 02 — Forest
Floor 03 — Forest
Floor 04 — ForestToCave
Floor 05 — Cave
Floor 06 — Cave
Floor 07 — Cave
Floor 08 — Cave
Floor 09 — CaveToForest
Floor 10 — Forest
Floor 11 — Forest
Floor 12 — Forest
...
```

O exemplo acima NÃO deve ser hardcoded como sequência obrigatória.

Ele demonstra apenas o comportamento esperado.

---

# 4. REGRA FUNDAMENTAL DE TRANSIÇÃO

Uma transição só pode existir se for compatível com o bioma atual.

Se:

```text
currentBiome = FOREST
```

os próximos tipos ambientalmente válidos são:

```text
FOREST
FOREST_TO_CAVE
```

Nunca:

```text
CAVE
CAVE_TO_FOREST
```

Da mesma forma, se:

```text
currentBiome = CAVE
```

os próximos tipos válidos são:

```text
CAVE
CAVE_TO_FOREST
```

Nunca:

```text
FOREST
FOREST_TO_CAVE
```

Portanto:

```text
FOREST
   ↓
FOREST_TO_CAVE
   ↓
CAVE
```

e:

```text
CAVE
   ↓
CAVE_TO_FOREST
   ↓
FOREST
```

Uma transição altera o estado do bioma para o próximo andar.

---

# 5. NÃO TELEPORTAR ENTRE BIOMAS

Não permitir sequência direta:

```text
FOREST
↓
CAVE
```

ou:

```text
CAVE
↓
FOREST
```

quando o sistema normal de progressão ambiental estiver sendo utilizado.

A mudança deve passar por um andar de transição.

Esperado:

```text
FOREST
↓
FOREST_TO_CAVE
↓
CAVE
```

ou:

```text
CAVE
↓
CAVE_TO_FOREST
↓
FOREST
```

Isso deve fazer parte da regra procedural e possuir testes.

---

# 6. PERMANÊNCIA MÍNIMA NO BIOMA

Não trocar de bioma a cada andar.

Depois que o jogador entra em um bioma puro, devem existir pelo menos:

```text
3 andares puros
```

antes que uma nova transição possa ocorrer.

Exemplo válido:

```text
Forest
Forest
Forest
ForestToCave
Cave
Cave
Cave
CaveToForest
```

Também é válido:

```text
Forest
Forest
Forest
Forest
Forest
ForestToCave
Cave
Cave
Cave
Cave
Cave
CaveToForest
```

Portanto:

```text
3
```

é uma permanência mínima, não necessariamente o tamanho fixo de cada região.

---

# 7. EVITAR REGIÕES EXCESSIVAMENTE LONGAS

Além do mínimo, implementar uma regra/configuração que permita controlar a duração máxima ou a pressão para transição.

Não queremos situações acidentais como:

```text
25 andares consecutivos de Cave
```

por simples azar procedural.

A arquitetura deve permitir algo conceitualmente semelhante a:

```text
minimumPureBiomeFloors = 3
preferredBiomeLength = 3–6
maximumBiomeLength = 7 ou 8
```

Os números finais podem ser ajustados após analisar a arquitetura existente.

O importante é:

- mínimo explícito;
- variedade após o mínimo;
- limite razoável;
- comportamento testável;
- configuração centralizada.

Não espalhar números mágicos pelo código.

Se houver razão técnica ou de design para utilizar valores ligeiramente diferentes, documentar no relatório.

---

# 8. DETERMINISMO

Preservar o comportamento determinístico do gerador atual.

Para a mesma seed e mesmas condições relevantes, a sequência de biomas e layouts deve permanecer reproduzível.

Exemplo conceitual:

```text
Tower Seed ABC

Floor 1 = Forest
Floor 2 = Forest
Floor 3 = Forest
Floor 4 = ForestToCave
Floor 5 = Cave
...
```

Executar novamente com as mesmas entradas deve produzir a mesma sequência.

Não utilizar `Math.random()` solto se o projeto já possui RNG determinístico.

---

# 9. PREPARAÇÃO PARA PERSISTENT FLOORS

NÃO implementar Persistent Floors nesta iteração.

Porém, não criar uma arquitetura incompatível com eles.

No futuro, um FloorRecord poderá precisar conhecer conceitualmente:

```text
floorNumber
seed
floorType
biome
transitionDirection
layout
...
```

Esta iteração deve garantir que o tipo/bioma de um andar possa ser representado explicitamente e posteriormente persistido.

Não implementar banco, backend ou persistência permanente dos andares agora.

Apenas evitar decisões arquiteturais que impeçam isso depois.

---

# 10. BIOMA CAVERNA

Criar uma identidade visual própria para o novo bioma.

Caverna NÃO deve parecer simplesmente:

```text
Floresta com textura cinza.
```

Ela deve possuir linguagem ambiental própria.

Elementos possíveis, respeitando os assets e capacidades atuais:

- paredes rochosas;
- formações de pedra;
- caminhos mais fechados;
- corredores naturais;
- grandes câmaras;
- pedras no chão;
- pilares naturais;
- cristais;
- raízes subterrâneas;
- pequenas áreas úmidas;
- poças ou elementos visuais subterrâneos quando tecnicamente viável;
- iluminação mais escura;
- fontes pontuais de luz;
- fungos ou vegetação subterrânea quando houver assets adequados;
- variação de altura apenas se já suportada pelo jogo;
- formações decorativas que ajudem a reconhecer salas.

Não implementar elementos que exijam uma reconstrução do renderer.

Trabalhar dentro da linguagem visual atual do Dungeon Master.

---

# 11. GAMEPLAY DA CAVERNA

A Caverna deve continuar usando o gameplay fundamental da Torre:

```text
explorar
→
encontrar inimigos
→
combater
→
progredir
→
encontrar saída
→
próximo andar
```

Não criar uma campanha paralela.

Não criar quests.

Não criar puzzles complexos nesta iteração.

Não criar mecânicas obrigatórias de escuridão.

Não criar lanterna/tocha como recurso consumível.

Não criar Mining ainda.

O objetivo é provar o BIOMA.

---

# 12. GEOMETRIA DA CAVERNA

O gerador deve permitir que a Caverna tenha personalidade geométrica diferente da Floresta.

A Floresta pode continuar favorecendo áreas mais abertas.

A Caverna pode favorecer uma mistura de:

```text
corredores naturais
+
câmaras
+
desvios
+
pequenos bolsões opcionais
```

Porém:

> Não transformar Caverna em corredores estreitos intermináveis.

O combate atual precisa continuar funcionando.

Preservar espaço suficiente para:

- movimentação;
- autoattack;
- aproximação;
- habilidades;
- inimigos;
- colisão;
- câmera;
- navegação.

---

# 13. DENSIDADE EM VEZ DE TAMANHO EXCESSIVO

As iterações anteriores já demonstraram que aumentar simplesmente o tamanho dos mapas não resolve variedade.

Portanto, não responder à Caverna apenas criando mapas gigantes.

Priorizar:

- identidade;
- densidade;
- landmarks;
- caminhos alternativos;
- composição de salas;
- decoração;
- ritmo.

Um mapa moderado e interessante é preferível a um mapa enorme e vazio.

---

# 14. ANDAR FOREST_TO_CAVE

Criar um tipo especial de andar:

```text
FOREST_TO_CAVE
```

Esse andar deve ser maior ou mais desenvolvido que um andar comum, dentro de limites razoáveis.

Ele começa claramente como Floresta.

Durante a progressão:

```text
vegetação
↓
vegetação + pedra
↓
paredões / rochas
↓
entrada subterrânea
↓
ambiente predominantemente rochoso
↓
Caverna
```

O jogador deve conseguir perceber visualmente:

> "Estou entrando em uma região subterrânea."

Não depender de texto explicando isso.

O próprio mapa deve comunicar a transição.

---

# 15. ANDAR CAVE_TO_FOREST

Criar também:

```text
CAVE_TO_FOREST
```

Ele deve fazer o movimento ambiental inverso.

Exemplo:

```text
caverna fechada
↓
raízes
↓
sinais de vegetação
↓
entrada de luz natural
↓
pedra + vegetação
↓
Floresta
```

O jogador deve perceber:

> "Estou saindo da região subterrânea."

Novamente, comunicar isso principalmente através do ambiente.

---

# 16. TRANSIÇÕES DEVEM TER DIREÇÃO

Não tratar um andar de transição como um mapa simétrico que pode ser usado indiscriminadamente nos dois sentidos.

Registrar explicitamente sua direção:

```text
FOREST_TO_CAVE
```

ou:

```text
CAVE_TO_FOREST
```

Isso será importante futuramente para persistência de andares.

---

# 17. SPAWN E SAÍDA NOS ANDARES DE TRANSIÇÃO

A entrada do jogador deve estar coerente com o bioma de origem.

Exemplo:

```text
FOREST_TO_CAVE

SPAWN
=
lado Forest
```

e:

```text
EXIT
=
lado Cave
```

Para:

```text
CAVE_TO_FOREST
```

esperado:

```text
SPAWN
=
lado Cave

EXIT
=
lado Forest
```

A geometria deve reforçar a direção.

Não permitir que geração procedural inverta acidentalmente essa lógica.

---

# 18. PREPARAÇÃO VISUAL PARA MINING

A Caverna será futuramente o principal ambiente de Mining.

Nesta iteração é permitido preparar elementos ambientais que futuramente possam se tornar:

```text
OreNode
MineralVein
MiningPoint
```

Por exemplo:

- formações minerais;
- veios nas paredes;
- pedras diferenciadas;
- cristais;
- depósitos rochosos.

PORÉM, nesta iteração esses elementos são:

```text
DECORAÇÃO / LANDMARK
```

e NÃO recursos coletáveis.

Não implementar:

- picareta;
- interação de mineração;
- minério no inventário;
- Mining XP;
- Mining Level;
- barra de mineração;
- minigame de mineração;
- respawn de minério;
- receitas de minério;
- venda de minério;
- Smithing.

A arquitetura visual pode preparar o futuro sem ativar o sistema.

---

# 19. INIMIGOS

Não criar um grande novo bestiário nesta iteração.

Priorizar primeiro o bioma e o gerador.

Reutilizar inimigos existentes quando necessário para validar gameplay.

Se já existirem assets/inimigos apropriados para Caverna e adicioná-los for simples e seguro, pequenas adaptações podem ser feitas.

Porém isso NÃO deve virar uma iteração de criação de monstros.

Não implementar sistemas novos de IA.

---

# 20. BOSS FLOORS

Auditar como boss floors interagem com a nova sequência de biomas.

O sistema de biomas não pode quebrar a lógica existente de boss.

Não redesenhar bosses nesta iteração.

Se boss floors forem tratados como tipo especial de Floor, definir claramente como o bioma ambiental é aplicado a eles sem destruir sua regra especial.

Evitar arquitetura em que:

```text
floorType
```

precise escolher exclusivamente entre:

```text
Boss OU Cave
```

se conceitualmente essas propriedades puderem ser ortogonais.

Por exemplo, considerar separar:

```text
floorRole
```

de:

```text
biome / biomeTransition
```

se isso se encaixar melhor na arquitetura existente.

Auditar antes de decidir.

---

# 21. ARQUITETURA EXTENSÍVEL PARA FUTUROS BIOMAS

Embora somente Forest e Cave existam agora, evitar uma solução baseada em dezenas de condicionais rígidas como:

```text
if forest...
else if cave...
```

espalhadas pelo projeto.

Centralizar informações ambientais quando apropriado.

A arquitetura futura deve conseguir aceitar algo como:

```text
FOREST
CAVE
RUINS
SWAMP
VOLCANIC
...
```

sem reescrever todo o gerador.

Isso NÃO significa implementar esses biomas agora.

Somente deixar a estrutura extensível.

---

# 22. MODELO CONCEITUAL DE TRANSIÇÕES

Uma representação possível seria:

```text
FOREST
  │
  └── FOREST_TO_CAVE
          │
          ▼
        CAVE
          │
          └── CAVE_TO_FOREST
                  │
                  ▼
                FOREST
```

Ou, conceitualmente:

```text
BiomeState
    ↓
allowedTransitions
    ↓
FloorEnvironment
    ↓
nextBiomeState
```

Não é obrigatório usar esses nomes ou classes.

Adapte à arquitetura existente.

O requisito é o comportamento.

---

# 23. VALIDAÇÃO PROCEDURAL EM GRANDE QUANTIDADE

Não validar o algoritmo observando somente 10 andares.

Criar testes automatizados com muitas seeds e sequências maiores.

Exemplo:

```text
100 seeds
×
50 floors
```

ou volume equivalente razoável.

Verificar automaticamente:

- nenhuma transição inválida;
- nenhum salto direto Forest → Cave;
- nenhum salto direto Cave → Forest;
- ForestToCave sempre começa após Forest;
- CaveToForest sempre começa após Cave;
- ForestToCave resulta em Cave;
- CaveToForest resulta em Forest;
- mínimo de permanência respeitado;
- máximo configurado respeitado;
- determinismo;
- nenhuma sequência impossível;
- geração completa sem crash.

Se o custo dos testes for alto, usar quantidade equivalente que mantenha boa cobertura sem tornar a suíte impraticável.

---

# 24. VISUALIZAÇÃO DE DEBUG DA SEQUÊNCIA

Adicionar, se houver infraestrutura apropriada, uma forma de inspecionar em desenvolvimento a sequência gerada.

Por exemplo:

```text
Tower Seed: ABC123

01 FOREST
02 FOREST
03 FOREST
04 FOREST_TO_CAVE
05 CAVE
06 CAVE
07 CAVE
08 CAVE
09 CAVE_TO_FOREST
10 FOREST
```

Isso pode ser:

- log de desenvolvimento;
- helper;
- teste;
- ferramenta interna existente.

Não adicionar UI de debug visível ao jogador na build final se não for necessária.

O objetivo é facilitar futuras investigações procedurais.

---

# 25. COMPATIBILIDADE COM OS ANDARES ATUAIS

A implementação não pode destruir o vertical slice existente.

Auditar cuidadosamente a relação entre:

- Floor 1;
- Floor 2;
- Floor 3;
- boss atual;
- progressão;
- portal;
- recompensas;
- saída.

Se a sequência atual dos primeiros andares possui regras especiais importantes para onboarding/testes, preservá-las conscientemente.

Não forçar aleatoriedade nova nos primeiros andares se isso quebrar o fluxo atual.

Se necessário, permitir configuração de sequência fixa para o vertical slice e sequência procedural para testes/futuro.

Documentar a decisão.

---

# 26. NÃO IMPLEMENTAR OS 50 ANDARES COMPLETOS

A visão final continua sendo uma Torre com aproximadamente 50 andares.

Esta iteração NÃO precisa criar conteúdo artesanal para 50 pisos.

Precisamos criar a regra que seja capaz de ESCALAR para eles.

Para validação visual desta iteração, basta existir acesso suficiente para testar:

- Forest;
- ForestToCave;
- Cave;
- CaveToForest.

Pode ser criado um fluxo de desenvolvimento/teste apropriado para alcançar esses tipos rapidamente.

Não obrigar o desenvolvedor a jogar dezenas de andares apenas para testar CaveToForest.

---

# 27. TESTE VISUAL OBRIGATÓRIO

Validar visualmente, quando o ambiente permitir:

### Forest

Deve continuar reconhecível e funcional.

### Cave

Deve parecer claramente outro bioma.

### ForestToCave

O início deve parecer Forest.

O final deve parecer Cave.

### CaveToForest

O início deve parecer Cave.

O final deve parecer Forest.

Também verificar:

- câmera;
- colisão;
- spawn;
- saída;
- inimigos;
- combate;
- navegação;
- ausência de áreas inacessíveis críticas;
- ausência de sobreposição visual grave;
- ausência de saída bloqueada.

Se automação não conseguir observar a janela do jogo, declarar explicitamente a limitação e não marcar o teste visual como aprovado.

---

# 28. REGRESSÃO DO MULTIPLAYER

O Multiplayer 01 foi aprovado em teste real e não deve ser modificado nesta iteração.

Não alterar:

- protocolo;
- servidor;
- Render;
- endpoints;
- presença;
- heartbeat;
- reconnect;
- Origin;
- capacidade;
- sincronização do Hub.

Executar os testes existentes para garantir ausência de regressão.

Não realizar novo trabalho de infraestrutura multiplayer.

---

# 29. REGRESSÃO DE SAVE

Preservar saves existentes.

O usuário já confirmou em playtest que fechar e reabrir o jogo preserva:

- itens;
- Fishing;
- demais dados persistentes testados.

A nova implementação de biomas não deve invalidar o save atual.

Se alguma migração for inevitável, ela deve ser retrocompatível e documentada.

Não apagar saves automaticamente.

---

# 30. REGRESSÃO DE GAMEPLAY

Executar a suíte completa.

Preservar:

- personagem;
- movimento;
- câmera;
- combate;
- autoattack;
- habilidades;
- inimigos;
- inventário;
- equipamentos;
- atributos;
- progressão;
- portal;
- Refúgio;
- Armeiro;
- Fishing;
- Cooking;
- Mira;
- consumíveis;
- buffs;
- cooldowns;
- saves;
- multiplayer do Refúgio.

Não é necessário repetir manualmente uma campanha completa toda vez.

Usar testes automatizados + validação manual representativa.

---

# 31. BUILD JOGÁVEL OBRIGATÓRIA

REGRA PERMANENTE DO PROJETO:

> Toda implementação concluída deve atualizar também a build jogável e o instalador.

Ao terminar esta iteração:

1. executar suíte completa;
2. executar build web;
3. executar build desktop;
4. gerar Windows x64;
5. atualizar Setup;
6. atualizar Portable se continuar fazendo parte do pipeline;
7. criar pasta própria desta iteração;
8. preservar builds anteriores;
9. gerar hashes dos artefatos.

Não deixar a implementação somente no código-fonte.

---

# 32. VERSIONAMENTO

Utilizar o próximo versionamento coerente com o projeto.

A build anterior foi:

```text
DungeonMaster-Beta-0.1.1-Multiplayer01.1-Setup.exe
```

Esta nova entrega deve possuir identificação clara relacionada à Caverna/Biomas.

Exemplo conceitual:

```text
DungeonMaster-Beta-0.1.2-CaveBiome-Setup.exe
DungeonMaster-Beta-0.1.2-CaveBiome-Portable.exe
```

Pode adaptar ao padrão real do projeto.

Não sobrescrever a build Multiplayer 01.1 anterior.

---

# 33. ARTEFATOS

Criar uma pasta específica, por exemplo:

```text
release/cave-biome-playtest/
```

ou equivalente coerente com o pipeline atual.

Incluir somente artefatos úteis para teste/distribuição.

Informar:

- caminho;
- nome;
- tamanho;
- SHA-256;
- versão.

Destacar explicitamente qual Setup devo instalar.

---

# 34. CHECKLIST DE PLAYTEST

Criar:

```text
CHECKLIST-CAVE-BIOME.txt
```

Conteúdo mínimo:

```text
DUNGEON MASTER — CAVE BIOME PLAYTEST

[ ] Jogo instala.
[ ] Jogo abre.
[ ] Save anterior carrega.
[ ] Refúgio continua funcionando.
[ ] Forest continua funcionando.
[ ] Forest possui identidade visual preservada.
[ ] ForestToCave foi encontrado/testado.
[ ] ForestToCave começa como Floresta.
[ ] ForestToCave termina como Caverna.
[ ] Cave foi encontrado/testado.
[ ] Cave possui identidade visual própria.
[ ] Cave possui geometria jogável.
[ ] Combate funciona na Cave.
[ ] Inimigos navegam corretamente na Cave.
[ ] Saída da Cave funciona.
[ ] CaveToForest foi encontrado/testado.
[ ] CaveToForest começa como Caverna.
[ ] CaveToForest termina como Floresta.
[ ] Retorno para Forest funciona.
[ ] Nenhuma transição apareceu invertida.
[ ] Nenhuma saída ficou bloqueada.
[ ] Não encontrei área crítica inacessível.
[ ] Fishing continua funcionando.
[ ] Cooking continua funcionando.
[ ] Inventário continua funcionando.
[ ] Save continua funcionando após fechar/reabrir.
[ ] Multiplayer do Refúgio continua conectando.
[ ] Nenhum crash crítico.

Seed utilizada:

Sequência observada:

Problemas:

Passos para reproduzir:

Observações:
```

---

# 35. TESTES AUTOMATIZADOS

Adicionar testes apropriados para:

- representação de bioma;
- representação de transição;
- Forest → Forest;
- Forest → ForestToCave;
- ForestToCave → Cave;
- Cave → Cave;
- Cave → CaveToForest;
- CaveToForest → Forest;
- rejeição de transições inválidas;
- permanência mínima;
- limite máximo;
- determinismo;
- geração com múltiplas seeds;
- spawn;
- saída;
- conectividade do FloorGraph;
- compatibilidade com boss floor;
- ausência de regressão no gerador Forest;
- serialização/representação quando relevante;
- compatibilidade futura com FloorRecord quando testável sem implementar persistência.

Não escrever testes frágeis dependentes de detalhes visuais irrelevantes.

Testar comportamento e invariantes.

---

# 36. BUILD WEB

Executar:

```text
npm run build
```

ou equivalente atual.

Registrar:

- sucesso/falha;
- quantidade de módulos;
- tamanho JS;
- gzip;
- CSS;
- gzip;
- warnings.

O warning preexistente de chunk grande não deve virar uma refatoração paralela.

---

# 37. BUILD DESKTOP

Executar o pipeline desktop atual.

Gerar nova build Windows x64.

Preservar:

- Electron;
- segurança atual;
- protocolo `dungeon://game`;
- multiplayer público existente;
- perfil de save;
- comportamento de instalação.

Não migrar stack.

---

# 38. RELATÓRIO FINAL OBRIGATÓRIO

Ao terminar, entregar relatório com estas seções:

## 1. Auditoria inicial

Como o gerador funcionava antes.

## 2. Arquitetura de biomas

Como Forest/Cave/transições foram representados.

## 3. Máquina/regra de transições

Como o bioma atual determina os próximos tipos válidos.

## 4. Permanência de bioma

Mínimo, comportamento procedural e máximo adotados.

## 5. Determinismo

Como a seed controla sequência e geração.

## 6. Cave

Geometria, identidade visual e diferenças em relação à Forest.

## 7. ForestToCave

Como a transição foi construída.

## 8. CaveToForest

Como a transição inversa foi construída.

## 9. Preparação para Mining

Quais elementos ambientais foram preparados, deixando explícito que ainda não são interativos.

## 10. Boss Floors

Como continuam compatíveis com os biomas.

## 11. Persistent Floors

Como a arquitetura foi preparada sem implementar o sistema.

## 12. Testes procedurais

Quantidade de seeds/floors testados e invariantes verificadas.

## 13. Regressão

Quantidade de testes antes/depois, aprovados e falhas.

## 14. Validação visual

O que realmente foi observado manualmente.

Não declarar o que não foi observado.

## 15. Multiplayer

Confirmação de que não foi expandido e testes existentes continuam passando.

## 16. Saves

Compatibilidade com saves anteriores.

## 17. Build web

Resultado e métricas.

## 18. Build desktop

Resultado.

## 19. Instalador

Nome e versão.

## 20. Artefatos

Caminhos, tamanhos e SHA-256.

## 21. ARQUIVO PARA PLAYTEST

Escrever explicitamente:

```text
INSTALE ESTE ARQUIVO PARA TESTAR A ITERAÇÃO DE CAVERNA:

<caminho exato>
```

## 22. Testes que EU ainda preciso executar

Checklist manual.

## 23. Limitações conhecidas

Listar claramente.

## 24. Próximo passo recomendado

Se a Caverna for aprovada, recomendar apenas conceitualmente:

```text
Mining
```

Não implementá-la automaticamente.

---

# 39. CRITÉRIOS DE ACEITAÇÃO

A iteração está pronta para playtest quando:

- Forest continua funcionando;
- Cave existe;
- Cave possui identidade própria;
- ForestToCave existe;
- CaveToForest existe;
- transições possuem direção correta;
- não existe salto procedural inválido entre biomas;
- permanência mínima funciona;
- limite de permanência funciona;
- sequência é determinística;
- geração suporta múltiplas seeds;
- FloorGraph continua válido;
- spawn e saída continuam acessíveis;
- combate funciona nos novos layouts;
- boss floors não foram quebrados;
- saves anteriores continuam compatíveis;
- Fishing continua funcionando;
- Cooking continua funcionando;
- Multiplayer 01 não sofreu regressão;
- suíte completa passa;
- build web passa;
- build desktop passa;
- novo Setup é gerado;
- checklist é gerado.

---

# 40. FORA DE ESCOPO

NÃO implementar nesta iteração:

- Mining;
- picareta;
- minério coletável;
- Mining XP;
- Mining Level;
- minigame de Mining;
- Smithing;
- Forja;
- crafting de armas;
- upgrade de equipamentos;
- Marketplace;
- Party;
- Tower Multiplayer;
- Floor Inheritance;
- Persistent Floors;
- backend de saves;
- autenticação;
- novos sistemas multiplayer;
- teste de carga de 35 jogadores;
- novo grande bestiário;
- novos bosses;
- quests;
- puzzles complexos;
- terceiro bioma;
- Ruins;
- Swamp;
- Volcanic;
- sistema de iluminação complexo;
- lanterna/tocha obrigatória.

---

# 41. PRINCÍPIO DESTA ITERAÇÃO

Não tentar construir Caverna + Mining + Smithing ao mesmo tempo.

A sequência planejada é:

```text
AGORA
│
├── Sistema de Biomas
├── Cave
├── ForestToCave
└── CaveToForest
        │
        ▼
PRÓXIMA ITERAÇÃO
│
└── Mining
        │
        ▼
ITERAÇÃO POSTERIOR
│
└── Smithing / Forja no Refúgio
```

Primeiro provar o ambiente.

Depois transformar o ambiente em atividade.

Depois transformar os recursos obtidos em progressão/economia.

---

# 42. STOP

Depois de:

- implementar o sistema de biomas;
- implementar Cave;
- implementar ForestToCave;
- implementar CaveToForest;
- validar as regras procedurais;
- executar testes;
- executar regressão;
- gerar build web;
- gerar build desktop;
- atualizar Setup;
- atualizar Portable se aplicável;
- gerar checklist;
- gerar artefatos;
- entregar relatório;

PARE.

NÃO começar Mining.

NÃO começar Smithing.

NÃO continuar Multiplayer.

NÃO implementar Persistent Floors.

NÃO criar terceiro bioma.

A próxima decisão será tomada somente depois do playtest visual da Caverna.