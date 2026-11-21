import {CLASS_SKILLS,CLASS_PATHS} from '../src/domain/abilities/class-skills.js';
import {syncJobs} from '../src/domain/character/job-progress.js';
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
const output=path.join(root,'.logs','iteration32-'+(process.env.BASELINE?'before-':'')+Date.now());fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,timeout=25000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await wait(30);}throw Error('Tempo limite Electron');}
async function port(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
const children=[],sessions=[],report={checks:[],screenshots:[],errors:[]};let hub;
async function start(label){
 const debugPort=await port(),profile='class32-'+label+'-'+Date.now().toString(36);
 const child=spawn(path.join(root,'node_modules/electron/dist/electron.exe'),[root,'--disable-backgrounding-occluded-windows','--disable-features=CalculateNativeWinOcclusion','--test-profile='+profile,'--server=ws://127.0.0.1:'+hub.port+'/hub','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+debugPort],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);
 child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});child.on('error',e=>report.errors.push(e.message));
 let tab;await until(async()=>{try{tab=(await(await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(t=>t.type==='page'&&t.url.startsWith('dungeon://'));return tab;}catch{return false;}});
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});let id=0;const pending=new Map();
 ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method));},12000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
 await send('Runtime.enable');const api={label,profile,child,ws,send,evaluate};sessions.push(api);
 const url=await evaluate('location.href');await send('Page.navigate',{url:url+'&school=1&diagnostic=1'});await until(()=>evaluate("!!document.querySelector('.school-lobby input[name=username]')"));return api;
}
async function capture(s,name){await s.send('Page.bringToFront');await s.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');const r=await s.send('Page.captureScreenshot',{format:'png'});const file=path.join(output,name+'.png');fs.writeFileSync(file,Buffer.from(r.data,'base64'));report.screenshots.push(file);}

try{
 hub=await startHub({school:true,port:0,worldDataDir:path.join(output,'maps'),characterDataDir:path.join(output,'characters'),log(){},worldOptions:{random:()=>.2}});
 const secret='isolated-iteration32-fixture';await hub.school.createAccount({username:'professor',password:secret,role:'teacher'});await hub.school.createAccount({username:'classe_a',password:secret,cohort:'A'});await hub.school.createAccount({username:'classe_b',password:secret,cohort:'A'});const admin=await hub.school.login('professor',secret,'fixture');hub.school.admin(admin.token,'open','A');
 const click=async(s,text)=>{await until(()=>s.evaluate(`!![...document.querySelectorAll('.school-lobby button,dialog[open] button')].find(b=>b.textContent===${JSON.stringify(text)}&&!b.disabled)`));await s.evaluate(`[...document.querySelectorAll('.school-lobby button,dialog[open] button')].find(b=>b.textContent===${JSON.stringify(text)}).click()`);};
 const enter=async(s,user,name)=>{await s.evaluate(`document.querySelector('[name=username]').value=${JSON.stringify(user)};document.querySelector('[name=password]').value=${JSON.stringify(secret)};document.querySelector('.school-lobby form').requestSubmit()`);await until(()=>s.evaluate("!!document.querySelector('[name=hairStyle]')"));await s.evaluate(`document.querySelector('[name=name]').value=${JSON.stringify(name)};document.querySelector('.school-lobby form').requestSubmit()`);await until(()=>s.evaluate("document.querySelector('.school-lobby h2')?.textContent.includes('continua')"));await click(s,'Continuar');await until(()=>s.evaluate("!!window.__dm && document.querySelector('.scene-transition')?.hidden===true"),60000);};
 const a=await start('A');await enter(a,'classe_a','Classes');const p=[...hub.online.people.values()].find(p=>p.name==='Classes');p.character.data.level=10;p.character.data.jobs.origins.novice={level:20,xp:0,earned:19,spent:{}};p.character.data.gold=2000;
 const w=hub.online.world(p.mapId),npc=w.map.npcs.find(n=>n.id==='reset-angel');Object.assign(p.game.player,{x:npc.x+1.4,z:npc.z});p.game.previous={...p.game.player};await wait(800);
 const point=await a.evaluate("(()=>{const d=window.__dm,n=d.view.world.npcs.find(n=>n.id==='reset-angel');return d.view.screenPoint(n.x,1,n.z);})()");await a.send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});await a.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});await until(()=>a.evaluate("document.getElementById('serafina-services').open"));await click(a,'Escolher primeira classe · 100 ouro');await capture(a,'01-escolha-das-cinco-classes');await a.evaluate("document.querySelector('[data-class=mage]').click()");await capture(a,'02-confirmacao-permanente');await a.evaluate("document.querySelector('#serafina-services [data-confirm]').click()");await until(()=>p.character.data.classId==='mage');if(p.character.data.gold!==1900||p.character.data.jobs.firstClass!=='mage')throw Error('Promoção não persistiu corretamente');await click(a,'Fechar');report.checks.push('Promoção real pela UI: cinco cartões, confirmação, Base/Job, escolha permanente e cobrança única');

 p.character.data.jobs.origins.mage={level:50,xp:0,earned:49,spent:{iceLance:2,iceField:2,arcaneBarrier:1}};syncJobs(p.character.data);p.character.data.hotbar=['arcaneBarrier',null,null,null,null,null,null,null];p.character.recalculate();p.character.data.mp=p.character.stats.maxMP;await wait(500);await a.evaluate("document.querySelector('.ability-slot[data-slot=\"1\"]').click()");await until(()=>!!p.abilities?.classEngine?.buffs.arcaneBarrier);await wait(1000);
 report.probe=await a.evaluate(`(()=>{const v=window.__dm.view,e=v.combatVisual.classVFX.entries.get('buff:'+window.__dm.client.id+':arcaneBarrier');return {time:v.combatVisual.combat.game.elapsed,renderer:v.renderer.info.render,sceneVisible:v.scene.visible,sceneAuto:v.scene.matrixWorldAutoUpdate,rootAuto:e.root.matrixWorldAutoUpdate,rootMatrix:e.root.matrixWorld.toArray(),shellMatrix:e.shell.matrixWorld.toArray(),shellVisible:e.shell.material.visible,rootScale:e.root.scale.toArray(),camera:v.camera.position.toArray()};})()`);await capture(a,'probe-normal');
 await a.evaluate(`(()=>{const v=window.__dm.view,e=v.combatVisual.classVFX.entries.get('buff:'+window.__dm.client.id+':arcaneBarrier');e.root.scale.setScalar(5);e.root.updateMatrixWorld(true);v.renderer.render(v.scene,v.camera);})()`);await capture(a,'probe-forced');report.ok=true;
}catch(error){report.ok=false;report.errors.push(error.stack);for(const s of sessions)try{await capture(s,'falha-'+s.label);}catch{}}
finally{for(const s of sessions)s.ws.close();for(const c of children)c.kill();await hub?.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({ok:report.ok,errors:report.errors,checks:report.checks,output}));process.exitCode=report.ok?0:1;}
