# Iteração 06 — Sistema universal de habilidades e kit do Novato

## Resultado

Cinco habilidades reais, hotbar de oito slots, requisitos de arma, conjuração, MP, cooldown, aproximação pelo alcance da habilidade, fila única e efeitos reutilizáveis. O personagem continua Novato. A IA, navegação, câmera, atributos e persistência anteriores permanecem integrados. O menu recolhido continua no canto superior esquerdo, sem o título Dungeon Master na HUD.

## Arquivos

Criados:
- `src/domain/abilities/definitions.js`: catálogo, armas provisórias, hotbar e validação.
- `src/domain/abilities/effects.js`: projéteis e efeitos periódicos genéricos.
- `src/simulation/abilities.js`: AbilityRuntime, execução, targeting e fila.
- `src/ui/ability-hud.js`: hotbar, teclado, tooltip, estados e debug de arma.
- `tests/iteration06.test.js`: 32 testes desta iteração.
- `docs/ITERACAO-06-PROMPT.md`, `docs/ITERACAO-06-RELATORIO.md` e `docs/DIRETRIZES-DE-PROGRESSAO.md`.

Modificados:
- `src/domain/combat/attack.js`: controle de início do próximo ataque automático.
- `src/simulation/combat.js`: integração das habilidades, aproximação, cancelamento e morte.
- `src/domain/combat/config.js`: defesa mágica do Slime de Treino.
- `src/domain/character/character.js`: arma equipada e habilidades conhecidas.
- `src/adapters/persistence/character-save.js`: leitura e validação dos novos campos opcionais.
- `src/main.js`: composição, atualização, bloqueios de interface e descarte.
- `src/adapters/rendering/combat-visual.js`: projéteis e indicação de conjuração.
- `src/adapters/rendering/scene.js`: descarte dos recursos gráficos de combate.
- `src/ui/combat-hud.js`: nomes dos estados e números de cura.
- `src/style.css`: hotbar, cooldown, indisponibilidade e posição do debug.
- `index.html`: identificação da iteração e ajuda.
- `README.md`: instruções atualizadas.

## Arquitetura e definições

AbilityDefinition contém identidade, descrição, ícone, targeting, alcance, custo, cooldown, cast, recovery, requisitos, flags e uma sequência temporal de efeitos. Tipo de dano e multiplicador ficam no efeito, permitindo sequências heterogêneas. A validação rejeita requisitos desconhecidos, números inválidos, efeitos vazios e tempos fora de ordem.

AbilityRuntime mantém cooldowns, uma intenção pendente e uma execução ativa com instante inicial, estatísticas capturadas e índice do próximo efeito. Nenhuma habilidade tem um sistema dedicado. A simulação usa o mesmo relógio do combate; renderização e HUD apenas representam seu estado. As cinco habilidades atuais são interrompíveis. O campo `interruptible` registra essa característica; variantes não interrompíveis ainda não foram implementadas.

| Slot / habilidade | Arma | Alcance | MP | Cooldown | Cast / recovery | Efeito provisório |
|---|---|---:|---:|---:|---:|---|
| 1 Golpe Poderoso | Espada | 1,45 | 8 | 4 s | 0,25 / 0,45 s | 1 impacto com 2,2 × Physical Attack |
| 2 Ataque Duplo | Adaga | 1,4 | 10 | 4 s | 0,12 / 0,35 s | 2 impactos de 0,9 × Physical Attack, separados por 0,18 s |
| 3 Tiro Duplo | Arco | 7 | 12 | 5 s | 0,2 / 0,35 s | 2 projéteis de 1 × Physical Attack, separados por 0,22 s |
| 4 Bola de Energia | Cajado | 7 | 14 | 5 s | 0,8 / 0,4 s | 1 projétil de 1,9 × Magic Attack |
| 5 Regeneração | Qualquer | Próprio | 14 | 10 s | 0,25 / 0,3 s | 6 ticks de 6 + 0,15 × Magic Attack |

Slots 6–8 vazios. Recovery começa após o último efeito programado. Os multiplicadores são aplicados antes da defesa, variação e crítico; não representam dano final garantido. O caminho mágico usa Magic Defense. Cada impacto conserva as rolagens independentes do resolvedor de combate existente.

## Requisitos, targeting e apresentação

`equippedWeaponType` aceita sword, dagger, bow ou staff. A lista `weaponRequirements` é validada no comando, durante a espera e imediatamente antes do início. A habilidade incompatível permanece visível e escurecida, com feedback “Requer Espada/Adaga/Arco/Cajado”. Tooltips mostram descrição, arma, MP, cooldown e alcance. A hotbar responde a clique e teclas 1–8, respeitando pausa e modais.

No debug, trocar arma funciona em Idle, auto-attack e intenção pendente. Uma intenção incompatível é cancelada sem cobrança; a troca não elimina o tempo devido do ciclo automático. Durante execução/recovery a troca fica bloqueada. O seletor é provisório, sem inventário ou mudança de classe.

Habilidades com alvo reutilizam a navegação com seu próprio alcance e linha de visão. A orientação lógica usa a posição do alvo no mundo, mantendo a conversão existente para o sprite relativo à câmera. A referência de alvo inclui sua geração de respawn; um projétil antigo nunca atinge a nova vida do mesmo inimigo.

## Sequências, projéteis e efeitos periódicos

Multi-hit usa a mesma sequência `effects[].at` para golpes e lançamentos. Cada impacto resolve acerto, crítico e dano individualmente. Morte ou retorno do alvo encerra a sequência, sem procurar outro inimigo ou atingir cadáver.

Tiro Duplo e Bola de Energia usam Projectiles: origem, referência do alvo, velocidade, efeito, estatísticas capturadas e duração máxima de 3 segundos. Os projéteis seguem o alvo e verificam segmentos livres durante o trajeto. Expiração, obstáculo ou alvo inválido removem o projétil. As representações gráficas compartilham geometria e materiais, com descarte dos recursos.

PeriodicEffects oferece duração, intervalo, fonte, alvo, valor, contagem de ticks e renovação por chave. Regeneração não cura imediatamente: aplica seis pulsos, um por segundo, limitados pelo HP máximo. Renovar a mesma chave reinicia o efeito, sem empilhar cópias. A regeneração natural anterior continua independente. A infraestrutura aceita outros tipos periódicos, mas somente a aplicação de cura foi integrada nesta etapa; poison/burn/bleed não existem ainda.

## Fila, custos e interrupções

Existe uma única habilidade pendente, substituída pela intenção válida mais recente. O input buffer aceita o comando nos últimos 0,3 s do cooldown. A intenção expira após 12 s de simulação. Não há fila ilimitada.

O ataque automático em andamento pode concluir seu ciclo antes da execução da habilidade. Nenhum novo auto-attack começa enquanto há habilidade pendente/ativa. Depois da recuperação, o auto-attack retorna se a intenção de combate e o alvo continuarem válidos.

MP e cooldown são comprometidos uma única vez, ao iniciar uma execução válida, após alcance/linha de visão, arma, alvo, recursos e ciclo de ataque serem verificados. Comando inválido, rota impossível ou intenção expirada não cobra. Movimento/clique no chão/Esc podem cancelar conjuração ou sequência já iniciada; nesse caso não há reembolso. Alcance e LOS são revalidados para golpes/lançamentos: perder a condição depois do início pode impedir o efeito, mantendo o custo.

Projéteis já lançados continuam após cancelamento manual, até impacto ou invalidação. O HoT aplicado também continua durante movimento. Morte limpa ações, projéteis e efeitos periódicos. Pausa congela cast, cooldown, espera, projéteis e ticks; não há timers independentes nem efeitos offline.

## Persistência

Arma equipada e lista `knownAbilities` são salvas e validadas. Saves anteriores recebem espada e as cinco técnicas iniciais; dados opcionais permitem manter schema 1 e compatibilidade com as iterações anteriores. A lista conhecida prepara apresentação gradual futura, sem implementar quests ou desbloqueio temporal.

Custos seguem a consolidação existente de recursos; troca de arma pelo debug solicita salvamento. Cooldowns, fila, execução, projéteis e efeitos são temporários e reiniciam ao recarregar a página. Esta beta não oferece continuidade de combate entre sessões nem proteção contra reiniciar cooldown por recarga.

## Validação e performance

- 125 testes automatizados: 93 anteriores e 32 novos, cobrindo definições, requisitos das quatro armas, slots, MP, cooldown, fila, buffer, alcances, rotas, LOS, casts, dano mágico/defesa mágica, multi-hit independente, morte entre impactos, dois projéteis, seis ticks, expiração, pausa, morte, interrupção, troca de arma e retorno ao auto-attack.
- Simulações a 30, 60 e 144 FPS mantêm os resultados de habilidades. Orientação verificada com sete ângulos de câmera.
- Persistência cobre campos novos, habilidades conhecidas e save legado.
- No navegador: oito slots e feedback de arma incorreta; Bola de Energia com cast, custo de 14 MP, cooldown e impacto; Tiro Duplo com dois lançamentos e dois impactos; Regeneração com seis ticks e expiração. Perfil separado `?debug=1&test=1`.
- Teste integrado de 20 inimigos e uma execução mágica, seguido da simulação de combate: aproximadamente 101–131 ms para 10 segundos simulados nas execuções desta máquina, sem renderização. É uma medição de CPU da simulação, não FPS gráfico nem teste de vinte conjuradores simultâneos.
- Verificação final do perfil normal no navegador: Novato nível 1, oito slots e nenhum erro de console registrado.
- Build de produção aprovado. Permanece o aviso de bundle gráfico acima de 500 kB, já existente.

## Limitações e encerramento

Valores, ícones e projéteis são provisórios. Não há sprites finais de ataque/conjuração. A hotbar ainda não pode ser reorganizada. O alcance das habilidades é próprio; os ataques automáticos das quatro armas conservam o ataque físico curto anterior. `basicAttackOverrides` oferece um ponto de extensão para armas futuras, mas velocidade, dano e animação específicos ainda não estão conectados a um sistema completo de equipamentos.

A filosofia das 13 semanas e os futuros caminhos de evolução estão registrados em `DIRETRIZES-DE-PROGRESSAO.md`. Não foram implementados classes, missões, árvores, evolução, inventário, loot, XP de inimigos, Torre, multiplayer ou balanceamento final. A entrega encerra a Iteração 06; mudança de classe não foi iniciada.

