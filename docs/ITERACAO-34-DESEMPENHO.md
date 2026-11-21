# Iteração 34 — desempenho medido

Computador: Windows 11 Home Single Language; AMD Ryzen 5 6600H with Radeon Graphics         ; 12 processadores lógicos; 7.2 GiB RAM; Node v24.19.0; Electron 44.5.1; Vite 8.3.1. Todos os clientes e servidor neste computador.

## Referência original

| Clientes | Tick médio ms | Maior p95 de janela ms | Tick máximo ms | CPU média %/núcleo | RSS máximo MiB | Comando→snapshot p95 ms | Mensagens recebidas | Mensagens enviadas | JSON enviado MiB | Erros | Quedas | Reconectados | Aprovado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 3.66 | 13.66 | 15.13 | 8.61 | 110.8 | 138.23 | 458 | 3788 | 58.5 | 0 | 0 | 4 | True |
| 8 | 4.56 | 105.51 | 105.51 | 11.53 | 151.9 | 124.84 | 916 | 7625 | 148.8 | 0 | 0 | 8 | True |
| 16 | 6.86 | 125.16 | 125.16 | 22.11 | 222.3 | 138.09 | 1669 | 15117 | 433.1 | 0 | 0 | 16 | True |
| 24 | 9.76 | 225.93 | 225.93 | 32.28 | 236.1 | 141.62 | 2530 | 22696 | 866.5 | 0 | 0 | 24 | True |
| 32 | 8.71 | 125.84 | 368.61 | 32.00 | 238.4 | 156.38 | 3082 | 18696 | 815.0 | 0 | 32 | 32 | False |

## Filas e snapshots corrigidos, mesmo combate original

| Clientes | Tick médio ms | Maior p95 de janela ms | Tick máximo ms | CPU média %/núcleo | RSS máximo MiB | Comando→snapshot p95 ms | Mensagens recebidas | Mensagens enviadas | JSON enviado MiB | Erros | Quedas | Reconectados | Aprovado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 3.58 | 15.15 | 15.15 | 8.17 | 103.6 | 139.26 | 430 | 3770 | 58.5 | 0 | 0 | 4 | True |
| 8 | 4.55 | 97.60 | 102.23 | 11.73 | 156.9 | 125.46 | 875 | 7576 | 150.3 | 0 | 0 | 8 | True |
| 16 | 6.68 | 152.40 | 152.40 | 21.96 | 217.3 | 128.37 | 1789 | 15297 | 447.2 | 0 | 0 | 16 | True |
| 24 | 9.15 | 40.38 | 240.59 | 33.36 | 235.3 | 141.69 | 2501 | 22556 | 865.9 | 0 | 0 | 24 | True |
| 32 | 12.00 | 149.51 | 368.90 | 44.99 | 245.1 | 170.16 | 3391 | 29814 | 1376.9 | 0 | 0 | 32 | True |

## Configuração final: habilidades desbloqueadas e chefes ajustados

| Clientes | Tick médio ms | Maior p95 de janela ms | Tick máximo ms | CPU média %/núcleo | RSS máximo MiB | Comando→snapshot p95 ms | Mensagens recebidas | Mensagens enviadas | JSON enviado MiB | Erros | Quedas | Reconectados | Aprovado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 3.56 | 44.59 | 44.59 | 7.21 | 105.8 | 138.30 | 606 | 3834 | 60.7 | 0 | 0 | 4 | True |
| 8 | 4.46 | 19.83 | 85.19 | 11.26 | 151.0 | 137.78 | 1183 | 7643 | 156.3 | 0 | 0 | 8 | True |
| 16 | 6.75 | 32.67 | 200.64 | 21.50 | 206.8 | 137.69 | 2183 | 15158 | 459.0 | 0 | 0 | 16 | True |
| 24 | 9.20 | 247.07 | 247.07 | 31.99 | 241.5 | 141.43 | 3285 | 22876 | 908.8 | 0 | 0 | 24 | True |
| 32 | 12.18 | 345.84 | 345.84 | 42.26 | 261.5 | 166.17 | 4177 | 30286 | 1457.9 | 0 | 0 | 32 | True |

Os percentis acima são identificados por janela. A maior janela de um segundo inclui picos de preparação/troca de mapa; não é o p95 global de todos os ticks. O máximo e a média usam as amostras registradas. Na referência de 32, desconexões reduziram o trabalho da parte final; a média de CPU da rodada inteira não serve para afirmar ganho.

## Comparação do trabalho de envio

| Clientes | Antes: envio/tick ms | Depois: envio/tick ms | Redução medida |
| --- | --- | --- | --- |
| 4 | 0.747 | 0.704 | 5.7% |
| 8 | 1.344 | 1.392 | -3.6% |
| 16 | 3.165 | 2.802 | 11.5% |
| 24 | 6.637 | 4.884 | 26.4% |
| 32 | 9.868 | 8.151 | 17.4% |

Uma composição pública por mapa e envio substitui uma composição por destinatário. A parte privada (perfil, inventário, cooldown, drops, party, época) permanece individual. Em 32 no trecho de combate, o custo médio de envio caiu aproximadamente 17,4%; em oito houve variação desfavorável. Há uma execução por faixa, com aleatoriedade do combate e carga do sistema; não são intervalos de confiança. Não foi reduzida a frequência de simulação, o número de inimigos, a IA ou a qualidade visual.

A reprodução adicional `baseline-diagnostic` registrou fechamento 1006 durante a fase do Lobo e fila agregada de 3.702.772 bytes. O envio tinha limite único de 64 KiB e podia terminar conexões enquanto mapas válidos eram comprimidos. Snapshots substituíveis continuam sujeitos a 64 KiB; respostas necessárias verificam um limiar de 1 MiB por conexão antes do envio (uma mensagem pode ultrapassar o limiar). Essa proteção evita crescimento ilimitado; o ensaio posterior verifica recuperação e reconexão.

## Carga sustentada de 32

| Clientes | Tick médio ms | Maior p95 de janela ms | Tick máximo ms | CPU média %/núcleo | RSS máximo MiB | Comando→snapshot p95 ms | Mensagens recebidas | Mensagens enviadas | JSON enviado MiB | Erros | Quedas | Reconectados | Aprovado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 32 | 15.44 | 379.92 | 379.92 | 51.06 | 284.7 | 195.48 | 11410 | 143133 | 8575.3 | 0 | 0 | 32 | True |

| Fase | Janelas | CPU média | RSS início MiB | RSS fim MiB | RSS pico MiB | Loop máx ms | Fila máx bytes | Snapshots/janela/cliente | JSON MiB/janela | Entidades máx | Gravação máx ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| warmup | 5 | 30.16 | 97.8 | 115.8 | 117.7 | 29.80 | 1240196 | 9.79 | 11.39 | 32 | 3.043 |
| idle | 8 | 28.52 | 119.9 | 148.3 | 149.7 | 93.19 | 0 | 10.00 | 11.87 | 32 | 2.951 |
| move | 10 | 32.59 | 147.9 | 158.8 | 162.2 | 32.29 | 1241760 | 10.10 | 11.99 | 32 | 0.000 |
| distributed | 10 | 44.77 | 221.3 | 223.2 | 230.1 | 366.22 | 3703117 | 9.81 | 10.91 | 206 | 0.093 |
| combat | 20 | 57.86 | 227.6 | 257.7 | 258.9 | 431.49 | 2449915 | 9.90 | 21.70 | 206 | 0.297 |
| boss | 15 | 56.57 | 254.9 | 274.1 | 274.1 | 177.21 | 3520409 | 9.93 | 30.34 | 191 | 0.408 |
| inventory | 8 | 36.58 | 270.3 | 257.5 | 270.3 | 114.36 | 2593881 | 10.12 | 12.96 | 185 | 4.074 |
| recovery | 38 | 29.35 | 265.4 | 276.8 | 276.8 | 113.25 | 1189875 | 10.05 | 11.50 | 185 | 3.515 |
| sustain | 297 | 55.29 | 264.1 | 273.5 | 284.7 | 334.76 | 2945166 | 9.98 | 22.78 | 192 | 0.912 |

## Atraso artificial de 80 ms por direção

| Clientes | Tick médio ms | Maior p95 de janela ms | Tick máximo ms | CPU média %/núcleo | RSS máximo MiB | Comando→snapshot p95 ms | Mensagens recebidas | Mensagens enviadas | JSON enviado MiB | Erros | Quedas | Reconectados | Aprovado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 32 | 13.29 | 440.37 | 440.37 | 47.01 | 254.9 | 332.18 | 4004 | 30134 | 1463.2 | 0 | 0 | 32 | True |

| Fase | Janelas | CPU média | RSS início MiB | RSS fim MiB | RSS pico MiB | Loop máx ms | Fila máx bytes | Snapshots/janela/cliente | JSON MiB/janela | Entidades máx | Gravação máx ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| warmup | 5 | 31.96 | 97.5 | 117.5 | 118.6 | 29.93 | 0 | 9.75 | 11.34 | 32 | 21.178 |
| idle | 8 | 30.93 | 139.6 | 148.9 | 148.9 | 94.44 | 0 | 10.00 | 11.87 | 32 | 3.269 |
| move | 10 | 35.77 | 150.1 | 176.7 | 181.7 | 37.52 | 1239149 | 10.10 | 11.99 | 32 | 0.000 |
| distributed | 10 | 46.10 | 222.2 | 229.5 | 229.5 | 355.99 | 3702903 | 9.90 | 11.03 | 206 | 0.114 |
| combat | 20 | 69.13 | 231.9 | 237.1 | 241.7 | 482.61 | 2565295 | 9.86 | 21.99 | 206 | 0.226 |
| boss | 15 | 58.16 | 238.8 | 243.1 | 254.9 | 73.73 | 3435165 | 10.07 | 28.78 | 193 | 0.724 |
| inventory | 8 | 31.89 | 248.8 | 240.0 | 249.7 | 130.55 | 1190700 | 10.12 | 13.14 | 187 | 3.112 |
| recovery | 9 | 28.84 | 241.9 | 219.6 | 242.0 | 108.72 | 0 | 9.78 | 11.66 | 187 | 4.694 |

A duração está limitada às janelas registradas (cinco minutos de extensão sustentada mais fases e recuperação). Não prova estabilidade por um turno escolar inteiro. Atraso artificial não simula perda, Wi-Fi ou 32 placas de rede. Bytes são JSON antes da compressão. Detalhes de tick, mensagens, gravações, recursos, erros e operações em cada segundo estão nos arquivos brutos.

## Capacidade local e margem observada

A maior carga aprovada foi **32 clientes de protocolo ativos**, por TLS local, com movimento, habilidades, inventário e reconexão. No trecho de combate da configuração final de 32, o tick médio foi 18.18 ms, sendo 10.63 ms de simulação e 7.55 ms de montagem/envio. Frente ao orçamento nominal de 50 ms, a diferença média foi 31.82 ms. Essa média não elimina os picos: o maior p95 de janela nesse trecho foi 345.84 ms e o tick máximo 345.84 ms.

O gargalo corrigido no servidor foi o preparo repetido do estado e a fila curta durante troca de mapas. Ainda há custo por jogador na serialização de perfis, consultas de estado privado e simulação. No cliente, a preparação de personagens excedeu o prazo ao abrir quatro preparados na mesma máquina; a divisão exata do custo entre CPU, GPU e pressão de memória não foi isolada. Não se infere suporte a 32 clientes gráficos nem capacidade da escola.

| Clientes | Ticks/s medidos | Snapshots/s/cliente | Intervalo recebido p95 ms | Loop máx ms | Fila agregada máx bytes | Entidades máx | Gravações | Gravação máxima ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 20.00 | 9.97 | 110.15 | 297.01 | 139318 | 178 | 3256 | 3.056 |
| 8 | 20.00 | 9.96 | 115.69 | 300.42 | 258532 | 182 | 6648 | 11.066 |
| 16 | 19.99 | 9.95 | 117.59 | 300.42 | 1302068 | 190 | 11695 | 4.537 |
| 24 | 20.00 | 9.92 | 115.94 | 311.95 | 2030790 | 198 | 17582 | 3.344 |
| 32 | 19.99 | 9.86 | 122.54 | 408.42 | 3507588 | 206 | 22106 | 29.973 |

As taxas usam mensagens/ciclos entre os timestamps de amostra, excluindo a primeira janela sem início registrado. As tabelas por fase anteriores mostram contagem por janela nominal de um segundo; uma janela pode se alongar nos picos. O intervalo recebido mede a experiência de entrega, separado da taxa de envio. Filas são observadas uma vez por janela; podem existir picos intermediários maiores.

## Operações de inventário/equipamento

| Clientes | Operação | Aceitas | Recusadas | Motivo das recusas |
| --- | --- | --- | --- | --- |
| 4 | transport:result | 17 | 7 | Encerre o combate antes de gerenciar a carga. |
| 4 | progression:result | 8 | 4 | Encerre o combate antes de trocar equipamento. |
| 8 | transport:result | 40 | 8 | Encerre o combate antes de gerenciar a carga. |
| 8 | progression:result | 19 | 5 | Encerre o combate antes de trocar equipamento. |
| 16 | transport:result | 66 | 30 | Encerre o combate antes de gerenciar a carga. |
| 16 | progression:result | 30 | 18 | Encerre o combate antes de trocar equipamento. |
| 24 | transport:result | 113 | 31 | Encerre o combate antes de gerenciar a carga. |
| 24 | progression:result | 52 | 20 | Encerre o combate antes de trocar equipamento. |
| 32 | transport:result | 192 | 0 | — |
| 32 | progression:result | 96 | 0 | — |

A mudança para a cidade não apaga imediatamente o estado de combate. As recusas acima validam essa regra; não são falhas de transporte, SQLite ou sessão. O resultado `ok` da carga exige ausência de erros técnicos e quedas, mas não exige que ações proibidas pelo jogo sejam aceitas.

Na extensão sustentada, RSS médio das primeiras 20 janelas: 259.8 MiB; últimas 20: 276.7 MiB; recuperação final: 275.5 MiB. Heap JS nas mesmas faixas: 44.3 / 40.2 / 44.3 MiB. Essa janela permite observar retenção e recuperação, mas não diagnostica sozinha vazamentos nem demonstra estabilidade por horas.
