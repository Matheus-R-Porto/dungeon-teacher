# Relatórios — diário das iterações

Este arquivo é o **diário de todas as iterações** do projeto, para conferência do que foi feito e de **como o README estava antes**. Ele não descreve o estado atual do jogo: isso é o [`README.md`](README.md), que reflete o jogo como o código está hoje (sistemas, fórmulas, geração, fila de ações, saves).

Como usar:

- A tabela abaixo lista cada marco em ordem, com data e versão quando o relatório informa, o número de testes e os documentos.
- Cada seção traz, **literalmente**, o texto que o README anterior tinha sobre aquela iteração (em inglês, como estava) e/ou a abertura do relatório correspondente. Textos preservados podem estar desatualizados em relação ao código; é intencional.
- O apêndice A guarda o **README anterior inteiro**, sem alterações.
- Relatórios completos, prompts e logs de teste estão em `docs/`.

## Iteração 20 — Beta 0.4.0

Cidade pública compartilhada, seis NPCs com sprites e retratos exclusivos, diálogo individual e artes originais de jogador/Slimes. Suíte completa: 530 testes aprovados. Doze clientes reais v4, duas parties, combate, coleta, reconexão e persistência; medição sustentada e evidências Electron.

[Relatório completo, métricas e limitações](docs/ITERACAO-20-RELATORIO.md) · [Pipeline de artes](docs/ITERACAO-20-ARTES.md).

## Iteração 19 — Beta 0.3.0

Loop social online com personagens persistentes, party, chats, XP cooperativa e loot individual manual. Validado por WebSocket, reinício e dois processos Electron; 526 testes na suíte completa e nove na revisão focada final. Playtest humano pendente. [Relatório completo](docs/ITERACAO-19-RELATORIO.md).

## Iteração 18 — Beta 0.2.2

Doze andares compartilhados com geografia persistente, portais adjacentes, compatibilidade dos arquivos antigos e suspensão de áreas vazias. 516 testes aprovados e dois clientes Electron validados. Playtest humano pendente. [Relatório completo](docs/ITERACAO-18-RELATORIO.md).

## Iteração 17 — Beta 0.2.1 — 13/10/2026

Torre compartilhada com andares procedurais 1/2, geografia persistida, áreas isoladas, portais validados e protocolo v3. Campanha e compatibilidade v1/v2 preservadas. 512 testes passaram e dois processos Electron foram validados automaticamente. Playtest humano pendente devido ao acesso remoto via RustDesk. [Relatório e limites](docs/ITERACAO-17-RELATORIO.md).

## Beta 0.2.0 — 13/10/2026

Fundação do mundo compartilhado implementada preservando a Beta 0.1.5. Mesmo servidor WebSocket, mapa de teste autoritativo, personagens temporários e perfis Electron independentes. Corrigida a reutilização de andares entre runs e bloqueado reset automático de saves legados. Validação local automatizada e dois processos Electron; implantação pública e aprovação humana ainda pendentes. Relatório: [BETA-0.2.0-RELATORIO.md](docs/BETA-0.2.0-RELATORIO.md).

## Índice cronológico

| Marco | Data | Tema | Testes | Documentos principais |
|---|---|---|---|---|
| Fundação | 24/09/2026 | Plano, decisões e primeira fundação jogável | 15 | [plano](docs/PLANO-TECNICO-BETA-0.1.0.md), [decisões](docs/DECISOES-FUNDACAO.md), [verificação](docs/VERIFICACAO-FUNDACAO.md) |
| 02 / 02.1 | 24/09/2026 | Visual híbrido, câmera livre, sprites direcionais | — | [02](docs/ITERACAO-02.md), [02.1](docs/ITERACAO-02.1.md) |
| 03 | 24/09/2026 | Personagem, atributos, persistência | — | [relatório](docs/ITERACAO-03-RELATORIO.md) |
| 04 | 24/09/2026 | Combate | +15 | [relatório](docs/ITERACAO-04-RELATORIO.md) |
| 05 | 24/09/2026 | IA, aggro, leash, respawn | — | [relatório](docs/ITERACAO-05-RELATORIO.md) |
| 06 / 06 RPG | — | Habilidades, inventário, equipamentos, árvore, primeiro andar | 32 (kit) → 164 | [06](docs/ITERACAO-06-RELATORIO.md), [06 RPG](docs/ITERACAO-06-RPG-RELATORIO.md) |
| 07 | — | Primeiro loop completo (boss, baú, retorno) | 164 → | [relatório](docs/ITERACAO-07-RELATORIO.md) |
| 08 | 28/09/2026 | Reset de progressão, progressão e andares | — | [relatório](docs/ITERACAO-08-RELATORIO.md) |
| 09 | 05/10/2026 | Regiões, desvios, encontros, barreiras | 231 → | [relatório](docs/ITERACAO-09-RELATORIO.md) |
| 10 | — | Life Skills e Fishing | 247 → | [relatório](docs/ITERACAO-10-RELATORIO.md) |
| 11 | 05/10/2026 | Cooking e economia local | 279 → | [relatório](docs/ITERACAO-11-RELATORIO.md) |
| Desktop 01 | — | Build Windows (Electron) | 331 → | [relatório](docs/DESKTOP-01-RELATORIO.md) |
| Multiplayer 01 / 01.1 | 05/10/2026 | Presença compartilhada no Refúgio | 337 → 361 → | [01](docs/MULTIPLAYER-01-RELATORIO.md), [01.1](docs/MULTIPLAYER-01.1-RELATORIO.md) |
| 12 (0.1.2) | 05/10/2026 | Bioma de caverna e transições | 364 → 373 | [relatório](docs/ITERACAO-12-RELATORIO.md) |
| 13 (0.1.3) | 09/10/2026 | Mining | 373 → 418 | [relatório](docs/ITERACAO-13-RELATORIO.md) |
| 14 (0.1.4) | 09/10/2026 | Tower Progression — aprovada em playtest | 418 → 452 | [relatório](docs/ITERACAO-14-RELATORIO.md) |
| 15 (0.1.5) | 09/10/2026 | Smithing — marcada como aprovada | 452 → 490 | [relatório](docs/ITERACAO-15-RELATORIO.md) |

Um "—" indica que o relatório não traz a informação. "N →" é a suíte aprovada antes da iteração, anotada na auditoria do respectivo relatório.

## Plano e fundação (Beta 0.1.0)

*24/09/2026 · 15 testes na verificação da fundação*

**Documentos:** [`PLANO-TECNICO-BETA-0.1.0.md`](docs/PLANO-TECNICO-BETA-0.1.0.md) · [`DECISOES-FUNDACAO.md`](docs/DECISOES-FUNDACAO.md) · [`VERIFICACAO-FUNDACAO.md`](docs/VERIFICACAO-FUNDACAO.md) · [`ESPECIFICACAO-ORIGINAL-BETA-0.1.0.txt`](docs/ESPECIFICACAO-ORIGINAL-BETA-0.1.0.txt) · [`PRIMEIROS-PASSOS.md`](docs/PRIMEIROS-PASSOS.md)

Plano técnico, decisões de stack (JavaScript ES Modules, Three.js 0.186.1, Vite 8.3.1, mundo lógico plano em X/Z, câmera ortográfica) e verificação da primeira fundação jogável.

**Blocos "Included in this build" e "Limits of this version" do README anterior (estado da fundação, preservado)**

> ## Included in this build
>
> - Low-complexity 3D scenery with warm lighting, living vegetation, flowers, banners, turquoise water and an animated blue portal.
> - Original placeholder 2D sprite character, eight-direction atlas, Idle/Walk and ground marker.
> - Circular collision against trees, rocks, ruins, tent, well and clearing boundaries.
> - Grid-based A* with smoothing across free segments; path and destination are visible.
> - Continuous orbit camera, pivoting on the character, fixed tilt and smooth, limited zoom.
> - Registered trees and structures turn translucent when they occlude the character.
> - Hub minimap; forest landmarks, golden trail markers, optional detour signs, help and pause.
> - Fixed-step simulation, decoupled from rendering, input and UI.
> - Hub content and interactions in validated JSON, plus 247 automated tests covering domain, combat, areas and persistence.
>
> ## Limits of this version
>
> There are three controlled procedural floors, one placeholder boss and eight reward items. Fishing, cooking and mining are implemented; smithing is not yet. Raw Ore has no use yet and cannot be sold. Multiplayer covers shared Hub presence only — no PvP, no shared tower runs. The Forest and Cave biomes are literal templates: current shape, size and enemies are placeholders and will change as the biome system matures. Playable classes, a full economy and educational questions are not implemented. The sections below document the history; the current rules above take precedence.
>
> Almost everything visible is a placeholder: plain geometry, local effects and no final assets anywhere in the game. What's solid is the code underneath — movement, combat, systems — not the art on top of it. Enemies will likely keep their current roles but get a visual overhaul; nothing currently on screen should be read as final. WebGL 2 and graphics acceleration are required. Mobile has not been validated.

## Iterações 02 e 02.1 — visual híbrido, câmera livre, interação universal, sprites direcionais

*24/09/2026*

**Documentos:** [`ITERACAO-02.md`](docs/ITERACAO-02.md) · [`ITERACAO-02.1.md`](docs/ITERACAO-02.1.md) · [`ESPECIFICACAO-ITERACAO-02.txt`](docs/ESPECIFICACAO-ITERACAO-02.txt) · [`ESPECIFICACAO-ITERACAO-02.1.txt`](docs/ESPECIFICACAO-ITERACAO-02.1.txt)

**Abertura do relatório (trecho literal)**

> Implementada incrementalmente em 24/09/2026, sobre a fundação existente. A fonte desta etapa está preservada integralmente em `ESPECIFICACAO-ITERACAO-02.txt`.
>
> Esta especificação substitui duas decisões da primeira entrega: atores deixam de ser modelos 3D e a câmera deixa de ter quatro posições fixas. O plano de escopo da Beta continua válido; combate e progressão não foram antecipados.

**Texto do README anterior (preservado)**

> **Iteration 02 log:** foundation for movement, camera, interaction and hybrid visuals. Attack/Skill/Hit/Death are planned in the animation contract but not yet implemented. See `docs/ITERACAO-02.md` for decisions, files and verification. The Iteration 02 spec supersedes the old four-direction and 3D-character choices; the rest of the plan remains as reference.
>
> Current fix: eight full-body poses, stable selection by relative angle, and a collapsible debug panel. Inspect the poses at `http://127.0.0.1:5173/sprite-lab.html` (dev server). Details in `docs/ITERACAO-02.1.md`.

## Iteração 03 — personagem, atributos e persistência

*24/09/2026*

**Documentos:** [`ITERACAO-03-PROMPT.md`](docs/ITERACAO-03-PROMPT.md) · [`ITERACAO-03-RELATORIO.md`](docs/ITERACAO-03-RELATORIO.md)

**Abertura do relatório (trecho literal)**

> Concluída em 24/09/2026. Escopo encerrado nesta iteração.

**Texto do README anterior (preservado)**

> ## Character and persistence — Iteration 03
>
> Level 1 Novice with six attributes at 5. Each level grants 5 points. C opens the sheet with a preview, Confirm and Cancel; closing it discards unconfirmed changes. Distributing points requires being at the safe Hub and out of combat. The panel pauses exploration and regeneration.
>
> HP, MP, XP, level and attributes are saved to IndexedDB, scoped to this browser and address. Confirmed changes and debug actions save immediately; regeneration is consolidated every 2 seconds and when leaving the window. An abrupt close can lose the last few seconds of regeneration. There's no offline regeneration. The technical level cap is 100, and attack speed ranges from 0.25 to 4 attacks/s; both are provisional numbers.
>
> To test without altering your character, open `http://127.0.0.1:5173/?debug=1&test=1` and use C → Test tools. Only `?debug=1` applies test actions to the normal profile. The test profile uses a separate key in the same database. The normal screen doesn't expose these commands.
>
> The save contains the data source, version 0.1.0 and schema 1. Derived values are rebuilt on load. Missing fields fall back to defaults; invalid or future formats are never overwritten. Transactions keep a previous copy and reject concurrent writes from tabs with an outdated revision. On error, read the save warning; reopen the page to load the last confirmed state. There's no sync between browsers.
>
> Architecture and checks: [Iteration 03 report](docs/ITERACAO-03-RELATORIO.md).

## Iteração 04 — fundação do combate

*24/09/2026 · 15 testes novos*

**Documentos:** [`ITERACAO-04-PROMPT.md`](docs/ITERACAO-04-PROMPT.md) · [`ITERACAO-04-RELATORIO.md`](docs/ITERACAO-04-RELATORIO.md)

**Abertura do relatório (trecho literal)**

> Concluída em 24/09/2026. Iteração 05 não iniciada. HUD compacto preservado no canto superior esquerdo; painel C preservado.

**Texto do README anterior (preservado)**

> ## Training combat — Iteration 04
>
> Click directly on the Training Slime: the character approaches and starts auto-attacking. The circle and HP bar indicate the target. WASD, clicking the ground or Esc interrupt the auto intention; the selection may remain. F is still the contextual interaction. In Iteration 05, Slimes detect, chase and attack under their own perception rules.
>
> When defeated, the character returns to the start with full HP/MP after 3 seconds. Each Slime disappears after being defeated and respawns after 8 seconds, waiting if its spawn point is occupied. No XP or loot is granted.
>
> With `?debug=1&test=1`, open Combat Debug to watch state, interval, range, stats and the last result; uncheck AI and active attacks to isolate the player's attack. The test profile is separate from the normal one.
>
> [Iteration 04 report](docs/ITERACAO-04-RELATORIO.md): files, architecture, formulas, cancellations, limitations and tests. This report documents the previous build; Iteration 05 is described below.

## Iteração 05 — IA, aggro, perseguição, leash e respawn

*24/09/2026*

**Documentos:** [`ITERACAO-05-PROMPT.md`](docs/ITERACAO-05-PROMPT.md) · [`ITERACAO-05-RELATORIO.md`](docs/ITERACAO-05-RELATORIO.md)

**Abertura do relatório (trecho literal)**

> Concluída em 24/09/2026. Escopo encerrado antes da Iteração 06. HUD compacto permanece no canto superior esquerdo. Nenhuma fórmula de combate foi alterada.

**Texto do README anterior (preservado)**

> ## History: AI and groups — Iteration 05
>
> The training area now has six Slimes with individual perception, pathfinding-based chase, return-to-origin and respawn. Getting too close can pull in every Slime that sees you. There's no artificial aggro cap. Fleeing far enough makes each Slime return to its origin, gradually healing. During that return, it's temporarily immune and can't be selected.
>
> The player can push bodies they're in contact with, and enemies separate from each other locally. Death clears aggro and pending attacks. There's no XP or loot per enemy. Camera, attributes, regeneration and saving follow the previous rules.
>
> Scale test: `http://127.0.0.1:5173/?debug=1&test=1&stress=1`. The `stress` parameter requires `debug=1` and spawns twenty enemies. In Combat Debug, enable the visualization for sight, range, leash and paths. The `test=1` profile preserves the normal character.
>
> [Iteration 05 report](docs/ITERACAO-05-RELATORIO.md): files, state machine, parameters, tests, observed performance and limitations. Iteration 06 is described below.

## Iteração 06 — habilidades do Novato, inventário, equipamentos e árvore

*32 testes do kit; 164 ao fim da 06 ampliada*

**Documentos:** [`ITERACAO-06-PROMPT.md`](docs/ITERACAO-06-PROMPT.md) · [`ITERACAO-06-RELATORIO.md`](docs/ITERACAO-06-RELATORIO.md) · [`ITERACAO-06-RPG-PROMPT.md`](docs/ITERACAO-06-RPG-PROMPT.md) · [`ITERACAO-06-RPG-RELATORIO.md`](docs/ITERACAO-06-RPG-RELATORIO.md) · [`DIRETRIZES-DE-PROGRESSAO.md`](docs/DIRETRIZES-DE-PROGRESSAO.md)

**Abertura do relatório (trecho literal)**

>

**Abertura do relatório (trecho literal)**

> Este relatório complementa a entrega anterior do kit de habilidades da Iteração 06. O novo prompt preservado em `ITERACAO-06-RPG-PROMPT.md` amplia o escopo da mesma iteração; não inicia a Iteração 07.

**Texto do README anterior (preservado)**

> ## History: the Novice's first kit — Iteration 06
>
> The hotbar responds to clicks and keys 1–8: Powerful Strike (sword), Double Attack (dagger), Double Shot (bow), Energy Ball (staff), Regeneration (any weapon) and three empty slots. Select an enemy before offensive techniques; the character closes in to the skill's range. Regeneration restores HP over six pulses.
>
> Incompatible techniques appear dimmed. Hover to check weapon, MP, cooldown and range. Only one technique can be pending at a time; the most recent intent replaces the previous one. Costs are applied on valid execution. Interrupting a technique already in progress doesn't refund MP or cooldown. Pausing freezes skills.
>
> To try all four weapons, open `http://127.0.0.1:5173/?debug=1&test=1` → Combat Debug → Provisional weapon. Switching is locked while a skill is executing. This profile preserves the normal character. Known weapon and skills are saved; cooldowns and active effects reset on reload. Auto-attack still keeps the previous short physical range for every weapon.
>
> [Iteration 06 report](docs/ITERACAO-06-RELATORIO.md): architecture, parameters, rules, tests and limits. [Progression guidelines](docs/DIRETRIZES-DE-PROGRESSAO.md): the philosophy behind the 13 weeks. The character remains a Novice; class change hasn't started yet.

## Iteração 07 — primeiro loop completo de jogatina

*Base: 164 testes*

**Documentos:** [`ITERACAO-07-PROMPT.md`](docs/ITERACAO-07-PROMPT.md) · [`ITERACAO-07-RELATORIO.md`](docs/ITERACAO-07-RELATORIO.md)

**Abertura do relatório (trecho literal)**

> Atualizado pelo adendo de decisões de design. As regras abaixo substituem a progressão paga da primeira implementação.
>
> **1. Loop completo** — Personagem novo → movimentar/câmera → Armeiro → adquirir arma → I/equipar → TAB/aprender → F/Portal → três andares → Slime Guardião → pegar baú → retornar → I/abrir baú → Espaço/desacelerar roleta → equipamento + ouro → C/melhorar atributo → nova expedição. Sem arma equipada, ataques e entrada continuam bloqueados.

**Seções "First expedition" e notas do README anterior (cobrem as iterações 07 a 09, preservadas)**

> ## First expedition
>
> 1. Follow First Steps: walk around, try the camera and talk to the Armorer using F.
> 2. Get a free weapon, open I and equip it. You start with no skills and no Skill Slots.
> 3. Use F on the Portal with a weapon equipped. The Tower generates three floors per seed.
> 4. Click Slimes to attack; only valid hostile hits provoke them. Learned skills use 1–5. They wander passively until they take damage and don't respawn during this expedition.
> 5. Follow the golden trail through forest regions. Two required encounters release their local root barriers. Optional detours grant extra XP and can be skipped. Find the exit physically.
> 6. On the third floor, reach the Guardian clearing after releasing the required passages; the boss then appears after two seconds. Defeat it, grab the chest with F, and head back through the portal.
> 7. Open I at the Hub, select the chest and click Open. Space slows down the wheel until the result lands. You receive equipment and gold.
> 8. Enemies grant XP; each level grants 5 attribute points and 1 Skill Slot. In TAB, each technique costs 1 Slot; all five are independent. Open C at the Hub to distribute points without spending XP or gold. You stay a Novice.
> 9. Equip the reward in I and start another expedition.
>
> Dying sends you back to the Hub with full HP/MP and ends the run. Resources and items already received are kept. Interacting near the entrance lets you abandon the run. Reloading also starts you at the Hub, without restoring an expedition in progress.
>
> Inventory, equipment, skills, attributes, XP, gold, chests and onboarding all persist. Opening panels pauses the simulation. Equipment can't be swapped during combat. The chest requires the Hub and a free slot; the grant and its consumption are saved together.
>
> [Iteration 09 report](docs/ITERACAO-09-RELATORIO.md) · [Prompt](docs/ITERACAO-09-PROMPT.md) · [CPU measurements](docs/ITERACAO-09-PERFORMANCE.json).
>
> Progression version 4 resets old saves once and logs the migration before the game opens. Reloading preserves the new progress. Sword and dagger attack in melee; bow and staff launch physical and magical projectiles. Common Slimes, Jumpers and Mages share the same AI, with varied encounters per seed.
>
> To reproduce maps: `?debug=1&test=1&seed=42`. Debug shows the run's seed, floor and derived seed. The `test=1` profile is separate from the normal one. Without an explicit seed, each expedition rolls a new one.

## Iteração 08 — reset da progressão, progressão e andares

*28/09/2026*

**Documentos:** [`ITERACAO-08-PROMPT.md`](docs/ITERACAO-08-PROMPT.md) · [`ITERACAO-08-RELATORIO.md`](docs/ITERACAO-08-RELATORIO.md) · [`ITERACAO-08-PERFORMANCE.json`](docs/ITERACAO-08-PERFORMANCE.json)

**Abertura do relatório (trecho literal)**

> Entrega verificada em 28/09/2026. Mantido o loop Refúgio → três andares → boss → baú → retorno → recompensa → progressão → nova run. Iteração 09 não iniciada.
>
> **1. Reset/migração** — `BALANCE.progressionVersion = 4`. Saves das versões anteriores são validados e convertidos para um personagem novo: nível 1, atributos iniciais 5, XP/ouro/pontos/espaços zerados, inventário/equipamentos/habilidades vazios e Primeiros Passos reiniciado. A abertura grava a migração antes de entregar o personagem à aplicação. Mantidos controle de revisão e backup anterior do salvamento. Saves futuros ou inválidos não são silenciosamente aceitos.
>
> **2. Progressão** — XP continua sendo progresso, nunca moeda. Próximo nível exige `100 + 250 × (nível atual − 1)`: 100, 350, 600, 850, 1100… Cada nível concede 5 pontos de atributo e 1 Espaço de Habilidade. Ouro permanece separado e persistente; distribuir atributos não gasta XP nem ouro.

## Iteração 09 — regiões conectadas, desvios opcionais, encontros e barreiras

*05/10/2026 · base: 231 testes*

**Documentos:** [`ITERACAO-09-PROMPT.md`](docs/ITERACAO-09-PROMPT.md) · [`ITERACAO-09-RELATORIO.md`](docs/ITERACAO-09-RELATORIO.md) · [`ITERACAO-09-PERFORMANCE.json`](docs/ITERACAO-09-PERFORMANCE.json)

**Abertura do relatório (trecho literal)**

> Relatório de implementação e validação. Fechamento: 05/10/2026.
>
> A Torre passou a ter regiões conectadas, desvios opcionais, encontros locais e barreiras de raízes. O ciclo Refúgio → três andares → Guardião → baú → retorno → recompensa foi concluído três vezes pela interface, no perfil normal. A fundação funciona, mas a meta de ritmo e variedade ainda tem ressalvas: a rota direta pode ser curta, há caminhadas repetitivas e a sinalização lateral precisa de acabamento. Não considerar estes resultados aprovação irrestrita de todos os critérios subjetivos do prompt.

## Iteração 10 — fundação de Life Skills e Fishing

*Base: 247 testes*

**Documentos:** [`ITERACAO-10-PROMPT.md`](docs/ITERACAO-10-PROMPT.md) · [`ITERACAO-10-RELATORIO.md`](docs/ITERACAO-10-RELATORIO.md) · [`ITERACAO-10-TESTES.txt`](docs/ITERACAO-10-TESTES.txt) · [`ITERACAO-10-PERFORMANCE.json`](docs/ITERACAO-10-PERFORMANCE.json)

**Abertura do relatório (trecho literal)**

> Implementação sobre a Iteração 09. O usuário reduziu explicitamente a validação manual: um andar representativo é suficiente; não repetir os três andares, boss e baú a cada mudança. O relatório distingue observação manual de cobertura automatizada. Save existente preservado.
>
> **2. Life Skill Foundation** — `src/domain/life-skills.js` concentra definições, progresso, curva e validação. Fishing é a única profissão ativa. Cooking, Mining e Smithing têm apenas definições inativas, sem runtime, receitas ou conteúdo. Progresso em `character.lifeSkills.fishing`, separado dos atributos, XP de personagem e Skill Slots. Saves antigos recebem Pesca 1 / XP 0 por migração aditiva.

## Iteração 11 — Cooking, consumíveis e economia local

*05/10/2026 · base: 279 testes*

**Documentos:** [`ITERACAO-11-PROMPT.md`](docs/ITERACAO-11-PROMPT.md) · [`ITERACAO-11-RELATORIO.md`](docs/ITERACAO-11-RELATORIO.md) · [`ITERACAO-11-TESTES.txt`](docs/ITERACAO-11-TESTES.txt)

**Abertura do relatório (trecho literal)**

> Implementação em 05/10/2026. Escopo encerrado nesta iteração. Validação manual concentrada no Refúgio e em um trecho do Andar 1 com lago; regressões amplas cobertas pela suíte.
>
> **2. Fundação de consumíveis
> As definições dos itens contêm efeitos, categoria de recarga e valor de venda. FoodService coordena consumo e transações; Inventory remove quantidades e pilhas; Character aplica recuperação e recalcula stats. A interface apenas apresenta e solicita ações. Peixes continuam recursos/ingredientes empilháveis compatíveis com saves anteriores, agora com efeitos consumíveis. Pratos têm categoria consumable/food/cooked.** — Consumo pelo inventário (I): selecionar item → Comer. Comer em combate ou durante outra atividade é bloqueado. Esta decisão preserva a pausa já existente do inventário sem criar uma forma de cura instantânea durante a luta. Uma futura hotbar de consumíveis fica fora do escopo. Vida/mana cheias impedem gastar alimentos que apenas recuperariam aquele recurso; pratos com buff podem ser consumidos para aplicar ou renovar o bônus.

**Texto do README anterior (preservado)**

> ## Cooking and food (Iteration 11)
>
> Visit Mira or the stove in the Refuge and press F. Buy ingredients, choose a recipe and press F/Space in the green or gold timing zone. Cooking gains its own XP; even a missed timing produces the normal dish with less XP. Open I to eat fish or dishes outside combat. Food shares an 8-second cooldown; one 5-minute food buff can be active at a time. Sell fish or dishes to Mira for gold. Buff deadlines, cooldowns, items, gold and profession progress survive reload.

## Desktop 01 — build Windows com Electron

*Base: 331 testes*

**Documentos:** [`DESKTOP-01-PROMPT.md`](docs/DESKTOP-01-PROMPT.md) · [`DESKTOP-01-RELATORIO.md`](docs/DESKTOP-01-RELATORIO.md) · [`DESKTOP-01-BUILD.txt`](docs/DESKTOP-01-BUILD.txt)

**Texto do README anterior (preservado)**

> ## Windows — Desktop Build 01
>
> The same web game is packaged with Electron 44.5.1 and electron-builder 26.15.3.
>
> - `npm run desktop:dev`: builds and opens the development shell.
> - `npm run desktop:build`: generates the shared production assets.
> - `npm run desktop:package`: prepares the official runtime and generates an NSIS installer and a Portable Windows x64 build in `release/desktop-01`.
> - Close any executable open from that folder before packaging again. To keep it running, use `npm run desktop:package -- --config.directories.output=release/desktop-01-final`.
> - The runtime installer is run explicitly, and `electronDist` uses its extracted folder. This avoids the EPERM rename failure seen in the packager's default extractor in this environment.
> - The dev machine needs Node/dependencies and network access for the initial downloads. The playtester only receives the Setup or Portable build and doesn't need any of those tools.
>
> The renderer loads `dungeon://game/index.html` from inside the ASAR, with no HTTP server. IndexedDB uses `%APPDATA%\Dungeon Master` and doesn't import the web save. Installer and Portable share the same Windows user profile. The domain stays shared; a restricted bridge flushes the save on close.
>
> [Desktop 01 report](docs/DESKTOP-01-RELATORIO.md) and [playtest instructions](desktop/LEIA-ME.txt). Visual validation of the executable and a close/reopen pass are still pending, since native window control wasn't available in this session — don't treat the build as fully verified yet.

## Multiplayer 01 e 01.1 — presença compartilhada no Refúgio

*05/10/2026 · base: 337 (01) e 361 (01.1) testes*

**Documentos:** [`MULTIPLAYER-01-PROMPT.md`](docs/MULTIPLAYER-01-PROMPT.md) · [`MULTIPLAYER-01-RELATORIO.md`](docs/MULTIPLAYER-01-RELATORIO.md) · [`MULTIPLAYER-01.1-PROMPT.md`](docs/MULTIPLAYER-01.1-PROMPT.md) · [`MULTIPLAYER-01.1-RELATORIO.md`](docs/MULTIPLAYER-01.1-RELATORIO.md) · [`MULTIPLAYER-01.1-PUBLIC-PROBE.json`](docs/MULTIPLAYER-01.1-PUBLIC-PROBE.json)

**Texto do README anterior (preservado)**

> ## Multiplayer 01 — shared Hub
>
> The Node/WebSocket server lives separately in `server/`; the shared protocol is in `shared/multiplayer.js`. The client only connects on player action, sending UUID, name and movement state at up to 15 Hz. Remote players use 100 ms interpolation, with orientation computed from the observer's own camera. Entering the Tower ends your presence; returning to the Hub reconnects. Save, inventory and gameplay all stay local.
>
> Additional commands:
>
> - `npm run server:install`: installs only the server's dependency.
> - `npm run server:start`: starts the local backend.
> - `npm run test:multiplayer`: protocol, server, client and security tests.
> - `npm run multiplayer:configure -- wss://YOUR-REAL-DOMAIN/hub`: configures the next build's endpoint, for both the renderer and the allowlist/CSP.
> - `npm run desktop:package:playtest`: requires WSS to be configured before generating a distribution for two PCs.
> - `npm run desktop:package`: can also generate an offline candidate, explicitly with no server configured.
>
> Artifacts currently land in `release/multiplayer-01`. Desktop01 is preserved as-is. This build is identified as Multiplayer01 / Windows 0.1.0.2, keeping the same appId and `%APPDATA%\Dungeon Master` profile.
>
> **Validated (Multiplayer 01.1):** the backend is hosted publicly on Render and baked into the distributed build's config. Two-client tests passed with low latency (~150 ms ping) end to end — connect, move sync, disconnect, reconnect. PvP is planned for later, so this will need another latency/security pass before that lands; for now, shared presence in the Hub is solid.
>
> [Exact backend deploy steps](server/DEPLOY.md), [report](docs/MULTIPLAYER-01-RELATORIO.md) and [two-PC walkthrough](desktop/TESTE-MULTIPLAYER-01.txt).

## Iteração 12 — CaveBiome (Beta 0.1.2)

*05/10/2026 · 364 → 373 testes*

**Documentos:** [`ITERACAO-12-PROMPT.md`](docs/ITERACAO-12-PROMPT.md) · [`ITERACAO-12-RELATORIO.md`](docs/ITERACAO-12-RELATORIO.md) · [`ITERACAO-12-PROCEDURAL.txt`](docs/ITERACAO-12-PROCEDURAL.txt) · [`ITERACAO-12-TESTES.txt`](docs/ITERACAO-12-TESTES.txt)

**Abertura do relatório (trecho literal)**

> Beta 0.1.2 · Windows x64 · 05/10/2026. Entrega para playtest visual.
>
> **2. Arquitetura de biomas** — `src/world/biomes.js` centraliza FOREST, CAVE, FOREST_TO_CAVE e CAVE_TO_FOREST. Cada ambiente possui tipo, nome, origem, destino e direção de transição. O mundo registra `floorEnvironment` e `floorRole` separadamente. O mesmo FloorGraph, materializador, colisão e navegação atendem todos os ambientes; não foi criado outro gerador independente.
>
> **6. Cave** — A Caverna possui bordas rochosas volumétricas, câmaras e passagens, pilares naturais, cristais emissivos, fungos decorativos, lagos subterrâneos e atmosfera azulada mais escura. Algumas câmaras têm raio ajustado e os corredores ficam ligeiramente mais fechados; regiões de combate mantêm raio 10, e passagens preservam espaço navegável. Os volumes ambientais ficam nas bordas; coberturas sólidas usam os obstáculos existentes. Não há teto que esconda personagem e combate. Não foi introduzido sistema de iluminação complexo nem escuridão consumível.

## Iteração 13 — Mining (Beta 0.1.3)

*09/10/2026 · 373 → 418 testes*

**Documentos:** [`ITERACAO-13-RELATORIO.md`](docs/ITERACAO-13-RELATORIO.md) · [`ITERACAO-13-TESTES.txt`](docs/ITERACAO-13-TESTES.txt)

**Texto do README anterior (preservado)**

> ## Mining (Iteration 13)
>
> Buy the **Simple Pickaxe** from the Armorer (30 gold). It lives in the bag like the fishing rod: no equipment slot, no durability, one per character. Mineral veins (pale rock with amber crystals) only spawn on Cave floors and on the underground side of the two transitions, mostly in optional detours; pure Forest has none, so the normal three-floor expedition has no veins. Walk up to a vein and press F: a bar appears with a sweeping indicator, and F or Space in the green zone is GOOD, in the gold zone PERFECT. A success gives 1 Raw Ore and Mining XP (8 GOOD, 12 PERFECT); a miss costs nothing and allows a retry after a short pause. Each vein pays once and is spent for that floor. Mining has its own level and XP (shown in the Life Skills panel), shares the same XP curve as Fishing and Cooking and never touches combat XP. Esc cancels; taking damage, dying or leaving the floor also cancels with no reward.
>
> The Armorer's paid stock is declared in `src/domain/shop.js`; timing and balance in `src/domain/mining.js`; vein placement in `src/world/mineral-veins.js` (own seed stream, so existing floors stay byte-identical); the runtime in `src/simulation/mining.js`. Report: [Iteration 13](docs/ITERACAO-13-RELATORIO.md).

## Iteração 14 — Tower Progression (Beta 0.1.4)

*09/10/2026 · 418 → 452 testes · aprovada em playtest manual pelo responsável em 09/10/2026*

**Documentos:** [`ITERACAO-14-RELATORIO.md`](docs/ITERACAO-14-RELATORIO.md) · [`ITERACAO-14-TESTES.txt`](docs/ITERACAO-14-TESTES.txt)

**Texto do README anterior (preservado)**

> ## Tower progression (Iteration 14)
>
> **Biome rules** (`src/world/biomes.js`, tables in `BIOME_RULES`): the chance that a floor starts a transition depends on how many pure floors have passed. First transition: floors 1–2 never, floor 3 50%, floor 4 75%, floor 5 guaranteed. After a transition the next floor is always a pure floor of the destination biome, then 10% → 50% → 75% → 100% per floor. Directions are fixed (Forest → Forest-to-Cave → Cave → Cave-to-Forest → Forest) and transitions are never back to back. The decision *when* (`transitionChance`) is separate from *where to* (`transitionTargets`), so more biomes only extend the second. The sequence is deterministic per seed on its own random stream (`biome-sequence:v2`) and never consumes layout RNG; layouts of every environment are byte-identical to Iteration 13.
>
> **Campaign.** The boss floor keeps its role independent of its biome. Its main portal climbs to floor 4; a second portal returns to the Refuge; both need the Guardian dead and the chest taken, and nothing starts by itself. Floors beyond 3 are generated on demand from the run seed up to `TOWER_LIMIT = 50`, where the portal simply ends the run (there is no final boss yet). Enemy HP, attack and XP grow gently past floor 3 (`POST_THREE`, provisional).
>
> **Progress.** `character.tower = {highestClearedFloor, claimedRewards}` is saved with the character (additive: older saves start at 0 and nothing is inferred). A floor is cleared in the campaign when its challenges are resolved (floor 3: the Guardian is dead). Entering a floor, teleporting in debug, stress mode and Explorar biomas never advance it. Revisiting a cleared floor opens its gates and spares the Guardian; enemies, XP, Fishing and Mining are untouched. The portal still starts at floor 1.

**Parágrafo "Previous distribution" do README anterior**

> **Previous distribution: Beta 0.1.4 / TowerProgression (approved in manual playtest).** The normal expedition no longer ends at the floor-3 Guardian: after the boss you choose between a climb portal (floor 4 and beyond, up to floor 50) and a return portal to the Refuge. Floors 1–2 are always Forest; the first Forest → Cave transition lands between floors 3 and 5 and the biomes then alternate in cycles. Cleared floors are remembered (`Maior andar concluído`, press C): on a revisit their encounter gates are open, but every enemy stays. The Guardian's chest is granted once per character. Explorar biomas stays a test tool and never touches campaign progress. See the [Iteration 14 report](docs/ITERACAO-14-RELATORIO.md). Earlier delivery notes below are historical.

## Iteração 15 — Smithing (Beta 0.1.5)

*09/10/2026 · 452 → 490 testes · marcada como aprovada pelo responsável*

**Documentos:** [`ITERACAO-15-RELATORIO.md`](docs/ITERACAO-15-RELATORIO.md) · [`ITERACAO-15-TESTES.txt`](docs/ITERACAO-15-TESTES.txt)

**Texto do README anterior (preservado)**

> ## Smithing (Iteration 15, experimental)
>
> **Forge.** A station next to the path between the Armorer and the portal (`forge` obstacle and interaction, `src/simulation/areas.js`). F opens the Forge dialog (`src/ui/forge-panel.js`): recipes, ore required and owned, expected damage per quality next to the Armorer's reference, Smithing level and XP, practice per recipe.
>
> **Minigame** (`src/domain/smithing-service.js`, tuning in `src/domain/smithing.js`). A short heating phase, then three hammers: a marker crosses the bar and F/Space must land in the bright zone (precise ±5%, acceptable ±13%). Points 2/1/0 per hammer: 5 or more is PERFEITO, 3 or 4 is BOM, otherwise FALHA. A hammer left unused counts as a miss, so an attempt cannot stall. Time is simulation time advanced by `update(dt)`, not frames or wall clock. **Commit point:** until the first hammer window opens the attempt can be cancelled or closed at no cost; afterwards it always ends in a result. Nothing is spent before the end: ore, the weapon, XP and practice change in one transaction (`prepare` on a copy, one `save`, then applied), so an app close or a save error leaves the character untouched.
>
> **Weapons.** One item per recipe and quality (`forgedSwordFailure/Good/Perfect`, and the same for dagger, bow and staff), generated from the Armorer's equivalent weapon: every stat, range and speed is copied and only the damage stat moves by −1 / +1 / +2. The Armorer's weapons are unique; forged ones are not, so several qualities can coexist. They never appear in the Armorer's shop.
>
> **Profession and practice.** Smithing is an independent life skill on the shared curve (XP by quality, FALHA included). `character.smithingMastery[recipeId].attempts` counts completed attempts per recipe; it records practice only. No automation, bars, alloys, components or refinement yet.

**Cabeçalho "Current distribution" e "Status" do README anterior**

> **Current distribution: Beta 0.1.5 / Smithing (experimental).** A Forge station in the Refuge lets you turn Raw Ore into a weapon through a three-hammer timing minigame: FALHA (below the Armorer's equivalent), BOM (a little above it) or PERFEITO (above BOM). Every completed attempt spends the ore, yields exactly one weapon, grants Smithing XP and counts as practice for that recipe. Quality changes only the weapon's damage. See the [Iteration 15 report](docs/ITERACAO-15-RELATORIO.md) and `release/smithing-playtest/`.
>
> > **Status:** Iteration 14 (Tower Progression, Beta 0.1.4) was approved by the project owner after a manual playtest on 2026-10-09: it works as intended, including the random biome alternation. Smithing (Iteration 15, this build) has now also been manually playtested and approved. The 0.1.4 release stays available on its own.

## Outros documentos de `docs/`

Medições e logs: `ITERACAO-08-PERFORMANCE.json`, `ITERACAO-09-PERFORMANCE.json`, `ITERACAO-10-PERFORMANCE.json`, `ITERACAO-09-RUN1.txt` a `RUN3.txt`, `ITERACAO-12-COMBAT-SMOKE.json`, baselines e builds de cada iteração (`*-BASELINE*.txt`, `*-BUILD*.txt`, `*-TESTES*.txt`). Instruções de playtest ficam em `desktop/` (`LEIA-ME.txt` e os `CHECKLIST-*.txt`).

## Apêndice A — README anterior (texto integral)

Cópia exata do `README.md` como estava antes da reorganização (versão do commit `f2cc9b4`). Está em um bloco de código para preservar o texto sem alterações.

````markdown
# Dungeon Teacher — Beta 0.1.5 (Smithing, experimental)

A roguelite-ish tower climber (in quotes because it's not quite a traditional roguelike) built with **Three.js (3D)**, inspired by Ragnarok Online's dungeon loop and general Sword Art Online vibes. Pick a weapon, climb the procedural tower fighting for drops and boss chests, then return to the hub — or die trying — to level up, learn skills and gear up before heading back in stronger.

The educational hook: chests have rarities, and opening one triggers an educational question — answer correctly and the odds shift toward better loot. That layer isn't built yet; this beta is the RPG foundation it will sit on: a hub town, a procedurally generated tower, five weapon-based classes, a skill tree, chest-based rewards and full save persistence. Fishing is implemented as an optional activity at existing lakes, with its own levels, five species and persistent ingredient stacks. Cooking now adds six recipes, consumable fish and dishes, four temporary food buffs, and a local ingredient shop/buyback economy. Mining is now the third life skill: buy a Simple Pickaxe from the Armorer, break mineral veins in caves with a timing minigame and collect Raw Ore. Smithing is the fourth: a Forge station in the Refuge turns Raw Ore into weapons of varying quality.

**Current distribution: Beta 0.1.5 / Smithing (experimental).** A Forge station in the Refuge lets you turn Raw Ore into a weapon through a three-hammer timing minigame: FALHA (below the Armorer's equivalent), BOM (a little above it) or PERFEITO (above BOM). Every completed attempt spends the ore, yields exactly one weapon, grants Smithing XP and counts as practice for that recipe. Quality changes only the weapon's damage. See the [Iteration 15 report](docs/ITERACAO-15-RELATORIO.md) and `release/smithing-playtest/`.

> **Status:** Iteration 14 (Tower Progression, Beta 0.1.4) was approved by the project owner after a manual playtest on 2026-10-09: it works as intended, including the random biome alternation. Smithing (Iteration 15, this build) has now also been manually playtested and approved. The 0.1.4 release stays available on its own.

**Previous distribution: Beta 0.1.4 / TowerProgression (approved in manual playtest).** The normal expedition no longer ends at the floor-3 Guardian: after the boss you choose between a climb portal (floor 4 and beyond, up to floor 50) and a return portal to the Refuge. Floors 1–2 are always Forest; the first Forest → Cave transition lands between floors 3 and 5 and the biomes then alternate in cycles. Cleared floors are remembered (`Maior andar concluído`, press C): on a revisit their encounter gates are open, but every enemy stays. The Guardian's chest is granted once per character. Explorar biomas stays a test tool and never touches campaign progress. See the [Iteration 14 report](docs/ITERACAO-14-RELATORIO.md). Earlier delivery notes below are historical.

## Screenshots
*(placeholder art — geometric shapes and default assets, not final visuals)*

| Hub — Refúgio do Limiar | Boss fight |
|---|---|
| ![Hub town with portal, armorer and quest panel](screenshots/hub-refugio.webp) | ![Boss fight against the Slime Guardian](screenshots/boss-fight.png) |

| Choosing a weapon/class | Skill tree |
|---|---|
| ![Weapon selection: sword, dagger, bow, staff](screenshots/weapon-selection.png) | ![Novice skill tree with five paths](screenshots/skill-tree.png) |

| Cooking minigame | Multiplayer (2 players in the Hub) |
|---|---|
| ![Timing-based cooking minigame](screenshots/iteration11-cooking-minigame.png) | ![Two players sharing the Hub, one controlled remotely](screenshots/multiplayer-01-two-clients.png) |

## First expedition

1. Follow First Steps: walk around, try the camera and talk to the Armorer using F.
2. Get a free weapon, open I and equip it. You start with no skills and no Skill Slots.
3. Use F on the Portal with a weapon equipped. The Tower generates three floors per seed.
4. Click Slimes to attack; only valid hostile hits provoke them. Learned skills use 1–5. They wander passively until they take damage and don't respawn during this expedition.
5. Follow the golden trail through forest regions. Two required encounters release their local root barriers. Optional detours grant extra XP and can be skipped. Find the exit physically.
6. On the third floor, reach the Guardian clearing after releasing the required passages; the boss then appears after two seconds. Defeat it, grab the chest with F, and head back through the portal.
7. Open I at the Hub, select the chest and click Open. Space slows down the wheel until the result lands. You receive equipment and gold.
8. Enemies grant XP; each level grants 5 attribute points and 1 Skill Slot. In TAB, each technique costs 1 Slot; all five are independent. Open C at the Hub to distribute points without spending XP or gold. You stay a Novice.
9. Equip the reward in I and start another expedition.

Dying sends you back to the Hub with full HP/MP and ends the run. Resources and items already received are kept. Interacting near the entrance lets you abandon the run. Reloading also starts you at the Hub, without restoring an expedition in progress.

Inventory, equipment, skills, attributes, XP, gold, chests and onboarding all persist. Opening panels pauses the simulation. Equipment can't be swapped during combat. The chest requires the Hub and a free slot; the grant and its consumption are saved together.

[Iteration 09 report](docs/ITERACAO-09-RELATORIO.md) · [Prompt](docs/ITERACAO-09-PROMPT.md) · [CPU measurements](docs/ITERACAO-09-PERFORMANCE.json).

Progression version 4 resets old saves once and logs the migration before the game opens. Reloading preserves the new progress. Sword and dagger attack in melee; bow and staff launch physical and magical projectiles. Common Slimes, Jumpers and Mages share the same AI, with varied encounters per seed.

To reproduce maps: `?debug=1&test=1&seed=42`. Debug shows the run's seed, floor and derived seed. The `test=1` profile is separate from the normal one. Without an explicit seed, each expedition rolls a new one.

## Play

With this session's server running, open **http://127.0.0.1:5173/**.

To open it again on Windows, run `INICIAR-JOGO.cmd`. Keep the server window open while playing. If the port is already in use by the game, just open the address above.

On the first install on another machine: Node.js 22.12+ (or 24+) and `npm ci`. Packages are installed from the npm registry, and exact versions are pinned in the lockfile.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Don't open `index.html` by double-clicking: the modules need the local server. There's no account, backend or remote game service. No asset or library is fetched from a CDN at runtime.

## Controls

| Action | Control |
|---|---|
| Walk | WASD or arrow keys, relative to the camera |
| Pathfind | Click on the ground |
| Cancel path | WASD or Esc |
| Rotate camera | Hold Q / E or the bottom buttons; release to stop at the exact angle |
| Orbit with mouse | Hold the middle button and drag horizontally |
| Zoom | Mouse wheel, + / − or the bottom buttons |
| Contextual interaction | F or the indicated action button; the Portal and the welcome sign use the same system |
| Pause | Esc with no active path, the top button, or leaving the window |
| Character and attributes | C or the Traveler button on the HUD |
| Inventory and equipment | I or the Inventory button |
| Skill tree | TAB or the Skills button |
| Skills | Keys 1–8 or click on the hotbar |
| Help | H or the ? button |

## Included in this build

- Low-complexity 3D scenery with warm lighting, living vegetation, flowers, banners, turquoise water and an animated blue portal.
- Original placeholder 2D sprite character, eight-direction atlas, Idle/Walk and ground marker.
- Circular collision against trees, rocks, ruins, tent, well and clearing boundaries.
- Grid-based A* with smoothing across free segments; path and destination are visible.
- Continuous orbit camera, pivoting on the character, fixed tilt and smooth, limited zoom.
- Registered trees and structures turn translucent when they occlude the character.
- Hub minimap; forest landmarks, golden trail markers, optional detour signs, help and pause.
- Fixed-step simulation, decoupled from rendering, input and UI.
- Hub content and interactions in validated JSON, plus 247 automated tests covering domain, combat, areas and persistence.

## Limits of this version

There are three controlled procedural floors, one placeholder boss and eight reward items. Fishing, cooking and mining are implemented; smithing is not yet. Raw Ore has no use yet and cannot be sold. Multiplayer covers shared Hub presence only — no PvP, no shared tower runs. The Forest and Cave biomes are literal templates: current shape, size and enemies are placeholders and will change as the biome system matures. Playable classes, a full economy and educational questions are not implemented. The sections below document the history; the current rules above take precedence.

Almost everything visible is a placeholder: plain geometry, local effects and no final assets anywhere in the game. What's solid is the code underneath — movement, combat, systems — not the art on top of it. Enemies will likely keep their current roles but get a visual overhaul; nothing currently on screen should be read as final. WebGL 2 and graphics acceleration are required. Mobile has not been validated.

## Development and verification

```sh
npm test
npm run build
npm run preview -- --port 4173 --strictPort
```

`?perf=1` shows a sample of FPS and p95 frame interval, without enabling debug. `node scripts/iteration08-performance.mjs` reproduces the synthetic simulation benchmark (5/20 enemies), separate from the graphics measurement.

`npm test` uses Node's native test runner and doesn't need a browser. The static build is generated into `dist/`. The graphics bundle size warning doesn't block the build; measuring and optimizing it is part of upcoming performance work.

Responsibilities: `src/core/` holds configuration and validation; `src/world/`, collision/navigation; `src/simulation/`, state and movement; `src/adapters/`, keyboard/mouse and Three.js; `src/ui/`, the HUD; `src/data/`, the map. Combat and skill rules live in the domain and simulation layers; the renderer only presents them.

Documentation: full plan in `docs/PLANO-TECNICO-BETA-0.1.0.md`, this build's decisions in `docs/DECISOES-FUNDACAO.md`, and verification in `docs/VERIFICACAO-FUNDACAO.md`. The original spec text is preserved in `docs/ESPECIFICACAO-ORIGINAL-BETA-0.1.0.txt`. Files under `sources/` are never modified.

**Iteration 02 log:** foundation for movement, camera, interaction and hybrid visuals. Attack/Skill/Hit/Death are planned in the animation contract but not yet implemented. See `docs/ITERACAO-02.md` for decisions, files and verification. The Iteration 02 spec supersedes the old four-direction and 3D-character choices; the rest of the plan remains as reference.

Current fix: eight full-body poses, stable selection by relative angle, and a collapsible debug panel. Inspect the poses at `http://127.0.0.1:5173/sprite-lab.html` (dev server). Details in `docs/ITERACAO-02.1.md`.

## Character and persistence — Iteration 03

Level 1 Novice with six attributes at 5. Each level grants 5 points. C opens the sheet with a preview, Confirm and Cancel; closing it discards unconfirmed changes. Distributing points requires being at the safe Hub and out of combat. The panel pauses exploration and regeneration.

HP, MP, XP, level and attributes are saved to IndexedDB, scoped to this browser and address. Confirmed changes and debug actions save immediately; regeneration is consolidated every 2 seconds and when leaving the window. An abrupt close can lose the last few seconds of regeneration. There's no offline regeneration. The technical level cap is 100, and attack speed ranges from 0.25 to 4 attacks/s; both are provisional numbers.

To test without altering your character, open `http://127.0.0.1:5173/?debug=1&test=1` and use C → Test tools. Only `?debug=1` applies test actions to the normal profile. The test profile uses a separate key in the same database. The normal screen doesn't expose these commands.

The save contains the data source, version 0.1.0 and schema 1. Derived values are rebuilt on load. Missing fields fall back to defaults; invalid or future formats are never overwritten. Transactions keep a previous copy and reject concurrent writes from tabs with an outdated revision. On error, read the save warning; reopen the page to load the last confirmed state. There's no sync between browsers.

Architecture and checks: [Iteration 03 report](docs/ITERACAO-03-RELATORIO.md).

## Training combat — Iteration 04

Click directly on the Training Slime: the character approaches and starts auto-attacking. The circle and HP bar indicate the target. WASD, clicking the ground or Esc interrupt the auto intention; the selection may remain. F is still the contextual interaction. In Iteration 05, Slimes detect, chase and attack under their own perception rules.

When defeated, the character returns to the start with full HP/MP after 3 seconds. Each Slime disappears after being defeated and respawns after 8 seconds, waiting if its spawn point is occupied. No XP or loot is granted.

With `?debug=1&test=1`, open Combat Debug to watch state, interval, range, stats and the last result; uncheck AI and active attacks to isolate the player's attack. The test profile is separate from the normal one.

[Iteration 04 report](docs/ITERACAO-04-RELATORIO.md): files, architecture, formulas, cancellations, limitations and tests. This report documents the previous build; Iteration 05 is described below.

## History: AI and groups — Iteration 05

The training area now has six Slimes with individual perception, pathfinding-based chase, return-to-origin and respawn. Getting too close can pull in every Slime that sees you. There's no artificial aggro cap. Fleeing far enough makes each Slime return to its origin, gradually healing. During that return, it's temporarily immune and can't be selected.

The player can push bodies they're in contact with, and enemies separate from each other locally. Death clears aggro and pending attacks. There's no XP or loot per enemy. Camera, attributes, regeneration and saving follow the previous rules.

Scale test: `http://127.0.0.1:5173/?debug=1&test=1&stress=1`. The `stress` parameter requires `debug=1` and spawns twenty enemies. In Combat Debug, enable the visualization for sight, range, leash and paths. The `test=1` profile preserves the normal character.

[Iteration 05 report](docs/ITERACAO-05-RELATORIO.md): files, state machine, parameters, tests, observed performance and limitations. Iteration 06 is described below.

## History: the Novice's first kit — Iteration 06

The hotbar responds to clicks and keys 1–8: Powerful Strike (sword), Double Attack (dagger), Double Shot (bow), Energy Ball (staff), Regeneration (any weapon) and three empty slots. Select an enemy before offensive techniques; the character closes in to the skill's range. Regeneration restores HP over six pulses.

Incompatible techniques appear dimmed. Hover to check weapon, MP, cooldown and range. Only one technique can be pending at a time; the most recent intent replaces the previous one. Costs are applied on valid execution. Interrupting a technique already in progress doesn't refund MP or cooldown. Pausing freezes skills.

To try all four weapons, open `http://127.0.0.1:5173/?debug=1&test=1` → Combat Debug → Provisional weapon. Switching is locked while a skill is executing. This profile preserves the normal character. Known weapon and skills are saved; cooldowns and active effects reset on reload. Auto-attack still keeps the previous short physical range for every weapon.

[Iteration 06 report](docs/ITERACAO-06-RELATORIO.md): architecture, parameters, rules, tests and limits. [Progression guidelines](docs/DIRETRIZES-DE-PROGRESSAO.md): the philosophy behind the 13 weeks. The character remains a Novice; class change hasn't started yet.



## Cooking and food (Iteration 11)

Visit Mira or the stove in the Refuge and press F. Buy ingredients, choose a recipe and press F/Space in the green or gold timing zone. Cooking gains its own XP; even a missed timing produces the normal dish with less XP. Open I to eat fish or dishes outside combat. Food shares an 8-second cooldown; one 5-minute food buff can be active at a time. Sell fish or dishes to Mira for gold. Buff deadlines, cooldowns, items, gold and profession progress survive reload.

## Smithing (Iteration 15, experimental)

**Forge.** A station next to the path between the Armorer and the portal (`forge` obstacle and interaction, `src/simulation/areas.js`). F opens the Forge dialog (`src/ui/forge-panel.js`): recipes, ore required and owned, expected damage per quality next to the Armorer's reference, Smithing level and XP, practice per recipe.

**Minigame** (`src/domain/smithing-service.js`, tuning in `src/domain/smithing.js`). A short heating phase, then three hammers: a marker crosses the bar and F/Space must land in the bright zone (precise ±5%, acceptable ±13%). Points 2/1/0 per hammer: 5 or more is PERFEITO, 3 or 4 is BOM, otherwise FALHA. A hammer left unused counts as a miss, so an attempt cannot stall. Time is simulation time advanced by `update(dt)`, not frames or wall clock. **Commit point:** until the first hammer window opens the attempt can be cancelled or closed at no cost; afterwards it always ends in a result. Nothing is spent before the end: ore, the weapon, XP and practice change in one transaction (`prepare` on a copy, one `save`, then applied), so an app close or a save error leaves the character untouched.

**Weapons.** One item per recipe and quality (`forgedSwordFailure/Good/Perfect`, and the same for dagger, bow and staff), generated from the Armorer's equivalent weapon: every stat, range and speed is copied and only the damage stat moves by −1 / +1 / +2. The Armorer's weapons are unique; forged ones are not, so several qualities can coexist. They never appear in the Armorer's shop.

**Profession and practice.** Smithing is an independent life skill on the shared curve (XP by quality, FALHA included). `character.smithingMastery[recipeId].attempts` counts completed attempts per recipe; it records practice only. No automation, bars, alloys, components or refinement yet.

## Tower progression (Iteration 14)

**Biome rules** (`src/world/biomes.js`, tables in `BIOME_RULES`): the chance that a floor starts a transition depends on how many pure floors have passed. First transition: floors 1–2 never, floor 3 50%, floor 4 75%, floor 5 guaranteed. After a transition the next floor is always a pure floor of the destination biome, then 10% → 50% → 75% → 100% per floor. Directions are fixed (Forest → Forest-to-Cave → Cave → Cave-to-Forest → Forest) and transitions are never back to back. The decision *when* (`transitionChance`) is separate from *where to* (`transitionTargets`), so more biomes only extend the second. The sequence is deterministic per seed on its own random stream (`biome-sequence:v2`) and never consumes layout RNG; layouts of every environment are byte-identical to Iteration 13.

**Campaign.** The boss floor keeps its role independent of its biome. Its main portal climbs to floor 4; a second portal returns to the Refuge; both need the Guardian dead and the chest taken, and nothing starts by itself. Floors beyond 3 are generated on demand from the run seed up to `TOWER_LIMIT = 50`, where the portal simply ends the run (there is no final boss yet). Enemy HP, attack and XP grow gently past floor 3 (`POST_THREE`, provisional).

**Progress.** `character.tower = {highestClearedFloor, claimedRewards}` is saved with the character (additive: older saves start at 0 and nothing is inferred). A floor is cleared in the campaign when its challenges are resolved (floor 3: the Guardian is dead). Entering a floor, teleporting in debug, stress mode and Explorar biomas never advance it. Revisiting a cleared floor opens its gates and spares the Guardian; enemies, XP, Fishing and Mining are untouched. The portal still starts at floor 1.

## Mining (Iteration 13)

Buy the **Simple Pickaxe** from the Armorer (30 gold). It lives in the bag like the fishing rod: no equipment slot, no durability, one per character. Mineral veins (pale rock with amber crystals) only spawn on Cave floors and on the underground side of the two transitions, mostly in optional detours; pure Forest has none, so the normal three-floor expedition has no veins. Walk up to a vein and press F: a bar appears with a sweeping indicator, and F or Space in the green zone is GOOD, in the gold zone PERFECT. A success gives 1 Raw Ore and Mining XP (8 GOOD, 12 PERFECT); a miss costs nothing and allows a retry after a short pause. Each vein pays once and is spent for that floor. Mining has its own level and XP (shown in the Life Skills panel), shares the same XP curve as Fishing and Cooking and never touches combat XP. Esc cancels; taking damage, dying or leaving the floor also cancels with no reward.

The Armorer's paid stock is declared in `src/domain/shop.js`; timing and balance in `src/domain/mining.js`; vein placement in `src/world/mineral-veins.js` (own seed stream, so existing floors stay byte-identical); the runtime in `src/simulation/mining.js`. Report: [Iteration 13](docs/ITERACAO-13-RELATORIO.md).

## Windows — Desktop Build 01

The same web game is packaged with Electron 44.5.1 and electron-builder 26.15.3.

- `npm run desktop:dev`: builds and opens the development shell.
- `npm run desktop:build`: generates the shared production assets.
- `npm run desktop:package`: prepares the official runtime and generates an NSIS installer and a Portable Windows x64 build in `release/desktop-01`.
- Close any executable open from that folder before packaging again. To keep it running, use `npm run desktop:package -- --config.directories.output=release/desktop-01-final`.
- The runtime installer is run explicitly, and `electronDist` uses its extracted folder. This avoids the EPERM rename failure seen in the packager's default extractor in this environment.
- The dev machine needs Node/dependencies and network access for the initial downloads. The playtester only receives the Setup or Portable build and doesn't need any of those tools.

The renderer loads `dungeon://game/index.html` from inside the ASAR, with no HTTP server. IndexedDB uses `%APPDATA%\Dungeon Master` and doesn't import the web save. Installer and Portable share the same Windows user profile. The domain stays shared; a restricted bridge flushes the save on close.

[Desktop 01 report](docs/DESKTOP-01-RELATORIO.md) and [playtest instructions](desktop/LEIA-ME.txt). Visual validation of the executable and a close/reopen pass are still pending, since native window control wasn't available in this session — don't treat the build as fully verified yet.

## Multiplayer 01 — shared Hub

The Node/WebSocket server lives separately in `server/`; the shared protocol is in `shared/multiplayer.js`. The client only connects on player action, sending UUID, name and movement state at up to 15 Hz. Remote players use 100 ms interpolation, with orientation computed from the observer's own camera. Entering the Tower ends your presence; returning to the Hub reconnects. Save, inventory and gameplay all stay local.

Additional commands:

- `npm run server:install`: installs only the server's dependency.
- `npm run server:start`: starts the local backend.
- `npm run test:multiplayer`: protocol, server, client and security tests.
- `npm run multiplayer:configure -- wss://YOUR-REAL-DOMAIN/hub`: configures the next build's endpoint, for both the renderer and the allowlist/CSP.
- `npm run desktop:package:playtest`: requires WSS to be configured before generating a distribution for two PCs.
- `npm run desktop:package`: can also generate an offline candidate, explicitly with no server configured.

Artifacts currently land in `release/multiplayer-01`. Desktop01 is preserved as-is. This build is identified as Multiplayer01 / Windows 0.1.0.2, keeping the same appId and `%APPDATA%\Dungeon Master` profile.

**Validated (Multiplayer 01.1):** the backend is hosted publicly on Render and baked into the distributed build's config. Two-client tests passed with low latency (~150 ms ping) end to end — connect, move sync, disconnect, reconnect. PvP is planned for later, so this will need another latency/security pass before that lands; for now, shared presence in the Hub is solid.

[Exact backend deploy steps](server/DEPLOY.md), [report](docs/MULTIPLAYER-01-RELATORIO.md) and [two-PC walkthrough](desktop/TESTE-MULTIPLAYER-01.txt).
````

## Iteração 22 — Beta 0.5.0

- [Relatório completo](docs/ITERACAO-22-RELATORIO.md)
- [Desempenho medido](docs/ITERACAO-22-DESEMPENHO.md)
- [Artes e memória](docs/ITERACAO-22-ARTES.md)
- [Evidências visuais](screenshots/iteration22/)
