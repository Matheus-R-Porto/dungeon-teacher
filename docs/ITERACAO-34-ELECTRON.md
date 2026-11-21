# Iteração 34 — Electron real

3 processos preparados, perfis separados e uma máquina, usando TLS, login por senha e os recursos gráficos do jogo.

| Fase | Cliente | FPS médio | Quadro p95 ms | Tempo em tarefas renderer % | Heap JS MiB | Draw calls | Quadros combate | GPU |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01-cidade-clientes-reais | 1 | 49.7 | 27.00 | 94.96 | 23.3 | 419 | 0 | ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11) |
| 01-cidade-clientes-reais | 2 | 49.5 | 27.00 | 96.34 | 14.7 | 421 | 0 | ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11) |
| 01-cidade-clientes-reais | 3 | 50.6 | 28.00 | 95.60 | 25.1 | 422 | 0 | ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11) |
| 02-combate-lobo-branco | 1 | 83.3 | 16.60 | 99.18 | 24.7 | 90 | 1675 | ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11) |
| 02-combate-lobo-branco | 2 | 85.2 | 15.90 | 99.31 | 19.6 | 91 | 1719 | ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11) |
| 02-combate-lobo-branco | 3 | 86.8 | 16.20 | 99.14 | 24.3 | 82 | 1755 | ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11) |

## Limite gráfico encontrado

A tentativa com quatro personagens preparados/equipados falhou por tempo limite de preparação do quarto cliente (15 s), compartilhando CPU, GPU integrada e memória com os outros três neste computador. Não foi ampliado o prazo nem reduzida a qualidade para esconder essa falha. As tentativas e seus diagnósticos estão em `dados/iteracao34/electron-tentativas`. O ensaio de desempenho aprovado usa três clientes preparados; a regressão de quatro clientes básicos do ADM é um cenário diferente. Isso permanece como limite conhecido de abertura simultânea local, a conferir no hardware escolar.

Memória informada é heap JavaScript; não representa toda a RAM ou VRAM dos aplicativos. O indicador CDP usa a diferença de TaskDuration dividida pela diferença de Timestamp do próprio cliente. É uma medida de tempo em tarefas, não um contador de CPU do sistema operacional; também não inclui todo o trabalho de GPU, driver e processo principal. A leitura de clientes diferentes não compartilha um denominador de tempo. Os valores e timestamps brutos estão preservados no JSON. O JSON registra resolução/DPR, estado de visibilidade, disponibilidade de timer GPU e duração das etapas de renderização/efeitos/snapshots. Qualidade automática continua ativa; não foi forçada redução como otimização desta iteração.

## Verificações

- Lápide visual: morte provocada somente como fixture de teste no servidor, posição real, data e golpe final iguais em todos os clientes conectados
- 3 processos Electron com TLS, login real, perfis válidos, renderização e comandos de combate

## Regressão do ADM e do cliente da Iteração 33

- ADM real inicia servidor em processo separado e mostra zero vagas ocupadas
- Quatro processos Electron, quatro perfis, um servidor e um banco: cadastro, login, personagens e sincronização
- Segundo login rejeitado sem derrubar o cliente original
- Troca A → B → A entre perfis Electron separados conserva personagem e duas alterações reais de equipamento
- Kick pela interface confirma conta correta, mostra mensagem exata e permite novo login
- Backup pelo ADM, parada e reinício do mesmo banco preservam equipamento e progresso
- Recarregar a interface ADM não interrompe o processo servidor nem a sessão do aluno
- ADM encerra normalmente com código zero após gravar e parar o serviço

Os testes usam a compilação local atual. Não foram publicados nem substituídos os instaladores da Iteração 33.
