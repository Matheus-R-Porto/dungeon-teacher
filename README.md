# Dungeon Teacher — Beta 0.1.0

Entrega atual: **Iteração 08 — Variedade de combate e progressão**.

## Primeira expedição

1. Siga Primeiros passos: caminhe, teste a câmera e fale com o Armeiro usando F.
2. Adquira uma arma gratuita, abra I e equipe. Você começa sem habilidades e sem Espaços de Habilidade.
3. Use F no Portal, com arma equipada. A Torre gera três andares por seed.
4. Clique nos Slimes para atacar; somente impactos hostis válidos provocam. Habilidades aprendidas usam 1–5. Eles vagam passivamente até sofrer dano e não reaparecem nesta expedição.
5. Elimine os 3, 4 e 5 inimigos dos andares. O portal de cada andar libera a subida.
6. No terceiro, o Slime Guardião aparece após dois segundos. Derrote-o, pegue o baú com F e volte pelo portal.
7. Abra I no Refúgio, selecione o baú e clique Abrir. Espaço desacelera a roleta até o resultado. Receba equipamento e ouro.
8. Inimigos concedem XP; cada nível concede 5 pontos de atributo e 1 Espaço de Habilidade. Em TAB, cada técnica custa 1 Espaço; as cinco são independentes. Abra C no Refúgio para distribuí-los sem gastar XP ou ouro. Você continua Novato.
9. Equipe a recompensa em I e inicie outra expedição.

Morrer retorna ao Refúgio com HP/MP completos e encerra a run. Recursos e itens já recebidos permanecem. A interação perto da entrada permite abandonar. Recarregar também começa no Refúgio, sem restaurar uma expedição em andamento.

Inventário, equipamentos, habilidades, atributos, XP, ouro, baús e onboarding persistem. Abrir painéis pausa a simulação. Equipamentos não podem ser trocados durante combate. O baú exige Refúgio e um espaço livre; a concessão e o consumo são salvos juntos.

[Relatório da Iteração 08](docs/ITERACAO-08-RELATORIO.md) · [Prompt](docs/ITERACAO-08-PROMPT.md).

A versão de progressão 4 reinicia os saves antigos uma única vez e grava a migração antes de abrir o jogo. Recarregar preserva o progresso novo. Espada e adaga atacam corpo a corpo; arco e cajado lançam projéteis físicos e mágicos. Slimes comuns, Saltadores e Mágicos compartilham a IA, com encontros variados por seed.

Para reproduzir mapas: ?debug=1&test=1&seed=42. Debug exibe seed da run, andar e seed derivada. O perfil test=1 é separado do normal. Sem seed explícita, cada expedição sorteia outra seed.

## Jogar

Com o servidor desta sessão ativo, abra **http://127.0.0.1:5173/**.

Para abrir novamente no Windows, execute `INICIAR-JOGO.cmd`. Mantenha a janela do servidor aberta enquanto joga. Se a porta já estiver em uso pelo jogo, basta abrir o endereço acima.

Na primeira instalação em outra máquina: Node.js 22.12+ (ou 24+) e `npm ci`. Os pacotes são instalados pelo registro npm, e as versões exatas ficam no lockfile.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

Não abra `index.html` por duplo clique: os módulos precisam do servidor local. Não há conta, backend ou serviço remoto de jogo. Nenhum asset ou biblioteca é buscado de CDN durante a execução.

## Controles

| Ação | Controle |
|---|---|
| Caminhar | WASD ou setas, em relação à câmera |
| Encontrar caminho | Clique no chão |
| Cancelar caminho | WASD ou Esc |
| Girar câmera | Segure Q / E ou os botões inferiores; solte para parar no ângulo exato |
| Orbitar pelo mouse | Segure o botão do meio e arraste horizontalmente |
| Zoom | Roda do mouse, + / − ou botões inferiores |
| Interação contextual | F ou botão da ação indicada; Portal e placa de boas-vindas usam o mesmo sistema |
| Pausar | Esc sem caminho ativo, botão superior ou sair da janela |
| Personagem e atributos | C ou botão Viajante na HUD |
| Inventário e equipamentos | I ou botão Inventário |
| Árvore de habilidades | TAB ou botão Habilidades |
| Habilidades | Teclas 1–8 ou clique na hotbar |
| Ajuda | H ou botão ? |

## Incluído nesta entrega

- Cenário 3D de baixa complexidade com iluminação quente, vegetação viva, flores, bandeiras, água turquesa e portal azul animado.
- Personagem em sprite 2D original provisório, atlas de oito direções, Idle/Walk e marcação no chão.
- Colisão circular contra árvores, pedras, ruínas, tenda, poço e limites da clareira.
- A* em grade e suavização por segmentos livres; caminho e destino visíveis.
- Câmera de órbita contínua, pivô no personagem, inclinação fixa e zoom suave limitado.
- Árvores e estruturas registradas ficam translúcidas quando encobrem o personagem.
- Minimap funcional, guia de exploração, ajuda e pausa.
- Simulação em passos fixos, separada da renderização, da entrada e da interface.
- Conteúdo e interações do refúgio em JSON validado e 231 testes automatizados de domínio, combate, áreas e persistência.

## Limites desta versão

São três andares procedurais controlados, um boss provisório e oito equipamentos de recompensa. Classes jogáveis, economia completa, perguntas educacionais, multiplayer e conteúdo além do terceiro andar não estão implementados. As seções abaixo documentam o histórico; as regras atuais acima prevalecem.

Arte feita com geometria e efeitos locais, sem assets finais. Esta entrega não representa a qualidade visual final. WebGL 2 e aceleração gráfica são necessários. Mobile não foi alvo de validação.

## Desenvolvimento e verificação

```sh
npm test
npm run build
npm run preview -- --port 4173 --strictPort
```

`?perf=1` mostra uma amostra de FPS e p95 do intervalo entre frames, sem habilitar debug. `node scripts/iteration08-performance.mjs` reproduz o benchmark sintético de simulação (5/20 inimigos), separado da medição gráfica.

`npm test` usa o executor nativo do Node e não precisa abrir o navegador. O build estático é gerado em `dist/`. O aviso de tamanho do pacote gráfico não impede o build; medir e otimizar é parte dos próximos testes de desempenho.

Responsabilidades: `src/core/` contém configuração e validação; `src/world/`, colisão/navegação; `src/simulation/`, estado e movimento; `src/adapters/`, teclado/mouse e Three.js; `src/ui/`, HUD; `src/data/`, o mapa. Regras de combate e habilidades ficam no domínio e na simulação; o renderizador apenas as apresenta.

Documentação: plano completo em `docs/PLANO-TECNICO-BETA-0.1.0.md`, decisões desta entrega em `docs/DECISOES-FUNDACAO.md` e verificação em `docs/VERIFICACAO-FUNDACAO.md`. O texto original continua preservado em `docs/ESPECIFICACAO-ORIGINAL-BETA-0.1.0.txt`. Arquivos em `sources/` não são alterados.

**Registro da Iteração 02:** fundação de movimento, câmera, interação e visual híbrido. Attack/Skill/Hit/Death estão previstos no contrato de animação, mas não foram implementados. Ver `docs/ITERACAO-02.md` para decisões, arquivos e verificação. A especificação da Iteração 02 substitui as escolhas antigas de quatro orientações e personagem 3D; o restante do plano permanece como referência.

Correção atual: oito poses de corpo inteiro, seleção estável por ângulo relativo e painel recolhível de depuração. Inspeção das poses em `http://127.0.0.1:5173/sprite-lab.html` (servidor de desenvolvimento). Detalhes em `docs/ITERACAO-02.1.md`.

## Personagem e persistência — Iteração 03

Novato nível 1 com seis atributos em 5. Cada nível concede 5 pontos. C abre a ficha com prévia, Confirmar e Cancelar; fechar descarta alterações ainda não confirmadas. A distribuição exige o Hub seguro e ausência de combate. O painel pausa a exploração e a regeneração.

HP, MP, XP, nível e atributos são salvos em IndexedDB neste navegador e endereço. Alterações confirmadas e debug são salvos imediatamente; regeneração é consolidada a cada 2 segundos e ao sair da janela. Fechamento abrupto pode perder os últimos segundos de regeneração. Não há regeneração offline. O nível máximo técnico é 100 e a velocidade de ataque fica entre 0,25 e 4 ataques/s; números provisórios.

Para testar sem alterar seu personagem, abra http://127.0.0.1:5173/?debug=1&test=1 e use C → Ferramentas de teste. Apenas ?debug=1 aplica os testes ao perfil normal. O perfil de teste usa uma chave separada no mesmo banco. A tela normal não oferece esses comandos.

O save contém a fonte dos dados, versão 0.1.0 e schema 1. Derivados são reconstruídos ao carregar. Campos ausentes recebem padrões; formatos inválidos ou futuros não são sobrescritos. Transações mantêm uma cópia anterior e rejeitam gravações concorrentes de abas com revisão desatualizada. Em erro, leia o aviso de salvamento; reabra a página para carregar a última confirmação. Não existe sincronização entre navegadores.

Arquitetura e verificações: [relatório da Iteração 03](docs/ITERACAO-03-RELATORIO.md).

## Combate de treino — Iteração 04

Clique diretamente no Slime de Treino: o personagem aproxima-se e inicia ataques automáticos. O círculo e a barra de HP indicam o alvo. WASD, clique no chão ou Esc interrompem a intenção automática; a seleção pode permanecer. F continua sendo interação contextual. Na Iteração 05, os Slimes detectam, perseguem e atacam dentro das próprias regras de percepção.

Ao ser derrotado, o personagem retorna ao início com HP/MP completos após 3 segundos. Cada Slime desaparece após a derrota e reaparece após 8 segundos, aguardando se a origem estiver ocupada. Nenhum XP ou loot é concedido.

Em ?debug=1&test=1, abra Depuração do combate para observar estado, intervalo, alcance, estatísticas e último resultado; desmarque IA e ataques ativos para isolar o ataque do jogador. O perfil de teste é separado do normal.

[Relatório da Iteração 04](docs/ITERACAO-04-RELATORIO.md): arquivos, arquitetura, fórmulas, cancelamentos, limitações e testes. Esse relatório registra a entrega anterior; a Iteração 05 está descrita abaixo.

## Histórico: IA e grupos — Iteração 05

A região de treino agora possui seis Slimes com percepção individual, perseguição por navegação, retorno e respawn. Aproximar-se demais pode atrair todos os que enxergarem você. Não há limite artificial de aggro. Fugir além do território faz cada Slime voltar à origem, recuperando HP gradualmente. Durante esse retorno, ele fica temporariamente imune e não pode ser selecionado.

O jogador pode deslocar corpos em contato, e os inimigos se separam localmente. Morte limpa o aggro e os ataques pendentes. Não há XP ou loot por inimigo. Câmera, atributos, regeneração e save seguem as regras anteriores.

Teste de escala: http://127.0.0.1:5173/?debug=1&test=1&stress=1. O parâmetro stress requer debug=1 e seleciona vinte spawns. Em Depuração do combate, ative a visualização de visão, alcance, leash e rotas. O perfil test=1 preserva o personagem normal.

[Relatório da Iteração 05](docs/ITERACAO-05-RELATORIO.md): arquivos, máquina de estados, parâmetros, testes, performance observada e limitações. A Iteração 06 está descrita abaixo.

## Histórico: primeiro kit do Novato — Iteração 06

A hotbar responde a clique e teclas 1–8: Golpe Poderoso (espada), Ataque Duplo (adaga), Tiro Duplo (arco), Bola de Energia (cajado), Regeneração (qualquer arma) e três slots vazios. Selecione um inimigo antes das técnicas ofensivas; o personagem se aproxima pelo alcance da habilidade. Regeneração recupera HP em seis pulsos.

As técnicas incompatíveis ficam escurecidas. Passe o mouse para consultar arma, MP, cooldown e alcance. Uma única técnica pode ficar pendente; a intenção mais recente substitui a anterior. Custos começam na execução válida. Interromper uma técnica já iniciada não devolve MP ou cooldown. Pausa congela as habilidades.

Para experimentar as quatro armas, abra http://127.0.0.1:5173/?debug=1&test=1 → Depuração do combate → Arma provisória. A troca fica bloqueada durante a execução da habilidade. Esse perfil preserva o personagem normal. Arma e habilidades conhecidas são salvas; cooldowns e efeitos ativos reiniciam ao recarregar. O ataque automático ainda conserva o alcance físico curto anterior para todas as armas.

[Relatório da Iteração 06](docs/ITERACAO-06-RELATORIO.md): arquitetura, parâmetros, regras, testes e limites. [Diretrizes de progressão](docs/DIRETRIZES-DE-PROGRESSAO.md): filosofia das 13 semanas. O personagem continua Novato; mudança de classe não foi iniciada.


