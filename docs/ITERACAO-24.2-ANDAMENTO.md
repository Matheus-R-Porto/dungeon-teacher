# Iteração 24.2 — auditoria e execução

Estado: fase A implementada e validada no escopo abaixo. A fase B foi concluída posteriormente; consulte [o relatório da 24.2B](ITERACAO-24.2B-RELATORIO.md). Fase C concluída posteriormente; consulte [o relatório consolidado da 24.2C](ITERACAO-24.2C-RELATORIO.md). Comparação curta do primeiro andar não reproduziu perda de FPS médio; permanecem limites de amostra, memória e hardware. Base de playtest: ab866c0 / 0.6.4. HUD superior preservada. Sem commit, publicação ou modificação de saves reais.

## Diagnóstico confirmado no código

- O Cavaleiro e suas quatro habilidades existem em `server/oath-knight.js`; o controlador é utilizado somente por `server/arenas.js`. A verificação funcional será repetida após a integração.
- A arena possui preparação, roster imutável de até seis membros, isolamento, resultado transacional, reconexão e limpeza. O desbloqueio online do quarto andar usa `guardian_unlocks`, separado por personagem.
- `OnlineTower.world` instala a porta diretamente no andar 3. `AreaSession` local não chama `installGuardianDoor` e continua com o Slime Guardião antigo. Portanto a ausência do Cavaleiro na campanha é uma funcionalidade não integrada, não desconhecimento do jogador.
- O exterior de `buildAwakened` contém quatro torres cilíndricas sobre a plataforma herdada do mirante. O salão é desenhado no próprio exterior online; não existe mapa compartilhado intermediário de castelo. A arquitetura e o fluxo são incompletos para a experiência solicitada.
- A população ampliada e o Lobo Branco são adicionados apenas quando `sharedPolicy` existe. A campanha recebe o terreno ampliado, mas não a população equivalente nem o Lobo Branco. Isso explica diferenças importantes de conteúdo entre modos; a frequência real ainda será medida.
- Os portais online usam política de acesso de teste, exceto a exigência do Cavaleiro. Na campanha, encontros obrigatórios e barreiras temporárias coexistem com `highestClearedFloor` permanente. A migração precisa preservar personagens já avançados.
- O covil usa uma superfície retangular abaixo do terreno com duas divisórias retangulares; suas oito pedras azuis são decoração sem gameplay. Veios de mineração são uma estrutura distinta e devem ser preservados.
- A visibilidade subterrânea captura somente os objetos existentes quando `buildAwakened` executa; objetos criados posteriormente precisam ser auditados. Não se conclui ainda a causa completa dos sprites indevidos.
- Lagos adicionais de `livingTower.water` são explicitamente `traversable:true`; a água e a pesca precisam de uma fonte de geometria comum na fase C.

## Ordem e limites

1. A: conectar exterior → interior → arena em ambos os modos, preservar o controlador de combate existente, validar progressão e instâncias; depois densidade, portais, trilhas e câmera. Testes e capturas antes de avançar.
2. B: acesso frontal, forma natural, filtragem correta de superfícies e continuidade do covil. Preservar mineração e papel do Lobo Branco.
3. C: água e lançamento por geometria, arcos e quadro de recolhimento, somente aparência da mineração.

Este relatório preserva as evidências da fase A. A fase B tem relatório próprio vinculado acima. A Iteração 24.2 completa permanece aberta pela fase C.

## Fase A — evidências intermediárias

- `src/world/castle.js`: composição exterior, portão livre e interior separado com saída, galerias e seis inimigos opcionais. O interior online é `shared-oath-castle`; a arena continua privada por grupo. O piso persistido original não é sobrescrito.
- `src/adapters/rendering/castle.js` e `castle-stone.js`: torres, muralhas, arco, alvenaria pixelada original gerada em textura pequena e compartilhada, galerias, pilares e iluminação. Sem alteração na HUD superior.
- Controlador do Cavaleiro movido para `src/simulation/oath-knight.js`, com reexportação no servidor. `local-guardian.js` adapta o combate local ao mesmo controlador. Não foram alteradas suas habilidades.
- Progressão de 3 e 4 derrotas nos andares 1/2, acumulada no personagem, sem nova exigência de nível. Andar 3 exige o Cavaleiro, sem abates comuns adicionais. Personagens avançados conservam as passagens. Recompensas antigas não são duplicadas.
- Primeiro andar: 48 slots (antes: 6 locais / 30 online), distribuição favorecendo percursos navegáveis; limites dos outros andares mantidos. Local não respawna durante a run; servidor mantém o respawn existente. Zoom máximo de 30 para 24 unidades, preservando suavização e altura padrão 23. Pedras de trilha agora irregulares, sem setas douradas.
- Percursos calculados em três sementes, raio de encontro de 12 m: maiores vazios locais antes 139,5 / 140,0 / 73,9 m; depois 2,0 / 3,0 / 7,0 m. São amostras de navegação determinística, não uma medição de percepção humana. Dados em `.logs/iteration242-density-before.json` e `iteration242-density-after.json`.
- 29 testes de arena passaram após trocar sua origem para o castelo. 72 testes de campanha/progressão passaram após adaptar os fixtures ao novo fluxo. Validações posteriores ainda estão em execução.
- A primeira suíte ampla registrou 629/668 aprovados. As 39 falhas incluem expectativas antigas de população, portas e chefe, além de regressões investigadas. Não se declara a suíte aprovada com esse resultado.
- Electron isolado: `.logs/iteration242-castle-resume-1792715057799/report.json`, `ok:true`. Confirma portão com personagem nível 1, dois jogadores no interior, movimento real pelo corredor sem derrotar os comuns, arena separada, vitória e retorno. Capturas de exterior, interior, porta da arena, Cavaleiro, retorno e zoom máximo nessa pasta. A colocação inicial e a vitória usam fixtures do servidor; não é alegação de playthrough humano completo.
- Primeira captura falhou na preparação do andar 1 com suíte concorrente. A repetição isolada passou; não há evidência suficiente para atribuir causa definitiva. Não foi ampliado o timeout do carregamento do jogo.
- Foi corrigida a busca local de posição de ataque para preservar `surface` e `y` do alvo. A validação das quatro armas foi retomada após essa correção.
- Visitas locais ao castelo passam a preservar derrotas da run e impedir XP repetido do mesmo inimigo. Ainda requer regressão final.

## Validação final da fase A — 22/10/2026

### Correções adicionais verificáveis

- Navegação real de clique, usando Game.update, do spawn ao portão e de volta, nas sementes 1, 42 e 217021. Corrigida reentrada lateral involuntária na base da rampa durante o retorno. A fundação do castelo tem colisão sólida; spawns sobrepostos são reposicionados em locais válidos, sem descartar inimigos.
- Um save antigo com terceiro andar concluído e baú pendente recebe o baú na altura correta do portão, com prioridade de interação superior à entrada. Após recolhimento, a entrada volta a ser selecionada. Esse caso foi incluído na regressão existente.
- 42/42 testes focais de integração passaram, incluindo quatro armas e clientes multiplayer: .logs/iteration242-resume-integration.txt. O teste das quatro armas isola a capacidade de causar dano com cura no fixture da arena; não comprova balanceamento de sobrevivência.
- A suíte anterior passou 670/670 em 113,37 s (.logs/iteration242-phase-a-tests.txt). A repetição final após ajustes de navegação e baú passou **671/671**, zero falhas/ignorados, em 109,25 s (.logs/iteration242-final-tests.txt). Comando: npm test.
- Build de produção aprovado (npm run build, 1,38 s) em .logs/iteration242-final-build.txt. Permanece o aviso de bundle principal acima de 500 kB; não foi introduzida dependência nova.

### Desempenho: resultado e limite de aceitação

Instrumento reaproveitado da 23.3/24.1, captura por requestAnimationFrame, dois clientes Electron, qualidade High, adaptação desligada, comandos a 15 Hz, cinco repetições, GPU integrada AMD Radeon, viewport CSS 1282 × 722 e DPR 1,25. Suíte automatizada parada durante a captura. Perfis e bancos exclusivos do ensaio. Resultado lógico ok:true e nenhuma arena residual.

| Medida | Referência histórica 24.1 | Fase A atual |
| --- | ---: | ---: |
| Quadros / duração | 26.036 / 245,90 s | 17.954 / 239,24 s |
| FPS médio | 105,88 | 75,05 |
| Frametime p95 / p99 | 16,70 / 17,00 ms | 19,50 / 26,60 ms |
| Frametime p99,9 | 66,50 ms | 67,30 ms |
| 1% low | 30,79 FPS | 25,42 FPS |
| Maior intervalo | 175,40 ms | 103,10 ms |
| Quadros acima de 100 ms | 3 | 1 |

**A queda histórica de média motivou o ensaio pareado descrito abaixo; a causa da diferença entre horários não foi identificada conclusivamente.** A redução do maior pico nesta amostra tampouco prova otimização. O roteiro agora usa o interior do castelo no lugar da antiga porta exterior, portanto a média global não é comparação estritamente equivalente. As condições gerais do computador também não foram congeladas entre as datas.

Trechos classificados como estáveis no primeiro andar: 99,43 → 72,74 FPS, p99 17,0 → 28,5 ms; máximos de draw calls 104 → 117; triângulos 15.311 → 12.139; 11 texturas em ambas as capturas. Heap JavaScript máximo amostrado nesse trecho 55,69 → 53,28 MiB. São apenas 15,77 / 16,61 s estáveis acumulados, com movimento/câmera e entidades dinâmicas: não são contadores de uma fotografia idêntica. No segundo andar, também ocorreu queda (117,31 → 76,10 FPS), apesar de draw calls máximos 74 → 70; isso impede atribuir a diferença somente à população do primeiro andar.

Interior: amostra estável curta (1,62 s), insuficiente para uma conclusão robusta própria; até 161 draw calls, 8.358 triângulos e 11 texturas nesse recorte. O percurso completo inclui várias visitas, mas a classificação reserva os primeiros cinco segundos para transição/retomada. Não há medição de VRAM nem validação em hardware escolar.

Dados completos: .logs/iteration242-phase-a-final-1792715633660/report.json e frames.json. Referência: .logs/iteration241-final-after-1792683851182. O primeiro ensaio da fase A falhou porque o roteiro procurava guardianHall.door no antigo exterior; o roteiro foi corrigido, a captura falha descartada e o ensaio completo repetido. Isso não exigiu alteração no jogo.

### Evidências e escopo

Capturas reais em .logs/iteration242-castle-resume-1792715057799/: castle-exterior.png, castle-interior.png, castle-arena-door.png, castle-knight-arena.png, castle-return.png e floor-one-max-zoom.png. A última também mostra a densidade e as pedras irregulares da trilha. A aproximação exterior completa foi verificada na simulação, em três sementes; a captura Electron inicia perto do portão. Não confundir com um playthrough humano completo desde o Refúgio.

Mudanças principais: composição/navegação em src/world/castle.js e surfaces.js; renderização em castle.js, castle-stone.js, tower-structures.js e forest.js; campanha em areas.js/local-guardian.js; integração online em online-tower.js/arenas.js; contagem permanente em passage-progress.js/tower-progress.js. HUD, hotbar e agendador do servidor preservados. Saves reais não alterados. Sem commit, push ou deploy.

## Continuidade necessária

1. Manter a suíte final 671/671 e a validação funcional obtida.
2. A comparação curta na mesma sessão foi concluída abaixo. Em próximo playtest prolongado, observar picos e memória, sobretudo no hardware escolar; não presumir aprovação desse hardware.
3. Na fase B, preservar o acesso exterior já validado e ampliar a matriz visual para outras proporções de tela; a captura atual é 1282 × 722 CSS / DPR 1,25.
4. Executar B e C conforme o prompt original. Nenhuma delas está implicitamente concluída pelas alterações de A.

### Nota de rastreabilidade

HEAD local verificado: 12568ea; difere de ab866c0 somente no README (git diff --stat ab866c0 HEAD). A cópia de referência usa esse HEAD, com código do jogo equivalente ao playtest ab866c0. Nenhum commit foi criado neste trabalho.

## Comparação complementar na mesma sessão

Após a suíte final, executados ensaios sequenciais, nunca concorrentes: primeiro a versão atual, depois a referência isolada 12568ea (código equivalente a ab866c0). Cinco visitas ao primeiro andar, 12 s de atividade por visita, dois clientes, 15 Hz, mesma qualidade/viewport/GPU. A referência foi extraída sem alterar o checkout; as dependências locais foram reutilizadas por junções. A primeira tentativa da referência não iniciou por falta da resolução de ws; corrigida a junção server/node_modules, a repetição concluiu com ok:true. Nenhum resultado da tentativa falha entra nas métricas.

| Medida | Referência na mesma sessão | Fase A na mesma sessão |
| --- | ---: | ---: |
| Quadros / duração | 4.695 / 66,15 s | 4.705 / 66,10 s |
| FPS médio | 70,97 | 71,18 |
| p95 / p99 | 22,40 / 28,50 ms | 21,60 / 29,70 ms |
| 1% low | 29,66 FPS | 28,45 FPS |
| Maior intervalo | 84,40 ms | 98,10 ms |
| Quadros acima de 100 ms | 0 | 0 |
| FPS de trechos estáveis | 71,50 | 71,39 |

Não foi reproduzida regressão de FPS médio no primeiro andar nesse ensaio; não é ganho de otimização. O p99 atual ficou 1,2 ms maior e o maior intervalo, 13,7 ms maior. Uma dupla de ensaios curtos não estabelece significância estatística nem garante ausência de regressões em outros locais.

Contadores dos últimos 6,5 s de cada visita (excluindo dados de recursos ainda pertencentes à transição): máximo de draw calls 78 → 77, triângulos 11.667 → 12.245, texturas 11 → 10. Heap JavaScript máximo 43,66 → 58,33 MiB (+14,67 MiB, cerca de 34%). Esse aumento merece acompanhamento: o cliente atual prepara o castelo no início do harness e a coleta de lixo não foi forçada/controlada. Não prova vazamento nem mede memória GPU; o roteiro longo terminou com zero instâncias de arena restantes. Não foi ocultado nem compensado removendo conteúdo.

Arquivos: .logs/iteration242-reference/.logs/iteration241-242-matched-before-1792716181055 e .logs/iteration242-matched-after-1792716073216, ambos com report.json e frames.json. Reprodução: BENCH_INVESTIGATE=1, FLOOR1_ONLY=1, ACTIVITY233=12, REPEATS233=5; scripts/iteration241-electron.mjs na cópia anterior e scripts/iteration242-electron.mjs no checkout atual.

A suíte final também inclui integração de 12 clientes e isolamento das parties/arenas. O microbenchmark de doze andares registrou 2,20 ms para 1.000 passos vazios e 4,18 ms como maior média de passo ocupado. Esses números são microbenchmarks da simulação, não uma nova medição sustentada da frequência de 20 Hz nem prova para doze PCs escolares.

## Próxima etapa delimitada

Fase A encerrada como implementação funcional com as limitações registradas. Por tamanho e complexidade, aplica-se a divisão de entrega autorizada no item 2 do prompt: a próxima etapa é B, corrigindo acesso frontal, geometria e filtragem subterrânea do covil, preservando o Lobo Branco e a mineração; somente após sua validação executar C (água/navegação, pesca e acabamento da mineração). A Iteração 24.2 completa permanece aberta. Nenhuma mudança de B/C ou reforma da forja foi declarada pronta.

## Atualização após 24.2B

Covil reconstruído e validado; suíte final 679/679 e build aprovado. Diagnóstico, comparação de desempenho, capturas e limites em [ITERACAO-24.2B-RELATORIO.md](ITERACAO-24.2B-RELATORIO.md). A seção anterior registra a delimitação original ao encerrar A; não indica que B continua pendente. Fase C e forja não iniciadas.

## Atualização após 24.2C

Fase C concluída: água sólida, pesca natural, nova animação e acabamento da mineração. Suíte final 688/688, build e regressões Electron de castelo/covil aprovados. As referências a C pendente acima são históricas. Consulte [o relatório consolidado A/B/C](ITERACAO-24.2C-RELATORIO.md) para alterações, medições, evidências e limites de playtest.
