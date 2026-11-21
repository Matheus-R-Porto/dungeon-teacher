# Iteração 36 — arquivos e procedência

Comparação SHA-256 com a cópia de referência produzida antes da implementação. Os hashes abaixo identificam a entrega; não substituem os hashes dos quatro executáveis, que estão em `release/iteration36/SHA256SUMS.txt`. Arquivos de relatório, galeria, logs e artefatos gerados são entregáveis adicionais e não entram na comparação de código.

## Mudanças de testes anteriores

As expectativas de retorno obrigatório ao nascimento foram adaptadas para a regra solicitada de exploração na posição atual. Um cenário de cache de caminho mantém seu alvo imóvel por fixture, para continuar isolando a propriedade testada. O roteiro de combate local acompanha a posição atual do inimigo, em vez de continuar andando para o ponto de nascimento. As asserções de morte, sobrevivência, colisão, recompensa e progressão foram mantidas. O ciclo indevido de cura após perda de aggro longe do nascimento foi corrigido no produto, não ocultado por redução de dificuldade.

## Arte nova

Ferramenta: ImageGen integrada, modo de edição com referência ao atlas existente e fundo transparente. Não foi usada uma imagem da internet. Arquivo original retornado: `C:/Users/theuz/.codex/generated_images/01a178a4-8b04-70f1-9fca-efebfc6cb7e1/exec-638554c6-93d1-428a-9377-e52a7bbed34b.png`.

O original foi preservado como `public/assets/characters-v36/heads-extra-source.png`. O script existente `scripts/pack-sprite-atlas.cjs` organizou as células 6 × 4 em `heads-extra.png`, metadados e imagens de inspeção. Os seis cabelos são adicionais; os recursos de `characters-v31` e os sprites existentes do MVP permanecem preservados.

Prompt completo:

> Use case: stylized-concept. Asset type: transparent modular RPG sprite atlas for Dungeon Teacher. Use the attached heads atlas only as the exact style/face reference. Create a NEW atlas of 24 isolated heads, six columns and four rows, evenly spaced equal-size cells, no text or grid lines. Columns left to right: straight medium bob; long flowing hair reaching shoulders; long single braid; rounded voluminous curly hair; gathered high bun; short narrow spiked crest. All six hairstyles are brown with the same warm illustrated pixel RPG shading and dark clean outlines as the reference, not flat polygons. Same androgynous youthful adventurous face, turquoise eyes, neutral calm expression in all frontal cells, identical head/skull proportions and face placement. Row1 front facing viewer; row2 true left profile looking left; row3 back of head, no face; row4 true right profile looking right. All columns show the exact same hairstyle from the four angles. The styles must be clearly distinct silhouettes and usable on male or female bodies. Complete isolated head and hair only, no torso or neck accessories, no hats, no weapons, no shadows. Keep at least 15% transparent margin between heads, every head entirely inside its cell. Genuine transparent RGBA background. Precise game production sprite sheet, preserve the established painted pixel RPG identity of the reference.

## Arquivos de implementação, testes e distribuição

| Arquivo | Situação | SHA-256 |
|---|---|---|
| electron-builder.adm.yml | Configuração de distribuição | c0a602a25ceafd63ab097feab89f1d28cb82f33fe3af7b40b8674367e7981c90 |
| electron-builder.student.yml | Configuração de distribuição | 1c5726d5090b50c10d19857d804a1d8be51ce77e4a18791b5fc66daa833625f5 |
| public/assets/characters-v36/heads-extra-reference.png | Arte adicional | a2f15c067610131d4b4d4dd0810748252eb22092a39e8cdcb2409d8bd6c9cd94 |
| public/assets/characters-v36/heads-extra-row0.png | Arte adicional | d392b70a70fa73ba30fb375ed33e92106b200403983c58932f10f515c1be5e3e |
| public/assets/characters-v36/heads-extra-row1.png | Arte adicional | 87586d1745a7b6b38da8f4184fbef34313db0481104c126b4b7729c7a7739c6c |
| public/assets/characters-v36/heads-extra-row2.png | Arte adicional | 6f4391da02ad6353a9e9be149a15af85b815de64f4cbf8fe676f5daf19160bd2 |
| public/assets/characters-v36/heads-extra-row3.png | Arte adicional | 85c8bb6020af42a8e88e7702d798e9d8d9946826ccd7b0fbff11afe6d7a39fe2 |
| public/assets/characters-v36/heads-extra-source.png | Arte adicional | a4f266d9990b069151ad280b2d32aef1135da140fa64cace2f3ed9aecde5aa7c |
| public/assets/characters-v36/heads-extra.png | Arte adicional | 366083ec65c6fb10aedeeb428fb73efccfcffe2b37d4d8dc7735b85fc639a09a |
| public/assets/characters-v36/heads-extra.png.json | Arte adicional | b415bbbf82ef8d3f6e7199f95f34ddb9136f3e6310ef42242d8e9ec05b9c5cab |
| public/assets/monsters-v36/white-wolf-reference.png | Arte adicional | 510afee8e1231bcb411c8f7cbbcd52c6cd9615358c27ee9d491670f6ab28c88b |
| public/assets/monsters-v36/white-wolf-row0.png | Arte adicional | d2c2abb35a639e776d77a277e338c6968480f4f79b86e89e7ecf562d56039daa |
| public/assets/monsters-v36/white-wolf-row1.png | Arte adicional | d4cfb1bd0cc75adadd7ce5b6260199831d262c263e74f0d4343a953b7da2e026 |
| public/assets/monsters-v36/white-wolf-row2.png | Arte adicional | c9b1c07e60a5bb5818984e20dd202b67d6b56a2f6377545dd2871ad90dc65463 |
| public/assets/monsters-v36/white-wolf-row3.png | Arte adicional | ec5cda967db38ab7e6669952cf71c9e35ad551b40ec9f05167aa2eb6883d31d7 |
| public/assets/monsters-v36/white-wolf-source.png | Arte adicional | 6094a63c1ab1d1a954e5b6ef9e415ed4de13ee191e05bf373f0c974e05d9401c |
| public/assets/monsters-v36/white-wolf.png | Arte adicional | a8ca89694c6932e984b9835f741caeae508494e116375264945eca3657497bec |
| public/assets/monsters-v36/white-wolf.png.json | Arte adicional | c9a68c0dcee25ed68ec2bf8f938def6a580ba44e75742de9fe8374b83377db6a |
| scripts/iteration36/electron.mjs | Adicionado | 34c89e2cd3782ebe7147cd590750b120234beffa81f4fc8789ee6e4ca7a463da |
| scripts/iteration36/flows.mjs | Adicionado | 556a55c2f243492f9df2928ad199559cde5eb3d506088cfd67ea1b2f153e39e0 |
| scripts/iteration36/gallery-check.cjs | Adicionado | dd5550dae11e658dfe88ad98919d508679ff8937828a7aae8ddebc5a38f39928 |
| scripts/iteration36/load-worker.mjs | Adicionado | 67ad6fcaf39901130b24708616676316e4f2c2ff5acbb462f4cc2b175cdcee79 |
| scripts/iteration36/load.mjs | Adicionado | 46d9d16e8e6e230ff6740e9dbc7c02bd1163c75a564a9adb9aeb47efa4eb5c47 |
| scripts/iteration36/mvp.mjs | Adicionado | 54eeac4c8f3bedd86cd8ad05dc5bfcb1cac789642ccb41f97c7a6bbd35477930 |
| scripts/iteration36/performance.mjs | Adicionado | 8a71d17d4402681becff68430a28258ef51458bd40be9884072d24c57f4eac85 |
| scripts/iteration36/visual-compare.cjs | Adicionado | 15163cd24d89fe687df25ecfd2e5b3ca9cdb2b42fde69ce4b392b5a0f10910da |
| scripts/iteration36/visual-matrix.cjs | Adicionado | abc68cfe16209f7b090de05ee5fabc39db3ca6884c2aeed9c4be305ae92eba26 |
| scripts/iteration36/visual-run.mjs | Adicionado | 9255f7072e29385168fba6937a4622c6d93e4b8ffaad96fedde750cd5e184ef8 |
| scripts/iteration36/visual.cjs | Adicionado | 95b287199761ee13b0df6c1321cd61856b1090b4b07533d03cff70005c0480bc |
| scripts/package36-electron.mjs | Adicionado | e4bfb792b819f2484f9e6849af7c221bfc1ed0d7a44b5af80d83bdfc9e2dcdb7 |
| scripts/verify-iteration36-packages.cjs | Adicionado | 548a2002e2618049a47510a35a5548a4e0f8fc5a7cac3a37ad39a41080f5f3c3 |
| server/online-craft.js | Adicionado | 96da958ce0c20191731b20529747e90a46076b3232ff6ff33003a1d53834c187 |
| server/online-life.js | Alterado | ea8932bbca33547ca002fa14075a56f9487a90c34a3f54c98aeefbfde7ce23b5 |
| server/online-progression.js | Alterado | b44b08f06b4bf57fb1717b93fedbb3a607b1d172adae315d7e3f94eb86ba44cc |
| server/online-tower.js | Alterado | f567eb6dbbeb77e1157ff04e93e2ce1bc70268be29e1b6af2b54f0e3a630f5e6 |
| server/white-wolf.js | Alterado | 37820bf52f72167bd5227c6221f4e9889f4a62ce1d9c6cd26e1e628d88e047fe |
| server/world.js | Alterado | 9aa025bb6b7c1d4076601de58a708cf49b9af4f8d954a6b37b39bc3bc4ffb9ea |
| shared/city.js | Alterado | f0e27600e21e200b6bdd13d3175e3fc35edfefe6875f8bad386ad72a84d44e34 |
| shared/online.js | Alterado | 1698481824c1cb2eecad284b9c51d2144b6bfc78800de4634167bb48dcaf2fd7 |
| src/adapters/rendering/actor-preparation.js | Alterado | 732eed18829729153030fd8377e8d12ca5cbba4d6f15a4e371e69e16bedae246 |
| src/adapters/rendering/appearance-compositor.js | Alterado | 6b6bc7b9ab65164b5ef1f080ae98a633b49ae2b76f6d87202fa23efba96fa26f |
| src/adapters/rendering/combat-visual.js | Alterado | 67cc7e95cd1a30c11fff023e8848bc3cf498f14758c27643f9c795eda90ba02a |
| src/adapters/rendering/modular-actor.js | Alterado | 54af9eba0b7a6620cec772e02ff2efcf209495d56fe0680f190833d5a6e08bab |
| src/adapters/rendering/pose-compositor.js | Adicionado | 0d94677f6cd2f25fa450341af2f3af90f195ec83bbaa68113a94720b19a8ba70 |
| src/adapters/rendering/scene-transition.js | Alterado | 2d39a5eb7458d3ae4afb5a1d30798b6dccd15dd32d22b61ba4a6b43f574fe527 |
| src/adapters/rendering/scene.js | Alterado | 54534429a9399446c410da286cb485a1e4ee287f81f6a3835bf3da6c86681234 |
| src/core/modular-pose.js | Adicionado | 49b6333f748d928dfc69a173a84397a972a0083f506b02c5ec4b5eb4a1fc5200 |
| src/domain/appearance.js | Alterado | febf0e049e000582613ea0600bcdd7336f4a752ff3fd18c84a73520c66d26e86 |
| src/domain/shop.js | Alterado | 618bc752b04fb180bd6150c0bc33385a88ea4f1399006214143af418b2281b8f |
| src/multiplayer/craft-client.js | Adicionado | a9555446db27cbd9789cf309d23a0af5a3d6e6779df46c31ca4b788bfdd74d7b |
| src/multiplayer/remote-state.js | Alterado | d35aabaa19faa97e1c397fb451ef475d5c51c108b5d878efbdc5e4d9e959e1f4 |
| src/multiplayer/smith-dialog.js | Alterado | 1b0131f4da2b8011587448952b16126c0e071780a1ea72b90900185320ec9c91 |
| src/multiplayer/world-mode.js | Alterado | c857be33dad230a30c0ac2be09306f401d91a0a56309c9f6906eebed0948c528 |
| src/simulation/enemy-ai.js | Alterado | 2100fc650e8372377ae1e45ee96de7ffa50c22623574cb08af725d53537256bd |
| src/simulation/roaming.js | Adicionado | 4f8058e433bd3b2d65f9b719b5749c98286ea76e1635c407eefecfc139e46a4c |
| src/ui/school-lobby.js | Alterado | 656e7289f163510f9acf233f29c2292dbba15da533728b57a8565770130b9a43 |
| tests/iteration08.test.js | Alterado | da26a307cf84e5bb68f7dd94891e9f7d8568ab52fdaa23de51ed816b555b2d26 |
| tests/iteration22.test.js | Alterado | 65da776aa3def5c3faeec6b41e0fc6f2fddbb12f7d965a2192e2a7a943a6dd35 |
| tests/iteration23.test.js | Alterado | ecd1d3f4821af6fba4b9bfed2740acd06b090300ad73633395f057797b803311 |
| tests/iteration233.test.js | Alterado | 4a7fbe05f6020b1c68193e226751d1d01005ae180aec72fa296e7ef6ba9861ad |
| tests/iteration36-craft.test.js | Adicionado | 035a69e984c9a1ad6fb3abcf7e231f094412ea2c315d62e8a3ece225ad33d35c |
| tests/iteration36-presentation-ai.test.js | Adicionado | 4f3f650077d9c29fe0fd7ec73a70a966f4e0e84afb46b0e5a209d6d2b886e576 |
| tests/tower-shared.test.js | Alterado | 1305bac2d167eb08f1e761296fb1d19d1de90f1de3d2fc0588569ef927ab3979 |

## Arte adicional do MVP

Ferramenta: ImageGen integrada, referência ao atlas pintado dos lobos comuns do projeto e fundo transparente. Original: `C:/Users/theuz/.codex/generated_images/01a178a4-8b04-70f1-9fca-efebfc6cb7e1/exec-936eca75-0707-4318-ac3f-be21bb5e967f.png`.

O original foi preservado em `public/assets/monsters-v36/white-wolf-source.png`. O empacotador existente organizou nove colunas e quatro direções, 36 quadros, em `white-wolf.png`, com metadados, referência e imagens por linha. O SVG anterior não foi apagado. Nenhuma estatística ou habilidade foi criada para acomodar a arte. Foram conferidos o atlas e o resultado dentro da caverna, incluindo fúria, corredor da carga e lápide.

Prompt completo:

> Create a production sprite atlas for the EXISTING Dungeon Teacher boss White Wolf. Use the attached ordinary wolf atlas as the exact painted pixel RPG visual style reference, but create a distinct majestic WHITE wolf boss, pale ivory layered fur with icy gray shadows, ice-blue eyes, subtly darker mane, recognizable strong silhouette. No armor, no new accessories, no text, no scenery, no geometric placeholder look. Full quadruped canine anatomy, natural weight and paws, consistent size and head/body proportions. Output ONE transparent RGBA atlas, precisely NINE equal columns and FOUR equal rows, 36 fully isolated whole-body sprites, with generous transparent margins inside each cell and no cropping or overlap. Same wolf and same scale throughout. Columns left to right: 1 relaxed alert idle; 2 walking left forepaw forward; 3 walking right forepaw forward; 4 walking passing stance; 5 low aggressive bite windup showing teeth; 6 bite follow-through/recoil with head forward and shoulders engaged, also usable for hurt reaction; 7 death lying on its side completely contained in cell; 8 howl with head tilted upward and jaw open; 9 enraged bristling stance, intense eyes but same white fur. Row 1 front facing viewer; row 2 left profile facing left; row 3 back facing away; row 4 right profile facing right. Each walking row really faces its own direction; do not reverse walking orientation. Keep the wolf feet aligned to a shared cell ground line. Crisp detailed pixel-art shading consistent with the attached atlas, clean readable silhouette at game size. Distinct boss identity while preserving the visual world of Dungeon Teacher.
