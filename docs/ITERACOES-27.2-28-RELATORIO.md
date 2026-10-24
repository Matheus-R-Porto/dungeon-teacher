# Iterações 27.2 + 28 — Relatório de entrega

## A. Iteração 27.2

Etapa concluída e registrada em `ITERACAO-27.2-RELATORIO.md` antes da auditoria/implementação da Etapa B. Retratos a 55vh em desktop, 42vh em telas médias e 23vh em telas estreitas. Em viewport 1282×722, o retrato mediu 264,58×396,88px, com 22px de distância da caixa. Corpo inteiro e proporção natural preservados.

Orientação avaliada individualmente: Serafina frontal e Orin mantidos; Marta, Brasa, Lina e Caio espelhados somente na apresentação. Não há inscrições invertidas nos acessórios. PNGs originais preservados. Caixa, cores, texto, botões, animação de 210ms, Safety e hotbar preservados. 27 testes direcionados passaram; Electron confirmou os seis NPCs reais, navegação, responsividade e fechamento seguro. Aprovação estética humana permanece necessária.

## B. Iteração 28

### Auditoria e catálogo

`ITERACAO-28-CATALOGO.md` contém os 44 IDs reais, nomes, tipos, slots e pilhas. A auditoria consultou `items/inventory.js`, `food.js`, `fishing.js`, `mining.js`, `smithing.js`, `items/loot.js`, `shop.js`, serviços de coleta/produção, `character-save.js`, `rpg-panels.js`, `online-ui.js` e o snapshot de `server/online-tower.js`.

Inventário: 32 espaços. Recursos e consumíveis empilham até 99; equipamentos ocupam uma unidade. Oito slots existentes preservados; calças, colar e talismã ainda não têm peças cadastradas. Aquisição, exclusividade, troca, retirada, bloqueio em combate/atividade e falta de espaço continuam no domínio existente. Nenhum item, estatística, raridade ou preço novo.

### Recursos visuais

Os 44 símbolos antigos foram classificados como B (representação existente inadequada para uma grade visual). Foram criados 32 ícones próprios mais um fallback, totalizando 33 SVGs e 13.951 bytes. SVG é o formato vetorial já utilizado nos ícones da Árvore do Destino, com transparência nativa e leitura em escalas diferentes. Não foi necessária geração de bitmap, imagem externa ou dependência nova. Os símbolos originais permanecem no catálogo para interfaces anteriores.

Armas forjadas usam a silhueta correspondente ao tipo; a qualidade real permanece no nome/descrição, sem inventar raridade visual. Cores e detalhes cosméticos são proposta artística e ainda dependem de aprovação humana. `item-art.json` resolve por ID, separa `inventoryIcon` de `worldSprite` e não cria camadas de personagem. Os recursos procedurais existentes de baús, pesca e minério no mundo foram preservados. `worldSprite:null` indica que não existe um arquivo dedicado para esse papel; não significa ausência de representação no mundo.

Galeria organizada: `ITERACAO-28-GALERIA.html`. Capturas de integração: `ITERACOES-27.2-28-CAPTURAS.html`.

### Interface e operações

Grade com ícones, nomes, pilhas, seleção, tooltip acessível, espaços vazios, rolagem e navegação por setas/Home/End. Painel separado dos oito equipamentos, detalhes do item e comparação opcional de estatísticas lado a lado. Verde-escuro, bronze e dourado seguem os diálogos existentes. Telas de 1280×720, 800×600 e 480×720 verificadas. Em telas estreitas, as seções ficam empilhadas e roláveis.

Equipar/desequipar usam `Inventory.equip/unequip` através da transação já existente de `RpgPanels`; comer e abrir baús conservam seus serviços. Sem venda, descarte ou transferência novos. A apresentação não salva metadados visuais no personagem e não altera o formato dos saves. O teste de recarga do Electron confirmou inventário/equipamentos persistidos no perfil temporário. A migração antiga de inventário e a proteção existente contra conversão automática de saves antigos permanecem intactas.

Online compartilha catálogo, ícones, grade, seleção e detalhes. Mantém a abertura de baú enviada ao servidor. O protocolo atual não transmite `equipment` no perfil nem possui comando de troca: a interface informa essa limitação e não simula equipamento autoritativo no cliente. Protocolo e servidor não foram alterados nesta solicitação.

### Arquivos desta etapa

- `src/ui/inventory-presentation.js`: referências, rótulos, fatos e comparação a partir do domínio.
- `src/ui/inventory-view.js` e `.css`: componente de apresentação, eventos delegados, foco, tooltip, responsividade.
- `src/ui/item-art.json` e `public/assets/items/inventory-v28/`: mapa por ID e 33 imagens vetoriais.
- `src/main.js`: carregamento do CSS na entrada do jogo, mantendo os módulos de apresentação importáveis por testes Node.
- `src/ui/rpg-panels.js`, `src/multiplayer/online-ui.js`: integração com operações e snapshots existentes.
- `scripts/iteration28-art.mjs`: origem reproduzível dos vetores e catálogo.
- `scripts/iteration28-electron.mjs`, `iteration28-scenario.mjs`, `tests/iteration28.test.js`: verificações.

### Desempenho

Windows x64, Node 24.19.0, Electron 44.5.1 e Three.js 0.186.1. Mesma cena de cidade, build de produção, dois processos Electron com perfis temporários e oclusão desativada. Medições de inventário vazio com aproximadamente 20s, antes e depois; executadas sem a suíte concorrente. Amostras curtas, sem controle completo do sistema operacional ou do GC; não são uma medição dos computadores da escola.

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| Quadros | 990 | 929 |
| FPS médio | 49,46 | 46,69 |
| Frametime p95 | 33,4ms | 33,7ms |
| Frametime p99 | 36,9ms | 39,3ms |
| 1% low estimado | 22,71 | 18,57 |
| Draw calls | 421 | 421 |
| Triângulos | 41.652 | 41.652 |
| Texturas / geometrias Three.js | 13 / 245 | 13 / 245 |
| Nós DOM totais | 728 | 717 |
| Heap observado, GC não controlado | 26,57MB | 35,35MB |

FPS médio 5,6% menor nessa amostra, com cauda de frametime pior. Não há evidência suficiente para atribuir a diferença à interface ou declarar melhoria gráfica. Contadores Three.js não incluem o custo do compositor DOM nem a memória das imagens do navegador. Na comparação de inventário vazio, não houve textura WebGL adicional. Os novos ícones são elementos DOM e não são enviados ao renderizador Three.js. O componente atualiza somente quando dados, seleção ou estado mudam; os ciclos de abrir/fechar sem mudanças reutilizam o DOM. Imagens pequenas são carregadas sob demanda/cache. O teste funcional confirmou 20 ciclos sem crescimento do DOM; heap sem GC controlado passou de 22,37 para 28,30MB, o que isoladamente não comprova vazamento.

Medição complementar final: `.logs/iteration242-inventory28-full-perf-1792816398406/report.json`, no build após mover a importação de CSS. Inventário vazio: 953 quadros / 19,94s, 47,79 FPS, p95 33,1ms, p99 37,8ms, 1% low 24,70. Mochila cheia: **1.979 quadros / 40,01s, 49,46 FPS, p95 32,8ms, p99 35,8ms, 1% low 25,39**. Draw calls 421, triângulos 41.652 e geometrias 245. Texturas subiram de 13 para 14 neste cenário; a fixture também equipa uma espada e o renderizador existente troca o atlas do personagem por tipo de arma (`scene.js` / `sprite-actor.js`). Isso é consistente com esse caminho existente, não com os SVGs DOM, mas os cenários vazio/cheio não isolam perfeitamente essa variável. Não se atribui ganho à mochila cheia.

Após três lotes de 20 aberturas/fechamentos da mochila cheia, com coleta de lixo via CDP ao final de cada lote: heap JS **10.831.608 → 10.855.964 → 10.858.212 bytes**, DOM **770 → 770 → 770**. Variação de cerca de 27KB, com estabilização no último lote; nenhum crescimento relevante demonstrado nessa amostra. Isso não garante ausência de vazamentos em sessões longas. O ensaio final terminou sem erros. Não há evidência de regressão gráfica relevante causada pelos ícones; a oscilação entre amostras impede conclusões de otimização.

### Evidências e limitações

Capturas reais e relatório Electron final em `.logs/iteration242-inventory28-final-1792815803477/`. Incluem vazio, cheio, grade rolada, equipamentos, seleção, comparação, tooltip, duas resoluções menores e online. Os itens foram preparados exclusivamente em perfis de teste usando o catálogo real; não são progresso natural de uma campanha nem mockups.

15 testes novos cobrem apresentação, pilhas, seleção, tooltip, referências, fallback, integridade SVG, slots, troca, rejeição, retirada, ausência de duplicação, comparação, persistência, migração e limites online. Electron adicionalmente verificou carregamento das 44 referências, transparência renderizada, fallback por erro, teclado, conflito com hotbar/árvore/mapa/diálogo, Safety por impacto/transição, DOM estável e recarga persistida. Uma primeira execução Electron falhou por fixture de diálogo sem `npcId`; o dado de teste foi corrigido, e a execução final passou. A primeira suíte completa teve 732 testes aprovados e um arquivo de testes impedido de carregar por importação de CSS no Node (733 resultados). A importação foi movida para `src/main.js`; os 25 testes direcionados de inventário/segurança passaram, e a suíte completa foi repetida.

## C. Validação final

Suíte completa final: **742/742 aprovados**, zero falhas, cancelamentos, skips e TODOs; 186,70s. Evidência: `.logs/iteration28-full-final.txt`. Build aprovado, mantendo o aviso preexistente de chunk acima de 500KB (bundle principal 1.003,67KB / 287,18KB gzip). Electron funcional aprovado (18 verificações registradas, mais carregamento de 44 referências e transparência), zero erros registrados; ensaio complementar no build final também aprovado. Captura da mochila cheia no build final inspecionada visualmente. Nenhum commit, push, deploy ou alteração de save real.

Ainda cabe playtest humano de legibilidade, preferência artística dos retratos/itens e fluidez nos computadores alvo. Camadas visuais, classes, Vanish e novas animações não foram implementados. A preparação futura limita-se à organização dos IDs e dos recursos visuais.
