# Dungeon Teacher — Iteração 36

Relatório de continuidade do estado pós-Iteração 35. Data: 29/10/2026. Distribuição Windows x64, versão interna 0.6.9, identificada por `Iteracao36` nos arquivos. Este documento separa execução automatizada, inspeção visual, Electron local e validação presencial.

## Continuidade e escopo

A auditoria inicial foi registrada antes da implementação em [ITERACAO-36-AUDITORIA-INICIAL.md](ITERACAO-36-AUDITORIA-INICIAL.md). Não foi encontrado relatório específico da 35; seu código e seus quatro testes foram tratados como referência. Uma cópia de 461 arquivos anteriores, acompanhada de hashes, foi guardada no espaço de trabalho. A suíte inicial tinha **898 testes aprovados**, incluindo as correções da 35; os 894 testes citados no prompt pertenciam ao empacotamento anterior.

Foram preservados os mapas, sua numeração, as classes, as armas, os 80 registros de habilidades e 350 níveis, as promoções, os valores de combate da 34, o protocolo escolar e os artefatos das iterações 33 e 34. Nenhum arquivo de `sources/` foi editado. Os ensaios usaram diretórios temporários; nenhum dado oficial de aluno foi alterado. Não houve publicação.

## Paridade jogável

A mineração e a forja eram lacunas reais do modo online. Agora usam as regras de domínio existentes com relógio, validações e persistência no servidor. A interface reaproveita o vocabulário e os componentes do jogo. O cliente não escolhe qualidade, recompensa, custo ou experiência.

A mineração valida picareta, inventário, superfície, distância, caminho livre, combate e atividade concorrente. O resultado é calculado pela posição do indicador no relógio do servidor. O esgotamento é salvo por personagem e por veio: reconectar não permite minerar novamente o mesmo veio. Os mapas persistentes antigos continham somente interações de viagem; suas interações de mineração são recompostas em memória, sem regenerar a geografia nem mudar seu formato salvo. Esse acesso foi protegido por um teste da mesma seleção usada pela tecla F.

A forja preserva receitas, materiais, três marteladas, qualidade, experiência e maestria. O início comprometido bloqueia ações incompatíveis; fechar a interface ou desconectar não fornece uma nova tentativa gratuita. Recibos impedem compras e resultados duplicados. Salvar uma fabricação que falha não altera parcialmente o inventário. Uma tentativa ainda incompleta não sobrevive à queda do processo do servidor; como os materiais só são debitados ao concluir, esse caso não perde itens.

Brasa conserva armas iniciais gratuitas e a loja da 35. O menu também expõe os suprimentos pagos que já existiam: adagas duplas (30), escudo (25), flechas (1 cada, lote de 20) e talismã (45). Lina conserva pesca, cozinha, ingredientes e venda. O inventário continua acessível por I e pelo menu; atributos, equipamentos e a árvore de habilidades permanecem autoritativos. A ajuda inicial e os textos dos serviços foram atualizados.

## Sprites, animações e personalização

| Classe | Identidade preservada | Corpos | Cabelos | Direções de arte | Sequência verificada |
|---|---|---|---|---|---|
| Novato | Roupa-base novice | Masculino/feminino | Antigos + novos | Frente, esquerda, costas, direita | Repouso, marcha, quatro ataques, conjuração, dano, morte |
| Guerreiro | Roupa-base warrior | Masculino/feminino | Antigos + novos | Quatro | Mesma matriz |
| Arqueiro | Roupa-base archer | Masculino/feminino | Antigos + novos | Quatro | Mesma matriz |
| Ladino | Roupa-base rogue | Masculino/feminino | Antigos + novos | Quatro | Mesma matriz |
| Sacerdote | Roupa-base priest | Masculino/feminino | Antigos + novos | Quatro | Mesma matriz |
| Mago | Roupa-base mage | Masculino/feminino | Antigos + novos | Quatro | Mesma matriz |

As diagonais continuam quantizadas para as quatro direções gráficas existentes. Não foi inventado um estado separado de corrida. A cabeça passa de uma caixa efetiva de 112 × 100 para 90 × 80, com novos encaixes. O tipo feminino usa uma silhueta mais estreita no tronco; não limita cabelo, arma ou equipamento. O campo `bodyType` é aditivo: perfis antigos sem ele continuam válidos e usam a base anterior.

O compositor produz um atlas de 24 colunas × 4 linhas, em células de 128 pixels. Reaproveita as artes das seis classes, as roupas, os equipamentos e as cabeças; aplica poses de braços, tronco e pernas com sobreposição nas articulações. A mão e a arma usam a mesma referência de pose, com profundidade por direção. Escudo e segunda lâmina acompanham o braço correspondente. A morte transforma o corpo inteiro e recolhe as armas. O atlas permanece com 1.572.864 pixels, aproximadamente 6 MiB RGBA, igual ao anterior de 1536 × 1024; o cache de composições foi limitado a oito entradas.

Na preparação do mapa, um corpo modular já pronto dispensa o envio antecipado de atlas antigos de armas que não serão exibidos. Os recursos antigos permanecem disponíveis para ofícios e fallback. Essa correção nasceu do ensaio com três clientes gráficos simultâneos. Ela reduziu trabalho duplicado, mas o terceiro processo ainda ultrapassou o limite durante a preparação dos shaders na GPU integrada compartilhada. O limite total passou de 15 para 30 segundos, mantendo cancelamento, descarte seguro e mensagem de falha. Isso amplia a tolerância ao carregamento sob disputa de GPU; não representa redução garantida do tempo de entrada. Um teste específico verifica tanto a dispensa dos uploads quanto a preservação do caminho de ofício.

| Família existente | Preparação | Impacto/liberação | Recuperação | Fonte de decisão |
|---|---|---|---|---|
| Espada | Braço armado e inclinação | Golpe corporal e encaixe da lâmina | Recolhimento | Fase do ataque confirmado |
| Arco | Braços em posição de puxada | Liberação e mudança de tronco | Retorno dos braços | Mesmo ciclo e projétil existente |
| Cajado | Preparação com braços/tronco | Movimento do cajado e efeito existente | Retorno à guarda | Ataque ou conjuração real |
| Lâminas curtas | Preparação compacta | Golpe rápido com braço/tronco | Recolhimento | Família do item equipado |

As 17 armas auditadas continuam nos dados; a família vem da definição do item, não de uma inferência pelo nome. Nenhum novo ataque, dano, cooldown ou consumo foi criado para acomodar a apresentação.

Os cabelos curto, ondulado e preso foram mantidos. Foram acrescentados médio reto, longo, trança, volumoso cacheado, coque e crista. São seis silhuetas, não recolorações. Todos funcionam nos dois corpos e nas seis classes. As três expressões anteriores continuam disponíveis nos três cabelos antigos; os seis novos modelos usam face neutra. A escolha de expressão continua salva, mas não altera esses seis rostos novos.

### Recursos gráficos

O atlas novo `public/assets/characters-v36/heads-extra.png` foi produzido por ImageGen a partir do atlas antigo como referência de estilo, e organizado pelo empacotador de sprites já existente. O original gerado, a referência organizada, quatro linhas de inspeção e os metadados estão na mesma pasta. O prompt e a procedência completa acompanham o inventário de arquivos. As artes originais de classes, armas, armaduras e monstros comuns foram reaproveitadas. O MVP recebeu um atlas próprio adicional, descrito abaixo; seu SVG anterior permanece preservado.

As sequências da galeria usam o renderizador real `SpriteActor`, com arma, colete, botas, mochila e mão secundária. São **12 pranchas, 1.536 quadros**: seis classes × dois corpos × quatro famílias × quatro direções × oito estados amostrados. Os quadros de conjuração são poses do renderizador; a possibilidade de usar cada habilidade continua sujeita às regras da classe e da arma. Uma prancha sem equipamentos permite comparar as roupas próprias das classes. A galeria reproduz as sequências, além de permitir abrir os PNGs completos e a comparação antes/depois.

## IA e Lobo Branco

Os inimigos comuns dos andares 1–3 agora alternam deslocamentos curtos e pausas, sem depender de um ataque do jogador. As decisões são espaçadas; não é calculado um caminho completo em cada quadro. Colisão, superfícies, portais e proximidade de outros inimigos limitam os destinos. Ao abandonar o aggro, o inimigo retoma a exploração na posição válida atual. Essa posição torna-se a referência da próxima área de exploração/perseguição; o nascimento continua reservado à geração e ao reaparecimento. Essa atualização também evita ciclos de cura contínua quando um combate termina longe do ponto inicial.

A detecção e o comportamento passivo/agressivo por espécie foram preservados. A orientação gráfica dos lobos acompanha o deslocamento observado, inclusive nos intervalos entre snapshots; não deriva apenas da direção do alvo. Simulação de 20 Hz, snapshots de 10 Hz, estado público por mapa e filas limitadas continuam existentes.

O Lobo Branco tem regra própria: seus destinos e sua carga ficam dentro da grande sala da caverna, com colisão. Um alvo fora dela deixa de ser perseguido. Ao perder o alvo, o MVP retoma a exploração sem teleportar ao centro.

**A arte própria do MVP já existia**: `white-wolf-v052.svg`, nove quadros × quatro direções. A inspeção dentro da caverna mostrou uma aparência geométrica destoante dos lobos comuns. O arquivo antigo foi preservado, e a apresentação passou a usar `public/assets/monsters-v36/white-wolf.png`: 36 quadros novos, com pelagem clara e proporções caninas, criados por ImageGen usando o lobo comum como referência. O empacotador existente organizou as células e preservou original, referência e linhas de inspeção. A seleção de quadros representa caminhada, preparação/recuperação da mordida, dano, carga, uivo, fúria e morte com prioridade adequada. A mordida mostra alcance circular; a carga mostra seu corredor de perigo, ampliado na fúria; o uivo mantém seu anel. O indicador da carga representa o envelope máximo e pode sobrepor visualmente uma parede, embora o deslocamento e o dano continuem limitados pelo servidor. A coloração avermelhada durante a fúria continua sendo um efeito sobre a pelagem clara.

Permanecem **48.000 HP, ataque-base 850, reaparecimento de 15 minutos**, recompensas, morte no mundo público, lápide no local exato, data/hora, finalizador e persistência. O Cavaleiro mantém seu sistema próprio.

## Matriz de paridade e evidências

“Automatizado” abaixo significa execução de regras ou integração, não observação humana de todos os casos. “Electron” significa aplicação local real com dados temporários, não LAN física.

| Funcionalidade | Campanha local | Multiplayer | Resultado/evidência |
|---|---|---|---|
| Inventário, itens, peso, transporte | Testes de domínio e UI existentes | Regressão + I/equipar no Electron | Preservado e exercitado |
| Brasa, ouro, compras, arma grátis | Regras existentes | Testes 35/36 + fluxo A | Compra válida, distância, saldo e recibo |
| Equipamentos/troca de armas | Inventário e renderizador | Regressão + compra/equipar/atacar/reconectar | Persistência e apresentação verificadas |
| Pesca/cozinha/venda/consumíveis | Testes das atividades | Testes 35 e fluxo de pesca/venda | Pesca/venda no Electron; cozinha em integração |
| Mineração | Testes locais anteriores | Novos testes + F/minijogo/resultado | Lacuna corrigida |
| Forja | Serviço e testes locais | Novos testes + três cliques no Electron | Lacuna corrigida |
| Atributos/pontos | Testes de personagem | Fluxo B e regressão | Distribuição pela interface e persistência |
| Habilidades/aprendizado/atalhos | Testes de árvore, classes e combate | Fluxo B + online-skills/iteration32 | Autoridade, oito atalhos e restrições mantidos |
| Base/Job/promoção/Serafina | Job-progress e serviços | School-access, online-skills e regressão | Regras preservadas; promoção não repetida manualmente no Electron |
| Criação/aparência | Validação retrocompatível e previews | Criação no ensaio dos pacotes + fluxo C | Tipos/cabelos salvos e visíveis a outro cliente |
| Movimento/transição | Testes de mundo/câmera | Portal real no ensaio dos pacotes; cenários D preparados no servidor | Numeração preservada |
| NPCs/diálogos | Testes existentes | Brasa/Lina no percurso; demais serviços em regressão | Marta/Orin continuam diálogos sem serviço jogável em ambos |
| Drops/baús/recompensas | Testes de loot/iteração 30 | Regressão + combate/coleta no fluxo | Autoridade e apresentação preservadas |
| Teleporte com consentimento | Motor de habilidades | Testes online de pedido e consentimento | Diferença intencional, não teleporte livre |
| Inimigos comuns | Testes locais de IA | Testes 36 + dois clientes nos andares 1–3 | Exploração e posição coerentes |
| MVP/lápide/reaparecimento | Arte e base de inimigo; encontro persistente é escolar | Regressão + fluxo E controlado | Mundo público e regras da 34 |
| Cavaleiro | Testes de combate | Testes de arena e regressão | Instância de grupo preservada |
| Pausa/salvamento | Pausa e perfil local | Mundo continua ativo; banco central | Diferença arquitetural intencional |
| Conta/TLS/sessão/party/chat | Não se aplica à campanha local | Regressão + ADM/Aluno Electron | Serviços escolares preservados |
| ADM/backup/temporada/desconexão | Fora da campanha | Testes em bases descartáveis | Separação ADM/Aluno preservada |
| Ouro/nível/teleporte arbitrários | Ferramentas de desenvolvimento | Ausentes da interface distribuída | Não fazem parte da paridade jogável |

## Execução e resultados

| Ensaio | Resultado | Evidência |
|---|---|---|
| Referência pós-35 | 898/898 aprovados | [Log inicial](evidencias/iteration36/regressao-inicial.txt) |
| Regressão final | **909/909 aprovados**, zero falhas, cancelamentos ou ignorados; 264.6 s | [Log final](evidencias/iteration36/regressao-final.txt) |
| Rede isolada | 10/10: vagas, sessão, TLS, reconexão, mapas e persistência | [Log](evidencias/iteration36/rede-isolada.txt) |
| Arte final do MVP | 28/28 testes relacionados aprovados após troca do atlas | [Log](evidencias/iteration36/arte-mvp-testes.txt) |
| Preparação gráfica | 28/28 testes relacionados aprovados; cobre atlas modular, fallback de ofício, cancelamento e preparação de cena | [Log](evidencias/iteration36/preparacao-grafica-testes.txt) |
| Matriz visual | 12 combinações classe/corpo, 1.536 quadros, inspeção e invariantes aprovados | [Dados](evidencias/iteration36/matriz-visual.json) e [galeria](capturas/iteration36/index.html) |
| ADM/Aluno empacotados | Aplicativos reais sob Electron correspondente, quatro clientes, sem erro de execução | [Relatório](evidencias/iteration36/adm-aluno-empacotados.json) |
| Fluxos A–D e ofícios | Dois clientes com recursos da Iteração 36, serviço ADM e base temporária; etapas concluídas com reconexão | [Consolidação](evidencias/iteration36/fluxos-empacotados.json) e [execução original](evidencias/iteration36/fluxos-a-d-execucao.json) |
| Fluxo E, MVP | Reteste dedicado completo, incluindo reaparecimento quando o ponto fica livre | [Execução do MVP](evidencias/iteration36/mvp-reteste.json) |
| Carga TLS | 4 e 32 conexões, zero erros/desconexões inesperadas, todos reconectados | [4 conexões](evidencias/iteration36/rede-depois-4.json), [32 conexões](evidencias/iteration36/rede-depois-32.json) |
| Distribuição | Quatro EXEs x64; ASAR e executável interno extraídos e comparados | [Auditoria](evidencias/iteration36/auditoria-pacotes.json) |

O crescimento de 898 para 909 corresponde a onze testes novos de fabricação, mineração, suprimentos, recibos, aparência, poses, IA e preparação de texturas. As tentativas intermediárias foram usadas para corrigir o acesso real à mineração, o ciclo de cura/retorno dos inimigos e o carregamento gráfico. Três testes de rede falharam sob concorrência com outros ensaios pesados; passaram isoladamente e nas regressões controladas. Não foram removidos para obter aprovação.

Os fluxos não são apresentados como uma única execução sem falhas. A execução integral concluiu A–D, ofícios e reconexão, mas a asserção final do MVP exigia reaparecimento em um único passo, enquanto o servidor aguardava espaço livre. O roteiro foi corrigido para avançar a simulação respeitando essa regra existente, e **somente o fluxo E foi repetido e aprovado**. O JSON consolidado identifica as duas execuções; o resultado original reprovado foi preservado como evidência. Nenhuma regra de respawn foi relaxada para aprovar o teste.

No percurso integral, foram realizadas **12 tentativas de pesca**, e a venda válida a Lina gerou **74 de ouro** antes das compras. Não foi usado ouro de fixture nessa execução. Tentativas interrompidas ou peixes perdidos, quando ocorreram, estão registrados no JSON e foram repetidos pelas regras normais.

Verificações do percurso:

- C: corpo e cabelo sincronizados em dois clientes reais. Criação pela UI é coberta no ensaio dos pacotes.
- Mineração: F em veio real, indicador do servidor, clique no golpe, minério/XP e esgotamento persistidos. Andar preparado fora do cliente.
- A: ouro obtido pela pesca e venda válida a Lina, compra de adagas em Brasa pela UI, I/equipar/atacar e persistência. B: nível por combate, atributo pela UI, aprendizado/hotbar/uso pelo comando normal e reconexão. Forja: três cliques reais e resultado persistido.
- D: dois clientes nos andares 1–3, exploração observada em sequências, posições coerentes e ausência de duplicação. Transições preparadas pelo servidor de ensaio.
- E: MVP em combate, efeitos, morte controlada, lápide na posição real e reaparecimento com relógio de ensaio avançado 15 minutos.

Verificações dos aplicativos empacotados:

- ADM real inicia servidor em processo separado e mostra zero vagas ocupadas
- Descoberta UDP local, identidade do ADM e ausência da ponte administrativa no aluno
- Quatro processos Electron, quatro perfis, um servidor e um banco: cadastro, login, personagens e sincronização
- Criação pela UI com corpos e cabelos novos, visualização por outro jogador e persistência nos ciclos de login
- Segundo login rejeitado sem derrubar o cliente original
- Troca A → B → A entre perfis Electron separados conserva personagem e duas alterações reais de equipamento
- Kick pela interface confirma conta correta, mostra mensagem exata e permite novo login
- Backup pelo ADM, parada e reinício do mesmo banco preservam equipamento e progresso
- Recarregar a interface ADM não interrompe o processo servidor nem a sessão do aluno
- Movimentação, entrada real na Torre e dano de combate confirmados pelo servidor do pacote
- Restauração do backup temporário preserva quatro contas, temporada, identidade TLS e personagem; sem criar ou limpar temporada
- ADM encerra normalmente com código zero após gravar e parar o serviço

### Limites dos ensaios

As contas, os perfis avançados, o XP próximo da subida de nível, três minérios e alguns reposicionamentos foram preparados fora do cliente. O ouro do fluxo A integral foi obtido por pesca e venda normal. O aprendizado e a atribuição de atalho do fluxo B usaram o comando normal do cliente; a distribuição de atributo usou a interface. A entrada em fúria, a recuperação de HP dos participantes, a derrota final do MVP e o avanço do relógio para reaparecimento foram controlados pelo ensaio. Esses recursos não são botões disponíveis ao aluno.

O roteiro dos pacotes executa os `app.asar` produzidos com o Electron correspondente e perfis temporários; a auditoria extrai os quatro EXEs e compara seus conteúdos com os recursos executados. Não foi feita instalação nativa interativa, nem abertura do perfil de produção, nem teste em 32 computadores físicos. Os EXEs não têm assinatura digital de um certificado de publicação. A validação presencial de diferentes GPUs, Wi-Fi, firewall e instalação permanece uma etapa de campo.

O ensaio amplo de ADM e quatro alunos antecedeu a última substituição visual do MVP e o ajuste de preparação gráfica. Depois dessas mudanças, o Aluno foi reconstruído, os quatro EXEs foram auditados novamente e o ensaio gráfico de três clientes exercitou a entrega final. O reteste dedicado do MVP já usa a arte nova; os fluxos A–D preservam a execução anterior às duas revisões finais de apresentação. As regras do servidor não mudaram entre essas execuções. A regressão completa foi repetida após os ajustes finais.

As atividades de pesca/mineração mantêm a apresentação de ofício já existente onde aplicável; não foi produzida uma nova coleção de sprites corporais de profissão para cada combinação modular. O foco das poses novas é o combate e a conjuração. Os novos cabelos têm expressão neutra, conforme explicado acima.

## Desempenho

Ambiente: AMD Ryzen 5 6600H, Windows, Node 24.19.0 e Electron 44.5.1. As etapas de carga, regressão, empacotamento e renderização foram executadas sequencialmente para reduzir interferência. São medições desta máquina, sem extrapolação para um laboratório inteiro.

### Simulação isolada antes/depois

Mesma semente e três mapas, 600 passos de 50 ms (30 s simulados), snapshots a cada dois passos. “Combate” inicia jogadores próximos de um inimigo com alvo definido; é um microensaio de simulação, não a carga TLS sustentada. Os bytes são a estimativa por serialização de snapshots completos multiplicada pelos jogadores, sem transporte real. O código anterior vem da cópia pós-35.

| Jogadores | Cenário | p95 de atualização antes → depois | Decisões de exploração depois | Atualizações de posição depois |
|---|---|---|---|---|
| 4 | idle | 1.66 → 4.56 ms | 1054 | 59175 |
| 4 | combat | 1.97 → 5.91 ms | 1038 | 58278 |
| 32 | idle | 4.24 → 7.10 ms | 1054 | 59175 |
| 32 | combat | 5.77 → 9.33 ms | 1035 | 58300 |

As decisões são por inimigo/mapa, não por cliente. O cenário ocioso produz a mesma quantidade de decisões para quatro e 32 jogadores. A atividade visual acrescenta trabalho real; o tempo sintético permanece abaixo do orçamento de 50 ms por ciclo.

### Carga TLS em tempo real

Servidor em processo separado e clientes de protocolo locais; fases de repouso, movimento, distribuição pelos mapas, combate, MVP, inventário e recuperação. Comparação com o código pós-35 preservado, mesmas dependências e roteiro. A tabela usa a média dos tempos médios de ciclo das janelas de um segundo; o pico é informado separadamente, sem ocultar criação de mapas ou transições.

| Fase, 32 conexões | Ciclo médio antes → depois | Simulação média antes → depois | Snapshots médios antes → depois |
|---|---|---|---|
| idle | 8.61 → 10.21 ms | 3.79 → 4.31 ms | 4.82 → 5.90 ms |
| move | 8.68 → 8.59 ms | 3.34 → 3.29 ms | 5.34 → 5.30 ms |
| distributed | 11.70 → 16.25 ms | 6.36 → 9.95 ms | 5.34 → 6.30 ms |
| combat | 25.87 → 28.18 ms | 15.11 → 17.73 ms | 10.76 → 10.45 ms |
| boss | 23.39 → 20.98 ms | 11.41 → 10.26 ms | 11.98 → 10.72 ms |
| inventory | 14.71 → 14.81 ms | 9.72 → 9.64 ms | 4.99 → 5.17 ms |
| recovery | 12.91 → 11.49 ms | 8.58 → 7.88 ms | 4.33 → 3.61 ms |

| Indicador, 32 conexões | Antes | Depois |
|---|---|---|
| Maior p95 de ciclo em uma janela de 1 s | 544.3 ms | 743.3 ms |
| Latência comando/snapshot p95 | 237.4 ms | 216.7 ms |
| Intervalo de snapshot p95 | 134.8 ms | 137.3 ms |
| CPU média do processo servidor (100% = um núcleo) | 55.9% | 56.2% |
| Pico de RSS do servidor | 281.0 MiB | 272.1 MiB |
| Saída média observada por janela | 16553.2 KiB | 17531.2 KiB |
| Maior fila agregada observada | 3.33 MiB | 2.92 MiB |
| Reconexões concluídas | 32 | 32 |

O alvo permanece 20 Hz/10 Hz. Houve janelas acima de 50 ms e pausas de transição; portanto este relatório não afirma cumprimento rígido do orçamento em todos os ciclos. As filas foram limitadas e recuperaram-se; não houve erro ou desconexão inesperada nos roteiros. A capacidade de protocolo para 32 conexões não equivale à capacidade gráfica de 32 computadores físicos. Os JSONs preservam as amostras por fase.

### Composição e renderização

- Antes: composição inicial média de 382.2 ms; consulta ao cache entre 0.00 e 0.10 ms; atlas de 6.0 MiB.
- Depois: composição inicial média de 389.6 ms; consulta ao cache entre 0.00 e 0.10 ms; atlas de 6.0 MiB.

Três processos gráficos simultâneos, perfis e roteiro equivalentes, cidade e combate com MVP. A referência gráfica usa o **Aluno empacotado da 34**, cujo compositor precede a mudança; ambos se conectam ao servidor atual para isolar a apresentação. Assim, a referência gráfica não é uma alegação de empacotamento da 35. CPU abaixo mede tempo de tarefas do renderizador via CDP, não o uso total de todos os processos Electron. FPS deriva dos intervalos capturados, não de uma promessa de monitor físico.

| Cliente/cenário | FPS antes → depois | CPU de tarefas antes → depois | Heap JS antes → depois |
|---|---|---|---|
| 1 / 01-cidade-clientes-reais | 36.6 → 36.5 | 96.6% → 91.9% | 24.1 → 14.4 MiB |
| 2 / 01-cidade-clientes-reais | 37.3 → 38.0 | 96.7% → 97.1% | 17.0 → 14.2 MiB |
| 3 / 01-cidade-clientes-reais | 38.6 → 38.8 | 97.0% → 96.0% | 20.2 → 17.0 MiB |
| 1 / 02-combate-lobo-branco | 56.5 → 60.4 | 98.9% → 98.6% | 21.5 → 29.3 MiB |
| 2 / 02-combate-lobo-branco | 57.6 → 60.7 | 99.0% → 98.8% | 33.4 → 34.4 MiB |
| 3 / 02-combate-lobo-branco | 58.6 → 65.0 | 98.8% → 98.8% | 38.0 → 20.6 MiB |

Fontes: [simulação antes](evidencias/iteration36/simulacao-antes.json), [depois](evidencias/iteration36/simulacao-depois.json), [rede antes](evidencias/iteration36/rede-antes-32.json), [rede depois](evidencias/iteration36/rede-depois-32.json), [render antes](evidencias/iteration36/render-antes.json) e [render depois](evidencias/iteration36/render-depois.json).


## Distribuição e reprodução

Os quatro arquivos foram gerados novamente a partir do código atual. Não são binários antigos renomeados.

| Produto | Formato | Arquivo | Tamanho |
|---|---|---|---|
| ADM | portable | [Dungeon Teacher ADM-Iteracao36-0.6.9-Portable.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36/adm/Dungeon Teacher ADM-Iteracao36-0.6.9-Portable.exe>) | 106.5 MiB |
| ADM | installer | [Dungeon Teacher ADM-Iteracao36-0.6.9-Setup.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36/adm/Dungeon Teacher ADM-Iteracao36-0.6.9-Setup.exe>) | 106.7 MiB |
| Aluno | portable | [Dungeon Teacher-Iteracao36-0.6.9-Portable.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36/student/Dungeon Teacher-Iteracao36-0.6.9-Portable.exe>) | 232.0 MiB |
| Aluno | installer | [Dungeon Teacher-Iteracao36-0.6.9-Setup.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36/student/Dungeon Teacher-Iteracao36-0.6.9-Setup.exe>) | 232.2 MiB |

Os hashes completos estão em [SHA256SUMS.txt](../release/iteration36/SHA256SUMS.txt); o [manifesto](../release/iteration36/manifest.json) registra arquitetura, versão, horário de geração e identidade dos conteúdos internos. A auditoria comparou 136 arquivos do ADM e 476 do Aluno com a origem, confirmou dependências do servidor e ausência de administração no cliente. Os oito EXEs das iterações 33/34 foram conferidos e permanecem com os mesmos hashes.

Usar ADM 36 no computador do professor e Aluno 36 nos computadores dos alunos. Conservar um backup pelo ADM antes de atualizar uma instalação oficial, encerrar os aplicativos e substituir apenas a versão executável. Os caminhos de dados e identidades dos aplicativos foram mantidos; não remover os perfis, bancos ou pastas de dados. Conferir a identidade do servidor exibida pelo ADM ao conectar os alunos. A versão interna continua 0.6.9; identificar esta entrega pelo nome `Iteracao36` e pelos hashes, não somente pelo número interno.

Não houve publicação automática. A auditoria de assinatura registrou `NotSigned`; isso é distinto da identidade TLS do servidor escolar.


Os arquivos alterados, hashes e inventário de arte estão em [ITERACAO-36-ARQUIVOS.md](ITERACAO-36-ARQUIVOS.md). As evidências copiadas junto ao relatório permitem reproduzir e distinguir a regressão, o ensaio gráfico, o fluxo funcional e a auditoria de empacotamento.

Para repetir em desenvolvimento: instalar as dependências já fixadas pelo projeto; executar `node --test --test-concurrency=2 tests/*.test.js` sem outros ensaios pesados; construir o aluno com `node scripts/build-student.cjs`; executar `node scripts/iteration36/flows.mjs`; gerar a matriz com `DT_VISUAL_MATRIX=1` e `node scripts/iteration36/visual-run.mjs`. Os roteiros criam dados temporários automaticamente. Não apontá-los para dados oficiais.

Para a distribuição: `npm run package:adm`, `npm run package:student`, `node scripts/verify-iteration36-packages.cjs` e `node scripts/package36-electron.mjs`. Para o percurso detalhado sobre os recursos empacotados, definir `DT_USE_PACKAGES=1` e `DT_PACKAGE_ROOT=release/iteration36` antes de executar `flows.mjs`. Não definir `DT_FLOW_FAST`: essa opção é somente um diagnóstico com ouro de fixture e não valida o fluxo A integral.
