# Iteração 36 — Revisão Visual 2: distribuição

Versão interna **0.6.10**, Windows x64. Nenhum pacote foi publicado automaticamente. Os 16 executáveis anteriores foram preservados e conferidos por SHA-256.

| Aplicativo | Tipo | Arquivo | Tamanho |
|---|---|---|---:|
| ADM | Portátil | [Dungeon Teacher ADM-Iteracao36-RevisaoVisual2-0.6.10-Portable.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv2/adm/Dungeon Teacher ADM-Iteracao36-RevisaoVisual2-0.6.10-Portable.exe>) | 106.5 MiB |
| ADM | Instalador | [Dungeon Teacher ADM-Iteracao36-RevisaoVisual2-0.6.10-Setup.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv2/adm/Dungeon Teacher ADM-Iteracao36-RevisaoVisual2-0.6.10-Setup.exe>) | 106.7 MiB |
| Aluno | Portátil | [Dungeon Teacher-Iteracao36-RevisaoVisual2-0.6.10-Portable.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv2/student/Dungeon Teacher-Iteracao36-RevisaoVisual2-0.6.10-Portable.exe>) | 232.0 MiB |
| Aluno | Instalador | [Dungeon Teacher-Iteracao36-RevisaoVisual2-0.6.10-Setup.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv2/student/Dungeon Teacher-Iteracao36-RevisaoVisual2-0.6.10-Setup.exe>) | 232.2 MiB |

[Manifesto completo](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv2/manifest.json>) · [SHA256SUMS.txt](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv2/SHA256SUMS.txt>)

Os quatro arquivos foram abertos como contêineres e tiveram o payload ASAR e o executável x64 comparados ao diretório de distribuição. Os recursos embarcados foram comparados aos arquivos finais do projeto. A auditoria confere separação Aluno/ADM, dependências do ADM e ausência de bancos, chaves privadas, sources e logs.

O ADM foi reconstruído para manter a identificação da distribuição, sem mudança funcional em servidor, TLS, temporadas, backups ou persistência. O teste Electron abriu os recursos ASAR reais dos pacotes com perfis temporários, um ADM e dois Alunos; não abriu bancos oficiais.

Não foram realizadas instalação interativa dos dois instaladores, assinatura digital ou validação presencial em computadores separados. Os testes dos recursos embarcados não equivalem a esses procedimentos.

```text
4e1c35fb6e1f812c326372ada2d5804c70217c3450c803f79c0c2d8b38f2e623  adm/Dungeon Teacher ADM-Iteracao36-RevisaoVisual2-0.6.10-Portable.exe
785b546a1ad88964bdc94ef6410fa67ab308f02b92a070035473bb27273ac69c  adm/Dungeon Teacher ADM-Iteracao36-RevisaoVisual2-0.6.10-Setup.exe
bfc30c0bcd7c7f1722dc948838b946da9cc2f1245ee0708a889d78dd2125e473  student/Dungeon Teacher-Iteracao36-RevisaoVisual2-0.6.10-Portable.exe
a5f6c8c8f759a1b5954acc094f184985150e0fcfd39afeac3ebe241d20fa1159  student/Dungeon Teacher-Iteracao36-RevisaoVisual2-0.6.10-Setup.exe
```
