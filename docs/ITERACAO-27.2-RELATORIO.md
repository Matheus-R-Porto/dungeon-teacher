# Iteração 27.2 — Etapa A concluída antes da Etapa B

Validação em 24/10/2026. Código de diálogo, Safety, hotbar, responsividade, animação e seis arquivos originais inspecionados.

Retratos desktop passaram de 46vh (limitados a 480px) para 55vh. Proporção natural e separação de 22px da caixa preservadas. Regras de 42vh e 23vh para telas menores preservadas. Espelhamento é propriedade individual de apresentação, composta com a animação original de 210ms; nenhum PNG foi alterado.

| NPC | Decisão visual |
| --- | --- |
| Serafina | Frontal preservada; asas, halo e mãos simétricos mantidos. |
| Marta | Espelhada: rosto e ombros favorecem a esquerda; livro sem inscrições e chaves continuam íntegros. |
| Brasa | Espelhado: rosto favorece o centro; martelo e ferramentas sem inscrições preservados. |
| Lina | Espelhada: rosto e ombros voltados ao centro; tigela e colher preservadas. |
| Orin | Mantido: rosto já favorece a esquerda; lua, estrela e frascos permanecem originais. |
| Caio | Espelhado: rosto e ombros favorecem o centro; bússola sem letras e pergaminho fechado preservados. |

27 testes direcionados aprovados (26 existentes + 1 orientação), zero falhas/skips. Build aprovado, aviso preexistente de chunk acima de 500KB. Electron real aprovado em dois perfis temporários: seis interações online, interação offline, navegação, texto, alternativas de teste, Safety em transição/impacto/blur, hotbar bloqueada e restaurada, recursos ausentes, 30 ciclos com DOM estável, 1280×720, 800×600 e 480×720, movimento reduzido. Altura de 55vh e ausência de sobreposição verificadas por geometria. Capturas dos seis NPCs e tela pequena inspecionadas visualmente: corpo completo, pés e acessórios sem cortes.

Evidências: `.logs/iteration242-dialogue272-1792815158517/report.json`, capturas `online-*.png` e `dialogue-*.png` no mesmo diretório. Testes: `.logs/iteration272-targeted.txt`; teste adicional `tests/iteration272.test.js`.

Arquivos: `src/ui/npc-portraits.js`, `src/ui/npc-dialog.js`, `src/ui/npc-dialog.css`; roteiro `scripts/iteration272-{electron,scenario}.mjs` e teste adicional. Caixa, paleta, botões, narrativa e autoridade multiplayer preservados. Nenhuma alteração de save real. Aprovação estética humana ainda necessária. Nenhuma alegação de ganho de desempenho nesta etapa.
