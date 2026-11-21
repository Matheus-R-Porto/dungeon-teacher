# Dungeon Teacher — Iteração 36 — Revisão Visual 1

Revisão complementar da Iteração 36. Não inicia a Iteração 37.

## Resultado

A espada e as demais armas agora usam a empunhadura medida na própria arte e o mesmo plano de câmera das mãos. O escudo acompanha a mão secundária com centro e profundidade corrigidos. A mochila é transformada como uma camada inteira presa ao tronco; seus bolsos e alças não passam mais pelo recorte dos braços. Cabeça, colete, anel e bainha têm referências próprias, mantendo o estilo e as proporções da Iteração 36.

## Referências examinadas

Foram abertos o relatório original da 36, as pranchas anteriores, os PNGs originais de corpos/armas/equipamentos, as seis classes normalizadas, o compositor e o renderizador. O `iteration36.rar` foi extraído e seus 86 arquivos conferidos como idênticos à galeria anterior. A captura `imagem exemplo.png`, de 568 × 568, foi aberta depois que o usuário informou sua localização.

A reprodução usa guerreiro masculino, cabelo cacheado, espada de treino, escudo de madeira, mochila, colete e botas de viajante. É equivalente à imagem; os dados exatos do personagem não podem ser recuperados da captura. Nenhum equipamento foi removido para esconder o defeito. As adagas gêmeas usam uma combinação própria sem escudo, conforme a regra existente.

## Causas e correções

- O compositor antigo recortava os braços depois de juntar mochila, colete e cabeça ao corpo. Partes desses equipamentos recebiam rotações de membros. Agora apenas a camada corporal é recortada; mochila e colete permanecem íntegros.
- Os punhos antigos usavam coordenadas fixas para todas as classes e vistas. A revisão usa 48 conjuntos anatômicos, cobrindo seis classes, dois corpos e quatro direções, ligados às mesmas poses do atlas.
- O corpo acompanhava a câmera, mas os equipamentos eram deslocados no eixo vertical do mundo. A revisão compartilha os eixos horizontal, vertical e normal da câmera, além da altura do corpo.
- A empunhadura da espada e o centro do escudo eram genéricos. Foram medidos pontos na arte existente. O teste de pixels encontrou também um ponto do arco no espaço entre madeira e corda; esse ajuste foi corrigido antes da entrega final, inclusive no arco guardado.
- A profundidade varia conforme direção e braço. O teste de profundidade do cenário continua ativo, evitando atravessar paredes. Cabelo, capuz e cabeça mantêm a escala anterior.

## Evidências visuais

[Galeria interativa](capturas/iteration36-rv1/index.html): 192 pranchas pareadas, com exatamente os mesmos personagens, equipamentos, câmera e poses. São oito combinações × seis classes × dois corpos × quatro direções × 12 estados: **9.216 quadros**, metade antes e metade depois.

As pranchas cobrem repouso, caminhada, quadros de saque, preparação, impacto, recuperação, conjuração, dano, morte e retorno ao repouso. A inspeção visual incluiu as seis classes, os dois corpos e as quatro famílias, especialmente as vistas laterais e de costas com mochila, os encaixes durante o golpe e a sobreposição do capuz. A galeria permite ampliar mão/arma, braço/escudo e costas/mochila no mesmo recorte antes/depois.

Há duas gravações produzidas com o SpriteActor real: uma comparação coletiva das seis classes e dois corpos (379 quadros capturados, 24.5 s) e uma comparação ampliada do guerreiro equivalente à referência (596 quadros, 24.3 s). As sequências passam por caminhada, mudança de direção, ataque, repouso, conjuração e troca entre as quatro famílias. Os quadros dessas gravações foram inspecionados em sequência. A captura coletiva exige múltiplas renderizações por quadro e preparação das versões comparadas; não representa o FPS da campanha.

## Testes automatizados

- **915/915 testes aprovados** na suíte completa final; zero falhas, cancelamentos ou testes ignorados. Eram 909 na entrega original, com seis regressões novas nesta revisão.
- Encaixe projetado com diferentes inclinações de câmera, classes, corpos, direções e fases. Na matriz, erro máximo de projeção de **0.0096 pixel**, abaixo da tolerância de 0,5 pixel. Esse número testa referências geométricas; a inspeção dos pixels é complementar.
- **32 referências** de empunhadura verificadas sobre regiões opacas da arte original: quatro famílias × quatro direções × arma guardada/em uso.
- Escudo no braço secundário; profundidade contextual; duas adagas usando as duas mãos; morte sem modificar itens equipados; continuidade entre quadros de caminhada; sincronização de aparência; oito conjuntos aceitos pelo inventário.
- Mochila isolada verificada em **96 poses**, sem fragmentação ou corte na borda. Variação máxima de área: **0.183%**, tolerância de 2%. O mesmo controle encontra deformação acima de 3% em **55 poses** do compositor anterior. A contagem de componentes sozinha não distinguia todas as falhas antigas; por isso a conservação da área foi acrescentada.
- Galeria carregada no Electron: 192 pranchas e dois vídeos presentes; troca de seletores conferida. Links dos dez arquivos de relatório (projeto e entrega) verificados sem destinos ausentes.
- Compilação Vite e empacotamentos ADM/Aluno aprovados. Os avisos de tamanho de pacote da compilação permanecem informativos.

## Multiplayer e Electron

- Dois personagens temporários com equipamentos válidos; banco isolado preparado e fechado antes de abrir o ADM.
- ADM e dois Alunos do pacote: espada, escudo, mochila, armadura e aparência iguais no jogador e no observador.
- Quatro famílias de armas e troca de armadura pela autoridade do servidor; adagas gêmeas sem escudo, combinação restaurada ao final.
- Movimento e combate reais na Torre: quadros mudam em ambos os clientes e ambos recebem o dano confirmado pelo ADM.
- Reconexão conserva inventário, equipamentos, classe, aparência e atlas pronto.
- Cliente reiniciado no mesmo perfil recupera a combinação completa; observador também recebe a aparência restaurada.
- ADM encerrou com código zero após gravar o banco temporário.

Os testes usaram o ADM e os clientes dos recursos finais empacotados, TLS local, contas temporárias e um banco fora dos dados oficiais. A aparência própria e remota foi conferida por estado, atlas pronto, equipamentos visíveis e capturas. Os comandos de equipamento e combate passaram pelo servidor. Não foram adicionados botões ou recursos de debug ao cliente distribuído; a instrumentação de teste já existente é restrita ao Electron de desenvolvimento com perfil temporário.

## Desempenho

Medição comparativa com três processos Aluno, mesma máquina, mesmos perfis de teste e mesmo roteiro: cidade e combate contra o Lobo Branco. A intervenção de fixture na morte do MVP ocorre somente no servidor temporário para conferir a lápide; não altera a IA ou o balanceamento distribuídos.

| Versão | Cenário | FPS médio entre clientes | CPU de tarefas do renderizador | Heap JS médio |
|---|---|---:|---:|---:|
| 36 original | 01-cidade-clientes-reais | 39.08 | 83.99% | 16.66 MiB |
| 36 original | 02-combate-lobo-branco | 61.87 | 97.24% | 24.45 MiB |
| Revisão Visual 1 | 01-cidade-clientes-reais | 36.77 | 80.43% | 15.44 MiB |
| Revisão Visual 1 | 02-combate-lobo-branco | 62.95 | 98.64% | 32.30 MiB |

O cenário de cidade manteve 26 objetos de textura e 18 fontes por cliente. No combate, a média observada foi de 198,3 para 204,7 objetos de textura e de 18,3 para 22,7 fontes; o heap médio ao fim da janela passou de 24,4 para 32,3 MiB. A cidade apresentou cerca de 6% menos FPS e o combate cerca de 2% mais FPS. Esses dados não demonstram ganho geral de FPS nem ausência de crescimento de memória em sessões longas. A amostra de combate contém efeitos e poses transitórios e depende do momento da coleta e da coleta de lixo; o cache corporal continua limitado e sua reutilização foi verificada separadamente.

Ambiente: Windows 11 Home Single Language, AMD Ryzen 5 6600H, Radeon integrada via ANGLE/D3D11, Node 24.19.0 e Electron 44.5.1.

A CPU acima é tempo de tarefas do renderizador dividido pela janela de medição, e não uso total da máquina. A comparação final desativou consultas temporizadas da GPU e limitou o coletor a um comando pendente por cliente. Uma coleta anterior interrompida pelo tempo limite da instrumentação foi descartada; os dois resultados finais usam o mesmo coletor. As amostras completas, percentis de quadros, memória e inventário de texturas estão em `performance-before.json` e `performance-after.json` na galeria. São medidas locais de curta duração, não garantia para qualquer laboratório escolar.

Na matriz de composição, a mediana foi de 298.3 ms antes e 120.4 ms depois. As linhas do arco foram atualizadas após a verificação da empunhadura; os tempos incluem variações de carregamento e aquecimento. Cada atlas continua com **3.072 × 512 pixels, 6 MiB RGBA**, cache limitado a oito composições. A troca apenas de arma/escudo reutiliza a mesma superfície corporal, comprovada por identidade do objeto. Não foi criada uma biblioteca de sprites completos por combinação; as pranchas são somente evidências em documentação.

## Preservação e distribuição

297 arquivos PNG foram comparados com o pacote original e permanecem idênticos. A comparação dos arquivos de base não encontrou mudanças em domínio, simulação, mapas, dados, servidor, autenticação, persistência, temporadas, backups ou inicialização dos aplicativos. `sources/` não foi editado.

Os quatro executáveis da **Iteração 36 — Revisão Visual 1** estão em `release/iteration36-rv1`. Os 12 executáveis anteriores das iterações 33, 34 e 36 foram preservados com seus hashes. [Distribuição e SHA-256](ITERACAO-36-REVISAO-VISUAL-1-DISTRIBUICAO.md).

## Limites e problemas restantes

Não foi identificado fragmento solto de mochila ou equipamento flutuante nas sequências finais inspecionadas. A aprovação visual é a inspeção do agente sobre as evidências, não uma aprovação presencial do usuário. A captura original não fornece todos os dados do personagem, por isso a reprodução é equivalente, não uma recuperação exata da conta.

Não foram realizados teste presencial em computadores distintos, instalação interativa dos instaladores, teste de 32 máquinas físicas ou assinatura digital. A campanha foi exercitada em processos locais separados e com os recursos reais dos pacotes. As artes continuam com quatro direções e as poses modulares existentes; não foi criado um novo sistema de animação.

## Arquivos e rastreabilidade

[Auditoria](ITERACAO-36-REVISAO-VISUAL-1-AUDITORIA.md) · [Matriz anatômica](ITERACAO-36-REVISAO-VISUAL-1-ENCAIXES.md) · [Arquivos alterados](ITERACAO-36-REVISAO-VISUAL-1-ARQUIVOS.md) · [Galeria](capturas/iteration36-rv1/index.html).
