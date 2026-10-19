# Desempenho da Iteração 21

## Metodologia e ambiente

Benchmark existente `scripts/performance-diagnostic.mjs`, com 30 segundos por cenário após 3 segundos de estabilização. Um processo Electron real e onze clientes WebSocket nos cenários de 12; servidor em outro processo. Movimento contínuo alternado a 15 comandos/s por participante, incluindo o cliente gráfico, respeitando o protocolo. Nenhuma suíte, compilação ou outro ensaio Electron foi executado simultaneamente às janelas medidas. Os aplicativos normais do computador não foram desativados.

Windows, Ryzen 5 6600H, 12 processadores lógicos, aproximadamente 7,24 GiB de RAM visível, Node 24.19.0, Electron 44.5.1 e Three.js 0.186.1. O renderer informa AMD Radeon integrada via ANGLE/D3D11. Janela de 1282 × 722 CSS, DPR 1,25. Os flags de controle de oclusão usados no diagnóstico anterior foram mantidos apenas no laboratório; VSync não foi desativado e não foi criado limitador artificial.

Cada janela registra os frametimes, FPS pelo tempo de relógio, percentis p95/p99, 1% low (inverso da média dos 1% piores frametimes), chamadas de desenho, triângulos, materiais, texturas, heap JS e duração de trabalho da thread principal via CDP. Todas as janelas finais permaneceram visíveis. O cenário vazio oculta corpo, sombra e arma; os demais elementos da cidade permanecem. O cenário sintético acrescenta 24 impactos visuais, sem recompensas ou dano fictícios.

## Resultados finais

| Cenário | Quadros | FPS médio | p95 ms | p99 ms | 1% low | Draw calls | Triângulos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Cidade com 1 personagem | 2874 | 95.75 | 14.70 | 17.50 | 49.89 | 276 | 29658 |
| Cidade sem personagem visível | 2822 | 94.05 | 14.20 | 15.70 | 55.24 | 271 | 29596 |
| Cidade com 12 parados | 2695 | 89.75 | 14.70 | 17.30 | 48.40 | 331 | 30304 |
| Cidade com 12 em movimento | 1951 | 65.00 | 21.00 | 26.00 | 27.77 | 317 | 29112 |
| Torre com monstros | 3101 | 103.31 | 13.20 | 15.00 | 56.59 | 140 | 30958 |
| Torre com combate | 3090 | 102.97 | 14.20 | 18.10 | 46.53 | 146 | 30810 |
| Torre com 24 efeitos sintéticos | 3146 | 104.77 | 13.70 | 16.80 | 53.38 | 170 | 30858 |

Draw calls e triângulos são contadores do último quadro, incluindo o efeito do enquadramento e dos passes de sombra; não são médias sobre todos os quadros. Os cenários de cidade com 12 confirmaram 12 personagens visíveis. Combate registrou 639 quadros com atividade de combate e 197 com efeitos; o cenário sintético registrou 2.778 quadros com efeitos. Não se tratou apenas de medir uma Torre parada e rotulá-la como combate.

## Cidade antes e depois

| Condição | FPS | p95 ms | Draw calls | Triângulos | Materiais | Texturas GPU | Heap JS MiB |
|---|---:|---:|---:|---:|---:|---:|---:|
| Beta 0.4.0 controlada | 95.59 | 14.30 | 359 | 15436 | 116 | 14 | 14.14 |
| Cidade expandida antes do agrupamento | 78.38 | 16.70 | 469 | 27904 | 172 | 19 | 24.10 |
| Versão final | 89.75 | 14.70 | 331 | 30304 | 173 | 20 | 13.00 |

A primeira expansão aumentou as chamadas de 359 para 469, com queda de 95.59 para 78.38 FPS. O agrupamento por material/região e por edifício reduziu o conjunto final a 331 chamadas, 29.4% abaixo da primeira expansão. O FPS final foi 89.75, -6.1% em relação à referência antiga controlada.

Não houve remoção de sombras, edifícios, NPCs ou efeitos para obter esses números. A versão final também inclui melhor cobertura das sombras, telhados residenciais distintos e caminhos de tijolos. Portanto, a diferença antes/depois não é uma ablação isolada de uma única função, embora a redução das chamadas seja diretamente observável no agrupamento.

O conteúdo continua maior: os triângulos da cena de 12 passaram de 15436 para 30304 (96.3% a mais), e os materiais de 116 para 173. As armas são modelos separados e há mais edifícios, luzes decorativas, pavimento e sombras. Os materiais próprios de cada prédio são mantidos para seu desvanecimento independente.

Com 12 em movimento, a primeira expansão mediu 63,68 FPS e a versão final 65,00 FPS. Essa pequena diferença não sustenta uma afirmação de ganho expressivo nesse cenário. O p99 final de 26 ms e o 1% low de 27,77 FPS mostram que ainda ocorrem picos. Não havia amostra equivalente de movimento contínuo na cidade antiga; não é possível atribuir a diferença para a cena antiga parada apenas à expansão.

Não se usa 48,3 FPS como baseline: esse valor histórico não foi reproduzido como custo dos 12 personagens. Também não se compara esta execução de um Electron com os 52,6 FPS do ensaio anterior com dois Electron. A referência de 77,4 FPS sem o mesmo controle de oclusão permanece uma condição distinta.

## CPU, memória e servidor

| Cenário | Trabalho principal aproximado % de um núcleo | Heap JS MiB | RSS servidor MiB | CPU servidor % de um núcleo | Ticks/s | Tick p95 ms |
|---|---:|---:|---:|---:|---:|---:|
| Cidade com 1 personagem | 72.0 | 18.09 | 51.61 | 4.26 | 20.003 | 2.61 |
| Cidade sem personagem visível | 68.3 | 13.18 | 46.54 | 2.80 | 19.988 | 2.38 |
| Cidade com 12 parados | 90.8 | 13.00 | 36.27 | 10.05 | 19.990 | 12.06 |
| Cidade com 12 em movimento | 77.7 | 15.88 | 40.86 | 14.48 | 19.996 | 10.24 |
| Torre com monstros | 78.8 | 20.11 | 55.75 | 9.07 | 20.015 | 9.41 |
| Torre com combate | 97.1 | 16.58 | 48.08 | 11.77 | 19.983 | 33.58 |
| Torre com 24 efeitos sintéticos | 97.5 | 36.52 | 52.11 | 12.60 | 20.208 | 31.25 |

A coluna de trabalho principal é um indicador CDP da thread do renderer, não a CPU total do Electron nem do computador. Heap JS é uma fotografia sujeita a coleta de lixo; RSS é do processo servidor instrumentado. Não foi obtida medição de VRAM ou RSS agregado de todos os processos Electron, e não há prova de vazamento nessas amostras curtas. O heap de 36,52 MiB no cenário de efeitos deve ser lido com essa limitação.

O scheduler corrigido permaneceu nominalmente em 20 Hz; nas janelas medidas, a taxa foi de 19,983 a 20,208. A arquitetura continua recuperando dívida temporal, então pequenas diferenças de janela e catch-up existem. Permanecem atrasos pontuais: tick máximo de 204,69 ms no combate, apesar da média de aproximadamente 20 Hz. Não se mudou a frequência para esconder esses picos e não se atribui uma causa nova conclusiva sem investigação adicional.

Na cidade parada com 12, p95 de submissão do render foi 9,5 ms, atualização inclusiva da cena 10,4 ms, atualização dos remotos 0,5 ms e processamento de snapshot 2,2 ms. Em movimento, os respectivos p95 foram 9,6 / 12,4 / 2,9 / 2,5 ms. Tempos inclusivos se sobrepõem e não devem ser somados. A instrumentação permanece opt-in.

## Interpretação para a escola

A expansão é utilizável neste computador, mas a carga de movimento contínuo e os picos de frametime ainda são riscos para máquinas mais fracas. Não é uma certificação de 60 FPS constantes. A geometria mais rica aumenta triângulos e materiais; o agrupamento reduz chamadas e preserva a apresentação. O teste de 12 jogadores em computadores Windows distintos continua necessário para avaliar GPU, rede, temperatura, memória e variação de hardware.

As fontes completas estão em [dados JSON](ITERACAO-21-DESEMPENHO.json), com referência controlada anterior, primeira expansão e versão final. As curvas de combate, recompensas, quantidade de jogadores e o scheduler não foram alterados por esta comparação.
