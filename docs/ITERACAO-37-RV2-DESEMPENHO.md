# Dungeon Teacher — Iteração 37 RV2 · Desempenho

Versões 0.6.12 e 0.6.13, medidas sequencialmente com os recursos dos pacotes, ADM real e dois processos Aluno, TLS em localhost e perfis/banco temporários. Compilação, suíte e auditoria de hashes não concorreram com as duas medições finais. Nenhum resultado das tentativas de desenvolvimento entra nesta comparação.

| Cenário | FPS médios (antes → depois) | Tempo de tarefas do renderizador | Heap JS |
|---|---:|---:|---:|
| idle | 72.0 → 70.8 | 87.1% → 89.2% | 15.7 → 16.7 MiB |
| fishing | 69.9 → 72.7 | 90.4% → 89.6% | 19.9 → 15.7 MiB |
| mining | 85.0 → 92.0 | 97.9% → 97.5% | 27.9 → 27.3 MiB |
| tree-scroll-tooltip | 87.3 → 77.5 | 98.0% → 98.9% | 29.9 → 29.6 MiB |

Valores agregados dos dois Alunos. A coluna de CPU é a fração de tempo ocupada por tarefas do renderizador obtida pelo protocolo de diagnóstico; não é porcentagem de toda a CPU do computador. O FPS resulta dos intervalos do ciclo real de renderização. O cenário de árvore mede o mundo ainda em execução enquanto o Aluno A abre, rola e consulta habilidades; o Aluno B permanece observador.

Abertura da árvore, do comando até modal aberto: **208.0 ms → 163.0 ms**. É tempo ponta a ponta, incluindo o controle do ensaio. Atualização síncrona de rolagem/hover, média: **0.286 ms → 1.138 ms**; o custo de composição/pintura aparece nos intervalos de quadro e tarefas do cenário.

## Recursos por cenário

| Versão / cenário / Aluno | Texturas GPU | Fontes de textura | Working set da árvore de processos | Memória privada |
|---|---:|---:|---:|---:|
| 0.6.12 / idle / 1 | 14 | 8 | 640.0 MiB | 633.0 MiB |
| 0.6.12 / idle / 2 | 13 | 8 | 807.2 MiB | 644.9 MiB |
| 0.6.12 / fishing / 1 | 14 | 8 | 637.7 MiB | 591.4 MiB |
| 0.6.12 / fishing / 2 | 13 | 8 | 688.2 MiB | 631.5 MiB |
| 0.6.12 / mining / 1 | 11 | 5 | 695.0 MiB | 601.4 MiB |
| 0.6.12 / mining / 2 | 10 | 5 | 753.2 MiB | 586.2 MiB |
| 0.6.12 / tree-scroll-tooltip / 1 | 9 | 5 | 725.5 MiB | 714.2 MiB |
| 0.6.12 / tree-scroll-tooltip / 2 | 11 | 5 | 736.8 MiB | 607.8 MiB |
| 0.6.13 / idle / 1 | 14 | 8 | 446.1 MiB | 622.6 MiB |
| 0.6.13 / idle / 2 | 13 | 8 | 511.7 MiB | 618.3 MiB |
| 0.6.13 / fishing / 1 | 15 | 8 | 609.9 MiB | 711.5 MiB |
| 0.6.13 / fishing / 2 | 14 | 8 | 576.4 MiB | 586.6 MiB |
| 0.6.13 / mining / 1 | 12 | 5 | 734.4 MiB | 671.1 MiB |
| 0.6.13 / mining / 2 | 11 | 5 | 747.0 MiB | 604.8 MiB |
| 0.6.13 / tree-scroll-tooltip / 1 | 11 | 5 | 617.2 MiB | 666.1 MiB |
| 0.6.13 / tree-scroll-tooltip / 2 | 11 | 5 | 707.6 MiB | 605.6 MiB |

## Limites e interpretação

Uma execução por versão, na mesma máquina, com a carga real de dois clientes. Janelas curtas, coleta de lixo, população do mundo, duração sorteada da espera da pesca e escalonamento do Windows produzem variação. Não é um teste estatístico nem certificação de uma rede escolar. A versão-base não animava as profissões remotas; a nova versão realiza trabalho adicional para o observador. Não se declara melhoria geral de desempenho. A árvore fechada retorna antes de montar nós ou atualizar efeitos.

Renderizador 0.6.12: `ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11)`; janela `1266 × 763`, DPR 1.25.

Carregamento/transição inicial 0.6.12:
```json
{
  "map": "shared-floor-1",
  "started": 909,
  "stages": [
    {
      "name": "structure",
      "ms": 18.5
    },
    {
      "name": "forest-surfaces",
      "ms": 5.399999998509884
    },
    {
      "name": "forest-instances",
      "ms": 10.899999998509884
    },
    {
      "name": "forest-points",
      "ms": 1.9000000022351742
    },
    {
      "name": "forest-decoration",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 1.300000000745058
    },
    {
      "name": "living-prop",
      "ms": 0.8000000007450581
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "water",
      "ms": 3.5
    },
    {
      "name": "water",
      "ms": 1.0999999977648258
    },
    {
      "name": "water",
      "ms": 0.30000000074505806
    },
    {
      "name": "water",
      "ms": 0.30000000074505806
    },
    {
      "name": "living-forest",
      "ms": 0.5
    },
    {
      "name": "awakened-structures",
      "ms": 0.09999999776482582
    },
    {
      "name": "castle",
      "ms": 0.20000000298023224
    },
    {
      "name": "guardian",
      "ms": 0.09999999776482582
    },
    {
      "name": "portal",
      "ms": 3
    },
    {
      "name": "npcs",
      "ms": 0.30000000074505806
    },
    {
      "name": "player-animation",
      "ms": 0.8999999985098839
    },
    {
      "name": "particles",
      "ms": 0.5
    },
    {
      "name": "camera",
      "ms": 13.699999999254942
    },
    {
      "name": "finish",
      "ms": 0
    },
    {
      "name": "entities",
      "ms": 14.699999999254942
    },
    {
      "name": "entities-ready",
      "ms": 15.700000002980232
    },
    {
      "name": "textures",
      "ms": 81.5
    },
    {
      "name": "actor-upload",
      "ms": 15.5
    },
    {
      "name": "actor-upload",
      "ms": 13.5
    },
    {
      "name": "actor-upload",
      "ms": 1.800000000745058
    },
    {
      "name": "actor-atlases",
      "ms": 34.399999998509884
    },
    {
      "name": "prepared-pose",
      "ms": 2
    },
    {
      "name": "shader-submit:0",
      "ms": 5.399999998509884
    },
    {
      "name": "shader-submit:16",
      "ms": 9
    },
    {
      "name": "shader-submit:32",
      "ms": 4.199999999254942
    },
    {
      "name": "shader-submit:48",
      "ms": 1.4000000022351742
    },
    {
      "name": "shader-submit:64",
      "ms": 0.5999999977648258
    },
    {
      "name": "shader-submit:80",
      "ms": 0.5
    },
    {
      "name": "shader-submit:96",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:112",
      "ms": 0.8999999985098839
    },
    {
      "name": "shader-submit:128",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:144",
      "ms": 0.5
    },
    {
      "name": "shader-submit:160",
      "ms": 12.900000002235174
    },
    {
      "name": "shader-submit:176",
      "ms": 1.199999999254942
    },
    {
      "name": "shader-submit:192",
      "ms": 0.7000000029802322
    },
    {
      "name": "shader-submit:208",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:224",
      "ms": 0.5999999977648258
    },
    {
      "name": "shader-submit:240",
      "ms": 1
    },
    {
      "name": "shader-submit:256",
      "ms": 0.9000000022351742
    },
    {
      "name": "shader-submit:272",
      "ms": 0.6999999992549419
    },
    {
      "name": "shader-submit:288",
      "ms": 0.3999999985098839
    },
    {
      "name": "shader-submit:304",
      "ms": 0.7999999970197678
    },
    {
      "name": "shader-submit:320",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:336",
      "ms": 0.3999999985098839
    },
    {
      "name": "shader-submit:352",
      "ms": 0.5
    },
    {
      "name": "shader-submit:368",
      "ms": 0.3999999985098839
    },
    {
      "name": "shader-submit:384",
      "ms": 5.400000002235174
    },
    {
      "name": "shader-submit:400",
      "ms": 1.0999999977648258
    },
    {
      "name": "shader-submit:416",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:432",
      "ms": 3.100000001490116
    },
    {
      "name": "shader-submit:448",
      "ms": 4.100000001490116
    },
    {
      "name": "shader-submit:464",
      "ms": 1
    },
    {
      "name": "shader-submit:480",
      "ms": 0.8999999985098839
    },
    {
      "name": "shader-submit:496",
      "ms": 0.9000000022351742
    },
    {
      "name": "shader-submit:512",
      "ms": 0.6999999992549419
    },
    {
      "name": "shader-submit:528",
      "ms": 1.4000000022351742
    },
    {
      "name": "shader-submit:544",
      "ms": 0.8999999985098839
    },
    {
      "name": "shaders",
      "ms": 234.60000000149012
    },
    {
      "name": "gpu-shader-submit:0",
      "ms": 3.699999999254942
    },
    {
      "name": "gpu-shader-submit:16",
      "ms": 5.600000001490116
    },
    {
      "name": "gpu-shader-submit:32",
      "ms": 4
    },
    {
      "name": "gpu-shader-submit:48",
      "ms": 1
    },
    {
      "name": "gpu-shader-submit:64",
      "ms": 1
    },
    {
      "name": "gpu-shader-submit:80",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-shader-submit:96",
      "ms": 0.6999999992549419
    },
    {
      "name": "gpu-shader-submit:112",
      "ms": 0.5999999977648258
    },
    {
      "name": "gpu-shader-submit:128",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:144",
      "ms": 0.4000000022351742
    },
    {
      "name": "gpu-shader-submit:160",
      "ms": 1.0999999977648258
    },
    {
      "name": "gpu-shader-submit:176",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:192",
      "ms": 1.300000000745058
    },
    {
      "name": "gpu-shader-submit:208",
      "ms": 1.1000000014901161
    },
    {
      "name": "gpu-shader-submit:224",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:240",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-shader-submit:256",
      "ms": 0.3999999985098839
    },
    {
      "name": "gpu-shader-submit:272",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:288",
      "ms": 0.3999999985098839
    },
    {
      "name": "gpu-shader-submit:304",
      "ms": 0.30000000074505806
    },
    {
      "name": "gpu-shader-submit:320",
      "ms": 0.3999999985098839
    },
    {
      "name": "gpu-shader-submit:336",
      "ms": 0.30000000074505806
    },
    {
      "name": "gpu-shader-submit:352",
      "ms": 0.5999999977648258
    },
    {
      "name": "gpu-shader-submit:368",
      "ms": 0.4000000022351742
    },
    {
      "name": "gpu-shader-submit:384",
      "ms": 3.7000000029802322
    },
    {
      "name": "gpu-shader-submit:400",
      "ms": 0.8999999985098839
    },
    {
      "name": "gpu-shader-submit:416",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-shader-submit:432",
      "ms": 3
    },
    {
      "name": "gpu-shader-submit:448",
      "ms": 3
    },
    {
      "name": "gpu-shader-submit:464",
      "ms": 0.6999999992549419
    },
    {
      "name": "gpu-shader-submit:480",
      "ms": 0.6999999992549419
    },
    {
      "name": "gpu-shader-submit:496",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:512",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-shader-submit:528",
      "ms": 0.5999999977648258
    },
    {
      "name": "gpu-shader-submit:544",
      "ms": 2.099999997764826
    },
    {
      "name": "gpu-shaders",
      "ms": 179.89999999850988
    },
    {
      "name": "gpu-batch:0:Mesh",
      "ms": 7.100000001490116
    },
    {
      "name": "gpu-batch:1:Mesh",
      "ms": 1.5999999977648258
    },
    {
      "name": "gpu-batch:2:Mesh",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-batch:3:Mesh",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-batch:4:Mesh",
      "ms": 0.5
    },
    {
      "name": "gpu-batch:5:Mesh",
      "ms": 1.0999999977648258
    },
    {
      "name": "gpu-batch:6:Mesh",
      "ms": 0.7000000029802322
    },
    {
      "name": "gpu-batch:7:Mesh",
      "ms": 0.5999999977648258
    },
    {
      "name": "gpu-batch:8:Mesh",
      "ms": 0.5
    },
    {
      "name": "gpu-batch:9:Mesh",
      "ms": 0.8000000007450581
    },
    {
      "name": "gpu-batch:10:Mesh",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-batch:11:Mesh",
      "ms": 0.5
    },
    {
      "name": "gpu-batch:12:Mesh",
      "ms": 0.3999999985098839
    },
    {
      "name": "gpu-batch:13:Mesh",
      "ms": 0.4000000022351742
    },
    {
      "name": "gpu-batch:14:Mesh",
      "ms": 23.5
    },
    {
      "name": "gpu-batch:15:Mesh",
      "ms": 4.199999999254942
    },
    {
      "name": "gpu-batch:16:Sprite",
      "ms": 22.5
    },
    {
      "name": "gpu-batch:17:Mesh",
      "ms": 5.5
    },
    {
      "name": "gpu-batch:18:Mesh",
      "ms": 1.699999999254942
    },
    {
      "name": "gpu-batch:19:Sprite",
      "ms": 1.7000000029802322
    },
    {
      "name": "gpu-batch:20:Mesh",
      "ms": 0.6999999992549419
    },
    {
      "name": "gpu-batch:21:Mesh",
      "ms": 0.9000000022351742
    },
    {
      "name": "gpu-batch:22:Points",
      "ms": 1.300000000745058
    },
    {
      "name": "gpu-batch:23:Sprite",
      "ms": 35.69999999925494
    },
    {
      "name": "gpu-batch:24:Sprite",
      "ms": 15.699999999254942
    },
    {
      "name": "gpu-batch:25:Sprite",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-preparation",
      "ms": 345.19999999925494
    },
    {
      "name": "camera",
      "ms": 0.09999999776482582
    }
  ],
  "heapBefore": 8346462,
  "ready": 1758.5999999977648,
  "total": 849.5999999977648,
  "maxUnit": 35.69999999925494,
  "heapAfter": 15707356,
  "disposalMs": 0.10000000149011612,
  "firstRender": 73,
  "firstSubmittedAt": 1878,
  "requestToWelcome": null,
  "presentationProxy": 5.800000000745058,
  "controlAt": 2008.5999999977648,
  "controlLatency": 1099.699999999255
}
```

Renderizador 0.6.13: `ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11)`; janela `1266 × 763`, DPR 1.25.

Carregamento/transição inicial 0.6.13:
```json
{
  "map": "shared-floor-1",
  "started": 1143.5999999977648,
  "stages": [
    {
      "name": "structure",
      "ms": 14.800000000745058
    },
    {
      "name": "forest-surfaces",
      "ms": 6.699999999254942
    },
    {
      "name": "forest-instances",
      "ms": 6.699999999254942
    },
    {
      "name": "forest-points",
      "ms": 1.699999999254942
    },
    {
      "name": "forest-decoration",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.5
    },
    {
      "name": "living-prop",
      "ms": 0.4000000022351742
    },
    {
      "name": "living-prop",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 0.30000000074505806
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.20000000298023224
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0.30000000074505806
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.19999999925494194
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.09999999776482582
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0.10000000149011612
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "living-prop",
      "ms": 0
    },
    {
      "name": "water",
      "ms": 1.300000000745058
    },
    {
      "name": "water",
      "ms": 0.5
    },
    {
      "name": "water",
      "ms": 0.3999999985098839
    },
    {
      "name": "water",
      "ms": 0.30000000074505806
    },
    {
      "name": "living-forest",
      "ms": 0.3999999985098839
    },
    {
      "name": "awakened-structures",
      "ms": 0.10000000149011612
    },
    {
      "name": "castle",
      "ms": 0.30000000074505806
    },
    {
      "name": "guardian",
      "ms": 0.6999999992549419
    },
    {
      "name": "portal",
      "ms": 3.599999997764826
    },
    {
      "name": "npcs",
      "ms": 0.30000000074505806
    },
    {
      "name": "player-animation",
      "ms": 1.199999999254942
    },
    {
      "name": "particles",
      "ms": 0.3999999985098839
    },
    {
      "name": "camera",
      "ms": 9.300000000745058
    },
    {
      "name": "finish",
      "ms": 0
    },
    {
      "name": "entities",
      "ms": 25.699999999254942
    },
    {
      "name": "entities-ready",
      "ms": 26.399999998509884
    },
    {
      "name": "textures",
      "ms": 76.60000000149012
    },
    {
      "name": "actor-upload",
      "ms": 19.300000000745058
    },
    {
      "name": "actor-upload",
      "ms": 15.300000000745058
    },
    {
      "name": "actor-upload",
      "ms": 0.8000000007450581
    },
    {
      "name": "actor-atlases",
      "ms": 37.5
    },
    {
      "name": "prepared-pose",
      "ms": 1.800000000745058
    },
    {
      "name": "shader-submit:0",
      "ms": 8.199999999254942
    },
    {
      "name": "shader-submit:16",
      "ms": 9.299999997019768
    },
    {
      "name": "shader-submit:32",
      "ms": 4.400000002235174
    },
    {
      "name": "shader-submit:48",
      "ms": 1.5
    },
    {
      "name": "shader-submit:64",
      "ms": 1.3999999985098839
    },
    {
      "name": "shader-submit:80",
      "ms": 0.6999999992549419
    },
    {
      "name": "shader-submit:96",
      "ms": 1.1000000014901161
    },
    {
      "name": "shader-submit:112",
      "ms": 3.599999997764826
    },
    {
      "name": "shader-submit:128",
      "ms": 1.0999999977648258
    },
    {
      "name": "shader-submit:144",
      "ms": 0.8000000007450581
    },
    {
      "name": "shader-submit:160",
      "ms": 0.8000000007450581
    },
    {
      "name": "shader-submit:176",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:192",
      "ms": 3.100000001490116
    },
    {
      "name": "shader-submit:208",
      "ms": 0.8999999985098839
    },
    {
      "name": "shader-submit:224",
      "ms": 0.6999999992549419
    },
    {
      "name": "shader-submit:240",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:256",
      "ms": 0.5
    },
    {
      "name": "shader-submit:272",
      "ms": 1.1000000014901161
    },
    {
      "name": "shader-submit:288",
      "ms": 1.9000000022351742
    },
    {
      "name": "shader-submit:304",
      "ms": 0.8000000007450581
    },
    {
      "name": "shader-submit:320",
      "ms": 0.8999999985098839
    },
    {
      "name": "shader-submit:336",
      "ms": 1
    },
    {
      "name": "shader-submit:352",
      "ms": 0.5999999977648258
    },
    {
      "name": "shader-submit:368",
      "ms": 0.6000000014901161
    },
    {
      "name": "shader-submit:384",
      "ms": 10.599999997764826
    },
    {
      "name": "shader-submit:400",
      "ms": 0.9000000022351742
    },
    {
      "name": "shader-submit:416",
      "ms": 0.5999999977648258
    },
    {
      "name": "shader-submit:432",
      "ms": 7.800000000745058
    },
    {
      "name": "shader-submit:448",
      "ms": 13.299999997019768
    },
    {
      "name": "shader-submit:464",
      "ms": 0.8999999985098839
    },
    {
      "name": "shader-submit:480",
      "ms": 3.100000001490116
    },
    {
      "name": "shader-submit:496",
      "ms": 0.9000000022351742
    },
    {
      "name": "shader-submit:512",
      "ms": 28.799999997019768
    },
    {
      "name": "shader-submit:528",
      "ms": 0.7999999970197678
    },
    {
      "name": "shader-submit:544",
      "ms": 0.4000000022351742
    },
    {
      "name": "shaders",
      "ms": 242.19999999925494
    },
    {
      "name": "gpu-shader-submit:0",
      "ms": 3.100000001490116
    },
    {
      "name": "gpu-shader-submit:16",
      "ms": 7
    },
    {
      "name": "gpu-shader-submit:32",
      "ms": 3.399999998509884
    },
    {
      "name": "gpu-shader-submit:48",
      "ms": 0.8999999985098839
    },
    {
      "name": "gpu-shader-submit:64",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:80",
      "ms": 0.8999999985098839
    },
    {
      "name": "gpu-shader-submit:96",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:112",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-shader-submit:128",
      "ms": 0.8000000007450581
    },
    {
      "name": "gpu-shader-submit:144",
      "ms": 4.5
    },
    {
      "name": "gpu-shader-submit:160",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-shader-submit:176",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:192",
      "ms": 0.3999999985098839
    },
    {
      "name": "gpu-shader-submit:208",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:224",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:240",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-shader-submit:256",
      "ms": 2
    },
    {
      "name": "gpu-shader-submit:272",
      "ms": 0.5999999977648258
    },
    {
      "name": "gpu-shader-submit:288",
      "ms": 0.7000000029802322
    },
    {
      "name": "gpu-shader-submit:304",
      "ms": 0.5999999977648258
    },
    {
      "name": "gpu-shader-submit:320",
      "ms": 0.8000000007450581
    },
    {
      "name": "gpu-shader-submit:336",
      "ms": 0.8000000007450581
    },
    {
      "name": "gpu-shader-submit:352",
      "ms": 1.300000000745058
    },
    {
      "name": "gpu-shader-submit:368",
      "ms": 1.5
    },
    {
      "name": "gpu-shader-submit:384",
      "ms": 4.400000002235174
    },
    {
      "name": "gpu-shader-submit:400",
      "ms": 1.5
    },
    {
      "name": "gpu-shader-submit:416",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:432",
      "ms": 1.800000000745058
    },
    {
      "name": "gpu-shader-submit:448",
      "ms": 10.200000002980232
    },
    {
      "name": "gpu-shader-submit:464",
      "ms": 1.9000000022351742
    },
    {
      "name": "gpu-shader-submit:480",
      "ms": 6
    },
    {
      "name": "gpu-shader-submit:496",
      "ms": 0.7999999970197678
    },
    {
      "name": "gpu-shader-submit:512",
      "ms": 0.5
    },
    {
      "name": "gpu-shader-submit:528",
      "ms": 2.199999999254942
    },
    {
      "name": "gpu-shader-submit:544",
      "ms": 0.8999999985098839
    },
    {
      "name": "gpu-shaders",
      "ms": 200.30000000074506
    },
    {
      "name": "gpu-batch:0:Mesh",
      "ms": 8
    },
    {
      "name": "gpu-batch:1:Mesh",
      "ms": 1.800000000745058
    },
    {
      "name": "gpu-batch:2:Mesh",
      "ms": 1.800000000745058
    },
    {
      "name": "gpu-batch:3:Mesh",
      "ms": 1.199999999254942
    },
    {
      "name": "gpu-batch:4:Mesh",
      "ms": 0.9000000022351742
    },
    {
      "name": "gpu-batch:5:Mesh",
      "ms": 0.6999999992549419
    },
    {
      "name": "gpu-batch:6:Mesh",
      "ms": 0.5
    },
    {
      "name": "gpu-batch:7:Mesh",
      "ms": 1.3999999985098839
    },
    {
      "name": "gpu-batch:8:Mesh",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-batch:9:Mesh",
      "ms": 0.5999999977648258
    },
    {
      "name": "gpu-batch:10:Mesh",
      "ms": 0.4000000022351742
    },
    {
      "name": "gpu-batch:11:Mesh",
      "ms": 1.2000000029802322
    },
    {
      "name": "gpu-batch:12:Mesh",
      "ms": 0.7999999970197678
    },
    {
      "name": "gpu-batch:13:Mesh",
      "ms": 0.7000000029802322
    },
    {
      "name": "gpu-batch:14:Mesh",
      "ms": 28.299999997019768
    },
    {
      "name": "gpu-batch:15:Mesh",
      "ms": 11.700000002980232
    },
    {
      "name": "gpu-batch:16:Sprite",
      "ms": 12.099999997764826
    },
    {
      "name": "gpu-batch:17:Mesh",
      "ms": 3.899999998509884
    },
    {
      "name": "gpu-batch:18:Mesh",
      "ms": 1.5
    },
    {
      "name": "gpu-batch:19:Sprite",
      "ms": 1.199999999254942
    },
    {
      "name": "gpu-batch:20:Mesh",
      "ms": 0.3999999985098839
    },
    {
      "name": "gpu-batch:21:Mesh",
      "ms": 1
    },
    {
      "name": "gpu-batch:22:Points",
      "ms": 3
    },
    {
      "name": "gpu-batch:23:Sprite",
      "ms": 38.099999997764826
    },
    {
      "name": "gpu-batch:24:Sprite",
      "ms": 16.199999999254942
    },
    {
      "name": "gpu-batch:25:Sprite",
      "ms": 0.6000000014901161
    },
    {
      "name": "gpu-preparation",
      "ms": 381.80000000074506
    },
    {
      "name": "camera",
      "ms": 0.10000000149011612
    }
  ],
  "heapBefore": 9953064,
  "ready": 2010.699999999255,
  "total": 867.1000000014901,
  "maxUnit": 38.099999997764826,
  "heapAfter": 14083640,
  "disposalMs": 0,
  "firstRender": 42.30000000074506,
  "firstSubmittedAt": 2111.699999999255,
  "requestToWelcome": null,
  "presentationProxy": 6.800000000745058,
  "controlAt": 2261.099999997765,
  "controlLatency": 1117.5
}
```

Dados brutos: [0.6.12](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration37-rv2-before-1793508330851/report.json>) · [0.6.13](<C:/Users/theuz/.codex/.chatgpt-projects/g-p-6ab572bee00c8191a99fc6be7aeb7536/.logs/iteration37-rv2-after-1793508013387/report.json>).
