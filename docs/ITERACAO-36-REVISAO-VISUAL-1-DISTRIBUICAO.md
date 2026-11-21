# Iteração 36 — Revisão Visual 1: distribuição

Quatro aplicativos Windows x64 reconstruídos, versão interna 0.6.9, com identificação corretiva nos nomes. Nenhuma publicação automática.

| Produto | Formato | Arquivo | Tamanho |
|---|---|---|---|
| ADM | Portátil | [Dungeon Teacher ADM-Iteracao36-RevisaoVisual1-0.6.9-Portable.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv1/adm/Dungeon Teacher ADM-Iteracao36-RevisaoVisual1-0.6.9-Portable.exe>) | 106.5 MiB |
| ADM | Instalador | [Dungeon Teacher ADM-Iteracao36-RevisaoVisual1-0.6.9-Setup.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv1/adm/Dungeon Teacher ADM-Iteracao36-RevisaoVisual1-0.6.9-Setup.exe>) | 106.7 MiB |
| Aluno | Portátil | [Dungeon Teacher-Iteracao36-RevisaoVisual1-0.6.9-Portable.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv1/student/Dungeon Teacher-Iteracao36-RevisaoVisual1-0.6.9-Portable.exe>) | 232.0 MiB |
| Aluno | Instalador | [Dungeon Teacher-Iteracao36-RevisaoVisual1-0.6.9-Setup.exe](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv1/student/Dungeon Teacher-Iteracao36-RevisaoVisual1-0.6.9-Setup.exe>) | 232.2 MiB |

## Verificações

- Arquitetura PE x64 conferida.
- Conteúdo ASAR dos quatro instaladores/portáteis extraído e comparado aos recursos preparados; executáveis internos também conferidos.
- Recursos distribuídos comparados ao código e à compilação final.
- Cliente sem servidor, administração, dados escolares ou chaves privadas.
- ADM e dois Alunos executados a partir dos ASAR finais com Electron e perfis temporários.
- Os 12 executáveis das entregas 33, 34 e 36 original mantêm os hashes anteriores.

O ADM não precisava de uma alteração funcional para este ajuste visual. Foi reconstruído para entregar o conjunto solicitado de quatro aplicativos com identificação coerente; regras, protocolo, autenticação e persistência do servidor continuam iguais.

Os aplicativos não possuem assinatura Authenticode. Não foi realizada instalação interativa dos instaladores nem teste presencial em computadores distintos. O teste Electron carregou os recursos reais extraídos da distribuição, com perfis isolados, e não executou dados oficiais.

## SHA-256

**Dungeon Teacher ADM-Iteracao36-RevisaoVisual1-0.6.9-Portable.exe**

`c8917f89c29c0bd824b9e669bec56eb23f213d7e3637f559bab39cad2013afe3`

**Dungeon Teacher ADM-Iteracao36-RevisaoVisual1-0.6.9-Setup.exe**

`d6a983636b731d21c83d7693fcda4aaab26c2e1a8068093581b073740dbd2645`

**Dungeon Teacher-Iteracao36-RevisaoVisual1-0.6.9-Portable.exe**

`aa45c561c59c905dcff6229a5b2925a2aec16e83b9baa54f33458f375fe5c6fd`

**Dungeon Teacher-Iteracao36-RevisaoVisual1-0.6.9-Setup.exe**

`f05427c6e540791fd9e50e6892c7a1c9e30d0f871ea115af58d8b3835a53eb22`

[Manifesto completo](C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/release/iteration36-rv1/manifest.json).
