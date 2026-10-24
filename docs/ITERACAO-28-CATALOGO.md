# Auditoria do inventário — antes da implementação da interface

44 definições reais. 32 espaços, pilhas até 99 para recursos/comida e uma unidade por equipamento. Oito slots: weapon, head, chest, legs, boots, ring, necklace, talisman; legs, necklace e talisman ainda sem peças cadastradas. Trocas usam Inventory.equip/unequip, bloqueadas em combate/atividade e sem espaço para retirar. Persistência local IndexedDB, formato inalterado. Online recebe somente mochila, não equipment, e não possui comando de equipar; permanece sem edição de equipamentos. Serviços de cozinha, pesca, mineração, forja e baús concedem itens pelo mesmo catálogo.

Arte anterior: símbolos de fonte repetidos, classificação B para os 44 itens. Não há ícones de inventário raster apropriados. Novas ilustrações SVG próprias estendem a estratégia de ícones vetoriais da Árvore do Destino; transparência nativa, sem imagens externas. Armas forjadas reutilizam a silhueta de seu tipo; qualidade existente aparece em texto. As cores são proposta de apresentação, sem raridades ou propriedades novas. A: nenhum ícone reaproveitável; C: nenhum item sem símbolo prévio; D: nenhum tipo de objeto indeterminado. Detalhes cosméticos definitivos dependem de aprovação humana.

Recursos no mundo (baú procedural 3D, pesca e minério) mantidos nos renderizadores existentes; worldSprite:null significa ausência de arquivo específico reutilizável. Nenhuma camada de personagem criada.

| ID | Nome | Tipo | Slot | Pilha máxima | Arte |
|---|---|---|---|---|---|
| fishingRod | Vara de Pesca | tool | — | 1 | B → fishingRod.svg |
| simplePickaxe | Picareta Simples | tool | — | 1 | B → simplePickaxe.svg |
| rawOre | Minério Bruto | resource | — | 99 | B → rawOre.svg |
| limiarMinnow | Lambari do Limiar | resource | — | 99 | B → limiarMinnow.svg |
| fireflyCarp | Carpa dos Vaga-lumes | resource | — | 99 | B → fireflyCarp.svg |
| mossCatfish | Bagre Musgoso | resource | — | 99 | B → mossCatfish.svg |
| moonFish | Peixe-Lua | resource | — | 99 | B → moonFish.svg |
| runeFish | Peixe Rúnico | resource | — | 99 | B → runeFish.svg |
| salt | Sal | resource | — | 99 | B → salt.svg |
| flour | Farinha | resource | — | 99 | B → flour.svg |
| herbs | Ervas | resource | — | 99 | B → herbs.svg |
| oil | Óleo | resource | — | 99 | B → oil.svg |
| water | Água | resource | — | 99 | B → water.svg |
| roastMinnow | Lambari Assado | consumable | — | 99 | B → roastMinnow.svg |
| limiarStew | Ensopado do Limiar | consumable | — | 99 | B → limiarStew.svg |
| goldenCarp | Carpa Dourada | consumable | — | 99 | B → goldenCarp.svg |
| lunarSoup | Sopa Lunar | consumable | — | 99 | B → lunarSoup.svg |
| runicDish | Prato Rúnico | consumable | — | 99 | B → runicDish.svg |
| herbCatfish | Bagre com Ervas | consumable | — | 99 | B → herbCatfish.svg |
| expeditionChest | Baú | chest | — | 1 | B → expeditionChest.svg |
| travelerCap | Capuz do Viajante | equipment | head | 1 | B → travelerCap.svg |
| travelerVest | Colete do Viajante | equipment | chest | 1 | B → travelerVest.svg |
| travelerBoots | Botas do Viajante | equipment | boots | 1 | B → travelerBoots.svg |
| focusRing | Anel de Foco | equipment | ring | 1 | B → focusRing.svg |
| apprenticeHood | Capuz do Aprendiz | equipment | head | 1 | B → apprenticeHood.svg |
| lightVest | Colete Leve | equipment | chest | 1 | B → lightVest.svg |
| agileBoots | Botas Ágeis | equipment | boots | 1 | B → agileBoots.svg |
| strengthRing | Anel de Força | equipment | ring | 1 | B → strengthRing.svg |
| trainingSword | Espada de Treino | weapon | weapon | 1 | B → sword.svg |
| trainingDagger | Adaga de Treino | weapon | weapon | 1 | B → dagger.svg |
| trainingBow | Arco de Treino | weapon | weapon | 1 | B → bow.svg |
| trainingStaff | Cajado de Treino | weapon | weapon | 1 | B → staff.svg |
| forgedSwordFailure | Espada Forjada — Inferior | weapon | weapon | 1 | B → sword.svg |
| forgedSwordGood | Espada Forjada | weapon | weapon | 1 | B → sword.svg |
| forgedSwordPerfect | Espada Forjada — Superior | weapon | weapon | 1 | B → sword.svg |
| forgedDaggerFailure | Adaga Forjada — Inferior | weapon | weapon | 1 | B → dagger.svg |
| forgedDaggerGood | Adaga Forjada | weapon | weapon | 1 | B → dagger.svg |
| forgedDaggerPerfect | Adaga Forjada — Superior | weapon | weapon | 1 | B → dagger.svg |
| forgedBowFailure | Arco Forjado — Inferior | weapon | weapon | 1 | B → bow.svg |
| forgedBowGood | Arco Forjado | weapon | weapon | 1 | B → bow.svg |
| forgedBowPerfect | Arco Forjado — Superior | weapon | weapon | 1 | B → bow.svg |
| forgedStaffFailure | Cajado Forjado — Inferior | weapon | weapon | 1 | B → staff.svg |
| forgedStaffGood | Cajado Forjado | weapon | weapon | 1 | B → staff.svg |
| forgedStaffPerfect | Cajado Forjado — Superior | weapon | weapon | 1 | B → staff.svg |
