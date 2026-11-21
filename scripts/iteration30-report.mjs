import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.argv[2];if(!output)throw Error('Informe a pasta de entrega.');
const runs=fs.readdirSync(path.join(root,'.logs')).filter(n=>/^iteration30-\d+$/.test(n)).sort().reverse();
const run=runs.find(n=>{const f=path.join(root,'.logs',n,'report.json');return fs.existsSync(f)&&JSON.parse(fs.readFileSync(f)).ok;});if(!run)throw Error('Falta ensaio Electron aprovado.');
const result=JSON.parse(fs.readFileSync(path.join(root,'.logs',run,'report.json')));
const full=fs.readFileSync(path.join(root,'.logs/iteration30-full-final.txt'),'utf8'),build=fs.readFileSync(path.join(root,'.logs/iteration30-build.txt'),'utf8');
if(!full.includes('pass 788')||!full.includes('fail 0')||!build.includes('built in'))throw Error('Verificações finais incompletas.');
const duration=Number(full.match(/duration_ms ([\d.]+)/)[1])/1000;
const sourceScreens=path.join(root,'screenshots/iteration30'),deliveryScreens=path.join(output,'capturas');fs.mkdirSync(sourceScreens,{recursive:true});fs.mkdirSync(deliveryScreens,{recursive:true});
const before=fs.readdirSync(path.join(root,'.logs')).find(n=>n.startsWith('iteration30-before-'));
const paths=[...JSON.parse(fs.readFileSync(path.join(root,'.logs',before,'report.json'))).screenshots,...result.screenshots];
for(const file of paths){fs.copyFileSync(file,path.join(sourceScreens,path.basename(file)));fs.copyFileSync(file,path.join(deliveryScreens,path.basename(file)));}
const captions={
 '00-before-inventory':'Antes · inventário preservado','00-before-reel':'Antes · roleta com símbolos genéricos','01-inventory':'Inventário · ação de abertura existente',
 '02-closed':'Baú fechado em destaque','03-anticipation':'Antecipação da abertura','04-crack':'Tampa iniciando a abertura','05-half':'Baú parcialmente aberto','06-open':'Baú aberto','07-transition':'Transição para a roleta','08-reel':'Roleta com sprites do catálogo','09-slowing':'Desaceleração','10-approaching':'Aproximação do resultado','10-selected-saving':'Item selecionado · gravação em andamento','11-result':'Resultado salvo com sprite, quantidade e ouro','12-repeat-result':'Segunda abertura · pulo por Espaço','13-window-800x600':'Janela 800 × 600','13-window-480x720':'Janela 480 × 720','13-window-640x480':'Janela 640 × 480','14-save-failure':'Falha simulada de gravação · baú preservado','15-reduced-motion':'Redução de movimento','16-full-inventory':'Inventário cheio · abertura recusada','17-online-result':'Online · resultado confirmado pelo servidor','18-online-failure':'Online · falha de gravação recusada','19-online-interrupted':'Online · interrupção e orientação de recuperação'
};
const frames=Object.entries(captions).filter(([n])=>fs.existsSync(path.join(deliveryScreens,n+'.png'))).map(([name,label])=>({name,label}));
const sequence=frames.filter(f=>/^(02|03|04|05|06|07|08|09|10|11)-/.test(f.name));
const gallery=prefix=>`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dungeon Teacher · Iteração 30</title><style>*{box-sizing:border-box}body{margin:0;background:#0e221d;color:#eadfc7;font:16px/1.6 system-ui}main{max-width:1200px;margin:auto;padding:32px 20px}h1{font:38px Georgia;margin:12px 0}h2{font:25px Georgia;color:#d7bd82}p{color:#b7c8bb}.eyebrow{letter-spacing:.2em;color:#d7bd82;font-size:12px}button,a{color:#f1dbab}button{border:1px solid #b49d64;background:#284137;padding:11px 18px;border-radius:6px;cursor:pointer;font:inherit}button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #ead09b}figure{margin:0;background:#19342b;border:1px solid #6c714a66;border-radius:10px;overflow:hidden}figure img{width:100%;height:auto;display:block}figcaption{padding:12px 16px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.controls{display:flex;gap:15px;align-items:center;flex-wrap:wrap;margin:15px 0 30px}input{flex:1;min-width:170px}.badge{display:inline-block;border:1px solid #657c57;border-radius:5px;padding:4px 10px;color:#d8e2c6}#sequence{scroll-margin-top:20px}@media(max-width:760px){.grid{grid-template-columns:1fr}h1{font-size:30px}}</style><main><span class="eyebrow">DUNGEON TEACHER · ITERAÇÃO 30</span><h1>Um tesouro da sua jornada</h1><p>Abertura ilustrada, roleta existente e itens reais. Capturas do jogo executado no Electron, em perfis isolados.</p><span class="badge">788 / 788 testes</span> <span class="badge">${result.checks.length} verificações Electron</span> <span class="badge">Build aprovado</span><h2 id="sequence">Sequência completa</h2><p>Use Reproduzir ou arraste o controle. Esta é uma sequência de capturas reais das fases, com relógio diagnóstico controlado; não é uma gravação contínua nem uma medição de fluidez. O fluxo online também foi executado em tempo normal.</p><figure><img id="frame" src="${prefix}${sequence[0].name}.png" alt="${sequence[0].label}"><figcaption id="label">${sequence[0].label}</figcaption></figure><div class="controls"><button id="play">Reproduzir sequência</button><input id="position" type="range" min="0" max="${sequence.length-1}" value="0" aria-label="Quadro da sequência"><span id="count">1 / ${sequence.length}</span></div><h2>Antes, depois e situações de teste</h2><div class="grid">${frames.map(f=>`<figure><a href="${prefix}${f.name}.png"><img src="${prefix}${f.name}.png" loading="lazy" alt="${f.label}"></a><figcaption>${f.label}</figcaption></figure>`).join('')}</div><p>Arte gerada com imagegen a partir do baú existente. A aprovação artística humana permanece pendente. Nenhum save real, commit, push, deploy ou novo instalador.</p></main><script>const frames=${JSON.stringify(sequence)},prefix=${JSON.stringify(prefix)},slider=document.querySelector('#position');let timer;function show(i){slider.value=i;document.querySelector('#frame').src=prefix+frames[i].name+'.png';document.querySelector('#frame').alt=frames[i].label;document.querySelector('#label').textContent=frames[i].label;document.querySelector('#count').textContent=(i+1)+' / '+frames.length}function pause(){clearInterval(timer);timer=null;document.querySelector('#play').textContent='Reproduzir sequência'}slider.oninput=()=>{pause();show(+slider.value)};document.querySelector('#play').onclick=()=>{if(timer){pause();return}if(+slider.value===frames.length-1)show(0);document.querySelector('#play').textContent='Pausar';timer=setInterval(()=>{const i=+slider.value+1;if(i===frames.length){pause();return}show(i)},850)};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});</script></html>`;
fs.writeFileSync(path.join(output,'Galeria-Iteracao-30.html'),gallery('capturas/'));
fs.writeFileSync(path.join(root,'docs/ITERACAO-30-CAPTURAS.html'),gallery('../screenshots/iteration30/'));
const report=`# Dungeon Teacher — Iteração 30

26/10/2026. Continuação da base 29.1, sem reconstruir inventário, transporte ou sistema de recompensas. A apresentação de baús agora reúne abertura ilustrada, roleta existente e resultado legível em um único painel. Aprovação artística humana pendente.

## Auditoria e contrato preservado

Antes das alterações foram lidos AGENTS.md, RELATORIOS.md, README e os relatórios/arquiteturas de 28.1B, 29 e 29.1, e examinados main, RpgPanels, RewardPanel, RewardReel, chest, loot, Inventory, carry, CharacterSave, InterfaceSafety, onlineUI, WorldClient e OnlineTower. Auditoria prévia integral: ITERACAO-30-AUDITORIA.md.

Campanha: validateChest determina o resultado pela seed e prepara o ticket privado antes de qualquer animação. RewardReel representa esse resultado. grantChest revalida e concede equipamento ×1 e ouro; save confirma, e uma falha restaura o snapshot. O baú permanece intacto até a concessão. Cancelar visualmente antes desse ponto mantém instância e seed. Fechamento desktop cancela uma apresentação ainda não submetida; espera uma gravação já iniciada. O flush agora respeita busy para não gravar o estado intermediário.

Online: o comando open-chest existente continua sendo a única solicitação. Servidor valida localização, vida, combate, sessão, época e sequência; determina o prêmio, troca baú por item em cópia e salva antes de publicar. O cliente espera o snapshot confirmado, confere consumo da instância, nova instância, quantidade, ouro e aviso do servidor e só então usa a mesma RewardPanel/RewardReel. Não calcula seed online nem concede localmente. Falta de confirmação não reenvia pedidos e não promete rollback: orienta reconectar e conferir o inventário. Não houve alteração em server/ ou shared/.

Diferença preexistente preservada: a campanha exige um slot vazio; o servidor pode usar o slot liberado pelo próprio baú. Peso continua derivado pelo domínio. Todos os oito prêmios atuais pesam menos que o baú; portanto a exceção existente permite abrir baú de save sobrecarregado quando reduz a carga. Não foi introduzida recusa artificial nem mudança da curva. Ouro, stacks, probabilidades, IDs, seed, mochilas, carrinho, drops e destino direto na bolsa permanecem.

## Direção artística e recursos

Referência obrigatória: docs/art/iteration281b-sources/expeditionChest.png, correspondente ao ícone real de inventário. Produzido com a ferramenta integrada imagegen um atlas RGBA 1280 × 1280, quatro células de 640 × 640: fechado, início, parcial e aberto. Mantém madeira quente, tampa arqueada, duas faixas de ferro escuro, rebites dourados, fechadura e alça lateral. Atlas final: public/assets/rewards-v30/chest-opening.png. O ícone anterior e todos os 44 PNGs foram preservados.

Abertura utiliza quadros com tampa em posições físicas distintas, nunca apenas escala da imagem fechada. CSS acrescenta antecipação discreta, sombra e iluminação âmbar suave; a transição diminui o baú para abrir espaço à roleta. Verde escuro, dourado moderado, moldura simples e tipografia do jogo. O resultado destaca PNG, nome real, quantidade ×1, fatos existentes do catálogo e ouro.

Tempos configuráveis em reward-animation.js: fechado 450 ms; antecipação 220 ms; início 200 ms; parcial 220 ms; aberto 330 ms; transição 200 ms; giro inicial 850 ms; desaceleração 2.400 ms. Total nominal de 4,87 s, mais a confirmação de gravação/rede. Espaço ou botão pula a parte cosmética. Reduced motion vai diretamente à confirmação/resultado. A animação não tem eventos que concedem itens.

RewardReel foi estendido somente com velocidade/duração opcionais e finish(), que avança para o mesmo alvo. Defaults antigos mantidos para consumidores existentes. A interface inicia o deslocamento num trecho já preenchido para evitar uma metade vazia. O pool, a escolha e a curva cúbica continuam os existentes.

## Interface, interrupções e acessibilidade

Modal único com foco, botão de 44 px, Esc seguro, resultado persistente e anúncio legível. Durante save a interação aguarda; fechamento forçado não cancela transação já iniciada. Reentrada e repetição de teclas não duplicam concessão. A apresentação online usa a mesma arte e componente. O painel é registrado na segurança de transições dos dois modos; a desconexão informa como consultar a recompensa possivelmente salva.

O primeiro ensaio identificou estilos globais de exploração reservando espaço para a hotbar e alinhando o modal ao topo. Sobrescritas restritas ao painel de recompensas corrigiram centralização, escurecimento e rolagem. A janela de 640 × 480 recebeu layout compacto. Inventário e demais painéis permanecem com seu desenho anterior.

## Verificação e evidências

- Testes novos direcionados: 11/11 aprovados em tests/iteration30.test.js.
- Suíte completa final: **788/788 aprovados**, zero falhas/cancelamentos/skips, ${duration.toFixed(3)} s. Base anterior: 777 testes. Log: .logs/iteration30-full-final.txt.
- Build de produção aprovado. Log: .logs/iteration30-build.txt. Continua o aviso preexistente de chunk acima de 500 kB; nenhuma dependência adicionada.
- Electron: **${result.checks.length} verificações concluídas**, sem exceções de execução no ensaio aprovado, dois processos reais, servidor local e perfis temporários exclusivos.
- ${frames.length} capturas, incluindo antes, inventário, quatro poses, antecipação, transição, movimento, desaceleração, seleção durante gravação, resultado, repetição, 800 × 600, 480 × 720, 640 × 480, reduced motion, inventário cheio, save falho e online.
- Galeria e reprodução sequencial: ITERACAO-30-CAPTURAS.html. As fases offline foram pausadas pelo relógio diagnóstico usando os métodos reais do componente; não são mockups e não medem fluidez. O fluxo online percorreu automaticamente a sequência em tempo normal.

Verificações Electron:
${result.checks.map(x=>'- '+x).join('\n')}

O teste de recarga compara inventário, equipamentos, carrinho, drops e ouro integralmente, sem depender da ordem das chaves JSON. O campo exploration muda legitimamente ao redescobrir a área após recarga; isso foi registrado no resultado e não é perda de recompensa. O primeiro ensaio online após recarga precisou aguardar mapReady antes dos cliques automatizados; nenhum atraso artificial foi adicionado ao produto.

## Arquivos criados e modificados

Criados: src/ui/reward-animation.js; src/ui/reward-panel.css; src/multiplayer/online-reward.js; public/assets/rewards-v30/chest-opening.png; tests/iteration30.test.js; scripts/iteration30-electron.mjs; scripts/iteration30-scenario.mjs; scripts/iteration30-report.mjs; documentação ITERACAO-30 e screenshots/iteration30/.

Modificados: src/ui/reward-panel.js; src/ui/reward-reel.js; src/main.js (guarda de flush, fechamento desktop, registro de segurança e inspeção diagnóstica); src/style.css (importação do CSS específico); src/multiplayer/online-ui.js (apresentação do resultado confirmado); src/multiplayer/world-mode.js (registro de segurança); README.md e RELATORIOS.md.

Nenhuma alteração em loot.js, chest.js, Inventory, carry, transporte, tabelas, servidor ou protocolo. Cópias dos arquivos de produção anteriores estão na pasta work/before-iteration30 desta tarefa. Sources permaneceu somente leitura.

## Limitações e revisão artística

A arte foi revisada visualmente em capturas reais. O atlas conserva o desenho de referência, mas seus quatro quadros ilustrados são variações geradas, não uma malha articulada: detalhes finos de textura podem variar entre poses. Não há interpolação física contínua da tampa; há quatro posições e transições cosméticas. A revisão humana de continuidade e gosto permanece pendente.

O adaptador online utiliza o texto de aviso já emitido pelo servidor v4, conferido contra mudanças reais de inventário e ouro. Se um servidor futuro mudar esse contrato textual, o cliente orientará consultar o inventário em vez de inventar o resultado. Servidor público não foi atualizado nem usado para este teste. Não houve medição de FPS ou validação em PCs escolares, novo instalador, commit, push ou deploy. Nenhum save real foi modificado.

Reprodução: npm test; npm run build; node scripts/iteration30-electron.mjs. O gerador do relatório recebe como argumento a pasta de entrega e exige logs de teste/build aprovados.
`;
fs.writeFileSync(path.join(root,'docs/ITERACAO-30-RELATORIO.md'),report);fs.writeFileSync(path.join(output,'Relatorio-Iteracao-30.md'),report);
fs.copyFileSync(path.join(root,'docs/ITERACAO-30-AUDITORIA.md'),path.join(output,'Auditoria-Iteracao-30.md'));
fs.copyFileSync(path.join(root,'public/assets/rewards-v30/chest-opening.png'),path.join(output,'chest-opening.png'));
fs.writeFileSync(path.join(root,'docs/iteration30-validation.json'),JSON.stringify({...result,fullSuite:{tests:788,pass:788,fail:0,seconds:duration},build:'passed',captures:frames.length},null,2));
fs.copyFileSync(path.join(root,'docs/iteration30-validation.json'),path.join(output,'validacao.json'));
fs.copyFileSync(path.join(root,'.logs/iteration30-full-final.txt'),path.join(output,'testes-completos.txt'));fs.copyFileSync(path.join(root,'.logs/iteration30-build.txt'),path.join(output,'build.txt'));
const note='## Iteração 30 — abertura de baús e recompensas\n\nApresentação integrada com quatro quadros do baú existente, roleta com sprites reais e resultado persistente. Regras, seed, probabilidades, peso, transporte e concessão preservados. Online apresenta somente a recompensa confirmada pelo servidor, sem alterar o protocolo. 788/788 testes, build aprovado e dois Electron com perfis isolados. Aprovação artística humana pendente; sem novo instalador ou deploy. [Relatório](docs/ITERACAO-30-RELATORIO.md) · [Auditoria](docs/ITERACAO-30-AUDITORIA.md) · [Capturas e sequência](docs/ITERACAO-30-CAPTURAS.html).\n\n';
for(const file of ['README.md','RELATORIOS.md']){const p=path.join(root,file),s=fs.readFileSync(p,'utf8');if(!s.includes('## Iteração 30 — abertura de baús e recompensas')){if(file==='README.md'){const at=s.indexOf('\n')+1;fs.writeFileSync(p,s.slice(0,at)+'\n'+note+s.slice(at));}else fs.writeFileSync(p,s+'\n'+note);}}
console.log(JSON.stringify({run,checks:result.checks.length,captures:frames.length,seconds:duration,output}));
