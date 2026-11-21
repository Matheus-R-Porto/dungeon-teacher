# Iteração 29 — peso e sobrecarga progressiva

## Entrega

Sistema funcional de peso dos 44 itens, capacidade de carga, redução progressiva de caminhada e indicador no inventário existente. Os 32 espaços, stacks, equipamentos e 44 sprites PNG 128 × 128 foram preservados. Valores numéricos são **propostas iniciais para balanceamento**, não decisões históricas aprovadas.

- [Auditoria e arquitetura registradas antes da implementação](ITERACAO-29-ARQUITETURA.md)
- [Pesos unitários dos 44 itens](ITERACAO-29-PESOS.md)
- [Capturas e evidência de deslocamento](ITERACAO-29-CAPTURAS.html)
- [Resultado detalhado do Electron](iteration29-validation.json)

## Proposta de capacidade e curva

Capacidade base: **60.000 g / 60 kg**. Bônus de transporte ativo: zero. Capacidade efetiva: base + bônus. Não foram criadas mochilas, carrinhos, equipamentos ou atributos novos.

| Carga | Peso com capacidade de 60 kg | Velocidade restante | Penalidade |
|---|---:|---:|---:|
| 0–40% | 0–24 kg | 100% | 0% |
| 65% | 39 kg | 90% | 10% |
| 85% | 51 kg | 65% | 35% |
| 100% ou acima | 60 kg ou mais | 35% | 65% |

Interpolação linear entre pontos: contínua e monotônica. O piso positivo permanece para saves antigos acima da capacidade. A barra deriva suas faixas dos mesmos pontos: verde até 40%, amarelo de 40% a 65%, laranja de 65% a 85%, vermelho a partir de 85%. No ponto de 40% começa a faixa intermediária, ainda sem penalidade naquele ponto exato.

Justificativa: um kit de ferramentas/equipamentos e uma coleta curta devem caber antes de penalidades fortes. Cada minério pesa 400 g; 20 representam 8 kg e 99 representam 39,6 kg. Os peixes variam de 250 a 900 g. Um acúmulo prolongado pesa mais que uma incursão breve. Não foi medida uma duração média de expedição; a proposta precisa de playtest para avaliar especialmente o início suave e a redução de 65% no limite.

## Cálculo e arquitetura

`carry-config.js` centraliza a capacidade, os pontos da curva e os pesos inteiros. `ITEMS` expõe `weightGrams` por item. As qualidades forjadas mantêm o peso da categoria, pois qualidade altera o dano, não a massa. Campos antigos `weight` de loot/pesca representam probabilidades e continuam intactos.

Peso de pilha = gramas unitárias × quantidade. Total = mochila + equipamentos. Equipar/desequipar transfere a instância entre os dois locais e não altera o total. Não são gravados peso total, penalidade ou capacidade no save. O carregamento deriva esses valores do catálogo, inclusive em saves anteriores.

Funções puras permitem testar cálculo e curva. `carryOf` usa cache por objeto de dados, invalidado por aquisição, retirada, troca de equipamento e recálculo do personagem; substituições de mochila/equipamentos também invalidam a referência. Pesca e mineração invalidam ao confirmar os dados salvos. A caminhada consulta o resultado cacheado, sem percorrer a mochila a cada frame.

## Limite e transações

`Inventory.acquire` e `canAcquire` validam capacidade antes de mudar quantidade, slots ou nextId. O limite exato é aceito; a próxima unidade que excederia o limite é recusada com “Você não consegue carregar mais peso.”

Compras em lote continuam indivisíveis: se o lote não couber, nada é concedido nem cobrado. Pilhas parciais continuam recebendo unidades até seus limites normais, desde que a carga permita. Pesca, mineração e pickups concedem uma unidade por operação, por isso não exigem um novo mecanismo de concessão parcial. Falhas na concessão de mineração não esgotam o veio; no online, o pickup recusado mantém o drop no mundo até sua expiração normal.

Cozinha e forja calculam o resultado após retirar ingredientes, em cópias transacionais. Baús consideram o peso líquido da substituição, mantendo o contrato existente de espaço livre para abrir no offline. Transformações de saves sobrecarregados podem terminar com carga ainda acima do limite desde que não aumentem o total anterior. Gold, XP, materiais e baú são preservados quando a operação falha.

Saves antigos acima de 60 kg não perdem itens e continuam móveis a 35% da velocidade. Podem vender, consumir, equipar/desequipar e transformar itens quando as condições existentes permitem; novas aquisições que aumentem a carga são bloqueadas. A venda existente agora aceita preço zero válido: água, já marcada como vendável por 0 ouro, aparece na Cozinheira com esse valor explícito. Nenhum preço foi alterado. Não foi criado descarte genérico; a redução de carga depende das ações disponíveis para cada item.

## Movimento

`Game.update` compõe `CONFIG.playerSpeed × movementMultiplier × fatorDeCarga × dt`. O novo fator é aplicado uma única vez e atende teclado, caminho automático e perseguição que usam o mesmo Game. `Combat` associa o personagem local ao Game; o servidor associa seu personagem autoritativo antes do movimento, inclusive após substituições de dados e transições.

A auditoria não encontrou bônus vigente de caminhada; attackSpeed permanece exclusivo de combate. O ponto de composição permite futuros modificadores sem sobrescrever a carga. Câmera, velocidade de animação e deslocamentos forçados não receberam penalidades independentes.

No Electron, executando 60 passos de 1/60 s pelo Game real:

| Carga | Distância em 1 s | Fator |
|---|---:|---:|
| 0 kg | 3,600 | 1,00 |
| 12 kg | 3,600 | 1,00 |
| 30 kg | 3,456 | 0,96 |
| 48 kg | 2,565 | 0,7125 |
| 60 kg | 1,260 | 0,35 |

Os testes também cobrem passos de 20, 30, 60 e 144 Hz, caminho automático e composição com outro multiplicador. A captura mede deslocamento de simulação, não FPS de renderização nem um benchmark geral de desempenho.

## Interface e online

Inventário mostra peso atual/efetivo, capacidade base, barra e penalidade real arredondada para leitura. Detalhes e tooltips mostram peso unitário e total da pilha. A mensagem de recusa foi posicionada acima do conteúdo para ficar visível sem rolar. A grade e seus sprites não foram redesenhados.

O servidor usa o mesmo domínio para validar aquisições e calcular caminhada. O snapshot recebeu somente a extensão aditiva `profile.carry`, incluindo o peso equipado que não era enviado no perfil anterior. Nenhum comando de cliente autoriza peso ou capacidade; IDs, versões do protocolo e autoridade permanecem. Cliente antigo ignora o campo adicional. Cliente novo com servidor antigo exibe “Peso indisponível neste servidor.” e preserva o funcionamento anterior, sem inventar um total baseado apenas na mochila.

O modo online foi validado com servidor local atualizado e perfis isolados. **O servidor público não foi atualizado nesta tarefa**; lá a mecânica depende de uma atualização futura autorizada. O agendador de 20 Hz não foi alterado.

## Testes e verificação

Criados 21 testes em `tests/iteration29.test.js`: cobertura dos 44 pesos, pilhas, zero, cache, equipamentos sem duplicação, limite exato, recusa sem mutações, lote sem concessão parcial, compra, consumo, venda, falha de salvamento, migração sobrecarregada, baú com peso líquido, crafting, curva, velocidade positiva, taxas de atualização, UI e autoridade online.

88 testes direcionados passaram. A primeira suíte completa passou com 763/763 em 120,32 s. Após a retomada e o ajuste visual final, a suíte foi confirmada novamente: **763/763 aprovados**, zero falhas, cancelamentos ou ignorados, em 136,00 s ([log final](../.logs/iteration29-full-final.txt)). O ensaio final no Electron aprovou oito grupos de verificações, sem erros registrados: cinco estados de carga, 32 slots e PNGs preservados, deslocamento real, aquisição recusada com estado intacto, janelas 800 × 600 e 480 × 720, consumo com atualização imediata, persistência após recarga e total online incluindo equipamento.

Capturas finais inspecionadas; a recusa agora aparece no topo. Build de produção aprovado. Permanece o aviso já existente de chunk acima de 500 kB. Nenhuma dependência nova. Os perfis de teste são isolados; saves reais não foram sobrescritos. Não houve commit, push ou deploy nesta tarefa.

## Arquivos desta iteração

- Novos: `src/domain/items/carry-config.js`, `src/domain/items/carry.js`, `tests/iteration29.test.js`.
- Domínio: `src/domain/items/inventory.js`, `src/domain/character/character.js`, `src/domain/items/chest.js`, `src/domain/shop.js`, `src/domain/food-service.js`, `src/domain/smithing-service.js`.
- Simulação: `src/simulation/game.js`, `src/simulation/combat.js`, `src/simulation/fishing.js`, `src/simulation/mining.js`.
- Online: `server/world.js`, `server/online-tower.js`, `src/multiplayer/online-ui.js`.
- Interface: `src/ui/inventory-presentation.js`, `src/ui/inventory-view.js`, `src/ui/inventory-view.css`, `src/ui/rpg-panels.js`, `src/ui/kitchen-panel.js`.
- Diagnóstico: `src/main.js` expõe o painel apenas no modo diagnóstico existente; scripts `iteration29-electron.mjs`, `iteration29-scenario.mjs`, `iteration29-report.mjs`; documentos e capturas vinculados acima.

O workspace já continha o trabalho de iterações anteriores e recebeu alterações externas de versionamento durante a pausa. Esta entrega preserva esse estado; a lista acima descreve o escopo funcional da Iteração 29, não um diff contra um commit histórico.

## Pendências de balanceamento

Revisar os 60 kg, o peso por recurso e a severidade da curva após jogar expedições reais. O teste comprova integridade e cálculo, não aprovação do ritmo de progressão. Mochilas, carrinhos, descarte genérico e novas transferências não foram implementados. Não há bônus ativo de transporte nem novo campo persistido.
