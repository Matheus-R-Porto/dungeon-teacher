import {stats} from './performance-stats.mjs';
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
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),oldOutput=path.join(root,iteration21?(visualOnly?(releaseCheck?(matrixOnly?'.logs/iteration212-matrix-final':'.logs/iteration212-release-check'):'.logs/iteration212-gameplay-after'):'.logs/iteration212-final'):schoolMode?'.logs/school-electron':socialMode?'.logs/social-probe':towerMode?'.logs/tower-probe':'.logs/world-probe');const output=path.join(root,'.logs/iteration222-electron-'+Date.now());fs.mkdirSync(output,{recursive:true});
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
 hub=await startHub({port:0,worldDataDir:path.join(output,'maps'),characterDataDir:path.join(output,'characters'),log(){},worldOptions:{random:()=>.5}});
 const a=await start('A'),b=await start('B');for(const s of[a,b]){const url=await s.evaluate('location.href');await s.send('Page.navigate',{url:url+'&diagnostic=1'});await until(()=>s.evaluate('!!window.__dm'));}
 const p=[...hub.online.people.values()].find(p=>p.name==='Teste '+a.profile),q=[...hub.online.people.values()].find(p=>p.name==='Teste '+b.profile);
 async function travel(s,p,id){const w=hub.online.world(p.mapId),o=w.map.interactables.find(i=>i.id===id);Object.assign(p.game.player,{x:o.x,z:o.z,y:0,surface:'ground'});await wait(200);await s.evaluate(`window.__dm.client.command({kind:'travel',portal:'${id}'})`);await until(()=>p.mapId!==w.map.id);await until(()=>s.evaluate(`window.__dm.view.world.id==='${p.mapId}'`));}
 await travel(a,p,'tower-portal');await travel(b,q,'tower-portal');await wait(500);await capture(a,'pradaria-30');report.checks.push('floor one 30 normal entities and portal');
 await travel(a,p,'return-portal');await travel(b,q,'return-portal');const w=hub.online.world(p.mapId),c=w.map.surfaces[1],r=w.map.surfaces[0];
 for(const [s,person]of[[a,p],[b,q]]){Object.assign(person.game.player,{x:r.x,z:r.z-r.halfZ-1,y:0,surface:'ground'});await wait(250);await s.evaluate(`window.__dm.client.command(${JSON.stringify({kind:'destination',x:r.x,z:r.z+r.halfZ+2,surface:c.id})})`);}
 await startVideo(a);await until(()=>p.game.player.surface===c.id&&q.game.player.surface===c.id);await wait(1000);await capture(a,'cave-descent');await finishVideo(a,path.join(output,'cave-descent.webm'));
 for(const person of[p,q]){person.character.data.attributes.str=10;person.character.data.attributes.vit=40;person.character.recalculate();person.character.data.hp=person.character.stats.maxHP;}
 const boss=w.bossEncounter.e;Object.assign(p.game.player,{x:boss.x-4,z:boss.z-2,y:-5,surface:c.id});Object.assign(q.game.player,{x:boss.x+4,z:boss.z-2,y:-5,surface:c.id});await wait(500);await startVideo(a);const point=await a.evaluate(`window.__dm.view.screenPoint(${boss.x},${boss.y+2},${boss.z})`);await click(a,point.x,point.y);await until(()=>p.target?.id===boss.id);report.checks.push('real mouse selection of underground boss');await b.evaluate(`window.__dm.client.command({kind:'attack',target:'${boss.id}',generation:${boss.generation}})`);await wait(7000);await capture(a,'white-wolf-combat');await finishVideo(a,path.join(output,'white-wolf-combat.webm'));report.checks.push('two real Electron clients: prepared evolved characters, authoritative attacks');

 for(const e of w.enemies.filter(e=>e.enemyType==='wolf'&&!e.reinforcement)){e.damage(99999);e.noRespawn=true;}
 for(const person of[p,q]){person.target=null;person.cycle.cancel();person.game.cancel();person.axis={x:0,z:0};person.character.data.hp=person.character.stats.maxHP;}
 w.bossEncounter.howlAt=0;await startVideo(a);await wait(25000);await capture(a,'reinforcements-enter-arena');await finishVideo(a,path.join(output,'reinforcements-enter-arena.webm'));
 const reserves=w.enemies.filter(e=>e.reinforcement&&e.alive);report.reinforcements=reserves.map(e=>({id:e.id,x:e.x,z:e.z,distance:Math.min(...[p,q].map(p=>Math.hypot(p.game.player.x-e.x,p.game.player.z-e.z)))}));
 if(!reserves.some(e=>Math.min(...[p,q].map(p=>Math.hypot(p.game.player.x-e.x,p.game.player.z-e.z)))<8))throw Error('Reinforcements did not reach arena');report.checks.push('Existing allies removed in fixture; summoned wolves traversed cave to arena');report.ok=report.errors.length===0;
}catch(error){report.ok=false;report.errors.push(error.stack);for(const s of sessions)try{await capture(s,'failure-'+s.label);}catch{}}
finally{
 for(const s of sessions){fs.writeFileSync(path.join(output,s.label+'.log'),s.logs());try{await s.send('Browser.close');}catch{}s.ws.close();}
 for(const child of children)if(child.exitCode===null)child.kill();await hub?.close();
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.ok?0:1;
}
