# Artes da Iteração 21

O atlas original `public/assets/characters/adventurer.png` foi preservado. O novo `adventurer-v041.png` foi produzido com imagegen usando o original como referência, fundo transparente e grade de oito colunas por quatro linhas. O resultado original também permanece no diretório de imagens geradas da sessão, arquivo `exec-c474be79-3502-4ac7-9d24-fb33379eeca5.png`.

## Direção e uso

Linhas: sul, oeste, norte e leste. Colunas: repouso, duas poses de caminhada, preparação, liberação, recuperação, dano e derrota. As duas poses de caminhada norte mostram as costas; o atlas anterior virava o tronco numa delas. O recorte seleciona a mesma linha durante o ciclo, portanto a causa observada era a arte. A caminhada foi reduzida de 8 para 4,5 quadros/s. O tempo de fase só reinicia quando a fase muda, e não a cada snapshot.

O corpo não carrega arma desenhada no atlas. Modelos simples de espada, adaga, arco com corda/flecha e cajado com cristal acompanham o personagem, com preparação/liberação próprias por família. A arma vem do item equipado; remotos recebem o tipo derivado pelo servidor. Troca visual não altera dano, alcance, cadência lógica, MP ou recargas. Ferramentas de profissão não substituem a arma. As capturas de armas usam equipamento real em um perfil isolado preparado para inspeção.

## Prompt de geração

Create a corrected game-ready pixel-art sprite atlas based on this reference adventurer (brown hair, teal cape, cream tunic, brown boots). TRANSPARENT background, no glow, no labels, no shadows. Exact evenly spaced grid 8 columns by 4 rows, 2048x1024, each cell 256 square. All characters centered horizontally in their cell, feet on same baseline 90% of cell height, same scale and camera. NO WEAPON IN ANY FRAME: equipment is rendered separately. Rows: row1 facing FRONT/SOUTH; row2 LEFT/WEST side profile; row3 BACK/NORTH strictly straight back every frame, shoulders parallel to picture plane, NO diagonal face/torso rotation; row4 RIGHT/EAST profile. Columns: 1 idle standing, 2 walk left foot forward, 3 walk right foot forward, 4 preparing action hands drawn back, 5 release action hands extended, 6 recovery relaxing, 7 recoil from damage, 8 fallen defeated on ground. The NORTH walking poses must BOTH face directly away, never northeast. Preserve identity and readable pixel-art anatomy. Crisp nearest-neighbor pixel look, fully isolated characters separated by generous transparent gutters. Exact 32 poses 8 by 4.

A resolução efetiva do PNG é 1.774 × 887 pixels; o carregador usa proporções de grade e não pressupõe pixels fixos por célula. O atlas completo é a folha de inspeção preservada. As direções diagonais usam a direção cardinal mais próxima; não há oito direções de arte distintas.

## Ambiente

Texturas anteriores de telhado, reboco e pavimento foram preservadas. `brick-path.svg` acrescenta um padrão vetorial original de tijolos às ruas residenciais. Construções, telhados de duas águas, torres cilíndricas, balcões, toldos, bancos, jardins, barracas, bandeiras, fumaça e armas são geometria procedural Three.js. A fumaça usa instâncias; não foram importadas dependências gráficas externas.
