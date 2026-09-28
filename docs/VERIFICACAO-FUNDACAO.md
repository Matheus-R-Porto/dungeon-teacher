# Verificação da fundação — 24/09/2026

## Automatizada

`npm test`: 15 testes, todos aprovados.

- Validação do mapa, limites, valores inválidos e IDs duplicados.
- Entrada livre e centros de obstáculos bloqueados.
- Direção relativa à câmera e velocidade diagonal normalizada nas quatro orientações.
- Movimento sem atravessar parede fina, inclusive com delta grande.
- Deslizamento ao longo de parede sem penetração.
- Testes de segmento contra círculos, retângulos, limites e paralelas.
- Caminho ao redor de obstáculos com todos os segmentos livres.
- Recusa de destino bloqueado, fora do mapa e região desconectada.
- Recusa de passagem diagonal estreita.
- Rotas válidas para vinte destinos distribuídos no refúgio.
- Simulação seguindo caminho até o destino e parando.
- Cancelamento de caminho por teclado e comando explícito.
- Pausa conservando posição, tempo e caminho.
- Rotação completa e descoberta do portal por proximidade.

`npm run build`: aprovado. O pacote JavaScript inclui a biblioteca de renderização e gera aviso de tamanho superior a 500 kB sem compressão; não é falha de compilação. `npm install`: auditoria inicial sem vulnerabilidades reportadas.

## Inspeção no navegador

Navegador integrado do Codex, em servidor local de desenvolvimento:

- Cena renderizada com personagem, caminhos, obstáculos e portal.
- Tecla E percorre as quatro orientações e retorna ao início; guia atualiza 4/4.
- Clique no caminho leva o personagem do ponto inicial até o portal; guia registra 8/8 metros e proximidade.
- F abre a interação informativa; fechar retoma a exploração.
- Botões de rotação e zoom funcionam; objetivos do guia chegam a conclusão.
- Minimap corrigido para acompanhar a mesma orientação da cena.
- Aviso de API de sombras descontinuada corrigido para PCFShadowMap.
- Interface inspecionada em 1280×720, 1366×768 e 1920×1080; painéis dentro da área visível em desktop.
- Pausa e ajuda abertas/fechadas pelos botões, com retomada da exploração.

## Ainda não certificado

Não foram concluídos o benchmark de 60 fps, o teste humano de dez minutos, a matriz Chrome/Edge/Firefox nem validação em GPU integrada de referência. Não há testes de combate, save ou Torre porque esses sistemas ainda não existem nesta entrega.

A aceitação da fundação deve incluir uma sessão do usuário para avaliar sensação de movimento, tamanho do personagem, distância da câmera e legibilidade. Isso complementa os testes de correção, sem confundir um protótipo funcional com a Beta completa.
