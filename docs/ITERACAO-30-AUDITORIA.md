# Iteração 30 — auditoria anterior à implementação

Lidos AGENTS.md, RELATORIOS.md, README e relatórios/arquitetura de 28.1B, 29 e 29.1; confrontados com o código vigente. Sources é referência somente leitura. Não reimplementar inventário, transporte, drops ou loot. A referência artística obrigatória é docs/art/iteration281b-sources/expeditionChest.png; catálogo em item-art.json.

## Campanha

RpgPanels → main.onChest → validateChest → fechamento do inventário → RewardPanel.show. Disponibilidade exige Refúgio, instância expeditionChest e um slot livre. validateChest usa chestReward(seed), verifica ouro e aquisição/peso, guarda ticket privado em WeakMap com personagem/instância/seed. Pool real de oito equipamentos, pesos iguais, equipamento ×1 e ouro conforme EXPEDITION. RewardReel já existe: cartões cíclicos, parada cúbica, vencedor injetado no índice final; não sorteia nada.

Ao parar, RewardPanel.commit chama grantChest, que revalida Refúgio, instância, seed, limite de ouro e aquisição. Concede equipamento e ouro e remove baú; save por CharacterPanel.onChange usa CharacterSave/IndexedDB. Falha restaura snapshot e recalcula. Antes do commit nenhuma mutação; depois do save o resultado é durável. Fechamento desktop espera busy e salva. Repetição deve ser bloqueada também na apresentação. O flush não verifica rewardPanel.busy atualmente: acrescentar guarda para evitar salvar estado intermediário da concessão.

Peso de baú é descontado no limite de aquisição: receiving permite max(capacidade,carga atual)+peso do baú antes de remover o baú. Saves já sobrecarregados podem abrir se o peso líquido não aumenta. Inventário cheio continua recusado offline, mesmo que a troca liberasse espaço. Não mudar essas regras.

## Online

onlineUI envia o comando existente open-chest. OnlineTower valida sessão/época/sequência e exige cidade, vida e ausência de combate. Copia Character; determina chestReward exclusivamente no servidor; remove baú na cópia, adquire item, soma ouro, salva SQLite e publica a cópia. Falha não altera o personagem. Instância consumida impede repetição. O servidor usa o espaço liberado pelo baú e o limite max(carga,capacidade), diferentemente da pré-validação offline. Preservar a diferença, não harmonizar nesta iteração.

Não existe roleta online hoje. Reutilizar a mesma RewardPanel/RewardReel para apresentar o resultado já salvo pelo servidor. Confirmar o resultado pelo snapshot autoritativo: desaparecimento da instância solicitada, nova instância do pool e incremento de ouro coerente com o aviso existente do servidor. Nunca calcular seed no cliente online, enviar probabilidades ou conceder localmente. Nenhuma alteração do servidor/protocolo é necessária. Desconexão/timeout devem orientar consultar inventário após reconectar, sem afirmar rollback nem reenviar automaticamente.

## Integrações e segurança

Baús são instâncias de inventário com rewardSeed, preservada por transporte, descarte, coleta e save. 44 PNGs originais da 28.1B e dois ícones de transporte adicionais; usar o mapeamento real de item-art.json. Inventário/carrinho/drops não serão redesenhados. Recompensas continuam diretamente na bolsa.

Dialog modal bloqueia entradas; no Refúgio pausa campanha. InterfaceSafety fecha painéis registrados em perigo/transição; integrar fechamento visual sem cancelar transação já iniciada. Escape antes da concessão pode cancelar apresentação mantendo baú/seed; durante gravação aguarda confirmação. Redução de movimento deve saltar interpolação sem tocar resultado. Fechamento forçado precisa cancelar RAF e liberar busy quando ainda não iniciou gravação. Reentrada durante busy/open é ignorada. Resultados assíncronos não devem atualizar uma apresentação posterior.

## Plano de verificação

Regressões de seed/probabilidade, FPS/parada/skip, concessão única, falta de espaço, sobrecarga, save falho, recarga, cancelamento, teclado, sprites e confirmação online. Executar suíte completa, build e dois Electron reais com perfis/servidor locais isolados; capturar fases reais e resoluções menores. Não usar saves reais, commit, push, deploy ou novo instalador. Aprovação artística humana permanece pendente.
