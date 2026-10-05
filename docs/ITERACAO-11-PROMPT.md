# DUNGEON MASTER — BETA 0.1.0
# ITERAÇÃO 11 — COOKING, CONSUMÍVEIS E ECONOMIA LOCAL
## Pescar → consumir, vender ou cozinhar

Continue o desenvolvimento da implementação atual de Dungeon Master.

A Iteração 10 está concluída.

O sistema atual já possui:

- Life Skill Foundation;
- Fishing Level e Fishing XP;
- Vara de Pesca;
- Water Features semânticos;
- Fishing Spots;
- minigame de Fishing;
- cinco espécies iniciais;
- peixes empilháveis;
- tags `fish` e `ingredient`;
- persistência;
- RNG separado;
- integração com o Lago dos Vaga-lumes;
- aproximadamente 279 testes aprovados.

A Iteração 11 deve transformar Fishing de uma atividade isolada em uma:

# CADEIA DE RECURSOS.

O loop desejado agora é:

TORRE
→ PESCAR
→ OBTER PEIXE
→ ESCOLHER

A) consumir peixe cru durante a aventura;

B) levar peixe ao Refúgio e vender;

C) levar peixe ao Refúgio e cozinhar;

→ produzir prato;

→ consumir prato ou vender.

Futuramente:

D) anunciar peixe/prato no Mercado Público para outros jogadores.

O Mercado Público NÃO será implementado nesta iteração.

---

# 1. VISÃO ECONÔMICA

A cadeia inicial de Fishing/Cooking é:

Fishing
→ Fish
→ Raw Consumption

ou:

Fishing
→ Fish
→ Cooking
→ Dish.

E então:

Fish
→ NPC Sale.

Dish
→ NPC Sale.

Futuramente:

Fish/Dish
→ Player Marketplace.

A decisão central deve ser:

> “O que faço com aquilo que pesquei?”

---

# 2. OBJETIVO DA ITERAÇÃO

Ao terminar esta iteração, peixe deve possuir:

# UTILIDADE.

O jogador poderá:

- comer;
- vender;
- cozinhar.

Cooking deve produzir:

- pratos melhores que ingredientes crus;
- progressão própria;
- novas decisões;
- produtos comercializáveis futuramente.

---

# 3. ESCOPO

Implementar:

- consumíveis;
- consumo de peixes crus;
- HP/MP recovery;
- NPC Cozinheiro;
- ingredientes básicos vendidos pelo Cozinheiro;
- Cooking Level/XP;
- receitas;
- Cooking Station;
- minigame simples de Cooking;
- pratos;
- buffs de comida;
- venda de peixes;
- venda de pratos;
- economia NPC simples;
- preparação arquitetural para futuro marketplace.

NÃO implementar Marketplace multiplayer ainda.

---

# 4. AUDITORIA

Antes de alterar código:

1. executar os 279 testes atuais ou quantidade equivalente;
2. executar build;
3. revisar Life Skill Foundation;
4. revisar Fishing;
5. revisar FishDefinitions;
6. revisar Inventory;
7. revisar ItemDefinition;
8. revisar HP/MP;
9. revisar buffs/status effects existentes;
10. revisar consumíveis existentes, se houver;
11. revisar ouro;
12. revisar Armeiro/NPC interaction;
13. revisar save/load;
14. revisar transações/rollback;
15. revisar Hub;
16. revisar interação por F.

Reutilizar sistemas existentes sempre que apropriado.

---

# 5. NÃO REESCREVER FISHING

Fishing está funcional.

Preservar:

- Vara;
- Fishing Level;
- Fishing XP;
- cinco espécies;
- Fishing Spots;
- Lago dos Vaga-lumes;
- RNG;
- stacks;
- minigame;
- interrupções.

Esta iteração constrói:

# SOBRE Fishing.

---

# 6. PEIXES AGORA SÃO CONSUMÍVEIS

Os cinco peixes existentes deixam de ser apenas ingredientes.

Eles passam a poder ser:

# CONSUMIDOS CRUDOS.

Continuam também sendo:

- fish;
- ingredient;
- tradeable futuramente.

Não remover nenhuma função existente.

---

# 7. CONSUMO CRU

Peixes crus devem oferecer efeitos simples.

Principalmente:

- recuperação de HP;
- recuperação de MP.

Não dar buffs poderosos aos peixes crus.

A comida preparada deve possuir vantagem real.

---

# 8. IDENTIDADE DOS PEIXES

Os cinco peixes atuais devem receber funções coerentes.

Não é obrigatório utilizar exatamente estes números, mas começar com algo equivalente a:

## Lambari do Limiar
Recuperação pequena de HP.

## Carpa dos Vaga-lumes
Recuperação moderada de HP.

## Bagre Musgoso
Recuperação maior de HP.

## Peixe-Lua
Recuperação de MP.

## Peixe Rúnico
Recuperação de HP + MP ou efeito especial moderado.

Balancear de acordo com HP/MP atuais.

Centralizar valores.

---

# 9. CONSUMO PELO INVENTÁRIO

No inventário:

selecionar peixe consumível
→ ação:

# COMER.

Ao usar:

- quantidade -1;
- aplicar efeito;
- atualizar HUD;
- salvar.

---

# 10. NÃO DESPERDIÇAR SEM FEEDBACK

Se HP estiver cheio e peixe recuperar apenas HP:

não consumir silenciosamente.

Bloquear ou pedir ação coerente.

Preferência:

> Sua vida já está cheia.

Mesmo para MP.

Se alimento recuperar HP + MP:

permitir se pelo menos um dos recursos puder ser recuperado.

---

# 11. OVERHEAL

Consumíveis não aumentam HP/MP acima do máximo.

Usar:

min(current + recovery, max).

---

# 12. COMER DURANTE COMBATE

Permitir consumo durante combate somente se arquitetura atual suportar isso de maneira segura.

Porém:

consumível deve possuir:

# COOLDOWN.

Não permitir spam instantâneo de 20 peixes.

Criar infraestrutura de cooldown de consumíveis apropriada.

---

# 13. COOLDOWN DE CONSUMÍVEIS

Começar simples.

Exemplo:

Food cooldown global ou por categoria.

Algo como:

5–10 segundos.

Centralizar configuração.

Não balancear definitivamente agora.

---

# 14. FUTURO

Arquitetura deve permitir futuramente:

- potion cooldown;
- food cooldown;
- outros consumíveis.

Não implementar poções nesta iteração.

---

# 15. COOKING

Ativar:

# Cooking

na Life Skill Foundation existente.

Começar:

Cooking Level 1
Cooking XP 0.

Persistir no personagem.

Não compartilhar XP com Fishing.

---

# 16. COOKING XP

Cozinhar prato com sucesso concede:

# Cooking XP.

Não concede:

- Character XP;
- Fishing XP;
- atributo;
- Skill Slot.

---

# 17. CURVA

Criar curva simples e configurável.

Pode seguir filosofia semelhante a Fishing sem obrigatoriamente usar exatamente a mesma fórmula.

Permitir observar Cooking Level Up durante testes.

---

# 18. COZINHEIRO

Adicionar NPC no Refúgio:

# COZINHEIRO.

Nome pode ser definido de acordo com o tom atual do jogo.

O NPC possui duas funções iniciais:

## COZINHAR

e:

## COMPRAR INGREDIENTES.

Também pode comprar peixes/pratos do jogador através da economia NPC definida abaixo.

---

# 19. INTERAÇÃO

Próximo ao Cozinheiro:

[F] FALAR

Interface simples oferecendo:

- Cozinhar;
- Comprar ingredientes;
- Vender;
- Sair.

Não criar árvore enorme de diálogo.

---

# 20. INGREDIENTES DO COZINHEIRO

O Cozinheiro vende ingredientes básicos.

Exemplos iniciais:

- Farinha;
- Sal;
- Ervas;
- Óleo;
- Água;
- talvez Legumes.

Não criar 30 ingredientes.

Começar com aproximadamente:

# 4–6 ingredientes básicos.

---

# 21. NÃO CRIAR AGRICULTURA

Esses ingredientes são adquiridos no NPC.

Não implementar:

- plantação;
- fazenda;
- harvesting;
- gathering;
- sementes;
- cultivo.

Isso é intencional.

As Life Skills planejadas continuam:

Fishing
Cooking
Mining
Smithing.

---

# 22. PREÇOS DOS INGREDIENTES

Ingredientes simples devem custar ouro.

Preços:

- baixos;
- configuráveis;
- suficientes para criar custo de produção.

Cooking passa a ser:

peixe obtido
+
ingrediente comprado
→ prato.

---

# 23. TRANSAÇÃO DE COMPRA

Compra deve ser atômica:

verificar ouro
→ verificar inventário
→ remover ouro
→ adicionar item
→ salvar.

Falha:

rollback.

---

# 24. RECEITAS

Criar sistema data-driven:

RecipeDefinition

ou equivalente.

Cada receita deve possuir:

- id;
- nome;
- descrição;
- Cooking Level mínimo;
- ingredientes;
- quantidades;
- resultado;
- quantidade produzida;
- Cooking XP;
- parâmetros do minigame quando apropriado.

---

# 25. RECEITAS INICIAIS

Criar aproximadamente:

# 5–7 receitas.

Não criar dezenas.

Devem utilizar diferentes combinações dos peixes existentes.

---

# 26. EXEMPLOS CONCEITUAIS

Não é obrigatório usar exatamente estes nomes/composições.

## Peixe Assado
Peixe comum + Sal.

Efeito:
boa recuperação de HP.

## Ensopado do Limiar
Lambari + Bagre + Água + Ervas.

Efeito:
HP maior.

## Carpa Dourada
Carpa + Farinha + Óleo.

Efeito:
HP + pequeno buff.

## Sopa Lunar
Peixe-Lua + Água + Ervas.

Efeito:
MP.

## Prato Rúnico
Peixe Rúnico + ingredientes adicionais.

Efeito:
HP + MP + buff moderado.

As receitas finais devem respeitar balanceamento atual.

---

# 27. COOKING PRECISA VALER A PENA

Regra importante:

Se:

Peixe A cru = 15 HP
Peixe B cru = 20 HP

e uma receita consome ambos + ingredientes:

o prato NÃO deve simplesmente recuperar 35 HP.

Caso contrário Cooking não acrescenta valor.

Pratos devem oferecer:

# VALOR ADICIONAL.

Por exemplo:

- maior eficiência;
- efeito combinado;
- buff;
- duração;
- melhor valor de venda.

---

# 28. CATEGORIAS DE EFEITO

Nesta versão, pratos podem produzir:

### Recovery
HP/MP imediato.

### Buff
efeito temporário.

Evitar sistemas excessivamente complexos.

---

# 29. BUFFS DE COMIDA

Começar com poucos modificadores.

Exemplos possíveis:

- Max HP;
- Max MP;
- Physical Attack;
- Magic Attack;
- Attack Speed;
- Defense.

Não implementar todos se sistema ficar complexo.

Preferir:

# 3–4 buffs bem testados.

---

# 30. DURAÇÃO

Buff de comida deve ser temporário.

Exemplo inicial:

5–10 minutos.

Centralizar valores.

Não usar duração de horas nesta fase.

---

# 31. MORTE

Definir regra simples:

Preferência inicial:

# buffs de comida são removidos na morte.

Documentar e testar.

---

# 32. NÃO EMPILHAR BUFFS INFINITAMENTE

Não permitir:

comer 10 pratos de Attack
→ +1000 Attack.

Definir regra clara.

Preferência:

# um Food Buff principal ativo por vez.

Consumir outro prato com buff:

substitui o anterior.

Recovery imediato ainda acontece quando apropriado.

---

# 33. COOKING STATION

Cooking acontece no Refúgio.

Pode ser:

- fogão;
- bancada;
- panela;
- fogueira;
- estação próxima ao Cozinheiro.

Interagir com Cozinheiro/estação abre Cooking.

Não cozinhar diretamente dentro da Torre nesta versão.

---

# 34. INTERFACE DE RECEITAS

Mostrar:

- receita;
- ingredientes;
- possuído/necessário;
- Cooking Level;
- resultado;
- efeito;
- Cooking XP.

Receita indisponível deve explicar por quê.

---

# 35. DESCOBERTA DE RECEITAS

Nesta primeira versão:

receitas podem ser desbloqueadas por:

# Cooking Level.

Não criar:

- livros;
- drops;
- quests culinárias;
- professores.

Futuramente pode mudar.

---

# 36. MINIGAME DE COOKING

Cooking NÃO deve ser:

clicar “Craft”
→ prato instantâneo.

Adicionar um:

# MINIGAME CURTO.

Mas não criar Cooking Mama completo.

---

# 37. FILOSOFIA DO MINIGAME

Queremos:

preparar
→ prestar atenção
→ agir
→ resultado.

Duração aproximada:

# poucos segundos.

Não criar 30 segundos de espera passiva.

---

# 38. PRIMEIRA MECÂNICA

Criar minigame simples baseado em timing.

Exemplo conceitual:

iniciar receita
→ indicador percorre uma barra
→ existe zona de acerto
→ jogador pressiona F/Space
→ resultado depende da precisão.

Implementação pode adaptar-se à UI atual.

---

# 39. RESULTADOS

Possíveis resultados:

## BOM
acerto normal.

## PERFEITO
acerto excelente.

## ERRO
fora da zona.

Não criar cinco tiers.

---

# 40. NÃO DESTRUIR TODO O INVESTIMENTO POR ERRO

Cooking deve evitar punição frustrante.

Uma falha não deve necessariamente apagar todos os ingredientes caros.

Preferência:

ERRO
→ produz versão simples/queimada com valor reduzido

OU
→ consome parcialmente ingredientes.

Escolher solução simples e consistente.

Documentar.

---

# 41. RECOMENDAÇÃO

Preferência de design:

# resultado normal sempre produz o prato.

A precisão influencia:

- pequena qualidade;
- Cooking XP;
- duração/força do efeito;

sem criar item rarity global.

Isso mantém minigame relevante sem tornar Cooking punitivo.

---

# 42. QUALIDADE CULINÁRIA

Se implementar qualidade:

usar apenas estados locais como:

Normal
Bem preparado

ou equivalente.

NÃO criar:

Common/Rare/Epic/Legendary.

Qualidade culinária não é rarity de equipamento.

---

# 43. INGREDIENTES SÓ SÃO CONSUMIDOS AO CONFIRMAR

Fluxo:

selecionar receita
→ validar
→ iniciar Cooking
→ resolver minigame
→ transação final.

Evitar remover ingredientes antes de saber que atividade iniciou corretamente.

---

# 44. TRANSAÇÃO ATÔMICA

Resultado de Cooking:

ingredientes removidos
+
prato adicionado
+
Cooking XP concedido
+
ouro não alterado exceto compra anterior

deve ser salvo consistentemente.

Falha:

rollback.

---

# 45. PRATOS COMO ITENS

Pratos são:

- consumable;
- food;
- cooked;
- tradeable futuramente.

Podem empilhar quando definição/qualidade forem iguais.

---

# 46. VALOR ECONÔMICO

Agora adicionar:

# BASE SELL VALUE

para:

- peixes;
- ingredientes quando apropriado;
- pratos.

Isso NÃO é Marketplace.

É economia NPC.

---

# 47. VENDA AO NPC

Cozinheiro pode comprar:

- peixes;
- pratos.

Talvez ingredientes básicos também, se apropriado.

Venda concede:

# ouro.

---

# 48. ECONOMIA NPC

Preços devem seguir regra:

peixe cru
→ possui valor.

prato
→ geralmente vale mais que peixe cru.

Mas considerar:

- custo dos ingredientes;
- esforço de Cooking;
- resultado.

Cooking não deve ser exploit infinito:

comprar ingredientes
→ cozinhar sem peixe relevante
→ vender
→ gerar ouro infinito.

---

# 49. TESTE DE ARBITRAGEM

Criar teste econômico para todas as receitas.

Verificar:

custo de ingredientes compráveis
+
valor dos recursos necessários

versus:

preço de venda.

Não permitir loop trivial infinito de NPC.

---

# 50. DECISÃO ECONÔMICA

Queremos criar:

PEIXE
→ comer agora?

ou:

PEIXE
→ vender por ouro?

ou:

PEIXE
→ investir ingredientes + Cooking
→ prato melhor?

Isso é a essência desta iteração.

---

# 51. MERCADO PÚBLICO FUTURO

Arquitetura dos itens deve permitir futuramente:

# PLAYER MARKETPLACE.

Jogadores poderão:

- anunciar peixe;
- anunciar prato;
- definir preço;
- comprar anúncio de outro jogador;
- receber ouro pela venda.

NÃO implementar isso agora.

---

# 52. NÃO USAR PREÇO NPC COMO PREÇO DE PLAYER

Marketplace futuro será:

# PLAYER-DRIVEN.

Jogador define o preço.

NPC possui apenas:

base buy/sell values.

Não impor futuramente preço fixo do NPC aos anúncios.

---

# 53. FUTURA ECONOMIA

O objetivo futuro é permitir especialização:

Jogador A:
pesca muito.

Jogador B:
cozinha muito.

Jogador C:
prefere combate e compra comida.

Isso deve gerar:

# ECONOMIA ENTRE JOGADORES.

Mas depende de multiplayer/persistência apropriada e terá iteração própria.

---

# 54. CONSUMÍVEIS NA TORRE

Peixes e pratos devem poder ser levados para a Torre.

Isso cria:

preparação no Hub
→ aventura
→ consumir quando necessário.

---

# 55. HOTBAR

Auditar hotbar atual.

Se infraestrutura permitir consumíveis sem conflitar com habilidades:

preparar suporte coerente.

Não destruir hotbar 1–8 de habilidades apenas para encaixar comida.

Se necessário:

consumo pelo inventário é suficiente nesta iteração.

Documentar decisão.

---

# 56. COOLDOWN VISUAL

Quando alimento estiver em cooldown:

UI deve comunicar.

Não permitir clicar repetidamente sem entender por que não funciona.

---

# 57. SAVE

Persistir:

- Cooking Level;
- Cooking XP;
- ingredientes;
- pratos;
- buffs quando apropriado;
- ouro.

Definir claramente se Food Buff persiste ao reload.

Preferência:

# persistir duração restante corretamente

se infraestrutura temporal permitir.

Caso contrário documentar regra mais simples e segura.

Não resetar silenciosamente para explorar reload.

---

# 58. FISHING CONTINUA IGUAL

Não alterar desnecessariamente:

- tempos de Fishing;
- pesos;
- Fishing XP;
- spots;
- Lago dos vaga-lumes.

Só mudar se bug concreto for encontrado.

---

# 59. TESTES — CONSUMO

Testar:

- comer peixe;
- quantidade -1;
- HP;
- MP;
- cap máximo;
- recurso cheio;
- cooldown;
- morte;
- save;
- reload;
- stack.

---

# 60. TESTES — COOKING PROGRESS

Testar:

- Cooking 1/0 inicial;
- XP;
- level up;
- múltiplos levels;
- persistência;
- independência de Fishing;
- independência de Character XP.

---

# 61. TESTES — RECEITAS

Para cada receita:

- level requirement;
- ingredientes;
- quantidade;
- output;
- XP;
- efeito;
- desbloqueio.

---

# 62. TESTES — MINIGAME

Testar:

- início;
- input;
- early;
- normal;
- perfect;
- conclusão;
- cancelamento;
- FPS quando relevante;
- nenhuma recompensa duplicada.

---

# 63. TESTES — TRANSAÇÃO

Testar:

- ingredientes removidos;
- prato concedido;
- XP concedido;
- save;
- rollback;
- inventário cheio;
- desconexão/falha simulada quando infraestrutura permitir.

---

# 64. TESTES — BUFFS

Testar:

- aplicar;
- duração;
- expirar;
- substituir;
- morte;
- reload;
- stats derivados;
- HP/MP máximos quando buff expira.

Evitar HP inválido após redução de Max HP.

---

# 65. TESTES — ECONOMIA

Testar:

- comprar ingrediente;
- ouro insuficiente;
- mochila cheia;
- vender peixe;
- vender prato;
- quantidade;
- ouro;
- rollback.

---

# 66. TESTES — ANTI-EXPLOIT

Para todas as receitas:

verificar que:

comprar insumos
→ cozinhar
→ vender

não produz arbitragem infinita trivial.

Também testar:

- spam de consumo;
- duplicação por save;
- venda duplicada;
- Cooking XP duplicado;
- cancelamento do minigame.

---

# 67. REGRESSÃO

Preservar todos os testes da Iteração 10.

Base esperada:

aproximadamente 279 testes.

Não remover testes existentes para passar.

---

# 68. PLAYTEST MANUAL — ESCOPO REDUZIDO

Seguir a orientação atual do projeto:

não é necessário repetir os três andares, boss e baú para toda mudança.

Usar:

# um andar representativo

para validação de Fishing/consumíveis.

E:

# Refúgio

para Cooking/economia.

Automação cobre regressões amplas.

---

# 69. PLAYTEST — CICLO COMPLETO DO PEIXE

Validar manualmente:

Refúgio
→ obter Vara
→ entrar na Torre
→ encontrar Lago dos vaga-lumes
→ pescar várias espécies
→ consumir pelo menos um peixe
→ retornar ao Refúgio
→ conferir peixes restantes.

---

# 70. PLAYTEST — COZINHEIRO

No Refúgio:

→ falar com Cozinheiro
→ comprar ingredientes
→ selecionar receita
→ cozinhar
→ testar minigame
→ produzir prato
→ ganhar Cooking XP.

---

# 71. PLAYTEST — CONSUMO DO PRATO

Levar prato para cenário adequado.

Testar:

- recovery;
- buff;
- cooldown;
- feedback;
- duração.

---

# 72. PLAYTEST — VENDA

Testar:

peixe
→ vender.

prato
→ vender.

Confirmar:

- item removido;
- ouro adicionado;
- save;
- reload.

---

# 73. PLAYTEST — DECISÃO

Responder no relatório:

> Depois de pescar um peixe, existem motivos compreensíveis para escolher entre comer, vender ou cozinhar?

Essa é a pergunta mais importante da Iteração 11.

---

# 74. NÃO IMPLEMENTAR

NÃO implementar:

- Marketplace entre jogadores;
- auction house;
- listings;
- multiplayer;
- troca direta;
- Mining;
- Smithing;
- minério;
- criação de armas;
- upgrade de armas;
- agricultura;
- plantação;
- Gathering;
- dezenas de receitas;
- ingredientes raros;
- raridade global;
- buffs extremamente poderosos;
- Cooking quests;
- Fishing quests;
- Floor 4+;
- Cave;
- classes.

---

# 75. CRITÉRIOS DE ACEITAÇÃO

A Iteração 11 termina quando:

[ ] peixes puderem ser consumidos;

[ ] peixes recuperarem HP/MP de forma balanceável;

[ ] consumo respeitar máximo;

[ ] consumíveis possuírem cooldown;

[ ] Cooking estiver ativo;

[ ] Cooking Level existir;

[ ] Cooking XP existir;

[ ] Cozinheiro existir no Refúgio;

[ ] Cozinheiro vender ingredientes simples;

[ ] não existir agricultura;

[ ] receitas forem data-driven;

[ ] existirem aproximadamente 5–7 receitas;

[ ] receitas utilizarem os peixes existentes;

[ ] Cooking Level liberar receitas;

[ ] existir minigame curto;

[ ] minigame não for espera passiva;

[ ] Cooking produzir pratos;

[ ] pratos forem melhores que simplesmente comer os ingredientes crus;

[ ] existirem pratos de recovery;

[ ] existirem alguns pratos com buffs;

[ ] Food Buff não acumular infinitamente;

[ ] peixes possuírem valor de venda;

[ ] pratos possuírem valor de venda;

[ ] Cozinheiro comprar produtos;

[ ] compras/vendas forem atômicas;

[ ] não existir arbitragem NPC trivial;

[ ] Fishing continuar funcional;

[ ] peixe → comer funcionar;

[ ] peixe → vender funcionar;

[ ] peixe → cozinhar funcionar;

[ ] prato → comer funcionar;

[ ] prato → vender funcionar;

[ ] progressão persistir;

[ ] inventário persistir;

[ ] ouro persistir;

[ ] todos os testes anteriores continuarem passando;

[ ] novos testes passarem;

[ ] build passar.

---

# 76. RELATÓRIO FINAL

Ao terminar:

PARE.

Não iniciar Marketplace.

Não iniciar Mining.

Entregar:

## 1. AUDITORIA
Sistemas reaproveitados.

## 2. CONSUMABLE FOUNDATION
Arquitetura de consumíveis.

## 3. PEIXES CRUS
Efeitos de cada espécie.

## 4. COOLDOWNS
Regras implementadas.

## 5. COOKING
Progressão e curva.

## 6. COZINHEIRO
NPC e serviços.

## 7. INGREDIENTES
Tabela, preço e função.

## 8. RECEITAS
Tabela completa.

## 9. MINIGAME
Mecânica e resultados.

## 10. PRATOS
Tabela completa de efeitos.

## 11. BUFFS
Regras, duração e stacking.

## 12. ECONOMIA NPC
Preços de compra/venda.

## 13. ANTI-ARBITRAGEM
Validação econômica.

## 14. PERSISTÊNCIA
Save/reload.

## 15. PLAYTEST DO PEIXE
Pescar → consumir.

## 16. PLAYTEST DO COOKING
Pescar → cozinhar.

## 17. PLAYTEST ECONÔMICO
Pescar → vender e cozinhar → vender.

## 18. DECISÕES
Se comer/vender/cozinhar são escolhas reais.

## 19. TESTES
Quantidade e resultados.

## 20. PERFORMANCE
Impacto.

## 21. LIMITAÇÕES
O que permanece provisório.

---

# REGRA FINAL DA ITERAÇÃO 11

Fishing criou:

> “Tem um lago ali. Vou pescar.”

Cooking deve criar a próxima pergunta:

> “Consegui um peixe. O que faço com ele?”

A resposta não deve ser automática.

O jogador pode pensar:

> “Estou sem vida. Vou comer agora.”

ou:

> “Esse peixe vale ouro. Vou levar para vender.”

ou:

> “Se eu guardar e comprar alguns ingredientes, consigo fazer um prato muito melhor.”

Essa decisão é o coração da Iteração 11.

No futuro haverá ainda:

> “Talvez outro jogador pague mais por isso.”

Mas essa quarta opção pertence ao:

# MARKETPLACE ENTRE JOGADORES

e NÃO deve ser implementada agora.

Ao terminar:

# PARE.