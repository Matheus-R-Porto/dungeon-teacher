# Iteração 34 — auditoria inicial

Leitura do prompt, AGENTS, relatórios 32/33, servidor, controladores, ferramentas e testes existentes realizada antes de modificar sistemas. `sources/` permanece somente leitura. A LAN física não bloqueia esta iteração; não será apresentada como realizada.

| Estado atual | Comportamento esperado | Necessidade de ajuste |
|---|---|---|
| Hub TLS escolar, SQLite central, 32 vagas e ferramentas ADM privadas | Preservar toda a Iteração 33 | Reutilizar; bancos e perfis de teste separados |
| Simulação 20 Hz e snapshots 10 Hz; `onTickSample`/`onSendSample` existentes | Medir CPU/RAM, atraso, mensagens, operações e entidades em atividade | Harness de processo separado, matrizes 4/8/16/24/32 e latência artificial |
| `school-soak.mjs`: 12 clientes antigos de protocolo, movimento/combate e chat | Exercitar também classes32, TLS33 e fases comparáveis | Reutilizar WorldClient/WS, hooks e estatísticas; não afirmar Electron/32 PCs |
| `performance-diagnostic.js` e scripts Electron | FPS/renderização e memória em clientes reais | Reutilizar diagnóstico em perfis isolados, separado dos ensaios de protocolo |
| Lobo Branco: 1800 HP, ataque26, defesa8, frenesi<30%, mordida, carga multialvo, uivo/reforços | Opcional extremo para primeira classe Job25+, fora de instância | Medir antes de alterar valores; manter identidade, habilidades, covil e aggro |
| Lobo: XP210, chance individual de baú20%, contribuição1%, raio28, atividade60s; reaparece após900000ms | Mesmas recompensas e intervalo; golpe final define nickname | Preservar; testar transação/idempotência e reinício |
| Lobo: encontro persistido tem estado, geração, respawnAt, killer; lápide desenhada no covil | Registrar morte, data/hora e posição exata, mostrar a todos | Lacuna comprovada: faltam diedAt e posição; corrigir snapshot, interação e visual |
| Cavaleiro do Último Juramento: HP1500, ataque24, defesa7, XP300; arena de party1–6 com confirmação, roster fixo | Progressão mais acessível; escala por participação efetiva | Não existe escala no controlador atual. Adicionar rastreamento de dano/suporte com piso estável por encontro, sem contar observadores |
| Cavaleiro: espada em área, projétil arcano, ruptura circular, carga; fase2 em40% | Preservar mecânicas, animações, arena, progresso e recompensas | Somente parâmetros numéricos e correção indispensável de participação |
| Classes: 80 habilidades, 350 ranks, validação de orçamento/pré-requisitos e 8 atalhos | Perfis plausíveis de primeira classe (não Job25 de Novato) | Gerar perfis pelas funções de progressão e validar build/equipamento; registrar completos |

Não há mecanismo oculto de escalonamento: `Arenas.create` usa roster para entrada/recompensa, mas `OathKnight` não escala HP/dano por jogadores. A contagem de participantes da recompensa não deve ser confundida com a de dificuldade. A parede/caverna, superfícies, caminhos e colisões já existem e serão exercitados sem substituir a IA.

Pontos a investigar, ainda sem conclusão de gargalo: snapshots compartilhados reconstruídos por destinatário; `OnlineTower.world` reaplica buscas de castelo/geografia; consultas SQLite de desbloqueios e drops por snapshot; serialização de personagem a cada ciclo; caminho/projéteis/condições. Nenhuma otimização é assumida como necessária antes dos dados.

Configurações originais: `src/domain/tower-awakening.js`, `src/domain/expedition.js`, `shared/guardian.js`. Controladores: `server/white-wolf.js`, `server/white-wolf-rewards.js`, `src/simulation/oath-knight.js`, `server/arenas.js`. Regressões existentes em `tests/iteration222.test.js`, `tests/iteration23.test.js`, testes de classes32 e `tests/iteration33.test.js`.
