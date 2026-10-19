# Artes originais — Iteração 22

Geradas pela skill imagegen nesta sessão; não foram extraídas de outros jogos.

| Arte | Original gerado | Arquivo de execução |
|---|---|---|
| Lobo, 28 poses, 4 direções | exec-fcf935da-b74f-47b6-a6cd-325eb66e12a2.png | public/assets/monsters/wolf-v050.png |
| Árvores, ruínas, pedras e plantas | exec-cf9fbb98-309a-4358-8d38-587a9e97d1e3.png | public/assets/environment/living-v050.png |
| Terreno florestal | exec-04afd6dc-fa43-48c2-bb7b-875dd4f05189.png | public/assets/environment/forest-ground-v050.png |

Originais preservados em `C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/`. O runtime só referencia cópias/atlases dentro do projeto.

`scripts/pack-iteration22-atlas.cjs` faz empacotamento técnico: componentes alfa, ordenação em grade, escala uniforme e ancoragem inferior. Não desenha arte. O lobo mantém escala consistente entre poses, inclusive a derrota deitada. Manifestos `.png.json` registram os recortes e as margens.

Os três arquivos novos somam cerca de 20,06 MiB em RGBA sem compressão, antes de mipmaps do chão e overhead de driver. Isso é estimativa das imagens decodificadas, **não medição de VRAM**. Texturas-fonte são reutilizadas entre sprites; plantas e ruínas compartilham materiais. Árvores têm materiais separados para a transparência por oclusão. Recursos de cena são descartados ao trocar de mapa; o cache compartilhado de fontes permanece conforme a arquitetura existente.

Os retratos, artes dos seis NPCs, protagonista, ferramentas e cinco habilidades não foram redesenhados. A alteração nos NPCs é escala e altura do rótulo.
