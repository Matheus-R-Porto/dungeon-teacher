# Iteração 21.1 — Beta 0.4.2

## 1. Resumo

Reconstrução dos atlas e da locomoção, apresentação de combate para espada, arco, duas adagas e cajado, cidade murada com exterior contínuo e redução dos rótulos permanentes. Campanha, multiplayer, inventário, hotbar, combate e recompensas mantêm seus sistemas existentes. Nenhum save do usuário foi apagado. Sem commit, publicação, deploy ou novo instalador.

## 2. Causa dos pixels duplicados

O PNG anterior do aventureiro tinha 1774 × 887 pixels e era dividido como 8 × 4: células de 221,75 pixels. As silhuetas não respeitavam essas divisões: pés da primeira linha chegavam a y=225–228 e os da segunda a y=450–452, entrando no recorte seguinte. Isso colocava pixels dos pés acima da cabeça de outra pose. Não era evidência de RepeatWrapping: a textura já utilizava clamp. O atlas antigo dos Slimes também tinha dimensões incompatíveis com a grade presumida.

## 3. Correção técnica

Extração das silhuetas completas e empacotamento em células inteiras com margens transparentes. Base, NPCs e Slimes usam células de 256 pixels; armas usam 384 para comportar lâminas, arco e cajado. Margens de referência: 22 e 33 pixels. A seleção centralizada valida divisibilidade, índices e dimensões e aplica meio texel de proteção. Clamp explícito, filtro nearest, sem mipmaps, origem vertical consistente e atualização do último frame após carregar a imagem. Fontes decodificadas são compartilhadas e as texturas dos atores são descartadas ao removê-los.

Os testes decodificam os PNGs reais, verificam margens transparentes e diferenças entre os quatro quadros de pernas; a inspeção ampliada no Electron complementa esses testes.

## 4–6. Sprites, animações e quantidade de quadros

| Conjunto | Organização | Revisão |
|---|---|---|
| Aventureiro local e remoto | 6 × 4: parado, quatro passos, dano | Quatro direções, norte inteiramente de costas; pernas e braços alternados |
| Cada uma das quatro armas | 8 × 4: transição, pronto, quatro passos, preparação, execução | Mãos e arma integradas ao corpo; pernas compartilham a marcha validada |
| Derrota do aventureiro | Atlas anterior reempacotado, pose final por direção | Silhueta completa, sem invasão de células |
| Três Slimes | 6 × 3 | Compressão, extensão, salto curto, assentamento, ataque, dano e derrota; sem inventar pernas |
| Seis moradores | 3 × 2 | Margens e ancoragem dos pés corrigidas; permanecem estáticos |

A marcha percorre quatro quadros a cada 2,4 unidades de deslocamento: cerca de seis quadros/s a 3,6 unidades/s. Parado usa pose parada; teleportes não avançam a marcha. Novos snapshots não reiniciam o ciclo. Os quatro passos foram revisados como poses, não apenas como índices diferentes. As laterais receberam gerações específicas e substituição das pernas; ataques oeste de espada e adagas também foram refeitos.

## 7–8. Famílias, saque e guarda

| Família | Exploração | Combate |
|---|---|---|
| Espada | Bainha e cabo nas costas | Empunhadura, preparação e golpe |
| Arco | Arco e aljava nas costas | Arco em mãos, tensionamento e soltura |
| Adagas | Duas bainhas junto ao corpo | Duas lâminas em guarda e ataque |
| Cajado | Cajado guardado nas costas | Empunhadura, levantamento e projeção |

Estados de apresentação: exploração, saque, combate, ataque, dano, guarda e derrota. O saque automático dura 0,24 s com pose intermediária; a guarda dura 0,32 s após aproximadamente cinco segundos sem ação hostil ou dano. Novos eventos interrompem/revertem a transição. Durante o combate, a arma aparece integrada no atlas; os acessórios guardados ficam ocultos, evitando duplicação. Reação a dano preserva a arma e usa pose/tintura/inclinação visual.

Essas durações não atrasam impacto lógico nem alteram recarga, dano, recompensas ou alcance. O servidor fornece somente um campo adicional de apresentação, `visualCombatRemaining`, junto ao equipamento e fases autoritativos existentes. Isso conserva a postura após reconexão. Clientes/estados antigos sem o campo têm fallback. Não há novo comando de combate ou migração de save. As quatro famílias são demonstradas na campanha; a disponibilidade de armas e habilidades do online continua limitada ao conteúdo já implementado.

## 9–12. Cidade, muralhas, câmera e rótulos

Terreno contínuo de 600 × 600 unidades, com relevo externo, floresta, pedras e estradas sul/leste. A plataforma isolada foi removida. Muralhas com ameias, nove torres de vigia e dois conjuntos de portões delimitam a cidade. Portões exteriores são cenário fechado nesta versão; não abrem uma área nova de exploração. A Torre conserva seu portal funcional.

O interior permanece 60 × 56, com serviços, praça e construções existentes. Torres que avançam para dentro recebem colisões compartilhadas entre campanha e servidor; layout da cidade passa à versão 3. Andares e geografia persistida da Torre não são recriados. Muralhas e torres que encobrem o personagem usam a oclusão visual existente, com volumes reais por conjunto.

Câmera continua ortográfica, com os controles anteriores. Plano distante ampliado para 350 e distância ajustada ao zoom na cidade, evitando cortes do terreno/árvores no enquadramento amplo. Sombras preservadas. Floresta/rochas instanciadas por regiões e terreno dividido em blocos permitem culling sem remover conteúdo.

Removidos nomes permanentes dos bairros e texto flutuante da Torre. Placas físicas ficam nas fachadas. Nomes de NPCs aparecem a até cinco unidades; indicação do portal, a sete. Retratos e diálogos existentes permanecem, assim como HUD e hotbar configurável.

## 13. Evidências

[Galeria e vídeos](ITERACAO-21.1-CAPTURAS.md): cidade em quatro ângulos, portões e estradas, seis diálogos, marcha nas quatro direções, todas as famílias em saque/ataque/guarda e multiplayer real. As sequências ampliadas usam entradas de apresentação controladas no SpriteActor real dentro do Electron; não são apresentadas como prova de dano. O ensaio social separado usa combate autoritativo, viagem e reconexão reais.

## 14. Testes

- Suíte completa em execução serial: **544/544**, 256,8 s. [Registro](ITERACAO-21.1-TESTES.txt).
- Após os refinamentos finais e um teste adicional de exterior: **11/11** testes focados de Iterações 21 e 21.1. [Registro](ITERACAO-21.1-TESTES-FOCADOS.txt). Não se afirma uma nova execução completa de 545 testes.
- A primeira execução paralela teve 543/544, com timeout no teste de heartbeat. O teste passou isoladamente e na suíte serial. A rodada focada de rede/cidade teve 42/42. Tentativas iniciais de sockets dentro do sandbox não foram contabilizadas como validação; a execução autorizada fora dele passou.
- Dois Electron reais: party, chat, combate, XP, saque individual, portal para andar 2, reconexão e retorno à campanha; sem erros capturados. [Registro multiplayer](ITERACAO-21.1-ELECTRON-MULTIPLAYER.json).
- Rodada visual final: dois clientes na cidade, seis diálogos, caminhada por teclado/clique e poses ampliadas; sem erros. [Registro visual](ITERACAO-21.1-ELECTRON-VISUAL.json).
- Build Vite aprovado, 103 módulos; aviso conhecido de bundle acima de 500 KB. [Registro](ITERACAO-21.1-BUILD.txt).
- `git diff --check` sem erros; apenas avisos de normalização LF/CRLF.

## 15. Desempenho

[Método, tabelas e dados completos](ITERACAO-21.1-DESEMPENHO.md). Com 12 personagens: **77,17 FPS parados / 65,61 FPS em movimento**; p99 de 18,6 / 24,3 ms. Servidor entre 19,976 e 20,019 ticks/s. Agendador corrigido preservado.

A cidade nova custa cerca de 14% de FPS na janela parada frente à 0.4.1, com 38% mais draw calls. Em movimento, média próxima da referência anterior. O particionamento reduziu 64% dos triângulos enviados frente ao primeiro exterior desta iteração, sem remoção de árvores ou sombras. Não foi demonstrado ganho de FPS em todos os cenários.

## 16. Limitações

Arte provisória com diferenças pequenas de proporção entre poses geradas; animação deliberadamente de poucos quadros. Os Slimes usam movimento próprio de seu corpo, e moradores não ganharam patrulhas. O exterior é cenário, não novo mapa jogável. Serviços/habilidades ainda indisponíveis no online não foram implementados por esta revisão visual.

Não há garantia de 60 FPS constantes: movimento teve 1% low de 33,23 e pico de 64,9 ms. Criação inicial dos mapas, VRAM e 12 computadores físicos não foram medidos nesta rodada. Nenhuma certificação dos PCs da escola. Perfis de teste isolados não substituem o playtest humano.

## 17–19. Arquivos e documentação

Principais arquivos: `src/core/atlas.js`, `src/core/visual-combat.js`; rendering `art.js`, `sprite-actor.js`, `remote-players.js`, `combat-visual.js`, `city.js`, `city-surroundings.js`, `scene.js`; UI `hud.js`, integração multiplayer `world-mode.js` e `remote-state.js`; `shared/city.js`, `server/world.js`, `server/online-tower.js`; atlas `*-v042.png` e respectivos manifestos em `public/assets`; scripts `pack-sprite-atlas.cjs`, `compose-walk-layers.cjs`, `iteration211-electron-probe.mjs`, `iteration211-electron-scenario.mjs`; testes `iteration21.test.js`, `iteration211.test.js`; versões dos manifests e HTML.

README e changelog atualizados para 0.4.2, preservando o histórico. [Proveniência e preparo das artes](ITERACAO-21.1-ARTES.md). Este relatório, desempenho, registros e galeria compõem a entrega; os arquivos anteriores do projeto foram preservados.
