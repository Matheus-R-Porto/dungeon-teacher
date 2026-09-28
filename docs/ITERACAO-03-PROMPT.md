# DUNGEON MASTER — BETA 0.1.0
## Iteração 03 — Fundação do Personagem e Sistemas de RPG

Continue o desenvolvimento da implementação atual de **Dungeon Master Beta 0.1.0**.

O projeto já possui uma fundação funcional que deve ser PRESERVADA.

Atualmente já temos:

- Refúgio do Limiar funcional;
- cenário 3D;
- personagem representado por sprite 2D;
- sistema direcional de sprites funcionando;
- World Facing separado de Visual Facing;
- câmera orbital livre em 360°;
- Q/E para rotação;
- botão do meio + arrastar horizontalmente para rotação;
- scroll para zoom;
- movimentação WASD;
- movimentação point-and-click;
- tecla F como sistema universal de interação;
- Portal utilizando esse sistema;
- direção visual 2.5D definida;
- sprites direcionais de DEBUG funcionando.

## IMPORTANTE

Os sprites atuais são placeholders técnicos.

NÃO tente criar sprites finais nesta etapa.

NÃO gaste tempo refinando arte do personagem.

NÃO altere novamente o sistema direcional se ele já estiver funcionando corretamente.

A arte definitiva será produzida posteriormente.

---

# 1. OBJETIVO DESTA ITERAÇÃO

Até agora possuímos essencialmente um personagem capaz de caminhar pelo mundo.

Agora precisamos criar a fundação que fará esse personagem se comportar como um personagem de RPG.

Esta iteração deve implementar:

- modelo de dados do personagem;
- nível;
- experiência;
- atributos;
- HP;
- MP;
- estatísticas derivadas;
- progressão;
- pontos de atributo;
- regeneração básica;
- interface de personagem;
- arquitetura preparada para classes;
- arquitetura preparada para equipamentos;
- persistência desses dados.

Ainda NÃO implementar combate completo.

Ainda NÃO implementar as cinco classes.

Ainda NÃO implementar equipamentos completos.

Estamos criando a fundação que esses sistemas utilizarão.

---

# 2. PRINCÍPIO DE ARQUITETURA

Evite colocar toda a lógica diretamente dentro do objeto visual do personagem.

Separar conceitualmente:

## Player Controller

Responsável por:

- input;
- movimentação;
- interação;
- orientação;
- controle do personagem.

## Character Data

Responsável por:

- nível;
- XP;
- atributos;
- pontos disponíveis;
- classe;
- progressão persistente.

## Character Stats

Responsável por:

- HP;
- MP;
- ataque;
- defesa;
- velocidade;
- precisão;
- esquiva;
- outras estatísticas derivadas.

## Character Visual

Responsável por:

- sprite;
- direção;
- animação;
- apresentação visual.

Esses nomes não são obrigatórios.

Adapte-os à arquitetura existente.

O importante é NÃO transformar o personagem em um único arquivo gigante responsável por tudo.

---

# 3. PERSONAGEM INICIAL

Todo novo personagem começa como:

## Novato

A classe inicial deve ser representada internamente de forma clara.

Exemplo conceitual:

`classId: "novice"`

O sistema deve ser preparado para futuramente receber:

- novice;
- warrior;
- archer;
- mage;
- assassin;
- priest.

NÃO implementar ainda as cinco classes.

Apenas preparar a estrutura.

---

# 4. ATRIBUTOS PRINCIPAIS

Dungeon Master utilizará seis atributos principais inspirados na filosofia de RPGs clássicos:

- STR
- AGI
- VIT
- INT
- DEX
- LUK

Internamente, mantenha nomes consistentes.

Exemplo:

`str`
`agi`
`vit`
`int`
`dex`
`luk`

Não espalhar strings arbitrárias pelo projeto.

---

# 5. SIGNIFICADO DOS ATRIBUTOS

Para a Beta, utilizar inicialmente esta filosofia.

## STR — Strength

Relacionada principalmente a:

- ataque físico;
- capacidade de carga;
- algumas habilidades físicas.

---

## AGI — Agility

Relacionada principalmente a:

- velocidade de ataque;
- esquiva;
- velocidade/mobilidade quando apropriado.

---

## VIT — Vitality

Relacionada principalmente a:

- HP máximo;
- resistência;
- defesa física;
- regeneração de HP.

---

## INT — Intelligence

Relacionada principalmente a:

- poder mágico;
- MP máximo;
- regeneração de MP;
- habilidades mágicas.

---

## DEX — Dexterity

Relacionada principalmente a:

- precisão;
- consistência dos ataques;
- habilidades que dependem de destreza;
- possíveis interações futuras com ataques à distância.

---

## LUK — Luck

Relacionada principalmente a:

- efeitos probabilísticos;
- crítico;
- pequenas modificações relacionadas à sorte;
- sistemas futuros de loot.

Não implementar dezenas de efeitos para cada atributo agora.

Criar uma base simples e configurável.

---

# 6. VALORES INICIAIS

Crie valores iniciais simples para o Novato.

Não trate números iniciais como balanceamento definitivo.

Exemplo conceitual:

STR = 5  
AGI = 5  
VIT = 5  
INT = 5  
DEX = 5  
LUK = 5

Caso a arquitetura atual sugira números diferentes, mantenha a filosofia de valores baixos e fáceis de testar.

Centralize esses valores em configuração.

---

# 7. ESTATÍSTICAS DERIVADAS

Criar uma camada de estatísticas derivadas.

Inicialmente precisamos pelo menos de:

- Max HP;
- Current HP;
- Max MP;
- Current MP;
- Physical Attack;
- Magic Attack;
- Physical Defense;
- Magic Defense;
- Attack Speed;
- Accuracy;
- Evasion;
- Critical Chance;
- Carry Capacity.

As fórmulas NÃO precisam ser complexas.

Na Beta, preferimos:

**fórmulas simples + fáceis de balancear**

em vez de:

**fórmulas sofisticadas espalhadas pelo código.**

---

# 8. CENTRALIZAR FÓRMULAS

Criar um local específico para cálculos de atributos.

Exemplo conceitual:

`calculateMaxHP()`

`calculateMaxMP()`

`calculatePhysicalAttack()`

`calculateMagicAttack()`

`calculateDefense()`

`calculateAttackSpeed()`

`calculateAccuracy()`

`calculateEvasion()`

`calculateCriticalChance()`

`calculateCarryCapacity()`

Não calcular a mesma estatística de maneiras diferentes em partes diferentes do projeto.

---

# 9. VALORES BASE + MODIFICADORES

Preparar as estatísticas para funcionar conceitualmente como:

`valor final = base + atributos + equipamentos + buffs + outros modificadores`

Mesmo que equipamentos e buffs ainda não estejam implementados.

Evite construir fórmulas que futuramente exijam reescrever todo o sistema para adicionar equipamento.

Uma possível organização conceitual:

- Base Stats
- Attribute Modifiers
- Equipment Modifiers
- Buff Modifiers
- Final Stats

Nesta etapa, Equipment e Buff podem permanecer vazios/zero.

---

# 10. HP

Implementar:

- HP atual;
- HP máximo.

O HP deve possuir limites.

Nunca permitir:

`currentHP > maxHP`

ou

`currentHP < 0`

Criar métodos genéricos como:

- receber dano;
- receber cura;
- restaurar HP;
- verificar se está vivo.

Mesmo sem combate completo, esses métodos serão utilizados na próxima iteração.

---

# 11. MP

Implementar:

- MP atual;
- MP máximo.

O MP também deve possuir limites.

Preparar métodos para:

- gastar MP;
- restaurar MP;
- verificar se existe MP suficiente.

Não implementar habilidades ainda.

Apenas fornecer a infraestrutura.

---

# 12. REGENERAÇÃO

Adicionar regeneração básica configurável de:

- HP;
- MP.

Evitar valores definitivos.

Deixar taxas configuráveis.

A regeneração deve funcionar de maneira previsível e não depender do FPS.

Utilizar tempo real/delta time corretamente.

---

# 13. NÍVEL

Implementar:

- nível atual;
- XP atual;
- XP necessária para próximo nível.

O personagem começa em:

`Level 1`

Definir uma curva inicial simples e configurável.

Não precisamos balancear níveis altos nesta etapa.

O objetivo é testar aproximadamente os primeiros níveis.

---

# 14. EXPERIÊNCIA

Criar uma função genérica:

`gainXP(amount)`

ou equivalente.

Ao receber XP:

1. adicionar XP;
2. verificar se atingiu o próximo nível;
3. subir de nível;
4. preservar XP excedente;
5. permitir múltiplos level-ups se uma grande quantidade de XP for recebida.

Exemplo:

Jogador precisa de 100 XP.

Possui 90.

Recebe 250.

O sistema deve processar corretamente todos os níveis possíveis.

---

# 15. LEVEL UP

Ao subir de nível:

- aumentar `level`;
- conceder pontos de atributo;
- recalcular estatísticas;
- atualizar interface;
- apresentar feedback visual simples.

Não precisamos de animação final de level-up.

Pode utilizar um feedback provisório.

---

# 16. PONTOS DE ATRIBUTO

Ao subir de nível, o jogador recebe pontos para distribuir.

Para esta etapa, utilize uma quantidade configurável.

Exemplo inicial:

`5 pontos por nível`

Esse número NÃO é definitivo.

Deve ser facilmente alterável.

---

# 17. DISTRIBUIÇÃO DE ATRIBUTOS

Criar interface que permita distribuir pontos entre:

- STR
- AGI
- VIT
- INT
- DEX
- LUK

Mostrar:

- valor atual;
- pontos disponíveis;
- efeito básico daquele atributo.

Não permitir distribuir mais pontos do que o jogador possui.

---

# 18. DISTRIBUIÇÃO NO HUB

A filosofia final de Dungeon Master é que progressão importante seja administrada no Hub.

Portanto, nesta versão, o painel de distribuição de atributos deve estar associado ao estado seguro do Refúgio.

Não permitir alteração arbitrária dos atributos durante futuras situações de combate.

Como ainda estamos somente no Hub, basta estruturar isso corretamente.

---

# 19. CONFIRMAÇÃO DE DISTRIBUIÇÃO

Para evitar cliques acidentais, considere trabalhar com:

- pontos temporariamente distribuídos;
- botão Confirmar;
- botão Cancelar/Resetar antes da confirmação.

Exemplo:

Jogador possui 5 pontos.

Adiciona:

+2 STR  
+2 AGI  
+1 VIT

Antes de confirmar, pode alterar.

Depois de confirmar, os pontos são permanentemente aplicados.

Não implementar respec pago ainda.

---

# 20. PAINEL DO PERSONAGEM

Adicionar uma interface simples de personagem.

Pode utilizar uma tecla apropriada como:

`C`

para abrir/fechar o painel.

Se C já possuir função, escolha outra tecla coerente.

O painel deve mostrar inicialmente:

## Identidade

Nome provisório do personagem  
Classe: Novato  
Level  
XP

## Recursos

HP  
MP

## Atributos

STR  
AGI  
VIT  
INT  
DEX  
LUK

## Estatísticas

Physical Attack  
Magic Attack  
Defense  
Magic Defense  
Attack Speed  
Accuracy  
Evasion  
Critical Chance  
Carry Capacity

## Progressão

Pontos de atributo disponíveis

---

# 21. TOOLTIP DOS ATRIBUTOS

Ao passar o mouse sobre um atributo, mostrar uma explicação simples.

Exemplo:

**STR**

Aumenta principalmente dano físico e capacidade de carga.

Não colocar fórmulas enormes na interface.

O jogador precisa entender a função, não estudar o código.

---

# 22. UI DURANTE GAMEPLAY

Começar a preparar uma HUD mínima.

Mostrar pelo menos:

- HP;
- MP;
- Level;
- XP.

Não criar ainda a HUD definitiva.

Queremos apenas garantir que alterações nos dados sejam imediatamente visíveis.

---

# 23. MODO DE DEBUG

Como ainda não temos combate completo, precisamos conseguir testar os sistemas.

Criar controles ou painel de debug facilmente removíveis/ocultáveis.

Permitir testes como:

- +50 XP;
- +500 XP;
- causar 10 de dano;
- restaurar HP;
- gastar MP;
- restaurar MP;
- conceder pontos de atributo.

O objetivo é validar progressão sem precisar implementar inimigos antes da hora.

Essas funções NÃO devem aparecer como gameplay normal.

---

# 24. TESTE DE ATTACK SPEED

Attack Speed será extremamente importante posteriormente.

Já nesta etapa, faça o valor ser calculado e exibido.

Entretanto:

NÃO implementar ainda ataques automáticos.

Apenas garantir que aumentar AGI modifique Attack Speed de maneira previsível.

Evitar valores que cresçam sem limite.

Preparar a possibilidade futura de:

- limites mínimos;
- limites máximos;
- diminishing returns, caso necessário.

Não decidir balanceamento definitivo agora.

---

# 25. CAPACIDADE DE INVENTÁRIO

Ainda não implementar o inventário completo.

Entretanto, como STR poderá influenciar Carry Capacity, implementar apenas a estatística derivada.

Exemplo conceitual:

`Carry Capacity: 100`

A próxima implementação de inventário poderá consultar esse valor.

---

# 26. LUK

LUK precisa existir desde agora, mas não tente conectá-la prematuramente a todos os sistemas futuros.

Inicialmente ela pode afetar:

- Critical Chance;

e preparar modificadores futuros para:

- loot;
- baús;
- outros sistemas probabilísticos.

Não implementar loot nesta etapa.

---

# 27. SAVE

Expandir o sistema de persistência atual.

Salvar pelo menos:

- level;
- XP;
- classId;
- STR;
- AGI;
- VIT;
- INT;
- DEX;
- LUK;
- pontos disponíveis;
- HP atual;
- MP atual;
- dados necessários para reconstruir as estatísticas.

Não salvar estatísticas derivadas se elas puderem ser recalculadas com segurança.

Preferir salvar a fonte dos dados e recalcular derivados ao carregar.

---

# 28. VERSIONAMENTO

Manter o save versionado.

Como ainda estamos em:

**Beta 0.1.0**

o formato pode evoluir.

Caso o save existente não possua os novos campos, aplicar valores padrão.

Não quebrar desnecessariamente saves anteriores durante o desenvolvimento.

---

# 29. CONFIGURAÇÃO CENTRAL

Criar/configurar arquivos apropriados para valores de balanceamento.

Centralizar coisas como:

- atributos iniciais;
- HP base;
- MP base;
- XP necessária;
- pontos por nível;
- regeneração;
- fórmulas;
- limites;
- modificadores.

Queremos poder mudar balanceamento sem procurar números espalhados por dezenas de arquivos.

---

# 30. NÃO IMPLEMENTAR AINDA

Nesta iteração NÃO implementar:

- Guerreiro;
- Arqueiro;
- Feiticeiro;
- Assassino;
- Sacerdote;
- missões de classe;
- equipamentos completos;
- inventário completo;
- inimigos;
- combate;
- auto-attack;
- habilidades;
- Torre procedural;
- loot;
- baús;
- matemática;
- life skills;
- multiplayer;
- Arena;
- arte final;
- sprites finais.

Esses sistemas virão posteriormente.

---

# 31. NÃO ALTERAR O QUE JÁ FUNCIONA

Preservar:

- Hub;
- câmera;
- Q/E;
- botão do meio;
- zoom;
- WASD;
- point-and-click;
- sistema de interação F;
- Portal;
- sprites direcionais;
- sistema de World Facing;
- Visual Facing;
- direção artística atual.

Não refatorar esses sistemas sem necessidade real.

---

# 32. CRITÉRIOS DE CONCLUSÃO

A Iteração 03 estará concluída quando:

1. o personagem possuir dados independentes da representação visual;
2. começar como Novato;
3. começar no Level 1;
4. possuir STR/AGI/VIT/INT/DEX/LUK;
5. possuir HP e MP;
6. possuir estatísticas derivadas;
7. atributos influenciarem corretamente essas estatísticas;
8. existir sistema funcional de XP;
9. level-up funcionar;
10. XP excedente ser preservada;
11. múltiplos level-ups funcionarem;
12. level-up conceder pontos de atributo;
13. pontos puderem ser distribuídos;
14. distribuição puder ser confirmada;
15. painel do personagem mostrar os dados;
16. HUD mostrar HP/MP/Level/XP;
17. debug permitir testar XP, dano, cura e MP;
18. save preservar progressão;
19. carregar save reconstruir corretamente as estatísticas;
20. nenhuma funcionalidade anterior importante tiver sido quebrada.

---

# 33. DEPOIS DESTA ITERAÇÃO

NÃO implemente automaticamente a próxima etapa.

Quando esta iteração estiver concluída, pare.

A próxima etapa planejada será:

## Iteração 04 — Fundação do Combate

Ela deverá introduzir gradualmente:

- seleção de alvo;
- primeiro inimigo de debug;
- alcance;
- auto-attack;
- Attack Speed real;
- dano;
- defesa;
- morte;
- feedback de combate.

Depois:

## Iteração 05 — IA e Aggro

- percepção;
- perseguição;
- retorno;
- ataques inimigos;
- múltiplos inimigos;
- gerenciamento de aggro.

Depois:

## Iteração 06 — Habilidades e Recursos

- barra 1–8;
- cooldowns;
- custos;
- fila de ação;
- skills;
- auto-attack → skill → retorno ao auto-attack.

Depois:

## Iteração 07 — Classes

- missão/seleção de classe;
- Guerreiro;
- Arqueiro;
- Feiticeiro;
- Assassino;
- Sacerdote;
- identidade mecânica;
- habilidades iniciais.

Somente posteriormente avançaremos para:

- inventário;
- equipamentos;
- loot;
- Hub funcional;
- Torre procedural;
- Floresta;
- Boss;
- baús;
- matemática;
- life skills.

---

# 34. PROCEDIMENTO DE TRABALHO

Antes de escrever código:

1. examine a implementação atual;
2. identifique onde os dados do personagem estão atualmente;
3. identifique o que pode ser reutilizado;
4. proponha brevemente a divisão dos novos módulos;
5. identifique os arquivos que serão criados/modificados;
6. verifique como o novo sistema será integrado ao save existente;
7. implemente incrementalmente;
8. teste cada parte;
9. faça testes de regressão na câmera, movimento e interação.

Não reescreva o projeto.

Não antecipe sistemas das próximas iterações.

---

# REGRA PRINCIPAL

A Iteração 03 não existe para adicionar muito conteúdo.

Ela existe para criar uma **fundação de RPG limpa, modular e testável**.

Ao final dela, o personagem ainda pode estar usando um sprite feio de debug e não possuir nenhum inimigo para enfrentar.

Isso é aceitável.

O que precisa estar correto é o que existe por baixo:

**Personagem → Atributos → Estatísticas → XP → Level → Progressão → Save**

Quando essa fundação estiver sólida, construiremos o combate sobre ela.