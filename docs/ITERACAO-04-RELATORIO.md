# Iteração 04 — Fundação do combate

Concluída em 24/09/2026. Iteração 05 não iniciada. HUD compacto preservado no canto superior esquerdo; painel C preservado.

## Arquivos criados

- `src/domain/combat/config.js`: parâmetros de alcance, fases, acerto, dano, morte, estados e definição do Slime de Treino.
- `src/domain/combat/attack.js`: resolução compartilhada e ciclo temporal de ataque.
- `src/domain/combat/enemy.js`: dados, recursos e ciclo de vida do inimigo, independentes do visual.
- `src/simulation/combat.js`: coordenação de intenção, alvo, aproximação, estados, ataques e retorno provisório.
- `src/adapters/rendering/combat-visual.js`: placeholder geométrico, seleção pelo raio da câmera, círculo de alvo, preparação e reação ao impacto.
- `src/ui/combat-hud.js`: painel do alvo, números flutuantes, MISS, crítico, morte e depuração oculta.
- `tests/iteration04.test.js`: 15 testes novos de combate, incluindo seleção por projeção real do Three.js.
- `docs/ITERACAO-04-PROMPT.md` e este relatório.

## Arquivos modificados

- `src/main.js`: integração da simulação, intenção do clique, interação, cancelamento, bloqueio de atributos e recursos persistentes.
- `src/adapters/rendering/scene.js`: atualização do adaptador visual de combate antes da renderização.
- `src/style.css`: painel do alvo, números e depuração de combate.
- `index.html`: identificação da iteração e ajuda dos controles.
- `README.md`: instruções e limites atuais.

## Arquitetura e regras

O domínio de combate não depende do DOM nem do renderizador. A navegação A* existente procura uma posição caminhável no anel de alcance, com linha livre até o alvo. Os ataques verificam novamente alcance e linha livre no impacto. O inimigo permanece parado; sua reação se limita ao ataque básico dentro do alcance. Não existem aggro, perseguição ou leash.

Estados do jogador: idle, moving, chasing, attacking, interacting e dead. Interacting representa a ação que abre o diálogo; a pausa congela a simulação e o retorno ao jogo resolve idle/moving. Estados do inimigo: idle, attacking, dead e removed. Fases de ataque: idle, windup e recovery, com impacto único na passagem entre preparação e recuperação.

O intervalo real é 1 / Attack Speed. A preparação ocupa 25% do intervalo e a recuperação 75%. O ciclo consome delta e preserva frações entre atualizações. Cancelar durante a preparação elimina o impacto pendente, mantendo a dívida de tempo restante: clicar repetidamente não acelera os ataques. Os dois lados usam o mesmo resolvedor e ciclo. Acertos não aplicam stagger, stun ou knockback.

O alcance curto do jogador é 1,45 unidades; aproximação procura ficar um pouco dentro dele. O World Facing é atualizado com a direção do alvo e o renderizador direcional existente continua responsável pelo Visual Facing.

## Fórmulas provisórias

- Acerto: clamp((Accuracy do atacante − Evasion do defensor) / 100, 0,05, 0,95).
- Base física: max(1, Physical Attack − Physical Defense).
- Variação uniforme de dano: 0,92 a 1,08.
- Crítico: sorteio separado após acerto, com probabilidade Critical Chance / 100; multiplicador 1,5.
- Dano final: max(1, arredondar(base física × variação × multiplicador de crítico)). MISS causa 0.
- HP é limitado a zero ao receber dano. Não há recompensa de XP ou loot.

STR aumenta dano; AGI reduz intervalo; DEX melhora acerto; LUK aumenta frequência de crítico; VIT melhora defesa e HP. INT mantém seus derivados existentes sem influência artificial no ataque físico. Os números continuam provisórios e centralizados.

## Cancelamento

- WASD ou clique no chão: cancela ataque e aproximação; mantém o alvo selecionado. Novo clique no inimigo retoma a intenção de ataque.
- Esc durante chasing/attacking: cancela a intenção, mantendo seleção.
- Selecionar outro alvo: elimina o impacto pendente do alvo anterior e inicia a nova intenção, respeitando a recuperação.
- Interação F bem-sucedida: cancela a intenção e abre o diálogo existente.
- Alvo morto/removido/inexistente: limpa seleção e encerra ataque.
- Jogador morto: cancela movimento e combate, limpa alvo; após 3 segundos ativos retorna ao spawn com HP/MP completos.
- Alvo fora do alcance ou atrás de obstáculo: não recebe impacto; a intenção automática tenta aproximação válida. Rota impossível encerra a intenção com feedback.
- Pausa, ajuda, painel C ou perda de foco: congelam os ciclos; retomam ao voltar. Distribuição de atributos permanece bloqueada durante combate.

## Save e limites

O formato de save continua o da Iteração 03. HP/MP alterados em combate entram no salvamento existente; dano e regeneração são consolidados em até 2 segundos e na perda de foco. Fechamento abrupto pode perder esse pequeno intervalo. A morte não penaliza atributos, nível ou XP. O teste usa ?debug=1&test=1 para preservar o perfil normal.

O Slime, sua posição, HP e ciclos são transitórios. Após a derrota, seu visual desaparece em 1,5 segundo. Recarregar recria o treino; não existe respawn automático de inimigo. O inimigo não tem colisão dinâmica contra o jogador: a aproximação automática para no alcance, mas movimento manual pode atravessar seu volume. Arte, efeitos e valores são provisórios. O aviso já existente de pacote acima de 500 kB permanece no build.

## Testes realizados

63 testes automatizados aprovados: 48 regressões anteriores + 15 testes desta iteração. Build de produção aprovado.

Cobertura nova: aproximação e alcance; preparação/impacto/recuperação; velocidades 0,25, 1,075 e 4 ataques/s em 30/60/144 FPS; cancelamento sem dano pendente nem exploração de cooldown; acerto mínimo/máximo, dano mínimo, variação, crítico e MISS; influência dos atributos; WASD e chão; alvo removido ou fora do alcance; morte do inimigo sem XP; modo passivo e revide; morte e retorno do jogador; pausa; F e bloqueio de distribuição; ausência de stun-lock; troca de alvo.

Orientação, dano e seleção real por raycast foram testados em 0°, 45°, 90°, 137°, 180°, 243° e 318°.

No navegador: clique no Slime iniciou aproximação; distância observada 1,36 para alcance 1,45; ataques reduziram HP do inimigo de 120 a 2 e então o derrotaram; revide reduziu HP do personagem; C bloqueou distribuição durante combate; morte limpou o alvo. Teste de HP zero exibiu aviso e retornou ao Hub com 184/184 HP e 89/89 MP no perfil de teste. Console sem erros observados.
