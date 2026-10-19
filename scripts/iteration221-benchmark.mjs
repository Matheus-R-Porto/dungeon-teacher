import {stats} from './performance-stats.mjs';
import {SharedTower} from '../server/tower.js';
import {SharedWorld} from '../server/world.js';
import {expandLivingTower} from '../src/world/living-tower.js';
import {applyTowerAccess} from '../server/floor-store.js';
import {WorldClient} from '../src/multiplayer/world-client.js';
import {randomBytes} from 'node:crypto';
import os from 'node:os';
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
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),oldOutput=path.join(root,iteration21?(visualOnly?(releaseCheck?(matrixOnly?'.logs/iteration212-matrix-final':'.logs/iteration212-release-check'):'.logs/iteration212-gameplay-after'):'.logs/iteration212-final'):schoolMode?'.logs/school-electron':socialMode?'.logs/social-probe':towerMode?'.logs/tower-probe':'.logs/world-probe');const output=path.join(root,'.logs/iteration221-benchmark-'+(process.env.BASELINE_V1?'v1-':'v2-')+Date.now());fs.mkdirSync(output,{recursive:true});
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
const extra=[];let tickSamples=[];report.benchmarks=[];report.environment={node:process.version,cpu:os.cpus()[0].model,seconds:20,realElectronProcesses:1,baselineV1:!!process.env.BASELINE_V1};
if(process.env.BASELINE_V1)SharedTower.prototype.world=function(id){if(!this.worlds.has(id)){const record=this.store.load(Number(id.split('-').at(-1)));this.records.set(id,record);this.worlds.set(id,new SharedWorld({map:expandLivingTower(applyTowerAccess(record.definition))}));}return this.worlds.get(id);};
try{
 hub=await startHub({port:0,worldDataDir:path.join(output,'geography'),characterDataDir:path.join(output,'characters'),log(){},onTickSample:s=>tickSamples.push(s),worldOptions:{random:()=>.5}});
 const a=await start('A');const url=await a.evaluate('location.href');await a.send('Page.navigate',{url:url+'&diagnostic=1'});await until(()=>a.evaluate('!!window.__dm'));const p=[...hub.online.people.values()].find(p=>p.name==='Teste '+a.profile);
 async function sample(name){await a.send('Page.bringToFront');await wait(2000);tickSamples=[];await a.evaluate('window.__dm.reset()');const begin=performance.now();await wait(20000);const raw=await a.evaluate('(()=>{const d=window.__dm;d.stop();return {frames:d.frames,inventory:d.inventory(),heap:performance.memory?.usedJSHeapSize,visibility:d.visibility};})()');report.benchmarks.push({name,frames:stats(raw.frames),fps:1000/stats(raw.frames).mean,onePercentLow:1000/stats([...raw.frames].sort((a,b)=>b-a).slice(0,Math.ceil(raw.frames.length*.01))).mean,inventory:raw.inventory,heap:raw.heap,visibility:raw.visibility,tickHz:tickSamples.length*1000/(performance.now()-begin)});fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));}
 await sample('city-one-animated');await a.evaluate('window.__ambient=window.__dm.view.npcActivities;window.__dm.view.npcActivities=[]');await sample('city-one-frozen-control');await a.evaluate('window.__dm.view.npcActivities=window.__ambient');
 Object.assign(p.game.player,hub.online.world(p.mapId).map.portal);await wait(400);await a.evaluate("window.__dm.client.command({kind:'travel',portal:'tower-portal'})");await until(()=>p.mapId==='shared-floor-1');await until(()=>a.evaluate("window.__dm.client.mapId==='shared-floor-1'"));await sample('tower-one-entry');
 const w=hub.online.world(p.mapId),r=w.map.graph.regions.find(r=>r.id===w.map.livingTower.regions[0]);Object.assign(p.game.player,{x:r.x,z:r.z+3});await sample('tower-one-grove-monsters');
 const Socket=class extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}};
 for(let i=0;i<11;i++){const c=new WorldClient({url:'ws://127.0.0.1:'+hub.port+'/hub',protocol:4,Socket,name:'Bench '+i,credential:randomBytes(32).toString('hex')});extra.push(c);c.connect();}
 await until(()=>extra.every(c=>c.status==='Online'));for(const c of extra){const q=hub.online.people.get(c.id);Object.assign(q.game.player,hub.online.world(q.mapId).map.portal);c.command({kind:'travel',portal:'tower-portal'});}await until(()=>extra.every(c=>c.mapId===p.mapId));let i=0;for(const q of hub.online.people.values())if(q!==p)Object.assign(q.game.player,{x:r.x+(i++%4)-2,z:r.z+Math.floor(i/4)+1});await sample('tower-twelve-grove');
 if(!process.env.BASELINE_V1){const d=w.map.surfaces[1],ramp=w.map.surfaces[0];Object.assign(p.game.player,{x:d.x,z:d.z,y:0,surface:'ground'});await sample('structure-ground');await capture(a,'structure-ground');Object.assign(p.game.player,{x:ramp.x,z:ramp.z-ramp.halfZ-1,y:0,surface:'ground'});await a.evaluate(`window.__dm.client.command(${JSON.stringify({kind:'destination',x:d.x,z:d.z,surface:d.id})})`);await until(()=>p.game.player.surface===d.id&&p.game.path.length===0);await sample('structure-upper');await capture(a,'structure-upper');for(let k=0;k<3;k++)await sample('structure-upper-sustained-'+k);}
 report.ok=report.errors.length===0;
}catch(error){report.ok=false;report.errors.push(error.stack);}finally{extra.forEach(c=>c.disconnect());for(const s of sessions){try{await s.send('Browser.close');}catch{}s.ws.close();}for(const child of children)if(child.exitCode===null)child.kill();await hub?.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(output);process.exitCode=report.ok?0:1;}
