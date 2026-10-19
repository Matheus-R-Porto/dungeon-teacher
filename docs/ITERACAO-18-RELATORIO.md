# Iteração 18 — Beta 0.2.2

Beta experimental: 12 primeiros andares procedurais, compartilhados, navegáveis e persistentes. Playtest humano pendente (acesso remoto por RustDesk). Nenhum deploy ou commit foi realizado; nenhum instalador foi gerado.

## Arquitetura e conteúdo

`TOWER_FLOOR_COUNT` centraliza o limite em 12; `FLOOR_IDS` deriva as identidades estáveis. `SharedTower` continua coordenando uma instância de `SharedWorld` por andar, criada sob demanda. Não existem doze implementações diferentes. Jogadores, monstros, HP, alvos e eventos pertencem à simulação do respectivo andar.

O mesmo `generateFloor` da campanha é utilizado sem modificar seu algoritmo. Topologia, regiões opcionais, trilhas, obstáculos, posições e sequência de floresta/caverna são preservados. O adaptador compartilhado solicita `floorRole: normal` também em 3/6/9/12: usa encontros comuns existentes, sem chefes improvisados. Mantém espécies e escalas já existentes; não adiciona XP, ouro ou loot. Esse balanceamento continua provisório para personagens temporários com espada de treino.

## Portais e compatibilidade dos arquivos

O portal final sobe ao próximo andar; o portal de entrada desce ao anterior. No andar 12, o portal final informa que o andar 13 está indisponível. Não há retorno artificial do final do andar 2 para o 1. Interface identifica acesso livre para testes.

O servidor valida sessão, identidade da visita, sequência, proximidade, linha de visão, identidade do portal, destino adjacente e capacidade. Carrega/valida o destino antes de transferir o jogador. Cancela movimento/ataque, limpa alvos, troca a visita e posiciona em ponto válido. Comandos da visita anterior são ignorados, mesmo após voltar ao mesmo andar.

Arquivos existentes dos andares 1/2 **não são regravados**. O esquema 1 e a versão anterior `local-tower/0.1.5+shared-policy/1` continuam aceitos. A nova versão de geração do adaptador é `local-tower/0.1.5+shared-policy/2`. Uma função explícita, `applyTowerAccess`, aplica a política de navegação atual sobre uma cópia em memória. Isso atualiza os destinos antigos sem regenerar geometria, recalcular a semente ou alterar os bytes persistidos. Não é uma migração de arquivo.

O welcome informa `storedHash` da definição persistida, `hash` da definição efetivamente enviada e `accessPolicy: 2`. A integridade do arquivo original continua sendo verificada antes da adaptação. Versões desconhecidas, JSON inválido, sementes inconsistentes e hashes divergentes são rejeitados e preservados.

Armazenamento padrão: `data/shared-tower/floor-N.json`; variável `WORLD_DATA_DIR` permite escolher outro diretório. Definições completas, sementes, versão e SHA-256 permanecem no arquivo. Escrita temporária exclusiva, fsync e publicação por hard link sem sobrescrita protegem contra leitura parcial. Backup deve preservar esse diretório. Docker requer volume persistente e filesystem com hard links; não foi testado nesta iteração.

## Simulação e desempenho

Áreas sem jogadores e sem sessões aguardando reconexão deixam de executar ticks. Durante a janela de reconexão de 60 segundos, a simulação continua e expira os tokens normalmente. Após suspensão, HP e população ficam em memória; o relógio da área e seus temporizadores ficam pausados até uma nova entrada. Geografia e simulação não são descartadas ou regeneradas. Não há persistência dinâmica após reinício.

Medição local direcionada (não representa benchmark de produção): criação/leitura de cada andar aproximadamente 2–78 ms; recarregar e comparar os 12 arquivos aproximadamente 44 ms; variação de heap da rotina de geração/comparação 12,77 MiB, incluindo dados de teste e efeitos de GC. Mil passos do coordenador com 12 áreas vazias: 0,73 ms. Maior média por tick de área ocupada no cenário curto com dois atacantes: 0,25 ms. As métricas brutas estão no registro de integração.

Geração e leitura são síncronas: um novo andar pode atrasar brevemente o loop. A suspensão de áreas vazias é a correção proporcional implementada. Não foram adicionados workers ou descarregamento complexo. Memória permanece alocada para os andares visitados; não houve teste de carga com 12 áreas cheias.

## Execução

Na raiz, preparar o cliente:

```powershell
npm run desktop:build
```

Em três terminais separados:

```powershell
npm run server:start
npm run desktop:test:a
npm run desktop:test:b
```

F próximo ao portal viaja. A/B usam perfis isolados em `%APPDATA%\Dungeon Master Tests`. A campanha normal continua disponível e seu IndexedDB não é aberto pelo modo compartilhado. A arena v2 permanece acessível com `npm run desktop:test:legacy`. O Refúgio v1 permanece no caminho existente.

O protocolo continua v3, com novos identificadores de mapa e metadados aditivos. Clientes atuais aceitam os 12 andares. Binários da 0.2.1 têm uma lista de mapas limitada a 1/2 e precisam ser atualizados para explorar os andares novos; os modos v1/v2 são preservados. Nenhuma proteção de Electron, origem, sessão, payload ou frequência foi desativada.

## Validação

- Determinismo e validade dos 12 mapas; floresta/caverna; spawns em posições válidas.
- Fixture de arquivos da 0.2.1 preservada byte a byte, com destino antigo adaptado somente em memória.
- Subida 1→12 e descida 12→1, acesso em 3/6/9/12, limite 13, comandos atrasados e ausência de duplicações.
- Dois clientes WebSocket reais, isolamento, reunião, reconexão no 7, combate sincronizado, morte e respawn; reinício real do servidor e comparação dos 12 arquivos.
- Dois atacantes causam dano real em cada um dos 12 andares, mantendo IDs/populações independentes.
- Suspensão de áreas vazias e expiração correta de sessões.
- Suíte completa: **516/516 aprovados**, zero falhas, aproximadamente 157 s. Build Beta 0.2.2 aprovado (88 módulos), com aviso preexistente de chunk acima de 500 kB. Testes específicos e multiplayer estão incluídos na suíte; a integração direcionada também passou separadamente.
- Electron: cenário com dois processos reais, perfis temporários, F/cliques e renderização dos novos andares. Aprovado, zero exceções reportadas; ambos percorreram 1–12. Capturas de 4, 7 e limite 12 inspecionadas. Retorno à campanha em perfil temporário aprovado e nenhum IndexedDB aberto no modo compartilhado.

A automação posiciona personagens perto de portais/inimigos pelo servidor exclusivamente como preparação do teste; não injeta dano, HP nem transições. Evita repetir longas caminhadas. Uma primeira execução gráfica encontrou uma espera inadequada no teste: acionava F antes da atualização do portal visível. O cenário passou a aguardar o texto do portal correto antes de pressionar a tecla.

Não executados: playtest humano, dois computadores pela internet, rede degradada, carga elevada, Docker, instaladores e falha física de disco. Não declarar aprovação desses cenários.

## Arquivos desta iteração

Criados: `tests/tower-twelve.test.js`, este relatório, registros de testes e capturas Beta 0.2.2.

Modificados: `shared/tower.js`, `server/floor-store.js`, `server/tower.js`, `src/multiplayer/world-mode.js`, `tests/multiplayer-tower.test.js`, `scripts/tower-electron-scenario.mjs`, manifests/locks raiz e servidor, `electron-builder.yml`, `index.html`, `README.md`, `CHANGELOG.md`, `RELATORIOS.md`, instruções/checklist desktop.

Alterações preexistentes foram preservadas. O gerador local, arquivos de `sources/`, saves reais e regras de progressão local não foram editados nesta iteração.

## Limites e Iteração 19

Ainda não há identidade persistente, personagens online salvos, progressão, recompensas, chefes públicos, party ou profissões compartilhadas. A separação entre geografia persistida, política de acesso e simulação dinâmica permite introduzir esses sistemas posteriormente. Não foram iniciados nesta entrega.

Recomendação: playtest humano quando viável, implantação controlada com backup/volume e medição de latência; em seguida, definir identidade, salvamento e progressão da Iteração 19. A Beta 0.2.2 não está declarada pronta para produção.

## Evidências

- [Suíte completa](ITERACAO-18-TESTES.txt)
- [Integração e medições](ITERACAO-18-INTEGRACAO.txt)
- [Relatório Electron](ITERACAO-18-ELECTRON.json)
- [Floresta, andar 4](../screenshots/beta022-floor4.png)
- [Caverna, andar 7](../screenshots/beta022-floor7.png)
- [Limite do andar 12](../screenshots/beta022-floor12-limit.png)
