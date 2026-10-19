# Changelog

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
