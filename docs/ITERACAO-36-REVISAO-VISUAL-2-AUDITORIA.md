# Iteração 36 — Revisão Visual 2: diagnóstico e critérios separados

## Referências efetivamente inspecionadas

A captura nova `imagem exemplo.png` (costas), a captura lateral preservada, o ZIP `iteration36-rv1.zip`, o relatório RV1, suas pranchas, o compositor, as referências anatômicas e a prancha normalizada original das quatro armas foram examinados. O ZIP contém 327 arquivos com bytes idênticos à galeria RV1 disponível; não trouxe uma terceira referência visual. As duas referências do usuário estão na galeria RV2.

## Estado e causa

O rótulo `walk-1` da antiga ferramenta definia distância 0,7. Com passo 3,2 e cinco quadros, o índice era `floor(0,7/3,2*5)=1`, isto é, célula corporal 2. O primeiro quadro verdadeiro é a célula 1 (índice zero). O novo laboratório registra os índices e não confunde o rótulo com o estado do jogo.

A sequência antiga começava em repouso, antes de atacar, portanto esses quadros eram de arma guardada (`blend=0`); a imagem sozinha não contém todos os dados da conta nem permite provar qual lado da comparação foi recortado. Uma caminhada após combate é outro caso legítimo: a arma fica empunhada por cinco segundos. Esse relógio foi preservado.

Na RV1, a pose superior da caminhada era o corpo parado com braços rígidos oscilando ±0,15 radianos, sem flexão do cotovelo específica para a arma. A lâmina empunhada permanecia orientada para cima, seguindo apenas o giro do braço. Durante o saque, `(1-blend)*PI` levava a lâmina a uma orientação lateral. A arma guardada de costas era desenhada à frente do corpo/mochila; o escudo usava a mesma face e amplitude visual em caminhada e ataque. Encaixes geométricos corretos não resolviam essas decisões de pose.

## Precisão geométrica

Os 48 conjuntos anatômicos e 32 pontos de empunhadura foram preservados. O antebraço gira em torno do cotovelo; a mão usada pelos equipamentos recebe exatamente as mesmas transformações. Testes projetam os sprites reais das armas e do escudo na câmera durante caminhada e transições, além dos testes RV1 de órbita e inclinação. Isso verifica vínculo, não beleza.

## Correção anatômica

Os braços agora têm dois segmentos com sobreposição no cotovelo, mantendo a arte e a paleta existentes. Espada, adagas, arco e cajado têm flexões distintas; o braço do escudo tem uma postura de transporte discreta. Ombros, tronco, cabeça, pernas e mochila continuam compartilhados. As botas e a alternância de pernas originais foram preservadas. Não foram criados personagens inteiros por combinação nem novos itens.

## Perspectiva

A espada e as adagas empunhadas ficam baixas ao caminhar. A projeção de comprimento e largura é menor no transporte; a postura ofensiva mantém a extensão do ataque. Arco e cajado conservam seus eixos próprios. A arma guardada fica no quadril e acompanha o tronco, sem ser presa ao punho. A vista traseira mantém arma, bainha e escudo atrás do corpo/mochila; não se força a visibilidade de toda a peça. O escudo possui face traseira com tiras e projeção mais estreita, sem nova mecânica defensiva. A mochila conserva dimensões, alças, posição e camada corporal.

## Continuidade

Uma transição visual de 100–140 ms interpola ombros, cotovelos, tronco e punho entre os alvos de pose. Equipamentos usam a pose interpolada, não a pose futura. Durante o saque, a mão primeiro alcança a posição da bainha por uma articulação de ombro/cotovelo; só depois conduz a arma. Ao guardar, o percurso é inverso. A posição da bainha respeita o alcance real de cada anatomia. A arma nunca percorre sozinha um caminho entre quadril e mão. O estado autorizado e o relógio de desembainhar foram preservados.

Não muda autorização, duração, dano ou cooldown de ataques. O ciclo completo, sua emenda, repouso/caminhada e caminhada/ataque foram exercitados; a transição de recuperação pode mostrar a lâmina passando por um ângulo intermediário antes de baixar, como parte do movimento. Os cinco quadros de pernas existentes continuam discretos. Mudanças de direção usam as quatro vistas existentes, sem uma vista intermediária inventada.

## Aprovação visual

Inspeção do agente: quatro direções, seis classes, dois corpos, quatro famílias, combinação completa com mochila/escudo/colete, imagens em tamanho reduzido e sequência real com quadros intermediários. Foram consideradas silhueta, intenção da ação e ocultação contextual, além de coordenadas. Nenhuma métrica de pixels foi usada como nota universal de qualidade artística.

**Aprovação visual provisória, aguardando inspeção do usuário.** Os testes aprovados e a inspeção do agente não constituem aprovação artística humana independente.
