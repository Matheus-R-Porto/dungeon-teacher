# Iteração 28.1 — Fase B: 44 sprites em 128 × 128

## Entrega

Confirmados **44 IDs reais**, sem novas definições. Cada ID possui um PNG próprio em `public/assets/items/inventory-v281/`. Os sete designs aprovados foram recuperados diretamente dos originais grandes, e os outros 37 foram produzidos com a referência visual dos sete. A integração está feita; a aprovação artística humana do catálogo completo continua pendente.

- [Galeria completa, comparação 64/128 e capturas](ITERACAO-28.1B-GALERIA.html)
- [Lista dos 44 nomes, IDs, categorias e arquivos](ITERACAO-28.1B-MAPEAMENTO.md)
- [Pacote dos 44 PNGs](ITERACAO-28.1B-SPRITES.zip)
- [Folha de contato](iteration281b-contact.png)
- [Comparação dos métodos de redução](iteration281b-resampling.png)

## Auditoria e produção

Conferidos `ITERACAO-28-CATALOGO.md`, o mapeamento anterior, `ITEMS`, equipamentos, forja, pesca e receitas reais. As 12 variantes forjadas mantêm suas qualidades existentes; as diferenças de arte são de acabamento e não representam raridades ou efeitos adicionais. Os seis pratos se distinguem pela preparação, ingredientes e recipientes. Materiais cosméticos não especificados pelo domínio são propostas visuais, sem novas propriedades funcionais.

Os originais aprovados permanecem em `art/iteration281-sources/`. Os novos estão em `art/iteration281b-sources/`. Foram usados o gerador integrado e a skill imagegen, uma chamada por item, com a folha dos sete sprites como referência obrigatória. [Prompts e proveniência dos 37 novos designs](iteration281b-generation.json). A primeira vara apresentou manchas fora do objeto e foi descartada; a segunda geração corrigiu o problema.

Para os sete originais, foram comparados nearest, Lanczos e box. Escolhido Lanczos: preservou melhor a corda do arco, bordas metálicas e costuras sem a perda irregular de detalhes do nearest. O processamento apenas recorta as margens transparentes, reduz proporcionalmente para até 108 × 108 e centraliza em PNG RGBA de 128 × 128. Não amplia os arquivos de 64, não cria geometria e não aplica filtro de mosaico. Margens, dimensões e transparência foram verificadas nos 44 arquivos.

## Revisão artística

Revistos equipamentos, ferramentas, peixes, ingredientes, comidas, baú e armas na folha de contato, além das capturas do jogo. Há diferenciação entre couro/tecido, botas leves/robustas, anéis e qualidades de acabamento das armas. As lâminas e cordas permanecem inteiras. Todos os arquivos são distintos; não houve compartilhamento de imagens entre IDs.

O conjunto segue a direção ilustrada cartunesca aprovada. Isso não equivale a desenho manual pixel a pixel: há variação de densidade de detalhes entre alimentos, peixes e equipamentos. A galeria permite decidir se algum item requer outro passe artístico. Diferenças finas de qualidade forjada ficam mais visíveis no painel de detalhes; os nomes existentes continuam identificando as qualidades na grade.

## Integração

Alterado apenas o mapeamento visual de produção em `src/ui/item-art.json`. Slots continuam em 56 × 56, equipamento em 34 × 34 e detalhes em 112 × 112, todos usando o PNG de 128 como fonte. Comparação real de `image-rendering: auto` e `pixelated` capturada: mantido o padrão `auto`, por apresentar contornos mais contínuos e menos ruído na redução. Não houve necessidade de alterar CSS, lógica ou estrutura do inventário.

Preservados SVGs anteriores e fallback seguro. Nenhuma mudança em regras, atributos, preços, stacks, equipamentos de domínio, receitas, recompensas, persistência, saves reais ou protocolo multiplayer. Os testes usam perfis e servidor isolados. Sem commit, push ou deploy.

## Verificações

- Suíte automatizada completa: **742/742 aprovados**, zero falhas, cancelamentos ou testes ignorados, em 145,83 s. [Log completo](../.logs/iteration281b-full-tests.txt).
- 15 testes direcionados de inventário aprovados, incluindo os 44 PNGs, IDs, transparência, margens, fallback, equipamento, stacks, persistência, migração e apresentação online.
- Build de produção aprovado; permanece o aviso existente de chunk acima de 500 kB.
- Electron: 18 verificações funcionais aprovadas, nenhum erro de execução registrado, carregamento dos 44 PNGs, equipamento/desequipamento, bloqueio com mochila cheia, tooltip, teclado, responsividade, preservação dos atalhos, fechamento por Safety, save após recarga e inventário online com servidor local.
- Ensaio adicional: 19 verificações aprovadas, incluindo encerramento e reinício real do processo Electron no mesmo perfil de teste. Inventário e equipamentos permaneceram idênticos; os PNGs visíveis carregaram corretamente após reiniciar. [Evidência](iteration281b-restart-validation.json). Esse ensaio ocorreu durante a suíte e não foi usado para comparar desempenho.
- O teste de arquivo ausente provoca deliberadamente uma falha de carregamento e confirma o fallback SVG; nenhum dos 44 recursos finais apresentou falha.
- Todas as referências de imagem da galeria foram verificadas no disco. A abertura automática do HTML no navegador embutido foi bloqueada pela política de URLs `file://`; não foi contornada. As capturas do próprio jogo Electron foram inspecionadas.

Resultados completos e desempenho são registrados em [validation.json](iteration281b-validation.json).

## Desempenho

Windows x64, Electron e build de produção existentes, dois processos do jogo com perfis isolados, servidor local e controle de oclusão do benchmark anterior. A suíte completa não rodou durante as medições. Não houve nova auditoria do renderizador ou do servidor.

| Condição | Quadros | Duração | FPS médio | p95 frame | p99 frame | 1% low |
|---|---:|---:|---:|---:|---:|---:|
| Antes, inventário vazio | 1.161 | 19,87 s | 58,42 | 25,2 ms | 25,8 ms | 29,22 |
| Depois, inventário vazio | 1.242 | 19,88 s | 62,47 | 25,0 ms | 25,4 ms | 34,78 |
| Depois, inventário cheio | 2.768 | 40,01 s | 69,19 | 17,1 ms | 25,2 ms | 38,13 |

Essas variações não demonstram ganho de otimização: a condição vazia não exercita os sprites, não há antes/depois contemporâneo do inventário cheio e o agendamento varia entre execuções. O ensaio cheio confirma funcionamento fluido nesta máquina, não garante desempenho nas máquinas da escola. Máximo de 33,3 ms e nenhum frame acima de 50 ms nessa amostra cheia.

Draw calls e triângulos ficaram em 421 e 41.652. Recursos de inventário são imagens DOM e não criam texturas Three.js. O renderer registrou 13 texturas na cena vazia e 14 no ensaio cheio, igual ao contador histórico do inventário cheio anterior; não há uma textura WebGL por item. Geometrias: 245.

Os 44 PNGs somam **693.421 bytes (677,17 KiB)**. O custo teórico dos pixels RGBA decodificados dos 44 mestres é 2,75 MiB, sem incluir overhead e caches do navegador; não é medição de memória total do processo. Após três lotes de 20 ciclos e coleta de lixo, heap JavaScript: 10.905.264 → 10.905.312 → 10.937.332 bytes; DOM: 770 nós nos três lotes. A variação de cerca de 32 KiB não sugere crescimento acumulativo relevante nessa amostra curta.

Dez reaberturas aquecidas no ensaio final levaram aproximadamente 82–102 ms entre o início da automação e dois frames posteriores. Esse intervalo inclui comunicação CDP e espera de frames; não é tempo puro de layout nem de decodificação. As imagens usam URLs estáveis, cache e carregamento lazy já existentes; não há conversão por frame. Não foi introduzida dependência de produção.

## Arquivos desta fase

Produção: 44 PNGs em `public/assets/items/inventory-v281/` e atualização de `src/ui/item-art.json`. Teste existente atualizado em `tests/iteration28.test.js` para validar PNGs em vez de SVGs.

Reprodução e revisão: scripts `iteration281b-prepare.py`, `iteration281b-assets.py`, `iteration281b-integrate.mjs`, `iteration281b-gallery.mjs`, `iteration281b-electron.mjs`, `iteration281b-scenario.mjs`, `iteration281b-results.mjs`; catálogos, prompts, metadados, comparação, galeria, ZIP e capturas nesta pasta. A cópia do mapeamento anterior é `iteration281b-previous-art.json`. Alterações anteriores presentes no workspace foram preservadas.
