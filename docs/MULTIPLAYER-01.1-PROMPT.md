# DUNGEON MASTER — MULTIPLAYER 01.1
## Integrar servidor público e gerar build jogável para teste real em 2 PCs

O Multiplayer 01 já possui sua primeira implementação de presença compartilhada no Refúgio e o servidor WebSocket já foi publicado externamente.

O objetivo desta iteração NÃO é desenvolver novas funcionalidades multiplayer.

O objetivo é conectar a implementação Multiplayer 01 já existente ao servidor público real, validar essa integração e gerar uma nova build Windows instalável que possa ser instalada, sem configuração manual, em dois computadores diferentes.

---

## 1. Servidor público já disponível

O servidor foi publicado no Render e está operacional.

Health endpoint:

`https://dungeon-master-hub-u40z.onrender.com/health`

WebSocket:

`wss://dungeon-master-hub-u40z.onrender.com/hub`

O `/health` foi validado manualmente e respondeu:

```json
{
  "ok": true,
  "protocolVersion": 1,
  "room": "hub-01",
  "players": 0
}
```

O deploy no Render também foi concluído com sucesso e o processo iniciou escutando externamente em `0.0.0.0`.

Configuração atual conhecida do serviço:

- `HOST=0.0.0.0`
- `ALLOWED_ORIGINS=dungeon://game`
- `ROOM_CAPACITY=16`
- `protocolVersion=1`

A porta é fornecida dinamicamente pelo Render e NÃO deve ser fixada no cliente.

O serviço está atualmente em uma instância gratuita do Render.

IMPORTANTE:

A instância gratuita pode entrar em suspensão por inatividade e o primeiro acesso pode apresentar atraso enquanto o serviço acorda.

O cliente deve lidar de forma adequada com esse cenário.

Não interpretar imediatamente um cold start como falha permanente do multiplayer.

---

# 2. OBJETIVO DESTA ITERAÇÃO

Produzir uma build Windows pronta para o seguinte teste:

```text
PC A
Dungeon Master
      │
      │ WSS
      ▼
Servidor público Render
      ▲
      │ WSS
      │
PC B
Dungeon Master
```

Os dois computadores receberão EXATAMENTE A MESMA BUILD.

Nenhum computador de jogador será servidor.

Nenhum jogador deverá:

- instalar Node;
- instalar npm;
- abrir terminal;
- executar servidor;
- editar configuração;
- informar IP;
- informar URL;
- configurar porta;
- modificar ASAR;
- alterar arquivos internos do jogo.

O fluxo esperado deve ser:

1. instalar Dungeon Master;
2. abrir o jogo;
3. carregar ou criar personagem;
4. entrar no Refúgio;
5. informar/escolher o nome multiplayer conforme a UI já implementada;
6. clicar em Conectar;
7. aguardar a conexão;
8. encontrar o outro jogador no mesmo Refúgio.

---

# 3. NÃO EXPANDIR O ESCOPO

NÃO implementar nesta iteração:

- Party System;
- Tower multiplayer;
- Tower instanciada;
- Floor inheritance;
- combate multiplayer;
- inimigos sincronizados;
- drops multiplayer;
- inventário compartilhado;
- trade;
- Marketplace;
- chat;
- contas;
- autenticação;
- backend de save;
- persistência de personagem no servidor;
- anti-cheat;
- Persistent Floors;
- matchmaking;
- novas profissões;
- Mining;
- Smithing;
- novas receitas;
- novas classes;
- novos mapas;
- novos andares.

Esta iteração é exclusivamente para homologar o primeiro multiplayer de presença no Refúgio utilizando dois computadores reais através da internet.

---

# 4. AUDITORIA ANTES DE MODIFICAR

Antes de alterar código:

1. audite a implementação atual do Multiplayer 01;
2. identifique onde o endpoint WebSocket é configurado;
3. identifique a política CSP da build desktop;
4. identifique os bloqueios de HTTP/HTTPS/WS/WSS da shell Electron;
5. identifique como a origem `dungeon://game` é produzida;
6. identifique o fluxo de conexão/reconexão;
7. identifique o protocolo de `hello`, snapshot, state e disconnect;
8. identifique os testes multiplayer existentes;
9. registre a quantidade atual de testes;
10. execute a suíte atual antes das modificações.

Não reimplementar sistemas que já existem.

Adaptar a arquitetura atual com a menor mudança necessária.

---

# 5. CONFIGURAÇÃO DO ENDPOINT DE PRODUÇÃO

Configure a build de produção para usar:

```text
wss://dungeon-master-hub-u40z.onrender.com/hub
```

O jogador NÃO deve precisar informar esse endereço.

O endpoint deve fazer parte da configuração de produção da build.

Não espalhar essa URL por múltiplos módulos.

Manter uma fonte central de configuração.

Desenvolvimento local deve continuar podendo utilizar:

```text
ws://127.0.0.1:8787/hub
```

quando explicitamente configurado para desenvolvimento.

Não quebrar o fluxo de desenvolvimento local existente.

Produção e desenvolvimento devem utilizar a mesma implementação de cliente, mudando apenas configuração.

---

# 6. ELECTRON E SEGURANÇA

A Build Desktop 01 foi originalmente criada com comportamento essencialmente offline e bloqueava tráfego web.

Agora a build precisa permitir a conexão multiplayer real.

Auditar a shell Electron e permitir SOMENTE a comunicação necessária com o servidor Dungeon Master.

Endpoint necessário:

```text
wss://dungeon-master-hub-u40z.onrender.com
```

Se tecnicamente necessário para health check:

```text
https://dungeon-master-hub-u40z.onrender.com
```

Preservar:

- `contextIsolation=true`;
- sandbox;
- `nodeIntegration=false`;
- `webSecurity`;
- renderer sem acesso arbitrário ao Node;
- bloqueio de navegação externa;
- bloqueio de popups;
- bloqueio de downloads não necessários;
- protocolo local `dungeon://game`;
- CSP restritiva;
- validação de destinos.

Não transformar a shell em um navegador permissivo.

Não liberar genericamente:

```text
wss://*
https://*
http://*
ws://*
```

se isso puder ser evitado.

Criar a exceção mínima necessária para o servidor Dungeon Master.

---

# 7. ORIGIN

O servidor de produção está configurado para aceitar:

```text
ALLOWED_ORIGINS=dungeon://game
```

Verifique qual Origin é realmente enviado pelo WebSocket da build Electron empacotada.

O comportamento esperado é compatível com:

```text
dungeon://game
```

Não relaxar a segurança do servidor apenas para mascarar uma origem incorreta no cliente.

Se houver divergência entre a origem real da build e a configuração esperada:

1. documentar a origem observada;
2. identificar a causa;
3. corrigir conscientemente;
4. preservar a política mais restritiva possível.

---

# 8. VALIDAR O SERVIDOR PÚBLICO

Antes do empacotamento final, validar novamente:

```text
GET https://dungeon-master-hub-u40z.onrender.com/health
```

Esperado:

```json
{
  "ok": true,
  "protocolVersion": 1,
  "room": "hub-01"
}
```

O campo `players` pode variar.

Depois disso, realizar também uma conexão WebSocket real.

Não considerar apenas `/health` suficiente para afirmar que o multiplayer está funcional.

Validar:

- TLS;
- handshake WebSocket;
- Origin;
- `hello`;
- `protocolVersion`;
- entrada na sala;
- snapshot;
- envio de state;
- recebimento de state;
- disconnect;
- reconnect.

Não desativar validação de certificado.

Não aceitar certificados inválidos.

---

# 9. COLD START DO RENDER

A instância utilizada atualmente é gratuita e pode suspender após inatividade.

Isso pode fazer a primeira conexão demorar.

O cliente não deve parecer congelado nem declarar falha definitiva cedo demais.

A UI deve representar, reutilizando a infraestrutura existente sempre que possível:

```text
Desconectado
Conectando...
Conectado
Reconectando...
Erro
```

Não criar um grande sistema visual novo.

Se o servidor estiver acordando, permitir que a estratégia existente de reconexão continue tentando por tempo razoável.

Evitar loops agressivos.

Usar backoff/retry adequado se isso já fizer parte da arquitetura.

Não enviar dezenas de tentativas por segundo.

---

# 10. PROTOCOLO

Preservar `protocolVersion=1`.

Não criar Multiplayer Protocol v2 nesta iteração.

Não adicionar dados persistentes ao protocolo.

O servidor continua responsável somente pela presença transitória necessária ao Refúgio.

O protocolo NÃO deve começar a transportar:

- save;
- inventário completo;
- equipamentos persistentes;
- ouro;
- atributos persistentes;
- Fishing;
- Cooking;
- ingredientes;
- pratos;
- profissão;
- progressão da Torre.

Preservar a separação entre:

```text
Save local
≠
Estado multiplayer transitório
```

---

# 11. TESTE AUTOMATIZADO COM DOIS CLIENTES

Criar ou reutilizar teste automatizado que simule pelo menos dois clientes compatíveis com `protocolVersion=1`.

Validar:

```text
Cliente A conecta
        ↓
Cliente B conecta
        ↓
A recebe presença de B
        ↓
B recebe presença de A
        ↓
A envia posição
        ↓
B recebe estado de A
        ↓
B envia posição
        ↓
A recebe estado de B
        ↓
A desconecta
        ↓
B recebe remoção de A
```

Validar também entrada tardia:

```text
A conecta
A permanece na sala
B conecta depois
B recebe A no snapshot
A recebe entrada de B
```

Não utilizar o save real do personagem nesses testes.

Não enviar inventário, equipamento, ouro ou dados de profissão.

---

# 12. TESTE REAL QUE ESTA BUILD DEVE PERMITIR

Esta build será instalada em dois computadores Windows diferentes.

## PC A

1. instalar;
2. abrir;
3. criar/carregar personagem;
4. permanecer no Refúgio;
5. escolher nome multiplayer;
6. conectar.

## PC B

1. instalar EXATAMENTE O MESMO SETUP;
2. abrir;
3. criar/carregar personagem;
4. permanecer no Refúgio;
5. escolher outro nome;
6. conectar.

Resultado esperado:

```text
PC A ──────────┐
               │
               ▼
        Render / hub-01
               ▲
               │
PC B ──────────┘
```

Ambos devem estar na mesma sala.

Esperado:

- A vê B;
- B vê A;
- movimento de A aparece em B;
- movimento de B aparece em A;
- orientação remota é atualizada;
- animação remota funciona conforme Multiplayer 01;
- nomes permanecem corretos;
- jogador local nunca aparece duplicado como remoto;
- nenhum cliente controla o outro.

---

# 13. CENÁRIOS DO PLAYTEST

Preparar a build para verificarmos os seguintes casos.

## Entrada tardia

A conecta primeiro.

B conecta posteriormente.

B deve receber snapshot contendo A.

A deve receber a entrada de B.

## Desconexão

A fecha o jogo.

B deve remover A conforme heartbeat/timeout já definido pelo protocolo.

## Reconexão

A abre novamente.

A deve conseguir retornar ao multiplayer sem reiniciar o servidor.

## Movimento simultâneo

A e B movimentam seus personagens ao mesmo tempo.

Não deve ocorrer:

- controle cruzado;
- teleporte do jogador local provocado por estado remoto;
- duplicação de avatar;
- crescimento ilimitado de entidades;
- avatar fantasma permanente após desconexão.

## Torre

Se um jogador entrar na Torre, NÃO implementar Tower Multiplayer.

Preservar o comportamento definido pelo Multiplayer 01.

O multiplayer desta iteração é somente presença compartilhada no Refúgio.

---

# 14. CAPACIDADE

Não alterar agora a arquitetura para 60 jogadores simultâneos.

O cenário real informado é:

- aproximadamente 30 alunos por turma;
- as duas turmas não necessariamente estarão conectadas simultaneamente;
- objetivo operacional futuro de aproximadamente 35 conexões simultâneas;
- conexões adicionais serviriam principalmente para testes ou suporte durante aula.

O servidor atual está configurado com:

```text
ROOM_CAPACITY=16
```

NÃO alterar automaticamente esse valor nesta iteração.

Primeiro precisamos provar que dois computadores reais funcionam corretamente.

Depois faremos uma iteração específica de capacidade/carga para decidir conscientemente:

- `ROOM_CAPACITY`;
- quantidade de salas;
- limite total de conexões;
- limite por IP;
- frequência de atualização;
- consumo de banda;
- CPU;
- memória;
- comportamento com aproximadamente 30–35 clientes;
- necessidade ou não de plano superior.

Não confundir:

```text
teste funcional de 2 PCs
```

com:

```text
teste de escala de 35 jogadores
```

São problemas diferentes.

---

# 15. SAVES

Preservar completamente o sistema atual de saves locais.

O servidor Multiplayer 01:

- não recebe save;
- não recebe inventário;
- não recebe equipamentos;
- não recebe ouro;
- não recebe Cooking;
- não recebe Fishing;
- não recebe atributos persistentes.

Cada computador possui seu próprio save.

O servidor mantém somente presença transitória necessária ao Refúgio.

Não migrar saves para backend nesta iteração.

Não implementar autenticação.

Não implementar antifraude.

---

# 16. REGRESSÃO SINGLE-PLAYER

A conexão pública não pode quebrar o jogo existente.

Executar a suíte completa atual.

Validar regressão de:

- criação/carregamento de personagem;
- Refúgio;
- movimento;
- câmera;
- HUD;
- inventário;
- equipamentos;
- atributos;
- Skill Tree;
- Armeiro;
- Mira;
- Cooking;
- compra de ingredientes;
- venda;
- minigame de Cooking;
- pratos;
- consumíveis;
- cooldown alimentar;
- buffs;
- Fishing;
- portal;
- Torre;
- combate;
- habilidades;
- save;
- fechamento;
- reabertura.

Para validação manual de regressão, NÃO é necessário repetir uma run completa dos três andares e boss.

Uma validação representativa é suficiente, apoiada pela suíte automatizada.

---

# 17. ATUALIZAÇÃO OBRIGATÓRIA DA BUILD JOGÁVEL

REGRA DO PROJETO A PARTIR DE AGORA:

**Toda entrega de implementação deve atualizar também a build jogável e o instalador.**

Não concluir uma iteração de implementação deixando apenas o código-fonte atualizado.

Ao finalizar esta iteração:

1. executar suíte completa;
2. executar build web;
3. executar build desktop;
4. empacotar nova versão Windows x64;
5. atualizar o instalador;
6. atualizar Portable se continuar fazendo parte do pipeline;
7. atualizar documentação de playtest;
8. gerar artefatos finais separados da Desktop 01 anterior.

Não sobrescrever silenciosamente artefatos anteriores.

Criar versão claramente identificável como Multiplayer 01.

Sugestão:

```text
DungeonMaster-Beta-0.2.0-Multiplayer01-Setup.exe
DungeonMaster-Beta-0.2.0-Multiplayer01-Portable.exe
```

Pode adaptar o número ao versionamento já utilizado pelo projeto.

O importante é que o nome deixe inequívoco que esta é a build do playtest Multiplayer 01.

---

# 18. A MESMA BUILD NOS DOIS COMPUTADORES

O instalador deve possuir o endpoint público configurado internamente.

Quero poder pegar:

```text
DungeonMaster-...-Multiplayer01-Setup.exe
```

e copiar EXATAMENTE esse arquivo para:

```text
PC A
PC B
```

Não gerar:

```text
Build A
Build B
Host Build
Client Build
Server Build para jogador
```

A arquitetura deste teste é:

```text
             ┌──────────────────────┐
             │ Render               │
             │ dungeon-master-hub   │
             └──────────┬───────────┘
                        │
                   WSS / hub
                 ┌──────┴──────┐
                 │             │
              PC A           PC B
            mesma build    mesma build
```

Nenhum dos jogadores hospeda o servidor.

---

# 19. CHECKLIST-MULTIPLAYER-01.txt

Criar junto aos artefatos finais:

```text
CHECKLIST-MULTIPLAYER-01.txt
```

Conteúdo mínimo:

```text
DUNGEON MASTER — MULTIPLAYER 01

PC A:
Windows:
Nome multiplayer:

PC B:
Windows:
Nome multiplayer:

TESTE

[ ] PC A instalou e abriu.
[ ] PC B instalou e abriu.
[ ] Ambos carregaram personagens.
[ ] PC A conectou.
[ ] PC B conectou.
[ ] A vê B.
[ ] B vê A.
[ ] Movimento A → B funciona.
[ ] Movimento B → A funciona.
[ ] Orientação remota funciona.
[ ] Animação remota funciona.
[ ] Entrada tardia funciona.
[ ] Fechar um cliente remove sua presença.
[ ] Reconectar funciona.
[ ] Entrar/sair da Torre não quebra o Hub.
[ ] Save local continua funcionando.
[ ] Fishing continua funcionando.
[ ] Cooking continua funcionando.
[ ] Nenhum crash crítico.

Latência percebida:

Problemas observados:

Passos para reproduzir:

Observações:
```

---

# 20. ARTEFATOS

Criar uma pasta final específica, por exemplo:

```text
release/multiplayer-01-playtest/
```

Ela deve conter somente arquivos úteis para distribuição e teste.

No relatório final informar para cada artefato:

- caminho exato;
- nome exato;
- tamanho;
- SHA-256;
- versão.

Informar explicitamente qual arquivo devo enviar.

Escrever literalmente no relatório:

```text
ENVIE EXATAMENTE ESTE MESMO ARQUIVO PARA OS DOIS PCs:

<caminho e nome do Setup>
```

Não exigir que eu descubra qual executável é o correto.

---

# 21. INSTALADOR

Atualizar o instalador Windows.

O playtester deve conseguir:

```text
baixar
→
abrir Setup
→
instalar
→
abrir Dungeon Master
→
jogar
```

Sem:

- Node;
- npm;
- terminal;
- servidor local;
- edição de arquivo;
- configuração manual de endpoint.

Preservar instalação por usuário se essa continua sendo a configuração atual.

Não exigir privilégios administrativos desnecessariamente.

Sem assinatura digital continua aceitável nesta fase.

Se houver SmartScreen por falta de assinatura, documentar sem tentar contornar as proteções do Windows.

---

# 22. PORTABLE

Se o pipeline atual já gera Portable e isso continuar sendo de baixo custo, atualizá-lo também.

Porém o artefato principal do teste deve continuar sendo o Setup.

Não atrasar a iteração criando novo sistema de distribuição.

---

# 23. TESTAR A BUILD EMPACOTADA

Não considerar o funcionamento no navegador/dev server como prova suficiente.

Quando tecnicamente possível, abrir a build realmente empacotada.

Validar que o renderer empacotado consegue tentar conexão com:

```text
wss://dungeon-master-hub-u40z.onrender.com/hub
```

Não testar somente:

```text
npm run dev
```

O objetivo é validar o mesmo código que chegará aos dois PCs.

Se limitações do ambiente impedirem observar visualmente a janela Electron, declarar isso claramente.

Não marcar testes manuais como aprovados apenas porque os testes automatizados passaram.

---

# 24. LOGS E DIAGNÓSTICO PARA O PLAYTEST

O teste será feito em computadores externos.

Sem transformar a build em versão de desenvolvimento, garanta que falhas de conexão possam ser diagnosticadas de maneira razoável.

A UI deve ao menos diferenciar:

```text
Conectando
Conectado
Reconectando
Erro/Desconectado
```

Não exibir stack traces técnicos para o jogador.

Não abrir DevTools automaticamente.

Não registrar dados persistentes sensíveis/desnecessários.

Se já existir logging seguro do Multiplayer 01, reutilizá-lo.

---

# 25. SERVIDOR NÃO É SAVE SERVER

Reforço arquitetural:

Nesta iteração:

```text
SERVIDOR
=
presença transitória do Refúgio
```

e NÃO:

```text
SERVIDOR
=
conta
+
save
+
inventário
+
economia
+
progressão
```

Não antecipar a arquitetura futura.

---

# 26. TESTES AUTOMATIZADOS FINAIS

Após todas as alterações:

Executar a suíte completa.

O total final deve ser igual ou superior ao baseline encontrado no início desta iteração.

Zero falhas.

Adicionar testes somente onde fizer sentido para a integração criada.

Cobrir especialmente:

- configuração de produção;
- endpoint permitido;
- endpoint não permitido;
- protocolo;
- dois clientes;
- snapshot;
- state;
- disconnect;
- reconnect quando testável;
- Origin quando testável;
- lifecycle desktop afetado pelas mudanças;
- regressão da shell de segurança.

Não remover testes apenas para obter suíte verde.

---

# 27. BUILD WEB

Executar:

```text
npm run build
```

ou o comando equivalente já existente.

Registrar:

- sucesso/falha;
- módulos;
- tamanho JS;
- gzip;
- tamanho CSS;
- gzip;
- warnings.

O warning preexistente de chunk >500 kB não deve virar uma otimização paralela nesta iteração.

---

# 28. BUILD DESKTOP

Executar o pipeline desktop atual.

Gerar a build Windows x64 atualizada.

Não migrar Electron/Tauri ou trocar a stack nesta iteração.

Preservar a arquitetura Desktop 01 que já conseguiu produzir Setup e Portable.

---

# 29. RELATÓRIO FINAL OBRIGATÓRIO

Ao terminar, entregar relatório estruturado exatamente com estas seções:

## 1. Auditoria inicial

Estado encontrado antes das mudanças.

## 2. Configuração multiplayer

Onde o endpoint de produção ficou configurado.

## 3. Servidor público

Resultado de `/health`.

Resultado do teste WebSocket.

## 4. Electron / CSP / segurança

Quais exceções foram necessárias para WSS/HTTPS.

O que continua bloqueado.

## 5. Origin

Origem observada/esperada e compatibilidade com o servidor.

## 6. Cold start e reconexão

Comportamento implementado ou preservado.

## 7. Multiplayer automatizado

Resultado do teste com dois clientes.

## 8. Regressão

Quantidade de testes antes e depois.

Aprovados.

Falhas.

## 9. Build web

Resultado e métricas.

## 10. Build desktop

Resultado.

## 11. Instalador atualizado

Nome e versão.

## 12. Artefatos

Caminhos, nomes, tamanhos e SHA-256.

## 13. ARQUIVO PARA OS DOIS PCs

Destacar explicitamente:

```text
ENVIE EXATAMENTE ESTE MESMO ARQUIVO PARA OS DOIS PCs:

...
```

## 14. Testes executados automaticamente

Listar somente o que realmente foi executado.

## 15. Testes manuais executados

Listar somente o que realmente foi observado.

## 16. Testes que EU ainda preciso executar

Incluir obrigatoriamente o teste real em dois computadores.

## 17. Limitações conhecidas

Não esconder limitações.

## 18. Próximo passo recomendado

O próximo passo deve depender do resultado do playtest.

NÃO iniciar automaticamente outra implementação.

---

# 30. CRITÉRIOS DE ACEITAÇÃO

Esta iteração está pronta PARA PLAYTEST quando:

- servidor Render está Live;
- `/health` responde;
- WebSocket público foi validado tecnicamente;
- build de produção aponta para o WSS público;
- usuário não precisa informar endpoint;
- Electron permite somente a comunicação necessária;
- Origin é compatível;
- cliente lida razoavelmente com cold start/reconexão;
- protocolo continua versão 1;
- dois clientes automatizados conseguem compartilhar presença;
- saves continuam locais;
- single-player não sofreu regressão;
- suíte completa passa;
- build web passa;
- build desktop passa;
- novo Setup é gerado;
- mesmo Setup pode ser instalado nos dois PCs;
- checklist do Multiplayer 01 é gerado.

IMPORTANTE:

A iteração NÃO pode declarar como aprovado:

```text
"Multiplayer funciona entre dois PCs reais"
```

antes de eu efetivamente instalar e testar a build em dois computadores diferentes.

A implementação pode declarar:

```text
"Build pronta para playtest Multiplayer 01 em dois PCs."
```

---

# 31. RESULTADO ESPERADO

Ao final desta entrega quero chegar exatamente aqui:

```text
           INTERNET
              │
              ▼
┌─────────────────────────────┐
│ Render                      │
│ dungeon-master-hub-u40z     │
│ protocolVersion 1           │
│ hub-01                      │
└─────────────┬───────────────┘
              │
           WSS /hub
       ┌──────┴──────┐
       │             │
       ▼             ▼
┌────────────┐ ┌────────────┐
│    PC A    │ │    PC B    │
│            │ │            │
│ MESMO      │ │ MESMO      │
│ SETUP      │ │ SETUP      │
└────────────┘ └────────────┘
```

O objetivo desta etapa não é provar escala, Party ou Torre multiplayer.

É provar uma coisa simples e fundamental:

> Dois computadores diferentes, usando exatamente a mesma build distribuível do Dungeon Master, conseguem se conectar pela internet ao servidor público e enxergar/movimentar seus personagens no mesmo Refúgio.

---

# STOP

Depois de:

- integrar o endpoint público;
- validar tecnicamente a conexão;
- executar os testes;
- atualizar a build jogável;
- atualizar o instalador;
- gerar os artefatos;
- gerar o checklist;
- entregar o relatório;

PARE.

NÃO iniciar:

- Multiplayer 02;
- Party;
- Tower Multiplayer;
- Persistent Floors;
- Floor Inheritance;
- Marketplace;
- autenticação;
- backend de saves;
- teste de 35 jogadores;
- Mining;
- Smithing;
- novas classes;
- novas funcionalidades.

O próximo passo depende exclusivamente do resultado do teste real do Multiplayer 01 em dois computadores.