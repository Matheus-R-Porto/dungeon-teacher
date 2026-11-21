# Dungeon Teacher — Iteração 32 — auditoria e plano de integração

28/10/2026. Estado: implementação em andamento; não é relatório de conclusão.

Base preservada: iterações 30 e 31, inventário, mapas e numeração, seis corpos modulares, identidade individual, servidor WebSocket e SQLite, Job por origem, oito atalhos e AbilityRuntime. As fontes sincronizadas em sources/ permanecem somente leitura.

O novo prompt substitui os requisitos da primeira promoção: Base 10 e Job de Novato 20, sem exigir andar 12 ou missão ainda indefinida. A escolha passa a ser permanente. O marco futuro de segunda promoção permanece 36; nenhum mapa é renumerado.

Ainda faltavam 80 definições de classe, dependências concretas, mira manual, estados e áreas, ameaça, barreira, munição e armas secundárias. Integração planejada no runtime e nas validações existentes, sem reconstrução do jogo.

Balanceamento provisório: 12 habilidades principais com cinco níveis, três híbridas com três e uma final com um. Pontos disponíveis por primeira classe: 49. Cadeias principais exigem nível 2 da anterior; híbridas exigem seis pontos em cada caminho e duas habilidades de segundo estágio no nível 2; final exige oito pontos em cada caminho e as três híbridas no nível 1. Job exigido por estágio: 1/5/10/15/20/30, mais dois por nível adicional. Valores e matrizes serão exportados do mesmo catálogo utilizado pelo jogo.

Validação prevista: requisitos de promoção, persistência, revisão/recibos, todas as matrizes e níveis, mecânicas específicas, efeitos multiplayer, compilação e capturas reais. Os testes da iteração 31 são referência histórica, não comprovam esta etapa.

## Encerramento da auditoria

Implementação concluída em 28/10/2026. O texto acima registra o levantamento inicial. Resultados e limitações finais no [relatório da iteração 32](ITERACAO-32-RELATORIO.md).
