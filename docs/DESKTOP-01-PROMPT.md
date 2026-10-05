# DUNGEON MASTER — BUILD DESKTOP 01
## Primeira versão executável para Playtest Externo

A Iteração 11 está concluída.

O jogo atual possui, entre outros sistemas:

- Refúgio;
- Torre procedural Floors 1–3;
- combate;
- equipamentos;
- inventário;
- progressão;
- habilidades;
- Fishing;
- Fishing Level/XP;
- Vara de Pesca;
- peixes consumíveis;
- cooldown de Food;
- Cooking;
- Cooking Level/XP;
- NPC Mira;
- compra de ingredientes;
- venda NPC;
- receitas;
- minigame de Cooking;
- pratos;
- recuperação HP/MP;
- buffs alimentares;
- economia NPC;
- persistência local.

Baseline atual:

# 331 TESTES APROVADOS.

Esta etapa NÃO é uma nova iteração de gameplay.

Ela existe exclusivamente para transformar o estado atual do Dungeon Master em:

# UMA BUILD WINDOWS DISTRIBUÍVEL.

---

# 1. OBJETIVO

Quero conseguir:

GERAR BUILD
→ OBTER ARQUIVO
→ ENVIAR PARA OUTRA PESSOA
→ ELA ABRIR
→ JOGAR.

O playtester NÃO pode precisar:

- instalar Node.js;
- instalar npm;
- executar `npm install`;
- abrir terminal;
- rodar servidor local;
- usar VS Code;
- conhecer desenvolvimento web.

---

# 2. PLATAFORMA

Target inicial obrigatório:

# WINDOWS x64.

Não gastar esta etapa produzindo:

- macOS;
- Linux;
- Android;
- iOS.

Desktop/notebook continua sendo a plataforma do jogo.

---

# 3. CONGELAR GAMEPLAY

NÃO desenvolver novos sistemas.

Não iniciar:

- Multiplayer;
- backend;
- login;
- Party;
- Marketplace;
- Persistent Floors;
- Floor inheritance;
- Mining;
- Smithing;
- novas classes;
- novos Floors;
- novos peixes;
- novas receitas.

Preservar exatamente o gameplay validado na Iteração 11.

Correções somente quando necessárias para:

- packaging;
- filesystem;
- assets;
- persistência;
- timing;
- lifecycle;
- compatibilidade desktop.

---

# 4. BASELINE OBRIGATÓRIO

Antes de modificar o projeto:

1. executar a suíte atual;
2. confirmar aproximadamente 331 testes passando;
3. executar build web atual;
4. abrir versão atual;
5. confirmar funcionamento básico.

Registrar baseline.

Não começar packaging sobre projeto quebrado.

---

# 5. AUDITORIA

Inspecionar:

- `package.json`;
- bundler;
- scripts;
- entry point;
- HTML;
- CSS;
- JS;
- módulos;
- assets;
- caminhos relativos;
- caminhos absolutos;
- storage;
- save repository;
- timestamps;
- relógio utilizado;
- lifecycle;
- pause;
- focus/blur;
- timers;
- Fishing;
- Cooking;
- buffs;
- cooldowns.

Identificar qualquer dependência implícita de:

- localhost;
- servidor dev;
- browser específico;
- diretório do projeto.

---

# 6. TECNOLOGIA DESKTOP

Preferência:

# ELECTRON.

O jogo atual já é uma aplicação HTML/CSS/JavaScript funcional.

Nesta primeira build externa, priorizar:

# CONFIABILIDADE
# BAIXO RISCO
# POUCA ALTERAÇÃO DO JOGO.

Se a auditoria demonstrar impedimento técnico concreto para Electron:

documentar antes de escolher alternativa.

Não migrar para outra stack apenas para reduzir tamanho do executável.

---

# 7. PRINCÍPIO

Não transformar Dungeon Master em "outro projeto".

Criar:

GAME EXISTENTE
        ↓
PRODUCTION BUILD
        ↓
DESKTOP SHELL
        ↓
WINDOWS BUILD.

O domínio do jogo continua independente da shell desktop.

---

# 8. NÃO DUPLICAR CÓDIGO

NÃO criar duas implementações:

game-web

e:

game-desktop.

Desktop e web devem compartilhar:

# O MESMO JOGO.

---

# 9. ELECTRON — SEGURANÇA

Se Electron for utilizado:

preferir:

`contextIsolation: true`

`nodeIntegration: false`

Renderer sem acesso arbitrário ao Node.

Não expor filesystem/process/shell ao jogo sem necessidade.

Não desativar segurança apenas para fazer funcionar.

---

# 10. JANELA

Configurar janela:

Título:

# Dungeon Master

Resolução inicial apropriada.

Suportar resize.

Definir tamanho mínimo coerente com a UI atual.

Testar pelo menos:

1280×720

e:

1920×1080

quando ambiente permitir.

---

# 11. FULLSCREEN

Adicionar suporte simples a:

# F11

para alternar fullscreen se não conflitar com controles existentes.

Não tornar fullscreen obrigatório.

---

# 12. NÃO ABRIR DEVTOOLS

Build de distribuição NÃO deve abrir automaticamente:

- DevTools;
- console;
- performance panel;
- debug tools.

Ambiente de desenvolvimento continua podendo utilizá-los.

---

# 13. ASSETS

Validar carregamento de:

- sprites;
- imagens;
- CSS;
- fontes;
- áudio;
- JSON;
- módulos;
- dados de itens;
- dados de Fishing;
- dados de Cooking;
- receitas;
- demais recursos.

Nenhum asset deve depender de caminho da máquina de desenvolvimento.

---

# 14. STORAGE É CRÍTICO

Auditar como o save atual funciona.

A build desktop precisa persistir:

- Character Level;
- Character XP;
- ouro;
- atributos;
- equipamentos;
- inventário;
- habilidades;
- Fishing Level/XP;
- Vara;
- peixes;
- Cooking Level/XP;
- ingredientes;
- pratos;
- cooldowns;
- Food Buff;
- demais dados atuais.

---

# 15. SAVE DESKTOP

O save NÃO pode ficar:

- em diretório temporário;
- dentro de bundle descartável;
- em localização apagada a cada execução.

Utilizar armazenamento persistente apropriado ao usuário Windows.

---

# 16. SAVE DE DESENVOLVIMENTO

Não é obrigatório importar automaticamente o save do browser/dev para a build.

É aceitável que o playtester comece:

# NOVO PERSONAGEM.

Mas documentar claramente o comportamento.

Não executar migração perigosa para copiar storage automaticamente.

---

# 17. NÃO CRIAR ANTIFRAUDE

O save atual é local.

Nesta build single-player:

# ISSO É ACEITÁVEL.

NÃO implementar:

- criptografia complexa;
- assinatura de save;
- servidor;
- validação online;
- anti-cheat.

A futura arquitetura multiplayer tratará autoridade/persistência separadamente.

---

# 18. TIMERS

ATENÇÃO ESPECIAL.

O jogo agora possui sistemas dependentes de tempo:

## Fishing
- lançamento;
- espera;
- janela de reação;
- cooldown.

## Cooking
- barra de aproximadamente 4 segundos;
- zonas de timing;
- resultado Bom/Perfeito/Erro.

## Consumíveis
- Food cooldown de aproximadamente 8 segundos.

## Buffs
- duração de aproximadamente 300 segundos.

Esses sistemas precisam funcionar corretamente dentro da build desktop.

---

# 19. NÃO ALTERAR TIMINGS

Não rebalancear os valores acima.

Apenas garantir que Electron/desktop não altere seu comportamento.

---

# 20. FOCUS / BLUR

Cooking atualmente possui comportamento relacionado à perda de foco.

Testar:

iniciar Cooking
→ mudar foco da janela
→ retornar.

Confirmar comportamento atual esperado.

Não permitir que desktop wrapper introduza:

- conclusão duplicada;
- consumo duplicado;
- timer quebrado;
- prato duplicado.

---

# 21. PAUSA

Auditar relação entre:

- window blur;
- pause;
- inventário;
- Cooking;
- Fishing;
- timers absolutos.

Não mudar regras de gameplay silenciosamente.

---

# 22. COOLDOWN E RELÓGIO

Food cooldown utiliza prazo absoluto.

Testar no executável:

comer
→ iniciar cooldown
→ fechar jogo
→ esperar
→ abrir.

Cooldown deve refletir tempo real transcorrido conforme comportamento atual.

Não reiniciar em 8 segundos após abrir.

---

# 23. BUFF E RELÓGIO

Testar:

consumir prato com buff
→ fechar
→ esperar
→ abrir.

Buff deve manter:

# TEMPO RESTANTE CORRETO.

Não reiniciar em 300 segundos.

Buff expirado enquanto jogo está fechado:

# NÃO DEVE VOLTAR.

---

# 24. OFFLINE

A versão atual deve funcionar:

# SEM INTERNET.

Testar abertura e gameplay sem conexão.

Não adicionar dependência online.

---

# 25. SEM SERVIDOR MANUAL

Usuário não pode precisar executar:

`npm run dev`

ou equivalente.

Se build puder carregar diretamente:

preferir isso.

Não adicionar servidor local se não houver necessidade real.

---

# 26. PACKAGING

Configurar ferramenta de packaging apropriada para Electron.

Preferir UMA solução.

Exemplo:

electron-builder

ou equivalente apropriado.

Não instalar vários packagers concorrentes.

---

# 27. ARTEFATOS

Objetivo preferencial:

produzir:

## INSTALADOR

e, se simples:

## PORTABLE.

Por exemplo:

`DungeonMaster-Beta-[versão]-Setup.exe`

`DungeonMaster-Beta-[versão]-Portable.exe`

Os nomes reais devem seguir versionamento atual.

---

# 28. QUAL EU DEVO ENVIAR?

Ao final, a implementação deve responder explicitamente:

> "Envie ESTE arquivo para o playtester."

Não me obrigar a descobrir entre dezenas de arquivos de build.

---

# 29. README DO PLAYTESTER

Criar arquivo simples:

# LEIA-ME.txt

Não documentação técnica.

Incluir:

- nome;
- versão;
- como abrir;
- controles básicos;
- aviso de Beta;
- como reportar problema.

Se instalador não possuir assinatura digital:

explicar brevemente possível aviso do Windows.

---

# 30. SMARTSCREEN

Não tentar burlar Windows SmartScreen.

Sem certificado de assinatura, pode haver aviso de aplicativo desconhecido.

Documentar.

Isso não significa automaticamente falha da build.

---

# 31. NÃO IMPLEMENTAR AUTOUPDATE

Não criar:

- launcher;
- patcher;
- updater;
- atualização automática.

Nova versão:

→ gerar nova build.

---

# 32. SCRIPTS

Adicionar scripts claros ao projeto.

Preferencialmente algo equivalente a:

`desktop:dev`

`desktop:build`

`desktop:package`

Adaptar aos scripts atuais.

Preservar:

- test;
- dev web;
- build web.

---

# 33. WEB CONTINUA FUNCIONANDO

Depois da integração desktop:

versão web/dev deve continuar funcional.

Desktop packaging não substitui o workflow atual.

---

# 34. TESTE REAL DO EXECUTÁVEL

NÃO aceitar:

"packaging terminou com exit code 0"

como validação suficiente.

Abrir:

# A BUILD EMPACOTADA REAL.

Não localhost.

Não dev server.

Não browser externo.

---

# 35. SMOKE TEST — REFÚGIO

Na build empacotada:

- abrir jogo;
- carregar/criar personagem;
- mover;
- câmera;
- HUD;
- Inventário;
- painel de atributos;
- Skill Tree;
- Armeiro;
- Mira;
- portal.

Confirmar ausência de regressões óbvias.

---

# 36. SMOKE TEST — COOKING

Cooking é agora um teste obrigatório.

Na build desktop:

1. falar com Mira;
2. abrir Cooking;
3. comprar ingrediente;
4. selecionar receita;
5. iniciar preparo;
6. observar barra;
7. usar F ou Espaço;
8. concluir prato;
9. ganhar Cooking XP;
10. conferir inventário.

Testar pelo menos:

# UMA RECEITA.

---

# 37. TIMING DO COOKING

Observar se barra de Cooking:

- dura aproximadamente o esperado;
- move suavemente;
- responde a F;
- responde a Espaço;
- não depende incorretamente do FPS;
- não dispara duas vezes.

Não revalidar todas as seis receitas manualmente.

---

# 38. SMOKE TEST — CONSUMÍVEL

Consumir:

- um peixe

OU:

- um prato.

Confirmar:

- item removido;
- recuperação/buff aplicado;
- cooldown iniciado;
- HUD atualizado;
- save realizado.

---

# 39. SMOKE TEST — FISHING

Entrar em um andar representativo.

Chegar ao:

# Lago dos vaga-lumes.

Testar:

- Vara;
- F;
- lançamento;
- espera;
- fisgada;
- captura;
- Fishing XP;
- peixe no inventário.

Uma captura bem-sucedida é suficiente.

Não repetir três andares.

---

# 40. SMOKE TEST — COMBATE

No mesmo andar:

- selecionar inimigo;
- atacar;
- receber/causar dano;
- usar habilidade;
- concluir pelo menos um encontro.

Não é necessário chegar ao boss apenas para testar packaging.

---

# 41. PERSISTÊNCIA — TESTE OBRIGATÓRIO

Depois de alterar estado:

registrar:

- Character Level/XP;
- ouro;
- Fishing Level/XP;
- Cooking Level/XP;
- algum peixe;
- algum prato/ingrediente quando disponível.

Fechar completamente o executável.

Confirmar que processo encerrou.

Abrir novamente.

Comparar.

---

# 42. PERSISTÊNCIA TEMPORAL

Executar teste específico:

1. aplicar Food Buff;
2. iniciar Food cooldown;
3. fechar jogo;
4. aguardar período conhecido;
5. reabrir;
6. confirmar tempo restante.

Esse teste é importante porque a Iteração 11 utiliza prazos absolutos.

---

# 43. TESTE DE COOKING CANCELADO

Na build desktop:

iniciar Cooking
→ cancelar.

Confirmar:

- ingredientes preservados;
- nenhum prato;
- nenhum XP indevido.

Isso ajuda a detectar problemas de lifecycle/input do wrapper.

---

# 44. PERFORMANCE

Comparar superficialmente:

web/dev

versus:

desktop build.

Registrar:

- tempo de abertura;
- FPS aproximado no Refúgio;
- FPS aproximado na Torre;
- comportamento da Cooking UI;
- uso de memória se facilmente disponível.

Não fazer otimização prematura.

---

# 45. BUNDLE GRANDE

O build web atual já possui aviso de bundle >500 kB.

Isso:

# NÃO É MOTIVO PARA BLOQUEAR ESTA BUILD.

Não iniciar code splitting/rearquitetura apenas por esse warning.

Documentar.

---

# 46. TESTES AUTOMATIZADOS

Depois da integração:

executar suíte completa.

Esperado:

# pelo menos os 331 testes atuais continuam passando.

Adicionar testes desktop somente onde trouxerem valor real.

Não remover testes antigos.

---

# 47. BUILD WEB

Confirmar novamente:

build web passa.

---

# 48. BUILD DESKTOP

Confirmar:

build/package desktop passa.

---

# 49. OUTRO COMPUTADOR

O teste ideal é:

# OUTRA MÁQUINA WINDOWS.

Se o ambiente de implementação NÃO tiver acesso a outra máquina:

não fingir que testou.

Nesse caso, entregar o artefato e um checklist para eu realizar esse teste externamente.

---

# 50. CHECKLIST PARA MEU TESTADOR

Criar checklist curto para a pessoa:

[ ] jogo abriu;

[ ] personagem foi criado/carregado;

[ ] movimento funcionou;

[ ] combate funcionou;

[ ] Fishing funcionou;

[ ] Cooking funcionou;

[ ] jogo fechou normalmente;

[ ] jogo abriu novamente;

[ ] progresso permaneceu;

[ ] nenhum erro crítico ocorreu.

---

# 51. NÃO FAZER

NÃO implementar:

- Multiplayer;
- servidor;
- WebSocket;
- login;
- Party;
- Marketplace;
- troca;
- Arena;
- Persistent Floors;
- Floor inheritance;
- Mining;
- Smithing;
- Floor 4+;
- novas classes;
- novo conteúdo.

---

# 52. CRITÉRIOS DE ACEITAÇÃO

A etapa termina quando:

[ ] baseline de 331 testes estiver preservado ou aumentado;

[ ] build web funcionar;

[ ] Electron ou solução justificada estiver configurada;

[ ] Windows x64 estiver suportado;

[ ] aplicação abrir diretamente;

[ ] não precisar Node;

[ ] não precisar npm;

[ ] não precisar terminal;

[ ] não precisar localhost manual;

[ ] assets funcionarem;

[ ] Refúgio funcionar;

[ ] Mira funcionar;

[ ] Cooking funcionar;

[ ] minigame de Cooking funcionar;

[ ] Fishing funcionar;

[ ] combate funcionar;

[ ] consumíveis funcionarem;

[ ] cooldown funcionar;

[ ] buff funcionar;

[ ] save funcionar;

[ ] Cooking XP persistir;

[ ] Fishing XP persistir;

[ ] inventário persistir;

[ ] ouro persistir;

[ ] timestamps sobreviverem ao fechamento;

[ ] buff expirado offline não retornar;

[ ] versão offline funcionar;

[ ] build real tiver sido aberta;

[ ] instalador/portable existir;

[ ] LEIA-ME existir;

[ ] artefato recomendado para envio estiver explicitamente identificado.

---

# 53. RELATÓRIO FINAL

Ao concluir:

# PARE.

Não iniciar Multiplayer.

Entregar:

## 1. AUDITORIA
Stack e problemas encontrados.

## 2. TECNOLOGIA
Escolha e justificativa.

## 3. DESKTOP SHELL
Estrutura implementada.

## 4. SEGURANÇA
Configuração desktop.

## 5. STORAGE
Onde e como save é armazenado.

## 6. TIMERS
Fishing, Cooking, cooldown e buff.

## 7. BUILD WEB
Resultado.

## 8. BUILD DESKTOP
Resultado.

## 9. ARTEFATOS
Lista exata com caminhos e tamanhos.

## 10. ARQUIVO QUE DEVO ENVIAR
Responder explicitamente.

## 11. INSTALAÇÃO
Como tester abre.

## 12. SMOKE TEST
Refúgio, combate, Fishing e Cooking.

## 13. PERSISTÊNCIA
Resultado de fechar/reabrir.

## 14. PERSISTÊNCIA TEMPORAL
Buff/cooldown.

## 15. OFFLINE
Resultado.

## 16. TESTES
Quantidade final.

## 17. PERFORMANCE
Observações.

## 18. LIMITAÇÕES
SmartScreen, assinatura e problemas conhecidos.

## 19. CHECKLIST EXTERNO
Checklist curto para eu mandar junto.

---

# REGRA FINAL

O código-fonte funcionando NÃO é suficiente.

O build terminando NÃO é suficiente.

O critério é:

# UMA PESSOA QUE NÃO É DESENVOLVEDORA CONSEGUE JOGAR.

Eu devo conseguir:

PEGAR UM ARQUIVO
→ ENVIAR
→ A PESSOA INSTALA/ABRE
→ DUNGEON MASTER FUNCIONA
→ ELA JOGA
→ FECHA
→ ABRE NOVAMENTE
→ PROGRESSO CONTINUA.

Se isso funcionar:

# BUILD DESKTOP 01 CONCLUÍDA.

Depois disso:

# PARE.

Não iniciar Multiplayer.