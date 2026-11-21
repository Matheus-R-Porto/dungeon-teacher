import {visualCases} from './iteration31-visual.mjs';
// Real production Electron, isolated local server and profiles. Never opens a real save.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {startHub} from '../server/hub.js';
import {adoptJobs} from '../src/domain/character/job-progress.js';
import {Inventory} from '../src/domain/items/inventory.js';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'.logs','iteration31-'+(process.env.BASELINE?'before-':'')+Date.now());fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,timeout=25000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await wait(30);}throw Error('Tempo limite Electron');}
async function port(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
const children=[],sessions=[],report={checks:[],screenshots:[],errors:[]};let hub;
async function start(label){
 const debugPort=await port(),profile='school31-'+label+'-'+Date.now().toString(36);
 const child=spawn(path.join(root,'node_modules/electron/dist/electron.exe'),[root,'--disable-backgrounding-occluded-windows','--disable-features=CalculateNativeWinOcclusion','--test-profile='+profile,'--server=ws://127.0.0.1:'+hub.port+'/hub','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+debugPort],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);
 child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});child.on('error',e=>report.errors.push(e.message));
 let tab;await until(async()=>{try{tab=(await(await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(t=>t.type==='page'&&t.url.startsWith('dungeon://'));return tab;}catch{return false;}});
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});let id=0;const pending=new Map();
 ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method));},12000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
 await send('Runtime.enable');const api={label,profile,child,ws,send,evaluate};sessions.push(api);
 const url=await evaluate('location.href');await send('Page.navigate',{url:url+'&school=1'});await until(()=>evaluate("!!document.querySelector('.school-lobby input[name=username]')"));return api;
}
async function capture(s,name){await s.send('Page.bringToFront');await s.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');const r=await s.send('Page.captureScreenshot',{format:'png'});const file=path.join(output,name+'.png');fs.writeFileSync(file,Buffer.from(r.data,'base64'));report.screenshots.push(file);}

try{
 hub=await startHub({school:true,port:0,worldDataDir:path.join(output,'maps'),characterDataDir:path.join(output,'characters'),log(){},worldOptions:{random:()=>.5}});
 const secret='isolated-test-password-31';await hub.school.createAccount({username:'professor',password:secret,role:'teacher'});await hub.school.createAccount({username:'aluno_a',password:secret,cohort:'A'});const admin=await hub.school.login('professor',secret,'fixture');
 const a=await start('A');
 const click=async(s,text)=>s.evaluate(`(()=>{const e=[...document.querySelectorAll('.school-lobby button,dialog[open] button')].find(b=>b.textContent===${JSON.stringify(text)});if(!e)throw Error('Botão ausente: '+${JSON.stringify(text)});e.click();})()`);
 const login=async(s,name)=>s.evaluate(`(()=>{const root=document.querySelector('.school-lobby');root.querySelector('[name=username]').value=${JSON.stringify(name)};root.querySelector('[name=password]').value=${JSON.stringify(secret)};root.querySelector('form').requestSubmit();})()`);
 await capture(a,'01-inicio');await login(a,'aluno_a');await until(()=>a.evaluate("document.querySelector('.school-notice').textContent.includes('fechada')"));await capture(a,'02-turma-fechada');report.checks.push('Turma fechada bloqueia login no cliente real');
 hub.school.admin(admin.token,'open','A');await login(a,'aluno_a');await until(()=>a.evaluate("!!document.querySelector('[name=hairStyle]')"));await until(()=>a.evaluate("document.querySelector('.school-avatar')?.width===256"));await capture(a,'03-criacao');
 await a.evaluate("document.querySelector('.school-lobby [name=name]').value='Aventureira';document.querySelector('.school-lobby form').requestSubmit()");await until(()=>a.evaluate("document.querySelector('.school-lobby h2').textContent.includes('continua')"));await click(a,'Continuar');await until(()=>a.evaluate("document.querySelector('.shared-status strong')?.textContent==='Online'"),40000);await until(()=>a.evaluate("document.querySelector('.scene-transition')?.hidden===true"),40000);await capture(a,'04-mundo-hud');for(const width of [1024,1366]){await a.send('Emulation.setDeviceMetricsOverride',{width,height:768,deviceScaleFactor:1,mobile:false});await wait(300);const fits=await a.evaluate("[...document.querySelectorAll('.ability-slot')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})");if(!fits)throw Error('Hotbar fora da tela em '+width);await capture(a,'04-hud-'+width);}await a.send('Emulation.clearDeviceMetricsOverride');report.checks.push('HUD e oito atalhos dentro da tela em 1024×768 e 1366×768');
 const person=[...hub.online.people.values()].find(p=>p.name==='Aventureira');if(!person?.character.data.jobs)throw Error('Job ausente');person.character.data.jobs.origins.novice.earned=10;person.character.data.skillSpaces=10;person.character.data.gold=1000;await wait(700);
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab'});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab'});await until(()=>a.evaluate("!!document.querySelector('.ranked-tree[open]')"));await capture(a,'05-arvore');
 await a.evaluate("document.querySelector('[data-skill=powerStrike] button').click()");if(person.character.data.knownAbilities.length)throw Error('Prévia alterou servidor');await click(a,'Confirmar investimentos');await until(()=>person.character.data.knownAbilities.includes('powerStrike'));await capture(a,'06-investimento-confirmado');report.checks.push('Prévia isolada e confirmação autoritativa da Árvore');
 await a.evaluate("document.querySelector('.ranked-tree [data-entry]').value='powerStrike';document.querySelector('.ranked-tree [data-assign]').click()");await until(()=>person.character.data.hotbar[0]==='powerStrike');await click(a,'Fechar · Tab');
 hub.school.admin(admin.token,'end','A');await until(()=>a.evaluate("!document.querySelector('.school-countdown').hidden"));await capture(a,'07-encerramento');hub.school.admin(admin.token,'cancel-end','A');await until(()=>a.evaluate("document.querySelector('.school-countdown').hidden"));report.checks.push('Contagem visível e cancelamento real');
 const b=await start('prof');await login(b,'professor');await until(()=>b.evaluate("document.querySelector('.school-pane h2').textContent==='Painel do professor'"));await capture(b,'08-professor');report.checks.push('Painel real com aluno conectado e turma correta');
 const account=hub.school.db.prepare("SELECT id FROM school_accounts WHERE username='aluno_a'").get();await click(b,'Bloquear e desconectar');await until(()=>a.evaluate("!document.querySelector('.school-lobby').hidden&&document.querySelector('.school-lobby h2').textContent==='Sessão encerrada'"));await capture(a,'09-bloqueio');report.checks.push('Bloqueio retorna o aluno à entrada');
 await visualCases({a,report,capture});
 await hub.school.createAccount({username:'aluno_b',password:secret,cohort:'B'});
 const groupAction=async(label)=>b.evaluate(`(()=>{const card=[...document.querySelectorAll('.school-cohort')].find(c=>c.querySelector('h3').textContent==='Turma B');[...card.querySelectorAll('button')].find(b=>b.textContent===${JSON.stringify(label)}).click();})()`);
 await groupAction('Liberar entrada');await until(()=>hub.school.db.prepare("SELECT open FROM school_cohorts WHERE id='B'").get().open===1);
 const c=a;await c.send('Page.reload');await until(()=>c.evaluate("!!document.querySelector('.school-lobby input[name=username]')"),60000);await login(c,'aluno_b');await until(()=>c.evaluate("!!document.querySelector('[name=hairStyle]')"));await c.evaluate("document.querySelector('.school-lobby [name=name]').value='Persistente';document.querySelector('.school-lobby form').requestSubmit()");await until(()=>c.evaluate("document.querySelector('.school-lobby h2').textContent.includes('continua')"));await click(c,'Continuar');await until(()=>c.evaluate("document.querySelector('.scene-transition')?.hidden===true"),40000);
 const pb=[...hub.online.people.values()].find(p=>p.name==='Persistente');pb.character.data.gold=321;hub.online.save(pb);const beforeEnd=Date.now();await groupAction('Encerrar em 60 s');await until(()=>c.evaluate("!document.querySelector('.school-countdown').hidden"));await capture(c,'14-contagem-turma-b');
 await until(()=>c.evaluate("!document.querySelector('.school-lobby').hidden&&document.querySelector('.school-lobby h2').textContent==='Sessão encerrada'"),70000);const elapsed=Date.now()-beforeEnd;if(elapsed<59000||elapsed>68000)throw Error('Prazo incorreto: '+elapsed);if(hub.online.db.read(pb.id).character.gold!==321)throw Error('Progresso não preservado');await capture(c,'15-aula-encerrada');report.checks.push('Encerramento real de 60 segundos: '+elapsed+' ms; ouro preservado em SQLite');
 await hub.close();hub=null;await c.send('Page.reload');await until(()=>c.evaluate("document.querySelector('.school-server')?.textContent==='Servidor indisponível'"));if(!await c.evaluate("document.querySelector('.school-lobby button[type=submit]').disabled"))throw Error('Login liberado offline');await capture(c,'16-servidor-offline');report.checks.push('Servidor offline impede autenticação e entrada, sem alternativa offline');
 report.ok=report.errors.length===0;
}catch(error){report.ok=false;report.errors.push(error.stack);for(const s of sessions)try{await capture(s,'falha-'+s.label);}catch{}}
finally{for(const s of sessions)s.ws.close();for(const c of children)c.kill();await hub?.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({ok:report.ok,errors:report.errors,checks:report.checks,output}));process.exitCode=report.ok?0:1;}
