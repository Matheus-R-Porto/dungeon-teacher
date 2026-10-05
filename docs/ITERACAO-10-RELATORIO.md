# Iteração 10 — Life Skills Foundation + Fishing

Implementação sobre a Iteração 09. O usuário reduziu explicitamente a validação manual: um andar representativo é suficiente; não repetir os três andares, boss e baú a cada mudança. O relatório distingue observação manual de cobertura automatizada. Save existente preservado.

## 1. Auditoria

Antes de alterar o projeto, os 247 testes existentes e o build passaram. Foram inspecionados geração, lagos, navegação, interações, combate, habilidades, inventário e salvamento. A integração acrescenta significado aos lagos existentes. Não altera escala, regiões, trilhas, encontros ou geometria dos lagos. Uma referência de 36 layouts verifica hashes da topologia, trilhas, spawns, marcos e barreiras.

## 2. Life Skill Foundation

`src/domain/life-skills.js` concentra definições, progresso, curva e validação. Fishing é a única profissão ativa. Cooking, Mining e Smithing têm apenas definições inativas, sem runtime, receitas ou conteúdo. Progresso em `character.lifeSkills.fishing`, separado dos atributos, XP de personagem e Skill Slots. Saves antigos recebem Pesca 1 / XP 0 por migração aditiva.

## 3. Fishing Progression

Começa no nível 1, com XP 0. Próximo nível exige `30 + (nível - 1) × 20`: 30, 50, 70 etc. O excedente é preservado e múltiplas subidas são suportadas. Limite provisório: nível 50. A curva e valores estão centralizados. Não cobra XP, ouro ou pontos de atributo. Níveis 2 e 3 ampliam o pool de espécies.

## 4. Vara de Pesca

Ferramenta única, gratuita no Armeiro existente. Basta permanecer na mochila. Não ocupa slot de arma e não concede ataque. Aquisição e persistência foram verificadas pela interface; o Cajado de Treino continuou equipado.

## 5. Water Features

`src/world/water-features.js` materializa dados de água a partir do tipo semântico de marco aquático, sem inferir pelo nome. Cada água tem identidade, região, limites elípticos, compatibilidade de pesca e margem. O renderer utiliza os mesmos limites. A água decorativa continua com a colisão da Iteração 09; esta entrega valida a posição seca de início de pesca, não implementa natação ou bloqueio global da água.

## 6. Lago dos Vaga-lumes

O primeiro desvio aquático recebe um ponto de pesca sinalizado. Foi encontrado seguindo o desvio e usado sem derrotar os dois slimes passivos. O lago, a clareira e o acesso são os existentes. Linha, boia e pulso de fisgada dão feedback durante a atividade.

## 7. Lago das Raízes

Não foi habilitado para pesca nesta versão. Pertence à rota principal e, em alguns layouts, contém um encontro obrigatório. Evitou-se sobrepor preparação tranquila de pesca e passagem de combate. Continua representado como água semântica, permitindo habilitação futura por configuração/regra explícita.

## 8. Fishing Spots

Um ponto por lago compatível, quantidade configurável. A seleção usa uma stream determinística própria, verifica margem seca, espaço para o personagem, navegação desde a região, distância entre pontos e exclusão de encontros obrigatórios. A boia fica dentro da água, e o personagem olha para ela. Testados 90 layouts para validade; o benchmark adicional gerou 300 andares sem fallback. Não se acrescentou lago, região ou trilha para acomodar a atividade.

## 9. Minigame

F inicia junto à margem. Estados: lançamento → espera → fisgada → sucesso/falha; salvamento é uma etapa separada. Lançamento de 0,35 s, espera aleatória de 1–3 s, reação de 1,2 s. F ou Espaço puxa; Esc cancela. Puxar cedo ou tarde falha. Sucesso concede exatamente um peixe e seu XP de Pesca. Cooldown local de 2,5 s por ponto. Sem segunda fase, iscas, stamina ou durabilidade.

## 10. Interrupções

Durante a atividade, movimento, ataques, habilidades, equipamentos e interações concorrentes são bloqueados. O mundo segue simulando; câmera permanece disponível. Impacto hostil válido, dano, morte, mudança de área, abandono ou cancelamento interrompem a tentativa ativa sem prêmio. Esses casos estão cobertos por testes de domínio. Depois de uma puxada válida, o prêmio é preparado e salvo atomicamente; falha de gravação não concede peixe nem XP e não restaura indevidamente dano concorrente.

## 11. Espécies

| Espécie | Nível mínimo | Peso | XP Pesca |
|---|---:|---:|---:|
| Lambari do Limiar | 1 | 55 | 6 |
| Carpa dos Vaga-lumes | 1 | 30 | 8 |
| Bagre Musgoso | 1 | 15 | 10 |
| Peixe-Lua | 2 | 12 | 12 |
| Peixe Rúnico | 3 | 5 | 16 |

Os pesos são relativos ao pool elegível, não porcentagens fixas nos níveis superiores. Definições incluem descrição, item associado e tags `fish` / `ingredient`.

## 12. Inventário

Peixes são recursos empilháveis até 99 unidades. Pilhas parciais recebem novas unidades antes de ocupar outro slot. Antes de lançar, pelo menos uma espécie elegível deve caber; na captura, a espécie sorteada é verificada novamente. Se ela não couber, há mensagem explícita e nenhum prêmio parcial. Peixe e XP são gravados juntos. A interface informa que ingredientes ainda não podem ser consumidos. Testes cobrem pilha cheia, transbordamento, mochila lotada, quantidade inválida e rollback.

## 13. RNG

Geração de pontos e tentativas têm streams distintas. A stream da atividade avança a cada lançamento, evitando repetir eternamente a mesma captura. Espécie e espera são determinadas no domínio ao iniciar a tentativa. A apresentação não escolhe o prêmio; FPS não participa do sorteio. Sequências reproduzíveis e captura em 30/60/144 FPS foram verificadas.

## 14. Playtest sem Fishing

Dois andares atravessados sem vara e sem pescar, chegando ao terceiro. Os encontros liberaram as passagens e os dois portais funcionaram. Pesca permaneceu 1 / XP 0; ouro 628. No último registro junto à saída: andar 1 com cerca de 361 s; andar 2 com 172 s. Esses tempos incluem pausas do operador e ferramentas e não medem ritmo humano. O primeiro andar também inclui a retomada de contexto. Após a orientação do usuário, não se repetiu boss/baú/loop completo; a sessão foi recarregada para preparar o teste específico.

## 15. Playtest com Fishing

Vara obtida e preservada ao recarregar. No Lago dos Vaga-lumes, uma puxada antecipada produziu “Muito cedo!” sem prêmio. Depois, cinco capturas: 2 Lambaris, 2 Bagres e 1 Carpa, total de 40 XP. Resultado: Pesca nível 2, XP 10 / 50. XP de combate ficou em 816 durante todas as capturas; ouro permaneceu 628. Capturas usaram F e Espaço. As entradas de reação foram assistidas pela leitura do aviso visível da interface, não por acesso ao estado interno. O teste não mede tempo de reação de uma pessoa.

## 16. Playtest do Lago dos Vaga-lumes

O andar com vara foi concluído, incluindo ambos os encontros obrigatórios e passagem ao andar 2. Registro: 606,73 s e 352,03 m, com pausas de operação/documentação incluídas. Encerrada a expedição pelo portal de abandono na entrada do andar 2, sem repetir o restante do loop. Dados em `ITERACAO-10-RUN-COM-PESCA.txt`. Após retornar e recarregar, a interface confirmou os mesmos cinco peixes, vara, Pesca nível 2 / XP 10 de 50 e ouro 628. O XP de personagem terminou em 840 após os combates. Evidência: `capturas/iteracao10-peixes-salvos.png`.

Identificação do desvio, chegada ao lago, aproximação da margem, falha antecipada, cooldown, cinco sucessos e saída de volta à trilha foram observados. Os dois slimes ficaram passivos e continuaram seu comportamento ambiental. O retorno à trilha e ao combate não exigiu desequipar ferramenta nem fechar uma tela especial. Teste focado incorporado à sessão com vara, sem uma terceira expedição completa.

## 17. Impacto na exploração

O desvio agora oferece um recurso persistente e progressão independente do combate. Há uma razão funcional para visitar o lago e voltar ao percurso. A sinalização foi localizável no teste. A conclusão de que isso é divertido ou gera vontade de repetir depende do playtest humano; não foi tratada como comprovada por automação.

## 18. Ritmo

Cada tentativa bem-sucedida exige lançamento, 1–3 s de espera, reação e 2,5 s de recuperação do ponto. O intervalo ativo nominal até a fisgada é 1,35–3,35 s; a reação tem até 1,2 s. As cinco capturas ocorreram entre aproximadamente 275 e 335 s do relógio do andar, incluindo pausas entre ferramentas. Não há medição isolada de espera humana. O ganho visível e a subida após cinco capturas validam o feedback inicial; repetição de longo prazo continua provisória.

## 19. Testes

279 testes passaram: os 247 anteriores mais 32 novos; zero falhas, cancelamentos ou skips. Cobertura inclui fundação, migração, rod/tool, pesos, stacks, fases e timings, FPS, interrupções, transação de prêmio, RNG, não interferência nos encontros, margem e preservação da Iteração 09. Build de produção aprovado. Conforme instrução posterior do usuário, cobertura compartilhada e um andar representativo substituem a repetição manual de todos os andares.

## 20. Performance

`scripts/iteration10-performance.mjs` gerou 100 seeds por andar. Tempo total de geração, mediana/p95: andar 1, 22,86/50,28 ms; andar 2, 41,20/71,65 ms; andar 3, 30,76/44,33 ms. Zero fallback. São medições CPU locais, não FPS. Dados completos em `ITERACAO-10-PERFORMANCE.json`.

No lago, amostras visíveis variaram aproximadamente de 86 a 119 FPS, com p95 de frame entre 8,5 e 33,4 ms. Não houve benchmark A/B isolado dos efeitos, portanto não se atribui toda variação à pesca. O renderer acrescenta apenas marcação, linha, boia e anel enquanto necessário. Save usa o repositório existente e cresce apenas com progresso e stacks; não há benchmark separado de latência de armazenamento.

Build: 61 módulos, JS 720,65 kB (195,73 kB gzip), CSS 22,84 kB (6,24 kB gzip). O aviso de chunk acima de 500 kB já existia; não é erro de build.

## 21. Limitações

Arte geométrica provisória; nenhuma animação corporal de vara dedicada. Cinco espécies, um ponto por lago opcional e curva inicial precisam de avaliação humana. Ingredientes não possuem consumo nem venda. Fishing não habilitada nos lagos da rota principal. Não implementados Cooking, Mining, Smithing, iscas, durabilidade, persistência dos layouts ou novo andar. A suíte não elimina a possibilidade de bugs que apareçam no uso; novos relatos orientarão correções focadas. Não foi iniciada a Iteração 11.
