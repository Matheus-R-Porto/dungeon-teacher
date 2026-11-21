# Dungeon Teacher — Iteração 32 concluída

28/10/2026 · Continuação das iterações 30 e 31 · Implementação local validada.

As cinco primeiras classes agora têm 16 habilidades funcionais cada: **80 habilidades, 43 ativas, 37 passivas e 350 níveis de progressão**. A evolução, os investimentos e o combate passam pelas validações do servidor. Os mapas e sua numeração foram preservados.

## Alterações entregues

- **Serafina:** cinco cartões de classe, descrição e estilo, confirmação explícita e escolha permanente. Exige Base 10 e Job de Novato 20; preserva nível base, atributos, inventário, aparência individual e pontos de Novato. Mantém o custo existente de 100 ouro. Repetir a escolha ou solicitar outra primeira classe é rejeitado.
- **Árvore do Destino:** raiz de Novato, tronco da classe, três caminhos, híbridas e habilidade final conectados. Mostra requisitos, níveis atual/próximo, MP, recarga, alcance, orçamento e bloqueios. Preparação pode ser desfeita antes da confirmação no servidor. São 49 pontos da classe para escolher entre 70 níveis possíveis.
- **Combate:** projéteis guiados e de mira manual, colisões, áreas periódicas, golpes múltiplos, ameaça/provocação, ocultação, veneno compartilhado, cura, barreiras, deslocamentos, regeneração e combinações elementais. As habilidades usam o fluxo de dano e recompensas existente.
- **Equipamentos:** mão secundária, escudo, adagas gêmeas, flechas e talismã de Concentração Inabalável. Todas as classes continuam usando qualquer família de arma; habilidades específicas validam suas próprias exigências. Ataque desarmado tem potência reduzida. As habilidades antigas de arco também consomem flechas.
- **Interface e arte:** 80 ícones originais, efeitos animados por mecânica, tempo de buffs no HUD, munição e suprimentos do Refúgio. A barra mantém oito espaços compartilhados com consumíveis. A classe visual independe da arma.
- **Multiplayer e persistência:** classe, níveis, orçamento e maestria elemental persistentes; aparência e efeitos recebidos pelo outro cliente. Teleporte tem convite, consentimento explícito e confirmação final; revalida participantes, MP, distância, combate, destino visitado e desbloqueios antes de salvar a viagem em transação.

## Compatibilidade e decisões

O requisito da primeira promoção deste prompt substitui o marco de andar 12 previsto na etapa anterior: agora vale Base 10 + Job de Novato 20. Cidade do Limiar e andares continuam exatamente com a numeração existente. A segunda promoção continua como marco futuro do andar 36, sem árvores inventadas.

Os pontos são separados por origem. Regressão e retomada preservam a primeira classe escolhida; não permitem escolher uma segunda primeira classe. Personagens legados recebem a vinculação da classe existente sem apagar os registros de origem. O histórico explícito de andares visitados passa a ser registrado; para saves anteriores sem esse histórico, a migração usa os andares já alcançados como referência.

Veneno tem limite global de três acúmulos por inimigo, inclusive com dois ladinos; renovar duração não adia os pulsos. Danos periódicos não geram acúmulos de velocidade por ataque. Convicção restaura MP uma vez por conjuração sagrada. Arma Consagrada mantém o dano físico e acrescenta um componente sagrado separado. Barreira esgotada deixa de reduzir conjuração. Concentração Inabalável protege de interrupção por dano comum, mas movimento e incapacitação continuam interrompendo.

## Documentação completa

- [Matrizes das cinco árvores](ITERACAO-32-MATRIZES.md).
- [Tabelas dos 350 níveis das 80 habilidades](ITERACAO-32-PROGRESSAO.md).
- [Catálogo completo em JSON](ITERACAO-32-CATALOGO.json).
- [Arte, recursos e arquivos modificados](ITERACAO-32-ARTE-E-ARQUIVOS.md) e [manifesto de arquivos](ITERACAO-32-ASSETS.json).
- [Galeria de capturas](ITERACAO-32-CAPTURAS.html).

## Testes aprovados

| Verificação | Resultado |
|---|---|
| Suíte completa do projeto | **872/872 aprovados**, zero falhas, zero testes ignorados |
| Novos testes da iteração | **61**, incluídos na suíte completa |
| Rodada focada de classes e habilidades online | **69/69 aprovados** |
| Compilação de produção | Aprovada |
| Dois clientes Electron reais, servidor isolado | **11 verificações aprovadas**, zero exceções JavaScript registradas |
| Capturas finais | **37 imagens**, incluindo cinco folhas de ícones |

A suíte cobre as 42 ativas de combate pela execução autoritativa e o Teleporte por cenários específicos, além de dependências, todos os limites de nível, promoção, erros, orçamento e passivas selecionadas. Também verifica projéteis que erram/colidem, sequência interrompida, veneno entre jogadores, barreira, aura/MP, combinações elementais, consentimento, severidade de purificação e munição. A revisão Electron confirma Serafina, as cinco árvores e aparências, efeitos nos dois clientes, mira manual causando dano, Campo de Gelo, layout em 1024 × 768 e reconexão real com a classe preservada.

Os valores de nível usados nas capturas foram preparados em contas temporárias para alcançar e inspecionar todas as árvores. Isso não alterou contas reais nem demonstra progressão orgânica de alunos. Os testes antigos foram mantidos; expectativas que dependiam da regra substituída de promoção, do número de slots ou do catálogo anterior foram atualizadas explicitamente.

Evidências: [suíte completa](ITERACAO-32-TESTES.txt), [testes focados](ITERACAO-32-FOCADOS.txt), [compilação](ITERACAO-32-BUILD.txt), [revisão estruturada](ITERACAO-32-VALIDACAO.json). A compilação ainda avisa sobre o tamanho do pacote principal e uma importação dinâmica ineficaz já presente na arquitetura; não impede executar o jogo.

## Como testar no jogo

1. Inicie o servidor escolar local e abra o cliente conforme o [guia de operação existente](ITERACAO-31-OPERACAO.md). O comando `npm run desktop:test:school` recompila o cliente. Use uma conta de revisão; os ensaios automatizados usam bancos separados.
2. Com Novato em Base 10 e Job 20 e pelo menos 100 ouro, converse com Serafina na Cidade do Limiar. Escolha a primeira classe e confirme. Antes desses níveis, a promoção deve permanecer bloqueada.
3. Pressione **Tab**, escolha a origem dos pontos, use **Preparar +1** e confirme os investimentos. Confira os requisitos dos caminhos; habilidades de Novato continuam na raiz.
4. Selecione uma posição de 1 a 8 e uma habilidade aprendida, e use **Salvar atalho**. A mesma lista aceita consumíveis da mochila. Para Mago, distribua os pontos aprendidos de Maestria entre fogo, gelo e eletricidade antes de confirmar.
5. No inventário da cidade, compre os suprimentos necessários. Arco exige flechas; Contra-ataque exige escudo; Sequência de Adagas e Lâmina Envenenada exigem adaga. Concentração Inabalável é um talismã equipado.
6. Entre no primeiro andar preservado. Ataques dirigidos usam o inimigo selecionado; magias manuais pedem clique no chão; **Esc** cancela a mira. Cura/bênçãos oferecem escolha de aliado ou do próprio personagem. Movimento interrompe preparação, exceto quando a habilidade permite movimento.
7. Para revisar Teleporte, o sacerdote e cada passageiro precisam já ter visitado o andar superior escolhido, estar próximos e fora de combate. O passageiro aceita e o sacerdote confirma; andares ainda bloqueados permanecem inacessíveis.
8. Reconecte o personagem e confira classe, pontos e atalhos. Abra outro cliente para observar a aparência e os efeitos compartilhados.

Para repetir a revisão automatizada completa: `npm test`, `npm run build` e `node scripts/iteration32-electron.mjs`. O último comando cria contas, banco e perfis temporários e salva imagens em `.logs/iteration32-*`. As tabelas podem ser exportadas novamente com `node scripts/iteration32-doc-data.mjs`.

## Limites e próximos trabalhos

O escopo funcional das cinco primeiras classes está integrado. **O balanceamento continua provisório** e precisa de partidas com alunos; os testes automatizados não medem diversão, dificuldade pedagógica ou justiça entre todas as combinações de equipamentos. A revisão visual cobre os principais fluxos e amostras de efeitos, e não substitui a aprovação artística humana de cada habilidade.

Segundas classes, conteúdo curricular/missões ainda não definido, novo instalador e publicação do servidor não fazem parte desta entrega. O endpoint público e os instaladores antigos não foram atualizados. Os efeitos de combate temporários não são buffs permanentes de save. Arquivos de `sources/` permaneceram somente leitura.
