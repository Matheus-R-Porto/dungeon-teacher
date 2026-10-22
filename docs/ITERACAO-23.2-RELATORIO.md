# Iteração 23.2 — Beta 0.6.2: A Torre Sem Esperas

Implementação no mesmo checkout, com comparação local da 0.6.1 e preservação das alterações anteriores. O resultado reduz pausas de reconstrução, mas não elimina todos os congelamentos. As metas aspiracionais de máximo abaixo de 50 ms e ausência de quadros acima de 100 ms não foram alcançadas em todos os cenários.

## Diagnóstico e decisões

### Resumo executivo

Nas 25 trocas de andar da bateria final, a mediana do p99 por troca caiu de 141,90 para 33,30 ms; o pior quadro passou de 792,70 para 75,30 ms. O custo foi aumentar a latência mediana de 495,80 para 572,50 ms. Nas cinco entradas de arena, a mediana do p99 caiu de 125,30 para 25,00 ms, mas a latência mediana subiu de 522,50 para 777,90 ms. Portanto, a melhoria comprovada é distribuir a preparação e reduzir pausas, não eliminar a espera total.

Nos retornos de arena ainda houve um quadro de 182,90 ms e mais intervalos acima de 33/50 ms, embora menos acima de 100 ms. O ensaio prolongado também registrou pausas residuais. As metas mais exigentes de frametime permanecem não alcançadas. Exploração e combate tiveram variação pequena nos valores médios, inclusive algumas regressões pontuais: não se declara ganho geral de FPS.

O servidor final sustentou 19,99 Hz com 32 clientes simulados e oito arenas, encerrando com zero arenas remanescentes. Os testes de Electron confirmaram recuperação, perfis gráficos, campanha, combate e retorno após vitória. O build e os 645 testes passaram.

A referência 0.6.1 foi executada antes de substituir dist: cenários A–F existentes e cinco ciclos adicionais de andares/arena. O código de referência dos pontos de integração está em `.logs/iteration232-reference`. Não houve reset de checkout. A referência de exploração atual foi mais rápida que a histórica da 23.1; somente o par medido nesta sessão entra na comparação.

Na primeira instrumentação incremental, unidades de construção ficaram abaixo de 16 ms nos exemplos inspecionados, enquanto o primeiro render custou 140–380 ms. São medições do tempo de chamada no cliente, não uma decomposição exata do driver em upload/compilação/execução GPU. `compileAsync` sozinho não eliminou o pico. Espera assíncrona de shader ou decode não deve ser confundida com bloqueio síncrono.

Experimentos intermediários preservados nos logs: `first-transitions`, `gpu-batches`, `source-reuse`, `single-upload`, `target-shaders`, `bounded-shadows`. Lotes de 12 objetos ainda concentravam picos; um objeto por frame produziu esperas de 2–3 segundos; renderizar sombras grandes repetidamente na preparação também gerou trabalho desnecessário. A estratégia final usa orçamento de CPU de 3 ms entre unidades, variantes de shader de tela e de render target preparadas, render target de 32×32 e sombra temporária de 32×32. A sombra temporária é descartada e a resolução normal do perfil é restaurada antes da apresentação. Não há redução de qualidade visual durante gameplay.

Preparar todo o mapa na GPU aumentou geometrias residentes e espera. A versão final limita esse aquecimento ao primeiro enquadramento e aos objetos que projetam sombras nele. A cena completa, as colisões e todos os inimigos continuam construídos. Não há remoção de conteúdo nem cache de mapas.

## Arquitetura

- `SceneView` mantém a API síncrona para compatibilidade e adiciona construção adiada por iterador. Floresta, decoração e vegetação oferecem pontos de cessão; cidade e alguns blocos antigos ainda são unidades síncronas. Não se afirma que cada função foi subdividida.
- `runSceneWork` respeita dependências, consulta cancelamento entre unidades e cede ao RAF quando o orçamento se esgota. Uma unidade de JS ou chamada de driver não pode ser preemptada; 3 ms é orçamento cooperativo, não garantia de pico máximo.
- `SceneTransition` mantém uma preparação pendente e a cena anterior até a nova estar preparada. O renderer é único. O cenário antigo fica estável; a apresentação de carregamento continua animada. A simulação online permanece no servidor.
- Materiais do destino são compilados antes do descarte dos anteriores para permitir reutilização de programas. O render target temporário é sempre descartado. Geometrias, materiais, UV textures, shadows e listeners da cena anterior seguem o descarte existente.
- `WorldClient` valida e recebe snapshots enquanto prepara o mapa, mas só aplica o mais recente à cena pronta. Socket, epoch e geração de preparação impedem publicação obsoleta. Não há fila crescente de snapshots.
- Campanha local suspende seu loop de simulação e atualização da cena enquanto prepara a troca. O save e a autoridade da campanha não são compartilhados com o servidor.
- Entrada de arena continua dependendo do protocolo autoritativo e da confirmação coletiva. Nenhum dado privado é antecipado.

## Antecipação e limites

Perto da porta do Cavaleiro, o cliente pode decodificar o atlas público já distribuído com o jogo. Não antecipa layout privado, participantes ou posições. Há um único slot, limite de 8 MiB, checagem de proximidade/superfície a cada 250 ms, deduplicação, cancelamento ao se afastar/desconectar e descarte da referência especulativa. O atlas de 1280×640 ocupa aproximadamente 3,125 MiB de pixels RGBA; overhead do decodificador não é medido. Texturas utilizadas por uma cena ativa não são descartadas pela antecipação. O cache de fontes de arte preexistente não vira cache de mundos.

Os demais recursos são preparados após a confirmação/dados de mapa recebidos. Não foi implementado carregamento indiscriminado dos próximos andares nem previsão de múltiplos portais. Para esses casos, só há um destino autoritativo por geração; trocar o destino cancela a preparação anterior. O benefício isolado da antecipação do atlas deve ser distinguido do benefício medido do pipeline inteiro; não atribuir a ela ganhos de FPS sem A/B específico.

`Texture.clone()` marcava o Source compartilhado como alterado mesmo quando só os UVs diferiam. O atlas agora inicializa uma textura nova com os mesmos pixels sem invalidar novamente o Source. Teste verifica Source compartilhado, versão estável e UVs distintos. Isso confirma remoção de invalidação redundante, não quantifica isoladamente um ganho de frametime.

## Métricas e limites de interpretação

Tempos de etapas são registrados em `view.transitionReport`, incluídos no diagnóstico F10. `shader-submit` é síncrono; `shaders`, `textures`, `gpu-shaders` e `gpu-preparation` incluem espera. Somá-los aos subestágios duplica trabalho. `maxUnit` cobre as unidades registradas, não todos os callbacks do processo. `disposalMs` e `firstRender` são separados. Memória JS é estimativa de `performance.memory`; contadores Three não equivalem a bytes exatos de VRAM.

O protocolo combina confirmação autoritativa e dados de destino no welcome; não há dois timestamps independentes. `requestToWelcome` inclui a espera de protocolo/prontidão coletiva, quando existe comando real do cliente. Transferências do fixture não têm esse valor. Latência externa dos benchmarks inclui polling de até 100 ms. O retorno após derrota inclui aproximadamente oito segundos de regra do encontro: não é carregamento gráfico.

Primeiro render é a duração da submissão WebGL. Dois RAFs posteriores são somente proxy de oportunidade de apresentação, não prova do instante físico de scanout. Contagens de intervalos acima do orçamento são observadas; frames realmente perdidos não são conhecidos com precisão, especialmente num monitor de 120 Hz. Não inventar esse número.

Mesmo computador, dois Electron, AMD integrada, janela 1282×722, DPR 1,25, perfil Alto e ajuste dinâmico desligado. VSync padrão e controle de oclusão iguais. Comparação de perfis não conta como otimização estrutural. Definições de FPS/lows/percentis são as de `frame-metrics.js`: 1% low com ≥100 quadros; p99,9/0,1% low somente com ≥10.000.

O benchmark prolongado mantém RAF externo às cenas e inclui carregamentos. A visão gameplay filtra somente os frames marcados `loading`; não representa a sessão completa. CPU profiler, screenshots e variação de combate podem causar ruído, especialmente nas caudas curtas. Cinco repetições permitem mostrar mediana e dispersão, não declarar significância estatística.

## Segurança, falhas e regressões

Cancelamento fecha o iterador, aborta esperas e descarta a cena parcial. Preparação tem prazo máximo de 15 segundos e esperas individuais limitadas; não pode interromper uma chamada WebGL bloqueada. Falha online remove a camada de carregamento, apresenta mensagem e permite reconectar. Falha local usa a recuperação existente, preservando o último save confirmado. Falhas de compilação, timeout e cancelamento não concedem recompensas nem alteram mapas no servidor.

A revisão visual encontrou um erro de inicialização na campanha que o primeiro roteiro aceitava indevidamente apenas por encontrar `__dmInspection`. A ordem foi corrigida e o roteiro passou a exigir ausência de tela fatal, além de visitar dois andares e voltar ao Refúgio. O primeiro resultado `edges` não comprova campanha funcional; usar `edges-final`.

HUD, controles existentes, geografia, população de 155 monstros comuns, Lobo Branco público, Cavaleiro, Parties de seis, limite de 32 jogadores, scheduler de 20 Hz, combate, recompensa e desbloqueio não foram redesenhados ou reduzidos. Não houve commit, deploy, instalador, reset de save ou mudança em dados remotos.

## Validação e riscos restantes

Suíte completa: 645/645 testes aprovados, sem falhas ou skips, em 97,76 s; 17 testes novos. Build de produção aprovado, com aviso de tamanho de chunk já existente. Logs: `.logs/iteration232-suite-final.txt` e `.logs/iteration232-build-final.txt`. Os resultados Electron e de servidor são apresentados abaixo com suas fontes.

Picos residuais e maior latência de preparação devem permanecer explícitos. Não há validação em PCs escolares, WAN ou 32 clientes gráficos físicos. Não há garantia de 60 FPS estáveis. Cidade ainda contém construção síncrona; primeira decodificação de atlas e chamadas indivisíveis do driver continuam candidatas a pausas. Reavaliação após o teste escolar é recomendação futura, não início de outra iteração.

## Detalhamento e limites adicionais

As funções legadas constroem geometria e materiais conjuntamente: suas durações são medidas por unidade de construção, não como duas parcelas puras e independentes. Animações e câmera têm trabalho incluído na inicialização das entidades, além do ajuste de projeção. Não foi obtida uma decomposição exata de cada chamada interna do driver. Inventários Three medem recursos residentes por amostra; não são um contador completo de bytes alocados/liberados durante cada chamada.

O ensaio de 649,93 s inclui 80 transferências/retornos registrados, dez ciclos e combate alternado com movimento. A primeira tentativa foi descartada após o driver se afastar da porta; o servidor recusou corretamente a entrada. O roteiro foi corrigido para regressar à porta. Após o ensaio, foram acrescentadas proteções para aguardar o primeiro snapshot e atlas da arma, para timeout/cancelamento e para evitar limpar o canvas quando seu tamanho não muda. A suíte e as verificações curtas foram repetidas na versão final; o ensaio longo não deve ser tratado como uma segunda sessão após essas proteções.

A visão gameplay ainda apresentou picos: o pior quadro de 242,30 ms está nessa classificação. Assim, filtrar carregamento não prova ausência de pausas imediatamente após uma troca, nem fluidez perfeita fora dela. A localização da causa de cada outlier residual permanece inconclusiva.

O hardware continua sendo Windows 11, Ryzen 5 6600H, cerca de 7,24 GiB de RAM utilizável e AMD integrada via ANGLE/D3D11; Node 24.19.0, Electron 44.5.1 e Three 0.186.1. A resolução interna efetivamente registrada nesta bateria foi 1601×902 (perfil Alto), contra a aproximação histórica de 1602×902. Antes e depois desta bateria usaram o mesmo tamanho.

## Causas, hipóteses e próximos cuidados

**Confirmado por instrumentação:** o primeiro render concentrava trabalho muito maior que várias unidades de construção; a invalidação redundante de Source ocorria nas cópias de UV; aquecer toda a cena elevava recursos residentes. As mudanças atacam esses trabalhos, com comparação conjunta antes/depois. Não existe atribuição numérica isolada a cada correção.

**Estratégias investigadas e rejeitadas:** apenas compilar shaders não resolveu os picos; aquecer todos os objetos e repetir sombras de resolução completa aumentou custo; ceder um frame por objeto prolongou demais a espera. Isso não descarta shaders, sombras ou upload como participantes do custo: descarta essas estratégias como solução suficiente.

**Ainda inconclusivo:** a origem exata de cada pico residual no driver, coleta de lixo ou callbacks não foi isolada. A comparação das quatro condições de antecipação é exploratória, com uma amostra por condição; não comprova benefício causal isolado do atlas. Não há evidência para reabrir o agendador de servidor nem reduzir conteúdo.

Como trabalho futuro, medir no hardware escolar, capturar traces dos outliers restantes e subdividir unidades legadas apenas quando esses traces justificarem. Repetir o ensaio prolongado na build que for distribuída, especialmente após outras mudanças. Essas recomendações não iniciam outra iteração.

## Verificações visuais e arquivos desta iteração

O roteiro final de gameplay aguardou tanto o estado autoritativo quanto a cena pronta: derrotou um inimigo comum, percorreu a rampa da caverna e as escadas da fortaleza, verificou quatro indicadores do Cavaleiro no perfil Desempenho, alcançou sua segunda fase e venceu. A captura `public-return.png` foi inspecionada após o carregamento e mostra o personagem de volta à fortaleza com a passagem liberada. A persistência do desbloqueio é coberta pela suíte existente; a captura sozinha não comprova persistência.

Os testes de borda cobriram três perfis, destino substituído, cancelamento de antecipação, falha de compilação, desconexão/reconexão, F10 e retorno da campanha ao Refúgio. As imagens confirmam cena, personagem e HUD presentes; são validações automatizadas com inspeção de capturas, não um playtest humano prolongado.

Arquivos de implementação: `src/core/scene-work.js`, `src/core/preparation-slot.js`, `src/adapters/rendering/asset-anticipation.js`, `scene-transition.js`, `scene-warmup.js`, `scene.js`, `forest.js`, `living-forest.js`, `art.js`; `src/multiplayer/world-client.js`, `world-mode.js`; `src/main.js`, `src/ui/graphics-settings.js` e `src/style.css`.

Validação: `tests/iteration232.test.js`; `scripts/iteration232-electron.mjs`, `iteration232-transitions.mjs`, `iteration232-edge.mjs`, `iteration232-anticipation.mjs`, `iteration232-gameplay.mjs`, `iteration232-report.mjs`. Metadados/documentação: `package.json`, `package-lock.json`, `server/package.json`, `server/package-lock.json`, `config/multiplayer.json`, `electron-builder.yml`, `README.md`, `CHANGELOG.md`, este relatório e `ITERACAO-23.2-DESEMPENHO.json`. Alterações anteriores do checkout foram preservadas; esta lista não atribui a esta iteração todo o diff acumulado.

<!-- MEASURED_RESULTS -->

## Resultados medidos

Comparação de cinco ciclos; mesmas condições gráficas. Latência externa inclui espera autoritativa e polling do driver. Retorno de arena inclui o prazo de resultado do servidor.

| Grupo | Versão | N | Latência mediana (ms) | p99 mediano (ms) | Pico mediano (ms) | Pior quadro (ms) | >33 / >50 / >100 ms |
|---|---|---:|---:|---:|---:|---:|---|
| floors | baseline | 25 | 495.80 | 141.90 | 333.70 | 792.70 | 55 / 50 / 50 |
| floors | after | 25 | 572.50 | 33.30 | 50.10 | 75.30 | 44 / 18 / 0 |
| arenaEntry | baseline | 5 | 522.50 | 125.30 | 200.40 | 508.90 | 13 / 11 / 11 |
| arenaEntry | after | 5 | 777.90 | 25.00 | 49.70 | 100.30 | 8 / 3 / 1 |
| arenaReturn | baseline | 5 | 8554.90 | 16.80 | 325.50 | 375.70 | 17 / 14 / 10 |
| arenaReturn | after | 5 | 8940.50 | 16.80 | 75.30 | 182.90 | 31 / 23 / 2 |

### Cada transição e dispersão

| Versão | Visita/ciclo/destino | FPS | p95 | p99 | 1% low | Pico | Latência externa |
|---|---|---:|---:|---:|---:|---:|---:|
| baseline | first-0-floor-1 | 47.86 | 24.10 | 149.90 | 2.12 | 792.70 | 1020.90 |
| baseline | first-0-floor-2 | 62.05 | 25.10 | 133.50 | 4.36 | 325.40 | 689.10 |
| baseline | first-0-floor-1 | 62.19 | 16.80 | 133.40 | 3.69 | 408.80 | 569.30 |
| baseline | first-0-floor-2 | 63.02 | 17.00 | 116.80 | 5.10 | 275.30 | 418.80 |
| baseline | first-0-floor-3 | 36.28 | 25.10 | 558.90 | — | 558.90 | 969.40 |
| baseline | arena-enter-0 | 71.36 | 16.80 | 175.10 | 2.92 | 508.90 | 972.80 |
| baseline | arena-return-0 | 109.03 | 8.70 | 16.80 | 15.47 | 350.60 | 8596.30 |
| baseline | revisit-1-floor-1 | 65.61 | 16.90 | 33.90 | 4.44 | 416.90 | 471.50 |
| baseline | revisit-1-floor-2 | 59.33 | 24.90 | 300.50 | — | 300.50 | 453.30 |
| baseline | revisit-1-floor-1 | 57.65 | 17.30 | 142.00 | 3.93 | 367.10 | 538.50 |
| baseline | revisit-1-floor-2 | 59.35 | 25.10 | 158.60 | 4.06 | 333.70 | 514.90 |
| baseline | revisit-1-floor-3 | 44.89 | 25.20 | 342.10 | — | 342.10 | 687.70 |
| baseline | arena-enter-1 | 91.58 | 16.60 | 125.30 | 5.99 | 208.70 | 558.40 |
| baseline | arena-return-1 | 109.25 | 8.80 | 16.80 | 16.25 | 325.50 | 8600.50 |
| baseline | revisit-2-floor-1 | 64.90 | 16.90 | 141.90 | 4.20 | 333.80 | 501.90 |
| baseline | revisit-2-floor-2 | 64.45 | 17.00 | 141.90 | 4.80 | 275.20 | 448.50 |
| baseline | revisit-2-floor-1 | 63.35 | 17.00 | 133.50 | 4.00 | 367.00 | 537.20 |
| baseline | revisit-2-floor-2 | 62.95 | 17.10 | 141.70 | 4.79 | 275.50 | 430.10 |
| baseline | revisit-2-floor-3 | 49.67 | 25.10 | 333.80 | — | 333.80 | 650.30 |
| baseline | arena-enter-2 | 95.42 | 16.30 | 125.10 | 6.48 | 183.60 | 501.20 |
| baseline | arena-return-2 | 108.37 | 8.70 | 16.90 | 14.03 | 375.70 | 8539.10 |
| baseline | revisit-3-floor-1 | 66.65 | 17.10 | 141.80 | 4.21 | 333.60 | 495.80 |
| baseline | revisit-3-floor-2 | 55.97 | 25.20 | 275.40 | — | 275.40 | 439.40 |
| baseline | revisit-3-floor-1 | 56.81 | 17.10 | 359.00 | — | 359.00 | 394.00 |
| baseline | revisit-3-floor-2 | 61.98 | 16.90 | 150.10 | 4.28 | 317.10 | 491.50 |
| baseline | revisit-3-floor-3 | 44.57 | 25.20 | 384.00 | — | 384.00 | 739.50 |
| baseline | arena-enter-3 | 94.97 | 16.50 | 116.50 | 6.31 | 200.40 | 522.50 |
| baseline | arena-return-3 | 109.48 | 8.80 | 16.80 | 17.54 | 300.30 | 8527.30 |
| baseline | revisit-4-floor-1 | 66.13 | 17.30 | 133.50 | 4.36 | 325.30 | 489.60 |
| baseline | revisit-4-floor-2 | 62.96 | 16.80 | 125.20 | 4.80 | 291.90 | 444.50 |
| baseline | revisit-4-floor-1 | 63.45 | 16.90 | 125.10 | 4.36 | 333.80 | 487.60 |
| baseline | revisit-4-floor-2 | 65.77 | 17.10 | 133.70 | 4.99 | 267.00 | 425.70 |
| baseline | revisit-4-floor-3 | 48.71 | 17.10 | 318.80 | — | 318.80 | 617.80 |
| baseline | arena-enter-4 | 96.01 | 16.40 | 142.00 | 6.84 | 150.30 | 468.10 |
| baseline | arena-return-4 | 109.70 | 8.70 | 16.80 | 16.87 | 317.00 | 8554.90 |
| after | first-0-floor-1 | 81.24 | 25.10 | 50.20 | 15.60 | 75.00 | 1294.20 |
| after | first-0-floor-2 | 88.10 | 16.90 | 25.10 | 34.13 | 33.50 | 1021.30 |
| after | first-0-floor-1 | 83.85 | 17.00 | 42.10 | 17.08 | 75.00 | 563.90 |
| after | first-0-floor-2 | 84.80 | 16.90 | 33.30 | 29.85 | 33.70 | 565.90 |
| after | first-0-floor-3 | 86.59 | 16.90 | 41.90 | 18.86 | 75.30 | 1138.00 |
| after | arena-enter-0 | 105.28 | 8.70 | 50.20 | 14.36 | 100.30 | 990.60 |
| after | arena-return-0 | 109.50 | 16.40 | 16.90 | 19.65 | 182.90 | 9119.60 |
| after | revisit-1-floor-1 | 92.38 | 16.90 | 24.80 | 40.16 | 25.00 | 490.50 |
| after | revisit-1-floor-2 | 90.14 | 16.90 | 25.40 | 26.49 | 50.10 | 507.80 |
| after | revisit-1-floor-1 | 85.21 | 17.00 | 42.00 | 18.42 | 66.60 | 572.50 |
| after | revisit-1-floor-2 | 89.75 | 16.80 | 33.40 | 29.85 | 33.60 | 515.20 |
| after | revisit-1-floor-3 | 86.08 | 16.80 | 41.90 | 18.37 | 67.00 | 951.90 |
| after | arena-enter-1 | 110.82 | 16.40 | 25.20 | 32.64 | 33.40 | 777.90 |
| after | arena-return-1 | 111.36 | 8.80 | 16.80 | 25.18 | 75.10 | 8915.70 |
| after | revisit-2-floor-1 | 90.62 | 17.10 | 25.40 | 23.78 | 58.70 | 490.10 |
| after | revisit-2-floor-2 | 88.84 | 16.90 | 25.00 | 39.84 | 25.20 | 476.30 |
| after | revisit-2-floor-1 | 90.03 | 16.90 | 25.20 | 19.96 | 75.00 | 509.00 |
| after | revisit-2-floor-2 | 91.42 | 16.80 | 25.20 | 39.60 | 25.30 | 586.20 |
| after | revisit-2-floor-3 | 88.14 | 16.90 | 42.00 | 21.72 | 50.10 | 948.20 |
| after | arena-enter-2 | 111.30 | 8.80 | 25.00 | 29.97 | 49.90 | 781.00 |
| after | arena-return-2 | 111.91 | 8.90 | 16.80 | 28.15 | 66.70 | 8845.90 |
| after | revisit-3-floor-1 | 89.60 | 16.90 | 24.90 | 34.31 | 33.40 | 476.40 |
| after | revisit-3-floor-2 | 93.02 | 16.90 | 25.00 | 34.31 | 33.30 | 479.00 |
| after | revisit-3-floor-1 | 87.02 | 16.90 | 33.50 | 18.43 | 75.00 | 630.50 |
| after | revisit-3-floor-2 | 91.45 | 16.80 | 25.30 | 29.94 | 41.50 | 576.30 |
| after | revisit-3-floor-3 | 86.61 | 16.90 | 41.70 | 20.02 | 58.20 | 942.50 |
| after | arena-enter-3 | 109.91 | 16.70 | 25.00 | 29.97 | 41.90 | 690.70 |
| after | arena-return-3 | 110.69 | 9.20 | 16.90 | 22.41 | 158.50 | 8947.50 |
| after | revisit-4-floor-1 | 85.27 | 17.00 | 25.30 | 34.07 | 33.40 | 459.40 |
| after | revisit-4-floor-2 | 94.27 | 16.90 | 33.20 | 30.09 | 33.30 | 1254.60 |
| after | revisit-4-floor-1 | 79.90 | 16.80 | 41.90 | 17.11 | 75.00 | 547.30 |
| after | revisit-4-floor-2 | 86.96 | 16.80 | 41.90 | 21.69 | 50.30 | 589.30 |
| after | revisit-4-floor-3 | 80.50 | 16.90 | 50.40 | 17.09 | 66.60 | 1079.90 |
| after | arena-enter-4 | 110.17 | 16.60 | 25.00 | 27.70 | 49.70 | 749.80 |
| after | arena-return-4 | 110.88 | 9.00 | 16.80 | 23.13 | 75.30 | 8940.50 |

O prefixo `first-0` identifica o primeiro **ciclo**, não garante visita inédita: dentro dele há revisitas a 1 e 2. Primeiras visitas são as primeiras ocorrências de cada destino. A caverna e a fortaleza pertencem a mapas existentes, sem troca autoritativa de mapa ao atravessar suas rampas.

### Sessão prolongada

| Janela | Quadros | Segundos | FPS | p95 | p99 | p99,9 | 1% low | 0,1% low | Pico | >100 ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| aggregate | 63956 | 649.93 | 98.41 | 16.80 | 25.00 | 116.80 | 18.63 | 6.37 | 242.30 | 85 |
| gameplay | 59108 | 596.46 | 99.10 | 16.80 | 17.40 | 100.20 | 22.85 | 6.48 | 242.30 | 62 |
| loading | 4848 | 53.47 | 90.67 | 25.10 | 67.00 | — | 10.10 | — | 175.00 | 23 |

### Exploração e combate: janelas de 30 segundos

| Versão | Cenário | FPS | p99 | 1% low | Pico |
|---|---|---:|---:|---:|---:|
| scenesBefore | A-exploration | 91.30 | 18.50 | 46.78 | 41.30 |
| scenesBefore | B-populated | 85.40 | 19.90 | 41.07 | 44.10 |
| scenesBefore | C-white-wolf | 116.05 | 18.20 | 43.78 | 42.70 |
| scenesBefore | D-fortress | 80.31 | 17.90 | 50.84 | 26.50 |
| scenesBefore | E-knight | 118.85 | 9.90 | 55.56 | 106.20 |
| scenesBefore | F-transitions | 51.74 | 334.10 | 2.19 | 809.40 |
| scenesAfter | A-exploration | 88.03 | 19.90 | 43.98 | 30.30 |
| scenesAfter | B-populated | 86.08 | 19.70 | 45.15 | 26.80 |
| scenesAfter | C-white-wolf | 118.06 | 14.10 | 58.00 | 29.30 |
| scenesAfter | D-fortress | 79.49 | 19.30 | 45.33 | 34.60 |
| scenesAfter | E-knight | 119.00 | 10.50 | 57.61 | 84.60 |
| scenesAfter | F-transitions | 86.88 | 42.00 | 17.98 | 66.60 |

### Recursos nas amostras pós-transição

| Grupo | Versão | Heap mínimo–máximo (MiB) | Geometrias GPU | Texturas GPU |
|---|---|---:|---:|---:|
| floors | baseline | 14.80–42.00 | 31–127 | 8–9 |
| floors | after | 16.48–54.46 | 31–121 | 7–8 |
| arenaEntry | baseline | 23.94–38.35 | 37–37 | 6–6 |
| arenaEntry | after | 21.60–40.29 | 37–37 | 5–5 |
| arenaReturn | baseline | 26.93–32.35 | 32–32 | 8–9 |
| arenaReturn | after | 16.08–40.40 | 32–32 | 7–8 |

### Antecipação: comparação exploratória

Uma amostra por condição, com 70 inimigos comuns vivos no mapa público. Não demonstra significância nem isola todo o ruído de compilação/cache. Estado parcial é observado no instante da solicitação e pode terminar durante a confirmação do servidor.

| Condição | Estado observado | Latência (ms) | p99 (ms) | Pico (ms) | >100 ms |
|---|---|---:|---:|---:|---:|
| none | none | 1017.80 | 33.10 | 100.20 | 1 |
| complete | ready | 748.50 | 25.40 | 41.50 | 0 |
| partial-at-request | pending | 739.30 | 24.80 | 33.30 | 0 |
| cancelled | none | 802.00 | 33.60 | 50.00 | 0 |

### Servidor: validação independente

Servidor e driver no mesmo processo Node, sem Electron concorrente. Código de simulação e scheduler não alterado. Comparação histórica da 23.1: 20,03 Hz, tick p99 34,26 ms, máximo 86,56 ms; não tratar diferenças como ganho causado pela preparação gráfica.

| Cenário | Jogadores | Arenas | Hz | Tick p95 | Tick p99 | Tick máximo | Arenas restantes após limpeza |
|---|---:|---:|---:|---:|---:|---:|---:|
| 32-mixed-eight-arenas | 32/32 | 8 | 19.99 | 13.60 | 25.77 | 53.79 | 0 |

### Evidências

- baseline: `.logs/iteration232-baseline-transitions-1792548402421/report.json`
- after: `.logs/iteration232-final-transitions-1792551517728/report.json`
- soak: `.logs/iteration232-soak-1792550177791/report.json`
- gameplay: `.logs/iteration232-gameplay-1792551706273/report.json`
- anticipation: `.logs/iteration232-anticipation-1792551643000/report.json`
- edges: `.logs/iteration232-edges-final-1792551338824/report.json`
- scenesBefore: `.logs/iteration231-232-baseline-1792548172781/report.json`
- scenesAfter: `.logs/iteration232-scenes-after-1792551087487/report.json`
- server: `.logs/iteration23-load-1792551761168/report.json`
