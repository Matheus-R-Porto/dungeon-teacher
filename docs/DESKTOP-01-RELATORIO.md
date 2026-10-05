# Dungeon Master — Build Desktop 01

Estado: implementação e empacotamento prontos; homologação visual desktop pendente. Não declarar todos os critérios de aceitação concluídos.

## 1. Auditoria

Baseline registrado antes das alterações: 331/331 testes, build web aprovada e Refúgio/inventário abertos no navegador. Stack: JavaScript ES modules, Three.js 0.186.1, Vite 8.3.1 e IndexedDB. Os sprites são gerados em canvas, áudio é sintetizado, fontes são locais do sistema e dados entram no bundle. Nenhum servidor externo é necessário para o jogo. O empacotador falhou com EPERM ao renomear a pasta extraída do Electron; preparar o runtime pelo instalador oficial e usar electronDist resolveu essa etapa.

## 2. Tecnologia

Electron 44.5.1 e electron-builder 26.15.3, fixados no package-lock. Mantêm HTML/CSS/JS e o domínio existente. NSIS para instalação por usuário; Portable como alternativa. Referências: [protocolos Electron](https://www.electronjs.org/docs/latest/api/protocol), [NSIS](https://www.electron.build/docs/nsis/).

## 3. Desktop shell

`desktop/main.cjs` controla janela, protocolo local, F11, instância única e fechamento. `desktop/preload.cjs` expõe apenas o ciclo de fechamento. `desktop/protocol.cjs` serve os arquivos empacotados. `src/adapters/desktop/lifecycle.js` espera operações pendentes e o save. O renderer é o mesmo build da web. Janela inicial: conteúdo 1280×720, redimensionável, mínimo 1024×700 externo. Fullscreen implementado; resolução 1920×1080 e F11 ainda não observados manualmente.

## 4. Segurança

contextIsolation e sandbox ativos, nodeIntegration desativado, webSecurity preservado. Renderer sem filesystem/process/shell. IPC restrito à janela/frame/origem principal. CSP, tipos de arquivo permitidos e bloqueio de traversal. Sem navegação externa, popups, downloads ou permissões. Requisições HTTP/HTTPS/WS/WSS bloqueadas. DevTools desativados no pacote; sem painéis debug automáticos. [Segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security).

## 5. Storage

Perfil persistente em `%APPDATA%\Dungeon Master`; IndexedDB `dungeon-master`, store `character`. Origem estável `dungeon://game`. A execução real criou `IndexedDB\dungeon_game_0.indexeddb.leveldb`. Instalador e Portable compartilham esse perfil; a pasta temporária do Portable não contém o save. Personagem próprio, sem importação ou alteração do save web. Snapshot existente preserva níveis/XP, ouro, atributos, equipamentos, habilidades, profissões, itens e prazos alimentares.

## 6. Timers

Fishing mantém seus ticks e pausa existentes; Cooking mantém duração aproximada de 4 segundos e cancelamento por blur. Food continua com prazo absoluto de 8 segundos e buff com 300 segundos. Nenhum rebalanceamento. Ao fechar, o adaptador pausa, cancela ações transitórias, aguarda operações em andamento e grava snapshot antes de destruir a janela. Testes unitários aprovam ordem, erro e timeout. A execução visual desses timers no pacote permanece pendente.

## 7. Build web

Aprovada antes e depois: produção com 65 módulos, JS 739,52 kB / gzip 201,30 kB e CSS 24,63 kB / gzip 6,70 kB. Warning de chunk >500 kB preservado, conforme permitido. Refúgio web voltou a abrir sem erros observados no console. Scripts dev/build/test preservados.

## 8. Build desktop

Instalador e Portable Windows x64 gerados. O comando prepara explicitamente o runtime oficial antes do electron-builder. Uma execução do `win-unpacked\DungeonMaster.exe` foi iniciada pelo sistema: quatro processos vivos e IndexedDB criado. Isso é evidência de inicialização, não substitui a observação da janela e o smoke test exigidos. A shell de controle de janelas retornou `Trusted RPC service is not configured: sky`; não foi possível observar ou operar o executável.

## 9. Artefatos

Os arquivos finais estão em `release/desktop-01-final`, dentro deste projeto. Tamanhos exatos e SHA-256 constam em `ARTEFATOS.txt` nessa pasta. Setup é o instalador; Portable é a alternativa sem instalação. Não enviar `win-unpacked`, `.tmp`, `.blockmap`, logs ou arquivos do builder. `LEIA-ME.txt` e `CHECKLIST-PLAYTEST.txt` acompanham os executáveis.

- Setup: C:\Users\theuz\.codex\.chatgpt-projects\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\desktop-01-final\DungeonMaster-Beta-0.1.0-Desktop01-Setup.exe — 111.486.671 bytes.
- Portable: C:\Users\theuz\.codex\.chatgpt-projects\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\desktop-01-final\DungeonMaster-Beta-0.1.0-Desktop01-Portable.exe — 111.256.719 bytes.

## 10. Arquivo que devo enviar

Envie ESTE arquivo para o playtester: `release/desktop-01-final/DungeonMaster-Beta-0.1.0-Desktop01-Setup.exe`, acompanhado de `LEIA-ME.txt`. Neste momento ele é candidato a playtest: a homologação manual descrita abaixo ainda está pendente. Alternativa: `DungeonMaster-Beta-0.1.0-Desktop01-Portable.exe`.

## 11. Instalação

Abrir Setup e seguir o assistente, sem privilégios administrativos obrigatórios; abrir pelo atalho Dungeon Master. Portable abre diretamente e extrai seus arquivos automaticamente. O jogador não instala Node/npm nem executa servidor ou terminal. A instalação interativa não foi testada nesta sessão.

## 12. Smoke test

Web: Refúgio e inventário observados. Desktop: processo iniciado e armazenamento criado. Pendentes no executável: movimento/câmera/HUD, atributos, Skill Tree, Armeiro, Mira, portal, um encontro com habilidade, uma captura e uma receita. Também pendentes: F/Espaço no minigame, cancelamento e perda de foco sem consumo/XP duplicados. Nenhum desses itens foi marcado como aprovado apenas com base no código ou na suíte.

## 13. Persistência

Destino persistente e criação do banco confirmados. Gravação antes de fechar coberta por testes do adaptador. Comparação manual de XP/ouro/profissões/itens após fechar completamente e reabrir: pendente. A execução aberta não foi encerrada à força: a revisão automática recusou essa ação pelo risco de perder alterações não salvas. Não houve exclusão ou migração de saves.

## 14. Persistência temporal

Implementação usa os prazos absolutos já existentes e a suíte foi preservada. Testes reais comer→fechar→esperar→reabrir, tempo restante do buff e expiração offline: pendentes. É necessário observar esses casos antes de declarar a build homologada.

## 15. Offline

Arquivos estão dentro do ASAR; não há localhost na URL de carregamento. A shell bloqueia tráfego web e o processo conseguiu inicializar o banco nessas condições. Não houve teste manual de gameplay com a conexão física desligada. Não foi alterada a conexão nem a segurança do Windows.

## 16. Testes

Baseline: 331 aprovados. Final: 337 aprovados, zero falhas, aproximadamente 104 segundos. Seis novos testes cobrem resolução segura dos assets, protocolo e fechamento/salvamento. Logs em `docs/DESKTOP-01-BASELINE-TESTES.txt`, `docs/DESKTOP-01-BASELINE-BUILD.txt`, `docs/DESKTOP-01-TESTES.txt` e `docs/DESKTOP-01-BUILD.txt`. Conteúdo do ASAR inspecionado: dist, shell, preload e package.json; sem caminhos externos de assets.

## 17. Performance

Os quatro processos da abertura somaram aproximadamente 741 MiB de working set em uma amostra. Não é benchmark de memória privada. Tempo até primeiro frame, FPS no Refúgio/Torre e suavidade do Cooking não medidos, pois não houve acesso visual à janela. Nenhuma otimização ou mudança de gameplay foi introduzida para melhorar métricas.

## 18. Limitações

Sem assinatura digital (NotSigned verificado), pode haver aviso do SmartScreen; não contornar proteções. Ícone padrão do Electron nesta primeira build. Não há autoupdate. Não foi testado outro computador Windows. Controle nativo indisponível impediu testes manuais obrigatórios, incluindo fechar/reabrir. A Build Desktop 01 ainda não pode ser considerada integralmente validada. Nenhum Multiplayer ou conteúdo novo foi iniciado.

## 19. Checklist externo

- [ ] Setup instala ou Portable abre sem ferramentas de desenvolvimento.
- [ ] Personagem criado/carregado, movimento, câmera e painéis funcionam.
- [ ] F11 alterna e UI funciona em 1280×720 e 1920×1080.
- [ ] Um encontro de combate e uma habilidade funcionam.
- [ ] Uma captura concede peixe e Fishing XP.
- [ ] Mira compra/vende; uma receita concede prato e Cooking XP.
- [ ] Cancelar Cooking e trocar foco preservam ingredientes sem XP/prato indevido.
- [ ] Consumir remove item, aplica efeito e inicia cooldown.
- [ ] Registrar níveis/XP/ouro/itens, fechar normalmente e confirmar que processo encerrou.
- [ ] Reabrir preserva progresso e Cooking/Fishing XP.
- [ ] Cooldown e buff refletem o tempo fechado; buff expirado não retorna.
- [ ] Abrir e jogar sem internet.
- [ ] Nenhum erro crítico; registrar Windows, build e passos se houver problema.
