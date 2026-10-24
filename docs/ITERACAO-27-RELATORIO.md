# Iteração 27 — Diálogos, retratos e base para decisões

## A. Auditoria

Inspeção do checkout existente, preservando as alterações das iterações anteriores. `shared/city.js` define seis NPCs reais, seus identificadores, falas e índice de arte. `src/simulation/areas.js` adapta a cidade à campanha: Brasa vira `weaponsmith`, abre a loja; Lina abre a cozinha; os demais usam `examine`. Os textos locais de Marta e Caio diferem intencionalmente dos textos online. Interações são revalidadas em distância/obstáculos por `InteractionSystem.activate` antes de F.

O componente existente `src/ui/npc-dialog.js` apresentava conversas online paginadas, enquanto a campanha usava a janela genérica de exame. O componente foi ampliado e reutilizado nos dois contextos. Objetos examináveis continuam na janela genérica; loja, cozinha e forja continuam sendo serviços funcionais.

`FirstSteps` já persiste progresso por personagem e observa eventos reais; não é uma quest de aceitação por diálogo. Não foi encontrado um mecanismo de avaliação matemática nos módulos de gameplay auditados. Nenhuma quest, pergunta, recompensa ou alteração de save foi adicionada.

`InterfaceSafety` já centraliza fechamento por impacto confirmado (inclusive dano zero em área perigosa), transição e limpeza de entradas. TAB pertence à árvore; M ao mapa; I/C/F e hotbar já verificam bloqueio de interfaces. A campanha pausa as interfaces comuns na cidade segura; essa política foi preservada. O mundo online continua ativo.

## B. Implementação

- Caixa retangular inferior à esquerda/centro, altura derivada do conteúdo e limite com rolagem interna.
- Retrato separado, à direita, sem invadir texto/opções. Altura desktop de 56vh, limitada proporcionalmente em telas estreitas; reserva inferior para hotbar.
- Entrada CSS de 210 ms por transform/opacity; sem loop JS de animação. `prefers-reduced-motion` remove a animação.
- Sem retrato ou em falha de imagem: painel se expande, sem substituir arte por sprite ampliado.
- Falas comuns têm Continuar/Concluir e Fechar. Enter/Espaço ativam o botão focado; setas percorrem alternativas; foco visível; controles do mundo bloqueados enquanto a conversa está aberta.
- Imagem carregada sob demanda; callbacks antigos são invalidados ao trocar/fechar; um único componente é reutilizado. Nenhum recurso WebGL novo.

## C. Arquivos desta iteração

| Arquivo | Responsabilidade |
| --- | --- |
| `src/domain/dialogue-state.js` | Conteúdo paginado, validação, estado e escolhas; efeitos externos e proteção contra repetição |
| `src/ui/npc-dialog.js` | Componente existente ampliado: apresentação, foco, teclado e carregamento/fallback |
| `src/ui/npc-dialog.css` | Composição responsiva, animação e redução de movimento; estilos de rótulos/dano preservados |
| `src/ui/npc-portraits.js` | Referências dos retratos por identidade estável, incluindo alias offline de Brasa |
| `src/main.js` | Integração offline após validação da interação, registro na segurança e descarte no hot reload |
| `public/assets/portraits/townsfolk-transparent-v27.png` | Derivação transparente da prancha original |
| `tests/iteration27.test.js` | Dez testes de domínio e recursos |
| `scripts/iteration27-electron.mjs` | Reutilização do executor Electron existente com perfis isolados |
| `scripts/iteration27-scenario.mjs` | Roteiro visual, controles, segurança, serviços e medição |
| `docs/ITERACAO-27-RELATORIO.md` | Auditoria, resultados e limitações |

Os arquivos já modificados antes desta iteração não foram revertidos. Nenhum arquivo de `sources/` foi alterado.

## D. Recursos visuais

Serafina, Marta, Brasa, Lina, Orin e Caio possuem retratos existentes em `public/assets/portraits/townsfolk.png` (1536×1024, seis células de 512×512). São ilustrações independentes dos sprites do mundo. O original permanece intacto e continua nos cabeçalhos dos serviços.

A skill imagegen, com ferramenta embutida, produziu uma versão com alpha a partir da prancha existente. Foi selecionada a primeira saída, `exec-80aadd74-ce34-4444-9564-4a43ca074645.png`, que preservou melhor as divisões das células; a segunda tentativa foi descartada por mostrar fragmentos vizinhos. PNG final: 2.858.054 bytes, RGBA. A transparência foi confirmada no arquivo e nas capturas reais do jogo. Não foram utilizados assets externos nem personagens inventados.

Prompt utilizado: “Use case: background-extraction. Edit target: existing six-portrait game atlas. Remove ONLY the dark teal background to true transparent alpha. Preserve all six existing characters exactly: faces, poses, clothing, tools, pixel illustration style, colors, silhouettes, cell positions. Keep the exact 3 column x 2 row atlas layout, each cell square, full image aspect 3:2. No new artwork, characters, text, borders, shadows, rearrangement, or extending bodies. Characters remain clipped at their own cell bottom as in source. Output transparent PNG atlas.”

A edição generativa conserva as identidades visuais, mas não oferece garantia de identidade pixel a pixel com o original. A aprovação artística final permanece um item de playtest. NPC desconhecido ou recurso ausente usa fallback sem retrato. Brasa e Lina preservam seus painéis de serviço na campanha, em vez de serem substituídos por conversa decorativa.

## E. Escolhas e efeitos

Identificadores semânticos: `accept`, `decline`, `defer`; rótulos padrão: Sim, Não, Não sei. Não há comparação de texto para decidir regras. Nós aceitam quantidade arbitrária de opções, próximos nós e ações opcionais.

Sem ação explícita, recusar e adiar só navegam/encerram. Não marcam fracasso, conclusão ou aceitação. A aceitação só chama um efeito quando existe uma ação e um handler externo autorizado. Não há handler de concessão de recompensas ligado à UI de produção.

Uma operação por chave diálogo/NPC/nó/escolha/ação é compartilhada durante cliques repetidos e reabertura do componente. Fechar a apresentação não cancela uma operação de domínio já iniciada; respostas tardias não avançam outra conversa. Operações rejeitadas também permanecem registradas durante a vida do componente para evitar repetição de uma confirmação cujo resultado pode ser incerto. Uma futura integração deverá tratar reconciliação/retry e idempotência durável no domínio/servidor, além de validar a elegibilidade por personagem. O cache da UI não substitui persistência ou autoridade.

As alternativas foram verificadas com dados exclusivos de teste usando um NPC existente, sem registrar quests ou conteúdo fictício no jogo.

## F. Compatibilidade

O diálogo local é registrado por elemento DOM no InterfaceSafety, fecha por transição e impacto confirmado conforme a política central. Fechamento limpa comandos e devolve foco; perda de foco encerra a conversa e respeita a pausa automática preexistente da campanha. Nenhum atalho global novo foi criado. TAB/M não abrem painéis concorrentes durante a conversa.

O modo online reutiliza o mesmo componente e continua usando `canTalk`; nenhum comando, protocolo, regra de combate/recompensa ou agendador de servidor foi alterado. Serviços existentes não foram convertidos em decisões narrativas. Saves reais não foram utilizados nos testes.

## G. Verificação

- Testes novos de domínio: **10/10**, sem falhas/skips.
- Build final aprovado (2,46 s), com o aviso preexistente sobre chunk maior que 500 kB.
- Electron final: **aprovado**, `ok: true`, zero erros em `.logs/iteration242-dialogue-release-1792811452393/report.json`. Inclui escolhas por mouse/teclado, foco devolvido à próxima fala, seis retratos, F local, TAB/M, fallback de imagem, 800×600/reduced-motion, 30 ciclos sem aumento de DOM, blur/segurança, loja, cozinha e conversa online.
- Suíte completa: **718/718 aprovados**, zero falhas, cancelamentos e skips; 221,38 s. Comando: `node --test --test-concurrency=2 tests/*.test.js`. Log: `.logs/iteration27-full.txt`. A última revisão de foco/Esc também foi validada no roteiro Electron final.
- `git diff --check`: aprovado, sem erros de whitespace.

Ocorrências durante desenvolvimento: primeira execução Electron restrita não iniciou o processo e foi repetida com permissão de execução local; primeira rodada visual mostrou regra CSS herdada limitando a largura e arte vizinha na segunda prancha; ambos corrigidos. Confirmação de opção pelo teclado passou a ter tratamento explícito, com devolução de foco após escolhas que avançam a fala e encerramento explícito por Esc. O roteiro de serviços precisou retomar a pausa automática após blur e usar os botões de fechamento dos painéis, sem alterar regras desses serviços.

## H. Desempenho

Mesmo computador Windows, Electron 44.5.1, Three.js 0.186.1, dois processos Electron e servidor temporário local; cliente medido na campanha, outro na cidade online. Produção compilada, viewport aproximado 1282×722 CSS px, escala de captura 1,25. Controle de oclusão do executor existente; 2 s de aquecimento e 20 s por amostra, sem testes concorrentes. Baseline é o `dist` preservado antes desta iteração, não o HEAD antigo do repositório.

| Condição | Quadros | FPS médio | p95 ms | p99 ms | 1% low FPS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Cidade, conversa fechada, antes | 1094 | 54,66 | 30,60 | 33,60 | 27,85 |
| Cidade, conversa fechada, depois | 1078 | 53,87 | 31,10 | 34,40 | 27,86 |
| Depois, conversa aberta com Marta | 1090 | 54,47 | 30,40 | 34,10 | 26,90 |

Antes/depois com conversa fechada: 421 draw calls, 41.652 triângulos, 13 texturas e 245 geometrias nos dois casos. Diferença média de FPS de aproximadamente −1,45%, sem evidência de regressão relevante nesta amostra curta. Não é uma afirmação de equivalência estatística nem previsão do hardware escolar.

A conversa aberta foi medida após posicionar o jogador junto a Marta: 382 calls, 39.748 triângulos, 14 texturas e 249 geometrias. Essa condição tem câmera/conteúdo visível distintos, portanto não representa ganho de otimização do diálogo. O retrato usa imagem DOM, não textura do renderer Three.js.

Heap pontual: antes 22,67 MB; depois fechado 46,20 MB; depois aberto 15,98 MB. Valores sem GC controlado, não comparáveis como memória retida; a queda na amostra subsequente mostra a importância desse limite. A prancha RGBA inteira exige cerca de 6 MiB decodificada, carregada somente na primeira conversa que a utiliza; browser pode conservar cache após fechar. Há uma prancha compartilhada, não seis carregamentos separados. Não foi medido consumo de GPU/compositor nem uma sessão longa de memória nesta iteração.

Arquivos de medição:
- `.logs/iteration242-dialogue-before-1792810746342/report.json`: referência, sem erros.
- `.logs/iteration242-dialogue-final-1792810948166/report.json`: medições após correções; o roteiro prosseguiu até uma falha de fechamento do painel no teste de serviços, posterior às amostras. A validação funcional complementar é registrada separadamente.

Capturas reais finais em `.logs/iteration242-dialogue-release-1792811452393/`: `dialogue-marta.png`, `portrait-*.png`, `dialogue-no-portrait.png`, `dialogue-test-choices.png` (fixture, não quest do jogo), `dialogue-800x600-reduced.png`, `service-weaponsmith.png`, `service-cook.png` e `online-marta.png`. Em desktop, caixa x=24, largura 805,51; retrato x=853,51, altura 404,09 numa tela de 722 px: **55,97%**, com separação horizontal de 24 px. Conteúdo longo e opções aumentaram a caixa até seu limite com rolagem, sem interseção com o retrato.

## I. Limitações e playtest

- Validar preferência artística, leitura em diferentes escalas Windows e conforto dos retratos recortados na base (bustos originais).
- Sem novas quests: integração futura ainda precisa de regras, persistência e autoridade; preparação técnica não significa conteúdo de classes implementado.
- Decisões e ação assíncrona testadas com fixtures; não existe aceitação de nova quest no gameplay.
- Medição curta, sem orçamento garantido para computadores escolares ou teste de memória prolongado.
- Sem commit, push, deploy ou exportação de instalador nesta tarefa.
