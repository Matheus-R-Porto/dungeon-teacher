# Dungeon Master — Iteração 15 · Smithing (experimental)

Beta 0.1.5 · Windows x64 · 09/10/2026 · identificada como **Smithing experimental — baseada na Iteração 14 ainda não validada por playtest.**

> **Atualização (09/10/2026, depois da entrega):** o responsável testou a Iteração 14 manualmente e informou que ela funciona como previsto, inclusive a alternância aleatória de biomas, ficando **aprovada**. Esta Iteração 15 (Smithing) **continua sem playtest manual**; nada aqui foi jogado à mão por uma pessoa.
>
> *Registro da entrega:* na época a Iteração 14 ainda não tinha playtest manual. Os 452 testes dela e as verificações assistidas eram só evidência técnica, e esta entrega não a aprovava.

## 1. Estado inicial do Git

Lido antes de qualquer edição, somente com comandos de leitura:

- Branch `master`, HEAD `be785d5` ("Iteracao 13: mineracao…"), ou seja, a Iteração 13 **está** commitada.
- A Iteração 14 estava como **24 arquivos modificados e 6 não rastreados**, sem commit (como informado). Nenhum stash, um único worktree.
- Ignorados: `dist/`, `node_modules/`, `release/` (6,1 GB de builds), `server/node_modules/`.
- Foi gravado um manifesto SHA-256 dos 249 arquivos rastreados e não rastreados, mais HEAD, status e stash, fora do projeto (para a prova da seção 2).
- Nenhum comando proibido foi executado. Não houve `reset`, `clean`, `checkout --`, `restore`, `stash`, push, commit nem merge.

## 2. A Iteração 14 original foi preservada

Prova feita **depois** do trabalho, comparando com o manifesto de antes: os **249 arquivos têm exatamente os mesmos hashes**; HEAD, branch, `git status` (30 entradas) e stash são idênticos; nada foi adicionado nem removido. A release `release/tower-progression-playtest/` da Beta 0.1.4 também está intacta: os quatro arquivos conferem com o SHA-256 do `ARTEFATOS.txt` entregue com ela. Nenhum comando de escrita foi dirigido à árvore original.

## 3. Localização da cópia isolada

`C:\Users\theuz\.codex\dungeon-master-iter15-smithing` (cópia física, irmã e **fora** do projeto original). Um worktree foi descartado de propósito: ele não carregaria as alterações não commitadas da Iteração 14.

- Copiados: todo o código-fonte e documentos, as 30 alterações da Iteração 14, `.git` completo (repositório independente), `node_modules` e `server/node_modules`.
- Não copiados: `release/` (builds) e `dist/` (reconstruído).
- Incidente corrigido: o primeiro robocopy excluía pastas chamadas `dist` em qualquer nível, inclusive `node_modules/electron/dist`. O `node_modules` foi recopiado sem exclusões.
- Integridade verificada antes de editar: 249 hashes idênticos, mesmo HEAD, mesmo status, e `node_modules`/`.git` com a mesma contagem de arquivos e bytes (8987 arquivos, 530.792.668 bytes).

## 4. Estado dos commits

Nenhum commit foi feito, na original ou na cópia. Na cópia, `master` continua em `be785d5` com a Iteração 14 **e** a Iteração 15 como alterações não commitadas, misturadas no diretório de trabalho (a separação para commits ficará com o responsável). A Iteração 14 original continua sem commit na árvore original.

## 5. Auditoria dos sistemas existentes

- O dano da arma é um bônus `stats.physicalAttack` (ou `magicAttack`, no cajado) que `equipmentStats` soma a partir da **definição** do item; o combate usa `physicalAttack − defesa` com variação de ±8%. Não existe dado por instância.
- As armas do Armeiro são `unique: true` (uma por personagem), as quatro categorias (espada, adaga, arco, cajado) têm combate completo e os itens do inventário são `{instanceId, definitionId, quantity}`.
- Profissões usam `lifeXPRequired` (30 + 20 por nível). XP existente: Pesca 6–16, Culinária 12–30, Mineração 8/12.
- Cooking é o molde para a estação: diálogo modal, serviço com transação atômica (`transact`, rascunho do personagem, um `save`).
- O painel Life Skills é o `FishingHud`; o Armeiro lista `type: weapon|tool`.
- Linha de base da cópia: 451/452. A única falha era o teste de CSP do desktop, que lê `dist/index.html` (que a cópia não trazia). Gerei `dist/` com `npm run build` e os testes de multiplayer passaram (27/27), ou seja, 452/452 equivalentes. O bundle gerado é idêntico ao da release 0.1.4 (`index-DeVf-kvf.js`), o que confirma que a cópia equivale à Iteração 14.

## 6. Arquitetura de Smithing

- `src/domain/smithing.js`: dados puros (qualidades, receitas, configuração do minigame, maestria).
- `src/domain/smithing-service.js`: a máquina de fabricação e a transação.
- `src/domain/items/inventory.js`: as armas forjadas, geradas a partir dos dados.
- `src/ui/forge-panel.js`: diálogo da Forja.
- Estação, fiação e visual em `areas.js`, `scene.js`, `main.js`.

**Decisão de modelo:** uma definição de item por receita e qualidade (12 itens com IDs estáveis, por exemplo `forgedSwordGood`), em vez de um campo de qualidade por instância. A especificação aceita "identificador estável da variante". Assim equipar, o combate, o save e a validação do inventário funcionam sem mudanças, e a qualidade nunca se perde.

**Adaptação à especificação:** a receita traz `outputs` por qualidade em vez de um único `outputItemId`.

## 7. Estação de Forja

Uma bigorna com brasas brilhantes ao lado do caminho entre o Armeiro e o portal (obstáculo circular `forge` mais interação `forge`, rótulo flutuante "Forja · F"). O Armeiro não foi alterado. Verificado por teste e no app: nenhum objeto a menos de 0,4 da estação, os quatro lados são alcançáveis, e a seleção de interação escolhe a Forja junto a ela e o Armeiro junto a ele. Nenhum NPC novo. A Forja só abre no Refúgio e fora de combate; morto ou fora do Refúgio, é recusada.

## 8. Receitas

Uma por categoria que o combate suporta (as quatro). Dados com IDs estáveis (`forged-sword`, `forged-dagger`, `forged-bow`, `forged-staff`).

| Receita | Minério Bruto | XP FALHA / BOM / PERFEITO |
|---|---:|---|
| Espada Forjada | 3 | 3 / 8 / 12 |
| Adaga Forjada | 2 | 2 / 6 / 9 |
| Arco Forjado | 3 | 3 / 8 / 12 |
| Cajado Forjado | 3 | 3 / 8 / 12 |

Sem ouro e sem outros materiais. A lista `materials` aceita no futuro barras e componentes, mas nada além de `rawOre` existe agora. Custos e XP são valores iniciais meus, não playtestados.

## 9. Minigame

Tempo de simulação (`update(dt)`), nunca quadros nem relógio de parede, e idêntico a 30, 60 e 144 FPS (testado). Fases: aquecimento de 0,8 s e **três marteladas**. Em cada uma um indicador cruza a barra (1,4 s, 1,2 s, 1,0 s, cada vez mais rápido) e F ou Espaço deve cair na zona brilhante: **preciso** (±5%, 2 pontos), **aceitável** (±13%, 1 ponto) ou **errado** (0). O alvo de cada martelo é sorteado de forma reproduzível por personagem, receita e prática. Um martelo não usado conta como errado, então a tentativa nunca trava. Duração máxima: cerca de 5,6 s.

**Ponto de comprometimento:** o primeiro martelo abrir. Até lá, fechar, Esc, cancelar ou trocar de receita não custam nada nem registram nada. Depois, o botão de cancelar fica inativo, Esc é ignorado e a tentativa **sempre** chega a um resultado.

## 10. FALHA, BOM e PERFEITO

Pontuação de 0 a 6: 5 ou mais é **PERFEITO**, 3 ou 4 é **BOM**, abaixo de 3 é **FALHA** (limites testados nas bordas). Toda tentativa concluída gasta todo o minério, entrega exatamente uma arma, concede Smithing XP e conta como prática. Não existe resultado que destrua o minério sem produzir arma nem que devolva material.

## 11. Dano de cada qualidade

Cada arma forjada copia a equivalente do Armeiro (alcance, entrega, velocidade e todo outro stat) e muda só o stat de dano: **−1 / +1 / +2**.

| Categoria | FALHA | Armeiro | BOM | PERFEITO |
|---|---:|---:|---:|---:|
| Espada (ataque físico) | 4 | 5 | 6 | 7 |
| Adaga (ataque físico) | 2 | 3 | 4 | 5 |
| Arco (ataque físico) | 3 | 4 | 5 | 6 |
| Cajado (ataque mágico) | 5 | 6 | 7 | 8 |

Ordem FALHA < Armeiro < BOM < PERFEITO vale nas quatro categorias. A adaga forjada mantém a velocidade 0,65 da do Armeiro. Testado: equipada, a arma muda só o stat de dano do personagem (todos os demais stats e atributos ficam iguais); `resolveAttack` e o combate real respeitam a ordem; o auto-ataque no app causou 19 e 20 de dano com ataque 24,5 e defesa 4, dentro do esperado.

## 12. Consumo de minério

`prepare` roda sobre uma **cópia** do personagem: valida a quantidade, remove o minério, confere espaço na mochila, cria a arma, soma XP e prática. Só então há **um** `save` e a troca. Falha em qualquer ponto (minério, mochila cheia, falha de gravação) não altera nada, não conta prática e devolve uma mensagem "Nada foi consumido" (testado). Uma pilha de minério esvaziada libera o próprio slot para a arma. `rawOre` não foi alterado.

## 13. Smithing XP e Level

Profissão independente (Ferraria no painel Life Skills), na mesma curva das demais. XP em todos os resultados, ordenado FALHA < BOM < PERFEITO em todas as receitas. Subir de nível exibe "FERRARIA NÍVEL N". Não toca em Combat, Pesca, Culinária nem Mineração (testado nos dois sentidos).

## 14. Maestria por receita

`character.smithingMastery = { "forged-sword": { attempts: n } }`. Conta toda tentativa **concluída**, de qualquer qualidade, por receita; não conta abrir, selecionar, cancelar, tentativa sem minério ou falha técnica. Só registra prática: sem limiares, sem automação. Validação estrita (receita desconhecida, valores negativos ou não inteiros são rejeitados).

## 15. Integração com o inventário

As armas forjadas aparecem com nome e qualidade ("Espada Forjada — Inferior", "Espada Forjada", "Espada Forjada — Superior"), dano e descrição. Não são únicas: várias qualidades coexistem, equipam, desequipam e persistem. Não aparecem na loja do Armeiro nem podem ser "adquiridas" de graça por manipulação da interface. A migração de saves legados (que escolhe a arma pelo tipo) passou a ignorar itens forjados. `refinementLevel` não foi adicionado.

## 16. Integração com o combate

Uma arma forjada libera a entrada na Torre como qualquer outra e o combate usa seu dano (testes e app). Biomas, FloorGraph, portões, boss, progressão, reentrada, Mining e Explorar biomas não foram alterados.

## 17. Compatibilidade de saves

Sem mudança de esquema nem de appId. Campos novos aditivos: `lifeSkills.smithing` e `smithingMastery`. Save sem eles carrega com Ferraria nível 1/0 XP e prática vazia, sem perder ouro, inventário, equipamento, Pesca, Culinária, Mineração, progresso da Torre nem recompensa única (testado). Dados inválidos são rejeitados. Nenhum perfil real foi tocado: os testes em Node usam objetos em memória e o app foi validado com um perfil temporário próprio.

## 18. Testes novos

`tests/iteration15.test.js`, **38 testes**: catálogo de receitas e IDs estáveis; falta de minério; consumo correto; FALHA, BOM e PERFEITO (uma arma, XP, prática); limites de nota; todas as receitas e qualidades; sem duplicação por múltiplos inputs; entrada ignorada fora da janela; cancelamento sem custo; comprometimento; timeout vira FALHA; tentativas simultâneas bloqueadas; falha de gravação sem efeito; snapshot consistente; mochila cheia; contexto recusado; ordem de dano nas quatro categorias; qualidade só no dano; stats do personagem equipado; combate (função e sessão real); coexistência, equipar e recarga; Armeiro intacto; XP independente e ordenado; níveis e limiares; prática por receita; barra reproduzível; independência de FPS (30/60/144); saves antigo, novo e inválido; estação alcançável e sem bloqueios; arma forjada na Torre.

## 19. Testes de regressão

Referência na cópia: 452. Agora: **490 aprovados, 0 falhas, 0 ignorados** (94 s). [Log](ITERACAO-15-TESTES.txt). Cinco testes antigos foram **atualizados, não removidos**, porque a especificação mudou (Ferraria deixou de ser a profissão "inativa" e o formato das profissões ganhou um campo): `iteration06-rpg` (os "quatro itens grátis da loja" não incluem armas forjadas), `iteration10` (2), `iteration11` (1) e `iteration13` (1). Combat, IA, inventário, equipamento, Fishing, Cooking, Mining, Tower Progression, biomas, saves e multiplayer passam.

## 20. Validação visual realizada

Executei o **Electron do projeto fora de tela**, com renderização WebGL real e perfil temporário, contra o servidor de desenvolvimento **da cópia** (porta 5174, parado ao final; o painel de preview usaria o projeto original). Um gancho de debug temporário só lia estado e teleportava; foi removido, e o bundle empacotado não o contém (conferido).

**22 verificações aprovadas:** Ferraria no painel de profissões; F junto à Forja abre o diálogo; com 2 minérios a espada (3) não inicia e informa o motivo, e a adaga (2) inicia; tabela "FALHA 2 · Armeiro 3 · BOM 4 · PERFEITO 5"; fechar durante o aquecimento não gasta nada; **FALHA** (arma inferior, 17 minérios, +3 XP, prática 1); **BOM** (+8 XP, dano 6); **PERFEITO** (+12 XP, dano 7); cartões de resultado com arma, qualidade, dano, minério, XP e prática; outros atributos intactos; prática por receita; inventário com a arma forjada; equipar; entrar na Torre; um auto-ataque com o dano esperado; voltar ao Refúgio com a arma equipada; banco de dados com XP, prática, armas e minério; e, após recarregar a página, tudo de volta.

**Bug real achado nessa validação e corrigido:** os botões "Iniciar", "Martelar", "Cancelar" e "Fabricar outra" não tinham valor no `data-*`, então `dataset.x` era uma string vazia e **o clique nunca fazia nada**. Os 38 testes não pegam isso, porque a interface não roda em Node. Corrigido (`'start' in dataset`).

**Não feito:** nenhum playtest humano; combate e caminhada completos à mão (usei teleporte, `select` e auto-ataque de um inimigo); instalador, janela nativa do Electron instalada, Portable, fechar/reabrir o executável; multiplayer em duas máquinas; as demais receitas na tela (espada validada, as outras só em testes); e o jogo rodou a ~4 quadros por segundo em renderização por software, então nada de desempenho foi medido.

## 21. Limitações conhecidas

- Custos, XP, tamanhos das zonas e deltas de dano são valores iniciais **sem playtest**.
- Oferta de minério: 3 veios por andar de Caverna, 1 minério por veio, contra 2 a 3 por arma: forjar é lento.
- Sem automação por maestria, barras, ligas, componentes ou refinamento (como pedido). Sem comércio.
- A FALHA nunca devolve material e sempre entrega uma arma pior, por especificação; a arma "inferior" fica perto da do Armeiro (−1).
- Arte provisória (anel e bigorna em primitivas).
- Fechar o app durante uma fabricação já comprometida não gasta nada (a transação só acontece no resultado), mas a tentativa se perde.
- Os botões da interface têm estilo simples, herdado do padrão atual.

## 22. Build web

Aprovada: 83 módulos; JS 794,92 kB (218,29 kB gzip); CSS 31,13 kB (8,01 kB gzip); HTML 7,81 kB. Permanece o aviso preexistente de chunk acima de 500 kB.

## 23. Build desktop

`desktop:package:playtest` (verificação do endpoint WSS, build, electron-builder 26.15.3, Electron 44.5.1) terminou com código zero em `release/smithing-build/`. ASAR inspecionado: versão 0.1.5, receitas, armas forjadas, Forja, maestria, tag "SMITHING · EXPERIMENTAL" no HTML, progresso da Torre e Mining presentes; endpoint multiplayer idêntico; sem gancho de debug; checklist embutido é o de Smithing. Multiplayer: nenhum arquivo de servidor, protocolo, endpoint ou shell do desktop foi alterado.

## 24. Caminhos dos artefatos

Pasta exclusiva `C:\Users\theuz\.codex\dungeon-master-iter15-smithing\release\smithing-playtest\` (Setup, Portable, `LEIA-ME.txt`, `CHECKLIST-SMITHING.txt`, `ARTEFATOS.txt`). Não sobrescreve nada: a 0.1.4 continua em `…\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\tower-progression-playtest\`. Mesmo appId e perfil `%APPDATA%\Dungeon Master`.

**Atenção:** o app instalado compartilha o perfil de saves com as versões anteriores. Use um perfil de teste, ou aceite que o personagem ganhe os campos aditivos de Smithing. Os testes e a validação usaram perfis temporários, nunca o real.

## 25. SHA-256

| Arquivo | Bytes | SHA-256 |
|---|---:|---|
| CHECKLIST-SMITHING.txt | 1743 | B513C460FE57AA045620C8641BA5E493DF597FA4DBC752262A7EB6BFEDCD2428 |
| DungeonMaster-Beta-0.1.5-Smithing-Portable.exe | 111274697 | 52B069C510648ADACE5581F65EEB0D032043C6BA13C393476CD0FC6507193B21 |
| DungeonMaster-Beta-0.1.5-Smithing-Setup.exe | 111504683 | 888C31F635BB9F7D49E769B1B22F95268347BB8B4D8276D87E9034DF67795E3A |
| LEIA-ME.txt | 7163 | 6E86D8E2F26FC6390FB5CAF032BCCBE43127785027558DB5D6591F7721DB522F |

## 26. Instruções de instalação

**INSTALE ESTE ARQUIVO PARA TESTAR A ITERAÇÃO 15:**

`C:\Users\theuz\.codex\dungeon-master-iter15-smithing\release\smithing-playtest\DungeonMaster-Beta-0.1.5-Smithing-Setup.exe`

Feche a versão anterior antes. Para testar sem Mineração: o Minério Bruto vem de veios na Caverna (Explorar biomas leva até lá). Para testar a Iteração 14, use a release `tower-progression-playtest` da árvore original.

## 27. Riscos herdados da Iteração 14

*Posição na entrega:* esta build **incluía** o código da Iteração 14 sem alterações (só a camada de Smithing foi acrescentada) e herdava todos os riscos descritos no relatório dela, ainda não confirmados por uma pessoa. **Depois disso a Iteração 14 foi aprovada em playtest manual (09/10/2026)**; os pontos abaixo são o histórico: o Guardião e a continuação ao andar 4, o registro de andares concluídos no momento da resolução (não ao cruzar o portal), as revisitas com portões abertos e sem Guardião, a recompensa única, o balanceamento provisório acima do andar 3, a caminhada completa até a Caverna e a jogabilidade em geral. Nenhum defeito novo da Iteração 14 apareceu durante o desenvolvimento de Smithing; os únicos problemas encontrados foram do isolamento (pasta `dist/` ausente na cópia, já explicada) e o bug de interface do próprio Smithing (seção 20).

**Atualização:** a Iteração 14 foi aprovada em playtest manual pelo responsável em 09/10/2026. **Esta build (Smithing) ainda não foi aprovada.**
