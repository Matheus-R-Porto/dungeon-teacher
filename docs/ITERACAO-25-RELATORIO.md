# Iteração 25 — auditoria e implementação

Estado: implementação concluída e validação técnica aprovada em 23/10/2026. Aguardando playtest humano.

## Auditoria anterior à implementação

- CLASS_DEFINITIONS contém somente novice (Novato). Não há escolha de classe, evolução, primeira/segunda classe ou linhagem adicional implementada. Os cinco nomes em NOVICE_TREE são estilos exploratórios, não classes desbloqueadas. Não serão transformados em classes.
- Cinco habilidades: Golpe Poderoso, Ataque Duplo, Tiro Duplo, Bola de Energia, Regeneração. Todas ativas, aprendizado binário (0/1), sem pré-requisitos de outras habilidades; quatro exigem arma na ativação. Não existem passivas, ranks intermediários ou custos crescentes.
- Um Espaço de Habilidade por nível, custo de aprendizado 1, regras em skill-tree.js/BALANCE. XP não é gasto. Todas as cinco podem ser aprendidas.
- Campanha: Character, knownAbilities, skillSpaces e hotbar persistem no CharacterSave. Oito slots normalizados, sem duplicações; dados antigos sem hotbar usam INITIAL_HOTBAR filtrada pelas habilidades conhecidas.
- AbilityRuntime ativa slots 1–8 e valida arma, alvo, MP e recarga. A interface antiga usa TAB e menus suspensos. RpgPanels mantém mutação com rollback parcial para preservar ganhos durante combate.
- Multiplayer persistente v4: snapshot publica knownAbilities, mas não skillSpaces/classId/hotbar. Não há comando de aprendizado nem execução de habilidades ativas. Hotbar é preferência local por identidade autenticada. A implementação integrará aprendizado/configuração autoritativos à persistência existente, sem criar execução de habilidades no servidor ou mudar o combate. Modos temporários antigos permanecem sem progressão permanente.
- InterfaceSafety já fecha interfaces por impacto confirmado (inclusive dano zero), limpa entrada e suprime clique/teclas pendentes. Será reutilizado. A árvore não pausará nem no Refúgio; atalhos de câmera/movimento não podem vazar para o mundo.
- Tronco de primeira classe e copa de segunda classe não podem ser demonstrados com dados reais: não existem. A arte pode ter tronco/copa decorativos; nenhum nó ou desbloqueio fictício será exibido. Máximo 1 representa o contrato real de aquisição única, não novos níveis.

Referência antes das alterações: .logs/iteration25-reference, cópia A/B/C atual com dependências locais reutilizadas. Não confundir com HEAD antigo. Nenhum save real, commit ou deploy.

## Implementação entregue

- `src/domain/abilities/destiny.js`: projeção dos dados reais, operações de aprendizado/hotbar e transação local serializada. Rollback de falha preserva HP e pontos ganhos enquanto o disco respondia.
- `src/ui/destiny-tree.js` e `.css`: árvore orgânica em SVG, raízes do Novato, painel de detalhes, estados com texto e símbolos, pan/zoom limitado, centralização, TAB/Escape, navegação por teclado e adaptação a 800×600. Tronco/copa são decoração, não representam classes desbloqueadas.
- `src/ui/ability-icons.js`: cinco ícones vetoriais pixelados distintos, sem emojis, downloads ou novas texturas WebGL.
- `src/ui/ability-hud.js`: reutiliza a mesma hotbar de oito posições, movida temporariamente para dentro do diálogo e restaurada ao fechar. Arrasto da árvore substitui; arrasto entre slots troca/move. Remoção explícita não desaprende. Duplo clique usa primeiro vazio ou destaca a posição existente. Com somente cinco habilidades reais, o caso de oito posições únicas cheias foi verificado no helper, sem inventar habilidades.
- `src/main.js` e `src/ui/rpg-panels.js`: encaminhamento dos menus para a árvore, persistência da campanha e exclusão da árvore da pausa do mundo, inclusive na cidade.
- `shared/online.js`, `server/online-tower.js`, `src/multiplayer/world-client.js` e `world-mode.js`: comandos estritos, confirmação autoritativa depois de salvar, tratamento de desconexão e migração única da preferência antiga por identidade. O cliente não concede pontos/habilidades especulativamente. Configurações antigas são filtradas pelas habilidades aprendidas e a chave antiga não é apagada.

XP continua progressão de nível; Espaços de Habilidade continuam o recurso existente. Nenhum balanceamento, recompensa ou regra de classe mudou. O agendador do servidor não foi alterado.

## Segurança e persistência

A árvore registra-se no InterfaceSafety existente. Impacto confirmado fecha o diálogo, cancela arrasto e captura de ponteiro, restaura a hotbar e limpa entradas. O cenário Electron verifica campanha e servidor, tecla mantida durante fechamento, drop interrompido e reconexão. O teste de dano zero injeta um evento confirmado de zero no servidor temporário e o transmite pelo snapshot real; não depende da fórmula normal, que produz dano mínimo. O teste de dano positivo usa `world.impact`.

Aprendizado e hotbar são salvos por personagem. Operações concorrentes são bloqueadas durante confirmação; falha de armazenamento não consome pontos. Servidores antigos informam indisponibilidade de evolução, sem criar autoridade local paralela.

## Metodologia de desempenho

Windows, Node 24.19.0, Electron 44.5.1, build de produção, dois clientes Electron no mesmo computador e servidor local temporário. Qualidade High, ajuste adaptativo desativado e controle de oclusão do harness existente. Mesma campanha com seed 42 e câmera inicial; 20 ciclos de TAB aberto/fechado, aproximadamente 650 ms em cada estado, sem capturas dentro da janela medida. Referência é a cópia do estado 24.2C real anterior, não o HEAD antigo.

Intervalos medidos por requestAnimationFrame. FPS = 1000 / frametime médio; p95/p99 por percentil dos intervalos; 1% low = inverso da média dos 1% intervalos mais lentos. Recursos amostrados aproximadamente a cada 500 ms. As capturas funcionais ocorrem depois. São ensaios curtos da interface, não benchmark isolado de GPU nem certificação dos computadores escolares.

| Condição | Quadros | Duração | FPS médio | p95 (ms) | p99 (ms) | 1% low |
|---|---:|---:|---:|---:|---:|---:|
| Referência 24.2C, painel antigo | 1726 | 28,05 s | 61,53 | 28,0 | 32,5 | 18,91 |
| Árvore inicial, desfoque herdado | 1487 | 28,84 s | 51,57 | 33,9 | 48,1 | 12,44 |
| Experimento: árvore sem desfoque | 1743 | 28,16 s | 61,89 | 28,4 | 34,5 | 17,57 |
| Entrega: árvore sem desfoque | 1742 | 27,85 s | 62,55 | 28,0 | 32,7 | 19,91 |

A regra global `dialog::backdrop` aplicava blur sobre o mundo em movimento. O experimento removendo apenas esse filtro recuperou a faixa da referência; a alteração definitiva foi limitada ao backdrop da árvore. O escurecimento e a simulação continuam. Não atribuímos a diferença de 61,53 para 62,55 FPS a ganho geral no jogo.

Nas quatro condições: 77 draw calls, 28 geometrias, 13 texturas e 40 programas do renderer, constantes. A árvore não adicionou recursos WebGL. Na referência, DOM estabiliza em 620 nós; na árvore, 681 após a primeira abertura, sem crescimento nos 20 ciclos. Heap JS da referência variou entre 18,0 e 46,9 MB; na árvore inicial entre 18,0 e 46,5 MB, com coleta periódica. Não há evidência de crescimento acumulativo nesse ensaio curto; isso não prova ausência de vazamento de longa duração. Memória total do processo/VRAM não foi medida.

Persistem picos pontuais: máximo de 346,1 ms na referência e 267,0 ms na entrega. Não foi determinado neste trabalho se são primeira abertura, coleta de lixo ou agendamento do sistema. Não reabrimos a auditoria geral de renderização.

## Limitações de conteúdo e compatibilidade

- Só existe Novato. Não há captura funcional de primeira/segunda classe, passiva, rank intermediário ou pré-requisito encadeado: esses dados não existem. Nenhuma classe futura foi inventada.
- A execução de habilidades ativas online já não existia e permanece indisponível, com aviso explícito. Esta iteração acrescenta aprendizado e configuração confirmados no servidor; efeitos das habilidades continuam disponíveis na campanha.
- Sem deploy: servidores públicos precisam receber o código compatível antes de oferecer a evolução online. Nenhuma publicação foi feita.
- Em 800×600 o mapa inteiro cabe com nós pequenos; zoom e painel de detalhes com rolagem permitem leitura. Playtest humano de acabamento visual ainda é necessário.
- Nenhum save real foi modificado. Não houve commit, push, exportação ou início da próxima iteração.

## Evidências reproduzíveis

- Referência: `.logs/iteration25-reference/.logs/iteration242-destiny-before-1792805195934/report.json`.
- Árvore inicial: `.logs/iteration242-destiny-final-1792804963729/report.json` (ainda com blur; substituído como evidência final).
- Experimento sem filtro: `.logs/iteration242-destiny-no-blur-1792805452055/report.json`.
- Entrega e medição final: `.logs/iteration242-destiny-release-1792805539340/report.json` e `destiny-frames.json`.
- Castelo: `.logs/iteration242-destiny-castle-1792805605198/report.json` — entrada nível 1 com segundo jogador, travessia, arena separada, vitória/retorno e desbloqueio persistente.
- Covil: `.logs/iteration242-destiny-cave-1792805656877/report.json` — uma entrada/saída real, preservando o mapa compartilhado, com capturas frontal/lateral/traseira/interior/retorno.

Capturas reais da entrega, em `.logs/iteration242-destiny-release-1792805539340/`:

- `destiny-roots-locked.png`: raízes e habilidades bloqueadas por falta de pontos.
- `destiny-available.png`: pontos disponíveis, estado de aprendizado e detalhes.
- `destiny-learned-hotbar.png`: aprendizado e atribuição por duplo clique.
- `destiny-drag-assigned.png`: resultado de arrasto nativo para a mesma hotbar.
- `destiny-800x600.png`: apresentação em resolução menor.
- `destiny-local-hit-closed.png`: interface fechada por confirmação local.
- `destiny-online-confirmed.png`: aprendizado e hotbar confirmados pelo servidor.
- `destiny-online-zero-hit.png`: fechamento por evento confirmado de dano zero enviado pelo servidor de teste.
- `destiny-online-drag-interrupted.png`: fechamento e arrasto cancelado por impacto positivo.

Não são arte conceitual. Os scripts `scripts/iteration25-electron.mjs` e `scripts/iteration25-scenario.mjs` executam gestos CDP no Electron real; o JSON registra as verificações. As capturas mostram estados antes/depois, não constituem vídeo.

## Falhas encontradas e correções durante a validação

1. Estilos gerais de diálogo restringiam a largura: corrigida precedência específica da árvore.
2. `button:active` global deslocava os nós ao pressionar e impedia duplo clique: preservado o transform dos nós durante pressão; gesto nativo revalidado.
3. Fixture inicial de recarga usava VIT 1000, acima do limite válido 999: corrigido exclusivamente o personagem temporário. Não foi defeito do carregamento de saves.
4. Distinção entre substituir pela árvore e trocar entre slots foi explicitada e testada, inclusive se a habilidade já ocupava outra posição.
5. Desfoque herdado do backdrop teve custo mensurável: removido somente na árvore, preservando escurecimento e demais elementos.
6. Primeira suíte completa: 694/695, timeout no combate de 12 clientes durante concorrência automática. Reexecução isolada com os oito testes da iteração: 11/11, incluindo o cenário de 12 jogadores em 6,74 s. A hipótese de contenção é compatível com o resultado; o timeout inicial não foi ocultado nem ampliado para fazê-lo passar.

Build final: `npm run build`, 1,35 s, sucesso. Permanece o aviso preexistente de chunk acima de 500 kB. Nenhuma dependência adicionada. `git diff --check` sem erros.

Validação adicional de navegação: `.logs/iteration242-destiny-navigation-1792805742864/report.json`, aprovado. Pan por gesto nativo altera só a árvore; personagem/câmera permanecem iguais; zoom respeita 0,35–1,6 e centralização restaura a visualização. Arrasto da árvore sobre slot ocupado, quando a habilidade já estava na hotbar, substitui sem trocar a habilidade deslocada. Repetidos os testes de recarga, confirmação online e interrupção por impacto nesta execução.
Heap JS da entrega definitiva: 19,23–45,71 MB; fim da amostra 23,57 MB. A faixa é compatível com a referência e sem subida contínua no período medido.


## Resultado final dos testes

- `node --test tests/iteration25.test.js tests/iteration241.test.js`: primeira verificação focal 17/17; posteriormente acrescentado o caso específico de substituição da árvore.
- `node --test tests/iteration25.test.js tests/school-multiplayer.test.js`: 11/11, incluindo oito contratos da Iteração 25 e ensaio real de 12 clientes.
- `node --test --test-concurrency=2 tests/*.test.js`: **696/696 aprovados**, 179,31 s, zero falhas/cancelamentos/skips. Log: `.logs/iteration25-full-final.txt`. Suíte cobre combate e efeitos existentes, campanha, multiplayer, persistência e regressões A/B/C; não foi alterado timeout nem lógica de combate para passar.
- `npm run build`: aprovado, 1,35 s; log `.logs/iteration25-final-build.txt`.
- Electron final: árvore (20 ciclos), navegação/substituição adicional, castelo e covil: todos `ok: true`, nenhum erro registrado.
- `git diff --check`: aprovado após a implementação.

As modificações anteriores de 24.2A/B/C presentes no checkout foram preservadas. A lista de arquivos da implementação acima delimita esta iteração; o diff total do repositório também contém trabalho anterior não commitado.
