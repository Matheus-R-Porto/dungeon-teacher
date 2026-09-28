# DUNGEON MASTER — BETA 0.1.0
## Iteração 05 — IA, Aggro, Perseguição, Leash e Respawn

Continue o desenvolvimento da implementação atual de **Dungeon Master Beta 0.1.0**.

A Iteração 04 — Fundação do Combate está concluída.

NÃO reimplemente o combate.

NÃO altere fórmulas existentes sem necessidade técnica comprovada.

A Iteração 05 deve trabalhar sobre a arquitetura atual.

---

# 1. ESTADO ATUAL

O projeto já possui:

- movimentação WASD;
- point-and-click;
- câmera orbital 360°;
- sprites 2D em cenário 3D;
- sistema direcional;
- interação universal F;
- atributos;
- HP/MP;
- XP/Level;
- estatísticas derivadas;
- Attack Speed;
- seleção de inimigo;
- currentTarget;
- aproximação automática;
- auto-attack;
- alcance;
- linha de visão para ataques;
- precisão;
- esquiva;
- defesa;
- dano;
- variação de dano;
- crítico;
- MISS;
- dano flutuante;
- morte de inimigos;
- morte provisória do jogador;
- estados do jogador;
- estados básicos do inimigo;
- resolução compartilhada de ataques;
- navegação A*;
- testes automatizados de combate.

O domínio de combate já está separado de:

- DOM;
- renderização;
- interface.

Preserve essa arquitetura.

---

# 2. OBJETIVO

Até agora o inimigo:

- permanece parado;
- não percebe o jogador;
- não persegue;
- apenas revida quando o jogador entra no alcance.

Agora precisamos criar o primeiro sistema real de IA de combate.

O ciclo esperado será:

**Idle**

→ percebe jogador

→ **Alert/Aggro**

→ persegue

→ entra em alcance

→ ataca

→ jogador se afasta

→ persegue novamente

→ jogador foge além dos limites permitidos

→ abandona perseguição

→ retorna à região de origem

→ volta para Idle.

Também precisamos validar:

- múltiplos inimigos;
- aggro independente;
- respawn;
- retorno seguro ao spawn;
- integração com navegação;
- performance básica.

---

# 3. PRINCÍPIO DO AGGRO

Dungeon Master NÃO deve utilizar uma regra artificial como:

> "somente 3 inimigos podem atacar o jogador."

Não criar limite global arbitrário de inimigos agressivos.

Se o jogador atravessar uma área contendo muitos inimigos e chamar a atenção deles:

**todos os inimigos cujas regras de percepção forem satisfeitas podem entrar em combate.**

Isso é intencional.

Cabe ao jogador controlar quantos inimigos atrai.

Esse comportamento futuramente dará valor a:

- posicionamento;
- resistência;
- velocidade;
- controle de grupo;
- habilidades em área;
- party.

---

# 4. DADOS DE IA

Expandir a definição data-driven dos inimigos.

Cada espécie deve poder possuir parâmetros como:

- detectionRange;
- attackRange;
- chaseSpeed;
- returnSpeed;
- leashRange;
- leashDuration, caso utilizado;
- attackSpeed;
- spawnPosition;
- respawnTime;
- behaviorType;
- aggressive;
- assistRange, futuramente;
- outros parâmetros realmente necessários.

Não espalhar números específicos pelo código da IA.

---

# 5. SPAWN POSITION

Cada inimigo precisa conhecer sua posição/região de origem.

Ao nascer:

`spawnPosition = posição inicial`

Essa informação será utilizada para:

- leash;
- retorno;
- respawn;
- comportamento territorial.

O spawn é diferente da posição atual.

---

# 6. ESTADOS DA IA

Expandir a máquina de estados do inimigo.

Uma estrutura conceitual adequada seria:

- Idle
- Alert
- Chasing
- Attacking
- Returning
- Dead
- Respawning

Não é obrigatório utilizar exatamente esses nomes.

O importante é possuir transições claras.

Evitar dezenas de booleans independentes como:

`isAggro`
`isReturning`
`isChasing`
`isAttacking`

sem uma máquina de estados coerente.

---

# 7. IDLE

Em Idle:

- inimigo permanece em sua região;
- monitora percepção;
- não persegue o jogador;
- não ataca.

Nesta iteração ele pode permanecer parado.

Patrulha/wandering não é obrigatória ainda.

---

# 8. PERCEPÇÃO

Um inimigo agressivo deve detectar o jogador quando ele entrar em:

`detectionRange`

Entretanto, distância sozinha não deve necessariamente ser suficiente em todos os casos.

Preparar a percepção para considerar:

- distância;
- estado do inimigo;
- estado do jogador;
- linha de visão quando apropriado.

Para o Slime inicial, utilize regras simples.

---

# 9. LINHA DE VISÃO

Se existir uma parede ou obstáculo sólido entre inimigo e jogador, o inimigo não deve magicamente enxergar através dele quando a configuração exigir visão direta.

Reutilize sistemas de linha livre já existentes quando possível.

Não implemente um segundo sistema incompatível de raycast apenas para IA se o projeto já possuir infraestrutura adequada.

---

# 10. AGGRO

Quando o jogador for detectado:

o inimigo entra em estado agressivo.

Registrar:

- target;
- posição de origem;
- motivo do aggro quando útil;
- estado atual.

Nesta Beta, o jogador será normalmente o único alvo possível.

Ainda assim, evite uma arquitetura que torne impossível suportar outros alvos futuramente.

---

# 11. PERSEGUIÇÃO

Durante Chasing:

o inimigo deve utilizar a navegação existente para se aproximar do jogador.

Reutilizar A* quando apropriado.

O inimigo deve:

1. localizar o jogador;
2. calcular caminho;
3. movimentar-se;
4. atualizar direção;
5. entrar em alcance;
6. parar;
7. atacar.

Não mover inimigos simplesmente em linha reta atravessando obstáculos.

---

# 12. REPATH

O jogador estará em movimento.

Portanto o caminho não pode ser calculado apenas uma vez.

Criar uma estratégia de repath.

Entretanto:

NÃO recalcular A* para todos os inimigos em todos os frames.

Utilizar:

- intervalo configurável;
- mudança significativa da posição do alvo;
- invalidação de rota;
- outros critérios apropriados.

Priorizar estabilidade e performance.

---

# 13. DIREÇÃO DO INIMIGO

Durante movimento e combate:

atualizar World Facing do inimigo.

O sistema de sprites direcionais deve funcionar para inimigos da mesma maneira conceitual que funciona para o jogador.

Como o Slime é placeholder, não é necessário produzir sprites finais.

---

# 14. ENTRADA EM ATTACKING

Quando:

- target é válido;
- target está vivo;
- target está dentro de attackRange;
- existe condição válida de ataque;

o inimigo entra em Attacking.

Reutilizar o sistema de ataque da Iteração 04.

NÃO criar uma segunda implementação de dano exclusiva para IA.

---

# 15. ALVO SAI DO ALCANCE

Se durante combate o jogador sair de attackRange:

- não aplicar impactos inválidos;
- interromper/ajustar ataque conforme as regras existentes;
- retornar para Chasing quando apropriado.

O inimigo então tenta novamente alcançar o jogador.

---

# 16. LEASH

Inimigos não devem perseguir o jogador eternamente por todo o mapa.

Cada inimigo possui uma região máxima de perseguição.

Utilizar:

`leashRange`

medido preferencialmente em relação à posição/região de origem.

Exemplo:

Slime nasceu em X.

Jogador atrai o Slime.

Slime persegue.

Quando a perseguição viola a regra de leash:

o Slime abandona o jogador e retorna.

---

# 17. LEASH NÃO DEVE SER FRÁGIL

Evitar comportamento:

jogador cruza 1 pixel da fronteira

→ inimigo imediatamente vira as costas.

Utilize uma regra estável.

Pode envolver:

- margem;
- pequeno tempo fora da região;
- distância máxima absoluta;
- combinação apropriada.

O comportamento precisa parecer natural.

---

# 18. RETURNING

Quando o inimigo abandonar a perseguição:

entrar em Returning.

Durante Returning:

- limpar target;
- não continuar atacando;
- navegar de volta para sua região de origem;
- atualizar direção;
- ignorar temporariamente reaggro, caso necessário para impedir exploits.

Ao alcançar a região de origem:

→ Idle.

---

# 19. HP DURANTE RETURNING

NÃO restaure instantaneamente todo HP no primeiro frame de retorno.

Isso parece artificial e pode gerar comportamento estranho.

Implementar uma regra configurável.

Para esta Beta, uma boa solução é:

- durante Returning, regenerar HP rapidamente;
- ao alcançar spawn, garantir recuperação completa.

Centralize a taxa.

Isso pode ser rebalanceado depois.

---

# 20. ANTI-KITING INFINITO

O leash existe para impedir que o jogador arraste um inimigo indefinidamente pelo mapa.

Entretanto, não transforme o leash em teleportes arbitrários.

Priorizar:

**retorno por navegação.**

Teleportar para spawn deve ser apenas fallback caso:

- rota seja impossível;
- inimigo fique preso;
- exista erro de navegação;
- timeout de segurança seja excedido.

---

# 21. MÚLTIPLOS INIMIGOS

A Iteração 05 precisa suportar vários inimigos simultaneamente.

Não apenas um Slime global.

Crie uma coleção/gerenciador adequado.

Exemplo conceitual:

`enemies[]`

Cada inimigo possui:

- estado próprio;
- HP próprio;
- target próprio;
- timers próprios;
- ciclo de ataque próprio;
- navegação própria;
- spawn próprio.

---

# 22. TESTE COM GRUPO

Adicionar uma área de teste com vários Slimes.

Exemplo:

5 a 10 inimigos.

O jogador deve conseguir:

- aproximar-se de apenas um;
- atrair alguns;
- entrar no grupo e atrair muitos;
- fugir;
- observar cada inimigo retornar adequadamente.

Não criar limite artificial de aggro.

---

# 23. AGGRO INDIVIDUAL

Cada inimigo calcula sua própria percepção.

Se existem cinco Slimes:

- talvez apenas dois estejam próximos o suficiente;
- os outros três continuam Idle.

Se o jogador entrar mais profundamente:

- outros podem entrar em Aggro.

Isso deve emergir naturalmente das posições e detectionRange.

---

# 24. BODY COLLISION

A Iteração 04 registrou que movimento manual consegue atravessar o volume do inimigo.

Agora precisamos corrigir isso.

Jogador e inimigos devem possuir colisão física/lógica adequada para evitar atravessamento visual absurdo.

Entretanto:

NÃO criar body-blocking excessivamente rígido.

Precisamos evitar situações em que cinco Slimes formam uma parede perfeita e o jogador fica preso sem qualquer possibilidade de movimento.

Criar uma solução coerente com Action RPG.

---

# 25. SEPARAÇÃO ENTRE INIMIGOS

Evitar que múltiplos inimigos ocupem exatamente a mesma posição.

Implementar uma separação local simples.

Objetivo:

quando cinco Slimes perseguirem o jogador, eles devem formar um pequeno grupo ao redor dele em vez de virar uma única massa sobreposta.

Não implementar steering sofisticado demais.

Uma solução simples e estável é suficiente.

---

# 26. POSICIONAMENTO DE COMBATE

Inimigos corpo a corpo não precisam todos ocupar exatamente o mesmo ponto.

Ao aproximarem-se do jogador, permitir pequenas posições diferentes ao redor do alvo.

Isso melhora:

- legibilidade;
- seleção;
- colisão;
- combate em grupo.

Não criar ainda um sistema rígido de "combat slots" se não for necessário.

---

# 27. SELEÇÃO ENTRE VÁRIOS INIMIGOS

O targeting existente precisa continuar funcionando com múltiplos inimigos próximos.

Ao clicar:

selecionar o inimigo realmente clicado.

Verificar raycast/projeção corretamente.

O círculo de target deve aparecer apenas no `currentTarget`.

---

# 28. MORTE INDIVIDUAL

Quando um inimigo morrer:

- somente ele morre;
- outros continuam seus comportamentos;
- remover seu collider;
- remover sua participação na IA;
- limpar seleção se necessário;
- iniciar processo de respawn.

Não resetar o grupo inteiro.

---

# 29. RESPAWN

Implementar respawn automático.

Cada tipo de inimigo possui:

`respawnTime`

Após morrer:

1. executar estado Dead;
2. remover/desativar visual;
3. aguardar respawnTime;
4. recriar/resetar na posição de spawn;
5. restaurar HP;
6. limpar estados antigos;
7. voltar para Idle.

---

# 30. RESPAWN E JOGADOR PRÓXIMO

Evitar que um inimigo reapareça literalmente dentro do personagem.

Se o jogador estiver muito próximo do ponto de spawn:

considere:

- pequeno atraso adicional;
- posição alternativa próxima;
- ou outra solução simples.

Não complicar excessivamente.

---

# 31. NÃO CONCEDER XP AINDA

Apesar de existir morte e respawn:

NÃO conectar XP definitivo nesta iteração.

Também NÃO implementar:

- loot;
- moedas;
- baús.

Primeiro validar ecossistema de inimigos.

---

# 32. SPAWN DATA-DRIVEN

Não colocar manualmente cada Slime diretamente na lógica central.

Preparar uma estrutura de spawn.

Exemplo conceitual:

`enemySpawns`

Cada entrada pode conter:

- enemyType;
- position;
- rotation/facing inicial;
- respawnTime;
- overrides opcionais.

Isso será essencial para a Torre posteriormente.

---

# 33. FUTURA GERAÇÃO PROCEDURAL

Embora a Torre ainda não exista, o sistema de spawn deve poder futuramente receber posições produzidas pelo gerador procedural.

Não acople spawn de inimigos especificamente ao Hub.

O Hub está servindo apenas como campo de teste.

---

# 34. DEBUG VISUAL DA IA

Adicionar opção de debug que possa mostrar:

- detectionRange;
- attackRange;
- leashRange;
- spawnPosition;
- caminho atual;
- target;
- estado;
- distância do jogador;
- tempo para respawn.

Esses elementos devem ficar escondidos por padrão.

Uma flag de debug pode ativá-los.

Isso será extremamente útil para ajustar IA.

---

# 35. CORES/INDICADORES DE DEBUG

Quando debug estiver ativo, diferenciar visualmente estados.

Exemplo conceitual:

Idle  
Alert  
Chasing  
Attacking  
Returning  
Dead

Não é necessário usar cores específicas se a arquitetura visual atual sugerir outra solução.

O importante é conseguir diagnosticar comportamento.

---

# 36. PERFORMANCE

Planejamos mapas com múltiplos inimigos.

Portanto:

- não executar pathfinding completo em todos os inimigos a cada frame;
- não criar listeners individuais desnecessários;
- não criar timers independentes frágeis quando o loop de simulação puder resolver;
- evitar alocações excessivas por frame.

Não realizar otimizações prematuras extremas.

Mas evite arquitetura obviamente incompatível com dezenas de inimigos.

---

# 37. TESTE DE ESCALA

Além do teste normal, criar um cenário de debug com aproximadamente:

20 inimigos.

Não precisa ser gameplay final.

Objetivo:

verificar se:

- simulação permanece estável;
- pathfinding não explode;
- FPS não cai absurdamente;
- ataques não duplicam;
- estados continuam independentes.

---

# 38. PLAYER DEATH COM VÁRIOS INIMIGOS

Quando o jogador morrer:

- todos os inimigos devem perder o jogador como target;
- ataques pendentes contra jogador morto devem ser cancelados;
- inimigos devem retornar para suas regiões;
- jogador retorna ao Hub conforme regra provisória atual.

Não permitir que inimigos continuem atacando um jogador morto.

---

# 39. RETORNO DO JOGADOR

Depois que o jogador reaparecer:

inimigos não devem permanecer magicamente presos em Aggro do estado anterior.

Cada um deve estar:

- retornando;
- idle;
- ou em outro estado válido.

---

# 40. PAUSA

Preservar comportamento existente de pausa.

Quando simulação estiver pausada:

- IA não avança;
- respawn não avança;
- ataques não avançam;
- movimento inimigo não avança.

Ao retomar:

não produzir saltos gigantes de delta time.

---

# 41. REGENERAÇÃO DO JOGADOR

Preservar regeneração existente.

Não alterá-la arbitrariamente por causa da IA.

Posteriormente poderemos decidir se regeneração muda durante combate.

Não fazer essa decisão agora.

---

# 42. AGGRO POR DANO

Além de percepção por proximidade:

se o jogador atacar um inimigo válido de alguma forma futuramente, esse inimigo deve poder adquirir aggro mesmo que a detecção normal não tenha sido responsável por isso.

Para o combate corpo a corpo atual isso provavelmente ocorrerá naturalmente.

Ainda assim, estruturar algo equivalente a:

`onDamaged(attacker)`

que possa definir o atacante como target.

Isso será importante para:

- Arqueiro;
- Feiticeiro;
- ataques à distância;
- habilidades.

---

# 43. AGGRO SOCIAL

NÃO implementar ainda comportamento em que:

> atacar um Slime chama automaticamente todos os Slimes próximos.

Isso pode existir futuramente para determinados monstros.

Prepare `assistRange` como possibilidade data-driven, mas deixe desativado no Slime inicial.

Assim podemos futuramente criar:

- monstros solitários;
- monstros sociais;
- guardas;
- alcateias;
- grupos.

---

# 44. TIPOS FUTUROS DE COMPORTAMENTO

Não implementar agora, mas evite impedir futuramente:

- melee aggressive;
- ranged;
- caster;
- passive;
- fleeing;
- territorial;
- support;
- boss;
- summoned.

Nesta iteração precisamos apenas do:

**melee aggressive básico.**

---

# 45. SLIME DE TREINO

Transformar o Slime atual no primeiro exemplo de:

`melee aggressive`

Ele deve possuir:

- detecção;
- perseguição;
- ataque;
- leash;
- retorno;
- morte;
- respawn.

Continuar usando arte provisória.

---

# 46. NÃO IMPLEMENTAR AINDA

Não implementar:

- classes;
- habilidades;
- barra 1–8;
- equipamentos;
- loot;
- XP por inimigo;
- moedas;
- baús;
- Torre procedural;
- boss;
- life skills;
- quests;
- multiplayer;
- PvP;
- arte final;
- animações finais.

---

# 47. NÃO ALTERAR AS FÓRMULAS DA ITERAÇÃO 04

Preservar inicialmente:

## Acerto

`clamp((Accuracy - Evasion) / 100, 0.05, 0.95)`

## Dano físico

`max(1, PhysicalAttack - PhysicalDefense)`

com variação:

`0.92 até 1.08`

## Crítico

`CriticalChance / 100`

Multiplicador:

`1.5x`

## Ritmo

`attackInterval = 1 / AttackSpeed`

Com:

- 25% windup;
- impacto;
- 75% recovery.

Esses valores são provisórios.

Não balanceá-los nesta etapa.

---

# 48. TESTES AUTOMATIZADOS

Adicionar testes para pelo menos:

- entrada em aggro;
- ausência de aggro fora da percepção;
- linha de visão;
- perseguição;
- entrada em alcance;
- ataque;
- saída do alcance;
- nova perseguição;
- leash;
- returning;
- chegada ao spawn;
- regeneração durante retorno;
- múltiplos inimigos;
- aggro independente;
- morte individual;
- respawn;
- player death;
- cancelamento de ataques contra morto;
- pausa;
- repath;
- rota impossível;
- inimigo preso;
- separação;
- colisão;
- diferentes FPS.

Preservar todos os testes anteriores.

---

# 49. TESTE MANUAL PRINCIPAL

Criar uma pequena região de treino no Hub ou ambiente de debug.

Colocar vários Slimes espaçados.

Validar manualmente:

### Teste A

Aproximar lentamente de um Slime.

Resultado:

apenas ele detecta e persegue.

### Teste B

Entrar entre vários Slimes.

Resultado:

todos que detectarem o jogador entram em aggro.

### Teste C

Fugir.

Resultado:

eles perseguem.

### Teste D

Continuar fugindo além do leash.

Resultado:

eles abandonam e retornam.

### Teste E

Atacar durante retorno, quando permitido pelas regras.

Verificar comportamento consistente.

### Teste F

Matar um Slime.

Resultado:

ele morre, desaparece e depois reaparece.

### Teste G

Morrer cercado.

Resultado:

ataques cessam e inimigos retornam.

---

# 50. CRITÉRIOS DE CONCLUSÃO

A Iteração 05 estará concluída quando:

1. inimigos detectarem o jogador;
2. detectionRange for configurável;
3. linha de visão funcionar;
4. inimigos entrarem em aggro;
5. perseguirem através da navegação;
6. atualizarem caminho adequadamente;
7. pararem no alcance;
8. atacarem utilizando o sistema existente;
9. voltarem a perseguir quando necessário;
10. possuírem leash;
11. abandonarem perseguição corretamente;
12. retornarem ao spawn;
13. recuperarem HP conforme regra de retorno;
14. múltiplos inimigos funcionarem simultaneamente;
15. não existir limite artificial de aggro;
16. inimigos não se sobrepuserem completamente;
17. jogador não atravessar inimigos livremente;
18. targeting continuar funcionando entre vários inimigos;
19. morte individual funcionar;
20. respawn automático funcionar;
21. morte do jogador limpar aggro;
22. pausa congelar IA;
23. debug permitir visualizar estados/ranges;
24. teste com aproximadamente 20 inimigos permanecer estável;
25. todos os testes anteriores continuarem passando.

---

# 51. APÓS CONCLUIR

PARE.

Não implemente automaticamente habilidades ou classes.

Produza um relatório contendo:

- arquivos criados;
- arquivos modificados;
- máquina de estados final;
- algoritmo de percepção;
- regras de linha de visão;
- estratégia de repath;
- regra de leash;
- regra de retorno;
- regra de regeneração;
- regra de respawn;
- estratégia de separação;
- estratégia de colisão;
- resultados dos testes;
- limitações conhecidas;
- performance observada com múltiplos inimigos.

A próxima etapa será:

# Iteração 06 — Habilidades, Barra 1–8 e Sistema de Ações

Essa etapa será responsável por finalmente construir a infraestrutura que posteriormente permitirá diferenciar:

- Guerreiro;
- Arqueiro;
- Feiticeiro;
- Assassino;
- Sacerdote.

---

# REGRA PRINCIPAL

Nesta iteração, não queremos inimigos inteligentes.

Queremos inimigos **previsíveis, consistentes e tecnicamente sólidos**.

O jogador deve aprender naturalmente:

> "Se eu chegar perto daquele monstro, ele vem atrás de mim."

> "Se eu entrar no meio daquele grupo, provavelmente todos virão."

> "Se eu fugir suficientemente longe, eles eventualmente voltarão."

Essa previsibilidade será a base sobre a qual habilidades, classes, builds e combate em grupo serão construídos.