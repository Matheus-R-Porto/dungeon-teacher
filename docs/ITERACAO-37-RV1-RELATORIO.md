# Dungeon Teacher — Iteração 37 — Revisão Visual 1

Versão **0.6.12**, concluída tecnicamente em 01/11/2026. Base: 0.6.11. **Aprovação artística final pendente da inspeção do usuário.**

[Galeria de capturas](C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/capturas/iteration37-rv1/index.html) · [Aplicativos e hashes](ITERACAO-37-RV1-DISTRIBUICAO.md) · [Arquivos](ITERACAO-37-RV1-ARQUIVOS.md)

## 1. Resumo executivo

Refinamento dos desenhos existentes das seis classes, ambos os corpos e quatro vistas. Mantidas a silhueta chibi, roupas, cabeça, cabelo, escala no mundo, mapas, numeração e regras. A apresentação usa quadros completos preparados; não reconstrói membros durante o jogo. Carrinho agora se posiciona pelo contato mão–haste. Distribuição: quatro aplicativos Windows x64, sem publicação automática.

## 2. Diagnóstico da qualidade dos pixels

Problema diagnosticado: fontes ilustrativas maiores foram reduzidas para células de 96 pixels, gerando pequenas variações de cor e detalhe fragmentado. A inspeção encontrou poses de caminhada com pouca mudança de apoio e slots repetidos. O filtro do renderizador já era o de vizinho mais próximo, sem mipmaps; não era a causa principal.

## 3. Causa e método de correção

A fonte representativa do guerreiro tinha 1774 × 887 pixels e passou por redução aproximada de 0,314. Esta revisão trabalha sobre os desenhos nativos existentes: rampas por material, agrupamento de cores, apoios e regiões de membros preparados offline. Não aumenta a resolução final nem aplica desfoque. Cabeça e desenho do cabelo foram preservados; a limpeza é de cor e contorno, não uma substituição integral da ilustração. Dois estudos com geração de imagem foram descartados porque repetiam apoios. O acabamento manual estava autorizado pelo usuário.

## 4. Arquivos de arte refinados

Nova pasta `public/assets/characters-v37-rv1`: 60 atlas de personagens, 60 máscaras, mochila, carrinho, Lobo Branco e Cavaleiro do Juramento. Atlas de personagens continuam em 864 × 1536, células de 96 × 96 e 36 posições por direção. Slots antes redundantes foram usados para carrinho e morte. Recursos da 0.6.11 permanecem intactos. Fontes, scripts de preparação e metadados foram preservados em `artwork/iteration37-rv1`.

## 5. Antes/depois das seis classes

Galeria com Novato, Guerreiro, Arqueiro, Ladino, Sacerdote e Mago, nos dois corpos. Cada cartão mostra a 0.6.11 acima e RV1 abaixo nas quatro direções. Há seleção de arma/animação, pausa, avanço de quadro, tamanho nativo e ampliação 3× sem suavização. A comparação do carrinho usa câmera e escala iguais, inclusive mochila antiga na referência.

## 6. Auditoria das passadas

Quatro fases: contato esquerdo, passagem, contato direito e passagem oposta. Botas originais foram preservadas; canelas, joelhos, pés e braços possuem trajetórias preparadas, sem esticar membros durante a execução. A frente foi corrigida para manter esquerda/direita anatômicas coerentes com costas e perfis. Arma guardada: 2/4/6/8; empunhada: 10/12/14/16; carrinho: 3/5/7/9. O avanço continua baseado na distância percorrida. Uma oscilação discreta complementa os apoios, não os substitui.

## 7. Animações de ataque

Preparação 18, execução 19, continuidade 20 e recuperação 21. Mantidos os gestos e equipamentos próprios das quatro famílias. A continuidade possui ajuste de acabamento; não se reivindica uma nova animação exclusiva para cada habilidade. Disparo do arco e projéteis do mago continuam ligados aos eventos existentes, sem novos itens arremessáveis e sem antecipar dano visualmente.

## 8. Animações de habilidades

Conjuração ofensiva 22/23/24, cura 25/26/24, suporte 33/27/24 e área 22/28/24. Gestos de braços e postura distinguem as famílias; recuperação retorna ao repouso. Cobertura preservada: 80 habilidades de classe, 400 ranks e cinco habilidades legadas. Passivas não fabricam ataques. A revisão não inventa habilidades ou muda mana, cooldown, alcance, projéteis ou efeitos. As poses são compartilhadas por família funcional, não 85 animações exclusivas.

## 9. Recoil e morte

Recoil usa 30, recuperação apoiada 31; esta recuperação deixou de reutilizar uma passada. Morte agora ajoelha em 13, perde o apoio em 15 e termina em 32. O intervalo começa na transição de HP vivo para zero; um cadáver recebido ao entrar/reconectar já aparece caído. Não há atraso da morte autoritativa: os estágios são somente de apresentação.

## 10. Auditoria dos inimigos e profissões

Cavaleiro: quatro apoios 1/8/2/9, reação 10, queda intermediária 11 e corpo caído 7. Lobo comum e três slimes mantêm sua arte própria, com preparação/execução/recuperação separadas pelo estado real. Não receberam passada humana. Mineração e pesca foram inspecionadas e preservadas: golpe, lançamento, fisgada e recolhimento já têm poses próprias; não alteram a concessão de recursos. Pranchas desses recursos estão na galeria.

## 11. Lobo Branco

Atlas ampliado em número de células para 12 × 4, mantendo 96 × 96 por célula e a escala no mundo. Quatro fases quadrúpedes 1/2/3/9, mordida, uivo, recoil, recuperação 11 e queda 10→8. Patas dianteiras e traseiras possuem fases deslocadas e conservam o desenho de pelagem. Olhos vermelhos, cicatriz e identidade foram preservados. A primeira experiência de patas retas foi rejeitada e não integra a entrega.

## 12. Diagnóstico e correção do carrinho

Antes: deslocamento mundial fixo de 1,1 e lateral de 0,35, independente da mão. Agora: ponto da mão na célula do personagem coincide com o ponto da haste na célula do carrinho, usando a orientação da câmera e a mesma escala de pixels. Há pose de puxar e repouso próprios. A ordem de sobreposição deixa a mão à frente da haste nos perfis; costas têm tratamento próprio. Rodas avançam pela distância e preservam a fase ao parar. Na vista frontal, o corpo oculta grande parte do carrinho atrás dele; não se força um deslocamento lateral apenas para exibi-lo. Verificação: 72 amostras WebGL, quatro direções, repouso e oito passos, mais testes de contato e sincronização online.

## 13. Mochila

Limpeza da paleta e preservação das quatro vistas. A sobreposição lateral foi ajustada para não cobrir a mão. Acompanha os novos slots de caminhada e morte. Capacidade, inventário e requisitos de equipamento permanecem iguais.

## 14. Máscaras de cores

60 pares de atlas/máscara verificados: 8640 células sem quadros vazios ou corte nas bordas, regiões de máscara dentro do corpo e sem sobreposição indevida. No teste WebGL, mudança de cores alterou 6513 pixels previstos e preservou 9774 pixels neutros. Pele, cabelo e equipamento conservam suas cores. As 60 combinações do teste de renderização carregaram sem erros gráficos.

## 15. Testes automatizados

**967 casos validados, sem falha pendente.** A execução integral teve 966 aprovações e uma expectativa histórica de morte imediata em 32. Essa expectativa foi atualizada para verificar 13→15→32 e o conjunto afetado passou em 20/20 casos. Houve ainda execução focada anterior de 40/40 casos, incluindo impacto e rede. Esses números não devem ser somados como testes distintos. Arte, galeria e pacotes têm verificações próprias anexadas. A validação automática não certifica qualidade artística.

## 16. Testes multiplayer

ADM e dois Alunos usam os recursos empacotados 0.6.12, TLS, login e perfis temporários. Passaram: equipamento e aparência iguais, caminhada em quatro destinos, quatro famílias de armas, carrinho equipado/removido nos dois clientes, combate com dano confirmado, viagem Cidade/Torre, reconexão e reinício com persistência, encerramento normal do ADM. Um cenário adicional com três Alunos verifica recoil do jogador/observadores/MVP e morte 13/15/32; as condições de captura de dano são isoladas, aplicadas no servidor depois da medição. Não é uma simulação de LAN física externa.

## 17. Medições de desempenho

Comparação sequencial dos pacotes 0.6.11 e 0.6.12, três processos Aluno, mesma máquina e servidor com regras preservadas. Janelas solicitadas: 12 segundos na Cidade e 20 no combate com o Lobo Branco. GPU timers desativados; CPU abaixo mede tarefas do renderizador, não a utilização total do computador. FPS é observação desta execução, não garantia de ganho.

| Cena · média dos três clientes | FPS 0.6.11 | FPS RV1 | CPU de tarefas 0.6.11 / RV1 | Heap JS MiB 0.6.11 / RV1 |
|---|---:|---:|---:|---:|
| 01-cidade-clientes-reais | 34.44 | 41.74 | 89.4% / 98.3% | 22.4 / 14.7 |
| 02-combate-lobo-branco | 48.68 | 63.75 | 96.1% / 99.0% | 30.1 / 27.6 |


| Árvores de processos · média por Aluno | Memória privada MiB | Working set MiB |
|---|---:|---:|
| 0.6.11 · 01-cidade-clientes-reais | 517.4 | 320.0 |
| 0.6.11 · 02-combate-lobo-branco | 620.9 | 203.4 |
| RV1 · 01-cidade-clientes-reais | 615.8 | 280.3 |
| RV1 · 02-combate-lobo-branco | 638.4 | 252.1 |

| Versão / cena | Sprites média / p95 ms | Preparação da cena ms | Texturas GPU |
|---|---:|---:|---:|
| 0.6.11 · 01-cidade-clientes-reais | 0.092 / 0.233 | 2633.3 | 21, 20, 19 |
| 0.6.11 · 02-combate-lobo-branco | 0.101 / 0.233 | 2007.7 | 30, 30, 29 |
| RV1 · 01-cidade-clientes-reais | 0.088 / 0.267 | 1948.7 | 21, 20, 19 |
| RV1 · 02-combate-lobo-branco | 0.096 / 0.267 | 1665.4 | 35, 35, 35 |


A CPU de tarefas aumentou nesta rodada apesar do FPS maior; não se afirma redução geral de custo. Tempo de preparação, coleta de lixo e carga da máquina variam. O acréscimo teórico das três folhas ampliadas (Lobo Branco, Cavaleiro e carrinho), em RGBA sem mipmaps, é de aproximadamente 2,20 MiB quando todas estão residentes, antes de considerar o gerenciamento interno do driver. Não é uma medição direta de VRAM.

Relatórios brutos incluem tempos por subsistema, p95, inventário de texturas/geometrias, preparação da cena, memória e atividade. Os atlas de personagens mantêm dimensões e quantidade; o custo adicional principal de textura é a expansão do Lobo Branco e do Cavaleiro. A seleção por quadro e o cache continuam os existentes. Medições em uma única máquina não substituem teste em máquinas da escola.

## 18. Galeria e gravações

Galeria local com comparações, GIFs de caminhada/carrinho/Lobo Branco, pranchas de contatos, controles de quadros, WebGL e capturas de multiplayer. Não foram produzidos vídeos MP4; as sequências inspecionáveis e GIFs são as gravações desta entrega. Algumas execuções intermediárias da prévia demoraram além do limite e houve uma recarga durante o empacotamento. Os diretórios de build foram excluídos da observação da prévia; a execução final passou.

## 19. Arquivos alterados e preservação

O manifesto de arquivos separa código, arte e documentação. Auditoria SHA-256: 471 arquivos-base conferidos, nenhum removido; servidor, domínio, simulação e recursos antigos preservados. **104 executáveis anteriores idênticos**, sem substituição. Não foram alterados bancos oficiais, mapas, temporadas, credenciais ou fontes antigas.

## 20. Distribuição Windows

ADM instalador/portátil e Aluno instalador/portátil, Windows x64 0.6.12. Todos tiveram payload extraído e comparado ao aplicativo preparado, incluindo executável e recursos. Isolamento do Aluno confirmado; nenhum banco oficial ou chave privada incluído. Manifesto com SHA-256 disponível. Sem publicação automática. A auditoria de conteúdo não equivale à instalação interativa em outra máquina.

## 21. Limitações e pendências

Problemas diagnosticados, correções e verificações estão descritos acima. A inspeção artística realizada pelo agente examinou pranchas, contatos, gestos, profissões, inimigos e carrinho; **não constitui aprovação do usuário**. O acabamento conserva detalhes do desenho original, com alguns gestos laterais discretos na escala nativa. Não há movimento facial/cabelo independente nem desenho exclusivo por habilidade. Profissões mantêm os atlas anteriores. As novas imagens de referência citadas no histórico não estavam disponíveis como anexos desta revisão; a referência utilizada é a versão 0.6.11 preservada. Aprovação artística final, instalação interativa em outro Windows e LAN presencial permanecem pendentes.
