# DUNGEON MASTER — BETA 0.1.0
# ITERAÇÃO 08 — VARIEDADE DE COMBATE, IDENTIDADE DAS ARMAS E PROGRESSÃO INICIAL

Continue o desenvolvimento da implementação atual de Dungeon Master.

A Iteração 07 está concluída e possui o primeiro loop completo funcional:

REFÚGIO
→ preparação
→ Torre
→ Andar 1
→ Andar 2
→ Andar 3
→ Boss
→ Baú
→ Refúgio
→ recompensa
→ progressão
→ nova expedição.

NÃO reconstruir esse loop.

A Iteração 08 deve melhorar a REPETIBILIDADE desse loop.

O objetivo agora é descobrir:

> “A segunda, terceira e quinta expedição continuam interessantes?”

---

# 1. OBJETIVOS DA ITERAÇÃO

Esta iteração possui quatro pilares:

1. progressão inicial real do Novato;
2. identidade mais forte entre armas;
3. maior variedade de inimigos;
4. maior variedade entre runs.

Também deve ser realizado um RESET CONTROLADO do progresso salvo atual para permitir testar toda a experiência novamente desde o começo.

NÃO implementar classes ainda.

---

# 2. AUDITORIA ANTES DE ALTERAR

Antes de modificar código:

1. leia a implementação atual;
2. rode todos os testes existentes;
3. confirme os 199 testes da Iteração 07 ou o número atual equivalente;
4. confirme o loop completo;
5. confirme geração procedural;
6. confirme XP/level;
7. confirme inventário;
8. confirme equipamentos;
9. confirme Skill Tree;
10. confirme habilidades;
11. confirme loot/baú;
12. confirme save/load;
13. confirme Primeiros Passos.

Somente depois iniciar alterações.

---

# 3. RESET DO PROGRESSO ATUAL

IMPORTANTE:

Para esta Iteração 08 quero testar novamente como um jogador completamente novo.

O progresso local existente deve ser invalidado/resetado de forma CONTROLADA.

Após atualizar para esta versão, o perfil normal utilizado no navegador deve começar novamente como personagem novo.

Estado esperado:

- Novato;
- nível 1;
- XP 0;
- ouro 0;
- STR base;
- AGI base;
- VIT base;
- INT base;
- DEX base;
- LUK base;
- 0 pontos de atributo disponíveis;
- 0 Espaços de Habilidade disponíveis;
- nenhuma habilidade aprendida;
- inventário vazio;
- nenhuma arma;
- nenhum equipamento;
- Primeiros Passos 0/início;
- nenhuma run ativa;
- nenhum baú;
- nenhum loot anterior.

O objetivo é remover o progresso de desenvolvimento acumulado até agora para validar a nova progressão do zero.

---

# 4. RESET NÃO DEVE VIRAR GAMBIARRA

Não espalhar:

localStorage.clear()

aleatoriamente pelo projeto.

Utilizar a estratégia de versionamento/migração já existente.

Pode aumentar:

`progressionVersion`

ou mecanismo equivalente.

A nova versão deve reconhecer saves anteriores à Iteração 08 e iniciar o novo estado de teste conforme especificado.

Documentar claramente a decisão.

---

# 5. NÃO RESETAR A CADA RELOAD

CRÍTICO:

O reset acontece UMA VEZ ao migrar para esta versão.

Depois disso:

save/load deve funcionar normalmente.

Exemplo:

atualiza para Iteração 08
→ save antigo invalidado/resetado
→ personagem novo.

Jogador sobe para nível 2
→ salva
→ fecha
→ abre novamente
→ continua nível 2.

NÃO resetar novamente.

---

# 6. PROGRESSÃO DO NOVATO

Agora o Novato deve começar a ter progressão real.

No nível 1:

o personagem NÃO conhece automaticamente todas as habilidades.

Ele deve começar:

## sem habilidades aprendidas.

A Skill Tree continua acessível por TAB.

---

# 7. ESPAÇOS DE HABILIDADE

Introduzir um novo recurso de progressão chamado:

# Espaço de Habilidade

Plural:

# Espaços de Habilidade

Esse é o nome provisório utilizado nesta fase.

Não chamar de Skill Point na interface em português.

---

# 8. FUNÇÃO DO ESPAÇO DE HABILIDADE

Aprender uma habilidade custa:

## 1 Espaço de Habilidade.

Todas as cinco habilidades atuais custam exatamente:

`1`

Não existem custos diferentes nesta versão.

---

# 9. COMO GANHAR ESPAÇOS DE HABILIDADE

Espaços de Habilidade devem ser obtidos através de progressão de nível.

Utilizar uma regra simples e configurável.

Para esta primeira versão:

## cada Level Up concede 1 Espaço de Habilidade.

Além dos pontos de atributo já concedidos pelo Level Up.

Portanto:

Level Up
→ +5 pontos de atributo
→ +1 Espaço de Habilidade.

Centralizar isso na configuração de progressão.

Não espalhar números mágicos.

---

# 10. NÍVEL 1

Personagem novo:

Nível 1.

Começa com:

- 0 Espaços de Habilidade;
- nenhuma habilidade aprendida.

Isso significa que inicialmente o jogador luta apenas com:

## ataque básico da arma.

Isso é intencional.

Queremos que o jogador primeiro entenda:

- movimento;
- câmera;
- arma;
- ataque básico;
- combate.

Depois, ao subir de nível:

> “Ganhei algo novo para aprender.”

---

# 11. PRIMEIRO LEVEL UP

Quando o jogador subir de nível pela primeira vez:

dar feedback claro:

**NÍVEL 2!**

**+5 Pontos de Atributo**

**+1 Espaço de Habilidade**

ou apresentação equivalente.

Não precisa ser arte final.

---

# 12. SKILL TREE

TAB continua abrindo a árvore.

Agora cada habilidade deve mostrar:

- nome;
- descrição;
- requisito de arma;
- MP;
- cooldown;
- alcance;
- custo em Espaços de Habilidade;
- estado.

---

# 13. ESTADOS DA HABILIDADE

Uma habilidade pode estar:

## Não aprendida

Jogador ainda não possui.

## Disponível

Jogador possui Espaço de Habilidade suficiente.

## Aprendida

Já adquirida.

## Indisponível

Caso algum requisito futuro não seja atendido.

Nesta versão, as cinco habilidades não possuem pré-requisitos além do custo.

---

# 14. APRENDER HABILIDADE

Ao selecionar:

Golpe Poderoso

Ataque Duplo

Tiro Duplo

Bola de Energia

Regeneração

mostrar:

**Custo: 1 Espaço de Habilidade**

e botão:

**APRENDER**

Ao confirmar:

- consumir exatamente 1 Espaço;
- adicionar habilidade às conhecidas;
- atualizar árvore;
- atualizar hotbar;
- salvar imediatamente.

---

# 15. NÃO PERMITIR SALDO NEGATIVO

Se jogador possui:

0 Espaços de Habilidade

não permitir aprender.

Mostrar:

**Você precisa de 1 Espaço de Habilidade.**

---

# 16. SEM RESPEC AINDA

Uma habilidade aprendida permanece aprendida.

Não implementar:

- refund;
- reset individual;
- respec;
- troca de habilidade.

Essas decisões ficam para depois.

---

# 17. HOTBAR

Preservar hotbar 1–8.

Habilidades não aprendidas continuam visíveis de maneira apropriada ou com slot/estado indisponível conforme a implementação atual.

Não permitir execução antes do aprendizado.

---

# 18. FUNÇÃO PEDAGÓGICA DO NOVATO

As cinco habilidades continuam representando amostras das futuras classes:

Espada
→ Golpe Poderoso
→ Guerreiro

Adaga
→ Ataque Duplo
→ Assassino

Arco
→ Tiro Duplo
→ Arqueiro

Cajado
→ Bola de Energia
→ Feiticeiro

Qualquer arma
→ Regeneração
→ Sacerdote.

O jogador continua:

# NOVATO.

Não implementar mudança de classe.

---

# 19. PRIMEIROS PASSOS

Revisar o onboarding.

Como o personagem começa sem Espaços de Habilidade, NÃO exigir aprender uma habilidade antes de entrar na primeira run.

Isso criaria um bloqueio impossível.

A primeira entrada na Torre deve exigir:

- conversar com Armeiro;
- obter arma;
- equipar arma.

Não exigir habilidade.

---

# 20. ONBOARDING E PRIMEIRO LEVEL UP

Quando o jogador conseguir seu primeiro Espaço de Habilidade:

adicionar orientação contextual simples:

**Você ganhou um Espaço de Habilidade!**

**Pressione TAB para aprender uma nova habilidade.**

Esse aviso substitui a antiga expectativa de aprender uma habilidade imediatamente antes da primeira Torre.

Não criar popup excessivo.

---

# 21. IDENTIDADE DAS ARMAS

Agora as quatro armas precisam começar a oferecer experiências claramente diferentes.

Não devem ser apenas:

“a mesma arma com números diferentes”.

Preservar o sistema universal de combate.

---

# 22. ESPADA

## Espada de Treino

Fantasia:

golpes próximos, fortes e estáveis.

Ataque básico:

- melee;
- alcance curto;
- dano físico;
- impacto visual mais pesado;
- velocidade moderada.

Não adicionar stun automático.

---

# 23. ADAGA

## Adaga de Treino

Fantasia:

proximidade extrema e velocidade.

Ataque básico:

- melee;
- alcance ligeiramente menor que espada;
- dano individual menor;
- Attack Speed maior.

A diferença deve ser perceptível durante gameplay.

Não transformar Attack Speed em stagger permanente.

---

# 24. ARCO

## Arco de Treino

Fantasia:

combate físico à distância.

Ataque básico:

- ranged;
- dano físico;
- projétil visual;
- alcance significativamente maior;
- utiliza Physical Attack;
- defesa física do alvo.

O ataque básico NÃO deve mais causar dano invisível à distância.

Criar projétil visual simples.

---

# 25. CAJADO

## Cajado de Treino

Fantasia:

combate mágico à distância.

Ataque básico:

- ranged;
- dano mágico;
- projétil visual;
- alcance significativo;
- utiliza Magic Attack;
- utiliza Magic Defense do alvo.

Visualmente deve ser distinguível do projétil do arco mesmo com placeholders simples.

---

# 26. PROJÉTEIS DE ATAQUE BÁSICO

Reutilizar o máximo possível da infraestrutura de projéteis existente.

Não criar um segundo motor completamente separado apenas para ataques básicos.

Precisamos suportar:

auto-attack
→ windup
→ lançamento
→ projectile travel
→ impacto
→ recovery.

O dano acontece no impacto.

Não no lançamento.

---

# 27. PROJÉTIL E ALVO MORTO

Se alvo morrer antes do impacto:

projétil deve expirar/cancelar de maneira segura.

Não:

- atingir cadáver;
- atingir respawn;
- procurar outro alvo automaticamente.

---

# 28. VARIEDADE DE INIMIGOS

Introduzir poucos inimigos novos.

Não criar bestiário enorme.

Objetivo:

fazer o jogador tomar decisões diferentes.

Criar inicialmente:

1. Slime comum;
2. Slime Saltador;
3. Slime Mágico.

Nomes são provisórios.

---

# 29. SLIME COMUM

Preservar função atual.

Características:

- melee;
- simples;
- passivo até provocado;
- aproxima;
- ataca;
- leash;
- retorna.

É a referência básica.

---

# 30. SLIME SALTADOR

Criar variação voltada à mobilidade.

Objetivo:

pressionar jogadores que simplesmente mantêm distância.

Características conceituais:

- melee;
- mais móvel;
- velocidade ou aproximação superior;
- pode possuir uma aproximação curta/avanço periódico simples;
- menos HP ou defesa que inimigos pesados, se necessário.

NÃO criar física complexa.

NÃO precisa literalmente simular salto balístico.

Pode ser uma ação de avanço visual/mecânico simples.

---

# 31. SLIME MÁGICO

Criar inimigo ranged.

Objetivo:

forçar o jogador a:

- aproximar-se;
- reposicionar;
- utilizar cobertura;
- priorizar ameaças.

Características:

- ataque mágico;
- projétil;
- alcance maior;
- tenta manter distância apropriada;
- utiliza Magic Attack/Magic Defense conforme sistema existente.

Não criar dez magias.

Um ataque ranged básico é suficiente.

---

# 32. IA UNIVERSAL

Não criar:

`MagicSlimeAI`

`JumpingSlimeAI`

com cópias gigantes da IA existente.

Estender comportamento através de:

- EnemyDefinition;
- perfil de combate;
- parâmetros;
- capacidades/ações simples.

Preservar arquitetura compartilhada.

---

# 33. PASSIVIDADE

Durante esta fase inicial da Torre:

todos esses inimigos podem continuar passivos até provocação.

Proximidade não gera aggro.

Provocação continua exigindo impacto hostil válido.

---

# 34. VARIEDADE ENTRE ANDARES

Os três andares devem começar a ter composições diferentes.

Exemplo conceitual:

## Andar 1

Predominantemente Slimes comuns.

Pouca complexidade.

Objetivo:

ensinar combate básico.

## Andar 2

Introduzir Slime Saltador.

Combinação de:

- comuns;
- saltadores.

## Andar 3

Introduzir Slime Mágico.

Combinação de:

- comuns;
- saltadores;
- mágicos.

Depois:

Slime Guardião.

Não é obrigatório utilizar exatamente as mesmas quantidades a cada run.

---

# 35. COMPOSIÇÃO PROCEDURAL

A seed deve poder influenciar:

- composição;
- posições;
- pequenas variações.

Mas cada andar possui regras mínimas.

Exemplo:

Andar 1:
sempre apropriado para introdução.

Andar 2:
pelo menos uma ameaça móvel.

Andar 3:
pelo menos uma ameaça ranged.

Não permitir RNG gerar uma composição pedagogicamente absurda.

---

# 36. NÃO CRIAR HORDAS

Preservar filosofia:

Dungeon Master não é focado em dezenas de inimigos simultâneos.

Preferir:

- poucos inimigos;
- inimigos relevantes;
- combinações interessantes.

Não usar quantidade como principal mecanismo de dificuldade.

---

# 37. PROCEDURAL — VARIEDADE DE ENCONTROS

Além da geometria, a geração agora deve produzir um:

`encounter layout`

ou equivalente.

A mesma geometria com inimigos diferentes já deve produzir situações distintas.

Separar:

- geração espacial;
- composição de encontro;
- spawn válido.

---

# 38. MAPA E COBERTURA

Como agora existe inimigo ranged:

garantir que os obstáculos procedurais possam realmente interferir em LOS.

Não transformar todo mapa em campo completamente aberto.

Ao mesmo tempo:

não criar situações onde o inimigo fique permanentemente inalcançável.

---

# 39. LOOT — MAIS DECISÕES

Expandir moderadamente o pool do baú.

Não criar dezenas de equipamentos.

Objetivo:

começar a apresentar escolhas.

Hoje existem:

- Capuz do Viajante;
- Colete do Viajante;
- Botas do Viajante;
- Anel de Foco.

Adicionar poucos itens.

Algo como:

2 opções por alguns slots importantes.

---

# 40. EXEMPLOS DE NOVOS ITENS

Valores são provisórios.

Pode existir algo conceitualmente como:

## Capuz Resistente
mais defesa.

## Capuz do Aprendiz
mais MP ou ataque mágico.

## Colete Reforçado
mais HP/defesa.

## Colete Leve
menos defesa, alguma esquiva.

## Botas Ágeis
esquiva/mobilidade apropriada.

## Anel de Força
ataque físico.

## Anel de Foco
ataque mágico.

Não precisa usar exatamente esses nomes.

---

# 41. TRADE-OFFS

Quando possível, itens devem começar a oferecer diferenças de build.

Não fazer simplesmente:

Item A = +2
Item B = +4

onde B é sempre objetivamente superior.

Podem existir diferenças como:

mais HP

versus

mais defesa

versus

mais ataque

versus

mais MP.

Ainda não precisamos de balanceamento perfeito.

---

# 42. SEM RARIDADES AINDA

Preservar decisão anterior:

NÃO implementar:

- Common;
- Uncommon;
- Rare;
- Epic;
- Legendary.

Ainda não.

Queremos primeiro validar escolhas de equipamento.

---

# 43. BAÚ

Preservar:

Boss
→ Baú
→ Refúgio
→ abrir
→ Reward Reel
→ item + ouro.

Não mudar a arquitetura da roleta.

Ela continua sendo apenas apresentação.

---

# 44. FUTURO EDUCACIONAL

Preservar separação atual:

loot pool
→ pesos
→ seleção lógica
→ roleta
→ concessão.

Não implementar perguntas matemáticas.

Não acoplar pedagogia à UI da roleta.

---

# 45. PROGRESSÃO ENTRE RUNS

Queremos que runs sucessivas comecem a produzir esta sensação:

Run 1:
“Estou aprendendo.”

Run 2:
“Agora tenho uma habilidade.”

Run 3:
“Minha arma/build começa a ter identidade.”

Runs posteriores:
“Estou ficando mais forte e fazendo escolhas.”

Não tentar resolver as 13 semanas nesta iteração.

---

# 46. BALANCEAMENTO INICIAL

Auditar a curva atual.

Atualmente uma run completa concede XP suficiente para vários níveis iniciais.

Agora que Level Up também concede Espaço de Habilidade, isso pode desbloquear habilidades rápido demais.

Revisar os valores.

Objetivo conceitual:

o jogador NÃO deve conseguir aprender as cinco habilidades depois de apenas uma run.

---

# 47. RITMO DAS HABILIDADES

Lembrar objetivo maior:

o jogador permanece Novato durante aproximadamente:

2–3 horas.

Durante esse período ele deve gradualmente experimentar os cinco estilos.

Não definir ainda a curva final das 3 horas.

Mas evitar:

30 minutos
→ todas as habilidades já aprendidas.

---

# 48. CONFIGURAÇÃO

Centralizar:

- XP dos inimigos;
- XP do boss;
- thresholds de level;
- pontos de atributo por level;
- Espaços de Habilidade por level;
- stats dos inimigos;
- composição dos andares;
- stats das armas;
- loot pool;
- pesos;
- ouro do baú.

Evitar números mágicos espalhados.

---

# 49. PRIMEIRA RUN DEVE CONTINUAR POSSÍVEL

Personagem novo possui:

- nenhuma habilidade;
- apenas ataque básico depois de pegar arma.

A primeira run PRECISA ser completável assim.

Não balancear o conteúdo presumindo uso obrigatório de habilidade.

Habilidades tornam o personagem:

- mais versátil;
- mais eficiente;
- mais interessante.

Não devem ser necessárias para sobreviver à primeira expedição.

---

# 50. ESCOLHA DE ARMA

O Armeiro continua oferecendo gratuitamente:

- Espada;
- Adaga;
- Arco;
- Cajado.

Personagem pode adquirir as quatro conforme regras atuais.

Não criar custo ainda.

---

# 51. TROCA DE ARMA

Preservar:

fora de combate
→ pode trocar.

Durante combate
→ bloqueado.

Não implementar weapon swap de ação rápida ainda.

---

# 52. HABILIDADE E ARMA

Preservar requisitos:

Golpe Poderoso
→ espada.

Ataque Duplo
→ adaga.

Tiro Duplo
→ arco.

Bola de Energia
→ cajado.

Regeneração
→ qualquer arma.

Uma habilidade aprendida continua conhecida mesmo sem a arma correta equipada.

---

# 53. TESTES — RESET

Adicionar testes para:

- save antigo;
- migração para nova versão;
- reset único;
- personagem nível 1;
- XP zero;
- ouro zero;
- inventário vazio;
- equipamento vazio;
- nenhuma habilidade;
- zero Espaços de Habilidade;
- onboarding resetado;
- reload NÃO reseta novamente;
- progressão posterior persiste.

---

# 54. TESTES — ESPAÇOS DE HABILIDADE

Testar:

- personagem novo começa com 0;
- level up concede 1;
- múltiplos level ups concedem corretamente;
- aprender custa 1;
- saldo decrementa;
- saldo nunca negativo;
- habilidade aprendida persiste;
- reload preserva saldo;
- não comprar duas vezes;
- nenhuma habilidade gratuita;
- cinco habilidades continuam independentes.

---

# 55. TESTES — ARMAS

Testar:

Espada:
- melee;
- dano físico;
- range correto.

Adaga:
- melee;
- velocidade diferenciada.

Arco:
- ranged;
- projétil;
- dano no impacto;
- dano físico.

Cajado:
- ranged;
- projétil;
- dano no impacto;
- dano mágico.

Também:

- alvo morre antes do projétil;
- LOS;
- pausa;
- mudança de área;
- morte;
- diferentes FPS.

---

# 56. TESTES — NOVOS INIMIGOS

Testar:

Slime comum.

Slime Saltador.

Slime Mágico.

Para todos:

- passividade;
- wander;
- provocação;
- combate;
- leash;
- retorno;
- morte;
- ausência de respawn.

Específicos:

Saltador:
- mobilidade especial não atravessa geometria;
- não teleporta para posição inválida.

Mágico:
- ranged;
- projétil;
- LOS;
- posicionamento;
- não ataca através de parede.

---

# 57. TESTES — COMPOSIÇÃO

Testar várias seeds.

Garantir:

Andar 1:
- composição válida para iniciante.

Andar 2:
- introdução da ameaça móvel.

Andar 3:
- ameaça ranged presente.

Nenhum spawn:

- dentro de obstáculo;
- inacessível;
- sobre outra entidade.

---

# 58. TESTES — LOOT

Testar:

- novos itens;
- slots;
- modificadores;
- equipar;
- trocar;
- retirar;
- recalcular;
- save/load;
- loot pool;
- resultado determinístico;
- roleta continua apenas apresentação.

---

# 59. TESTES DE REGRESSÃO

Preservar todos os testes anteriores.

A suíte da Iteração 07 possuía 199 testes aprovados.

Não remover testes apenas para a suíte passar.

Adaptar somente quando a nova especificação alterar legitimamente a expectativa anterior.

---

# 60. PLAYTEST MANUAL — PERSONAGEM NOVO

Depois da implementação:

executar playtest começando do perfil normal RESETADO.

NÃO utilizar debug para conceder:

- arma;
- XP;
- level;
- habilidade;
- equipamento;
- kill;
- teleporte.

---

# 61. PLAYTEST — PRIMEIRA RUN

Validar:

1. personagem nível 1;
2. nenhuma habilidade;
3. nenhum item;
4. Primeiros Passos inicial;
5. movimento;
6. câmera;
7. Armeiro;
8. adquirir arma;
9. equipar;
10. entrar sem habilidade;
11. combater somente com ataque básico;
12. observar passividade;
13. concluir Andar 1;
14. observar progressão;
15. receber primeiro level quando apropriado;
16. receber Espaço de Habilidade;
17. continuar run;
18. concluir Andar 2;
19. enfrentar variedade;
20. concluir Andar 3;
21. derrotar Guardião;
22. coletar baú;
23. retornar;
24. abrir recompensa;
25. receber item + ouro;
26. distribuir atributos;
27. abrir TAB;
28. aprender habilidade utilizando Espaço;
29. salvar;
30. recarregar.

---

# 62. PLAYTEST — SEGUNDA RUN

Esta parte é IMPORTANTE.

Executar também uma segunda expedição.

Validar se:

- composição muda;
- geometria muda;
- equipamento anterior permanece;
- habilidade permanece;
- nova habilidade realmente muda combate;
- arma possui identidade perceptível;
- inimigos novos exigem respostas diferentes;
- progressão continua funcionando.

Não avaliar apenas tecnicamente.

Registrar observações sobre:

- repetição;
- ritmo;
- clareza;
- dificuldade;
- duração aproximada;
- momentos mortos;
- possíveis frustrações.

---

# 63. TESTE DAS QUATRO ARMAS

Além das runs principais, verificar em cenário controlado:

Espada;
Adaga;
Arco;
Cajado.

Confirmar que as quatro não parecem apenas reskins numéricos do mesmo ataque.

Registrar diferenças observáveis.

---

# 64. PERFORMANCE

Não iniciar grande otimização.

Verificar regressões.

Especialmente:

- projéteis básicos;
- novos inimigos;
- pathfinding;
- procedural;
- múltiplos tipos simultâneos.

Manter stress test separado.

Debug visual não deve ser usado como única medição de FPS normal.

---

# 65. NÃO IMPLEMENTAR NESTA ITERAÇÃO

NÃO implementar:

- Guerreiro;
- Assassino;
- Arqueiro;
- Feiticeiro;
- Sacerdote como classes escolhíveis;
- mudança de classe;
- quests de classe;
- evolução;
- Floor 4+;
- novo bioma;
- boss definitivo;
- raridades;
- baús diferentes;
- perguntas matemáticas;
- crafting;
- mineração;
- pesca;
- armazém;
- comércio;
- multiplayer;
- party;
- PvP;
- Arena;
- persistência definitiva dos layouts;
- herança de andares;
- respec;
- skill tree definitiva;
- arte final.

---

# 66. CRITÉRIOS DE ACEITAÇÃO

A Iteração 08 somente está concluída quando:

[ ] save anterior foi resetado/migrado uma única vez;

[ ] personagem realmente começa do zero;

[ ] reload não causa novo reset;

[ ] nível 1 começa sem habilidades;

[ ] nível 1 começa com 0 Espaços de Habilidade;

[ ] level up concede Espaço de Habilidade;

[ ] habilidade custa exatamente 1 Espaço;

[ ] saldo é persistente;

[ ] Primeiros Passos não exige habilidade antes da primeira run;

[ ] primeira run é possível apenas com ataque básico;

[ ] espada possui identidade melee;

[ ] adaga possui identidade rápida;

[ ] arco possui ataque básico com projétil físico;

[ ] cajado possui ataque básico com projétil mágico;

[ ] projéteis causam dano no impacto;

[ ] existem pelo menos três perfis de inimigo;

[ ] Slime comum funciona;

[ ] Slime Saltador funciona;

[ ] Slime Mágico funciona;

[ ] inimigos permanecem passivos antes de provocação;

[ ] composição varia entre andares/runs;

[ ] procedural continua sempre atravessável;

[ ] boss continua funcionando;

[ ] baú continua funcionando;

[ ] Reward Reel continua determinística logicamente;

[ ] loot pool possui escolhas adicionais;

[ ] equipamentos recalculam stats corretamente;

[ ] XP/level possuem ritmo revisado;

[ ] uma única run não libera todas as cinco habilidades;

[ ] progressão permanente sobrevive a reload;

[ ] primeira run completa funciona sem debug;

[ ] segunda run completa funciona sem debug;

[ ] todos os testes automatizados passam;

[ ] build de produção passa.

---

# 67. RELATÓRIO FINAL

Ao terminar:

PARE.

Não iniciar Iteração 09.

Produzir relatório contendo:

## 1. RESET/MIGRAÇÃO
Como o save anterior foi invalidado e como evita resets futuros.

## 2. PROGRESSÃO
Curva de XP e level utilizada.

## 3. ESPAÇOS DE HABILIDADE
Como são obtidos, gastos e persistidos.

## 4. SKILL TREE
Comportamento atual.

## 5. ARMAS
Diferenças mecânicas entre as quatro.

## 6. PROJÉTEIS
Arquitetura do ataque básico ranged.

## 7. INIMIGOS
Três perfis e diferenças.

## 8. IA
Como comportamentos específicos reutilizam a infraestrutura existente.

## 9. PROCEDURAL
Como composição de encontros varia por seed.

## 10. LOOT
Novos equipamentos e decisões oferecidas.

## 11. BALANCEAMENTO
XP, inimigos, armas e ritmo provisórios.

## 12. PRIMEIRA RUN
Resultado do playtest completo.

## 13. SEGUNDA RUN
Resultado e diferenças observadas.

## 14. TESTE DAS QUATRO ARMAS
Sensação/diferenças verificadas.

## 15. TESTES
Número total e resultados.

## 16. PERFORMANCE
Medições relevantes.

## 17. LIMITAÇÕES
Tudo que continua provisório.

---

# REGRA PRINCIPAL

Não aumente o tamanho do jogo.

Aumente a quantidade de decisões interessantes dentro do jogo que já existe.

A Iteração 07 provou:

> “Dungeon Master possui um loop.”

A Iteração 08 deve provar:

> “Vale a pena jogar esse loop novamente.”

Ao terminar, PARE.