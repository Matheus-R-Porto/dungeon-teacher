import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
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
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),oldOutput=path.join(root,iteration21?(visualOnly?(releaseCheck?(matrixOnly?'.logs/iteration212-matrix-final':'.logs/iteration212-release-check'):'.logs/iteration212-gameplay-after'):'.logs/iteration212-final'):schoolMode?'.logs/school-electron':socialMode?'.logs/social-probe':towerMode?'.logs/tower-probe':'.logs/world-probe');const output=path.join(root,'.logs/iteration221-activities-'+Date.now());fs.mkdirSync(output,{recursive:true});
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
 hub=await startHub({port:0,worldDataDir:path.join(output,'geography'),characterDataDir:path.join(output,'characters'),log(){}});
 const a=await start('A');await a.send('Page.navigate',{url:'dungeon://game/index.html?diagnostic=1'});await until(()=>a.evaluate('!!window.__dmInspection'));
 const c=new Character(),bag=new Inventory(c);for(const id of ['trainingSword','fishingRod','simplePickaxe'])bag.acquire(id);bag.equip(0);
 await a.evaluate(`(()=>{const d=window.__dmInspection;d.character.data=${JSON.stringify(c.snapshot())};d.character.recalculate();d.session.seedOverride=42;d.session.startRun();})()`);await wait(600);
 const key=async(k,code)=>{await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code});};
 await a.evaluate('(()=>{const d=window.__dmInspection,s=d.session,spot=s.area.fishingSpots[0];Object.assign(s.game.player,{x:spot.x,z:spot.z});s.game.previous={...s.game.player};d.view.orbit.height=12;d.view.orbit.targetHeight=12;})()');await wait(300);await startVideo(a);await key('f','KeyF');await until(()=>a.evaluate('window.__dmInspection.session.fishing.active'));await wait(300);await capture(a,'fishing-cast');await until(()=>a.evaluate("window.__dmInspection.session.fishing.state==='bite'"),8000);await key(' ','Space');await wait(500);if(!await a.evaluate('window.__dmInspection.view.fishingVisual.fish.visible'))throw Error('Fish presentation absent');await capture(a,'fishing-catch');await wait(1200);if(await a.evaluate('window.__dmInspection.view.fishingVisual.group.visible'))throw Error('Fishing presentation leaked');await finishVideo(a,path.join(output,'fishing-full.webm'));report.checks.push('Real F/Space fishing: cast, bite, confirmed fish, cleanup');
 await a.evaluate('(()=>{const d=window.__dmInspection,s=d.session;s.endRun();s.startBiomePlaytest("CAVE");const v=s.area.mineralVeins[0],r=s.area.graph.regions.find(r=>r.id===v.regionId),dist=Math.hypot(r.x-v.x,r.z-v.z);Object.assign(s.game.player,{x:v.x+(r.x-v.x)/dist*2.2,z:v.z+(r.z-v.z)/dist*2.2});s.game.previous={...s.game.player};d.view.orbit.height=12;d.view.orbit.targetHeight=12;})()');await wait(300);await startVideo(a);await key('f','KeyF');await until(()=>a.evaluate('window.__dmInspection.session.mining.active'));await until(()=>a.evaluate('(()=>{const m=window.__dmInspection.session.mining;return m.state==="strike"&&Math.abs(m.indicator-m.center)<.065})()'),7000);await key(' ','Space');await wait(260);await capture(a,'mining-downstroke');await wait(1000);await finishVideo(a,path.join(output,'mining-full.webm'));report.checks.push('Real F/Space mining with complete downstroke and recovery');
 await a.evaluate('(()=>{const d=window.__dmInspection;d.session.endRun();d.view.orbit.height=12;d.view.orbit.targetHeight=12;d.view.orbit.azimuth=0;})()');await wait(500);
 await startVideo(a);for(const [key,code] of [['w','KeyW'],['s','KeyS'],['a','KeyA'],['d','KeyD']]){await a.send('Input.dispatchKeyEvent',{type:'keyDown',key,code});await wait(2200);await a.send('Input.dispatchKeyEvent',{type:'keyUp',key,code});await wait(500);}await finishVideo(a,path.join(output,'walking-four-directions.webm'));report.checks.push('Four-direction real keyboard walking, stored sword');report.ok=report.errors.length===0;
}catch(error){report.ok=false;report.errors.push(error.stack);for(const s of sessions)try{await capture(s,'failure-'+s.label);}catch{}}
finally{
 for(const s of sessions){fs.writeFileSync(path.join(output,s.label+'.log'),s.logs());try{await s.send('Browser.close');}catch{}s.ws.close();}
 for(const child of children)if(child.exitCode===null)child.kill();await hub?.close();
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.ok?0:1;
}
