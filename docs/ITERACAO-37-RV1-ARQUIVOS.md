# Iteração 37 RV1 — arquivos e evidências

## Arquivos-base alterados

- `src/core/sheet-animation.js`
- `src/adapters/rendering/actor-accessories.js`
- `src/adapters/rendering/combat-visual.js`
- `src/adapters/rendering/guardian.js`
- `src/adapters/rendering/sheet-actor.js`
- `src/adapters/rendering/sheet-backpack.js`
- `src/adapters/rendering/sheet-preview.js`
- `src/adapters/rendering/sheet-resources.js`
- `src/adapters/rendering/sprite-actor.js`
- `tests/iteration21.test.js`
- `tests/iteration37-visual.test.js`
- `config/multiplayer.json`

## Adições e configuração

- `public/assets/characters-v37-rv1/`: 124 recursos.
- `artwork/iteration37-rv1/`: fontes de preparação, metadados e finalização.
- `tests/iteration37-rv1.test.js`: seis testes.
- `scripts/iteration37-rv1/` e `scripts/verify-iteration37-rv1-packages.cjs`: evidência e auditoria.
- `package.json`, `package-lock.json`, `electron-builder.adm.yml`, `electron-builder.student.yml`: 0.6.12 e nova pasta de distribuição.
- `README.md`, `RELATORIOS.md`, relatórios RV1 e galeria.

## Evidências

[Dados de validação](C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/docs/dados/iteracao37-rv1) · [Galeria](C:/Users/theuz/Documents/Codex/2026-10-26/voc-ser-responsanvel-pela-continua-o-4/outputs/capturas/iteration37-rv1/index.html)

| Cena · média dos três clientes | FPS 0.6.11 | FPS RV1 | CPU de tarefas 0.6.11 / RV1 | Heap JS MiB 0.6.11 / RV1 |
|---|---:|---:|---:|---:|
| 01-cidade-clientes-reais | 34.44 | 41.74 | 89.4% / 98.3% | 22.4 / 14.7 |
| 02-combate-lobo-branco | 48.68 | 63.75 | 96.1% / 99.0% | 30.1 / 27.6 |
