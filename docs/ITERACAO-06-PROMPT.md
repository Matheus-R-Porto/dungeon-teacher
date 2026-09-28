# DUNGEON MASTER — BETA 0.1.0
## Iteração 06 — Sistema Universal de Habilidades e Kit Inicial do Novato

Continue o desenvolvimento da implementação atual de **Dungeon Master Beta 0.1.0**.

As Iterações 01–05 estão concluídas.

A Iteração 06 deve criar o sistema universal de habilidades e, ao mesmo tempo, implementar o primeiro conjunto REAL de habilidades do jogo:

# O kit do Novato

IMPORTANTE:

O Novato NÃO é apenas um placeholder técnico.

Ele será uma etapa real da progressão do jogador.

---

# 1. CONTEXTO DE PROGRESSÃO DO JOGO

Dungeon Master será utilizado em uma experiência com duração planejada de:

**13 semanas**

Cada semana possui aproximadamente:

**1 hora e 30 minutos de gameplay.**

Portanto, o tempo total disponível por jogador durante esse ciclo será aproximadamente:

**19 horas e 30 minutos.**

A progressão deve ser pensada considerando esse limite.

---

# 2. MACROPROGRESSÃO TEMPORAL

A experiência pretendida é aproximadamente:

## Semanas 1–2

### Novato

Aproximadamente:

**2–3 horas de gameplay acumulado.**

O jogador:

- aprende o jogo;
- aprende movimentação;
- aprende combate;
- experimenta diferentes armas;
- experimenta diferentes estilos;
- sobe os primeiros andares;
- começa a desenvolver atributos;
- conhece o Hub;
- entende loot e equipamentos futuramente;
- descobre qual estilo de combate prefere.

Ao final desse período, estará preparado para escolher sua primeira classe.

---

## Semanas 3–10

### Classe principal

O jogador passa a maior parte da experiência como:

- Guerreiro;
- Arqueiro;
- Feiticeiro;
- Assassino;
- Sacerdote.

Esse período representa aproximadamente 8 semanas de progressão dentro da identidade principal da classe.

---

## Semanas 11–13

### Evolução avançada

Nas últimas aproximadamente 3 semanas, jogadores mais avançados devem começar a alcançar:

- evolução final de classe;
- equipamentos avançados;
- desafios superiores da Torre;
- conteúdo de alto nível.

Entretanto, chegar à evolução final NÃO significa automaticamente conseguir concluir a Torre.

---

# 3. O ÚLTIMO ANDAR

Existe uma decisão importante de design:

## O último andar da Torre NÃO deve ser realisticamente concluível dentro das 13 semanas por progressão normal.

O jogador pode:

- avançar bastante;
- alcançar conteúdo extremamente elevado;
- conseguir evolução final;
- tornar-se muito poderoso;
- aproximar-se do final.

Mas derrotar completamente o conteúdo final deve exigir um nível extraordinário de:

- poder;
- equipamentos;
- builds;
- coordenação;
- party;
- especialização;
- sinergia entre classes.

A intenção é criar a sensação de:

> "Existe algo além do que conseguimos conquistar durante essa jornada."

Não implementar artificialmente uma parede invencível.

O conteúdo deve ser mecanicamente possível.

A dificuldade e os requisitos de progressão é que devem colocá-lo além do alcance esperado durante as 13 semanas.

Esse balanceamento NÃO será realizado nesta iteração.

Apenas registre essa filosofia como requisito de design.

---

# 4. FUNÇÃO DO NOVATO

O Novato possui uma função muito importante.

Ele é:

## uma introdução às cinco futuras identidades de classe.

Durante as primeiras horas, o jogador poderá experimentar diferentes tipos de arma.

Cada tipo de arma oferece ao Novato uma habilidade básica representando uma futura classe.

Assim o jogador aprende através da prática.

Não queremos simplesmente perguntar:

> "Qual classe você quer?"

antes de o jogador entender como elas jogam.

---

# 5. RELAÇÃO NOVATO → CLASSES

As cinco habilidades iniciais serão:

| Arma | Habilidade | Futuro arquétipo |
|---|---|---|
| Espada | Golpe Poderoso | Guerreiro |
| Adaga/Faca | Ataque Duplo | Assassino |
| Arco | Tiro Duplo | Arqueiro |
| Cajado | Bola de Energia | Feiticeiro |
| Qualquer arma / sem requisito | Regeneração | Sacerdote |

Essas habilidades NÃO transformam o Novato nessas classes.

São apenas introduções mecânicas aos seus estilos.

---

# 6. OBJETIVO DA ITERAÇÃO 06

Implementar:

- sistema universal de habilidades;
- hotbar;
- slots 1–8;
- cooldown;
- custo;
- targeting;
- cast;
- fila de ação;
- requisitos de arma;
- cinco habilidades reais do Novato.

Não implementar ainda:

- mudança de classe;
- missões de classe;
- árvores de habilidades;
- habilidades avançadas;
- evolução de classe.

---

# 7. SISTEMA UNIVERSAL DE HABILIDADES

Criar um sistema genérico.

Não criar lógica específica como:

`NovicePowerStrikeSystem`

ou

`NoviceEnergyBallSystem`.

As habilidades devem ser representadas por definições configuráveis.

Conceitualmente:

AbilityDefinition  
AbilityRuntime  
AbilityExecution  
AbilityEffect

ou arquitetura equivalente apropriada ao projeto.

---

# 8. ABILITY DEFINITION

Uma habilidade deve poder definir propriedades como:

- id;
- name;
- description;
- icon;
- targetingType;
- damageType;
- range;
- cooldown;
- manaCost;
- castTime;
- recovery;
- power;
- scaling;
- weaponRequirements;
- effects;
- requiresTarget;
- requiresLineOfSight;
- interruptible.

Não criar propriedades sem necessidade.

Mas prepare a arquitetura para expansão.

---

# 9. REQUISITO DE ARMA

Adicionar suporte explícito a:

`weaponRequirements`

Uma habilidade pode exigir determinado tipo de arma.

Exemplo:

Golpe Poderoso:

`weaponRequirements = ["sword"]`

Ataque Duplo:

`weaponRequirements = ["dagger"]`

Tiro Duplo:

`weaponRequirements = ["bow"]`

Bola de Energia:

`weaponRequirements = ["staff"]`

Regeneração:

sem requisito específico.

---

# 10. EQUIPAMENTO PROVISÓRIO

O sistema completo de inventário/equipamentos ainda NÃO existe.

Portanto NÃO implemente o inventário completo nesta iteração.

Crie apenas uma estrutura mínima para o personagem possuir:

`equippedWeaponType`

ou equivalente.

Para debug, permitir alternar entre:

- sword;
- dagger;
- bow;
- staff.

Isso existe apenas para validar requisitos.

Posteriormente será substituído/conectado ao sistema real de equipamentos.

---

# 11. HABILIDADE INDISPONÍVEL PELA ARMA

Se o personagem tentar utilizar uma habilidade incompatível:

NÃO executar.

Fornecer feedback:

**Requer Espada**

**Requer Adaga**

**Requer Arco**

**Requer Cajado**

A hotbar também deve indicar visualmente que aquela habilidade está indisponível.

---

# 12. TROCA DE ARMA E HOTBAR

Ao trocar a arma provisória:

as habilidades NÃO precisam desaparecer da hotbar.

Elas podem permanecer visíveis.

Porém as incompatíveis ficam desabilitadas.

Isso ajuda o jogador a entender:

> "Eu conheço essa técnica, mas preciso da arma apropriada."

---

# 13. HOTBAR

Criar 8 slots:

`1 2 3 4 5 6 7 8`

Permitir:

- teclado;
- clique.

Inicialmente:

1 — Golpe Poderoso  
2 — Ataque Duplo  
3 — Tiro Duplo  
4 — Bola de Energia  
5 — Regeneração  
6 — vazio  
7 — vazio  
8 — vazio

Essa configuração é provisória.

Posteriormente o jogador poderá organizar habilidades.

---

# 14. GOLPE PODEROSO

## Espada

Representa a introdução ao Guerreiro.

Características:

- requer espada;
- target inimigo;
- corpo a corpo;
- dano físico;
- impacto forte;
- cooldown moderado;
- custo pequeno ou moderado;
- utiliza Physical Attack.

Conceitualmente:

um único ataque significativamente mais forte que o auto-attack.

Não adicionar stun ainda.

---

# 15. ATAQUE DUPLO

## Adaga/Faca

Representa a introdução ao Assassino.

Características:

- requer adaga;
- target inimigo;
- alcance curto;
- dano físico;
- dois impactos rápidos.

IMPORTANTE:

Os dois impactos devem ser resolvidos individualmente.

Exemplo:

primeiro ataque acerta.

segundo ataque pode:

- acertar;
- errar;
- critar independentemente.

Não implementar como simplesmente:

`dano × 2`

em um único impacto.

Queremos provar suporte a habilidades multi-hit.

---

# 16. TIRO DUPLO

## Arco

Representa a introdução ao Arqueiro.

Características:

- requer arco;
- target inimigo;
- longo alcance;
- dano físico;
- dois disparos.

Pode utilizar projéteis simples de debug.

Cada disparo deve poder possuir impacto próprio.

Isso também valida:

- ranged combat;
- projéteis;
- multi-hit;
- linha de visão.

---

# 17. BOLA DE ENERGIA

## Cajado

Representa a introdução ao Feiticeiro.

Características:

- requer cajado;
- target inimigo;
- alcance à distância;
- dano mágico;
- pequeno cast time;
- projétil;
- custo de MP;
- utiliza Magic Attack;
- defesa do alvo utiliza Magic Defense.

Essa habilidade valida o caminho mágico do sistema.

---

# 18. REGENERAÇÃO

## Sem requisito de arma

Representa uma primeira introdução ao estilo do Sacerdote.

Regeneração NÃO deve ser simplesmente uma cura instantânea.

Ela deve aplicar um efeito:

## Heal over Time

Exemplo conceitual:

cura uma quantidade pequena imediatamente OU nenhuma,

e depois recupera HP gradualmente durante alguns segundos.

Os valores ainda são provisórios.

Objetivo:

introduzir o jogador à ideia de:

- sustentação;
- suporte;
- gerenciamento de recursos;
- efeitos ao longo do tempo.

---

# 19. HEAL OVER TIME

Criar suporte genérico para efeitos periódicos.

Um efeito pode possuir:

- duração;
- intervalo;
- valor por tick;
- source;
- target;
- quantidade de ticks.

Não criar código exclusivo chamado:

`regenerationTimer`.

Queremos infraestrutura reutilizável futuramente para:

- regeneração;
- poison;
- burn;
- bleed;
- outras condições periódicas.

---

# 20. AUTO-ATTACK E HABILIDADE

Preservar a filosofia estabelecida:

clicar em inimigo

→ aproxima

→ auto-attack.

Ao pressionar habilidade:

auto-attack atual

→ transição coerente

→ skill

→ recovery

→ retorno ao auto-attack.

Caso o alvo continue válido.

---

# 21. FILA DE AÇÃO

Não armazenar uma sequência enorme de comandos.

Permitir no máximo:

## uma habilidade pendente.

A intenção mais recente pode substituir a anterior enquanto ela ainda não tiver começado.

Adicionar pequeno input buffer para responsividade.

---

# 22. MULTI-HIT

O sistema deve suportar genericamente:

`hitCount`

e/ou uma sequência temporal de impactos.

Ataque Duplo e Tiro Duplo devem utilizar essa infraestrutura.

Não criar dois sistemas especiais diferentes.

---

# 23. PROJÉTEIS

Criar suporte genérico para projéteis.

Tiro Duplo e Bola de Energia devem reutilizar esse sistema.

Um projétil pode possuir:

- origem;
- target;
- velocidade;
- efeito no impacto;
- duração máxima.

Não implementar física avançada.

---

# 24. TARGET MORRE ENTRE IMPACTOS

Exemplo:

Ataque Duplo.

Primeiro golpe mata o Slime.

O segundo NÃO deve:

- atacar cadáver;
- procurar automaticamente outro inimigo;
- causar dano fantasma.

A sequência deve terminar corretamente.

O mesmo vale para Tiro Duplo.

---

# 25. COOLDOWN

Cada habilidade possui cooldown independente.

Mostrar cooldown na hotbar.

Não permitir reutilização antes do fim.

Cooldowns devem respeitar pausa.

---

# 26. MP

Utilizar MP existente.

Inicialmente todas ou algumas habilidades podem consumir MP conforme balanceamento provisório.

Não permitir MP negativo.

Feedback:

**MP insuficiente**

---

# 27. MOMENTO DO CUSTO

MP e cooldown devem ser comprometidos quando a habilidade realmente entra em execução válida.

Não simplesmente quando o jogador pressiona a tecla.

Se a habilidade nunca chegou a começar por:

- target inválido;
- arma incorreta;
- rota impossível;

não cobrar.

---

# 28. APROXIMAÇÃO AUTOMÁTICA

Se habilidade exige target e ele está fora do alcance:

personagem deve tentar aproximar-se automaticamente.

Exemplo:

espada:

aproxima bastante.

arco:

para a uma distância maior.

Isso deve utilizar o range da própria habilidade.

---

# 29. WEAPON RANGE

Não assumir que todas as armas compartilham o alcance do ataque básico atual.

Preparar o sistema para que futuramente a arma equipada também possa modificar:

- alcance do auto-attack;
- velocidade;
- dano;
- animação.

Nesta etapa, o requisito de skill é prioritário.

Não construir ainda o sistema completo de armas.

---

# 30. WORLD FACING

Skills direcionadas devem orientar o personagem corretamente para o target.

Reutilizar:

World Facing → Visual Facing.

Não usar Camera Yaw para decidir direção lógica do ataque.

---

# 31. TOOLTIP

Cada habilidade deve explicar claramente:

### Golpe Poderoso

Ataque físico poderoso.

**Requer: Espada**

### Ataque Duplo

Executa dois ataques rápidos.

**Requer: Adaga**

### Tiro Duplo

Dispara duas flechas contra o alvo.

**Requer: Arco**

### Bola de Energia

Canaliza energia mágica e lança contra o inimigo.

**Requer: Cajado**

### Regeneração

Recupera HP gradualmente durante alguns segundos.

**Sem requisito de arma**

Também mostrar:

- custo;
- cooldown;
- alcance quando relevante.

---

# 32. SEM CLASSES AINDA

Apesar de cada habilidade representar uma futura classe:

o personagem continua:

## Novato

Não alterar `classId`.

Não implementar Guerreiro/Arqueiro/etc.

Essas habilidades pertencem ao Novato.

---

# 33. FUNÇÃO PEDAGÓGICA DO KIT

As habilidades devem ser mecanicamente diferentes de propósito.

Queremos que o jogador experimente:

### Espada

"Eu gosto de ficar perto e dar golpes fortes."

### Adaga

"Eu gosto de ataques rápidos/múltiplos."

### Arco

"Eu gosto de atacar à distância."

### Cajado

"Eu gosto de conjuração e dano mágico."

### Regeneração

"Eu gosto de sustentação/suporte."

Isso futuramente ajudará o jogador a decidir sua classe.

---

# 34. NÃO TORNAR NOVATO COMPLETO DEMAIS

Apesar de possuir acesso experimental aos cinco estilos:

o Novato deve continuar claramente limitado.

As habilidades devem ser:

- simples;
- fáceis de entender;
- pouco especializadas.

A mudança de classe deve representar um aumento grande de:

- profundidade;
- identidade;
- opções;
- poder.

---

# 35. PROGRESSÃO DAS PRIMEIRAS HORAS

NÃO implementar ainda desbloqueio temporal completo.

Mas preparar para que futuramente as habilidades do Novato possam ser apresentadas gradualmente durante suas primeiras 2–3 horas.

Não necessariamente entregar tudo imediatamente nos primeiros segundos.

Isso será definido junto ao conteúdo inicial/quests.

---

# 36. FUTURA MUDANÇA DE CLASSE

Depois das primeiras horas, o jogador poderá realizar uma missão no Hub para escolher entre:

- Guerreiro;
- Arqueiro;
- Feiticeiro;
- Assassino;
- Sacerdote.

Cada classe terá missão própria.

NÃO implementar isso nesta iteração.

---

# 37. EVOLUÇÕES FUTURAS

Cada classe terá futuramente pelo menos:

**2 caminhos evolutivos diferentes.**

A arquitetura de habilidades não deve depender de uma progressão linear única.

Entretanto, árvores/evoluções NÃO pertencem à Iteração 06.

---

# 38. DEBUG DE ARMA

Como inventário ainda não existe, adicionar ferramenta de desenvolvimento para alternar:

Sword  
Dagger  
Bow  
Staff

Mostrar arma atual no debug.

Não transformar isso em interface final.

---

# 39. TESTES OBRIGATÓRIOS

Testar:

### Espada equipada

Golpe Poderoso funciona.

Outras habilidades que exigem arma ficam bloqueadas.

Regeneração funciona.

### Adaga equipada

Ataque Duplo funciona.

Validar dois impactos independentes.

### Arco equipado

Tiro Duplo funciona.

Validar dois projéteis.

### Cajado equipado

Bola de Energia funciona.

Validar:

- cast;
- projétil;
- dano mágico.

### Qualquer arma

Regeneração funciona.

Validar HoT.

---

# 40. TESTES DE TROCA

Trocar arma durante:

- Idle;
- auto-attack;
- habilidade pendente.

Definir comportamento seguro.

Se uma habilidade ainda não começou e a nova arma não atende ao requisito:

cancelar intenção.

Não permitir exploração de troca de arma para iniciar habilidade inválida.

---

# 41. TESTES AUTOMATIZADOS

Adicionar cobertura para:

- AbilityDefinition;
- requisitos de arma;
- arma incorreta;
- slot indisponível;
- hotbar;
- MP;
- cooldown;
- pausa;
- fila;
- input buffer;
- Golpe Poderoso;
- Ataque Duplo;
- dois hits independentes;
- morte entre hits;
- Tiro Duplo;
- dois projéteis;
- Bola de Energia;
- dano mágico;
- Magic Defense;
- cast;
- Regeneração;
- efeito periódico;
- expiração;
- morte;
- interrupção;
- auto-attack → skill → auto-attack;
- diferentes FPS.

Preservar todos os testes anteriores.

---

# 42. NÃO IMPLEMENTAR NESTA ETAPA

Não implementar:

- classes;
- missão de classe;
- árvores;
- evolução;
- inventário completo;
- equipamentos completos;
- loot;
- XP de inimigos;
- baús;
- Torre procedural;
- progressão das 13 semanas;
- balanceamento final;
- multiplayer;
- PvP;
- sprites finais.

---

# 43. CRITÉRIOS DE CONCLUSÃO

A Iteração 06 estará concluída quando:

1. existir Ability System genérico;
2. existir hotbar 1–8;
3. existir suporte a requisito de arma;
4. arma incorreta bloquear skill;
5. Golpe Poderoso funcionar com espada;
6. Ataque Duplo funcionar com adaga;
7. os dois impactos forem independentes;
8. Tiro Duplo funcionar com arco;
9. os dois projéteis funcionarem;
10. Bola de Energia funcionar com cajado;
11. dano mágico utilizar Magic Attack/Magic Defense;
12. Regeneração funcionar independentemente da arma;
13. existir infraestrutura genérica de efeito periódico;
14. cooldown funcionar;
15. MP funcionar;
16. cast funcionar;
17. range próprio funcionar;
18. aproximação automática funcionar;
19. LOS funcionar;
20. fila de uma ação funcionar;
21. auto-attack retornar depois da skill;
22. target morto cancelar corretamente sequências;
23. pausa congelar habilidades;
24. morte cancelar ações;
25. debug permitir trocar arma;
26. todos os testes anteriores continuarem funcionando.

---

# 44. AO FINALIZAR

Pare.

Produza relatório contendo:

- arquivos criados;
- arquivos modificados;
- arquitetura do Ability System;
- estrutura de AbilityDefinition;
- sistema de requisitos;
- sistema multi-hit;
- sistema de projéteis;
- sistema periódico;
- fila de ações;
- regras de custo/cooldown;
- testes;
- limitações;
- performance.

NÃO iniciar mudança de classe automaticamente.

---

# REGRA PRINCIPAL

O Novato deve funcionar como uma pequena amostra das cinco fantasias futuras de Dungeon Master.

Ele não domina nenhuma delas.

Ele apenas experimenta:

**Espada → Guerreiro**

**Adaga → Assassino**

**Arco → Arqueiro**

**Cajado → Feiticeiro**

**Regeneração → Sacerdote**

Depois de aproximadamente 2–3 horas de jogo, o jogador deverá ter experiência suficiente para pensar:

> "Agora eu sei qual desses estilos quero transformar na minha verdadeira classe."