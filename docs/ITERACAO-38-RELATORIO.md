# Dungeon Teacher — Iteração 38

Fidelidade visual, integridade dos sprites e Árvore do Destino · 0.6.14

## 1. Versão-base

Confirmada no projeto: **0.6.13 — Iteração 37 RV2**. Foram lidos o relatório, os geradores, os recursos ativos e os originais. A referência preservada contém 503 arquivos e hashes de 120 executáveis anteriores.

## 2. Versão entregue

**0.6.14 — Iteração 38, Fidelidade Visual e Árvore do Destino.** Aprovação técnica e avaliação artística são tratadas separadamente.

## 3. Diagnóstico da árvore

A ilustração anterior competia com os ícones e repetia três grandes troncos, aproximando a estrutura física da árvore dos três caminhos funcionais. O usuário indicou a galeria RV2 como referência dos defeitos; os atlas antigos de sua seção “antes” foram examinados, mas não confundidos com recursos ativos.

## 4. Direção artística aplicada

Fundo azul claro e árvore azul de tronco único, discreta. Dois novos arquivos-fonte gerados pela ferramenta integrada (árvore jovem e árvore adulta), com prompts arquivados. A identidade das cinco classes usa tratamento discreto de largura, orientação, contraste e ornamento próprio; não se declara a criação de cinco árvores-fonte independentes. Os ícones existentes são os protagonistas.

## 5. Raízes, tronco e futura copa

Raízes: dez habilidades do Novato. Tronco e galhos maiores: primeira classe. TREE_STAGES.crown permanece null, permitindo futura camada de apresentação sem criar nós, custos, requisitos ou promoções. A expansão deverá selecionar uma única variante conforme a segunda classe efetivamente escolhida: Bárbaro/Cavaleiro, Pistoleiro/Domador, Bruxo/Alquimista, Assassino/Espectro e Zelote/Monge, respectivamente para Guerreiro, Arqueiro, Mago, Ladino e Sacerdote. Não haverá duas copas simultâneas nem quantidade reservada de nós. Esses pares são planejamento; nenhuma segunda classe foi implementada.

## 6. Caminhos funcionais

As posições do primeiro plano são independentes da arte. Três caminhos funcionais e conexões reais preservados; seleção e hover realçam somente as dependências existentes. Nenhuma dependência foi inventada para seguir um galho.

## 7. Ícones e estados

Ícones preservados; molduras claras sobre o fundo azul. Bloqueio usa dessaturação e borda tracejada; falta de pontos usa borda pontilhada e indicador; aprendido preserva cores; máximo tem marca de conclusão; seleção ganha contorno próprio. O estado não depende somente da cor.

## 8. Tooltips e interação

Painel contextual, efeito atual/próximo, requisitos e investimento continuam consumindo dados reais. Hover não gasta pontos. Confirmação aguarda a autoridade. Teclado, zoom, rolagem, janela menor e maximizada foram verificados no Electron.

## 9. Diagnóstico dos sprites

A redução original usa recortes registrados e escala de aproximadamente 0,3 para caber em 96 pixels, além de limiar alfa e amostragem. Isso perde detalhe. Outro defeito confirmado está na remoção por cor em regiões de braços: detalhes de vestimenta saíam junto e fragmentos da extremidade eram deslocados sem suporte visual contínuo.

## 10. Transparência identificada

Lacunas aparecem nos próprios PNGs, antes do shader. Não foi necessário atribuí-las a premultiplicação ou vazamento entre células. Regiões de roupa e capa foram comparadas ao repouso do mesmo personagem. Espaços entre braços, pernas, ferramenta e exterior continuam transparentes; não foi aplicado preenchimento global de buracos.

## 11. Correções realizadas

Recuperação em polígonos explícitos de vestimenta, com referência opaca do mesmo personagem e deslocamento da pose; suporte desenhado offline sob fragmentos de braços em seis gestos. **278,811 posições de pixels de vestimenta verificadas** nos atlas finais (inclui repetições entre famílias). Máscaras originais preservadas nos pixels existentes, inclusive equipamentos; só os pixels adicionados recebem nova classificação.

## 12. Resoluções experimentadas

Base atual, original preparado em 96, 128, 192, 256 e 320; 192 também com filtro linear. Recortes vêm dos limites do manifesto original, com proporção e referência de chão preservadas. Todos aparecem na mesma câmera e escala; não se ampliou o personagem para favorecer candidatos.

## 13. Comparações visuais

Galeria inclui fonte original, atlas preparado, quadros equivalentes no renderizador, ciclos, antes/depois de integridade e interface por classe. A sequência de origem difere da caminhada refinada; essa diferença é explicitada e faz parte da decisão de não substituí-la.

## 14. Desempenho

[Tabela completa: base, protótipos e final](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/relatorios/ITERACAO-38-DESEMPENHO.md>). Inclui FPS, mínimo, p95/p99, CPU, heap, memória, texturas, estimativa RGBA, preparação e submissão do desenho. Também há medições com ADM/dois Alunos e ensaio com três clientes e combate. Limite de 60 FPS do laboratório e ausência de cronômetro exclusivo de GPU documentados.

## 15. Resolução escolhida

96 × 96 nos personagens e 128 × 128 nas profissões. Filtros e dimensões da produção permanecem estáveis; os reparos melhoram integridade sem ampliar texturas ou alterar escala no mundo.

## 16. Adoção ou rejeição da alta fidelidade

Conversão integral não adotada. Existe ganho de detalhe no original, mas a continuidade de poses ainda exige preparação e o custo de memória cresce com o quadrado da resolução. As medições não permitem declarar melhoria geral. A rejeição não significa que resoluções intermediárias sejam inviáveis em trabalho futuro.

## 17. Preservação do experimento

Protótipos, recortes e metadados ficam isolados dos recursos de produção. Atlas da RV1 e profissões da RV2 não foram sobrescritos. Reversão do visual pode apontar sheet-resources para os caminhos anteriores, com os fontes e hashes preservados.

## 18. Animações auditadas

Repouso, quatro passadas, postura de carrinho, ataques de todas as famílias, conjurações, habilidades/projéteis, recoil, morte e profissões. Caminhada e gestos tiveram reparos de integridade; não se afirma ter redesenhado ataques ou morte que permaneceram iguais. Corrida não possui uma família de quadros separada nesta arquitetura.

## 19. Cobertura

Seis classes × dois corpos × cinco famílias × quatro direções × 36 quadros = 8.640 células principais. Profissões: 768 células. **9.408 células**, 72 pares atlas/máscara, limites, regiões, pegadas e pontas verificados. Mochila e carrinho continuam usando os recursos e vínculos anteriores.

## 20. Testes automatizados

**982 testes passaram na execução integral, zero falhas, cancelamentos ou saltos.** Mais verificações de arte, 8.640 seleções/renderizações WebGL, 96 combinações de profissões e 23 verificações de interface Electron. Testes não equivalem a aprovação artística.

## 21. Multiplayer

ADM real, dois Alunos, TLS e banco temporário: profissões locais/remotas, cancelamento, reconexão, extração exata, promoção, investimento em raízes e persistência após reinício. Ensaio adicional com três Alunos: caminhada com carrinho e mochila local/remota, remoção sincronizada do carrinho, combate, habilidades, transição de áreas, recoil e morte autoritativos. Carga de 32 atores é simulação visual, explicitamente distinta de uma LAN escolar com 32 máquinas.

## 22. Galeria

[Capturas, comparações e animações](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/capturas/iteration38/index.html>). Arte-fonte, protótipo, recurso final e captura do Electron identificados separadamente.

## 23. Arquivos alterados

Árvore: layout/metadados, interação e CSS. Renderização: caminhos dos atlas finais. Novos recursos, testes, roteiros, versão e empacotamento. [Inventário de preservação](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/work/iteration38/preservation.json>) · [Diferenças textuais](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/work/iteration38/implementation.diff>). Domínio, mundo, simulação, protocolo e desktop preservados; nenhuma alteração em sources/ ou bancos oficiais.

## 24. Pacotes Windows

[ADM e Aluno: instaladores, portáteis e hashes](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/relatorios/ITERACAO-38-DISTRIBUICAO.md>). Quatro pacotes x64 gerados, conteúdo conferido, sem publicação.

## 25. Limitações

Benchmarks locais e curtos; laboratório com cena simplificada e identidade compartilhada; nenhuma equivalência declarada com 32 computadores reais. Custos exclusivos de GPU não foram isolados. Instalação externa e rede escolar não executadas. O protótipo de alta resolução cobre o Mago representativo; não foi convertido em massa. Os reparos finais, por sua vez, abrangem todas as classes e corpos.

## 26. Pendências

**Avaliação artística final pendente do usuário.** Recursos finais e comparações estão disponíveis para essa inspeção. Uma migração futura para alta resolução requer refinar os ciclos originais e repetir medições com variedade maior de identidades, antes de substituir o conjunto estável.
