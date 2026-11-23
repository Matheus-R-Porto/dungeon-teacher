# Dungeon Teacher — Iteração 41

## Consolidação final e preparação para o playtest escolar · 0.6.15

Data: 09/11/2026. Entrega local, sem publicação automática.

**Meta de encerramento:** a entrega ideal é aquela em que o responsável consiga abrir o ADM, criar uma campanha nova, iniciar a sala e receber os alunos, enquanto todos exploram os três andares e utilizam as novas artes. O playtest presencial ainda será a validação final em condições reais; até lá, esta iteração entrega o jogo e demonstra tecnicamente que suas funções essenciais estão prontas.

## 1. Versão-base

A distribuição oficial permanece em 0.6.14. A base desta entrega é a cópia isolada da Iteração 40 experimental, que herdou a integração direta das artes da variante D/I39 e o cache compartilhado da variante C/I38. Cidade do Limiar, numeração, mapas e artes foram preservados.

## 2. Versão final

0.6.15 em ADM, Aluno e manifests; protocolo 4, recursos native-art-40 e campanha school-41. Login e entrada no mundo verificam a compatibilidade. Incompatibilidade produz erro explícito. Perfis Windows históricos continuam válidos.

## 3. Código e recursos consolidados

Foram integrados carregamento visual sob demanda, descarte de imagens, gerência segura de campanhas, diagnóstico, recuperação, backup consistente, compatibilidade, objetivos iniciais no online, baú único persistente do Cavaleiro e dificuldade comum compartilhada. Nenhuma segunda classe, IA avançada ou mapa novo foi criado.

## 4. Artes da Iteração 40

As 1.581 entradas de arquivos públicos da I40 permanecem idênticas por SHA-256. As 12 identidades (seis classes × dois corpos), quatro direções, quatro famílias, habilidades, morte, recoil e profissões usam os recursos nativos existentes. A auditoria dos pacotes verificou 1.415 PNGs do Aluno, inclusive dimensões e hashes. O fallback legado permanece apenas como contingência de falha de carregamento, nunca como redução silenciosa de qualidade no caminho normal.

## 5. Benchmark inicial

O baseline foi coletado antes das otimizações, em Electron real, com duas conexões e 12 atores adicionais de apresentação por cliente. Foram sete janelas de 30 segundos, duas amostras por janela, incluindo dois ciclos de armas, profissões e liberação.

## 6. Gargalos identificados

A profissão mantinha quatro direções simultaneamente por identidade, mesmo exibindo uma só. O ator nativo também preparava recursos legados desnecessários. Fontes permaneciam decodificadas após descarte da textura. Na medição inicial, o cache estimado chegou a 1.087,3 MiB em profissões.

## 7. Otimizações implementadas

Profissões seguram somente a direção atual; fontes compartilhadas mantêm contagem de referências e cache ocioso limitado a 64 MiB. Troca fria usa o repouso nativo da mesma identidade enquanto decodifica. Recursos legados são carregados apenas após erro. Descarte libera a fonte decodificada quando não há referências. Relógios de combate e recompensas não dependem dessas otimizações.

## 8. Benchmark final

Mesma resolução, perfil gráfico e cenário da base. São 14 medições; falha de recurso original e oito direções frias foram verificadas depois das janelas e passaram. FPS inicial com dois Alunos: 90,9–91,0; armas 74,4–80,8; profissões 59,3–66,9. Nenhuma janela apresentou média abaixo de 59 FPS. O maior quadro isolado foi 137 ms. Há regressão de FPS em profissões em relação à I40, explicitamente registrada.

## 9. Memória e FPS

Cache de profissões: aproximadamente 1.087,3 → 459,3 MiB (−57,8%). Após liberação: 110,8 MiB, somente 3 entradas ativas e 53,6 MiB ociosos, sob limite de 64 MiB. Memória privada máxima por Aluno: 1.415,5 MiB (1,38 GiB), contra 1.330,6 MiB no baseline. A redução de cache não se converteu em redução da memória total nas profissões. É uma otimização parcial; consumo e FPS exigem piloto nos PCs escolares.

## 10. Teste de 12 participantes

12 sessões reais de protocolo com cadastro, autenticação, criação e TLS. Carga contínua de 600,108 segundos; execução inteira de aproximadamente 14min27s com preparação, jornada e reconexões. Durante a carga: CPU média do servidor 25,87% de um núcleo lógico; RSS médio 211,68 MiB, máximo 219,74 MiB. Confirmações de comandos: 4.934 amostras, média 71,37 ms, p95 111,28 ms e p99 122,66 ms.

## 11. Limitações do teste

Um computador físico Windows 11 Home Single Language, AMD Ryzen 5 6600H e AMD Radeon integrada via ANGLE/D3D11. Integração empacotada: um ADM e dois Alunos Electron reais. Aceitação de 12 participantes: dois Alunos Electron + dez clientes de protocolo. Nenhum desses testes equivale a 12 computadores reais, rede Wi-Fi da escola ou várias horas de aula.

## 12. Matriz local/multiplayer

A matriz anexa tem 38 linhas com diferenças, fontes e correções. Equivalência de campanha preserva o conteúdo e os requisitos; o escolar já possuía classes/Job/ranks, grupos, encontros públicos e autoridade de servidor ausentes no modo local clássico.

## 13. Estado dos três andares

Andar 1: acesso, inimigos e requisito de derrotas aprovados. Andar 2: acesso, inimigos, requisito e presença do encontro Lobo Branco cobertos. Andar 3: acesso, inimigos e Cavaleiro/castelo preservados. Jornada legítima: Novato comprou vara em Brasa, venceu 4 + 4 + 1 inimigos, ganhou nível 2 e alcançou o terceiro andar por portais reais, sem alterar banco/posição/atributos. Isso não é uma vitória legítima de turma iniciante sobre os bosses; cenários avançados usam fixtures explícitas.

## 14. Portais e progressão

Torre exige arma equipada. Passagem do primeiro andar exige três derrotas; segundo, quatro; avanço posterior ao terceiro depende do Cavaleiro. A identidade e a numeração dos mapas antigos não mudaram.

## 15. Bosses e MVPs

Cavaleiro: terceiro andar, 3.000 HP/180 ataque no escolar, 1.500/24 no local, XP 300. Lobo Branco: segundo andar/caverna, 48.000 HP/850 ataque no escolar, reforços e regras próprias preservadas. A I41 acrescenta persistência e coleta única do baú do Cavaleiro. Não houve uma sessão humana de 12 PCs vencendo os dois encontros.

## 16. Atributos antigos e novos dos comuns

| Andar | Tipo | HP antes → depois | Ataque físico antes → depois | Ataque mágico antes → depois |
|---|---|---:|---:|---:|
|1|meleeAggressive|80 → 85–93|9 → 10–11|—|
|1|wolf|85 → 90–96|9 → 10–11|—|
|2|mobile|75 → 80–87|10 → 11–12|—|
|2|meleeAggressive|100 → 109–113|10 → 11–12|—|
|2|wolf|100 → 108–114|10 → 11–12|—|
|3|ranged|84 → 89–97|11 → 12–13|13 → 15–16|
|3|meleeAggressive|120 → 130–135|11 → 13–13|—|
|3|mobile|90 → 98–102|11 → 13–13|—|
|3|wolf|115 → 122–133|11 → 12–13|—|

Valores observados na seed 217021. Faixas por tipo refletem os territórios onde ele apareceu.

## 17. Faixa de níveis por andar

Andar 1: 1–5; Andar 2: 3–9; Andar 3: 5–13. Diferenças máximas 4, 6 e 8. Na seed 217021: 48, 55 e 70 comuns respectivamente, excluindo MVP e reforços. HP +6–16%; ataques positivos +12–20%, com arredondamento inteiro.

## 18. Distribuição espacial

O fator de dificuldade acompanha o percurso navegável da entrada ao portal, com projeção no caminho e pequena variação determinística. Médias de nível no primeiro/último quartil: 1,58/4,25; 3,71/8,14; 6,06/11,89. Respawn mantém o nível e os atributos do território.

## 19. Testes de balanceamento

Testes automatizados verificam limites, tendência espacial, consistência local/online, preservação exata de bosses e respawn após morte. A jornada legítima atravessou os três primeiros andares com o ajuste. Isso comprova viabilidade básica, não calibração pedagógica com alunos.

## 20. IA existente

Estados e regras existentes de perseguição, retorno, colisão, ataque, recoil, morte e encontros especiais foram preservados. Nenhuma reconstrução da IA avançada foi feita.

## 21. Armazenamento do ADM

Padrão ADM: `%APPDATA%/Dungeon Teacher ADM/school-data`. Aluno: `%APPDATA%/Dungeon Teacher`. A campanha histórica pode permanecer na raiz; novas campanhas recebem diretórios próprios identificados por UUID, catálogo atômico, banco, mapas e backups. Instalador e portátil usam o mesmo perfil Windows.

## 22. Diagnóstico da antiga perda de acesso

A auditoria identificou estados recuperáveis: temporada encerrada, sessão antiga, senha esquecida, configuração ilegível, porta ocupada, certificado inválido e SQLite indisponível. Agora há diagnóstico e caminhos de recuperação. A limpeza destrutiva antiga fica bloqueada no serviço.

## 23. Criação de campanhas

A opção padrão "Continuar com todos os saves atuais" cria uma campanha separada com cópia consistente de contas e personagens. "Outra turma vazia" mantém a campanha antiga intacta. Criar e selecionar foram executados pela interface empacotada e comparados byte a byte nos dados dos 12 personagens.

## 24. Backup

Backup SQLite usa snapshot consistente que inclui WAL confirmado e conexão de leitura própria. Mapas e banco recebem verificação de integridade/hashes. UI cria e exporta uma cópia completa para outra pasta. Copie backups para outra unidade: perder o disco sem cópia externa continua significando perder dados.

## 25. Recuperação

Código de recuperação é gerado pelo professor e somente seu hash fica salvo. Recupera acesso e banco a partir de backup válido. SQLite danificado é arquivado antes da restauração. A interface empacotada recuperou um banco deliberadamente danificado de teste e manteve 12 personagens.

## 26. Reinicialização segura

Reiniciar serviço, reabrir aplicativo e reiniciar o mundo são ações distintas. "Reiniciar mundo mantendo os saves" exige a frase REINICIAR MUNDO, cria backup e arquiva geografia, preservando todos os dados permanentes dos personagens. Protocolo e UI compararam 12 saves antes/depois.

## 27. Aplicativos empacotados

A aceitação final do ADM passou em perfil isolado: primeiro acesso, 12 sessões, backup, encerramento com aviso, reset do mundo, campanha clonada/vazia/seleção, restauração, porta ocupada, queda/reabertura, configuração/TLS inválidos e recuperação de SQLite. Alunos reais fizeram caminhada, quatro armas, combate, habilidade, portais, pesca, mineração, mochila/carrinho, reconexão e reinício.

## 28. Testes multiplayer

Pesca com recompensa e experiência; cancelamento e reconexão não duplicam ganho. Mineração com janela e golpe confirmados concede exatamente um minério, com animação própria e remota. Na seed escolar verificada, os três primeiros andares florestais não têm veios: o ensaio real de mineração usa fixture explícita no Andar 4 existente.

## 29. Testes automatizados

Execução integral final limpa: **1.008 testes aprovados**, zero falhas/cancelamentos/ignorados, duração 222,62 s; comando `node --test --test-concurrency=4 tests/*.test.js`. A rodada anterior tinha 7 falhas (expectativas antigas de HP, atlas e versão); foram corrigidas e a execução completa repetida.

## 30. Pacotes Windows

Quatro executáveis x64, 0.6.15: ADM Setup, ADM Portable, Aluno Setup e Aluno Portable. Nomes internos `DungeonTeacherADM.exe`/`DungeonTeacherAluno.exe`. Sem dependência dos caminhos de desenvolvimento. Não há certificado comercial de assinatura Authenticode; a escola deve conferir a origem e os hashes.

| Pacote | Tamanho MiB |
|---|---:|
| Dungeon Teacher ADM-Iteracao41-0.6.15-Portable.exe | 106.5 |
| Dungeon Teacher ADM-Iteracao41-0.6.15-Setup.exe | 106.8 |
| Dungeon Teacher Aluno-Iteracao41-0.6.15-Portable.exe | 679.2 |
| Dungeon Teacher Aluno-Iteracao41-0.6.15-Setup.exe | 679.4 |

## 31. Hashes e manifesto

A estável foi conferida contra o manifesto histórico: 5.467 arquivos e 10 pacotes inalterados.

## 32. Guia escolar

Guia em português: instalação, primeira campanha, continuidade, LAN, TLS, alunos, salvamento, encerramento, exportação de backup, importação em computador novo, diagnóstico e recuperação. Operações comuns não exigem terminal, SQLite ou exclusão de AppData.

## 33. Problemas encontrados

Expectativas antigas de testes; fallback/preparação redundantes; imagens retidas; SQLite aberto após falha; feedback do ADM antes do fim da operação; encerramento podia cortar o aviso ao Aluno. Neste Windows, o executável com nome antigo teve falha de GPU enquanto a mesma imagem binária renomeada funcionou; a causa ambiental exata não foi determinada.

## 34. Problemas resolvidos

Foram corrigidos ciclo de recursos, handle SQLite, contratos de versão, campanha, recompensas e confirmação da UI. Encerramento agora entrega o aviso e aguarda fechamento limitado antes de terminar conexões. Não se desativou TLS, autenticação, sandbox ou integridade ASAR.

## 35. Pendências conhecidas

Validação em 12 PCs físicos e na rede escolar; aula prolongada; instalação interativa em máquina separada; calibração dos encontros com alunos; mineração ocorre em mapa elegível posterior, preservando os três primeiros. Catálogo global ilegível pode exigir suporte. Sem backup externo não se recupera um disco perdido.

## 36. Prontidão para o playtest

**Entrega técnica concluída para piloto acompanhado, com limitações.** Não há bloqueio conhecido nos fluxos testados de criar campanha, conectar, alcançar os três andares e manter os dados consistentes. Não é certificação de uma turma em 12 computadores: desempenho/memória, rede escolar, instalação separada e duração de aula ainda precisam de validação no local. A regressão de FPS em profissões e o consumo total de memória são conhecidos e delimitam a liberação.

| Área | Classificação | Evidência / limite |
|---|---|---|
|Inicialização do ADM|Aprovada|Primeiro perfil, reabertura, diagnóstico e recuperação em EXE.|
|Criação de campanha|Aprovada|Continuação, nova turma vazia e seleção pela UI.|
|Conexão dos alunos|Aprovada com limitações|TLS e 12 sessões no mesmo PC; LAN da escola pendente.|
|Persistência|Aprovada|12 personagens íntegros após reset/restart/restore; portáteis retomaram save.|
|Campanha nos três andares|Aprovada com limitações|Jornada legítima 1→2→3; bosses e mineração avançada com fixtures/testes.|
|Progressão|Aprovada|Requisitos, níveis, portais, conclusão e baú persistente.|
|Classes|Aprovada|Seis classes × dois corpos preservados e testados; sem segundas classes.|
|Habilidades|Aprovada|80 habilidades no domínio/executor, mana real e persistência; não houve sessão humana de todas.|
|Equipamentos|Aprovada|Quatro armas, adagas, mochila/carrinho e inventário autoritativo.|
|Profissões|Aprovada com limitações|Pesca e mineração próprias/remotas; mineração no Andar 4 elegível.|
|Inimigos comuns|Aprovada|Faixas, tendência, stats, combate e respawn.|
|Bosses|Aprovada com limitações|Suíte de encontros/recompensas aprovada; equilíbrio com turma real pendente.|
|Multiplayer|Aprovada com limitações|12 sessões/10 min, dois Alunos reais; não 12 PCs. Capacidade 32 preservada, não validada como 32 máquinas.|
|Desempenho|Aprovada com limitações|59–67 FPS em profissões; regrediu frente ao baseline nesse cenário. Piloto acompanhado.|
|Memória|Aprovada com limitações|Cache −57,8%; privada até 1,38 GiB por Aluno, sem redução total nas profissões.|
|Distribuição|Aprovada com limitações|Quatro EXEs, conteúdo/hash/integridade e portáteis verificados; Setup em outro PC e assinatura comercial ausentes.|

## Arquivos da entrega

Suíte completa (1.008 aprovados), aceitação do ADM empacotado, jogabilidade real empacotada, continuidade nos portáteis e métricas das 12 sessões ficaram registradas em `work/iteration41-school-playtest/` (local, fora do controle de versão), junto com os relatórios de tentativas que falharam. Todos os bancos usados para testes foram isolados dos dados oficiais.
