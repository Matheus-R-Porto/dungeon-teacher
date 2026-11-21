# Iteração 30 — arte e proveniência

Ferramenta: imagegen integrada, modo de edição/referência, transparent_background=true. Uma chamada gerou o atlas completo, inspecionado antes da integração. Sem CLI, API externa ou novos sprites de recompensas. Não houve recorte ou redesenho dos PNGs anteriores.

Referência: docs/art/iteration281b-sources/expeditionChest.png. Saída integrada: public/assets/rewards-v30/chest-opening.png (RGBA 1280 × 1280, grade 2 × 2, quatro células de 640 × 640). O CSS usa a imagem diretamente com background-size 200% 200%; não depende do arquivo de geração fora do projeto.

Arquivo original da ferramenta: C:\Users\theuz\.codex\generated_images\01a178a4-8b04-70f1-9fca-efebfc6cb7e1\exec-ffcc30ff-a47a-49b0-9abf-fa7b0390d4a3.png. Copiado, não movido. O PNG anterior do inventário permanece intacto.

## Prompt utilizado

Use case: precise-object-edit. Production animation sprite sheet for Dungeon Teacher. Input image is the mandatory chest design reference. Create ONE transparent PNG sprite atlas, exactly 2 columns by 2 rows of equal square cells, no dividers, no text. Four animation frames of this EXACT SAME chest from the exact same 3/4 camera angle: top-left CLOSED; top-right lid barely open 15 degrees; bottom-left lid half-open 45 degrees; bottom-right lid fully open 85 degrees. Preserve identical warm oak planks, arched lid, two dark iron bands with brass rivets, brass central lock and right-side iron carrying handle, illustrated chunky pixel shading and dark outlines from reference. Same lower chest body absolutely identical across four frames, same scale, same base position within each cell, stationary camera, generous transparent margin above for raised lid. Lid rotates physically backward around rear hinge, revealing a dark empty wooden interior with very subtle warm amber light. Central lock remains on front lower body, upper latch follows lid. No treasure, coins, items, stars, particles, beams, ground plane or cast shadow outside the object. Entire object fits each cell. Do not redesign or change perspective. Output a coherent professional animation sheet with real alpha, no checkerboard painted in.

## Revisão

Preservados os materiais, as duas ferragens, os rebites, a fechadura e a alça lateral. Quatro posições distintas de tampa e interior visível. A continuidade é de quadros ilustrados, sem deformação de uma imagem estática. Existem pequenas diferenças de textura/contorno entre quadros gerados; a aprovação artística humana permanece pendente. Efeitos de brilho, sombra e antecipação são CSS discretos, sem inventar raridades ou substituir a ilustração por geometria.

Os itens da roleta e do resultado usam exclusivamente item-art.json e os PNGs reais de inventory-v281. Nenhum item, nome, categoria, quantidade, atributo ou probabilidade foi criado pela arte.
