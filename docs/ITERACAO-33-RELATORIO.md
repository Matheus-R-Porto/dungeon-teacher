# Dungeon Teacher — Iteração 33

**Estado: implementação e validação local concluídas; aceitação em LAN física pendente.**

O ADM hospeda um único mundo escolar, com banco central e até 32 jogadores. O aplicativo dos alunos cria contas, autentica e retoma personagens nesse servidor. Não há seleção de turma no novo fluxo. A iteração ainda não está declarada totalmente concluída: quatro computadores físicos e as regras da rede da escola precisam passar pelo roteiro presencial.

## Diagnóstico e preservação

A [auditoria inicial](ITERACAO-33-AUDITORIA.md) foi registrada antes das mudanças. O projeto já tinha servidor autoritativo, personagens em SQLite, senhas com scrypt, sessões opacas, transações e persistência das classes, equipamentos e habilidades. O vínculo era conta → personagem; não dependia do computador. Essa persistência foi reaproveitada.

As lacunas eram operacionais: inicialização por terminal, endereço compilado, distribuição única, permissões e horários por turma, substituição da sessão anterior e ausência de um ciclo de temporada administrável. A Iteração 33 adicionou um modo escolar único e produtos separados, mantendo os modos históricos para regressão e desenvolvimento.

Foram preservados as cinco primeiras classes, 80 habilidades, 350 níveis de habilidades, Base 10 / Job de Novato 20 para primeira promoção, Serafina, aparência modular, oito atalhos, mapas e numeração, equipamentos, inventários, combate, conjuração, veneno e teleporte com consentimento. Nenhum arquivo de `sources/` foi alterado. Nenhum endpoint público ou instalador antigo foi publicado ou substituído.

## Entregas

| Produto | Uso | Distribuição Windows x64 |
|---|---|---|
| Dungeon Teacher ADM | Hospedagem, monitoramento, professores, backups e temporadas | Instalador e portátil em `release/iteration33/adm/` |
| Dungeon Teacher | Conexão LAN, cadastro, login e jogo | Instalador e portátil em `release/iteration33/student/` |

Os nomes completos e hashes dos executáveis estão em [DISTRIBUIÇÃO](ITERACAO-33-DISTRIBUICAO.md). A versão interna do projeto foi mantida em 0.6.9; os arquivos de lançamento identificam a Iteração 33. Não houve assinatura com certificado comercial nem publicação automática.

O cliente empacotado não contém código do servidor, processo ADM, banco oficial ou chave privada. A interface administrativa legada foi removida da compilação específica do aluno. Independentemente da interface, o servidor escolar rejeita operações administrativas pela conexão de jogo, inclusive quando a conta é de professor. As ferramentas do professor existentes foram integradas ao canal privado do ADM.

## Usar o ADM

1. Instale **Dungeon Teacher ADM** no computador anfitrião. Também é possível abrir sua versão portátil.
2. No primeiro acesso, crie o usuário administrativo e uma senha de 10 a 128 caracteres. Guarde essas credenciais com o responsável.
3. Para continuar uma instalação anterior, use **Importar banco anterior** antes de criar o primeiro administrador. Encerre o servidor antigo e selecione seu `characters.sqlite`. Opcionalmente selecione a pasta de geografia compartilhada com arquivos `floor-N.json`. A origem é lida e preservada; a cópia importada recebe migrações aditivas. Depois entre com uma conta de professor já existente.
4. Confira a porta, normalmente **8787**, e clique em **Iniciar servidor**. O painel apresenta os endereços das interfaces de rede. Use o endereço da rede escolar, não o de VPN ou adaptador virtual.
5. Abra **Identidade segura do servidor**. O código completo deve ser conferido no primeiro acesso dos alunos.

O painel mostra dados reais: online/offline, ocupação, contas, tempo de funcionamento, integridade, duração do ciclo de simulação, entradas/saídas e jogadores. A tabela mostra nickname, classe, Base, Job, tempo conectado e ID estável da conta.

**Desconectar** abre uma confirmação com nickname e ID. A ação grava o progresso, revoga a sessão e envia exatamente: “Você foi desconectado pelo administrador do servidor.” A conta permanece e pode entrar novamente. O painel não consome vaga; professores jogando consomem.

O servidor roda em um processo separado da janela. Recarregar a interface não interrompe a aula. Ao fechar a janela com o servidor online, é possível cancelar, manter o serviço na área de notificações ou encerrar e sair. Para encerrar é necessário estar autorizado no ADM. O modo em segundo plano depende do computador continuar ligado e sem suspensão.

**Encerrar servidor** exige confirmação, bloqueia novas conexões, avisa jogadores, encerra sessões e fecha o banco após as gravações. Operações de jogo já confirmadas são gravadas durante a sessão; não dependem de um único salvamento final. O controle espera os trabalhos de senha pendentes por até cinco segundos. A interface indica demora após 30 segundos sem resposta, sem repetir automaticamente uma operação destrutiva. Se o processo falhar, o painel oferece reiniciá-lo e verificar o armazenamento.

## Usar o cliente dos alunos

1. Distribua somente **Dungeon Teacher**, não o ADM nem sua pasta de dados.
2. Abra o cliente e use **Encontrar servidor na rede** ou informe `IP:porta`, por exemplo `192.168.1.20:8787`.
3. Confira o código de identidade com o professor no ADM e confirme. A descoberta automática, sozinha, não autoriza o servidor.
4. Escolha **Criar conta**, um identificador e uma senha. Não é solicitado nome real, nascimento ou turma.
5. Entre, crie o personagem e clique em **Continuar**.

O último endereço e a impressão digital do certificado ficam no perfil local. Senhas e tokens de sessão não são gravados nesse arquivo. A conexão do jogo usa TLS e exige a identidade previamente confirmada, inclusive na LAN. Não foi adotada uma exceção global para certificados. Mudanças de IP são feitas em **Configurar conexão**, sem recompilar. Uma identidade diferente deve ser conferida novamente.

Cadastro e login indisponíveis normalmente indicam servidor parado, endereço errado, firewall, rede isolada, certificado não confiado ou temporada encerrada. A conexão manual funciona sem descoberta UDP quando a rede permite conexão direta.

## Persistência e sessões

O banco central conserva identidade, nickname, Base/XP, Job/XP, classe, aparência, atributos e pontos, habilidades por origem, maestria, inventário/quantidades, ouro, equipamentos, consumíveis, atalhos e progresso já suportado. O servidor continua validando as alterações. Estados transitórios de combate seguem a política existente.

Uma segunda entrada na mesma conta é rejeitada enquanto a primeira conexão está ativa, preservando a original. Logout, desconexão efetiva ou expiração permitem recuperar o acesso. O servidor verifica token e conexão atual antes dos comandos; uma conexão antiga não pode continuar alterando o personagem. A recuperação após uma interrupção de rede pode esperar o detector de conexão antes de liberar a conta.

O limite de 32 é aplicado no servidor, inclusive sob entradas concorrentes. A 33ª entrada recebe “Servidor cheio. Tente novamente.” Uma desconexão efetiva libera a vaga. Contas cadastradas e pessoas apenas na tela de login não são vagas de personagem no mundo.

## Temporadas e retenção

Há uma temporada inicial com previsão de 91 dias. O registro contém ID, nome, início, previsão e estado. A data prevista não executa exclusões. Os alunos não escolhem temporada.

1. **Encerrar temporada** para o servidor, conclui as gravações e bloqueia novos cadastros/sessões dessa temporada. Os dados permanecem para conferência.
2. Em **Política de retenção da escola**, registre a decisão do responsável: descarte manual ou prazo de 7, 30, 90 ou 365 dias. O prazo marca backups vencidos; não os apaga automaticamente.
3. Confira o conteúdo e as cópias externas. **Conferir e limpar dados** exige a frase específica `APAGAR <prefixo do ID>`, conferência das cópias externas e autorização para remover os backups gerenciados vinculados à temporada.
4. A limpeza remove contas de alunos, personagens da temporada, sessões, drops, resultados, recibos e registros relacionados. Professores mantêm o acesso administrativo, mas seus personagens também são removidos. Backups de outras temporadas não são apagados por essa operação.
5. Após a limpeza, informe nome e previsão e use **Criar nova temporada**. Mapas, classes, habilidades e configurações são preservados; novos personagens começam sem o progresso anterior.

Uma limpeza interrompida fica em “em processo de limpeza” e pode ser retomada mediante a mesma confirmação. A exclusão do banco usa transação, verificação de chaves estrangeiras, limpeza das páginas e compactação. Isso não constitui promessa de apagamento físico de SSD, snapshots, sincronização ou cópias externas. O responsável precisa conferir também o banco de origem de uma importação, arquivos copiados manualmente, backups do Windows e exportações. O aplicativo não acessa nem apaga essas cópias externas.

Uma revisão automática rejeitou uma proposta inicial que removeria todos os backups. A implementação final restringe a limpeza aos backups associados à temporada confirmada e preserva os demais; não restou ação bloqueada por essa revisão.

## Banco, backup e recuperação

Dados oficiais no Windows: `%APPDATA%\Dungeon Teacher ADM\school-data\`.

- `characters/characters.sqlite`: contas, personagens e registros administrativos.
- `maps/`: geografia compartilhada persistente.
- `identity/server-identity.json`: certificado e chave privada do servidor; não distribuir aos alunos.
- `backups/<ID>/`: cópias consistentes, geografia e manifesto de integridade.

Esses dados ficam fora da pasta de instalação. Os dois instaladores mantêm os dados de usuário ao atualizar/desinstalar. Use uma conta Windows dedicada ao responsável; acesso ao sistema operacional anfitrião continua sendo uma responsabilidade operacional da escola.

**Criar backup consistente** funciona pelo ADM. O banco é copiado pela API de backup do SQLite, não por uma cópia avulsa do arquivo aberto em WAL. O manifesto registra data, temporada, contagens e hashes. A validação verifica SQLite, chaves estrangeiras, versão e conteúdo dos personagens. A geografia também tem hashes.

**Restaurar** exige servidor offline e confirmação. O ADM valida a cópia e cria um backup do estado atual antes de substituí-lo. Um registro de intenção permite repetir a restauração completa após uma interrupção; nenhum banco real foi utilizado nos testes. Depois da restauração, as sessões antigas são invalidadas. Se o backup tiver outras credenciais de professor, entre com elas.

Mantenha uma cópia protegida de recuperação fora do computador, de acordo com a política da escola. Para migração integral de anfitrião, com os dois ADMs fechados, preserve a pasta `school-data` completa, incluindo identidade e geografia. Não copie somente `characters.sqlite` enquanto o servidor está ativo. Sem a identidade original, os clientes precisarão conferir um novo código.

Se a integridade falhar, não apague arquivos nem inicialize outra temporada por tentativa. Preserve a pasta completa e recupere a partir de uma cópia íntegra. Uma restauração interrompida com seu backup ausente exige recuperar esse backup antes de reabrir o armazenamento. Não há promessa de recuperação de um disco fisicamente danificado.

## Testes e evidências

- **878 testes aprovados**: os 872 existentes e seis novos cenários de integração, com várias verificações por cenário.
- Cadastro sem turma; tentativa de atribuir papel de professor pelo cliente ignorada; ferramentas ADM negadas no canal de jogo, mesmo para professor.
- TLS, endereço manual, identidade divergente rejeitada, identidade persistida sem credenciais e descoberta UDP local.
- Persistência A → B → A, atributos e estado completo, sessão duplicada, socket antigo, logout, queda, kick e reinício.
- 33 tentativas concorrentes: exatamente 32 aceitas, professor contado e vaga liberada após desconexão.
- Temporada encerrada mantém dados; limpeza exige confirmações, é retomável e permite uma nova geração sem progresso anterior.
- Backup consistente, corrupção rejeitada, recuperação de restauração interrompida e importação preservando o banco legado original.
- Porta ocupada resulta em erro compreensível e mantém o banco íntegro.
- Compilação do cliente e geração dos instaladores/portáteis dos dois produtos aprovadas. Auditoria dos pacotes: 1.071 entradas no ADM e 480 no cliente, sem banco/identidade privada distribuídos.
- Ensaio real de Electron: ADM em processo separado, quatro clientes e perfis distintos, um único banco de teste; cadastro/login, sincronização, rejeição de sessão duplicada, A → B → A com duas alterações de equipamento, kick, novo login, backup, parada/reinício e recarga da interface ADM.

Os logs completos, relatório estruturado e [galeria](ITERACAO-33-CAPTURAS.html) acompanham esta entrega. Um segundo ensaio carregou os recursos dos arquivos `app.asar` produzidos, com o Electron instalado no projeto e perfis temporários: as oito verificações passaram, incluindo saída do ADM com código zero. Isso verifica o conteúdo empacotado, mas não equivale à execução do instalador em outro computador. O teste de capacidade usou clientes de protocolo; não representa 32 renderizadores Electron nem uma medição da capacidade de hardware da escola. Os testes com quatro Electron ocorreram em **um único computador**. Não houve LAN física nem instalação em computadores de alunos.

## Situação e limites

| Área | Situação |
|---|---|
| Servidor único, ADM, cadastro, sessões e persistência central | Implementados e testados localmente |
| Temporadas, backup, restauração e migração | Implementados e testados localmente |
| Dois produtos Windows | Instaladores e portáteis gerados; conteúdo auditado |
| Quatro clientes Electron contra um banco | Validado localmente, sem simular quatro computadores físicos |
| LAN real, firewall/VLAN, suspensão, hardware e política da escola | Pendente de validação presencial |
| Instalação/atualização em máquinas físicas diferentes e SmartScreen | Pendente; executáveis sem certificado comercial |
| Balanceamento das classes da Iteração 32 | Preservado, continua provisório |
| Endpoint público anterior | Preservado, sem publicação desta versão |

O Chromium registrou uma mensagem nativa de reentrância (`observer_list`) no encerramento sob automação. O processo ADM terminou com código zero, o banco permaneceu íntegro e não houve exceção JavaScript; esse aviso continua registrado como limitação a observar no teste Windows presencial.

O catálogo de atividades educacionais existente está vazio (`config/education.json`); o ADM mantém a concessão autorizada quando atividades forem configuradas. Nenhum conteúdo pedagógico foi inventado. O endereço de rede pode listar VPNs e adaptadores virtuais: escolha a interface utilizada pela escola. A descoberta é uma conveniência, não garantia de conectividade.

## Reproduzir no projeto

Para desenvolvimento e os comandos de teste, use **Node 24.19 ou mais recente**, como no ambiente validado; o ADM distribuído já inclui seu runtime.

```text
npm ci
npm ci --prefix server --ignore-scripts
npm test
npm run adm:dev
npm run student:dev
npm run package:adm
npm run package:student
npm run test:iteration33
npm run test:iteration33:electron
node scripts/verify-iteration33-packages.cjs
```

Os testes criam perfis/bancos temporários. O modo normal usa armazenamento persistente do usuário. `server:start` continua disponível para desenvolvimento/operação técnica, agora com TLS e a pasta persistente do ADM no modo escolar. Não execute o servidor técnico simultaneamente com o ADM sobre o mesmo banco.

Arquivos alterados e adicionados estão em [ITERACAO-33-ARQUIVOS.json](ITERACAO-33-ARQUIVOS.json). A mudança concentrou-se em `server/`, `desktop/`, lobby, conexão e configurações de distribuição; não reimplementou o jogo.

Referências técnicas: [Electron utilityProcess](https://www.electronjs.org/docs/latest/api/utility-process), [verificação de certificados por sessão](https://www.electronjs.org/docs/latest/api/session), [API SQLite do Node](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html) e [backup consistente do SQLite](https://sqlite.org/backup.html).

Para concluir a aceitação presencial, preencha o [roteiro de quatro computadores](ITERACAO-33-TESTE-LAN.md).
