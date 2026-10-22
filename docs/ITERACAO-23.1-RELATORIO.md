# Iteração 23.1 — Beta 0.6.1: A Torre Sem Engasgos

## Escopo e integridade

Trabalho local sobre o checkout da 0.6.0, preservando alterações anteriores.
Sem commit, deploy, publicação, instalador, exclusão de saves ou alterações em
dados remotos. Geografia, 155 monstros comuns, Lobo Branco público, Cavaleiro,
Parties de seis, instâncias, recompensas e separação campanha/online preservados.
O agendador de 20 Hz e o limite global de 32 identidades não foram alterados.

**Meta de 60 FPS nos computadores da escola: pendente de validação em hardware real.**

## Método

Referência histórica: relatório 23 e seus logs. Nova referência medida no build
0.6.0 antes da substituição de `dist`, com código de referência de navegação,
renderização e integração preservado em `.logs/iteration231-reference`.
Não se usa a comparação com a 0.6.0 histórica como ganho: ela tinha outro roteiro.

Roteiro Electron: dois processos reais, perfis e personagens de teste isolados,
um cliente ativo e outro na cidade; servidor local, seed 217021. Cenários A/B
exploram andares 1/2, C combate o Lobo Branco na caverna, D fica na fortaleza,
E enfrenta o Cavaleiro em segunda fase, F revisita cinco mapas. Comandos contínuos
a 15 Hz e câmera em rotação. Atributos de sobrevivência e posições de entrada são
preparados no servidor de teste. Isto não representa um playtest humano, nem
substitui a validação manual completa de cada escada.

Cada janela de combate/exploração usa 3 s de aquecimento e 30 s de medição.
O profiler de CPU é iniciado **antes** de zerar a janela de frames. As primeiras
execuções incluíam sua inicialização; são exploratórias e não entram na tabela
comparável. VSync é o padrão do Electron, sem limitador de FPS próprio; o RAF
continua seguindo o monitor. A supressão de throttling por oclusão do Windows
é igual nos dois lados. A oclusão das paredes do jogo permanece habilitada.
Depois das mudanças, Alta Qualidade e ajuste dinâmico desligado reproduzem a
resolução e sombras legadas neste computador. Reduções de resolução por perfil
não são contabilizadas como ganho da otimização do código.

Frames são intervalos entre atualizações visuais. FPS médio = 1000/média dos
intervalos; mediano = 1000/p50. Percentis usam nearest rank. 1% low e 0,1% low
são 1000 dividido pela média dos ceil(N×0,01) ou ceil(N×0,001) maiores intervalos.
1% low exige 100 frames; 0,1% low e p99,9 exigem 10.000, para evitar resumir uma
cauda com um ou dois frames. Amostra insuficiente é `null`, não zero.
Contagens de frames acima de 16,67/33,33/50/100 ms usam comparação estrita.

Medições de estágios são inclusivas: não somar cena + render + sprites.
O relógio do Chromium quantiza operações muito curtas; as estatísticas desses
estágios guardam apenas durações positivas, e podem superestimar sua média.
GPU usa consultas assíncronas a cada dez frames, descartando resultados disjoint.
O profiler CDP amostra CPU a cada 2 ms. Ele e os dois clientes influenciam a carga,
por isso são mantidos nos dois lados. GPU e CPU não equivalem ao tempo total até
o quadro aparecer fisicamente no monitor.

## Diagnóstico e correções

### Rótulos e layout

`screenPoint` apareceu entre as maiores funções da amostragem de CPU nas cenas
públicas. A função consultava `clientWidth/clientHeight` para cada projeção,
intercalada com escritas de estilo e texto no DOM, inclusive de inimigos cujos
rótulos estavam ocultos. A correção lê dimensões uma vez por atualização visual,
reutiliza o vetor de projeção e evita atualizar/projetar rótulos inelegíveis.
Nomes de bosses, HP e rótulos sob o cursor continuam disponíveis. Nenhum monstro
é removido e nenhum indicador de combate é omitido.

### Transições e memória

Cada troca de mapa criava um novo WebGLRenderer. Agora a troca reaproveita um
único renderer/contexto; geometrias, materiais, texturas de instância, shadow map
e listas de renderização da cena anterior são descartados. Não há cache de
mundos. A política existente de uma fonte decodificada por atlas continua.
Compilação de materiais e construção da nova cena ainda podem custar tempo.

A instrumentação anterior registrava um listener de visibilidade por cena que
capturava seu contexto sem removê-lo. O listener e consultas GPU pendentes agora
são liberados no descarte. Wrappers de profiling do renderer também são
restaurados antes de reutilizá-lo, impedindo crescimento por encadeamento.
Isso corrige uma retenção comprovável por inspeção, mas não prova que toda pausa
de memória observada anteriormente era causada por ela.

### Navegação

Dentro da busca A*, um recorte conservador exclui somente obstáculos cujos
limites expandidos pelo raio não interceptam o retângulo da busca. Ocupação dos
nós é memoizada apenas naquela consulta. A verificação exata dos segmentos,
terreno, cantos e superfícies permanece. Não há cache entre buscas que possa
ignorar um obstáculo movido ou aberto; não há perda de autoridade do servidor.
A comparação alterna a ordem antes/depois em cinco repetições de três posições
da fortaleza e confere os segmentos nas suas superfícies.

Nas quinze consultas alternadas, média de 15,65 → 4,58 ms e máximo de
31,24 → 9,22 ms. Todas retornaram seis pontos; os segmentos foram conferidos
nas camadas corretas. Isso é um microbenchmark de navegação, separado do tempo
total de tick, de renderização e de rede.

### Causas que não foram presumidas

A revisão visual encontrou uma falha anterior: o topo do piso da arena está
0,08 unidade acima da superfície de simulação, enquanto os indicadores do
Cavaleiro estavam a 0,07. Estavam marcados como visíveis, mas encobertos pelo piso.
Linhas e círculo foram elevados para 0,12, sem mudar alcance, dano, duração ou
geometria de colisão. Um teste compara a altura com o topo real da malha do piso;
a validação final inclui capturas, pois checar somente `visible` não era suficiente.
Os benchmarks anteriores a essa descoberta são identificados; a arena recebe
uma medição focal adicional após a correção visual.

Não se atribui todo pico a GPU, GC ou sprites. Sombras continuam ativas em todos
os perfis. Não foram implementados pooling generalizado, redução de população,
reescrita de IA/protocolo, redução de Hz ou limitador de FPS. Geometria da rota
local ainda é candidata a investigação futura: não foi usada como explicação
para picos medidos no mundo online, onde aquela rota visual não estava ativa.
Fora das correções comprovadas, não há promessa de eliminar todo stall do driver
ou escalonamento do Windows. Perfil de CPU por amostragem não demonstra, sozinho,
que uma coleta de lixo causou um frame específico.

## F10 e preferências

Classificação das ocorrências investigadas:

| Classe | Evidência e interpretação |
|---|---|
| Gráfica | Tempo CPU de envio e tempo GPU medidos separadamente; a média GPU não explica sozinha os maiores intervalos. |
| Simulação/entidades | Sprites, interpolação, efeitos e atualização visual instrumentados; sem evidência para remover habilidades ou reduzir IA. |
| Rede | Processamento de snapshots no cliente e ACKs no ensaio de protocolo; atrasos de servidor não são chamados de FPS. |
| Navegação | Rotas da fortaleza e picos por mundo medidos; redução de trabalho repetido sem alterar obstáculos ou autoridade. |
| Carregamento | Frames de revisita capturam reconstrução; renderer reutilizado, porém construção/compilação ainda bloqueiam. |
| Memória | Retenção por listener corrigida; heap, texturas e geometrias observados. Sem atribuir cada pico a GC sem correlação temporal. |

Não houve redução do frustum de combate, troca de arte, supressão de sombras ou
oclusão incorreta para obter os resultados. A câmera continua orbitando e
projetando em altura; o vetor reutilizado não é exposto a outros consumidores.

Painel desativado por padrão, F10 alterna e persiste a exibição; também há opção
em Configurações. FPS recente usa os últimos 120 intervalos; lows e picos usam
até 12.000. Atualização de texto/percentis ocorre uma vez por segundo quando
visível, nunca por frame. Detalhes incluem render, memória e eventos de cena.
O botão Salvar diagnóstico local exporta um JSON sem credenciais, nomes de
personagens, tokens ou inventário. Não há envio de telemetria.

Preferências ficam exclusivamente em `dungeon.graphics.v1`. Configuração ausente
ou inválida tem fallback seguro; recusa do armazenamento não interrompe o jogo.
Os perfis alteram apenas escala/DPR e tamanho do mapa de sombras:

| Perfil | Escala inicial | Limite DPR | Shadow map |
|---|---:|---:|---:|
| Desempenho | 0,80 | 1,25 | 1024 |
| Equilibrado | 1,00 | 1,50 | 2048 |
| Alta Qualidade | 1,00 | 1,70 | 2048 |

Automático usa a recomendação persistida. HTML/texto não são reduzidos junto
com a resolução 3D. Colisão, IA, alcance, distância de perigos, telegraphs e
quantidade de entidades nunca dependem do perfil.

A opção de ajustes automáticos é independente da escolha de perfil. Observa
janelas de 5 s: três janelas ruins antes de reduzir, oito boas antes de recuperar,
intervalo mínimo de 20 s, passos de 0,05, mínimo 0,65 e máximo do perfil. Exige
média e p95 ruins, não reage a um único frame, ignora janela oculta/carregamento.
Somente a escala muda dinamicamente: sem recompilar shaders ou reconstruir mundos.
A qualidade pode ser restaurada gradualmente, sem ultrapassar o perfil escolhido.
No limite mínimo, o painel informa que a cena está abaixo da meta.

## Avaliação inicial

Quando ainda não avaliado, executa cena temporária local com 90 malhas, chão,
sombras e 32 sprites transparentes animados, câmera ativa e resolução do dispositivo.
Duração nominal de 4 s, aquecimento de 750 ms, timeout de 8 s, fallback Desempenho
em falha/amostra insuficiente. Recursos temporários são descartados. Não importa
Game/Character, não conecta ao servidor e não altera progressão/saves.

É uma aproximação das operações gráficas, não uma previsão garantida para todas
as regiões da Torre. Alta Qualidade exige p95 ≤12 ms e p99 ≤20 ms; Equilibrado,
p95 ≤22 ms e p99 ≤40 ms. A avaliação não se repete em toda abertura. Reavaliar
é manual e preserva a escolha manual; Restaurar recomendação é explícito.
Mudança detectável de GPU/resolução/DPR oferece reavaliação sem sobrescrever a
preferência. Nenhum temporizador JavaScript consegue interromper um driver
travado dentro de uma chamada síncrona; o timeout atua quando o event loop responde.

## Validação escolar posterior

1. Anotar CPU, GPU/driver, RAM, Windows, resolução e taxa do monitor.
2. Abrir a build autorizada para aquela ocasião; conferir recomendação e manter
   anotados perfil, escala e opção automática. Não comparar perfis diferentes
   como se fossem a mesma condição.
3. Usar F10 em exploração dos três andares, caverna, fortaleza, arena e transições.
4. Executar 10–15 minutos com jogadores reais, incluindo Party de seis e mundo
   público; exportar o diagnóstico local ao fim e anotar horários de travadas.
5. Comparar p95/p99, 1% low, 0,1% low quando suficiente, pausas e memória —
   não apenas a média FPS. Registrar conexão e latência separadamente.
6. Se necessário, testar Desempenho e depois ajuste automático, como cenários
   separados. A meta permanece pendente até haver máquinas representativas.

## Resultados e evidências

Os dados medidos e limitações específicas estão nas tabelas abaixo. O campo
`method.profile` dos primeiros roteiros manteve o nome legado; o harness
selecionou explicitamente Alta Qualidade e desativou adaptação nos dois clientes
das medições posteriores. DPR, resolução e sombras foram conferidos. A rotulagem
do roteiro foi corrigida para registrar a preferência real em futuras execuções.

### Validação final e riscos restantes

- **628/628 testes aprovados**, sem falhas/ignorados, em 110,87 s, concorrência
  de dois arquivos e sem Electron/benchmarks concorrentes. Inclui 22 testes novos.
  [Log final](../.logs/iteration231-suite-final.txt).
- Build de produção aprovado; nenhum empacotamento/instalador executado.
  [Log do build](../.logs/iteration231-build-final.txt).
- Primeira suíte: 626/627, falha no descarte de uma cena parcial sem luz de sombra.
  O descarte passou a aceitar recursos opcionais; testes existentes não foram
  enfraquecidos. [Execução inicial](../.logs/iteration231-suite-initial.txt).
- F10, avaliação inicial, persistência após recarga, seleção manual, reavaliação
  e restauração passaram em Electron. Adaptação foi também validada com entradas
  controladas no controlador e aplicação no renderer; isso não é evidência de
  ajuste natural em computadores escolares desconhecidos.
- Gameplay focal final passou: monstro comum, travessia real das rampas da
  caverna/fortaleza por comando do cliente, quatro indicadores em Desempenho,
  segunda fase, vitória e retorno público, com segundo Electron simultâneo.
  [Captura da Ruptura corrigida](../.logs/iteration231-gameplay-final-1792543750316/performance-rupture.png).
- Dez janelas prolongadas somaram 600,10 s de amostra: não houve crescimento
  contínuo de geometrias/texturas nas revisitas, nem instâncias restantes. Heap
  oscilou e voltou a cair. Isso não prova ausência de todo vazamento em sessões
  de horas. O agregado prolongado antecede a correção de altura dos indicadores;
  a arena foi revalidada visualmente e medida separadamente após ela.
- Não foi feito playtest humano, teste em 32 máquinas físicas, teste WAN ou
  validação no hardware escolar. Campanha/progressão/persistência e Parties são
  cobertas pela suíte; não se afirma novo percurso manual completo de 12 andares.
- Permanecem pausas de reconstrução (p99 de revisitas ~283 ms), picos de tick
  acima de 50 ms e frames acima de 16,67 ms. A meta escolar continua pendente.
  Um próximo trabalho de desempenho pode estudar preparação incremental das
  cenas e orçamento de buscas por tick; essas mudanças não foram iniciadas aqui.

### Relação de arquivos

- Métricas, política de qualidade e amostragem: `src/core/frame-metrics.js`,
  `graphics-quality.js`, `assessment-sampler.js`.
- Avaliação e configurações: `src/adapters/rendering/graphics-assessment.js`,
  `src/ui/graphics-settings.js`, integração em `src/main.js` e `src/style.css`.
- Renderização: `scene.js`, `guardian.js`; integração online em
  `src/multiplayer/world-mode.js`, `world-client.js`, `performance-diagnostic.js`.
- Navegação compartilhada: `src/world/navigation.js` e `collision.js`.
- Testes: `tests/iteration231.test.js`; roteiros `scripts/iteration231-*` para
  cenários, configurações, gameplay, navegação e consolidação de evidências.
- Relatório/JSON, README, changelog e metadados de versão 0.6.1 nos manifests,
  locks, configuração de multiplayer e configuração de empacotamento.

Dependências existentes reutilizadas; nenhuma dependência pesada adicionada.
Alterações de iterações anteriores presentes no checkout foram preservadas.
<!-- MEASURED_RESULTS -->

### Ambiente medido

Ryzen 5 6600H; Windows 11 build 26300; 7.24 GiB de RAM utilizável. Electron 44.5.1, Three 0.186.1, Node v24.19.0. GPU observada no renderer: AMD integrada via ANGLE/D3D11. Driver AMD 32.0.21037.1004. O Windows também lista RTX 3050; não é a GPU observada neste ensaio. Monitores reportados em 120/60 Hz; isso não prova apresentação efetiva a essas taxas. Janela CSS 1282×722, DPR 1,25, resolução interna aproximada 1602×902. Sombras ativas, sem cap próprio de FPS.

### Antes / depois — mesma condição visual

| Cenário | FPS médio | 1% low | 0,1% low | p99 ms | Maior ms | >33,33 ms |
|---|---:|---:|---|---:|---:|---:|
| A-exploration | 66.85 / 65.28 | 35.74 / 30.63 | insuficiente / insuficiente | 22.60 / 23.20 | 45.00 / 81.20 | 4 / 4 |
| B-populated | 65.45 / 66.62 | 37.76 / 43.11 | insuficiente / insuficiente | 24.70 / 21.40 | 30.70 / 25.30 | 0 / 0 |
| C-white-wolf | 64.78 / 64.88 | 35.11 / 47.92 | insuficiente / insuficiente | 24.60 / 20.20 | 33.50 / 24.10 | 1 / 0 |
| D-fortress | 49.33 / 62.36 | 27.13 / 38.18 | insuficiente / insuficiente | 32.80 / 24.10 | 58.80 / 29.30 | 11 / 0 |
| E-knight | 71.39 / 65.00 | 37.54 / 38.96 | insuficiente / insuficiente | 19.60 / 20.70 | 80.20 / 67.50 | 2 / 2 |
| F-transitions | 35.25 / 47.16 | 1.57 / 2.89 | insuficiente / insuficiente | 587.30 / 282.70 | 711.60 / 397.70 | 15 / 15 |

A fortaleza e as transições melhoraram; as transições ainda congelam perceptivelmente. O primeiro andar teve um pico maior na repetição e o FPS médio do Cavaleiro diminuiu, apesar do 1% low semelhante. Uma execução por condição não estabelece significância estatística nem garante ganho em toda máquina. A mudança não atingiu 60 FPS estáveis em todos os cenários.

### Distribuição final e tamanho de amostra

| Cenário | Frames / segundos | p50 / p95 / p99 ms | >16,67 / >33,33 / >50 / >100 ms |
|---|---:|---:|---:|
| A-exploration | 1959 / 30.01 | 15.80 / 19.60 / 23.20 | 731 (37.31%) / 4 (0.20%) / 2 (0.10%) / 0 (0.00%) |
| B-populated | 1999 / 30.01 | 15.40 / 19.50 / 21.40 | 633 (31.67%) / 0 (0.00%) / 0 (0.00%) / 0 (0.00%) |
| C-white-wolf | 1947 / 30.01 | 16.40 / 19.10 / 20.20 | 813 (41.76%) / 0 (0.00%) / 0 (0.00%) / 0 (0.00%) |
| D-fortress | 1871 / 30.01 | 16.00 / 20.50 / 24.10 | 745 (39.82%) / 0 (0.00%) / 0 (0.00%) / 0 (0.00%) |
| E-knight | 1950 / 30.00 | 16.20 / 18.90 / 20.70 | 760 (38.97%) / 2 (0.10%) / 2 (0.10%) / 0 (0.00%) |
| F-transitions | 379 / 8.04 | 14.70 / 30.20 / 282.70 | 144 (37.99%) / 15 (3.96%) / 11 (2.90%) / 11 (2.90%) |

p99,9 e 0,1% low das janelas curtas não são publicados por insuficiência de amostras. O ensaio prolongado fornece esses valores. Todos os valores brutos e métricas adicionais ficam no JSON anexo.

### CPU, GPU e recursos

| Cena | Render CPU médio antes/depois ms | GPU médio antes/depois ms | Draws antes/depois | Texturas GPU antes/depois | Heap antes/depois MiB |
|---|---:|---:|---:|---:|---:|
| A-exploration | 4.29 / 3.72 | 4.06 / 4.53 | 66 / 66 | 9 / 9 | 16.10 / 36.44 |
| B-populated | 5.67 / 5.28 | 5.69 / 5.11 | 87 / 87 | 8 / 8 | 25.51 / 43.42 |
| C-white-wolf | 3.29 / 2.46 | 1.44 / 1.20 | 34 / 34 | 12 / 12 | 28.44 / 25.93 |
| D-fortress | 8.88 / 7.66 | 8.70 / 5.63 | 156 / 153 | 10 / 9 | 34.42 / 23.89 |
| E-knight | 2.17 / 2.26 | 1.63 / 1.31 | 75 / 75 | 8 / 8 | 45.87 / 21.63 |

`screenPoint` deixou de aparecer entre as vinte funções com mais amostras nas cenas finais; isso não significa custo literalmente zero. Contagens de draws variam um pouco com câmera, efeitos e posições dos monstros. Os dois primeiros heaps finais são maiores que a referência; depois caem. São amostras sem forçar GC, não tamanho de memória retida. A avaliação inicial cria carga temporária adicional. Utilização percentual de CPU/GPU do processo cliente não foi medida; há perfil amostrado de CPU, consultas de tempo GPU e heap, não uma estimativa inventada de utilização.

### Servidor — 32 clientes, oito arenas, mundo público ativo

| Métrica | Antes | Depois |
|---|---:|---:|
| Hz | 19.99 | 20.03 |
| Tick p50 ms | 6.87 | 6.55 |
| Tick p95 ms | 16.26 | 13.91 |
| Tick p99 ms | 60.20 | 34.26 |
| Tick máximo ms | 138.54 | 86.56 |
| Navegação máxima amostrada ms | 129.57 | 76.84 |
| ACK p95 ms | 121.20 | 114.44 |
| ACK p99 ms | 133.33 | 124.83 |

Janelas de 35.01 / 35.01 s, 32/32 online e zero arenas restantes em ambos. CPU e tráfego completos no JSON. O contador de navegação amostra métricas por mundo, incluindo mundos inativos; seus percentis não são tempo total de navegação por tick. O máximo ainda excede 50 ms. São clientes simulados em loopback no processo do servidor: não equivalem a 32 GPUs, 32 computadores ou uma rede escolar/WAN.

### Painel e ensaio prolongado

| Painel | FPS | p99 ms | 1% low |
|---|---:|---:|---:|
| panel-off1 | 63.65 | 20.70 | 32.55 |
| panel-on1 | 62.10 | 20.30 | 46.63 |
| panel-off2 | 62.25 | 20.00 | 48.67 |
| panel-on2 | 67.24 | 20.70 | 42.26 |

Janelas alternadas de 20 s, mesma arena e perfil. Variação de combate/escalonamento permanece; esta amostra não determina um overhead submilissegundo exato.

Ensaio prolongado: 600.10 segundos efetivamente amostrados, 41280 frames, dez janelas com revisitas dos três andares e três arenas. FPS 68.79, p95 19.40 ms, p99 23.60 ms, p99,9 37.20 ms, 1% low 33.70, 0,1% low 18.89, máximo 115.20 ms; pausas >100 ms: 1. Arenas restantes: 0. As reconstruções entre janelas não entram nesse agregado de combate/exploração; estão na bateria F e nos eventos de rebuild.

| Janela | FPS | p99 ms | Heap MiB | Texturas / geometrias GPU |
|---|---:|---:|---:|---:|
| soak-0-floor-1 | 68.78 | 25.50 | 14.19 | 9 / 32 |
| soak-1-floor-2 | 61.30 | 27.80 | 42.95 | 8 / 36 |
| soak-2-floor-3 | 65.37 | 20.80 | 20.86 | 9 / 39 |
| soak-3-floor-1 | 65.71 | 21.60 | 12.00 | 8 / 32 |
| soak-4-floor-2 | 65.34 | 25.70 | 34.04 | 8 / 36 |
| soak-5-floor-3 | 74.31 | 19.50 | 10.17 | 8 / 39 |
| soak-6-floor-1 | 71.67 | 22.40 | 15.26 | 8 / 32 |
| soak-7-floor-2 | 69.83 | 24.00 | 26.65 | 8 / 36 |
| soak-8-floor-3 | 74.49 | 19.50 | 13.42 | 8 / 39 |
| soak-9-floor-1 | 71.10 | 25.20 | 19.14 | 8 / 32 |

### Arena após corrigir a altura dos indicadores

Medição focal adicional em Alta Qualidade, dois Electron, mesma janela de 30 s e segunda fase. Piso e indicadores agora foram conferidos nas capturas. O histórico E da tabela e o ensaio de 600 s ocorreram antes desta correção de altura; os demais cenários não foram afetados.

FPS 63.96; p95 18.80 ms; p99 20.80 ms; 1% low 34.99; máximo 88.30 ms; frames >33,33 ms: 2. Draws: 73. Não equivale a uma nova execução prolongada com a altura corrigida.

### Evidências e reprodução

- [before](../.logs/iteration231-baseline-1792541926686/report.json)
- [after](../.logs/iteration231-after-1792542214852/report.json)
- [serverBefore](../.logs/iteration23-load-1792541881676/report.json)
- [serverAfter](../.logs/iteration23-load-1792542539213/report.json)
- [gameplay](../.logs/iteration231-gameplay-final-1792543750316/report.json)
- [bossFinal](../.logs/iteration231-boss-final-1792543856143/report.json)
- [ui](../.logs/iteration231-ui-1792542490299/report.json)
- [panel](../.logs/iteration231-panel-1792542599797/report.json)
- [soak](../.logs/iteration231-soak-1792542796543/report.json)
- [Comparação de navegação](../.logs/iteration231-navigation.json)
- [Dados consolidados](ITERACAO-23.1-DESEMPENHO.json)

Executar `npm run build` e `node scripts/iteration231-electron.mjs` para a bateria corrente. `BENCH_UI=1` seleciona configurações; `BENCH_PANEL=1`, painel; `BENCH_SOAK=600`, dez janelas de 60 s. `BENCH_LABEL` nomeia a pasta. Executar cada ensaio separadamente, sem suíte de testes simultânea. O servidor usa `ARENA_SCENARIO=32-mixed-eight-arenas node scripts/iteration23-load.mjs`. Esses scripts criam apenas dados e perfis de teste. Reproduzir o lado antigo exige o build/código de referência preservado, não apenas trocar o nome da pasta.
