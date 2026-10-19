# Desempenho — Iteração 22

## Método e ambiente

Janelas de 30 s, precedidas por 3 s de aquecimento. Um Electron real e até onze clientes WebSocket; não são doze processos Electron nem computadores físicos. Resolução e GPU em cada inventário JSON. Testes pesados e geração de assets encerrados antes dos benchmarks. VSync e sombras preservados. FPS é quadros/tempo de parede; p95/p99 são frametimes em ms; 1% low é o inverso da média do 1% de quadros mais lentos. As métricas de renderização JavaScript são submissão à GPU, não tempo GPU medido.

CPU: AMD Ryzen 5 6600H with Radeon Graphics         ; Node v24.19.0. GPU: ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11). Viewport 1282 × 722, DPR 1.25.

A referência inicial anterior às mudanças está no JSON. O controle adicional usa o mesmo cliente final e a geografia-base, desativando exclusivamente a expansão no worker diagnóstico isolado. Portanto, esse controle não é um checkout integral antigo: a escala dos NPCs e o código comum já são atuais. Ele permite comparar o custo do conteúdo da Torre nas mesmas condições.

## Quadros: controle → expansão

| Cenário | FPS | p95 ms | p99 ms | 1% low FPS | Máximo ms |
|---|---:|---:|---:|---:|---:|
| city-one | 119.78 → 119.81 | 8.80 → 8.70 | 9.30 → 9.10 | 100.84 → 103.21 | 11.60 → 12.20 |
| city-empty | 119.55 → 119.83 | 8.80 → 8.70 | 9.80 → 9.00 | 93.02 → 104.14 | 14.20 → 12.60 |
| tower-one-entry | 119.81 → 119.81 | 8.50 → 8.70 | 8.60 → 8.90 | 112.25 → 106.48 | 12.10 → 11.90 |
| tower-one-visible-monsters | 119.75 → 119.76 | 8.50 → 8.50 | 8.60 → 8.70 | 108.17 → 100.19 | 28.30 → 31.20 |
| city-twelve | 119.33 → 119.85 | 9.00 → 8.90 | 10.50 → 9.60 | 80.81 → 94.24 | 21.50 → 13.60 |
| city-twelve-moving-15Hz | 115.59 → 116.64 | 11.00 → 10.30 | 13.40 → 12.40 | 66.99 → 73.28 | 25.10 → 21.50 |
| tower-monsters | 119.85 → 119.77 | 8.50 → 8.50 | 8.90 → 8.90 | 106.35 → 101.90 | 12.50 → 16.80 |
| tower-twelve-visible-monsters | 119.82 → 119.81 | 8.50 → 8.50 | 8.60 → 8.70 | 112.50 → 101.41 | 10.40 → 17.20 |
| tower-combat | 119.82 → 119.73 | 8.50 → 8.50 | 8.80 → 8.80 | 105.05 → 94.22 | 14.10 → 28.20 |
| tower-24-effects-synthetic | 119.81 → 119.84 | 8.50 → 8.60 | 8.80 → 9.00 | 104.02 → 103.09 | 13.60 → 13.30 |
| living-grove-twelve-wolf | — → 119.78 | — → 8.50 | — → 9.00 | — → 94.17 | — → 18.50 |

A amostra chamada tower-monsters pelo roteiro histórico posiciona os jogadores na entrada: não garante monstros visíveis. Os cenários visible-monsters posicionam o grupo junto ao encontro. living-grove-twelve-wolf mede uma clareira nova, sem equivalente direto no mapa antigo. tower-24-effects-synthetic é estresse de apresentação, não uma habilidade nova.

## Inventário gráfico: controle → expansão

| Cenário | Draw calls | Triângulos | Materiais na cena | Fontes de textura | Heap JS MiB | Hz servidor |
|---|---:|---:|---:|---:|---:|---:|
| city-one | 400 → 400 | 40612 → 40612 | 160 → 160 | 12 → 12 | 13.40 → 18.30 | 20.00 |
| city-empty | 398 → 398 | 40586 → 40586 | 160 → 160 | 12 → 12 | 14.12 → 23.36 | 20.00 |
| tower-one-entry | 82 → 119 | 30240 → 12096 | 86 → 224 | 2 → 5 | 14.34 → 24.33 | 19.97 |
| tower-one-visible-monsters | 88 → 116 | 30092 → 12018 | 86 → 224 | 2 → 5 | 17.11 → 16.33 | 19.98 |
| city-twelve | 417 → 422 | 39788 → 40846 | 182 → 182 | 12 → 12 | 23.20 → 25.86 | 20.01 |
| city-twelve-moving-15Hz | 419 → 400 | 39782 → 39310 | 182 → 182 | 12 → 12 | 33.51 → 17.88 | 20.01 |
| tower-monsters | 104 → 141 | 30526 → 12382 | 108 → 246 | 2 → 5 | 27.93 → 22.49 | 19.99 |
| tower-twelve-visible-monsters | 110 → 139 | 30378 → 12306 | 108 → 246 | 2 → 5 | 30.14 → 47.52 | 19.99 |
| tower-combat | 110 → 128 | 30378 → 12200 | 108 → 246 | 2 → 5 | 21.16 → 26.20 | 19.98 |
| tower-24-effects-synthetic | 134 → 152 | 30426 → 12248 | 132 → 270 | 3 → 6 | 32.44 → 48.03 | 19.97 |
| living-grove-twelve-wolf | — → 138 | — → 12360 | — → 246 | — → 5 | — → 33.70 | 19.98 |

Inventários são fotografias do último quadro, não picos de toda a sessão. Heap JavaScript não é VRAM. Os três novos assets representam ~20,06 MiB de pixels RGBA antes de mipmaps/overhead. O cache de fontes preexistente permanece.

## Custo de CPU e servidor

| Cenário | Submissão render p95 ms | Cena inclusiva p95 ms | Snapshot p95 ms | Tick p95 ms | Intervalo tick p99 ms |
|---|---:|---:|---:|---:|---:|
| city-one | 4.90 | 5.20 | 1.00 | 1.57 | 63.11 |
| city-empty | 4.60 | 4.90 | 1.10 | 1.44 | 63.29 |
| tower-one-entry | 2.40 | 2.90 | 0.80 | 1.27 | 63.05 |
| tower-one-visible-monsters | 2.80 | 3.20 | 0.90 | 1.36 | 63.25 |
| city-twelve | 5.10 | 5.80 | 1.40 | 4.33 | 63.22 |
| city-twelve-moving-15Hz | 5.60 | 6.70 | 1.30 | 4.67 | 63.19 |
| tower-monsters | 2.50 | 3.30 | 0.80 | 3.98 | 63.37 |
| tower-twelve-visible-monsters | 2.50 | 3.10 | 0.90 | 4.14 | 63.13 |
| tower-combat | 3.00 | 3.90 | 0.90 | 5.43 | 63.33 |
| tower-24-effects-synthetic | 3.70 | 4.40 | 0.90 | 5.58 | 63.17 |
| living-grove-twelve-wolf | 3.00 | 3.60 | 1.00 | 6.02 | 63.44 |

O agendador de 20 Hz não foi alterado. Distribuições completas de simulação, serialização, envio, event-loop delay, memória e CPU do servidor constam no JSON. Custo de carga de mapas está em ITERACAO-22-CARGA.json. Medições curtas não demonstram estabilidade de horas nem eliminam o risco de quedas pontuais no hardware escolar.

## Carga dos mapas

Dez amostras por andar, em diretórios isolados. Valores médios em ms:

| Andar | Gerar/persistir base | Aplicar expansão | Total | Reabrir base do disco |
|---|---:|---:|---:|---:|
| 1 | 17.73 | 0.98 | 18.71 | 1.89 |
| 2 | 34.99 | 1.06 | 36.05 | 1.97 |
| 3 | 28.95 | 1.17 | 30.12 | 1.98 |

A primeira transição observada no Electron levou 474 ms até receber o mapa; a segunda, 260 ms. Esses números incluem protocolo e polling de até 100 ms, e não isolam compilação de shaders/primeiro frame GPU. As janelas de frametime são pós-aquecimento; continuam possíveis travadas de carga.

## Interpretação

Não houve regressão relevante no alvo de 60 FPS nas amostras executadas. A Torre ficou perto do teto de 120 FPS da sessão, então médias semelhantes não provam custo idêntico ou ganho gráfico. No encontro com 12 personagens, draw calls aumentaram 110 → 139 e materiais 108 → 246; triângulos caíram 30.378 → 12.306. O crescimento de materiais e ~20,06 MiB RGBA novos pode pesar mais em computadores modestos. O maior frametime pós-aquecimento foi 31,2 ms. O pico histórico de 453 ms não foi reproduzido; sua causa permanece não conclusiva.

Os andares 1–3 foram inspecionados funcional e visualmente no Electron. As janelas instrumentadas da Torre usam o andar 1; não representam uma medição individual dos três andares nem um ensaio sustentado em doze máquinas. O servidor manteve ~20 Hz, com jitter de agendamento discriminado no JSON. Não foi alterada a frequência nominal ou desativada a renderização de sombras.
