# Dungeon Teacher — Iteração 30

26/10/2026. Continuação da base 29.1, sem reconstruir inventário, transporte ou sistema de recompensas. A apresentação de baús agora reúne abertura ilustrada, roleta existente e resultado legível em um único painel. Aprovação artística humana pendente.

## Auditoria e contrato preservado

Antes das alterações foram lidos AGENTS.md, RELATORIOS.md, README e os relatórios/arquiteturas de 28.1B, 29 e 29.1, e examinados main, RpgPanels, RewardPanel, RewardReel, chest, loot, Inventory, carry, CharacterSave, InterfaceSafety, onlineUI, WorldClient e OnlineTower. Auditoria prévia integral: ITERACAO-30-AUDITORIA.md.

Campanha: validateChest determina o resultado pela seed e prepara o ticket privado antes de qualquer animação. RewardReel representa esse resultado. grantChest revalida e concede equipamento ×1 e ouro; save confirma, e uma falha restaura o snapshot. O baú permanece intacto até a concessão. Cancelar visualmente antes desse ponto mantém instância e seed. Fechamento desktop cancela uma apresentação ainda não submetida; espera uma gravação já iniciada. O flush agora respeita busy para não gravar o estado intermediário.

Online: o comando open-chest existente continua sendo a única solicitação. Servidor valida localização, vida, combate, sessão, época e sequência; determina o prêmio, troca baú por item em cópia e salva antes de publicar. O cliente espera o snapshot confirmado, confere consumo da instância, nova instância, quantidade, ouro e aviso do servidor e só então usa a mesma RewardPanel/RewardReel. Não calcula seed online nem concede localmente. Falta de confirmação não reenvia pedidos e não promete rollback: orienta reconectar e conferir o inventário. Não houve alteração em server/ ou shared/.

Diferença preexistente preservada: a campanha exige um slot vazio; o servidor pode usar o slot liberado pelo próprio baú. Peso continua derivado pelo domínio. Todos os oito prêmios atuais pesam menos que o baú; portanto a exceção existente permite abrir baú de save sobrecarregado quando reduz a carga. Não foi introduzida recusa artificial nem mudança da curva. Ouro, stacks, probabilidades, IDs, seed, mochilas, carrinho, drops e destino direto na bolsa permanecem.

## Direção artística e recursos

Referência obrigatória: docs/art/iteration281b-sources/expeditionChest.png, correspondente ao ícone real de inventário. Produzido com a ferramenta integrada imagegen um atlas RGBA 1280 × 1280, quatro células de 640 × 640: fechado, início, parcial e aberto. Mantém madeira quente, tampa arqueada, duas faixas de ferro escuro, rebites dourados, fechadura e alça lateral. Atlas final: public/assets/rewards-v30/chest-opening.png. O ícone anterior e todos os 44 PNGs foram preservados.

Abertura utiliza quadros com tampa em posições físicas distintas, nunca apenas escala da imagem fechada. CSS acrescenta antecipação discreta, sombra e iluminação âmbar suave; a transição diminui o baú para abrir espaço à roleta. Verde escuro, dourado moderado, moldura simples e tipografia do jogo. O resultado destaca PNG, nome real, quantidade ×1, fatos existentes do catálogo e ouro.

Tempos configuráveis em reward-animation.js: fechado 450 ms; antecipação 220 ms; início 200 ms; parcial 220 ms; aberto 330 ms; transição 200 ms; giro inicial 850 ms; desaceleração 2.400 ms. Total nominal de 4,87 s, mais a confirmação de gravação/rede. Espaço ou botão pula a parte cosmética. Reduced motion vai diretamente à confirmação/resultado. A animação não tem eventos que concedem itens.

RewardReel foi estendido somente com velocidade/duração opcionais e finish(), que avança para o mesmo alvo. Defaults antigos mantidos para consumidores existentes. A interface inicia o deslocamento num trecho já preenchido para evitar uma metade vazia. O pool, a escolha e a curva cúbica continuam os existentes.

## Interface, interrupções e acessibilidade

Modal único com foco, botão de 44 px, Esc seguro, resultado persistente e anúncio legível. Durante save a interação aguarda; fechamento forçado não cancela transação já iniciada. Reentrada e repetição de teclas não duplicam concessão. A apresentação online usa a mesma arte e componente. O painel é registrado na segurança de transições dos dois modos; a desconexão informa como consultar a recompensa possivelmente salva.

O primeiro ensaio identificou estilos globais de exploração reservando espaço para a hotbar e alinhando o modal ao topo. Sobrescritas restritas ao painel de recompensas corrigiram centralização, escurecimento e rolagem. A janela de 640 × 480 recebeu layout compacto. Inventário e demais painéis permanecem com seu desenho anterior.

## Verificação e evidências

- Testes novos direcionados: 11/11 aprovados em tests/iteration30.test.js.
- Suíte completa final: **788/788 aprovados**, zero falhas/cancelamentos/skips, 192.379 s. Base anterior: 777 testes. Log: .logs/iteration30-full-final.txt.
- Build de produção aprovado. Log: .logs/iteration30-build.txt. Continua o aviso preexistente de chunk acima de 500 kB; nenhuma dependência adicionada.
- Electron: **21 verificações concluídas**, sem exceções de execução no ensaio aprovado, dois processos reais, servidor local e perfis temporários exclusivos.
- 24 capturas, incluindo antes, inventário, quatro poses, antecipação, transição, movimento, desaceleração, seleção durante gravação, resultado, repetição, 800 × 600, 480 × 720, 640 × 480, reduced motion, inventário cheio, save falho e online.
- Galeria e reprodução sequencial: ITERACAO-30-CAPTURAS.html. As fases offline foram pausadas pelo relógio diagnóstico usando os métodos reais do componente; não são mockups e não medem fluidez. O fluxo online percorreu automaticamente a sequência em tempo normal.

Verificações Electron:
- Real reward PNGs loaded
- Exact offline gold and quantity
- Offline item matches seed
- Repeated skip cannot duplicate rewards
- Result remains until acknowledged
- Escape preserves chest and clears busy
- Repeated opening, re-entry guard and keyboard skip
- Fits 800×600
- Fits 480×720
- Fits 640×480
- Offline save reload preserves all items, gold and seeds
- Safety transition cancels only presentation, keeping chest
- Save in progress blocks Escape
- Save failure restores chest, seed, items and gold
- Reduced motion skips cosmetic movement and grants once
- Full inventory refuses without starting animation
- Online presentation uses actual server result; replay rejected
- Online result persisted in SQLite
- Online reconnect retains reward without replay
- Online save rejection preserves chest and reports failure
- Lost online confirmation recovers saved reward on reconnect, without resending

O teste de recarga compara inventário, equipamentos, carrinho, drops e ouro integralmente, sem depender da ordem das chaves JSON. O campo exploration muda legitimamente ao redescobrir a área após recarga; isso foi registrado no resultado e não é perda de recompensa. O primeiro ensaio online após recarga precisou aguardar mapReady antes dos cliques automatizados; nenhum atraso artificial foi adicionado ao produto.

## Arquivos criados e modificados

Criados: src/ui/reward-animation.js; src/ui/reward-panel.css; src/multiplayer/online-reward.js; public/assets/rewards-v30/chest-opening.png; tests/iteration30.test.js; scripts/iteration30-electron.mjs; scripts/iteration30-scenario.mjs; scripts/iteration30-report.mjs; documentação ITERACAO-30 e screenshots/iteration30/.

Modificados: src/ui/reward-panel.js; src/ui/reward-reel.js; src/main.js (guarda de flush, fechamento desktop, registro de segurança e inspeção diagnóstica); src/style.css (importação do CSS específico); src/multiplayer/online-ui.js (apresentação do resultado confirmado); src/multiplayer/world-mode.js (registro de segurança); README.md e RELATORIOS.md.

Nenhuma alteração em loot.js, chest.js, Inventory, carry, transporte, tabelas, servidor ou protocolo. Cópias dos arquivos de produção anteriores estão na pasta work/before-iteration30 desta tarefa. Sources permaneceu somente leitura.

## Limitações e revisão artística

A arte foi revisada visualmente em capturas reais. O atlas conserva o desenho de referência, mas seus quatro quadros ilustrados são variações geradas, não uma malha articulada: detalhes finos de textura podem variar entre poses. Não há interpolação física contínua da tampa; há quatro posições e transições cosméticas. A revisão humana de continuidade e gosto permanece pendente.

O adaptador online utiliza o texto de aviso já emitido pelo servidor v4, conferido contra mudanças reais de inventário e ouro. Se um servidor futuro mudar esse contrato textual, o cliente orientará consultar o inventário em vez de inventar o resultado. Servidor público não foi atualizado nem usado para este teste. Não houve medição de FPS ou validação em PCs escolares, novo instalador, commit, push ou deploy. Nenhum save real foi modificado.

Reprodução: npm test; npm run build; node scripts/iteration30-electron.mjs. O gerador do relatório recebe como argumento a pasta de entrega e exige logs de teste/build aprovados.
