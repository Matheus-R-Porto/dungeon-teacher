# Beta 0.4.3 — capturas e gravações

Perfis isolados; nenhuma alteração no save pessoal. As gravações capturam somente o canvas, não o HUD HTML. Screenshots incluem HUD. Amostras temporais são auxiliares e podem estar comprimidas na montagem; os vídeos originais preservam proporção.

## Gameplay real

- [211-authoritative-multiplayer.webm](../screenshots/iteration212/211-authoritative-multiplayer.webm)
- [212-bow-gameplay.webm](../screenshots/iteration212/212-bow-gameplay.webm)
- [212-dagger-gameplay.webm](../screenshots/iteration212/212-dagger-gameplay.webm)
- [212-fishing-gameplay.webm](../screenshots/iteration212/212-fishing-gameplay.webm)
- [212-mining-gameplay.webm](../screenshots/iteration212/212-mining-gameplay.webm)
- [212-regeneration.webm](../screenshots/iteration212/212-regeneration.webm)
- [212-staff-gameplay.webm](../screenshots/iteration212/212-staff-gameplay.webm)
- [212-sword-gameplay.webm](../screenshots/iteration212/212-sword-gameplay.webm)

Campanha: equipamento, técnicas e posição foram preparados; ataques, habilidades, pesca e mineração usam cliques/teclas e temporizadores reais. Multiplayer: dois Electron, party/chat/combate/coleta/portais/reconexão reais, posições preparadas para reduzir deslocamento.

## Matriz de apresentação

- [211-bow-draw-attack-sheath.webm](../screenshots/iteration212/211-bow-draw-attack-sheath.webm)
- [211-dagger-draw-attack-sheath.webm](../screenshots/iteration212/211-dagger-draw-attack-sheath.webm)
- [211-staff-draw-attack-sheath.webm](../screenshots/iteration212/211-staff-draw-attack-sheath.webm)
- [211-sword-draw-attack-sheath.webm](../screenshots/iteration212/211-sword-draw-attack-sheath.webm)
- [211-walk-four-directions.webm](../screenshots/iteration212/211-walk-four-directions.webm)
- [212-bow-all-directions-stored-held.webm](../screenshots/iteration212/212-bow-all-directions-stored-held.webm)
- [212-dagger-all-directions-stored-held.webm](../screenshots/iteration212/212-dagger-all-directions-stored-held.webm)
- [212-staff-all-directions-stored-held.webm](../screenshots/iteration212/212-staff-all-directions-stored-held.webm)
- [212-sword-all-directions-stored-held.webm](../screenshots/iteration212/212-sword-all-directions-stored-held.webm)

Estados de apresentação são injetados no SpriteActor real: quatro direções, armas guardadas/empunhadas, saque, guarda e mudanças de movimento. Isso não é prova de combate lógico.

## Imagens

![211-two-players-city.png](../screenshots/iteration212/211-two-players-city.png)

![211-npc-blacksmith.png](../screenshots/iteration212/211-npc-blacksmith.png)

![212-bow-gameplay.png](../screenshots/iteration212/212-bow-gameplay.png)

![212-staff-gameplay.png](../screenshots/iteration212/212-staff-gameplay.png)

![212-fishing-bite.png](../screenshots/iteration212/212-fishing-bite.png)

![212-mining-impact.png](../screenshots/iteration212/212-mining-impact.png)


## Revisão da matriz

A primeira matriz foi descartada por misturar relógio da cena pausada e relógio de apresentação, mantendo a reação de dano. Os quatro vídeos `212-*-all-directions-stored-held.webm` entregues foram substituídos pela rodada corrigida de `iteration212-matrix-final`, com tempo monotônico, reset de reação e espera pela decodificação de cada atlas. O JSON correspondente é `ITERACAO-21.2-ELECTRON-MATRIZ.json`. Isso foi um defeito do cenário de inspeção, não uma correção de regra de jogo.

## Comparação anterior

[Vídeo da caminhada anterior](../screenshots/iteration212/before-walk-four-directions.webm). As capturas e vídeos de gameplay foram atualizados com a rodada `release-check`, que valida o cursor por estilo computado e seu bloqueio ao abrir um diálogo.

## Encerramento — 19/10/2026

A rodada final controla a oclusão do Electron, traz a janela à frente e aguarda pelo menos cinco atualizações do ator antes de ler cada pose. A verificação anterior podia ler um quadro antigo após mudar o estado. A matriz final valida 32 combinações (quatro armas × quatro direções × dois estados), com captura e metadados de cada combinação. Não foram alteradas regras de gameplay nesta conclusão.
