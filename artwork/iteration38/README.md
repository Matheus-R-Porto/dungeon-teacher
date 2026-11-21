# Iteração 38 — recursos finais e experimento

Produção: `public/assets/characters-v38` (96 px), `professions-v38` (128 px) e `skill-tree-v38` (duas fontes de árvore). As duas árvores foram geradas com a ferramenta integrada image_gen; prompts completos e arquivos originais estão arquivados. As cinco identidades usam ajustes discretos de apresentação e ornamentos do catálogo, não cinco ilustrações geradas independentes.

Os reparos de sprites foram acabados offline, dentro da autorização anterior para acabamento manual. A fonte foi a RV1; polígonos explícitos protegem a roupa da extração de braços e recuperam pixels ausentes a partir do repouso do mesmo personagem. Os braços recebem suporte sob fragmentos em seis gestos. `repairs.json` identifica cada quadro e posição recuperada. Pixels opacos existentes e suas máscaras de equipamento foram preservados.

`experiments` contém o protótipo de Mago nas resoluções 96, 128, 192, 256 e 320, extraído diretamente dos originais da Iteração 37 por seus limites registrados. Não foi adotado nem incluído nos aplicativos. Arquivos de origem continuam em `artwork/iteration37/originals` e seus metadados em `masters`. Não confundir o protótipo com os atlas finais corrigidos.

Os scripts registram o ambiente de autoria e não são instaladores; usam a pasta de trabalho e a referência preservada. A reversão do visual final consiste em recuperar os caminhos originais de `sheet-resources.js`: `characters-v37-rv1` e `professions-v37-rv2`, que continuam intactos. A base completa e hashes ficam na pasta de trabalho `work/iteration38/before` e nas evidências.

Aprovação técnica não substitui a avaliação artística do usuário.
