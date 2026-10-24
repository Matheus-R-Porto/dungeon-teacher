# Iteração 29 — auditoria e arquitetura antes da implementação

## Fontes e caminhos existentes

`src/domain/items/inventory.js` contém os 44 itens reais e as operações de aquisição, retirada, equipar e desequipar. Instâncias guardam ID, definitionId e quantidade; slots equipados contêm a própria instância, retirada da mochila. Capacidade de 32 espaços e stacks máximos de 99 permanecem.

Entradas: armas/vara gratuitas e compra no Armeiro, cozinha (compra, preparo), pesca, mineração, recompensas de exploração/boss, abertura de baús e forja. Saídas: venda, consumo, ingredientes da cozinha, materiais de forja e abertura de baú. Equipar/desequipar transfere a mesma instância. Os serviços de comida, forja, pesca e mineração usam cópia do personagem e salvamento antes de confirmar. Baú local precisa considerar troca de peso sem quebrar a concessão preparada. Online pickup e abertura de baú usam cópia e transação SQLite.

Movimentação converge em `Game.update`: velocidade base `CONFIG.playerSpeed=3.6`, multiplicada por dt, tanto para teclado quanto caminho automático/perseguição. Não há modificador vigente de velocidade de caminhada; attackSpeed é de combate e não deve ser alterado. Câmera, animação e deslocamentos forçados não serão escalados separadamente. Servidor usa o mesmo Game, sem predição autoritativa do cliente.

Saves validam os IDs e quantidades; nenhum peso físico é persistido. Campos `weight` existentes na pesca/loot representam probabilidade, não massa. Não serão reutilizados.

Online: servidor possui mochila e equipamentos, mas profile do cliente só transmite mochila. Cálculo client-side isolado seria incompleto. Extensão aditiva `profile.carry` fornecerá resumo autoritativo; clientes antigos ignoram o campo. Cliente novo com servidor antigo mostrará indisponibilidade em vez de inventar um total parcial. Sem alteração dos comandos ou versão do protocolo, nem deploy.

## Arquitetura proposta

Configuração única em gramas inteiras para os 44 IDs, com peso igual entre qualidades forjadas da mesma arma. Campo weightGrams adicionado às definições existentes. Funções puras de soma, capacidade e curva, e cache por objeto de dados invalidado por mutações do Inventory e recalculate do Character. Caminhada consulta somente o resumo cacheado; não percorre mochila a cada frame.

Capacidade base proposta: 60.000 g; bônus ativo zero, capacidade efetiva separada para futura expansão. Pontos da curva (taxa, multiplicador): (0,1), (0,4;1), (0,65;0,9), (0,85;0,65), (1;0,35). Interpolação linear contínua, monotônica e piso positivo também em saves acima de 100%. Faixas visuais derivadas dos mesmos pontos. Estes números são propostas, não decisões já aprovadas.

Um kit de equipamentos/ferramentas mais cerca de 20 minérios (8 kg) e 10 peixes deixa espaço para uma expedição curta antes de uma penalidade forte. Uma pilha de 99 minérios pesa 39,6 kg e passa a exigir escolha com o restante do kit. Os valores precisam de playtest; não há duração média de expedição medida nesta auditoria.

Aquisições unitárias e compras em lote permanecem indivisíveis segundo a semântica atual. Não será criado recebimento parcial onde hoje não existe. Toda aquisição comum valida peso antes de alterar a instância, quantidade ou nextId. Compras/crafting/recompensas devem conservar itens e moeda em falha. Transformações em cópias podem usar como teto o maior entre capacidade e carga original, permitindo redução de saves antigos sobrecarregados sem permitir aumento líquido. Nenhum item antigo será removido na migração.

Interface existente: barra e números acima da grade, peso unitário/pilha nos detalhes e tooltip. Slots, artes e layout principal preservados. Cache da apresentação inclui resumo online; números locais usam a mesma função de domínio. Sem campos de peso redundantes no save.
