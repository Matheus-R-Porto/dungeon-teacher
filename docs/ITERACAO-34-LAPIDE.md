# Iteração 34 — morte, lápide e reaparecimento

O sistema de morte, contribuição, transação de recompensas e espera de 900.000 ms já existia. As lacunas eram o horário explícito da derrota e a posição exata, pois a lápide usava a posição fixa do covil. A correção preserva o intervalo original de 15 minutos, o estado persistido e a regra do golpe final.

| Caso | Verificação | Evidência |
| --- | --- | --- |
| Morte no combate real | Impacto autoritativo registra derrota e contribuição | Simulações finais do Lobo com vitórias e regressões existentes |
| Maior dano diferente do golpe final | Primeiro jogador causa quase todo o dano; segundo finaliza; nome do segundo permanece | Regressão `grave records final hitter` |
| Data/hora | `diedAt` vem do relógio do servidor; `respawnAt - diedAt = 900000` | Mesmo teste; interação Electron mostra data e hora |
| Local da morte | Chefe deslocado do covil; posição x/y/z/superfície persistida e compartilhada | Comparação exata no teste e snapshot dos clientes |
| Visibilidade compartilhada | Clientes recebem o mesmo encontro; leitura da lápide na interface | Ensaio Electron com três clientes preparados; captura identificada como fixture |
| Repetição da finalização | Repetir a contribuição não concede XP/drop outra vez nem insere segunda morte | Contadores de XP, drops e tabela de mortes |
| Reinício durante espera | Novo OnlineTower lê estado morto, horário, posição e prazo originais | Reinício após 5 s simulados, usando o mesmo banco de teste |
| Prazo não vencido | Antes de 15 minutos o chefe continua morto | Regressão `elapsed respawn` |
| Prazo vencido com área ocupada | Estado fica pronto, sem nascer em jogador | Mesma regressão, regra de nascimento seguro preservada |
| Área livre | Chefe volta uma vez, incrementa geração e limpa os dados da lápide | Mesma regressão; novo passo não duplica o chefe |
| Reconexão e persistência | Novo envio recupera o estado autoritativo; reinício e sessões testados | Regressões existentes de encontro, SQLite, sessões e carga com reconexões |

Os testes do temporizador avançam o relógio injetado no servidor; não são uma espera física de 15 minutos. O cliente não decide quando o chefe volta. Os ensaios de carga têm tempo de parede real, mas não substituem esse teste específico do relógio.

Registros antigos sem horário/posição continuam legíveis: usa-se o ponto anterior como fallback e não se inventa uma data de morte. A interação formata o instante do servidor no fuso do dispositivo. A captura foi feita após uma finalização de teste no servidor, destinada a inspecionar a interface; não é apresentada como uma vitória humana.

[Testes específicos](dados/iteracao34/iteration34-focused-final.txt) · [Registro Electron](dados/iteracao34/electron-report.json) · [Galeria](ITERACAO-34-CAPTURAS.html)
