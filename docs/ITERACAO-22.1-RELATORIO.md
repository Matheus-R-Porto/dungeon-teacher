# Iteração 22.1 — Beta 0.5.1: Um Mundo Vivo

Data: 20/10/2026. Desenvolvimento no checkout existente, preservando alterações anteriores. Nenhum deploy, instalador, commit ou reset de saves foi realizado. Os ensaios de rede usam servidor local e identidades temporárias.

## 1–3. Resultado, diagnóstico e terreno

Os três primeiros andares recebem uma superfície poligonal contínua envolvendo as regiões existentes e as novas ruínas. O jogador pode atravessar a planície fora das antigas trilhas. Árvores, colunas e demais obstáculos continuam sólidos. As regiões antigas conservam encontros e referências de navegação; não definem mais sozinhas o terreno acessível.

O diagnóstico anterior à implementação está em [ITERACAO-22.1-DIAGNOSTICO.md](ITERACAO-22.1-DIAGNOSTICO.md). A limitação principal era estrutural: terreno representado pela união de discos/corredores e personagens tratados exclusivamente em X/Z.

`expandOpenTower` compõe a expansão v2 sobre a v1, com resultado determinístico e idempotente. A desativação é feita na carga da definição-base (`enabled:false`), voltando à v1; não é uma operação destrutiva sobre arquivos nem uma tentativa de inverter um mapa já transformado. Os andares 4–12 não recebem a composição.

## 4–7. Verticalidade, estruturas, escadas e navegação

Cada um dos três andares possui uma ruína aberta: terreno sob o piso, quatro colunas, escadaria, pavimento superior a 3,2 unidades e mirante examinável. Não há troca de mapa ao subir. A mesma representação de superfícies e conectores atende às três estruturas.

Personagens carregam `y` e `surface`; entidades antigas sem esses campos continuam no terreno. O servidor calcula a altura: o comando de destino pode indicar uma superfície conhecida, mas não impõe uma coordenada Y arbitrária. As escadas são visualmente degraus e fisicamente rampas contínuas.

A navegação conecta terreno, pé da escada, topo e pavimento. Colisão restringe bordas e laterais; é possível ocupar o mesmo X/Z em alturas diferentes. Monstros permanecem terrestres nesta entrega. Alcance, separação de corpos, linha de visão e seleção de alvos evitam combate entre pavimentos.

Uma primeira implementação buscava caminhos extensos sem aproveitar a hierarquia existente. O ensaio de combate revelou custo excessivo. Foram restaurados os pontos de passagem para percursos longos, removidos desvios onde existe linha livre e armazenadas em cache as representações de cada superfície.

## 8. Câmera e oclusão

A câmera orbital, os sprites, os nomes e os marcadores acompanham a altura. O piso superior fica translúcido quando bloqueia a visão do personagem inferior. A seleção considera a superfície visível e permite selecionar o terreno através de um piso ocultado. Imagens de dois clientes no mesmo X/Z documentam a diferença entre os pavimentos.

## 9–10. Persistência e rede

As definições geográficas armazenadas permanecem intactas. O teste de reinício compara os bytes do arquivo de andar antes e depois. A posição opcional `{mapId,x,z,y,surface}` é acrescentada ao estado JSON do personagem; não há alteração de schema SQL. Ao restaurar, mapa, coordenadas e superfície são validados; posições inválidas retornam ao ponto seguro.

O checkpoint ocorre ao sair/encerrar normalmente, sem gravar a posição a cada tick. Uma queda abrupta pode recuperar o último checkpoint, não necessariamente o último frame. Snapshots e interpolação transportam altura. O agendador corrigido de 20 Hz foi preservado.

Dois Electron reais validaram subida, sobreposição vertical, sincronização remota, reconexão e descida nos três andares. O teste de integração de 12 identidades também verifica grupos, combate, loot, viagem e reinício. Isso não representa teste em 12 computadores físicos.

## 11–12. Caminhada

O atlas efetivamente usado já era governado por distância, não por um FPS fixo. Cinco poses completavam um ciclo a cada 2,4 unidades; agora completam a cada 3,2. A 3,6 unidades/s, isso corresponde a 7,5 → 5,625 trocas de quadro/s e ciclos de aproximadamente 0,667 → 0,889 s. Não foi alterada a velocidade física.

Foram gravadas quatro direções por teclado e uma comparação da mesma caminhada com as duas cadências. O controle antigo substitui apenas o cálculo visual no perfil de ensaio. A preferência estética final continua sujeita ao playtest humano.

## 13–14. Habitantes e ferreiro

Os seis habitantes têm ciclos determinísticos com fases diferentes, pausas, respiração e pequenos movimentos. Cozinheira movimenta colher, mago movimenta frasco, anjo alterna halo, armazeneira e guia movimentam livro/mapa. São movimentos ambientais simples, não seis novas animações completas de membros.

O ferreiro recebeu quatro poses originais — descanso, preparação, golpe e recuperação — e uma bigorna com peça de trabalho. A orientação visual acompanha a projeção da bigorna na câmera. O ciclo alterna trabalho e descanso. A bigorna foi afastada da aproximação frontal após os testes detectarem bloqueio de diálogo/loja.

Arte: `public/assets/npcs/blacksmith-v051.png`, PNG transparente 2172×724, quatro células 543×724. Gerada com a habilidade imagegen a partir da referência local original `townsfolk-v043-row0.png`, sem uso de assets de outros jogos. Direção do pedido: preservar o ferreiro ruivo/barbado e o estilo existente, quatro poses de corpo inteiro com martelo, sem incorporar bigorna ao sprite, fundo transparente. Fonte da geração: `exec-94ecbf5b-ec3b-44c1-b72e-9d6fb59f07a9.png`.

## 15–16. Mineração e pesca

Mineração agora apresenta preparação, golpe para baixo e recuperação, em uma janela visual de 0,95 s. A ordem anterior retornava à pose levantada depois do contato. O resultado visual e a mudança de aparência do veio são retardados brevemente para melhorar a leitura; a concessão, os tempos do minijogo e as recompensas não mudam.

Pesca tem lançamento perceptível, linha/bóia em movimento e recolhimento que continua após o término lógico. Um peixe aparece apenas após confirmação da concessão, e desaparece ao terminar a apresentação. FPS e animação não concedem itens. O peixe é geometria procedural simples.

## 17. Evidências locais

- `.logs/iteration221-electron-1792510547533/`: seis rotinas e diálogos; vídeos de subida/descida e imagens superior/inferior dos três andares; relatório sem erros.
- `.logs/iteration221-activities-1792510586843/`: pesca completa, mineração completa, caminhada em quatro direções e comparação `walking-cadence-2.4.webm` / `walking-cadence-3.2.webm`.
- Os testes posicionam personagens e preparam inventários em perfis isolados para alcançar o caso de interesse. Movimentação, interação e minijogos usam os fluxos reais do cliente; não são uma campanha humana completa.

## 18–20. Validação, desempenho e regressões

Resultados finais de testes e benchmark são registrados na seção de fechamento abaixo. O primeiro conjunto completo teve 560/566 aprovados. As falhas identificaram a aproximação bloqueada pela bigorna, um fixture de renderização sem as dependências ambientais e uma expectativa antiga de rótulo de build. Os 107 testes afetados passaram após as correções.

Também foram corrigidos o contorno que deixava parte da construção fora do terreno, a orientação do plano de seleção da escada, a transição de descida e o custo de navegação em percursos longos. O ensaio separado de geração em 100 e 1000 seeds passou; o loop de combate com espada pelos três andares também passou.

## 21. Limites conhecidos

- Ruínas abertas e retangulares; não é um sistema geral de interiores, saltos, quedas ou física tridimensional.
- Monstros não sobem escadas. Linha de visão entre superfícies distintas é conservadora, mesmo perto de conectores.
- Sprites e ferramentas são bidimensionais. O contato exato da picareta com a rocha varia com distância e câmera; a correção é de sequência/legibilidade, sem reposicionar fisicamente o personagem.
- Os cinco NPCs além do ferreiro têm movimentos ambientais discretos, não novos ciclos articulados completos.
- A memória observada durante um ensaio curto não prova ausência de vazamentos em horas de uso. Hardware escolar e 12 computadores reais permanecem sem validação.
- Nenhum dado remoto foi acessado; compatibilidade é sustentada por testes locais e preservação dos contratos.

## 22–24. Arquivos, documentação e próxima iteração

Principais módulos: `src/world/{open-tower,surfaces,collision,navigation}.js`; `src/simulation/{areas,game,combat}.js`; `server/{tower,world}.js`; contratos/interpolação em `shared/tower.js` e `src/multiplayer/`; renderização em `src/adapters/rendering/{tower-structures,forest,living-forest,scene,sprite-actor,npc-ambient,city,fishing-visual}.js`; apresentação em `src/core/{visual-combat,activity-animation,npc-ambient}.js`; pesca e HUD de mineração; `shared/city.js`; arte do ferreiro; testes e scripts `iteration221-*`.

README, changelog e versões foram atualizados. O diretório de perfil desktop anterior foi mantido para preservar saves. A lista delimita a iteração; o histórico do checkout contém trabalho anterior. A Iteração 23 não foi iniciada. A estrutura de superfícies pode ser reutilizada e o memorial futuro permanece sem novo chefe ou recompensa.

## Fechamento da validação

- Suíte completa: **566/566**, sem falhas, em aproximadamente 220 s (`.logs/iteration221-tests-complete.txt`).
- Build de produção aprovado; permanece o aviso de bundle acima de 500 kB.
- A interação do mirante no pavimento superior passou no ensaio focado (`.logs/iteration221-electron-1792510739480/report.json`).
- O alinhamento do ferreiro exigiu espelhamento de UV: escala negativa de Sprite não produz o espelhamento esperado no shader. A alteração posterior recebeu teste focado próprio.
- [Medições de desempenho](ITERACAO-22.1-DESEMPENHO.md) e [dados brutos comparados](ITERACAO-22.1-DESEMPENHO.json).
- Testes focados finais: **7/7** (`.logs/iteration221-targeted-final.txt`), incluindo o novo teste de espelhamento e reinício persistente. Não são sete testes adicionais à suíte: seis já faziam parte dela.
- Com 12 personagens visíveis: **119,86 FPS**, p95 **8,6 ms**, p99 **9,0 ms**, 1% low **99,50 FPS**. Referência v1: 119,86 FPS, p99 8,7 ms, 1% low 108,21 FPS. Uma amostra não estabelece regressão estatística; a pequena piora na cauda está registrada.
- Draw calls **129 → 121**, triângulos **12.278 → 12.535**, materiais **249 → 200** nesse enquadramento. A superfície única substitui as antigas peças visuais de trilhas; estruturas e vegetação acrescentam outros objetos. Não houve remoção de sombras.
- Heap no cenário de 12: **24,70 → 33,74 MiB**; durante permanência posterior no piso superior oscilou entre aproximadamente 26,68 e 32,62 MiB. O GC e a sequência de carregamento impedem interpretar um único valor como vazamento ou uso permanente.
- Tick Hz observado nas amostras finais: aproximadamente **19,98–20,04**.
- Captura final do espelhamento e vídeo do ferreiro: `.logs/iteration221-electron-1792511393577/`.
