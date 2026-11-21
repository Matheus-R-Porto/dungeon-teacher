# Iteração 31 — registro de arte e composição

Ferramenta: image_gen integrada, com a skill imagegen. Os originais anteriores não foram substituídos. IDs completos e organização de células estão em `ITERACAO-31-ASSETS.json`.

## Recursos e orientação dos prompts

Este é um resumo de produção dos prompts, não uma transcrição literal.

| Recurso | Orientação |
|---|---|
| Tela inicial | Ilustração original de torre antiga e refúgio medieval na floresta, luz dourada, verde profundo/pergaminho, sem UI ou texto de outro jogo |
| Novato | 6 colunas × 4 direções, pose parada e cinco passos, corpo completo desarmado, cabelo castanho/olhos azul-esverdeados, camisa clara/colete azul/detalhes dourados |
| Guerreiro | Mesma identidade e poses, traje azul acolchoado e armadura leve; sem armas |
| Arqueiro | Mesma identidade e poses, couro leve e proteção para mobilidade; sem armas |
| Ladino | Mesma identidade e poses, traje leve azul escuro; sem armas |
| Sacerdote | Mesma identidade e poses, túnica marfim/azul/dourado; sem armas |
| Mago | Mesma identidade e poses, roupão azul/dourado cobrindo os pés; sem armas |
| Cabeças | Nove combinações: curto/ondulado/preso × serena/alegre/séria; quatro direções, sem corpos |
| Armas | Espada, adaga, arco e cajado guardados/empunhados; quatro direções; referências dos quatro ícones reais aprovados; sem mãos ou corpos |
| Botas de Viajante | Somente os pares de botas, seis poses/quatro direções, pele/fivela conforme o ícone real |
| Botas Ágeis | Variante com couro avermelhado/cadarços, sem a pele das Botas de Viajante |
| Peças | Capuz marrom, capuz azul, colete marrom, colete verde, anéis azul/dourado, mochila e bainha vazia; quatro direções |

Todas as folhas de personagem/peças têm canal alfa. A composição de produção normaliza os limites úteis, descarta pequenos fragmentos de células adjacentes e aplica as cores somente nas regiões do traje/cabelo. O processamento Canvas é parte do renderer do jogo; os PNGs fontes permanecem preservados.

## Camadas e cobertura do catálogo

- Cabeça: janela facial regional; capa do capuz à frente, identidade visível dentro da abertura.
- Peitoral: sobreposição sobre o traje-base, sem tintura automática do item.
- Botas: região inferior substituída; o roupão mantém sua oclusão. Os dois pés acompanham as regiões da pose.
- Anel: detalhe na região da mão, pequeno na escala do mundo.
- Mochila: atrás nas vistas frontais/laterais e à frente na vista de costas.
- Carrinho: atlas e `ActorAccessories/cartAnchor` da iteração 29.1.
- Armas: camada independente única; espada/adaga com bainha vazia durante empunhadura. Arco/cajado guardados nas costas.
- Armas forjadas: todas representadas pela família; a diferenciação por acabamento é provisória e não substitui a arte individual de cada ícone.

`ITERACAO-31-EQUIPAMENTOS.json` enumera os 26 IDs equipáveis e as pendências. Os 44 ícones de inventário anteriores continuam nos mesmos caminhos, acrescidos dos dois ícones de transporte da iteração 29.1. O manifesto registra hashes atuais para auditorias futuras; não é uma comparação de hashes com uma versão anterior.

## Animação e limites

VisualCombat conserva 0,24 s para sacar, 0,32 s para guardar, cinco segundos de permanência e cinco passos. O compositor não cria uma segunda máquina de combate. A inclinação/rotação de arma, reação ao dano e derrota são procedurais. Não há novo conjunto completo de poses corporais desenhadas para cada ataque, nem afirmação de revisão humana final.

As capturas de bases/equipamentos usam o compositor real. As de armas usam ModularActor/Three.js reais em uma cena diagnóstica sem cenário. As capturas de Serafina e do HUD são do mundo real. A galeria distingue essas situações para não confundir evidência técnica com gameplay completo.
