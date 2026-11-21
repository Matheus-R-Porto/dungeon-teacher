# Dungeon Teacher — Iteração 31

26/10/2026 · Reformulação integrada sobre a Iteração 30.

**Entrega de desenvolvimento:** acesso escolar online, personagem único, aparência modular, HUD, progressão por profissão, Árvore do Destino e serviços de Serafina integrados ao servidor existente. Mapas e numeração atuais preservados por orientação do usuário; Cidade do Limiar continua separada da Torre. Marcos de promoção mantidos em 12 e 36.

O código funcional desta etapa foi implementado e verificado. O conteúdo integral de uma campanha de 13 semanas **não está concluído**: cidades futuras, missões, especializações e habilidades próprias ainda não definidas permanecem pendentes. Há também pendências artísticas explicitadas abaixo. Nenhum desses conteúdos foi apresentado como pronto.

## A. Diagnóstico inicial

A auditoria está em `ITERACAO-31-AUDITORIA.md`. Foram consultados os relatórios anteriores, com atenção às iterações 20–24 (mundo, personagens, animações e desempenho), 27–28.1B (inventário e 44 ícones), 29/29.1 (peso, mochila e carrinho) e 30 (baús e roleta).

Reaproveitados: JavaScript/ES modules, Three.js, Vite, Electron, servidor WebSocket, OnlineTower/OnlineStore, SQLite com WAL/FULL, inventário de 32 espaços, equipamentos, armazenamento do carrinho, peso e penalidades, drops, combate, cinco habilidades, mapas e baú da iteração 30. A campanha de desenvolvimento e seus saves IndexedDB continuam disponíveis pelos modos explícitos de teste.

Antes desta etapa, o online persistente usava uma credencial por instalação. Não havia usuário/senha, papel de professor, turmas ou personagem configurável. As cinco habilidades ativas estavam no runtime local; o online oferecia ataque básico. A evolução era vinculada ao Base Level, sem orçamentos de Job por origem. As armas eram embutidas nos atlases antigos; sobrepor outra arma a esses corpos produziria duplicação.

## B. Alterações implementadas

### Acesso e personagem

- Tela ilustrada original, disponibilidade real do servidor, usuário/senha, configurações gráficas existentes e saída no desktop.
- Aluno não entra no mundo nem cria personagem sem autorização do servidor. Não há alternativa offline no fluxo escolar.
- Professor prepara contas de alunos; não são solicitados e-mail ou dados pessoais adicionais.
- Uma conta possui no máximo um personagem. Nome validado, três estilos de cabelo, três expressões, cinco cores de cabelo e seis cores de roupa.
- Painel real do professor: abrir/fechar A ou B, consultar alunos e conexões, bloquear/desbloquear individualmente, encerrar em 60 segundos e cancelar antes do prazo.
- Fechar entrada preserva sessões existentes. Encerrar impede novas entradas/reconexões imediatamente e encerra as sessões ao fim do prazo persistido.
- Novo comando `npm run desktop:test:school` abre um perfil local isolado no fluxo escolar. O servidor normal passa a exigir contas; o modo legado de servidor exige `DEVELOPMENT_ACCESS=1`.

### HUD e ações

Nome/classe, HP/MP, Base, Job, XP, ouro e peso derivados do estado do servidor. Minimap e controles existentes preservados. Faixa de efeitos com ícone, descrição e duração para alimentos e Regeneração; sobrecarga mostra intensidade e condição de término. Nenhum efeito de terreno novo foi inventado.

Oito atalhos aceitam as cinco habilidades existentes e consumíveis reais. A interface informa arma incompatível, falta de MP, alvo ausente, quantidade insuficiente e recarga. Uso de comida reutiliza o serviço existente, incluindo a restrição de comer fora de combate, atualização do peso e recarga de oito segundos.

O servidor executa AbilityRuntime, Projectiles e PeriodicEffects já existentes. Dano passa pelos mesmos mecanismos de contribuição, recompensa e morte. Projéteis são enviados aos clientes. Regeneração passiva de HP/MP usa Character.regenerate e seus valores atuais, incluindo os bônus das novas passivas. Timers de saque/guarda não autorizam nem atrasam dano.

### Base, Job e árvore

- Base XP permanece separado; Base Level concede atributos. Pontos de habilidade novos vêm do Job da profissão ativa.
- Limites configuráveis: Novato 20; primeiras classes 50. XP excedente no limite é descartada.
- Orçamentos por origem, linhagem ativa e níveis efetivos somados apenas das origens válidas.
- Cinco ativas preservadas no nível aprovado original. Cinco passivas universais configuráveis, com máximos diferentes e custo de um ponto por nível.
- Árvore vertical com raízes, primeiras classes e dez posições futuras na copa, sem inventar nomes de especializações.
- Preparação, efeitos atuais/próximos, desfazer, orçamento restante e confirmação atômica com revisão da progressão. Pontos confirmados exigem reset; pré-requisitos múltiplos e normalização em cascata são suportados e testados.
- Mudança de linhagem desativa investimentos incompatíveis, preserva Job/orçamento e limpa atalhos inválidos. Retorno a profissão permite redistribuição do zero. Promoção dentro de uma linhagem preserva investimentos das etapas anteriores ainda válidas.
- Promoção consulta a profissão pai e o marco 12/36. Somente as cinco primeiras profissões possuem definições hoje; os dez nomes/efeitos futuros não foram criados.

### Serafina

Serviços reais próximos da NPC e fora de combate: habilidades (100 ouro), atributos (100), regressão (50), retorno (50), promoção provisória (100) e aparência (25). Preços estão centralizados em `src/domain/character/professions.js` e são provisórios de balanceamento.

A aparência pode ser vista antes de pagar. Pagamento e efeito são gravados juntos; falhas não alteram o personagem. A interface bloqueia novas ações durante a confirmação. Retorno/recuo preservam Base, atributos, níveis e XP de Job, aparência, equipamentos e profissões desbloqueadas, conforme o serviço escolhido.

Promoção exige Job máximo, marco alcançado e desbloqueio autorizado. As capturas de promoção usam pré-requisitos concedidos **somente ao personagem de teste**; não demonstram uma missão de mestre que ainda não existe.

### Recompensas educacionais

Registro configurável em `config/education.json`, confirmado pelo professor, com Base XP/Job XP separados, recibo contra repetição da mesma requisição e redução por atividade: 100%, 20%, depois zero por padrão. Pode conceder desbloqueio de primeira profissão configurada. O aluno não escolhe o valor da recompensa.

O registro de produção começa vazio, pois não há atividades curriculares aprovadas no projeto. A integração implementa a confirmação pelo professor; não cria perguntas, missões ou um minigame educacional fictício.

## C. Recursos visuais

Ilustração inicial, seis bases desarmadas em quatro direções, cabeças modulares, duas botas reais, peças de roupa/acessórios, armas e bainha. Fontes em `public/assets/characters-v31/` e `public/assets/title-v31.png`; ferramentas, IDs e mapeamento em `ITERACAO-31-ARTE.md`, `ITERACAO-31-ASSETS.json` e `ITERACAO-31-EQUIPAMENTOS.json`.

O compositor combina identidade, traje, cores regionais, equipamento e arma. Equipamentos encontrados não recebem a tintura da roupa. Cabeça/capuz usam janela facial; mochila alterna entre camadas dianteira/traseira; botas substituem a região dos pés, com o roupão sobreposto. Desequipar recompõe a base original.

Arma guardada e empunhada são uma única camada; a bainha vazia é separada. Saque de 0,24 s, guarda de 0,32 s, permanência de combate de 5 s e cinco passos reutilizam VisualCombat. Reação ao dano e derrota têm apresentação procedural; não são novos atlases completos de ataque/morte desenhados quadro a quadro.

Os 26 itens equipáveis reais possuem caminho visual. As 12 armas forjadas reutilizam silhuetas da família com distinção de acabamento: **arte individual fiel a cada ícone ainda pendente**. Anéis são pequenos na escala do mundo. O carrinho conserva atlas e ancoragem da iteração 29.1. Os 44 PNGs aprovados do inventário não foram substituídos.

A revisão corrigiu recortes de células vizinhas, buracos no roupão, cabeça separada do corpo, direção do capuz, encaixe dos pés, altura da empunhadura e pivô de derrota. A transmissão de classe/aparência/equipamentos na interpolação de rede também foi corrigida e recebeu teste próprio.

## D. Segurança e servidor

Senha com scrypt assíncrono N=131072, r=8, p=1, salt aleatório e comparação constante. No máximo dois hashes simultâneos; excesso recebe resposta de ocupação. Token aleatório de 32 bytes, somente seu hash persistido; o cliente mantém o token em memória. Senhas são limpas do formulário após envio e não entram em logs ou URLs.

Sessões: validade absoluta de quatro horas e inatividade de 30 minutos. Polls passivos não renovam a atividade. Novo login invalida o anterior; bloqueio, logout e prazo da aula revogam acesso. A autorização é reavaliada depois da operação assíncrona de senha e em comandos/continuidade da partida.

Limites por usuário e IP, mensagens validadas, papel de professor verificado no servidor e auditoria administrativa sem credenciais. A/B começam fechadas, com 30 contas por turma; a capacidade é configurável. Limites de transporte escolar comportam 60 jogadores e as conexões temporárias de login do mesmo endereço de rede.

O limite de envio trata snapshots e atualizações periódicas de contagem como substituíveis: uma atualização atrasada não derruba a conexão enquanto o mapa inicial é transmitido. O prazo real continua no servidor.

Não houve deploy. O endpoint público configurado anteriormente **não foi atualizado nem validado para esta autenticação**. Revisão local usa o servidor local; uso externo exige o endpoint WSS do servidor atualizado e sua operação adequada.

Referências consultadas: [Node.js crypto](https://nodejs.org/api/crypto.html), [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) e [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## E. Persistência

Mesmo banco SQLite: personagens, contas, turmas, sessões, auditoria e recibos educacionais. WAL/FULL, transações e checksum já existentes foram preservados. Ouro, build, aparência, equipamentos e consumo são aplicados em uma cópia; o personagem vivo só muda depois da gravação. Salvamentos do ciclo online são agrupados em transação para evitar uma sincronização de disco por jogador a cada passo.

Job por profissão, orçamento, distribuição, desbloqueios, repetições educacionais e aparência são persistidos e validados. Cooldowns ativos usam prazos persistidos. Recibos de progressão impedem repetir uma operação confirmada; a mesma operação mantém seu identificador ao tentar novamente após perda de resposta no cliente. O histórico é limitado a 64 recibos por personagem.

Personagem legado já vinculado a conta é migrado uma vez ao entrar: habilidades antigas + pontos não gastos voltam como orçamento gratuito de Novato; ouro, Base, atributos e inventário permanecem. Saves locais não são importados silenciosamente para contas e continuam preservados. Não foi modificado qualquer banco ou perfil real.

## F. Testes e evidências

- `npm test`: **811/811 aprovados**, zero falhas, cancelamentos ou skips; 132,419 s. São 23 testes novos sobre a base de 788 da iteração 30. Log: `ITERACAO-31-TESTES.txt`.
- `npm run build`: aprovado, sem dependências novas. Permanece o aviso de chunk acima de 500 kB; o diagnóstico de aparência também gera aviso de importação dinâmica já presente estaticamente. Não são falhas de compilação.
- Revisão focada do cliente/interpolação: **35/35 aprovados**. Revisão de regeneração/online: **17/17 aprovados**. Ambos estão incluídos na validação final pertinente.
- A abertura `--test-profile=SchoolReview --school` foi conferida: fluxo escolar, perfil isolado e endpoint local.

Ensaios independentes:

- `node scripts/iteration31-electron.mjs`: dez verificações, zero exceções; login fechado/aberto, criação, árvore, professor, bloqueio, cancelamento, resoluções 1024×768/1366×768 e offline.
- Encerramento com relógio real: **60.108 ms**, retorno à entrada e ouro preservado em SQLite. Reinício/cancelamento/prazo persistido também cobertos por testes automatizados de acesso.
- `node scripts/iteration31-services.mjs`: cinco verificações, zero exceções; interação real com Serafina, prévia, cobrança, promoção/regressão/retorno/resets, identidade e buff alimentar. Capturas finais já incluem a correção de sincronização visual.
- `node scripts/iteration31-art.mjs`: compositor real Canvas/WebGL; seis classes × quatro direções, identidades, botas e equipamentos; quatro armas × quatro direções × guardada/transição/empunhada, mais derrota. Capturas comparáveis, não mockups.
- `node scripts/iteration31-capacity.mjs`: 60 contas, A/B com 30; 120 conexões transitórias no mesmo IP; 60 jogadores confirmados, fechamento sem expulsão e bloqueio individual isolado. Admissão medida em 360 ms **depois de preparar/autenticar as contas**. Não é medição de 60 senhas simultâneas, 60 clientes gráficos ou desempenho em PCs escolares.
- `node scripts/iteration30-electron.mjs`: **21 verificações aprovadas**, zero exceções; roleta/baú, quantidades, ouro, seed, repetição, inventário cheio, erro de gravação, reconexão e recompensa salva sem duplicação.
- Testes específicos incluem falha de disco/rollback, persistência de cooldown, cinco habilidades, dano/projéteis, regeneração passiva, orçamento/linhagem, pré-requisitos múltiplos, migração gratuita e atualização da aparência pela rede.

Falhas intermediárias foram tratadas: incompatibilidade do decoder legado com novas classes, duas camadas extras criadas em atores legados, saturação da fila inicial por contagens substituíveis e estado visual não transportado pela interpolação. Ensaios também exigiram esperar a conclusão real da prévia/mapa/gravação antes de capturar ou clicar. Nenhum teste foi removido para obter aprovação.

Galeria: `ITERACAO-31-CAPTURAS.html`. Resultados brutos: `ITERACAO-31-VALIDACAO.json`, logs e relatórios dos ensaios. Todos usaram bancos e perfis temporários.

## G. Pendências e limites da entrega

1. **Conteúdo:** segunda cidade/terceira cidade, andares 13–36, mestres e missões de promoção; cinco árvores próprias de primeira classe e dez especializações. Não há nomes/efeitos aprovados para inventar. A primeira promoção pode ser confirmada por Serafina depois de um desbloqueio configurado; não há caminho curricular de produção preenchido.
2. **Níveis ativos:** as cinco habilidades atuais continuam no primeiro nível aprovado. A estrutura aceita níveis individuais, mas efeitos superiores aguardam definição. Pré-requisitos múltiplos são validados e testados com catálogo de teste; não foram inventadas dependências para o catálogo atual.
3. **Arte:** variantes próprias das 12 armas forjadas, refinamento de mãos/poses dedicadas e continuidade fina dos quadros. A aprovação artística humana dos novos sprites permanece pendente. Os diagramas de testes usam poses reais, mas não comprovam toda combinação de aparência × classe × item × quadro.
4. **Balanceamento:** preços/passivas/curva de Job são provisórios e centralizados. Metas de semana 2, 2h30 e semana 8 não foram comprovadas. Novato 1→20 requer 5.225 Job XP; primeira classe 1→50 requer 31.850. Esses totais são aritmética da configuração, não uma simulação de tempo de jogo. Combate concede 10% da Base XP, arredondada para baixo; atividades configuradas podem ter orçamento próprio mais relevante e repetição reduzida.
5. **Integrações anteriores:** pesca, mineração, cozinha e forja da campanha de desenvolvimento permanecem no caminho anterior, testadas pela suíte; esta iteração não as reimplementou como novas atividades online autoritativas. O registro educacional não é um sistema completo de perguntas ou avaliação automática.
6. **Operação:** sem teste sustentado de uma aula de 90 minutos com 60 clientes gráficos, sem playtest em computadores escolares, sem instalador novo e sem publicação. O teste de capacidade verifica o servidor/conexões, não 60 FPS.

### Situação dos critérios de aceitação

| Critérios do prompt | Situação e evidência |
|---|---|
| 1–6: offline, turmas, bloqueio, 60 s, personagem único, criação | Implementados; acesso e Electron aprovados |
| 7: identidade ao trocar de profissão | Implementado; domínio, interpolação de rede e Serafina no Electron |
| 8: organização do HUD | Implementada; duas resoluções, estados reais e alimento |
| 9: bases desarmadas por classe | Seis bases integradas; revisão artística humana pendente |
| 10: equipamentos ou pendências explicitadas | 26 caminhos visuais; variantes forjadas e refinamentos listados |
| 11: composição nas quatro direções | Funcional e capturada; não equivale a aprovação de todas as combinações |
| 12: armas e lógica existente | Estados/temporizadores reaproveitados; poses dedicadas adicionais pendentes |
| 13–16: árvore, pontos, Base/Job e troca | Fundação funcional e testada; conteúdo de classes/especializações ainda não definido |
| 17: serviços de Serafina | Implementados e verificados com cobrança no servidor |
| 18: preservação anterior | Suíte e ensaio de baús aprovados; atividades locais não foram portadas ao online |
| 19: testes relevantes | Resultados finais descritos acima |
| 20: ausência de publicação não autorizada | Nenhum commit, push, deploy, publicação ou alteração de conta real |

As linhas com pendência não representam conclusão integral de conteúdo/arte. Esta entrega não deve ser tratada como campanha escolar pronta para distribuição.

## H. Próximos passos

Definir atividades curriculares, recompensas e missões dos mestres; autorar as habilidades próprias e especializações; revisar as artes e variantes; medir progressão com alunos e ajustar valores centrais. Depois, validar uma aula sustentada nos PCs escolares e preparar publicação/instalador em uma etapa autorizada.

Para revisão local, consultar `ITERACAO-31-OPERACAO.md`. As capturas e o relatório também foram copiados para a pasta de entrega desta conversa; os originais do projeto estão em `docs/` e `screenshots/iteration31/`.
