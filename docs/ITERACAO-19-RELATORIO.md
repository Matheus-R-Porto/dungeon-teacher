# Iteração 19 — Beta 0.3.0

Primeiro loop social multiplayer: identidade online, party, chats, combate cooperativo, XP, coleta manual, inventário e continuidade após reinício. Beta experimental para testes controlados, sem deploy, publicação, commit ou instalador nesta entrega. Playtest humano pendente (RustDesk).

## Referências e escopo

Continuidade da Beta 0.2.2 e do prompt autorizado da Iteração 19. O GDD fornecido (`Dungeon_Master_GDD_estado_atual.md`, 13/10/2026) se identifica como reconstrução consolidada, não como cópia literal do original. Foram respeitadas suas regras explícitas pertinentes ao escopo: seis integrantes, diferença de 20 níveis na entrada, 5% de contribuição individual, loot manual e individual, duração de cinco minutos, mundo público e bloqueio de expulsão em combate de chefe/mini-chefe. Regras pendentes não foram tratadas como aprovadas.

Amigos, mensagens privadas e histórico persistente ficam explicitamente pendentes. Não foram implementados chefes, profissões, mercado, trocas, correio, classes, PvP ou Hubs novos.

## Identidade e persistência

O protocolo **v4** separa a identidade durável da sessão WebSocket temporária e adiciona mensagens sociais e dados privados. O endpoint continua `/hub`. Protocolos v1 (Refúgio), v2 (arena) e v3 (Torre temporária) continuam disponíveis. Todos os personagens v4 compartilham a mesma simulação pública por andar, independentemente da party. O v3 permanece um ambiente legado de teste, separado da simulação dos personagens persistentes; não mistura personagens temporários com recompensas online.

Cada perfil Electron cria uma credencial aleatória de 256 bits por endpoint. O processo principal grava somente sua forma criptografada pelo `safeStorage` do sistema operacional, em arquivo separado do save local, com escrita exclusiva e fsync. Não há fallback em texto puro. O IPC é específico e aceita somente a janela/frame principal confiável. A credencial passa pela memória do cliente para autenticar via WebSocket; não aparece na interface, chat ou logs. Conexões remotas exigem WSS pelas regras já existentes do Electron; WS é reservado a loopback.

No servidor, a credencial é identificada somente pelo SHA-256. Nome não autentica ninguém: o nome salvo na criação não pode ser substituído por um novo hello. Dois perfis têm identidades diferentes. Uma nova conexão autenticada substitui a anterior; o socket antigo deixa de controlar o personagem.

`OnlineStore` usa SQLite nativo do Node, WAL e `synchronous=FULL`, schema versionado, verificação de integridade e checksum do documento de personagem. Requer Node >=22.13; ambiente validado com Node 24. Sem banco remoto. `Character`, fórmulas de stats, `gainXP`, pontos de atributo e `Inventory` são os módulos existentes da campanha.

Gravações de recompensas são transacionais: registro único da morte + XP dos beneficiários + drops individuais entram na mesma transação. Coleta remove o drop e grava o inventário numa única transação. Estado do personagem é aplicado em memória após o commit dessas operações. HP alterado pela simulação é salvo no tick; transições e saída também salvam. Falha de persistência durante simulação interrompe o modo online, evitando continuar anunciando progresso sem gravação.

Persistem: identidade, nome, Base Level, Base XP, atributos/pontos, HP/MP, inventário/equipamento, andar atual e maior andar alcançado. Ao retornar, o personagem aparece na entrada válida do andar salvo; a posição exata não é persistida. Geografia continua independente, sem regeneração dos 12 mapas existentes. Populações de monstros são recriadas ao reiniciar, conforme as versões anteriores.

### Armazenamento e backup

- Geografia: `data/shared-tower/` ou `WORLD_DATA_DIR`.
- Personagens/drops: `data/online/characters.sqlite` ou `CHARACTER_DATA_DIR`.
- Credenciais locais: arquivos `online-<hash do endpoint>.key` no perfil Electron, sem tokens em nome de arquivo.
- Diretórios de dados estão ignorados pelo Git.
- Docker foi configurado para diretório online gravável, mas não foi executado. Montar volumes persistentes para ambos os diretórios.
- Para backup simples consistente, encerrar o servidor e copiar o diretório online inteiro, incluindo eventuais arquivos WAL/SHM, além da geografia. Não copiar apenas o `.sqlite` enquanto o servidor está escrevendo.
- A credencial depende da conta/sistema operacional e do endpoint. Sem recuperação de conta, exportação, revogação administrativa ou sincronização entre computadores nesta beta. Perder o perfil/chave impede recuperar o personagem por esta interface; nome não substitui a chave.

## Party

Criar, convidar, aceitar, recusar, cancelar, expirar, sair, expulsar e transferir liderança estão disponíveis na interface. Convites duram 60 s; há limite de pendências e intervalo de 3 s para repetir convite ao mesmo jogador. Validação é feita novamente no aceite: grupo existente, líder atual, membro único, seis integrantes e diferença máxima de 20 níveis. Evolução posterior não dissolve grupos.

Saída voluntária é permitida. Expulsão é bloqueada se algum integrante estiver envolvido com chefe/mini-chefe; combate comum não bloqueia expulsão. Esses chefes ainda não existem no conteúdo online, e a proteção foi testada com fixture. Nenhuma operação social teletransporta personagens, cria instância privada ou altera acesso ao andar.

Na desconexão do líder, assume o primeiro integrante online na ordem de entrada; se ninguém estiver online, mantém-se o líder. Convites da liderança anterior são invalidados. A lista mostra líder, nível, HP e online/offline. Party persiste durante desconexões dentro do processo, inclusive além da janela temporária de reconexão. **Party e convites não persistem após reinício do servidor**; personagens e progresso persistem.

## XP cooperativa

Valores de XP reutilizam `EXPEDITION.xp` e a escala `POST_THREE.xp`. Não foi criada outra curva de níveis. XP é progresso, nunca moeda. Level up concede os pontos existentes. A interface permite gastar um ponto por vez na entrada do andar, fora de combate, sem custo em XP/ouro. Essa localização é uma adaptação experimental de acesso seguro; não altera a campanha.

Política provisória configurável em `shared/online.js`:

1. Conta-se dano efetivo, sem excesso após HP zero; é necessário ao menos um contribuinte com 5% do HP máximo por unidade de recompensa (solo ou party).
2. O primeiro impacto de cada contribuinte registra seu grupo; o primeiro impacto do grupo registra a lista de integrantes. Entrantes posteriores não ganham retroativamente aquela participação. Sair/ser expulso perde o compartilhamento daquele grupo.
3. Elegíveis precisam estar conectados, vivos, no mesmo andar e a até **12 unidades** do monstro na morte. Na party, devem constar da lista registrada e continuar no grupo. O raio supera os leashes comuns existentes (6,5–9 unidades) para permitir apoio próximo; ainda exige balanceamento humano.
4. Cada unidade recebe a fração da XP-base proporcional ao dano de seus contribuintes sobre o dano total registrado. A parte de participantes inelegíveis não é redistribuída a outros grupos.
5. Para party, aplica-se **10% por integrante elegível adicional**, até 50% com seis. Divide-se o total inteiro igualmente; sobras de uma unidade seguem a ordem estável dos IDs. Solo não recebe bônus. Um aliado próximo pode compartilhar sem atacar; morto, distante, desconectado ou em outro andar não recebe.
6. Registro único de morte impede repetir distribuição; leash invalida a contribuição do combate abandonado. O servidor controla a geração do monstro e a identidade do evento.

Fórmula: `pool = floor(XPbase × danoGrupo/danoTotal × (1 + 0,10 × (elegíveis−1)))`, com multiplicador 1 para solo. Exemplo: monstro de 12 XP, party com dois elegíveis e todo o dano: pool 13, dividido em 7/6. Fórmula/raio/bônus são provisórios; o GDD consolidado não fixa esses números.

## Recompensas e interface

Cada beneficiário elegível recebe um drop privado de **1 Minério Bruto**, item existente, como tabela mínima de teste configurável. Isso não pretende definir a tabela final de loot dos Slimes. XP entra imediatamente; o item fica no mundo e exige clicar em **Coletar Minério Bruto**, próximo ao drop (2,6 unidades), vivo e com linha de visão. Inventário cheio impede coleta sem consumir a recompensa. Quantidades/stacks/capacidade usam as validações existentes.

Somente o dono recebe o drop em seu snapshot e pode coletá-lo. Expiração de cinco minutos usa relógio real, inclusive offline/reinício. Coleta repetida ou de outro dono é rejeitada. Até 64 drops pendentes por personagem; ao atingir esse limite, mortes continuam concedendo XP, mas não criam novos drops até liberar espaço/expirar. Sem descarte ou trocas nesta versão.

Painel integrado: nome, nível, barra de XP, maior andar, inventário, atributos, party, convites, liderança e chats. Drops têm botão no mundo. HP, conexão, controles e andar atual permanecem na interface existente. F mantém os portais experimentais livres. Entrada em campos de texto interrompe movimento e evita atalhos de combate durante digitação.

Global entrega mensagens aos personagens v4 conectados em qualquer andar; party entrega apenas aos integrantes atuais. Conteúdo é exibido como texto, sem HTML. Máximo de 240 caracteres, sem controles, uma mensagem por segundo por identidade, além do limite geral de mensagens/payload. Nome/remetente são definidos pelo servidor. O cliente não escolhe ID de party nem destinatários privados. Histórico é somente o buffer local de 60 mensagens da sessão, sem persistência.

## Executar

Preparar: `npm run desktop:build`. Em terminais separados:

```powershell
npm run server:start
npm run desktop:test:a
npm run desktop:test:b
```

A/B agora usam o modo persistente v4 e continuam em perfis separados. A campanha local abre normalmente; o botão de Torre compartilhada no Electron entra no modo persistente. No navegador, o modo temporário v3 permanece disponível; credenciais persistentes exigem o cliente desktop nesta versão.

Legados: `npm run desktop:test:temporary` (v3) e `npm run desktop:test:legacy` (v2).

```powershell
npm run test:online
npm run test:online:electron
npm run test:tower
npm run test:multiplayer
npm test
npm run build
```

## Validação e evidências

**Resultados:** suíte completa com 526/526 aprovados, zero falhas, aproximadamente 133 s; execução focada final com nove testes aprovados (inclui um caso novo posterior à suíte completa). Build 0.3.0 aprovado, 89 módulos, com aviso preexistente de chunk >500 kB. Dois processos Electron concluíram o cenário, zero exceções reportadas. Capturas de convite e inventário foram inspecionadas. Retorno à campanha em perfil isolado passou; nenhum IndexedDB foi aberto pelo modo compartilhado. Os testes específicos incluem:

- Loop WebSocket real: party, chats, ataques, XP até level up, coleta, atributos, avanço, desconexão, reinício do servidor e comparação dos personagens.
- Sete conexões reais: seis integrantes, rejeição do sétimo e isolamento de chat.
- Party: recusa/cancelamento/expiração, limite de nível, liderança, offline, expulsão e saída sem teleporte.
- XP: aliado próximo sem atacar, distante, morto, offline, outro andar, solo abaixo de 5%, parties concorrentes, evento duplicado e entrada/saída durante combate.
- Loot privado/manual, inventário cheio, coleta duplicada, expiração e drop ainda não coletado após reabrir o banco.
- Credenciais por endpoint, criptografia e recusa de fallback em texto puro; sessão concorrente e comandos antigos.
- SQLite: rollback e commit preservado após saída abrupta de subprocesso, além de checksum inválido.
- Dois processos Electron reais com perfis temporários e armazenamento protegido pelo sistema operacional; captura da interface social, XP, inventário, portais e reconexão.

Fixtures posicionam personagens perto de portais/monstros para evitar caminhadas repetidas. O teste de nível acelera ticks da simulação; ataques, dano, XP, drops e coleta usam o código real. Não injeta XP, itens ou dano. Os testes unitários de elegibilidade usam estados controlados para cobrir combinações. Automação não equivale a playtest humano.

Durante validação foram corrigidas esperas do teste por snapshots/atualizações da interface e um defeito real do botão de coleta: a regra visual genérica de botão pressionado deslocava o alvo antes de soltar o mouse. O botão agora mantém sua posição ao clicar.

## Arquivos desta iteração

Novos: `shared/online.js`, `server/online-store.js`, `server/online-tower.js`, `server/parties.js`, `desktop/online-identity.cjs`, `src/multiplayer/online-ui.js`, `tests/online.test.js`, `tests/multiplayer-online.test.js`, `scripts/online-electron-scenario.mjs`, relatório e evidências.

Alterados: `server/hub.js`, `src/multiplayer/world-client.js`, `src/multiplayer/world-mode.js`, `src/main.js`, `src/style.css`, `desktop/main.cjs`, `desktop/preload.cjs`, `desktop/test-profile.cjs`, `scripts/world-electron-probe.mjs`, `.gitignore`, Dockerfile, versões/manifests/locks, `electron-builder.yml`, `index.html`, README, changelog, diário e instruções desktop.

Alterações preexistentes foram preservadas. Não houve edição de `sources/`, do GDD fornecido, de saves reais ou das regras da campanha local.

## Limitações e riscos

- Playtest humano, internet entre computadores, rede degradada, carga elevada, Docker e instaladores não validados.
- Dados geográficos e SQLite exigem volumes persistentes e backup. Apenas um processo servidor deve controlar este banco/mundo; não é infraestrutura distribuída.
- SQLite e geração são síncronos. Gravações de HP/progresso podem limitar escala; precisa medir em carga antes de produção.
- Sessões/offline e grupos conhecidos ficam em memória durante o processo; sem política completa de eviction/contas públicas. Credenciais bearer não substituem uma plataforma definitiva de contas.
- Sem recuperação/revogação de credenciais, moderação completa, bloqueio social, amigos ou privadas. Não abrir como serviço público irrestrito.
- Curva existente mantém limite técnico de nível 100; a evolução ilimitada do GDD fica pendente. Job/skills existentes no documento do personagem não são oferecidos como sistemas online.
- Retorno automático após morte permanece experimental, herdado do protótipo. Corpo aguardando escolha, ressurreição e último Hub individual ainda não foram implementados online.
- Sem garantia contra falha física de disco; teste de saída abrupta não simula perda elétrica. Relógio do servidor influencia duração real de drops/convites.
- O loot mínimo de minério, bônus/raio de XP e balanceamento da espada precisam de playtest.

Próximos passos recomendados: playtest do loop com dois computadores, backup/volume e autenticação operacional, depois revisar morte/Hubs e balanceamento. Não foram iniciados sistemas de iterações futuras.

## Evidências

- [Suíte completa](ITERACAO-19-TESTES.txt)
- [Testes online e integração](ITERACAO-19-ONLINE.txt)
- [Revisão focada final](ITERACAO-19-FOCUSED.txt)
- [Build](ITERACAO-19-BUILD.txt)
- [Electron](ITERACAO-19-ELECTRON.json)
- [Convite](../screenshots/beta030-invitation.png)
- [Inventário](../screenshots/beta030-inventory.png)
- [Chat entre andares](../screenshots/beta030-chat.png)
