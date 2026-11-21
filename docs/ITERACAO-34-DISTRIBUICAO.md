# Iteração 34 — distribuição Windows

Gerada em 28/10/2026, versão interna **0.6.9**, arquitetura **Windows x64** nos quatro artefatos. Os nomes `Iteracao34` e os hashes distinguem esta distribuição da 33. Mantidos versão e IDs dos aplicativos para preservar os caminhos de dados existentes. Não houve publicação ou alteração de endpoint público.

| Arquivo | Tipo | Tamanho em bytes (MiB) | Geração UTC |
|---|---|---:|---|
| [Dungeon Teacher ADM-Iteracao34-0.6.9-Portable.exe](../release/iteration34/adm/Dungeon%20Teacher%20ADM-Iteracao34-0.6.9-Portable.exe) | Portátil | 111,690,348 (106.52 MiB) | 2026-10-28T15:06:02.933Z |
| [Dungeon Teacher ADM-Iteracao34-0.6.9-Setup.exe](../release/iteration34/adm/Dungeon%20Teacher%20ADM-Iteracao34-0.6.9-Setup.exe) | Instalador | 111,920,465 (106.74 MiB) | 2026-10-28T15:05:58.229Z |
| [Dungeon Teacher-Iteracao34-0.6.9-Portable.exe](../release/iteration34/student/Dungeon%20Teacher-Iteracao34-0.6.9-Portable.exe) | Portátil | 233,308,370 (222.50 MiB) | 2026-10-28T15:06:52.968Z |
| [Dungeon Teacher-Iteracao34-0.6.9-Setup.exe](../release/iteration34/student/Dungeon%20Teacher-Iteracao34-0.6.9-Setup.exe) | Instalador | 233,538,338 (222.72 MiB) | 2026-10-28T15:06:43.622Z |

[Manifesto verificável](../release/iteration34/manifest.json) · [SHA256SUMS](../release/iteration34/SHA256SUMS.txt) · [Relatório de validação](ITERACAO-34-EMPACOTAMENTO.md)

## Uso na escola

Escolher o ADM para o computador que hospeda a escola e o cliente Dungeon Teacher para os alunos. Setup é o instalador; Portable permite iniciar sem instalação. Ambos continuam usando dados persistentes no perfil Windows, não ao lado do executável. Não alternar versões com o servidor em execução; os arquivos da 33 foram preservados como referência, sem validar retorno do banco da 34 para a 33.

O ADM mantém `%APPDATA%\Dungeon Teacher ADM\school-data`; o cliente mantém a configuração de conexão em `%APPDATA%\Dungeon Teacher`. Banco, contas, personagens e identidade privada TLS pertencem ao ADM e não acompanham o aluno. Não foi necessária migração adicional para este empacotamento.

Os quatro arquivos apresentam **Authenticode: NotSigned**. Não possuem assinatura digital comercial. O SHA-256 identifica os bytes locais desta entrega; não substitui assinatura de editor.

Os recursos dos pacotes foram executados em perfis temporários e comparados com os conteúdos de cada instalador/portátil. Instalação, desinstalação e abertura direta dos quatro executáveis no perfil de produção não foram feitas. A validação presencial permanece pendente; usar o [roteiro LAN](ITERACAO-34-TESTE-LAN.md), registrando os hashes desta entrega. Não interpretar os ensaios locais como aprovação de 32 computadores físicos.

## SHA-256

**Dungeon Teacher ADM-Iteracao34-0.6.9-Portable.exe**

`fd234d9d1faf4d47100f53062fef36d30e65e9485cefbdbba44b398b94d326a7`

**Dungeon Teacher ADM-Iteracao34-0.6.9-Setup.exe**

`a4a2acac69e47f8983311ad431af26834e98ea00e511e144b5fe0b84bfe2f292`

**Dungeon Teacher-Iteracao34-0.6.9-Portable.exe**

`a2ccec013bd75a33418ab189c000f689acc75c469d446d8f16f84bcee83a5d93`

**Dungeon Teacher-Iteracao34-0.6.9-Setup.exe**

`fbd63a1d204dab47c15638fdb3c4d8d75619c78846049cdcad3ad94567e10bbd`
