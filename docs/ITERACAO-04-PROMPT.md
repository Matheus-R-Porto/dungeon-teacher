# DUNGEON MASTER — BETA 0.1.0
## Iteração 04 — Fundação do Combate

Continue o desenvolvimento da implementação atual de **Dungeon Master Beta 0.1.0**.

Esta etapa começa SOMENTE depois de considerar concluída a Iteração 03.

O projeto atualmente já possui:

- Hub funcional;
- cenário 3D;
- personagens representados por sprites 2D;
- sprites direcionais de debug;
- câmera orbital livre;
- movimentação WASD;
- movimentação point-and-click;
- sistema universal de interação com F;
- personagem Novato;
- Level e XP;
- STR, AGI, VIT, INT, DEX e LUK;
- HP e MP;
- estatísticas derivadas;
- Attack Speed;
- ataque físico;
- ataque mágico;
- defesa;
- precisão;
- esquiva;
- crítico;
- capacidade de carga;
- regeneração;
- distribuição de atributos;
- painel completo de personagem através da tecla C;
- HUD compacto;
- persistência/save.

Não reimplemente esses sistemas.

Trabalhe incrementalmente sobre a implementação existente.

---

# 1. PEQUENO AJUSTE DE UI ANTES DO COMBATE

O HUD compacto atual do personagem está funcional.

Ele mostra informações como:

- nome;
- classe;
- nível;
- HP;
- MP;
- XP.

Mantenha seu design atual.

Apenas reposicione esse HUD para o:

## canto superior esquerdo da tela.

Deixe uma margem visual confortável em relação às bordas.

O HUD compacto não deve ficar preso à posição do Guia do Refúgio.

O painel completo aberto pela tecla C pode permanecer como está.

Não gastar tempo redesenhando essa interface nesta etapa.

---

# 2. OBJETIVO DA ITERAÇÃO 04

Agora queremos transformar as estatísticas já existentes em um sistema de combate funcional.

A Iteração 04 deve validar:

**Selecionar inimigo → aproximar-se → entrar em alcance → atacar automaticamente → calcular acerto → calcular dano → respeitar Attack Speed → inimigo receber dano → inimigo morrer → combate terminar.**

Ainda NÃO implementar habilidades.

Ainda NÃO implementar classes.

Ainda NÃO implementar IA de combate complexa.

Ainda NÃO implementar loot.

Primeiro precisamos garantir que o núcleo do combate funcione corretamente.

---

# 3. PRIMEIRO INIMIGO DE DEBUG

Criar um inimigo simples exclusivamente para testar combate.

Pode ser visualmente apenas um placeholder.

Exemplo conceitual:

## Slime de Treino

ou outro inimigo provisório.

Ele NÃO precisa possuir arte final.

Pode utilizar:

- sprite simples;
- forma geométrica;
- sprite de debug claramente identificável.

O objetivo é testar sistemas.

---

# 4. DADOS DO INIMIGO

O inimigo deve possuir uma estrutura própria de dados.

Inicialmente:

- ID;
- nome;
- Level;
- HP atual;
- HP máximo;
- ataque;
- defesa;
- precisão;
- esquiva;
- Attack Speed;
- alcance;
- estado;
- posição;
- direção.

Mesmo que nem todos sejam utilizados imediatamente.

Não colocar todos esses valores diretamente dentro do código visual do inimigo.

Preparar uma estrutura reutilizável para futuros monstros.

---

# 5. SEPARAÇÃO ENTRE VISUAL E LÓGICA

Assim como o jogador, o inimigo deve possuir separação conceitual entre:

- dados;
- estatísticas;
- estado;
- comportamento;
- representação visual.

Não criar um objeto monolítico responsável por tudo.

A arquitetura futura deverá suportar muitos tipos de monstros utilizando o mesmo sistema central.

---

# 6. TARGETING

Implementar seleção de alvo através do mouse.

Ao clicar diretamente sobre um inimigo:

> aquele inimigo torna-se o alvo atual do jogador.

O sistema deve guardar algo equivalente a:

`currentTarget`

ou estrutura apropriada.

Apenas um alvo principal por vez nesta etapa.

---

# 7. FEEDBACK DE ALVO

Quando um inimigo estiver selecionado, deve existir feedback visual claro.

Pode utilizar:

- círculo no chão;
- contorno;
- marcador;
- brilho discreto;
- indicador acima do inimigo.

Evitar efeitos exagerados.

O jogador precisa saber imediatamente:

> "Este é meu alvo atual."

---

# 8. PAINEL DO ALVO

Quando existir um alvo selecionado, mostrar uma pequena interface contendo:

- nome;
- nível;
- HP atual;
- HP máximo;
- barra de HP.

Exemplo:

`Slime de Treino — Nv. 1`

`████████░░ 80 / 100`

Quando não houver alvo, esconder esse painel.

Não criar ainda uma interface complexa de boss.

---

# 9. CLIQUE NO INIMIGO

O comportamento fundamental deve seguir a filosofia estabelecida para Dungeon Master.

Ao clicar em um inimigo:

1. selecionar o inimigo;
2. verificar distância;
3. caso esteja fora do alcance, mover o personagem em direção ao alvo;
4. parar quando atingir distância válida de ataque;
5. iniciar auto-attack;
6. continuar atacando automaticamente enquanto as condições forem válidas.

O jogador NÃO precisa clicar uma vez para cada ataque.

---

# 10. POINT-AND-CLICK E TARGETING

Atualmente clicar no chão movimenta o personagem.

Preservar isso.

A regra deve ser:

## Clique no chão

Movimentação point-and-click.

## Clique em inimigo

Selecionar inimigo e iniciar intenção de combate.

O sistema deve distinguir corretamente os dois casos.

Não quebrar a movimentação existente.

---

# 11. MOVIMENTO ATÉ O ALVO

Caso o inimigo esteja fora do alcance:

o personagem deve se mover automaticamente até uma posição válida.

Não é necessário encostar exatamente no centro do inimigo.

Utilizar:

`attackRange`

ou equivalente.

Ao entrar no alcance:

- parar movimento;
- orientar personagem para o alvo;
- iniciar ataque.

---

# 12. ALCANCE

Criar alcance como propriedade do ataque/personagem.

Nesta etapa o Novato pode possuir um alcance curto de combate corpo a corpo.

Não utilizar distância fixa espalhada pelo código.

Exemplo conceitual:

`attackRange`

Futuramente isso será diferente para:

- Guerreiro;
- Arqueiro;
- Feiticeiro;
- Assassino;
- Sacerdote;
- habilidades.

---

# 13. AUTO-ATTACK

Uma vez iniciado, o ataque básico continua automaticamente.

O loop conceitual é:

`Target válido`

→ `Está em alcance?`

→ `Ataque está disponível?`

→ `Executar ataque`

→ `Aguardar intervalo determinado pela Attack Speed`

→ `Repetir`

Isso continua até alguma condição cancelar o combate.

---

# 14. ATTACK SPEED

Utilizar a estatística de Attack Speed criada na Iteração 03.

Se a interface mostra algo como:

`1.075 ataques / segundo`

o combate deve realmente utilizar esse valor.

Conceitualmente:

`attackInterval = 1 / attacksPerSecond`

Não amarrar ataques ao FPS.

Utilizar tempo/delta time corretamente.

---

# 15. CICLO DO ATAQUE

Mesmo utilizando sprites de debug, estruturar conceitualmente cada ataque em fases.

Exemplo:

- preparação;
- momento do impacto;
- recuperação.

Não precisamos de animações finais.

Mas o sistema deve possuir um momento definido no qual o dano é aplicado.

Evitar:

clicou → dano instantâneo completamente desconectado do ciclo de ataque.

---

# 16. ORIENTAÇÃO DURANTE COMBATE

Enquanto estiver atacando um alvo:

o `worldFacing` do personagem deve apontar para o alvo.

O sistema visual direcional já existente deve então selecionar o sprite adequado em relação à câmera.

Não criar uma segunda lógica independente de direção apenas para combate.

Reutilizar o sistema atual.

---

# 17. PRECISÃO E ESQUIVA

Utilizar as estatísticas existentes:

- Accuracy;
- Evasion.

Cada ataque deve verificar se acertou.

Criar uma fórmula simples e centralizada.

Não utilizar:

`Math.random() < accuracy`

de forma espalhada pelo código.

Criar uma função central de resolução de acerto.

A chance final deve possuir limites razoáveis.

Evitar situações como:

0% absoluto

ou

100% absoluto

com facilidade.

Os limites exatos devem permanecer configuráveis.

---

# 18. DANO FÍSICO

O ataque básico do Novato utilizará:

**Physical Attack**

contra:

**Physical Defense**

Criar uma fórmula simples.

Exemplo conceitual, NÃO obrigatório:

`rawDamage = physicalAttack`

`finalDamage = função(rawDamage, targetDefense)`

O resultado deve possuir dano mínimo.

Não permitir que defesa comum gere valores negativos ou cure o alvo.

---

# 19. VARIAÇÃO DE DANO

Adicionar pequena variação aleatória ao dano.

Não queremos que todos os ataques causem exatamente:

`17.5`

por exemplo.

Entretanto, evitar variação gigantesca.

Algo conceitualmente próximo de:

`±5%`

ou

`±10%`

pode ser utilizado inicialmente.

Centralizar esse valor em configuração.

---

# 20. CRÍTICO

Utilizar a estatística:

`Critical Chance`

já existente.

Quando ocorrer crítico:

- aplicar multiplicador configurável;
- fornecer feedback visual diferente.

Exemplo inicial:

`1.5x`

ou valor semelhante.

Não tratar esse número como balanceamento definitivo.

---

# 21. FEEDBACK DE DANO

Quando um ataque atingir o inimigo, mostrar feedback.

Pode utilizar:

- número de dano flutuante;
- pequeno flash;
- reação visual;
- som provisório.

Exemplo:

`12`

Crítico:

`18!`

Miss:

`MISS`

O objetivo é tornar o combate legível.

---

# 22. HP DO INIMIGO

Aplicar dano ao HP atual.

Garantir:

`HP >= 0`

Quando HP chegar a zero:

o inimigo morre.

---

# 23. MORTE DO INIMIGO

Quando o inimigo morrer:

1. interromper suas ações;
2. marcar estado como morto;
3. impedir novos ataques;
4. executar feedback de morte;
5. remover/desativar após pequeno intervalo;
6. limpar `currentTarget` caso ele fosse o alvo atual;
7. encerrar auto-attack.

Ainda NÃO gerar loot.

Ainda NÃO conceder XP automaticamente, a menos que seja necessário apenas como teste temporário.

O sistema de recompensa será conectado posteriormente.

---

# 24. CANCELAMENTO DO AUTO-ATTACK

Auto-attack deve ser cancelado quando:

- alvo morrer;
- alvo deixar de existir;
- jogador selecionar outro alvo;
- jogador emitir movimento manual incompatível;
- jogador ficar impossibilitado de atacar;
- jogador morrer futuramente;
- outra ação explicitamente cancelar o combate.

Definir claramente essas regras.

---

# 25. MOVIMENTO MANUAL DURANTE COMBATE

Se o jogador estiver atacando e utilizar WASD:

o movimento manual deve possuir prioridade.

O personagem deve poder se afastar.

Se sair do alcance:

o auto-attack NÃO deve teleportá-lo de volta.

Defina comportamento consistente.

Uma abordagem recomendada:

WASD cancela a intenção automática de perseguir.

O alvo pode continuar selecionado visualmente, mas o jogador deixa de persegui-lo automaticamente.

Um novo clique no alvo pode reiniciar a aproximação/ataque.

---

# 26. CLIQUE NO CHÃO DURANTE COMBATE

Se o jogador clicar no chão:

- cancelar perseguição automática;
- mover para o ponto escolhido;
- manter ou limpar target conforme a arquitetura escolhida.

Preferencialmente:

**manter target selecionado, mas interromper auto-attack enquanto estiver fora de alcance/intenção de ataque.**

Isso permite reposicionamento sem perder necessariamente o alvo.

---

# 27. MÁQUINA DE ESTADOS DO JOGADOR

Não resolver combate com dezenas de booleans desconectados.

Criar ou expandir um sistema claro de estados.

Exemplo conceitual:

- Idle
- Moving
- Chasing
- Attacking
- Interacting
- Dead

Futuramente serão adicionados:

- Casting;
- UsingSkill;
- Stunned;
- etc.

Não é obrigatório utilizar exatamente esses nomes.

O importante é evitar combinações impossíveis como:

`isMoving = true`
`isAttacking = true`
`isInteracting = true`
`isDead = true`

ao mesmo tempo sem regras claras.

---

# 28. INIMIGO NESTA ITERAÇÃO

O inimigo NÃO precisa ainda possuir IA completa.

Para a primeira parte da Iteração 04 ele pode permanecer:

- parado;
- passivo;
- sem perseguir;
- sem atacar.

Isso permite testar o ataque do jogador isoladamente.

Depois que o ataque do jogador estiver funcionando, adicionar uma reação extremamente simples.

---

# 29. ATAQUE BÁSICO DO INIMIGO

Depois que o combate do jogador estiver validado, permitir que o inimigo de teste ataque quando o jogador estiver dentro de seu alcance.

Utilizar o mesmo princípio geral:

- Attack Speed;
- Accuracy;
- dano;
- defesa;
- HP.

Não criar ainda comportamento sofisticado de perseguição.

A IA completa será Iteração 05.

---

# 30. DANO NO JOGADOR

Quando o inimigo acertar:

utilizar as estatísticas existentes do personagem.

Aplicar:

- precisão do inimigo;
- esquiva do jogador;
- ataque do inimigo;
- defesa física do jogador.

Mostrar feedback de dano.

A HUD de HP deve atualizar imediatamente.

---

# 31. MORTE DO JOGADOR — VERSÃO PROVISÓRIA

Precisamos conseguir testar HP chegando a zero.

Nesta iteração, implementar uma morte provisória simples.

Quando HP chegar a zero:

- interromper movimento;
- interromper combate;
- limpar target;
- mostrar feedback de morte;
- aguardar pequeno intervalo;
- retornar ao ponto inicial do Hub;
- restaurar HP e MP.

NÃO implementar ainda:

- perda de moedas;
- ressurreição;
- Sacerdote;
- item de ressurreição;
- regras completas de morte da Torre.

Essas regras virão depois.

---

# 32. NÃO IMPLEMENTAR STUN-LOCK AINDA

Attack Speed deve determinar frequência de ataques.

Não faça cada ataque automaticamente interromper o inimigo.

Separar desde agora os conceitos:

- Attack Speed;
- Hit;
- Stagger;
- Stun;
- Knockback.

Nesta iteração:

ataque básico NÃO precisa causar stagger.

Isso evitará que alta AGI automaticamente impeça qualquer inimigo de agir.

---

# 33. DEBUG DE COMBATE

Criar uma pequena opção de debug que permita visualizar informações como:

Player:
- Physical Attack;
- Attack Speed;
- Accuracy;
- Critical Chance.

Target:
- HP;
- Defense;
- Evasion.

Combat:
- Distance;
- Attack Range;
- Current State;
- Next Attack;
- Last Result.

Esse painel pode ficar escondido por padrão.

Não precisa fazer parte da UI final.

---

# 34. TESTE DE STR

Use o sistema existente de atributos para validar:

mais STR

→ maior Physical Attack

→ maior dano médio.

O resultado precisa ser perceptível.

---

# 35. TESTE DE AGI

Mais AGI

→ maior Attack Speed

→ menor intervalo entre ataques.

Isso precisa alterar o combate de verdade, não apenas o número exibido no painel.

---

# 36. TESTE DE DEX

Mais DEX

→ maior Accuracy

→ menos MISS contra o mesmo inimigo.

---

# 37. TESTE DE LUK

Mais LUK

→ maior Critical Chance

→ críticos ligeiramente mais frequentes.

---

# 38. TESTE DE VIT

Mais VIT

→ maior HP/Defense

→ personagem suporta mais ataques do mesmo inimigo.

---

# 39. INT NESTA ETAPA

INT já deve continuar funcionando nas estatísticas existentes.

Entretanto, como ainda não temos magia:

INT não precisa possuir grande impacto no auto-attack físico.

Isso é aceitável.

Seu verdadeiro valor aparecerá quando implementarmos habilidades e classes mágicas.

Não force INT artificialmente para dentro do ataque físico.

---

# 40. TESTE COM DIFERENTES ATTACK SPEEDS

Testar pelo menos:

- Attack Speed baixa;
- normal;
- alta.

Verificar:

- timing;
- aplicação do dano;
- feedback;
- estabilidade;
- ausência de ataques duplicados;
- independência de FPS.

---

# 41. COMBATE E CÂMERA

O combate precisa funcionar em qualquer ângulo de câmera.

Teste:

0°
45°
90°
137°
180°
243°
318°

e outros ângulos.

Não assumir orientação fixa da câmera para targeting, alcance ou ataques.

---

# 42. COMBATE E SPRITES 2D

Os sprites continuam sendo placeholders.

Não produzir arte final.

Durante ataques, é aceitável utilizar:

- pequena mudança de frame;
- deslocamento simples;
- efeito visual;
- sprite provisório.

O objetivo é provar o sistema.

---

# 43. NÃO IMPLEMENTAR AINDA

Nesta iteração NÃO implementar:

- Guerreiro;
- Arqueiro;
- Feiticeiro;
- Assassino;
- Sacerdote;
- habilidades 1–8;
- MP de habilidades;
- projéteis complexos;
- magias;
- buffs;
- debuffs;
- dash;
- loot;
- equipamentos;
- inventário;
- moedas;
- Torre;
- geração procedural;
- bosses;
- life skills;
- baús;
- perguntas matemáticas;
- multiplayer;
- PvP.

Não aumentar o escopo.

---

# 44. PRESERVAR SISTEMAS EXISTENTES

Não quebrar:

- câmera;
- Q/E;
- botão do meio;
- zoom;
- WASD;
- point-and-click;
- interação F;
- Portal;
- painel C;
- atributos;
- XP;
- save;
- regeneração;
- sprites direcionais;
- World Facing;
- Visual Facing.

---

# 45. CRITÉRIOS DE CONCLUSÃO

A Iteração 04 estará concluída quando:

1. o HUD compacto estiver no canto superior esquerdo;
2. existir pelo menos um inimigo de debug;
3. clicar no inimigo selecioná-lo;
4. existir feedback claro do target;
5. aparecer HP do target;
6. clicar em inimigo distante fizer o personagem aproximar-se;
7. personagem parar em alcance válido;
8. auto-attack iniciar;
9. Attack Speed controlar a frequência real;
10. precisão/esquiva funcionarem;
11. dano físico/defesa funcionarem;
12. variação de dano funcionar;
13. crítico funcionar;
14. MISS funcionar;
15. números/feedback de combate aparecerem;
16. HP do inimigo diminuir;
17. inimigo morrer corretamente;
18. target ser limpo após morte;
19. auto-attack terminar após morte;
20. movimento manual conseguir interromper perseguição;
21. combate funcionar independentemente do ângulo da câmera;
22. inimigo conseguir realizar ataque básico simples;
23. defesa/esquiva/HP do jogador funcionarem;
24. jogador conseguir morrer em teste;
25. morte provisória retornar o personagem ao Hub;
26. atributos existentes realmente influenciarem o combate;
27. save e sistemas anteriores continuarem funcionando.

---

# 46. APÓS CONCLUIR

Pare.

NÃO implemente automaticamente a Iteração 05.

Ao finalizar, informe:

- arquivos criados;
- arquivos modificados;
- arquitetura utilizada;
- fórmula atual de acerto;
- fórmula atual de dano;
- fórmula atual de crítico;
- regras de cancelamento do auto-attack;
- estados implementados;
- limitações conhecidas;
- testes realizados.

A próxima etapa será separadamente:

# Iteração 05 — IA, Aggro e Comportamento dos Inimigos

Nela trabalharemos:

- percepção;
- distância de aggro;
- perseguição;
- retorno à área original;
- ataques;
- múltiplos inimigos;
- comportamento quando vários inimigos forem atraídos;
- leash;
- morte e respawn.

Mas NÃO implemente isso agora.

---

# REGRA PRINCIPAL

A Iteração 04 existe para provar que:

**os números do personagem realmente se transformam em combate.**

Não queremos conteúdo.

Não queremos arte final.

Não queremos cinco classes ainda.

Queremos que clicar em um inimigo, aproximar-se e trocar ataques seja tecnicamente sólido, legível e satisfatório.

Construa primeiro esse coração do combate.