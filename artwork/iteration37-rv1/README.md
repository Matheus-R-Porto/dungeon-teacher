# Iteração 37 — Revisão Visual 1 · fontes de acabamento

Base preservada: 0.6.11. `prepared/` contém os arquivos finais instalados em `public/assets/characters-v37-rv1/`. `before/` contém os insumos nativos, sem alteração. Equipamentos-fonte estão em `authoring-before/masters/`.

Preparação offline com Python/Pillow: `build-art.py`, depois `finish-gestures.py`, `cart-art.py`, `enemy-art.py` e **obrigatoriamente** `finish-wolf-native.py`. O último substitui o estudo inicial de patas retas. Conferir com `check-art.py`. A função de passada já inclui a correspondência anatômica frontal; não reaplicar a troca histórica registrada em `canonical-gait.json`.

`refine-art.py` conserva funções experimentais para rastreabilidade. A função usada por `build-art.py` é `native_gait`; os experimentos de cabelo poligonal e perna simplificada não foram utilizados. Dois estudos produzidos por geração de imagem foram rejeitados por repetir apoios e não compõem os recursos finais. Cabeças, silhuetas e trajes vêm da arte aprovada da Iteração 37, com acabamento de paleta e poses de membros preparados offline.

Os scripts não alteram regras de jogo. Não há reconstrução anatômica no renderizador. A pasta de preparação é separada da pasta de produção; executar um script aqui não instala recursos automaticamente. Aprovação artística final pendente do usuário.
