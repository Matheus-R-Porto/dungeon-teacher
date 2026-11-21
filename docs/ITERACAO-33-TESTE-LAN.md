# Iteração 33 — roteiro presencial com quatro pessoas

**Pendente de execução.** Os ensaios automatizados utilizaram quatro processos Electron no mesmo computador. Esta ficha não registra uma LAN física como aprovada.

Data: __________ Escola/rede: __________ Responsável: __________

Computador ADM: __________ IP LAN: __________ Porta: __________

Clientes A / B / C / D: ________________________________________

Use contas de teste nesta conferência. Defina com o responsável se o ensaio ocorre na temporada inicial ou antes de importar dados reais. Guarde os instaladores, hashes e o backup de referência.

| Passo | Ação e resultado esperado | Resultado / observação |
|---|---|---|
| 1 | Abrir Dungeon Teacher ADM no anfitrião e autenticar o professor. | ☐ |
| 2 | Iniciar servidor, confirmar online, IP, porta e 0/32 jogadores. | ☐ |
| 3 | Abrir Dungeon Teacher em quatro computadores da mesma rede. | ☐ |
| 4 | Testar descoberta; se bloqueada, informar manualmente IP:porta. | ☐ |
| 5 | Comparar o código completo de identidade com o ADM e confirmar. | ☐ |
| 6 | Cadastrar/autenticar quatro contas distintas, sem seleção de turma. | ☐ |
| 7 | Entrar com quatro personagens; conferir quatro nicknames e 4/32 no ADM. | ☐ |
| 8 | Mover, viajar e observar os demais. Testar combate e uma habilidade, sem mudar mapas/numeração. | ☐ |
| 9 | No ADM, desconectar o jogador A confirmando nickname e ID. | ☐ |
| 10 | A recebe “Você foi desconectado pelo administrador do servidor.”; contador cai para 3/32. | ☐ |
| 11 | A entra novamente e mantém seu personagem. | ☐ |
| 12 | A altera inventário/equipamento. Anotar ouro, Base/XP, Job/XP, classe, habilidades, pontos, aparência, atalhos e andares. | ☐ |
| 13 | Com A conectado, B tenta a mesma conta: nova entrada negada e A continua jogando. | ☐ |
| 14 | A sai da conta; B sai da própria conta e entra na conta de A. Conferir todos os dados anotados. | ☐ |
| 15 | B faz outra alteração, sai; A entra novamente e confere a alteração. | ☐ |
| 16 | Criar backup pelo ADM, encerrar o servidor, conferir aviso nos clientes e estado offline. | ☐ |
| 17 | Reiniciar servidor e entrar novamente; progresso permanece. | ☐ |
| 18 | Fechar janela ADM: verificar opções, manter em segundo plano e reabrir pela área de notificações. | ☐ |
| 19 | Reiniciar o aplicativo cliente: endereço lembrado; senha não preenchida por arquivo do jogo. | ☐ |
| 20 | Registrar resultado, falhas, horários e versões. Não divulgar senhas, tokens ou chave privada nas evidências. | ☐ |

## Diagnóstico simples

- **Servidor offline:** autentique o professor e inicie no ADM. Porta ocupada exige encerrar a outra instância ou escolher uma porta livre em ambos os lados.
- **IP incorreto:** use o IPv4 do adaptador conectado à escola. `127.0.0.1` funciona apenas no próprio computador. VPN e interfaces virtuais podem aparecer no painel.
- **Descoberta sem resultado:** o anúncio usa UDP 8788; informe o IP manualmente. A ausência de anúncio não prova que o jogo esteja bloqueado.
- **Servidor inacessível por IP:** peça ao responsável pela rede para permitir a porta TCP escolhida (padrão 8787) de entrada no anfitrião, restrita à sub-rede escolar e ao perfil de rede autorizado. UDP 8788 é opcional para descoberta. Não desative o firewall inteiro, não abra portas do roteador para a internet e não use regras irrestritas para todas as redes.
- **Wi-Fi de convidados/VLAN:** isolamento entre clientes ou entre Wi-Fi e rede cabeada pode impedir a comunicação. A equipe de rede precisa autorizar esse tráfego; instalar novamente o jogo não resolve isolamento de rede.
- **Código de identidade mudou:** interrompa o login e confira com o responsável. Pode ser outro anfitrião, restauração sem a identidade antiga ou renovação legítima; não aceite automaticamente.
- **Conta em uso após queda:** aguarde a detecção da desconexão e tente novamente. Confirme se a outra instalação realmente saiu. O ADM pode desconectar a sessão correta.
- **Temporada encerrada:** somente o responsável pode conferir, limpar e abrir a nova. Não use a limpeza como tentativa de corrigir um erro de rede.
- **Lentidão:** observe tempo de ciclo, número de jogadores e consumo do anfitrião. Faça o ensaio no hardware real; 32 vagas lógicas não são uma garantia de desempenho de qualquer máquina.

## Critério de fechamento

Registrar os passos 1–20, confirmar persistência entre computadores físicos e tratar as falhas encontradas. Só então a validação LAN da Iteração 33 pode ser considerada concluída. A retenção e o descarte de dados/backups devem ter decisão documentada do responsável da escola.
