# Iteração 21.2 — diagnóstico inicial (registro anterior à implementação)

A revisão anterior não provou qualidade artística. A captura Electron desta rodada confirma joelho próximo da cintura na passagem lateral. `compose-walk-layers.cjs` conserva tronco armado fixo e troca apenas pernas. `SpriteActor` usa uma pose para toda a transição e geometrias para equipamentos guardados. Preservar atlas com células inteiras, proteção de UV, ancoragem e cache; substituir as poses e a seleção visual.

## Inventário antes da produção de efeitos

| Ação | Implementação | Visual atual / problema | Direção da correção | Modo |
|---|---|---|---|---|
| Básico espada/adaga | simulation/combat.js; domain/items/inventory.js | Pose + impacto SVG comum; pouca diferenciação | Corte/contato distintos e pose completa | Campanha; online conforme arma real |
| Básico arco | simulation/combat.js; CombatVisual.updateProjectiles | Esfera alongada, sem ponta/penas | Flecha ilustrada orientada na trajetória | Campanha |
| Básico cajado | mesmos módulos | Esfera azul | Orbe com núcleo, rastro e impacto próprio | Campanha |
| Golpe Poderoso | domain/abilities/definitions.js; AbilityRuntime | Pose genérica/impacto comum | Corte pesado e contato reconhecível | Campanha |
| Ataque Duplo | mesmos módulos | Dois danos temporizados, impacto comum | Dois contatos ligados aos eventos existentes | Campanha |
| Tiro Duplo | mesmos módulos | Dois projéteis físicos alongados | Duas flechas ilustradas | Campanha |
| Bola de Energia | mesmos módulos | Esfera azul idêntica ao básico | Energia com preparação/impacto próprios | Campanha |
| Regeneração | AbilityRuntime; PeriodicEffects | Números verdes por tick; sem sprite específico | Brotos/partículas discretas nos ticks reais | Campanha |
| Slime de ataque à distância | IA/combate; CombatVisual.updateImpacts | Linha instantânea + impacto comum | Rastro de ataque distinto, sem mudar aplicação lógica | Campanha; online se presente no andar |
| Dano recebido/crítico/morte | CombatHud; world-mode; CombatVisual | Números, tintura/flash e pose | Preservar informação; harmonizar contato | Ambos |
| Mineração | simulation/mining.js | Personagem sem picareta animada | Preparar/erguer, contato no strike e recuperação | Campanha |
| Pescaria | simulation/fishing.js; FishingVisual | Boia e linha partindo do corpo, sem vara ilustrada | Preparar/lançar/esperar/fisgar/recolher | Campanha |

Existem exatamente cinco habilidades ativas; não criar outras. O online informa que habilidades e profissões não estão disponíveis. Novos efeitos não concedem dano, cura, itens ou XP. A tabela final registrará o resultado efetivamente integrado, não apenas esta intenção.

Baseline Electron: scripts/iteration212-baseline-probe.mjs; evidências .logs/iteration212-before. A sequência ampliada é fixture de apresentação; complementar com fluxo real de gameplay e profissões antes da entrega.
