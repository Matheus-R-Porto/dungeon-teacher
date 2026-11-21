# Dungeon Teacher — Iteração 38 · Desempenho e decisão de resolução

Base 0.6.13, protótipos extraídos dos originais e versão final 0.6.14. O cenário controlado usa o renderizador e o personagem de produção em uma cena isolada: um Mago parado ou 32 instâncias em movimento, ataque, magia/projéteis e mochila. Não representa 32 computadores ou o custo completo do mundo escolar.

Cada combinação tem duas janelas de três segundos, precedidas por preparação. A apresentação do Electron ficou limitada a aproximadamente 60 FPS nesta cena; médias próximas de 60 não comprovam sobra de capacidade. p95/p99, máximos e memória são necessários para interpretar o resultado. As janelas curtas são descritivas, sem significância estatística. Compilação, auditoria de hashes e suíte foram encerradas durante as medições.

## Comparação exigida — 32 atores em movimento

| Métrica | 0.6.13 | Protótipo 192 | Final 0.6.14 |
|---|---:|---:|---:|
| FPS médio | 60.00 | 60.00 | 60.00 |
| FPS mínimo observado | 59.52 | 59.52 | 59.52 |
| Quadro p95 (ms) | 16.70 | 16.75 | 16.75 |
| Quadro p99 (ms) | 16.80 | 16.80 | 16.80 |
| CPU de tarefas do renderizador (%) | 8.24 | 7.55 | 6.93 |
| Heap JS (MiB) | 23.78 | 23.03 | 23.69 |
| Memória privada do aplicativo (MiB) | 666.70 | 1237.89 | 475.92 |
| Working set do aplicativo (MiB) | 663.49 | 536.28 | 579.61 |
| Texturas na GPU | 2.00 | 2.00 | 2.00 |
| RGBA de atlas e máscaras ativos, estimado (MiB) | 10.12 | 40.50 | 10.12 |
| Carregamento e preparação dos 32 atores (ms) | 41.80 | 92.60 | 62.70 |
| Atualização e submissão do desenho, CPU (ms) | 0.98 | 0.93 | 0.79 |

Memória privada e working set incluem os processos desse aplicativo de laboratório (principal, renderizador e GPU), coletados pela API local do Electron. Cada candidato abre uma nova janela, mas o processo principal e o processo GPU podem sobreviver entre candidatos; retenção de memória e comportamento do driver tornam esses valores inadequados para atribuir todo o aumento exclusivamente ao atlas. CPU é tempo de tarefas do renderizador via CDP, não porcentagem de todos os núcleos do computador. O tempo de desenho inclui atualização e submissão da cena no lado CPU; não é um cronômetro exclusivo da GPU. Não foi obtido tempo exclusivo de GPU por sprite. A estimativa RGBA soma albedo e máscara ativos; não inclui todos os buffers, cópias do driver e acessórios.

## Todos os candidatos e cenários

| Candidato | Cenário | FPS | Mínimo | p95 ms | p99 ms | Quadros >50 ms | Privada MiB | RGBA ativo MiB |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| baseline | solo | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 350.8 | 10.1 |
| baseline | movement | 60.00 | 59.52 | 16.70 | 16.80 | 0 | 666.7 | 10.1 |
| baseline | combat | 60.00 | 59.52 | 16.80 | 16.80 | 0 | 376.1 | 10.1 |
| baseline | spells | 60.00 | 59.52 | 16.70 | 16.80 | 0 | 522.4 | 10.1 |
| baseline | accessories | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 564.7 | 10.1 |
| original-96 | solo | 60.00 | 59.52 | 16.70 | 16.80 | 0 | 845.6 | 10.1 |
| original-96 | movement | 59.84 | 30.03 | 16.75 | 16.80 | 0 | 890.6 | 10.1 |
| original-96 | combat | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 608.0 | 10.1 |
| original-96 | spells | 60.00 | 59.52 | 16.70 | 16.80 | 0 | 848.4 | 10.1 |
| original-96 | accessories | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 878.4 | 10.1 |
| original-128 | solo | 60.00 | 59.52 | 16.70 | 16.80 | 0 | 794.2 | 18.0 |
| original-128 | movement | 60.00 | 59.52 | 16.70 | 16.80 | 0 | 1481.7 | 18.0 |
| original-128 | combat | 60.00 | 59.52 | 16.70 | 16.80 | 0 | 544.9 | 18.0 |
| original-128 | spells | 59.84 | 30.03 | 16.70 | 16.80 | 0 | 1650.6 | 18.0 |
| original-128 | accessories | 59.84 | 30.03 | 16.80 | 16.80 | 0 | 1238.7 | 18.0 |
| original-192 | solo | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 1884.3 | 40.5 |
| original-192 | movement | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 1237.9 | 40.5 |
| original-192 | combat | 59.67 | 20.00 | 16.80 | 16.80 | 0 | 942.9 | 40.5 |
| original-192 | spells | 59.84 | 30.12 | 16.80 | 16.80 | 0 | 2103.3 | 40.5 |
| original-192 | accessories | 59.84 | 30.12 | 16.70 | 16.80 | 0 | 2418.1 | 40.5 |
| original-256 | solo | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 1843.8 | 72.0 |
| original-256 | movement | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 2085.1 | 72.0 |
| original-256 | combat | 59.85 | 29.94 | 16.70 | 16.80 | 0 | 1000.7 | 72.0 |
| original-256 | spells | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 1097.1 | 72.0 |
| original-256 | accessories | 58.86 | 20.00 | 16.80 | 25.10 | 0 | 2701.5 | 72.0 |
| original-320 | solo | 59.51 | 29.94 | 16.80 | 25.05 | 0 | 1255.1 | 112.5 |
| original-320 | movement | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 2864.2 | 112.5 |
| original-320 | combat | 59.84 | 30.03 | 16.80 | 16.80 | 0 | 1196.0 | 112.5 |
| original-320 | spells | 56.13 | 5.00 | 16.75 | 75.05 | 3 | 2200.7 | 112.5 |
| original-320 | accessories | 53.80 | 4.61 | 25.05 | 83.30 | 3 | 1093.8 | 112.5 |
| original-192-linear | solo | 59.68 | 20.04 | 16.70 | 16.80 | 0 | 1625.0 | 40.5 |
| original-192-linear | movement | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 1393.3 | 40.5 |
| original-192-linear | combat | 59.84 | 29.94 | 16.70 | 16.80 | 0 | 1475.8 | 40.5 |
| original-192-linear | spells | 59.84 | 29.94 | 16.80 | 16.80 | 0 | 1747.9 | 40.5 |
| original-192-linear | accessories | 59.18 | 20.00 | 16.80 | 33.35 | 0 | 1603.5 | 40.5 |
| final | solo | 60.00 | 59.52 | 16.80 | 16.80 | 0 | 332.3 | 10.1 |
| final | movement | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 475.9 | 10.1 |
| final | combat | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 621.0 | 10.1 |
| final | spells | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 648.1 | 10.1 |
| final | accessories | 60.00 | 59.52 | 16.75 | 16.80 | 0 | 655.8 | 10.1 |

O primeiro roteiro experimental ligava o ataque a um quadro de espada enquanto a base estava sem arma. Esses registros de combate foram excluídos da comparação acima e substituídos por uma execução corrigida, com a mesma família de ação. Os registros brutos anteriores permanecem identificáveis. As demais sequências originais também diferem da animação refinada; a comparação mede candidatos de produção, não afirma igualdade anatômica entre desenhos diferentes.

## ADM e dois Alunos com recursos dos pacotes

TLS, banco e perfis temporários. A espera da pesca é sorteada pelo jogo; os cenários seguem os mesmos comandos, porém não têm duração idêntica. Cada valor abaixo agrega os dois Alunos. Foram realizadas duas rodadas, invertendo a ordem na repetição: base → final, depois final → base. A repetição foi motivada pela queda inicial superior a 10% em mineração e na árvore; as duas rodadas estão expostas.

| Rodada | Cenário | FPS 0.6.13 → final | Variação | p95 ms | p99 ms | Heap MiB |
|---:|---|---:|---:|---:|---:|---:|
| 1 | idle | 69.3 → 62.6 | -9.7% | 23.05 → 27.20 | 27.55 → 31.10 | 18.9 → 15.1 |
| 1 | fishing | 73.3 → 77.4 | +5.6% | 23.45 → 18.15 | 29.40 → 24.50 | 12.9 → 19.4 |
| 1 | mining | 79.9 → 69.3 | -13.3% | 16.45 → 20.85 | 34.15 → 38.10 | 22.7 → 25.6 |
| 1 | tree-scroll-tooltip | 79.2 → 70.3 | -11.3% | 18.15 → 21.75 | 22.55 → 26.10 | 32.7 → 16.7 |
| 2 | idle | 62.6 → 65.6 | +4.8% | 27.70 → 26.30 | 34.20 → 31.20 | 14.1 → 15.5 |
| 2 | fishing | 63.6 → 62.2 | -2.2% | 27.15 → 27.80 | 39.25 → 37.55 | 20.1 → 13.1 |
| 2 | mining | 70.1 → 70.9 | +1.2% | 18.55 → 22.00 | 34.55 → 40.05 | 12.3 → 26.7 |
| 2 | tree-scroll-tooltip | 72.8 → 72.3 | -0.6% | 19.80 → 21.15 | 25.55 → 25.65 | 23.0 → 28.1 |

Na última rodada, abertura da árvore, ponta a ponta: 122.5 → 134.2 ms. Operações síncronas de rolagem/hover: 1.102 → 1.132 ms. Isso não é tempo isolado de pintura. Os dados de preparação de áreas, inventário gráfico e memória dos processos estão nos registros completos.

A repetição não confirmou queda sustentada de FPS superior a 10% na versão final: mineração passou de −13,3% para +1,2%, e árvore de −11,3% para −0,6%. Isso demonstra sensibilidade às condições de execução, não prova equivalência perfeita. Os p95/p99 da mineração continuaram maiores no final nas duas rodadas (na segunda: 22,00/40,05 ms contra 18,55/34,55 ms); essa diferença permanece registrada como ponto de atenção, sem causa isolada. Não há justificativa para atribuir automaticamente a diferença aos reparos, já que resolução, filtro, quantidade de quadros e lógica de profissão foram preservados. Também não há base para prometer ausência de qualquer regressão em outros computadores.

## Decisão

Mantidos quadros de 96 × 96 para personagens e 128 × 128 para profissões, com correções de integridade. Não houve ampliação do personagem no mundo. Os protótipos 128/192/256/320 vieram de recortes dos originais; 320 aproxima a escala original viável. Filtragem por vizinho e linear de 192 foram comparadas. O original conserva mais detalhe estático, mas reintroduz poses e passadas que não incorporam o acabamento RV1. A filtragem linear suaviza detalhes; a maior resolução não elimina defeitos de origem ou de preparação.

O custo de albedo + máscara por família é calculável: 10,125 MiB a 96, 18 MiB a 128, 40,5 MiB a 192, 72 MiB a 256 e 112,5 MiB a 320. Doze identidades ativas a 320 exigiriam cerca de 1,32 GiB somente nesses dois mapas por identidade, antes de mundo, acessórios, buffers e cache. Essa projeção não é uma medição de doze texturas 320 simultâneas. O ensaio de 32 atores compartilha uma identidade para comparar o custo por desenho em condições equivalentes.

No candidato 320 com acessórios, a média de 53,80 FPS fica aproximadamente 10,3% abaixo dos 60 FPS da base, com p99 de 83,30 ms e quadros acima de 50 ms. É um sinal de alerta conforme o critério proposto, em janelas curtas; não foi usado sozinho para concluir inviabilidade universal. A decisão combina esse sinal, o crescimento conhecido de memória e a falta de continuidade de poses dos originais. A versão final não adotou esse custo.

Não foi adotada uma conversão integral: o benefício estático não justifica substituir animações corrigidas por ciclos de origem ainda inconsistentes, além do custo crescente de memória e das oscilações registradas. Isso é uma rejeição da migração integral nesta entrega, não uma conclusão de que qualquer resolução maior seria inviável. Os candidatos e metadados permanecem isolados para trabalho futuro. Não se afirma ganho geral de desempenho.

Ambiente e medições adicionais:
```json
{
  "node": "v24.21.0",
  "cpu": "AMD Ryzen 5 6600H with Radeon Graphics         ",
  "os": "Windows 11 Home Single Language",
  "viewport": [
    1280,
    800
  ]
}
```

## Três clientes finais no mesmo computador

Ensaio separado, com três processos Aluno, banco temporário e serviço de teste local. Não é uma comparação com três computadores separados nem uma medição de LAN escolar. A coleta de memória dos processos ocorreu depois das janelas de quadros.

| Cenário | Cliente | FPS | p95 ms | Máximo ms | CPU de tarefas % | Heap MiB |
|---|---:|---:|---:|---:|---:|---:|
| 01-cidade-clientes-reais | 1 | 41.0 | 37.00 | 264.30 | 96.6 | 17.5 |
| 01-cidade-clientes-reais | 2 | 40.1 | 40.40 | 86.50 | 98.4 | 14.6 |
| 01-cidade-clientes-reais | 3 | 37.7 | 52.20 | 120.20 | 98.3 | 17.3 |
| 02-combate-lobo-branco | 1 | 63.2 | 23.70 | 68.10 | 98.5 | 37.3 |
| 02-combate-lobo-branco | 2 | 67.4 | 21.40 | 47.20 | 99.1 | 43.7 |
| 02-combate-lobo-branco | 3 | 64.6 | 24.60 | 62.10 | 99.0 | 34.3 |

As oscilações deste ensaio refletem três mundos renderizados no mesmo equipamento; não devem ser ocultadas pela média próxima de 60 FPS do laboratório simplificado. O ensaio aprova sincronização funcional, não garante 60 FPS em todos os cenários. Carrinho e mochila foram observados localmente e nos dois clientes remotos. As capturas de recoil e morte usaram alterações somente no estado temporário do servidor, após as medições, para tornar as etapas observáveis.

[Laboratório base e protótipos](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/work/iteration38/benchmark-baseline-prototypes.json>)

[Combate experimental corrigido](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/work/iteration38/benchmark-combat-corrected.json>)

[Laboratório final](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/work/iteration38/benchmark-final.json>)

[Pacotes 0.6.13](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration38-before-1793512226991/report.json>)

[Pacotes 0.6.14](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration38-after-1793512113143/report.json>)

[Combate e transições com três clientes](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration38-combat-final-1793511787398/report.json>)

[Rodada 1 — before](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration38-before-1793511403407/report.json>)

[Rodada 2 — before](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration38-before-1793512226991/report.json>)

[Rodada 1 — after](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration38-after-1793511615115/report.json>)

[Rodada 2 — after](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration38-after-1793512113143/report.json>)


## Texturas e preservação do carregamento

Limite de textura informado pelo renderizador nesta máquina: **16384 pixels**. Maior atlas ensaiado: 2.880 × 5.120. A produção mantém 864 × 1.536 e 1.024 × 1.024, sem cortes na borda da célula na auditoria.

O cache carrega sob demanda, compartilha a fonte por identidade/família, mantém no máximo oito entradas ociosas e libera albedo e máscara na expulsão. A animação muda a região da textura, sem recriar atlas a cada quadro. Produção usa vizinho mais próximo e não gera mipmaps; amostragem linear foi somente experimental. Os espaços transparentes das células e seus recortes foram mantidos; não se introduziu extrusão ou compactação que alterasse pivôs. A cor usa sRGB, a máscara permanece sem conversão de cor. As falhas corrigidas estavam nos PNGs de entrada; não se alterou premultiplicação para encobri-las. Esta entrega preserva esse carregamento, sem alegar uma otimização de cache que não foi realizada.

No laboratório, os 32 objetos são preparados de início; o cenário solo exibe apenas um deles. Portanto, sua memória inclui os objetos ocultos. A fonte de textura é compartilhada. A base e o combate corrigido foram medidos antes da instalação dos caminhos v38; o roteiro arquivado passou a selecionar explicitamente o atlas antigo também em execuções futuras.
