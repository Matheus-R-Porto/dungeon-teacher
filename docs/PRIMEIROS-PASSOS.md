# Ajuste — Primeiros passos e personagem desarmado

O perfil atual pode ser reiniciado pelo debug da ficha C. A operação grava um personagem novo no mesmo perfil, preservando a cópia anterior já mantida pelo sistema de save, e recarrega a sessão para limpar ações, cooldowns e estado da área. Perfis de teste são independentes.

Sem item no slot de arma, o jogador não inicia auto-attack nem aplica seu impacto. A validação ocorre na seleção e novamente no ciclo de combate. Técnicas ofensivas usam o tipo do item efetivamente equipado; uma string antiga ou uma arma apenas na mochila não satisfaz o requisito. Regeneração mantém sua regra de suporte sem arma, desde que aprendida.

O Portal do Hub só permite entrar na Torre com arma equipada. O prompt informa o bloqueio e F explica que é necessário equipar em I. O retorno ao Hub continua independente desse requisito.

O antigo guia de exploração foi substituído por sete etapas: conversar com o Armeiro, obter arma, equipar, aprender uma técnica, entrar na Torre, derrotar cada Slime e retornar ao lobby/Refúgio. O painel permanece visível na sala, mostra o contador de derrotas e orienta o portal de retorno ao concluir. Morrer antes de concluir oferece uma nova tentativa. Marcos cumpridos persistem; contagem parcial de inimigos pertence à visita. Recarregar após vencer e reaparecer no Hub conclui o marco de retorno.

Implementação: `src/domain/first-steps.js`, composição em AreaSession/main, apresentação em Hud/index/CSS, persistência aditiva e comando de reinício em CharacterPanel. Novos testes em `tests/first-steps.test.js`. Fixtures de combate antigas agora equipam itens reais, neutralizando seus bônus para preservar as fórmulas sob teste.

Verificação: **164 testes aprovados**, build de produção concluído. A suíte cobre portal sem arma, arma somente possuída, string de arma inconsistente, ataque desarmado, remoção antes do impacto, sequência completa da missão, morte, save/load e reset. O aviso anterior de bundle acima de 500 kB permanece.
