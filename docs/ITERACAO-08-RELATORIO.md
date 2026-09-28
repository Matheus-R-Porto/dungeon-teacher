# Dungeon Master — Beta 0.1.0 — Iteração 08

Entrega verificada em 28/09/2026. Mantido o loop Refúgio → três andares → boss → baú → retorno → recompensa → progressão → nova run. Iteração 09 não iniciada.

## 1. Reset/migração

`BALANCE.progressionVersion = 4`. Saves das versões anteriores são validados e convertidos para um personagem novo: nível 1, atributos iniciais 5, XP/ouro/pontos/espaços zerados, inventário/equipamentos/habilidades vazios e Primeiros Passos reiniciado. A abertura grava a migração antes de entregar o personagem à aplicação. Mantidos controle de revisão e backup anterior do salvamento. Saves futuros ou inválidos não são silenciosamente aceitos.

O perfil normal foi observado vazio após a migração. Reloads posteriores preservaram a progressão. Durante a preparação do playtest houve também um reinício manual deliberado pelo controle existente, depois de uma tentativa preliminar malsucedida; isso foi uma ação de teste, não repetição automática da migração.

## 2. Progressão

XP continua sendo progresso, nunca moeda. Próximo nível exige `100 + 250 × (nível atual − 1)`: 100, 350, 600, 850, 1100… Cada nível concede 5 pontos de atributo e 1 Espaço de Habilidade. Ouro permanece separado e persistente; distribuir atributos não gasta XP nem ouro.

Uma run completa concede 256 XP: 3×12 + 4×15 + 5×18 + 70 do boss. Sem gastos ou mortes: primeira run termina no nível 2, XP 156/350; segunda no nível 3, XP 62/600. Cinco espaços exigem nível 6 e 3000 XP acumulados, aproximadamente 12 runs completas.

## 3. Espaços de Habilidade

Nível 1 começa com zero. Cada técnica custa exatamente 1; não há custo progressivo nem pré-requisitos entre as cinco. Saldo e técnicas são persistidos imediatamente pelo fluxo de mutação/salvamento existente. Compra repetida não cobra novamente; saldo insuficiente bloqueia; falha de gravação usa o rollback existente. Não há respec.

## 4. Skill tree

TAB mostra saldo, custo, descrição, arma, MP, recarga, alcance e estado. Estados distinguem não aprendida, disponível, aprendida e indisponível. Hotbar respeita aprendizado, arma e condições de combate.

Primeiros Passos conduz à arma e ao portal antes do aprendizado. O primeiro level up explica o novo recurso e indica TAB. Aprender passou para o final do guia, eliminando o bloqueio impossível antes da primeira expedição.

## 5. Armas

Valores abaixo são modificadores/perfis da arma, não o dano final do personagem.

| Arma | Ataque básico | Alcance | Diferença |
|---|---|---:|---|
| Espada | Corpo a corpo, físico | 1,45 | +5 ataque físico; impacto forte |
| Adaga | Corpo a corpo, físico | 1,35 | +3 ataque físico, +0,65 ataques/s, multiplicador 0,72; golpes menores e frequentes |
| Arco | Projétil físico | 6 | +4 ataque físico; velocidade do projétil 12 |
| Cajado | Projétil mágico | 6 | +6 ataque mágico; velocidade do projétil 8 |

Acerto, crítico, defesa, velocidade do personagem e ciclo de ataque continuam compartilhados. Espada tem reação visual mais intensa; flecha e energia diferem em forma/cor e velocidade.

## 6. Projéteis

Combat possui uma única instância de Projectiles, também usada por AbilityRuntime. Ataques básicos e habilidades usam o mesmo avanço, colisão, tempo de vida e cancelamento. O lançamento captura o perfil de dano; o impacto resolve a defesa física ou mágica e o acerto.

Referências incluem geração do alvo; tiros de inimigos também validam origem. Alvo morto, retorno por leash, mudança de geração, morte do jogador e troca de área impedem dano atrasado. Pausa congela a simulação. Cobertura bloqueia o trajeto. Troca de equipamento respeita projéteis em andamento. O renderizador apenas apresenta os tiros.

## 7. Inimigos

| Perfil | Identidade |
|---|---|
| Slime comum | Referência de combate próximo e resistência |
| Slime Saltador | Laranja, aproximação mais rápida (4), ataque mais frequente, 75% do HP base do andar |
| Slime Mágico | Azul, tiro mágico lento (5), alcance 6, 70% do HP base, tentativa de manter distância |

O Mágico recua por até 0,7 s com intervalo de 2,4 s. Essa janela permite que espada/adaga alcancem e concluam o golpe. O Guardião conserva seu papel de boss final.

## 8. IA

Todos reutilizam percepção, alvo, navegação, colisão, separação de corpos, leash e retorno. Perfis acrescentam parâmetros e a decisão de reposicionamento, sem três motores de IA separados.

Na Torre, proximidade, seleção e tentativa sem impacto não provocam. Impacto hostil válido inicia combate. Leash concluído restaura comportamento ambiental passivo. Inimigos mortos não reaparecem na run; nova run recria a população. O movimento do Saltador respeita obstáculos; seu salto visual não atravessa paredes.

## 9. Procedural

FloorGenerator permanece separado de RunState. `generateEncounter` deriva composição da seed de forma independente da escolha espacial dos pontos. Andar 1: comuns; andar 2: presença obrigatória de Saltador; andar 3: os três perfis, incluindo Mágico. Quantidades continuam 3/4/5.

As posições usam candidatos acessíveis da geração existente. Há pelo menos duas coberturas reais; o fallback cobre seeds em que o sorteio de módulos seria escasso. Verificadas 100 seeds de composição/posicionamento e 1000 seeds de cobertura, além dos testes existentes de conectividade. Layouts continuam restritos à run atual; não foi implementada persistência de torre ou party.

## 10. Loot

| Equipamento | Slot | Modificadores |
|---|---|---|
| Capuz do Viajante | Cabeça | Defesa física +2 |
| Capuz do Aprendiz | Cabeça | MP +18, ataque mágico +2 |
| Colete do Viajante | Peito | HP +25 |
| Colete Leve | Peito | Esquiva +5 |
| Botas do Viajante | Pés | Defesa física +1, esquiva +2 |
| Botas Ágeis | Pés | Velocidade de ataque +0,12 |
| Anel de Foco | Anel | Ataque mágico +3, MP +10 |
| Anel de Força | Anel | Ataque físico +4 |

As alternativas disputam slots e oferecem troca entre defesa, recursos, velocidade e dano. O pool contém oito opções com pesos iguais, separados da seleção e da apresentação. Sem raridades novas. A recompensa é determinada antes da conclusão visual; Espaço só desacelera a roleta. Concessão e consumo do baú continuam atômicos. Não há perguntas educacionais.

## 11. Balanceamento

HP base dos andares: 80/100/120; ataque físico base: 9/10/11. Guardião: HP 300, ataque final 13, XP 70. Baú: item + 80–120 ouro. Inimigos comuns não concedem ouro.

Os ataques foram reduzidos após a auditoria inicial para permitir a primeira run sem habilidades. O teste completo de melee encontrou recuo contínuo do Mágico impedindo golpes; o recuo ganhou duração e intervalo. A etapa final reduziu ataque do boss de 15 para 13 para completar também os percursos básicos de espada/adaga sem exigir pausas extensas de regeneração.

Os dois playtests manuais completos ocorreram com ataque do boss 15, antes dessa redução final. A versão final, incluindo recuo limitado e boss 13, passou pelos quatro percursos automatizados completos. A curva é provisória: 12 runs para cinco técnicas correspondem a cerca de 37–45 minutos usando os tempos observados, sem preparação; não é uma comprovação de duração para todo jogador nem uma curva final de 2–3 horas.

## 12. Primeira run

Perfil normal, sem concessões de debug, personagem novo; cajado adquirido gratuitamente no Armeiro e equipado pela interface. Três andares e boss derrotados somente com ataque básico, sem aprender habilidades nem distribuir pontos durante a expedição. Boss terminou com jogador em 123/168 HP. Entrada até retorno: aproximadamente 3min45s, incluindo interações e pausas de inspeção da ferramenta.

Recompensa: Capuz do Viajante +92 ouro. No Refúgio, capuz equipado, +3 INT e +2 VIT distribuídos; Bola de Energia aprendida por 1 Espaço. Reload manteve nível 2, XP 156, ouro 92, equipamentos, atributos, técnica e saldo zero.

A tentativa preliminar anterior terminou em morte porque o boss foi deixado ativo enquanto eram inspecionados testes, sem ser selecionado para atacar. Essa falha não foi contabilizada como run concluída. O reinício manual subsequente permitiu validar a sequência completa do zero.

Evidências: [andar 3](capturas/iteracao-08-run1-andar3.png), [boss](capturas/iteracao-08-run1-boss.png), [recompensa](capturas/iteracao-08-run1-recompensa.png), [aprendizado após reload](capturas/iteracao-08-aprendizado-persistido.png).

## 13. Segunda run

Mesmo perfil depois do reload. Cajado + capuz, atributos distribuídos e Bola de Energia utilizada junto do ataque básico. Nova geometria e composição: andar 2 teve dois Saltadores e dois comuns; andar 3 teve dois Mágicos, dois Saltadores e um comum. Na primeira, andar 2 tinha três Saltadores e um comum; andar 3, um Mágico, dois Saltadores e dois comuns.

Loop completo novamente: boss → coleta → retorno → abertura. Aproximadamente 3min07s; HP ao derrotar boss 168/200. Recompensa: outro Capuz do Viajante +107 ouro. A duplicata ficou no inventário. Não se atribui a redução de tempo exclusivamente à habilidade: equipamento, atributos, familiaridade e composição também mudaram.

Perfil normal final preservado no Refúgio: nível 3, XP 62/600, ouro 199, 5 pontos de atributo disponíveis, 1 Espaço de Habilidade, Bola de Energia aprendida, cajado/capuz equipados, INT 8 e VIT 7. Reload final confirmou esses dados. Nenhum reset adicional foi feito após os dois playtests.

Evidências: [andar 3](capturas/iteracao-08-run2-andar3.png), [recompensa](capturas/iteracao-08-run2-recompensa.png), [progresso final](capturas/iteracao-08-progresso-final.png).

## 14. Teste das quatro armas

No teste manual preliminar, espada, adaga e arco derrotaram respectivamente um Slime do primeiro andar; cajado foi utilizado nos andares seguintes e nas duas runs completas. Espada mostrou impacto mais pesado; adaga, cadência maior com menor dano; arco, flecha física rápida com atraso até o impacto; cajado, energia mágica mais lenta. Trocas foram feitas fora de combate.

Testes automatizados com ciclos reais, IA, navegação e regeneração natural completaram os três andares e o boss com cada uma das quatro armas, sem habilidades. Outro teste compara dano por golpe e número de golpes de espada/adaga; testes específicos provam que ambas alcançam o Mágico entre recuos. Isso complementa a observação visual; não equivale a quatro runs manuais completas.

## 15. Testes

`npm test`: **231 testes passaram, zero falhas, zero ignorados**. Base anterior: 199. Cobertura adicional inclui migração persistida uma única vez, compra independente e saldo, dano no impacto, defesa correta, pausa, morte, geração, transição, cobertura, estabilidade 30/60/144 FPS, passividade/retorno, movimento, encontros, trocas/reload dos novos itens e quatro runs básicas completas.

`npm run build`: aprovado, 53 módulos. JavaScript 693,14 kB (185,69 kB gzip), CSS 21,74 kB (5,93 kB gzip). Permanece o aviso de chunk acima de 500 kB, principalmente pelo pacote gráfico; não é erro de build. Console do reload final sem erros capturados.

## 16. Performance

No navegador a 1280×720, amostras do indicador opcional `?perf=1` variaram aproximadamente entre 65 e 120 FPS; durante combate foram observadas amostras de 80–117 FPS e p95 de intervalo de frame de cerca de 8,5–25 ms. São janelas de 120 frames no ambiente desta sessão, não uma garantia em outros dispositivos. A pausa limpa a janela; o modo não habilita recursos de debug.

Benchmark reproduzível: `node scripts/iteration08-performance.mjs`. São 60 segundos simulados a 60 passos/s, inimigos mistos, HP restaurado fora da medição para sustentar o estresse, leash ampliado e área sem obstáculos. Esse cenário sintético mede CPU da simulação, não GPU/FPS nem custo de navegação em mapas complexos.

| Inimigos | Média por passo | p95 por passo | Máximo de projéteis | Passos com projéteis | Rotas / fallbacks |
|---:|---:|---:|---:|---:|---:|
| 5 | 0,019 ms | 0,045 ms | 2 | 2512/3600 | 4 / 0 |
| 20 | 0,130 ms | 0,318 ms | 7 | 2529/3600 | 778 / 0 |

Dados brutos em [ITERACAO-08-PERFORMANCE.json](ITERACAO-08-PERFORMANCE.json). Não foi necessário introduzir otimização estrutural adicional nesta iteração.

## 17. Limitações

Arte, animações, números, curvas e boss continuam provisórios. As duas recompensas manuais repetiram o capuz: o sorteio permite duplicatas e ainda não tem proteção contra repetição. Os novos tradeoffs foram verificados por testes de stats/troca/reload; sua preferência subjetiva exige mais jogadores.

As últimas correções de recuo, cobertura mínima e ataque do boss foram verificadas automaticamente; não houve terceira repetição manual integral após elas. Performance não foi validada em mobile ou hardware de baixo desempenho. O pacote gráfico ainda excede o limite de aviso do build.

Continuam fora do escopo: classes, educação, perguntas, Floor 4, party, persistência de layouts entre runs, economia complexa, raridades e conteúdo da Iteração 09. O trabalho termina nesta entrega.
