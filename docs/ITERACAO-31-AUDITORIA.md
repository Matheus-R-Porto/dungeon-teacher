# Reformulação integrada — auditoria inicial (Iteração 31)

Base: iteração 30, 788 testes aprovados, baús/roleta ilustrados; 29.1 transporte; 28.1B catálogo de 44 PNGs preservados. AGENTS determina sources somente leitura. Usuário confirmou preservar mapas e numeração atuais: Cidade do Limiar separada da Torre, promoções vinculadas a 12 e 36.

Stack: ES modules JavaScript, Three.js, Vite, Electron, WebSocket ws, SQLite node:sqlite no servidor; IndexedDB somente na campanha de desenvolvimento. OnlineStore usa WAL/FULL e checksum, OnlineTower salva cópias para comandos transacionais. Hub suporta protocolos históricos 1–4. Autoridade online existente deve ser reutilizada.

Login atual: credencial aleatória por instalação guardada com safeStorage, cria personagem automaticamente. Não há usuário/senha, papéis, turmas ou administrador. Ampliar o mesmo armazenamento com tabelas de contas, sessões, turmas e auditoria; vincular uma conta a um personagem existente no formato vigente. Entrada escolar bloqueia protocolos anônimos no servidor; manter modo de desenvolvimento explicitamente separado. Padrão das duas turmas: fechado.

HUD: player-hud e game-shell; minimapa e NavigationMap funcionais; oito posições de AbilityHud. Inventário central 32 slots, dez equipamentos incluindo transporte, carrinho separado, pesos derivados e WorldDropView. Preservar todos. Efeitos reais hoje incluem alimentos, sobrecarga e Regeneração. Não criar debuff de pântano apenas para preencher HUD.

Combate: cinco habilidades reais powerStrike/doubleAttack/doubleShot/energyBall/regeneration. As ativas funcionam na campanha; runtime online atual declara indisponibilidade, oferece ataque automático. Qualquer ativação online precisa executar no servidor usando definições/validações existentes, sem poder do cliente. Árvore atual tem aquisição binária e pontos por Base Level. Nova estrutura precisa separar Job, origem e investimentos mantendo migração gratuita explícita.

Sprites: SpriteActor usa VisualCombat existente (saque .24 s, guarda .32 s, permanência 5 s, cinco passos). Direções lógicas resolvem quatro linhas ilustradas. Atlas principal 6×4, célula 320, âncora inferior .1; armas atuais estão embutidas em poses completas 6×8 e transições/ações. Não basta sobrepor novas armas a essas poses: a nova composição deve usar bases desarmadas e reutilizar estados/temporizadores. Atlas de ferramentas e morte têm formatos próprios; manter recursos originais. Botas reais travelerBoots e agileBoots; demais peças e slots vêm do catálogo, nunca inventar itens para preencher arte.

Progressão: somente novice hoje. Não há Job XP, classes jogáveis, especializações definidas, missões de promoção ou atividades educacionais reais. Pontos e níveis devem ter estrutura por origem; conteúdos de classe/especializações não definidos permanecem explicitamente indisponíveis. Serafina já existe no mundo/diálogos; serviços novos devem validar proximidade, saldo e efeito no servidor. Marcos 12/36 não serão deslocados. Metas de horas requerem futura medição, não serão declaradas comprovadas.

Execução: acesso/contas/turmas primeiro; personagem único e aparência; composição visual; HUD; progressão/árvore/serviços; testes e captura. Registros e ensaios somente em bancos/perfis isolados. Sem dados reais, commit, push ou deploy. Critérios parciais não equivalem a conclusão.

Segurança de senha: scrypt assíncrono N=131072,r=8,p=1 com salt aleatório e comparação timingSafeEqual; concorrência limitada. Tokens aleatórios, somente hashes persistidos, expiração absoluta/inatividade, sem senha ou token em logs. Referências: https://nodejs.org/api/crypto.html e https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html.
