## 0.6.9 — Iterações 28, 28.1 e 28.1B

- Nova interface de inventário: grade com ícones, nomes, pilhas, tooltip acessível,
  navegação por setas/Home/End, painel de equipamentos separado e comparação
  opcional de estatísticas lado a lado.
- 32 ícones SVG originais (+ 1 fallback) para os 44 itens reais, leves e vetoriais,
  seguindo a mesma estratégia da Árvore do Destino.
- Em paralelo (28.1/28.1B): sprites pixel art gerados por IA para os 44 itens,
  128×128, produzidos a partir de 7 designs aprovados como referência visual.
  Integrados em `public/assets/items/`; aprovação artística final ainda pendente.
- 44 IDs auditados sem alteração de estatísticas, raridades ou preços.

## 0.6.8 — Iterações 27, 27.1 e 27.2

- Componente de diálogo unificado entre campanha e modo online (antes eram
  interfaces separadas).
- Retratos de corpo inteiro dos seis NPCs, moldura ornamentada em bronze,
  animação de entrada de 210ms (respeitando `prefers-reduced-motion`).
- Retrato ajustado de 46vh para 55vh em desktop após revisão; quatro NPCs
  espelhados para melhor composição (Marta, Brasa, Lina, Caio).
- Navegação por teclado, foco visível, Safety fecha em transição/impacto/blur.
  Aprovação estética humana ainda pendente.

## 0.6.7 — Iteração 26

- Minimapa com névoa de descoberta: HUD compacto permanente (180×180) e mapa
  ampliado (tecla M), navegável por arrasto/roda/setas.
- Descoberta persistida por personagem, vinculada à geometria/seed do ambiente.
- 708/708 testes aprovados. Playtest humano pendente.

## 0.6.6 — Iteração 25

- Árvore do Destino: substitui o menu TAB antigo por uma árvore orgânica em SVG
  para aprender as 5 habilidades existentes, com pan/zoom e navegação por teclado.
- Hotbar de 8 posições reaproveitada dentro do painel da árvore (arrastar para
  aprender/posicionar).
- Sincronizado com a persistência multiplayer v4 (aprendizado confirmado pelo
  servidor antes de aplicar).
- 696/696 testes aprovados. Playtest humano pendente.

## 0.6.5 — Iteração 24.2 (fases A/B/C)

- Castelo do Cavaleiro do Último Juramento reconstruído: exterior, interior e
  arena conectados nos dois modos (antes só existia no modo online).
- Covil do Lobo Branco reconstruído com acesso frontal e filtragem de
  visibilidade subterrânea corrigida.
- Água deixa de ser só decoração: lagos agora têm colisão sólida real e podem
  ser pescados em qualquer margem válida, não só em pontos fixos.
- Nova animação de pesca (arco de lançamento, recolhimento) e HUD de mineração
  com acabamento visual.
- 688/688 testes aprovados ao final da fase C.

## 0.6.4 — Iteração 24.1

- Fundação visual compartilhada de HP, MP, XP, nível e oito slots da hotbar,
  com CSS leve, identificação por texto e valores atualizados somente quando mudam.
- Registro de interfaces de exploração no shell existente: fechamento por
  acerto confirmado, foco seguro e supressão de entradas residuais.
- Painéis registrados da Torre local bloqueiam os controles sem pausar a simulação.
- Confirmação de consumo e rollback do painel preservam dano/progressão recebidos
  enquanto uma operação é salva, sem alterar fórmulas, formato do save ou protocolo.
- Testes de layout, dano zero, clique interrompido e transações, além dos benchmarks existentes.

## 0.6.3 — Iteração 23.3

- Submissão cooperativa de shaders, com esperas GPU sobrepostas e cancelamento.
- Preparação dos atlas já solicitados e da pose efetiva antes do primeiro render.
- Captura diagnóstica limitada de outliers, classificação temporal e traces
  separados; nenhuma carga contínua de profiler no jogo normal.
- Comparação repetida com a 0.6.2 final, medição de overhead e ensaio prolongado.
- Testes de preservação de objetos, contexto de iluminação, cancelamento e
  propriedade dos atlas. Conteúdo, HUD, regras, saves e scheduler preservados.

## 0.6.2 — Iteração 23.2

- Construção cooperativa de cenas e cancelamento de destinos obsoletos.
- Preparação assíncrona de shaders e aquecimento GPU limitado ao primeiro
  enquadramento, com restauração integral das sombras do perfil antes de exibir.
- Passagem visual com indicação de espera e recuperação de falhas/reconexões.
- Snapshot mais recente retido durante preparação, sem fila crescente nem
  alteração da autoridade ou do protocolo de entrada em arenas.
- Antecipação limitada do atlas público do Cavaleiro perto da porta, sem
  antecipar dados privados; correção de invalidação redundante dos atlas.
- Diagnóstico de etapas no F10, referências repetidas e sessão contínua
  incluindo transições. Picos residuais e aumento de latência documentados.
- HUD, conteúdo, saves, recompensas, Parties e scheduler de 20 Hz preservados.

## 0.6.1 — Iteração 23.1

- Diagnóstico F10 persistente, exportação local e métricas de cauda com amostra mínima.
- Perfis gráficos, avaliação inicial descartável, reavaliação manual e ajuste
  gradual opcional com histerese, limites e cooldown.
- Projeção de rótulos sem leitura de layout por entidade e sem escritas para nomes ocultos.
- Reuso de um renderer nas transições; descarte de shadow maps, listeners e wrappers de profiling.
- Navegação com recorte conservador de obstáculos e ocupação memoizada por consulta.
- Benchmarks comparáveis, teste prolongado e roteiro de validação escolar documentados.
- Mecânicas, 155 monstros comuns, bosses, Parties, instâncias, saves e scheduler de 20 Hz preservados.

## 0.6.0 — Iteração 23

- Correção comprovada de navegação longa entre superfície e terreno; reutilização de rotas ainda válidas.
- Limite global de 32 identidades conectadas, incluindo arenas; limpeza com gravação agrupada.

- Arenas privadas simultâneas, entrada coletiva com prontidão e participantes fixos.
- Cavaleiro do Último Juramento: espada, onda arcana, ruptura circular, investida e segunda fase.
- Sala da fortaleza, porta animada, arte SVG original, indicadores e barra de boss.
- Mortos acompanham a luta; desconectados mantêm corpo vulnerável por até 45 segundos.
- Vitória transacional, desbloqueio persistente do quarto andar e 300 XP apenas na primeira vitória.
- Limpeza após resultado/abandono; retorno seguro ao mundo público após reinício.
- Tabelas adicionais guardian_unlocks e arena_results; nenhum mapa ou save apagado.
- Campanha, mini-boss público, respawns e andares 4–12 preservados.
- Servidor passa a ignorar envio para conexões ausentes durante a reserva da arena.
- Renderer permite cenas sem portal público e preserva orientação/zoom nas transições.

# Changelog

## 0.5.2 — A Torre Desperta — 2026-10-20

- Populações compartilhadas de 30/55/70 monstros comuns; alternativa explícita 18/33/42. Respawn de 12/16 segundos, candidatos limitados e avaliação de todos os jogadores.
- Geografia v3: pradaria sem mirante no primeiro andar, caverna subterrânea opcional no segundo, fortaleza elevada no terceiro. Portais e arquivos-base preservados; recuperação segura de posições antigas.
- Lobo Branco com atlas vetorial original, quatro orientações, investida, mordida, uivo e frenesi; reforços limitados e sem XP/loot explorável.
- Lápide persistente com nome do golpe final; respawn do encontro após 15 minutos; XP individual elegível e sorteios privados de baú com coleta manual e abertura no Refúgio.
- Compressão negociada de snapshots, com descarte de snapshots substituíveis durante drenagem da fila de envio. Agendador de 20 Hz preservado.
- Capacidade padrão de 32 jogadores; cliente aceita até 96 slots de monstros para incluir o terceiro andar e as reservas do encontro.
- Testes, gravações Electron e medições em `docs/ITERACAO-22.2-RELATORIO.md`. Campanha local conserva suas regras de população e recompensas.
- Sem commit, publicação, deploy, instalador, exclusão de saves ou início da Iteração 23.


## 0.5.1 — Um Mundo Vivo — 2026-10-20

- Composição v2 de terreno aberto nos andares 1–3, preservando os arquivos-base e a expansão v1.
- Ruínas com terreno inferior, escadaria e pavimento superior no mesmo mapa; navegação, colisão, combate e câmera consideram altura.
- Altura sincronizada entre clientes e posição validada restaurada após encerramento limpo do servidor local.
- Ciclos ambientais dos seis NPCs; quatro poses originais do ferreiro e bigorna sólida com aproximação livre.
- Cadência de caminhada por distância ajustada; golpe descendente de mineração e apresentação de lançamento, recolhimento e peixe confirmado na pesca.
- Regras econômicas preservadas. Relatório e limites em `docs/ITERACAO-22.1-RELATORIO.md`.
- Sem deploy, instalador, commit ou reset de saves.

## 0.5.0 — A Torre Viva — 2026-10-19

- Expansão aditiva e versionada dos andares 1–3, com rotas laterais e clareiras, preservando geografia persistida, portais e andares 4–12.
- Artes originais de árvores, vegetação, ruínas, terreno e lobo quadrúpede com quatro direções.
- Lobo territorial nos andares 2–3; primeiro andar mantém provocação por impacto válido.
- Respawn online por espécie, afastamento de jogadores, verificação de colisão/portal e população limitada.
- Escala visual dos seis NPCs ampliada em 1,5×, com pés e interações preservados.
- Campanha mantém seu chefe preexistente e ausência de respawn por run; nenhum novo chefe implementado.
- Validação, benchmarks e ressalvas em `docs/ITERACAO-22-RELATORIO.md`.
- Sem commit, publicação, deploy, instalador ou reset de saves.

## 0.4.3 — Animações e identidade visual — 2026-10-16

- Cinco poses completas de caminhada por direção/estado e idles das quatro famílias; remoção de equipamentos geométricos.
- Saque/guarda parado e andando, continuidade ao parar/inverter e prioridade de dano.
- Flechas, magia, cortes e cura ilustrados; pesca/mineração acompanham eventos reais.
- Seis NPCs compatíveis com o protagonista e retratos nos serviços.
- Nomes de inimigos contextuais, cursor de espada e bloqueio de hover sobre UI/oclusão.
- 551 testes de regressão aprovados; gravações Electron e benchmark em docs/ITERACAO-21.2-RELATORIO.md.
- Sem alteração de recompensas, combate lógico, saves ou agendador de 20 Hz.
- Ressalvas medidas: torre perto de 80 FPS abaixo do histórico e pico isolado de 453 ms; causa não conclusiva. Atlas ampliam o custo potencial de memória.

## 0.4.2 — Polimento visual — 2026-10-15

- Atlas inteiros com margens transparentes e UVs protegidas; removida invasão de pixels entre poses.
- Quatro passos por direção, pernas alternadas, norte de costas e cadência por deslocamento; Slimes e moradores reempacotados.
- Espada, arco, duas adagas e cajado com mãos integradas, saque/guarda intermediários e postura armada persistente; campo visual autoritativo compatível com reconexão.
- Cidade murada com torres, portões, terreno contínuo, estradas e floresta instanciada por região; colisões compartilhadas e oclusão visual.
- Placas físicas e nomes por proximidade; câmera ajustada para o exterior, sem remover sombras.
- 544/544 testes completos, 11/11 finais focados, build e dois Electron; servidor próximo de 20 Hz. Custo visual e limitações registrados.
- [Relatório e evidências](docs/ITERACAO-21.1-RELATORIO.md). Sem deploy, publicação, commits ou reset de saves.

## 0.4.1 — Cidade e HUD — 2026-10-15

- Cidade de 60 × 56 unidades, sete regiões e doze construções, compartilhada com a campanha local; serviços locais mantidos por adaptador.
- Novo atlas corporal 8 × 4 com caminhada norte corrigida, cadência de 4,5 FPS, ação, dano e derrota; espada, adaga, arco e cajado separados do corpo.
- Painel de personagem e menus compartilhados, minimapa, livro de profissões, party e mensagens recolhíveis; informações técnicas retiradas do HUD permanente.
- Hotbar de oito slots com seleção por menu, atribuição a partir do livro, arrastar/trocar, limpeza, requisitos, recargas e persistência compatível. Preferências online separadas por identidade; habilidades online indisponíveis continuam explicitamente desativadas.
- Geometria estática agrupada por material e região; edifícios mantêm materiais próprios para oclusão. Cobertura das sombras ampliada para os novos bairros, sem retirar elementos.
- Preservados o agendador de 20 Hz, protocolo autoritativo, capacidade para 12 jogadores, combate, recompensas e progressão.
- [Relatório, testes, capturas e desempenho](docs/ITERACAO-21-RELATORIO.md). Sem deploy, publicação, commit ou novo instalador.

## 0.4.0 — School Demo Foundation — 2026-10-15

- Shared City of the Threshold with authoritative geometry/collisions and reversible travel to floor 1; existing saves and floor geography preserved.
- Original player atlas, three Slime types, six unique NPC sprites and six matching dialogue portraits; original SVG environment/effect textures.
- Individual Portuguese NPC dialogues with range/line-of-sight checks, keyboard blocking and context cleanup.
- Monster HP bars, target rings, authoritative damage numbers, hit/death poses and received-damage feedback.
- Twelve-client integration, two independent parties, shared/distinct targets, manual loot and duplicate protection, reconnect and persistence; separate-process sustained measurement and real Electron evidence.
- Same-network limits expanded to accommodate twelve participants and reconnects.
- No new bosses, floors, professions, economy, deployment or installer.
- [Full report and measured limitations](docs/ITERACAO-20-RELATORIO.md); [art pipeline](docs/ITERACAO-20-ARTES.md).

## 0.3.0 — Social Multiplayer Foundation — 2026-10-13

- Added persistent server-side characters with SQLite transactions and OS-protected Electron credentials; isolated from local saves.
- Added six-member parties, invitations, leadership, presence and GDD boss-combat kick restriction.
- Cooperative XP reuses existing progression; private manual drops and persistent inventory.
- Global/party chat and integrated UI, with server validation and rate limits.
- New protocol v4; v1/v2/v3 compatibility and twelve-floor geography retained.
- 526 full-suite tests passed; final focused tests and two real Electron clients passed. Human playtest pending; no deployment.
- [Full Iteration 19 report](docs/ITERACAO-19-RELATORIO.md).

## 0.2.2 — Twelve Shared Floors — 2026-10-13

- Expanded shared Tower to floors 1–12 using existing procedural geography and populations.
- Adjacent up/down portals, explicit unavailable floor 13, open experimental access.
- Preserved legacy geography files; versioned runtime access adapter and separate stored/runtime hashes.
- Suspended empty simulations after reconnect grace. v1/v2/v3, local campaign and saves preserved.
- 516 tests passed, build passed, two real Electron clients traversed all floors. Human playtest pending.
- Full evidence and limitations: [Iteration 18](docs/ITERACAO-18-RELATORIO.md).

## 0.2.1 — Fundação da Torre Compartilhada — 2026-10-13

- Andares procedurais 1 e 2 reaproveitando o gerador local, sem alterar a campanha.
- SharedTower coordena múltiplos SharedWorld com entidades e eventos isolados.
- Geografia completa persistida, SHA-256, versão do gerador e publicação atômica sem sobrescrita.
- Protocolo v3 com área/epoch/seq; v1 do Refúgio e v2 da arena preservados.
- Portais validados pelo servidor e reconexão no andar da sessão; acesso provisório livre.
- Perfis A/B abrem a Torre; --legacy-world mantém a arena 0.2.0.
- 512 testes automatizados e dois processos Electron; reinício preservando geografia testado.
- Sem playtest humano, deploy público, instaladores, contas, progresso/loot online ou profissões compartilhadas.
- Relatório: [Iteração 17](docs/ITERACAO-17-RELATORIO.md).

## 0.2.0 — Fundação do Mundo Compartilhado — 2026-10-13

- Mapa de teste com personagens temporários, monstros e combate básico controlados pelo servidor.
- Protocolo v2 no mesmo servidor/endpoint WebSocket; compatibilidade com a presença v1 do Refúgio.
- Movimento validado, navegação, colisões, cadência, alcance, linha de visão, dano, HP, morte e respawn oficiais.
- Sessões com token temporário, substituição de conexão, sequenciamento de comandos e gerações dos monstros.
- Cliente de apresentação com interpolação, HP oficial, reconexão e pausa apenas de comandos locais.
- Perfis Electron A/B separados do perfil principal, preservando sandbox, CSP e lista de destinos permitidos.
- Correção: início de uma run descarta definições de andares da run anterior, inclusive andar 4+.
- Proteção: saves com progressão antiga não são mais resetados ao abrir o perfil.
- Campanha, progressão, habilidades, inventário, profissões e dados locais preservados. O mapa de teste não abre IndexedDB nem concede recompensas permanentes.
- Testes de domínio, transporte real e dois processos Electron com capturas de tela.

Limites: somente espada/ataque básico no mapa compartilhado; sem persistência online, contas, loot/XP compartilhados ou Torre pública. Servidor público e instaladores não atualizados nesta entrega. Consulte o relatório para resultados e roteiro manual.

Histórico anterior: [RELATORIOS.md](RELATORIOS.md).
