# Dungeon Master — Iteração 21.2 / Beta 0.4.3

## 1. Resumo

Acabamento da apresentação existente: poses completas para quatro armas, cinco passos por direção, ferramentas ilustradas, NPCs coerentes, efeitos específicos e nomes de inimigos somente ao passar o mouse. Cidade, campanha, economia, habilidades e multiplayer mantêm suas regras.

Validação funcional local aprovada. Permanecem ressalvas de desempenho: torre perto de 80 FPS nesta máquina, abaixo da referência histórica, e um pico isolado de 453 ms. Não foi identificada causa conclusiva; detalhes e repetição estão no relatório de desempenho. Não se declara aprovação artística humana nem ausência absoluta de regressão.

## 2. Diagnóstico

O baseline foi executado no Electron antes das alterações, com perfis isolados. Confirmou joelhos excessivamente elevados na caminhada lateral. O pipeline anterior compunha pernas com tronco armado fixo, usava uma pose intermediária para equipamento e mantinha objetos geométricos para armas guardadas. Testes de UV e estados não detectavam esses problemas artísticos. O inventário inicial está em `iteration212/DIAGNOSTICO.md`.

## 3. Caminhada

Novas poses ilustradas de corpo inteiro, passos curtos, pés baixos e variação de braços/capa. A cadência permanece ligada à distância percorrida. Não há composição de pernas com tronco estático no runtime nem no empacotamento destes atlas. A inspeção usa gravações do renderer real e amostras temporais; não se limita a imagens do atlas.

## 4. Organização dos # Dungeon Master — Iteração 21.2 / Beta 0.4.3

## 1. Resumo

Acabamento da apresentação existente: poses completas para quatro armas, cinco passos por direção, ferramentas ilustradas, NPCs coerentes, efeitos específicos e nomes de inimigos somente ao passar o mouse. Cidade, campanha, economia, habilidades e multiplayer mantêm suas regras.

Validação funcional local aprovada. Permanecem ressalvas de desempenho: torre perto de 80 FPS nesta máquina, abaixo da referência histórica, e um pico isolado de 453 ms. Não foi identificada causa conclusiva; detalhes e repetição estão no relatório de desempenho. Não se declara aprovação artística humana nem ausência absoluta de regressão.

## 2. Diagnóstico

O baseline foi executado no Electron antes das alterações, com perfis isolados. Confirmou joelhos excessivamente elevados na caminhada lateral. O pipeline anterior compunha pernas com tronco armado fixo, usava uma pose intermediária para equipamento e mantinha objetos geométricos para armas guardadas. Testes de UV e estados não detectavam esses problemas artísticos. O inventário inicial está em `iteration212/DIAGNOSTICO.md`.

## 3. Caminhada

Novas poses ilustradas de corpo inteiro, passos curtos, pés baixos e variação de braços/capa. A cadência permanece ligada à distância percorrida. Não há composição de pernas com tronco estático no runtime nem no empacotamento destes atlas. A inspeção usa gravações do renderer real e amostras temporais; não se limita a imagens do atlas.

## 4. Organização dos atlas

PNG transparente, células inteiras, margem mínima verificada de oito pixels, ancoragem pelos pés e altura corporal normalizada. `pack-iteration212-atlas.cjs` separa poses completas e preserva metadados de origem/limites. `adjust-iteration212-poses.cjs` corrige algumas direções por espelhamento da pose inteira, sem recortar membros. Texturas reutilizam fontes decodificadas. A primeira troca de atlas mantém a pose anterior até a imagem estar pronta; ferramentas e ataques são antecipados quando aplicável.

## 5. Quantidade de quadros

| Atlas | Organização | Conteúdo |
|---|---|---|
| Aventureiro | 6 × 4, célula 320 | Idle + cinco passos, S/W/N/E |
| Cada uma das quatro armas | 6 × 8, célula 320 | Idle + cinco passos por direção, guardada e empunhada |
| Espada/adagas: transição | 8 × 4, célula 320 | Três poses paradas e cinco poses em movimento por direção |
| Arco/cajado: transição | 3 × 8 | Três poses por direção e variante parada/em movimento; cajado usa célula 512 |
| Cada arma: ação | 3 × 4 | Preparação, execução e reação a dano; espada usa célula 512 |
| Mineração/pescaria | 5 × 4 | Cinco fases por direção; pesca usa célula 512 |
| NPCs | 3 × 2, célula 320 | Seis personagens completos |
| Efeitos | 3 × 2, célula 256 | Flecha, energia, corte pesado, corte duplo, cura, contato |

## 6. Saque e guarda

Progressão visual contínua de equipamento, com variante determinada pelo movimento atual. Começar/parar não zera o progresso. Guarda percorre a sequência de saque em sentido inverso; nova ação hostil inverte o sentido sem reiniciar. Dano pausa brevemente a transição e tem prioridade visual. Mantidos 0,24 s de saque, 0,32 s de guarda e cinco segundos até guardar. Esses tempos nunca autorizam ou atrasam dano lógico.

## 7. Bainhas e aljava

Armas, bainhas, aljava e acessórios pertencem à ilustração da pose. Removido `weaponRoot` com modelos geométricos. As versões empunhadas preservam os acessórios vazios apropriados. Folhas com direções erradas ou acessórios duplicados foram rejeitadas/corrigidas antes da seleção final.

## 8. Inventário de habilidades

| Sistema existente | Apresentação integrada |
|---|---|
| Ataque básico de espada/adagas | Pose própria e contato, preservando alcance/cadência |
| Ataque básico de arco | Flecha ilustrada orientada para o alvo real |
| Ataque básico de cajado | Energia ilustrada |
| Golpe Poderoso | Preparação e corte pesado no impacto |
| Ataque Duplo | Dois contatos nos eventos reais |
| Tiro Duplo | Duas flechas lançadas pelo domínio |
| Bola de Energia | Preparação, projétil maior e contato mágico |
| Regeneração | Preparação e efeito verde nos ticks reais de cura |
| Slime mágico | Projétil mágico quando existente; rastro de contato anterior preservado |
| Dano/crítico/morte | Números e feedback existentes preservados |

São cinco habilidades ativas já existentes. Não foram criadas técnicas, custos ou recompensas. O online continua com seu conjunto atual de combate básico; habilidades e profissões locais não foram habilitadas no servidor.

## 9. Projéteis e magia

`combat-v043.png` substitui esferas genéricas por flecha com ponta/penas e energia com núcleo/rastro. O domínio continua responsável por trajetória, colisão, lançamento e dano. Efeitos de preparação não concedem impacto. A apresentação usa sprites com descarte de textura/material ao terminar e limite existente de efeitos simultâneos.

## 10. Profissões

Mineração: preparar, erguer, golpear, recuperar e descansar. O golpe somente é exibido após um `strike()` válido; timeout não simula uma extração. Pesca: preparar, lançar, esperar, fisgar e recolher. Revisões de apresentação acompanham eventos reais, sem mudar minigames, XP, itens ou persistência. A linha usa pontos de ancoragem da vara por direção/quadro, transformados pelo plano da câmera.

## 11. NPCs

Serafina, Marta, Brasa, Lina, Orin e Caio receberam sprites chibi completos, com escala corporal compatível com o protagonista. Prédios, posições, colisões, serviços e cidade foram preservados.

## 12. Retratos

Retratos elaborados anteriores permanecem nos diálogos online. Também são apresentados nos serviços locais correspondentes. O nome antigo “Mira” no painel da cozinha foi alinhado a Lina. Não houve substituição dos retratos por sprites pequenos.

## 13. Cursor e nomes

Nome contextual somente sobre inimigo válido sob o ponteiro; não aparece para morto, retornando, invisível, fora da tela ou encoberto por estrutura opaca. Diálogo, arraste de câmera, saída do canvas e interface sobreposta limpam o hover. Cursor de espada pequeno com hotspot 3,2; anel de seleção e painel do alvo preservados. Capturas CDP não incluem o cursor nativo do sistema operacional.

## 14. Evidências

`ITERACAO-21.2-CAPTURAS.md` separa gameplay real de fixtures de apresentação. Dois processos Electron com perfis descartáveis executam party, chat, ataque, coleta, viagem e reconexão por controles reais. A campanha usa equipamentos/técnicas e posições preparados somente no perfil de teste, depois cliques/teclas reais. A matriz de poses injeta estados no renderer e não prova combate por si só. Vídeos capturam o canvas, portanto não incluem o HUD HTML.

## 15. Testes

Suíte sequencial: **551/551 aprovados**, sem cancelamentos ou skips. Inclui saves, combate, recompensas, profissões, rede, doze identidades, party, transições e atlas. A primeira execução concorrente foi interrompida após identificar incompatibilidades de mocks de canvas/câmera; foram corrigidas, e os 45 testes de seleção/IA passaram antes da suíte completa. Mais 17/17 testes focados passaram após os ajustes finais. A rodada release-check confirmou cursor contextual, bloqueio sobre diálogos, habilidades e ferramentas. Os logs finais e verificações complementares acompanham este relatório. Build de produção validado; permanece aviso de bundle acima de 500 kB.

## 16. Desempenho

Resultados e limitações em `ITERACAO-21.2-DESEMPENHO.md`, com dados brutos JSON. Usa o benchmark existente, um Electron e onze clientes de protocolo para a cena de doze personagens. As condições não equivalem a doze computadores físicos. O agendador corrigido permanece byte a byte idêntico: SHA-256 `804EA8B0C53C24A3854F6AF8C7C289FBD9555421143DC5C3DAE8FFE7300BBAF9`.

## 17. Limitações conhecidas

As poses são ilustrações discretas, não animação esquelética. Guarda reutiliza saque invertido; transições têm menos quadros que a caminhada. Ainda pode haver pequenas diferenças de silhueta entre folhas de ação e locomoção, sobretudo com zoom alto. O teste artístico automatizado não substitui aprovação humana de movimento. A morte reutiliza a folha anterior. A linha de pesca usa âncoras manuais aproximadas. Não foram validados os computadores da escola, latência de internet ou doze Electron simultâneos. Picos de criação de mapas e custo da primeira carga de texturas continuam relevantes.

## 18. Arquivos

Principais alterações: `sprite-actor.js`, `visual-combat.js`, `activity-animation.js`, `combat-visual.js`, `fishing-visual.js`, `scene.js`, `city.js`, HUD de combate, world-mode, retratos de serviço, cozinha e CSS; revisões visuais em fishing/mining; atlas v043, cursor SVG, testes e scripts de inspeção/empacotamento. Os arquivos v042 foram conservados. A árvore já continha alterações de iterações anteriores; não foram revertidas.

## 19. Documentação

README, changelog e versões de cliente/servidor atualizados para 0.4.3. Assets selecionados e origem registrados em `ITERACAO-21.2-ARTES.md`. O diagnóstico inicial permanece como registro anterior à implementação, não como descrição final.

## 20. Entrega

Código e evidências locais. Sem commit, deploy, publicação ou instalador. Save pessoal preservado; todos os cenários destrutivos/preparados usam perfis isolados. Nenhuma Iteração 22 iniciada.

Encerramento em 19/10/2026: matriz Electron complementar aprovada em 32/32 combinações, após corrigir sincronização/oclusão do cenário de inspeção. Evidências atualizadas e servidor de desenvolvimento iniciado em http://127.0.0.1:5173/. A suíte funcional de 551 testes, os 17 focados e os benchmarks descritos acima foram executados em 16/10/2026; não foram repetidos integralmente nesta conclusão.
atlas

PNG transparente, células inteiras, margem mínima verificada de oito pixels, ancoragem pelos pés e altura corporal normalizada. `pack-iteration212-atlas.cjs` separa poses completas e preserva metadados de origem/limites. `adjust-iteration212-poses.cjs` corrige algumas direções por espelhamento da pose inteira, sem recortar membros. Texturas reutilizam fontes decodificadas. A primeira troca de atlas mantém a pose anterior até a imagem estar pronta; ferramentas e ataques são antecipados quando aplicável.

## 5. Quantidade de quadros

| Atlas | Organização | Conteúdo |
|---|---|---|
| Aventureiro | 6 × 4, célula 320 | Idle + cinco passos, S/W/N/E |
| Cada uma das quatro armas | 6 × 8, célula 320 | Idle + cinco passos por direção, guardada e empunhada |
| Espada/adagas: transição | 8 × 4, célula 320 | Três poses paradas e cinco poses em movimento por direção |
| Arco/cajado: transição | 3 × 8 | Três poses por direção e variante parada/em movimento; cajado usa célula 512 |
| Cada arma: ação | 3 × 4 | Preparação, execução e reação a dano; espada usa célula 512 |
| Mineração/pescaria | 5 × 4 | Cinco fases por direção; pesca usa célula 512 |
| NPCs | 3 × 2, célula 320 | Seis personagens completos |
| Efeitos | 3 × 2, célula 256 | Flecha, energia, corte pesado, corte duplo, cura, contato |

## 6. Saque e guarda

Progressão visual contínua de equipamento, com variante determinada pelo movimento atual. Começar/parar não zera o progresso. Guarda percorre a sequência de saque em sentido inverso; nova ação hostil inverte o sentido sem reiniciar. Dano pausa brevemente a transição e tem prioridade visual. Mantidos 0,24 s de saque, 0,32 s de guarda e cinco segundos até guardar. Esses tempos nunca autorizam ou atrasam dano lógico.

## 7. Bainhas e aljava

Armas, bainhas, aljava e acessórios pertencem à ilustração da pose. Removido `weaponRoot` com modelos geométricos. As versões empunhadas preservam os acessórios vazios apropriados. Folhas com direções erradas ou acessórios duplicados foram rejeitadas/corrigidas antes da seleção final.

## 8. Inventário de habilidades

| Sistema existente | Apresentação integrada |
|---|---|
| Ataque básico de espada/adagas | Pose própria e contato, preservando alcance/cadência |
| Ataque básico de arco | Flecha ilustrada orientada para o alvo real |
| Ataque básico de cajado | Energia ilustrada |
| Golpe Poderoso | Preparação e corte pesado no impacto |
| Ataque Duplo | Dois contatos nos eventos reais |
| Tiro Duplo | Duas flechas lançadas pelo domínio |
| Bola de Energia | Preparação, projétil maior e contato mágico |
| Regeneração | Preparação e efeito verde nos ticks reais de cura |
| Slime mágico | Projétil mágico quando existente; rastro de contato anterior preservado |
| Dano/crítico/morte | Números e feedback existentes preservados |

São cinco habilidades ativas já existentes. Não foram criadas técnicas, custos ou recompensas. O online continua com seu conjunto atual de combate básico; habilidades e profissões locais não foram habilitadas no servidor.

## 9. Projéteis e magia

`combat-v043.png` substitui esferas genéricas por flecha com ponta/penas e energia com núcleo/rastro. O domínio continua responsável por trajetória, colisão, lançamento e dano. Efeitos de preparação não concedem impacto. A apresentação usa sprites com descarte de textura/material ao terminar e limite existente de efeitos simultâneos.

## 10. Profissões

Mineração: preparar, erguer, golpear, recuperar e descansar. O golpe somente é exibido após um `strike()` válido; timeout não simula uma extração. Pesca: preparar, lançar, esperar, fisgar e recolher. Revisões de apresentação acompanham eventos reais, sem mudar minigames, XP, itens ou persistência. A linha usa pontos de ancoragem da vara por direção/quadro, transformados pelo plano da câmera.

## 11. NPCs

Serafina, Marta, Brasa, Lina, Orin e Caio receberam sprites chibi completos, com escala corporal compatível com o protagonista. Prédios, posições, colisões, serviços e cidade foram preservados.

## 12. Retratos

Retratos elaborados anteriores permanecem nos diálogos online. Também são apresentados nos serviços locais correspondentes. O nome antigo “Mira” no painel da cozinha foi alinhado a Lina. Não houve substituição dos retratos por sprites pequenos.

## 13. Cursor e nomes

Nome contextual somente sobre inimigo válido sob o ponteiro; não aparece para morto, retornando, invisível, fora da tela ou encoberto por estrutura opaca. Diálogo, arraste de câmera, saída do canvas e interface sobreposta limpam o hover. Cursor de espada pequeno com hotspot 3,2; anel de seleção e painel do alvo preservados. Capturas CDP não incluem o cursor nativo do sistema operacional.

## 14. Evidências

`ITERACAO-21.2-CAPTURAS.md` separa gameplay real de fixtures de apresentação. Dois processos Electron com perfis descartáveis executam party, chat, ataque, coleta, viagem e reconexão por controles reais. A campanha usa equipamentos/técnicas e posições preparados somente no perfil de teste, depois cliques/teclas reais. A matriz de poses injeta estados no renderer e não prova combate por si só. Vídeos capturam o canvas, portanto não incluem o HUD HTML.

## 15. Testes

Suíte sequencial: **551/551 aprovados**, sem cancelamentos ou skips. Inclui saves, combate, recompensas, profissões, rede, doze identidades, party, transições e atlas. A primeira execução concorrente foi interrompida após identificar incompatibilidades de mocks de canvas/câmera; foram corrigidas, e os 45 testes de seleção/IA passaram antes da suíte completa. Mais 17/17 testes focados passaram após os ajustes finais. A rodada release-check confirmou cursor contextual, bloqueio sobre diálogos, habilidades e ferramentas. Os logs finais e verificações complementares acompanham este relatório. Build de produção validado; permanece aviso de bundle acima de 500 kB.

## 16. Desempenho

Resultados e limitações em `ITERACAO-21.2-DESEMPENHO.md`, com dados brutos JSON. Usa o benchmark existente, um Electron e onze clientes de protocolo para a cena de doze personagens. As condições não equivalem a doze computadores físicos. O agendador corrigido permanece byte a byte idêntico: SHA-256 `804EA8B0C53C24A3854F6AF8C7C289FBD9555421143DC5C3DAE8FFE7300BBAF9`.

## 17. Limitações conhecidas

As poses são ilustrações discretas, não animação esquelética. Guarda reutiliza saque invertido; transições têm menos quadros que a caminhada. Ainda pode haver pequenas diferenças de silhueta entre folhas de ação e locomoção, sobretudo com zoom alto. O teste artístico automatizado não substitui aprovação humana de movimento. A morte reutiliza a folha anterior. A linha de pesca usa âncoras manuais aproximadas. Não foram validados os computadores da escola, latência de internet ou doze Electron simultâneos. Picos de criação de mapas e custo da primeira carga de texturas continuam relevantes.

## 18. Arquivos

Principais alterações: `sprite-actor.js`, `visual-combat.js`, `activity-animation.js`, `combat-visual.js`, `fishing-visual.js`, `scene.js`, `city.js`, HUD de combate, world-mode, retratos de serviço, cozinha e CSS; revisões visuais em fishing/mining; atlas v043, cursor SVG, testes e scripts de inspeção/empacotamento. Os arquivos v042 foram conservados. A árvore já continha alterações de iterações anteriores; não foram revertidas.

## 19. Documentação

README, changelog e versões de cliente/servidor atualizados para 0.4.3. Assets selecionados e origem registrados em `ITERACAO-21.2-ARTES.md`. O diagnóstico inicial permanece como registro anterior à implementação, não como descrição final.

## 20. Entrega

Código e evidências locais. Sem commit, deploy, publicação ou instalador. Save pessoal preservado; todos os cenários destrutivos/preparados usam perfis isolados. Nenhuma Iteração 22 iniciada.

Encerramento em 19/10/2026: matriz Electron complementar aprovada em 32/32 combinações, após corrigir sincronização/oclusão do cenário de inspeção. Evidências atualizadas e servidor de desenvolvimento iniciado em http://127.0.0.1:5173/. A suíte funcional de 551 testes, os 17 focados e os benchmarks descritos acima foram executados em 16/10/2026; não foram repetidos integralmente nesta conclusão.
