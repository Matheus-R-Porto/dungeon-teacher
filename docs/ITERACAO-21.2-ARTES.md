# Beta 0.4.3 — artes selecionadas

Produção com a ferramenta imagegen. Brief de produção: conservar protagonista chibi de cabelo castanho, túnica/capa azul-petróleo, luvas e botas marrons; poses completas transparentes, direção consistente, passos curtos sem joelhos elevados, idles próprios, uma arma e acessórios corretos; nunca colar tronco estático sobre pernas. NPCs preservam a identidade dos retratos. Efeitos legíveis e discretos para ações existentes. Este é um resumo do brief, não transcrição dos prompts.

Processamento técnico: empacotamento por componentes alfa, escala corporal, alinhamento pelos pés, células inteiras e margens. Algumas poses completas foram espelhadas para corrigir direção. Nenhum membro foi sintetizado pelo empacotador. As fontes originais abaixo permitem rastrear a geração.

| Atlas | Grade/célula | Fonte gerada |
|---|---|---|
| characters/adventurer-v043.png | 6 × 4 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-929eec8b-7f86-434d-9b45-e00543a1825b.png |
| characters/bow-action-v043.png | 3 × 4 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-c02cde3a-b6ac-4fd1-ac68-3a70a75a0ef3.png |
| characters/bow-transition-v043.png | 3 × 8 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-7ab1d60e-ba93-4a28-ba3d-65d57a31ce92.png |
| characters/bow-v043.png | 6 × 8 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-e19c10a9-6452-4284-906f-81f6283055d7.png |
| characters/dagger-action-v043.png | 3 × 4 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-3a870cb9-8c52-4bd6-9cb3-257c7ea6864c.png |
| characters/dagger-transition-v043.png | 8 × 4 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-1d938bb7-b3a7-4ff8-abe1-fc81c6fda140.png |
| characters/dagger-v043.png | 6 × 8 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-c2c988a6-a5e1-4b55-913b-cdfb823c645e.png |
| characters/fishing-v043.png | 5 × 4 / 512 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-f736cc1d-4016-4990-948b-93dd7a890b61.png |
| characters/mining-v043.png | 5 × 4 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-e02c4022-9b9a-4aef-884b-d06fd5972f80.png |
| characters/staff-action-v043.png | 3 × 4 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-049ffc9c-3192-47e5-9926-a636a678676d.png |
| characters/staff-transition-v043.png | 3 × 8 / 512 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-56548b1b-9f71-4d0e-bcd5-62d0bab714d2.png |
| characters/staff-v043.png | 6 × 8 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-00eab8bc-4866-4d27-b3b5-f05b9e221b52.png |
| characters/sword-action-v043.png | 3 × 4 / 512 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-b15c830f-925f-401c-ae8c-b7f31be1895f.png |
| characters/sword-transition-v043.png | 8 × 4 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-8ebf2811-f081-4447-a09b-09373beb9295.png |
| characters/sword-v043.png | 6 × 8 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-4284d00d-d9ca-4018-87d4-434a82045a7a.png |
| npcs/townsfolk-v043.png | 3 × 2 / 320 | C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-73551c9b-1d90-405c-a15f-28a6c361620d.png |

Efeitos: `public/assets/effects/combat-v043.png`, 3 × 2 células de 256. Fonte: `C:/Users/theuz/.codex/generated_images/01a0d4c8-c623-7a51-9d6e-d93056a0fef3/exec-52d69793-6682-46c8-a2b0-aed08d6f5778.png`. Flecha, energia, corte pesado, corte duplo, cura e contato.

Cursor: `public/assets/ui/target-sword.svg`, pequeno desenho vetorial de interface. Não representa equipamento no personagem. Retratos e morte v042 preservados.

Fontes rejeitadas: folhas com linha faltante, direção lateral errada, duas aljavas ou enquadramento cortado não são selecionadas pelo runtime. Arquivos de referência e backups do empacotamento são auxiliares. `bow-stored-v043.png` é uma tentativa descartada, não utilizada.
