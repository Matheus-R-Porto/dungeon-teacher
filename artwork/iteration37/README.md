# Arte da Iteração 37

Os PNGs originais gerados estão em `originals/`, com hashes no manifesto. `masters/` contém as pranchas preparadas e o acabamento manual autorizado. `pre-finish-actions/` mantém o ponto anterior ao acabamento, para repetir a operação sem acumular transformações.

O jogo carrega somente as imagens finais em `public/assets/characters-v37/`. Nenhum destes scripts roda durante o jogo.

Sequência de preparação, nesta pasta: executar `pack-batch.ps1` com o Electron do projeto; `python finish-walks.py`; `python finish-actions.py`; `python finish-wolf.py`; executar `assemble-sheets.cjs` com o Electron do projeto. A montagem grava `prepared/`. Copiar seus PNGs e as pranchas finais de mochila, carrinho e lobo para a pasta pública, mantendo o nome `white-wolf.png` para o lobo.

Padrão: célula de 96 px; 36 posições por direção; quatro direções; atlas de 9 × 16. Quatro desenhos de passada por direção, com posições duplicadas apenas para o endereçamento dos estados. As máscaras R/G selecionam os tecidos primário/secundário; não contêm articulações. Todos os membros e armas dos personagens já estão nos quadros completos.

Mapeamento de estados e habilidades: `src/core/sheet-animation.js`. Mochila, escudo e carrinho são peças estáticas separadas, com ancoragem simples. A aprovação artística é provisória até a inspeção do usuário.
