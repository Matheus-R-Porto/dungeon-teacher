# Dungeon Master — Multiplayer 01.1

Entrega de 05/10/2026. **Build pronta para playtest Multiplayer 01 em dois PCs.**

## 1. Auditoria inicial

A base já possuía cliente de presença, servidor separado, integração com o Refúgio, proteção de rede no Electron e pipeline Windows. Antes das alterações, a suíte completa passou: **361 testes, zero falhas**. Evidência: [baseline](MULTIPLAYER-01.1-BASELINE.txt). Os saves existentes foram preservados. As pastas de builds anteriores foram mantidas.

## 2. Configuração multiplayer

`config/multiplayer.json` centraliza o endpoint `wss://dungeon-master-hub-u40z.onrender.com/hub` e a identificação `Multiplayer01.1`. A versão do aplicativo é 0.1.1; a versão Windows configurada é 0.1.1.1. O jogador só precisa abrir Multiplayer, escolher um nome e conectar. Não precisa informar IP, URL ou porta. O endpoint está incluído no pacote distribuído.

## 3. Servidor público

O servidor Render fornecido pelo responsável respondeu em HTTPS com `{"ok":true,"protocolVersion":1,"room":"hub-01","players":0}`. O WebSocket público aceitou dois clientes simultâneos. A consulta posterior ao primeiro teste retornou novamente zero jogadores. Não houve novo deploy nem alteração de configuração remota nesta entrega. A capacidade informada de 16 foi preservada; não foi realizado teste de carga ou inspeção do painel Render.

## 4. Electron / CSP / segurança

Permanecem `contextIsolation:true`, `nodeIntegration:false`, `sandbox:true` e `webSecurity:true`. A CSP e a restrição de rede permitem somente o endpoint WebSocket configurado; não foi liberado acesso geral à internet. Testes rejeitam outro host, outra rota, WebSocket local e o próprio HTTPS de health dentro do aplicativo. A consulta de health foi externa ao jogo. TLS não foi desativado e certificados não foram ignorados. O protocolo multiplayer continua na versão 1.

## 5. Origin

O teste de integração usou Chromium/Electron real, com esquema seguro `dungeon`, e observou o cabeçalho enviado: **`Origin: dungeon://game`**. Não houve substituição artificial desse cabeçalho. A segunda execução carregou o handler de assets, as regras de rede e a configuração do `app.asar` final; o servidor aceitou a conexão. Isso valida o transporte sob essas regras de produção. Não equivale à interação manual com a janela completa do jogo instalado. [Resultado registrado](MULTIPLAYER-01.1-PUBLIC-PROBE.json).

## 6. Cold start e reconexão

A tentativa inicial tolera até 90 segundos, com mensagem explicando que o servidor pode levar cerca de um minuto para iniciar. O modo individual continua disponível. Uma conexão já estabelecida mantém o timeout de 16 segundos para detectar perda. O backoff existente de 2, 4, 8 e no máximo 10 segundos foi preservado. Testes simulados verificam espera de 60 segundos e retomada após o limite, sem confundir cold start com conexão online perdida. O servidor estava disponível durante o teste público; não foi forçado a dormir para medir um cold start real.

## 7. Multiplayer automatizado

Dois clientes reais `HubClient` rodaram em um renderer Electron isolado, com identidades temporárias. Foram aprovados handshake/hello, entrada tardia, snapshot, presença, estado A→B e B→A com orientação, ping/pong, remoção após desconexão, reconexão e novo snapshot. A chamada de saída do Refúgio removeu a presença, e o retorno reinscreveu o cliente. Essas chamadas simulam a transição de domínio da Torre; não representam uma run visual. Nenhum save do usuário foi usado pelo probe.

Na execução com módulos do ASAR final, o teste levou 8.322 ms e registrou ping de 146/152 ms. Esses valores são uma amostra, não uma garantia de latência em outros computadores ou redes.

## 8. Regressão

A suíte final passou com **364 testes, zero falhas, zero ignorados** em 82,3 segundos. Os 361 testes anteriores continuam passando; foram acrescentados três casos de configuração pública e timeout. A lógica de gameplay, progressão, inventário, Cooking, Fishing e persistência não foi alterada nesta integração. Essa evidência automatizada não substitui a inspeção visual desses sistemas na instalação final. Não foi repetida a campanha completa.

## 9. Build web

`npm run build` concluído com sucesso: 72 módulos, bundle JavaScript de 751,26 kB (205,55 kB gzip), CSS de 25,52 kB. Persiste o aviso de chunk acima de 500 kB; não houve erro. [Log](MULTIPLAYER-01.1-BUILD-WEB.txt).

## 10. Build desktop

`npm run desktop:package:playtest` terminou com código zero e gerou Windows x64 com Electron 44.5.1 e electron-builder 26.15.3. O processo verifica a configuração pública antes do empacotamento. Setup NSIS e Portable foram produzidos no diretório de staging `release/multiplayer-01-1-build`, separados dos artefatos anteriores. [Log](MULTIPLAYER-01.1-BUILD-DESKTOP.txt).

## 11. Instalador atualizado

O novo Setup é `DungeonMaster-Beta-0.1.1-Multiplayer01.1-Setup.exe`. App ID e perfil `%APPDATA%\Dungeon Master` permanecem estáveis. Setup e Portable compartilham o perfil do mesmo usuário Windows; cada PC mantém seu próprio save. O servidor não recebe inventário, ouro ou progressão. Nenhum save foi apagado nesta entrega. A instalação, atualização sobre a versão anterior e abertura pelo atalho ainda precisam ser verificadas manualmente. O executável é **não assinado**, confirmado pela verificação de assinatura do Windows.

## 12. Artefatos

A pasta final é `release/multiplayer-01-playtest/`. Contém apenas Setup, Portable, LEIA-ME, roteiro de teste, checklist e manifesto de integridade. Não contém node_modules, unpacked, blockmap ou arquivos de depuração.

| Arquivo | Bytes | SHA-256 |
|---|---:|---|
| DungeonMaster-Beta-0.1.1-Multiplayer01.1-Setup.exe | 111492469 | F72FF16AD9FB836542FA6F45BF357F128176F9D33371AC1A42390746544F2C08 |
| DungeonMaster-Beta-0.1.1-Multiplayer01.1-Portable.exe | 111262389 | 513E33E7AEAEC6440CA7730AE6A84F151483696F14D6490B059EF677ECB65DF9 |
| CHECKLIST-MULTIPLAYER-01.txt | 1006 | 36DE1DE14DA3DF37E9A6DC66BA8BB2A5C3332C14F9F06B31C45C0D8EFA423E4F |
| LEIA-ME.txt | 3001 | 347C3496A64A9C0EAD80A2CDFBF2B1470A40B8AE6681B68844E34EF8A0641A4B |
| TESTE-MULTIPLAYER-01.txt | 1841 | 66A0604C2357F021DDBD1EDE59958DF8760BC9B9C5DB6975614E12B0884150FE |

[Manifesto com caminhos completos](../release/multiplayer-01-playtest/ARTEFATOS.txt).

## 13. ARQUIVO PARA OS DOIS PCs

**ENVIE EXATAMENTE ESTE MESMO ARQUIVO PARA OS DOIS PCs:**

`C:\Users\theuz\.codex\.chatgpt-projects\g-p-6ab572bee00c8191a99fc6be7aeb7536\release\multiplayer-01-playtest\DungeonMaster-Beta-0.1.1-Multiplayer01.1-Setup.exe`

Não é necessário gerar uma build para cada PC. O Portable é uma alternativa; para o primeiro teste, use o Setup acima em ambos.

## 14. Testes executados automaticamente

- Baseline completa: 361/361.
- Suíte final: 364/364. [Log](MULTIPLAYER-01.1-TESTES.txt).
- Health HTTPS público e resposta de protocolo/sala.
- Dois clientes contra o servidor público, primeiro com módulos do projeto e depois com configuração/segurança carregadas do ASAR final.
- Origin observado no Chromium real, TLS, presença bidirecional, orientação, ping, desconexão e reconexão.
- Transição de presença via chamadas de saída/retorno ao Refúgio.
- Build web, empacotamento desktop e hashes dos arquivos finais.

O probe é reproduzível com `npm run test:public-hub`. Para validar os módulos empacotados, passe o caminho `release/multiplayer-01-1-build/win-unpacked/resources/app.asar` como argumento ao script Electron. Esse teste faz conexões temporárias no serviço público.

## 15. Testes manuais executados

**Não foi concluída validação manual da interface nativa nesta entrega.** O serviço de automação de janelas estava indisponível (`Trusted RPC service is not configured: sky`), e havia uma instância anterior do jogo aberta; ela não foi encerrada à força. Também não foi concluído um novo smoke test visual pelo navegador. Não declarar como executados: instalação interativa, clique em Conectar na build final, animação visual, Fishing/Cooking pela interface, fechamento e reabertura com save.

## 16. Testes que EU ainda preciso executar

Use o [checklist fornecido](../release/multiplayer-01-playtest/CHECKLIST-MULTIPLAYER-01.txt): instalar o mesmo Setup nos PCs A e B, abrir/carregar personagens, conectar, confirmar que ambos se veem, mover simultaneamente e observar direção/animação. Testar entrada tardia, saída, reconexão, ida e retorno da Torre e preservação do save após fechar/reabrir. Fazer uma verificação representativa de inventário, equipamentos, habilidades, combate, Fishing e Cooking. Registrar tempo de conexão, problemas e passos de reprodução.

Antes de instalar/abrir a versão nova no PC atual, feche normalmente a versão antiga para que a proteção de instância única não apenas traga a janela antiga para frente.

## 17. Limitações conhecidas

O teste entre dois computadores reais ainda não aconteceu. O teste automatizado usa dois clientes em uma máquina, sem validar renderização remota visual. Cold start real não foi cronometrado. Instalador sem assinatura pode gerar aviso do Windows. O servidor gratuito pode suspender por inatividade; o estado é transitório. O endpoint público foi preparado para o Origin desktop; abrir a versão web local não equivale a testar essa distribuição. Não houve teste de 35 jogadores. Não há Party, Torre multiplayer, autenticação ou backend de saves.

## 18. Próximo passo recomendado

Instalar **o mesmo Setup** nos dois PCs e preencher o checklist. A entrega termina aqui, aguardando o resultado desse playtest. Não foi iniciada outra iteração.
