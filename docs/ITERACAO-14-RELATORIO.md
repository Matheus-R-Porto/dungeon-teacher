# Dungeon Master — Iteração 14 · Tower Progression

Beta 0.1.4 · Windows x64 · 09/10/2026. Entrega para playtest. A validação foi feita no app real com um harness fora de tela, **sem jogo manual**: veja a seção 15.

**Playtest manual (responsável, 09/10/2026): aprovada.** O responsável testou a build e informou que funciona como previsto, incluindo a alternância aleatória de biomas. O restante deste relatório descreve o estado na entrega.

## 1. Auditoria inicial

- `biomeSequence` usava mínimo 3 e máximo 7 andares puros com 40% de chance fixa. A campanha normal pré-gerava só os andares 1–3 e **terminava no boss**: `return-portal` do andar 3 chamava `endRun('success')`, e `complete` do andar 3 exigia o boss. Só `Explorar biomas` gerava andares além do 3, sob demanda, com limite 50.
- `floorRole` e `floorEnvironment` já eram independentes; o boss do andar 3 vem de `floorRole`, não do bioma.
- O baú do boss era concedido a **cada** run (`rewardSeed` por run), sem marcador por personagem.
- O estado dos portões era por instância de andar; revisitar um andar sempre o regerava fechado.
- Vários testes antigos fixavam o comportamento que a especificação muda: boss encerra a campanha (iteração 07), regras 3–7 de bioma (iteração 12), andar 3 sempre Floresta (hash de baseline e testes de Mining).

## 2. Nova máquina de probabilidades

`BIOME_RULES` (`src/world/biomes.js`) guarda duas tabelas; o índice é o número de andares puros desde o início da run (primeira transição) ou desde a última transição (ciclo), com o último valor valendo como garantia:

| Índice | Primeira transição | Ciclo recorrente |
|---:|---:|---:|
| 0 | 0% (andar 1) | 0% (1º andar após transição: destino puro, obrigatório) |
| 1 | 0% (andar 2) | 10% |
| 2 | 50% (andar 3) | 50% |
| 3 | 75% (andar 4) | 75% |
| 4+ | 100% (andar 5) | 100% |

O estado ganhou `transitions`, que escolhe a tabela. `advanceBiome` rejeita salto de bioma, transição com chance 0, ficar no bioma com chance 1 e transições em sequência. **Quando** (`transitionChance`) e **para onde** (`transitionTargets`) são decisões separadas: hoje só há um destino por bioma, e um novo bioma só estende a segunda função. Há sempre um sorteio por andar. A sequência usa o stream independente `biome-sequence:v2` (mudou de `v1` porque o algoritmo mudou; a sequência por seed mudou, como a especificação prevê).

## 3. Exemplos reais por seed

```text
seed   0:  1 F  2 F  3 F  4 F→C  5 C  6 C→F  7 F  8 F  9 F→C  10 C  11 C→F  12 F
seed   1:  1 F  2 F  3 F→C  4 C  5 C  6 C→F  7 F  8 F  9 F  10 F→C  11 C  12 C→F
seed   3:  1 F  2 F  3 F  4 F  5 F→C  6 C  7 C→F  8 F  9 F  10 F→C  11 C  12 C  13 C→F
seed  42:  1 F  2 F  3 F  4 F→C  5 C  6 C  7 C→F  8 F  9 F  10 F  11 F→C  12 C  13 C  14 C
seed 123:  1 F  2 F  3 F  4 F  5 F→C  6 C  7 C  8 C  9 C→F  10 F  11 F  12 F→C  13 C  14 C
```

Estatística (amostras com tolerância, não distribuição exata): em 4000 seeds, 50% ± 4 pontos transitam no andar 3; entre as que não transitaram, 75% ± 5 no andar 4; todas até o 5. Em 2500 seeds × 50 andares, o intervalo entre transições é sempre de 2 a 5 e as frequências condicionais são 10% ± 2, 50% ± 3, 75% ± 3 e 100%.

## 4. Integração com o FloorGraph

Nenhuma mudança em `floor-graph.js`: o grafo e o materializador já recebiam `environment` explícito e usam `environmentFor` por padrão. O RNG de layout não é consumido pela sequência de biomas. Prova: 12 hashes (4 ambientes × 3 seeds) de grafo, trilhas, encontros, POIs, portões, veios e obstáculos foram gerados com o **gerador da Iteração 13** (commit `be785d5`) e o teste confere que o gerador atual reproduz cada um (`tests/iteration14-layout-baseline.json`).

## 5. Progressão normal após o andar 3

O portal principal de qualquer andar vai ao seguinte; andares sem definição são gerados sob demanda a partir da seed da run (`generateFloor(seed, n, hub, {floorRole:'normal'})`), no mesmo caminho que o Explorar biomas já usava. `TOWER_LIMIT = 50`: no andar 50 o portal principal leva ao Refúgio com a mensagem "Você alcançou o limite atual da Torre (andar 50)…", sem andar 51 e sem falso boss final (testado).

**Balanceamento provisório após o andar 3** (`POST_THREE` em `src/domain/expedition.js`): HP +3%, ataque +2% e XP +2% por andar acima do 3, limitado ao andar 50 (no 50: HP ×2,4; ataque ×1,9; XP ×1,9). Até o andar 3 o fator é exatamente 1 (testado). Os números não foram playtestados.

## 6. Boss provisório e continuação

O andar 3 mantém boss, arena, combate, XP, atraso de 2 s e baú. Depois da vitória há **dois portais**: o principal (rótulo "Subir para o Andar 4") e `refuge-portal` (rótulo "Retornar ao Refúgio"), posicionado a 5 unidades do arco, com visual próprio (anel dourado). Ambos exigem o Guardião derrotado **e** o baú coletado ("Pegue o baú antes de seguir"), para a recompensa não se perder. Nada começa sozinho: o andar 4 só é gerado quando o jogador usa o portal (testado). O baú é coletado uma vez e a continuação não o duplica.

## 7. Persistência de andares concluídos

`character.tower = {highestClearedFloor, claimedRewards}` (`src/domain/tower-progress.js`). O marcador só avança de 1 em 1 e só na campanha (`run.mode === 'campaign'`, fora de stress). **Quando conta:** no instante em que o andar passa a `complete` (encontros obrigatórios resolvidos; no andar 3, Guardião derrotado). Isso é uma leitura de "estado válido de saída": o jogador não precisa cruzar o portal, o que permite escolher voltar ao Refúgio sem perder a conclusão. O salvamento é imediato (`onFloorCleared`). Não contam: entrar, teleporte de debug, stress, Explorar biomas, morrer ou abandonar antes de resolver os desafios.

## 8. Reentrada e portões

Na revisita de um andar concluído da campanha, `enter()` abre os portões na hora, marca os encontros como concluídos e `complete` vale `true`; **os inimigos continuam vivos, com IA, ataque, colisão e XP**. Fishing e Mining seguem normais. O texto de objetivo e o rótulo do portal informam "Andar já concluído". O portal da Torre ainda começa no andar 1 (sem atalho, como pedido); os andares 1 a 3 concluídos são atravessados com os portões abertos, e o andar 4 em diante continua exigindo os encontros.

**Decisão sobre o Guardião na revisita:** ele **não reaparece**. É a solução mais simples compatível com "não bloquear a saída" e "não duplicar o baú". Se o personagem concluiu o andar 3 sem pegar o baú, a revisita oferece o baú uma única vez (sem boss), para a recompensa nunca se perder.

## 9. Recompensas únicas

`claimedRewards` guarda `boss-floor-3`. A coleta registra o marcador e o item no mesmo salvamento; uma falha de gravação desfaz ambos (testado). Em runs seguintes não há boss nem baú, e `collectChest` recusa com "Este baú já foi obtido por este personagem". Recompensas de inimigos comuns, Fishing e Mining não são afetadas.

## 10. Isolamento do Explorar biomas

Seu `run.mode` continua `biome-playtest`. Ele nunca avança o marcador, nunca reivindica recompensa, nunca trata andares como revisita (nem para quem já concluiu 40 andares) e não altera a sequência canônica. Testado para os quatro ambientes, e também no app real pelos botões da interface.

## 11. Integração com Mining

Nenhuma regra de Mining mudou. Com seed 1 a campanha chegou à Caverna sem Explorar biomas: andar 3 Floresta → Caverna (já com veios na parte subterrânea) e andar 4 Caverna (3 veios). O único ajuste foi o de legibilidade pedido na seção 22 da especificação: um **banner grande de resultado** (ERROU!, BOM!, PERFEITO!, com o XP e a recompensa), alimentado por `MiningRuntime.result`, só apresentação, sem tocar nas contas do minigame.

## 12. Compatibilidade com saves

Sem mudança de versão de esquema. `tower` é aditivo: save sem o campo carrega com `{0, []}` e **nada é inferido** de nível, itens ou baús (testado e visto no app real com um perfil nos moldes da Iteração 13: ouro, nível, Mining, Pesca, minério, picareta e arma preservados). Valores inválidos são rejeitados (negativo, acima de 50, não inteiro, recompensa desconhecida).

## 13. Testes novos

`tests/iteration14.test.js`, **34 testes**: tabelas e chances exatas, andares 1–2 sempre Floresta, 50%/75%/100% e o ciclo 10%/50%/75%/100% (amostrados com tolerância), direção e destino das transições, ausência de transições consecutivas, rejeições de `advanceBiome`, separação quando/onde, determinismo e independência do RNG de layout, hashes da Iteração 13, boss e saídas do andar 3 em 80 seeds, escalonamento acima do 3, persistência e validação de `tower`, save antigo, continuar e retornar após o boss (Floresta e Floresta → Caverna), portais selados antes do baú, conclusão válida, ausência de progresso por abandonar/morrer/entrar/teleporte/stress/Explorar biomas, revisitas (portões, inimigos, XP, andar 3 sem boss, andar 4 ainda fechado, baú pendente), recompensa única e rollback, Fishing em revisita, andar 50, geração sob demanda, Mining na campanha e dados do banner.

## 14. Regressão

Antes: 418. Agora: **452 aprovados, 0 falhas, 0 ignorados** (150 s). [Log](ITERACAO-14-TESTES.txt). Testes antigos **atualizados** (não removidos), todos por mudança real da especificação:

- `iteration07` (2 testes): depois do boss, voltar ao Refúgio passou a usar `refuge-portal`; `return-portal` agora sobe.
- `iteration10` (baseline de hashes): fixa `environment: 'FOREST'`, porque o andar 3 pode ser Floresta → Caverna.
- `iteration12` (3 testes): regras de bioma 3–7 substituídas pelas novas tabelas; saída do andar de boss.
- `iteration13` (1 teste): "Floresta pura nunca tem veios" não assume mais que o andar 3 é Floresta.

Um bug real foi achado **na validação visual**, não nos testes: no andar 4 o objetivo ainda dizia "Baú obtido · suba pelo portal…", porque as flags do boss ficavam ligadas na run. Corrigido (`enter()` limpa as flags em andares sem boss) e coberto por asserção em `iteration14`.

## 15. Validação visual — o que foi e o que não foi feito

O painel de navegador do app ficou oculto de forma intermitente (o que pausa o jogo), então rodei o **Electron do projeto fora de tela** contra o servidor de desenvolvimento, com renderização WebGL real, entrada de teclado real, capturas de tela e um gancho de debug **temporário** em `main.js` para teleportar e causar dano. O gancho foi removido antes da build (confirmado: nenhuma ocorrência no bundle empacotado).

**Observado (28 + 11 verificações, todas aprovadas, mais capturas):** portal normal → andar 1 Floresta com portões fechados → conclusão registra `highestClearedFloor = 1` com a mensagem "ANDAR 1 CONCLUÍDO" → andar 2 → andar 3 Floresta → Caverna → conclusão dos encontros sem completar o andar → Guardião ativado, derrotado → andar 3 concluído → baú aparece → portal principal recusa antes do baú → coleta → andar 4 **não** começa sozinho → os dois portais com rótulos e visual → retorno ao Refúgio mantendo marcador e baú → "Maior andar concluído 3" no painel C → revisita do andar 1 com portões abertos, 5/5 inimigos vivos e objetivo "Andar já concluído" → revisita do andar 3 sem Guardião e sem segundo baú → continuar ao andar 4 Caverna com portões fechados → objetivo corrigido → veios no andar 4 → banners ERROU!, BOM! (+1 Minério Bruto, +8 XP) e PERFEITO! (+12 XP, bônus) → totais de minério, XP e veios esgotados → registro no banco e recarga mantendo `highestClearedFloor = 3`. Também: save no formato da Iteração 13 (sem `tower`) carregando sem perdas, e os quatro ambientes do Explorar biomas iniciados pelos botões, resolvidos, sem alterar o marcador.

**Não feito:** combate real e caminhada real do início ao fim (inimigos foram eliminados com dano direto e o jogador foi posicionado por teleporte entre as etapas); a luta do Guardião não foi jogada à mão; a janela nativa do Electron instalada, a instalação interativa, o multiplayer em duas máquinas e fechar/reabrir o executável não foram exercidos. Em renderização por software o jogo rodou a ~4 quadros por segundo, então nada sobre desempenho foi medido.

## 16. Limitações conhecidas

- Balanceamento acima do andar 3 é provisório e sem playtest. Subir até o 50 a pé é longo; não há atalho (checkpoints ficam para outra iteração).
- O portal sempre começa no andar 1; os andares concluídos só ficam livres para travessia.
- Não existe boss de andar 5, 10, 15 etc. nem boss final no andar 50.
- O Guardião não reaparece em revisitas, nem como combate opcional.
- O marcador de conclusão é gravado quando o andar fica resolvido, não quando se cruza o portal. Quem resolve um andar e abandona o andar sem cruzar o portal já conta como concluído.
- "Maior andar concluído" só aparece no painel C.
- Arte provisória; o portal de retorno é um anel dourado simples.
- Layouts continuam temporários (sem Persistent Floors).

## 17. Build web

Aprovada: 80 módulos; JS 778,57 kB (213,76 kB gzip); CSS 28,70 kB (7,58 kB gzip); HTML 7,79 kB. Permanece o aviso preexistente de chunk acima de 500 kB.

## 18. Build desktop

`desktop:package:playtest` (verificação do endpoint WSS, build, electron-builder 26.15.3, Electron 44.5.1) terminou com código zero em `release/tower-progression-build/`. ASAR inspecionado: versão 0.1.4, tabela de progresso, portal de retorno, mensagem de limite, stream `biome-sequence:v2` e banner presentes; checklist embutido é o novo; endpoint multiplayer idêntico ao anterior; sem gancho de debug.

Multiplayer: nenhum arquivo de `server/`, `shared/`, `config/` nem do shell do desktop foi alterado; os testes de multiplayer fazem parte dos 452.

## 19. Artefatos e SHA-256

Pasta `release/tower-progression-playtest/`; builds anteriores (`cave-biome-playtest`, `mining-playtest`) preservadas. Mesmo appId e perfil `%APPDATA%\Dungeon Master`. Sem assinatura digital, como as anteriores. Detalhes em [ARTEFATOS.txt](../release/tower-progression-playtest/ARTEFATOS.txt).

| Arquivo | Bytes | SHA-256 |
|---|---:|---|
| CHECKLIST-TOWER-PROGRESSION.txt | 1915 | 912410A5E9E96291494600C8311F60DE1E8CEAC5CB433613739E3AB001E31778 |
| DungeonMaster-Beta-0.1.4-TowerProgression-Portable.exe | 111270077 | F9FD82522D1820B8EA73C1F8E89B9A54777D0714D37786601B65E87A9DD84368 |
| DungeonMaster-Beta-0.1.4-TowerProgression-Setup.exe | 111500164 | 90001956D1BE7B522553CB43E46019C053F8DDAEE9CFD071AD6CF1DB2933276F |
| LEIA-ME.txt | 5827 | 6693BC6DDCBADAE60BB1EE1B37CAAC264E07B88316FFA0D3C6CD4CB062187D0E |

## 20. ARQUIVO PARA INSTALAÇÃO

**INSTALE ESTE ARQUIVO PARA TESTAR A ITERAÇÃO 14:**

`C:\Users\theuz\.codex\.chatgpt-projects\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\tower-progression-playtest\DungeonMaster-Beta-0.1.4-TowerProgression-Setup.exe`

Fluxo: equipar arma, entrar pelo portal normal, resolver os andares 1 e 2, derrotar o Guardião, pegar o baú e escolher subir ou voltar. Compre a Picareta Simples no Armeiro para minerar quando a primeira Caverna aparecer (entre os andares 3 e 5).
