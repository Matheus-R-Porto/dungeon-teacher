# Iteração 21 — Beta 0.4.1

## Resultado

Cidade expandida, personagem com novo atlas e HUD compartilhado entre campanha local e multiplayer. A implementação mantém a progressão e os serviços locais, os personagens persistidos no servidor e a separação entre os modos. Não houve reset de save, migração destrutiva, deploy, publicação, commit ou geração de instalador.

O agendador corrigido de 20 Hz foi preservado. As medições gráficas usam o benchmark existente, com uma extensão para movimento contínuo de 12 personagens. A investigação anterior não foi reaberta. A expansão apresentou aumento mensurável de draw calls; a resposta foi agrupar geometria estática compatível, mantendo elementos, sombras e oclusão dos edifícios. Valores, amostras e limitações estão em [Desempenho da Iteração 21](ITERACAO-21-DESEMPENHO.md).

## Personagem e sprites

O atlas anterior mostrava uma rotação do tronco na caminhada norte, apesar de o código manter a linha norte durante o ciclo. O novo atlas corporal elimina a arma embutida e mantém as duas poses norte de costas. A grade tem oito colunas e quatro direções cardinais: repouso, duas poses de caminhada, preparação, liberação, recuperação, dano e derrota. O arquivo anterior foi preservado.

A cadência visual da caminhada passou de 8 para 4,5 quadros/s. Preparação, impacto e recuperação continuam acompanhando as fases reais do combate; conjuração usa as fases existentes do runtime. Receber dano seleciona brevemente a pose de recoil, e HP zero seleciona a pose de derrota. Snapshots repetidos da mesma fase não reiniciam o relógio da animação. A interpolação de posição e orientação foi preservada.

O corpo é compartilhado entre jogadores locais e remotos. As quatro famílias existentes têm representação separada: espada longa, adaga curta, arco com corda/flecha e cajado com cristal. A preparação visual do arco contrai o arco; sua liberação o estende. Cajado inclina/ergue na conjuração, e lâminas fazem preparação e corte. O tipo vem do item equipado, e o servidor fornece essa informação aos clientes v2–v4. Não há espada quando o personagem está desarmado. Vara e picareta continuam ferramentas de profissão, sem substituir a arma de combate.

Limite da arte: há quatro direções desenhadas, com diagonais mapeadas para uma cardinal. As animações são deliberadamente curtas e estilizadas; não constituem animação esquelética completa por arma. Prompt, origem e convenções estão em [Artes](ITERACAO-21-ARTES.md); o próprio atlas preservado funciona como folha de inspeção.

## Estrutura da cidade

A área passou de **34 × 32 para 60 × 56 unidades**: 1.088 para 3.360 unidades quadradas, aproximadamente **3,09 vezes a área anterior**. Há doze construções em sete regiões:

| Região | Conteúdo |
|---|---|
| Praça das Águas | Fonte, bancos, jardins, luminárias e encontro dos jogadores |
| Mercado dos Viajantes | Loja de poções em torre, armazém, três barracas e mercadorias |
| Pátio das Oficinas | Ferreiro, forja, oficina de ferramentas, toldos e materiais |
| Jardins do Sul | Casas de alturas distintas, telhados de duas águas, fachadas de madeira e caminhos de tijolos |
| Santuário da Aurora | Plataforma ritual, cristais, colunas e Anjo do Reset |
| Caminho da Torre | Portal entre duas torres, bandeiras e guia |
| Largo da Taverna | Estabelecimento de dois pavimentos, varanda, cozinheira e estação local |

A construção usa texturas anteriores e acrescenta um pavimento de tijolos original. Variações de telhados, torres cilíndricas, alturas, varandas, toldos, árvores de copas distintas e caminhos diferenciam os bairros. Bandeiras oscilam discretamente e a fumaça das oficinas usa instâncias. Nenhuma IA de cidadãos foi adicionada.

`shared/city.js` define limites, obstáculos, NPCs, regiões e portal. `city.js` renderiza essa definição. Edifícios, bancos, jardins, barracas e estações têm obstáculos correspondentes; elementos altos decorativos não bloqueiam ruas por conta própria. A cobertura da sombra solar alcança os bairros novos, mantendo sombras habilitadas e mapa de 2.048 pixels.

## Campanha e servidor

O adaptador local em `createAreas` reutiliza a cidade, preservando a identidade do Refúgio e os contratos `weaponsmith`, `cook`, `cooking-station`, `forge` e `tower-portal`. Armeiro, cozinha e forja continuam utilizando os serviços, inventário, saves e regras anteriores. O portal local inicia a campanha; o portal público leva ao andar compartilhado 1. O armazém e o Anjo não anunciam serviços novos como prontos.

O layout público foi identificado como `city/2`; os arquivos e geradores dos andares da Torre não foram substituídos. O estado persistido online guarda área/andar e personagem, não antigas coordenadas da cidade. Após reiniciar o servidor, a entrada usa o spawn válido da planta atual. Reconexões na mesma instância mantêm coordenadas da mesma planta. A campanha também inicia ou retorna em um ponto válido.

Foram verificadas aproximações navegáveis dos seis moradores, do portal e das estações locais. Testes que dependiam das coordenadas antigas foram atualizados para consultar os destinos atuais; suas verificações de acesso, bloqueio e ação foram mantidas. Colisões e movimento online continuam autoritativos.

## HUD e menus

`player-hud.js` fornece o painel de personagem comum e recebe dados dos adaptadores local e online. `game-shell.js` fornece os menus e livros. O minimapa também compartilha o desenho entre os modos; inventário, atributos, skills e social reutilizam as ações já existentes de cada modo.

O canto superior esquerdo mostra nome, classe, nível base, HP, MP e XP. Barras vermelha, azul e dourada distinguem os recursos. Não há Job Level inventado. Dados online de recursos e classe vêm dos snapshots; XP e progressão vêm do perfil autoritativo quando disponíveis.

O canto superior direito reúne menus e minimapa. Instruções extensas ficam em Ajuda e Diário; câmera e conexão ficam em Configurações. Habilidades ocupam a parte inferior central. Chat e mensagens locais ficam recolhíveis na esquerda. A party oferece resumo recolhível com líder, membros, HP e presença, além do menu de gerenciamento. Avisos online de serviço e recompensa são temporários. Ações de combate continuam disponíveis no mundo.

A janela de 800 × 600 foi capturada com painel, minimapa, menus e hotbar visíveis. Diálogos limitam sua altura e deixam espaço inferior para a barra; listas extensas rolam internamente. Acesso a inventário e equipamentos mantém o painel existente, evitando inventar um segundo sistema de itens.

## Livro de profissões

O livro reúne Pesca, Culinária, Mineração e Ferraria, com descrição, nível e XP reais da campanha. O estado de uma atividade em andamento continua aparecendo quando necessário. O painel permanente com quatro profissões foi retirado da exploração normal. No multiplayer, o livro informa que essas atividades ainda pertencem à campanha local.

## Hotbar e persistência

São oito slots ativáveis por clique ou teclas 1–8. O editor permite escolher posição, atribuir habilidade aprendida, substituir, trocar duas posições e esvaziar. Arrastar um slot preenchido sobre outro também troca posições. O livro de habilidades contém a ação “Colocar na hotbar”. Tooltips mostram descrição, arma necessária, custo de MP, recarga e motivo de indisponibilidade. A recarga continua visível no slot; trocar arma não apaga a configuração.

`normalizeHotbar` filtra IDs inválidos, habilidades não aprendidas e duplicatas. `assignHotbar` valida o slot e o conhecimento da habilidade antes da mudança. O runtime mantém suas verificações de alvo, equipamento, MP, cooldown e bloqueios. Nenhuma habilidade é concedida por editar a barra.

No save local, `hotbar` é um campo opcional. Saves anteriores continuam legíveis; sem preferência, habilidades aprendidas usam as posições históricas. A interface salva usando a fila existente e reverte a mudança de configuração quando a gravação falha. A ordem foi alterada pela interface no Electron e confirmada após recarregar a página.

No online, a preferência usa `dungeon.online.hotbar.<identidade>` no armazenamento da interface e não entra na campanha nem altera o personagem do servidor. O servidor atual não executa habilidades ativas: slots permanecem indisponíveis para execução, com explicação explícita. Não foi criado comando que contorne a autoridade. Habilidades online, equipamentos online editáveis e profissões online continuam fora do escopo funcional desta versão.

## Validação

- Suíte completa: **538/538 testes**, incluindo os quatro novos testes de hotbar, serviços/cidade, estado visual e agrupamento estático.
- Verificação focal final de renderização, snapshots, cidade e 12 clientes: **9/9 testes**.
- Compilação Vite de produção concluída. Permanece o aviso conhecido de bundle maior que 500 kB, sem nova dependência pesada.
- Regressões abrangem combate, MP, recargas, recompensas, itens, profissões, saves, pisos da Torre, autoridade, party, chat, reconexão e persistência.
- Ensaio Electron usa dois processos reais e perfis isolados, adicionando dez sockets para a captura de 12 personagens. Isso não equivale a doze computadores físicos.
- Interface verificada: bairros, NPC, janela pequena, party, profissões, habilidades, quatro armas e hotbar salva após recarga.
- Ensaio social Electron adicional passou: criação/convite/aceite de party, chat global/privado, ataque por clique, XP, coleta individual, portal, chat entre andares e reconexão com identidade preservada. Somente posições foram preparadas no servidor para evitar caminhadas longas; não houve injeção de XP, dano ou itens nesse ensaio. [Evidência social](ITERACAO-21-SOCIAL-ELECTRON.json).
- Os clientes compartilhados não abriram IndexedDB da campanha. A volta à campanha inicializou a cidade local corretamente.

Arquivos de evidência: [suíte](ITERACAO-21-TESTES.txt), [verificação focal](ITERACAO-21-FOCUSED.txt), [build](ITERACAO-21-BUILD.txt), [Electron](ITERACAO-21-ELECTRON.json), [dados do benchmark](ITERACAO-21-DESEMPENHO.json).

## Capturas reais

Abra a [galeria de capturas](ITERACAO-21-CAPTURAS.md). As imagens estão em `screenshots/iteration21/`, referenciadas no relatório JSON do Electron. Incluem visão geral, praça, mercado, oficinas, residências, santuário, Torre, taverna, 12 jogadores, HUD local/online, diálogo, party, profissões, habilidades, hotbar reordenada, quatro armas, costas e janela menor.

A visão geral usa a câmera de inspeção afastada além do zoom normal para mostrar a planta inteira. As imagens de equipamento e skills usam um personagem de teste preparado, não o save do jogador. As demais capturas usam o renderer e a interface reais. A imagem norte mostra a direção corrigida; os testes de estado verificam continuidade da linha e da fase.

## Arquivos principais

- `shared/city.js`, `src/simulation/areas.js`: planta compartilhada e serviços locais.
- `src/adapters/rendering/city.js`, `static-batch.js`, `scene.js`, `sprite-actor.js`: cidade, agrupamento estático, sombra, personagem e equipamento.
- `src/domain/abilities/hotbar.js`, `src/simulation/abilities.js`, `src/adapters/persistence/character-save.js`: configuração validada e persistência.
- `src/ui/player-hud.js`, `game-shell.js`, `ability-hud.js`, `character-panel.js`, `rpg-panels.js`, `hud.js`, `fishing-hud.js`, `src/style.css`, `src/main.js`, `index.html`: HUD, menus e integração local.
- `server/world.js`, `server/online-tower.js`, `src/multiplayer/world-mode.js`, `online-ui.js`, `remote-state.js`: metadados visuais autoritativos e adaptador online.
- `public/assets/characters/adventurer-v041.png`, `public/assets/environment/brick-path.svg`: novas artes preservadas.
- `scripts/iteration21-electron-scenario.mjs`, `world-electron-probe.mjs`, `performance-diagnostic.mjs`, `tests/iteration21.test.js` e ajustes de fixtures em `iteration06-rpg.test.js`/`iteration15.test.js`: evidências e regressões.
- README, changelog, versões dos manifests e relatórios desta iteração.

O servidor de desenvolvimento está disponível em `http://127.0.0.1:5173/`. O servidor multiplayer local foi reiniciado na versão 0.4.1, porta 8787, preservando seus arquivos de dados. O servidor público e os instaladores anteriores não foram atualizados.

## Riscos restantes

O hardware da escola não foi medido. A GPU usada no laboratório e a concorrência com outros programas afetam FPS; o ensaio com sockets não substitui o teste em doze PCs. Há picos ocasionais de frametime e carregamento inicial de mapas, já observados no diagnóstico anterior. As amostras curtas não provam ausência de vazamento em sessões longas.

A cidade tem mais área e conteúdo, então o custo de memória e triângulos não precisa voltar ao da versão antiga. A decisão sobre desempenho deve considerar a tabela medida, e não apenas o FPS médio. A arte e os serviços ainda são uma fundação de demonstração: interiores, NPCs autônomos, novas classes, habilidades online, educação e novos andares não foram adicionados.
