# Iteração 36 — Revisão Visual 1: auditoria inicial

O relato humano é uma falha real de apresentação. A aprovação anterior verificava principalmente geração de quadros e visibilidade, e não a continuidade anatômica do personagem equipado.

Referências abertas: relatório da 36; atlas originais de guerreiro, mago, armas e equipamentos; prancha do guerreiro masculino; compositor, poses, acessórios e renderizador. O `iteration36.rar` foi extraído: seus 86 arquivos são idênticos aos da galeria anterior. A captura `imagem exemplo.png` (568 × 568) foi localizada na pasta de capturas e aberta após a resposta do usuário. Mostra espada, escudo, mochila, colete e botas; as peças traseiras se apresentam separadas na vista lateral. A reprodução usa um guerreiro masculino de cabelo cacheado com itens equivalentes; classe, identificador e atributos exatos não podem ser determinados só pela imagem.

Uma cópia de 481 arquivos de código, testes e configuração foi preservada antes da revisão. Os quatro executáveis anteriores e seu manifesto continuam no diretório da entrega original.

| Elemento | Posição atual | Problema identificado | Correção proposta |
|---|---|---|---|
| Corpo | Atlas 24 × 4, célula 128; composição intermediária 256 | Cortes retangulares fixos confundem partes do torso/equipamento com braços | Separar anatomia e equipamentos antes das transformações; máscaras e referências por direção |
| Cabeça/pescoço | Caixa 90 × 80 em aproximadamente (83,31); corte da cabeça em y=116 | Corte global pode incluir a parte superior da mochila e gola | Preservar escala, compor cabeça e cobertura como camada própria ligada ao tronco |
| Ombros | (100,124) e (156,124) em todas as classes/direções | Perspectiva de perfil e diferenças das roupas não consideradas | Referências por classe/direção verificadas sobre os pixels reais |
| Mãos | (87,170) e (169,170), rotação no ombro e quadril | Caminhada usa mãos desenhadas em posições diferentes; troca de lado não acompanha costas/perfil | Fazer corpo, punho e arma usarem a mesma pose e a mesma anatomia |
| Espada/adaga | Centro da imagem (.5,.2) quando empunhada; escala mundial fixa | Empunhadura não é medida na arte; altura ignora .055 do corpo; o corpo acompanha a inclinação da câmera, mas o equipamento era deslocado no eixo Y do mundo; repouso/saque mudam pivô | Metadados de empunhadura; transformação comum em coordenadas do sprite; transição de posição/rotação consistente |
| Escudo | Centro (.5,.25); escala .9 × 1.1; ordem −1 nas costas e 2 nas demais | Centro perto da ponta inferior, produzindo escudo elevado; profundidade genérica | Fixação no centro do antebraço/empunhadura e profundidade dependente do braço e direção |
| Mochila | Desenhada no corpo antes de `poseFrame`; caixa 67 × 89 ou 82 × 104 | O corte de braços atravessa a mochila, girando bolsos e alças separadamente | Camada íntegra presa ao tronco, atrás do torso de frente/perfil e sobre as costas na vista traseira |
| Colete | Caixa 88 × 86 ou 62 × 86, incorporada ao corpo | Bordas do colete entram nos recortes de braço | Camada de tronco íntegra; braços recortados apenas da roupa original |
| Anel | Caixa 8 × 8 em x=86/166, y=157 | Não compartilha o ponto de mão em todas as direções | Transformar com a mão correspondente |
| Bainha | Posição mundial fixa deslocada .37 | Não acompanha inclinação, direção e quadril de modo consistente | Referência de quadril e transformação conjunta |
| Profundidade | Sprites separados com ordens −1/1/2, corpo com escrita de profundidade | Ordem fixa entre transparentes e corpo pode encobrir incorretamente as armas | Composição contextual de partes e equipamento, com testes de oclusão e comparação visual |
| Arte original | PNGs originais preservados; armas verticais e equipamentos isolados | A arte correta não explica os fragmentos animados da mochila | Corrigir recortes/pivôs no compositor; não redesenhar nem remover itens |

A matriz anterior incluía escudo junto às adagas gêmeas, combinação rejeitada pelo inventário (e ocultada pelo renderizador). Arco ou cajado com escudo são aceitos pelas regras atuais; isso não foi tratado como defeito. A nova matriz usa oito conjuntos validados pelo inventário. Os PNGs originais foram mantidos: os defeitos investigados estavam nos pivôs, recortes e transformações do compositor.
