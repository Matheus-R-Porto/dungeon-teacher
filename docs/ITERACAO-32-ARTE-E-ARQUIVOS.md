# Iteração 32 — Arte e arquivos integrados

28/10/2026. A expansão mantém o cenário, as proporções dos personagens e a interface verde e dourada. Os corpos modulares das seis classes já entregues na iteração 31 foram reutilizados; a promoção seleciona a base correspondente sem apagar rosto, cabelo ou identidade individual.

## Recursos

| Recurso | Quantidade | Integração |
|---|---:|---|
| Ícones próprios de habilidades | 80 SVG | Árvore, barra, estados e indicadores de efeito; desenho em grade de pixels com símbolo principal e emblema secundário |
| Ícones de suprimentos | 4 SVG | Flechas, escudo, adagas gêmeas e talismã de Concentração Inabalável |
| Bases de personagens reutilizadas | 6 | Novato e cinco primeiras classes; composição modular da iteração 31 |
| Mão secundária | 2 famílias | Adaga e escudo; adagas gêmeas ocupam as duas mãos |
| Projéteis | 5 famílias visuais | Flecha, orbe neutro, fogo, gelo e eletricidade |
| Efeitos no cenário | Por mecânica | Cortes, cruzes de cura, partículas sagradas, veneno, cristais, chamas, raios, rastros, chuva de flechas e auras |
| Barreira | Volume transparente | Envolve o personagem enquanto há absorção restante |

Os novos recursos são desenhos originais implementados em SVG/Canvas/Three.js, seguindo a arte construída em código já existente. Não foram importadas imagens de terceiros. Os 44 PNG de itens e os dois recursos de transporte anteriores foram preservados. Os ícones usam diferenças de forma e emblema; os estados da árvore também usam palavras e níveis, sem depender apenas da cor.

`class-icons.js` é a origem dos 80 ícones; `iteration32-art-resources.mjs` exporta as cópias SVG. `class-vfx.js` compõe os efeitos animados. Eles acompanham os eventos confirmados pelo servidor e as camadas de exterior/caverna; recursos gráficos temporários são liberados ao expirar e ao trocar de mapa.

As imagens da galeria foram capturadas no Electron compilado, usando servidor e contas temporárias. As cinco folhas de ícones mostram recursos reais em uma página de inspeção, e estão identificadas como tal. Não representam outra tela adicionada ao fluxo dos alunos.

## Arquivos criados ou ampliados

O inventário abaixo cobre implementação, integração e testes. O [manifesto com hashes](ITERACAO-32-ASSETS.json) também relaciona cada um dos 84 SVG.

### Cliente e domínio

- `src/adapters/rendering/class-vfx.js`
- `src/adapters/rendering/combat-visual.js`
- `src/adapters/rendering/modular-actor.js`
- `src/domain/abilities/class-rules.js`
- `src/domain/abilities/class-skills.js`
- `src/domain/abilities/definitions.js`
- `src/domain/abilities/ranked-skills.js`
- `src/domain/abilities/skill-tree.js`
- `src/domain/character/job-progress.js`
- `src/domain/character/job-validation.js`
- `src/domain/character/professions.js`
- `src/domain/character/stats.js`
- `src/domain/combat/attack.js`
- `src/domain/items/carry-config.js`
- `src/domain/items/inventory.js`
- `src/main.js`
- `src/multiplayer/online-ui.js`
- `src/multiplayer/remote-state.js`
- `src/multiplayer/world-mode.js`
- `src/simulation/abilities.js`
- `src/ui/ability-icons.js`
- `src/ui/class-icons.js`
- `src/ui/inventory-presentation.js`
- `src/ui/ranked-tree.css`
- `src/ui/ranked-tree.js`
- `src/ui/school-lobby.js`
- `src/ui/serafina-panel.js`
- `src/ui/skill-presentation.js`

### Servidor

- `server/class-combat.js`
- `server/class-teleport.js`
- `server/online-abilities.js`
- `server/online-progression.js`
- `server/online-tower.js`
- `server/school-access.js`
- `server/world.js`

### Protocolo compartilhado

- `shared/online.js`

### Testes

- `tests/iteration06-rpg.test.js`
- `tests/iteration28.test.js`
- `tests/iteration32.test.js`
- `tests/job-progress.test.js`
- `tests/online-skills.test.js`

### Ferramentas de revisão

- `scripts/iteration32-art-resources.mjs`
- `scripts/iteration32-doc-data.mjs`
- `scripts/iteration32-electron.mjs`
- `scripts/iteration32-vfx-probe.mjs`

