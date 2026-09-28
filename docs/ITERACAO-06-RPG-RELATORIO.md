# Iteração 06 — Inventário, equipamentos, árvore e primeiro andar

Este relatório complementa a entrega anterior do kit de habilidades da Iteração 06. O novo prompt preservado em `ITERACAO-06-RPG-PROMPT.md` amplia o escopo da mesma iteração; não inicia a Iteração 07.

## Fluxo entregue

Hub seguro → Armeiro (F) → adquirir uma das quatro armas gratuitas → inventário (I) → equipar → árvore (TAB) → aprender → Portal (F) → Andar 1 → combate → portal de retorno. O objetivo provisório é derrotar cada um dos cinco Slimes uma vez. Os respawns continuam, mas não apagam o progresso do objetivo. Não é necessário derrotar todos simultaneamente. Morrer na sala retorna ao Hub após o atraso de três segundos já existente, com HP/MP restaurados e sem perda de itens.

## Arquivos criados

- `src/domain/items/inventory.js`: definições dos itens, inventário, slots, equipamento, bônus, bloqueio e validação/migração.
- `src/domain/abilities/skill-tree.js`: cinco nós, estados e aprendizado.
- `src/simulation/areas.js`: catálogo de ambientes e ciclo de transição da sessão.
- `src/ui/rpg-panels.js`: loja, inventário, equipamentos e árvore, com controles I/TAB.
- `tests/iteration06-rpg.test.js`: testes de domínio e integração do novo fluxo.
- `docs/ITERACAO-06-RPG-PROMPT.md` e este relatório.

## Arquivos modificados

- `src/domain/character/character.js`: novo personagem sem arma e sem técnicas aprendidas, com inventário/equipamento reais.
- `src/domain/character/stats.js`: camada de bônus proveniente dos itens equipados.
- `src/adapters/persistence/character-save.js`: novos campos e migração aditiva.
- `src/simulation/abilities.js`: arma real como requisito e debug conectado ao inventário, respeitando o bloqueio de combate.
- `src/simulation/combat.js`: perfil do ataque básico equipado e retorno de morte delegável à sessão de áreas.
- `src/main.js`: composição da sessão, painéis, interações, transições e limpeza da apresentação anterior.
- `src/adapters/rendering/scene.js`: sala simples, NPC provisório e reconstrução por ambiente.
- `src/ui/ability-hud.js`: habilidades não aprendidas, debug de inventário/área e rollback de equipamento em erro de save.
- `src/ui/combat-hud.js`: Hub sem rótulo de inimigo e informação de IA desativada.
- `src/ui/hud.js`: contexto visual, mapa, rótulos e nome da área atual.
- `src/style.css`, `index.html`: painéis, árvore, objetivo, controles e ajuda.
- `tests/iteration06.test.js`: preparação explícita de habilidades conhecidas nos testes de fórmula, equipamento real no round-trip e duas expectativas de troca adaptadas à nova proibição em combate.
- `README.md`: entrega atual e instruções do loop.

## Áreas e isolamento

`createAreas` compõe definições com id, nome, segurança, floorId, ambiente, spawn, NPCs, enemySpawns, interações e exits. O Hub conserva o cenário anterior, recebe um Armeiro e não instancia Slimes. A sala tem piso, limites, pilares, luzes e cinco spawns; reutiliza integralmente EnemyAI, Combat, navegação, colisão, separação e respawn.

AreaSession é responsável pelo contexto ativo. Antes da troca, valida o destino, seus spawns e interações. Depois pausa, cancela ações, limpa alvo, caminho, ciclos, eventos, projéteis, efeitos periódicos e referências de inimigos; troca o mundo e cria a IA com o mundo correto. Posiciona o jogador, sincroniza sua posição anterior e reconstrói a apresentação. Câmera mantém órbita/zoom e passa a acompanhar o novo spawn.

No Hub, `enemies=[]` e `ai=null`: não há percepção, rotas ou respawn de Slimes. Instâncias antigas deixam de ser atualizadas. Geometrias, materiais, sprites, renderizador e HUD de combate anteriores são descartados na transição. A sessão preserva o mesmo personagem, inventário, habilidades e cooldowns. Efeitos específicos da visita são limpos.

O retorno normal exige o objetivo concluído; o comando é revalidado pela saída cadastrada. O ponto de retorno no Hub fica próximo ao Portal. Cada nova visita reinicia o objetivo e os inimigos. A morte utiliza a mesma transição para o Hub, sem duplicar lógica de troca de área.

## Inventário, itens e equipamentos

O inventário possui 32 slots, versão interna 1 e um contador de IDs. Cada item real contém `instanceId`, `definitionId` e `quantity`. ItemDefinition contém identidade, nome, descrição, tipo, raridade provisória, ícone, empilhamento, equipSlot, weaponType, stats, preço, unicidade e perfil do ataque básico. Só há armas funcionais; não foram criados affixes, consumíveis, moedas ou economia real.

Slots preparados: weapon, head, chest, legs, boots, ring, necklace e talisman. Equipar substitui atomicamente o conteúdo do slot escolhido: a arma anterior ocupa o mesmo espaço liberado na mochila. Portanto a troca funciona mesmo com mochila cheia. Desequipar requer espaço livre e falha sem perder o item. Item desconhecido, slot incompatível e aquisição duplicada são rejeitados antes de alterar o estado.

| Item | Bônus de equipamento | Ataque básico |
|---|---|---|
| Espada de Treino | +5 ataque físico | físico, alcance 1,45 |
| Adaga de Treino | +3 ataque físico, +0,15 ataques/s | físico, alcance 1,35 |
| Arco de Treino | +4 ataque físico | físico, alcance 6 |
| Cajado de Treino | +6 ataque mágico | mágico, alcance 6 |

A fórmula deriva os atributos base e compõe modificadores de classe, equipamento real, camadas externas/temporárias e outros bônus. Equipar nunca grava o bônus no atributo base. Recalcular repetidamente não acumula bônus; retirar a arma remove a contribuição. HP/MP respeitam os novos máximos.

O ataque básico já consulta alcance e canal de dano da arma. Cajado usa ataque mágico contra defesa mágica. As estatísticas modificadas também afetam habilidades. O campo de perfil para modificador de velocidade está reservado; o bônus de velocidade atualmente vem da camada `stats.attackSpeed` da adaga. Ataques básicos à distância ainda resolvem o impacto no ciclo automático sem projétil visual; os projéteis das habilidades continuam independentes e completos.

## Armeiro e loja

O NPC provisório fica perto da tenda, a leste do ponto inicial. É descoberto pelo InteractionSystem existente, com alcance, LOS e prompt F. A loja mostra os quatro itens por zero moedas. Adquirir só adiciona à mochila; nunca equipa automaticamente. Uma cópia por arma, contando mochila e equipamento, produz “Já possuído” e desabilita nova aquisição.

A loja, inventário e árvore usam modais nativos. Abrir limpa teclas pressionadas e pausa a simulação. Fechar restaura foco no mundo, limpa entradas e retoma o passo fixo sem acumular o tempo do painel. Cliques não atravessam o modal. Durante uma gravação de aquisição/aprendizado/equipamento, ações e fechamento ficam bloqueados até concluir; falha restaura o snapshot anterior e informa o erro.

## Skill Tree, aprendizado e hotbar

A árvore tem um centro Novato e cinco ramos independentes: Guerreiro/Golpe Poderoso, Assassino/Ataque Duplo, Arqueiro/Tiro Duplo, Feiticeiro/Bola de Energia e Sacerdote/Regeneração. Os ramos representam estilos, sem mudar `classId`. Todos os nós são gratuitos e disponíveis imediatamente para personagem novo. Selecionar mostra descrição, arma, MP, cooldown e alcance; Aprender altera o nó e persiste `knownAbilities`.

Estados: disponível, aprendido e bloqueado. Cada nó contém sua própria lista de requisitos, vazia nesta versão. A separação permite validadores futuros sem impor uma árvore linear ou implementar agora custos, níveis, classes ou exclusões definitivas. Nós com requisitos ainda não suportados falham de forma fechada; não são usados no catálogo atual.

TAB abre/fecha a árvore e evita a navegação padrão quando executa esse atalho. Em outros modais, TAB mantém a navegação normal de foco. I abre/fecha inventário. Também há botões na ficha compacta. Os slots 1–5 continuam associados às cinco habilidades, 6–8 vazios. Uma técnica não aprendida aparece indisponível com “Aprenda esta habilidade com TAB”. Aprender não ignora arma, alvo, MP, cooldown ou outros requisitos.

## Ability System preservado

O sistema data-driven anterior continua responsável pelas definições, execução e efeitos. AbilityDefinition inclui targeting, range, MP, cooldown, cast, recovery, requisitos e sequência temporal de efeitos. Multi-hit resolve acerto/crítico/dano por impacto; alvos mortos invalidam golpes e projéteis sem trocar automaticamente de alvo. Tiro Duplo e Bola de Energia compartilham projéteis com LOS, velocidade, vida máxima e geração do alvo. Regeneração usa PeriodicEffects com seis ticks de cura, sem cura instantânea.

A fila continua limitada a uma intenção; cooldown e MP são cobrados uma vez no início válido. O input buffer é 0,3 s. O ataque automático conclui o ciclo relevante antes da técnica e retorna depois da recuperação. Pausa congela todos esses relógios. Cast iniciado e interrompido não devolve MP/cooldown. Os parâmetros das cinco técnicas permanecem documentados no relatório anterior `ITERACAO-06-RELATORIO.md`.

A nova regra de equipamento substitui a regra anterior de debug: durante aggro, auto-attack, recovery, ação pendente/ativa ou projétil em trânsito, não é possível trocar ou retirar arma. Abrir inventário continua permitido. A UI informa “Não é possível trocar equipamento durante combate.” O seletor de debug utiliza itens reais e obedece à mesma trava; fora de combate pode conceder/equipar uma arma de teste. Não duplica cópias já possuídas.

## Save e migração

Envelope Beta 0.1.0/schema 1 mantido, com campos opcionais aditivos e versão 1 do inventário. Saves antigos recebem sua arma provisória como item equipado real; continuam com nível, XP, atributos, HP/MP e habilidades conhecidas. Saves anteriores ao kit recebem as cinco técnicas antigas para preservar o comportamento daquele save. Personagens genuinamente novos começam com mochila vazia, sem arma e sem técnicas aprendidas.

A arma efetiva é derivada do slot de equipamento, não de uma string antiga inconsistente. A leitura rejeita IDs desconhecidos, instâncias duplicadas, quantidades inválidas, slots incompatíveis, sequência inválida e formatos futuros do inventário. O objeto recebido não é alterado. A cópia anterior e a proteção de revisão entre abas permanecem.

Itens/equipamento/aprendizado são salvos imediatamente pelas interfaces. Recursos continuam consolidados pelo mecanismo anterior. Visita, alvo, objetivo, inimigos, projéteis, efeitos e cooldowns não persistem após recarregar; a sessão sempre começa no Hub. Não há regeneração offline ou checkpoints.

## Validação e performance

A suíte inclui todos os testes anteriores, com adaptações somente onde a nova especificação mudou a expectativa, mais testes de inventário cheio, aquisição, unicidade, troca sem perda, desequipar, slot inválido, bônus, migração, skill tree, arma, interações, isolamento, objetivo, respawn, morte, pausa, stress e loop completo com save/load.

No navegador, foi verificada a migração do perfil anterior e, em uma origem local temporária isolada, o fluxo de personagem novo: três técnicas aprendidas, quatro armas adquiridas, cajado equipado, save restaurado após recarga, entrada real pelo F, cinco Slimes na sala, conjuração e bloqueio de troca durante combate. Os registros de teste desta origem não substituem o perfil normal na porta 5173.

Medição local sem renderização, dez segundos simulados em 300 passos: Hub 8,82 ms (zero atualizações de IA e zero rotas); sala de cinco inimigos 10,76 ms; stress de vinte 21,50 ms. Esses números descrevem essa execução e posições específicas, não são FPS gráfico nem garantia de carga máxima. A melhoria estrutural é a ausência completa de IA no Hub.

## Limitações

Arte e interface são protótipos. Sem inventário arrastável, reorganização da hotbar, peso funcional, expansões, armazém, empilhamento de consumíveis ou equipamentos nos sete slots restantes. A árvore tem cinco nós e não oferece progressão definitiva. A sala é fixa, não procedural; retorno só após o objetivo, ou por morte. Monstros continuam sem loot/XP. Ataques básicos de arco/cajado ainda não têm animações/projéteis próprios. Há uma reconstrução síncrona simples do cenário ao trocar de área.

Classes, quests de classe, evolução, economia, segundo andar, boss, multiplayer, perguntas educacionais e arte final não foram iniciados. A filosofia pedagógica das 13 semanas permanece em `DIRETRIZES-DE-PROGRESSAO.md`.

### Resultado final da verificação

**156 testes aprovados, zero falhas:** 125 testes preservados/adaptados da versão anterior e 31 novos testes do loop de RPG. Build de produção aprovado (43 módulos; JavaScript 666,10 kB, gzip 176,63 kB). Permanece o aviso de bundle acima de 500 kB; não impede a execução e não foi tratado como otimização desta etapa.

No teste manual do novo personagem, o objetivo avançou até 3/5 com Bola de Energia e ataque básico; a morte em combate provocou retorno real ao Hub, preservando o cajado e restaurando recursos. O retorno por objetivo concluído foi validado pela integração automatizada, incluindo respawns e limpeza dos inimigos. I/TAB abriram e fecharam os painéis, e a conjuração permaneceu congelada enquanto o inventário estava aberto. Nenhum erro de console foi registrado na verificação.

Capturas: `capturas/iteracao-06-arvore.png`, `capturas/iteracao-06-inventario.png` e `capturas/iteracao-06-andar.png`.

Entrega encerrada nesta Iteração 06 ampliada. Iteração 07 não iniciada.
