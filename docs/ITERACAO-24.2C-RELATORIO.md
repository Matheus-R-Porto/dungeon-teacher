# Iteração 24.2C — águas, pesca e mineração

Estado: fase 24.2C concluída no escopo solicitado. Suíte final 688/688, build e roteiros Electron aprovados. Fases A/B preservadas com regressões do castelo e covil. Sem commit, push, deploy ou alteração de saves reais. Permanecem os limites de playtest humano e hardware descritos abaixo.

## Diagnóstico

- A água era apenas decoração em `forest.js` e `living-forest.js`. `livingTower.water` declarava `traversable:true`; colisão não consultava nenhum desses contornos. A pesca usava `waterFeatures`, mas apenas lagos opcionais possuíam um ponto fixo de margem em `fishingSpots`. As lagoas adicionais não entravam nessa lista.
- Os contornos também divergiam: a pesca consultava uma elipse enquanto a Torre Viva desenhava uma borda sinusoidal de 32 segmentos.
- A boia se deslocava horizontalmente e o percurso visual só terminava em 0,8 s, embora o estado de lançamento durasse 0,35 s. O recolhimento elevava a boia sem curva completa; usava um único quadro do personagem.
- Fontes do Refúgio são água contida em construções decorativas, com obstáculo sólido próprio; não são lagos pescáveis. Não foi encontrado rio com uma representação independente nos mapas atuais. Não se implementou natação nem uma nova atividade online.

## Implementação

- `water-geometry.js`: contornos finitos compartilhados por desenho, colisão e seleção de água. Mantém posição, altura, superfície, raio e vértices; migração transitória e idempotente, sem regravar mapas persistidos.
- `collision.js`, `surfaces.js`, `simulation/game.js`: teste de círculo contra o contorno e segmento varrido, incluindo diagonais; água limitada à superfície correta. Movimento manual, pathfinding e monstros usam o mesmo bloqueio. Não há retângulo invisível cobrindo os cantos secos.
- `tower.js`, `living-tower.js`, `forest.js`, `living-forest.js`: instalam/desenham os contornos; margens secas conectam lagoas às clareiras quando a decoração antiga ocupava a entrada estreita de uma trilha. A água continua sólida, a margem adicionada é também desenhada. Mantidos IDs, população, portais e encontros.
- `fishing-water.js`, `fishing.js`, `main.js`: clique na água ou F em uma margem válida, sem marcador obrigatório. Validação de solo, superfície, alcance, obstáculo e ponto final. Alcance explícito de 3,8 unidades deriva do antigo máximo: 2,4 entre margem e boia mais 1,4 de interação. A vara continua sendo uma ferramenta carregada na mochila, como antes; não se criou exigência de substituir a arma. Os IDs antigos de margem continuam aceitos para compatibilidade, mas a interface não depende deles.
- `fishing-trajectory.js`, `fishing-visual.js`, `activity-animation.js`, `sprite-actor.js`: arcos parabólicos independentes de FPS, linha com buffer fixo de 17 pontos, alturas do jogador/água, preparação dentro dos 0,35 s existentes. Recolhimento visual mantém a janela anterior de 1,35 s. Resultado, tempos de espera, chances, XP e persistência continuam no domínio.
- Novo atlas `fishing-reel-v064.png`: pose de esforço em quatro orientações, produzida com imagegen a partir do personagem existente e empacotada com o utilitário do projeto. Fonte e manifesto preservados. Não é uma cópia do quadro anterior. Essa arte é recurso do jogo, não evidência de execução.
- `mining-hud.js`, `style.css`: painel compacto de pedra escura, metal e dourado, estado legível, ação principal destacada e tratamento para janelas baixas. `MiningRuntime`, configuração e recompensas não foram editados.

## Falhas investigadas

Primeira regressão: 675/686, 11 falhas. A reinstalação da geometria incrementava a revisão mesmo sem alteração: corrigida idempotência. A água bloqueava gargalos de terreno em algumas sementes: margens secas adicionadas com desenho correspondente; não se liberou passagem sobre água. Isso também evitou repetir a geração e mudar a composição de encontros.

A repetição focal corrigiu os problemas de geração. Restou uma expectativa antiga exigindo água atravessável; foi atualizada para a nova regra explícita do usuário. Seis testes de persistência encontraram EPERM ao criar hard links no sandbox; a repetição fora dele resolveu esse impedimento sem modificar os testes ou os arquivos reais. A repetição seguinte revelou uma árvore obstruindo o desvio seco na semente 4294967295/andar 3 e o desenho residual de marcadores no construtor de FishingVisual. A geração agora protege o entorno dos lagos contra árvores adicionais; os marcadores foram removidos. Ruínas decorativas sobrepostas à água deixam de ser desenhadas, preservando seus dados originais. O renderer usa diretamente os vértices canônicos. Os 8 testes novos passaram.

A suíte subsequente aprovou 686/687; a única falha foi HTTP 404 no teste do protocolo desktop enquanto o build paralelo esvaziava dist. O teste depende de dist/index.html: a repetição final deve ocorrer com build pronto, sem essa concorrência.

## Validação final

Comando npm test: **688/688 aprovados**, zero falhas, cancelamentos ou ignorados, 179,52 s; .logs/iteration242c-approved-tests.txt. Inclui as regressões de campanha, multiplayer, persistência, combate e 12 clientes existentes. Os nove testes específicos de C também passaram isoladamente, incluindo criação de jogador em superfície elevada acima da água; .logs/iteration242c-layers.txt.

Comando npm run build: aprovado em 1,91 s; .logs/iteration242c-approved-build.txt. Permanece o aviso existente de bundle acima de 500 kB. Nenhuma dependência adicionada. git diff --check aprovado. Build foi concluído antes da suíte final; os roteiros Electron também terminaram antes dela. As evidências e métricas estão nas seções seguintes.

## Limites de escopo

Pesca e mineração continuam sendo atividades da campanha local; o protocolo online atual não possui comandos dessas atividades. A água bloqueia também a navegação autoritativa da Torre compartilhada. Não se introduzem recompensas locais no servidor nem se altera sua autoridade.

Sem mudanças de HUD superior, hotbar, combate, probabilidades, economia, agendador, progressão, castelo ou Lobo Branco. Nenhuma validação em computadores escolares pode ser inferida destes testes.

## Consolidação A/B/C

| Fase | Implementado | Testes automáticos | Verificação visual | Playtest humano restante |
| --- | --- | --- | --- | --- |
| A | Castelo, interior compartilhado, arena privada do Cavaleiro, progressão permanente, densidade, trilhas e zoom | Suíte histórica 671/671; fluxos locais/online, quatro armas, instâncias e 12 clientes mantidos na suíte atual | Exterior, interior, arena, retorno e zoom nos registros de A; regressão C registrada abaixo | Balanceamento de sobrevivência, percepção de densidade e navegação livre em diferentes máquinas |
| B | Covil frontal rochoso, corredores naturais, filtragem subterrânea, atmosfera e preparação das luzes | Suíte histórica 679/679; navegação, superfícies, miniboss e mineração mantidos | Cinco passagens históricas; zero programas novos após correção da luz. Regressão C registrada abaixo | Leitura espacial e combate prolongado contra o Lobo Branco em hardware escolar |
| C | Água sólida pelo mesmo contorno visual, pesca por margem natural, arcos e nova pose, mineração reformulada | Geometria, diagonais, caminhos, superfícies, alcance, obstáculos, recompensas, cancelamento e buffers | Pesca em dois lagos, arremesso/recolhimento e mineração em três tamanhos de janela | Sensação da animação, preferência estética, exploração de sementes não exercitadas e sessões longas |

A evidência visual é execução real do Electron; o novo atlas é apenas recurso artístico. As regressões usam perfis de teste e algumas posições preparadas para isolar o caso. Não equivalem a uma campanha humana inteira. A vitória do roteiro de castelo aplica dano de teste ao chefe para verificar retorno/desbloqueio; não comprova balanceamento de combate.

## Desempenho e memória da pesca

Windows, Node 24.19.0, Electron 44.5.1, Three.js 0.186.1, build de produção. Dois processos Electron, High, adaptação desligada, oclusão do Windows desativada no harness; A na campanha e B no hub de teste. Perfis e bancos isolados. Referência: cópia exata do estado A+B feita antes de C, e não o HEAD antigo. Mesma semente 42, lago legado, 12 tentativas alternando cancelamento e captura real. Medição requestAnimationFrame sem screenshots dentro da janela; recursos a cada 500 ms. Não houve suíte ou build concorrente nas medições.

| Medida | A+B antes de C | C final |
| --- | ---: | ---: |
| Quadros / duração | 3.101 / 55,84 s | 3.068 / 56,06 s |
| FPS médio | 55,54 | 54,72 |
| p95 / p99 | 31,10 / 35,30 ms | 30,90 / 35,60 ms |
| 1% low | 25,85 FPS | 24,47 FPS |
| Maior frametime | 76,10 ms | 62,40 ms |
| Quadros acima de 50 / 100 ms | 2 / 0 | 4 / 0 |
| Draw calls máximas | 109 | 103 |
| Triângulos máximos | 12.193 | 11.971 |
| Texturas | 13 | 14 |
| Geometrias início → fim | 41 → 47 | 40 → 44 |
| Heap JS máximo | 45,39 MiB | 45,17 MiB |
| Programas no começo / novos depois | 40 / 0 | 40 / 0 |

Média final 1,46% menor; p99 0,30 ms maior. Não há evidência de regressão gráfica relevante nesta amostra, nem comprovação de ganho. A remoção de marcadores/ruínas sobrepostas foi correção visual solicitada, não corte de efeitos para maquiar métricas. A textura adicional é o novo atlas. Geometrias aumentam no primeiro uso de efeitos já presentes na referência; na segunda metade ficam estáveis em 47 antes e 44 depois. A linha mantém o mesmo buffer. Não há novos shaders após a primeira amostra. Heap varia com coleta de lixo; não foi forçada. Isso não mede VRAM nem prova ausência de vazamento em sessões de horas.

Mineração: três sessões com cancelamento, em 1280×720, 1024×768 e 800×600, mantiveram 84 geometrias, 11 texturas e 36 programas. Heap oscilou entre 33,77 e 48,62 MiB; não interpretar como vazamento ou memória total. Um golpe real terminou PERFECT e concedeu 12 XP. O domínio e os valores de mineração permanecem inalterados.

Referência: .logs/iteration242c-reference/.logs/iteration242-water-before-1792800218993/report.json e water-frames.json. Final: .logs/iteration242-water-complete-1792800950229/report.json e water-frames.json. Ensaio C intermediário (.logs/iteration242-water-after-1792800330784) marcou 57,97 FPS, mas ainda tinha marcadores residuais; não é usado como resultado final. Duas tentativas iniciais da referência falharam na inicialização por config ausente na cópia; foram descartadas e a cópia corrigida. A GPU integrada AMD era a configuração registrada nos ensaios anteriores; este roteiro não coleta identificação GPU nem utilização CPU/GPU, portanto não revalida essa atribuição.

## Evidências visuais C

Pasta final: .logs/iteration242-water-complete-1792800950229.

- water-living-pool.png e water-manual-shore.png: lago adicional, movimento manual na borda.
- fishing-water-impact.png: chegada à água.
- fishing-reel-new-frame.png e fishing-reel-return.png: pose nova e peixe recolhido.
- fishing-second-water.png: lago legado acionado pela tecla F, sem marco de margem ou ruína na água.
- mining-1280x720.png, mining-1024x768.png, mining-800x600.png e mining-result.png: layout e resultado real.

A captura final nomeada fishing-cast-arc.png ocorreu já no estado de espera devido à latência de captura. A curva aérea está registrada na captura intermediária .logs/iteration242-water-after-1792800330784/fishing-cast-arc.png, anterior apenas à limpeza decorativa; a trajetória é a mesma. O teste numérico verifica extremos, altura e independência de FPS. Não foi produzido vídeo. Os rótulos “Desvio · Margem dos viajantes” são nomes de trilhas preexistentes, não pontos obrigatórios de pesca; sua repetição visual não foi reformulada nesta fase.

Reprodução PowerShell, após npm run build: definir BENCH_WATER=1 e BENCH_LABEL=water-check; executar node scripts/iteration242c-electron.mjs. WATER_MEASURE_ONLY=1 omite as etapas visuais para executar a mesma medição na referência. Não combinar com BENCH_CASTLE ou BENCH_CAVE.

## Regressão adicional de superfícies

O roteiro do castelo inicialmente criava seu jogador de teste sobre uma posição elevada, mas validava a posição como chão. O harness passou a validar explicitamente layerWorld antes de posicionar o fixture. A repetição então demonstrou o mesmo problema no retorno real do castelo: Game.constructor consultava o mundo bruto, ignorando spawn.surface, e recusava a posição elevada por causa da água abaixo. Corrigido para validar a camada declarada; o térreo continua bloqueado. Incluído teste de nascimento acima da água e rejeição do mesmo ponto no chão. Isso não muda o controlador do Cavaleiro ou o fluxo de recompensas.

Tentativas diagnósticas preservadas: .logs/iteration242-castle-c-regression-1792801072777 (fixture) e .logs/iteration242-castle-c-final-1792801126826 (retorno real). Não são consideradas aprovações. A comparação de pesca final precede apenas esta correção de validação inicial; ela não altera o loop de renderização medido.

## Regressões Electron A/B concluídas

- Castelo: .logs/iteration242-castle-c-approved-1792801234305/report.json, ok:true, sem exceções. Entrada no nível 1, dois jogadores no interior, caminhada até a arena sem matar os inimigos comuns, arena separada, vitória de fixture com retorno/desbloqueio e saída real do segundo jogador para a entrada elevada. Capturas castle-exterior, castle-interior, castle-arena-door, castle-knight-arena, castle-return e floor-one-max-zoom.
- Covil: .logs/iteration242-cave-c-approved-1792801291626/report.json, ok:true, uma entrada/saída real. Capturas frontal/lateral/traseira, corredor, Lobo Branco e retorno. 2.783 quadros/39,37 s, 70,68 FPS, p95 19,80 ms, p99 24,10 ms, 1% low 33,59 FPS, máximo 64,60 ms, um quadro acima de 50 ms e nenhum acima de 100 ms. Os 41 programas já estavam presentes na primeira coleta; nenhum surgiu depois. Este ciclo curto não é comparação equivalente aos cinco ciclos históricos de B e não demonstra ganho. A correção das luzes de B permanece no código.

Reprodução: BENCH_CASTLE=1 ou BENCH_CAVE=1, CAVE_CYCLES=1, node scripts/iteration242c-electron.mjs. Nunca combinar ambos. Os scripts encerram seus clientes/servidor de teste.

## Pendências e encerramento

Nenhuma falha conhecida permanece nos cenários exercitados. Ainda dependem de playtest humano: percepção de esforço da nova pose, leitura das margens em outras orientações, exploração prolongada de sementes e avaliação em computadores escolares. As quatro direções, alturas distintas e interrupção por dano foram verificadas automaticamente; as capturas não representam todas essas combinações. A medição curta não substitui ensaio de horas nem mede VRAM. Picos de criação inicial de mapas e o tamanho existente do bundle continuam sendo limites gerais, sem uma nova auditoria de desempenho nesta fase.

Pesca e mineração permanecem locais; não foi criado suporte online para atividades que o protocolo não oferece. O agendador do servidor, autoridade multiplayer e correção de preparação de luzes permanecem preservados. Nenhum save real foi apagado, migrado ou gravado por este trabalho. Não houve commit, push, deploy ou geração de pacote distribuível. A execução termina na 24.2C; nenhuma próxima iteração foi iniciada.
