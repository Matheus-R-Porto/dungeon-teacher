# Iteração 21.1 — desempenho da Beta 0.4.2

## Método e limites

Mesmo ensaio da Iteração 21: um Electron real, servidor em outro processo, onze clientes WebSocket adicionais; 12 personagens visíveis. Sete janelas de 30 segundos, precedidas de 3 segundos de aquecimento. Movimento contínuo a 15 comandos/s. Viewport lógico 1282 × 722, DPR 1,25, GPU AMD integrada via ANGLE/D3D11, Ryzen 5 6600H, Windows, Node 24.19.0. Controle de oclusão nativa igual à referência; VSync e sombras mantidos. Sem suíte de testes ou segundo Electron concorrentes durante as medições.

FPS abaixo é quadros / tempo de parede; p95/p99 são frametimes. 1% low usa a média dos 1% quadros mais lentos. Os cenários de combate dependem da atividade real e não são replays idênticos. A janela de efeitos injeta somente efeitos visuais, não dano ou recompensas. O JSON acompanha amostras agregadas, atividade, visibilidade e inventário de renderização. Não é um novo diagnóstico geral do servidor.

## Resultados após particionar o exterior

| Cenário | Quadros | FPS | p95 ms | p99 ms | 1% low | Draw calls | Triângulos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Cidade, um personagem | 2527 | 84,17 | 15,8 | 18,0 | 50,94 | 402 | 40646 |
| Cidade, personagem oculto | 2640 | 87,94 | 15,1 | 17,8 | 49,82 | 397 | 40584 |
| Cidade, 12 parados | 2317 | 77,17 | 16,8 | 18,6 | 49,78 | 457 | 40296 |
| Cidade, 12 em movimento | 1970 | 65,61 | 20,4 | 24,3 | 33,23 | 433 | 39394 |
| Torre com monstros | 3116 | 103,77 | 13,2 | 15,7 | 49,70 | 140 | 30958 |
| Torre com combate | 3051 | 101,65 | 14,2 | 17,5 | 47,72 | 110 | 30378 |
| Torre, 24 efeitos simultâneos | 3426 | 114,11 | 11,4 | 13,0 | 67,88 | 170 | 30858 |

As sete janelas registraram **19,976–20,019 ticks/s**. O agendador corrigido foi preservado; não houve mudança da frequência nominal.

## Comparação e correção demonstrada

| Cidade com 12 parados | Beta 0.4.1 | 0.4.2 antes do particionamento | 0.4.2 depois |
|---|---:|---:|---:|
| FPS | 89,75 | 69,76 | 77,17 |
| p95 / p99, ms | 14,7 / 17,3 | 19,5 / 23,6 | 16,8 / 18,6 |
| Draw calls | 331 | 409 | 457 |
| Triângulos | 30304 | 111852 | 40296 |
| Materiais na cena | 173 | 230 | 230 |
| Texturas reportadas pela GPU | 20 | 14 | 14 |

O primeiro exterior enviava toda a floresta em conjuntos de instâncias com limites muito amplos e todo o terreno em uma malha. Separar árvores/rochas em regiões de 24 unidades e o terreno em blocos de 60 unidades permite o descarte fora do enquadramento. A malha continua usando a mesma grade de 6 unidades. **Nenhuma árvore, sombra ou trecho do terreno foi removido.**

O custo em triângulos da janela parada caiu 64%. A contrapartida são mais objetos e chamadas de desenho. O FPS dessa janela melhorou aproximadamente 11%, mas não houve ganho consistente em todas as janelas: um personagem passou de 87,52 para 84,17 FPS, e movimento com 12 passou de 69,13 para 65,61. Uma rodada por condição não demonstra um ganho geral estável. A redução de geometria enviada é objetiva; os valores de FPS também incluem variação de carga e agendamento.

Frente à **Beta 0.4.1**, a cidade mais detalhada continua aproximadamente **14% mais lenta com os personagens parados**, com 38% mais draw calls e 33% mais triângulos. Com os 12 em movimento, a referência era 65,00 FPS, p95 21 ms, p99 26 ms e 1% low 27,77; a nova janela ficou próxima da mesma média. Essa diferença pequena não é apresentada como ganho de otimização.

Na janela parada final, envio da renderização consumiu em média 9,65 ms; atualização inclusiva da cena 10,31 ms; processamento de snapshots 0,94 ms por snapshot; sprites 0,012 ms por chamada de ator. Em movimento: renderização 9,69 ms, cena inclusiva 11,59 ms, snapshots 0,97 ms, atualização inclusiva de remotos 1,45 ms e sprites 0,016 ms por chamada. Métodos inclusivos se sobrepõem e não devem ser somados. O cronômetro de GPU não foi ativado; estes são tempos de CPU/submissão.

## Memória e riscos

Heap JavaScript amostrado: 20,41 MiB com 12 parados e 19,42 MiB em movimento, versus aproximadamente 13,0 e 15,9 MiB na referência anterior. São fotografias sujeitas ao coletor de lixo, não uma medida de vazamento. Os atlas de armas têm resolução maior; menos objetos de textura não significa necessariamente menor VRAM. Não medimos VRAM nem RSS completo de todos os subprocessos do Electron nesta rodada.

Os tempos de criação inicial dos mapas continuam fora destas janelas aquecidas. Persistem quedas pontuais: 1% low de 33,23 FPS no movimento e pico de 64,9 ms nessa janela. Não se promete 60 FPS constantes. Computadores da escola e 12 máquinas físicas não foram testados; a validação usa uma máquina e 12 conexões, não 12 renderizadores locais.

Refinamentos finais de poses, reação visual a dano e redução de pequenas alocações não mudaram dimensões dos atlas, geometria, materiais ou composição dos cenários medidos. As capturas finais foram refeitas depois desses ajustes; não são apresentadas como novas medições de FPS.

Dados completos: [ITERACAO-21.1-DESEMPENHO.json](ITERACAO-21.1-DESEMPENHO.json). Referências internas: `diagnostic-1792111198235` (0.4.1), `diagnostic-1792115400553` (primeiro exterior), `diagnostic-1792115793109` (exterior particionado).
