# Iteração 24.2B — Covil do Lobo Branco e geografia natural

Estado: fase B concluída, com validação funcional, visual e de desempenho e limitações registradas abaixo. Somente B; fase C não iniciada. Trabalho sobre 12568ea com as alterações não commitadas da fase A preservadas.

## A. Diagnóstico confirmado

- **Entrada:** a composição anterior tinha dois blocos rochosos e uma viga, sem uma massa rochosa sólida correspondente nos dados de colisão. Era possível atravessar visualmente suas laterais/costas no plano exterior. Os conectores de superfície já se limitavam à extremidade frontal da rampa: não foi reproduzida uma troca direta para o subsolo pelas costas. Portanto não se atribui o problema a um suposto teleporte inexistente. A correção acrescenta colisão à formação e uma condição explícita de avanço pela frente, além de testar os três lados.
- **Transição abrupta:** updateAwakened trocava a visibilidade no limiar y < -0,4, alterava luz/cor instantaneamente e não restaurava simetricamente toda a atmosfera. A câmera já acompanhava a altura contínua da rampa; não havia razão para criar outro mapa.
- **Sprites externos:** a lista ground era uma fotografia dos objetos durante buildAwakened, anterior a portal, jogador e entidades remotas. Mais importante, SceneView.update chamava updateLivingForest depois de updateAwakened: a primeira função voltava a definir visible=true para vegetação próxima que a segunda acabara de esconder. A causa não era apenas inclusão tardia.
- **Geometria:** o deck retangular de 36 × 52 unidades e duas caixas transversais eram a própria definição navegável. A aparência quadrada não era uma falha de textura/carregamento.
- **Conteúdo:** o Lobo Branco persistente é público e exclusivo da Torre compartilhada conforme docs/ITERACAO-22.2-RELATORIO.md, confirmado pelo guard sharedPolicy. A campanha compartilha geografia e lobos comuns; o encontro persistente não foi importado nem suas recompensas inventadas. Isso explica a ausência do miniboss ao testar a campanha. Na Torre compartilhada ele aparece e combate no salão esperado.
- **Cristais/mineração:** os oito octaedros azuis de buildAwakened eram decoração; os mineralVeins têm dados, colisões e interações próprios. Somente a decoração foi retirada.

## B. Implementação

- src/world/wolf-cave.js: composição transitória de passagens curvas com larguras diferentes, cavidade lateral e salão, usando a união de cápsulas/círculos já suportada pela colisão. A superfície mantém id, altura -5 e conexão com a rampa original. Dados persistidos de mapas não são regravados.
- src/world/surfaces.js: superfícies podem declarar sua geometria navegável em walkable; as demais mantêm o retângulo anterior. Rampa do covil exige cruzamento frontal no sentido da descida. Castelo não usa essa alteração específica.
- src/world/awakened-tower.js: instala a geometria antes de distribuir a população. Quantidades, tipos e recompensas preservados. Reservas do uivo recebem posições válidas para o novo contorno.
- server/white-wolf.js: o uivo usa esses pontos seguros, com fallback para mapas antigos. Habilidades, HP, dano, contribuição, chance de baú, respawn e lógica do encontro não foram redesenhados.
- src/adapters/rendering/wolf-cave.js: arco rochoso irregular, cobertura, garganta escura e rampas; paredes instanciadas e textura pequena compartilhada. Solo, pedras, vestígios de ossos e leito dão identidade ao salão. Não existem as duas divisórias quadradas nem as oito pedras azuis. Borda junto à saída fica aberta visualmente.
- cave-visibility.js: exterior é a camada padrão 0, inclusive para objetos adicionados depois; subsolo usa 1 e elementos do jogador usam 2. A câmera escolhe o setor. Não há lista estática de vegetação nem reatribuição de visible em todos os objetos a cada quadro. Entidades remotas, inimigos, efeitos e seleção respeitam as camadas. Rótulos remotos seguem a mesma filtragem.
- scene.js, remote-players.js e combat-visual.js: aplicam a política acima, preservam altura dos efeitos e evitam animar modelos ocultos. Vegetação/partículas exteriores deixam de atualizar durante a permanência no subsolo. Clique no vazio subterrâneo não retorna um destino no plano exterior.
- Atmosfera interpola brevemente durante a descida/subida; o estreitamento escuro da boca encobre a troca de setor. Direção e posição vêm da caminhada normal. Sem troca de mapa, reconstrução de cena ou alocação de geometria por quadro nessa transição.
- scene-compilation.js / scene-warmup.js: os recursos subterrâneos são preparados em lotes no carregamento existente do andar, sem mudar a máscara da câmera visível. O primeiro ensaio funcional apresentou picos de 228,9 e 146,1 ms; a inspeção também confirmou que a nova camada não estava incluída na preparação. A repetição final mede o resultado; não se assume que todo pico tenha essa única causa.
- **Relevo/mirantes:** a fase A já retirava os mirantes dos andares 1/2. Não havia motivo para recriá-los; a descida e a formação rochosa dão relevo ao segundo andar. A plataforma do terceiro pertence ao castelo e foi preservada, assim como seu acesso, interior e arena.

## C. Testes e limites

- tests/iteration242b.test.js: aproximação frontal, lados/costas, clique até o covil, todas as passagens e retorno em três sementes; orientação e altura; colisão e rotas de monstros; ausência de colisão exterior no subsolo; preservação da fonte e da mineração; objetos tardios/entidades por região; preparação das duas camadas; percurso também na campanha.
- Primeira suíte: 675/676. Uma falha em um fixture de seleção sem view.world; corrigida consulta opcional ao mundo. Não foi apagado nem afrouxado o teste.
- Regressão focal posterior: 63/63 em .logs/iteration242b-final-focal.txt (antes da inclusão do último teste de percurso local).
- Primeiro roteiro Electron falhou por comando destination com campo y não aceito pelo protocolo. Corrigido apenas o roteiro. A execução seguinte passou cinco entradas/saídas reais; capturas e dados em .logs/iteration242-cave-walk-1792716952341. Esse ensaio precede o último polimento e a preparação das camadas.
- O harness inicia o personagem perto da entrada e aumenta sua vitalidade, permitindo medir sem interromper por morte. O restante do percurso usa comandos normais de destino; não se afirma playthrough humano completo. O Lobo ataca e o jogador foge sem eliminar os inimigos.
- Suíte completa após a implementação: **678/678**, sem falhas ou testes ignorados, 114,06 s (.logs/iteration242b-final-tests.txt). Uma repetição final verifica a correção adicional da junção descrita abaixo. Build aprovado, 1,45 s; aviso preexistente de bundle acima de 500 kB.

## D. Metodologia de desempenho

Dois clientes Electron, High, adaptação desligada, GPU integrada AMD, perfis/bancos temporários, mesma janela e câmera. Cinco entradas/saídas no mesmo mapa; 5 s de amostra interior e 3 s exterior por ciclo; primeiro ciclo visita o salão e as passagens. Suíte parada durante medições. Captura reaproveita o instrumento da 23.3. Recursos são amostrados a cada visita, sem forçar coleta de lixo.

Referência isolada: 12568ea (código equivalente a ab866c0 salvo README), .logs/iteration242-reference/.logs/iteration242-cave-reference-1792717335827. **Não é um snapshot exato da fase A**: os primeiros roteiros sobre A falharam por formato inválido de comando e não produziram métricas utilizáveis. A referência preserva o covil retangular antigo; o relatório distingue essa limitação. As rotas mudaram com a geometria, portanto a duração global também muda. Comparar sobretudo janelas estacionárias; não usar médias globais como prova de ganho.

## E. Evidências finais

Electron compartilhado aprovado: .logs/iteration242-cave-final-1792717468642/report.json, com cinco entradas/saídas reais. Capturas: cave-front.png, cave-side.png, cave-back.png, cave-first-passage.png, cave-rocky-passage.png, cave-wolf-den.png e cave-return.png. Frente/lado/costas são ângulos de câmera ao redor da entrada real. O teste de travessia por lados/costas é separado, na simulação.

## F. Restrições e continuidade

Sem alterações de HUD superior, mineração, água, pesca, combate/recompensas, agendador ou dados reais. Sem commit, push, deploy ou instalador. A fase C continua aguardando autorização. Cinco ciclos não provam ausência de vazamento e nenhum ensaio valida hardware escolar. O modo local mantém o contrato anterior, sem o miniboss público persistente.

## Verificações adicionais reveladas pelos ensaios

- A captura local identificou um rótulo de trilha exterior dentro do covil. src/ui/hud.js agora filtra rótulos de trilha, NPCs e portal pelo setor subterrâneo. Nenhum layout da HUD superior foi alterado. A verificação Electron exige ausência de data-trail-label no interior.
- A mineração não existe no mapa compartilhado do segundo andar usado no benchmark. Foi validada no bioma Caverna da campanha, andar 5, com veio real vein-5-0 e estado strike: .logs/iteration242-cave-local-final-1792718173973/report.json, ok:true. Capturas campaign-cave.png e mining-preserved.png. O primeiro fixture parou 0,1 m além do alcance; foi corrigido para usar MINING.interactionRadius, sem modificar essa regra.
- A retirada das screenshots durante a amostragem expôs uma condição na junção da rampa: um comando imediatamente depois da troca de superfície podia partir de um centro ainda dentro da margem física da borda e o pathfinding retornava null. src/world/navigation.js agora termina o curto cruzamento antes de seguir a nova rota, sem teleportar ou aceitar passagem por paredes. Teste específico reproduz o instante exato e preserva posição ao emitir o comando. 31/31 testes focais, incluindo o castelo, passaram (.logs/iteration242b-seam-tests.txt).
- A câmera subterrânea excluía também uma luz de recorte, criando um conjunto de luzes diferente do pré-compilado. As luzes agora pertencem às duas camadas; somente a geometria é filtrada. Mantêm-se sombras e adaptação atmosférica.
- Os ensaios com capturas tiveram picos de até 244,8 ms. Esses valores foram mantidos nos registros; tirar screenshots dentro da janela é um fator de confusão. A comparação principal foi repetida sem screenshots durante a captura de tempos. Não se atribui a causa dos picos somente ao coletor sem essa repetição.

## G. Comparação final sem screenshots durante a medição

Referência: .logs/iteration242-reference/.logs/iteration242-cave-measure-before-1792717771721. Entrega: .logs/iteration242-cave-lights-final-1792718992697. Ambos contêm report.json e frames.json; cinco ciclos, dois processos Electron, mesma qualidade/câmera e servidor isolado. As capturas finais foram feitas depois de parar o cronômetro.

| Medida | Covil anterior | 24.2B final |
|---|---:|---:|
| Quadros / duração | 6.704 / 103,64 s | 6.126 / 95,71 s |
| FPS médio | 64,68 | 64,01 |
| Frametime p95 | 18,70 ms | 18,70 ms |
| Frametime p99 | 20,40 ms | 20,50 ms |
| 1% low | 43,65 FPS | 42,74 FPS |
| Maior frametime | 66,50 ms | 48,70 ms |
| Quadros acima de 50 ms | 2 | 0 |
| Draw calls no salão | 27 | 27 |
| Draw calls no primeiro trecho | 44 | 14 |
| Geometrias nas cinco amostras | 53 | 51 |
| Texturas nas cinco amostras | 12 | 12 |
| Maior heap amostrado | 31,49 MiB | 43,08 MiB |
| Heap na última visita | 20,05 MiB | 13,90 MiB |

No salão, a janela estacionária de 5 s registrou 65,26 → 65,62 FPS e p99 de 20,30 → 20,40 ms. As médias globais não demonstram ganho: o percurso e a geometria são diferentes, e não há várias repetições pareadas para estabelecer significância. A redução de draw calls no trecho acompanha a exclusão correta do exterior, não a remoção de inimigos ou sombras.

Heap nas cinco visitas finais: 43,08 / 23,05 / 18,02 / 17,17 / 13,90 MiB. Geometrias e texturas permaneceram estáveis. Não houve crescimento monotônico, mas o pico inicial foi 11,59 MiB maior; coleta de lixo e preparação inicial não foram controladas. Estes dados não provam ausência de vazamento, não medem VRAM e não substituem ensaio em computadores escolares.

### Gargalo confirmado e correção

Antes da última correção, a versão B registrou 345,10 ms máximos e quatro quadros acima de 100 ms (.logs/iteration242-cave-measure-fixed-1792718204392). Um rastreamento separado de um ciclo encontrou esperas GetProgramiv de 136–161 ms (.logs/iteration242-cave-trace-1792718522271/trace.json). O registro dos programas mostrou oito novas variantes depois de iniciar a caminhada, todas diferindo pela contagem de luzes pontuais (.logs/iteration242-cave-programs-1792718686332/report.json).

A luz do portal era construída depois de buildWolfCave e permanecia só na camada exterior. Mesmo sem iluminar fisicamente o covil distante, sua retirada da lista de luzes mudava a variante de shader. SceneView.buildSteps agora inclui todas as luzes após construir portal/NPCs, antes da preparação. A distância/atenuação original é preservada. No ensaio final houve **zero programas novos durante a caminhada**, máximo de 48,70 ms e zero quadros acima de 50 ms. Isso sustenta a causa e a correção deste gargalo específico; não garante eliminação de todo pico em outro hardware. Nenhum objeto, efeito ou sombra foi retirado para melhorar a métrica.

Os ensaios de rastreamento/programas usaram um ciclo. Uma mensagem antiga do harness dizia “five” de forma fixa; foi corrigida para registrar CAVE_CYCLES. O relatório final registra corretamente cinco ciclos.

### Evidências e reprodução

- Capturas finais com a correção de luz: .logs/iteration242-cave-lights-final-1792718992697/cave-front-final.png e cave-wolf-den-final.png.
- Ângulos lateral/traseiro, passagens e retorno: .logs/iteration242-cave-final-1792717468642/cave-side.png, cave-back.png, cave-first-passage.png, cave-rocky-passage.png e cave-return.png. A geometria é a final; estas precedem a correção de preparação das luzes. As capturas da entrada mostram também o relevo rochoso; os mirantes já haviam sido retirados na fase A.
- Campanha sem rótulos exteriores e mineração ativa: .logs/iteration242-cave-local-final-1792718173973/campaign-cave.png e mining-preserved.png.
- Não foi produzido vídeo; a caminhada real de ida e volta está registrada pelas cinco passagens do harness e suas amostras.
- Reprodução: BENCH_CAVE=1, BENCH_LABEL=cave-check, CAVE_MEASURE_ONLY=1, CAVE_CYCLES=5, node scripts/iteration242b-electron.mjs. Build de produção deve preceder o roteiro. Os perfis e bancos são temporários, sem saves reais. BENCH_MINING_CAPTURE=1 seleciona o roteiro local de mineração; não combinar com a opção anterior.

### Compatibilidade e limites finais

A suíte inclui os fluxos do castelo, arena, desbloqueios permanentes, densidade, zoom e campanha/multiplayer. O ensaio visual de B confirmou o miniboss público presente, sua perseguição e fuga pelo trajeto normal. Não se afirma uma nova vitória manual completa contra ele; habilidades/recompensas continuam cobertas pelos testes existentes, com mudança restrita a posições navegáveis dos reforços. Os testes de doze clientes e agendador são preservados.

Não há falha funcional conhecida pendente nos percursos exercitados. Permanecem os limites de amostra, hardware e memória acima, além do aviso existente de bundle maior que 500 kB. Fase 24.2C (água, pesca e acabamento da mineração) e reforma da forja não foram iniciadas.

## Validação de encerramento

Suíte completa final: **679/679 aprovados**, zero falhas, cancelamentos ou testes ignorados; 114,63 s, após a correção final da luz do portal (.logs/iteration242b-complete-tests.txt). Build final aprovado em 1,64 s (.logs/iteration242b-release-build.txt), com somente o aviso existente de tamanho de bundle. git diff --check passou; Git apenas informou conversão futura de LF/CRLF em arquivos já modificados.

A fase B está concluída dentro do escopo solicitado. A fase C aguarda nova autorização.

## Atualização após 24.2C

Fase C concluída: água sólida, pesca natural, nova animação e acabamento da mineração. Suíte final 688/688, build e regressões Electron de castelo/covil aprovados. As referências a C pendente acima são históricas. Consulte [o relatório consolidado A/B/C](ITERACAO-24.2C-RELATORIO.md) para alterações, medições, evidências e limites de playtest.
