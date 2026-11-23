# Dungeon Teacher — Iteração 40 — Relatório final

**Expansão de Artes Originais · entrega experimental Windows x64 · 9 de novembro de 2026.**

As 12 identidades possuem recursos nativos integrados para as quatro direções, quatro famílias de armas, estados desarmados, habilidades, impacto, morte, pesca e mineração. Foram verificadas 4.176 poses no Electron real. A funcionalidade online foi exercitada com ADM e dois Alunos, TLS e dados temporários. A distribuição oficial permanece intacta. A aprovação artística final continua condicionada à avaliação do usuário.

## 1. Versão-base

Versão funcional 0.6.14. A implementação está isolada em `work/iteration40-native-art-expansion/project`. O nome, título de janela, identificador de instalação e perfil do Aluno distinguem a experiência Art Expansion 40. Nenhum pacote foi publicado automaticamente.

## 2. Variante utilizada da Iteração 39

Variante D, construída sobre as otimizações da C. As oito folhas de pesca/mineração do Mago masculino, seus 64 desenhos e os 16 arquivos finais de atlas/máscara foram preservados. A comparação de hashes confirma os recursos finais idênticos. A referência D continua disponível para reversão.

## 3. Auditoria do pipeline

Reutilizados: quadros completos, UV, Source compartilhada, pivô nos pés, escala independente do mundo, máscaras, cache com referências, controle de estados e renderização comum ao jogador local e remoto. O precedente dos NPCs foi conferido na auditoria da D; não houve substituição do controlador de jogadores pelo de NPCs.

`NativeAction` estende o mesmo contrato para os quadros que faltavam. A profissão pode passar ao recurso nativo assim que o carregamento termina, ainda durante a primeira ação. O relógio autoritativo não foi alterado.

## 4. Estratégia artística

Novas figuras completas, quatro vistas desenhadas, referências específicas de classe/corpo e acabamento orientado pelas profissões aprovadas do Mago. Amostras de Guerreira foram integradas e inspecionadas no Electron antes de cada expansão de produção. Não há reconstrução anatômica em tempo real, espelhamento automático assimétrico, ampliação de sprites pequenos para simular originais nem redução obrigatória a 96/128 pixels. Os recortes conservam os pixels RGBA das fontes.

## 5. Fontes originais e rastreabilidade

- `artwork/approved39/`: oito folhas aprovadas e prompts preservados.
- `artwork/generated/`: 88 novas folhas de profissões, 704 quadros.
- `artwork/action-sources/`: 48 folhas de armas com 16 quadros e 48 folhas fundamentais com 12 quadros; revisões rejeitadas permanecem fora dos manifestos finais.
- `artwork/originals/`: 24 folhas herdadas de repouso, caminhada, ataques e gestos, mais 12 referências de vistas.
- `prepared-actions/` e `prepared-professions/`: recortes, metadados, manifestos e auditorias de integridade.
- `action-source-review.json`, `action-annotations.json`, `action-anchor-overrides.json` e `anchor-reviews/`: revisão de fontes, pés, mãos do carrinho e pontas das ferramentas.

Os manifestos registram hash da fonte, retângulo de origem, índice do quadro, retângulo no atlas, pivô e escala. A evidência da matriz vincula cada estado ao quadro efetivamente carregado; a galeria abre fonte, atlas, máscara e captura separadamente.

## 6. Identidades convertidas

Novato, Guerreiro, Arqueiro, Ladino, Sacerdote e Mago, todos nos corpos masculino e feminino. Mantidos roupas simples do Novato, armadura do Guerreiro, elementos de exploração/aljava do Arqueiro, equipamento leve do Ladino, vestes claras do Sacerdote e chapéu/roupas arcanas do Mago. Os testes visuais cobrem as 12 identidades em atores locais e remotos.

## 7. Quatro direções

Frente, esquerda, costas e direita correspondem a índices 0, 1, 2 e 3. Há 48 combinações identidade/direção. Os novos desenhos são próprios por vista. Pés e contatos foram revisados por fonte; a seleção muda UV e escala do desenho completo.

## 8. Quatro famílias de armas

Espada, arco, cajado e adagas são apresentados por todas as classes/corpos. As novas folhas cobrem postura e caminhada armada; preparação, golpe/disparo e conjuração aproveitam os desenhos originais compatíveis. Arco tem preparação e disparo; adagas mantêm a dupla empunhadura existente. Um item compartilha a representação da família, preservando seus próprios atributos, nome, ícone, raridade e requisitos. Não foram criadas novas armas.

## 9. Desarmado

Repouso e caminhada usam as fontes herdadas; guarda, preparação, golpe físico, sequência e recuperação usam os novos quadros completos. O ataque desarmado não usa uma pose de magia. A caminhada de combate desarmada compartilha os quadros de caminhada; essa reutilização está identificada na matriz.

## 10. Habilidades

Preservados os gestos de ataque físico, disparo, magia ofensiva, cura, suporte e área. O movimento de habilidade recebe desenho próprio. Suporte com ação ativa utiliza o gesto mágico; estados de espera/guarda usam postura correspondente. "Arremesso" permanece entendido como flechas e projéteis de magia, conforme a orientação anterior do usuário. Passivas continuam passivas. Nenhum dano, mana, cooldown, requisito ou efeito foi alterado. A habilidade do Mago foi acionada no ADM e o consumo real de mana foi conferido.

## 11. Recoil, recuperação e morte

Recoil reutiliza o quadro original apropriado. Recuperação retorna ao repouso/guarda. A morte tem início, queda e corpo deitado completos, sem recortar membros. Um Guerreiro sofreu dano de inimigo existente em teste com ADM; os dois Alunos registraram recoil e morte nativos. O cenário foi preparado em banco temporário, sem mudar atributos, regras ou inimigos.

## 12. Pesca

48 folhas, 384 quadros, oito poses por identidade/direção, vara integrada ao desenho e ponta registrada para os efeitos existentes. As quatro folhas do Mago masculino foram preservadas. Foram exercitados início, puxada, captura, cancelamento e reconexão. A recompensa continua decidida no servidor.

## 13. Mineração

48 folhas, 384 quadros, oito poses por identidade/direção, picareta integrada. As quatro folhas do Mago masculino foram preservadas. Preparação, cancelamento, reconexão, impacto e recuperação foram exercitados. Um golpe confirmado concedeu exatamente um minério no teste online.

## 14. Máscaras de cores

Mantido o sistema de cores primária/secundária. Máscaras selecionam regiões de roupa com base na paleta das fontes, preservando sombreamento e materiais. Pele, cabelo, couro, metal e ferramentas não recebem uma recoloração global. Cada atlas novo tem máscara correspondente; UV e fonte compartilhada evitam upload de uma textura nova a cada pose.

## 15. Mochila, escudo e carrinho

Mochila e escudo mantêm os recursos existentes; a escala de referência dos acessórios é estável e independente das dimensões de cada recorte nativo. Adagas gêmeas não recebem escudo indevido. As mãos dos 48 conjuntos de carrinho foram marcadas na fonte e ligadas ao ponto da haste. Na vista frontal, o carrinho pode ficar parcial ou totalmente oculto pelo corpo, por estar atrás dele.

## 16. Fallbacks e carregamento

Após o carregamento, os 4.176 estados capturados usam atlas nativo de ações, profissões ou originais. Não há combinação da matriz sem recurso. Durante a decodificação de uma ação nova, o renderizador mantém o repouso nativo da própria identidade. A infraestrutura antiga ainda é adquirida e permanece como contingência inicial/erro.

## 17. Integridade e preservação

Recortes e atlas conferidos contra os pixels originais, sem reamostragem; transparência, componentes, pivôs, contatos, máscaras e hashes revisados. A auditoria de preservação conferiu 5.467 arquivos estáveis e dez pacotes: zero diferenças. Não há alterações em `sources/`, servidor, domínio, simulação, mundo, núcleo ou protocolos da cópia experimental em relação à D.

## 18. Multiplayer

ADM real + dois Alunos, TLS e banco temporário: Guerreiro feminino e Mago masculino, login, caminhada, direções, quatro famílias de armas, combinações de escudo, combate e dano confirmado, habilidade, pesca, mineração, mochila, carrinho, saída/entrada, passagem Cidade↔Torre, reinício do serviço ADM e persistência de aparência/equipamentos/progresso.

## 19. Testes automatizados

Suíte de 996 casos executada. Na primeira execução, 943 passaram e 53 falharam por restrições de ambiente sobre links de arquivos/conexões locais. Todos os arquivos afetados foram repetidos com acesso adequado: 86 casos passaram, zero falhas. Também aprovados testes específicos de UV, compartilhamento, troca durante carregamento, descarte de referências, estados nativos e primeira profissão; compilação final do Aluno; auditoria dos recursos empacotados; abertura do executável e portátil experimentais. Os roteiros visuais conferiram 3.408 poses de ações e 768 de profissões em atores locais/remotos.

## 20. Desempenho básico

Máquina: AMD Ryzen 5 6600H, Radeon integrada, Windows 11, duas janelas Electron a 1280×800, DPR 1, qualidade balanceada, ajuste automático desativado. Dois clientes reais mais 12 atores de apresentação por cliente.

| Fase | Aluno | FPS | Quadro médio / p95 (ms) | Memória privada (MiB) | Cache RGBA estimado (MiB) | Texturas GPU |
|---|---:|---:|---:|---:|---:|---:|
| baseline-two-clients | 1 | 61.9 | 16.2 / 21.9 | 660.5 | 77.5 | 28 |
| baseline-two-clients | 2 | 63.6 | 15.7 / 21.3 | 669.7 | 77.5 | 26 |
| weapons-cycle-0 | 1 | 57.4 | 17.4 / 21.8 | 1107.2 | 430.1 | 78 |
| weapons-cycle-0 | 2 | 56.3 | 17.8 / 22.6 | 1199.7 | 430.1 | 77 |
| professions-cycle-0 | 1 | 63.6 | 15.7 / 21.0 | 1359.7 | 1087.3 | 76 |
| professions-cycle-0 | 2 | 64.4 | 15.5 / 21.5 | 1361.4 | 1106.6 | 76 |
| released-cycle-0 | 1 | 67.5 | 14.8 / 20.2 | 922.0 | 136.0 | 30 |
| released-cycle-0 | 2 | 70.1 | 14.3 / 20.0 | 887.4 | 140.4 | 27 |
| weapons-cycle-1 | 1 | 57.5 | 17.4 / 24.3 | 1235.4 | 465.4 | 73 |
| weapons-cycle-1 | 2 | 66.5 | 15.0 / 20.6 | 1265.6 | 493.0 | 88 |
| professions-cycle-1 | 1 | 53.5 | 18.7 / 26.5 | 1427.5 | 1106.1 | 77 |
| professions-cycle-1 | 2 | 50.8 | 19.7 / 30.6 | 1343.5 | 1086.6 | 75 |
| released-cycle-1 | 1 | 63.5 | 15.8 / 20.7 | 931.4 | 140.4 | 29 |
| released-cycle-1 | 2 | 63.3 | 15.8 / 21.4 | 898.2 | 136.0 | 27 |

Nas fases com 12 identidades adicionais: 50,8–66,5 FPS, p95 de 20,6–30,6 ms, maior quadro observado de 54,9 ms nas janelas medidas. Não houve travamento ou erro de execução.

## 21. Memória

O cache ocioso continua limitado a oito entradas/64 MiB. A carga de profissões reteve aproximadamente 1,06–1,08 GiB estimados de pixels RGBA por cliente. Memória privada dos processos de cada Aluno atingiu cerca de 1,39 GiB. Após retirar os 12 atores, memória privada após liberação ficou em 887–931 MiB.

Próxima investigação sugerida: carregamento de direção da profissão, contingência legada ainda adquirida, entradas simultâneas e sessões prolongadas em máquinas escolares.

## 22. Galeria visual

Seletor das 12 identidades, 11 grupos de ações, quatro direções, 528 GIFs de poses capturadas e duas sequências de profissões reais. Comparação estável 0.6.14 → D39 → I40 para o Mago, com evidências anteriores preservadas.

## 23. Arquivos alterados

Em relação à D, mudanças de código de produção ficaram nestes dez arquivos: `src/adapters/rendering/actor-accessories.js`, `actor-preparation.js`, `high-fidelity.js`, `native-action-manifest.js`, `native-action.js`, `native-profession-manifest.js`, `native-profession.js`, `sheet-actor.js`, `sheet-resources.js`, `desktop/student-main.cjs`. Acrescentados os atlas/máscaras/manifestos e `electron-builder.iteration40.yml`.

## 24. Recursos gerados

184 folhas novas selecionadas: 88 de profissões, 48 de armas e 48 fundamentais, totalizando 2.048 figuras completas novas. Somadas às oito folhas/64 figuras de profissão preservadas, há 96 conjuntos de profissão e 240 atlas de ações novos. Cada um dos 336 atlas de ações/profissões tem uma máscara.

## 25. Executáveis

Quatro executáveis experimentais gerados (Aluno Setup/Portable ~679 MiB cada, identificado como experimental; ADM Setup/Portable ~106.5–106.8 MiB, reaproveitado byte a byte do ADM compatível).

Auditoria do app.asar: 1.630 entradas, 703 PNGs comparados com as fontes finais do projeto, nenhum payload de banco, chave, `.env`, servidor ou testes. O ADM não foi reconstruído porque seu código permaneceu idêntico.

## 26. Limitações e pendências

- Aprovação artística final reservada ao usuário. Há pequenas repetições de passadas que podem ser refinadas depois.
- Carrinho frontal pode ficar oculto atrás do corpo.
- Carregamento frio/erro ainda pode recorrer transitoriamente à infraestrutura legada.
- Memória durante profissões de muitas identidades é alta. Dois ciclos aprovados não substituem um ensaio prolongado ou medição em todo o parque escolar.
- A matriz diferencia testes diretos e poses compartilhadas; os ensaios não representam 4.656 sequências autoritativas independentes nem 14 alunos autenticados simultaneamente.
- Instaladores não foram instalados no Windows de trabalho; não houve publicação ou substituição da distribuição oficial.

Entrega técnica da Iteração 40 concluída com esses limites documentados, mantendo os dados e a identidade do jogo. A avaliação estética e a futura investigação aprofundada de desempenho permanecem etapas posteriores.
