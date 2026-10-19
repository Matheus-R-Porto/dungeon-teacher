# Iteração 21.1 — artes e preparação

Artes geradas com imagegen, usando o aventureiro existente como referência de identidade. Ferramenta aplicada conforme o skill `C:/Users/theuz/.codex/skills/.system/imagegen/SKILL.md`. Sem imagens copiadas de jogos ou fontes externas. Os scripts de empacotamento são processamento técnico de PNG, não geração de arte. Originais anteriores preservados.

## Fontes selecionadas

Gerações originais em `C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/`:

| Arquivo | Uso |
|---|---|
| exec-067b5de5-2382-4ba3-a5e5-f0587836d936.png | Aventureiro: poses base, parado e dano |
| exec-76b15476-346c-4e76-b02e-812c8449f14c.png | Marcha sul e norte |
| exec-34226aa9-4198-436b-91c4-2b93b85e8229.png | Quatro passos oeste |
| exec-3a4d5621-7160-4667-8e89-a84fd931c0a8.png | Quatro passos leste |
| exec-595e21da-cbe1-4b5f-b05c-711ff867279e.png | Espada: tronco, mãos e arma |
| exec-c3b64c8e-2494-4b31-a3c9-e06de592701c.png | Arco, corda e aljava |
| exec-2aaa0ac3-2586-4dfd-a624-68852ecd7d19.png | Duas adagas |
| exec-da4602a6-02c5-4b17-bb1a-f138f9607200.png | Cajado |
| exec-e826edf3-5c92-497b-9dd0-6fb6b7ff5c4e.png | Preparação/ataque oeste de espada e adagas |

## Especificações dos prompts

Todas as gerações preservam cabelo castanho, camisa clara, capa curta azul-petróleo, botas, proporção chibi pixel art, transparência real e silhuetas inteiras com espaço entre células. Sem chão, sombra pintada, textos ou efeitos fora da célula.

- Base: seis poses por direção S/W/N/E — parado, contato esquerdo, passagem esquerda, contato direito, passagem direita e dano. Norte sempre de costas. Capa curta para não esconder as pernas.
- Marcha: quatro poses distintas de contato/passagem, pernas alternadas e braços em oposição; quatro direções com linha dos pés consistente.
- Correção oeste: perfil esquerdo; bota próxima clara à frente à esquerda na pose 1, plantada na pose 2 com joelho distante levantado, atrás à direita na pose 3 com perna distante à frente, próxima levantada na pose 4. Braços opostos.
- Correção leste: perfil direito; mesma sequência invertendo os lados, com a perna direita próxima clara e a distante escura. Não repetir a mesma perna adiantada nas quatro poses.
- Famílias: oito poses por direção — mão alcançando arma em saque intermediário, pronto, quatro passos, preparação e execução. Espada com bainha; arco com corda/aljava; duas adagas; cajado inteiro com mãos integradas. Sem armas flutuantes.
- Cajado final: quatro poses por direção — alcançar/retirar, pronto, erguer e apontar para conjurar; arma inteira dentro da área central de 280 pixels de uma célula de 384.
- Ataques oeste finais: grade 2 × 2, todos voltados à esquerda; primeira linha preparação/golpe de espada, segunda guarda/estocada de duas adagas. Sem espelhar apenas o rosto ou deixar a arma apontando para o lado oposto.

Algumas gerações foram rejeitadas por repetir pernas ou juntar silhuetas adjacentes. A saída visual do gerador não foi aceita automaticamente.

## Processamento reproduzível

`scripts/pack-sprite-atlas.cjs` identifica componentes de alfa, retém a silhueta inteira, alinha pés e empacota em células inteiras. O limiar de alfa 200 retira halos translúcidos gerados. Produz PNG, manifesto de recortes, referência e tiras por direção. Exemplo: executar com Electron passando entrada, saída, colunas e linhas; `--weapon` usa célula 384 e `--scale=0.8` permite ajustar o cajado. Personagens básicos usam célula 256.

`scripts/compose-walk-layers.cjs` conserva os arquivos `*-poses.png`, substitui a marcha lateral pelas tiras aprovadas e combina a parte inferior da marcha com troncos/mãos/armas. Remove fragmentos desconectados menores que 1% da silhueta principal. Aplica os ataques oeste específicos e recria manifestos/tiras. São composições offline; não há custo de composição de pixels durante o jogo.

Atlas finais ficam em `public/assets/characters/*-v042.png`, `public/assets/monsters/slimes-v042.png` e `public/assets/npcs/townsfolk-v042.png`. Slimes, moradores e derrota reutilizam a arte original com novo empacotamento. Retratos e texturas arquitetônicas anteriores continuam em uso. Muralhas, relevo e vegetação nova são geometria procedural, não imagens geradas.

Os testes verificam dimensões, gutters e quadros distintos. As capturas no Electron verificam aparência em escala de jogo e ampliada; diferenças sutis de desenho entre poses continuam possíveis nesta arte provisória.
