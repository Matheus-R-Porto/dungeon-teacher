# Iteração 02.1 — sprites direcionais completos

Correção incremental de 24/09/2026. Especificação preservada em `ESPECIFICACAO-ITERACAO-02.1.txt`.

## Correção

O atlas anterior compartilhava a pose frontal do corpo e mudava principalmente cabeça e mochila. Agora cada célula contém uma pose completa: cabeça, tronco, braços, pernas, pés, cajado e mochila projetados na mesma direção. São oito vistas discretas, com dois quadros Idle e quatro Walk para cada vista, não uma imagem por ângulo da câmera.

As formas simples são desenhadas uma vez em Canvas 2D e gravadas no atlas em memória. A projeção e ordenação de polígonos pertencem somente à autoria do placeholder; no mundo continua existindo um único sprite 2D com billboard, não um ator com partes 3D. O placeholder é deliberadamente geométrico e não representa arte final.

Mochila localizada atrás do tronco: encoberta na vista frontal, visível atrás, parcialmente visível de perfil. Pés se prolongam no eixo frontal do corpo; braços e pernas alternam a passada nesse mesmo eixo. Cajado permanece na mão direita lógica, mudando sua posição na imagem conforme a vista. Rosto só é desenhado nas vistas frontais/diagonais frontais. Uma correção de ordem das superfícies impede que o capuz cubra o rosto.

## Orientações separadas

- **World Facing:** `player.heading` preserva o nome existente por compatibilidade; é a orientação lógica, atualizada somente quando há deslocamento efetivo. Parar mantém o último valor. O movimento junto a paredes usa a direção do deslocamento real.
- **Camera Yaw:** `view.orbit.azimuth`, independente da orientação do jogador.
- **Relative Angle:** `worldFacing − cameraYaw`, normalizado entre 0° e 360°.
- **Visual Facing:** uma das oito vistas, escolhida por `resolveFacing`. Billboard só orienta o plano, não muda a direção lógica.

Convenção existente: 0° no mundo aponta para +Z/S; 90° para +X/E; 180° para −Z/N; 270° para −X/O. A câmera usa o mesmo referencial. As linhas do atlas seguem S/SO/O/NO/N/NE/E/SE; a conversão do ângulo relativo para essa ordem fica centralizada.

Sem histórico, a direção escolhida é a mais próxima, em setores de 45°. Com histórico, uma margem de 3° além da metade do setor evita alternância na fronteira. A histerese altera apenas a escolha de arte; não altera, atrasa ou encaixa a câmera.

## Depuração e inspeção

O painel recolhível **Depuração do sprite** mostra World Facing, Camera Yaw, Relative Angle, Visual Facing e Animation State. Clique no título para escondê-lo.

No servidor de desenvolvimento, `/sprite-lab.html` mostra as oito poses Idle e Walk, usando a mesma função que desenha o atlas real. Possui pausa para inspecionar as passadas. É uma ferramenta local de inspeção; não é uma nova tela de gameplay nem uma entrada adicional do build de produção.

## Verificação

- **33 testes automatizados aprovados:** 27 regressões anteriores e seis novos testes de orientação/poses.
- Varredura automática de 360° com personagem parado: oito vistas, sem alteração lógica.
- Movimento a 77° em múltiplas direções, parada e mudança de câmera: orientação lógica acompanha deslocamento e permanece após parar.
- Histerese testada em todas as oito fronteiras e na passagem 0°/360°.
- Poses completas, pés distintos nas oito vistas, rosto ausente nas vistas traseiras/laterais e profundidade relativa da mochila testados.
- Inspeção visual da folha com todas as direções Idle/Walk. A primeira inspeção identificou sobreposição do capuz; corrigida e reinspecionada.
- **Teste no Hub:** câmera percorreu 360,5°; as oito vistas apareceram; World Facing permaneceu N · 180,0° em todas as leituras, com Animation State idle.
- Movimento D no Hub passou a World Facing NE · 135,5°; depois de parar e girar novamente, World Facing permaneceu igual enquanto Camera Yaw/Relative Angle mudaram.
- Build de produção aprovado; permanece o aviso conhecido do pacote gráfico acima de 500 kB sem compressão.

## Arquivos

Criados: `src/adapters/rendering/placeholder-poses.js`, `tests/iteration021.test.js`, `sprite-lab.html`, esta documentação e cópia da especificação.

Alterados: `src/core/actor-animation.js`, `src/adapters/rendering/sprite-actor.js`, `src/simulation/game.js`, `src/ui/hud.js`, `index.html`, `src/style.css` e `README.md`.

Não foi necessário alterar `orbit.js`, `input.js`, `scene.js`, o JSON do Hub, as colisões, a navegação ou a interação universal.

## Extensão e limites

Seleção de direção, clips, desenho provisório e apresentação Three.js permanecem separados. A paleta/aparência e o atlas podem ser substituídos por variações de classe/equipamento; não foi criado sistema de equipamento em camadas. Attack/Skill/Hit/Death/Cast podem receber clips direcionais futuros; nenhuma dessas ações foi implementada nesta correção.

Câmera livre, Q/E, botão do meio, zoom, Hub e controles continuam como na Iteração 02. Sem combate, inimigos, classes, arte final ou Torre procedural. O depurador é temporário, o save permanece ausente e a qualidade final dos sprites continua pendente.
