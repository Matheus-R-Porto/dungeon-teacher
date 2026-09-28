# Iteração 05 — IA, Aggro, Perseguição, Leash e Respawn

Concluída em 24/09/2026. Escopo encerrado antes da Iteração 06. HUD compacto permanece no canto superior esquerdo. Nenhuma fórmula de combate foi alterada.

## Arquivos criados

| Arquivo | Responsabilidade |
|---|---|
| src/domain/enemies/config.js | Espécie, percepção, velocidades, leash, retorno, respawn, separação e navegação |
| src/domain/enemies/spawns.js | Validação e criação de inimigos a partir de entradas de spawn independentes do Hub |
| src/data/enemy-spawns.json | Seis Slimes da região normal de treino |
| src/data/enemy-spawns-stress.json | Vinte posições para teste de escala |
| src/simulation/enemy-ai.js | Percepção, estados, rotas, retorno, vida e respawn individuais |
| src/simulation/bodies.js | Colisão com corpos, deslocamento suave e separação local |
| tests/iteration05.test.js | Trinta testes novos de IA, integração, colisão, targeting e escala |
| docs/ITERACAO-05-PROMPT.md | Especificação recebida |
| docs/ITERACAO-05-RELATORIO.md | Este relatório |

## Arquivos modificados

- src/simulation/combat.js: coleção injetável, integração do diretor de IA, corpos, alvo móvel, aggro por dano e limpeza após morte do jogador.
- src/domain/combat/enemy.js: proteção contra dano durante retorno.
- src/adapters/rendering/combat-visual.js: múltiplos corpos selecionáveis, estados, ocultação no respawn, círculos, origem e rotas de debug.
- src/ui/combat-hud.js: identificação individual no debug, informações por inimigo, métricas e controles de diagnóstico.
- src/main.js: seleção do cenário de spawn e integração da IA.
- src/style.css: rótulos por inimigo e painel de diagnóstico rolável.
- index.html: identificação da iteração e ajuda.
- README.md: controles, cenários e regras atuais.

## Arquitetura

EnemyAI coordena a coleção de inimigos dentro do passo de simulação existente. Não há setInterval nem listeners individuais por monstro. Enemy conserva dados e HP; o resolvedor e AttackCycle da Iteração 04 continuam aplicando os ataques. Visual e HUD leem esses dados, sem decidir dano ou percepção.

O diretor pode ser omitido para os cenários isolados de regressão da fundação de combate. O jogo e todos os testes novos de IA usam o diretor integrado. Cada inimigo conserva targetId, motivo de aggro, spawnPosition, caminho e temporizadores próprios. O resolver de alvo atualmente conhece o personagem local; outras entidades poderão ampliar esse ponto de integração.

## Máquina de estados

Idle → Alert → Chasing ↔ Attacking → Returning → Idle.

Qualquer estado vivo pode terminar em Dead → Respawning → Idle. Returning ignora dano e aquisição de alvo. Dead/Respawning não participam da colisão ou dos ataques. Não existe limite de inimigos agressivos, slots fixos de ataque nem aggro social.

## Percepção e linha de visão

O Slime é meleeAggressive, aggressive=true e assistRange=0. A percepção é amostrada a cada 0,18 segundo, com distribuição inicial entre inimigos. Requer jogador vivo, inimigo em Idle, distância de até 3,2 unidades e linha livre. Reutiliza clearSegment do mundo, com margem de 0,05; árvores e obstáculos sólidos bloqueiam a visão. A configuração permite desligar a exigência de LOS para outra definição de teste.

Ao detectar, registra o ID do alvo e motivo perception; Alert dura 0,2 segundo. onDamaged permite adquirir o atacante com motivo damage, inclusive em inimigos passivos, sem alertar vizinhos. Perder o jogador por morte ou desativação de IA encaminha o inimigo para Returning.

## Navegação e repath

Chase speed 2,6 e return speed 3,2 unidades/s. Reutiliza A* e moveWithCollision. A aproximação tenta até oito posições ao redor do alvo, com um pequeno desvio angular estável, sem slots exclusivos. Os corpos e a separação distribuem o grupo.

O intervalo mínimo entre recalcular rotas é 0,55 segundo; o caminho é refeito quando termina, falha ou o alvo se desloca pelo menos 0,55 unidade. Os monstros não calculam A* a cada frame. O jogador também atualiza sua aproximação quando o inimigo selecionado se move. A tolerância de chegada aos pontos da rota é 0,005, evitando cortar quinas antes de concluir o segmento.

Ataques só ocorrem em Attacking, com alvo vivo, dentro do alcance existente e linha livre. Sair do alcance cancela o impacto pendente e retoma Chasing. Os ciclos, probabilidades e fórmulas de dano permanecem os da Iteração 04.

## Leash e retorno

O território é medido a partir do spawn: leashRange 6,5. O alvo precisa permanecer além de leash + margem de 0,6 durante 0,9 segundo para encerrar a perseguição. Voltar para dentro de leash zera essa contagem; na faixa intermediária a contagem fica estável. Existe também limite absoluto: inimigo além de leash + 2 retorna.

Returning limpa target, cancela impacto pendente e navega até a origem. Recupera 30 HP/s gradualmente e completa o HP ao chegar a até 0,18 unidade do spawn. Não recupera tudo no primeiro frame de retorno, exceto quando já chegou à origem. Ao concluir retorno normal, aguarda 2 segundos para nova percepção.

Durante o retorno, o inimigo fica imune, não pode ser selecionado e não readquire aggro por dano. Se era o alvo do jogador, essa seleção é encerrada. Isso impede reiniciar o combate continuamente para explorar a fronteira do leash.

Rota impossível ou ausência de movimento durante 2,5 segundos encerram a perseguição. No retorno, ficar preso por 2,5 segundos ou superar 15 segundos permite fallback à origem. Esse fallback só ocorre se o ponto estiver caminhável e livre de jogador/outros corpos; caso contrário o inimigo aguarda e continua tentando. Retornos normais não teleportam.

## Morte, respawn e pausa

A morte afeta apenas aquele inimigo. Ele deixa imediatamente de colidir/atacar, perde o alvo e seu visual desaparece após 1,5 segundo. O respawn nominal acontece 8 segundos após a morte. Se houver jogador a até 1,6 unidade da origem ou outro corpo ocupando o ponto, aguarda e testa novamente a cada 0,5 segundo. O reset restaura posição, direção, HP, rota, target e ciclo de ataque.

A morte do jogador cancela todos os impactos pendentes contra ele e limpa todos os alvos. Os inimigos continuam retornando enquanto o jogador aguarda os 3 segundos da regra provisória existente. Depois ele reaparece no Hub com HP/MP completos. A pausa congela IA, ataque, deslocamento, retorno e respawn juntos. A regeneração do personagem conserva a regra anterior.

Não há XP por inimigo, loot, moedas ou persistência do estado dos monstros. O save do personagem continua existente; inimigos e seus temporizadores são transitórios e recriados ao recarregar.

## Colisão e separação

Jogador usa o raio anterior de 0,32; Slime usa raio 0,48. O deslocamento do jogador é revalidado contra corpos vivos com subpassos, evitando atravessamento. Em contato, o inimigo pode ceder na direção do movimento quando a geometria estática permite. Assim o grupo não forma uma parede rígida intransponível.

Três passagens locais de separação afastam pares sobrepostos, com velocidade máxima configurada e respeito às colisões estáticas. Corpos do jogador e inimigos também são afastados; se uma parede impedir o Slime de ceder, o jogador desliza apenas para uma posição permitida. Dead/Respawning não geram corpos.

A separação é quadrática no número de inimigos e adequada à escala validada de vinte. Não é navegação de multidões sofisticada. Grupos muito densos em corredores estreitos ainda podem oscilar ou demorar para encontrar espaço; o visual esférico pode ter pequena interseção nas bordas porque seu volume artístico é maior que o raio lógico. Há testes de contato, deslocamento elevado, separação e saída de um cerco de cinco inimigos.

## Debug e cenários

- Normal: http://127.0.0.1:5173/ — seis Slimes, sem painel de diagnóstico.
- Teste isolado: http://127.0.0.1:5173/?debug=1&test=1 — perfil de personagem separado.
- Escala: http://127.0.0.1:5173/?debug=1&test=1&stress=1 — vinte inimigos.

Depuração do combate mostra estado, target, origem, distância, motivo, tempo de respawn, quantidade acumulada de rotas e fallbacks, além de FPS observado. A opção visual mostra círculos de percepção/ataque/leash, marcador da origem, caminho e cores por estado. IA e ataques ativos pode ser desligada para isolamento; inimigos já envolvidos retornam. Debug permanece oculto por padrão.

## Testes e resultados

93 testes aprovados: todos os 63 anteriores preservados e 30 novos. Build de produção aprovado; mantém-se o aviso anterior de pacote JavaScript acima de 500 kB.

Cobertura nova: spawns independentes/validados, aggro, ausência de percepção, LOS, navegação por obstáculos, repath, alcance/ataques, nova perseguição, leash com tolerância, retorno e cura gradual, imunidade durante retorno, aggro por dano sem assistência social, seis e vinte alvos simultâneos, morte individual, respawn livre/ocupado, morte do jogador, pausa, rota impossível, fallback seguro, separação, colisão com deslocamento elevado, FPS diferentes, targeting entre inimigos próximos e fuga de um cerco.

No navegador, com perfil de teste:

- Aproximação individual: Slime 1 detectou e atacou a 1,6 unidade; os outros cinco permaneceram Idle.
- Fuga: ele voltou a perseguir, cruzou o leash e entrou em Returning.
- Derrota individual: o alvo foi limpo, a mensagem Slime derrotado apareceu e os outros permaneceram vivos.
- Respawn: ficou aguardando com o jogador sobre a origem; ao liberar a área, voltou em Idle, com alvo vazio.
- Grupo: Slime 3 estava Attacking enquanto Slime 4 e stress-17 entravam em Alert; outros mantiveram Idle conforme a própria percepção.
- Morte cercado: o jogador retornou ao spawn com recursos restaurados e o grupo perdeu aggro, voltando a Idle.
- Inspeção de rótulos, cores e círculos de debug; ausência de erros de execução observados.

## Performance observada

No navegador desta máquina, em viewport próximo de 900×690, as amostras ficaram aproximadamente em 51–57 FPS com seis Slimes e 41–48 FPS no cenário de vinte com depuração visual ativa. São amostras locais durante operação, não garantia para todo hardware nem medição de percentis.

No teste isolado sem renderização, vinte perseguidores ativos, com alvo mudando de posição, processaram dez segundos simulados em aproximadamente 0,16–0,41 segundo nas execuções observadas; a execução de referência posterior marcou 0,23 segundo e 123 cálculos de rota. O cenário de vinte no Hub também permaneceu finito e caminhável, sem fallback na execução observada. Esses números medem somente a simulação e não equivalem ao FPS do renderizador.

## Limites e próxima etapa

Sem patrulha, assistência social, classes, habilidades, loot, XP por monstro ou Torre. Há apenas um jogador como alvo resolvido, embora o ID e o ponto de resolução estejam separados. Separação local e fallback são provisórios para esta escala. Arte e animações permanecem placeholders. Iteração 06 não iniciada.
