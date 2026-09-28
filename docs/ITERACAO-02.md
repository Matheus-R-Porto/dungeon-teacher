# Iteração 02 — visual híbrido, câmera livre e interação universal

Implementada incrementalmente em 24/09/2026, sobre a fundação existente. A fonte desta etapa está preservada integralmente em `ESPECIFICACAO-ITERACAO-02.txt`.

Esta especificação substitui duas decisões da primeira entrega: atores deixam de ser modelos 3D e a câmera deixa de ter quatro posições fixas. O plano de escopo da Beta continua válido; combate e progressão não foram antecipados.

## O que foi preservado

Mapa e principais estruturas do Refúgio, Three.js/Vite, simulação de movimento, posição/orientação lógica do jogador, WASD, A*, suavização de rotas, colisões, point-and-click, minimapa, pausa e ajuda. `world/collision.js` e `world/navigation.js` não precisaram ser alterados.

## Câmera

- Câmera ortográfica com elevação fixa de aproximadamente 35,3°.
- Pivô em X/Z do jogador interpolado, com foco a 0,75 unidade de altura; a posição do personagem na tela não deriva lateralmente quando a câmera gira.
- Q/E adiciona velocidade angular enquanto a tecla estiver pressionada: 1,45 radiano/s, configurável.
- O botão do meio captura o ponteiro e converte deslocamento horizontal em rotação: 0,006 radiano/pixel. Deslocamento vertical é ignorado. Não inicia movimento por clique nem autoscroll.
- Nenhuma interpolação angular residual: ao soltar, o ângulo permanece exatamente no valor escolhido. Não há snapping, quatro índices discretos nem retorno ao ângulo padrão durante a sessão.
- Zoom entre 16 e 30 unidades de altura ortográfica, com suavização exponencial. A opção do sistema de reduzir movimentos elimina animações decorativas e a transição de zoom.
- Perda de foco, aba oculta, pausa, cancelamento ou perda de captura do mouse limpam controles retidos.
- Botões inferiores também giram enquanto pressionados; Space/Enter os operam pelo teclado. O número em graus é informativo, não uma seleção de posições permitidas.

## Atores 2D no mundo 3D

`SpriteActor` usa um quad de sprite voltado à câmera, com transparência, teste de profundidade, ponto de apoio nos pés e sombra simples no chão. Não existe modelo 3D de personagem nesta entrega.

O atlas provisório é produzido localmente por desenho 2D, com células de 64×96 pixels: oito direções × seis quadros (dois Idle, quatro Walk). São desenhos originais simples; não são assets finais. Material do sprite não recebe a iluminação física do cenário, preservando suas cores e leitura.

`visualDirection(heading, cameraAzimuth)` converte orientação lógica em direção relativa à câmera. Girar a câmera troca a vista do ator sem alterar sua orientação física. As linhas são S/SO/O/NO/N/NE/E/SE em relação à tela. A matemática trata a passagem por 0°/360°.

`animationFrame` e os dados dos clips são independentes do movimento e da renderização. O renderer aceita um estado de animação explícito; clips ainda ausentes, como Attack/Skill/Hit/Death, usam Idle. Isso é fallback visual, não implementação de combate. Um atlas definitivo pode substituir o placeholder pelo construtor do adapter, preservando o contrato de orientação e estado.

## Interação contextual

`InteractionSystem` não depende de DOM ou Three.js. Os objetos ficam no JSON do Hub, com ID, posição, raio, prioridade, rótulo da ação, tipo de comando, conteúdo e parâmetros opcionais de destaque.

Seleção:

1. Excluir objetos desabilitados, fora de alcance, bloqueados pelo cenário ou quando o jogo estiver pausado.
2. Ordenar por `prioridade × 10 − distância + alinhamento frontal × 0,35`.
3. Empatar por ID estável. Manter o alvo anterior enquanto a diferença de pontuação for inferior a 0,15, evitando oscilação entre objetos quase equivalentes.
4. Ignorar apenas os obstáculos explicitamente associados ao próprio objeto; paredes de terceiros continuam bloqueando a interação.
5. Revalidar tudo no momento de F e emitir um comando. A camada de aplicação encaminha-o ao handler registrado.

Portal e placa usam exatamente o comando `examine` e o mesmo diálogo. A UI lê o rótulo do alvo selecionado, e o renderer usa seu raio/altura de destaque para mostrar um halo. Não existe caminho específico de F para o Portal.

O Portal mostra **“Examinar o Portal da Torre”**, em vez de anunciar entrada em uma Torre que ainda não existe. A placa mostra **“Ler a placa do refúgio”**. Novos objetos que examinam informações podem ser acrescentados pelos dados; serviços futuros precisarão de seus handlers reais.

## Hub e oclusão

Iluminação solar quente, fundo claro, verdes mais saturados, pedras em tons de areia, madeira quente, tecido terracota, água turquesa, flores e bandeiras. Portal azul com núcleo, anel dourado, partículas existentes e movimento. Flores são instanciadas; bandeiras usam oscilação simples, sem simulação física de tecido.

Áreas registradas em `hub.zones` reservam comércio, armazém, baús/orientação de classe, treinamento e descanso/life skills. A composição usa tenda, caixas, ruínas, marcação no piso e banco; não há serviços de RPG implementados nessas áreas.

A transparência de oclusão existente foi mantida e estendida a estruturas registradas: ruína, tenda, poço, caixas, placa e portal. O material mágico do portal também recebe fade. O teste é aproximado, por volumes ao longo da linha câmera–jogador; pode suavizar uma estrutura antes de ela ocultar totalmente o sprite. Não é um sistema de recorte geométrico sofisticado.

## Arquivos

Novos:

- `src/core/orbit.js`: estado de órbita e zoom, sem dependência do browser.
- `src/core/actor-animation.js`: direções relativas e seleção de clips/quadros.
- `src/simulation/interaction.js`: seleção, alcance, oclusão e comandos de interação.
- `src/adapters/rendering/sprite-actor.js`: atlas 2D provisório, sprite e sombra.
- `tests/iteration02.test.js`: doze testes adicionais.
- `docs/ESPECIFICACAO-ITERACAO-02.txt` e este relatório.

Modificados:

- `src/adapters/rendering/scene.js`: integração da câmera/sprite, direção visual, decoração e oclusão.
- `src/adapters/input/input.js`: Q/E retidos, arrasto central, captura/liberação e botões de órbita.
- `src/main.js`: integração da órbita e handlers genéricos de interação.
- `src/simulation/game.js`: remoção do índice discreto da câmera; movimento preservado.
- `src/ui/hud.js`: graus, objetivo de órbita e ação contextual conforme alvo.
- `src/core/config.js`: velocidade/sensibilidade de órbita e resposta do zoom.
- `src/data/hub.json`: interagíveis, placa/banco e reservas espaciais futuras.
- `index.html`, `src/style.css`: controles, diálogo genérico, contraste e instruções.
- `tests/foundation.test.js`: substituir o teste das quatro posições removidas por descoberta do portal; demais regressões preservadas.
- `README.md`: versão e controles atuais, substituindo instruções antigas.

## Verificação

**27 testes automatizados aprovados**, incluindo os quinze testes de fundação atualizados e doze novos. Cobrem rotação arbitrária/parada, velocidade independente de fps, wrap angular, mouse proporcional, zoom com limites, WASD em ângulos não cardinais, oito direções do sprite, clips e fallback, seleção/prioridade/desempate de interação, alvo desabilitado/distante/obstruído, revalidação em F e input retido/capturado/liberado.

O teste do adapter de entrada usa EventTargets de teste em Node para exercitar os handlers reais de keydown/keyup e pointerdown/move/up, incluindo botão do meio, deslocamento vertical ignorado e perda de foco. Não é uma certificação física de todos os modelos de mouse.

**Build de produção aprovado.** Permanece o aviso de pacote gráfico acima de 500 kB sem compressão; não houve falha de compilação.

Verificação no navegador integrado:

- Hub renderizado com sprite 2D e visual mais claro; console sem erros capturados.
- Point-and-click percorre a clareira; destino bloqueado mostra aviso.
- Placa apresenta ação específica; F abre seu conteúdo.
- Portal apresenta ação própria e abre o mesmo diálogo genérico com conteúdo distinto.
- E muda para ângulo não cardinal; observado 48,1° mantido após soltar e concluir a caminhada.
- Órbita adicional até 102,7° mantém o personagem central, exibe outra direção do sprite e revela o fade do Portal.
- Interface verificada na área disponível do navegador integrado; a matriz completa de GPUs/navegadores não foi executada.

## Controles finais e limites

WASD/setas: mover. Clique esquerdo no chão: navegar. Q/E segurados: orbitar. Botão do meio + arrasto horizontal: orbitar. Roda/+−: zoom. F: ação contextual indicada. Esc: cancelar caminho ou pausar. H: ajuda.

Sem combate, classes, inimigos, loot, Boss, Torre procedural, multiplayer, serviços do Hub ou salvamento. Recarregar reinicia a sessão e o ângulo inicial, como o restante do estado desta fundação; não há promessa de persistência de configuração nesta etapa. Sprite é provisório, terreno continua logicamente plano, e benchmark de performance em notebook de referência permanece pendente.

A próxima etapa deve partir destes contratos de movimento, câmera, representação de ator e interação, sem reintroduzir atores 3D ou restrição de quatro ângulos.
