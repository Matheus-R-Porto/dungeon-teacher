# Iteração 34 — roteiro complementar de LAN física

Status: pendente. Os ensaios desta iteração usam um único computador. Clientes de protocolo, três processos Electron preparados, quatro básicos e atraso artificial não representam 32 computadores na escola.

## Preparação

1. Registrar CPU, RAM, Windows, GPU e resolução do servidor e dos alunos; tipo de conexão (cabo/Wi-Fi), equipamento de rede e distância do ponto de acesso. Reservar um banco de teste e uma temporada própria.
2. Iniciar o ADM e conferir endereço, porta, identidade TLS e backup. Confiar na identidade exibida pelo servidor correto nos clientes. Usar contas individuais. O ADM não ocupa vaga.
3. Distribuir personagens pelas cinco classes com os perfis registrados no relatório de balanceamento. Manter as configurações gráficas e registrar qualquer alteração feita durante o ensaio.

## Rodadas

Executar 4, 8, 16, 24 e 32 computadores, com cinco minutos de aquecimento e pelo menos vinte minutos de atividade em cada faixa disponível. Se só houver oito máquinas, registrar oito; não extrapolar como validação de 32.

Alternar cidade, deslocamentos juntos, andares distribuídos, combates de monstros, itens e trocas de mapa. Formar grupos de quatro/seis para o Lobo e grupos de um/dois/quatro/seis para o Cavaleiro. Incluir cura, proteção, Provocação, ataques em área e personagens derrotados. Encerrar com cinco minutos na cidade para observar recuperação de filas, memória e atraso.

Registrar por segundo CPU/RAM do servidor, tempo de simulação, tempo de envio, atrasos, mensagens, operações de persistência, jogadores conectados e erros. Registrar FPS, tempo de quadro, memória e hardware dos clientes representativos, incluindo o mais fraco. Medir RTT/perda/jitter da rede separadamente; o atraso comando→snapshot também inclui o processamento do jogo.

## Verificações funcionais

- Desconectar/reconectar alunos, inclusive durante a arena; conferir identidade, inventário e progresso central.
- Trocar um aluno entre computadores A→B→A após logout; rejeitar login simultâneo indevido.
- Usar desconexão pelo ADM, backup e encerramento normal; reiniciar com o mesmo banco e conferir o estado.
- Derrotar o Lobo com um finalizador diferente de quem causou mais dano. Conferir nome, data/hora e posição da lápide em várias máquinas. Reiniciar durante a espera, conferir o mesmo prazo e observar um único reaparecimento após 15 minutos e liberação da área segura.
- Conferir o Cavaleiro com observador inativo, suporte efetivo, morte, desconexão e reconexão. Dificuldade acumulada não deve cair ou duplicar. Recompensas seguem a composição original da instância.

## Registro e aprovação

Anexar logs, capturas, quantidade real de máquinas, versão dos arquivos/instaladores e qualquer ocorrência. Comparar o relógio do servidor com os clientes. Antes de uso em aula, investigar desconexões involuntárias, perda de progresso ou filas que não se recuperam. Quedas de FPS de uma máquina devem ser distinguidas de atraso comum a todos.

Não publicar instaladores nem trocar automaticamente o endereço de servidor durante este roteiro. Usar os quatro artefatos identificados como Iteracao34 na [distribuição de 28/10/2026](ITERACAO-34-DISTRIBUICAO.md) e registrar seus hashes. A Iteração 33 permanece preservada como histórico.
