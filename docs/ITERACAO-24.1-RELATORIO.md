# Iteração 24.1 — Beta 0.6.4

## Auditoria e decisões

Antes da implementação, a HUD era DOM/CSS, sobre um canvas Three.js. `src/ui/player-hud.js` fornecia o mesmo markup e atualização de HP, MP, XP e nível para `CharacterPanel` na campanha e `world-mode.js` no multiplayer. `AbilityHud` possuía oito slots, configuração, teclas 1–8 e regras existentes de drag-and-drop. Não foi criada uma segunda hotbar.

`createGameShell` já reunia o menu, profissões e diário. Os painéis usavam elementos `dialog`, com abertura nos adaptadores locais e online; não havia registro compartilhado de interfaces sensíveis a perigo. A campanha pausava para qualquer diálogo. O multiplayer bloqueava somente os controles do cliente, mantendo o servidor ativo.

`InputController` administra WASD, rotação e ponteiro; hotbar e painéis têm seus atalhos próprios. O bloqueio se baseia em diálogos abertos, transição e atividades. Na campanha, `Combat.basicImpact` já chamava `onHostileImpact` quando `hit` era verdadeiro, independentemente do dano. `AreaSession` usava esse callback para interromper coleta. No online, snapshots já traziam eventos com `id`, `source`, `target`, `hit`, `damage` e `time`; o cliente já descartava eventos antigos e repetidos. Nenhum protocolo novo foi necessário.

Áreas locais usam `area.safe` e os mapas da run. O online distingue cidade pelo ambiente e Torre pelos protocolos existentes; arenas são mapas privados com epoch próprio. O fechamento não depende de nomes individuais de andares.

O projeto tem testes Node, build Vite, harness Electron com perfis isolados/CDP, cenários de gameplay/recuperação e captura limitada de frametimes da 23.3. Esses recursos foram reutilizados. O plano aplicado foi: apresentação compartilhada → registro de segurança no shell existente → integração dos eventos reais → testes de entrada, operações, layout e comparação de desempenho.

## Apresentação

A HUD conserva personagem no alto à esquerda e hotbar inferior central. A linguagem visual usa fundo de pedra escura, moldura de metal envelhecido, pequenos rebites e um emblema geométrico original. Vida, mana e experiência têm siglas e valores numéricos, além de cores distintas. A tipografia é local do sistema, com números tabulares e foco de teclado visível. Não há downloads de fontes, imagens novas, animações, filtros novos, uploads de texturas ou mudanças nos shaders.

`hud-foundation.css` contém o acabamento e os ajustes responsivos. Os diálogos respeitam espaço inferior para os slots. Somente os diálogos de exploração registrados deixam de desfocar o fundo, preservando leitura da hotbar. Essa alteração não muda a lógica de habilidades. As barras atualizam propriedades/textos apenas quando necessário; valores fora de limite são limitados somente na apresentação, sem modificar o personagem.

## Segurança compartilhada

`InterfaceSafety`, criado pelo shell, mantém um registro explícito de adaptadores `isOpen`/`close`. Não consulta todas as janelas a cada frame. `hit` só age em área perigosa e para `hit === true`. Proximidade, animação, erro de ataque, dano a outro alvo e cura não disparam o fechamento. Eventos online continuam usando a filtragem autoritativa já existente.

As interfaces integradas são:

| Compartilhadas | Campanha | Multiplayer |
|---|---|---|
| Menu, profissões, diário, configuração da hotbar | Personagem, inventário/equipamentos, habilidades atuais, diálogo de interação, painel existente de biomas e conexão | Inventário/atributos, Party, habilidades atuais, conversa com NPC |

Configurações/pausa, ajuda, prontidão de arena e recompensa não são fechadas indiscriminadamente. Não foram criadas Árvore do Destino, mapa ampliado, carrinho, peso ou Vanish.

Ao fechar por perigo, o registro limpa os controles locais, mantém as teclas já pressionadas bloqueadas até sua soltura e consome a soltura/clique remanescente até uma nova entrada deliberada. O canvas recebe foco apenas se nenhum diálogo protegido continuar aberto. O fechamento repetido é idempotente. Mudanças de mapa também podem solicitar fechamento pelo mesmo registro. Na campanha, o callback de coleta anterior foi preservado e encadeado; o combate não conhece janelas individuais.

Interfaces de exploração na Torre local agora bloqueiam entrada sem pausar a simulação. Refúgio e telas protegidas mantêm sua pausa anterior. Movimentação por caminho é interrompida ao abrir um painel, mas ataques/habilidades já confirmados e transações não são cancelados pelo fechamento automático.

## Operações em andamento

O fechamento é exclusivamente visual: não dispara rollback, não encerra promessas e não remove callbacks de resposta. A revisão revelou dois caminhos locais que dependiam implicitamente da pausa anterior:

- O rollback de `RpgPanels.mutate` restaurava o personagem inteiro em falha de save. Agora restaura os campos da operação e os deltas de seus recursos, preservando HP/MP e progressão recebida durante a espera.
- O consumo de comida confirmava uma cópia inteira do personagem. Agora confirma somente o consumo, recarga/buff e recuperação já calculada, preservando dano, XP e novos itens concorrentes; não ressuscita um personagem morto enquanto aguardava o save. Fórmulas de recuperação, cooldowns e formato do save não mudaram.

Novas interações de inventário/coleta aguardam uma operação local já em confirmação, sem parar movimento ou combate. Serviços seguros de cozinha e forja continuam com o fluxo existente. A alteração do consumo foi validada também pelos testes anteriores de comida, incluindo falha de gravação e consumo duplicado.

## Arquivos principais

- `src/ui/player-hud.js`: markup compartilhado, valores acessíveis e atualização condicional.
- `src/ui/hud-foundation.css`: identidade visual, contraste e dimensões.
- `src/ui/interface-safety.js`: registro, fechamento, foco e proteção de entrada.
- `src/ui/game-shell.js`: proprietário do registro e das interfaces comuns.
- `src/main.js`: integração local, separação entre pausa e bloqueio e impacto confirmado.
- `src/multiplayer/world-mode.js`: eventos de snapshot e integração das interfaces online existentes.
- `src/ui/rpg-panels.js`, `src/domain/food-service.js`: segurança das operações assíncronas com simulação ativa.
- `tests/iteration241.test.js`: testes focais de HUD, entrada e transações.
- `scripts/iteration241-electron.mjs`, `scripts/iteration241-scenario.mjs`: verificação real de foco, comandos, layouts e campanha.
- Metadados raiz/servidor, configuração multiplayer, Electron e diagnóstico: versão 0.6.4, mantendo a convenção existente.

## Validação e desempenho

A suíte final passou em **665/665 testes**, sem skips ou falhas, em 145,01 s. A build de produção passou em 2,36 s. O aviso anterior de bundle acima de 500 kB permanece; não foi feita reorganização de módulos sem necessidade desta etapa. A referência antes das alterações está em `.logs/iteration233-241-before-1792682261305/`; seu `dist` foi preservado em `.logs/iteration241-reference/dist`.

Na revisão final, o fechamento por acerto online foi colocado antes do descarte de efeitos visuais com mais de 0,7 s: um impacto novo recebido com atraso continua protegendo a interface; IDs já processados não fecham uma janela reaberta. Após essa alteração de ordem, a build passou novamente em 2,21 s, os 10 testes focais passaram e o cenário Electron final confirmou também o acerto atrasado e a deduplicação. A suíte completa antecede apenas esse último ajuste, coberto pelo cenário final.

Foram verificados layouts de 1280×720, 960×540, 640×480 e 360×640, oito slots visíveis, HP correto, foco, teclas mantidas, soltura de clique interrompido, operação de atributo confirmada e simulação local ativa com inventário aberto. As capturas responsivas usam DPR 1 emulado; a referência de desempenho usa DPR 1,25, dois clientes Electron, qualidade High com ajuste automático desligado e GPU integrada AMD Radeon. Os perfis e saves de teste são isolados.

O benchmark reutiliza cinco ciclos de transições e revisitas da 23.3, com comandos a 15 Hz, cerca de quatro minutos e mais de 24 mil intervalos por condição. A média passou de 100,55 para 105,88 FPS; p99 de 25 para 17 ms e 1% low de 26,34 para 30,79 FPS. Isso não demonstra ganho gráfico: são duas sessões, sujeitas a caches e agendamento. Não apareceu regressão sustentada nesta amostra, mas o pior intervalo aumentou de 125 para 175,4 ms, um único evento acima de 150 ms na condição final. Picos residuais continuam possíveis; não há causa conclusiva atribuída à nova HUD. Não foram removidos elementos visuais para melhorar os números.

O benchmark final ocorreu sem testes pesados concorrentes e antes somente do ajuste de ordem do acerto atrasado, que não modifica renderização nem a atualização regular. A build posterior foi validada funcionalmente sem repetir todo o benchmark. Heap e recursos gráficos amostrados são apresentados abaixo; não equivalem a uma medição de VRAM ou de memória total do processo.

O máximo amostrado de heap aumentou de 56,77 para 63,41 MiB (+6,64 MiB, aproximadamente 11,7%). Draw calls máximas permaneceram em 420; geometrias passaram de 275 para 272 e texturas de 21 para 22. A HUD adicionada é DOM/CSS e não cria texturas Three.js. Os máximos de sessões distintas não demonstram retenção ou vazamento; tampouco permitem atribuir esse aumento integralmente à HUD. O consumo de memória permanece um ponto a acompanhar em sessões longas. As capturas finais estão em `.logs/iteration241-final-foundation-1792702530608/`, incluindo `hud-tower.png` e `hud-local.png`.

## Limitações e próximas etapas

O teste automatizado usa personagens e servidor isolados. A pequena tela vertical é uma verificação de adaptação, não um novo suporte a gameplay por toque. Não houve avaliação presencial dos computadores escolares; não se promete 60 FPS nesse hardware. Os picos residuais da 23.3 continuam sendo uma limitação conhecida.

A aprovação estética final cabe ao playtest. Nomes muito longos podem ser truncados visualmente no painel compacto, mantendo o texto acessível. Janelas futuras precisam se registrar explicitamente e devem manter operações de domínio independentes de sua visibilidade. As novas regras planejadas de arrastar da Árvore do Destino e duplo clique não foram antecipadas. Não houve commit, push, deploy ou instalador, nem alteração de saves reais.

<!-- MEASUREMENTS -->

## Medições finais

| Condição | Quadros | Duração s | FPS | p95 ms | p99 ms | p99,9 ms | 1% low | 0,1% low | Máximo ms | >100/min |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| before | 24986 | 248.48 | 100.55 | 16.80 | 25.00 | 75.10 | 26.34 | 11.05 | 125.00 | 1.69 |
| after | 26036 | 245.90 | 105.88 | 16.70 | 17.00 | 66.50 | 30.79 | 11.85 | 175.40 | 0.73 |

| Condição | Heap máximo MiB | Geometrias máx. | Texturas máx. | Draw calls máx. |
|---|---:|---:|---:|---:|
| before | 56.77 | 275 | 21 | 420 |
| after | 63.41 | 272 | 22 | 420 |

Os intervalos incluem preparação, transições e primeiros frames. Máximos de recursos são amostras periódicas, não medidas de VRAM. O heap inclui a captura limitada. Cinco repetições são revisitas na mesma sessão, não cinco inicializações frias. Não se atribuem diferenças pequenas de cadência a ganho ou perda gráfica sem evidência.

### Fontes e verificações

- before: .logs\iteration233-241-before-1792682261305/report.json
- after: .logs\iteration241-final-after-1792683851182/report.json
- foundation: .logs\iteration241-final-foundation-1792702530608/report.json
- edges: .logs\iteration241-edges-1792683513659/report.json

Verificações Electron finais:
- proximity/no hit and confirmed miss leave inventory open
- server-confirmed zero damage closes inventory and suppresses held movement
- release of interrupted UI click sends no world command
- server-confirmed attribute operation remains committed after automatic close
- real server impact also closes inventory
- delayed confirmed hit closes once; repeated snapshots do not close reopened view
- unregistered help remains open
- HUD bounds, correct HP and eight visible slots at four dimensions
- local Tower keeps simulating while inventory open; hostile-impact hook closes and focuses

Verificações de perfis e recuperação:
- transitions finish in all three manual profiles
- rapid replacement presents only latest authoritative destination
- near door preloads only public knight atlas
- moving away releases speculative slot
- shader failure removes loading layer and reconnect recovers
- disconnect during preparation cancels and reconnect recovers
- F10 available after recovery
- local campaign boots independently after online test
- local fixture traverses floors 1 and 2 and returns to refuge
