import {canTalk} from '../src/domain/dialogue.js';
import {canStand} from '../src/world/collision.js';
import {runPoseMatrix212} from './iteration212-pose-matrix.mjs';
import {runGameplay212} from './iteration212-gameplay-scenario.mjs';
import {runCity211,runLocal211,startVideo,finishVideo} from './iteration211-electron-scenario.mjs';
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
const npcOnly=process.argv.includes('--npc-only');const localOnly=npcOnly||process.argv.includes('--local-only');const matrixOnly=process.argv.includes('--matrix-only');const releaseCheck=matrixOnly||process.argv.includes('--release-check');const visualOnly=releaseCheck||process.argv.includes('--visual-only');const iteration21=true;
const schoolMode=process.argv.includes('--school');
const socialMode=iteration21||schoolMode||process.argv.includes('--social');
const towerMode=socialMode||process.argv.includes('--tower');
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),oldOutput=path.join(root,iteration21?(visualOnly?(releaseCheck?(matrixOnly?'.logs/iteration212-matrix-final':'.logs/iteration212-release-check'):'.logs/iteration212-gameplay-after'):'.logs/iteration212-final'):schoolMode?'.logs/school-electron':socialMode?'.logs/social-probe':towerMode?'.logs/tower-probe':'.logs/world-probe');const output=path.join(root,npcOnly?'.logs/iteration22-npcs':localOnly?'.logs/iteration22-local':visualOnly?'.logs/iteration22-visual':'.logs/iteration22-electron');fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){const result=await fn();if(result)return result;await wait(100);}throw Error('Tempo limite da verificação Electron.');}
async function port(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
const children=[],sessions=[],report={at:new Date().toISOString(),checks:[],screenshots:[],errors:[]};let hub;
async function start(label){
 const debugPort=await port(),profile=`probe-${label}-${Date.now().toString(36)}`;
 const child=spawn(path.join(root,'node_modules/electron/dist/electron.exe'),[root,'--disable-backgrounding-occluded-windows','--disable-features=CalculateNativeWinOcclusion',...(socialMode?[]:['--temporary-tower']),...(towerMode?[]:['--legacy-world']),'--test-profile='+profile,'--server=ws://127.0.0.1:'+hub.port+'/hub','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+debugPort],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});children.push(child);
 let logs='';child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);child.on('error',e=>report.errors.push(e.message));
 const tab=await until(async()=>{try{return (await(await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(t=>t.type==='page'&&t.url.startsWith('dungeon://'));}catch{return false;}});
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});let id=0;const pending=new Map();
 ws.on('message',raw=>{const m=JSON.parse(raw);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timeout);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.text+': '+m.params.exceptionDetails.exception?.description);});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timeout=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method));},10000);pending.set(key,{resolve,reject,timeout});ws.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
 await send('Runtime.enable');const api={label,profile,child,ws,send,evaluate,logs:()=>logs};sessions.push(api);
 await until(()=>evaluate("document.querySelector('.shared-status strong')?.textContent==='Online'"));return api;
}
async function capture(s,name){await s.send('Page.bringToFront');await s.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');const r=await s.send('Page.captureScreenshot',{format:'png'}),file=path.join(output,name+'.png');fs.writeFileSync(file,Buffer.from(r.data,'base64'));report.screenshots.push(file);}
async function click(s,x,y){await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});}
async function button(s,selector){if(selector==='#pause-button'){await s.evaluate("document.querySelector('.game-menu').open=true");selector='[data-menu=settings]';}await s.evaluate(`(()=>{const d=document.querySelector(${JSON.stringify(selector)})?.closest('dialog');if(d&&!d.open)d.showModal();})()`);const p=await s.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await click(s,p.x,p.y);}
try{
 hub=await startHub({port:0,worldDataDir:path.join(output,'geography'),characterDataDir:path.join(output,'characters'),log(){},worldOptions:{random:()=>.5}});
 const a=await start('A'),b=await start('B');
 for(const s of [a,b]){const url=await s.evaluate('location.href');await s.send('Page.navigate',{url:url+'&diagnostic=1'});await until(()=>s.evaluate('!!window.__dm'));}
 const people=[...hub.online.people.values()],p=people.find(p=>p.name==='Teste '+a.profile),q=people.find(p=>p.name==='Teste '+b.profile);
 if(!localOnly){for(const npc of hub.online.world('shared-city').map.npcs){Object.assign(p.game.player,{x:npc.x,z:npc.z+1.5});await wait(400);await capture(a,'npc-'+npc.id+'-150');await a.evaluate('for(const s of window.__dm.view.npcModels.values())s.scale.set(3,3,1)');await capture(a,'npc-'+npc.id+'-100');await a.evaluate('for(const s of window.__dm.view.npcModels.values())s.scale.set(4.5,4.5,1)');}
 if(!visualOnly)await runOnlineScenario({hub,a,b,until,wait,click,button,capture,report});
 for(const s of [a,b])await s.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())");
 async function travel(s,person,id){const world=hub.online.world(person.mapId),portal=world.map.interactables.find(i=>i.id===id);Object.assign(person.game.player,{x:portal.x,z:portal.z});const old=person.mapId;await wait(400);await s.evaluate(`window.__dm.client.command({kind:'travel',portal:${JSON.stringify(id)}})`);await until(()=>person.mapId!==old);await until(()=>s.evaluate(`window.__dm.client.mapId===${JSON.stringify(person.mapId)}`));await wait(400);}
 if(visualOnly){await travel(a,p,'tower-portal');await travel(b,q,'tower-portal');}else await travel(a,p,'abandon-run');
 for(let floor=1;floor<=3;floor++){
  if(floor>1){await travel(a,p,'return-portal');await travel(b,q,'return-portal');}
  const w=hub.online.world(p.mapId);await capture(a,'floor-'+floor+'-entrance');
  const wolf=w.enemies.find(e=>e.enemyType==='wolf'),area=w.map.graph.regions.find(r=>r.id===w.map.livingTower.regions[0]);
  for(const person of[p,q])Object.assign(person.game.player,{x:area.x-4+(person===q?2:0),z:area.z+2});await wait(700);
  const hashes=await Promise.all([a,b].map(s=>s.evaluate('JSON.stringify(window.__dm.game.world.livingTower)')));if(hashes[0]!==hashes[1])throw Error('Geografia divergente');
  await capture(a,'floor-'+floor+'-grove');
  if(visualOnly){await startVideo(a);await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'s',code:'KeyS'});await wait(1800);await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'s',code:'KeyS'});await finishVideo(a,path.join(output,'floor-'+floor+'-walking.webm'));const second=w.map.graph.regions.find(r=>r.id===w.map.livingTower.regions[1]);Object.assign(p.game.player,{x:second.x,z:second.z+4});await wait(400);await capture(a,'floor-'+floor+'-memorial');continue;}
  await startVideo(a);
  await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD'});await wait(600);await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD'});
  for(const s of[a,b])await s.evaluate(`window.__dm.client.command({kind:'attack',target:${JSON.stringify(wolf.id)},generation:${wolf.generation}})`);
  await until(()=>wolf.hp<wolf.stats.maxHP);await capture(a,'floor-'+floor+'-wolf-combat');await until(()=>wolf.hp===0,35000);await capture(a,'floor-'+floor+'-wolf-dead');await wait(1000);await finishVideo(a,path.join(output,'floor-'+floor+'-combat-gameplay.webm'));
  for(const person of[p,q]){person.target=null;Object.assign(person.game.player,{x:area.x-8,z:area.z+5});}await until(()=>wolf.generation===1,40000);await capture(a,'floor-'+floor+'-respawn');
  const snapshots=await Promise.all([a,b].map(s=>s.evaluate(`window.__dm.client.snapshot.monsters.find(e=>e.id===${JSON.stringify(wolf.id)})`)));if(snapshots.some(e=>e.generation!==1))throw Error('Respawn divergente');
  report.checks.push('Floor '+floor+': same geography, server wolf combat, death and shared respawn in two real Electron clients');
  const second=w.map.graph.regions.find(r=>r.id===w.map.livingTower.regions[1]);Object.assign(p.game.player,{x:second.x,z:second.z+4});await wait(400);await capture(a,'floor-'+floor+'-memorial');
 }
 }report.fixture='Isolated server and two real Electron processes. Positions prepared server-side for short scenarios; movement, attacks, damage, death, XP, loot, respawn and travel use normal simulation/protocol. NPC scale comparisons are visual inspection fixtures.';
 if(npcOnly){
  await a.evaluate("window.__dm.view.orbit.azimuth=-Math.PI*.75;const style=document.createElement('style');style.textContent='.own-name{display:none!important}';document.head.append(style)");
  for(const npc of hub.online.world('shared-city').map.npcs){const map=hub.online.world('shared-city').map;const point=Array.from({length:16},(_,i)=>({x:npc.x+Math.sin(i*Math.PI/8)*1.5,z:npc.z+Math.cos(i*Math.PI/8)*1.5})).find(pos=>canStand(map,pos.x,pos.z,.32)&&canTalk(map,pos,npc));if(!point)throw Error('No valid approach to '+npc.id);Object.assign(p.game.player,point);await wait(500);await capture(a,'npc-'+npc.id+'-clear-angle');const screen=await a.evaluate(`window.__dm.view.screenPoint(${npc.x},1,${npc.z})`);await click(a,screen.x,screen.y);await until(()=>a.evaluate("!!document.querySelector('.npc-dialog[open]')"));await capture(a,'npc-'+npc.id+'-dialogue');await a.evaluate("document.querySelector('.npc-dialog').close()");}
  report.checks.push('All six enlarged NPCs inspected from alternate camera angle and dialogs opened by normal mouse input');
 }else{
 await a.evaluate("document.getElementById('pause-dialog').showModal()");await button(a,'[data-local]');await until(()=>a.evaluate("!document.querySelector('.shared-status')"));const localUrl=new URL(await a.evaluate('location.href'));localUrl.searchParams.set('diagnostic','1');await a.send('Page.navigate',{url:localUrl.href});await until(()=>a.evaluate('!!window.__dmInspection'));
 await a.evaluate("(()=>{const d=window.__dmInspection;d.session.seedOverride=42;d.session.startRun();})()");await wait(500);await capture(a,'campaign-expanded-floor-1');
 if(!await a.evaluate('!!window.__dmInspection.session.area.livingTower'))throw Error('Campaign not expanded');report.checks.push('Local campaign initializes expanded floor with existing progression');}
 report.ok=report.errors.length===0;
}catch(error){report.ok=false;report.errors.push(error.stack);for(const s of sessions)try{await capture(s,'failure-'+s.label);}catch{}}
finally{
 for(const s of sessions){fs.writeFileSync(path.join(output,s.label+'.log'),s.logs());try{await s.send('Browser.close');}catch{}s.ws.close();}
 for(const child of children)if(child.exitCode===null)child.kill();await hub?.close();
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.ok?0:1;
}

