# Dungeon Teacher — Iteração 29.1

Implementação de mochilas, carrinho acoplado e descarte com drops físicos. Os resultados automatizados finais e as capturas estão em `iteration291-validation.json` e `ITERACAO-29.1-CAPTURAS.html`.

Para experimentar: compre Mochila do Viajante e Carrinho de Madeira no Armeiro, abra **I** e equipe nos novos slots. Abra a seção **Carrinho** para transferir itens. Arraste um item da bolsa para fora da janela, escolha a quantidade e confirme; feche **I** para colocá-lo no chão. Aproxime-se e use **Recolher**. No Refúgio, a seção de recuperação permite trazer ao chão os descartes salvos de outros layouts.

Regras aprovadas preservadas: sobrecarga progressiva, transporte funcional, carrinho acoplado e visível, descarte por arrastar, confirmação de protegidos e materialização ao fechar. Propostas desta implementação: números da tabela, dois slots dedicados, bloqueio de remoção de carrinho carregado, proteção por fatos do catálogo, ausência de expiração manual e recuperação offline no Refúgio.

## 1. Auditoria inicial

A auditoria anterior à implementação está em [ITERACAO-29.1-ARQUITETURA.md](ITERACAO-29.1-ARQUITETURA.md). Foram examinados Inventory, carry, Character, CharacterSave, SpriteActor, Scene, RemotePlayers, Game, colisões e superfícies, RpgPanels, InventoryView, OnlineTower, OnlineStore e o protocolo v4. Compra, cozinha, forja, pesca, mineração, baús e recompensas existentes continuam usando o catálogo e o inventário central.

O personagem resolve oito setores de orientação, convertidos em quatro linhas ilustradas. A arte do carrinho acompanha essas quatro orientações. Os equipamentos anteriores eram oito; nenhum foi substituído. Qualidade de forja não constitui um sistema de raridade.

## 2. Arquitetura

Foram acrescentados os slots `backpack` e `cart`, o compartimento `cartStorage` e a coleção offline `worldDrops`. O compartimento usa as mesmas instâncias, quantidades, limites por pilha e definições do inventário. O contador de IDs é compartilhado; o carregamento valida IDs e unicidade entre bolsa, equipamentos e carrinho.

Os pesos e capacidades continuam derivados. Não são gravados totais redundantes ou bônus acumuláveis. Transferências trabalham sobre cópia e só publicam o resultado integral. No fluxo offline de transporte, o snapshot é salvo antes de substituir os pertences em memória. A atualização não sobrescreve HP, MP ou XP atuais.

## 3. Mochila

A Mochila do Viajante é comprada no Armeiro e equipada no slot próprio. Seu bônus é aplicado uma única vez; seu peso próprio permanece na carga pessoal tanto equipada quanto guardada. Desequipar exige espaço livre e pode causar sobrecarga, preservando todos os itens. A curva anterior continua limitando o movimento e impedindo novas aquisições acima da capacidade.

## 4. Carrinho e propostas numéricas

| Parâmetro | Proposta implementada |
|---|---:|
| Capacidade pessoal base, preservada | 60 kg |
| Peso da mochila | 1,2 kg |
| Bônus da mochila | +20 kg |
| Preço da mochila | 30 ouro |
| Peso da estrutura do carrinho | 8 kg |
| Compartimento do carrinho | 16 espaços / 100 kg |
| Preço do carrinho | 60 ouro |
| Multiplicador adicional do carrinho vazio | 0,95 |
| Multiplicador adicional do carrinho cheio | 0,75 |
| Alcance máximo de coleta | 2,6 unidades |
| Limite de drops manuais offline / por dono no descarte online | 256 |
| Expiração de descarte manual | Nenhuma |

São propostas de teste, não balanceamento aprovado. Os valores ficam em `transport-config.js`, `carry-config.js` e nas duas definições do catálogo. O multiplicador do carrinho varia linearmente conforme sua carga e multiplica o resultado da curva pessoal, que não foi alterada. Exemplo: velocidade pessoal de 90% e carrinho cheio de 75% resultam em 67,5% da velocidade base.

O bônus inicial de 20 kg equivale a um terço da capacidade base: é perceptível para validar a mecânica, mas não torna o limite irrelevante. O carrinho oferece maior capacidade com uma penalidade própria e finita, sem alterar a curva pessoal.

Quando equipado, o carrinho é puxado: sua estrutura não é somada à carga pessoal; o efeito está na penalidade adicional de tração. Guardado na bolsa, pesa 8 kg. O conteúdo permanece separado. Remover ou trocar um carrinho com conteúdo é recusado. Não há transferência automática capaz de exceder a bolsa ou apagar itens.

## 5. Acoplamento visual e arte

`ActorAccessories` é uma extensão mínima do SpriteActor. `cartAnchor` deriva imediatamente posição e direção da mesma entrada interpolada usada pelo personagem. Não existe agente, velocidade própria, pathfinding, perseguição, atraso ou teleporte de recuperação. Teclado, caminho e mudanças de direção compartilham esse comportamento.

O acessório usa um atlas original de quatro orientações: frente, esquerda, costas e direita, com madeira, rodas, ferragens e tecido verde-azulado. Texturas têm transparência, teste de profundidade e escrita de profundidade, como o personagem. A posição relativa permite o carrinho ficar à frente ou atrás conforme a direção. As camadas de visibilidade acompanham o ator nas cavernas. Não foi criado um sistema completo de equipamentos em camadas.

Arte produzida com a ferramenta integrada imagegen, sem CLI/API externa. Originais: `docs/art/iteration291-sources/`. Recursos do jogo: `public/assets/transport-v291/`. A exportação apenas recorta as quatro vistas, redimensiona e adiciona margens transparentes em células iguais; os 44 PNGs anteriores não foram substituídos. Os dois novos ícones têm 128 × 128 pixels. Especificações de geração: [ITERACAO-29.1-ARTE.md](ITERACAO-29.1-ARTE.md).

## 6. Armazenamento

O inventário oferece uma seção Carrinho com itens, quantidades, peso e capacidade. É possível transferir arrastando entre a bolsa e o compartimento, ou escolher um item e uma quantidade nos controles. Clicar em uma pilha do carrinho abre sua transferência de volta.

As operações verificam quantidade inteira positiva, peso, espaços e pilhas antes de publicar qualquer alteração. Falhas deixam origem e destino intactos. Ferramentas e ingredientes guardados no carrinho precisam voltar à bolsa para uso pelos sistemas atuais. Identificadores novos vêm da sequência única do personagem. Metadados de baús, incluindo a seed, sobrevivem às transferências.

## 7. Descarte por arrastar

O gesto começa apenas em um item da bolsa ou do carrinho e exige deslocamento superior a oito pixels. Selecionar, arrastar a janela ou um movimento pequeno não prepara descarte. Imagens não iniciam o arrastar nativo do navegador.

- Bolsa → outro espaço da bolsa: reorganiza.
- Bolsa → equipamento: tenta equipar no slot indicado.
- Bolsa ↔ carrinho: abre escolha de quantidade para transferência.
- Bolsa → fora da janela: abre escolha de descarte.
- Carrinho → fora: orienta transferir primeiro à bolsa.

A escolha oferece uma unidade, quantidade digitada ou toda a pilha disponível. A fila mostra nome, sprite, quantidade e cancelamento. Quantidades já reservadas não podem ser reservadas novamente. Operações que alterariam os itens ficam bloqueadas enquanto há descartes pendentes.

Fechar valida novamente os itens e o chão, prepara todos os drops e grava o resultado antes de concluir. Uma falha mantém a janela e os itens; fechar repetidamente durante a gravação não inicia outra operação. Uma escolha ainda sem confirmação impede o fechamento acidental. Fechamento de segurança por perigo cancela intenções ainda não submetidas e fecha a interface; uma transação já iniciada continua segura.

## 8. Proteção

`discardProtected` centraliza a política: itens realmente únicos, baús e equipamentos de transporte. Não foram criadas raridades para os 44 itens. Qualidade de forja não ativa proteção automaticamente.

Itens protegidos mostram “Deseja realmente descartar este item?”, nome, sprite, quantidade e a consequência: colocar no chão ao fechar, não destruir. Cancelar não remove nada.

## 9. Infraestrutura de drops

Cada drop manual tem ID único, dono, ID do catálogo, quantidade, mapa, identidade do layout, superfície, posição, estado disponível, origem manual e expiração nula. Baús preservam sua seed. Não há cópia das definições do catálogo dentro dos drops.

As posições são escolhidas em pequenos anéis próximos ao jogador, respeitando limites, obstáculos, água, superfície e segmento acessível. Drops próximos são espaçados. Se não for possível posicionar o conjunto inteiro, a operação falha sem remover os itens.

Os itens usam PNGs do catálogo em sprites no chão, com profundidade real. Um controle de coleta aparece por proximidade, deslocado para não cobrir o sprite. A aquisição verifica o conjunto inteiro, incluindo peso, espaços, pilhas e unicidade. A remoção só acontece com a aquisição confirmada. Não foram acrescentadas tabelas de loot de monstros.

## 10. Persistência e recuperação

Offline, inventário e drops são gravados no mesmo snapshot IndexedDB, com a proteção de revisão já existente. A fila pendente não é um inventário separado: se o jogo encerrar antes da submissão, os itens continuam na bolsa. Depois da gravação, os drops sobrevivem a carga, reinício e troca de mapa.

Uma descoberta adicional da auditoria exigiu uma regra explícita: a campanha ainda gera novamente layouts entre expedições. Drops são vinculados também à seed, evitando reaparecer dentro de paredes de outro layout. No Refúgio, a seção “Recuperar descartes” permite colocar um descarte salvo no chão próximo; sua coleta ainda respeita peso e espaço. Isso evita perda de acesso a pertences de uma expedição encerrada. É uma política operacional proposta, não persistência definitiva da Torre. Não há expiração ou limpeza silenciosa de descartes.

Online, mapas persistentes e drops pertencem ao servidor; descartes manuais ficam no SQLite sem expiração e voltam ao reconectar. A regra de cinco minutos e o limite de 64 recompensas online anteriores foram preservados. Descartes manuais não expiram e não consomem essa cota de recompensas. Drops continuam individuais, sem conceder a outro jogador os pertences do dono. Descarte durante instâncias de arena permanece bloqueado pelas restrições existentes.

## 11. Multiplayer

O protocolo continua v4, com campos aditivos `transport`, equipamentos, compartimento e indicador visual do carrinho. Clientes anteriores podem ignorá-los. O novo cliente oculta controles em servidores que não anunciam suporte; usar os novos recursos exige atualizar o servidor, o que não foi feito no servidor público.

A ação `transport` tem formatos estritos para comprar transporte, equipar/desequipar transporte, reorganizar, transferir e descartar. Posições e pesos nunca vêm do cliente. Sessão, época, mapa, sequência, vida, combate, item e quantidade são validados. O servidor grava personagem e drops na mesma transação SQLite. IDs de requisição recentes são persistidos para reconhecer repetição, inclusive depois de reconectar. Coleta remove uma única linha condicionalmente dentro da transação; tentativas repetidas ou concorrentes não concedem cópias.

O ensaio encontrou uma suposição anterior: o servidor acessava a arma equipada sem tratar ausência. O cenário sem arma derrubava a simulação com a mensagem genérica de persistência indisponível. O acesso foi corrigido; alcance zero não permite atacar. Há teste específico de regressão. O agendador de 20 Hz não foi alterado. A separação entre cota de recompensas e descartes também recebeu regressão: 64 drops manuais não impedem a recompensa seguinte.

## 12. Testes, build e evidências

Resultado final: **777/777 testes aprovados**, zero falhas, cancelamentos ou skips, em **152,795 s**. A bateria dirigida teve **105/105**; a verificação adicional de drops/online/cavernas teve **31/31** (com sobreposição entre baterias). O Electron concluiu **11 grupos de verificações**, sem erros, com **19 capturas distintas**. Build de produção aprovado: 167 módulos, pacote principal 1.030,01 kB / 294,21 kB gzip.

Os testes novos verificam bônus único, peso próprio, migração, sobrecarga, transferências nas duas direções, capacidade, espaços, IDs, quantidade inválida, remoção com conteúdo, seed de baú, posicionamento, falha de criação, coleta integral, recusa, persistência, recuperação de layout, proteção, deslocamento por teclado/caminho, protocolo, repetição de comando e coleta repetida.

O cenário Electron usa dois processos reais, perfis isolados e servidor local. Executa cliques e arrastar reais, transferência de quantidade, cancelamento, confirmação protegida, fila ao fechar, falha simulada, recarga do save, coleta, recusa por peso e comandos online. As capturas são do jogo, não mockups. A galeria inclui as quatro direções e três momentos de caminhada.

Contagens, duração, resultado da suíte completa, build e caminhos exatos dos ensaios estão no arquivo de validação entregue. O build mantém o aviso anterior de bundle JavaScript acima de 500 kB; não houve tentativa de mascará-lo. Não foi reaberta a auditoria de FPS. Um teste antigo de compilação de cavernas falhava intermitentemente no Node quando ultrapassava a fatia de 3 ms e tentava usar requestAnimationFrame, ausente nesse ambiente. O teste recebeu um agendamento assíncrono controlado e restauração dos globais; o código gráfico do jogo não foi alterado por isso.

Comandos reproduzíveis: `npm test`, `npm run build` e, no PowerShell, `$env:BENCH_DIALOGUE='1'; $env:BENCH_LABEL='transport291'; node scripts/iteration291-electron.mjs`. O cenário Electron precisa abrir processos e um servidor loopback local. Alguns testes de persistência usam hard links; uma execução restrita que recusou esses links foi repetida com a permissão local adequada, sem alterar a lógica testada.

## 13. Arquivos e limites

Novos módulos: `transport-config.js`, `transport.js`, `world-drops.js` no domínio; `accessory-anchor.js`; `actor-accessories.js` e `world-drops.js` no renderizador; `transport-ui.js`; testes e cenários `iteration291`; arte e esta documentação.

Integrações alteradas: inventário, pesos, Character/CharacterSave, Game, SpriteActor/Scene, RpgPanels/InventoryView/apresentação, segurança de interfaces, main, loja, catálogo de arte, estilos; OnlineTower/OnlineStore/SharedWorld, protocolo, WorldClient/RemoteState/onlineUI. Expectativas antigas de oito slots, 44 definições totais e estoque exclusivo de picareta foram atualizadas para a expansão; o teste dos 44 sprites originais permanece.

Limitações deliberadas: carrinho é acessório visual da unidade do personagem, sem colisão independente das rodas ou animação mecânica própria; não há física de veículo, classes, camadas completas, raridades inventadas ou loot novo. A recuperação offline no Refúgio é provisória. Não foram medidos 12 carrinhos simultâneos em computadores escolares. O servidor público não recebeu os novos recursos. Nenhum save real foi usado, e não houve commit, push, deploy ou geração de novo instalador.
