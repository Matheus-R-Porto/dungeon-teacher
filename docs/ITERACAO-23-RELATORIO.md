# Iteração 23 — Beta 0.6.0
## O Cavaleiro do Último Juramento

## Escopo e diagnóstico anterior

A implementação foi iniciada sobre o checkout da Beta 0.5.2, preservando suas
alterações. O código confirmou `OnlineTower` sobre `SharedTower`, uma `SharedWorld`
por mapa, portais validados no servidor, persistência SQLite por personagem,
Parties limitadas a seis, protocolo v4 e agendador fixo de 20 Hz. A população
configurada continua em 30/55/70 monstros comuns, mais o Lobo Branco e três vagas
reservadas no segundo andar. A geografia persistida é composta por `awakenTower`.

Havia retorno automático de mortos em cada mapa e remoção imediata do jogador
ao desconectar. Esses comportamentos precisaram de exceções explícitas na arena.
O renderizador também pressupunha a presença de um portal em toda cena.

## Instâncias e isolamento

`server/arenas.js` gerencia prontidões e instâncias. Cada instância possui UUID,
tipo de encontro, origem, arena, Party de origem, participantes originais
congelados, datas, estado, mundo próprio, boss, projéteis e estado de concessão.
O contrato do encontro e os valores estão em `shared/guardian.js`; a composição
da sala está em `src/world/guardian-arena.js` e a IA em `server/oath-knight.js`.
O coordenador aceita definição, fábrica de mapa e fábrica de controlador como
parâmetros; nesta entrega registra apenas o Cavaleiro. Esse recorte permite
adicionar outro encontro sem copiar a coordenação de
prontidão, transferência, resultado e limpeza. Não foram criados bosses 6/9.

O limite global de 32 personagens conectados é aplicado somando mapas públicos
e privados; transferir jogadores para arenas não abre vagas além desse limite.
Substituir a conexão de uma mesma identidade não duplica a contagem.

O servidor determina a associação em `p.instanceId` e `p.mapId`. A sessão,
sequência e época precisam coincidir antes de processar comandos. O formato de
ID aceito pelo decodificador não autoriza acesso a um mundo. Movimento, colisão,
seleção, ataques, dano, IA, ondas e eventos usam exclusivamente a `SharedWorld`
da associação atual. Cada snapshot leva apenas entidades e eventos desse mundo.
A lista social global e o chat continuam sendo serviços sociais existentes;
eles não expõem posições nem permitem combate entre arenas. Não há curas ou
ressurreição novas. Loot, viagem e distribuição de atributos ficam bloqueados
no encontro; XP e desbloqueio são concedidos pelo resultado autoritativo.

## Entrada solo e coletiva

A porta fica na plataforma da fortaleza do terceiro andar. É necessário estar
vivo, conectado, na superfície correta e a até 3,5 unidades dela. Pressionar F
solicita prontidão; proximidade sozinha não inicia nada. Um jogador solo também
confirma no diálogo. Na Party, todos os membros precisam cumprir os requisitos
e confirmar em até 30 segundos. O servidor confere composição, presença,
superfície, distância e vida novamente na última confirmação.

Afastamento, morte, cancelamento, desconexão, alteração da composição e expiração
cancelam a prontidão. Membros distantes recebem a mensagem de reunir a Party.
Games e posições de todos são preparados antes da transferência, e o checkpoint
do grupo é gravado em transação antes de alterar sua associação. Uma falha nessa
preparação não transfere metade do grupo. Sequências/épocas e a remoção da
prontidão consumida tornam confirmações repetidas inofensivas.

Depois da entrada, sair da Party não muda os participantes originais. Não é
possível adicionar um convidado à batalha para receber a recompensa.

## Sala, transição e arte

O salão mantém as coordenadas e a altura de 6,4 da plataforma. A navegação da
plataforma pública é estendida sem sobrescrever a geografia persistida. Sua
base visual original e as quatro torres são preservadas; sala e instância usam
a mesma função de construção. Pilares, estandartes, marcas no piso, paredes e
porta monumental compõem a arena. A porta fecha em cerca de 1,6 segundo e o
combate começa após 2,5 segundos de preparação.

A mudança ocorre na mesma janela, processo cliente e servidor. A orientação
e o zoom da câmera são preservados. A cena é reconstruída usando os assets
já disponíveis; não foi implantado streaming ou um novo launcher. Paredes e
porta usam a oclusão existente para não encobrir o jogador. A arena não possui
portal público: o retorno é coordenado pelo resultado.

`public/assets/monsters/oath-knight-v060.svg` é arte vetorial original, com oito
quadros e quatro direções: armadura pesada, capa escura, espada de duas mãos,
visor luminoso e detalhes de desgaste. Não utiliza personagens ou imagens de
outros jogos. É uma primeira arte funcional; ainda pode receber refinamento
artístico. Sons locais sintetizados diferenciam preparo/impacto e transição de
fase, sem downloads ou bibliotecas adicionais.

## Combate e IA

Configuração-base: 1.500 HP, ataque físico 24, defesa física 7. Não há multiplicador
automático pelo tamanho da Party. Esses números são provisórios e centralizados.

| Habilidade | Preparação | Recuperação-base | Alcance / comportamento |
|---|---:|---:|---|
| Golpe de Espada | 0,85 s | 0,9 s | alcance 3,2, área frontal |
| Corte Arcano | 1,25 s | 1,1 s | onda linear a 9 unidades/s, até 22 unidades |
| Ruptura do Juramento | 1,8 s | 1,3 s | círculo de raio 6,5 |
| Investida Espectral | 1,3 s | 1,4 s | avanço real a 10 unidades/s, até 12 unidades |

A direção é congelada na preparação. Indicadores no piso comunicam a área; o
cliente não decide impactos. Onda e investida verificam segmentos percorridos,
paredes e vítimas já atingidas. Não são teleportes e não atingem uma vítima
repetidamente na mesma passagem. A ruptura não deforma o mapa permanentemente.

O boss escolhe alvos vivos da própria arena, navega com o sistema existente e
reavalia caminhos. Mortos deixam de ser candidatos. A sequência alterna espada,
onda, ruptura e investida; abaixo de 40% há uma transição de 1,5 segundo, energia
mais intensa, outra sequência e recuperações menores em parte dos golpes.
Não há cura, aumento de HP nem invulnerabilidade na troca de fase. A espada
continua sendo a base visual do combate.

## Estados, morte e resultados

O fluxo explícito é prontidão → preparing → combat → victory/defeat → closing
→ cleaned. Transições fora do contrato são rejeitadas. Após vitória ou derrota,
o grupo acompanha o resultado por oito segundos e retorna ao mundo público.
Um encontro também termina por abandono ou limite de quinze minutos.

Mortos permanecem na arena como espectadores e não podem mover-se, atacar,
viajar ou usar interações de combate. Não são removidos do conjunto original.
A vitória inclui vivos, mortos e desconectados originais. O golpe final não
muda a elegibilidade. Mortos retornam com HP zero ao ponto normal do andar e
seguem o respawn já existente; não são ressuscitados para receber progresso.
Uma derrota não concede desbloqueio ou XP e permite nova tentativa após respawn.

## Progressão e economia

O acesso 3→4 exige um registro individual de vitória no servidor. Ocultar um
botão não é a proteção. Depois da vitória, o portal existente funciona; os
andares 4–12 não são regenerados ou redesenhados. Uma Party mista pode repetir
para ajudar os membros que faltam. A primeira vitória concede 300 XP por pessoa,
seguindo nível e pontos de atributos existentes. Ajudantes não recebem esse XP
novamente. Não há item especial, moeda nova, recompensa por golpe final nem
farm repetível deste boss nesta versão.

A transação registra resultado, desbloqueios únicos e estados dos personagens.
Uma falha desfaz a concessão de todos; repetição de evento não duplica o prêmio.
A progressão independe da Party e sobrevive à morte, logout e reinício.

## Desconexão e reinício

A vaga é reservada por 45 segundos. O corpo permanece parado, vulnerável e
associado à arena; desconectar não pausa a IA nem evita dano. A reconexão breve
recupera o mesmo personagem e instância, sem outro boss. Depois do prazo, o
personagem retorna ao mundo público, mas permanece na lista original para
receber a conquista se os companheiros vencerem. Essa regra é intencional,
consistente com a participação original; não exige estar conectado no golpe final.

Quando ninguém vivo permanece com possibilidade de retomada, há derrota e
limpeza. Encerramento remove mundo, registro em memória, tokens, entidades e
projéteis. Resultados persistidos são histórico, não instâncias ativas.
Encontros em andamento não são retomados após reinício do servidor: o checkpoint
externo devolve o personagem à fortaleza, sem presumir vitória. Uma vitória já
confirmada na transação permanece válida mesmo se o servidor cair antes do retorno.

## Persistência e compatibilidade

Migração aditiva e idempotente: tabelas `guardian_unlocks(character, encounter,
result)` com chave composta e `arena_results(id, encounter, roster, outcome, at)`.
O esquema anterior de personagens, inventários, drops e Lobo Branco permanece.
Não há operação de exclusão de saves ou regravação destrutiva de mapas.

Personagens antigos que estavam além do terceiro andar sem a nova conquista
reaparecem no terceiro, preservando atributos, itens, nível, XP e maior andar
alcançado. Não se fabrica uma vitória retroativa. Após vencer, retomam o avanço.
A campanha local não recebe esse bloqueio nem bosses privados. O Lobo Branco
continua público, com as regras existentes de contribuição, baús e respawn.

## Testes, medições e evidências

Os resultados finais e caminhos de evidências são apresentados no anexo abaixo.
Testes usam diretórios, credenciais e perfis isolados. As gravações de teste não
foram incluídas em saves de jogadores. A observação de imagens foi feita pelo
assistente; não se afirma playtest humano nem validação em máquinas da escola.

As validações Electron usam dois processos reais e comandos do cliente. Algumas
condições são preparadas no servidor de teste: posição na porta, atributos do
personagem evoluído, escolha de habilidade para capturar o indicador, HP de
segunda fase e morte de um integrante. As vitórias capturadas são produzidas
por ataques do cliente, não por uma mensagem de vitória. Isso valida integração,
não substitui uma avaliação humana da dificuldade de uma run completa.

A navegação longa entre superfícies revelou um gargalo medido no ensaio misto:
a ligação do pé da escada ao terreno forçava uma busca local extensa, ignorando
o grafo de regiões. Três posições equivalentes levaram 494–623 ms antes e
34–50 ms depois de permitir a hierarquia existente nessa ligação. A perseguição
também passou a reutilizar a rota enquanto o alvo não muda de superfície nem
se desloca mais de 0,75 unidade; caminhos esgotados continuam sendo recalculados.
Colisão e movimento permanecem autoritativos. O agendador de 20 Hz não foi alterado.

O primeiro ensaio misto registrou 18,54 Hz, p99 de tick de 1.579 ms e 31/32 clientes
ainda online. Depois da correção, as mesmas condições sustentaram 20,01 Hz e
32/32 online. O contador de tráfego do ensaio inicial subtraía os sockets que
desconectavam e produziu um valor negativo inválido: ele foi corrigido para
acompanhar cumulativamente os sockets do ensaio. O valor negativo não é usado
como resultado de rede. A limpeza em lote também agrupa gravações por instância
para evitar um commit por participante na saída simultânea.

A primeira suíte executada em paralelo às validações teve 596/597 aprovados;
o ensaio escolar expirou esperando ataques. O mesmo arquivo passou isoladamente
(3/3), sem enfraquecer suas verificações. O anexo distingue essa execução da final.

A suíte final completa, sem benchmarks concorrentes e com concorrência de dois
arquivos, terminou com **606/606 testes aprovados**, zero falhas e zero testes
ignorados, em 322,51 segundos. Inclui 29 testes da Iteração 23. Evidência:
[log final da suíte](../.logs/iteration23-suite-final.txt).
O build de produção também passou (3,76 segundos):
[log final do build](../.logs/iteration23-build-final.txt).

Regressões reais corrigidas durante a integração: envio de snapshot para socket
nulo de um corpo desconectado; suposição de portal obrigatório no renderizador;
preservação da base visual da fortaleza ao expandir sua superfície; oclusão de
porta e paredes. O ensaio também corrigiu posições preparadas fora da arena e
passou a aguardar a época exata da transferência, em vez de apenas o nome do mapa.

## Limitações e próximos passos

- Balanceamento ainda provisório: não foi validado por seis jogadores humanos.
- A arena reutiliza reconstrução de cena; não existe cache integral da sala.
- Arte e áudio são originais e funcionais, ainda sujeitos a polimento.
- Testes em loopback e uma máquina não representam rede escolar, WAN ou 32 GPUs.
- A campanha e o personagem da Torre continuam separados.
- Desconectar por mais de 45 segundos abandona a presença física, mas preserva
  o direito original de vitória se a batalha continuar.
- Não há ressurreição, novo sistema de habilidades do jogador ou itens lendários.
- O público ainda depende da versão do servidor hospedado: nenhum deploy foi feito.

Recomenda-se um playtest humano de solo e Party de seis, avaliando leitura dos
indicadores, dificuldade, câmera e duração antes de ajustar os valores. Não foi
iniciada outra iteração, nem implementado conteúdo dos guardiões 6/9.

## Arquivos principais

Novos: `shared/guardian.js`, `server/arenas.js`, `server/oath-knight.js`,
`src/world/guardian-arena.js`, `src/adapters/rendering/guardian.js`,
`src/multiplayer/arena-ui.js`, atlas `oath-knight-v060.svg`,
`tests/iteration23.test.js`, scripts `iteration23-electron.mjs` e
`iteration23-load.mjs`.

Integrados: `server/online-tower.js`, `server/world.js`, `server/hub.js`,
`shared/online.js`, configuração de inimigos, cliente e modo multiplayer,
renderização da cena/combate/fortaleza, áudio, CSS e metadados de versão.
README e changelog foram atualizados. Alterações anteriores no checkout foram
preservadas. Não houve commit, publicação, deploy ou novo instalador.


## Anexo de resultados medidos

Ambiente: Windows x64, Node 24.19.0, Ryzen 5 6600H. Servidor e clientes
simulados compartilham um processo Node em loopback; CPU é porcentagem de um
núcleo e inclui o gerador de carga. Movimento a 15 Hz, ataques alternados, chat,
entrada coletiva e uma reconexão por cenário. Atributos/posições preparados
para manter a carga. O cenário de 32 tem quatro Parties de seis, quatro solos
e quatro personagens públicos. Não corresponde a 32 computadores físicos.

| Cenário | Jogadores | Arenas | Janela (s) | Hz | Tick p50/p95/p99 (ms) | CPU (%) | RSS (MiB) | Saída comprimida (KiB/s) | ACK p95 (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| solo | 1 | 1 | 20.0 | 19.99 | 0.75 / 1.68 / 5.32 | 4.5 | 60.2 | 9.1 | 109.0 |
| six-party | 6 | 1 | 20.0 | 20.00 | 1.92 / 4.85 / 8.05 | 8.5 | 73.9 | 105.0 | 108.4 |
| two-parties | 12 | 2 | 20.0 | 20.00 | 2.85 / 7.51 / 20.00 | 18.4 | 94.5 | 225.9 | 111.1 |
| 32-mixed-eight-arenas | 32 | 8 | 35.0 | 20.02 | 10.77 / 24.06 / 57.49 | 54.1 | 210.4 | 857.0 | 169.2 |

Todos os clientes permaneceram online nas linhas finais. No cenário final de 32:
intervalo entre ticks p50/p95/p99 = 47.12/62.75/77.06 ms;
ACK p99 = 328.42 ms. A IA por amostra de mundo teve
p95/p99 = 0.128/0.289 ms. Essa distribuição
é por mundo observado, incluindo amostras repetidas de mundos inativos; não é
o somatório de IA de um tick inteiro. O tempo total de tick é medido diretamente.

A criação somada das oito instâncias levou 58.02 ms e
a limpeza somada 89.19 ms. Restaram zero instâncias.
A limpeza não faz parte da janela de combate da tabela e pode gerar um atraso
pontual quando muitas arenas encerram juntas. O maior tick da janela foi
221.15 ms; ainda existem buscas pontuais de caminho
(playerNavigation máximo 202.97 ms). Portanto,
20 Hz médios não significa ausência de picos. Não foi feita uma promessa
de latência constante para computadores da escola.

A sequência de medição tem três momentos: antes da correção; repetição dos
quatro cenários após a correção de navegação; repetição apenas do cenário de 32
após agrupar as gravações de limpeza. Os dados completos estão no
[JSON de desempenho](ITERACAO-23-DESEMPENHO.json). As janelas são diagnósticas,
não um ensaio prolongado de 30 minutos.

### Electron final

Dois processos Electron reais (um na arena e outro público), GPU integrada
AMD via ANGLE/D3D11, janela CSS 1282×722, DPR 1,25, sombras habilitadas e
oclusão de janela controlada pelas mesmas opções do harness anterior.
Amostra final de aproximadamente 20 segundos em combate com boss ativo:

- 1326 intervalos; FPS médio **66.13**.
- Frametime p50/p95/p99: 13.80/25.80/38.30 ms.
- 1% low: 15.89 FPS, calculado como 1000 dividido pela média
  do 1% de intervalos mais lentos; máximo 146.20 ms.
- 76 draw calls e 1364 triângulos no quadro amostrado.
- 39 materiais, 2 referências de textura na cena,
  8 texturas e 39 geometrias informadas pelo renderer.

Não comparar esses números como ganho gráfico contra a cidade ou uma medição
com apenas um cliente. O 1% low e o máximo mostram travadas pontuais ainda
relevantes. Não se removeu sombra, população ou efeito para melhorar a métrica.

### Evidências de gameplay

A sequência com dois Electron comprovou visualmente: porta e preparação,
arenas independentes, indicadores das quatro habilidades, fase final, derrota
sem desbloqueio, vitória solo, mensagem de membro distante, prontidão coletiva,
morto como espectador e vitória concedida ao morto. O trecho final de portal
foi repetido isoladamente após corrigir a sincronização do harness e passou.

- [Prontidão da Party](../.logs/iteration23-electron-1792539215169/party-ready.png)
- [Membro morto recebe a vitória](../.logs/iteration23-electron-1792539215169/dead-member-victory.png)
- [Arena final e paredes com oclusão](../.logs/iteration23-electron-1792540222032/arena-benchmark.png)
- [Quarto andar após a vitória](../.logs/iteration23-electron-1792540222032/fourth-floor.png)
- [Relatório Electron final, sem erros](../.logs/iteration23-electron-1792540222032/report.json)

Party de seis e oito instâncias com 32 conexões foram comprovadas por domínio
e protocolo, não por seis ou 32 janelas Electron. Nenhuma validação humana é
atribuída ao ensaio automatizado.
