# Iteração 29.1 — auditoria e decisões prévias

## Auditoria
Inventory centraliza aquisição, pilhas, remoção e equipamento. Pesos são derivados por carryOf, com invalidação explícita. Compra, cozinha, forja, pesca, mineração e baús usam esse domínio; operações persistentes usam snapshots e rollback ou cópias. O save IndexedDB grava um snapshot de personagem com revisão otimista. O servidor guarda personagens e drops em SQLite e já protege comandos por sessão, época, mapa e sequência.

Os oito slots existentes não incluem transporte. SpriteActor resolve oito setores, mas usa quatro orientações ilustradas (frente, esquerda, costas, direita), com âncora inferior, alphaTest e depthWrite. A câmera é livre. Game controla teclado e caminhos na mesma posição. canStand, clearSegment e layerWorld validam obstáculos, água e andares sobrepostos. O acessório deve usar a transformação do ator interpolado, nunca uma simulação própria.

Drops online existentes são recompensas individuais, em JSON SQLite, normalmente de uma unidade, com expiração de cinco minutos. Essa expiração não deve ser aplicada a descartes manuais. Offline não há ainda uma coleção genérica persistente de itens no chão. Qualidade de forja não é raridade; unique e type=chest são fatos reais disponíveis para proteção.

## Arquitetura escolhida antes da implementação
- Dois slots aditivos: backpack e cart. Um exemplar inicial de cada. Saves antigos recebem slots vazios e compartimento vazio.
- Mesmo formato de pilha e instância do inventário para o compartimento cartStorage. Um contador de instâncias compartilhado, validação global e transferências transacionais.
- Proposta configurável: mochila de 1,2 kg, bônus de 20 kg; carrinho de 8 kg, 16 espaços e 100 kg de conteúdo. A estrutura equipada é puxada, não pesa na carga pessoal; na mochila conta 8 kg. Multiplicador adicional de movimento de 0,95 vazio até 0,75 cheio. A curva pessoal permanece intacta.
- Desequipar mochila é permitido com espaço: sobrecarga mantém itens e limita movimento. Carrinho com conteúdo não pode ser removido/trocado. Sem transferência automática.
- Descarte pendente é intenção de interface, sem remoção. Fechar prepara toda a operação, valida posição e quantidades e salva inventário e drops juntos. Falha mantém itens; encerramento inesperado antes da confirmação preserva os itens na bolsa.
- Drops manuais têm ID, item, quantidade, metadados de instância quando necessários, mapa, superfície, posição e disponibilidade. Offline pertencem ao snapshot; online pertencem ao dono no SQLite. Sem expiração automática. Trocar mapa apenas oculta drops; nenhuma tabela de loot nova.
- Proteção central: itens únicos, baús e equipamentos de transporte. Sem raridades fictícias. Confirmação explícita com sprite e quantidade.
- Carrinho: acessório relativo com quatro orientações correspondentes ao ator; posição imediatamente derivada de heading e posição interpolada. Profundidade testada contra personagem e cenário. Sem IA ou colisão independente; ocupa a unidade visual do personagem.
- Autoridade online: novas ações validadas estritamente, posição escolhida pelo servidor, transferências em cópia e descarte + gravação em transação SQLite. Campos de snapshot aditivos no protocolo v4.

Valores são propostas de teste, não balanceamento definitivo. Sem alterações nos 44 sprites existentes, sem saves reais, commit, push ou deploy.
