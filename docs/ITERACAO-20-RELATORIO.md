# Dungeon Master — Iteração 20 — Beta 0.4.0

Data: 15/10/2026. Preparação visual e técnica da demonstração escolar.

## Entrega

A entrada online agora é a **Cidade do Limiar**, compartilhada entre os personagens do protocolo v4. Foram integradas artes originais para o aventureiro, seis moradores, seis retratos e os três tipos existentes de Slime. Os moradores oferecem diálogos individuais em português; o combate ganhou barras de HP, poses, impactos, números e reação ao dano. A capacidade foi verificada com doze identidades reais do protocolo, duas parties de seis e clientes Electron isolados.

Não houve deploy, publicação, commit, novo instalador ou alteração destrutiva de saves. O build de frontend para Electron está em `dist/`. A campanha local permanece separada e mantém seu Refúgio e serviços anteriores. Os testes usaram perfis, credenciais, bancos e geografia isolados.

## Cidade e persistência

O mapa público `shared-city` tem 34 × 32 unidades, praça com fonte, ruas pavimentadas, seis edifícios, oficina/forja, taverna, loja de poções, armazém, santuário do Anjo, entrada da Torre, árvores, jardins, cercas, barracas, luminárias, placas, caixas e barris. Geometria e colisões vêm de uma definição única em `shared/city.js`. Edifícios que encobrem o personagem ficam translúcidos conforme a câmera gira.

Spawn, aproximação dos seis NPCs e portal têm caminhos testados pelo mesmo algoritmo de navegação do jogo. Construções, árvores, luminárias, jardins, barracas, suprimentos e forja são sólidos no servidor. As ruas usam instâncias de pedras sem superfícies sobrepostas.

Novas identidades começam na cidade. Identidades antigas continuam no andar salvo. F no portal da cidade entra no andar 1; F na entrada do andar 1 retorna à cidade. Os outros portais continuam adjacentes e limitados aos doze andares. A extensão aditiva `area: "shared-city"` acompanha o estado quando necessário; `floor`, `reached`, inventário, atributos e XP conservam suas regras. A versão SQLite permanece 1. Nenhum arquivo de geografia persistida é reescrito para acrescentar o retorno: ele é uma adaptação em memória.

## Moradores e diálogo

| Morador | Identidade visual | Conversa inicial |
|---|---|---|
| Serafina, Anjo do Reset | Asas, halo, branco e dourado | Recomeços; reset de atributos/habilidades ainda futuro |
| Marta, Armazeneira | Tranças, bordô, chaves e livro | Apresenta o armazém; não simula armazenamento online |
| Brasa, Ferreiro | Barba ruiva, avental, martelo e luvas | Preparação e equipamentos; forja online futura |
| Lina, Cozinheira | Lenço verde, avental e colher | Alimentos e preparação; receitas disponíveis na campanha local |
| Orin, Mago das Poções | Chapéu roxo, barba e frascos | Recuperação e cuidados; loja online futura |
| Caio, Guia da Torre | Mochila, mapa e lenço azul-petróleo | Portal, combate, parties, XP, saque e retorno |

Cada personagem possui região exclusiva de sprite e de retrato nos dois atlas. O retrato é uma arte de busto diferente da imagem de corpo inteiro. Clique no NPC próximo, com linha de visão livre, para abrir uma caixa inferior com nome, retrato e falas. Continuar avança; Concluir/Fechar/Esc encerram. Movimento e combate ficam bloqueados durante a conversa. Desconexão e mudança de mapa fecham a janela. Outros jogadores continuam livres para usar o mesmo NPC.

Dados, regras de distância/visão, apresentação, opções e ações estão separados. Nenhum serviço inexistente concede itens, apaga pontos ou altera o personagem.

## Artes e combate

- Aventureiro: atlas com quatro direções e seis poses; animação de caminhada e fases de preparação/golpe/recuperação. Arte compartilhada pelos personagens locais e remotos; nome autoritativo sobre o jogador.
- Moradores: seis sprites exclusivos e seis retratos correspondentes, em dois atlas 3 × 2.
- Monstros: os tipos existentes comum, Saltador e Mágico, com seis poses cada, cores e silhuetas próprias. Sem novo monstro, chefe ou andar.
- Ambiente: SVGs originais de pavimento, fachada e telhado, aplicados à geometria 3D. Impacto original em SVG.
- Combate: barras de HP, anel de seleção, preparação/golpe, reação de dano, números, impacto breve e dissolução/redução ao morrer. Dano recebido também colore o aventureiro e a borda da tela. O ataque mágico recebido tem um traço visual ligado ao impacto autoritativo; não foi criada uma simulação paralela de projéteis ou alterada sua regra de dano.
- XP e saque continuam no painel e nos botões de coleta individual. A interface informa a aproximação automática para atacar e os retornos de erro do servidor. Seleção de NPC distante informa a necessidade de aproximação.

Os efeitos usam eventos existentes, têm duração curta e limite de 48 simultâneos; eventos antigos não são reapresentados como impactos novos. A arte não decide HP, XP ou loot. Materiais/fontes de textura são compartilhados e as texturas têm filtro nearest e alfa. Não foram adicionados pós-processamento pesado ou milhares de objetos individuais.

[Arquivos, grades, descrições de geração e instruções para novas artes](ITERACAO-20-ARTES.md).

## Verificações funcionais

`tests/school-multiplayer.test.js` executa um servidor local real e doze clientes `WorldClient` sobre WebSockets, com credenciais distintas. Passaram:

- Doze autenticações simultâneas, população visível e movimentação concorrente.
- Duas parties de seis, convites simultâneos entre grupos, chat de party isolado e mensagem global de cada participante.
- As duas parties atacando o mesmo monstro e, depois, monstros diferentes. Ataques são comandos reais; dano, elegibilidade, XP e drops são calculados pelo servidor.
- Coleta manual individual; repetir o ID coletado não aumenta o inventário.
- Seis personagens permanecem no andar 1 e seis seguem ao andar 2; snapshots separados e chat global entre mapas.
- Substituição de uma sessão com a mesma credencial sem duplicar personagem.
- Reconexão dos doze e reinício do servidor com identidades, inventários, XP e andares preservados.
- Caminhos para NPCs/portal, colisão dos edifícios, distância e bloqueio de conversa por parede.

Os testes usam posicionamento de fixture para evitar caminhadas longas e avançam ticks nos combates curtos. Não injetam dano, XP ou recompensas no cenário escolar. A divisão inteira de XP existente foi preservada: em um monstro disputado com recompensa pequena, um participante elegível pode receber zero por arredondamento; cada party recebe XP e todos acumulam XP no cenário de alvos separados. Isso não foi tratado como autorização para rebalancear a economia.

## Medição sustentada

**Passou: 1800.239 segundos (30 minutos), com exatamente 12 conexões em todas as amostras da janela sustentada.** Nenhuma desconexão inesperada, nenhum erro de servidor e nenhum erro de protocolo foi registrado. Ao final, os doze reconectaram e o servidor foi reiniciado com identidades e inventários preservados.

Ambiente: Windows, Node v24.19.0, AMD Ryzen 5 6600H, 12 processadores lógicos; loopback local. Foram usados dois processos Node (servidor e clientes), além das demais tarefas de desenvolvimento na máquina.

| Medida | Média | p95 | Máximo |
|---|---:|---:|---:|
| CPU do servidor, % de um núcleo | 4.66% | 12.39% | 24.75% |
| RSS do servidor | 42.24 MiB | 76.57 MiB | 79.00 MiB |
| Heap do servidor | 14.74 MiB | 18.83 MiB | 23.66 MiB |
| Frequência efetiva | 15.99 ticks/s | 16.93 ticks/s | 17.01 ticks/s |
| Envio de movimento → sequência no snapshot | 76.40 ms | 127.50 ms | 322.33 ms |
| Intervalo entre snapshots, incluindo reconexões planejadas | 125.95 ms | 133.49 ms | 11140.61 ms |

CPU, RSS, heap e ticks da tabela são recortados à janela sustentada. O máximo do intervalo entre snapshots inclui a pausa **planejada** de reconexão dos clientes, não uma desconexão inesperada. As latências de comandos são observações reais dos clientes, sem previsão local.

**Limitação observada:** a frequência média foi inferior à nominal de 20 ticks/s; a pior amostra de aproximadamente um segundo foi 8.42 ticks/s. Não foi estabelecida uma causa única entre temporização do host, concorrência e carga. Portanto, o teste demonstra estabilidade e preservação de estado sob esta carga, mas não demonstra manutenção de 20 ticks/s nem capacidade garantida em hardware escolar.

[Dados brutos, amostras, resumos e notas de medição](ITERACAO-20-SOAK.json).

O processo do servidor é separado dos doze clientes de carga. CPU é tempo de processo dividido pelo intervalo, em percentual de **um núcleo lógico**, não percentual da máquina inteira. Memória é RSS/heap do processo servidor. Frequência é diferença dos ticks por segundo real. Intervalo de snapshots é medido no cliente; latência é envio de movimento até observar sua sequência no snapshot autoritativo, incluindo o período de publicação.

A carga sustentada envia movimento em rajadas de uma mensagem por segundo por cliente, chat periódico e comandos de ataque/coleta; não representa doze jogadores enviando movimento continuamente a 15 Hz.

O ensaio longo foi iniciado antes da integração visual, sobre o núcleo v4 da Beta 0.3.0 com o limite por IP ampliado. Ele exercita um andar público com movimentos, ataques, coletas e chat periódico; a cidade e a distribuição entre andares foram verificadas separadamente na implementação final. Não é uma medição de 30 minutos da renderização. Durante o ensaio, a mesma máquina também executou builds, testes e Electron; não é benchmark em máquina ociosa ou rede escolar.

## Electron e renderização

Dois processos Electron reais usaram o ponto de entrada de produção e perfis exclusivos de teste. A execução escolar passou: seis NPCs, nome/retrato/falas, avançar/fechar, rejeição à distância, bloqueio de movimento, isolamento entre jogadores, fechamento por desconexão e por transição, retorno à cidade com F, party/chat, combate, XP, loot, troca de andar, reconexão e volta à campanha. Nenhum dos clientes compartilhados abriu IndexedDB.

Dez sockets adicionais produziram uma cena de **doze personagens visíveis** nos dois renderizadores. Foram medidos 180 frames: média **20,70 ms** (aproximadamente **48,3 FPS**), p95 **33,50 ms**, máximo **63,20 ms**. Viewport 1282 × 722 CSS pixels, escala 1,25; heap JS observado de 20.055.778 bytes. É uma amostra curta de cidade com a máquina sob outras cargas, não uma garantia para computadores escolares. Os quatro PNGs carregaram com suas dimensões esperadas.

Também passaram os cenários Electron v3 (Torre temporária, dois clientes, portais e renderização dos doze andares) e v2 (mapa compartilhado legado, movimento, combate, morte/respawn e reconexão). Evidências: [v3](ITERACAO-20-TOWER-ELECTRON.json) e [v2](ITERACAO-20-WORLD-ELECTRON.json).

**Doze WebSockets não equivalem a doze computadores Electron.** Não houve teste em doze máquinas Windows, rede escolar, WAN ou servidor público. Hardware e permissões de instalação da escola continuam desconhecidos.

## Testes e build

| Execução | Resultado |
|---|---|
| Suíte completa `npm test` | 530/530 passaram; 186,7 segundos |
| Online e persistência, execução direcionada | 11/11 passaram |
| Seleção por câmera + IA + cenário escolar | 48/48 passaram |
| Reconexão rápida de doze, execução final | 3/3 verificações escolares passaram; 6,4 segundos |
| Torre e multiplayer | Incluídos e aprovados na suíte completa |
| Build Vite/Electron | Passou; aviso de tamanho do chunk principal permanece |
| Electron escolar | Passou, sem exceções registradas |

Evidências: [suíte completa](ITERACAO-20-TESTES.txt), [checagens direcionadas](ITERACAO-20-FOCUSED.txt), [build](ITERACAO-20-BUILD.txt), [Electron escolar](ITERACAO-20-ELECTRON.json).

## Capturas reais

Todas são imagens do Electron executando o jogo, não conceitos gerados:

- [Visão geral da cidade](../screenshots/beta040-city.png)
- [Praça e personagens](../screenshots/beta040-plaza.png)
- [Doze personagens visíveis](../screenshots/beta040-twelve.png)
- [Ferreiro e oficina](../screenshots/beta040-blacksmith.png)
- [Cozinheira](../screenshots/beta040-cook.png)
- [Mago das Poções](../screenshots/beta040-potion-mage.png)
- [Anjo do Reset](../screenshots/beta040-reset-angel.png)
- [Armazeneira](../screenshots/beta040-warehouse.png)
- [Guia da Torre](../screenshots/beta040-tower-guide.png)
- [Retrato e diálogo do Anjo](../screenshots/beta040-dialogue-angel.png)
- [Retrato e diálogo do Ferreiro](../screenshots/beta040-dialogue-blacksmith.png)
- [Monstro recebendo dano e sprites em ataque](../screenshots/beta040-combat.png)
- [Party e chat](../screenshots/beta040-chat.png)
- [Inventário após coleta](../screenshots/beta040-inventory.png)

## Problemas encontrados e corrigidos

1. O limite anterior de oito conexões por IP impediria uma turma atrás da mesma rede. Agora são 16; a janela de upgrades comporta 32 tentativas para permitir reconexões coletivas sem remover proteção.
2. O cliente e o estado persistido reconheciam apenas andares. Foi acrescentada a área estável da cidade, preservando registros antigos, protocolo v3 e arquivos de geografia.
3. A interpolação remota descartava a fase de ataque. Ela agora preserva esse campo para animar o golpe observado.
4. Testes de raycast sem navegador não possuem decodificador de imagem. O adaptador cria somente a textura vazia nesses testes; o Electron carrega e verifica os PNGs reais. A seleção continua testada com câmeras Three.js em múltiplas órbitas.
5. Ruas sobrepostas causavam interferência visual. Foram substituídas por uma malha instanciada de pedras sem sobreposição.
6. Elementos decorativos sólidos receberam os mesmos limites de colisão usados na renderização.
7. A contagem antiga de nomes remotos passou a incluir o novo nome do jogador local. O cenário de regressão foi ajustado para distinguir esses rótulos.
8. Uma corrida no teste Electron reutilizava o texto antigo do portal antes de chegar a atualização de posição. A fixture agora aguarda a interação visível antes de pressionar F.

## Arquivos desta iteração

Novos: `shared/city.js`; `src/domain/dialogue.js`; `src/ui/npc-dialog.js` e `.css`; `src/adapters/rendering/art.js` e `city.js`; oito arquivos em `public/assets/`; `tests/school-multiplayer.test.js`; `scripts/school-server-worker.mjs`, `school-soak.mjs`, `school-electron-scenario.mjs`; relatórios, logs e capturas `ITERACAO-20`/`beta040`.

Alterados: `server/config.js`, `online-store.js`, `online-tower.js`; `shared/online.js`; `src/multiplayer/world-client.js`, `world-mode.js`, `remote-state.js`; `src/adapters/rendering/scene.js`, `sprite-actor.js`, `combat-visual.js`; testes online existentes e cenários Electron; `index.html`, manifests/lockfiles da aplicação e servidor; README, changelog e instruções desktop. Alterações já existentes de outras iterações foram preservadas.

## Limitações e execução

Arte e escala ainda são uma direção provisória; o sprite não muda com equipamento/classe. Serviços de reset, armazém, forja, culinária e poções online não foram implementados. Interiores não são acessíveis. A campanha local continua independente. Não há novo chefe, mini-chefe, andar, classe, profissão online, economia, PvP, amigos ou mensagens privadas.

Não foi gerado instalador novo. Para executar o código atual, use Node 22.13+ (Node 24 utilizado):

```powershell
npm run desktop:build
npm run server:start
# Em terminais separados:
npm run desktop:test:a
npm run desktop:test:b
```

`npm run dev` mantém o cliente local no navegador; persistência online continua exigindo o cliente desktop. Para repetir as verificações: `npm run test:school`, `npm run test:school:electron`, `npm run test:school:soak` e `npm test`. O ensaio sustentado leva 30 minutos por padrão e guarda seus dados isolados em `.logs/`.
