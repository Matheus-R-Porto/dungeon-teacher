# Iteração 34 — otimização gráfica medida

Os diagnósticos de abertura dos clientes preparados localizaram espera na composição/preparação dos atlas. O quarto processo equipado excedeu o prazo de 15 s na mesma máquina. A etapa foi localizada nos atlas; não foi isolada a contribuição de CPU, GPU e pressão de memória para essa contenção. As tentativas estão preservadas; a otimização não eliminou esse limite local.

## Mudanças

- Atlas normalizados de armas e equipamento compartilhados por fonte; os deslocamentos de animação continuam por personagem. Cache limitado a oito entradas.
- Recortes limpos reutilizados por imagem/célula. A cabeça recebe uma cópia antes da coloração, evitando contaminar outros personagens.
- Canvas de composição criado desde o primeiro contexto com `willReadFrequently`, evitando leituras frequentes de ida e volta da GPU.
- Limpeza de ilhas mantém o mesmo algoritmo de conectividade e limiar, usando buffers de inteiros reutilizáveis em vez de listas por pixel.

São recursos gráficos existentes, sem redução de resolução, sombras, efeitos ou inimigos. O custo é reter recortes de fontes já carregadas e atlas compartilhados em memória; o cache de composições permanece limitado a 24. Heap JS não inclui toda a memória dos canvas/driver, portanto estes ensaios não quantificam economia de RAM/VRAM.

## Comparação isolada, no mesmo processo Electron

Quatro classes com equipamentos idênticos antes/depois, atlas completos de 1536×1024. Uma execução por classe; tempos de preparação, não FPS de combate.

| Classe | Original ms | Final ms | Redução |
| --- | --- | --- | --- |
| warrior | 1363.4 | 578.9 | 57.5% |
| priest | 1132.8 | 494.0 | 56.4% |
| mage | 935.2 | 377.7 | 59.6% |
| archer | 1119.0 | 510.5 | 54.4% |

O ensaio de normalização repetida anterior mediu cerca de 1027 ms contra 339 ms (aproximadamente 67% de redução) para oito chamadas, reduzindo oito canvas para duas fontes. Esses números são específicos desse ensaio e não significam 67% de ganho de FPS.

## Equivalência visual

A referência original também foi executada com o mesmo modo de canvas em CPU para separar diferenças de rasterização do navegador das mudanças no algoritmo. Os oito casos (quatro classes × duas paletas) produziram hashes de pixels RGBA exatamente iguais entre essa referência e o compositor final. A segunda paleta verifica que o cache de cabeças não acumula tintas. Comparar a referência original em GPU diretamente pode produzir diferenças de arredondamento/interpolação; não se alega igualdade binária entre esses caminhos.

Os atlas e capturas de cidade, combate e lápide foram inspecionados visualmente. Desenhos, direções, equipamentos e máscaras foram preservados. O JSON contém tempos, hashes e cada verificação. O ensaio real de três clientes equipados e a regressão de quatro básicos ficam no relatório Electron, separados desta medição isolada.

[Dados e verificações](dados/iteracao34/iteration34-visual-verification.json) · [Clientes Electron](ITERACAO-34-ELECTRON.md)
