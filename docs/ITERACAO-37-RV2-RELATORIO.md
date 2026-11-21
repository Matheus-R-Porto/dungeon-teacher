# Dungeon Teacher — Iteração 37 · Revisão Visual 2

Árvore viva de habilidades, pesca e mineração — versão 0.6.13.

## 1. Versão-base e versão entregue

Base auditada: 0.6.12, Iteração 37 RV1. Entrega: **0.6.13 — Iteração 37, Revisão Visual 2**. Trabalho concluído tecnicamente em 01/11/2026. Aprovação artística final pendente do usuário.

## 2. Diagnóstico da pesca anterior

A RV1 preservava os atlas genéricos de pesca e recolhimento. A atividade escondia o atlas da classe e a personalização durante o gesto. O estado público dos jogadores não descrevia a profissão, mantendo o observador sem animação correspondente.

## 3. Diagnóstico da mineração anterior

A mineração usava igualmente o personagem genérico. O evento funcional de golpe já existia e foi preservado; a deficiência era o corpo visual, sua escala em relação às novas classes e a apresentação remota.

## 4. Sprites de pesca

Foram preparados oito quadros por vista: preparação, lançamento, liberação, espera, fisgada, dois movimentos de recolhimento e retorno. Seis classes × dois corpos × quatro vistas = 384 células de pesca. Ferramenta e braços são pixels prontos no atlas.

## 5. Sprites de mineração

Oito quadros por vista: repouso preparado, elevação, ápice, descida, contato, recuperação e retorno. Mesma cobertura de 384 células. Ombros, braços e inclinação do tronco participam do golpe; a picareta mantém os dois pontos de pegada.

## 6. Integração com os personagens

Doze atlas dedicados de 1024 × 1024, com doze máscaras, reúnem as duas profissões. Células de 128 × 128 acomodam ferramentas sem redimensionar os pixels do corpo de 96 × 96. Escala no mundo compensada por 128/96; mochila conserva a escala anterior. Armas e escudo cedem lugar às ferramentas. Os 60 atlas e máscaras RV1 permanecem intactos.

## 7. Estados de animação

A apresentação lê eventos reais. Pesca usa cast/waiting/bite/reel; mineração usa prepare/ready/strike. Recolhimento e recuperação expiram. Morte e recoil confirmado têm prioridade. A linha nasce na ponta registrada de cada vara, e o brilho de impacto usa a janela do golpe, sem conceder itens.

## 8. Profissões no multiplayer

Snapshots públicos agora levam somente tipo, fase, tempo, direção, destino da ferramenta e resultado já confirmado. O sorteio futuro de peixe não é divulgado. Aluno local e observador usam a mesma apresentação; recursos visuais são alocados apenas quando necessários e liberados ao remover participantes. Cancelamento, deslocamento, dano, término e reconexão impedem poses presas.

## 9. Diagnóstico da interface anterior

A árvore existente era uma disposição extensa de cartões textuais por caminho. A regra de investimento era correta, inclusive para o Novato após promoção, mas faltava uma estrutura ilustrada que tornasse essa continuidade visível.

## 10. Árvore ilustrada do Novato

Uma árvore jovem de tronco curto, galhos e raízes acomoda cinco ativas e cinco passivas. Os medalhões mostram ícone, nome curto e rank. Informações extensas ficam no painel contextual por hover, foco ou clique.

## 11. Crescimento por promoção

A copa promovida amplia o mesmo tronco e preserva a seção inicial do Novato. A união de casca e galhos foi acabada manualmente; não há uma segunda raiz adulta sobreposta. A expansão tem uma transição breve, desativada com preferência de movimento reduzido.

## 12. Identidade das cinco classes

Guerreiro: madeira robusta e detalhes de ferro; Arqueiro: ramos alongados e folhas verdes; Ladino: silhueta torcida e tons escuros; Sacerdote: madeira clara e dourado; Mago: violeta e cristais. A base Novato é comum e reconhecível.

## 13. Ícones

Preservados os 80 ícones distintos das classes e os cinco das ativas iniciais. Adicionados cinco símbolos próprios às passivas do Novato. Estados visuais diferenciam bloqueio, ausência de pontos, disponibilidade, aprendizado, conclusão e seleção.

## 14. Cobertura real de habilidades

Auditoria: **90 habilidades e 377 ranks**. São 80 habilidades de classe/350 ranks, cinco ativas Novato/5 ranks e cinco passivas Novato/22 ranks. A indicação anterior de 400 ranks de classe estava incorreta; nenhum dado funcional foi modificado para corresponder ao relatório antigo.

## 15. Tooltips e efeitos

Efeito atual e próximo rank, mana, recarga, conjuração, alcance, arma, escudo, flechas e requisitos vêm do catálogo real. A passiva de velocidade do Novato mostra +0,02/+0,04/+0,06 ataques por segundo, e não porcentagem. A auditoria percorreu todos os 377 ranks sem texto indefinido ou NaN.

## 16. Requisitos e conexões

Layout, arte, modelo de estado e interação são separados. As linhas reproduzem apenas dependências reais do catálogo; requisitos de Job, de pontos em caminhos e de origem aparecem nos detalhes. Não foram inventadas ligações funcionais para adaptar a regra ao desenho.

## 17. Novato após promoção

As dez habilidades iniciais continuam acessíveis nas raízes. O seletor deixa explícita a origem dos pontos. Pontos remanescentes do Novato ou da linhagem descendente respeitam os orçamentos existentes. A interface envia uma operação à autoridade e só apresenta o rank confirmado após resposta.

## 18. Passivas existentes

Reutilizadas: Dano físico (+1 a +5), velocidade de ataque (+0,02/+0,04/+0,06 ataques/s), regeneração de HP (+0,1 a +0,5 HP/s), regeneração de MP (+0,1 a +0,4 MP/s) e Dano mágico (+1 a +5). O cálculo usa somente o rank efetivo atual, sem somar novamente ranks anteriores.

## 19. Novas passivas

Nenhuma passiva funcional foi criada. As cinco já existiam, tinham efeitos reais e foram integradas visualmente; duplicá-las violaria a continuidade do projeto.

## 20. Balanceamento

Nenhuma fórmula, custo, recompensa, taxa de coleta, Job, atributo, dano ou regra de classe foi alterada. Arquivos de domínio, simulação e mundo comparados à base permaneceram iguais.

## 21. Persistência

Investimentos continuam usando confirmação atômica, revisão e recibos já existentes. A nova descrição visual de profissão é transitória, sem banco ou recompensa próprios. A sessão técnica recuperou inventário, equipamentos, classe e investimentos após reconexão e reinício do serviço ADM.

## 22. Testes automatizados

Suíte de 978 casos: 976 passaram na execução completa com concorrência 2; duas expectativas históricas de apresentação foram atualizadas e passaram na reexecução dos 15 testes relacionados. Mais um teste específico da autoridade após promoção passou: **979 casos únicos validados**. A primeira execução padrão encerrou sem resumo e não conta como aprovação. Verificações adicionais: 768 células/pegadas/pontas/máscaras, 96 combinações no WebGL, vinte verificações de interface Electron e todos os 377 textos de rank.

## 23. Testes multiplayer

Um ADM e dois Alunos, TLS, perfis temporários e banco isolado, com recursos dos pacotes. Pesca e mineração observadas nos dois clientes; cancelamento e reconexão; exatamente um minério extraído; Guerreiro persistido investindo na própria classe e no Novato; promoção real em Serafina; persistência após reconectar e reiniciar. Para isolar profissões, posições foram preparadas nos mapas reais com o ADM parado; acesso ao quarto andar foi preparado apenas nesse banco de teste. Roteiros de teste corrigidos durante a preparação não são resultados finais.

## 24. Desempenho

| Cenário | FPS médios (antes → depois) | Tempo de tarefas do renderizador | Heap JS |
|---|---:|---:|---:|
| idle | 72.0 → 70.8 | 87.1% → 89.2% | 15.7 → 16.7 MiB |
| fishing | 69.9 → 72.7 | 90.4% → 89.6% | 19.9 → 15.7 MiB |
| mining | 85.0 → 92.0 | 97.9% → 97.5% | 27.9 → 27.3 MiB |
| tree-scroll-tooltip | 87.3 → 77.5 | 98.0% → 98.9% | 29.9 → 29.6 MiB |

[Medições, memória, texturas, carregamento e limites](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/relatorios/ITERACAO-37-RV2-DESEMPENHO.md>). Comparação descritiva de uma execução por versão; não se afirma melhoria geral.

## 25. Galeria

[Abrir galeria de capturas e animações](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/capturas/iteration37-rv2/index.html>). Matrizes de seis classes/dois corpos/quatro vistas, ciclos de pesca/mineração, imagens completas das árvores, crescimento, zoom, janela pequena, capturas ADM/Aluno e fontes de arte separadas das evidências do jogo.

## 26. Arquivos alterados

Principais mudanças: apresentação de profissão e snapshots públicos; renderizadores de personagem/linha/observadores; árvore, layout, modelo e ícones; novos atlas/máscaras/árvores; testes, versões e configuração de empacotamento. [Inventário e hashes de preservação](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/work/iteration37-rv2/preservation.json>) · [Diferenças textuais](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/work/iteration37-rv2/implementation.diff>). Nenhuma escrita em sources/ nem em bancos oficiais. Os 112 executáveis anteriores foram verificados e preservados.

## 27. Pacotes Windows

[Quatro aplicativos, hashes SHA-256 e verificação](<C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/relatorios/ITERACAO-37-RV2-DISTRIBUICAO.md>). Instalador e portátil para ADM e Aluno; conteúdo extraído comparado; nenhuma publicação automática.

## 28. Pendências e limitações

**Aprovação artística final pendente da inspeção do usuário.** A técnica e a cobertura foram verificadas; isso não substitui a preferência artística. Instalação em outro computador, rede escolar real e playtest presencial não foram executados nem exigidos. O ensaio de desempenho é local e curto. Os estudos gerados de profissão não foram usados como corpos finais: a arte de produção foi acabada nos sprites nativos, conforme autorização anterior.
