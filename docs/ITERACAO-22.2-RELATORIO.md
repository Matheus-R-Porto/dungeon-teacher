# Iteração 22.2 — Beta 0.5.2: A Torre Desperta

## 1. Resumo

Implementação da população e encontro persistentes da **Torre compartilhada**, sem deploy. A geografia v3 também é usada pela campanha; suas regras de run, população antiga, recompensas e ausência de respawn foram preservadas. O Lobo Branco persistente não foi adicionado à campanha local. Nenhum novo boss principal foi criado no terceiro andar.

## 2. Diagnóstico inicial

Inspeção do seed público 217021 confirmou 6/11/14 monstros comuns (5/8/9 Slimes e 1/3/5 lobos), respawn compartilhado 24/32 segundos, três ruínas elevadas semelhantes e limite de 64 monstros no recebimento do cliente. Esse limite impediria o terceiro andar com 70: foi elevado para 96, com limite de jogadores mantido em 32. Diagnóstico inicial: `ITERACAO-22.2-DIAGNOSTICO.md`.

## 3. Arquitetura da população

`awakenTower` compõe v3 sobre v2/v1, sem sobrescrever bases. Slots determinísticos com IDs do andar, espécie, superfície e geração. Mortes reutilizam slots, não criam novas entidades; reforços têm três slots próprios. A composição é idempotente para a mesma configuração e rejeita recomposição incompatível. Para desativar/trocar, compor novamente a partir da definição-base, não do resultado v3.

## 4. Distribuição

| Andar | Slimes | Lobos | Comuns | Extras |
|---|---:|---:|---:|---|
| 1 | 25 | 5 | 30 | nenhum |
| 2 | 40 | 15 | 55 | 1 Lobo Branco + 3 reservas dormentes |
| 3 | 45 | 25 | 70 | nenhum boss novo |

Mantidos os spawns antigos, complementados por amostragem determinística de pontos caminháveis. Distância mínima de 2,4 entre novos pontos da mesma superfície, afastamento de interações e rampas. No segundo andar, oito dos novos lobos ocupam a caverna. Primeiro andar conserva provocação por impacto; lobos territoriais nos demais. Não houve aumento de dano dos comuns por causa da densidade.

## 5. Respawn fora da visão

12 s Slimes / 16 s lobos. Após o prazo: até oito candidatos por tentativa, uma tentativa por segundo, cursor circular com 40 candidatos. Estado pendente fica no próprio slot: não há fila crescente. Rejeita colisão, superfície inválida, portais, outro monstro vivo e proximidade de **qualquer** jogador relevante.

A câmera/viewport não são conhecidos pelo servidor. **Pradaria: 65 unidades de distância de segurança, uma estimativa conservadora, não oclusão geométrica comprovada.** Não é garantida invisibilidade absoluta em toda proporção de tela. Não se confia em câmera enviada pelo cliente.

Na caverna, o cliente oculta criaturas fora da superfície subterrânea e além de 24 unidades, com revelação gradual entre 24 e 20. O servidor exige 26 para observadores da mesma caverna; considera jogadores na rampa com a margem maior. Jogadores na pradaria não veem essas criaturas. Isso é um contrato de apresentação do cliente atual, não prova de que paredes ocultam qualquer ponto em qualquer câmera. Se os candidatos forem ocupados/observados, o respawn aguarda. Reforços usam o mesmo validador.

## 6. Encontros e densidade

Métrica reproduzível: grade de pontos caminháveis, distância em linha reta ao monstro terrestre mais próximo dividida por 3,6 unidades/s. É uma **aproximação espacial**, não tempo de encontro medido com pessoas nem caminho real ao redor dos obstáculos. A média passou de 8,6/7,7/8,2 s para 3,5/4,0/3,1 s nos andares 1/2/3; p95 de 16,1/14,4/14,9 s para 6,6/9,9/6,3 s. A caverna não entra nessa métrica terrestre. Vinte seeds × três andares passaram pela construção de entidades sem spawn bloqueado.

## 7. Configurações de população

Padrão `TOWER_POPULATION=high`: 155 comuns. Alternativa `reduced`: 18/33/42, total 93, mantendo 12/16 s para isolar o efeito da densidade. Não se reduziu silenciosamente o padrão. O perfil alternativo tem médias espaciais de 5,1/4,9/4,2 s. Comparação de carga nas tabelas de desempenho abaixo.

## 8. Geografia final

Primeiro andar: pradaria, sem a grande ruína elevada. Segundo: superfície aberta, entrada subterrânea e portal externo preservado. Terceiro: fortaleza com quatro torres, escadaria e plataforma a 6,4 unidades. Geografia original e andares 4–12 permanecem intactos.

## 9. Caverna

Mesmo mapa `shared-floor-2`, superfície `white-wolf-cave` a y=-5. Rampa reutiliza o ID do conector anterior. Duas divisórias alternadas criam percurso com mudanças de direção; rochas, iluminação fria, cristais e câmara final com espaço para grupo. A entrada possui aviso de desafio opcional. O exterior é ocultado ao descer; não há troca de mapa nem necessidade de derrotar o mini-boss para avançar. O corte do exterior é uma solução visual simples, perceptível durante a transição.

## 10. Fortaleza

Plataforma superior, escadas e quatro torres, com colisão nos suportes e navegação no pavimento. Monstros comuns continuam nas áreas terrestres; não sobem o conector. Área final preexistente preservada para a Iteração 23. Não foi implementado o boss principal compartilhado.

## 11. Arte e animações

Atlas SVG original de 9 colunas × 4 orientações, corpo robusto branco, olhos vermelhos, cicatrizes, mandíbula e cabeça móvel. Vistas frontal/traseira próprias e laterais espelhadas; caminhada, preparação, mordida, uivo, frenesi e derrota. Silhueta própria, não recoloração do lobo normal. Arte vetorial provisória mais estilizada que os lobos existentes; não equivale à qualidade final de uma animação quadro a quadro pintada. Nenhum asset de outro jogo foi usado.

## 12. Habilidades

- Investida: preparação 1,1 s, direção fixada, deslocamento por 0,9 s a 9 unidades/s (11 em frenesi), colisão por subpassos e dano validado. Faixa direcional no chão.
- Mordida: preparação 0,85 s, alcance 2,4, 1,35× ataque; área curta e larga, mandíbula aberta.
- Uivo: preparação 1,4 s, anel violeta, cabeça erguida e síntese sonora local provisória.
- Frenesi: abaixo de 30% HP; recuperação reduzida de 1,2 para 0,7 s, investida mais rápida e tonalidade avermelhada.

1800 HP, ataque físico 26, defesa 8, XP 210. HP/ataque/XP derivam do boss de referência da expedição (300/13/70) por 6×/2×/3×. Valores são provisórios, não balanceamento final homologado por jogadores.

## 13. Uivo da Alcateia

Mobiliza até três lobos vivos da caverna, com alvo e navegação autoritativos e leash temporário maior. Recarga de 18 s. Havendo aliados, não cria reforços adicionais. A navegação respeita as divisórias; alvo em outra superfície é inválido.

## 14. Reforços

Sem aliados disponíveis, abre janela de cinco segundos com tentativas de um segundo para ativar até três slots reservados. Pontos na passagem anterior ao covil, sujeitos à segurança de todos os observadores. Sem XP ou drops; nenhum crescimento ilimitado. Morte/reset/perda de participantes limpa reservas e devolve aliados comuns ao comportamento original. Bloqueio espacial pode impedir a convocação inteira: nunca força um spawn.

## 15. Respawn do mini-boss

Prazo de 900000 ms, configurável em `AWAKENING.boss.respawnMs`, separado do respawn comum. Relógio de parede persistido; estados vivo, combate, espera e pronto. Chegar ao prazo não ignora ocupação/visibilidade. Uma única geração ativa por encontro; após respawn, lápide e nome anterior desaparecem.

## 16. Lápide persistente

Registro adicional `encounters` no SQLite existente, sem reescrever personagens ou arquivos-base. Morte, geração, prazo e nome do golpe final são gravados junto da concessão de recompensas. Lápide no covil, interação F com texto seguro. Persiste durante espera e após reinício. O nome vem do personagem do impacto válido, não de texto enviado para a lápide.

## 17. Elegibilidade

Contribuição real de dano ≥1% da vida máxima (18), nos últimos 60 s; personagem conectado, vivo, no mesmo andar/superfície e até 28 unidades do boss no momento da derrota. Estar em party ou selecionar o boss não concede elegibilidade. Não há cura/suporte autoritativo nesse combate online que pudesse ser contabilizado nesta versão.

## 18. XP

210 XP para **cada** elegível; não divide esse valor entre os participantes. Continua preenchendo nível e concedendo pontos de atributo; não vira moeda. Reforços não dão XP. Repetir a contribuição após a morte é bloqueado pela chave persistente da geração.

## 19. Sorteio individual

Um sorteio lógico independente por elegível, com chance configurável de 20%. Testes cobrem dois vencedores e vencedor/perdedor no mesmo combate. Resultado registrado no servidor; não depende de FPS nem momento de um frame. O baú usa `expeditionChest` e seed próprio para o loot existente, sem raridade nova ou economia paralela.

## 20. Coleta privada

Baú físico no ponto da derrota e botão de coleta. Snapshot só inclui drops do dono; servidor valida proprietário, distância, superfície/segmento e personagem vivo. Exclusão do drop e inclusão no inventário são transacionais. Persistência de até sete dias no chão, incluindo desconexão/reinício; depois expira. Inventário cheio não destrói o drop. No Refúgio, abertura autoritativa concede um equipamento do pool existente e 80–120 Ouro; neste modo a abertura é direta, sem adicionar uma nova roleta.

## 21. Persistência e posições

Testados reinício com mini-boss morto, deadline/lápide, baú não coletado, coleta repetida, abertura repetida e recuperação de superfície removida. Posições incompatíveis vão à entrada segura mantendo progressão/inventário. Andar 3 restaura posição válida no pavimento novo. Arquivos-base comparados byte a byte. Dados de teste isolados em `.logs`; nenhum save pessoal excluído.

## 22. Multiplayer e metodologia

Dois processos Electron reais, perfis isolados, servidor loopback. Scripts fazem viagens pelo protocolo e movimento/combate autoritativos, mas preparam posições e atributos para cobrir os fluxos rapidamente. Prazo de respawn acelerado apenas na fixture. Coleta/recompensas também têm testes de domínio/SQLite. Carga: 1/12/32 clientes de protocolo, movimento a 15 Hz nas fases de deslocamento, fases de ataque, chat periódico, portais, mortes simultâneas preparadas e quatro reconexões. Não são 32 computadores físicos.

## 23. Doze clientes

População cheia distribuída: ~20 Hz. Com compressão, p95 do tick ~7,54 ms, tráfego agregado ~372 KiB/s, confirmação de comandos p95 ~109 ms. A latência é envio → snapshot que confirma sequência, incluindo o intervalo de snapshots, e não RTT puro. CPU inclui cliente simulado e servidor no mesmo processo.

## 24. Trinta e dois clientes

Distribuídos e concentrados mantiveram ~20 Hz. Ensaio sustentado de 90 s concentrado com mortes/reconexões: ~20 Hz, tick p95 16,57 ms / p99 24,68 ms, ~2010 KiB/s, confirmação p95 ~129 ms, 38 respawns acumulados. 32 clientes online ao final. É diagnóstico de minutos, não homologação de horas, internet instável ou hardware escolar.

## 25. Benchmarks e gargalos

Ambiente: Windows, Node 24.19, Ryzen 5 6600H, GPU integrada AMD Radeon no Electron. Renderização: um processo Electron, 20 s por cena após aquecimento de 2 s, controle de oclusão de janelas, 1282×722 CSS, DPR 1,25. Cenas preparadas; HP mantido na medição final para não mudar de mapa por morte. Não comparar seus FPS diretamente aos 119,86 históricos como ganho/perda causal: condições e agendamento variam.

Gargalo demonstrado: snapshots completos de muitos monstros/jogadores enviados a cada cliente. Compressão WebSocket nível 1, sem reter contexto, quatro trabalhos concorrentes, limiar 1024 bytes, negociada com o cliente. Sem dependência nova. Reduziu tráfego, elevando CPU: detalhes nas tabelas geradas. Mapas de 70–83 KB excediam temporariamente o orçamento de fila enquanto eram comprimidos; agora snapshots substituíveis são pulados até a fila drenar, sem desconectar a viagem válida. Controle de fila permanece, demais mensagens não acumulam indefinidamente. Agendador fixo de 20 Hz preservado.

IA/navegação mantêm ativação e cache de camadas existentes. Não removidos monstros, colisão, efeitos ou sombras para obter FPS. Métrica de IA inclui navegação; não somar as duas. Navegação p95 zero em várias amostras significa que a maioria dos ticks não recalculou caminho, não ausência de custo: consultar máximos no JSON.

## 26. Evidências visuais

Índice de capturas, vídeos e resultados Electron no anexo de evidências. Inclui pradaria, descida/saída, combate, uivo, lápide/baú privado, reconexão e fortaleza. Filmagens são do canvas; não validam reprodução sonora pela gravação. Cenas preparadas estão identificadas no relatório do script. Revive acelerado não representa espera manual de 15 minutos.

## 27. Testes automatizados

Resultado final e caminhos dos logs na seção de validação gerada abaixo. Incluem população, passagens, segurança/pendência, habilidades, reforços reais, persistência, elegibilidade, sorteios independentes, roubo/repetição de loot e fallback de posição. Compilação Vite verificada; aviso de bundle grande permanece.

## 28. Regressões encontradas e resolvidas

IDs de novos monstros não seguiam o prefixo com separador do andar: corrigidos. Testes antigos esperavam respawn enquanto ainda havia observador perto: agora afastam os observadores e o teste dedicado garante pendência. Teste de persistência superior foi transferido do mirante removido no andar 1 para a fortaleza do andar 3; fallback da superfície removida recebeu teste próprio. Após afastar a fixture para respawn, a distribuição de atributos precisava voltar à entrada: corrigido o cenário. Seleção subterrânea ignorava a altura e podia considerar oclusores da pradaria: corrigidos nível e filtros. Compressão revelou a fila temporária do welcome grande: corrigido o envio de snapshots substituíveis. O teste escolar aguardava apenas o mapa, antes do snapshot novo: passou a esperar mudança de sessão e estado válido. Números e efeitos de dano subterrâneos receberam a altura da entidade.

## 29. Limitações conhecidas

- A campanha local não recebe a população persistente nem o encontro novo; separação intencional de regras.
- Respawn terrestre usa distância estimada, não frustum conhecido; pode esperar muito com muitos observadores espalhados.
- Caverna usa corte do exterior e limite visual; arte vetorial do boss e som sintético são provisórios.
- Testes de balanceamento são simulações/fixtures, não validação de diversão ou dificuldade com estudantes. Solo evoluído é possível; grupos grandes derrotam o boss rapidamente.
- Carga loopback no mesmo computador, CPU/RAM agregadas com o gerador de carga; não mediu GPU utilization de hardware nem 32 GPUs. Amostras de população reduzida são sequenciais no mesmo processo, então RSS não é comparável como memória exclusiva do perfil.
- Rede ainda envia snapshots completos. Compressão tem custo de CPU e não substitui futura priorização por interesse. Sem compressão negociada, o tráfego permanece maior.
- Picos de criação inicial de mapas e p99 acima de 50 ms no ensaio reduzido continuam possíveis; média de 20 Hz não significa ausência de picos.
- Prazo de sete dias para baús é finito. Não há raridade nova, pergunta educacional ou novas habilidades de classe.

## 30. Arquivos principais

`src/domain/tower-awakening.js`, `src/world/awakened-tower.js`, `server/respawn.js`, `server/white-wolf.js`, `server/white-wolf-rewards.js`, integração em `server/world.js`, `server/tower.js`, `server/online-tower.js`, `server/hub.js`, `server/config.js` e `server/index.js`; superfícies, navegação e spawns; renderização em `awakened-structures.js`, `combat-visual.js`, `forest.js` e `scene.js`; UI/cliente multiplayer; `feedback.js`; atlas SVG original; testes e scripts `iteration222-*`; manifests de versão e documentação. Alterações anteriores da 22.1 no checkout foram preservadas.

## 31. README e changelog

Atualizados para 0.5.2, com escopo, configuração alternativa, limites, comandos de validação e link deste relatório. Diretório de perfil desktop permanece `Dungeon Master Playtest 0.5.0`, evitando criação implícita de outro save. Configuração pública preservada; nenhum acesso/deploy foi realizado.

## 32. Recomendações para a Iteração 23

Fazer playtest humano com 10–12 estudantes, medir a rede real e revisar especialmente telegráficos, dificuldade em grupo, entrada da caverna e tempo entre encontros. Antes de mirar 32 PCs por internet, considerar interesse de rede ou deltas com negociação compatível. Lapidar arte/animação/ambiente do covil. O boss principal do terceiro andar continua reservado e não foi iniciado.

<!-- measured-results -->
## Anexo A — Validação final

577/577 testes aprovados, zero falhas, execução completa com concorrência 2. Após o ajuste defensivo da composição v2 em memória, os 10 testes focais da 22.2 passaram novamente (`.logs/iteration222-final-focused.txt`). [Log completo](../.logs/iteration222-accepted.txt). Compilação Vite aprovada; aviso de chunk ~895 KB (não bloqueante).

Dois Electron reais: fluxo concluído, sem exceções de runtime; 1633 frames na amostra preparada do covil após a derrota, 81.66 FPS, p95 15.10 ms / p99 16.80 ms. Isso não é FPS de combate contínuo. [Resultado do percurso](../.logs/iteration222-electron-1792534103007/report.json). Seleção do boss por clique real e correção da altura de impactos/barra: [Verificação visual focal](../.logs/iteration222-electron-1792534292572/report.json).

## Anexo B — Renderização comparada

| Cena | Versão | FPS | Frame p95/p99 ms | 1% low FPS | Draw calls | Triângulos | Materiais | Texturas lógicas / GPU | Heap JS MiB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| tower-one-entry | v2 referência | 81.08 | 14.80 / 15.90 | 59.75 | 73 | 11657 | 178 | 107 / 7 | 22.5 |
| tower-one-entry | v3 final | 80.84 | 15.10 / 16.50 | 57.98 | 76 | 11663 | 221 | 131 / 8 | 15.9 |
| tower-one-grove-monsters | v2 referência | 81.67 | 15.00 / 16.00 | 58.30 | 100 | 12251 | 178 | 107 / 8 | 15.8 |
| tower-one-grove-monsters | v3 final | 81.00 | 14.80 / 16.20 | 59.57 | 73 | 11593 | 221 | 131 / 8 | 14.5 |
| tower-twelve-grove | v2 referência | 80.44 | 15.10 / 16.10 | 60.35 | 121 | 12535 | 200 | 118 / 8 | 24.3 |
| tower-twelve-grove | v3 final | 82.32 | 15.00 / 16.10 | 59.52 | 94 | 11877 | 243 | 142 / 8 | 19.5 |
| floor-2-structure | v2 referência | 82.04 | 14.10 / 15.40 | 61.33 | 86 | 14262 | 221 | 142 / 7 | 18.6 |
| floor-2-structure | v3 final | 85.36 | 13.70 / 15.20 | 51.66 | 23 | 274 | 332 | 190 / 12 | 27.1 |
| floor-3-structure | v2 referência | 81.45 | 14.90 / 15.90 | 60.43 | 123 | 15997 | 260 | 174 / 8 | 32.5 |
| floor-3-structure | v3 final | 82.76 | 15.10 / 16.90 | 50.34 | 163 | 16437 | 373 | 231 / 10 | 38.6 |

A fortaleza sobe de 123 para 163 draw calls (+32,5%), materiais de 260 para 373 e texturas lógicas de 174 para 231. Clones de textura não equivalem a fontes GPU independentes; consultar ambos os contadores. O heap cresce também por carga sequencial/GC, portanto não representa memória exclusiva de cada cena. Caverna e antiga ruína são cenas diferentes: a redução de objetos visíveis ali não prova otimização do mesmo conteúdo. Nas três cenas equivalentes do andar 1, diferenças de FPS pequenas não justificam alegar ganho de otimização. Sombras permanecem ativas.

## Anexo C — Servidor e carga

A tabela sem compressão apresenta bytes JSON; com compressão, apresenta bytes TCP escritos no socket (inclui framing). O custo do handshake/mapa fica fora das janelas estabilizadas. Consumo de CPU em % de **um núcleo**, incluindo driver e servidor no mesmo processo. Intervalos e máximos constam do JSON.

| Cenário | Perfil | Compressão | Hz | Tick p95 / p99 ms | CPU % | RSS MiB | Envio KiB/s | Confirmação p95 ms |
|---|---|---|---:|---:|---:|---:|---:|---:|
| one-full-floor | high | não | 19.99 | 1.17 / 11.82 | 3.3 | 66.2 | 112.8 | 94.8 |
| 12-spread | high | não | 19.99 | 6.13 / 17.30 | 11.1 | 127.2 | 2557.3 | 106.8 |
| 32-spread | high | não | 20.00 | 12.81 / 20.52 | 24.1 | 203.4 | 8785.7 | 118.9 |
| 32-concentrated | high | não | 19.99 | 15.99 / 29.05 | 29.1 | 212.4 | 12998.6 | 123.8 |
| 32-sustained-death-respawn-reconnect | high | não | 20.00 | 15.35 / 20.72 | 29.8 | 215.1 | 13318.2 | 123.4 |
| 12-spread | reduced | não | 19.99 | 4.17 / 15.77 | 6.5 | 214.7 | 1688.6 | 107.3 |
| 32-spread | reduced | não | 19.99 | 10.94 / 37.75 | 16.4 | 218.0 | 6689.6 | 106.7 |
| 32-concentrated | reduced | não | 19.99 | 13.50 / 24.06 | 24.2 | 216.4 | 10296.4 | 120.4 |
| one-full-floor | high | sim | 19.99 | 1.08 / 13.76 | 4.2 | 68.2 | 17.5 | 109.4 |
| 12-spread | high | sim | 20.04 | 7.54 / 16.37 | 15.9 | 138.9 | 371.8 | 109.3 |
| 32-spread | high | sim | 20.00 | 14.07 / 21.35 | 46.3 | 226.1 | 1402.8 | 119.8 |
| 32-concentrated | high | sim | 19.99 | 17.34 / 19.80 | 45.9 | 248.8 | 1931.5 | 128.5 |
| 32-sustained-death-respawn-reconnect | high | sim | 20.00 | 16.57 / 24.68 | 47.2 | 273.5 | 2010.1 | 129.4 |
| 12-spread | reduced | sim | 20.00 | 4.64 / 8.91 | 13.8 | 276.0 | 287.1 | 108.9 |
| 32-spread | reduced | sim | 19.99 | 10.28 / 64.21 | 37.4 | 276.3 | 1181.8 | 113.0 |
| 32-concentrated | reduced | sim | 20.04 | 16.26 / 44.30 | 44.1 | 282.0 | 1580.1 | 121.2 |

| Cenário com compressão | Perfil | IA p95/max ms | Navegação p95/max ms | Respawn p95/max ms |
|---|---|---:|---:|---:|
| one-full-floor | high | 0.155 / 0.566 | 0.000 / 0.205 | 0.000 / 0.000 |
| 12-spread | high | 0.155 / 0.889 | 0.000 / 0.000 | 0.004 / 0.576 |
| 32-spread | high | 0.175 / 75.306 | 0.000 / 75.078 | 0.002 / 0.441 |
| 32-concentrated | high | 0.105 / 0.579 | 0.000 / 0.206 | 0.002 / 0.200 |
| 32-sustained-death-respawn-reconnect | high | 0.170 / 30.950 | 0.000 / 30.810 | 0.000 / 0.472 |
| 12-spread | reduced | 0.111 / 0.269 | 0.000 / 0.000 | 0.002 / 0.131 |
| 32-spread | reduced | 0.117 / 66.820 | 0.000 / 66.724 | 0.002 / 0.331 |
| 32-concentrated | reduced | 0.139 / 157.374 | 0.000 / 157.232 | 0.003 / 0.228 |

São ~260 s de janelas por passagem de carga, além de transições/aquecimento: 20 s com um cliente, seis janelas de 25 s e 90 s sustentados. Perfil reduzido não foi mais rápido em todos os percentis: observar variação de GC/agendamento, não escolher um perfil por um único p99. AI não ficou saturada nesses cenários; o custo de serialização/envio cresceu com os destinatários. Não é teste de pior caso de pathfinding em todos os 155 monstros simultaneamente.

## Anexo D — Balanceamento simulado

Personagens estacionários usando ataques básicos, RNG fixo, sem desvio humano; mortos saem da simulação. “Evoluído” é fixture com STR 30/VIT 40, não percurso medido de progressão.

| Participantes | Fixture evoluída | Tempo s | Boss derrotado | Sobreviventes | Menor HP do boss |
|---|---|---:|---|---:|---:|
| 1 | não | 9.75 | não | 0 | 1635 |
| 1 | sim | 25.50 | sim | 1 | 0 |
| 2 | não | 18.55 | não | 0 | 1335 |
| 4 | não | 45.45 | não | 0 | 1140 |
| 12 | não | 8.80 | sim | 12 | 0 |
| 2 | sim | 12.50 | sim | 2 | 0 |

O ensaio demonstra perigo para iniciantes, possibilidade de solo evoluído e trivialização por grupo grande. Não substitui teste tático. Recuo, limpeza de encontro, morte, desconexão e observadores bloqueando reforços também são cobertos pelos testes. Aumentar HP por tamanho de grupo não foi introduzido silenciosamente.

## Anexo E — Evidências locais

- [cave-descent.webm](../.logs/iteration222-electron-1792534103007/cave-descent.webm)
- [cave-exit.webm](../.logs/iteration222-electron-1792534103007/cave-exit.webm)
- [fortress-climb.webm](../.logs/iteration222-electron-1792534103007/fortress-climb.webm)
- [tomb-and-private-chest-A.png](../.logs/iteration222-electron-1792534103007/tomb-and-private-chest-A.png)
- [tomb-and-private-chest-B.png](../.logs/iteration222-electron-1792534103007/tomb-and-private-chest-B.png)
- [white-wolf-combat.png](../.logs/iteration222-electron-1792534292572/white-wolf-combat.png)
- [white-wolf-combat.webm](../.logs/iteration222-electron-1792534292572/white-wolf-combat.webm)
- [reinforcements-enter-arena.png](../.logs/iteration222-electron-1792534469338/reinforcements-enter-arena.png)
- [reinforcements-enter-arena.webm](../.logs/iteration222-electron-1792534469338/reinforcements-enter-arena.webm)

No ensaio de uivo sem aliados, os três reforços percorreram a caverna e chegaram a 1.23, 0.90, 1.25 unidades dos jogadores. [Resultado com posições finais](../.logs/iteration222-electron-1792534469338/report.json). As posições iniciais, atributos e eliminação dos aliados foram preparados; o deslocamento dos reforços foi executado pela IA real.

Nenhum commit, deploy, publicação, instalador ou reset de save. Iteração 23 não iniciada.
