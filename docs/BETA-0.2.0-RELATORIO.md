# Beta 0.2.0 — Fundação do Mundo Compartilhado

Data: 13/10/2026. Base: Beta 0.1.5, commit f2cc9b4, com alterações preexistentes em README.md e RELATORIOS.md preservadas. Implementação autorizada pelo responsável após auditoria.

## Resultado e limites da validação

Implementado um mapa compartilhado funcional no mesmo servidor Node/WebSocket. Dois processos Electron independentes foram iniciados com o ponto de entrada real `desktop/main.cjs`, perfis de teste separados e segurança normal do renderer. Comandos reais de teclado/mouse acionaram movimento e combate. Foram capturadas telas dos dois clientes e inspecionadas visualmente.

Isso é validação gráfica automatizada local, não aprovação de playtest humano nem teste entre dois computadores pela internet. Não foi publicada uma nova versão no Render, gerado instalador ou testada latência WAN. A versão permanece experimental.

## Evolução preservada

As iterações 1–12 forneceram arquitetura em domínio/simulação/adapters/UI, Three.js, combate, habilidades, equipamento, XP por nível, loop da Torre, pesca, culinária, Electron, presença no Refúgio e biomas. A auditoria confirmou as adições posteriores:

- 13: picareta, veios, minério, minigame e XP de Mining.
- 14: subida além do boss do andar 3 até o limite 50; progresso e recompensas individuais; revisitas e novas probabilidades de biomas.
- 15: forja, receitas, qualidades, armas reais equipáveis, XP de Smithing e prática por receita.

Todos esses sistemas permanecem na campanha local. O mapa de teste não remove nem migra profissões, habilidades ou inventário para o servidor. A futura persistência da geografia da Torre não está implementada.

## Arquitetura

`InputController → WorldClient → /hub, protocolo v2 → SharedWorld → snapshot → SceneView/CombatVisual/RemotePlayers`.

- `startHub` continua sendo o único servidor HTTP/WebSocket. Reutiliza origem permitida, limite de payload/frequência/conexões, heartbeat e controle de buffer. Clientes v1 continuam no Refúgio; clientes v2 entram no mapa de teste. Os estados não se misturam.
- `SharedWorld` mantém uma população única e simula em passos de 50 ms (20 Hz), emitindo snapshots a cada dois passos (10 Hz). Um servidor ocupado pode atrasar a simulação; não há compensação sofisticada de latência nesta fundação.
- O mapa é uma definição separada do estado da simulação (`testMap`). Essa separação permite substituir a origem da geografia por geração e armazenamento futuramente. Reiniciar o servidor recria o mapa e as sessões; não existe banco online.
- Movimento usa `Game`, navegação e colisões existentes. Corpos usam a separação já existente. O cliente envia eixos no referencial do mundo ou destino, nunca uma posição final aceita como verdade. Eixos são normalizados e expiram após 400 ms sem atualização.
- Ataque usa `AttackCycle`, `resolveAttack`, estatísticas do personagem e alcance real da espada de treino. O servidor valida alvo, geração, distância e linha de visão no impacto. Cliques repetidos não apagam a recuperação.
- A IA básica consulta o registro de jogadores. Slimes passivos reagem a impacto válido, perseguem o último atacante válido, atacam e retornam ao perder o alvo ou ultrapassar o leash. Isso é uma regra provisória de teste, não uma definição de ameaça para chefes.
- Monstros mortos têm HP zero, um único ciclo de morte e uma nova geração no respawn. O respawn mínimo de seis segundos aguarda origem livre. Personagens temporários voltam após quatro segundos, sem perda de itens. Comandos com geração antiga são ignorados.
- Cada sessão recebe ID e token aleatório do servidor. Reconectar com o token substitui a conexão anterior; eventos/comandos do socket antigo não possuem a entidade. Comandos possuem sequência crescente. Sessões desconectadas ficam recuperáveis por 60 segundos e depois expiram. Tokens permanecem apenas na memória do cliente; recarregar a página cria outra sessão após a saída da anterior.
- A apresentação interpola posições de jogadores com 100 ms de atraso. Não há predição/reconciliação local de movimento nesta entrega; a resposta em redes distantes poderá exigir essa evolução. HP e resultados são oficiais.
- Menus e perda de foco enviam interrupção de comandos. Não pausam o relógio do servidor. A campanha conserva sua pausa anterior.

## Saves e isolamento

O modo compartilhado é selecionado antes de criar `CharacterSave`; não abre IndexedDB. Equipamento e atributos temporários são definidos pelo servidor. Não existe chamada de recompensa local ou salvamento nesse modo.

O formato do save e a progressionVersion permanecem os mesmos. `CharacterSave.open` recusa progressões antigas com mensagem explicativa antes de qualquer escrita, em vez de executar a antiga rotina destrutiva. Saves atuais continuam sendo carregados; gravações normais da campanha mantêm transações, revisão e backup anterior. A função legada de decodificação ainda é coberta pelos testes históricos, mas sua ramificação de reset não é acessível ao abrir um perfil existente pelo jogo.

O perfil principal continua em `%APPDATA%\Dungeon Master`. `--test-profile=A` e `B` selecionam subpastas distintas de `%APPDATA%\Dungeon Master Tests` antes do bloqueio de instância única. O servidor de teste pode ser sobrescrito explicitamente apenas com perfil de teste. Nenhuma proteção de contexto, sandbox ou CSP foi desativada.

## Correções

1. `AreaSession.startRun` limpa as definições não seguras da run anterior após preparar os primeiros andares da nova run. Progresso individual não é alterado. Regressão reproduz a subida ao 4 em duas sementes e verifica nova definição/seed e progresso intacto.
2. Abertura de save antigo agora retorna erro e preserva bytes/revisão; o teste anterior que exigia reset automático foi atualizado para a exigência atual.
3. Separação de corpos aplicada a todos os jogadores e monstros do mapa evita que personagens permaneçam sobrepostos.

## Executar

Na raiz, com Node 22.12+ e dependências instaladas:

```powershell
npm ci
npm run server:install
npm run desktop:build
```

Em três terminais separados:

```powershell
# Servidor — 127.0.0.1:8787
npm run server:start
# Cliente A
npm run desktop:test:a
# Cliente B
npm run desktop:test:b
```

Ambos conectam automaticamente ao mapa compartilhado. Use os botões Desconectar/Conectar e Voltar à campanha. Dentro desses perfis, a campanha também usa os dados de teste, nunca o perfil principal.

Servidor remoto explícito:

```powershell
npx electron . --test-profile=A --server=wss://YOUR-DOMAIN/hub
npx electron . --test-profile=B --server=wss://YOUR-DOMAIN/hub
```

O host precisa executar este código 0.2.0. `ws://` remoto é recusado; somente loopback aceita WebSocket sem TLS. O Dockerfile agora inclui o domínio/simulação em `src`, necessário ao servidor. Deploy e build Docker não foram executados.

## Testes executados

- Suíte completa após a implementação: **504/504 passaram**, incluindo todos os 490 testes anteriores (um adaptado à nova política de saves).
- Após ajustar separação de corpos: **13/13 testes de domínio/regressão** passaram. Incluem um teste adicional; a suíte passou a conter 505 casos. Não foi repetida a campanha inteira após esse ajuste localizado.
- Transporte real: **2/2 testes** com clientes WebSocket verificam movimento, dano de ambos, entrada durante combate, snapshots iguais para o mesmo tick, morte, respawn, reconexão, ausência de duplicações e rejeição de dano inventado.
- Build Vite aprovado; aviso não bloqueante de bundle acima de 500 KB.
- Dois processos Electron reais: teclado/mouse, visibilidade recíproca, dano, morte/HP zero nos dois clientes, respawn com menu aberto, reconexão e zero bancos IndexedDB abertos. Retorno à campanha local também verificado em perfil isolado. Relatório persistido em [BETA-0.2.0-ELECTRON.json](BETA-0.2.0-ELECTRON.json); log da suíte em [BETA-0.2.0-TESTES.txt](BETA-0.2.0-TESTES.txt). Capturas em `.logs/world-probe/` e exemplos em `screenshots/beta020-shared-*.png`.

Comandos reproduzíveis:

```powershell
npm test
npm run test:world
npm run test:multiplayer
npm run desktop:build
node scripts/world-electron-probe.mjs
```

O probe inicia seu próprio servidor em porta livre, abre somente perfis de teste exclusivos e encerra seus processos ao terminar. Usa depuração loopback para enviar eventos reais à interface e salvar screenshots; não expõe esse mecanismo na build normal. O ambiente precisa permitir localhost, processos Electron e WebGL.

## Roteiro de playtest humano

1. Iniciar servidor e A/B pelos comandos acima; conferir Online e dois personagens.
2. Mover A e observar B; repetir invertendo, testar WASD, chão e colisão com a cobertura.
3. Selecionar o mesmo Slime em A/B; confirmar aproximação, dano e HP nos dois lados.
4. Abrir um menu em A durante o combate de B; o mundo deve continuar.
5. Esperar morte, sair da origem do Slime e observar respawn nos dois clientes.
6. Desconectar A durante combate e reconectar; nenhum personagem duplicado deve permanecer.
7. Abrir B quando A já estiver combatendo; B deve receber o HP atual.
8. Sair para a campanha do perfil de teste e verificar inventário, controles e acesso às profissões. O perfil principal não deve mudar.

## Arquivos

Criados: `shared/world.js`, `server/world.js`, `src/multiplayer/world-client.js`, `src/multiplayer/world-mode.js`, `desktop/test-profile.cjs`, `scripts/world-electron-probe.mjs`, `tests/world.test.js`, `tests/multiplayer-world.test.js`, `CHANGELOG.md`, este relatório e checklist desktop.

Modificados: `server/hub.js`, `server/package.json`, `server/package-lock.json`, `Dockerfile.multiplayer`, `desktop/main.cjs`, `desktop/LEIA-ME.txt`, `electron-builder.yml`, `src/main.js`, `src/style.css`, `src/simulation/areas.js`, `src/adapters/persistence/character-save.js`, `tests/iteration08.test.js`, `index.html`, `package.json`, `package-lock.json`, `README.md`, `RELATORIOS.md`. O diário era um arquivo preexistente ainda não rastreado pelo Git. Nenhum arquivo de `sources/` foi alterado.

## Pendências deliberadas

Sem migração de profissões/habilidades para o servidor, XP/loot compartilhados, contas, party, PvP, chefes públicos ou Torre pública. Sem persistência após reinício. Atributos e arma são de teste; o servidor não aceita o inventário do personagem real. A rotação de alvo é básica, sem threat table. Não há recuperação de sessão após reinício do servidor. Não foi realizado teste de carga ou rede degradada em WAN.

Próximos passos: playtest humano, deploy controlado de v2 com compatibilidade v1, medição de latência e só então planejamento da persistência e migração gradual da Torre. Essas próximas etapas não foram iniciadas.
