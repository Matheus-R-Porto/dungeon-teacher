# Iteração 22 — Beta 0.5.0 — A Torre Viva

## 1. Resumo
Os três primeiros andares recebem dois circuitos laterais com clareiras, vegetação ilustrada, poças rasas e ruínas. Um lobo quadrúpede complementa os Slimes. O multiplayer continua autoritativo, com população limitada e respawn seguro. Os seis NPCs foram ampliados em 1,5×. Nenhum chefe novo foi criado.

## 2. Diagnóstico anterior
A Torre usa geração determinística, persistência de geografia por andar e população transitória por mundo no servidor. O arquivo contém terreno, trilhas, obstáculos, portais, encontros e spawns; HP, alvos e gerações de respawn pertencem à simulação. Entradas, saídas, IDs de mapa e IDs de inimigos são referências existentes. Os portais públicos são liberados pela política de acesso; a campanha tem encontros e portões próprios.

O renderer anterior combinava discos e faixas de terreno com árvores/vegetação geométricas. A navegação usa a união física de círculos e cápsulas, obstáculos e busca de caminho. A população pública só reagia a impacto hostil; o respawn global efetivo era de 6 s, com afastamento de apenas 1,6 unidade. Os mundos sem jogadores dormem após a janela de reconexão.

**Limite da inspeção:** não havia `data/shared-tower/floor-N.json` neste checkout. Foram inspecionados o loader, os contratos, os testes e arquivos gerados em diretórios isolados. Nenhum arquivo do servidor público remoto foi acessado ou migrado. As dimensões abaixo usam a semente padrão 217021, não são uma afirmação sobre dados remotos inacessíveis.

## 3. Estratégia
`expandLivingTower` aplica uma transformação aditiva v1 em memória ao carregar os andares 1–3. A geração histórica continua disponível e produz os mesmos arquivos-base. A transformação copia os dados, mantém todas as coordenadas e IDs antigos, acrescenta regiões, caminhos, árvores e lobos, e recusa uma versão de expansão desconhecida. Reaplicá-la ao mapa expandido não acumula conteúdo. Os andares 4–12 são cópias equivalentes do original.

Cada circuito sai e retorna à mesma clareira, sem criar intencionalmente uma ligação entre lados de portões da campanha. O caminho principal não foi alongado. Não há migração destrutiva, novos perfis, alteração de credenciais ou reset de save.

## 4. Dimensões
Valores em unidades do jogo; área estimada por amostragem em células de 1 × 1, antes de descontar obstáculos.

| Andar | Largura antes → depois | Profundidade preservada | Área caminhável antes → depois | Caminho principal preservado |
|---|---:|---:|---:|---:|
| 1 | 83 → 104 | 219,43 | 3.907 → 5.499 (+40,7%) | 296,41 |
| 2 | 122 → 144 | 253,69 | 4.601 → 6.463 (+40,5%) | 339,45 |
| 3 | 125 → 137 | 288,63 | 5.250 → 7.334 (+39,7%) | 385,95 |

À velocidade nominal de 3,6 unidades/s, seguir o eixo principal custa aproximadamente 82/94/107 s sem combate ou paradas, como antes. As alternativas laterais acrescentam exploração opcional; não obrigam todos a percorrer uma rota maior. Sementes diferentes têm dimensões diferentes. Dados e hashes em `ITERACAO-22-GEOGRAFIA.json`.

## 5. Identidade
Os nomes canônicos e o título público dos andares foram preservados. A direção artística aparece como metadado: Bosque das Ruínas (aberto), Jardim Esquecido (mais vegetação), Clareira Ancestral (árvores antigas, maior densidade e memorial). A transição de bioma preexistente não foi removida em sementes que a utilizam.

## 6. Elementos naturais
Três árvores ilustradas originais, pedras musgosas, vegetação com flores, plantas de margem, ruína de arco e coluna antiga. Textura original de chão com UVs em coordenadas do mundo evita emendas entre cápsulas e clareiras. Poças têm contorno irregular, borda, tonalidade própria e movimento vertical muito discreto, sem reflexão em tempo real. Todas as poças novas são rasas e atravessáveis. Os pontos de pesca e mineração existentes foram preservados.

## 7. Colisão e navegação
Troncos no terreno têm colisor circular de raio 0,55. A distribuição evita centros de trilhas, spawns, interações e portais. Árvores externas ficam fora da união caminhável. Copas usam o mecanismo existente de transparência por oclusão; não são paredes de colisão. Trilhas novas têm raio 3,6 (largura 7,2). Testes percorrem as arestas com raio de navegação 0,85, validam spawns e acessos. A expansão tem validação física no carregamento, além do grafo.

## 8–10. Lobo, arte e IA
Atlas original com 7 colunas × 4 direções: idle, três passos terrestres, ataque, dano e derrota. Os quadros são recortados por alfa e empacotados com escala uniforme e margem, preservando o tamanho da pose de derrota. Direção acompanha a câmera; a caminhada acompanha deslocamento, sem o salto dos Slimes. A fase de ataque do lobo online vem do servidor.

A IA usa alvo, linha de visão, navegação, colisão, ciclo de ataque e leash existentes. Andar 1: passivo até impacto válido. Andares 2–3: percepção territorial de 5,5 unidades, consultada a cada 0,18 s. Perde o alvo quando inválido ou fora do leash, retorna e espera 2 s para nova aquisição. Não há matilha, flanqueamento ou emboscada.

| Atributo | Valor |
|---|---:|
| HP por andar | 85 / 100 / 115 |
| Ataque físico por andar | 9 / 10 / 11 |
| Defesa física | 3 |
| Alcance | 1,25 |
| Velocidade de perseguição / retorno | 3,8 / 4,2 |
| Frequência de ataque | 0,85/s |
| Leash | 10 |
| XP individual de referência por andar | 12 / 15 / 18 |

Online, a regra de contribuição e divisão da party continua calculando a concessão; o valor da tabela não significa que cada membro recebe o total. Loot usa os itens e tabelas existentes. Na campanha, derrotar também os novos opcionais naturalmente aumenta o XP total possível; XP continua progressão de nível, nunca moeda.

## 11. População
Na semente de referência, Slimes/lobos: 5+1, 8+3, 9+5. Todos os Slimes originais são preservados. Lobos ocupam as clareiras laterais, afastados da entrada e dos portais. Nenhuma entidade é criada por frame ou por cliente.

## 12. Respawn
Nos andares expandidos online: Slime 24 s, lobo 32 s. O servidor aguarda distância de 6 unidades de qualquer jogador, ausência de outro monstro e espaço válido no colisor. Também verifica afastamento dos portais. Reutiliza o mesmo ID, incrementa a geração e restaura a entidade; não aumenta a população. Uma reconexão recebe o snapshot da mesma simulação. O tempo é de simulação: mundos adormecidos não avançam offline. Andares posteriores mantêm seu intervalo anterior.

A campanha conserva `noRespawn`: uma nova run recria a população. Não foi introduzido respawn no meio da expedição local.

## 13. Persistência e reversibilidade
`floor-N.json`, seu hash e versão de gerador permanecem intactos. O hash servido pode diferir, pois inclui a expansão; `storedHash` continua identificando a fonte original. Não há sidecar necessário: a versão da transformação e a semente determinam a expansão. Desativar a transformação em uma versão futura devolve a geografia-base, sem recuperação de backup ou perda de perfil. Mudanças futuras na transformação exigem nova versão, não edição silenciosa de v1. O carregamento e a validação continuam falhando de forma explícita diante de arquivo inválido.

## 14. Cooperação
Dois processos Electron reais, com perfis e servidor locais isolados, compartilharam os três andares, os mesmos lobos, combate, derrota e respawn. O roteiro existente também validou criação/convite/aceite de party, chat privado/global, XP, coleta manual de loot, portal e reconexão. O limite de party continua seis; não foram criadas instâncias individuais da Torre pública. Posições de preparação foram ajustadas no servidor de teste para evitar repetir caminhadas longas; dano, XP, drops e respawn não foram injetados.

## 15. NPCs
Escala final: **1,5× em ambos os eixos**, de 3 × 3 para 4,5 × 4,5 unidades de sprite. Mantidas proporções, âncora dos pés em 0,1, posição vertical em 0,04 e coordenadas de interação/colisão. Retratos não mudaram. Comparações dos seis moradores foram feitas no Electron; os rótulos foram elevados para não cobrir os rostos maiores. Nenhum NPC foi redesenhado. Os seis diálogos foram abertos por clique normal a partir de pontos válidos de aproximação. A câmera foi girada para conferir também a cozinheira, que pode ficar atrás de um telhado no ângulo inicial; a posição da cidade não foi alterada.

## 16. Evidências
As capturas distinguem inspeção preparada e gameplay. `screenshots/iteration22/` contém comparações dos NPCs, entradas e clareiras dos três andares, memorial, combate, derrota e respawn, além de vídeos. Os vídeos válidos de combate dos andares 2–3 usam simulação e protocolo reais; os de caminhada final dos andares 2–3 usam teclado. Há capturas dos três andares. Dois arquivos de captura vazios do andar 1 foram descartados da entrega. Os vídeos de combate antecedem o acabamento do chão; as capturas e vídeos com prefixo `final-` mostram esse acabamento. Preparação de posições não representa uma caminhada integral desde a cidade. Os mapas foram executados dentro do Electron, não apenas em um visualizador de sprites.

## 17–19. Testes, Electron e desempenho
**559/559 testes aprovados** na execução completa final (310,94 s); build de produção aprovado. Logs em `ITERACAO-22-TESTES.txt` e `ITERACAO-22-BUILD.txt`. Integração de dois Electron em `ITERACAO-22-ELECTRON.json`, campanha em `ITERACAO-22-CAMPANHA.json` e inspeção/diálogos dos seis NPCs em `ITERACAO-22-NPCS.json`. A primeira suíte detectou expectativas históricas de população, XP opcional e respawn; elas foram atualizadas explicitamente para os valores da Iteração 22. O teste inicial de retorno à campanha encontrou um botão fora da área visível do roteiro de automação: foi corrigida a rolagem no teste, e a campanha foi verificada separadamente com sucesso.

O benchmark distingue um processo Electron de clientes de protocolo. O controle adicional usa a geografia-base imutável no worker isolado, sem modificar mapas persistidos ou código do jogo. A referência inicial desta sessão ficou próxima de 120 FPS, diferente do histórico de ~80 FPS; isso não é apresentado como ganho causado pela Iteração 22.

Na cidade com 12 personagens realmente visíveis, a repetição final mediu 119,8 FPS parados e 116,6 FPS em movimento. A conferência excluiu duas amostras do roteiro ampliado em que o grupo tinha ficado parcialmente fora da câmera; os dados brutos foram preservados no JSON.

A expansão manteve aproximadamente 119,7–119,8 FPS nos cenários medidos da Torre, incluindo 12 personagens visíveis. P99 entre 8,7 e 9,0 ms; maior frametime dessa rodada de 31,2 ms. Servidor entre 19,97 e 20,02 ticks/s. Isso não é ganho sobre o histórico: o controle contemporâneo também ficou perto de 120 FPS.

Houve aumento relevante de custo gráfico: no encontro com 12 personagens, draw calls 110 → 139, materiais de cena 108 → 246 e fontes de textura 2 → 5, enquanto triângulos caíram de 30.378 para 12.306. Os novos assets somam ~20,06 MiB RGBA antes de mipmaps e overhead. Heap variou conforme GC; não é medida de VRAM. A expansão isolada acrescentou aproximadamente 1 ms por mapa na medição de domínio/arquivos. Resultados detalhados, cargas e limitações em [ITERACAO-22-DESEMPENHO.md](ITERACAO-22-DESEMPENHO.md), [JSON de medições](ITERACAO-22-DESEMPENHO.json) e [carga dos mapas](ITERACAO-22-CARGA.json).

## 20. Problemas conhecidos e limites
- Não houve teste em 12 computadores físicos nem no hardware da escola.
- As artes continuam sujeitas à avaliação humana; sprites bidimensionais giram para a câmera, não são modelos 3D.
- O comportamento de oclusão e o crescimento de memória devem continuar sendo observados em sessões longas.
- Os percentis de frames foram medidos após aquecimento. A primeira transição observada demorou ~474 ms até a mensagem de mapa, incluindo protocolo e polling; o custo GPU do primeiro frame não foi isolado. Isso não autoriza afirmar ausência de travadas no carregamento.
- Não houve acesso aos arquivos reais da Torre pública remota; compatibilidade foi validada em bases isoladas e contratos existentes.
- Caminhada do protagonista ainda não totalmente natural, saque/guarda, pesca, mineração e as cinco habilidades permanecem pendentes de playtest humano. Não foram reconstruídos aqui.
- O chefe antigo da campanha foi preservado para não quebrar o loop. Nenhum chefe novo foi adicionado à Torre pública.

## 21. Arquivos desta iteração
- `src/world/living-tower.js`: expansão pura e versão.
- `server/tower.js`, `server/world.js`: aplicação na carga, percepção do lobo, fase visual e respawn seguro.
- `src/simulation/areas.js`, `src/domain/enemies/config.js`: campanha expandida e atributos do lobo.
- `src/adapters/rendering/{living-forest,forest,combat-visual,city,scene}.js`: ambiente, monstro e escala dos NPCs.
- `src/multiplayer/world-mode.js`, `src/ui/hud.js`: texto genérico de monstro e posição do nome de NPC.
- `public/assets/{monsters,environment}/*v050*`: artes e manifestos.
- `tests/iteration22.test.js` e expectativas relevantes em testes antigos.
- `scripts/iteration22-*`, `scripts/pack-iteration22-atlas.cjs`: evidências, diagnóstico e empacotamento técnico.
- Versões nos manifests/index, README, changelog e estes relatórios.

O repositório já continha muitas alterações das iterações anteriores. A lista acima delimita este trabalho; o diff total contra o último commit não corresponde somente à Iteração 22.

## 22. Documentação
README e changelog atualizados para 0.5.0, incluindo diferença entre campanha e multiplayer, preservação de arquivos-base e ausência de instalador/deploy.

## 23. Preparação para a Iteração 23
O memorial do terceiro andar tem espaço e composição para um encontro futuro, com `futureArena.active=false`. Não há spawn de chefe, gatilho obrigatório, recompensa especial ou nova mecânica nessa região. A Iteração 23 não foi iniciada.
