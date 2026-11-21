# Iteração 34 — empacotamento final

**Empacotamento local concluído em 28/10/2026.** Quatro artefatos Windows x64 gerados e auditados, versão interna 0.6.9. A instalação e o teste LAN presencial permanecem pendentes. Esta entrega continua a Iteração 34: não inicia a 35 nem altera mecânicas, mapas, numeração, identidade visual ou balanceamento.

[Quatro executáveis e hashes](ITERACAO-34-DISTRIBUICAO.md) · [Galeria de 18 capturas](ITERACAO-34-EMPACOTAMENTO-CAPTURAS.html) · [Relatório anterior de desenvolvimento](ITERACAO-34-RELATORIO.md)

## Mudanças desta entrega

- Configurações existentes `electron-builder.adm.yml` e `electron-builder.student.yml`: saída em `release/iteration34`, nomes com `Iteracao34`. Mantidos versão 0.6.9, IDs, empacotador e política `--publish never`.
- Os ensaios Electron existentes aceitam `DT_PACKAGE_ROOT`, mantendo o padrão anterior `release/iteration33`. Acrescentados `scripts/package34-electron.mjs` (regressão básica ampliada) e `scripts/verify-iteration34-packages.cjs` (conteúdo, arquitetura e payload dos quatro arquivos).
- Manifesto, somas SHA-256, relatório, evidências brutas e galeria. README e índice de relatórios apontam para esta distribuição; relatos anteriores permanecem históricos.
- Nenhuma alteração em arquivos de jogo/servidor desta etapa; as correções de filas, snapshots, backup online, gráficos, recuperação de ataques/habilidades, Lobo, Cavaleiro e lápide vieram do código já concluído na 34.

## Testes aprovados e alcance

| Verificação | Resultado |
|---|---|
| `npm test` | **894 aprovados**, zero falhas, cancelamentos ou testes ignorados; 129,99 s. Inclui testes das iterações 33 e 34, protocolo, persistência, sessões, limite de jogadores, temporadas e backup concorrente. |
| `npm run build` | Aprovado. |
| `npm run package:adm` e `npm run package:student` | Dois produtos, quatro executáveis. Cliente compilado em modo LAN exclusivo pelo script existente. |
| ADM + quatro alunos básicos | Aprovado, ambos usando ASAR desta distribuição. Regressão da 33 repetida e ampliada para mapa, combate, descoberta e restauração. |
| Três alunos preparados | Aprovado, clientes usando ASAR 34 e servidor Node com fontes iguais às incluídas no ADM. TLS, personagens válidos, renderização, comandos de combate e lápide sincronizada. |
| Auditoria e hashes | Aprovados nos quatro arquivos; payloads e executáveis internos iguais aos diretórios `win-unpacked`. |
| Preservação | Quatro executáveis da 33 e 16 fontes de produção registradas na 34 com hashes inalterados. |

### Integração do ADM com quatro clientes

- ADM real inicia servidor em processo separado e mostra zero vagas ocupadas.
- Descoberta UDP local, identidade do ADM e ausência da ponte administrativa no aluno.
- Quatro processos Electron, quatro perfis, um servidor e um banco: cadastro, login, personagens e sincronização.
- Segundo login rejeitado sem derrubar o cliente original.
- Troca A → B → A entre perfis Electron separados conserva personagem e duas alterações reais de equipamento.
- Kick pela interface confirma conta correta, mostra mensagem exata e permite novo login.
- Backup pelo ADM, parada e reinício do mesmo banco preservam equipamento e progresso.
- Recarregar a interface ADM não interrompe o processo servidor nem a sessão do aluno.
- Movimentação, entrada real na Torre e dano de combate confirmados pelo servidor do pacote.
- Restauração do backup temporário preserva quatro contas, temporada, identidade TLS e personagem; sem criar ou limpar temporada.
- ADM encerra normalmente com código zero após gravar e parar o serviço.

O perfil foi comparado entre computadores simulados A → B → A, após reinício e após restauração, para nome, classe, ouro, inventário, equipamentos, atributos, profissões/progressões, aparência e barra de habilidades. Foram feitas alterações reais de equipamento. A capacidade declarada permaneceu 32 e o ADM começou com zero jogadores; este ensaio conectou quatro, não 32 alunos gráficos. Nenhuma operação de criar, limpar ou encerrar temporada foi acionada. O banco temporário novo inicializa a temporada padrão do sistema, cuja identidade foi conservada no ciclo de backup/restauração.

### Recursos efetivamente executados

O teste carregou `release/iteration34/adm/win-unpacked/resources/app.asar/desktop/adm-main.cjs` e o equivalente do aluno pelo Electron **44.5.1**, a mesma versão embarcada. Dessa forma, interface, preload, servidor e dependências vieram do pacote, sem recompilar fontes para o ensaio básico. A extração independente dos quatro executáveis confirmou que seus ASARs e executáveis internos são idênticos aos auditados em `win-unpacked`.

O processo de teste usa o caminho de perfis temporários já previsto no projeto; `app.isPackaged` fica falso nesse lançamento. Por isso esta validação não cobre todas as diferenças de inicialização do executável final, do instalador, atalhos ou desinstalação. A abertura direta dos executáveis de produção usaria o perfil real: o código aceita `DT_TEST_PROFILE` somente fora do modo empacotado, e um ensaio de caminho mostrou que alterar `APPDATA` não redireciona `app.getPath('appData')`. Não se alterou o produto para contornar essa proteção. Nenhum instalador foi executado contra os dados oficiais.

### Ensaio gráfico complementar

Três processos Electron reais no mesmo computador, com clientes preparados, durante janelas de aproximadamente 20 segundos. O servidor deste ensaio complementar foi iniciado via Node a partir das fontes verificadas; não foi o processo ADM. A morte do Lobo foi provocada como fixture para inspecionar posição, data, finalizador e estado compartilhado da lápide, sem alegar vitória natural ou novo estudo de balanceamento.

| Fase | Cliente | FPS médio observado | Quadro p95 (ms) |
|---|---:|---:|---:|
| 01-cidade-clientes-reais | 1 | 51.1 | 27.1 |
| 01-cidade-clientes-reais | 2 | 51.0 | 26.6 |
| 01-cidade-clientes-reais | 3 | 49.6 | 28.9 |
| 02-combate-lobo-branco | 1 | 84.8 | 15.8 |
| 02-combate-lobo-branco | 2 | 90.4 | 14.7 |
| 02-combate-lobo-branco | 3 | 90.0 | 15.1 |

Essas medições são apenas observações locais, sem promessa de desempenho na escola. O ensaio de quatro clientes preparados que excedeu o prazo na etapa anterior não foi exigido nem repetido como condição para liberar os pacotes. Detalhes completos, CPU, GPU, visibilidade e amostras constam no JSON bruto.

## Auditoria do conteúdo

ADM: **1.072 entradas**, 132 arquivos comparados com o projeto; cliente: **480 entradas**, 460 arquivos comparados. Conferidos imports relativos e dependências do servidor, pontos de entrada, versão e cabeçalho x64 do executável de cada produto. Não foram encontrados banco oficial, identidade TLS persistente, arquivos PEM/KEY, `sources/`, logs ou pasta de dados nos arquivos empacotados. O cliente não contém diretório `server`, processo/ponte/interface ADM; a ponte administrativa também esteve ausente na execução.

`server/backups.js` incluído no ADM tem SHA-256 `5ccd12d352e4c6bcfe1eae81aff8c55c1cccd9e98774d96f1f8a8268501dcee6`, igual ao registro da Iteração 34 com a correção de snapshot de leitura dedicado. Os bundles e recursos gráficos do aluno foram comparados byte a byte com o build atual. Nenhum arquivo antigo da 33 foi reutilizado como entrega da 34.

Todos os quatro executáveis estão **sem assinatura digital comercial**. Nomes, datas UTC, tamanho exato e SHA-256 estão no documento de distribuição e no manifesto.

## Preservação e ocorrências

O diretório consultado não se apresentou como worktree Git; a verificação usou o manifesto da 34 e hashes anteriores/posteriores, sem commits ou alterações de branches. Os quatro artefatos da 33 mantiveram os hashes originais. `sources/` manteve seu inventário vazio. Não foram encontrados arquivos nos caminhos oficiais padrão inspecionados (`Dungeon Teacher ADM/school-data` e conexão do cliente); isso não afirma que não existam dados em outros perfis Windows. Nenhum dado oficial foi importado, apagado ou sobrescrito, nenhuma identidade existente foi renovada e nenhum endpoint foi alterado. Testes usaram exclusivamente bancos e perfis temporários.

A primeira execução ampliada falhou no próprio script de teste: uma coordenada negativa gerou a expressão JavaScript `p.z--24`. Foram adicionados parênteses ao interpolar coordenadas, sem alteração no produto. A execução completa posterior passou. A primeira evidência foi mantida em `primeira-tentativa-corrigida.json`, sem apresentá-la como aprovação.

## Evidências e reprodução

Evidências em `docs/dados/empacotamento34/`:

- [Suíte completa](dados/empacotamento34/package34-tests.txt), [compilação](dados/empacotamento34/package34-build.txt), [build ADM](dados/empacotamento34/package34-adm-build.txt), [build aluno](dados/empacotamento34/package34-student-build.txt).
- [Quatro clientes](dados/empacotamento34/quatro-clientes.json), [três preparados](dados/empacotamento34/tres-preparados.json), [primeira tentativa corrigida](dados/empacotamento34/primeira-tentativa-corrigida.json).
- [Auditoria](dados/empacotamento34/package34-audit.json), [assinaturas](dados/empacotamento34/package34-signatures.json), [preservação](dados/empacotamento34/package34-preservation.json).

Comandos na raiz do projeto, sem executar simultaneamente ensaios gráficos pesados:

```powershell
npm test
npm run build
npm run package:adm
npm run package:student
node scripts/verify-iteration34-packages.cjs
node scripts/package34-electron.mjs
$env:DT_USE_PACKAGES='1'
$env:DT_PACKAGE_ROOT='release/iteration34'
$env:DT_CLIENTS='3'
node scripts/iteration34/electron.mjs
```

Regerar binários muda datas e possivelmente hashes; conferir um novo manifesto após qualquer build. Os relatórios de desenvolvimento e carga da 34 permanecem como histórico, sem alegar que toda a campanha de carga foi refeita nesta etapa.

## Próxima validação presencial

Instalar/abrir os artefatos em computadores de teste da escola e seguir o [roteiro LAN](ITERACAO-34-TESTE-LAN.md). Conferir descoberta entre máquinas, firewall, TLS, persistência fora da instalação, renderização no hardware escolar e encerramento. O empacotamento local está concluído; aprovação de instalação e da LAN física ainda não foi obtida.
