# Iteração 31 — revisão local

O endpoint público anterior não foi atualizado. Estes passos usam o servidor local e um banco de revisão separado. Execute na pasta do projeto, com as dependências já instaladas.

## 1. Preparar a conta do professor

Em PowerShell:

```powershell
$env:CHARACTER_DATA_DIR = Join-Path $PWD '.logs\school-review\characters'
$env:WORLD_DATA_DIR = Join-Path $PWD '.logs\school-review\maps'
npm run school:teacher -- professor
```

A senha é solicitada sem exibição. Não a coloque no comando. Crie a conta apenas uma vez nesse banco. A e B começam fechadas. Não foram criadas contas reais durante a implementação.

## 2. Iniciar o servidor

Na mesma janela, mantendo as duas variáveis acima:

```powershell
npm run server:start
```

Deixe a janela ativa. Por padrão escuta `127.0.0.1:8787`. Não é uma publicação na internet.

## 3. Abrir o jogo

Em outra janela, na pasta do projeto:

```powershell
npm run desktop:test:school
```

Isso compila o cliente e abre o perfil isolado SchoolReview no fluxo escolar. Entre como professor, prepare contas de alunos e libere a turma desejada. Para outra janela independente:

```powershell
npx electron . --test-profile=SchoolStudent --school
```

Fechar entrada impede novos acessos; Encerrar em 60 s também finaliza as sessões existentes ao fim do prazo. Cancelar encerramento mantém a turma fechada para novas entradas até que seja liberada novamente.

## Configuração

- `SCHOOL_WORLD_CAPACITY`: jogadores simultâneos, padrão 60.
- `SCHOOL_CONNECTIONS_PER_IP`: conexões transitórias por IP, padrão 128.
- `SCHOOL_MAX_CONNECTIONS`: total de conexões, padrão 128.
- `SCHOOL_UPGRADES_PER_WINDOW`: tentativas de abertura por janela, padrão 160.
- A capacidade de contas por turma começa em 30 e pode ser alterada pela operação administrativa `capacity`; limites centrais em `SchoolAccess`.
- `EDUCATION_CONFIG`: arquivo JSON de atividades autorizadas; padrão `config/education.json`. Começa vazio.
- `DEVELOPMENT_ACCESS=1`: servidor legado para testes anteriores; não é o modo escolar.

O registro educacional aceita IDs estáveis e definições com `name`, `baseXP`, `jobXP`, `repeat` opcional e `unlockClass` opcional para profissão definida. Preencha somente com atividades curriculares aprovadas. O professor confirma a conclusão no painel; valores não são enviados livremente pelo aluno.

As metas de progressão e os valores provisórios estão descritos no relatório. Não configurar o servidor público nem substituir bancos de uso real durante essa revisão local.
