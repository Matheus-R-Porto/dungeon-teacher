import {dialogueCases} from './iteration281-scenario.mjs';
import {waterMapCase} from './iteration26-water-map.mjs';
import {navigationCases} from './iteration26-scenario.mjs';
import {destinyCases} from './iteration25-scenario.mjs';
import {waterCases} from './iteration242c-water.mjs';
import {miningCapture} from './iteration242b-local.mjs';
import {caveCases} from './iteration242b-cave.mjs';
import {castleCases} from './iteration242-castle.mjs';
import {foundation} from './iteration241-scenario.mjs';
import {investigate} from './iteration242-performance.mjs';
import {anticipationCases} from './iteration232-anticipation.mjs';
import {edges} from './iteration232-edge.mjs';
import {transitions} from './iteration232-transitions.mjs';
import {focusedGameplay} from './iteration232-gameplay.mjs';
import {graphicsUI} from './iteration231-ui.mjs';
import {scenarios} from './iteration231-scenarios.mjs';
import {Game} from '../src/simulation/game.js';
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
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),oldOutput=path.join(root,iteration21?(visualOnly?(releaseCheck?(matrixOnly?'.logs/iteration212-matrix-final':'.logs/iteration212-release-check'):'.logs/iteration212-gameplay-after'):'.logs/iteration212-final'):schoolMode?'.logs/school-electron':socialMode?'.logs/social-probe':towerMode?'.logs/tower-probe':'.logs/world-probe');const output=path.join(root,'.logs/iteration242-'+(process.env.BENCH_LABEL||'baseline')+'-'+Date.now());fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){const result=await fn();if(result)return result;await wait(100);}throw Error('Tempo limite da verificaÃ§Ã£o Electron.');}
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
 for(const s of[a,b])await s.evaluate("(()=>{const q=document.querySelector('[data-quality]');if(q){q.value='high';q.dispatchEvent(new Event('change'));const a=document.querySelector('[data-adaptive]');a.checked=false;a.dispatchEvent(new Event('change'));}})()");
 const t=hub.online,p=t.people.get(await a.evaluate('window.__dm.client.id')),q=t.people.get(await b.evaluate('window.__dm.client.id')),publicWorld=t.world('shared-oath-castle');
 const cmd=(s,action)=>s.evaluate(`window.__dm.client.command(${JSON.stringify(action)})`);
 async function atDoor(s,person){const g=new Game(publicWorld.map);Object.assign(g.player,publicWorld.map.guardianHall.door);t.arenas.move(person,publicWorld,g);person.reached=3;t.send(person.ws,t.welcome(person));await until(()=>s.evaluate(`window.__dm?.client.snapshot?.epoch===${JSON.stringify(person.epoch)}`));await wait(300);}
 async function enter(s){await cmd(s,{kind:'arena:request'});await until(()=>s.evaluate("!!document.querySelector('dialog [data-ready]')?.closest('dialog')?.open"));await s.evaluate("document.querySelector('[data-ready]').click()");await until(()=>s.evaluate("!!window.__dm?.client.snapshot?.arena?.encounter"));}
 if(process.env.BENCH_DIALOGUE)await dialogueCases({a,b,t,q,wait,until,capture,report});else if(process.env.BENCH_MAP_WATER)await waterMapCase({a,wait,until,capture,report});else if(process.env.BENCH_NAVIGATION)await navigationCases({a,b,t,p,q,cmd,wait,until,capture,report,output});else if(process.env.BENCH_DESTINY)await destinyCases({a,b,t,p,q,cmd,wait,until,capture,report,output});else if(process.env.BENCH_WATER)await waterCases({a,b,wait,until,capture,report,output});else if(process.env.BENCH_MINING_CAPTURE)await miningCapture({a,wait,until,capture,report});else if(process.env.BENCH_CAVE)await caveCases({a,b,t,p,q,cmd,wait,until,capture,report,output});else if(process.env.BENCH_CASTLE)await castleCases({a,b,t,p,q,cmd,wait,until,capture,report,enter});else if(process.env.BENCH_FOUNDATION)await foundation({a,b,t,p,q,cmd,wait,until,capture,report,enter});else if(process.env.BENCH_INVESTIGATE)await investigate({a,b,t,p,q,cmd,wait,until,capture,report,enter,output});else if(process.env.BENCH_ANTICIPATION)await anticipationCases({a,t,p,cmd,until,wait,enter,capture,report});else if(process.env.BENCH_EDGE)await edges({a,t,p,cmd,until,wait,enter,capture,report});else if(process.env.BENCH_GAMEPLAY)await focusedGameplay({a,t,p,cmd,until,wait,enter,capture,report});else if(process.env.BENCH_UI)await graphicsUI({a,report,until,capture});else if(process.env.BENCH_TRANSITIONS)await transitions({a,b,t,p,q,cmd,wait,until,capture,report,enter});else await scenarios({a,b,t,p,q,cmd,wait,until,capture,report,enter});report.ok=report.errors.length===0;

}catch(error){report.ok=false;report.errors.push(error.stack);report.failureState=[];for(const s of sessions)try{report.failureState.push(await s.evaluate('({gestures:window.__gesture,local:window.__dmInspection?.character.data,tree:document.querySelector("#destiny-tree")?.open,status:window.__dm?.client.status,seq:window.__dm?.client.seq,map:window.__dm?.client.mapId,epoch:window.__dm?.client.epoch,toast:document.querySelector("#toast").textContent})'));await capture(s,'failure-'+s.label);}catch{}}
finally{for(const s of sessions)s.ws.close();for(const child of children)child.kill();await hub?.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({ok:report.ok,errors:report.errors,output}));process.exitCode=report.ok?0:1;}

