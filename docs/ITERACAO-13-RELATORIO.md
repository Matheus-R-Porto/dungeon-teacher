# Dungeon Master — Iteração 13 · Mining

Beta 0.1.3 · Windows x64 · 09/10/2026. Entrega para playtest. **A validação visual foi parcial (PERFECT, janela nativa e instalação não observados); veja a seção 11.**

## 1. Auditoria inicial

Fishing foi o molde: `FishingRuntime` (simulação), `FishingHud`, posse da vara por `Inventory.owns`, recompensa montada num rascunho do personagem e salva uma vez. O "painel de Life Skills" existente é o `FishingHud` (mostra Pesca e Culinária); Mining ganhou uma linha ali. `LIFE_SKILLS` já listava `mining` como inativo, e o `decodeLifeSkills` já tratava a ausência de `cooking` em saves antigos, padrão estendido para Mining.

Achados que moldaram o desenho:

- O Armeiro só entregava itens **gratuitos** (`data-acquire`). Compra com ouro não existia no Armeiro; só na Mira (`FoodService`). Criei `src/domain/shop.js`.
- `game.activity` apontava só para a pesca e é consumido por combate, habilidades e `equipmentBlocked`. Virou um agregado (pesca + mineração).
- Os três andares do portal normal são sempre Floresta (`BIOME_RULES.minimumPureFloors = 3`). **O portal normal não tem veios**; só Explorar biomas leva a Caverna, como o prompt já previa.
- Um teste de baseline (hash SHA-256 de grafo, trilhas, spawns, POIs e portões da Floresta) obriga a geração existente a continuar idêntica. Os veios foram feitos para não tocar nisso.

## 2. Mining

Terceira Life Skill ativa, com nível e XP próprios, na mesma curva de Fishing/Cooking (`lifeXPRequired`). Não usa XP de combate nem atributos. Save antigo sem `mining` recebe `{level 1, xp 0}` sem perder nada; entradas inválidas continuam rejeitadas; `smithing` segue inativo.

## 3. Picareta

`simplePickaxe`: ferramenta (`type: tool`), única, sem slot de equipamento, sem durabilidade, preço **30 ouro** (alguns peixes vendidos à Mira, ou cerca de um terço do ouro de um baú). `purchaseItem` valida estoque, posse, ouro e espaço **antes** de mutar; o painel já desfazia a alteração em memória se o salvamento falhasse. O botão fica desabilitado enquanto salva, e como o item é único não há compra dupla. Loja da Mira e comércio de Cooking não foram alterados. Vara e armas continuam gratuitas.

## 4. Veios minerais

`src/world/mineral-veins.js`, chamado depois de `addWaterFeatures`. Usa um stream de seed próprio (`runSeed:andar:mineral-veins`), então **não consome nem altera** o RNG da geração existente. Regras:

- Só em andares não Floresta, e só onde `caveAt(z) ≥ 0,6` (lado subterrâneo das transições).
- Fora de entrada, saída, boss e encontros; a 8+ de spawn e portal; fora de lagos e de pontos de pesca; a 3,5+ de inimigos e 3+ de outros interativos; a mais de `raio_da_trilha + raio_do_veio + 0,5` de qualquer eixo de trilha; espaçados em 6+.
- Cada candidato precisa ser alcançável a partir da clareira com a rocha já contada (`findPath`).
- Prioridade para desvios opcionais, depois a trilha principal. Meta de 3 por andar, máximo 4 (`MINING`).

Cada veio é um obstáculo circular sólido (`kind: mineralVein`) mais um interativo `mining`. Visual: rocha clara com cristais âmbar emissivos e halo no chão, diferente dos cristais azuis decorativos; esgotado vira entulho cinza. O rótulo "◆ Veio mineral" flutua sobre ele. O resultado sobre a geração: Floresta 0 veios; Caverna e as duas transições, 3 por andar nas 60 seeds sondadas.

## 5. Minigame

Tempo de simulação, não de frames (idêntico a 30, 60 e 144 FPS, testado). Pressionar F ou Espaço com o veio ao alcance: 0,5 s de preparo (input antecipado é ignorado), depois um indicador vai e volta numa barra (1,6 s por varredura). A zona de acerto fica numa posição sorteada por seed (30–70%). **PERFECT** ±4%, **GOOD** ±11%, senão **MISS**. Sem acerto em 7 s conta como erro. Esc cancela.

## 6. Recompensas

1 sucesso = 1 Minério Bruto (`rawOre`: empilhável até 99, sem valor de venda, não vendável; a Mira o recusa, testado). XP: GOOD 8, PERFECT 12. MISS não custa HP, ouro nem picareta; permite nova tentativa após 1,5 s por veio. Após sucesso o veio fica **esgotado** naquela instância de andar. O estado vive só no mundo clonado; nada de veio é salvo.

## 7. Interrupções e atomicidade

O golpe vira recompensa em um único passo: valida de novo vida, área, veio e picareta; monta o rascunho; marca o veio `reserved` de forma síncrona; salva uma vez; só então aplica inventário e XP à memória e marca `exhausted`. Se o salvamento falhar, o veio volta a `available` e nada muda. Entrada repetida durante o salvamento devolve a mesma operação (um único salvamento, testado); `start` retorna `false` enquanto ocupado. Cancelam sem recompensa (todos testados): Esc, dano, morte, troca de andar, retorno ao Refúgio, abandono, golpe hostil e reset da sessão. Não há timers nem listeners; um `strike()` tardio após cancelar devolve `false`. Mineração e pesca são mutuamente exclusivas. Mineração em curso bloqueia movimento, habilidades, ataque e troca de equipamento, e o mundo continua rodando.

## 8. Saves

Sem migração de esquema e sem mudança de versão do save. Itens novos entram pela validação existente do inventário. Testes cobrem save sem `mining`, save sem `lifeSkills`, preservação de ouro, Fishing e Cooking, pilha de minério (99 + 1) e rejeição de pilha inválida.

## 9. Testes procedurais

Regras verificadas sobre mapas materializados: 40 seeds × 3 biomas (determinismo; 1 a 4 veios; terreno subterrâneo; fora de corredores, água, spawn e portal; obstáculo e interativo coerentes; espaçamento), 110 mapas de Floresta sem veios (incluindo as 3 do portal normal), lado subterrâneo das duas transições em 40 seeds, e conectividade (spawn→portões→saída, desvios, inimigos, alcance de cada veio) em 15 seeds × 3 biomas. Materialização cara separada das regras, como na Iteração 12.

## 10. Regressão

Antes: 373 testes. Depois: **418 aprovados, 0 falhas, 0 ignorados** (125 s), com 45 testes novos em `tests/iteration13.test.js`. [Log](ITERACAO-13-TESTES.txt). Três testes antigos foram **atualizados, não removidos**, porque codificavam "Mining inativo" e o formato `{fishing, cooking}` das Life Skills: dois em `iteration10.test.js` (o exemplo de profissão inativa passou a ser `smithing`) e um em `iteration11.test.js`. Hashes de baseline da Floresta, Fishing, Cooking, comércio e multiplayer passam sem alteração.

## 11. Validação visual — o que foi e o que não foi observado

Observado no navegador local (perfil `test=1`, seed 42, Floresta → Caverna, andar 6), em duas sessões:

- Painel Life Skills com "Mineração 1 · XP 0 / 30"; perfil novo nasce com `mining` salvo; etiqueta de versão "BETA 0.1.3 MINING".
- Armeiro: loja lista a Picareta Simples a 30 ouro; a compra levou o ouro de 100 para 70 e o botão virou "Já possuído"; a picareta ficou no inventário sem ocupar o slot de arma; espada equipada.
- Veio na Caverna: rocha clara com cristais âmbar e halo dourado, bem distinto das rochas escuras e dos cristais azuis decorativos. Rótulo "◆ Veio mineral", depois "◆ Veio mineral · F para minerar" e o prompt "Minerar · veio mineral". (A primeira versão do visual era ilegível; a versão corrigida foi vista na tela e está legível.)
- Minigame: barra, zona verde, zona dourada e indicador em movimento.
- **MISS**: "Você errou o golpe.", nenhum XP, nenhum item.
- **GOOD**: "Mineração concluída! +1 Minério Bruto · Mining XP +8"; XP foi para 8/30; o veio virou entulho cinza com rótulo "◇ Veio esgotado" e prompt "Veio esgotado · já foi minerado".
- Nova tentativa no veio esgotado: "Este veio já foi minerado." e o minigame não abriu.
- Inventário: Minério Bruto (quantidade 1) com a descrição correta, ao lado da picareta.
- Persistência: o registro do perfil de teste no IndexedDB continha `rawOre×1`, `mining {1, 8}`, ouro 70, espada equipada, XP de combate e Pesca inalterados. O carregamento do save após recarregar a página foi visto na primeira sessão (ouro 70 e Mineração 1 após o recarregamento); a releitura visual do minério e do XP 8 após recarregar **não** foi concluída, porque o painel ficou oculto.
- Console: sem erros.

**Não observado na tela**: o golpe **PERFECT** (coberto por testes automatizados, mesmo caminho de código do GOOD), a barra de PERFECT em jogo, o retorno ao Refúgio com o minério já na mochila, a janela nativa do Electron e a instalação interativa. O painel do navegador do app ficou oculto de forma intermitente (`document.hidden = true`), o que pausa a animação do jogo, e não consegui reexibi-lo.

## 12. Multiplayer

Nenhum arquivo de `server/`, `shared/`, `desktop/network.cjs`, `config/multiplayer.json` nem o protocolo (`NET.version = 1`) foi alterado. Os 27 testes de multiplayer passam. O ASAR da build contém o mesmo endpoint WSS público. Mining é local, sem sincronização.

## 13. Build web

Aprovada: 79 módulos; JS 772,71 kB (212,03 kB gzip); CSS 27,58 kB (7,31 kB gzip); HTML 7,79 kB. Permanece o aviso preexistente de chunk acima de 500 kB.

## 14. Build desktop

`desktop:package:playtest` (verificação do endpoint WSS, build, electron-builder 26.15.3, Electron 44.5.1) terminou com código zero. Staging em `release/mining-build/`. O ASAR foi inspecionado: versão 0.1.3, `simplePickaxe`, `rawOre`, `mineralVein`, "Veio mineral", "Explorar biomas" e o endpoint público presentes; checklist embutido é o de Mining.

## 15. Instalador

`DungeonMaster-Beta-0.1.3-Mining-Setup.exe`, produto 0.1.3, versão Windows 0.1.3.1. Portable atualizado. Builds anteriores preservadas (`release/cave-biome-playtest/` intacta). Mesmo appId e perfil `%APPDATA%\Dungeon Master`. Sem assinatura digital, como as anteriores.

## 16. Artefatos

Pasta `release/mining-playtest/`; caminhos completos, tamanhos e SHA-256 em [ARTEFATOS.txt](../release/mining-playtest/ARTEFATOS.txt).

| Arquivo | Bytes | SHA-256 |
|---|---:|---|
| CHECKLIST-MINING.txt | 1813 | 083E5091470F0124A2038849073F19E0AC870EE70FEB5B7BBC5A4F8EF52700BA |
| DungeonMaster-Beta-0.1.3-Mining-Portable.exe | 111268118 | 23109EDF58F4D9BD71CD8AB9C59EFCB1A2615735C61B62081D1DDF375CA154A2 |
| DungeonMaster-Beta-0.1.3-Mining-Setup.exe | 111498199 | D0DFFF16C02F778063ADE19666003DD1C9E94E5DA37C1BCEE20F0DB94C13618E |
| LEIA-ME.txt | 4496 | A287D9D0910903089E11060CF750E2E0D611F6D9143FD289BF69921EA317E2E8 |

## 17. ARQUIVO PARA PLAYTEST

**INSTALE ESTE ARQUIVO PARA TESTAR MINING:**

`C:\Users\theuz\.codex\.chatgpt-projects\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\mining-playtest\DungeonMaster-Beta-0.1.3-Mining-Setup.exe`

Fluxo: comprar a picareta no Armeiro (30 ouro), equipar uma arma, Explorar biomas → Caverna (ou uma transição), achar o veio, F, golpear com F ou Espaço.

## 18. Testes manuais pendentes

Tudo o que a seção 11 lista como não observado (PERFECT na tela, retorno ao Refúgio com o minério, janela nativa e instalação). Preencha [CHECKLIST-MINING.txt](../release/mining-playtest/CHECKLIST-MINING.txt). Atenção especial: **usabilidade da barra** (tamanho das zonas e velocidade são valores iniciais em `src/domain/mining.js`).

## 19. Limitações conhecidas

- O portal normal (3 andares de Floresta) não tem veios; só Explorar biomas chega a eles.
- Ouro inicial é 0, então um personagem novo precisa vender peixes ou abrir um baú antes de comprar a picareta. Intencional e dentro da economia atual, mas pode parecer lento em playtest.
- Veios ficam atrás dos portões de encontro quando estão em desvios; é preciso resolver o primeiro encontro (ou usar os botões de inspeção de debug).
- Minério Bruto não tem uso nem preço de venda de propósito (evita exploração antes da Forja).
- Cada veio exige a barra completa; não há automação nem fila de golpes.
- Arte provisória: rocha, cristais e barra são primitivas e CSS simples.
- Nenhum teste de interface do DOM (loja, HUD) roda em Node; esses trechos só têm a inspeção visual da seção 11.
- Não foi feito commit; as mudanças estão no diretório de trabalho.

## 20. Próximo passo

Se o playtest aprovar Mining, a próxima etapa conceitual é **Smithing**, usando o Minério Bruto. Não foi iniciada.
