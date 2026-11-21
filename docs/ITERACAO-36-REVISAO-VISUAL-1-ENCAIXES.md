# Iteração 36 — Revisão Visual 1: matriz anatômica

Coordenadas na célula intermediária de 256 × 256. Frente, esquerda, costas, direita correspondem a 0, 1, 2, 3. A saída usa células de 128 × 128. Ombros e mãos foram conferidos nas artes normalizadas; cotovelos são referências interpoladas.

| Classe | Corpo | Direção | Ombro esquerdo | Mão esquerda | Ombro direito | Mão direita | Braço principal |
|---|---|---|---|---|---|---|---|
| novice | masculine | 0 | (102.0, 122.0) | (88.0, 175.0) | (154.0, 122.0) | (166.0, 175.0) | right |
| novice | masculine | 1 | (113.0, 128.0) | (96.0, 174.0) | (140.0, 122.0) | (155.0, 175.0) | left |
| novice | masculine | 2 | (102.0, 122.0) | (86.0, 176.0) | (154.0, 122.0) | (170.0, 176.0) | left |
| novice | masculine | 3 | (110.0, 122.0) | (100.0, 173.0) | (145.0, 128.0) | (157.0, 174.0) | left |
| novice | feminine | 0 | (103.8, 122.0) | (90.8, 175.0) | (152.2, 122.0) | (163.3, 175.0) | right |
| novice | feminine | 1 | (114.1, 128.0) | (98.2, 174.0) | (139.2, 122.0) | (153.1, 175.0) | left |
| novice | feminine | 2 | (103.8, 122.0) | (89.0, 176.0) | (152.2, 122.0) | (167.0, 176.0) | left |
| novice | feminine | 3 | (111.3, 122.0) | (102.0, 173.0) | (143.8, 128.0) | (155.0, 174.0) | left |
| warrior | masculine | 0 | (102.0, 122.0) | (82.0, 174.0) | (154.0, 122.0) | (174.0, 174.0) | right |
| warrior | masculine | 1 | (113.0, 128.0) | (94.0, 172.0) | (148.0, 122.0) | (167.0, 173.0) | left |
| warrior | masculine | 2 | (102.0, 122.0) | (78.0, 171.0) | (154.0, 122.0) | (177.0, 171.0) | left |
| warrior | masculine | 3 | (110.0, 122.0) | (82.0, 169.0) | (145.0, 128.0) | (164.0, 169.0) | left |
| warrior | feminine | 0 | (103.8, 122.0) | (85.2, 174.0) | (152.2, 122.0) | (170.8, 174.0) | right |
| warrior | feminine | 1 | (114.1, 128.0) | (96.4, 172.0) | (146.6, 122.0) | (164.3, 173.0) | left |
| warrior | feminine | 2 | (103.8, 122.0) | (81.5, 171.0) | (152.2, 122.0) | (173.6, 171.0) | left |
| warrior | feminine | 3 | (111.3, 122.0) | (85.2, 169.0) | (143.8, 128.0) | (161.5, 169.0) | left |
| archer | masculine | 0 | (102.0, 122.0) | (86.0, 175.0) | (154.0, 122.0) | (170.0, 175.0) | right |
| archer | masculine | 1 | (113.0, 128.0) | (95.0, 171.0) | (140.0, 122.0) | (156.0, 173.0) | left |
| archer | masculine | 2 | (102.0, 122.0) | (85.0, 173.0) | (154.0, 122.0) | (174.0, 173.0) | left |
| archer | masculine | 3 | (110.0, 122.0) | (96.0, 170.0) | (145.0, 128.0) | (159.0, 170.0) | left |
| archer | feminine | 0 | (103.8, 122.0) | (89.0, 175.0) | (152.2, 122.0) | (167.0, 175.0) | right |
| archer | feminine | 1 | (114.1, 128.0) | (97.3, 171.0) | (139.2, 122.0) | (154.0, 173.0) | left |
| archer | feminine | 2 | (103.8, 122.0) | (88.0, 173.0) | (152.2, 122.0) | (170.8, 173.0) | left |
| archer | feminine | 3 | (111.3, 122.0) | (98.2, 170.0) | (143.8, 128.0) | (156.8, 170.0) | left |
| rogue | masculine | 0 | (102.0, 122.0) | (85.0, 172.0) | (154.0, 122.0) | (170.0, 172.0) | right |
| rogue | masculine | 1 | (113.0, 128.0) | (99.0, 170.0) | (140.0, 122.0) | (156.0, 173.0) | left |
| rogue | masculine | 2 | (102.0, 122.0) | (85.0, 170.0) | (154.0, 122.0) | (173.0, 170.0) | left |
| rogue | masculine | 3 | (110.0, 122.0) | (96.0, 167.0) | (145.0, 128.0) | (160.0, 169.0) | left |
| rogue | feminine | 0 | (103.8, 122.0) | (88.0, 172.0) | (152.2, 122.0) | (167.0, 172.0) | right |
| rogue | feminine | 1 | (114.1, 128.0) | (101.0, 170.0) | (139.2, 122.0) | (154.0, 173.0) | left |
| rogue | feminine | 2 | (103.8, 122.0) | (88.0, 170.0) | (152.2, 122.0) | (169.8, 170.0) | left |
| rogue | feminine | 3 | (111.3, 122.0) | (98.2, 167.0) | (143.8, 128.0) | (157.8, 169.0) | left |
| priest | masculine | 0 | (102.0, 122.0) | (86.0, 168.0) | (154.0, 122.0) | (170.0, 168.0) | right |
| priest | masculine | 1 | (113.0, 128.0) | (98.0, 165.0) | (140.0, 122.0) | (152.0, 171.0) | left |
| priest | masculine | 2 | (102.0, 122.0) | (82.0, 167.0) | (154.0, 122.0) | (174.0, 167.0) | left |
| priest | masculine | 3 | (110.0, 122.0) | (100.0, 169.0) | (145.0, 128.0) | (161.0, 163.0) | left |
| priest | feminine | 0 | (103.8, 122.0) | (89.0, 168.0) | (152.2, 122.0) | (167.0, 168.0) | right |
| priest | feminine | 1 | (114.1, 128.0) | (100.1, 165.0) | (139.2, 122.0) | (150.3, 171.0) | left |
| priest | feminine | 2 | (103.8, 122.0) | (85.2, 167.0) | (152.2, 122.0) | (170.8, 167.0) | left |
| priest | feminine | 3 | (111.3, 122.0) | (102.0, 169.0) | (143.8, 128.0) | (158.7, 163.0) | left |
| mage | masculine | 0 | (102.0, 122.0) | (85.0, 166.0) | (154.0, 122.0) | (168.0, 165.0) | right |
| mage | masculine | 1 | (113.0, 128.0) | (94.0, 169.0) | (140.0, 122.0) | (158.0, 172.0) | left |
| mage | masculine | 2 | (102.0, 122.0) | (82.0, 163.0) | (154.0, 122.0) | (178.0, 163.0) | left |
| mage | masculine | 3 | (117.0, 122.0) | (104.0, 164.0) | (145.0, 128.0) | (168.0, 159.0) | left |
| mage | feminine | 0 | (103.8, 122.0) | (88.0, 166.0) | (152.2, 122.0) | (165.2, 165.0) | right |
| mage | feminine | 1 | (114.1, 128.0) | (96.4, 169.0) | (139.2, 122.0) | (155.9, 172.0) | left |
| mage | feminine | 2 | (103.8, 122.0) | (85.2, 163.0) | (152.2, 122.0) | (174.5, 163.0) | left |
| mage | feminine | 3 | (117.8, 122.0) | (105.7, 164.0) | (143.8, 128.0) | (165.2, 159.0) | left |

Pescoço (128,110), tronco (128,147), quadril (128,184). A mochila acompanha a rotação do tronco; sua referência é (128,151) na frente/costas, (159,151) à esquerda e (91,151) à direita. A silhueta feminina preserva a transformação existente x = 9 + x × 238/256.

A empunhadura usa os metadados de `equipment-pose.js`; o escudo usa (128,132). Todas as posições recebem a mesma transformação no plano da câmera, incluindo altura de 0,055 do corpo. As mãos recebem também a rotação do braço.

[Dados completos](capturas/iteration36-rv1/anchors.json).
