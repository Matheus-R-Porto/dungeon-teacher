# Iteração 07 — Primeiro loop completo de jogatina

Atualizado pelo adendo de decisões de design. As regras abaixo substituem a progressão paga da primeira implementação.

## Auditoria anterior à implementação

Os 164 testes da Iteração 06 ampliada passaram antes das mudanças. A implementação de domínio, navegação, combate, habilidades, áreas, interface, renderização e save foi lida. No navegador, o perfil de teste confirmou Refúgio, Armeiro por F, inventário, árvore, arma equipada restaurada, entrada no andar fixo, ataque e habilidade contra Slime, contagem de derrota, respawn, agressão por proximidade, morte e retorno com recursos completos. Recarregar preservou equipamento e nível. O perfil normal foi reiniciado pelo comando existente antes da implementação; o playtest usa a chave separada test=1.

## 1. Loop completo

Personagem novo → movimentar/câmera → Armeiro → adquirir arma → I/equipar → TAB/aprender → F/Portal → três andares → Slime Guardião → pegar baú → retornar → I/abrir baú → Espaço/desacelerar roleta → equipamento + ouro → C/melhorar atributo → nova expedição. Sem arma equipada, ataques e entrada continuam bloqueados.

Primeiros passos agora tem nove marcos persistentes: movimento, câmera e as sete etapas anteriores. A orientação dentro da Torre acompanha o objetivo atual. Termina ao retornar após cumprir a primeira etapa de combate; o objetivo da expedição continua independente. Abrir painéis mantém a pausa anterior. Não foram alteradas as definições das cinco habilidades.

## 2. Geração procedural

`src/world/tower.js` gera módulos de pilares em seis células laterais, com presença e dimensões determinadas por um PRNG de 32 bits. Uma avenida central larga e travessias entre células permanecem livres. Limites e piso aumentam conforme o andar. As posições candidatas de inimigos são embaralhadas por Fisher–Yates, filtradas por colisão e alcançabilidade e selecionadas sem reposição.

A seed derivada usa hash de runSeed + floorNumber. Mesma seed e andar reproduzem obstáculos e spawns. Cada nova expedição sorteia uma seed; `?debug=1&test=1&seed=42` fixa a seed e exibe run, andar e seed derivada. O RNG ambiental também é independente e determinístico por inimigo.

A geração valida spawn, saída e todos os inimigos com margem de 0,85 unidade e o navegador A* existente. Nenhuma posição sobreposta é aceita. A suíte percorre 40 seeds nos três andares, incluindo todos os segmentos das rotas. Trata-se de variação controlada de uma área aberta com estruturas, não de labirintos ou salas infinitas.

## 3. Andares e ciclo da run

| Andar | Dimensões | Slimes | HP por Slime | Ataque físico |
|---|---|---:|---:|---:|
| 1 | 24 × 24 | 3 | 80 | 12 |
| 2 | 28 × 28 | 4 | 100 | 14 |
| 3 | 32 × 32 | 5 | 120 | 16 |

Os três andares usam passividade individual. A pressão cresce com quantidade e atributos. Mortos não reaparecem durante a run. É necessário eliminar todos os inimigos comuns para subir; o terceiro também exige o boss. Há uma interação para abandonar junto ao spawn. Após o boss, a saída exige coletar o baú. Não há Andar 4.

O gerador puro generateFloor fica separado do estado da run em AreaSession. Ele produz dados de layout sem decidir descarte ou persistência; futuramente esses dados poderão ser armazenados e reutilizados. Persistência de andares e party não fazem parte desta versão. AreaSession conserva o mesmo personagem, combate e AbilityRuntime. O estado explícito da run contém seed, andar, seeds dos andares, inimigos restantes, timer do boss, vitória e coleta. Transições continuam limpando alvos, caminhos, projéteis, efeitos e apresentação anterior. Morte encerra a run e retorna com HP/MP completos após três segundos. Itens e recursos já recebidos permanecem.

## 4. IA passiva

EnemyAI recebeu movimento ambiental por inimigo: idle → wander → pause → turn → wander. Caminhadas usam navegação e colisão existentes; temporizadores e destinos usam PRNG individual. Proximidade não adquire aggro nos Slimes da expedição. Dano efetivamente aplicado provoca o alvo, reutilizando alert/chasing/attacking, leash e retorno anteriores. Outros Slimes não são alertados automaticamente. Seleção, mira, aproximação, entrada no alcance, ataques que erram e conjurações canceladas não provocam. Após voltar à origem, o inimigo recupera HP e reinicia o comportamento ambiental passivo. Inimigos da run não têm respawnTime nem temporizador de tentativa de respawn: após a breve apresentação da morte, ficam removidos. Uma nova run recria a população.

## 5. Boss provisório

Slime Guardião: modelo ampliado em 2×, raio 0,85, 300 HP, ataque físico 20 e velocidade de ataque 0,65/s. Usa o mesmo combate e perseguição. Permanece inativo até todos os comuns morrerem, espera dois segundos e entra em combate explicitamente. Barra de HP própria acompanha o encontro. Não há habilidades exclusivas ou arte definitiva.

## 6–8. XP, ouro e evolução

Configuração central em `src/domain/expedition.js`:

- Slime dos andares 1/2/3: 20/25/30 XP, respectivamente.
- Slime comum: somente XP, sem ouro.
- Boss: 100 XP.
- Baú: 80 a 120 ouro, além de um equipamento.
- Run completa: 410 XP e o baú; o ouro vem da abertura do baú.

Recursos são concedidos uma vez por derrota. XP preenche o progresso de nível; cada level up concede cinco pontos de atributo. O limiar inicial é 100 XP, aumentando 50 por nível, configurado em src/domain/character/balance.js. Uma run completa partindo do nível 1 termina no nível 3, com 160/200 XP e dez pontos antes da distribuição.

C permite distribuir os pontos entre STR, AGI, VIT, INT, DEX e LUK no Refúgio. Não há cobrança de XP ou ouro. Distribuir pontos não aumenta o nível. Ouro permanece separado e persistente. Valores e curvas são provisórios; a classe continua Novato.

## 9. Baú

A morte do boss cria uma única interação e representação física de baú. F coleta um item real com instanceId, definitionId, quantity e rewardSeed. A mensagem de coleta é temporária. O resultado da gravação é aguardado; falha restaura o personagem e mantém a coleta disponível. Inventário cheio mantém o baú no chão.

Baús só abrem no Refúgio. É exigido um espaço vazio antes da abertura. O baú só é removido junto da concessão do item e ouro. Tudo é salvo numa única transação de personagem; falha restaura o estado anterior. Fechar o jogo antes da concessão mantém o baú para tentar novamente.

## 10. Roleta

RewardReel, em src/ui/reward-reel.js, controla somente a apresentação. O resultado é determinado pela seed persistente do baú, antes da animação. As cartas percorrem uma esteira horizontal. Espaço inicia três segundos de desaceleração cúbica; a carta escolhida converge ao indicador central. A velocidade ou instante do input não muda o prêmio. O botão Desacelerar oferece a mesma ação.

O diálogo impede fechamento durante giro/concessão, pausa o mundo e mostra item e ouro após salvar. Não há compra, aposta ou moeda real. A suíte compara o resultado a 30, 60 e 144 FPS e diferentes instantes de parada.

## 11. Pool de itens

| Equipamento | Slot | Bônus |
|---|---|---|
| Capuz do Viajante | Cabeça | +2 defesa física |
| Colete do Viajante | Peitoral | +25 HP máximo |
| Botas do Viajante | Botas | +1 defesa física, +2 esquiva |
| Anel de Foco | Anel | +3 ataque mágico, +10 MP máximo |

Pool, pesos e seleção estão separados em src/domain/items/loot.js. A seleção aceita pesos explícitos validados. src/domain/items/chest.js prepara uma recompensa imutável antes da animação e concede exatamente esse resultado ao final, sem novo sorteio. A roleta recebe apenas os itens visuais e o resultado; não conhece probabilidades. Uma futura etapa educacional poderá fornecer pesos antes da seleção, mas nenhuma pergunta ou regra pedagógica foi implementada. Cada resultado tem peso igual. Não há novas raridades, tiers ou affixes. Equipamentos de recompensa podem repetir como instâncias independentes. A loja continua oferecendo somente as quatro armas de treino gratuitas e únicas. I equipa cada recompensa em seu slot e permite retirar equipamentos.

## 12. Save

Envelope Beta 0.1.0/schema 1 preservado. progressionVersion passa a 3. Saves da versão 2 consolidam o XP restante em níveis e pontos, preservando níveis, atributos e ouro já adquiridos. Não há reembolso de compras históricas; o campo upgrades é mantido apenas para compatibilidade. Recarregar não concede novamente os mesmos pontos. Inventário, rewardSeed e marcos de onboarding continuam validados.

Run, mapa, andar, inimigos, HP do boss, projéteis e aggro não são persistidos. Recarregar inicia no Refúgio. Continuam a cópia anterior, revisão contra sobrescrita entre abas e rollback das mutações de interface. Recursos de combate usam o autosave de dois segundos; fechamento abrupto pode perder os últimos instantes ainda não confirmados.

## 13. Testes

199 testes aprovados. Cobrem mapas reproduzíveis e alcançáveis, passividade, provocação apenas por impacto, projéteis, leash, recompensa única, ausência de respawn, progressão de andares, boss, coleta, inventário cheio, rollback, sementes de recompensa, pesos, concessão do resultado preparado, roleta em 30/60/144 FPS, progressão por XP, distribuição gratuita, migração e morte. Uma integração percorre a expedição inteira, abre a recompensa, distribui um ponto, recarrega e inicia outra run.

## 14. Playtest anterior ao adendo (registro histórico)

Playtest realizado no perfil separado test=1, reiniciado para nível 1, sem armas, itens ou técnicas. Depois do preparo, o debug foi removido da URL. Nenhuma concessão de recursos, teleporte, eliminação de inimigos ou pulo de andares foi usado durante a run.

Movimento, câmera, Armeiro, compra gratuita, cajado equipado, Bola de Energia e Regeneração aprendidas foram executados pela interface. A entrada levou ao mapa gerado; todos os Slimes vagaram sem aggro por proximidade. Um alvo provocado combateu enquanto os outros permaneceram passivos. As saídas liberaram após 3/3 e 4/4. No terceiro, 5/5 liberou o Guardião. Ele perseguiu e atacou sem precisar ser provocado, foi derrotado e deixou um único baú. A coleta trouxe o item para I; tentar abrir na Torre apresentou a mensagem correta de restrição. O portal retornou ao Refúgio.

O primeiro teste da roleta identificou um intervalo negativo entre performance.now e o primeiro callback de animação. Foi corrigido o limite inferior do delta. O baú não havia sido consumido; recarregar preservou a recompensa pendente. Reabertura e Espaço completaram a desaceleração, alinhando o Colete do Viajante no centro e concedendo 93 ouro. Saldo da run: 410 XP e 117 ouro. A compra de Inteligência custou 40 XP e 10 ouro, elevou INT de 5 para 6, nível de 1 para 2 e ataque mágico de 21,5 para 24. O colete foi equipado no peitoral. Após recarga: nível 2, 370 XP, 107 ouro, HP máximo 193, ataque mágico 24, cajado/colete e onboarding 9/9 preservados.

Depois da recarga, uma nova expedição foi iniciada pela interação normal do Portal, com nível 2 e três novos inimigos no Andar 1. Ao encerrar os testes, o perfil normal foi novamente reiniciado e verificado: nível 1, 0 XP, 0 ouro, mochila 0/32, todos os slots vazios e Primeiros passos 0/9. Os dados da run de validação permanecem somente no perfil de teste.

As capturas iteracao-07-inicio.png, iteracao-07-boss-vencido.png, iteracao-07-recompensa.png e iteracao-07-progressao.png registram a primeira implementação; seus valores de progressão paga foram substituídos pelo adendo.

### Verificação do adendo no navegador

O perfil test=1 migrou de nível 2 / 370 XP / 107 ouro / INT 6 para nível 4 / 20 XP / 107 ouro, recebendo dez pontos. Pela interface C foi distribuído um ponto em INT: INT 7, nove pontos restantes, ataque mágico 26,5, XP e ouro intactos. Recarregar confirmou persistência. Evidência: capturas/iteracao-07-adendo-progressao.png.

Esta verificação manual focalizou migração, interface, distribuição e recarga. O loop completo sob as regras corrigidas foi coberto pela integração automatizada; não foi repetido integralmente no navegador após o adendo. O perfil normal permaneceu no começo: nível 1, XP 0/100, ouro 0 e Primeiros passos 0/9. Nenhum novo reset foi necessário.

Build final aprovado: 52 módulos; JavaScript 686,80 kB, gzip 183,62 kB. O aviso de tamanho acima de 500 kB permanece.

## 15. Limitações

Geometria, ícones, sons sintetizados e interface são placeholders. Áreas são espaços abertos com módulos, não um gerador de masmorras complexas. Balanceamento inicial favorece aprendizado e experimentação. Ataques básicos à distância continuam sem projétil visual próprio. O sprite ainda usa a arte provisória anterior. Hotbar não é reorganizável.

Sem classes jogáveis, quests de classe, segundo bioma, boss definitivo, múltiplos bosses, economia completa, raridades, crafting, multiplayer ou perguntas educacionais. O aviso anterior de pacote gráfico acima de 500 kB permanece.
