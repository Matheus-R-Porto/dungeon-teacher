# Dungeon Master — Beta 0.1.0 — Iteração 09

Relatório de implementação e validação. Fechamento: 05/10/2026.

A Torre passou a ter regiões conectadas, desvios opcionais, encontros locais e barreiras de raízes. O ciclo Refúgio → três andares → Guardião → baú → retorno → recompensa foi concluído três vezes pela interface, no perfil normal. A fundação funciona, mas a meta de ritmo e variedade ainda tem ressalvas: a rota direta pode ser curta, há caminhadas repetitivas e a sinalização lateral precisa de acabamento. Não considerar estes resultados aprovação irrestrita de todos os critérios subjetivos do prompt.

Antes das alterações, foram inspecionados geração, áreas, combate, IA, navegação, colisão, HUD, renderização e persistência; os 231 testes existentes passaram. Uma expedição da Iteração 08 foi jogada até abrir o baú no Refúgio, recebendo Botas Ágeis e 87 de ouro. Os tempos dessa auditoria são estimativas (35–45 s nos dois primeiros andares e 1,5–2,5 min no terceiro, incluindo recuperação das ferramentas), não medições comparáveis às tabelas abaixo.

## 1. Arquitetura do andar

`src/world/floor-graph.js` define FloorGraph: entrada, saída, caminho principal, regiões, conexões, tipos, nomes e vínculos de gates. `src/world/tower.js` transforma esse grafo em terreno, trilhas, obstáculos, encontros e pontos de interesse. `AreaSession`, em `src/simulation/areas.js`, controla a expedição e seus estados temporários.

FloorGenerator e RunState permanecem separados. O save contém o personagem; não recebe geometria, grafo ou estado de encontros. A geração não depende de dados persistidos do personagem. A futura persistência de andares não foi implementada.

## 2. Geração

A topologia cria 9, 10 e 11 regiões principais nos andares 1, 2 e 3. Conexões recebem trilhas com ponto intermediário variável; clareiras são discos e corredores são cápsulas, formando uma área caminhável contínua. A decoração usa árvores, pedras, vegetação, ruínas e landmarks de geometria simples.

A composição obrigatória mantém os perfis da Iteração 08, distribuídos em dois encontros. A população opcional usa uma sequência aleatória independente. A geração é validada antes do uso e possui no máximo três tentativas determinísticas; se todas falharem, lança erro explícito. Nas 300 amostras de performance não houve tentativa de fallback.

## 3. Escala

| Andar | Arena anterior, aproximadamente | Limites atuais medianos, largura × profundidade | Regiões totais | Extensão mediana da trilha principal |
|---|---:|---:|---:|---:|
| 1 | 24 × 24 | 85 × 220 | 10 | 299 m |
| 2 | 28 × 28 | 124 × 253 | 12–14 | 345 m |
| 3 | 32 × 32 | 125 × 291 | 13–15 | 390 m |

Os limites incluem espaços não caminháveis entre trilhas. A extensão da linha central não é a distância efetivamente percorrida: o jogador pode cortar curvas dentro das clareiras. As dimensões atuais vêm da amostragem de 100 seeds por andar em [ITERACAO-09-PERFORMANCE.json](ITERACAO-09-PERFORMANCE.json).

## 4. Caminho principal

A sequência de regiões entre entrada e saída é explícita e validada. Cada conexão é materializada em terreno caminhável. A passagem obrigatória contém dois encontros locais; derrotar cada grupo abre sua saída. Os testes verificam o percurso com gates resolvidos em sequência, incluindo aproximação dos inimigos e chegada ao portal.

A saída precisa ser alcançada fisicamente. Não há teleporte automático após o último inimigo, e o minimapa da Torre foi removido; o mapa do Refúgio permanece.

## 5. Bifurcações

O andar 1 tem um desvio; os andares 2 e 3 têm dois. Algumas seeds prolongam um desvio com uma região terminal adicional. Pedras douradas e setas indicam continuidade principal; pedras azuis e rótulos locais identificam desvios. O jogador pode voltar pela conexão de entrada, sem gate opcional.

As escolhas atuais são continuar ou visitar um ramo e retornar. Não há uma rede ampla de caminhos alternativos ou atalhos entre trechos principais.

## 6. Regiões opcionais

Lago dos vaga-lumes e Memorial esquecido contêm encontros opcionais; Pedra do eco pode prolongar a excursão. Esses locais têm identidade visual e concedem XP pelos inimigos. Não há bônus por visitar ou exterminar todo o andar.

Pontos `futureResource` são apenas metadados de extensão futura: não concedem recursos, não oferecem interação de coleta e não introduzem pesca, mineração ou economia. Não existem baús secundários.

## 7. Encontros

Cada encontro possui seus próprios IDs de inimigos, região e estado: pending, active ou completed. Os obrigatórios somam 3/4/5 inimigos por andar, divididos em 1+2, 2+2 e 2+3. Os opcionais acrescentam 2/4/4, respectivamente.

Os inimigos comuns continuam passivos até receber impacto hostil válido. Selecionar, aproximar e tentar um ataque que não acertou não são novas fontes de aggro. Comportamento ambiental, perseguição, leash e retorno à passividade foram preservados. Não há respawn durante a expedição; uma nova run recria a população.

XP continua preenchendo níveis e concedendo pontos de atributo/espaços de habilidade. Ouro permanece separado. A Iteração 09 não aumentou HP para alongar os andares.

## 8. Gates

Raízes fecham a conexão de saída de cada encontro obrigatório. Sua colisão e representação visual são removidas quando os IDs daquele encontro foram derrotados. Matar um inimigo de outro grupo ou um opcional não satisfaz o gate.

A entrada da clareira permanece aberta, permitindo recuar. A validação e os testes encadeados cobrem aproximação, abertura e continuidade; as três partidas concluídas não apresentaram deadlock. Clicar diretamente além de uma barreira fechada retorna a mensagem de caminho indisponível, em vez de atravessá-la.

## 9. Landmarks

Há cinco tipos: Árvore ancestral, Pedra rúnica, Lago das raízes, Ruína dos viajantes e Tronco antigo. A seleção evita repetição imediatamente consecutiva; os nomes aparecem ao visitar a região. O arco de saída e a clareira do Guardião marcam os destinos finais.

Os landmarks são placeholders. Vários são decorativos, enquanto coberturas e limites caminháveis possuem colisão própria. Árvores e painéis ainda podem prejudicar a leitura em certos ângulos; os rótulos de trilha também podem se projetar sobre coberturas.

## 10. Identidade dos andares

| Andar | Identidade atual |
|---|---|
| Borda da Floresta | Trilhas mais largas, paleta clara, um desvio, população obrigatória simples. |
| Floresta Densa | Vegetação e atmosfera mais densas, trilhas menores, dois desvios e Saltadores. |
| Coração da Floresta | Ruínas, paleta mais escura, encontros mistos com inimigos mágicos e destino na região do boss. |

As diferenças são perceptíveis, mas compartilham o mesmo esqueleto de progressão. Ainda não equivalem a três famílias totalmente distintas de layout.

## 11. Boss region

O Guardião fica dormente na última clareira do andar 3. Resolver encontros obrigatórios é necessário, mas não suficiente: o jogador precisa chegar à região final. Após dois segundos nessa condição, ocorre a ativação. O boss mantém seus 300 HP e regras anteriores.

Vitória gera o baú; F coleta, o portal permite retornar e a abertura ocorre no Refúgio. Nas três partidas foram confirmados coleta, retorno, roleta, item e ouro. O resultado da recompensa permanece definido pelo domínio, separado da apresentação da roleta.

## 12. Procedural

As seeds derivam sequências distintas para topologia, geometria, decoração, encontros opcionais e comportamento ambiental. A mesma seed reproduz o conteúdo sem depender do FPS. A composição principal continua usando o gerador de encontros existente.

Variam espelhamento, deslocamentos de regiões, curvas, landmarks, composição e prolongamento dos desvios. A ordem estrutural da rota principal ainda é baseada em um zigue-zague: o teste comprova variações de dados, não variedade ilimitada de experiência.

## 13. Navegação

A navegação distante usa o grafo para selecionar regiões acessíveis e A* local para conectar segmentos. Gates fechados são excluídos. A* utiliza heap binário e área local de busca, evitando percorrer uma grade do andar inteiro a cada solicitação. O caminho elimina pontos iniciais já visíveis, reduzindo o retorno desnecessário ao recalcular perseguição.

Um defeito real encontrado no playtest foi corrigido: a amostragem de linha de visão podia ignorar uma pequena lacuna côncava entre áreas caminháveis, produzindo um caminho que o movimento não conseguia seguir. A verificação passou a unir intervalos exatos de interseção do segmento com discos/cápsulas. Há teste de reprodução e teste que executa movimento por 30 layouts completos.

Os testes de geração usam raio conservador de 0,85. Também verificam obstáculos, limites, rotas opcionais de ida/volta, encontros e saída. Isto não elimina toda dificuldade de clique: escolher uma cobertura ou um destino atrás de gate ainda pode falhar, e a UI precisa comunicar isso melhor.

## 14. Performance

Medição de CPU em Node, 100 seeds por andar. Gates abertos apenas no cenário sintético de medição da rota completa; isso não foi usado nas partidas manuais.

| Andar | Geração mediana | Geração p95 | Navegação da rota completa p95 |
|---|---:|---:|---:|
| 1 | 21,54 ms | 42,93 ms | 31,20 ms |
| 2 | 51,11 ms | 79,94 ms | 56,40 ms |
| 3 | 38,15 ms | 61,18 ms | 36,55 ms |

A maior parcela da geração é a validação física. Os três andares são gerados no início da run, portanto esses custos podem se acumular na entrada. Não confundir tempo de Node com custo total de montagem da cena no navegador.

Na interface foram observadas amostras de aproximadamente 55–120 FPS, frame p95 usual entre 8,5 e 25 ms, com amostra de 33,4 ms durante combate. Cenas de floresta mostraram aproximadamente 35–78 draws e 29–45 mil triângulos. O Refúgio permanece próximo de 798 draws e 23,6 mil triângulos; não foi otimizado nesta iteração. Instâncias compartilham árvores, pedras e vegetação.

Essas são observações locais, não benchmark contínuo nem garantia em outras máquinas. Ocorreram limitações de execução em segundo plano durante tentativas preliminares; essas tentativas não contam como runs completas. A amostragem usa `?perf=1`, sem alterar as regras da partida. O modo sintético de stress não é uma run de aceitação e sua população não corresponde aos IDs dos gates normais.

## 15. Playtest — Run 1

Rota direta, sem visitar ou matar opcionais. Perfil normal, Cajado de Treino, Capuz do Viajante e Bola de Energia. Nenhum teleporte, eliminação instantânea ou abertura de gate por debug.

| Andar | Tempo registrado | Distância | Regiões visitadas | Encontros obrigatórios/opcionais concluídos | Opcionais vivos |
|---|---:|---:|---:|---:|---:|
| 1 | 3min10s | 244,9 m | 9 | 2 / 0 | 2 |
| 2 | 3min37s | 300,3 m | 10 | 2 / 0 | 4 |
| 3 | 4min04s | 327,1 m | 11 | 2 / 0, mais boss | 4 |

Total: aproximadamente 10min50s e 872,2 m. Todas as subidas funcionaram com opcionais vivos. A trilha dourada orientou a progressão; trechos entre clareiras foram tranquilos e repetitivos. A chegada ao boss tornou o destino mais claro que a arena única anterior. Dificuldade baixa para o personagem já desenvolvido, sem morte.

Início: nível 3, XP 420 e ouro 286. Final: nível 4, XP 76 e ouro 397. Recompensa: Capuz do Aprendiz e 111 de ouro; item não equipado. Dados exatos: [RUN1](ITERACAO-09-RUN1.txt).

## 16. Playtest — Run 2

Exploração do desvio do andar 1, seguida de rota principal nos andares 2 e 3. Uma tentativa anterior interrompida havia deixado o personagem com XP 88; ela não é contabilizada como run completa.

| Andar | Tempo registrado | Distância | Regiões visitadas | Encontros obrigatórios/opcionais concluídos | Opcionais vivos |
|---|---:|---:|---:|---:|---:|
| 1 | 4min41s | 327,5 m | 10 | 2 / 1 | 0 |
| 2 | 6min45s* | 312,0 m | 10 | 2 / 0 | 4 |
| 3 | 3min36s | 325,3 m | 11 | 2 / 0, mais boss | 4 |

*O andar 2 inclui aproximadamente três minutos parado durante retomada de contexto. Esse tempo bruto foi preservado, não deve ser interpretado como duração de conteúdo. Todos os tempos incluem pausas de observação e interação das ferramentas; são tempo de simulação registrado, não cronometragem de um jogador humano contínuo.*

No andar 1, foi necessário voltar à bifurcação passada; o Lago e as pedras azuis ajudaram a reconhecer o desvio. Os dois inimigos opcionais concederam 24 XP e não reapareceram no retorno. Nos andares 2 e 3, pontos sobre coberturas exigiram clicar ao lado. Nenhum bloqueio permanente; combate de baixa dificuldade, com dano leve de magos/boss. As longas trilhas continuaram sendo o principal trecho vazio.

Início: nível 4, XP 88, ouro 397. Final: XP 368, ouro 510. Recompensa: Botas do Viajante e 113 de ouro; item não equipado. Dados exatos: [RUN2](ITERACAO-09-RUN2.txt).

## 17. Playtest — Run 3

Outra geração, mantendo o equipamento. Rota direta no andar 1, desvio no andar 2 e rota principal até o boss no andar 3.

| Andar | Tempo registrado | Distância | Regiões visitadas | Encontros obrigatórios/opcionais concluídos | Opcionais vivos |
|---|---:|---:|---:|---:|---:|
| 1 | 1min57s | 237,7 m | 9 | 2 / 0 | 2 |
| 2 | 4min14s | 394,3 m | 11 | 2 / 1 | 2 |
| 3 | 4min05s | 336,7 m | 11 | 2 / 0, mais boss | 4 |

Total: aproximadamente 10min16s e 968,7 m. A familiaridade acelerou muito o andar 1. No andar 2, a bifurcação inicialmente ficou abaixo da câmera/painéis, sendo necessário retroceder; o desvio concedeu 30 XP. A segunda região opcional ficou intocada e não bloqueou a saída. No andar 3, houve combinação de Mágico, Saltador e comum, com contorno de coberturas. Sem morte; dificuldade baixa neste nível. Landmarks mudaram, mas a repetição de curvas e clareiras ainda foi evidente.

Início: nível 4, XP 368, ouro 510. Final: XP 654, ouro 628. Recompensa: Colete Leve e 118 de ouro; item não equipado. Dados exatos: [RUN3](ITERACAO-09-RUN3.txt).

O servidor local precisou ser reiniciado ao final. Reabrir o jogo confirmou nível 4, XP 654, ouro 628 e primeiros passos completos. Nenhum reset de save foi introduzido nesta iteração.

## 18. Rota direta versus exploração

| Comparação indicativa | Direta | Exploratória |
|---|---:|---:|
| Andar 1 — Run 1 versus Run 2 | 244,9 m / 3min10s | 327,5 m / 4min41s |
| Andar 2 — Run 1 versus Run 3 | 300,3 m / 3min37s | 394,3 m / 4min14s |

As seeds e a familiaridade são diferentes, portanto não é um experimento controlado. A exploração aumentou distância e XP, sem obrigatoriedade e sem recurso novo. Os exemplos exploratórios ficaram na faixa de 4–6 minutos; isso não demonstra que todo andar atingirá essa meta. O andar 1 conhecido foi concluído em menos de dois minutos. A variedade e o ritmo precisam de avaliação com jogadores novos, sobretudo porque as ferramentas introduzem pausas.

## 19. Testes

Resultado da suíte final: **247 testes, 247 aprovados, zero falhas, zero ignorados**; aproximadamente 161 segundos. Eram 231 antes da implementação. As expectativas antigas de eliminar todo o andar/ativar boss à distância foram adaptadas à nova regra, sem remover a cobertura de regressão.

Cobertura nova inclui grafo em 150 seeds por andar, navegação com gates em 20 seeds por andar, determinismo, opcionais independentes, XP único, ausência de respawn, boss por chegada, isolamento do save, lacuna côncava e movimento real por 30 layouts. A suíte existente continua cobrindo combate, quatro armas, habilidades, morte em quatro contextos, inventário, loot, progressão, save, IA e validação de geração. Testes de domínio usam preparação sintética de estados; as três runs de UI acima não usam esses atalhos.

Build de produção aprovado, 55 módulos: JS aproximadamente 707,58 kB (191,34 kB gzip), CSS 21,74 kB (5,93 gzip) e HTML 7,80 kB (3,09 gzip). Permanece o aviso de chunk maior que 500 kB. Os testes/build foram feitos na revisão jogada; o fechamento posterior alterou apenas documentação.

Evidências: [CPU](ITERACAO-09-PERFORMANCE.json), [Run 1](ITERACAO-09-RUN1.txt), [Run 2](ITERACAO-09-RUN2.txt), [Run 3](ITERACAO-09-RUN3.txt), [exploração](capturas/iteracao09-exploracao.png), [recompensa final](capturas/iteracao09-recompensa.png).

## 20. Limitações

- Topologia ainda baseada em zigue-zague e ramos de ida/volta; variações de seed não escondem totalmente esse padrão.
- A escala cresceu, mas parte do tempo consiste apenas em caminhar. A meta de 4–6 minutos de exploração é provisória, não comprovada para todos os andares ou novos jogadores.
- Rótulos podem coincidir com coberturas; alguns cliques exigem escolher chão próximo. Árvores e o painel de primeiros passos podem ocultar regiões importantes em determinados ângulos.
- Arte, terreno, raízes, landmarks e transições são placeholders. Elementos decorativos nem sempre têm colisão correspondente.
- Geração/validação síncrona pode causar custo perceptível na entrada; medições de CPU e FPS locais não cobrem todos os equipamentos.
- O painel de performance atualiza periodicamente e pode mostrar a amostra do andar anterior logo após uma transição; os registros finais foram coletados depois dessa atualização.
- O modo de stress sintético não serve para testar gates ou completar o ciclo normal. Não foi usado para aceitar as runs.
- As três runs utilizaram personagem já desenvolvido e Cajado; a suíte testa outras armas, mas isto não substitui playtest humano de balanceamento desde um save novo.
- Layouts continuam temporários, sem persistência da Torre, revisita persistida ou party. Não foram iniciados classes, conteúdo educacional, novos recursos, Floor 4 ou Iteração 10.

O ciclo funcional da Iteração 09 está validado. O acabamento de orientação e a diversidade da aventura permanecem explicitamente provisórios.
