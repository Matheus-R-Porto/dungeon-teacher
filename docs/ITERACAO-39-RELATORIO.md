# Dungeon Teacher — Iteração 39: integração direta de artes originais

Entrega experimental D, com cobertura artística parcial. O precedente dos NPCs foi identificado no código e nos arquivos históricos antes da implementação. A integração usa desenhos inteiros na resolução de origem, com escala independente no mundo. Não substitui a distribuição oficial.

## Respostas diretas

- **O método dos NPCs foi identificado?** Sim. O ferreiro é um precedente comprovado de folha original incorporada sem redução; outros NPCs de cidade usam uma versão reduzida e reorganizada. Essa diferença foi documentada, sem generalização.
- **Foi reutilizado?** Sim: preservação da imagem, recorte por UV, pivô dos pés, material de sprite, escala de mundo e fonte de textura compartilhada. O controle de ações e o cache permanecem próprios dos jogadores. C já adotava o mesmo princípio; D não inventa uma arquitetura para renomeá-lo.
- **As fontes são melhores que as de C?** As fontes de caminhada e combate são as mesmas de C, inclusive a folha do Mago confirmada pelo usuário. A melhora nova está nas profissões do Mago masculino: 64 poses próprias completas, contra os atlas de profissão reduzidos de C. Não há alegação de ganho artístico em todas as ações.
- **Pesca e mineração foram integradas com quadros completos?** Sim, para o Mago masculino nas quatro direções. Corpo, mãos e ferramenta fazem parte de cada desenho. As outras 11 identidades mantêm as profissões anteriores. A galeria permite a avaliação estética.
- **O que ainda usa sprites anteriores?** Profissões das outras identidades; carrinho; repouso e caminhada armados; morte inteira; ataque desarmado inteiro; estados sem pose nativa compatível; ações de profissão iniciadas antes de terminar o carregamento. As transições restantes de C estão documentadas abaixo.
- **Qual o impacto no desempenho?** Na confirmação curta atual C/D, pesca ficou em 60.7/54.2 FPS e mineração em 60.0/51.0 FPS, com 30 atores simulados em profissão e dois clientes reais. O tempo de GPU aumentou de 9.34 para 11.28 ms na pesca e de 9.90 para 12.04 ms na mineração. Existe custo de apresentação relevante; não se recomenda adoção automática. As 216 janelas principais e as 24 suplementares estão documentadas nas seções 21–22 e nos registros vinculados. Elas descrevem esta máquina e esta coleta; não validam automaticamente computadores escolares.

## 1. Versão-base

Produção estável 0.6.14. D parte do experimento C e preserva a otimização de atlas/cache e de transformações estáticas. A, B e C continuam recuperáveis. Perfil local e nome do aplicativo D são distintos. Não houve publicação.

## 2. Histórico dos NPCs

A auditoria identificou a arte da cidade na Iteração 20 / 0.4.0 e o ferreiro na Iteração 22.1. A pesquisa incluiu relatórios, código de importação, arquivos gerados e recursos empacotados 0.5.0, 0.5.2 e 0.6.14. O documento inicial antecedeu a implementação; seu complemento de ASARs foi explicitamente marcado como posterior.

## 3. Código de renderização encontrado

`src/adapters/rendering/art.js` prepara os NPCs e suas vistas de textura. O material de sprite usa transparência, teste de alfa, profundidade e filtros nearest sem mipmaps. O ferreiro possui quatro poses ambientes; o sistema de NPCs não resolve sozinho as ações, direções, equipamentos e sincronização dos jogadores.

## 4. Funcionamento real dos NPCs

PNG e atlas preparados offline → textura compartilhada → recorte por UV → sprite com escala de mundo e referência dos pés. A imagem é apresentada sem reconstruir anatomia. A animação ambiente troca o recorte; não gera membros nem decide resultados de gameplay. Detalhes de escala, visibilidade, profundidade e liberação constam na auditoria histórica vinculada ao final.

## 5. Recursos originais dos NPCs

`townsfolk.png`: 1536 × 1024, correspondência com o PNG gerado. `townsfolk-v043.png`: 960 × 640, preparação reduzida/reorganizada; não é exemplo de preservação integral. `blacksmith-v051.png`: 2172 × 724, quatro poses e igualdade SHA-256 com a geração original. O ferreiro foi usado na comparação lado a lado no Electron.

## 6. Diferenças entre NPC e jogador

NPCs têm animação ambiente limitada. Jogadores precisam de quatro direções, ações autoritativas, aparência por identidade, ferramentas, máscaras de duas cores e carregamento seletivo. Reutilizou-se a apresentação da arte e o compartilhamento de textura; o controlador de animações existente foi mantido. Nenhuma regra funcional foi transferida para a imagem.

## 7. Fontes originais dos personagens

Foram inventariados 215 PNGs históricos gerados e examinadas cinco pranchas de contato. As fontes de classe selecionadas continuam em `artwork/iteration37/originals/*-main.png` e `*-actions.png`. O usuário confirmou `mage-masculine-actions.png`. A auditoria diferencia geração, adaptação, reconstrução, redução e atlas final. As oito folhas de profissão da 39 possuem PNGs e prompts preservados.

## 8. Comparação com B/C

Não foi localizada uma coleção histórica superior que fornecesse automaticamente os estados ausentes. Combate/caminhada não receberam nova fonte. O ganho de D concentra-se em arte de profissão dedicada, apresentação do nome, continuidade de fallback e compartilhamento correto da fonte de textura. A folha de combate não foi indevidamente recortada para fingir pesca ou mineração.

## 9. Arquitetura adotada

`OriginalSheet` continua usando os atlas compactos C. `NativeProfession` seleciona oito quadros por direção, conserva os quatro conjuntos direcionais da ação necessária e só usa o conjunto quando todos estiverem prontos. A ação iniciada fria conserva o fallback até acabar, evitando mudança de estilo no meio do gesto. Ao cancelar, trocar identidade ou descartar o ator, as referências são liberadas. `sharedTextureView` é utilizado por NPCs, originais e profissões; mudar UV não marca indevidamente a fonte comum para novo envio.

## 10. Resolução real

Oito fontes de 1536 × 1024. Cada uma contém oito poses. Os atlas possuem retângulos variáveis e margens de dois pixels, sem redução para células de 96/128. A preparação preserva exatamente os pixels visíveis e seus valores RGBA. RGB de fundo com alfa zero não é uma promessa de identidade byte a byte do canvas original. A escala no mapa é metadado, não redimensionamento destrutivo do recurso.

## 11. Cobertura por classe, corpo, direção e ação

Seis classes e dois corpos preservados. A matriz final contém 720 combinações de identidade, direção e ação. As novas profissões cobrem uma das 12 identidades, duas ações e quatro direções: 64 poses. As outras identidades continuam funcionais com suas fontes anteriores. Não se declara uma produção de 768 quadros novos.

## 12. Personagem de alta fidelidade no jogo

O Mago masculino foi capturado no Electron, no mesmo mapa/câmera/resolução de A/C, com repouso, caminhada em quatro direções, armas e conjuração. As capturas de poses verificam o desenho; os trechos de caminhada usam comandos normais. O ferreiro e o Mago aparecem juntos na escala real do mundo. A fonte grande não torna todos os detalhes perceptíveis à distância.

## 13. Pesca

32 desenhos integrais: oito por direção, cobrindo preparação, lançamento, espera, fisgada, recolhimento e finalização conforme os estados existentes. A ferramenta faz parte da arte. A linha continua sendo o efeito de jogo e parte da ponta marcada na vara; sua projeção usa o mesmo pivô, escala e orientação da imagem. Não foi alterada a probabilidade ou a recompensa.

## 14. Mineração

32 desenhos integrais: preparação, levantamento, golpe, impacto e recuperação. Pés e escala foram marcados independentemente da ponta da picareta, preservando o agachamento. A sequência frontal foi substituída durante a revisão porque um impacto invertia a orientação. A mineração continua decidida pelo servidor; a arte não concede minério.

## 15. Problemas artísticos encontrados

As passadas originais ainda têm alternância limitada. O repouso da mineração de costas mantém a ferramenta atrás do corpo e merece avaliação artística. Há diferenças de detalhe entre folhas antigas de combate e folhas novas. Algumas vistas são ligeiramente em três quartos. As poses de ataque originais têm poucas etapas e recuperações reaproveitadas. Nenhum desses limites foi apresentado como animação de produção integralmente aprovada.

## 16. Correções realizadas

Separação das silhuetas sem apagar tecido ou alfa suave; pivôs nos pés; escala constante durante cada sequência; pontas da vara alinhadas a pixels da ferramenta; revisão da mineração frontal; nome posicionado acima da altura do corpo em pé, sem seguir a altura da ferramenta; compartilhamento correto da fonte de textura. Morte e ataque desarmado conservam a ação inteira anterior, evitando a entrada isolada de uma pose original incompatível.

## 17. Continuidade

As novas ações utilizam desenhos completos e fallback por ação. O controlador mantém os tempos funcionais existentes. A galeria distingue sequência controlada de poses de gravação contínua com comandos reais. A captura contínua é 960 × 600, com cadência variável, a partir do jogo em 1280 × 800; não mede o FPS do jogo. Caminhadas e algumas transições de C ainda requerem arte futura.

## 18. Cores e equipamentos

Máscaras na resolução nativa preservam as cores primária/secundária e o sombreamento existente. Pele, couro e metal não recebem uma troca global de cor. Quatro famílias de armas, desarmado, mochila e carrinho foram inspecionados. Mochila mantém as regras existentes de acessório/oclusão; não foi redesenhada para cada roupa. Carrinho conserva o conjunto antigo. Armaduras mantêm ícones, atributos e identidade funcional, sem promessa de um sprite por peça.

## 19. Testes multiplayer

Dois clientes Aluno reais, recursos do ASAR e banco temporário, por TLS. As atividades usam o aplicativo ADM real; o roteiro de carga usa o servidor estável diretamente no processo de teste. Foram verificados início, fases, recuperação, cancelamento, observador remoto, reconexão, persistência e reinício do ADM. Recoil/morte possuem evidência própria com dois clientes, usando dano preparado e janela de recoil ampliada apenas na fixture de captura, fora das medições; isso não altera o pacote nem comprova a duração natural desses estados. O teste de mineração usa comandos normais; atrasos do driver foram registrados, corrigidos no teste e repetidos sem ampliar a janela do servidor.

## 20. Testes automatizados

A primeira suíte completa executou 993 testes: 991 passaram e dois testes existentes sensíveis a tempo falharam sob carga (logins concorrentes e fase de recuperação). A repetição serial direcionada passou em 17/17, incluindo ambos e as verificações novas. A contagem combinada alcança 994 testes distintos por incluir o teste posterior de etiqueta; não representa uma execução única de 994 sucessos.

Os novos testes verificam fallback da ação fria inteira, cancelamento/carregamento tardio, referências, direção, fonte de textura e posição do nome. A integridade dos 64 recortes e oito atlas/máscaras foi verificada separadamente. Há inspeção de quadros no renderizador e auditoria do pacote. Testes não equivalem a aprovação estética.

## 21. Benchmark comparativo

Mesma máquina, perfil balanced, escala 1, resolução interna 1280 × 800 e qualidade automática desativada. A instrumentação de diagnóstico permaneceu ativa em todos os modos. As novas medições usam A estável, C anterior e D atual. Uma primeira rodada A foi invalidada: a leitura síncrona de memória bloqueava o servidor do roteiro e uma reconexão removia a injeção de atores. O coletor passou a ser assíncrono, a injeção foi vinculada ao protótipo e ao método já envolvido pelo diagnóstico do renderizador remoto; uma pré-verificação confirmou a carga real antes da repetição. Cada janela passou a exigir a contagem exata de atores. A rodada inteira foi repetida e os registros inválidos foram preservados fora da comparação. Não são reutilizados os números históricos 86,6/79,6 FPS do prompt. A/C foram medidos em 2 de novembro de 2026; a rodada incompleta de D foi repetida na retomada de 8 de novembro, com os mesmos pacotes, máquina, roteiro e configurações. A diferença de data e de carga do sistema limita inferências causais; os números são uma comparação descritiva, não uma garantia de ganho de desempenho. A/C da galeria de poses são capturas históricas verificadas; isso é independente das medições novas.

Dois clientes reais por rodada. Cenários de 8/16/24/32 atores incluem atores visuais simulados, não esse número de computadores/conexões. A carga de profissões usa 30 Magos masculinos simulados e dois clientes reais; não prevê a memória de 12 identidades com artes novas. A sessão prolongada mantém 32 atores por cinco minutos. CPU profiles e traces foram coletados fora das janelas principais. Gravações também ocorreram fora das janelas.

### I-simulated-32

| Variante | FPS médio | p95 ms | p99 ms | Privada MiB / cliente |
|---|---:|---:|---:|---:|
| A | 61.2 | 22.1 | 26.1 | 800.8 |
| C | 65.8 | 20.8 | 26.0 | 1148.2 |
| D | 69.4 | 18.7 | 22.0 | 1149.5 |

### K-profession-32-fishing

| Variante | FPS médio | p95 ms | p99 ms | Privada MiB / cliente |
|---|---:|---:|---:|---:|
| A | 64.1 | 20.8 | 25.6 | 742.6 |
| C | 68.1 | 18.6 | 21.3 | 958.1 |
| D | 53.8 | 24.1 | 28.2 | 1008.6 |

### K-profession-32-mining

| Variante | FPS médio | p95 ms | p99 ms | Privada MiB / cliente |
|---|---:|---:|---:|---:|
| A | 66.4 | 19.9 | 23.4 | 743.7 |
| C | 72.7 | 17.5 | 19.4 | 957.5 |
| D | 50.4 | 26.1 | 30.2 | 1012.6 |

### Leitura dos resultados

- I-simulated-32: D teve +13.5% de FPS frente a A e +5.5% frente a C. Memória privada: +348.6 MiB frente a A e +1.3 MiB frente a C, por cliente.
- K-profession-32-fishing: D teve -16.1% de FPS frente a A e -21.1% frente a C. Memória privada: +266.0 MiB frente a A e +50.5 MiB frente a C, por cliente.
- K-profession-32-mining: D teve -24.0% de FPS frente a A e -30.6% frente a C. Memória privada: +268.9 MiB frente a A e +55.2 MiB frente a C, por cliente.

Essas diferenças são observações desta coleta sequencial e não isolam perfeitamente o efeito da arte de variações do sistema. Quedas ou picos relevantes estão preservados nos dados brutos; não justificam substituir automaticamente a distribuição escolar. A queda recente das profissões frente a C é relevante: o complemento de confirmação C/D documenta uma medição curta no mesmo dia, a variação entre coletas e a investigação do custo de renderização.

### Sessão prolongada — 32 atores

| Variante | Privada inicial MiB | Privada final MiB | Variação MiB | Heap inicial/final MiB |
|---|---:|---:|---:|---:|
| A | 802.0 | 811.9 | +9.9 | 32.2 / 31.2 |
| C | 1144.1 | 1154.2 | +10.1 | 27.4 / 23.1 |
| D | 1151.7 | 1153.1 | +1.4 | 32.3 / 16.4 |

Comparação entre a primeira e a última janela, média dos dois clientes; cinco minutos de exposição. Crescimento nesse intervalo não prova sozinho vazamento, e uma queda não prova ausência de vazamentos em sessões mais longas. Os recursos após descarregar os atores estão no campo `afterSimUnload` dos registros brutos.

## 22. CPU e memória

CPU reportada é duração de tarefas do renderizador relativa à janela, não porcentagem agregada de todos os núcleos/processos. Memória privada e working set somam a árvore de cada cliente. GPU, quando disponível, é duração de desenho, não utilização percentual. Estimativas RGBA não representam toda a VRAM do driver. Percentis da tabela são médias dos percentis por janela; o CSV preserva cada janela.

O adaptador WebGL observado é AMD integrado via ANGLE. O computador possui cerca de 7,24 GiB de RAM utilizável e executa outros aplicativos do usuário. A RAM livre antes de cada rodada consta em `benchmark-executions.json`; condições de memória e carga do sistema podem variar ao longo da coleta. Não foram encerrados aplicativos alheios ao teste. A execução sequencial reduz competição entre variantes, mas não transforma o resultado em benchmark de laboratório. A coleta prolongada e os registros brutos devem orientar a avaliação, sem promessa de FPS em toda escola.

As quatro direções novas de pesca representam aproximadamente 55,24 MiB RGBA de cor + máscara; mineração, 53,66 MiB. Recursos são compartilhados entre atores. O limite de 64 MiB aplica-se ao cache **ocioso**, junto do limite de oito entradas; recursos ativos ou pendentes podem ultrapassá-lo. Essa distinção impede apresentar o limite como teto global de memória.

## 23. Otimizações

Atlas compactos sem perda, aquisição seletiva por identidade/ação, cache ocioso limitado em bytes, liberação de referências, fontes compartilhadas e transformações estáticas da cidade herdadas de C. Não se reintroduziu o agrupamento espacial exterior descartado. Não há composição anatômica por quadro nem textura nova a cada atualização de animação.

## 24. Galeria

Fonte → atlas/máscara → Electron; A/C/D; quatro direções; profissões com comandos reais; caminhada; NPC ao lado; cores; mochila/carrinho; métricas. Os GIFs são visualizações de inspeção, enquanto o APNG preserva mais cores. As fontes e o jogo não foram reduzidos para produzir esses derivados de galeria.

## 25. Arquivos alterados e preservação

Foram verificados 5467 arquivos estáveis e 10 recursos/pacotes de distribuição, sem alterações. A comparação de `src/core`, `src/domain`, `server` e `shared` com a base não encontrou mudança funcional. `sources/` e dados oficiais não foram alterados.

## 26. Executáveis experimentais

`Dungeon Teacher Native D.exe`, base 0.6.14, perfil local `Dungeon Teacher Native D`. O executável final foi aberto diretamente e a tela de conexão/WebGL foi verificada; as sessões funcionais usam os recursos empacotados com o runtime Electron. O ZIP contém a pasta completa e tem CRC e SHA-256 verificados. O ADM existente é reutilizado. Para voltar à produção, feche D e abra o Aluno estável.

## 27. Pendências

Produzir e aprovar pesca/mineração das outras 11 identidades; melhorar alternância de passadas e transições com poucas poses; completar carrinho, repouso/caminhada armada, morte e ataque desarmado com fontes dedicadas; avaliar visualmente a mineração de costas e diferenças de perspectiva. Fazer avaliação posterior em máquinas escolares representativas antes da adoção. A aprovação artística pertence ao usuário.

## 28. Recomendação para adoção

Manter D como avaliação experimental. A integração técnica está disponível sem substituir a distribuição estável, mas a coleção artística permanece parcial. Comparar as animações na escala normal do mapa e aprovar o Mago antes de replicar o processo para as demais classes/corpos. A expansão deve repetir os limites de memória e as medições com identidades diversas; não extrapolar a carga compartilhada de um único Mago para todas as artes futuras.

## Evidências e arquivos

Registros de tentativas, benchmarks, auditorias e capturas desta iteração ficaram em `work/iteration39-native-art/` (local, fora do controle de versão). A síntese seleciona a última execução bem-sucedida de cada roteiro, sem escolher a variante ou janela mais rápida. Falhas do driver de captura e sincronização foram preservadas, sem ocultá-las como sucesso.
