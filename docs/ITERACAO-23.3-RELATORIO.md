# Iteração 23.3 — Beta 0.6.3: Os Últimos Engasgos

## Resumo executivo

A investigação confirmou duas fontes de pausas: submissão síncrona de shaders durante o preparo e decodificação/upload tardio de atlas de personagem e arma. As correções distribuem a submissão sem serializar a espera da GPU e preparam os atlas já solicitados antes de apresentar a cena.

Na comparação principal de cinco ciclos por versão, os intervalos acima de 100 ms caíram de 25 para três (6,21 para 0,73 por minuto), o p99,9 passou de 100,10 para 66,80 ms e o máximo de 166,90 para 125,10 ms. Nenhum intervalo acima de 100 ms permaneceu nas categorias primeiro render e pós-transição dessa candidata. Isso não significa ausência de engasgos: o pico residual de 125,10 ms continua incluído e a sessão prolongada é analisada separadamente abaixo.

## Referência preservada

O checkout tinha alterações acumuladas de iterações anteriores. Nenhum reset ou commit foi feito. `.logs/iteration233-reference/` contém cópia dos fontes, scripts, testes, configuração, metadados e dist da Beta 0.6.2 final. O status original está em `checkout-status.txt`. Os saves reais e dados remotos não participam dos testes.

A suíte da referência passou em 645/645 testes, em 209,40 segundos. A build também passou. Essa duração não deve ser comparada como regressão de implementação com os 97,76 segundos históricos: não houve alteração do código do jogo entre as duas suítes.

## Método da captura

A ferramenta é um script de desenvolvimento injetado por CDP no Electron real com perfis e servidor isolados. O modo normal não importa o profiler. A comparação sem captura ainda usa um coletor mínimo de intervalos RAF, necessário para medir os resultados; não significa overhead literalmente zero.

São armazenados no máximo 120.000 intervalos, 2.048 eventos e 256 janelas críticas, com contadores de descarte. Cada janela tem até 12 frames iniciais, incluindo o pico, e oito seguintes. A captura registra mapa, quantidade de entidades, perfil, escala, heap, contadores gráficos e tick recebido. Os eventos internos medem a duração de chamadas JavaScript e submissão; os dados GPU, quando disponíveis na execução de trace, usam consultas assíncronas e descartam resultados disjoint. Não se equipara intervalo RAF a custo GPU.

Categorias exclusivas: visibilidade/foco recente (1 s), loading, primeiro render, pós-transição (até 2 s), retomada (2–5 s), gameplay estável (após 5 s ou sem transição), e pré-transição enquanto houver pedido ou antecipação pendente. Usa-se o estado no início do intervalo; cruzar a primeira submissão recebe a categoria primeiro render. A janela de dois segundos pretende capturar os primeiros frames e recursos tardios, sem fingir que a estabilização real tem duração garantida. Os cinco segundos são um corte conservador fixado antes dos resultados. Os outliers permanecem no total.

Retorno de arena é uma etiqueta sobreposta às categorias exclusivas, desde a mudança de arena para mundo público até a próxima mudança de mapa. Sua soma não deve ser adicionada ao total. A espera de resultado do encontro é contabilizada na latência externa; preparação e controle têm timestamps próprios. Mudanças de mapa do roteiro usam o fixture do servidor, seguido do protocolo normal e construção real no cliente. Entrada de arena utiliza request/ready reais. Isso não representa jogadores humanos executando todo o percurso manualmente.

O trace completo e o sampler de CPU são usados em execução separada. Os eventos do Chromium são alinhados a `performance.now()` por um marcador medido. Eventos aninhados não devem ser somados como custos independentes. Queda de heap, proximidade de GC ou lentidão de render não serão tratados isoladamente como prova causal.

## Ambiente

Node 24.19.0, Electron 44.5.1 e Three 0.186.1. Drivers registrados em `.logs/iteration233-reference/gpu.json`: AMD 32.0.21037.1004 e NVIDIA 32.0.16.1060. A GPU efetivamente usada e a resolução vêm do inventário de cada execução, não da mera presença dessas placas. Dois Electron, Alto, ajuste automático desligado; mesmos parâmetros de oclusão do sistema e VSync dos ensaios anteriores. A oclusão do jogo permanece ativa.

## Evidências iniciais

Referência final 0.6.2, repetida nesta iteração: 602,29 s, 37.259 intervalos, 72 transferências, zero arenas remanescentes. Sessão inteira: 61,86 FPS, p99 32,80 ms, p99,9 116,20 ms, 1% low 16,02 FPS, 0,1% low 7,07 FPS, máximo 303,30 ms, 56 intervalos acima de 100 ms. Pela classificação antiga, gameplay contém 18 intervalos acima de 100 ms e máximo 139,70 ms; loading contém 38 e máximo 303,30 ms. Esses grupos antigos não são prova causal; a captura temporal detalhada aparece abaixo.

A cadência difere da sessão histórica de 98,41 FPS. A mesma GPU integrada AMD foi identificada, com viewport 1282×722 e DPR 1,25. Não houve intervenção gráfica entre o código final preservado e esta referência. A diferença histórica não é um ganho ou perda atribuível a esta iteração; o estado do sistema e a cadência de apresentação são limitações da comparação histórica. A origem dessa variação não foi confirmada.

- `.logs/iteration233-reference-tests.txt`
- `.logs/iteration233-reference-build.txt`
- `.logs/iteration233-reference-soak.txt`
- `.logs/iteration232-233-reference-soak-1792620965485/report.json`

Esses resultados iniciais são mantidos como histórico da investigação. A comparação principal usa a repetição `reference-repeat`, com cadência próxima à da candidata, nas tabelas consolidadas abaixo.

## Primeira localização causal

Cinco ciclos com captura leve na referência produziram 250,997 s e 15.665 intervalos: p99 31,60 ms, p99,9 101,30 ms, máximo 241,80 ms, 18 intervalos >100 ms. Distribuição desses 18: 11 loading, quatro primeiro render, dois pós-transição e um pré-transição. Gameplay estável teve 5.835 intervalos, p99 20,70 ms e máximo 80,80 ms, sem intervalos >100 ms. Isso localiza os picos nessa amostra; não comprova ausência universal de pausas estáveis.

O trace separado contém uma perturbação confirmada da própria ferramenta: `CpuProfiler::StartProfiling` consumiu 203,011 ms, dentro do maior intervalo de 241,10 ms, ainda na cidade. Esse evento é mantido nos dados brutos, mas não atribuído ao jogo nem usado como comparação de desempenho da implementação.

No retorno da arena, uma submissão síncrona de shader registrou 179,10 ms. O trace mostra uma tarefa de 180,221 ms e o sampler de CPU encontrou chamadas de compilação, construção de programas e `shaderSource` nesse intervalo. O nome `compileAsync` não torna a submissão inicial assíncrona. A primeira candidata divide a submissão em coleções de até 16 objetos, mantendo a cena original como contexto de luzes/sombras e sem reparentear ou descartar objetos. A espera por compilação e o orçamento cooperativo continuam canceláveis. A comparação repetida antes/depois aparece abaixo.

Também foram observados `Decode Image` de 59,669 ms dentro de um primeiro render de fortaleza, além de amostras em `texSubImage2D`. Isso confirma trabalho de decodificação/upload nesse trecho; não prova que todo pico seja causado por texturas ou pelo driver. O trace registrou esperas explícitas por comandos GPU, como 10,458 ms nesse exemplo. Nas 63 consultas GPU retidas no buffer final, a mediana foi 1,052 ms e o máximo 6,750 ms; são amostras seletivas, não uma decomposição de todos os frames.

Layout chegou a 11,618 ms e MinorGC a 38,105 ms no trace completo. Não há evidência suficiente para atribuir os maiores picos de 180–240 ms exclusivamente a DOM ou GC. Eventos aninhados de GC não são somados entre si. Navegação e regras do servidor permanecem fora das alterações.

A primeira comparação exploratória de overhead teve sobreposição parcial com a análise offline do trace. Foi preservada como execução exploratória, sem sustentar uma conclusão causal; a comparação controlada final foi repetida sem esse processamento concorrente.

## Correções finais e experimento rejeitado

`scene-compilation.js` submete grupos de até 16 objetos e cede um frame quando a fatia acumulada alcança 3 ms. Esse orçamento é cooperativo: uma chamada WebGL indivisível pode ultrapassá-lo. A cena original fornece iluminação, sombras e fog; objetos, pais, materiais e cobertura da compilação são preservados. As promessas GPU ficam em andamento simultaneamente. O grupo temporário libera suas referências mesmo em cancelamento, sem introduzir cache de mapas.

A primeira candidata aguardava cada grupo antes de iniciar o seguinte. Apesar de reduzir unidades síncronas, o primeiro retorno de arena chegou a 13.045,8 ms, incluindo o prazo de resultado. Essa estratégia foi rejeitada. A submissão cooperativa com esperas sobrepostas reduziu esse primeiro retorno para 9.236,7 ms no trace exploratório. Esses números localizam o problema do experimento; a comparação repetida final está nas tabelas.

O trace seguinte identificou uploads de `sword-transition.png` de 95,6 ms no primeiro render da fortaleza, 104,2 ms após a transição da caverna e `sword-action.png` de 78,0 ms. `actor-preparation.js` aguarda a decodificação e inicializa somente texturas já solicitadas pelos atores do destino, deduplicando por source. Uma atualização da pose, sem apresentar o frame, ocorre após os atlas estarem prontos e antes da compilação. Não há antecipação de todo o conteúdo nem redução de qualidade. A propriedade e o descarte continuam pertencendo aos atores.

Na candidata, o primeiro render da fortaleza ficou entre 26,0 e 29,9 ms nos cinco ciclos. O maior trecho de submissão foi 31,4 ms, contra 127,4 ms na referência repetida. O resultado é compatível com as duas causas observadas, mas não identifica a origem de cada pausa residual.

## Linhas temporais representativas

Tempos abaixo são `performance.now()` do renderer de cada execução, em ms; não se misturam relógios entre sessões. Os eventos aninhados são evidências do mesmo intervalo, não custos somáveis.

| Execução | Início | Fim / duração | Evidência |
|---|---:|---:|---|
| reference-trace | 5.600,336 | 5.803,347 | Inicialização do sampler CPU: 203,011 ms; artefato diagnóstico |
| reference-trace | 27.010,477 | 59,669 ms | Decode Image dentro do primeiro render da fortaleza |
| reference-trace | 27.116,054 | 10,458 ms | Espera explícita por comando GPU no mesmo trecho |
| reference-trace | 51.409,499 | 180,221 ms | Tarefa do retorno da arena; submissão de shader medida em 179,10 ms |
| pipeline-trace | 18.112,4 | 18.216,6 | Upload do atlas sword-transition após a transição |
| pipeline-trace | 18.325,5 | 18.403,5 | Upload do atlas sword-action |
| pipeline-trace | 27.196,2 | 27.291,8 | Upload sword-transition no primeiro render da fortaleza |

As janelas completas anteriores e posteriores estão em `frames.json`, com eventos e contextos; `analysis.json` da referência alinha as maiores janelas aos eventos Chromium. Os traces separados contêm perturbação do profiler e não são usados como medição do ganho final. Não foi medido tempo exato de apresentação do monitor ou VRAM em bytes. Escalonamento externo e influência do driver além das esperas observadas permanecem inconclusivos.

## Verificação e escopo

### Interação entre coletores encontrada na revisão final

A leitura das janelas do primeiro ensaio final revelou registros repetidos da mesma chamada `onSnapshot`. O wrapper temporário da captura não preservava a marca `diagnosticWrapped` do coletor já existente; ao mudar de mapa, o coletor existente podia envolver novamente essa função. Isso afeta o modo diagnóstico combinado, não a execução normal sem esses coletores. A captura agora preserva a marca, e um teste verifica substituição de cena repetida e restauração. Não se somam esses eventos duplicados como trabalho adicional do jogo.

A comparação principal antes/depois foi feita com a mesma versão anterior da instrumentação e o mesmo número de ciclos; seus valores permanecem como evidência sob essa condição, com essa limitação. O ensaio prolongado foi repetido após corrigir a ferramenta. A validação de overhead com câmera parada não troca mapas e não sofre esse acúmulo. A build de produção não mudou após a suíte completa; os dez testes focais foram repetidos e passaram após a alteração exclusiva da ferramenta e do teste.

### Ensaio prolongado final

Após corrigir a interação dos coletores, foram medidos **641,957 s e 65.226 intervalos**, em dois Electron: três andares, combate comum, Lobo Branco, caminhada real pela rampa da caverna e escada da fortaleza, Cavaleiro, entrada/retorno e dez ciclos de revisitas. O roteiro encerra o ciclo completo depois de atingir dez minutos. A sessão teve 101,60 FPS, p99 24,80 ms, p99,9 66,80 ms, 1% low 27,30 FPS e 0,1% low 11,59 FPS; máximo **166,90 ms**. Foram **11 intervalos >100 ms (1,028/min)**, um >150 ms e nenhum >200 ms.

Distribuição dos 11 intervalos >100 ms: cinco loading, dois primeiro render, um pós-transição, um retomado, um estável e um pré-transição. Gameplay estável teve 21.553 intervalos, p99 16,90 ms, p99,9 25,20 ms, máximo 100,10 ms e 11 intervalos >50 ms em 191,70 s. O primeiro render teve máximo 166,90 ms, no retorno da arena. Zero arenas permaneceram após os retornos. A mitigação é parcial: os picos não foram eliminados.

A primeira execução final, anterior à correção da ferramenta, foi preservada em .logs/iteration233-final-soak-1792663610529/: 641,965 s, 66.176 intervalos, p99 17,50 ms, p99,9 58,50 ms, quatro intervalos >100 ms e máximo 125,00 ms. Não se escolheu esse resultado mais favorável como conclusão final, nem se atribui a diferença à correção da ferramenta sem ensaios pareados adicionais. A variação entre execuções permanece uma limitação.

Todos os 65.226 intervalos foram classificados, reconciliando 641,957 s. Foram retidas todas as 113 janelas >50 ms, sem descarte de janelas; o contador combinado de descarte foi 74.795, correspondente à rotação de eventos limitados. O buffer final tem apenas um evento de snapshot, sem a cadeia duplicada observada anteriormente. Eventos antigos fora das janelas não estão todos retidos. A contagem de entidades durante loading pode refletir a cena anterior, embora o identificador de mapa já seja o novo; não se usa esse dado para inferir população do destino durante preparação.

O roteiro final acrescenta combate comum e caminhadas às baterias curtas. Por isso, não se interpreta a diferença de suas médias como ganho pareado adicional. Ausência de falhas por dez minutos também não prova ausência de vazamentos em sessões de horas.

Linhas temporais residuais (ms do renderer final):

| Categoria | Intervalo RAF | Chamada observada | Limite da conclusão |
|---|---|---|---|
| Estável, arena | 505.695,5–505.795,6 | renderSubmit 505.702,5–505.797,3, 94,8 ms | Submissão custosa; sem trace GPU/GC desse evento, origem interna inconclusiva |
| Pós-transição, andar 1 | 146.170,9–146.279,1 | renderSubmit 146.179,9–146.280,5, 100,6 ms | Localizado no render, não prova de driver ou atlas específico |
| Primeiro render, retorno | 386.001,1–386.168,0 | long task 386.009,7, duração 159 ms; primeira submissão concluída em 386.164,5 | Trabalho do retorno confirmado temporalmente; decomposição causal desse pico não disponível |

O timestamp RAF corresponde ao relógio de apresentação fornecido ao callback; pode anteceder o início real da execução. Por isso, o fim de uma chamada interna pode ultrapassar o timestamp do callback seguinte. Não se somam long tasks, scene e renderSubmit, que se sobrepõem.

O ganho não é gratuito: no retorno da arena, a mediana externa passou de 9.127,8 para 9.335,4 ms, incluindo o prazo do encontro; a mediana entre início da preparação e liberação de controle passou de 945,4 para 1.135,8 ms. A maior preparação da candidata nessa sequência foi 1.647,6 ms. Aceita-se esse aumento medido para retirar trabalho tardio da interação, sem alterar os oito segundos da regra do encontro. As latências de cada percurso, inclusive resultados negativos, estão preservadas abaixo.

No primeiro andar, o p99 mediano por janela ficou em 17,1 ms em ambas as versões, com primeiro ciclo próximo de 25 ms. O pior intervalo dessas janelas passou de 41,6 para 33,5 ms. Não foi demonstrado gargalo recorrente de concentração de entidades que justificasse mudar navegação, decoração, rótulos ou população. As janelas com Lobo Branco passaram de máximos entre 91,7–125,3 ms para 16,9–32,6 ms; elas incluem o período inicial após a apresentação e não são equivalentes a combate inteiramente estabilizado.

A suíte final passou em **655/655 testes**, sem skips ou falhas, em 149,36 s; a build de produção passou. O aviso de bundle acima de 500 kB permanece: não foi tratado com uma reorganização arquitetural sem evidência causal nesta iteração. Dez testes novos cobrem classificação e reconciliação, limites e limpeza da captura, submissão sem reparentear nem perder objetos/contexto, cancelamento e preparação deduplicada de atlas.

Arquivos de implementação desta iteração: `scene-compilation.js`, `actor-preparation.js`, integração em `scene-transition.js`, `scene-warmup.js`, `src/main.js` e `src/multiplayer/world-mode.js`. Metadados foram atualizados para 0.6.3. Instrumentação e reprodução estão em `scripts/iteration233-{capture,scenario,electron,analyze,report}.mjs`; testes em `tests/iteration233.test.js`. O diff global também contém trabalho anterior, que foi preservado e não deve ser atribuído integralmente a esta iteração.

Os testes usam personagens e armazenamento isolados. Não houve alteração de saves reais, deploy, publicação, commit ou geração de instalador. Não houve mudanças nas regras do servidor, frequência nominal, população, recompensas ou HUD.

## Regressão Electron e servidor

Os ensaios Electron passaram nos três perfis manuais, substituição rápida de destino, antecipação e cancelamento perto da porta, erro de shader com recuperação, desconexão durante preparação e reconexão. F10 continuou disponível. A campanha local iniciou separadamente, percorreu os andares 1 e 2 por fixture e retornou ao Refúgio.

O ensaio de gameplay derrotou monstro comum com comando real, percorreu rampa e escada, verificou os quatro indicadores do Cavaleiro no perfil Desempenho e concluiu vitória/retorno público. Foram inspecionadas as capturas de caverna, escada, indicador arcano, retorno público e Refúgio. Os testes usam atributos de personagem preparados para acelerar a verificação: não simulam balanceamento ou dificuldade de uma partida humana.

O painel F10 da captura focal de retorno local mostra um pico histórico de 1.109,8 ms nessa curta janela que também abrange inicialização, navegação e capturas. Esse ensaio verifica integridade, não possui trace causal desse pico e não sustenta uma alegação de que a campanha local ficou livre de pausas. Não se atribui esse valor ao driver ou ao mesmo mecanismo das transições multiplayer sem evidência.

O servidor foi exercitado por 35,00 s com 32 clientes simulados, oito arenas, movimento contínuo a 15 Hz, combate, chat, transições e reconexão. Servidor e driver de clientes compartilham um processo Node em loopback; não são 32 computadores com latência de internet.

| Métrica | Resultado |
|---|---:|
| Frequência efetiva | 19,998 Hz |
| Ticks medidos | 700 |
| Duração tick p50 / p95 / p99 | 9,43 / 17,55 / 35,69 ms |
| Maior tick | 96,76 ms |
| Intervalo p50 / p95 / p99 | 46,96 / 62,14 / 63,19 ms |
| Maior intervalo | 104,20 ms |
| ACK p50 / p95 / p99 | 80,34 / 126,98 / 153,03 ms |
| RSS do processo, incluindo driver | 216,82 MiB |
| Arenas criadas / limpas / restantes | 8 / 8 / 0 |

Não houve erros reportados. A média de 20 Hz não elimina os picos observados. A navegação teve uma amostra máxima de 91,32 ms; não houve reescrita desse sistema nesta iteração de correções gráficas. O teste é uma regressão curta, não certificação de estabilidade de rede por horas.

## Riscos e recomendação para a HUD

**Pronto para iniciar o polimento da HUD? Condicional.** A comparação repetida indica redução substancial dos maiores engasgos, o gameplay estável tem p99 próximo de 16,9 ms no hardware testado e as verificações funcionais passaram. Ainda há pausas pontuais e mais tempo de preparação em alguns percursos. É necessário verificar os computadores da escola e a campanha local em uma sessão de uso normal antes de prometer 60 FPS consistentes.

Os contadores gráficos não apresentam crescimento cumulativo evidente nas revisitas medidas. Preparar atlas mantém mais texturas residentes em alguns momentos: no retorno final da comparação curta foram 11, contra oito na referência; o pico das duas sessões foi 21. O heap da candidata curta atingiu 59,64 MiB, contra 54,08 MiB. Sem snapshot de heap pós-GC e medição de VRAM, não se declara ausência absoluta de vazamentos nem custo de memória nulo. O coletor também retém dados de forma limitada durante a sessão. Na repetição final, o heap atingiu 71,58 MiB e terminou uma revisita em 69,55 MiB, após quedas intermediárias; as dez revisitas conservaram 32–36 geometrias e 11–12 texturas. O heap crescente em parte da sessão exige observação em testes mais longos e não foi interpretado isoladamente como vazamento do jogo.

Próximas verificações recomendadas, sem implementação nesta entrega: repetir o roteiro nas GPUs da escola, observar uso real por mais tempo e capturar isoladamente pausas residuais reproduzíveis, inclusive inicialização/retorno da campanha. Não foi iniciada reformulação da HUD ou a próxima iteração.

## Reprodução local

Usar o mesmo checkout e dependências instaladas, executar uma condição de cada vez, sem outros benchmarks ou análise de traces simultâneos. `node scripts/iteration233-electron.mjs` cria perfis temporários e servidor isolados. As variáveis abaixo selecionam cenários; limpar as variáveis de um cenário antes de iniciar outro.

| Cenário | Variáveis de ambiente |
|---|---|
| Cinco ciclos | `BENCH_INVESTIGATE=1`, `BENCH_LABEL=repeat` |
| Ensaio ≥10 min | `BENCH_INVESTIGATE=1`, `SECONDS233=600`, `BENCH_LABEL=soak` |
| Overhead, 5×3×12 s | `BENCH_INVESTIGATE=1`, `OVERHEAD233=1`, `BENCH_LABEL=overhead` |
| Trace exploratório, um ciclo | `BENCH_INVESTIGATE=1`, `TRACE233=1`, `REPEATS233=1`, `BENCH_LABEL=trace` |
| Recuperação e campanha | `BENCH_EDGE=1`, `BENCH_LABEL=edges` |
| Gameplay focal | `BENCH_GAMEPLAY=1`, `BENCH_LABEL=gameplay` |

Servidor: `ARENA_SCENARIO=32-mixed-eight-arenas` com `node scripts/iteration23-load.mjs`. Análise offline: `node scripts/iteration233-analyze.mjs <pasta-do-ensaio>`, somente depois dos benchmarks. O relatório consolidado é gerado por `node scripts/iteration233-report.mjs` a partir das pastas nomeadas nesta investigação. Não executar o gerador enquanto uma pasta de resultado ainda estiver incompleta.

A referência preservada inclui o `dist` utilizado, fontes e metadados da 0.6.2 final. As artes públicas não foram alteradas nesta iteração. Logs brutos completos ficam em `.logs/`; o JSON de desempenho registra suas fontes e dispersões. A captura pesada e o sampler CPU devem permanecer separados da medição de desempenho da sessão.

<!-- MEASURED_RESULTS -->

## Resultados consolidados

| Condição | Quadros | Segundos | FPS | p50 | p95 | p99 | p99,9 | 1% low | 0,1% low | Máximo |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| reference | 24610 | 241.66 | 101.84 | 8.40 | 16.70 | 17.50 | 100.10 | 20.33 | 8.46 | 166.90 |
| serialExperiment | 26270 | 253.57 | 103.60 | 8.40 | 16.70 | 17.20 | 83.70 | 24.63 | 8.86 | 225.60 |
| after | 25640 | 246.77 | 103.90 | 8.40 | 16.70 | 17.10 | 66.80 | 28.59 | 12.02 | 125.10 |
| soak | 65226 | 641.96 | 101.60 | 8.40 | 16.80 | 24.80 | 66.80 | 27.30 | 11.59 | 166.90 |

Intervalos RAF em ms; lows e FPS em quadros/s. P99,9 e 0,1% low exigem pelo menos 10.000 intervalos. A sessão prolongada tem roteiro ampliado; sua composição difere das baterias curtas.

| Condição | >16,67 | >33,33 | >50 | >100 | >150 | >200 | >100/min |
|---|---:|---:|---:|---:|---:|---:|---:|
| reference | 2068 | 133 | 88 | 25 | 4 | 0 | 6.21 |
| serialExperiment | 2072 | 94 | 62 | 13 | 4 | 1 | 3.08 |
| after | 2026 | 80 | 46 | 3 | 0 | 0 | 0.73 |
| soak | 6222 | 230 | 113 | 11 | 1 | 0 | 1.03 |

### Categorias: reference

| Categoria | Quadros | Segundos | p99 | p99,9 | 1% low | 0,1% low | Máximo | >100/min |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| resumed | 7595 | 75.34 | 17.00 | — | 50.84 | — | 33.10 | 0.00 |
| loading | 1984 | 23.31 | 92.00 | — | 9.11 | — | 150.30 | 41.19 |
| first-frame | 30 | 1.20 | 166.90 | — | — | — | 166.90 | 149.66 |
| post-transition | 4710 | 50.69 | 24.90 | — | 22.65 | — | 125.30 | 5.92 |
| stable | 10235 | 90.13 | 16.80 | 24.90 | 49.30 | 22.30 | 75.20 | 0.00 |
| pre-transition | 56 | 0.98 | 116.90 | — | — | — | 116.90 | 60.98 |

Reconciliação: 24610 intervalos totais e 24610 classificados; 241.66 s totais e 241.66 s classificados. Retorno de arena permanece etiqueta sobreposta.

### Categorias: after

| Categoria | Quadros | Segundos | p99 | p99,9 | 1% low | 0,1% low | Máximo | >100/min |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| resumed | 7562 | 75.35 | 17.00 | — | 42.87 | — | 33.50 | 0.00 |
| loading | 2972 | 28.68 | 42.00 | — | 13.97 | — | 108.50 | 4.18 |
| first-frame | 30 | 1.16 | 83.30 | — | — | — | 83.30 | 0.00 |
| post-transition | 4796 | 50.70 | 17.20 | — | 37.45 | — | 50.30 | 0.00 |
| stable | 10229 | 89.93 | 16.80 | 25.10 | 47.07 | 19.65 | 91.80 | 0.00 |
| pre-transition | 51 | 0.95 | 125.10 | — | — | — | 125.10 | 63.11 |

Reconciliação: 25640 intervalos totais e 25640 classificados; 246.77 s totais e 246.77 s classificados. Retorno de arena permanece etiqueta sobreposta.

### Categorias: soak

| Categoria | Quadros | Segundos | p99 | p99,9 | 1% low | 0,1% low | Máximo | >100/min |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| resumed | 19863 | 202.56 | 17.10 | 33.10 | 40.83 | 24.72 | 125.50 | 0.30 |
| loading | 8460 | 81.03 | 41.90 | — | 13.90 | — | 116.80 | 3.70 |
| first-frame | 90 | 3.05 | 166.90 | — | — | — | 166.90 | 39.36 |
| post-transition | 15147 | 161.73 | 25.00 | 33.50 | 34.99 | 20.14 | 108.20 | 0.37 |
| stable | 21553 | 191.70 | 16.90 | 25.20 | 44.83 | 18.68 | 100.10 | 0.31 |
| pre-transition | 113 | 1.88 | 50.10 | — | 11.98 | — | 116.90 | 31.83 |

Reconciliação: 65226 intervalos totais e 65226 classificados; 641.96 s totais e 641.96 s classificados. Retorno de arena permanece etiqueta sobreposta.

### Transições: mediana e dispersão

| Condição | Percurso | N | Latência mín / med / máx | Controle mediano | Primeiro render mín / med / máx | Maior submissão |
|---|---|---:|---|---:|---|---:|
| reference | floor1 | 5 | 476.60 / 500.90 / 2001.50 | 357.40 | 8.00 / 8.90 / 68.60 | 48.10 |
| reference | cave | 5 | 586.90 / 630.80 / 1405.20 | 520.20 | 15.30 / 19.00 / 31.90 | 71.90 |
| reference | fortress | 5 | 1114.60 / 1157.30 / 1670.00 | 1008.70 | 119.00 / 139.00 / 145.50 | 58.80 |
| reference | door | 5 | 795.90 / 917.00 / 1006.90 | 802.70 | 16.90 / 20.80 / 23.90 | 52.60 |
| reference | arena-entry | 5 | 763.60 / 890.00 / 1218.60 | 608.10 | 16.10 / 26.20 / 32.70 | 53.70 |
| reference | arena-return | 5 | 9067.50 / 9127.80 / 9480.00 | 945.40 | 23.30 / 26.20 / 32.60 | 127.40 |
| after | floor1 | 5 | 564.90 / 587.20 / 1828.20 | 516.20 | 11.40 / 12.10 / 22.80 | 15.50 |
| after | cave | 5 | 792.50 / 842.70 / 1329.10 | 701.00 | 14.00 / 16.00 / 18.80 | 10.50 |
| after | fortress | 5 | 1207.30 / 1340.50 / 2118.60 | 1168.40 | 26.00 / 28.90 / 29.90 | 7.90 |
| after | door | 5 | 1034.50 / 1181.40 / 1396.80 | 1023.00 | 15.70 / 21.30 / 25.50 | 3.40 |
| after | arena-entry | 5 | 792.60 / 843.90 / 1334.10 | 578.90 | 18.00 / 19.70 / 37.80 | 24.00 |
| after | arena-return | 5 | 9225.00 / 9335.40 / 9796.60 | 1135.80 | 25.20 / 29.40 / 30.50 | 31.40 |

Latência externa inclui polling do driver e, no retorno de arena, o prazo de resultado. Controle é medido desde o início da preparação, excluindo a espera anterior do encontro. A primeira visita de cada destino é fria dentro da sessão; as quatro seguintes são revisitas. Não são cinco processos frios independentes.

### Primeiro andar e combate

| Condição | Cenário | N | p99 mín / med / máx | Pior quadro |
|---|---|---:|---|---:|
| reference | floor1 | 5 | 17.00 / 17.10 / 24.90 | 41.60 |
| reference | wolf | 5 | 16.50 / 16.70 / 16.90 | 125.30 |
| reference | fortress | 5 | 17.00 / 24.70 / 25.00 | 33.50 |
| reference | knight | 5 | 8.70 / 8.70 / 9.10 | 17.00 |
| reference | returned | 5 | 17.00 / 17.20 / 25.10 | 58.10 |
| after | floor1 | 5 | 17.00 / 17.10 / 25.10 | 33.50 |
| after | wolf | 5 | 16.60 / 16.70 / 16.80 | 32.60 |
| after | fortress | 5 | 16.90 / 24.90 / 25.40 | 33.50 |
| after | knight | 5 | 8.70 / 8.70 / 8.80 | 17.00 |
| after | returned | 5 | 16.90 / 24.60 / 25.10 | 50.30 |

### Memória e recursos

| Condição | Heap mín / máx MiB | Geometrias mín / máx | Texturas mín / máx |
|---|---|---|---|
| reference | 11.40 / 54.08 | 14 / 275 | 5 / 21 |
| serialExperiment | 11.02 / 53.46 | 14 / 271 | 5 / 20 |
| after | 10.88 / 59.64 | 14 / 275 | 8 / 21 |
| soak | 12.07 / 71.58 | 15 / 246 | 8 / 18 |

### Recursos ao fim de cada revisita de arena

| Condição | Visita | Heap MiB | Geometrias | Texturas | Draw calls | Triângulos |
|---|---|---:|---:|---:|---:|---:|
| reference | returned-0 | 26.91 | 32 | 8 | 84 | 15155 |
| reference | returned-1 | 26.76 | 35 | 8 | 102 | 15315 |
| reference | returned-2 | 34.49 | 35 | 8 | 103 | 15327 |
| reference | returned-3 | 29.92 | 32 | 8 | 92 | 15199 |
| reference | returned-4 | 50.53 | 33 | 8 | 100 | 15281 |
| after | returned-0 | 19.24 | 32 | 11 | 85 | 15175 |
| after | returned-1 | 29.16 | 35 | 11 | 103 | 15317 |
| after | returned-2 | 39.20 | 35 | 12 | 104 | 15311 |
| after | returned-3 | 42.20 | 32 | 11 | 90 | 15167 |
| after | returned-4 | 31.82 | 34 | 11 | 101 | 15293 |
| soak | returned-0 | 31.49 | 32 | 11 | 106 | 15303 |
| soak | returned-1 | 39.23 | 35 | 11 | 97 | 15255 |
| soak | returned-2 | 35.13 | 35 | 11 | 102 | 15315 |
| soak | returned-3 | 29.04 | 34 | 11 | 95 | 15241 |
| soak | returned-4 | 42.74 | 36 | 11 | 100 | 15285 |
| soak | returned-5 | 39.25 | 32 | 11 | 93 | 15219 |
| soak | returned-6 | 48.73 | 35 | 12 | 94 | 15243 |
| soak | returned-7 | 34.64 | 32 | 11 | 90 | 15221 |
| soak | returned-8 | 51.92 | 36 | 11 | 94 | 15235 |
| soak | returned-9 | 69.55 | 32 | 11 | 84 | 15155 |

### Retorno de arena — etiqueta sobreposta

| Condição | Quadros | Segundos | p99 | p99,9 | Máximo | >100/min |
|---|---:|---:|---:|---:|---:|---:|
| reference | 2613 | 30.92 | 41.70 | — | 141.70 | 15.52 |
| after | 2768 | 31.92 | 25.30 | — | 100.30 | 1.88 |
| soak | 5473 | 66.26 | 33.50 | — | 166.90 | 1.81 |

### Overhead controlado

| Condição | FPS mediano | p99 mediano | Pior quadro | Coletor ms/frame mediano |
|---|---:|---:|---:|---:|
| minimal | 81.43 | 25.10 | 66.50 | 0.03 |
| capture | 81.09 | 25.10 | 33.50 | 0.03 |
| capture-panel | 81.29 | 25.00 | 41.60 | 0.04 |

A duração do coletor não inclui todo o custo dos wrappers e do observer; a comparação dos resultados de sessão inclui esses custos. O coletor mínimo também tem overhead.

### Dados brutos

- reference: `.logs\iteration233-reference-repeat-1792639100289/report.json`
- serialExperiment: `.logs\iteration233-shader-batches-1792638813596/report.json`
- after: `.logs\iteration233-atlas-candidate-1792639671503/report.json`
- soak: `.logs\iteration233-final-soak-1792664748812/report.json`
- overhead: `.logs\iteration233-overhead-final-1792664279106/report.json`
- edges: `.logs\iteration233-final-edges-1792664483978/report.json`
- gameplay: `.logs\iteration233-final-gameplay-1792664524644/report.json`
- server: `.logs\iteration23-load-1792664587405/report.json`
