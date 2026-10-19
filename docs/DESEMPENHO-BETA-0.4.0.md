# Dungeon Master — diagnóstico de desempenho da Beta 0.4.0

Investigação de 15/10/2026, limitada aos resultados de 48,3 FPS e 15,99 ticks/s da Iteração 20. Não é a Iteração 21. Sem deploy, publicação, commit, novo instalador ou alteração de saves reais.

A perda de frequência do servidor foi reproduzida sem clientes e corrigida: aproximadamente **16,2 → 20,0 ticks/s**, sem mudar os 20 Hz nominais. O problema era deriva do agendamento, não falta de orçamento de CPU por tick.

O FPS antigo não foi reproduzido como um custo de doze personagens: um cliente com doze ficou em **77,4 FPS na referência padrão** e **95,6 FPS com oclusão controlada**. Dois Electron no mesmo PC ficaram em **52,6 FPS**. A concorrência de renderizadores é uma explicação forte para o resultado antigo, mas a causa exata de cada pico e dos 48,3 FPS históricos permanece parcialmente inconclusiva. Nenhum corte gráfico foi aplicado.

## Metodologia

- Servidor Node em processo separado; bancos SQLite, geografia e credenciais descartáveis em `.logs/diagnostic-*`. O servidor do usuário na porta 8787 e o frontend na 5173 ficaram separados dos ensaios.
- Referência reproduzível com o agendamento original `setInterval(50)` e repetição com o agendador corrigido, mantendo simulação de 50 ms e snapshots a cada dois ticks. Um segundo `setInterval(50)` vazio funciona como controle de temporização.
- Janelas de 30 segundos por condição, sem executar a suíte de testes durante as medições. Instrumentação de duração por `performance.now()`, event loop delay com resolução solicitada de 10 ms, event loop utilization e CPU do processo. CPU de 100% significa um núcleo lógico inteiro, não a máquina inteira.
- Doze identidades reais no protocolo v4: rajadas de aproximadamente 1 Hz; movimento contínuo com limite solicitado de 15 Hz; períodos de movimento e combate, chat periódico e transições reais de mapa. Fixtures apenas posicionam personagens perto de monstros/portais. Ataques, mortes, XP, persistência e viagens passam pelo domínio normal.
- A cadência efetiva é contada no servidor: no ensaio original de temporização refinado, 4.680 comandos/30 s/12 clientes = **13,0 comandos/s por jogador**, embora o intervalo solicitado fosse 15 Hz. O cliente visual também impõe um intervalo mínimo de 1/15 s, sujeito ao agendamento de frames. Não confundir taxa solicitada com taxa recebida.
- Cliente Electron com entrada de produção, perfil separado e instrumentação opt-in `diagnostic=1`. Três segundos de aquecimento antes de cada janela de 30 segundos. Um Electron + onze WebSockets representa doze personagens, sem fingir que são doze computadores renderizando.
- Cidade vazia significa retirar apenas o aventureiro do desenho para o controle experimental; cidade, NPCs e artes continuam presentes. No teste de sombras, a retirada é temporária e só no perfil de benchmark. Nada disso é uma otimização aplicada ao jogo.
- O estresse de efeitos injeta 24 impactos visuais a cada 300 ms, claramente sintéticos, sem conceder recompensas nem modificar combate. O cenário de combate usa ataques reais repetidos, com pausas naturais entre alvos.
- Na referência, FPS = 1000 / média dos intervalos de frame. Na repetição controlada, FPS = número de intervalos completos / duração total da janela; o JSON também conserva o FPS dos intervalos ativos, permitindo detectar pausas. p95/p99 usam percentis empíricos. 1% low = 1000 / média do 1% de intervalos mais lentos. Os tempos de métodos são por chamada e inclusivos: não somar atualização da cena, sprites, efeitos e renderização como se fossem independentes.
- `renderSubmit` mede trabalho de CPU e submissão ao WebGL, não o tempo de GPU. Uma janela adicional usa consultas assíncronas `EXT_disjoint_timer_query_webgl2`, sem `gl.finish`. CPU do renderer é estimada por diferenças das métricas CDP; não equivale ao consumo de todos os processos Electron.

## Ambiente e limites

Windows 11 Home Single Language 10.0.26300; Ryzen 5 6600H, 12 processadores lógicos; aproximadamente 7,24 GiB de RAM visível ao Windows. Node 24.19.0, Electron 44.5.1, Three.js 0.186.1. Adaptadores AMD Radeon integrada e NVIDIA RTX 3050 Laptop; drivers 32.0.21037.1004 e 32.0.16.1060. Windows informa telas de 1920×1080 a 120 e 60 Hz. Janela medida: 1282×722 CSS, DPR 1,25. A repetição confirmou WebGL ANGLE/D3D11 na **AMD integrada**. VSync e limites de FPS não foram desativados. Não há limitador explícito de FPS no código do jogo; ele usa requestAnimationFrame.

O computador também hospeda o editor e a sessão do usuário; não é um laboratório exclusivo. Uma leitura pontual da NVIDIA mostrou 40% de utilização, mas inclui outros aplicativos e **não é atribuída ao jogo**. Não houve medição de energia, temperatura, rede escolar/WAN ou do hardware dos doze PCs. As amostras de 30 s servem para diagnóstico, não como garantia de estabilidade por horas.

## Evidência sobre o servidor

A referência refinada sem clientes ficou em 16,16 ticks/s, com duração p95 do tick de apenas 0,113 ms. O intervalo real foi 61,895 ms em média. O controle vazio teve comportamento semelhante. Logo, a perda sustentada existe mesmo sem mensagens, persistência ou personagens conectados.

O loop anterior executava exatamente um passo fixo de 50 ms a cada callback atrasado. Ele não tinha um mecanismo de descarte explícito, mas também não recuperava passos devidos: o tempo da simulação ficava atrás do relógio real. Isso explica aproximadamente `1000/62 ≈ 16,1 Hz`. A assinatura é compatível com granularidade/agendamento de temporizadores neste ambiente Windows/Node; não foi isolada uma causa específica no kernel, driver ou plano de energia.

Na referência de 12 clientes com movimento contínuo, o tick p95 foi 3,287 ms, muito abaixo dos 50 ms disponíveis. Não houve gravação SQLite nesse cenário; o código compara o estado persistente antes de gravar, e posição/movimento não fazem parte dele. Persistência síncrona não explica os 16 Hz constantes.

Houve um pico de 152 ms em um comando na janela que inclui a primeira transição para um novo andar, com event loop delay máximo de 154 ms. É um evento distinto da perda sustentada: preparação de mapa/validação/persistência é síncrona. A medição agregada não separa geração, validação e filesystem; não atribuir esse pico exclusivamente ao SQLite. As 17 chamadas SQLite `save` da mesma janela tiveram máximo de 4,101 ms, e a transação observada levou 4,356 ms.

## Correção realizada

`server/fixed-ticker.js` ancora os prazos em relógio monotônico e avança somente passos de 50 ms. Atrasos de um callback deixam de deslocar todos os prazos seguintes. Quando há dívida de simulação, recupera até cinco passos por callback, cede o event loop e mantém a dívida restante. Não há descarte silencioso de ticks, alteração de Hz nominal, valores de movimento, combate, XP, ouro ou recompensas.

O envio de snapshots conserva a regra de cada dois passos. A correção restitui a velocidade nominal em tempo real: a experiência anterior a aproximadamente 16 Hz estava mais lenta que o projeto de 20 Hz. Um pico isolado ainda pode atrasar mensagens; a recuperação impede que esse atraso se transforme em deriva permanente. Suspensões prolongadas do Windows continuam sendo uma condição a evitar no servidor da apresentação, pois preservação de dívida não é uma política de retomada após horas suspenso.

## Inspeção do pipeline visual

A cidade com 12 personagens acrescentou apenas 22 draw calls à cidade com um: um sprite e uma sombra simples por personagem remoto. Sprites usam UVs/materiais próprios para animações independentes e compartilham as fontes dos atlas. Texturas lógicas não equivalem a uploads de imagem distintos na GPU.

Foram encontrados vetores temporários no cálculo de oclusão, atualização de projeção de câmera e estilos/textos DOM em todo frame. O custo medido fora da renderização foi pequeno nessa cena. A geometria de caminho é recriada apenas quando existe caminho local; o cliente multiplayer não mantém esse caminho visual durante os movimentos amostrados. Não há evidência suficiente para uma reescrita desses sistemas neste trabalho.

Materiais transparentes e geometria repetida existem, principalmente em edifícios com oclusão independente. Objetos invisíveis/frustum são filtrados pelo renderer; um objeto fora da câmera ainda pode ser necessário no passe de sombras. Não foi detectado crescimento de recursos demonstrando vazamento nessas janelas curtas; isso não prova ausência de vazamento em sessões longas.

A ablação de sombras baixou de 360 para 198 draw calls, mas não melhorou FPS. Portanto, nenhum corte de sombras, monstros, efeitos ou jogadores foi incorporado. O resultado anterior de 48,3 FPS veio de apenas 180 frames, dois processos Electron e outras tarefas concorrentes; não constitui evidência de custo por personagem nem de defeito do Three.js.

## Controle de visibilidade e concorrência

A primeira referência visual teve todas as janelas finais visíveis e aproximadamente 2.300 frames por cenário. Em uma tentativa posterior, o Electron ficou oculto por outra janela: houve interrupção de frames e uma janela terminou sem amostras. Essa tentativa visual foi **descartada**. Seu servidor já havia concluído as janelas controladas e os três minutos sustentados; esses dados independentes foram preservados.

O controlador foi ajustado para registrar toda mudança de visibilidade, duração de relógio da amostra e FPS calculado sobre essa duração, inclusive possíveis pausas. Os testes controlados posteriores usam `--disable-backgrounding-occluded-windows` e `--disable-features=CalculateNativeWinOcclusion`, **somente nos processos de diagnóstico**. Não alteramos o comportamento de segundo plano do jogo entregue. As tabelas distinguem a referência padrão da repetição com controle de oclusão; diferenças entre elas não são vendidas como ganho da correção do servidor.

O teste de GPU é separado: a instrumentação de queries perturbou a taxa de frames. A cidade com 12 personagens sem queries deu cerca de 95,6 FPS; com queries, cerca de 80,9 FPS, GPU média 5,46 ms, p95 7,68 ms e p99 9,87 ms (243 amostras). Não usar esse custo como se fosse medição sem interferência.

Com dois Electron ativos no mesmo computador e 12 identidades no total (dez WebSockets e dois clientes gráficos), a janela principal registrou 52,6 FPS. A segunda também renderizou: 1.722 frames desde o início da verificação, com visibilidade preservada. Esse resultado aproxima o contexto do ensaio antigo de 48,3 FPS. Concorrência entre renderizadores e condições de visibilidade/agendamento são explicações fortes; não é possível reconstruir o valor exato antigo, separar toda a disputa CPU/driver/GPU ou excluir outras cargas sem os dados que o ensaio de 180 frames não registrou. **Doze personagens num cliente não equivalem a dois clientes gráficos no mesmo PC.**

Uma tentativa de reposicionar janelas via CDP encontrou um comando não implementado pelo Electron; o controlador foi corrigido. Dados já concluídos foram preservados, e os cenários restantes executados novamente. Falhas do controlador são registradas nos arquivos de origem; não são falhas atribuídas ao jogo nem testes funcionais aprovados.

## Impacto no multiplayer

O protocolo, capacidade, validação de comandos, limites de mensagens, identidades, inventários, atributos, XP, drops, chat e transições permanecem iguais. O servidor agora cumpre o tempo de simulação nominal. Snapshots continuam a cada dois passos, aproximadamente 10 Hz em vez dos aproximadamente 8 Hz observados antes. Durante recuperação de atraso, dois snapshots podem chegar próximos; a validação de tick/epoch e interpolação existente continuam em uso.

O ensaio sustentado corrigido contabilizou 3.600 ticks em 180,000 s: 13.992 movimentos, 108 comandos de ataque, 144 chats, 108 viagens efetivas e 40 impactos válidos. CPU média do servidor: 5,30% de um núcleo; RSS final instrumentado: 92,25 MiB. Tick p95 4,31 ms, p99 5,13 ms, máximo 16,10 ms. SQLite save p95 5,62 ms, p99 11,16 ms. Jitter e picos continuam existindo; a média nominal restaurada não significa que cada disparo ocorra exatamente a cada 50,000 ms.

## Riscos restantes para a escola

- A GPU integrada medida não representa todos os PCs da escola. Testar a máquina mais fraca na resolução e escala de Windows que serão usadas; estes resultados não garantem 60 FPS em qualquer hardware.
- Executar múltiplos clientes gráficos num mesmo PC muda radicalmente a carga. Para a apresentação, a referência relevante é um cliente por PC e servidor monitorado separadamente.
- VSync, frequência do monitor, oclusão, economia de energia, GPU selecionada e outros aplicativos afetam a medição. Os flags do laboratório não foram incorporados à aplicação distribuída.
- A preparação inicial de um andar ainda é síncrona. Recuperar ticks resolve deriva, mas não elimina o atraso pontual de mensagens durante esse trabalho. Não reduzimos durabilidade de armazenamento para melhorar números.
- O servidor não deve depender de retomada após suspensão prolongada. A recuperação é limitada por callback, mas mantém dívida; não foi projetada aqui uma política nova de suspensão/retomada.
- O teste sustentado foi proporcional à mudança, de três minutos adicionais, seguido de regressões; não substitui uma sessão escolar completa em rede real, nem um teste de longa duração para vazamentos.
- A medição de envio termina ao enfileirar no WebSocket. Não mede latência real de Internet/Wi-Fi ou recepção em doze computadores físicos.

## Resultados consolidados

### Servidor: comparação de janelas de 30 s

| Cenário | Hz antes → depois | Tick p95 antes → depois (ms) | Tick p99 antes → depois (ms) | CPU/core antes → depois (%) |
|---|---:|---:|---:|---:|
| Sem clientes | 16.16 → 20.00 | 0.11 → 0.09 | 0.20 → 0.15 | 1.20 → 1.36 |
| 12 × rajadas ~1 Hz | 16.16 → 20.00 | 3.85 → 3.43 | 5.57 → 4.33 | 3.65 → 4.38 |
| 12 × movimento contínuo | 16.26 → 19.99 | 3.29 → 3.04 | 4.48 → 3.71 | 4.74 → 5.25 |
| 12 × misto (30 s) | 16.16 → 20.00 | 4.99 → 3.83 | 7.00 → 4.77 | 7.76 → 5.78 |

O controle de temporizador vazio continuou próximo de 61 ms mesmo após a correção. Assim, a recuperação de 20 Hz não depende de tornar o timer do Windows exato.

| Condição | Intervalo tick p50 / p95 / p99 (ms) | Event loop delay p50 / p95 / p99 (ms) | ELU |
|---|---:|---:|---:|
| Antes · Sem clientes | 61.95 / 63.20 / 63.93 | 15.44 / 16.24 / 16.56 | 0.72% |
| Antes · 12 × rajadas ~1 Hz | 62.00 / 63.34 / 63.94 | 15.47 / 18.48 / 20.20 | 3.64% |
| Antes · 12 × movimento contínuo | 61.73 / 63.29 / 64.06 | 15.43 / 17.99 / 19.10 | 4.93% |
| Antes · 12 × misto (30 s) | 61.76 / 63.33 / 64.73 | 15.46 / 19.30 / 22.77 | 5.90% |
| Depois · Sem clientes | 46.61 / 62.34 / 62.98 | 15.38 / 16.18 / 16.56 | 0.75% |
| Depois · 12 × rajadas ~1 Hz | 46.62 / 62.24 / 62.91 | 15.40 / 18.12 / 19.30 | 4.24% |
| Depois · 12 × movimento contínuo | 46.69 / 62.28 / 62.80 | 15.43 / 17.94 / 18.91 | 5.32% |
| Depois · 12 × misto (30 s) | 46.77 / 62.38 / 63.26 | 15.38 / 18.71 / 20.02 | 5.51% |
| Depois · 12 × misto (180 s) | 46.76 / 62.37 / 63.20 | 15.46 / 18.99 / 20.38 | 5.54% |

Event loop delay de ~15 ms também aparece no controle sem carga; a resolução solicitada do monitor é 10 ms. Não interpretar o p50 inteiro como trabalho bloqueante de JavaScript. A métrica `latenessMs` no JSON é o excesso positivo do **intervalo** sobre 50 ms, não atraso absoluto em relação a um prazo global.

### Custos internos do servidor corrigido: cenário misto de 30 s

| Trecho (inclusivo) | Chamadas | Média | p50 | p95 | p99 |
|---|---:|---:|---:|---:|---:|
| Simulação por tick, incluindo persistência | 600 | 0.75 | 0.68 | 1.08 | 1.70 |
| Construção/serialização/envio por tick | 600 | 1.07 | 1.28 | 2.86 | 3.40 |
| persistenceCheck | 9564 | 0.04 | 0.03 | 0.10 | 0.15 |
| sqliteRead | 3605 | 0.05 | 0.04 | 0.11 | 0.17 |
| serialization | 3756 | 0.03 | 0.03 | 0.05 | 0.07 |
| send | 3756 | 0.07 | 0.05 | 0.14 | 0.25 |
| command | 2388 | 0.10 | 0.04 | 0.12 | 0.25 |
| sqliteSave | 17 | 1.96 | 2.63 | 2.99 | 2.99 |
| sqliteTransaction | 1 | 4.00 | 4.00 | 4.00 | 4.00 |

Unidade: ms. `persistenceCheck` inclui comparação/serialização de estado e eventual gravação; `sqliteSave` está dentro desse custo. `send` mede enfileiramento; `serialization` mede JSON.stringify. Snapshots só são enviados em ticks alternados. Os percentis de poucas transações não representam uma distribuição de longa duração.

### Cliente: referência padrão, anterior à correção

| Cena | Frames | FPS | Frametime p95 / p99 (ms) | 1% low (FPS) |
|---|---:|---:|---:|---:|
| Cidade / 1 | 2350 | 78.30 | 16.20 / 18.20 | 50.20 |
| Cidade / 0 aventureiros | 2319 | 77.30 | 16.80 / 19.90 | 45.64 |
| Cidade / 12 | 2322 | 77.38 | 16.60 / 20.40 | 44.12 |
| Cidade / 12 / sem sombras (controle) | 2261 | 75.37 | 17.60 / 22.10 | 29.82 |
| Torre / monstros | 2342 | 78.06 | 16.70 / 18.80 | 46.30 |
| Torre / combate intermitente | 2327 | 77.57 | 16.10 / 18.00 | 22.48 |
| Torre / 24 impactos sintéticos | 2412 | 80.39 | 16.00 / 17.30 | 56.26 |

### Cliente: repetição controlada, após a correção do servidor

**Não é uma comparação de ganho gráfico antes/depois**: aqui a oclusão nativa está desativada nos processos de teste e a visibilidade foi acompanhada durante toda a janela. Não houve alteração do pipeline gráfico entregue.

| Cena | Frames | FPS por janela | Frametime p95 / p99 (ms) | 1% low (FPS) |
|---|---:|---:|---:|---:|
| Cidade / 1 | 2864 | 95.37 | 14.40 / 18.90 | 37.15 |
| Cidade / 0 aventureiros | 2560 | 85.29 | 17.70 / 24.40 | 29.05 |
| Cidade / 12 | 2868 | 95.59 | 14.30 / 18.10 | 42.18 |
| Cidade / 12 + queries GPU | 2427 | 80.86 | 17.60 / 21.00 | 40.73 |
| Cidade / 12 / dois Electron | 1580 | 52.62 | 26.30 / 35.50 | 18.67 |
| Cidade / 12 / sem sombras (controle) | 3255 | 108.45 | 12.60 / 15.50 | 51.94 |
| Torre / monstros | 2769 | 92.24 | 15.20 / 18.10 | 44.56 |
| Torre / combate intermitente | 3358 | 111.87 | 12.20 / 14.70 | 60.83 |
| Torre / 24 impactos sintéticos | 3031 | 100.96 | 14.90 / 18.80 | 45.62 |

Todas essas janelas controladas permaneceram visíveis. O combate ocupou 745 dos 3.358 intervalos medidos; houve efeitos reais em 234 frames. O estresse sintético mostrou impactos em 2.355 frames. A câmera acompanha o jogador: combate muda a posição/objetos vistos; FPS maior durante combate não significa que lutar melhore o desempenho. Os 1% lows mostram pausas pontuais que a média esconde. Não foi identificada a causa conclusiva de cada uma; não há promessa de 60 FPS constantes.

### Cliente: tempos por chamada na cidade com 12

| Trecho | Média antes / controlado (ms) | p95 antes / controlado (ms) | p99 antes / controlado (ms) |
|---|---:|---:|---:|
| interpolation | 0.00 / 0.00 | 0.00 / 0.00 | 0.10 / 0.10 |
| sprites | 0.00 / 0.00 | 0.00 / 0.00 | 0.10 / 0.10 |
| effects | 0.00 / 0.00 | 0.00 / 0.00 | 0.10 / 0.10 |
| combatVisualInclusive | 0.02 / 0.01 | 0.10 / 0.10 | 0.10 / 0.10 |
| remoteInclusive | 0.16 / 0.12 | 0.30 / 0.20 | 0.50 / 0.30 |
| renderSubmit | 5.51 / 4.77 | 8.30 / 7.00 | 10.90 / 9.20 |
| sceneInclusive | 6.03 / 5.11 | 9.10 / 7.50 | 11.70 / 10.00 |
| snapshotCallback | 0.20 / 0.19 | 0.40 / 0.40 | 0.70 / 0.70 |
| snapshotProcessing | 0.43 / 0.41 | 0.80 / 0.80 | 1.30 / 1.00 |

`sceneInclusive` inclui renderização, sprites, remotos e efeitos; `remoteInclusive` inclui interpolação, atores e etiquetas; `snapshotProcessing` inclui parsing, validação e callback de UI. Tempos pequenos são quantizados pelo relógio do navegador. Raycasting foi medido separadamente com 1.200 consultas (600 chão + 600 seleção de monstro): média 0,016 ms, p95 0,10 ms, p99 0,20 ms, máximo 3,30 ms. Não houve seleção artificial por frame durante o benchmark.

| Cena controlada | Draw calls | Triângulos (passes) | Materiais | Texturas lógicas / fontes | Geometrias |
|---|---:|---:|---:|---:|---:|
| Cidade / 1 | 338 | 15230 | 94 | 16 / 11 | 174 |
| Cidade / 0 aventureiros | 336 | 15204 | 94 | 16 / 11 | 174 |
| Cidade / 12 | 359 | 15436 | 116 | 27 / 11 | 185 |
| Cidade / 12 + queries GPU | 359 | 15436 | 116 | 27 / 11 | 185 |
| Cidade / 12 / dois Electron | 360 | 15516 | 116 | 27 / 11 | 185 |
| Cidade / 12 / sem sombras (controle) | 198 | 11082 | 116 | 27 / 11 | 185 |
| Torre / monstros | 104 | 30526 | 108 | 17 / 2 | 269 |
| Torre / combate intermitente | 110 | 30378 | 108 | 17 / 2 | 269 |
| Torre / 24 impactos sintéticos | 134 | 30426 | 132 | 41 / 3 | 269 |

Inventário no último frame; chamadas/triângulos incluem passes de sombras, não somente geometria única. Visibilidade/frustum e marcadores podem variar entre execuções. Na repetição sem sombras, houve melhoria para 108,45 FPS, diferentemente da primeira ablação: há custo de sombras, mas a amplitude varia com as condições. A cidade completa já excedeu 60 FPS no computador medido, e eliminar sombras mudaria a arte; não foi incorporado esse corte.

### CPU do cliente e atualização de UI

| Cena | Tempo de tarefas renderer / janela | CPU processo renderer, equivalente de um núcleo | Layout / estilo (ms por janela) |
|---|---:|---:|---:|
| Cidade / 1 | 64.9% | 80.8% | 1294.6 / 441.3 |
| Cidade / 0 aventureiros | 71.5% | 80.9% | 1366.8 / 493.3 |
| Cidade / 12 | 68.1% | 84.6% | 1314.4 / 689.0 |
| Cidade / 12 + queries GPU | 72.9% | 86.1% | 1406.1 / 755.3 |
| Cidade / 12 / dois Electron | 85.4% | 87.0% | 1885.5 / 575.9 |
| Cidade / 12 / sem sombras (controle) | 78.6% | 98.2% | 1943.7 / 670.3 |
| Torre / monstros | 60.2% | 76.5% | 2237.2 / 910.6 |
| Torre / combate intermitente | 92.4% | 113.8% | 4126.1 / 1807.3 |
| Torre / 24 impactos sintéticos | 92.0% | 109.1% | 3203.6 / 1457.4 |

Métricas CDP não incluem todo o custo de GPU/compositor/processo principal. Os testes não fizeram um perfil completo de alocações/GC com stack traces; criação por frame foi inspecionada no código e confrontada com esses tempos. Não atribuímos os picos de 1% low a GC sem evidência.

### Carregamento inicial de andar

O probe focado criou o andar 2 em dez diretórios novos. Criação completa: média **54,59 ms**, máximo **96,90 ms**. Geração: média **44,33 ms**, máximo **84,89 ms**; leitura/validação: **2,62 ms** médios; restante (filesystem, hash, clone): **7,64 ms** médios. Consulta ao cache: **0,31 ms** médios, máximo **0,55 ms**. Isso sustenta a geração síncrona como fonte de um pico inicial, sem provar que explica sozinha os 152 ms daquela outra execução. Os números de 10 chamadas são exploratórios; não devem ser lidos como p99 de produção.

Não antecipamos a descoberta/geração de todos os andares nem trocamos armazenamento durável por escrita insegura. O mapa é compartilhado e carregado uma vez; revisitas usam cache. A correção de relógio recupera a dívida após a pausa, e as 108 revisitas do ensaio sustentado conservaram 20 Hz. Deslocar geração para outro processo é uma evolução possível se esse atraso de entrada se mostrar prejudicial no hardware escolar; não foi necessário alterar essa arquitetura para corrigir a perda contínua de ticks.

### Arquivos e reprodução

- `DESEMPENHO-DADOS.json`: todas as distribuições agregadas, tamanhos de amostra, inventários, CPU, visibilidade, condições e referências aos arquivos de origem.
- `DESEMPENHO-FLOOR-LOAD.json`: dez medições detalhadas de criação/cache.
- `scripts/performance-diagnostic.mjs`: controlador, perfis isolados e cenários. `scripts/performance-worker.mjs`: instrumentação do servidor.
- `DIAGNOSTIC_LEGACY=1`: apenas no worker de benchmark, reproduz setInterval original; remover para medir a correção.
- `DIAGNOSTIC_SERVER_ONLY=1` ou `DIAGNOSTIC_CLIENT_ONLY=1`: executar uma metade. Padrão: 30 s por cenário. `DIAGNOSTIC_MIXED_SECONDS=180`: acrescentar sustentação. `DIAGNOSTIC_EXTRA=two`: dois Electron; `all`: também probe GPU.
- Reproduzir sem suíte de testes/build simultâneos; registrar monitores, visibilidade e GPU efetivamente utilizada. Comparar médias e caudas, não somente FPS médio.

### Regressões e build

**534/534 testes aprovados**, sem falhas, cancelamentos ou testes ignorados, em 150,51 s. Log: `DESEMPENHO-TESTES.txt`. Inclui protocolos v2/v3/v4, persistência, combate/linha de visão, cadência de ataque, respawn/leash, transições, social/party, reconexão e campanha local. Os quatro novos testes do agendador verificam: callbacks de 62,5 ms preservando 20 passos/s; ausência de avanço precoce/duplicado; recuperação limitada após atraso longo sem perder dívida; cancelamento durante um passo.

**Build aprovado**, 94 módulos, com o aviso preexistente de chunk principal acima de 500 kB. Log: `DESEMPENHO-BUILD.txt`. O cenário Electron final concluiu com `ok=true`, sem erros registrados, e doze conexões/avatares no teste da cidade. Não houve geração de instalador, deploy, publicação, commit ou início da Iteração 21.

O multiplayer local foi reiniciado com a correção na porta 8787; o frontend permanece em `http://127.0.0.1:5173/`. Os dados do usuário foram preservados.
