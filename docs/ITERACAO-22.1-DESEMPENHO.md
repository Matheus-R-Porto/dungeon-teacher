# Iteração 22.1 — medições locais

Referência: .logs\iteration221-benchmark-v1-1792510991321\report.json. Atual: .logs\iteration221-benchmark-v2-1792511130125\report.json.

Windows; AMD Ryzen 5 6600H with Radeon Graphics; Node v24.19.0; ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11).
Um Electron real em 1282×722, DPR 1.25, sombras ativas. Nos casos de 12 personagens, outros 11 são clientes de protocolo no servidor local, não 11 renderizadores. A contagem de personagens visíveis consta no JSON.

Cada amostra tem 2 s de aquecimento e 20 s de coleta. FPS = 1000 / média dos intervalos; 1% low = 1000 / média do 1% de intervalos mais lentos. p95/p99 em ms. Uma passagem por cenário, sem intervalo de confiança. A referência aplica a expansão v1 com o cliente atual; não é um executável histórico completo. Cidade animada/congelada isola as rotinas dos NPCs. Não se compara a primeira criação de mapas; pequenas travadas de carregamento continuam possíveis.

O servidor e o controlador de ensaio compartilham um processo Node. Tick Hz é contado na janela da amostra, incluindo a latência do coletor. Testes automatizados e outras janelas de ensaio foram encerrados antes da coleta. Controle de oclusão do Electron desativado nos dois casos. Frames próximos de 8,34 ms indicam um teto de apresentação: não provam capacidade gráfica ilimitada nem ganho de otimização.

| Estado | Cena | Quadros | FPS | p95 | p99 | 1% low | Draw calls | Triângulos | Materiais | Fontes de textura | Heap MiB | Tick Hz |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v1 | city-one-animated | 2349 | 117.46 | 10.00 | 12.70 | 69.26 | 418 | 41332 | 167 | 13 | 21.79 | 20.03 |
| v1 | city-one-frozen-control | 2397 | 119.86 | 8.90 | 9.40 | 98.72 | 418 | 41332 | 167 | 13 | 18.54 | 19.98 |
| v1 | tower-one-entry | 2397 | 119.86 | 8.50 | 8.70 | 111.58 | 119 | 12096 | 227 | 5 | 22.66 | 20.03 |
| v1 | tower-one-grove-monsters | 2397 | 119.86 | 8.50 | 8.70 | 110.91 | 109 | 12006 | 227 | 5 | 23.00 | 19.98 |
| v1 | tower-twelve-grove | 2396 | 119.86 | 8.50 | 8.70 | 108.21 | 129 | 12278 | 249 | 5 | 24.70 | 19.99 |
| v2 | city-one-animated | 2398 | 119.85 | 8.80 | 9.50 | 97.64 | 418 | 41332 | 167 | 13 | 21.66 | 20.02 |
| v2 | city-one-frozen-control | 2397 | 119.81 | 8.80 | 9.30 | 100.13 | 418 | 41332 | 167 | 13 | 21.28 | 20.02 |
| v2 | tower-one-entry | 2398 | 119.86 | 8.50 | 8.70 | 110.65 | 73 | 11657 | 178 | 5 | 18.28 | 20.03 |
| v2 | tower-one-grove-monsters | 2397 | 119.85 | 8.60 | 8.80 | 111.47 | 100 | 12251 | 178 | 5 | 18.34 | 20.04 |
| v2 | tower-twelve-grove | 2397 | 119.86 | 8.60 | 9.00 | 99.50 | 121 | 12535 | 200 | 5 | 33.74 | 20.03 |
| v2 | structure-ground | 2397 | 119.86 | 8.60 | 8.80 | 108.60 | 115 | 12503 | 200 | 5 | 19.95 | 20.03 |
| v2 | structure-upper | 2398 | 119.86 | 8.50 | 8.70 | 110.75 | 113 | 12499 | 200 | 5 | 26.68 | 20.03 |
| v2 | structure-upper-sustained-0 | 2396 | 119.86 | 8.60 | 8.90 | 107.10 | 113 | 12499 | 200 | 5 | 32.62 | 19.99 |
| v2 | structure-upper-sustained-1 | 2397 | 119.86 | 8.60 | 8.80 | 106.71 | 113 | 12499 | 200 | 5 | 27.39 | 19.99 |
| v2 | structure-upper-sustained-2 | 2397 | 119.86 | 8.50 | 8.70 | 110.80 | 113 | 12499 | 200 | 5 | 29.75 | 19.98 |

No encontro com 12 personagens: draw calls 129 → 121; triângulos 12278 → 12535; materiais 249 → 200; fontes de textura 5 → 5. FPS 119.86 → 119.86. Esses números documentam o custo da composição; não atribuem diferenças pequenas a otimização.

Heap é memória JavaScript, não VRAM. As três amostras adicionais no pavimento superior cobrem somente cerca de um minuto; variações de GC impedem concluir vazamento ou ausência dele. O PNG do ferreiro contém 2172×724 pixels: aproximadamente 6.00 MiB RGBA, sem contabilizar cópias/overhead. Não houve medição direta de utilização GPU/CPU nem teste nos computadores da escola. Não houve redução de jogadores, sombras ou regras de combate para obter estes resultados.
