# Iteração 36 — auditoria inicial (29/10/2026)

Registro produzido antes de modificar a implementação. Referência: código presente após as correções emergenciais da 35. Não foi localizado relatório `docs/*35*`; foram encontrados `tests/iteration35.test.js`, `server/online-life.js`, alterações de progressão e as integrações do inventário, Brasa, Lina e pesca em `src/multiplayer/world-mode.js`. Esses arquivos foram copiados, com hashes, para `work/iteration36/before` no espaço de trabalho. Não renumerar nem descartar a 35.

Relatos de LAN fornecidos pelo usuário: ADM, combate e persistência funcionaram presencialmente; isso não representa teste integral nem 32 máquinas físicas. As evidências novas serão classificadas separadamente.

## Matriz visual inicial

| Classe | Atlas existente | Direções | Quadros | Proporção efetiva | Animação modular atual |
|---|---|---|---|---|---|
| Novato | novice.png, 6 × 4 | 4 cardinais; 8 direções lógicas arredondadas | 1 repouso + 5 marcha | Cabeça 112 × 100; corpo normalizado 224 de altura | Cabeça/roupa/armadura estáticas; arma independente |
| Guerreiro | warrior.png, 6 × 4 | 4 cardinais; 8 direções lógicas arredondadas | 1 repouso + 5 marcha | Cabeça 112 × 100; corpo normalizado 224 de altura | Cabeça/roupa/armadura estáticas; arma independente |
| Arqueiro | archer.png, 6 × 4 | 4 cardinais; 8 direções lógicas arredondadas | 1 repouso + 5 marcha | Cabeça 112 × 100; corpo normalizado 224 de altura | Cabeça/roupa/armadura estáticas; arma independente |
| Ladino | rogue.png, 6 × 4 | 4 cardinais; 8 direções lógicas arredondadas | 1 repouso + 5 marcha | Cabeça 112 × 100; corpo normalizado 224 de altura | Cabeça/roupa/armadura estáticas; arma independente |
| Sacerdote | priest.png, 6 × 4 | 4 cardinais; 8 direções lógicas arredondadas | 1 repouso + 5 marcha | Cabeça 112 × 100; corpo normalizado 224 de altura | Cabeça/roupa/armadura estáticas; arma independente |
| Mago | mage.png, 6 × 4 | 4 cardinais; 8 direções lógicas arredondadas | 1 repouso + 5 marcha | Cabeça 112 × 100; corpo normalizado 224 de altura | Cabeça/roupa/armadura estáticas; arma independente |

Fontes: `appearance-compositor.js`, `modular-actor.js`, `sprite-actor.js`, `actor-animation.js`, `visual-combat.js`. O compositor remove a região y < 108 do corpo e aplica cabeça em y=11, altura=100. O encaixe usa retângulos fixos, sem pontos por quadro: colete em y=111, anel em y=157, mochila em y=106–107. Cabelo e face são uma peça do atlas `heads` (9 × 4: três cabelos × três expressões). `gear` tem 8 × 4, `weapons` 8 × 4. Não há campo de corpo masculino/feminino. As seis classes mantêm roupas-base próprias. Compartilham sistema de movimento, cabeça, cores e equipamento. A arma usa rotação senoidal por tempo global, enquanto o corpo modular seleciona só repouso/marcha; ataque corporal não está implementado nesse caminho. Conjuração também não escolhe uma pose corporal própria. Dano usa cor/rotação; morte deita a composição.

O caminho legado local tem atlas completos de espada/arco/adaga/cajado, transições, ação, pesca/mineração e morte. O caminho com aparência modular é usado pelos personagens escolares próprios e remotos. Portanto a existência de animação legada não comprova sua disponibilidade para as seis classes online. Não existe corrida independente a ser inventada. Direções diagonais são quantizadas para quatro linhas, sem nova promessa de oito artes.

## Matriz de armas e equipamentos inicial

| Arma definida | Família | Aquisição | Equipável | Renderização/animação |
|---|---|---|---|---|
| pairedDaggers | dagger | Suprimentos pagos | Sim, seis classes | Mesma família, sem ação corporal modular |
| trainingSword | sword | Brasa gratuito | Sim, seis classes | Mesma família, sem ação corporal modular |
| trainingDagger | dagger | Brasa gratuito | Sim, seis classes | Mesma família, sem ação corporal modular |
| trainingBow | bow | Brasa gratuito | Sim, seis classes | Mesma família, sem ação corporal modular |
| trainingStaff | staff | Brasa gratuito | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedSwordFailure | sword | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedSwordGood | sword | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedSwordPerfect | sword | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedDaggerFailure | dagger | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedDaggerGood | dagger | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedDaggerPerfect | dagger | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedBowFailure | bow | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedBowGood | bow | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedBowPerfect | bow | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedStaffFailure | staff | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedStaffGood | staff | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |
| forgedStaffPerfect | staff | Forja local; lacuna online | Sim, seis classes | Mesma família, sem ação corporal modular |

Todas as famílias têm ataque autoritativo no multiplayer; restrições pertencem às habilidades, não a uma proibição geral por classe. Arco exige flechas no modo escolar. As armas forjadas existem nos dados e podem ser equipadas, mas a forja jogável ainda não tem equivalente online. A renderização deduz família pelo nome, o que deve ser substituído pela definição real do item. Equipamentos existentes: cabeça, peito, pernas, botas, anel, colar, talismã, mão secundária, mochila e carrinho; nem todo slot tem peça desenhada/definida. Não criar equipamentos novos para preencher slots.

## Matriz de IA inicial

| Grupo | Ocioso | Detecção/aggro | Perseguição/ataque | Perda de alvo | Limites e apresentação |
|---|---|---|---|---|---|
| Slimes comuns, andares 1–3 online | Sem exploração | Reagem a dano; preservar passividade | Caminho no servidor; ciclo autoritativo | Retorna ao nascimento | Colisão existente; orientação não substitui deslocamento |
| Lobos comuns, andares 1–3 online onde gerados | Sem exploração | Percepção periódica, alcance e visão | Caminho no servidor; ciclo autoritativo | Retorna ao nascimento | Território a partir do spawn; mapeamento da arte precisa inspeção |
| Comuns locais | Ambiente somente para `ambient && !aggressive` | Conforme espécie | EnemyAI; visão/caminhos/colisão | Retorno obrigatório e regeneração | Exploração pequena em torno do spawn |
| Lobo Branco online | Imóvel sem alvo | Superfície e raio do spawn | Mordida, carga, uivo, fúria | Reset teleporta ao nascimento | Caverna tem corredor e sala; superfície sozinha não restringe à grande sala |
| Cavaleiro | Sistema próprio | Instância e participação | OathKnight | Sistema próprio | Preservar mecânicas/escala da 34 |

Fontes: `server/world.js`, `server/white-wolf.js`, `src/simulation/enemy-ai.js`, `src/world/wolf-cave.js`. IA é compartilhada por mapa, não multiplicada por jogador. Preservar simulação 20 Hz, snapshots 10 Hz e cache público. Nova exploração deve decidir em intervalos espaçados e usar colisão/território antes de aceitar destino. A posição de nascimento continua válida para geração e reaparecimento; o retorno após perda de alvo é que deve mudar.

### Auditoria do MVP

Já existe `public/assets/monsters/white-wolf-v052.svg`, atlas próprio 9 × 4, distinto de `wolf-v050.png` 7 × 4. O renderizador possui marcha, mordida, carga, uivo, fúria, morte, retângulo de carga/mordida e anel de uivo. Não alegar criação inédita. O seletor atual não prioriza o quadro de dano nem a liberação da mordida; rever fases e precisão da área de carga. Preservar 48.000 HP, ataque 850, recompensas, 15 minutos, posição/data/finalizador da lápide e persistência.

## Matriz de paridade inicial

Esta é uma classificação por leitura do código, **não aprovação por teste**. A matriz final terá evidência de execução por recurso.

| Funcionalidade | Campanha local | Multiplayer atual | Classificação inicial |
|---|---|---|---|
| Criação, login, conta única | Perfil local | Conta central TLS | Intencionalmente diferente |
| Aparência seis classes | Compositor quando aparência presente | Próprio/remotos/criação | Existe nos dois; defeitos visuais compartilhados |
| Corpo masculino/feminino | Ausente | Ausente | Implementação requerida |
| Cabelos | Três modelos | Três modelos | Ampliação requerida |
| Movimento e câmera | Disponível | Comandos/snapshots | Existe nos dois |
| Portais e andares | Campanha | Autoridade + época | Intencionalmente diferente na persistência |
| Inventário I/menu | Disponível | Correção da 35 presente | Preservar e testar UI |
| Equipar/trocar arma | Disponível | Progression + Inventory | Preservar e testar UI |
| Brasa gratuito e loja paga | Disponível | Correção da 35 com distância/validação | Preservar e testar fluxo |
| Suprimentos de classe | Dados/loja | Inventário da cidade | Existe online |
| Ouro/compras | Domínio local | Cópia validada + recibo + banco | Autoridade correta a verificar em regressão |
| Pesca | Minijogo | Correção 35 com relógio do servidor | Preservar e testar |
| Cozinha/compra ingredientes/venda | Minijogo | Correção 35 com relógio do servidor | Preservar e testar |
| Mineração | Minijogo e veios | Interação sem comando próprio | Lacuna jogável |
| Forja | Três marteladas, receitas/qualidade | Serviço ausente | Lacuna jogável |
| Comida/bônus/consumo | Disponível | `consume` e atalhos | Existe nos dois |
| Mochila/peso/carrinho | Domínio e UI | TransportUI + servidor | Existe nos dois |
| Descarte/coleta de pilhas | Disponível | Drops físicos autoritativos | Existe nos dois |
| Atributos/pontos | Painel | Inventário/build | Existe online, conferir acesso |
| Árvore/aprendizado/80 habilidades | Disponível | Árvore + motor no servidor | Existe nos dois |
| Barra oito atalhos | Disponível | Hotbar autoritativa | Existe nos dois |
| Base/Job/promoção | Progressão | Progressão escolar central | Existe nos dois, regras preservadas |
| Serafina/reset/serviços | Disponível | Painel próprio com distância | Existe nos dois |
| NPCs/diálogos | Diálogo e serviços | Diálogo, Brasa, Lina, Serafina | Conferir F versus clique e novos serviços |
| Primeiros passos | Orientação/tutorial | Sem equivalente de orientação visível | Lacuna de orientação; não concede recompensas |
| Drops/recompensas/baús | Seed e grant local | Autoridade e apresentação 30 | Existe nos dois |
| Teleporte com consentimento | Motor local | Pedido/consentimento no servidor | Diferença intencional multiplayer |
| Lobo/lápide/reaparecimento | Encontro próprio | Mundo público persistente | Arquitetura distinta; IA/apresentação a corrigir |
| Cavaleiro | Solo | Instância de grupo | Diferença intencional, preservar |
| Party/chat | Sem rede local | Disponível | Exclusivo multiplayer |
| Pausa | Pode pausar local | Apenas interrompe comandos próprios | Diferença intencional |
| Salvamento/reconexão | Perfil local | Banco central/conta | Diferença intencional |
| ADM/temporadas/backup | Fora da campanha | Aplicativo separado | Exclusivo administrativo |
| Teleporte livre/ouro/nível arbitrários | Desenvolvimento | Não devem existir no aluno | Exclusivo debug; excluir da paridade |

## Plano de preservação e validação

Manter os testes da 35. Salvar código anterior antes de cada mudança, preservar executáveis 33/34 e referências `sources/`. Corrigir primeiro serviços inacessíveis com validação no servidor, depois composição/poses/personalização, exploração e território. Produzir sequências por classe/corpo/família/direção, regressão completa, fluxos online com ADM, medições antes/depois e nova distribuição 36 sem publicação. Não declarar conclusão enquanto os critérios visuais e funcionais não tiverem evidências.
