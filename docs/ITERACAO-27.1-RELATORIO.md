# Iteração 27.1 — Corpo inteiro, composição dos diálogos e hotbar

## A. Auditoria inicial

A Iteração 27 permanece como base: `src/ui/npc-dialog.js` é o componente comum offline/online; `src/domain/dialogue-state.js` mantém conteúdo, páginas, escolhas semânticas e efeitos separados. Não houve reconstrução desses módulos; somente uma rolagem pontual após carregar a imagem mantém a opção focada visível em conteúdo longo.

A campanha abre o componente em `src/main.js` depois da revalidação de interação; o online usa `canTalk` em `src/multiplayer/world-mode.js`. O diálogo está registrado no InterfaceSafety nos dois modos. Concluir/Fechar/Escape encerram o estado; blur encerra a conversa; segurança fecha em transição e impacto confirmado em área perigosa. A política de pausa da campanha e o mundo online ativo foram preservados.

A hotbar fica em `AbilityHud`, elemento `#ability-bar`, com oito slots; a Árvore do Destino move o mesmo elemento para seu painel durante a edição. O bloqueio de teclas já consultava `isBlocked`, mas os eventos de arraste exigiam proteção adicional para uma hotbar oculta.

As duas pranchas existentes foram inspecionadas: `townsfolk.png` é RGB 1536×1024; `townsfolk-transparent-v27.png` é RGBA 1536×1024. Ambas possuem seis células quadradas de 512×512. Foram mantidas intactas. As cores bronze/dourado, o fundo escuro verde e a hierarquia tipográfica da HUD existente orientaram o refinamento.

## B. Refinamento visual

- Composição inferior com grupo centralizado e leve compensação pela presença do retrato à direita; a caixa deixou a margem esquerda.
- Moldura dupla em bronze, cantos ornamentais discretos, camadas internas, fundo escuro, nome destacado e botões com hover/foco visíveis.
- Altura dinâmica, mínimo confortável e máximo com rolagem; sem animação contínua ou transição de altura por frame.
- Retratos de corpo inteiro a **46vh** em desktop, limitados a 480 px; 42vh até 900 px de largura; composição alternativa com retrato acima/à direita da caixa em telas até 600 px.
- Proporção natural derivada da imagem. Os seis PNGs são verticais 2:3, sem compressão em células quadradas.
- Animação de entrada preservada em 210 ms, com deslocamento reduzido a 14 px; removida com `prefers-reduced-motion`.
- Falta de retrato/falha de carregamento mantém a caixa central, sem arte substituta inventada.

Medição real em viewport 1282×722 CSS px:

| Elemento | Iteração 27 | Iteração 27.1 |
| --- | ---: | ---: |
| Caixa: posição x | 24 px | 162,40 px |
| Caixa: largura | 805,51 px | 796,73 px |
| Caixa: altura, texto curto | 227,57 px | 239,38 px |
| Retrato: altura | 404,09 px / 56% | 331,93 px / 46% |
| Retrato: largura da imagem | 404,09 px | 221,28 px |
| Separação caixa/retrato | 24 px | 22 px |
| Hotbar durante conversa | Visível | Ausente do layout e da interação |

## C. Retratos

Seis arquivos individuais produzidos pela ferramenta embutida imagegen, com a prancha original como referência de edição/extensão. Cada arquivo tem 1024×1536 pixels, RGBA, fundo transparente e personagem completo. Carregamento somente quando solicitado pelo diálogo, sem pré-carregamento dos seis.

| NPC | Arquivo em `public/assets/portraits/` | Extensão visual |
| --- | --- | --- |
| Serafina | `serafina-full-v271.png` | Vestido branco/dourado completo, asas, halo e sapatos |
| Marta | `marta-full-v271.png` | Vestido bordô, cinto, botas, chaves e livro |
| Brasa | `brasa-full-v271.png` | Avental de couro, calças de trabalho, botas, ferramentas e martelo |
| Lina | `lina-full-v271.png` | Vestido verde, avental completo, sapatos, tigela e colher |
| Orin | `orin-full-v271.png` | Túnica roxa completa, botas, chapéu/estrela e dois frascos |
| Caio | `caio-full-v271.png` | Calças e botas de viagem, mochila, bússola e lenço azul-esverdeado |

`npc-portraits.js` continua resolvendo identificadores estáveis, incluindo `weaponsmith` → Brasa. NPC desconhecido retorna ausência de retrato. As pranchas antigas continuam disponíveis, inclusive nos cabeçalhos dos serviços locais, que não foram substituídos por conversas decorativas.

## D. Fidelidade artística e limites

Os rostos, penteados, tons de pele, paletas, roupas visíveis e objetos foram usados como referência explícita em cada chamada. As extensões conservaram identidades reconhecíveis e completaram as partes inferiores de modo coerente. A inspeção visual encontrou corpo inteiro, dois pés visíveis, acessórios íntegros e ausência de fragmentos vizinhos nos seis resultados.

Isso não é identidade pixel a pixel: houve redesenho generativo de detalhes, inclusive pequenas diferenças de expressão facial, dedos, bordados e proporções. As roupas e calçados antes invisíveis são propostas novas autorizadas para esta extensão. **A aprovação artística final pertence ao responsável pelo projeto e não foi presumida.**

As margens verticais dos PNGs são estreitas em alguns casos (mínimo de 3 px acima de Lina); nenhum pixel opaco encosta na borda e os enquadramentos no jogo preservaram cabeça, chapéus, objetos e pés. A margem inferior da composição na tela permanece separada do limite da janela. Caso a avaliação artística peça mais respiro nos arquivos, é um refinamento possível, não uma alegação de arte perfeita.

Prompts completos, identificação de cada NPC e saída original da ferramenta: `docs/iteration271-image-prompts.json`. Skill utilizada: `C:/Users/theuz/.codex/skills/.system/imagegen/SKILL.md`, modo embutido. Nenhuma imagem externa ou NPC novo foi utilizado.

## E. Hotbar

Uma única regra deriva a supressão do estado real do DOM:

`body:has(.npc-dialog[open]) #ability-bar { display: none !important; }`

A hotbar não ocupa espaço, não pode receber foco ou clique físico e não fica apenas transparente/atrás do painel. Ao fechar ou remover o diálogo, essa condição deixa de valer naturalmente. Não existe restauração forçada de `display`, `hidden` ou configuração persistida: uma regra independente que já escondia a hotbar continua valendo. Funciona também com mais de um diálogo e com o elemento movido pela Árvore do Destino.

`AbilityHud.presentationHidden` verifica `hidden`, `inert` e ausência de retângulos renderizados. Um guard de captura cancela clique, pointerdown, dragstart, dragover, drop e contextmenu se a hotbar estiver oculta, incluindo arrastes antigos ou eventos sintéticos. As teclas 1–8 também consultam esse estado, além de `isBlocked`. O carregamento de retrato chama `scrollIntoView` uma única vez para o botão focado, evitando corte visual da opção após a recomposição de texto longo; não existe loop de rolagem.

Os listeners pertencem ao AbortController existente e não criam observadores ou loops novos.

Dados, ordem e quantidade dos oito atalhos permanecem inalterados. InterfaceSafety, TAB, M e os handlers de conversa não foram substituídos. A regra é específica de conversas NPC; loja, cozinha e demais serviços preservam suas apresentações e políticas próprias.

## F. Arquivos desta iteração

| Arquivo | Responsabilidade |
| --- | --- |
| `src/ui/npc-dialog.css` | Composição, moldura, escala, responsividade e supressão derivada da hotbar |
| `src/ui/npc-dialog.js` | Mantém o botão focado visível após a imagem mudar a distribuição do texto, com uma rolagem pontual |
| `src/ui/npc-portraits.js` | Referências individuais por NPC |
| `src/ui/ability-hud.js` | Bloqueio seguro dos eventos de uma hotbar oculta |
| `public/assets/portraits/*-full-v271.png` | Seis retratos individuais novos; originais preservados |
| `tests/iteration271.test.js` | Oito testes de recursos, dimensões, alpha e referências |
| `tests/helpers/portrait-png.js` | Inspeção somente de leitura de pixels RGBA para os testes |
| `scripts/iteration271-electron.mjs` | Executor Electron existente reutilizado |
| `scripts/iteration271-scenario.mjs` | Comparação, layout, hotbar, serviços, controles e NPCs online |
| `docs/iteration271-image-prompts.json` | Prompts e rastreabilidade |
| `docs/ITERACAO-27.1-COMPARACAO.html` | Comparação visual dos originais, extensões e aplicação real |
| `docs/ITERACAO-27.1-RELATORIO.md` | Relatório final |

Não houve alteração do modelo de diálogos, regras de escolhas, persistência, progressão, recompensas, economia, combate ou protocolo multiplayer. Alterações anteriores do checkout foram preservadas; `sources/` permaneceu somente leitura.

## G. Testes e validação

- Testes direcionados de Iteração 25/27/27.1: **26/26 aprovados**, zero falhas/skips.
- Build final aprovado em **3,57 s**. Aviso preexistente de chunk maior que 500 kB permanece.
- Electron após mudanças: `.logs/iteration242-dialogue271-after-1792812809966/report.json`, `ok: true`, zero erros.
- Electron complementar final: `.logs/iteration242-dialogue271-final-1792813512421/report.json`, `ok: true`, zero erros; acrescenta todas as seis conversas online reais e espionagem do método de solicitação para confirmar que nenhum slot oculto sequer pede uma habilidade.
- Suíte completa: **726/726 aprovados**, zero falhas, cancelamentos ou skips; **193,32 s**. Comando: `node --test --test-concurrency=2 tests/*.test.js`; log `.logs/iteration271-full.txt`.
- `git diff --check` dos arquivos alterados nesta iteração: sem erros.

Cobertura Electron: F local; seis retratos; fallback ausente e imagem quebrada; próxima fala e conclusão; aceitar/recusar/adiar com fixtures sem nova quest; mouse e teclado; foco entre decisões e páginas; TAB/M bloqueados durante conversa; Concluir/Fechar/Escape; impacto confirmado de dano zero; fechamento de transição pelo InterfaceSafety; blur; descarte; 30 ciclos com DOM estável; oito slots preservados; hotbar previamente `hidden`; outra regra CSS de ocultação; loja e cozinha; conversas online com textos preservados e hotbar restaurada.

Após a última correção de foco/rolagem: testes direcionados **18/18**, build e roteiro Electron final aprovados. A suíte completa acima cobre a lógica preservada; o ajuste final é específico de apresentação e foi verificado também por limite geométrico da opção focada.

O fixture de falha de imagem usa cópia da referência do retrato para não contaminar as capturas seguintes; a rodada final confirmou retrato carregado também no texto longo com opções.

A transição/impacto é injetada pela API central de segurança no roteiro dirigido; não foi repetida uma expedição completa. Comércio e cozinha foram abertos pelos caminhos reais de interação. Não foram executadas novas transações econômicas nem testes manuais humanos. A captura com alternativas usa apenas dados de teste, não uma quest adicionada ao jogo.

Resolucões verificadas: desktop padrão, 1280×720, 800×600 com redução de movimento e 480×720. A captura desktop usa escala de pixels de aproximadamente 1,25. O jogo não oferece ajuste geral de escala da HUD; não foi inventado um controle novo nem alegado teste de todas as escalas do Windows.

## H. Desempenho e recursos

Mesmo executor de produção, máquina Windows, Electron 44.5.1 e Three.js 0.186.1; dois processos Electron, um na campanha e outro online em servidor temporário. Aquecimento de 2 s, amostras de 20 s, mesma sequência de posicionamento/câmera e qualidade. A suíte completa foi iniciada após os benchmarks. Execuções não são controle de carga do sistema operacional/GPU.

| Condição | Quadros | FPS médio | p95 ms | p99 ms | 1% low FPS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Antes · conversa fechada | 962 | 48,08 | 32,40 | 36,90 | 23,09 |
| Depois · conversa fechada | 1036 | 51,79 | 31,30 | 35,10 | 27,14 |
| Antes · conversa aberta | 970 | 48,44 | 32,90 | 36,90 | 24,03 |
| Depois · conversa aberta | 1061 | 53,01 | 30,70 | 34,20 | 27,85 |

**Não atribuir a diferença a uma otimização gráfica.** A cena fechada também variou, e estas amostras curtas não isolam ruído do sistema. Não apareceu regressão relevante nas condições observadas; isso não garante um orçamento de FPS em computadores escolares.

Cena fechada antes/depois: **421 calls, 41.652 triângulos, 13 texturas, 245 geometrias**. Conversa aberta: antes 381 calls/39.548 triângulos, depois 382/39.748; 14 texturas e 249 geometrias em ambos. Há variação de conteúdo vivo/visibilidade na cidade. A mudança DOM não adiciona texturas, geometrias ou shaders Three.js. Não comparar a cena fechada com a aberta como se fossem a mesma câmera: o jogador é posicionado perto de Marta para conversar.

Os seis PNGs somam aproximadamente **13,08 MB em disco**. Cada um decodifica para 6 MiB RGBA; somente o retrato solicitado é carregado, mas o cache do navegador pode reter recursos já visitados. A prancha anterior também decodificava 6 MiB de uma vez. Aumento do pacote é o principal custo explícito desta arte. Não se afirma que o cache de seis retratos usa só 6 MiB.

Primeira troca observada por NPC, incluindo CDP, carga, atualização e polling de prontidão: aproximadamente **188–495 ms**. Não são tempos puros de decodificação. Resource Timing não retornou entradas para essas imagens no protocolo `dungeon://`; essa medição específica ficou indisponível. Animação só começa quando o retrato fica disponível.

Heap antes/depois de 30 ciclos: **18,08 → 14,83 MB**, sem crescimento de DOM. Heap pontual na cena fechada antes/depois: 17,73/26,61 MB; cena aberta: 33,80/15,26 MB. Sem GC controlado, esses números não representam memória retida nem provam ausência de vazamentos de longo prazo. GPU/compositor e memória após horas de uso não foram medidos.

Referência: `.logs/iteration242-dialogue271-before-1792812293768/report.json`. Depois: `.logs/iteration242-dialogue271-after-1792812809966/report.json`.

## I. Capturas e comparação

Abra `docs/ITERACAO-27.1-COMPARACAO.html`: cada NPC tem original recortado por CSS, PNG estendido sobre quadriculado de transparência e captura real online, além da distribuição antes/depois. Não se usam imagens conceituais como prova de integração.

Pasta final: `.logs/iteration242-dialogue271-final-1792813512421/`.

- Seis interações online reais: `online-reset-angel.png`, `online-warehouse.png`, `online-blacksmith.png`, `online-cook.png`, `online-potion-mage.png`, `online-tower-guide.png`.
- Campanha: `dialogue-marta.png`, `hotbar-restored.png`, `service-weaponsmith.png`, `service-cook.png`.
- Layouts: `dialogue-1280x720.png`, `dialogue-800x600-reduced.png`, `dialogue-480x720.png`.
- Conteúdo: `dialogue-no-portrait.png`, `dialogue-test-choices.png`.
- `portrait-*.png`: composição de cada retrato na campanha por fixture do componente; para Brasa/Lina isso não substitui seus serviços offline. As imagens `online-*.png` comprovam os caminhos reais de conversa desses seis NPCs.

## J. Pendências e limites

- Avaliação humana das faces, proporções, roupas inferiores e conforto da composição. Extensões entregues como propostas integradas, sem aprovação artística final presumida.
- Margens estreitas dos arquivos e variações generativas pequenas estão documentadas; originais continuam disponíveis.
- Testes curtos não substituem playtest prolongado em hardware escolar nem todas as combinações de escala Windows.
- Sem novas quests, classes, sistemas educacionais, economia, protocolo, commit, push, deploy ou alteração de saves reais.
