import fs from 'node:fs';
import path from 'node:path';
const folder=path.resolve(process.argv[2]),report=JSON.parse(fs.readFileSync(path.join(folder,'report.json'),'utf8'));
if(!report.ok||report.errors.length)throw Error('Only successful Electron evidence may be published.');
const destination='docs/art/iteration291';fs.mkdirSync(destination,{recursive:true});
const captions={
 'transport-no-cart':'Personagem sem carrinho',
 'transport-capacity':'Capacidade pessoal com mochila equipada',
 'cart-direction-0':'Carrinho acoplado — frente',
 'cart-direction-1':'Carrinho acoplado — esquerda',
 'cart-direction-2':'Carrinho acoplado — costas',
 'cart-direction-3':'Carrinho acoplado — direita',
 'cart-walking-0':'Caminhada — momento 1','cart-walking-1':'Caminhada — momento 2','cart-walking-2':'Caminhada — momento 3',
 'cart-storage-empty':'Compartimento do carrinho vazio','cart-storage-loaded':'Transferência concluída: quatro unidades, 4 kg',
 'drag-in-progress':'Arrastar real para fora da janela','discard-pending':'Descarte confirmado, ainda pendente de fechar',
 'protected-confirmation':'Confirmação de item protegido','drop-on-ground':'PNG físico no chão depois de fechar','drop-collected':'Drop recolhido após recarregar o perfil',
 'drop-pickup-refused':'Recusa de coleta: mensagem e item preservado no chão','drop-weight-refused':'Carga acima da capacidade após a recusa de coleta','transport-online':'Inventário e carrinho no segundo cliente — servidor local',
};
for(const name of Object.keys(captions)){const file=name+'.png';if(!fs.existsSync(path.join(folder,file)))throw Error('Missing screenshot '+file);fs.copyFileSync(path.join(folder,file),path.join(destination,file));}
const parseTest=file=>{const text=fs.readFileSync(file,'utf8'),value=k=>Number(text.match(new RegExp('ℹ '+k+' ([0-9.]+)'))?.[1]);return {log:file,tests:value('tests'),pass:value('pass'),fail:value('fail'),cancelled:value('cancelled'),durationMs:value('duration_ms')};};
const full=parseTest('.logs/iteration291-full-final.txt'),targeted=parseTest('.logs/iteration291-targeted.txt');
if(!full.tests||full.fail||full.pass!==full.tests)throw Error('Full suite must pass before final report.');
const build=fs.readFileSync('.logs/iteration291-build.txt','utf8');if(!build.includes('built in'))throw Error('Build confirmation missing.');
const validation={at:new Date().toISOString(),iteration:'29.1',full,targeted,build:{log:'.logs/iteration291-build.txt',ok:true,warning:'Existing bundle above 500 kB'},electron:{source:folder,ok:report.ok,checks:report.checks,anchors:report.anchors,screenshots:Object.keys(captions).map(n=>destination+'/'+n+'.png')},environment:{platform:process.platform,node:process.version,profiles:'isolated Electron test profiles',server:'local isolated SQLite, no public deployment'},limits:['No 12-cart school hardware benchmark','Cart is a visual accessory, not independent vehicle physics','Offline lost-layout recovery is a provisional refuge rule']};
fs.writeFileSync('docs/iteration291-validation.json',JSON.stringify(validation,null,2)+'\n');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
fs.writeFileSync('docs/ITERACAO-29.1-CAPTURAS.html',`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Dungeon Teacher · Iteração 29.1</title><style>body{margin:0;background:#10221e;color:#e9dfbf;font:16px/1.6 system-ui}main{max-width:1300px;margin:auto;padding:32px}h1,h2{color:#e5c979}a{color:#a8dac8}figure{margin:36px 0;padding:16px;background:#1c332b;border:1px solid #6d6848;border-radius:10px}img{width:100%;height:auto}figcaption{padding:12px 0}nav{display:flex;gap:14px;flex-wrap:wrap}small{color:#b4c6b8}</style><main><h1>Iteração 29.1 · Transporte e drops físicos</h1><p>Capturas reais do Electron, com perfis isolados. Mochila, carrinho de quatro orientações, transferências, arrastar para descartar e coleta. Servidor online somente local.</p><p><strong>${full.pass}/${full.tests} testes aprovados</strong> · ${targeted.pass} direcionados · build concluído · ${report.checks.length} grupos Electron sem erro.</p><nav><a href="ITERACAO-29.1-RELATORIO.md">Relatório</a><a href="ITERACAO-29.1-ARQUITETURA.md">Auditoria</a><a href="iteration291-validation.json">Resultados</a></nav>${Object.entries(captions).map(([name,caption])=>`<figure><h2>${escape(caption)}</h2><a href="art/iteration291/${name}.png"><img loading="lazy" src="art/iteration291/${name}.png" alt="${escape(caption)}"></a><figcaption>${escape(caption)}. <small>Dungeon Teacher · perfil de teste.</small></figcaption></figure>`).join('')}</main></html>`);
console.log(JSON.stringify({full,targeted,captures:Object.keys(captions).length,electronChecks:report.checks.length}));
