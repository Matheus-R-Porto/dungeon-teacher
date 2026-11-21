# Iteração 34 — metodologia e interpretação

## Sequência da investigação

1. Leitura dos relatórios 32/33, prompt, código e testes; matriz de auditoria registrada antes de editar os sistemas.
2. Carga original nas cinco faixas, reprodução adicional de 32 e primeira matriz de combate.
3. Correção das filas e montagem compartilhada do estado público; repetição da mesma matriz de carga **antes** de alterar os chefes e de corrigir o bloqueio das habilidades.
4. Aperfeiçoamento dos personagens de teste para incluir Provocação válida e parada após esquiva. A referência `baseline-cooperative` repete os encontros originais com esses mesmos perfis.
5. Simulações revelaram habilidades presas em “Preparando”: a recuperação do ataque básico não avançava enquanto havia habilidade pendente. Correção no servidor, preservando a recuperação e impedindo novos ataques básicos durante a execução. Os candidatos anteriores a essa correção não orientaram a configuração final.
6. Participação efetiva do Cavaleiro, lápide persistente, candidatos de balanceamento e matriz final. Ensaios finais de carga e Electron separados dos testes de lógica e das simulações intensivas.

## Clientes de protocolo

`scripts/iteration34/load.mjs` inicia um processo Node exclusivo de servidor para cada quantidade. Os clientes são WebSockets reais sobre TLS, com contas e sessões distintas, protocolo autoritativo, sequência de comandos e reconexão. O preparo cria contas/sessões no banco de teste: **não mede o custo de login por senha nem uma tempestade de scrypt**. Cadastro/login reais são exercitados nos testes e no Electron.

Fases padrão: aquecimento 5 s; cidade 8 s; movimento 10 s; distribuição por três andares 10 s; combate 20 s; Lobo 15 s; inventário 8 s; recuperação 8 s. As chegadas aos mapas usam fixtures no servidor; movimento, habilidades, dano, itens e persistência usam o código real. Os robôs decidem a cada 250 ms. A rodada final inclui também retirada/recolocação de proteção da cabeça durante inventário; a comparação isolada de otimização usa somente as rodadas anteriores com a mesma carga. Não há renderização ou GPU nesses clientes.

Na extensão sustentada, há nova chegada a um dos três andares a cada 30 s, mantendo monstros, combate e trocas de mapa em atividade; ao fim, 30 s adicionais de recuperação. O relógio de carga é de parede, com a simulação normal de 20 Hz e envio previsto de 10 Hz. O envio pode descartar snapshots substituíveis sob pressão, conforme já previsto no protocolo.

## Medidas

- CPU: tempo de CPU do processo servidor dividido pelo tempo de parede. 100% equivale a um núcleo lógico; threads de compressão podem levar a valores maiores. O gerador está em outro processo, no mesmo computador.
- Memória: RSS e heap usados, amostrados a cada segundo. RSS inclui reservas do runtime; um crescimento isolado não prova vazamento. Comparar início aquecido, pico, trecho sustentado e recuperação, sem extrapolar horas de estabilidade.
- Tick: média, p95 e máximo por janela de um segundo; simulação e montagem/envio separados. A tabela global usa a distribuição de médias/p95 das janelas e a identifica explicitamente, evitando tratar percentil de percentis como percentil de todos os ticks.
- Filas: bytes pendentes nos WebSockets e atraso do event loop (proxy de bloqueio; não é uma contagem interna de tarefas da fila).
- Rede: quantidade de mensagens e bytes de JSON antes de compressão, não tráfego Ethernet/TLS na placa. Intervalo de snapshots recebidos e latência de comando até snapshot que confirma a sequência. Esta latência inclui espera pelo tick e pelo envio, e não é RTT puro.
- Persistência: duração e quantidade de chamadas reais de gravação; a transação SQLite e serialização de personagem continuam ativas. Não é um benchmark independente do disco.
- Entidades: jogadores presentes mais inimigos vivos nos mapas carregados; essa contagem não equivale a entidades visíveis ou em combate.

## Combate

`scripts/iteration34/combat.mjs` executa o OnlineTower real, arenas, IA, colisão, habilidades, cooldown, MP, ameaça, cura, buffs, projéteis, morte, recompensas e SQLite em passos de 50 ms. Decisões a cada 200 ms, com as sementes 11, 29 e 47. A velocidade de execução do teste não altera os segundos simulados.

Os perfis ganham XP pelas regras existentes, promovem em Serafina e distribuem somente os pontos ganhos. Job 25 da primeira classe resulta em Base 38 nesta trajetória de XP; não foi imposto um Base 20 incompatível com ela. O perfil inicial usado é Base 24/Job 5, intermediário Base 30/Job 15, preparado Base 38/Job 25 e excepcional Base 71/Job 50. As fichas completas ficam nos dados brutos. Não representam a única progressão possível.

Os equipamentos existem no catálogo. Espada/escudo, arco/flechas, adagas e cajados são usados conforme classe. Perfis equipados têm peças de viajante, anel, proteção de conjuração quando cabível e ensopado antes do combate. Não se inventam poções: a regra atual impede comer em combate. Há 500 flechas iniciais válidas para o arqueiro. Regeneração e efeitos naturais permanecem ativos; não há cura artificial durante as simulações.

Composições de seis: equilibrada (Guerreiro, Sacerdote, Mago, Arqueiro, Ladino, Guerreiro); ofensiva sem curandeiro (Guerreiro, Mago, Mago, Arqueiro, Ladino, Arqueiro); alternativa (Sacerdote, Sacerdote, Ladino, Arqueiro, Mago, Ladino). Tamanhos menores usam o início da composição equilibrada. O cenário sem coordenação mantém as habilidades mas desativa a reação de esquiva; não representa todos os possíveis erros humanos.

As métricas distinguem dano total de dano ao chefe, cura efetiva, dano recebido, mortes, MP gasto, flechas, habilidades e contatos de área. “timeout” significa que o limite do teste terminou sem vitória, não uma derrota decretada pelo jogo. O Lobo pode resetar ao perder todos os alvos; por isso o HP final de uma derrota pode ser máximo. Mortos deixam de receber comandos do robô, embora o reaparecimento normal do jogo continue existindo.

Regressões mecânicas pontuais usam alvos com HP de fixture para isolar colisão, múltiplos impactos ou elegibilidade de recompensas sem encerramento precoce. Esses alvos não são os personagens da matriz de balanceamento, que usa somente os perfis de progressão registrados.

Limitações dos robôs: conhecem o estado autoritativo e reagem com regularidade, não têm a percepção visual ou a latência humana; prioridades e posicionamento são simples. Três sementes são evidência de comportamento, não uma estimativa estatística da taxa de vitória de jogadores. A instrumentação inicial de MP perdia atribuição quando uma recompensa substituía o objeto Character; a versão final mede no método da classe. Comparações de MP devem usar somente os dados finais/corrigidos.

## Electron e LAN

As medições Electron aprovadas usam três processos com personagens preparados e perfis separados no mesmo computador, com a interface real, TLS e login. Quatro preparados excederam o prazo de preparação gráfica local; as falhas são preservadas. A regressão do ADM usa quatro personagens básicos, um cenário diferente. Diagnóstico já existente mede quadros, renderização, atualização remota, efeitos, processamento de snapshots, memória JavaScript e disponibilidade de temporização GPU. A ocupação do renderer por CDP é duração das tarefas, não toda a CPU do computador. A razão usa os timestamps próprios de cada consulta; as rodadas iniciais usavam uma janela comum e podiam superestimar o percentual por causa do tempo de leitura entre clientes. O relatório final usa a rodada com essa instrumentação corrigida. Vários contextos disputam a mesma GPU física. A captura de lápide usa uma morte de teste autoritativa, identificada como fixture. Na rodada final, os clientes entram em local seguro, e só então os personagens são posicionados no encontro e recebem comandos reais do mesmo controlador de decisão das simulações. Assim, não morrem enquanto os outros ainda preparam o mapa. O trecho inclui movimentação, habilidades, mortes ou retorno que efetivamente ocorrerem; não é uma promessa de atividade uniforme em cada quadro.

O ensaio isolado do compositor compara a implementação original, uma referência com rasterização em CPU e a implementação final. A referência em CPU permite verificar igualdade exata dos pixels sem confundir diferenças de rasterização GPU/CPU com alterações no algoritmo. Os quatro personagens e duas paletas cobrem também a reutilização de recortes sem contaminação entre aparências.

O teste de atraso adiciona atraso artificial nas mensagens da aplicação, sem simular perda, jitter, interferência de rádio ou limite real de banda. A validação LAN física permanece pendente, conforme roteiro complementar.


## Backup durante atividade

A regressão gráfica do ADM reproduziu `Error: not an error` na cópia assíncrona SQLite enquanto o servidor estava ativo. A implementação reutilizava o handle do jogo. A correção mantém a API de backup e abre uma conexão de leitura dedicada ao mesmo arquivo e mantém uma transação de leitura durante a cópia, incluindo os dados confirmados no WAL; fecha essa conexão inclusive em caso de erro. Não há cópia ingênua do arquivo principal nem interrupção da simulação. A transação fixa a fotografia de leitura para evitar que novas gravações reiniciem continuamente a cópia incremental; essa condição também foi reproduzida no ensaio intensivo antes de fixar a leitura. A ligação causal específica dentro do runtime é uma hipótese compatível com a reprodução; a evidência direta é a falha anterior e a validação posterior.

O teste específico cria três backups com atualizações concorrentes, confere integridade, todos os registros e uma única geração por cópia, e verifica que a conexão do jogo permanece utilizável. A regressão Electron repete o fluxo completo de backup/reinício. A documentação da [API de backup do Node](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html#sqlitebackupsourceDb-path-options) e da [API SQLite](https://sqlite.org/c3ref/backup_finish.html) explica a cópia consistente e o comportamento sob acesso concorrente; os resultados do projeto vêm dos ensaios registrados.
