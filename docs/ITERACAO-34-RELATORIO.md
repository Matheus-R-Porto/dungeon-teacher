# Dungeon Teacher — Iteração 34

Iteração tecnicamente concluída em validação local, com o limite gráfico de quatro preparados documentado. A continuação preserva os mapas e sua numeração, os dois chefes existentes, as cinco classes, as habilidades, a identidade visual, o ADM e a persistência central. A LAN física continua pendente; os dados não representam 32 computadores reais.

## Entrega

- Backup online passa a usar uma conexão de leitura exclusiva para a cópia assíncrona. Corrigida a falha reproduzida no ADM durante a atividade do banco, com regressão de consistência sob gravações concorrentes.
- Corrigida a desconexão reproduzida na troca de mapas sob carga: snapshots descartáveis e respostas necessárias agora têm limites de fila distintos e limitados.
- Estado público preparado uma vez por mapa/envio; perfil, inventário, recompensas e épocas continuam privados. Mesmos 20 Hz de simulação e 10 Hz previstos de snapshots.
- Composição gráfica otimizada com atlas compartilhados, recortes reutilizados, buffers de limpeza e leituras de canvas adequadas; desenhos e resolução preservados. Comparação visual e tempos constam do relatório específico.
- Corrigido o bloqueio de habilidade pendente durante a recuperação do ataque básico, mantendo o tempo comprometido e impedindo novos ataques básicos enquanto ocupado.
- Lobo Branco escolar com 48.000 HP/ataque 850, mantendo suas mecânicas, recompensas e reaparecimento de 15 min. Grupos coordenados de quatro preparados tiveram chance real; grupos sem reação às áreas perderam. Solo excepcional foi medido com Mago e Ladino.
- Cavaleiro escolar com 3.000 HP/ataque 180 de base, escala estável por participação efetiva e suporte, respeito à Provocação e preservação da composição original para recompensas. Campanha solo mantém os valores anteriores 1.500/24.
- Lápide usa posição exata da morte, data/hora autoritativa e nome de quem deu o golpe final, com dados persistidos e compartilhados. Reinício não reinicia a espera; reaparecimento seguro remove a lápide sem duplicar recompensas.

## Evidências

O cenário comparável de 32 clientes mostrou redução de aproximadamente 17,4% no tempo médio de montagem/envio por tick durante combate. A referência desconectou clientes; a rodada corrigida completou todas as faixas de 4/8/16/24/32 e reconexão. Não se compara a CPU da rodada incompleta com a completa como ganho de desempenho.

Foram executadas as matrizes de combate antes/depois, três composições de seis, diferentes tamanhos, perfis e sementes; carga final, extensão sustentada, atraso artificial e três processos Electron preparados e a regressão de quatro clientes básicos. FPS/CPU/RAM medidos têm escopo explícito nos relatórios. Há diferença entre resultado do robô, renderização real e LAN física.

## Testes aprovados

- Suíte completa: 894/894, sem falhas, cobrindo campanha, classes, progressão, inventário, combate, persistência, protocolo, segurança, ADM e cliente.
- Suíte focal: 16/16 regressões desta iteração, todas incluídas nos 894 testes completos; não são contadas em dobro.
- Compilação Vite aprovada. Permanece o aviso anterior de bundle maior que 500 kB.
- Testes Electron do jogo e regressão do ADM aprovados, incluindo TLS, sessões, A→B→A, desconexão administrativa, backup, reinício e persistência.
- Nenhum instalador publicado, nenhum endereço de produção alterado e nenhum arquivo de referência em `sources/` editado.

## Relatórios e dados

- [Auditoria inicial](ITERACAO-34-AUDITORIA.md)
- [Metodologia e limites das medições](ITERACAO-34-METODOLOGIA.md)
- [Carga, gargalos e antes/depois](ITERACAO-34-DESEMPENHO.md)
- [Matriz de balanceamento e simulações](ITERACAO-34-BALANCEAMENTO.md)
- [Dano, recursos e habilidades por personagem/semente](ITERACAO-34-COMBATES.md)
- [Morte, lápide, persistência e reaparecimento](ITERACAO-34-LAPIDE.md)
- [Otimização gráfica e equivalência visual](ITERACAO-34-GRAFICOS.md)
- [Electron e verificações do ADM](ITERACAO-34-ELECTRON.md)
- [Galeria de capturas](ITERACAO-34-CAPTURAS.html)
- [Arquivos alterados e hashes](ITERACAO-34-ARQUIVOS.json)
- [Roteiro LAN física pendente](ITERACAO-34-TESTE-LAN.md)
- [Resultados brutos do combate](dados/iteracao34/iteration34-combat-final.json), [carga final 32](dados/iteracao34/final/32.json), [carga sustentada](dados/iteracao34/sustained/32.json), [atraso artificial](dados/iteracao34/latency/32.json), [testes completos](dados/iteracao34/iteration34-tests-final.txt), [testes focais](dados/iteracao34/iteration34-focused-final.txt) e [compilação](dados/iteracao34/iteration34-build.txt).

## Reprodução

Na raiz do projeto, `npm run build` e `npm test`. Ensaios: `node scripts/iteration34/load.mjs nome`, `node scripts/iteration34/combat.mjs nome`, `node scripts/iteration34/electron.mjs` e `node scripts/iteration33-electron.mjs`. Para repetir a medição gráfica aprovada, defina `DT_CLIENTS` como `3`; o padrão `4` reproduz a tentativa que atingiu o limite local. `node scripts/iteration34/visual-run.mjs` reproduz a comparação isolada usando a referência de código arquivada. Use perfis de teste. As variáveis `LOAD_COUNTS`, `LOAD_LATENCY` e `LOAD_SUSTAIN` selecionam quantidades, atraso por direção e segundos de extensão; a execução sustentada usou 32/300 e a de atraso 32/80. Não rode ensaios de desempenho junto com compilação, suíte de testes ou simulações pesadas. Os scripts criam diretórios temporários; nenhum banco real é usado.

## Limitações remanescentes

Quatro clientes preparados simultâneos excederam o prazo gráfico local; o ensaio aprovado de desempenho usa três, e a regressão básica usa quatro. Não há validação presencial da rede escolar, 32 clientes gráficos simultâneos, teste de um turno inteiro ou garantia de taxas de vitória humanas. A carga mede protocolo e JSON; o Electron mede três contextos preparados no mesmo hardware. Os robôs reagem ao estado do servidor e têm estratégias limitadas. As sementes e os tempos registrados devem ser usados como evidência específica, não como taxa universal. As primeiras explorações com habilidades bloqueadas e medição parcial de MP estão preservadas para auditoria e identificadas na metodologia; a configuração final usa os ensaios corrigidos.

Os instaladores existentes da 33 permanecem daquela versão. Esta entrega está aplicada ao código e à compilação local; distribuir a 34 exige empacotamento posterior e o roteiro físico complementar.
