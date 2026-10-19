# Iteração 17 — Beta 0.2.1 — Fundação da Torre Compartilhada

Data: 13/10/2026. Beta experimental, não pronta para produção. Playtest humano pendente por indisponibilidade do responsável para jogar adequadamente via RustDesk.

## Entrega

Dois andares procedurais reais, gerados pelo módulo existente da campanha, agora podem ser ocupados por jogadores independentes no mesmo servidor. Cada andar possui população, alvos, HP, mortes, respawns e eventos próprios. A geografia é salva e reutilizada após reiniciar o servidor. Personagens, inventários e progresso online não são persistidos.

O Refúgio v1 e a arena de teste v2 da 0.2.0 continuam disponíveis no mesmo endpoint `/hub`. A Torre usa protocolo **v3**. O servidor não foi publicado no Render e não foi gerado instalador novo.

## Inspeção direcionada e reaproveitamento

Foram examinados `src/world/tower.js`, `floor-graph.js`, definições de biomas, navegação/colisões, portais de `AreaSession`/`InteractionSystem`, `SharedWorld`, protocolo v2 e integração gráfica Electron.

Não foi criado outro gerador. `sharedFloor` chama `generateFloor(seed, floor, ...)`, mantendo topologia, trilhas, obstáculos, biomas, sementes e posições de spawn. Um adaptador aplica somente a política do teste compartilhado: IDs com prefixo do andar, respawn, ausência de recompensas e portais liberados. O código do gerador e a campanha local não foram alterados nesta iteração.

## Arquitetura de múltiplas áreas

`startHub → SharedTower → Map<areaId, SharedWorld>`.

- `shared-floor-1` e `shared-floor-2` são identidades estáveis.
- Cada `SharedWorld` possui uma única simulação por andar, nunca uma por jogador.
- `SharedTower` coordena entrada, saída, reconexão, mudança de área e carregamento da geografia. A população dinâmica continua em `SharedWorld`.
- Andares são carregados sob demanda; um mapa já carregado não é regenerado por jogador.
- O mesmo relógio do servidor avança cada simulação; entidades e eventos são independentes. Snapshots são enviados somente aos presentes no respectivo andar.
- Monstros usam IDs com prefixo de área e geração de respawn. A IA só consulta jogadores do seu `SharedWorld`.
- Fórmulas de combate, ciclos de ataque, colisões, navegação, separação de corpos, câmera, sprites e renderização procedural existentes são reutilizados.

## Persistência geográfica

Local padrão: `data/shared-tower/floor-1.json` e `floor-2.json`, relativo ao diretório de trabalho do servidor. Pode ser alterado por `WORLD_DATA_DIR`. O diretório padrão é ignorado pelo Git e deve ter backup próprio.

Cada registro contém:

- schema `1`;
- identidade e número do andar;
- semente;
- versão `local-tower/0.1.5+shared-policy/1`;
- definição completa gerada;
- SHA-256 da definição.

Escolhemos armazenar a definição completa para não depender de executar o algoritmo novamente. Ao abrir um arquivo existente, conferimos versão, identidade, semente, hash, estrutura básica, spawns e portais. Dados ilegíveis, incompatíveis ou inconsistentes provocam erro; o arquivo não é substituído nem convertido. Versões futuras precisarão declarar compatibilidade ou oferecer uma migração explícita.

A escrita usa temporário exclusivo no mesmo diretório, `fsync`, publicação por hard link que não substitui um destino existente e remoção do temporário. Se dois escritores disputarem o destino, um vence e o outro lê/valida o registro já publicado. Não há janela em que o arquivo oficial contenha apenas parte do JSON. O filesystem precisa suportar hard links (NTFS/ext4, por exemplo). Filesystems incompatíveis falham explicitamente, sem fallback destrutivo. Isso não substitui backups nem promete resistência a toda falha física de disco.

O snapshot inclui definições de spawn, mas não HP, mortes, posições dinâmicas, sessões, contas ou inventários. A população é recriada ao reiniciar. Alterar a semente configurada não altera andares já gravados.

No Docker, o diretório foi preparado com permissão para o usuário `node`. Para sobreviver à troca de container, monte um volume persistente em `/app/data/shared-tower`. Docker/volume remoto não foram testados nesta entrega.

## Portais e política provisória

- No andar 1, seguir a trilha até o portal e pressionar **F** sobe ao 2.
- No andar 2, o portal de entrada permite descer ao 1; o portal no fim também retorna ao 1, pois o andar 3 compartilhado não faz parte desta versão.
- Não há exigência de abates, progresso individual ou party. Portões estão abertos para testar a infraestrutura; a interface identifica o acesso como experimental.
- O servidor reutiliza `InteractionSystem` para conferir identidade, distância e linha de visão do portal. Não aceita uma área de destino arbitrária enviada pelo cliente.
- O destino é carregado, validado e persistido antes de transferir o personagem. A transferência cancela movimento/ataque, remove a associação anterior, limpa alvos de monstros e cria posição de entrada válida no destino.
- Cada entrada/reconexão recebe um novo identificador de visita (`epoch`). Comandos v3 incluem área, visita e sequência. Comandos atrasados são ignorados mesmo após subir e voltar ao mesmo andar.
- Reconectar retoma a área da sessão temporária enquanto ela existir. Após reinício/expiração, o jogador começa no andar 1 com outro personagem temporário. Isso não altera seu personagem real.

## Compatibilidade e isolamento local

Protocolos v1, v2 e v3 coexistem no servidor. Um cliente v2 continua no mapa original, sem receber mensagens da Torre. Clientes v3 precisam do servidor 0.2.1; não devem ser direcionados ao antigo servidor público esperando suporte automático.

Os perfis Electron A/B agora abrem a Torre. `--legacy-world` abre a arena v2. O aplicativo normal continua abrindo a campanha, sem conexão obrigatória. IndexedDB, progressão individual, habilidades, inventário, profissões e NPCs da campanha permanecem locais. A proteção contra reset automático de saves antigos e a correção de andares entre runs da 0.2.0 foram preservadas.

## Como executar

Preparação, na raiz:

```powershell
npm ci
npm run server:install
npm run desktop:build
```

Em terminais separados:

```powershell
# Servidor local, porta 8787
npm run server:start
# Electron A — Torre v3
npm run desktop:test:a
# Electron B — Torre v3
npm run desktop:test:b
```

Geografia em outro diretório, no terminal do servidor:

```powershell
$env:WORLD_DATA_DIR = 'C:\DungeonMasterData\shared-tower'
npm run server:start
```

Usar a mesma pasta ao reiniciar preserva os mapas. Não apague os arquivos para corrigir erro de versão; preserve-os e investigue o diagnóstico.

Arena antiga, para compatibilidade:

```powershell
npx electron . --test-profile=LegacyA --legacy-world
npx electron . --test-profile=LegacyB --legacy-world
```

Servidor remoto explícito, já atualizado para 0.2.1:

```powershell
npx electron . --test-profile=A --server=wss://YOUR-DOMAIN/hub
npx electron . --test-profile=B --server=wss://YOUR-DOMAIN/hub
```

As restrições de segurança Electron permanecem: apenas o endpoint configurado, `ws` somente em loopback, sandbox e isolamento de contexto ativos. Nenhum servidor de depuração é habilitado pelos comandos normais.

## Testes executados

Suíte completa: **512/512 aprovados**, incluindo todos os testes anteriores. Após fortalecer a conferência da semente do arquivo, os **6/6 testes específicos de geografia/áreas** foram reexecutados com sucesso. Build Vite aprovado; permanece o aviso não bloqueante de bundle acima de 500 KB.

| Critério | Evidência executada |
|---|---|
| A — determinismo | Andares 1/2 repetidos com mesma seed; comparação com topologia/trilhas/obstáculos do gerador local. |
| B — persistência | Reabertura sem chamar o gerador; encerramento e reinício real de `startHub` com a mesma pasta e outra seed; hash, definição e bytes idênticos. |
| C — mesmo andar | Dois clientes WebSocket recebem definições iguais e presença recíproca; dois processos Electron renderizam ambos os andares. |
| D — andares diferentes | A no 2 e B no 1; snapshots, populações, eventos e personagens isolados; capturas de ambas as janelas. |
| E — transições | Subida/descida, posição válida, ausência de duplicação; comandos de área/visita antiga ignorados, inclusive após voltar ao andar original. |
| F — monstros | Ambos causam dano no mesmo monstro; HP zero e respawn recebidos pelos dois; alvos antigos limpos ao trocar de área. |
| G — reconexão | Retorno ao andar 2 sem duplicação; remoção tardia do socket antigo não afeta a conexão nova. |
| H — regressão | Suíte completa; inicialização gráfica da campanha em perfil isolado; testes de preservação de saves antigos; protocolos v1/v2 mantidos. |

Também foram verificados arquivo truncado, hash errado, versão futura, semente inconsistente e destino corrompido, sem substituição dos arquivos originais.

Validação gráfica automatizada: dois **processos Electron reais**, entrada de produção, perfis separados, WebGL normal e capturas inspecionadas. O cenário posiciona os personagens no servidor perto do primeiro encontro e dos portais para não repetir caminhadas longas; isso é preparação exclusiva do teste. Ataques, morte, transições com F e reconexão ocorrem pela interface e pela simulação normais. Não se injetam dano ou estado de transição. Não foi criado comando de teleporte acessível ao jogador.

Nenhum banco IndexedDB foi aberto pelos clientes compartilhados. Depois, o retorno à campanha foi validado em um desses perfis temporários. O perfil principal não foi aberto para testes.

Comandos:

```powershell
npm test
npm run test:tower
npm run test:tower:electron
# Compatibilidade gráfica da arena 0.2.0, se desejado:
node scripts/world-electron-probe.mjs
```

Evidências: `docs/ITERACAO-17-TESTES.txt`, `docs/ITERACAO-17-ELECTRON.json`, `screenshots/beta021-*.png`; capturas completas e geografia exclusiva do probe em `.logs/tower-probe/`.

## Arquivos desta iteração

Criados: `shared/tower.js`, `server/floor-store.js`, `server/tower.js`, `tests/tower-shared.test.js`, `tests/multiplayer-tower.test.js`, `scripts/tower-electron-scenario.mjs`, este relatório e evidências da Iteração 17.

Modificados: `.gitignore`, `Dockerfile.multiplayer`, `server/hub.js`, `server/world.js`, `src/multiplayer/world-client.js`, `src/multiplayer/world-mode.js`, `src/main.js`, `desktop/test-profile.cjs`, `scripts/world-electron-probe.mjs`, manifests/locks raiz e servidor, `electron-builder.yml`, `index.html`, README, changelog, diário e instruções/checklist desktop.

As alterações da 0.2.0 já existentes no workspace foram preservadas. Nenhum arquivo de `sources/` ou save real foi alterado. Não foram criados commits nem feito deploy.

## Limitações e riscos restantes

- Playtest humano **pendente**; não dependeu de participação do responsável nesta etapa.
- Não testados: dois computadores pela internet, rede degradada, carga elevada, build Docker, falha física de disco e instaladores.
- Somente andares 1/2, ataque básico com espada temporária e IA básica. Sem chefes, progressão individual online, recompensas, contas, party ou profissões compartilhadas.
- Profissões podem ter elementos ambientais visíveis do gerador, mas não podem ser realizadas online nesta versão.
- Geração/leitura inicial é síncrona e pode atrasar o tick brevemente. Escala maior exigirá medir custo e considerar workers/carregamento antecipado.
- Filesystem com hard links e volume persistente são requisitos operacionais. Erro de geografia bloqueia seu carregamento; não há ferramenta de reparo/migração automática.
- A visita usa epoch próprio, mas não existe persistência/reconciliação de sessão após reinício do processo. HP e monstros são recriados.
- Portais livres e retorno do final do andar 2 ao 1 são política provisória, não regra definitiva do GDD.
- A apresentação ainda usa interpolação sem predição local; latência WAN pode exigir evolução.

Próximos passos recomendados: playtest humano quando viável, deploy controlado com volume e backup, medir latência/custo de geração e só então decidir acesso/progressão individual e persistência de personagens. Não foram iniciados nesta entrega.
