# Dungeon Master — plano técnico da Beta 0.1.0

Plano de execução • 24/09/2026 • Estado: proposta, sem implementação do jogo.

**Recomendação central:** construir um jogo single-player de navegador, com HTML/CSS para a interface, JavaScript modular para a simulação e Three.js para uma cena 3D simples vista por câmera ortográfica. Validar primeiro movimento, câmera e navegação; depois fechar um ciclo de um andar antes de ampliar conteúdo até o Boss.

A especificação original é a fonte de verdade de produto. Sua cópia integral está em `ESPECIFICACAO-ORIGINAL-BETA-0.1.0.txt`. Este plano não substitui nem altera seus requisitos. O diretório do projeto contém apenas instruções; não há implementação existente a preservar ou integrar.

## 1. Contrato de escopo

Neste documento, **obrigatório** significa exigência da especificação; **proposta** significa escolha técnica ou de produto ainda não aprovada; **hipótese** significa valor inicial que precisa de teste. Números abaixo não são balanceamento definitivo.

| Obrigatório na Beta | Decisão de implementação proposta | Sugestão ou hipótese ajustável |
|---|---|---|
| Desktop/notebook; HTML, CSS e JavaScript; visão isométrica/2.5D | Navegador por servidor local durante desenvolvimento; aplicação estática na distribuição | Chrome/Edge e Firefox como matriz inicial, versões registradas nos testes |
| WASD e point-and-click; estrutura para câmera rotacionável | Plano lógico X/Z, câmera ortográfica e quatro orientações de 90° | Transição visual curta; rotação contínua fica para avaliação |
| Hub persistente e compacto, com portal em destaque | Uma cena fixa e painéis associados a serviços/NPCs | Clareira de pedra, portal de raízes e luz âmbar como direção própria |
| Novato; missão curta no Hub; cinco classes permanentes | Progressão inicial seguida de prova guiada de classe no Hub | Liberar a prova no nível 2; escolha final após confirmação explícita |
| Até oito habilidades equipadas; sem dash universal | Oito posições; três habilidades por classe na Beta e uma do Novato | Desbloqueios graduais; somente Assassino recebe deslocamento especial |
| Auto-attack, fila de habilidade, aggro múltiplo e attack speed | Máquina de estados de ações, aquisição de alvo e movimento automático | Fila de uma habilidade, substituível pela última solicitação |
| STR/AGI/VIT/INT/DEX/LUK; progressão entre runs | XP pendente consolidada no Hub; fórmulas centralizadas | Manter XP também na morte; redistribuição gratuita no Hub para testar builds |
| Armas e oito slots totais de equipamento; cinco raridades | Definições de item separadas das instâncias obtidas | Um afixo simples a partir de Raro, sem sistema avançado de builds |
| Inventário limitado e confortável; armazém alugável; uma moeda | Capacidade por pilhas/slots, equipamentos e baús individuais | 36 slots iniciais; armazém com 120 slots, aluguel por expedição |
| Consumíveis com cooldown por tipo; morte preserva drops e baús | Famílias de cooldown independentes e transação de retorno | Perda de 10% das moedas na morte, configurável |
| Floresta, andares 1–5, Boss no 5; geração única e persistente | Grafo de clareiras, corredores e módulos; salvar layout materializado | Meta de aproximadamente oito minutos em primeira exploração normal |
| Pesca, Mineração e Coleta, cada uma com XP, nível e ferramenta | Nós de recurso, ação temporizada e progressão própria | Dois graus de ferramentas e recompensas vendáveis no Hub |
| Baús fechados abertos no Hub por questões JSON; erro não remove prêmio | Sessão persistente de três questões e rolagem ponderada | Feedback com explicação; banco inicial revisado de 30 questões |
| Save local versionado; geometria separada do estado dinâmico | IndexedDB transacional, snapshots, exportação/importação | Pedido de armazenamento persistente quando disponível |

Fora de escopo: multiplayer, party, servidor, herança entre jogadores, PvP/apostas, trocas, andares 6–50, caverna/minas, checkpoint 20, crafting, forja, caça, evoluções avançadas, analytics educacional e dashboard docente. Não criar serviços vazios para esses sistemas.

## 2. Ambiguidades, tensões e riscos

Não há uma contradição que impeça a Beta. Há requisitos cuja interpretação precisa ser registrada antes do marco afetado.

| Questão | Risco concreto | Encaminhamento proposto |
|---|---|---|
| “2.5D” e câmera rotacionável | Rotacionar uma imagem 2D não revela outro lado do ambiente | Usar geometria simples e câmera orbital ortográfica; começar com quatro ângulos. Se a intenção for 360° livre já na Beta, confirmar antes do Marco 1 |
| Aproximadamente 8 minutos × quatro andares normais | Uma tentativa completa pode ultrapassar 32 minutos mais Boss e Hub | Medir primeiras visitas; prever retomada local da run. Não preencher o mapa com caminhadas vazias nem temporizadores |
| Piso “descoberto” ao entrar × “conquistado” ao concluir | Confundir persistência com desbloqueio pode sobrescrever mapas | Descoberto = layout salvo antes de entrar; conquistado = saída validada. Registrar ambos |
| Layout permanente × mudanças no gerador | A mesma seed pode produzir outro mapa após atualização | Salvar geometria, versão do gerador e hash; não depender apenas da seed |
| Respawn × exploração contínua | Respawn rápido pode punir coleta ou gerar encontros inevitáveis | Repor criaturas/recursos só em nova expedição; reentrada na mesma expedição conserva estado |
| Término de andar não definido | Exigir matar tudo contradiz liberdade de exploração | Proposta: alcançar a saída e vencer seu encontro guardião; restante opcional. Boss substitui esse encontro no andar 5 |
| Retornar voluntariamente apenas ao concluir | Saída emergencial pode eliminar risco; ausência de retomada pode prender o jogador | Oferecer retorno nos pontos previstos; salvar saída do aplicativo. Não adicionar teleporte livre silenciosamente |
| XP na morte não especificada | Perda adicional pode contrariar a progressão confortável pretendida | Propor preservação total de XP; apenas moedas sofrem a penalidade prevista |
| Classe permanente × teste de builds | Testar cinco classes pode exigir repetição excessiva | Atributos redistribuíveis no Hub; perfis separados para classes, sem trocar classe do mesmo personagem |
| Ataque em andamento × movimento manual | Concluir ações longas pode tornar WASD pouco responsivo | Janela curta de compromisso até o impacto; movimento cancela perseguição e futuros ataques. Testar antes de aumentar durações |
| Suporte em single-player | Sacerdote pode ficar lento ou depender de aliados inexistentes | Ataque sagrado ofensivo, cura e buff próprio; validar tempo e custo de encontros solo |
| Matemática sem faixa escolar definida | Perguntas podem frustrar ou não ensinar | Definir público antes do Marco 7; até lá usar exemplos claramente marcados como provisórios |
| Inventário cheio × recompensa garantida | Baú pode consumir-se sem entregar item | Troca atômica: baú sai e item entra no mesmo slot; se houver vários prêmios, mantê-los em resgate pendente persistente |
| Aluguel do armazém sem prazo definido | Expiração pode apagar ou bloquear bens | Cobrar por expedição para novos depósitos; retirada sempre permitida; nunca apagar conteúdo |
| Save local “confiável” | Navegador pode remover dados; usuário pode limpar armazenamento | Transações, migração, backup e exportação. Não prometer imunidade a limpeza do navegador |

Toda mudança nessas propostas que altere regra do produto deve ser sinalizada antes da implementação correspondente.

## 3. Alternativas técnicas e escolha recomendada

### Renderização

| Alternativa | Vantagens | Custos e limites | Adequação |
|---|---|---|---|
| Canvas 2D próprio com projeção isométrica | Dependência pequena; controle direto; bom para placeholders | Ordenação de profundidade, seleção e mudanças de ângulo exigem trabalho próprio; sprites precisam de direções | Boa se a câmera for essencialmente fixa |
| Phaser com mundo 2D | Estrutura de cenas, entrada e recursos de jogo já disponíveis | Rotação de câmera 2D não resolve visão orbital de um cenário; rotação isométrica do mundo continua sendo trabalho específico | Boa se sprites e câmera fixa forem prioridade |
| Three.js com geometria simples | Profundidade, câmera orbital e seleção espacial compatíveis com o requisito | É biblioteca de renderização: combate, cenas de jogo, colisão e navegação continuam sob nossa responsabilidade; exige GPU compatível | **Recomendação para esta especificação** |

A documentação confirma a projeção sem redução de tamanho pela distância na [OrthographicCamera do Three.js](https://threejs.org/docs/pages/OrthographicCamera.html). As câmeras descritas pelo [Phaser](https://docs.phaser.io/phaser/concepts/cameras) operam sobre a apresentação da cena 2D. A preferência por Three.js é uma avaliação de arquitetura deste plano, não uma exigência dessas bibliotecas.

### Demais escolhas

| Área | Alternativas e trade-off | Proposta |
|---|---|---|
| Linguagem | JavaScript atende à tecnologia pedida; TypeScript acrescentaria compilação e checagem estática | JavaScript ES Modules com JSDoc e validação de dados; não mudar linguagem sem necessidade |
| Ferramentas de desenvolvimento | Servidor simples tem menos dependências; empacotador facilita imports, assets e build | Vite como ferramenta de desenvolvimento/build, com versão compatível fixada na implementação |
| Interface | Framework pode ajudar em telas grandes, mas acrescenta outro ciclo de estado | HTML/CSS e componentes DOM pequenos; atualizar por eventos/snapshots, sem redesenhar toda a UI a cada frame |
| Navegação | Navmesh é adequado para terreno livre complexo; grade é mais simples e combina com geração modular | A* em grade navegável, movimento contínuo e colisão circular |
| Persistência | localStorage é simples, porém síncrono; IndexedDB oferece armazenamento estruturado e transações | IndexedDB por adapter; localStorage, se usado, apenas para preferências pequenas |
| Arquitetura de entidades | ECS completo pode ajudar em escala, mas aumenta infraestrutura inicial | Entidades de dados e sistemas explícitos; adiar adoção de framework ECS |
| Colisão | Motor físico completo facilita dinâmica, mas não é necessário para esta locomoção | Grade estática, círculos e testes de segmento/projétil; sem física de corpos rígidos |
| Empacotamento desktop | Electron/Tauri podem distribuir executável, mas aumentam escopo de instalação e testes | Navegador primeiro; instalador não é requisito da Beta |

Fixar versões e lockfile no início do desenvolvimento. Não usar importação remota de dependências em runtime. O build deve conter seus próprios assets e dependências.

## 4. Arquitetura e limites de responsabilidade

Fluxo: **teclado/mouse/UI → comandos → aplicação → simulação/domínio → eventos e estado → renderização/UI/áudio**. Persistência recebe snapshots e operações críticas pela camada de aplicação.

Regras de combate, progressão, loot e educação não importam DOM, Three.js nem IndexedDB. O renderizador nunca concede XP ou decide um acerto. Uma animação reflete a ação já calculada, sem determinar dano pelo fim de um efeito visual.

```text
dungeon-master/
  index.html
  package.json
  public/assets/              modelos simples, texturas, sons próprios/licenciados
  src/
    main.js                   composição das dependências e inicialização
    app/                      GameSession, comandos, transições Hub/Torre/quiz
    core/                     relógio, IDs, RNG injetável, eventos, validação
    domain/
      character/              atributos, XP, classes, equipamento
      combat/                 ações, dano, habilidade, cooldown, status
      inventory/              pilhas, capacidade, transferências e consumíveis
      rewards/                loot, baús, probabilidades, concessão única
      education/              seleção, resposta e progresso da sessão
      economy/                preços, compra, venda, aluguel, morte
      professions/            ferramentas, extração, XP e nível próprios
    simulation/
      world.js                estado dinâmico e atualização por tick
      movement.js             locomoção e colisão
      ai.js                   percepção, perseguição, retorno e Boss
      spatial-index.js         vizinhança, colisões e aquisição de alvos
    world/
      generation/             grafo, módulos, montagem e validação
      navigation/             A*, acessibilidade, suavização do caminho
      floors/                 layouts, descoberta, conquista e instâncias
    adapters/
      input/                  teclado/mouse → comandos
      rendering/              Three.js, câmera, seleção, efeitos e ocultação
      persistence/            IndexedDB, snapshots, migração, import/export
      audio/                  reprodução de feedback e controles de volume
    ui/                       HUD, painéis, diálogos, mensagens e CSS
    data/                     JSON de conteúdo e configuração de equilíbrio
  tests/
    unit/                     invariantes e fórmulas
    integration/              fluxos entre sistemas e persistência
    browser/                  smoke tests no navegador
    fixtures/                 saves e seeds reproduzíveis
  docs/                       fonte de verdade, plano, decisões e testes
```

Os diretórios são um destino organizacional, não uma ordem para criar dezenas de arquivos vazios. Cada módulo surge junto ao primeiro uso verificável.

Atualização proposta: simulação a 30 ticks/s, renderização por requestAnimationFrame com interpolação. Limitar recuperação de atraso a cinco ticks por frame; pausar single-player ao ocultar a aba, sem simular minutos de dano na volta. Tempos de gameplay usam o relógio da simulação. Renderizar a 144 Hz não acelera ataques nem regeneração.

Comandos principais: MoveDirection, MoveTo, SelectTarget, CancelAction, UseSkill, UseConsumable, Interact, EquipItem, AllocateStat, TransferItem, EnterFloor, LeaveFloor e SubmitAnswer. Eventos incluem AttackResolved, EnemyDefeated, ItemGranted, FloorDiscovered, FloorCleared e ChestResolved. Começar com funções e uma fila simples, sem construir um framework genérico.

## 5. Modelos de dados principais

IDs são estáveis e serializáveis. Definições JSON são conteúdo; instâncias representam o que pertence ao personagem. Não salvar classes JavaScript, meshes, referências de DOM ou funções.

| Modelo | Campos essenciais e invariantes |
|---|---|
| SaveEnvelope | saveVersion = "0.1.0", schemaVersion, contentVersion, revision, createdAt, updatedAt, profileId, checksum, snapshot; checksum detecta corrupção, não trapaça |
| Character | id, name, classId = novice, classChosenAt, level, xp, unspentStatPoints, allocatedStats, currency, equipment, professionProgress, classQuestState; classe final não muda |
| ItemDefinition | id, kind, slot, allowedClasses, stackLimit, baseModifiers, tags, price, effectId; inclui consumíveis, ferramentas e recursos |
| ItemInstance | instanceId, definitionId, rarity, quantity, rolledModifiers, affixes; equipamento ocupa um slot e quantidade 1 |
| Inventory | ownerId, capacity, entries; transferências conservam quantidade; rejeitar antes de exceder capacidade |
| Storage | entries, capacity, paidExpeditionId; bens persistem mesmo sem aluguel ativo |
| SkillDefinition | id, classId, cost, cooldown, range, targetMode, windup, recovery, effectId, coefficients, tags; executores permitidos, sem eval de JSON |
| EnemyDefinition | id, stats, perceptionRadius, leashRadius, attackProfile, lootTableId, xp, aiProfile; Boss usa padrões configurados |
| ProfessionProgress | professionId, level, xp; requisitos e taxas de ferramentas definidos em dados |
| FloorLayout | layoutId, ownerCharacterId, floorNumber, seed, generatorVersion, biomeId, rooms, connections, collisionGrid, spawnAnchors, resourceAnchors, entry, exit, contentHash; imutável após descoberta |
| FloorProgress | characterId, layoutId, discoveredAt, clearedAt, explorationMask; não confundir descoberta de layout com revelação visual |
| FloorInstance | expeditionId, layoutId, instanceSeed, enemies, resources, groundDrops, exitState, triggers; estado mutável independente da geometria |
| RunState | expeditionId, currentFloor, position, hp, mp, pendingXp, activeEffects, cooldowns, randomStates, visitedInstances; permite retomar uma run |
| ChestInstance | instanceId, tableId, source, status, sessionId; status: sealed → answering → resolved, sem conceder duas vezes |
| Question | id, prompt, type, choices quando aplicável, correctAnswer, difficulty, topic, explanation, curriculumTag; resposta numérica com política explícita de equivalência |
| ChestSession | id, chestId, questionIds, currentIndex, submittedAnswers, correctCount, rngState, resolvedReward; resultado preservado em retomadas |
| Settings | volume, effectsQuality, cameraOrientation, UI scale, bindings; somente opções realmente implementadas |

Exemplo de questão (não representa currículo validado):

```json
{
  "id": "arithmetic-add-001",
  "prompt": "Quanto é 18 + 27?",
  "type": "multipleChoice",
  "choices": [
    { "id": "a", "text": "35" },
    { "id": "b", "text": "45" },
    { "id": "c", "text": "46" }
  ],
  "correctAnswer": "b",
  "difficulty": 1,
  "topic": "addition",
  "explanation": "18 + 20 = 38; 38 + 7 = 45."
}
```

Validar ao carregar: IDs duplicados, referências ausentes, raridades inválidas, custos negativos, slots incompatíveis e questões sem resposta válida. Uma falha deve identificar arquivo/ID no diagnóstico e mostrar mensagem compreensível ao jogador.

## 6. Mundo, câmera, navegação e geração

### Coordenadas e leitura visual

Gameplay em X/Z; altura Y serve inicialmente à apresentação. Sem múltiplos pisos sobrepostos ou saltos, que exigiriam outra navegação. Câmera com azimute inicial de 45° e elevação próxima de 35,3°, mantendo projeção ortográfica. Q/E muda a orientação; zoom limitado não altera alcance de combate.

WASD usa direções relativas à câmera projetadas no chão e normalizadas, sem vantagem diagonal. Clique usa seleção espacial e conversão para posição no mundo. Prioridade: interface → alvo/interativo → terreno. Clicar em inimigo não pode também mandar andar para trás dele. Clique em solo e Escape cancelam alvo automático; WASD cancela caminho e perseguição. Revalidar intenções na troca de cena.

Personagens e árvores começam como meshes de baixa complexidade. Elementos entre câmera e personagem tornam-se translúcidos ou reduzidos; contorno e marcadores mantêm inimigos/recursos legíveis. Indicadores de perigo são desenhados no chão e acompanham o mundo, não a tela. HUD permanece horizontal. Usar formas/ícones além de cores.

### Pathfinding e colisão

Grade inicial com células de 1 unidade e oito vizinhos; diagonal proibida se atravessar canto bloqueado. Expandir obstáculos pelo raio do personagem. A* com heurística octil; suavização apenas quando o segmento completo estiver livre. Personagem caminha continuamente entre pontos.

Destino de ataque é uma posição caminhável dentro do alcance e com linha de visão, não o centro do inimigo. Se não houver rota, avisar e cancelar perseguição impossível. Recalcular por mudança relevante do alvo ou bloqueio, com orçamento por tick; não executar A* para todos em cada frame. Inimigos usam vizinhança espacial e separação local. Nenhum teto arbitrário de dois ou três inimigos em aggro.

### Geração procedural persistente

1. Na primeira entrada, reservar layoutId e seed independentes de loot/combate.
2. Construir grafo conectado: caminho principal entrada–saída e ramificações opcionais.
3. Distribuir clareiras/módulos sem sobreposição inválida; conectar por corredores naturais.
4. Rasterizar navegação; colocar obstáculos sem cortar ligações obrigatórias.
5. Posicionar encontros e recursos por orçamento e distância de segurança da entrada.
6. Incluir pontos opcionais de baú/segredo, pesca, mineração e coleta nos andares apropriados.
7. Validar acessibilidade, saída, interações, área de combate e espaço para o guardião/Boss.
8. Se falhar, tentar no máximo dez variações determinísticas; usar mapa de fallback validado e registrar diagnóstico.
9. Salvar layout materializado e descoberta antes de permitir a entrada jogável.
10. Nas próximas visitas, carregar esse layout, sem chamar o gerador de novo.

Andares 1–4: 6–10 clareiras como hipótese inicial, ajustadas por tempo de travessia e encontros. Progressão ambiental: borda luminosa → mata fechada → ruínas tomadas por árvores → raízes densas e perigo elevado. No 5, abordagem procedural conectada a um módulo de arena validado. Isso preserva geração por módulos sem arriscar uma arena impraticável.

Separar RNG de geração, combate e recompensas. Atualizar um loot table não pode mudar a floresta. Estado dinâmico reaparece no início de nova expedição; salvar instâncias visitadas evita restaurar recursos ao recarregar a aba. O primeiro marco de torre não depende de timers de respawn.

## 7. Combate e progressão: contratos mínimos

### Ações e aggro

Estados do jogador: Idle, Moving, ApproachingTarget, BasicWindup, BasicRecovery, Casting, Channeling, Dead. Selecionar inimigo inicia aproximação e auto-attack. Validar distância, visão e existência do alvo no início e no impacto. Um golpe não atravessa uma parede porque o alvo estava visível antes.

Durante ataque básico, UseSkill registra uma intenção: terminar a ação atual, revalidar alvo/custo/alcance, executar a habilidade, retomar auto-attack se o alvo permanecer válido. Custo e cooldown só são consumidos na execução validada. Alvo morto cancela habilidade dirigida sem gastar recurso; habilidades de área/próprias seguem seu targetMode. Fila proposta de uma posição com indicador visual. Movimento manual interrompe a sequência futura, respeitando apenas a breve janela de impacto já comprometida; essa sensação deve ser testada no Marco 2.

IA: Idle/Patrol → Alert → Pursue → Attack → Return ou Dead. Percepção por distância e linha de visão; retorno por distância ao território com histerese para evitar alternância rápida. Reação ao dano pode iniciar aggro. Não introduzir limite baixo de perseguidores; controlar custo computacional pela frequência de percepção e índice espacial.

### Fórmulas iniciais propostas

Centralizar coeficientes em `data/balance.json`; calcular atributos derivados em uma função testável. Aplicar atributos base + distribuídos + equipamento + buffs antes das fórmulas. Limites impedem divisão por zero e velocidades impraticáveis.

| Resultado | Hipótese inicial |
|---|---|
| HP máximo | 100 + 12 × VIT + 8 × (nível − 1) + bônus de HP |
| MP máximo | 40 + 8 × INT + 3 × (nível − 1) + bônus de MP |
| Ataque físico | arma + 2 × STR + 0,5 × DEX; Arqueiro usa coeficientes próprios priorizando DEX |
| Ataque mágico | foco da arma + 2,5 × INT |
| Defesa | armadura + 0,8 × VIT; resistência mágica tem coeficientes próprios |
| Dano após defesa | máximo(1, dano bruto × 100 / (100 + defesa efetiva)) |
| Intervalo básico | máximo(0,25 s, intervalo da arma / (1 + 0,015 × AGI + bônus de velocidade)) |
| Precisão e esquiva | acerto = clamp(0,75 + 0,005 × DEX atacante − 0,003 × AGI defensor, 0,55, 0,98) |
| Crítico | clamp(0,03 + 0,002 × LUK, 0,03, 0,25); multiplicador inicial 1,5 |
| Capacidade | 36 + piso(STR / 5) slots; cada pilha respeita stackLimit |
| Próximo nível | arredondar(100 × nível^1,4) XP; três pontos de atributo por nível |

Attack speed reduz intervalo do básico, sem reduzir automaticamente cooldowns de habilidade. Janela de impacto deve caber no intervalo, por exemplo 35% dele; animações interpolam esse evento. Stagger é efeito explícito com duração e resistência próprias, nunca consequência universal de acertar rápido.

XP fica visível como pendente durante a run, sendo consolidada uma vez no retorno, voluntário ou por morte conforme a proposta. Subidas múltiplas de nível devem ser processadas. Equipamentos modificam os resultados imediatamente; alocação e respec ficam no Hub. HP e MP são restaurados no Hub.

### Conteúdo mínimo por classe

| Classe | Básico e três habilidades propostas | Diferença verificável |
|---|---|---|
| Novato | Golpe curto + Fôlego para recuperação modesta | Completar a introdução antes de escolher classe |
| Guerreiro | Arma curta; Corte Circular, Guarda de Ferro, Golpe de Ruptura | Sustentação e área corpo a corpo; sem dash |
| Arqueiro | Flecha; Disparo Preciso, Flecha Perfurante, Armadilha de Cipós | Alcance, linha de tiro e controle de aproximação |
| Feiticeiro | Projétil arcano; Brasa Circular, Geada, Barreira Arcana | Área e controle com pressão de MP |
| Assassino | Lâminas rápidas; Passo Sombrio, Golpe Exposto, Veneno | Mobilidade exclusiva e explosão de dano; deslocamento respeita colisão |
| Sacerdote | Projétil sagrado; Cura, Selo Radiante, Bênção | Dano solo, cura e buff próprio |

Cada habilidade deve ter custo, cooldown, alcance, duração, alvo, efeito e feedback definidos no JSON antes de entrar no jogo. Não preencher oito posições apenas para atingir um número. Cada classe precisa vencer os encontros de referência solo, com tempos e consumo de poções registrados.

## 8. Hub, economia, inventário e profissões

Hub: portal central, mentor de classe, comerciante, armazém e mesa dos baús. Inventário, equipamento e ficha abrem por painéis/atalhos. A missão de classe deve ser uma sequência real e curta — conversar, experimentar uma habilidade em alvo de treino e confirmar escolha — sem um framework genérico de quests. A confirmação informa permanência. Entregar arma inicial adequada na mesma transação da escolha.

Slots: arma, cabeça, peitoral, calças, botas, anel, colar e talismã. Validar restrições por classe e troca com inventário cheio. Conteúdo inicial cobre todas as cinco classes, os slots e as cinco raridades, sem exigir arte única para cada combinação. Modificadores especiais iniciais podem alterar custo de habilidade ou eficiência de cura; descrições devem mostrar o efeito real.

Usar apenas moedas. Loja vende cura, recuperação de MP, buff básico e ferramentas; recompra recursos por preços configurados. Evitar compra e revenda lucrativa do mesmo item. Consumíveis do mesmo tipo compartilham seu cooldown; cura, MP e buff mantêm tempos independentes. Persistir cooldowns para recarregar não reiniciá-los.

Drops no chão só passam a pertencer ao personagem quando recolhidos. Inventário cheio deixa o drop recuperável no chão, com aviso. Morte conserva inventário e baús já recolhidos; não converter automaticamente itens não recolhidos em posse. Aplicar perda de moedas uma única vez na transação de retorno.

Aluguel proposto de armazém: 25 moedas por expedição para depositar; 120 slots; retirar é gratuito e permitido sempre. São hipóteses de economia, não requisitos originais. Não reduzir capacidade ao remover STR se isso expulsar itens: bloquear novas entradas até regularizar e mostrar excesso, sem destruir bens.

Profissões: verificar ferramenta e nível do nó, aproximar, executar ação temporizada interrompível e conceder recurso/XP apenas na conclusão. Reserva de capacidade evita coletar e perder recompensa. Ferramenta melhor reduz tempo e libera nós superiores; XP da profissão não depende de abater criaturas.

Proposta de recompensa alternativa: recursos vendáveis, chance de baú na extração e pequena XP de personagem. Pelo menos uma rota opcional do andar 1 deve permitir coleta útil com baixo risco. Testar se dez minutos coletando geram receita líquida suficiente para consumíveis/melhoria de ferramenta. Não criar crafting nem mineração subterrânea: depósitos ficam na floresta.

## 9. Baús e matemática sem punição

Fluxo no Hub: selecionar baú → persistir sessão com questões → responder uma por vez → receber feedback → concluir sequência → rolar recompensa → consumir baú e conceder resultado atomicamente. Sem limite de tempo inicial. Fechar painel pausa sessão; não consome o baú nem sorteia perguntas novas. Resposta enviada não pode ser trocada para acumular bônus.

Banco JSON acessado por um QuestionRepository, permitindo trocar a fonte futuramente. Seleção sem repetir questões dentro do mesmo baú quando houver conteúdo suficiente. Aceitar formatos numéricos locais conforme tipo, mas preferir múltipla escolha na primeira entrega para não confundir erro de digitação com erro matemático. Cada resposta inclui explicação curta. Não armazenar analytics: apenas o necessário para concluir/retomar a sessão, removendo detalhes ao resolvê-la.

Pesos iniciais para um baú comum, na ordem Comum/Incomum/Raro/Épico/Lendário: `[60, 25, 10, 4, 1]`. Para desempenho `p = acertos / total`, usar multiplicadores `1 + p × [0, 0.25, 0.5, 0.8, 1]`, normalizando ao final. Se total for zero por conteúdo inválido, não iniciar sessão; preservar baú e explicar falha.

| Desempenho | Comum | Incomum | Raro | Épico | Lendário |
|---|---:|---:|---:|---:|---:|
| Zero acertos | 60,00% | 25,00% | 10,00% | 4,00% | 1,00% |
| Todos certos | 51,97% | 27,07% | 12,99% | 6,24% | 1,73% |

Zero acertos preserva integralmente a distribuição básica; acertos melhoram a distribuição, mas não garantem qualidade individual. Uma tentativa com bom desempenho ainda pode gerar item Comum. Não adicionar opção “sem recompensa” à tabela. LUK pode ficar reservado em configuração, sem modificador de baú no primeiro passe; já tem efeito em combate.

Persistir RNG/resultado e identificador da concessão evita rerrolar ou duplicar com reabertura. Se não couber, o prêmio fica em resgate pendente persistente; nunca desaparece. Conteúdo de respostas no cliente não é secreto; proteção antitrapaça não é objetivo single-player.

## 10. Boss do andar 5

Proposta original: **Guardião do Cerne**, criatura de madeira e pedra cujo núcleo luminoso sustenta a mata. Arena com áreas livres e poucos obstáculos fixos, acessível por todas as classes.

Três padrões iniciais: golpe frontal em cone; raízes marcadas no chão antes de explodirem; chamada de brotos inimigos em momentos específicos. Transição a 50% de HP combina padrões com intervalos menores, sem sobreposição impossível. Tempos de aviso e deslocamento necessário devem permitir esquiva andando, sem exigir dash.

Validar alcance de classes melee, linha de visão de ranged e janelas seguras para cura/coleta de recursos de combate. Recompensa proposta: moedas, XP e baú especial garantidos; tabela do baú pode ter piso Raro e probabilidades superiores configuradas, mantendo recompensa mesmo com zero acertos. Registrar primeira vitória e conclusão do capítulo, exibir tela curta e permitir retorno/nova run.

## 11. Persistência, recuperação e versão

[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) fornece armazenamento estruturado transacional. Usá-lo não elimina as [quotas e possibilidades de remoção do armazenamento do navegador](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria). Por isso confiabilidade inclui recuperação e exportação, além do save automático.

Estruturas sugeridas no banco: profiles, layouts e snapshots. Layouts são imutáveis e referenciados por ID; manter snapshot atual e anterior por perfil. Operações críticas atualizam registros relacionados na mesma transação. Revision detecta escrita sobre uma versão antiga. Bloquear edição simultânea do mesmo perfil em outra aba, ou colocá-la em modo somente leitura, antes de qualquer gravação.

Salvar: criação/descoberta, troca de andar, retorno/morte, escolha de classe, compra/venda, troca de itens, atributos, coleta, envio de resposta e concessão de baú. Durante exploração, autosave periódico, inicialmente a cada dez segundos. Mostrar estado “Salvando/Salvo/Falha ao salvar”; nunca anunciar sucesso antes da confirmação do banco.

SaveVersion identifica o formato do produto; schemaVersion controla migrações; contentVersion e generatorVersion tratam conteúdo e gerador. Migrações preservam original, produzem nova cópia validada e só então substituem ponteiro ativo. Save de versão futura é recusado com explicação, sem sobrescrita. Importação valida tamanho, estrutura, IDs, valores e referências antes de substituir qualquer perfil; oferecer importar como perfil separado.

Retomar run restaura HP/MP, posição, XP pendente, estado de encontros/recursos, cooldowns e RNG. Se uma animação estava em andamento, retomar seu estado lógico restante ou aplicar uma política determinística que não duplique impacto. Não curar ou repor recursos ao recarregar. Persistir prêmio e consumo juntos torna uma queda no meio do baú recuperável.

Falha de quota/escrita conserva última versão válida e permite exportar o estado atual em memória. Não continuar acumulando silenciosamente progresso sem save: pausar e oferecer tentar novamente ou exportar. Exportação JSON contém o perfil completo e layouts referenciados; importar deve reproduzir os hashes. Origem/endereço estáveis são necessários para reencontrar o mesmo armazenamento. Fechamento abrupto pode perder até o último intervalo de autosave; exportação protege contra remoção total do armazenamento, mas depende do usuário guardá-la.

## 12. Preparação para multiplayer, sem implementá-lo

Preparar limites, não infraestrutura de rede. Comandos possuem intenção e IDs; lógica valida alcance, posse, custos e cooldowns em vez de aceitar resultados da UI. RNG e relógio são injetáveis. Núcleo pode rodar sem navegador, facilitando testes e eventual execução no servidor.

Layout imutável tem identidade separada de proprietário e da instância dinâmica. Associação Character → FloorLayout permite futuramente compartilhar ou copiar layouts sem reescrever geração. Eventual proveniência de herança poderá ser acrescentada por migração; nenhum fluxo de party ou herança é implementado agora.

Isso facilita autoridade de servidor futura, mas não entrega sincronização de rede. Multiplayer ainda exigirá autenticação, transporte, replicação, reconciliação, segurança, persistência remota, política de conflitos e definição dos encontros compartilhados. Não prometer suporte a 60 jogadores a partir de benchmarks single-player. Não implementar lockstep nem garantir determinismo binário entre plataformas nesta Beta.

## 13. Marcos pequenos e critérios objetivos

Ordem executável: **M0 → M1a → M1b → M2a → M2b → M3 → M4 → M5a → M5b → M6 → M7 → M8 → M9**. Persistência começa no M0/M3 e cresce junto aos sistemas; não fica para o polimento. Cada marco passa por demonstração jogável e verificação antes do próximo.

| Marco e dependências | Entrega mínima | Critério de conclusão |
|---|---|---|
| M0 — contrato e base | Decisões registradas, ferramenta de desenvolvimento, schemas mínimos, testes puros e repositório de save em memória | Projeto inicia com instrução documentada; dados inválidos são rejeitados; fonte original preservada; sem dependência de CDN em runtime |
| M1a — cena e controle; M0 | Cena de teste, personagem, câmera ortográfica, WASD, colisão e UI mínima | Percorrer dez minutos sem atravessar obstáculos; diagonal e cardinal têm mesma velocidade; quatro ângulos mantêm controle consistente; redimensionar não quebra seleção |
| M1b — navegação; M1a | Point-and-click, A*, seleção e cancelamento | Alcançar vinte destinos válidos em mapa com paredes; rejeitar cinco inalcançáveis; não cortar cantos; WASD cancela caminho; mesmos resultados nos quatro ângulos |
| M2a — combate básico; M1b | Um inimigo, alvo, aproximação, auto-attack, aggro, dano e morte | Ataques param com alvo morto/cancelado; nenhum dano através de parede; cinco perseguidores funcionam e vinte são usados em teste de estresse, sem limite artificial de aggro |
| M2b — ações; M2a | Uma habilidade, fila, recurso, attack speed, poção e telegraph simples | Habilidade termina depois do básico corrente e retoma ataque; sem consumo inválido; número de ataques em 30 s coincide com fórmula, tolerância de um tick; animação não duplica dano |
| M3 — RPG e primeiro save; M2b | Novato e cinco classes de teste, atributos, XP, inventário, equipamento e consumíveis | Todas as classes funcionam solo em encontro comum; oito slots validam equipamento; capacidade respeitada; cura e MP têm cooldown independente; salvar/carregar preserva estado |
| M4 — Hub e preparação; M3 | Portal, missão de classe, serviços, atributos, loja, aluguel e baús ainda fechados | Começar Novato, cumprir prova, escolher cada classe em perfis distintos; escolha persistente; compra sem saldo falha sem alterar itens; armazém não perde bens; retorno consolida XP uma vez |
| M5a — uma torre persistente; M4 | Gerador do andar 1, entrada/saída, encontro guardião, escolha de retorno | Cem seeds por configuração passam conectividade/alcance; visitar dez vezes e recarregar preserva hash do layout; nova expedição repõe estado dinâmico; terminar e voltar gera progressão utilizável |
| M5b — andares 2–4; M5a | Ambientes e dificuldade crescentes, desbloqueio, retomada de expedição | Cada andar é gerado só na primeira descoberta; continuar/retornar funciona em todos; morte preserva drops/baús e perde só moedas configuradas; tempos reais registrados em primeiras visitas |
| M6 — profissões; M5a | Três profissões, ferramentas, nós, XP própria, venda e melhoria | Cada profissão concede e persiste XP; ferramenta inadequada impede extração sem cobrança; ação interrompida não duplica recurso; inventário cheio preserva nó; coleta produz retorno econômico mensurável |
| M7 — ciclo educacional; M4, M5a | Banco JSON revisado, sessões, feedback, loot e retomada | Zero acertos sempre produz prêmio; probabilidades normalizam; 100% não garante Lendário; fechar/reabrir não rerrola; teste de falha em cada etapa não duplica nem apaga recompensa |
| M8 — Boss e capítulo; M2b, M5b, M7 | Andar 5, Boss, recompensa e registro da vitória | Cada classe vence solo com build de referência; todos os ataques são evitáveis sem dash; derrota/vitória e recarga preservam estado correto; concluir capítulo e iniciar outra run funciona |
| M9 — estabilidade e avaliação; todos | UI final da Beta, feedback/áudio, recuperação de save, balanceamento e performance | Percurso dos 25 critérios de produto aprovado; dez ciclos consecutivos sem bloqueio/duplicação/perda; matriz de navegador e relatório de desempenho executados; limitações conhecidas publicadas |

Antes de implementar qualquer sistema: registrar dependências, responsabilidade, dados e interações; entregar a menor versão funcional; testar; só então expandir. Não expandir os andares enquanto o primeiro não suportar um ciclo coerente.

## 14. Verificação e critérios de qualidade

**Automação de domínio:** dano e limites de atributos; frequência de ataque; custos e cooldowns; transferências conservando itens/moedas; XP consolidada uma vez; classe permanente; capacidade; ferramentas; normalização de pesos; concessão garantida com zero acertos.

**Integração:** ação básica → habilidade → básico; alvo morre durante fila; geração → validação → gravação → reentrada; compra e aluguel com saldo insuficiente; morte durante efeito; recarga durante coleta/quiz; prêmio com inventário cheio; migração/importação; falha de escrita e save corrompido; concorrência entre abas. Testes usam RNG previsível, sem depender de sorte.

**Geração:** cem seeds por andar em desenvolvimento e lote de mil antes de M9; armazenar seeds que falham. Validar conectividade com o mesmo raio/regras de movimento do jogador, não apenas flood fill de células pontuais. Testar também o fallback e arena.

**Probabilidade:** conferir fórmula exata e usar amostras estatísticas com tolerância predefinida apenas como verificação complementar. Um teste não deve exigir que uma pequena amostra contenha um Lendário.

**Navegador:** fluxo novo perfil → Hub → classe → equipamento → Torre → retorno → quiz → recompensa → save/reload. Verificar foco em inputs, atalhos não disparando enquanto se escreve, clique sobre painéis, resoluções 1366×768 e 1920×1080, quatro ângulos de câmera, perda de contexto gráfico e retomada de aba.

**Desempenho proposto:** no notebook de referência a definir, buscar 60 fps em 1080p com qualidade padrão; medir percentil 95 de frame ≤ 20 ms, simulação ≤ 8 ms/tick em cenário de 30 inimigos ativos e 100 objetos visíveis. Registrar hardware, navegador e resolução. Teste estendido de dez runs deve estabilizar memória após aquecimento, sem crescimento contínuo. Esses valores são metas, não resultados já medidos.

**Jogabilidade:** testes humanos são necessários para concluir “divertido”. Registrar externamente observações de cinco primeiras explorações de cada andar normal e de todas as classes. Usar 6–10 minutos como faixa inicial de avaliação, sem impedir runs mais rápidas por domínio/build. Observar mortes, leitura dos ataques, tempo parado, caminhos vazios e progressão percebida. São notas de playtest, não analytics educacional implementado.

Rastreabilidade dos 25 critérios originais: 1–3 em M1/M4; 4–6 em M3/M4; 7–9 em M5; 10–11 em M2/M3; 12 em M5/M7; 13 em M6; 14–17 em M5; 18 em M8; 19–22 em M7/M8; 23–25 na integração M3/M4/M9. M9 repete o percurso integral, não apenas verifica módulos isolados.

## 15. Decisões antes de começar e primeiro passo

### Necessárias antes da fundação jogável

1. **Representação/câmera:** aceitar Three.js com geometria simples e rotação inicial em quatro ângulos, ou exigir outro tratamento. Recomendação: quatro ângulos já funcionais, estrutura compatível com rotação contínua.
2. **Execução:** navegador com servidor local no desenvolvimento ou necessidade de executável instalável. Recomendação: navegador; instalador fora do primeiro ciclo.
3. **Dispositivo de referência:** definir notebook/navegadores para avaliar desempenho real. Pode começar com a máquina disponível, registrando suas características no teste.

### Necessárias antes dos sistemas correspondentes

| Decisão | Prazo | Recomendação inicial |
|---|---|---|
| Condição de concluir andar e retorno antecipado | M5a | Saída + guardião; retorno ao concluir; retomada da run ao reabrir |
| XP na morte e momento do level-up | M3/M4 | Preservar XP; consolidar níveis no Hub |
| Prova e momento de escolha da classe | M4 | Nível 2 e prova guiada no Hub, com confirmação permanente |
| Habilidades mínimas por classe | M3 | Três por classe, uma de Novato; oito posições disponíveis |
| Capacidade, aluguel e respawn | M4/M5 | Slots por pilhas; aluguel por expedição; respawn só em nova expedição |
| Público escolar, temas e leitura | M7 | Definir faixa antes de revisar banco; não presumir currículo |
| Revisita direta a andares conquistados | M5b | Nova run começa no 1; acesso direto não é presumido, pois mudaria risco e duração |
| Número de perfis expostos ao jogador | M3 | Poucos perfis locais separados para testar classes, sem troca de classe interna |

**Primeiro passo de implementação proposto:** M0 + M1a, um laboratório jogável de fundação. Criar página inicial, cena pequena com portal visual, personagem provisório, obstáculos, câmera ortográfica em quatro orientações, WASD relativo à câmera, colisão e painel mínimo de instruções. Entregar comando de execução e checklist demonstrável. Point-and-click entra em M1b após validar coordenadas, seleção e colisão; nenhum sistema de RPG deve ser construído antes dessa base funcionar.

O resultado esperado dessa primeira entrega é responder com evidência: o personagem se move bem, a câmera mantém a leitura e a navegação pode evoluir sobre a mesma representação de mundo. O plano termina aqui; a implementação do jogo ainda não foi iniciada.
