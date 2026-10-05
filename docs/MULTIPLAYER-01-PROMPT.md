# DUNGEON MASTER — MULTIPLAYER 01
## Shared Hub — primeiro teste real entre dois computadores
## + atualização obrigatória da Build Desktop jogável

Continue o desenvolvimento a partir do estado atual do projeto.

A Build Desktop 01 já existe e possui:

- Electron 44.5.1;
- electron-builder 26.15.3;
- Windows x64;
- Setup NSIS;
- Portable;
- IndexedDB persistente;
- protocolo local `dungeon://game`;
- `contextIsolation` ativo;
- sandbox ativo;
- `nodeIntegration` desativado;
- renderer sem acesso arbitrário ao sistema;
- 337 testes aprovados.

O jogo atual também já possui:

- Refúgio;
- Torre Floors 1–3;
- combate;
- progressão;
- Fishing;
- Cooking;
- consumíveis;
- economia NPC;
- persistência local.

Esta é a primeira iteração de:

# MULTIPLAYER REAL.

---

# 1. OBJETIVO ÚNICO

Quero instalar a MESMA nova build de Dungeon Master em:

# COMPUTADOR A

e:

# COMPUTADOR B

e realizar este teste:

A abre Dungeon Master
→ B abre Dungeon Master
→ ambos entram no multiplayer
→ ambos entram no mesmo Refúgio
→ A enxerga B
→ B enxerga A
→ A anda
→ B vê A andando
→ B anda
→ A vê B andando
→ um desconecta
→ o outro continua normalmente
→ reconecta
→ volta a aparecer.

Se isso funcionar:

# MULTIPLAYER 01 FOI BEM-SUCEDIDO.

Não ampliar o escopo antes disso funcionar.

---

# 2. NÃO IMPLEMENTAR A TORRE MULTIPLAYER

CRÍTICO.

Nesta iteração, multiplayer existe:

# SOMENTE NO REFÚGIO.

A Torre continua utilizando exatamente o comportamento single-player atual.

Ao entrar na Torre:

não tentar levar outros jogadores junto.

Não sincronizar:

- inimigos;
- combate;
- boss;
- Fishing;
- Cooking;
- loot;
- procedural;
- HP;
- habilidades.

Isso virá depois.

---

# 3. ARQUITETURA ESCOLHIDA

Para esta fundação, utilizar:

# SERVIDOR AUTORITATIVO LEVE + WEBSOCKET.

Não utilizar outro jogador como servidor.

Não utilizar:

- P2P como fundação principal;
- WebRTC;
- host migration;
- peer-hosted authoritative world.

O servidor multiplayer representa a autoridade da:

# SESSÃO COMPARTILHADA DO REFÚGIO.

---

# 4. IMPORTANTE — NÃO CONFUNDIR SERVIDOR COM SAVE

Nesta primeira versão:

servidor multiplayer NÃO é responsável pelo save permanente do personagem.

Persistência atual continua local.

O servidor recebe apenas os dados mínimos necessários para presença multiplayer.

Conceitualmente:

CLIENTE
├── personagem local
├── inventário local
├── progressão local
├── Fishing local
├── Cooking local
└── save IndexedDB local

SERVIDOR MULTIPLAYER
├── conexões
├── sessões
├── presença
├── posição
├── orientação
└── estado temporário do Refúgio.

Não migrar personagem para banco remoto ainda.

---

# 5. BACKEND SEPARADO

Criar backend multiplayer pequeno e separado do cliente.

Estrutura conceitual:

Dungeon Master Client
        │
        │ WebSocket
        ▼
Dungeon Master Multiplayer Server
        │
        ├── Player A
        └── Player B

Não colocar servidor multiplayer dentro do renderer Electron.

Não fazer Computador A precisar hospedar Computador B.

---

# 6. TECNOLOGIA

Usar solução WebSocket simples e apropriada ao stack JavaScript atual.

Preferência:

# Node.js + WebSocket

utilizando biblioteca pequena e madura quando necessário.

Evitar frameworks multiplayer enormes nesta primeira prova.

Não adicionar infraestrutura MMO.

---

# 7. AUDITORIA PRIMEIRO

Antes de implementar:

1. executar os 337 testes atuais;
2. executar build web;
3. executar build desktop;
4. revisar `desktop/main.cjs`;
5. revisar `desktop/preload.cjs`;
6. revisar `desktop/protocol.cjs`;
7. revisar CSP;
8. revisar bloqueio atual de HTTP/HTTPS/WS/WSS;
9. revisar Player;
10. revisar movimento;
11. revisar câmera;
12. revisar sprite directions;
13. revisar Refúgio;
14. revisar AreaSession/RunState;
15. revisar lifecycle;
16. revisar IndexedDB.

Registrar baseline.

---

# 8. NÃO REMOVER A SEGURANÇA DE REDE

A Build Desktop 01 atualmente bloqueia:

HTTP
HTTPS
WS
WSS.

NÃO simplesmente remover todo esse bloqueio.

Alterar a política para permitir SOMENTE a conexão necessária ao servidor multiplayer configurado.

Princípio:

# ALLOWLIST.

Não:

# LIBERAR INTERNET INTEIRA.

---

# 9. ENDPOINT CONFIGURÁVEL

O endereço do servidor multiplayer NÃO deve ficar espalhado pelo código.

Criar configuração central.

Exemplo conceitual:

MULTIPLAYER_SERVER_URL

Em desenvolvimento pode apontar para servidor local.

Em build de teste deve apontar para o servidor usado no playtest externo.

Não hardcodar lógica de gameplay para localhost.

---

# 10. AMBIENTE LOCAL E REMOTO

Suportar:

## desenvolvimento

servidor local.

## playtest

servidor acessível pelos dois computadores.

A mesma arquitetura deve funcionar nos dois casos.

---

# 11. SERVIDOR PRECISA ESTAR ACESSÍVEL

IMPORTANTE:

Gerar dois executáveis NÃO cria multiplayer automaticamente.

Os dois clientes precisam conseguir alcançar:

# O MESMO SERVIDOR.

Portanto, para o playtest externo, preparar uma forma real e documentada de executar/hospedar o pequeno servidor multiplayer.

Não afirmar que dois PCs conseguirão se conectar se o endpoint estiver acessível apenas por `localhost`.

---

# 12. NÃO DEPENDER DO COMPUTADOR DO PLAYTESTER COMO SERVIDOR

Objetivo final do teste:

PC A
      \
       → SERVIDOR
      /
PC B

e NÃO:

PC A HOST
      ↑
PC B.

Host-jogador não pertence a esta fundação.

---

# 13. PRIMEIRA IDENTIDADE MULTIPLAYER

Ainda não existe sistema de contas.

Criar identidade temporária suficiente para o teste.

Cada instalação/personagem deve possuir:

# client/player id

persistente localmente.

Não usar somente nome como identificador.

Exemplo conceitual:

playerId = UUID persistente.

---

# 14. NOME DO JOGADOR

Para conseguirmos diferenciar os dois PCs:

adicionar nome multiplayer simples.

Se personagem já possuir nome utilizável:

reutilizar.

Caso contrário:

adicionar campo simples de nome para o teste.

Exemplos:

Gandalf
Bilbo

Nome NÃO é identificador de segurança.

---

# 15. ENTRADA NO MULTIPLAYER

Não conectar silenciosamente sem feedback.

Adicionar UI mínima apropriada.

Pode existir no menu/início/Refúgio:

# MULTIPLAYER

com:

Conectar

e estado:

Offline
Conectando...
Online
Erro.

Não construir menu social completo.

---

# 16. REFÚGIO COMPARTILHADO

Ao conectar:

jogador entra em uma:

# HUB ROOM.

Nesta primeira versão pode existir uma única sala lógica:

`hub-01`

ou equivalente.

Não implementar matchmaking sofisticado.

---

# 17. CAPACIDADE

Não projetar 60 jogadores visualmente agora.

Servidor pode ter limite configurável.

Para teste:

# 2 jogadores são suficientes.

Arquitetura não deve depender exatamente de 2.

---

# 18. SPAWN

Quando Player B conecta:

Player A deve receber evento de entrada.

A instancia representação remota de B.

B recebe snapshot dos jogadores já presentes.

Fluxo:

A entra
→ servidor registra A.

B entra
→ servidor registra B
→ B recebe A
→ A recebe B.

---

# 19. REMOTE PLAYER

Criar representação específica:

# RemotePlayer

ou equivalente.

Não duplicar Character completo desnecessariamente.

RemotePlayer precisa inicialmente apenas de:

- id;
- nome;
- posição;
- orientação;
- estado visual básico.

---

# 20. VISUAL

Reutilizar representação atual do personagem quando possível.

Remote Player deve ser reconhecível como outro jogador.

Adicionar:

# NOME SOBRE A CABEÇA

ou indicador visual equivalente.

Não criar skins/customização nesta iteração.

---

# 21. MOVIMENTO

Sincronizar:

- posição X;
- posição Z;
- worldFacing/orientação;
- estado de movimento quando necessário.

Preservar regra atual de visualFacing/câmera.

A câmera de A NÃO pode afetar orientação visual incorretamente de B.

---

# 22. NÃO ENVIAR CÂMERA

Camera yaw é local.

Não sincronizar câmera entre jogadores.

Sincronizar apenas informação de mundo necessária para representar o personagem remoto.

---

# 23. FREQUÊNCIA DE REDE

NÃO enviar pacote a cada frame renderizado.

Criar taxa configurável de atualização.

Exemplo inicial razoável:

# aproximadamente 10–20 updates por segundo.

Escolher valor com base no movimento atual.

Documentar.

---

# 24. INTERPOLAÇÃO

Remote Players não devem simplesmente teleportar entre snapshots.

Implementar interpolação simples entre estados recebidos.

Objetivo:

movimento visualmente suave.

Não implementar prediction/rollback avançado ainda.

---

# 25. PLAYER LOCAL

O movimento do próprio jogador continua responsivo localmente.

Não esperar round-trip do servidor para cada passo nesta primeira versão.

Servidor mantém estado compartilhado da presença.

Não transformar movimento em input-lag desnecessário.

---

# 26. AUTORIDADE

Nesta primeira versão:

cliente envia sua intenção/estado de movimento.

Servidor:

- valida formato;
- valida sessão;
- mantém último estado;
- redistribui.

Não confiar cegamente em objetos arbitrários enviados pelo cliente.

Adicionar validação mínima:

- números finitos;
- limites razoáveis;
- mensagens conhecidas;
- tamanho de payload;
- frequência.

Não construir anti-cheat completo.

---

# 27. PROTOCOLO

Criar protocolo explícito e versionado.

Exemplo conceitual:

client:hello
server:welcome

player:join
player:leave

player:state

room:snapshot

ping
pong

Não depender de strings improvisadas espalhadas pelo projeto.

---

# 28. VERSÃO DO PROTOCOLO

Adicionar:

protocolVersion.

Servidor e cliente incompatíveis devem informar erro compreensível.

Isso será importante quando novas builds surgirem.

---

# 29. HEARTBEAT

Implementar heartbeat simples.

Servidor deve detectar conexão morta.

Usar:

ping/pong

ou mecanismo equivalente.

Não manter jogador fantasma eternamente no Refúgio.

---

# 30. DESCONEXÃO NORMAL

Quando B fecha Dungeon Master:

servidor remove B.

A recebe:

player:leave.

Representação de B desaparece.

A continua jogando normalmente.

---

# 31. QUEDA DE CONEXÃO

Se conexão cair:

cliente deve:

- detectar;
- mostrar estado offline/reconectando;
- não travar o jogo.

Remote Players podem ser removidos após timeout apropriado.

---

# 32. RECONEXÃO

Implementar reconexão simples.

Exemplo:

conexão perdida
→ aguardar
→ tentar novamente
→ reconectar
→ receber novo snapshot.

Não construir session resume complexo ainda.

---

# 33. MULTIPLAYER NÃO PODE QUEBRAR SINGLE-PLAYER

Se servidor estiver:

- offline;
- inacessível;
- com erro;

Dungeon Master deve continuar abrindo.

O jogador deve poder continuar:

# SINGLE-PLAYER.

Não tornar servidor obrigatório para iniciar o jogo.

---

# 34. ENTRAR NA TORRE

Quando jogador multiplayer entra na Torre:

ele deixa a presença compartilhada do Refúgio.

Outros jogadores devem vê-lo desaparecer do Hub.

A Torre continua:

# SINGLE-PLAYER.

Ao retornar ao Refúgio:

reentra na Hub Room.

Outros jogadores voltam a vê-lo.

---

# 35. NÃO SINCRONIZAR NPCS

Mira e Armeiro continuam locais.

Não sincronizar:

- posição do NPC;
- diálogo;
- Cooking;
- compra;
- venda.

Esses sistemas continuam funcionando como antes.

---

# 36. NÃO SINCRONIZAR INVENTÁRIO

Player A NÃO recebe:

- inventário de B;
- ouro de B;
- Fishing XP de B;
- Cooking XP de B;
- equipamentos completos de B.

Enviar apenas dados necessários para presença.

Privacidade e tráfego mínimo.

---

# 37. NÃO SINCRONIZAR COMBATE

Mesmo que arquitetura permita futuramente:

NÃO implementar:

- dano entre jogadores;
- PvP;
- ataques compartilhados;
- habilidades compartilhadas;
- projéteis multiplayer.

Refúgio continua seguro.

---

# 38. COLISÃO ENTRE PLAYERS

Nesta primeira versão:

# NÃO adicionar colisão física entre jogadores.

Remote Players não devem bloquear movimento.

Isso evita:

- empurrões;
- divergência;
- deadlocks;
- sincronização física desnecessária.

Jogadores podem atravessar uns aos outros provisoriamente.

---

# 39. UI DE STATUS

Adicionar indicador discreto.

Exemplo:

MULTIPLAYER
● Online — 2 jogadores

ou:

○ Offline

Não criar painel enorme.

---

# 40. DEBUG

Em desenvolvimento, disponibilizar informações úteis:

- playerId;
- room;
- ping;
- connection state;
- remote count.

Não exibir painel técnico na build final, salvo informação simples de conexão.

---

# 41. LATÊNCIA

Medir ping aproximado.

Não é necessário exibir permanentemente ao jogador.

Registrar durante teste.

Objetivo:

identificar problemas óbvios.

---

# 42. SERVIDOR — ESTADO

Servidor mantém algo equivalente a:

Room
├── id
└── players
    ├── playerId
    ├── name
    ├── position
    ├── facing
    └── lastSeen.

Não enviar Character completo.

---

# 43. SERVIDOR — SEM BANCO DE DADOS

Nesta primeira prova:

NÃO adicionar banco de dados multiplayer.

Room state é:

# TRANSITÓRIO.

Servidor reiniciou:

sala esvazia.

Isso é aceitável.

Save permanente continua local.

---

# 44. SERVIDOR — SEM CONTA

Não implementar:

- email;
- senha;
- cadastro;
- OAuth;
- token permanente de conta.

Isso virá quando tratarmos persistência multiplayer real.

---

# 45. SERVIDOR — LOGS

Registrar minimamente:

- start;
- connection;
- join;
- leave;
- disconnect;
- protocol error;
- room count;
- erros.

Não registrar inventário/save.

---

# 46. SERVIDOR — CONFIGURAÇÃO

Centralizar:

- port;
- host;
- allowed origins quando aplicável;
- room capacity;
- heartbeat;
- update limits;
- protocol version.

Não espalhar magic numbers.

---

# 47. SEGURANÇA BÁSICA

Adicionar limites mínimos:

- tamanho máximo de mensagem;
- JSON inválido rejeitado;
- message type desconhecido rejeitado;
- rate limit simples;
- posição inválida rejeitada;
- NaN/Infinity rejeitados;
- strings limitadas;
- connection flood básico quando simples.

Não tentar construir segurança MMO completa.

---

# 48. TESTES AUTOMATIZADOS — PROTOCOLO

Testar:

- encode/decode;
- mensagens válidas;
- mensagens inválidas;
- protocolVersion;
- unknown type;
- payload excessivo.

---

# 49. TESTES — SERVIDOR

Criar testes com dois clientes simulados:

A conecta.
B conecta.

Verificar:

A conhece B.
B conhece A.

A envia movimento.
B recebe.

B envia movimento.
A recebe.

A sai.
B recebe leave.

---

# 50. TESTES — RECONEXÃO

Simular:

B desconecta
→ servidor remove
→ B reconecta
→ recebe snapshot
→ A recebe join.

---

# 51. TESTES — GAMEPLAY OFFLINE

Servidor inexistente:

cliente inicia normalmente.

Nenhum sistema atual deve quebrar.

---

# 52. TESTES — REGRESSÃO

Preservar todos os testes existentes.

Baseline:

# 337 testes.

Não remover testes antigos para fazer multiplayer passar.

---

# 53. TESTE LOCAL COM DUAS INSTÂNCIAS

Antes de gerar build externa:

executar dois clientes simultâneos quando ambiente permitir.

Cliente A
+
Cliente B
+
servidor.

Validar:

- conexão;
- join;
- movimento;
- facing;
- leave;
- reconnect.

Se ambiente não permitir observação visual:

não declarar validação visual concluída.

---

# 54. TESTE REAL SERÁ EXTERNO

IMPORTANTE:

O teste final será realizado por mim em:

# DOIS COMPUTADORES WINDOWS DIFERENTES

usando:

# A MESMA BUILD.

Portanto preparar tudo para esse cenário.

---

# 55. COMO O SERVIDOR SERÁ ACESSADO?

Antes de concluir, garantir uma solução prática.

Os dois PCs precisam alcançar o mesmo endpoint.

Não entregar build configurada apenas para:

`localhost`.

Se for necessário deploy do servidor:

preparar documentação e configuração apropriadas.

Se o ambiente atual não puder efetuar deploy:

NÃO inventar um servidor remoto existente.

Nesse caso:

entregar instruções EXATAS do que falta para tornar o endpoint público.

Mas priorizar, quando ferramentas/ambiente permitirem, deixar o teste realmente utilizável.

---

# 56. SEM EXPOR PORTAS DESNECESSÁRIAS

Não instruir usuário a desativar firewall.

Não instruir usuário a desligar antivírus.

Não abrir serviços além do necessário.

Preferir conexão segura:

# WSS

para servidor remoto quando aplicável.

---

# 57. BUILD JOGÁVEL — REGRA OBRIGATÓRIA

A PARTIR DESTA ITERAÇÃO:

# TODA ENTREGA DEVE ATUALIZAR A BUILD JOGÁVEL.

Após implementar Multiplayer 01:

gerar nova build desktop.

Não entregar apenas código.

Não entregar apenas servidor.

---

# 58. VERSIONAR NOVA BUILD

Atualizar identificação da build.

Exemplo conceitual:

Desktop02

ou:

Multiplayer01

Utilizar convenção consistente com o projeto.

Não sobrescrever silenciosamente Desktop01.

---

# 59. GERAR NOVO INSTALADOR

OBRIGATÓRIO:

gerar novo:

# WINDOWS X64 SETUP.

Também gerar Portable se pipeline atual continuar suportando sem problema.

---

# 60. INSTALADOR DEVE CONTER O ENDPOINT CORRETO

A build que eu baixar deve estar configurada para o ambiente de teste multiplayer apropriado.

Não exigir que eu edite:

- arquivo JS;
- `.env`;
- código;
- ASAR;
- config manual.

para os dois computadores se conectarem.

---

# 61. NÃO EMBUTIR SEGREDOS

Se endpoint remoto precisar de credenciais administrativas:

NÃO colocar segredo privado dentro do executável.

Cliente só recebe informação pública necessária para conectar.

---

# 62. SMOKE TEST DA NOVA BUILD

Na build empacotada, validar quando possível:

- jogo abre;
- save abre;
- Refúgio abre;
- multiplayer tenta conectar;
- status aparece;
- single-player continua funcional;
- Fishing continua funcional;
- Cooking continua funcional.

Não é necessário repetir toda a campanha.

---

# 63. SAVE DESKTOP

Preservar comportamento atual:

`%APPDATA%\Dungeon Master`

ou equivalente real já configurado.

Nova build não deve apagar save da Desktop01 sem necessidade.

Se houver alteração de schema:

usar migração aditiva.

Mas esta iteração idealmente não precisa alterar Character save.

---

# 64. TESTE EXTERNO — PASSO A PASSO

Criar arquivo:

# TESTE-MULTIPLAYER-01.txt

com instruções extremamente simples.

Algo equivalente a:

1. instalar a mesma build nos dois computadores;
2. abrir Dungeon Master em A;
3. abrir Dungeon Master em B;
4. entrar no Multiplayer;
5. confirmar status Online;
6. confirmar que A vê B;
7. confirmar que B vê A;
8. andar com A;
9. observar em B;
10. andar com B;
11. observar em A;
12. girar/mudar direção;
13. fechar B;
14. confirmar que B desaparece em A;
15. reabrir B;
16. reconectar;
17. confirmar que B reaparece;
18. entrar na Torre com A;
19. confirmar que A desaparece do Refúgio de B;
20. retornar ao Refúgio;
21. confirmar que A reaparece.

---

# 65. DADOS QUE QUERO DO TESTE

Pedir que eu observe:

- ambos conectaram?
- tempo aproximado para conectar;
- movimento suave?
- movimento atrasado?
- teleportes?
- facing correto?
- jogador fantasma após fechar?
- reconexão funcionou?
- entrar na Torre removeu do Hub?
- retornar adicionou novamente?
- algum crash?
- algum save perdido?

---

# 66. NÃO IMPLEMENTAR NESTA ITERAÇÃO

NÃO implementar:

- Party;
- Party invite;
- Party leader;
- Tower multiplayer;
- Tower instance;
- host migration;
- Floor inheritance;
- Persistent Floors;
- PvP;
- Arena;
- Trade;
- Marketplace;
- chat;
- emotes complexos;
- amigos;
- guildas;
- contas;
- cloud save;
- banco persistente multiplayer;
- sincronização de Fishing;
- sincronização de Cooking;
- sincronização de inimigos;
- sincronização de combate.

---

# 67. CRITÉRIOS DE ACEITAÇÃO TÉCNICA

[ ] servidor WebSocket separado existe;

[ ] protocolo versionado existe;

[ ] dois clientes podem conectar;

[ ] ambos entram na mesma Hub Room;

[ ] snapshot inicial funciona;

[ ] join funciona;

[ ] leave funciona;

[ ] posição sincroniza;

[ ] orientação sincroniza;

[ ] interpolação existe;

[ ] câmera permanece local;

[ ] RemotePlayer não possui colisão;

[ ] nome remoto aparece;

[ ] heartbeat funciona;

[ ] conexão morta é removida;

[ ] reconexão simples funciona;

[ ] servidor offline não impede single-player;

[ ] entrar na Torre remove presença do Hub;

[ ] retornar restaura presença;

[ ] save local permanece intacto;

[ ] Fishing continua funcionando;

[ ] Cooking continua funcionando;

[ ] testes antigos continuam passando;

[ ] novos testes multiplayer passam;

[ ] build web passa;

[ ] servidor passa seus testes;

[ ] build desktop passa.

---

# 68. CRITÉRIOS DE ACEITAÇÃO DA DISTRIBUIÇÃO

[ ] nova versão identificada;

[ ] novo Setup Windows x64 gerado;

[ ] Portable atualizado se viável;

[ ] endpoint de teste configurado;

[ ] cliente não depende de localhost;

[ ] nenhuma credencial privada embutida;

[ ] LEIA-ME atualizado;

[ ] TESTE-MULTIPLAYER-01.txt criado;

[ ] artefato exato para download identificado;

[ ] SHA-256 registrado;

[ ] tamanho registrado.

---

# 69. RELATÓRIO FINAL

Ao concluir:

# PARE.

Entregar:

## 1. BASELINE
Testes/build anteriores.

## 2. ARQUITETURA MULTIPLAYER
Cliente ↔ servidor.

## 3. SERVIDOR
Tecnologia, execução e configuração.

## 4. PROTOCOLO
Mensagens implementadas.

## 5. HUB ROOM
Funcionamento.

## 6. IDENTIDADE
playerId e nome.

## 7. REMOTE PLAYER
Representação visual.

## 8. MOVIMENTO
Taxa, interpolação e facing.

## 9. HEARTBEAT
Timeouts.

## 10. RECONEXÃO
Comportamento.

## 11. TORRE
Confirmação de que permanece single-player.

## 12. SEGURANÇA
Allowlist, validação e limites.

## 13. SAVE
Confirmação de preservação.

## 14. TESTES
Quantidade anterior + nova quantidade.

## 15. TESTE LOCAL DE DOIS CLIENTES
O que realmente foi validado.

## 16. SERVIDOR PARA TESTE EXTERNO
Endereço/configuração e como está hospedado.

## 17. BUILD JOGÁVEL ATUALIZADA
Versão.

## 18. NOVO INSTALADOR
Caminho EXATO.

## 19. PORTABLE
Caminho, se produzido.

## 20. ARQUIVO QUE EU DEVO BAIXAR
Dizer explicitamente:

> "Baixe este arquivo: ..."

## 21. COMO TESTAR EM 2 PCS
Passo a passo curto.

## 22. RESULTADO ESPERADO
O que devo observar.

## 23. LIMITAÇÕES
Tudo que ainda não é multiplayer.

---

# 70. REGRA DE DISTRIBUIÇÃO DO PROJETO

A partir de agora:

# TODA ITERAÇÃO DE DESENVOLVIMENTO DEVE TERMINAR COM A ATUALIZAÇÃO DA BUILD JOGÁVEL.

Ou seja:

IMPLEMENTAR
→ TESTAR
→ BUILD WEB
→ BUILD DESKTOP
→ GERAR NOVO INSTALADOR
→ INFORMAR ARQUIVO EXATO PARA DOWNLOAD.

Não deixar o instalador uma versão atrás do código.

---

# REGRA FINAL — MULTIPLAYER 01

Não estamos tentando provar que Dungeon Master já é um jogo multiplayer completo.

Estamos tentando provar uma coisa:

# DOIS COMPUTADORES CONSEGUEM COMPARTILHAR O MESMO REFÚGIO?

O teste de sucesso é:

PC A
→ Dungeon Master
→ Refúgio
→ vê Player B.

PC B
→ Dungeon Master
→ Refúgio
→ vê Player A.

A anda
→ B vê.

B anda
→ A vê.

B fecha
→ A continua.

B retorna
→ A volta a vê-lo.

Se isso estiver funcionando:

# MULTIPLAYER 01 ESTÁ VALIDADO.

Não avançar para Party.

Não avançar para Tower Multiplayer.

Não avançar para Marketplace.

Ao terminar:

# ATUALIZAR O INSTALADOR E PARE.