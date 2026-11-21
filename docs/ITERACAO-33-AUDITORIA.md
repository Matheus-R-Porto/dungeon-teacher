# Iteração 33 — auditoria técnica anterior à implementação

28/10/2026. Base: iteração 32 (872 testes), relatórios 31/32 e inspeção dos serviços existentes. Este documento registra diagnóstico e decisões; não declara a entrega concluída.

## Arquitetura encontrada

- `server/index.js` inicia `startHub` em processo Node. O modo escolar usa `SchoolAccess` e o protocolo WebSocket existente, sobre HTTP. Endereço padrão 127.0.0.1:8787; uso LAN protegido dependia de infraestrutura externa.
- O banco oficial é `characters.sqlite`, em `CHARACTER_DATA_DIR` ou `data/online` relativo ao diretório de execução. SQLite WAL, synchronous FULL, chaves estrangeiras, transações IMMEDIATE, verificação rápida e checksums dos personagens já existem. Mapas ficam em `WORLD_DATA_DIR`/`data/shared-tower`.
- `school_accounts.character_id` aponta para um personagem estável. `world_key` fica exclusivamente no servidor; a credencial de instalação antiga é usada apenas no modo legado. Portanto a conta escolar já tem fundamento para persistência entre máquinas. Não há motivo para substituir o armazenamento da iteração 32.
- Senhas: scrypt N=131072, r=8, p=1, sal aleatório, comparação em tempo constante, limite de derivações concorrentes e de tentativas. Tokens aleatórios só têm hash no SQLite; token escolar fica em memória no cliente.
- A autenticação nova atualmente substitui o token anterior; `OnlineTower.join` também substitui a conexão anterior. Isso conflita com a regra nova de preservar a sessão original.
- Servidor salva snapshots após operações de progressão e em transação durante os ticks; logout/desconexão salvam posição e estado novamente. Inventário, ouro, equipamentos, classe, habilidades, pontos por origem, aparência, atalhos, andares e recibos já são dados centrais. Não depende exclusivamente de fechar o aplicativo.
- Reconexão WebSocket reenvia a credencial escolar em memória. Sessões expiram em quatro horas ou 30 minutos inativas. Queda do processo cliente perde o token e exige novo login, sem perder o vínculo da conta com o personagem.
- Cliente guarda preferências gráficas, endereço de desenvolvimento e migração antiga de atalhos. A campanha offline e credenciais por instalação permanecem em modos de desenvolvimento separados; não devem integrar a nova distribuição escolar.
- Professor possui cadastro de alunos, administração por turmas A/B, bloqueio, encerramento em 60 segundos e confirmação de atividades educacionais. O cadastro público de aluno não existe. Turmas obrigatórias e capacidade padrão de 60 são regras anteriores substituídas pelo prompt 33.
- Electron usa contexto isolado, sem Node no renderer, protocolo próprio e restrição de rede ao endpoint configurado. O endereço vem de `config/multiplayer.json` ou argumentos de teste; mudar o endereço da versão distribuída exige hoje nova configuração/build.
- Há um único build Electron histórico (NSIS/portable), sem servidor empacotado, com pasta de usuário persistente. Não existem ADM, descoberta LAN, TLS local gerenciado, temporadas ou operação de backup pela interface.

## Mudanças necessárias e limites

1. Reutilizar OnlineStore/OnlineTower e SchoolAccess; acrescentar política de servidor único no modo escolar distribuído, preservando cenários históricos de desenvolvimento para regressão.
2. Garantir uma conexão de jogo por conta e limite atômico de até 32. Recuperação usa o token válido após desconexão efetiva; novo login não toma uma conexão ainda ativa.
3. ADM com supervisor Electron e processo separado, armazenamento em pasta de dados do usuário do anfitrião, monitoramento real e comandos administrativos por canal privado, com autenticação de professor. Renderer recebe somente operações permitidas, sem segredos ou acesso ao banco.
4. Cliente distribuído sem servidor/ADM/banco oficial. Cadastro, login, configuração persistida de um endereço, descoberta UDP opcional e verificação explícita da identidade TLS antes de enviar credenciais. Comunicação direta funciona sem descoberta.
5. Migração aditiva de temporadas e vínculos. Contas/characters legados preservados. Operadores do ADM são contas de infraestrutura; personagens de operadores pertencem à temporada e são limpos junto dos alunos quando autorizado.
6. Encerramento, conferência, limpeza confirmada e nova temporada. Sem exclusão automática por 90 dias. Retenção de backups exige configuração explícita da escola; cópias externas precisam de conferência e não podem receber promessa de exclusão definitiva.
7. Backup consistente pela API SQLite e restauração apenas com o servidor parado, validação de integridade e confirmação. Testes exclusivamente em diretórios temporários próprios.
8. Produzir dois builds se as ferramentas locais permitirem, sem atualizar endpoint público nem instaladores históricos.

## Validação prevista

Persistência A→B→A com perfis distintos contra um mesmo banco de teste; reinício do servidor; rejeição de sessão concorrente; invalidação e kick; 32/33 vagas e concorrência; quatro clientes Electron; restrição dos comandos administrativos; descoberta/manual/TLS; temporadas, limpeza, backup/restauração e falhas. Testes existentes e build de ambos os aplicativos.

**Validação física LAN permanece dependente de quatro computadores/pessoas reais. Não será declarada executada por um ensaio local com quatro processos.** A conclusão total da iteração depende desse roteiro presencial.

Referências técnicas consultadas: [verificação de certificados no Electron](https://www.electronjs.org/docs/latest/api/session), [processos auxiliares](https://www.electronjs.org/docs/latest/api/utility-process), [SQLite no Node 24](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html), [backup consistente no SQLite](https://sqlite.org/backup.html).
