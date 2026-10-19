# Iteração 22.1 — diagnóstico antes da implementação

- Refúgio: limites contínuos menos obstáculos. Torre: união de discos e cápsulas; v1 acrescenta duas trilhas laterais, mantendo o recorte de corredores. A malha visual reproduz esse recorte.
- Colisão, A*, seleção por plano, câmera e sprites usam X/Z e altura zero. O servidor reutiliza Game e colisão; snapshots de jogadores espalham o estado, mas a interpolação descarta altura. Sobreposição exige superfícies explícitas, conexões e validação compartilhada, não deslocamento cosmético.
- Alcance, separação de corpos e interações são horizontais. Precisam considerar contexto vertical; monstros poderão permanecer terrestres, reconhecendo alvos inacessíveis.
- FloorStore preserva definição original; expansão v1 só ocorre em memória. A v1 será mantida, com composição v2 separada e desativável. Dados remotos não foram acessados.
- Caminhada efetiva usa VisualCombat: cinco quadros por ciclo de 2,4 unidades, aproximadamente 7,5 quadros/s a 3,6 unidades/s. O arquivo actor-animation com 8 FPS não governa esse atlas. Não há evidência de que FPS fixo seja a causa; comparar ciclo, ordem das poses e transições por distância.
- Mineração apresenta quadros 2/3/4 durante apenas 0,55 s após a revisão de golpe. Investigar as poses existentes e ampliar a leitura visual sem modificar os tempos do minijogo.
- Pesca: preparação de 0,12 s e recolhimento de um único quadro por 0,55 s. FishingVisual oculta tudo quando active=false, justamente ao concluir a captura. Resultado confirmado precisa de evento visual independente da concessão.
- NPCs: uma imagem estática por personagem, sem rotina ambiental. Preservar escala 4,5 e criar ciclos determinísticos distintos; ferreiro precisa de peça, martelo e bigorna coerentes.
- Oclusão existente usa interseção câmera/personagem e transparência de materiais; câmera orbital será preservada e acompanhará a altura física.

Escopo: desenvolvimento e ensaios locais (inclusive servidor isolado). Sem deploy, instalador, commit ou alteração de saves pessoais.
