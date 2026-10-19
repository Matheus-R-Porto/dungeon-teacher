# Beta 0.4.3 — comparação de desempenho

## Método e ambiente

Benchmark existente, janelas de 30 segundos e três segundos de aquecimento, um Electron e onze clientes WebSocket, movimento a 15 comandos/s. Sem outros testes/Electron de inspeção durante as amostras. Windows, Ryzen 5 6600H, Node 24.19.0, GPU AMD integrada via ANGLE/D3D11, viewport lógico 1282 × 722, DPR 1,25. Sombras e controle de oclusão nativa mantidos. A adaptação do benchmark remove apenas a referência ao antigo weaponRoot inexistente.

FPS = quadros/tempo de parede; p95/p99 de frametime; 1% low = inverso da média do 1% mais lento. Histórico 0.4.2 não é um A/B contemporâneo: atividade de combate, carga do sistema e agendamento podem variar. Não atribuir diferenças automaticamente à otimização gráfica. RenderSubmit mede submissão CPU e esperas, não GPU isolada.

## Primeira rodada

| Cena | Quadros | FPS 0.4.2 | FPS 0.4.3 | p95 ms | p99 ms | 1% low | Máximo ms | Draw calls antes → depois |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| city-one | 2112 | 84.17 | 70.28 | 19.70 | 25.70 | 29.36 | 83.40 | 402 → 399 |
| city-empty | 2282 | 87.94 | 75.98 | 16.60 | 20.00 | 39.94 | 50.30 | 397 → 397 |
| city-twelve | 2315 | 77.17 | 77.12 | 15.50 | 18.20 | 25.31 | 453.00 | 457 → 420 |
| city-twelve-moving-15Hz | 2253 | 65.61 | 75.04 | 16.80 | 20.70 | 35.52 | 58.50 | 433 → 404 |
| tower-monsters | 2439 | 103.77 | 81.28 | 14.70 | 16.10 | 55.01 | 50.60 | 140 → 104 |
| tower-combat | 2407 | 101.65 | 80.18 | 15.50 | 17.00 | 51.79 | 24.30 | 110 → 110 |
| tower-24-effects-synthetic | 2435 | 114.11 | 81.11 | 15.10 | 16.30 | 58.32 | 21.30 | 170 → 158 |

## Repetição direcionada

| Cena | FPS | p95 ms | p99 ms | 1% low |
|---|---:|---:|---:|---:|
| city-twelve-moving-15Hz | 77.32 | 16.90 | 20.60 | 44.41 |
| tower-monsters | 80.54 | 14.90 | 16.50 | 54.40 |
| tower-combat | 80.44 | 15.00 | 16.60 | 43.10 |
| tower-24-effects-synthetic | 81.26 | 14.90 | 16.10 | 58.96 |

## Interpretação e ressalvas

- Cidade com doze personagens parada ficou próxima da referência; movimento teve média maior nesta medição. A remoção dos props geométricos reduz objetivamente draw calls/materiais, sem reduzir jogadores ou elementos da cidade. Isso não prova que toda a diferença de FPS veio desta alteração.
- Torre ficou consistentemente perto de 80 FPS, abaixo dos 101–114 FPS históricos. Entretanto, na cena de monstros o tempo médio sceneInclusive caiu de 6,37 para 3,64 ms e renderSubmit de 5,03 para 2,87 ms. Os dados não demonstram que sprites/atualização de cena causaram a queda; não há causa conclusiva para a diferença de cadência global. Não declarar ausência absoluta de regressão.
- Pico isolado de 453 ms na cidade parada derrubou seu 1% low, apesar de p95/p99 menores. A repetição dirigida não repetiu essa janela estática; a causa desse pico continua não isolada.
- Cenas de combate são interativas, não replays determinísticos; 24 efeitos simultâneos são stress de apresentação, sem dano artificial.

## Memória e inventário

| Cena | Materiais antes → depois | Texturas GPU antes → depois | Heap JS MiB antes → depois | Triângulos depois |
|---|---:|---:|---:|---:|
| city-one | 164 → 160 | 12 → 13 | 25.66 → 15.26 | 40610 |
| city-empty | 164 → 160 | 12 → 13 | 18.86 → 21.83 | 40584 |
| city-twelve | 230 → 182 | 14 → 15 | 20.41 → 23.02 | 39862 |
| city-twelve-moving-15Hz | 230 → 182 | 14 → 15 | 19.42 → 18.23 | 39392 |
| tower-monsters | 156 → 108 | 4 → 5 | 20.03 → 30.18 | 30526 |
| tower-combat | 156 → 108 | 6 → 8 | 35.60 → 38.12 | 30378 |
| tower-24-effects-synthetic | 180 → 156 | 7 → 9 | 20.96 → 37.67 | 30474 |

Os quinze atlas selecionados de personagem somam **196,625 MiB de pixels RGBA** se todos forem decodificados (mais a folha de morte anterior). Isso é uma estimativa geométrica, não uma leitura de VRAM. Fontes são compartilhadas por personagens; não se multiplica esse total por doze automaticamente. O cache completo de quatro famílias e profissões não é representado pelo heap JS nem pelo cenário de doze novatos. O aumento de variedade visual tem custo potencial de memória e primeira carga, importante para máquinas com GPU integrada.

## Servidor e conclusão

Agendador preservado, frequência observada de 19.97 a 20.02 Hz nas janelas. Não houve alteração da frequência nominal nem erros nos dois relatórios. Mantidos doze participantes, sombras, monstros e efeitos. Nenhum deploy.

A cidade não apresentou perda relevante de FPS médio neste ensaio; a diferença histórica na torre e o pico de frametime permanecem ressalvas explícitas. O relatório não certifica os computadores da escola. Validar em hardware real antes da apresentação e acompanhar travadas de primeira carga.
