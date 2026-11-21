# Dungeon Teacher — Iteração 37

Versão **0.6.11**. Validação técnica concluída em 31/10/2026. **Aprovação artística provisória, aguardando inspeção do usuário.**

[Galeria de capturas](capturas/iteration37/index.html) · [Aplicativos e hashes](ITERACAO-37-DISTRIBUICAO.md) · [Habilidades](ITERACAO-37-HABILIDADES.md) · [Arquivos](ITERACAO-37-ARQUIVOS.md)

[Registros de validação](dados/iteracao37/) — suíte integral, retestes, auditorias, medições completas e manifesto dos pacotes.

## 1. Resumo executivo

A iteração substitui a composição anatômica em tempo real por desenhos completos preparados, acrescenta interrupção autoritativa por dano forte e reconstrói o Lobo Branco. Contempla seis classes, dois corpos, quatro direções e quatro famílias de armas, além do estado sem arma. Mapas, numeração, progressão e sistemas de itens foram preservados.

O usuário autorizou explicitamente o acabamento manual dos pixels. Estudos gerados que repetiam passadas foram substituídos por quatro poses de contato/passagem preparadas fora do jogo. A arquitetura nova seleciona quadros e aplica cores; não reconstrói pernas, braços, mãos ou armas durante a execução.

## 2. Arquitetura anterior e nova

A RV2 usava peças modulares, composição em canvas, articulações, encaixes e transições calculadas. O caminho principal agora é `SpriteActor → SheetActor → sheet-animation`, com atlas por classe/corpo/família, seleção de UV e máscara de dois tecidos no material.

Há 60 atlas principais e 60 máscaras, mais mochila, carrinho e Lobo Branco. Células de 96 × 96; grade de 9 × 16; 36 posições por direção. São 8.640 posições endereçáveis, **não 8.640 desenhos únicos**: repouso, recuperação e famílias de gestos reaproveitam poses; cada uma das quatro fases da passada ocupa duas posições do esquema. Tamanho total dos novos PNGs: 28.35 MiB.

Texturas de uma mesma combinação compartilham a fonte. Mudanças de cores atualizam parâmetros do material, sem gerar outro atlas. A cache retém até oito combinações ociosas, além das utilizadas por personagens visíveis; trocas rápidas e descarte liberam referências pendentes.

## 3. Recursos substituídos e preservados

O compositor modular, os cálculos de anatomia e as peças individuais não participam mais do caminho de produção dos personagens nem das prévias. Seus arquivos permanecem como referência histórica para os testes da RV2; não são uma segunda opção de renderização no produto. Pesca e mineração conservam seus quadros completos específicos e seus eventos reais. Mochila, escudo e carrinho usam apenas peças estáticas com posicionamento simples.

Foram conferidos 297 PNGs anteriores e 53 executáveis anteriores: nenhum foi alterado ou removido. A cópia de código anterior e seus hashes estão em `work/iteration37/before` e `baseline.json`. `sources/` não foi editada.

## 4. Identidade das classes

| Classe | Identidade visual |
|---|---|
| Novato | Roupa leve de aventureiro, mangas claras e silhueta simples. |
| Guerreiro | Ombreiras, proteção metálica, tabardo e postura firme. |
| Arqueiro | Aljava, roupa de exploração e manto assimétrico. |
| Ladino | Colete leve, braços livres, gola alta e lâminas curtas. |
| Sacerdote | Túnica clara, estola e gestos de magia sagrada. |
| Mago | Chapéu pontudo dobrado, camadas de tecido e conjuração. |

As duas versões corporais de cada classe usam a mesma escala de célula e referência de chão. A aparência não muda hitboxes.

## 5. Animações produzidas

Repouso guardado/empunhado, caminhada guardada/empunhada, preparação, execução, recuperação, conjuração, cura, suporte, área, deslocamento de habilidade, recoil, morte e transição de arma. Quatro desenhos de passada alternam pés e braços, com oscilação discreta do tronco. A progressão segue distância percorrida, com ciclo de 1,8 unidade; parar não continua a caminhada.

Morte tem prioridade máxima. Recoil confirmado e sua recuperação precedem ataques e habilidades. Dano leve pode alterar a cor brevemente, mas não toma o lugar da pose de ataque. A execução básica confirmada tem uma janela visual curta de 0,12 s. Cada golpe da Sequência de Adagas também expõe sua própria confirmação visual.

## 6. Quatro famílias de armas

Espadas compartilham lâmina/empunhadura padrão; arcos têm preparação e soltura; cajados têm postura e golpe/conjuração; adagas têm gestos curtos. Há as mesmas cinco combinações de família para todas as classes/corpos, permitindo os equipamentos já autorizados pelo jogo. As armas já estão nos quadros principais. O escudo continua representado por uma peça neutra simples.

Itens não foram fundidos: IDs, nomes, raridades, atributos, requisitos, ícones, refinamento e persistência continuam próprios. Armaduras continuam aplicando seus efeitos, mas não substituem o corpo desenhado.

## 7. Habilidades

Mapeadas todas as **80 habilidades de classe, seus 350 níveis e cinco habilidades legadas**. O anexo lista cada ID, tipo, níveis e família. Passivas não inventam ações. Ataques físicos, disparos, conjuração ofensiva, cura, suporte, área e movimento são tratados explicitamente. Luz Punitiva e Luz da Redenção usam conjuração; Chuva de Flechas usa o gesto do arco. Efeitos e projéteis existentes permanecem distintos.

Cura, suporte e magia em área reutilizam gestos base com os efeitos visuais já existentes; não há uma prancha exclusiva por habilidade ou por nível. “Arremessáveis” foi interpretado conforme esclarecimento do usuário: flechas e habilidades do mago, sem criar itens novos.

## 8. Mochila e carrinho

A mochila tem quatro vistas e acompanha caminhada, ataques, recoil e morte com deslocamentos simples. O carrinho tem quatro vistas e dois estados de roda, alternados por distância; fica parado quando o personagem para. A inspeção detectou ocultação completa na frente, corrigida com afastamento visual de 1,1 unidade e deslocamento lateral de 0,35. Não foram alterados capacidade, peso, inventário, colisão ou autoridade de movimento.

O teste específico conferiu as quatro direções, alternância de rodas, deslocamento imediato e remoção visual ao desequipar. As capturas mostram repouso e caminhada.

## 9. Personalização de cores e cabelo

Cores primária/secundária usam máscaras independentes. Pele, cabelo e partes neutras dos equipamentos ficam fora das áreas de tecido. A verificação WebGL confirmou pixels alterados e pixels preservados, sem erro de material. A prévia de criação e Serafina usa os mesmos quadros e máscaras.

Foi adotada a alternativa simples permitida pelo prompt: **cabelo, cor do cabelo e expressão seguem o desenho preparado da classe/corpo**. Todos os campos antigos continuam salvos e validados; não houve migração destrutiva. Os seletores que não teriam efeito visual foram retirados das prévias, com explicação ao jogador. As escolhas antigas não são cobradas como alterações visuais inativas. Esta limitação permanece explícita para aprovação artística.

## 10. Lobo Branco

Nova silhueta, juba mais ampla, pelagem branca, olhos vermelhos e cicatriz no olho esquerdo anatômico. Na frente, a cicatriz fica à direita do observador; no perfil esquerdo aparece; no perfil direito e nas costas fica oculta. As vistas não derivam de um espelhamento que troque a cicatriz de lado.

Prancha de nove posições por direção: repouso, três passadas, preparação, mordida, recoil, uivo e morte. Os recoils de costas/direita foram acabados para não parecerem morte. Permanecem os atributos do MVP, incluindo 48.000 HP e 850 de ataque base, área, habilidades, frenesi, respawn, recompensas e lápide.

## 11. Interrupção por impacto

O servidor aplica o dano e compara a **perda real de HP** com o HP máximo. Absorção completa não interrompe. Não há acúmulo automático de golpes fracos. Só ataques em preparação, efeitos ainda pendentes e habilidades especiais elegíveis podem ser cancelados. Uma ação já em recuperação, sem parcela pendente, não se transforma em nova interrupção.

O estado inclui serial, início, fim de recoil, fim de recuperação e fim de proteção. A proteção é definida antes de cancelar a ação, evitando duplicação por chamadas simultâneas ou reentrantes. Comandos incompatíveis são bloqueados durante a recuperação. Morte prevalece e o retorno limpa o estado temporário.

## 12. Parâmetros iniciais, provisórios

| Entidade | Fração base | Resistência | Perda efetiva mínima | Recoil | Recuperação | Proteção mínima |
|---|---:|---:|---:|---:|---:|---:|
| Jogador | 10% | 1,00 | 10% do HP máximo | 0,22 s | 0,18 s | 0,70 s |
| Comum | 8% | 1,00 | 8% | 0,26 s | 0,14 s | 0,90 s |
| Especial | 8% | 1,25 | 10% | 0,28 s | 0,22 s | 1,40 s |
| Boss | 8% | 1,50 | 12% | 0,32 s | 0,50 s | 4,00 s |
| MVP | 8% | 1,75 | 14% | 0,40 s | 0,65 s | 6,00 s |

Esses valores são ajustáveis por tipo/entidade e não são apresentados como balanceamento definitivo. Valores inválidos são rejeitados. Para ataques básicos cancelados, a proteção também cobre a dívida de recuperação preservada e um novo ciclo completo, evitando bloquear permanentemente inimigos lentos.

## 13. Bosses, proteção, custos e confirmação

Bosses e MVPs podem sofrer interrupção, com limiar maior e proteção temporária. Durante a proteção continuam recebendo dano. O teste normalizado de seis atacantes por 60 s produziu 15 interrupções de boss e menos de 25% do tempo bloqueado; é um teste das janelas, não uma previsão de tempo para derrotar o encontro.

Preparações de habilidades do Cavaleiro e do Lobo podem ser canceladas; cargas já confirmadas e projéteis liberados continuam. Projéteis do Cavaleiro avançam durante seu recoil. O novo estado não altera atributos do encontro.

MP, munição e cooldown já pagos **não são reembolsados**. Dano aplicado não é desfeito. Projéteis lançados, zonas e efeitos confirmados continuam conforme suas regras; parcelas pendentes são canceladas. Sequências zeram também a contagem pendente, impedindo outro golpe no mesmo passo de atualização depois de uma interrupção reentrante.

## 14. Testes automatizados

**961 casos validados, sem falhas pendentes.** A execução integral teve 960 aprovações e uma falha no rótulo de versão legado, ainda marcado como Beta 0.6.10. Esse rótulo foi atualizado; o arquivo completo de multiplayer foi repetido com **27/27 aprovados**, incluindo o caso que falhara. Os registros originais e o reteste foram preservados. Incluem-se 23 testes específicos de impacto, dez de apresentação e um teste novo com sockets reais, além das regressões anteriores. Os testes do renderizador antigo foram adaptados apenas onde o contrato de atlas mudou; verificações históricas de recursos permaneceram. Uma expectativa antiga de interrupção por dano absorvido foi corrigida para refletir perda efetiva de HP.

Cobertura: dano leve/forte, proporcionalidade, dano confirmado, cancelamento sem dano tardio, projétil preservado, prioridade de morte/recoil, duplicação, proteção e dano durante proteção, fim da proteção, múltiplos atacantes, custos/cooldowns, reconexão, amuleto de proteção, cargas confirmadas, três golpes de adagas e cancelamento reentrante.

Auditoria de imagens: 60 atlas, 8.640 posições verificadas, nenhuma silhueta opaca cortada nos limites, quatro desenhos de caminhada distintos por direção e nenhuma sobreposição das regiões R/G das máscaras. Essa auditoria técnica não substitui julgamento artístico.

## 15. Multiplayer e aplicativos

ADM e dois Alunos usando os recursos dos pacotes finais foram testados com TLS, contas e banco temporários. Passaram caminhada em quatro destinos, observação remota, quatro famílias de arma, escudo/mochila, troca de armadura, viagem, combate real, saída/reconexão, reinício do cliente e encerramento normal do ADM. Inventário, equipamentos, classe, aparência e ofícios permaneceram iguais após o reinício.

Dois sockets reais confirmaram que jogador e observador recebem o mesmo recoil e proteção, incluindo reconexão durante a janela. A captura adicional do benchmark confirmou quadros próprios para jogador e MVP nos três clientes. Essa captura usa dano aplicado no servidor e uma janela temporariamente alongada de três segundos, **apenas na fixture após as medições**, para permitir o registro; os parâmetros do produto não foram alterados por ela.

A primeira tentativa de captura manteve um bloqueio defensivo do combate, que absorveu o golpe e corretamente impediu o recoil. A fixture final limpa buffs e inimigos comuns próximos depois da medição, aplica dano e verifica explicitamente a perda de HP e os estados gerados antes de capturar. Isso isola a evidência visual; não representa uma mudança nas regras de combate nem um ataque normal de jogador contra o MVP.

## 16. Evidências visuais

A galeria contém a matriz das seis classes/dois corpos/quatro direções, seleção de arma e estado, escala nativa, ampliação 3× sem suavização, GIFs das passadas, pranchas, WebGL com cores e mochila, carrinho, Lobo e capturas dos aplicativos. A galeria foi aberta no Electron e seus controles, 48 células e imagens foram verificados.

Foram inspecionados silhuetas, escala, passadas, direções, empunhadura, máscaras, mochila, carrinho e cicatriz. O resultado é uma entrega técnica com inspeção visual do agente; **a aprovação artística final continua sendo do usuário**.

## 17. Desempenho

| Cenário | Cliente | FPS médio | CPU de tarefas | Heap JS (MiB) | Privada por cliente (MiB) | Working set (MiB) |
|---|---|---:|---:|---:|---:|---:|
| Cidade | RV2 0.6.10 | 36.78 | 96.75% | 21.02 | 679.3 | 196.1 |
| Cidade | 37 0.6.11 | 36.64 | 98.10% | 21.00 | 540.4 | 534.9 |
| Lobo Branco | RV2 0.6.10 | 51.68 | 98.12% | 33.13 | 840.2 | 227.0 |
| Lobo Branco | 37 0.6.11 | 59.45 | 98.79% | 32.45 | 620.0 | 527.1 |


Nesta amostra, o FPS do combate subiu cerca de 15%, enquanto a cidade permaneceu praticamente estável. A memória privada caiu aproximadamente 20% na cidade e 26% no combate, mas o working set aumentou de 196 para 535 MiB e de 227 para 527 MiB. Portanto, não se conclui redução geral de RAM residente. O tempo por chamada de sprite e a preparação diminuíram; o tempo total de tarefas do renderizador permaneceu próximo da saturação de uma thread.

Médias dos três clientes. CPU é tempo de tarefas do renderizador dividido pelo intervalo CDP próprio de cada cliente, não utilização total da CPU do computador. Heap é memória JavaScript. Memória privada e working set somam a árvore de processos de cada cliente; working set pode contar páginas compartilhadas mais de uma vez.

| Cenário | Cliente | Preparação total média (ms) | Atlas médio (ms) | Controle liberado (ms) | Sprite por chamada (ms) |
|---|---|---:|---:|---:|---:|
| Cidade | RV2 0.6.10 | 7128.50 | 3978.53 | 7634.40 | 0.2860 |
| Cidade | 37 0.6.11 | 2494.30 | 244.70 | 2943.60 | 0.0911 |
| Lobo Branco | RV2 0.6.10 | 2279.03 | 161.23 | 2656.97 | 0.6107 |
| Lobo Branco | 37 0.6.11 | 1820.47 | 44.07 | 2065.03 | 0.0882 |


Preparação inclui a construção do mapa, recursos, shaders e aquecimento; atlas é somente a etapa de preparação dos personagens. Controle inclui apresentação e transição. Cidade é a primeira entrada de cada processo e a Torre reutiliza recursos disponíveis. O custo de sprite mede cada chamada instrumentada, com personagens locais e remotos, sem medir tempo da GPU. A auditoria WebGL separada verificou descarte até oito entradas ociosas na cache, sem referências ativas após desmontagem.

A coleta final de memória valida a data de criação em cada vínculo pai/filho, evitando processos históricos cujo identificador foi reutilizado pelo Windows. As primeiras rodadas com a coleta antiga foram descartadas da tabela; os valores apresentados provêm das duas repetições com a correção.

Comparação local refeita nesta sessão: três processos Aluno, perfis temporários, cidade por 12 s e combate por 20 s, GPU timers desativados, mesma máquina e mesmo roteiro. O cliente RV2 vem do pacote preservado 0.6.10; o novo vem do pacote 0.6.11. Ambos usam o mesmo servidor de teste atual, isolando a troca da apresentação. A ordem foi RV2 e depois 37; não é ensaio estatístico nem garantia para outras máquinas. Arquivos completos incluem tempos de preparação, amostras, ambiente, memória e erros.

Os valores históricos da RV2 (34,85 FPS na cidade e 48,87 FPS no MVP) são contexto, não metas universais nem denominadores usados para anunciar ganho. A tabela desta sessão é a comparação reproduzida. Variações, ganhos e regressões devem ser lidos por cenário; não se afirma melhoria universal.

## 18. Compatibilidade

Dados e permissões de itens permanecem individuais. Não foram apagadas contas, personagens ou escolhas de aparência. Não houve mudança de mapas, numeração, campanha, promoção, árvores, economia, forja, TLS, temporadas, backups ou limite de jogadores. Não foram introduzidos botões de debug na aplicação Aluno. A troca de renderização não exige reiniciar personagens.

## 19. Arquivos e manutenção

O anexo de arquivos lista alterações e adições. As fontes editáveis ficam em `artwork/iteration37`: 28 imagens originais com hashes, pranchas preparadas, ponto anterior ao acabamento, scripts offline e instruções. A distribuição carrega os PNGs finais de `public/assets/characters-v37`; os scripts de acabamento não rodam no jogo.

Código relevante: `sheet-animation`, `sheet-actor`, `sheet-resources`, prévias, acessórios, interpolação remota, `impact` compartilhado, integração do servidor, habilidades e controladores dos bosses. Os relatórios detalham limites para que próximas iterações continuem este trabalho sem reconstruir o sistema anterior.

## 20. Distribuição Windows

Quatro executáveis Windows x64: ADM instalador/portátil e Aluno instalador/portátil, versão 0.6.11, em `release/iteration37`. Conteúdo extraído de cada instalador/portátil foi comparado ao aplicativo preparado, com SHA-256 e arquitetura x64. Aluno não contém o servidor/ADM. Não foram incluídos bancos oficiais, chaves privadas ou `sources/`. Nada foi publicado automaticamente.

Os testes executam recursos finais empacotados sob o Electron instalado para permitir perfis e diagnóstico isolados. Os executáveis externos e o conteúdo comprimido foram auditados; instalação interativa, atualização sobre uma instalação real e execução em outra máquina/rede escolar permanecem sem validação presencial.

## 21. Limitações e pendências

- Aprovação artística final depende da inspeção do usuário, incluindo cabelo fixo por classe/corpo e o ritmo de quatro passadas.
- Habilidades reutilizam famílias de gestos; não há desenho exclusivo por nível ou equipamento individual.
- Pesca e mineração preservam as pranchas completas anteriores; não receberam toda a matriz visual por classe nesta iteração.
- Os parâmetros de impacto são provisórios. Foram testadas regras e proteção contra bloqueio permanente; balanceamento competitivo prolongado com jogadores humanos ainda pode pedir ajustes.
- As medições são locais, com três clientes. Não substituem LAN presencial, computadores escolares de configurações diferentes ou testes longos de sessões reais.
- Instalação e atualização interativas em máquina externa não foram executadas. A entrega não foi publicada.

Implementado e testado: arquitetura, sincronização, regras de impacto, recursos, builds e preservação. Inspecionado visualmente: pranchas e renderização. Aguardando aprovação humana: qualidade artística final.
