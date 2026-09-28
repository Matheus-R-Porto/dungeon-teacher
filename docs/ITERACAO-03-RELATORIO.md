# Iteração 03 — Fundação do personagem e sistemas de RPG

Concluída em 24/09/2026. Escopo encerrado nesta iteração.

## Integração

A implementação anterior tinha posição, orientação e movimento em Game, sem persistência de personagem. O controlador, a navegação, a interação F, o renderizador e o sistema direcional foram reutilizados sem alterações. main.js coordena o novo domínio com a simulação, a interface e o armazenamento.

- src/domain/character/balance.js: atributos, definição de Novato, constantes, coeficientes e limites provisórios.
- src/domain/character/stats.js: cálculo único dos derivados; soma de modificadores de classe, equipamentos, buffs e outros. Slots futuros vazios.
- src/domain/character/character.js: dados independentes do visual, XP, níveis, pontos, distribuição atômica, HP, MP e regeneração por delta.
- src/adapters/persistence/character-save.js: IndexedDB, versão, defaults, reconstrução, transações, cópia anterior e conflito entre abas.
- src/ui/character-panel.js: HUD, ficha C, rascunho de distribuição, prévia dos derivados, confirmação, cancelamento e ferramentas ocultas.
- src/main.js, index.html e src/style.css: integração e apresentação.
- tests/iteration03.test.js: 15 testes novos; total de 48.

## Decisões provisórias

Novato inicia no nível 1, atributos 5, HP 160 e MP 80. XP necessária começa em 100 e sobe 50 por nível; cada nível concede 5 pontos. Níveis adicionais preservam o excedente de XP e recalculam os máximos sem cura automática. Nível máximo técnico 100. A velocidade de ataque varia de 0,25 a 4 ataques/s; AGI não muda a movimentação existente.

Distribuição exige Refúgio do Limiar e ausência de estado de combate. Fechar ou cancelar abandona o rascunho. A prévia não altera o personagem. Confirmação inválida ou falha de salvamento não consome pontos. Não há respec.

Regeneração ocorre nos passos de simulação enquanto o jogo está ativo. Diálogos e perda de foco pausam a simulação; não há regeneração offline. HP zero interrompe regeneração; cura/restauração são operações genéricas, sem sistema de morte ou combate nesta etapa.

Save: fonte dos dados, HP/MP atuais, versão 0.1.0, schema 1, revisão e data. Derivados não são persistidos. Campos ausentes recebem defaults. Saves inválidos/futuros são preservados e provocam aviso. Uma revisão antiga não pode sobrescrever uma revisão mais recente. Alterações explícitas são salvas imediatamente e regeneração a cada 2 segundos; fechamento abrupto pode perder os últimos segundos de regeneração. Armazenamento pertence ao navegador e à origem local.

## Verificação

- 48 testes automatizados aprovados: os 33 anteriores e 15 novos de RPG/persistência.
- Build de produção aprovado. Permanece o aviso de pacote JavaScript acima de 500 kB, principalmente Three.js.
- Navegador: +500 XP levou de nível 1 a 4, deixando 50 XP e 15 pontos.
- Prévia de AGI alterou velocidade de ataque; Cancelar restaurou o atributo sem gasto.
- Confirmação de STR e AGI persistiu após recarga: valores 6, nível 4 e 13 pontos restantes.
- Dano e gasto de MP apareceram no painel e foram recuperados ao carregar; regeneração retomou durante exploração.
- C abriu/fechou a ficha; perfil normal permaneceu Novato nível 1, sem ferramentas de teste visíveis.
- Duas abas do perfil de teste: primeira gravação aceita; segunda rejeitada com aviso de revisão desatualizada, sem sobrescrever progresso.
- Inspeção visual da ficha no navegador em aproximadamente 900×690, com rolagem interna.

## Teste manual

Abra http://127.0.0.1:5173/?debug=1&test=1 e pressione C. Ferramentas de teste oferece XP, dano, cura, MP e pontos. Esse perfil é separado do personagem normal. Remova os parâmetros para voltar ao perfil normal.

## Limites de escopo

Não foram adicionados inimigos, combate, ataques automáticos, habilidades, outras classes, inventário, equipamentos, loot ou arte final. A Iteração 04 não foi iniciada.
