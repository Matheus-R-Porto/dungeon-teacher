# Iteração 28.1 — Fase A: sprites para aprovação

## Entrega e limite

Sete propostas PNG RGBA, 64 × 64, transparentes, disponíveis em `public/assets/items/sample-v281/`. Galeria: [abrir](ITERACAO-28.1-GALERIA.html). Pacote: [sete PNGs](ITERACAO-28.1-SPRITES.zip). A aprovação artística permanece pendente; não foi iniciada a Fase B nem substituído o catálogo definitivo.

## Auditoria e direção

Conferidos o catálogo de 44 IDs, suas referências de arte, as definições de inventário e forja, o componente e os tamanhos reais da interface. Foram examinados o personagem, os retratos existentes e uma captura da cidade com HUD. A direção proposta combina madeira e couro quentes, metais frios e proporções cartunescas. Couro para o colete e vidro para o óleo são propostas visuais, pois o domínio não fixa esses materiais.

IDs: `trainingSword`, `trainingDagger`, `trainingBow`, `trainingStaff`, `travelerVest`, `limiarMinnow`, `oil`. Nomes e propriedades vêm do catálogo existente; não foram criados itens novos.

## Produção

Usado o gerador de imagens integrado, uma geração por item, com transparência. Os pedidos especificaram pixel art; não houve conversão de SVG ou desenho de ícones por primitivas. Os [prompts exatos](iteration281-prompts.json) e os originais em `art/iteration281-sources/` foram preservados.

A ferramenta devolveu imagens maiores que 64 × 64. O preparo autorizado recortou as margens transparentes, reduziu por vizinho mais próximo e centralizou em uma tela transparente de 64 × 64, sem suavização. Isso não equivale a trabalho manual pixel a pixel; detalhes finos, especialmente a corda do arco, devem ser avaliados na escala real. A adaga tem acabamento mais ornamentado que a espada, também sujeito à aprovação.

Galeria com tamanho nativo, slot de 56 px, ampliação 4×, fundos claro/escuro e quatro capturas do inventário real. Metadados: [dimensões, alpha e tamanho](iteration281-assets.json).

## Verificações desta entrega

- Validação dos sete arquivos: IDs existentes, PNG RGBA de 64 × 64, transparência e ausência de pixels opacos nas bordas.
- Build de produção aprovado; permanece o aviso anterior de pacote JavaScript acima de 500 kB.
- Electron real, perfis e servidor locais isolados: sete imagens carregadas com largura nativa 64 e exibição 56 × 56; quatro seleções capturadas; dados do inventário iguais antes/depois da substituição visual; nenhum erro registrado.
- Evidência: `../.logs/iteration242-sprites281-1792817768979/report.json`. Capturas copiadas para `art/iteration281-preview/`.
- Inspeção visual da folha de contato e da captura real da espada: os sete itens aparecem na grade, com nomes e painel de detalhes preservados.

A substituição das imagens ocorreu apenas no DOM do perfil de teste. Nenhuma mudança em `src/ui/item-art.json`, regras, atributos, recompensas, retratos ou saves reais. Não foi repetida a suíte completa nem o loop da Torre: esta entrega adiciona amostras e ferramentas de revisão, sem mudança de comportamento do jogo. Não foram realizados commit, publicação ou deploy.

## Próximo passo

Aprovar ou ajustar a direção dos sete exemplos. Somente após aprovação será apropriado ampliar a produção e integrar os sprites permanentemente.
