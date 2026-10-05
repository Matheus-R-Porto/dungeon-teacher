# Servidor do Refúgio — Multiplayer 01

Este é um serviço separado dos dois jogadores. Nenhum dos PCs do playtest precisa hospedar a sala. O serviço só mantém presença transitória e não recebe saves.

## Desenvolvimento

Na raiz do projeto, com Node 22.12 ou posterior:

```powershell
npm run server:install
npm run server:start
```

O servidor fica em `127.0.0.1:8787`, WebSocket `/hub`, verificação HTTP `/health`. Em outro terminal do desenvolvedor:

```powershell
npm run multiplayer:configure -- ws://127.0.0.1:8787/hub
npm run dev
```

Essa configuração é exclusivamente local. Ela não serve para distribuir a dois computadores.

## Hospedagem pública com TLS

Opção concreta: um Web Service Node no Render. Não foi criado um serviço remoto nesta entrega; falta uma conta/projeto de hospedagem fornecido pelo responsável. Não há credenciais embutidas nem URL pública inventada.

1. Disponibilize no seu repositório Git as pastas `server` e `shared`, incluindo `server/package-lock.json`. Não envie `node_modules`, saves ou artefatos desktop.
2. No painel Render, escolha **New → Web Service**, conecte esse repositório e selecione a versão que contém Multiplayer 01.
3. Use runtime **Node**, Root Directory vazio, Build Command `npm ci --prefix server --omit=dev --ignore-scripts`, Start Command `node server/index.js`.
4. Configure `HOST=0.0.0.0`, `ALLOWED_ORIGINS=dungeon://game`, `ROOM_CAPACITY=16`. Use a variável `PORT` fornecida pelo serviço. Health Check Path: `/health`.
5. Mantenha **uma única instância**. O estado está em memória; múltiplas réplicas formariam salas diferentes. Escolha o plano na sua conta antes de contratar; não foi contratada infraestrutura por este projeto.
6. Faça o deploy. Anote o endereço HTTPS atribuído pelo painel e abra seu caminho `/health`: deve responder `ok:true` e `protocolVersion:1`.
7. O endpoint dos clientes é o mesmo domínio, com `wss://` e caminho `/hub`. Por exemplo, se o painel atribuiu `https://NOME-REAL.onrender.com`, use `wss://NOME-REAL.onrender.com/hub`. NOME-REAL é um marcador, não um servidor existente.
8. Envie esse endereço público ao responsável pela build. Na máquina de desenvolvimento ele executa:

```powershell
npm run multiplayer:configure -- wss://NOME-REAL.onrender.com/hub
npm test
npm run desktop:package
```

9. Distribua o **mesmo novo Setup** gerado depois dessa configuração aos dois PCs. Os jogadores não editam configuração, código ou ASAR; apenas escolhem um nome e clicam Conectar.

O endpoint entra no renderer e na allowlist/CSP desktop pela mesma configuração central. Não aceitar certificados inválidos, não desativar firewall/antivírus e não usar `ws://` público. Render termina TLS e suporta upgrade WebSocket na mesma porta do serviço. Planos com suspensão por inatividade podem atrasar a primeira conexão; o cliente tenta novamente até conectar.

Alternativa para infraestrutura já existente: `docker build -f Dockerfile.multiplayer -t dungeon-hub .`, executar o container em um servidor dedicado e encaminhar **somente** `/hub` (com upgrade WebSocket) e `/health` pelo proxy HTTPS/TLS desse servidor. A porta interna é 8787; publicar apenas a entrada HTTPS necessária. Não usar o PC de um jogador como host.

## Configuração e operação

| Variável | Padrão | Função |
|---|---|---|
| HOST | 127.0.0.1 | Interface; hospedagem usa 0.0.0.0 |
| PORT | 8787 | Porta HTTP e WebSocket |
| ALLOWED_ORIGINS | dungeon://game e origens Vite locais | Lista exata separada por vírgulas; produção só dungeon://game |
| ROOM_CAPACITY | 16 | De 2 a 32 presenças |
| MAX_CONNECTIONS | 64 | Conexões totais, incluindo handshakes |
| MAX_CONNECTIONS_PER_IP | 8 | Conexões por endereço do socket |
| MAX_MESSAGES_PER_SECOND | 45 | Limite token bucket; cliente envia até 15 estados/s |
| HEARTBEAT_MS | 10000 | Ping de transporte; remoção em até ~20 s sem pong |

Atrás de proxy o limite por IP pode agrupar usuários. Não confiar automaticamente em X-Forwarded-For. Para um playtest de dois PCs o padrão comporta os dois; ajuste o limite conscientemente para um grupo maior. A origem é uma defesa de navegador, não autenticação. UUID não é credencial: esta versão não tem contas, proteção contra personificação ou autoridade de save.

Payload máximo 8 KiB; hello em até 5 s; limites de posição ±12 e orientação ±π. JSON, tipos, nomes e campos extras são validados. Upgrade limitado a 20 tentativas por 10 s por socket-IP, com memória limitada. Logs contêm eventos, id temporário e contagens, sem inventário ou save. SIGINT/SIGTERM encerra o serviço; após reinício os clientes refazem hello e snapshot.

Referências oficiais consultadas: [ws](https://github.com/websockets/ws), [Web Services](https://render.com/docs/web-services), [WebSocket no Render](https://render.com/docs/websocket).
