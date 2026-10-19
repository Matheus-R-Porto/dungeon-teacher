# Pipeline de artes — Beta 0.4.0

As artes abaixo são arquivos reais integrados ao Three.js, criados nesta iteração. Os PNGs foram gerados com a ferramenta imagegen; as texturas de ambiente e impacto são SVGs originais escritos no projeto. Não dependem de downloads ou pacotes de terceiros em tempo de execução.

## Arquivos e atlas

| Arquivo em `public/assets/` | Conteúdo | Grade |
|---|---|---|
| `characters/adventurer.png` | Aventureiro de cabelo castanho, capa azul-petróleo, túnica clara e espada | 6 colunas × 4 linhas, 1536 × 1024 |
| `npcs/townsfolk.png` | Seis sprites exclusivos de corpo inteiro | 3 × 2, 1536 × 1024 |
| `portraits/townsfolk.png` | Seis retratos exclusivos de busto, correspondentes aos sprites | 3 × 2, 1536 × 1024 |
| `monsters/slimes.png` | Slime comum, Saltador e Mágico | 6 × 3, 1774 × 887 |
| `environment/paving.svg` | Pedras de pavimentação | SVG 128 × 128 |
| `environment/plaster.svg` | Fachada de reboco e madeira | SVG 128 × 128 |
| `environment/roof.svg` | Telhas | SVG 128 × 128 |
| `effects/impact.svg` | Estrela de impacto | SVG 64 × 64 |

Os seis NPCs e retratos ocupam regiões exclusivas dos atlas, sem reutilizar um personagem com outro nome:

| Índice | Linha / coluna | Personagem |
|---|---|---|
| 0 | 0 / 0 | Serafina: cabelos loiros, asas, halo, branco e dourado |
| 1 | 0 / 1 | Marta: pele negra, tranças, roupa bordô, chaves e livro |
| 2 | 0 / 2 | Brasa: barba ruiva, avental de couro, martelo e luvas |
| 3 | 1 / 0 | Lina: cabelos ruivos, lenço verde, avental, colher e tigela |
| 4 | 1 / 1 | Orin: barba prateada, chapéu roxo e frascos turquesa |
| 5 | 1 / 2 | Caio: explorador mais velho, lenço azul-petróleo, mochila e mapa |

Jogador: linhas frente, esquerda, costas e direita; colunas parado, passo esquerdo, passo direito, preparação, golpe e recuperação. A orientação é relativa à câmera, preservando o cálculo existente de facing e sua histerese. Todos os jogadores usam a mesma arte. A fase autoritativa de ataque chega ao jogador local e aos remotos.

Monstros: linhas comum/verde, Saltador/âmbar e Mágico/azul; colunas idle, compressão, salto, ataque, dano e dissolução. O UV usa frações normalizadas; não presume dimensões inteiras por célula. A animação seleciona as poses de acordo com o estado existente, sem determinar dano ou recompensa.

## Origem e reprodução

Método: geração de imagem por descrição, PNG com transparência nos sprites, inspeção dos canais alfa e inspeção visual dentro do Electron. A primeira versão do aventureiro passou por uma segunda geração de remoção de fundo. Os PNGs integrados são os próprios arquivos gerados, sem reduzir sua resolução. Os originais também permaneceram na pasta `generated_images` do Codex; o projeto não depende dela.

Descrições utilizadas:

- Aventureiro: atlas de 24 poses, seis colunas e quatro direções; adulto jovem de cabelos castanhos, capa azul-petróleo, túnica creme, botas de couro e pequena espada; silhueta legível em pixel art, corpo inteiro, alinhamento dos pés, fundo transparente. Segunda passagem: remover completamente o fundo preservando os sprites e sua posição.
- NPCs: atlas 3 × 2 com as seis identidades da tabela, corpo inteiro, traços e roupas distintos, proporções estilizadas e fundo transparente.
- Retratos: atlas 3 × 2, bustos grandes, mesmos cabelos, roupas e cores dos seis NPCs, fundo azul-petróleo escuro e ausência de texto. A referência visual foi o atlas dos NPCs.
- Slimes: atlas 6 × 3; comum verde com broto, Saltador âmbar com lóbulos alongados e Mágico azul com cristais; seis estados, contorno nítido e fundo transparente.

A geração não garante identidade pixel a pixel entre execuções. Para preservar esta versão, mantenha os PNGs versionados junto ao código. SVGs são seus próprios arquivos-fonte editáveis.

## Acrescentar arte

1. Salve o arquivo em `public/assets/<categoria>/`. Evite atlases acima de 2048 pixels por lado sem medir o impacto.
2. Declare a grade e a região no adaptador. `artTexture` carrega uma fonte uma vez e compartilha o `Source` entre clones com UV independente. Filtro nearest, sem mipmaps, sRGB; sprites usam alfa com corte para eliminar halos de fundo.
3. Para um novo NPC, configure posição, nome, índice de arte, raio, falas, opções e ações nos dados. A posição/collision deve estar no mapa compartilhado, nunca ser sorteada por cliente.
4. Ajuste a grade do retrato no CSS se o layout do atlas mudar. Retratos e sprites são artes diferentes, correspondentes à mesma identidade.
5. Confira transparência, escala, alinhamento dos pés, câmera, clique e colisões no Electron. O carregamento de todos os quatro PNGs é verificado pela execução escolar.

`shared/city.js` define dados e geometria; `city.js` do renderizador monta edifícios e decoração; `SpriteActor` seleciona frames; `CombatVisual` usa eventos reais; `domain/dialogue.js` valida proximidade e visão; `ui/npc-dialog.js` apresenta a conversa. Os serviços futuros não têm ações simuladas.

As ruas usam uma única malha instanciada de pedras, evitando superfícies sobrepostas. Materiais e imagens são reutilizados; efeitos são limitados a 48 por cliente e têm vida curta. O limite não muda a resolução do combate no servidor.
