# Dungeon Master — Multiplayer 01

Estado: implementação local e build jogável atualizadas; **teste externo pendente de hospedagem e endpoint público**. Não declarar o objetivo entre dois computadores validado antes desse teste.

## 1. Baseline

337 testes aprovados antes das alterações, build web aprovada e Setup/Portable Desktop01 reconstruídos em `release/mp01-baseline`. Logs em `MULTIPLAYER-01-BASELINE-TESTES.txt` e `MULTIPLAYER-01-BASELINE-BUILD.txt`. Auditados Player/Game, câmera, SpriteActor, AreaSession, RunState, IndexedDB, lifecycle e os três arquivos da shell Electron.

## 2. Arquitetura multiplayer

Cliente ↔ WebSocket ↔ servidor Node separado. O servidor é autoridade da presença transitória na sala; valida e redistribui o estado recebido. Movimento local continua imediato. Não há servidor no renderer nem host-jogador. A presença remota não contém Character.

## 3. Servidor

Node >=22.12 com ws 8.22.0, dependência fixada e lockfile próprio. `npm run server:install` e `npm run server:start`. Configuração central em `server/config.js`: host, port, origins, capacidade, heartbeat e limites. Logs de start/connection/join/leave/disconnect/protocol error e contagens. Nenhum banco, conta ou save remoto. [Instruções de execução/hospedagem](../server/DEPLOY.md).

## 4. Protocolo

Versão 1, em `shared/multiplayer.js`: client:hello, server:welcome, room:snapshot, player:join, player:leave, player:state, ping, pong, server:error. Campos exatos e envelope versionado; versão incompatível recebe mensagem para atualizar. Snapshot inicial é uma mensagem explícita depois de welcome.

## 5. Hub room

Uma sala `hub-01`, capacidade padrão 16 e configurável entre 2 e 32. Novo participante recebe snapshot completo; os existentes recebem join. Sair remove a presença e transmite leave. Reiniciar o servidor esvazia a sala; os clientes conectados refazem sua entrada.

## 6. Identidade

UUID v4 persistente em localStorage, chave `dungeon-multiplayer.identity.v1`, separado do snapshot de Character. Nome de 2 a 24 caracteres, editável antes de conectar. Perfil de teste usa chave própria. Nome não autentica; UUID também não é credencial. Sessão duplicada é recusada sem expulsar a primeira.

## 7. Remote player

`RemoteState` guarda só nome, id e amostras de movimento. `RemotePlayers` reutiliza SpriteActor, acrescenta tonalidade azul e nome sobre a cabeça. Elementos de nome usam textContent. Sprites remotos não entram em colisão, combate, picking de inimigos ou lógica de NPC. Recursos de renderização são removidos no leave e na troca de cena.

## 8. Movimento

Até 15 estados/s em timer independente do render, sem rajada de catch-up. X/Z, heading de mundo e moving; nenhuma câmera transmitida. Buffer curto com atraso de interpolação de 100 ms, menor arco angular e sem extrapolação indefinida. SpriteActor resolve o facing usando a câmera local de cada observador. A própria movimentação não espera round-trip.

## 9. Heartbeat

Ping/pong WebSocket a cada 10 s; conexão sem pong é removida em até aproximadamente 20 s. Hello exigido em até 5 s. Cliente mede ping de aplicação a cada 5 s e considera o servidor sem resposta após 16 s sem mensagens. Buffs, Cooking e Fishing não participam desse relógio de rede.

## 10. Reconexão

Após queda, limpa remotos e tenta novamente com espera de 2, 4, 8 e até 10 s. Cada conexão refaz hello/snapshot. Desconectar explicitamente cancela retries. Versão inválida/identidade duplicada exigem ação do jogador e não geram loop de reconexão. Não conecta silenciosamente ao abrir o jogo.

## 11. Torre

AreaSession notifica a mudança: sair do Refúgio fecha a conexão e apaga remotos; voltar reconecta se o jogador havia escolhido participar. A Torre continua exatamente single-player. A saída/entrada foi observada visualmente em dois clientes locais. Nada de inimigos, bosses, HP, habilidades, loot ou geração é transmitido.

## 12. Segurança

Allowlist desktop mantém HTTP/HTTPS/WS/WSS bloqueados exceto o WebSocket exato configurado. CSP connect-src usa o mesmo endpoint. WSS obrigatório para remoto; WS permitido somente em loopback para desenvolvimento. Sem credenciais/query/hash no endpoint. contextIsolation, sandbox, nodeIntegration=false e webSecurity preservados; preload não recebeu acesso novo.

Servidor valida origem exata, JSON, versão, tipo, chaves extras, UUID, nome, números finitos, posição ±12 e heading ±π. Payload até 8 KiB, 45 mensagens/s com token bucket, 64 conexões totais, 8 por socket-IP, 20 upgrades/10 s por IP com memória limitada e backpressure 64 KiB. Origem e UUID não substituem autenticação; essa prova não possui proteção completa contra personificação. Não foi adicionado anti-cheat.

## 13. Save

Perfil `%APPDATA%\Dungeon Master`, appId e origem `dungeon://game` preservados. Sem alteração do schema Character e sem migração/exclusão. Inventário, ouro, níveis, Fishing, Cooking, cooldowns e buff ficam locais. O teste web manteve Lv5, XP14/1100, ouro638, Fishing2/28 e Cooking2/22 após recarga. Fechar desktop cancela a presença antes de aguardar a gravação existente.

## 14. Testes

Baseline 337; resultado final **361/361 testes aprovados**, zero falhas, em aproximadamente 151 segundos. São 24 novos testes. Log completo em `MULTIPLAYER-01-TESTES.txt`. Testes cobrem protocolo, payload, versão, nomes, identidade, allowlist, interpolação, câmera independente, dois sockets reais, movimento nos dois sentidos, leave/rejoin, heartbeat, sessão duplicada, capacidade, limite de frequência, origem, handshake, queda/reinício, saída para Torre e modo sem endpoint. Nenhum teste antigo removido.

## 15. Teste local de dois clientes

Dois clientes web reais no navegador interno, um perfil normal (Gandalf) e outro de teste (Bilbo), ligados ao backend local. Observados: ambos Online/2 jogadores, nomes remotos, deslocamento nos dois sentidos, mudança de facing ao andar, leave, reconexão e desaparecimento/reaparecimento na transição Torre/Refúgio. Ping observado 1 ms; esse valor é local, não representa a internet. Snapshot/heartbeat e reconexão após reinício também aprovados por integração automatizada. A tentativa com servidor parado exibiu indisponibilidade e voltou a Online quando o serviço retornou, sem intervenção no cliente.

Captura: `screenshots/multiplayer-01-two-clients.png`. Dois clientes neste computador não equivalem a dois computadores externos. Não foi executada novamente a campanha inteira nem uma nova rodada manual de pesca/culinária; os testes existentes desses sistemas continuam preservados.

## 16. Servidor para teste externo

**Nenhum servidor público foi provisionado.** Não foi fornecido endpoint ou acesso de hospedagem. `config/multiplayer.json` fica com serverUrl vazio na distribuição candidata. O jogo informa servidor não configurado e continua individual. Não há localhost embutido como destino do playtest externo.

O deploy está preparado em `server/DEPLOY.md` e `Dockerfile.multiplayer`. O guia fornece passos exatos para Web Service Node no Render, incluindo comandos, variáveis, origem desktop, health check, instância única, WSS e geração final da build. Falta o responsável disponibilizar a hospedagem e seu domínio real. Depois, configurar o endpoint e rodar `npm run desktop:package:playtest`. Esse comando recusa endereço vazio ou loopback. Os jogadores recebem o mesmo instalador pronto, sem editar .env/JS/ASAR.

## 17. Build jogável atualizada

Beta 0.1.0 / Multiplayer01, buildVersion Windows 0.1.0.2. Renderer e shell usam o mesmo arquivo central de endpoint. Pipeline Vite + Electron 44.5.1 + electron-builder 26.15.3. Desktop01 não foi sobrescrita. Build web e packaging final concluídos com exit code 0. O executável empacotado Multiplayer01 foi iniciado pelo Windows (PID 15536); a indisponibilidade do controle nativo impede confirmar visualmente sua janela. Os avisos de chunk >500 kB são conhecidos; não houve reestruturação desnecessária.

## 18. Novo instalador

`release/multiplayer-01/DungeonMaster-Beta-0.1.0-Multiplayer01-Setup.exe`. Caminho absoluto, tamanho em bytes e SHA-256 registrados em `ARTEFATOS.txt` nessa pasta. Instalador por usuário, sem Node/npm/terminal para o jogador. É candidato offline enquanto falta servidor público.

Setup: C:\Users\theuz\.codex\.chatgpt-projects\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\multiplayer-01\DungeonMaster-Beta-0.1.0-Multiplayer01-Setup.exe — 111.491.962 bytes. SHA-256: `07323D066774330B2C49C844DCEDC08350DD4AE5AE2B4CC0ED4FDAA6C28271DE`.

## 19. Portable

`release/multiplayer-01/DungeonMaster-Beta-0.1.0-Multiplayer01-Portable.exe`. Mesmo cliente e perfil persistente; sem servidor embutido. Hash/tamanho em ARTEFATOS.txt. Portable não transporta o save junto do executável.

Portable: C:\Users\theuz\.codex\.chatgpt-projects\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\multiplayer-01\DungeonMaster-Beta-0.1.0-Multiplayer01-Portable.exe — 111.261.886 bytes. SHA-256: `80BF6C7F279E1C99B4544F98101F08D8B7F67941E78549D95B4CA4D083030D93`.

Backend distribuído em `DungeonMaster-Multiplayer01-Server.zip` (8.534 bytes), com código, lockfile, Dockerfile e guia de deploy; sem node_modules ou saves.

## 20. Arquivo que devo baixar

Baixe este arquivo: `DungeonMaster-Beta-0.1.0-Multiplayer01-Setup.exe`, na pasta `release/multiplayer-01`, para experimentar a build candidata atualizada. **Não iniciar o teste de multiplayer entre PCs com esse candidato sem endpoint**. O instalador final do playtest será gerado depois do deploy com o endereço real. LEIA-ME e TESTE-MULTIPLAYER-01 acompanham a entrega.

## 21. Como testar em 2 PCs

Com servidor público e build final configurados: instalar a mesma versão em A/B; escolher nomes distintos; clicar Conectar nos dois; confirmar Online/2; andar nos dois sentidos; fechar/reabrir B e reconectar; entrar na Torre com A e voltar. Passo a passo completo em `desktop/TESTE-MULTIPLAYER-01.txt`.

## 22. Resultado esperado

Cada cliente vê o outro e seu movimento/direção, com câmera própria. Fechar ou desconectar B remove apenas B; A segue normalmente. Reconectar recria B. Entrar na Torre remove A da sala; voltar o recoloca. Progresso local preservado. Anotar tempo de conexão, atraso, teleportes, facing, fantasmas, reconexão, crashes e save.

## 23. Limitações

Pendente endpoint/hospedagem e teste real em dois Windows. Controle de janelas nativo permanece indisponível (`Trusted RPC service is not configured: sky`); não declarar smoke visual do executável concluído. Setup/Portable sem assinatura digital e com ícone padrão; SmartScreen pode avisar, sem contornar proteção. Sem Party, Torre multiplayer, chat, trade, Marketplace, combate sincronizado, cloud save ou banco remoto. Servidor é uma única instância em memória. Não foi iniciada outra iteração.
