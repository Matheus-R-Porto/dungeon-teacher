# Iteração 26 — Minimapa e exploração

Estado: implementação concluída e validação técnica aprovada em 23/10/2026. Playtest humano pendente.

## Auditoria

O Hud já desenha um canvas de 180×180 na cidade, sem névoa e com geometria simplificada; não há mapa ampliado. A torre oculta esse painel. `drawWorldMap` também serve o modo online e será preservado ali, sem novos comandos ou sincronização.

Coordenadas lógicas são x/z, com y/surface em rampas, decks e caverna. `layerWorld`, `canStand`, `clearSegment` e os contornos `waterBodies` são a fonte real da navegação. A caverna curva tem walkable e obstáculos próprios na superfície white-wolf-cave. O castelo público local possui outro mapId; a arena tem mapa e superfície próprios. Não usaremos o desenho externo como interior.

CharacterSave usa IndexedDB, snapshots versionados e revisão para evitar sobrescrita. Exploração será campo opcional versionado, sem geometria duplicada, mantendo os demais dados. A campanha gera novas runs com outra seed: descobertas serão vinculadas à identidade e geometria do ambiente, evitando aplicar a névoa antiga sobre um layout diferente. A mesma geometria recupera suas descobertas; não será alterada a política de geração/persistência das runs.

Atalhos auditados: WASD/setas, Q/E, F, H, Escape, C, I, TAB, 1–8, espaço, +/− e F10. M está livre. M/Escape fecham o mapa, TAB permanece na árvore. O mapa seguirá a árvore: mundo ativo mesmo na cidade, InterfaceSafety existente, bloqueio dos comandos do mundo enquanto aberto.

Aproximação conservadora: grade de navegação com testes de segmento na geometria existente, somente ao mudar célula, sem raycasting Three.js. Sem marcadores de inimigos ou jogadores remotos. Portais/entradas conhecidos somente na camada e célula descoberta.

## Funcionalidades e fluxo

- HUD offline reutiliza o canvas existente, agora permanente e centrado no jogador, norte fixo, seta orientada pelo heading lógico. M ou o botão abre o mapa ampliado; M/Escape fecha. Roda, botões e arrasto/setas no canvas navegam; Centralizar volta ao jogador. TAB continua reservado à árvore; um painel impede abrir o outro.
- Canvas 2D com camada de terreno conhecido e camada de descoberta atual. Escuro é desconhecido; verde/ocre/azul representam navegação/obstáculos/água. Descobertas antigas ficam menos iluminadas. Não há posições de monstros, jogadores remotos ou NPCs sendo reveladas pelo mapa.
- Marcadores derivam apenas de transições existentes e extremidades reais das rampas, na superfície atual e em células já conhecidas. Nenhum destino novo é criado.
- InterfaceSafety fecha e limpa arrasto/foco/entrada. O mapa não pausa o mundo, inclusive na cidade; o teste de impacto usa a confirmação local existente. Mudança de mapa aciona o fechamento central já existente.

## Dados e limites da aproximação

`character.exploration = { version: 1, maps: { [environmentKey]: hexBitset } }`. Cada caractere hexadecimal registra quatro células; não armazena geometria. Chave combina versão, mapId, surface e assinatura determinística dos contornos/obstáculos/água, ignorando estado aberto de portões. Reentrar no mesmo layout recupera a descoberta; geometria diferente possui outra entrada. Dados antigos sem o campo recebem um conjunto vazio, sem reset do personagem. Formato futuro ou malformado é recusado com preservação do save original.

Grade de 0,75 unidade na escala atual, adaptável para no máximo 384 células por eixo em mapas maiores. Revelação em raio de 7 unidades, recalculada apenas ao mudar célula ou revisão da navegação. Pontos livres precisam de segmento direto válido com o raio real do jogador, usando `clearSegment`; a primeira camada de células bloqueadas expõe o contorno da parede/margem, sem propagar através dela. O filtro espacial só reduz candidatos: os mesmos predicados de colisão decidem o resultado.

É uma aproximação conservadora de navegação, não uma simulação óptica: paredes, água e obstáculos podem ocultar mais área que a visão do cenário; contornos são quantizados à célula e a primeira célula de limite pode aparecer parcialmente. Não revela salas atrás de paredes nem trajetos inteiros ao entrar na caverna. A posição é fluida, mas a mudança da névoa ocorre em passos da grade.

Novas expedições continuam usando novas seeds, conforme a campanha existente. A exploração antiga é preservada, mas não aplicada a um layout distinto. Esta iteração não transforma a campanha em torre persistida nem salva a run inteira.

## Arquivos

- `src/domain/exploration.js`: identidade do ambiente, bits de descoberta, validação, filtragem espacial, visibilidade conservadora e marcadores conhecidos.
- `src/domain/character/character.js`: estado inicial opcional e compatibilidade em snapshots.
- `src/adapters/persistence/character-save.js`: leitura e validação do campo sem alterar versão global/progressão.
- `src/ui/navigation-map.js` e `.css`: minimapa, mapa ampliado, caches Canvas, navegação e acessibilidade.
- `src/ui/hud.js`: delega o mapa offline ao componente novo; mantém o desenho legado usado online.
- `src/main.js`: criação do domínio/componente, autosave existente, InterfaceSafety e regra de não pausa.
- `tests/iteration26.test.js`: contratos de descoberta, persistência, isolamento, geometria, água, caverna, castelo e arena.
- `scripts/iteration26-electron.mjs`, `iteration26-scenario.mjs`, `iteration26-water-map.mjs`: validações reais e métricas com perfis temporários.

Nenhuma alteração de protocolo, comandos ou sincronização online. A modelagem não depende de Three.js ou de AreaSession; o adaptador visual recebe posição/mapa e o armazenamento pertence ao personagem fornecido.

## Desempenho e método

Windows, Node 24.19.0, Electron 44.5.1, build de produção, dois clientes no mesmo computador e servidor temporário local. Qualidade High, controle de oclusão do harness existente, seed 42, Andar 1. Movimento W por 10 s e S por 10 s; sem capturas na janela medida. Referência: cópia real da Iteração 25 anterior às alterações, incluindo seu dist. Os cenários foram executados sequencialmente, sem suíte de testes concorrendo na janela de medição.

FPS = inverso do frametime médio; p95/p99 calculados sobre requestAnimationFrame; 1% low = inverso da média dos 1% intervalos mais lentos. Heap JS e contadores do renderer amostrados aproximadamente a cada 500 ms. CPU/GPU globais e VRAM não foram medidos.

| Condição | Quadros | Duração | FPS | p95 ms | p99 ms | 1% low |
|---|---:|---:|---:|---:|---:|---:|
| Referência Iteração 25 | 1205 | 20,34 s | 59,23 | 27,9 | 32,2 | 18,95 |
| Primeira implementação | 1073 | 20,51 s | 52,31 | 35,0 | 49,5 | 11,22 |
| Repetição antes do filtro espacial | 1032 | 20,38 s | 50,63 | 35,8 | 46,2 | 13,88 |
| Entrega com filtro espacial | 1185 | 20,35 s | 58,22 | 28,5 | 32,8 | 17,88 |

Gargalo encontrado: centenas de testes de segmento percorriam obstáculos de todo o ambiente a cada descoberta de célula. Correção: pré-calcular caixas de cada geometria e selecionar os candidatos próximos antes dos testes exatos existentes. Não foram reduzidos monstros, sombras ou elementos do mundo. Ensaio isolado de 400 atualizações: média 4,93 → 0,51 ms, p95 22,48 → 2,53 ms. Esse microbenchmark não é FPS do jogo.

No Electron otimizado, 340 amostras: descoberta média 0,945 ms, p95 3,7 ms, máximo 7,5 ms; atualização completa de mapa/UI média 1,574 ms, p95 5,3 ms, máximo 8,6 ms. A UI inclui a descoberta, portanto os tempos não devem ser somados.

Referência/entrega: 28 geometrias, 13 texturas, 40 programas; draw calls 61–81, terminando em 79, iguais nas duas condições. Heap JS 18,48–45,67 MB antes e 19,68–45,65 MB depois (26,77 MB ao terminar). DOM 616–617 contra 629–630 durante movimento; 20 aberturas/fechamentos não aumentaram a contagem. Dois canvases auxiliares são reutilizados, redimensionados na troca de ambiente; não se mantém um cache de imagens de todos os andares.

O desempenho final ficou próximo da referência, com pequeno custo adicional medido. A diferença não é um ganho conclusivo nem prova de equivalência em todos os computadores. Amostras curtas, uma máquina e mesma rota; continuam picos isolados de aproximadamente 283 ms, presentes também na referência. Testes escolares e sessões longas permanecem necessários.

## Evidências e testes funcionais

- `.logs/iteration26-domain-final.txt`: 12/12 testes de domínio.
- `.logs/iteration26-compat.txt`: 18/18 contratos de habilidades e InterfaceSafety existentes.
- `.logs/iteration242-navigation-optimized-1792808227927/report.json`: Electron real, aprovado, sem erros. Movimento, M, pan/zoom, mundo ativo, TAB, 20 ciclos sem crescimento de DOM, impacto confirmado, recarga, caverna com entrada/saída percorridas, castelo e arena.
- `.logs/iteration26-reference/.logs/iteration242-navigation-before-1792807987066/report.json`: referência anterior.
- `.logs/iteration242-navigation-first-1792807873088/report.json` e `.logs/iteration242-navigation-final-1792808067498/report.json`: medições iniciais antes do filtro espacial.
- `.logs/iteration26-release-build.txt`: build aprovado em 1,57 s; mantém aviso preexistente de chunk acima de 500 kB.

Capturas reais em `.logs/iteration242-navigation-optimized-1792808227927/`: `map-floor1-hud.png`, `map-floor1-expanded.png`, `map-small.png`, `map-impact-closed.png`, `map-floor2-outside.png`, `map-cave-interior.png`, `map-cave-return.png`, `map-castle-exterior.png`, `map-castle-interior.png`, `map-private-arena.png`. São imagens do jogo em execução, não arte conceitual.

## Falhas durante o desenvolvimento

Os primeiros testes de caverna/castelo criavam só a geometria base, sem a composição runtime existente: fixtures corrigidas para usar awakenTower/installCastle, sem alterar o jogo. O primeiro roteiro Electron chegou à arena com um fixture sem chefe; a simulação existente exigia esse encontro e recusou a entrada. O roteiro foi corrigido para preservar o chefe real. A execução otimizada completa foi aprovada.

## Pendências e limites

Sem sincronização online, minimapa novo apenas na campanha offline. Sem alteração de combate, economia, progressão, geração de runs ou conteúdo. Saves reais não usados; ensaios usam perfis/servidores temporários. Nenhum commit, push, deploy ou próxima iteração.

Playtest humano de legibilidade/estética ainda pendente. Grade conservadora pode mostrar menos área do que o cenário 3D; não é visibilidade óptica nem descoberta ao redor de curvas. Água, camadas e paredes usam a navegação real. O decoder impõe limites defensivos de tamanho e versão; nenhuma migração apaga entradas antigas.


## Fechamento da validação

- `node --test --test-concurrency=2 tests/*.test.js`: **708/708 aprovados**, zero falhas, cancelamentos ou skips; 184,80 s. Log `.logs/iteration26-full.txt`.
- `npm run build`: aprovado, 1,57 s, conforme `.logs/iteration26-release-build.txt`.
- Electron suplementar de água: `.logs/iteration242-navigation-water-1792808508074/report.json`, `ok: true`, sem erros. Capturas `map-water-bank-hud.png` e `map-water-bank-expanded.png` mostram a primeira faixa de água descoberta junto à margem; o corpo inteiro e a margem distante não são revelados automaticamente.
- `git diff --check`: sem erros.

Medições e validação automatizada não equivalem à aprovação visual por uma pessoa. Não houve commit, push, deploy ou alteração de saves reais. As mudanças anteriores presentes no checkout foram preservadas.
