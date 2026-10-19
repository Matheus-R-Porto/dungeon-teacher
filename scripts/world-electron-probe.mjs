import {runIteration21Scenario,runLocal21Scenario} from './iteration21-electron-scenario.mjs';
import {runSchoolScenario} from './school-electron-scenario.mjs';
import {runOnlineScenario} from './online-electron-scenario.mjs';
// Two real Electron processes, production entry point, isolated test profiles.
// CDP is bound to loopback only and is used by this development test, not the game.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {startHub} from '../server/hub.js';
import {runTowerScenario} from './tower-electron-scenario.mjs';
const iteration21=process.argv.includes('--iteration21');
const schoolMode=process.argv.includes('--school');
const socialMode=iteration21||schoolMode||process.argv.includes('--social');
const towerMode=socialMode||process.argv.includes('--tower');
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,iteration21?'.logs/iteration21-electron':schoolMode?'.logs/school-electron':socialMode?'.logs/social-probe':towerMode?'.logs/tower-probe':'.logs/world-probe');fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){const result=await fn();if(result)return result;await wait(100);}throw Error('Tempo limite da verificação Electron.');}
async function port(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
const children=[],sessions=[],report={at:new Date().toISOString(),checks:[],screenshots:[],errors:[]};let hub;
async function start(label){
 const debugPort=await port(),profile=`probe-${label}-${Date.now().toString(36)}`;
 const child=spawn(path.join(root,'node_modules/electron/dist/electron.exe'),[root,...(socialMode?[]:['--temporary-tower']),...(towerMode?[]:['--legacy-world']),'--test-profile='+profile,'--server=ws://127.0.0.1:'+hub.port+'/hub','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+debugPort],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);
 let logs='';child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);child.on('error',e=>report.errors.push(e.message));
 const tab=await until(async()=>{try{return (await(await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(t=>t.type==='page'&&t.url.startsWith('dungeon://'));}catch{return false;}});
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});let id=0;const pending=new Map();
 ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timeout);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.text+': '+m.params.exceptionDetails.exception?.description);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timeout=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method));},10000);pending.set(key,{resolve,reject,timeout});ws.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
 await send('Runtime.enable');const api={label,profile,child,ws,send,evaluate,logs:()=>logs};sessions.push(api);
 await until(()=>evaluate("document.querySelector('.shared-status strong')?.textContent==='Online'"));return api;
}
async function capture(s,name){const r=await s.send('Page.captureScreenshot',{format:'png'}),file=path.join(output,name+'.png');fs.writeFileSync(file,Buffer.from(r.data,'base64'));report.screenshots.push(file);}
async function click(s,x,y){await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});}
async function button(s,selector){if(selector==='#pause-button'){await s.evaluate("document.querySelector('.game-menu').open=true");selector='[data-menu=settings]';}await s.evaluate(`(()=>{const d=document.querySelector(${JSON.stringify(selector)})?.closest('dialog');if(d&&!d.open)d.showModal();})()`);const p=await s.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await click(s,p.x,p.y);}
try{
 hub=await startHub({port:0,worldDataDir:path.join(output,'geography'),characterDataDir:path.join(output,'characters'),log(){},worldOptions:{random:()=>.5}});const a=await start('A'),b=await start('B');if(iteration21){await runIteration21Scenario({hub,a,b,until,wait,click,button,capture,report});}else if(schoolMode){await runSchoolScenario({hub,a,b,until,wait,click,button,capture,report});}else if(socialMode){await runOnlineScenario({hub,a,b,until,wait,click,button,capture,report});}else if(towerMode){await runTowerScenario({hub,a,b,until,wait,click,button,capture,report});}else{await until(()=>hub.world.players.size===2);
 for(const s of [a,b])await until(()=>s.evaluate("document.querySelectorAll('.remote-name:not(.own-name)').length===1"));report.checks.push('two isolated Electron processes render one another');
 await capture(a,'01-client-a');await capture(b,'01-client-b');
 const p=[...hub.world.players.values()].find(p=>p.name==='Teste '+a.profile),before={...p.game.player};
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD'});await wait(400);await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD'});
 if(Math.hypot(p.game.player.x-before.x,p.game.player.z-before.z)<.1)throw Error('WASD não moveu o cliente A.');report.checks.push('actual WASD input moves player on server');
 for(const s of [a,b]){
   const pos=await s.evaluate("(()=>{const e=document.querySelector('.shared-enemy');return {x:parseFloat(e.style.left),y:parseFloat(e.style.top)};})()");
   // Label is projected at y=1.5; click lower inside the existing sphere body.
   await click(s,pos.x,pos.y+23);
 }
 await until(()=>hub.world.events.some(e=>e.target==='slime-1'&&e.hit));await capture(a,'02-combat-a');await capture(b,'02-combat-b');
 const sources=new Set(hub.world.events.filter(e=>e.target==='slime-1').map(e=>e.source));await until(()=>new Set(hub.world.events.filter(e=>e.target==='slime-1').map(e=>e.source)).size===2);
 report.checks.push('both clients select and damage same monster through mouse input');
 await until(()=>hub.world.enemies[0].hp===0);await wait(250);
 for(const s of [a,b])if(!(await s.evaluate("document.querySelector('.shared-enemy').textContent.includes('0/100')")))throw Error('HP de morte divergente na interface.');
 await capture(a,'03-death-a');await capture(b,'03-death-b');report.checks.push('same death and zero HP displayed in both clients');
 // Move off the corpse using normal keyboard input so safe respawn can happen.
 for(const s of [a,b])await s.send('Input.dispatchKeyEvent',{type:'keyDown',key:'s',code:'KeyS'});await wait(1800);for(const s of [a,b])await s.send('Input.dispatchKeyEvent',{type:'keyUp',key:'s',code:'KeyS'});
 await button(a,'#pause-button');const tick=hub.world.tick;await until(()=>hub.world.enemies[0].generation===1,12000);if(hub.world.tick<=tick)throw Error('Menu pausou servidor.');
 for(const s of [a,b])if(!(await s.evaluate("document.querySelector('.shared-enemy').textContent.includes('100/100')")))await until(()=>s.evaluate("document.querySelector('.shared-enemy').textContent.includes('100/100')"));report.checks.push('respawn displayed in both clients while one menu is open');
 await button(a,'#pause-dialog [data-close]');await button(a,'[data-connect]');await until(()=>hub.world.players.size===1);await button(a,'[data-connect]');await until(()=>hub.world.players.size===2);
 await until(()=>a.evaluate("document.querySelectorAll('.remote-name:not(.own-name)').length===1"));report.checks.push('disconnect and reconnect retain two unique players');
 }
 for(const s of [a,b]){const dbs=await s.evaluate('indexedDB.databases()');if(dbs.length)throw Error('Mapa de teste abriu IndexedDB.');await capture(s,'04-final-'+s.label);}
 report.checks.push('neither shared client opened any IndexedDB database');
 await a.evaluate("document.getElementById('pause-dialog').showModal()");await button(a,'[data-local]');await until(()=>a.evaluate("!document.querySelector('.shared-status') && document.getElementById('loading')?.hidden && document.getElementById('fatal')?.hidden && document.querySelector('.location h1')?.textContent==='Refúgio do Limiar'"));
 await capture(a,'05-local-campaign');if(iteration21)await runLocal21Scenario({a,until,wait,button,capture,report});report.checks.push('return to local campaign initializes correctly in the isolated test profile');report.ok=report.errors.length===0;
}catch(error){report.ok=false;report.errors.push(error.stack);for(const s of sessions)try{await capture(s,'failure-'+s.label);}catch{}}
finally{
 for(const s of sessions){fs.writeFileSync(path.join(output,s.label+'.log'),s.logs());try{await s.send('Browser.close');}catch{}s.ws.close();}
 for(const child of children)if(child.exitCode===null)child.kill();await hub?.close();
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.ok?0:1;
}
