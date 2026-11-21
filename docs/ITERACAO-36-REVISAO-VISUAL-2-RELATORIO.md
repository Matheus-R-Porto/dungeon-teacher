# Dungeon Teacher — Iteração 36 — Revisão Visual 2

Revisão de poses, perspectiva e continuidade sobre a RV1. **Aprovação visual provisória, aguardando inspeção do usuário.** Não é a Iteração 37.

## O que mudou

Braços articulados no cotovelo e posturas de transporte próprias para espada, arco, cajado e adagas. A espada empunhada baixa durante a caminhada; a arma guardada fica no quadril. Escudo com face traseira e perspectiva de transporte. Mochila inteira acompanhando o tronco e ocultando equipamentos de forma contextual. Transições de 100–140 ms mantêm mãos e equipamentos sincronizados, sem alterar tempos de combate.

O corpo em jogo passa a usar camadas compartilhadas e uma superfície de 128 × 128 por ator, atualizada quando a pose muda. O cache de modelos continua limitado a oito aparências, e o cache compartilhado de quadros tem limite de 96. A troca apenas de arma/escudo reutiliza o modelo corporal. A função de atlas 24 × 4 continua disponível para prévias e compatibilidade. O saque articula o braço até a bainha antes de transferir a arma para a mão; a guarda faz o caminho inverso.

## Diagnóstico

O antigo primeiro quadro rotulado `walk-1` era, na realidade, a segunda célula da caminhada. Na sequência antiga ele representava arma guardada. A RV1 também reutilizava o braço rígido parado para caminhar e deixava a espada empunhada erguida; o cálculo de saque podia atravessar um ângulo lateral. A camada da arma guardada traseira sobrepunha a mochila. [Auditoria completa, separando geometria, anatomia, perspectiva, continuidade e aprovação visual](ITERACAO-36-REVISAO-VISUAL-2-AUDITORIA.md).

## Evidências comparáveis

[Galeria de capturas](capturas/iteration36-rv2/index.html): **192 pranchas**, 96 combinações por versão, 20 estados × 4 direções, total de **15.360 quadros comparativos**. Antes é o código RV1 preservado no início desta revisão; depois é a RV2. Câmera, personagem, equipamento e estado são equivalentes. As duas capturas do usuário estão preservadas, com arma guardada/empunhada explicitamente identificadas nas reproduções.

Gravação real: **883 quadros em 40.7 segundos**, incluindo todos os cinco quadros de costas das quatro famílias e transições repouso/caminhada/ataque. Uma segunda gravação coletiva reúne as seis classes e os dois corpos. Há ainda uma demonstração desacelerada do saque e da guarda nas quatro direções. As pranchas de inspeção e a galeria incluem as seis classes, ambos os corpos, as quatro direções, tamanho nativo, redução e silhueta. As ampliações são recortes das capturas reais, sem redesenhar o personagem para a evidência.

## Testes

- **927 testes automatizados aprovados, zero falhas**, preservando os 915 da RV1 e acrescentando 12 testes. O teste RV1 recebeu apenas a nova textura traseira do escudo em seu objeto simulado; suas verificações não foram removidas.
- 48 conjuntos anatômicos e 32 referências físicas de empunhadura; câmera inclinada, vínculo de mãos e sprites durante as transições, estado guardado/empunhado, famílias de pose, orientação e continuidade angular.
- **1056 poses de mochila**: peça conectada, sem pixels cortados na borda; maior variação relativa de área **0.183%**. Esse teste detecta perda de geometria; não aprova anatomia ou arte.
- Compilação do cliente e auditoria dos quatro pacotes Windows x64.
- Electron e multiplayer com os recursos ASAR finais, contas e banco temporários.

- Dois personagens temporários com equipamentos válidos; banco isolado preparado e fechado antes de abrir o ADM.
- ADM e dois Alunos do pacote: espada, escudo, mochila, armadura e aparência iguais no jogador e no observador.
- Caminhada autorizada em quatro destinos: quadros e mudança de direção registrados no jogador e no observador.
- Quatro famílias de armas e troca de armadura pela autoridade do servidor; adagas gêmeas sem escudo, combinação restaurada ao final.
- Movimento e combate reais na Torre: quadros mudam em ambos os clientes e ambos recebem o dano confirmado pelo ADM.
- Reconexão conserva inventário, equipamentos, classe, aparência e atlas pronto.
- Cliente reiniciado no mesmo perfil recupera a combinação completa; observador também recebe a aparência restaurada.
- ADM encerrou com código zero após gravar o banco temporário.

O primeiro roteiro de validação final parou ao tentar alcançar o centro do portal. A ferramenta de teste passou a escolher um ponto caminhável que satisfaz a própria regra de interação do jogo; o servidor continua autorizando a viagem. A navegação, os mapas e as regras do produto não foram alterados. O resultado acima corresponde à repetição completa após essa correção do roteiro.

## Desempenho medido

Comparação nova RV1/RV2 na mesma máquina, em execuções separadas e sem a suíte de testes concorrendo. Três processos Aluno, mesmos perfis e roteiro: 12 segundos na cidade e 20 segundos de combate contra o MVP. CPU é tempo de tarefas do renderizador dividido pela janela de coleta, não uso total do computador.

| Versão | Cenário | FPS médio | CPU de tarefas | Heap JS médio | Objetos de textura / fontes |
|---|---|---:|---:|---:|---:|
| RV1 | Cidade | 36.75 | 97.61% | 18.59 MiB | 26.0 / 18.0 |
| RV1 | Combate MVP | 58.79 | 97.13% | 24.10 MiB | 202.3 / 22.0 |
| RV2 | Cidade | 34.85 | 92.47% | 14.59 MiB | 26.0 / 18.0 |
| RV2 | Combate MVP | 48.87 | 97.67% | 20.90 MiB | 202.0 / 21.3 |

Nesta coleta, a RV2 apresentou menor heap JavaScript, porém FPS menor: 34,85 contra 36,75 na cidade e 48,87 contra 58,79 no combate (queda de aproximadamente 16,9% no combate). O custo visual deve ser considerado na avaliação em máquinas da escola. Estes resultados não sustentam uma melhoria geral de desempenho.

Mediana de preparação de corpo na matriz: **98.65 ms na RV1 e 73.70 ms na RV2**. Inclui carregamento e aquecimento; não é um benchmark isolado da GPU. A textura corporal ativa cai de 6 MiB para 64 KiB por superfície, mas a RV2 também mantém camadas e quadros em cache na CPU: essa comparação não representa toda a memória do processo. Interpolar poses exige trabalho de composição durante o movimento; os números de FPS e CPU acima devem ser lidos junto desse custo.

As amostras brutas, percentis, etapas de animação/renderização, inventário de texturas e visibilidade estão em `performance-before.json` e `performance-after.json` na galeria. O teste usa AMD Ryzen 5 6600H with Radeon Graphics         , Windows 11 Home Single Language, Node v24.19.0 e Electron do projeto. São janelas curtas locais; não demonstram ausência de vazamento em sessões longas nem ganho geral para qualquer laboratório escolar.

## Preservação e aplicativos

**297 PNGs originais idênticos** ao pacote original. Auditoria por hash dos arquivos-base confirma que domínio, simulação, mapas, dados, servidor, inicialização dos aplicativos e `sources/` não foram alterados. Combate, IA, bosses, progressão, persistência, TLS, temporadas e backups mantêm sua implementação.

Distribuição **0.6.10 — Iteração 36 — Revisão Visual 2**, com ADM/Aluno instalador e portátil. **16 executáveis anteriores preservados**. [Aplicativos, manifesto e hashes SHA-256](ITERACAO-36-REVISAO-VISUAL-2-DISTRIBUICAO.md). Nenhuma publicação automática ou banco oficial alterado. O ADM é funcionalmente compatível e foi reconstruído para identificar o conjunto da revisão.

## Limitações e próxima avaliação

A reprodução é equivalente, não a recuperação da conta da captura. A continuidade usa os cinco quadros de pernas e quatro direções existentes. A avaliação de naturalidade permanece provisória até o usuário inspecionar a galeria e o jogo. Não houve instalação interativa dos instaladores, assinatura digital, teste presencial em PCs separados ou teste prolongado de vazamento de memória. Os recursos reais embarcados foram executados em processos separados na mesma máquina.

[Arquivos alterados](ITERACAO-36-REVISAO-VISUAL-2-ARQUIVOS.md) · [Auditoria](ITERACAO-36-REVISAO-VISUAL-2-AUDITORIA.md) · [Galeria](capturas/iteration36-rv2/index.html).
