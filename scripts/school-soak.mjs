import {fork} from 'node:child_process';
import {createRequire} from 'node:module';
import {randomBytes} from 'node:crypto';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';
import {WorldClient} from '../src/multiplayer/world-client.js';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const Socket=class extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}};
const duration=Number(process.env.SOAK_SECONDS??1800),directory=path.resolve('.logs','school-'+Date.now());fs.mkdirSync(directory,{recursive:true});
const report={environment:{node:process.version,platform:process.platform,cpu:os.cpus()[0].model,logicalCores:os.cpus().length},durationRequested:duration,metrics:[],errors:[],notices:[],checks:[],clients:12,kind:'12 real WebSocket clients; separate server process; no Electron rendering',fixtures:'Server positions only for arrival near monsters/portals. Combat and rewards use normal commands.',unexpectedDisconnects:0,snapshotIntervals:[],commandLatency:[]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));const until=async fn=>{const end=Date.now()+20000;while(!fn()){if(Date.now()>end)throw Error('Timeout');await wait(30);}};
let worker,port,seq=0,clients=[],pending=new Map(),expected=false;
async function start(){port=null;worker=fork(new URL('./school-server-worker.mjs',import.meta.url),[directory],{stdio:['ignore','ignore','pipe','ipc'],windowsHide:true});worker.stderr.on('data',b=>{if(!String(b).includes('ExperimentalWarning')&&!String(b).includes('trace-warnings'))report.errors.push(String(b));});worker.on('message',m=>{if(m.ready)port=m.ready;if(m.metric)report.metrics.push(m.metric);if(m.error||['error','protocol error'].includes(m.event))report.errors.push(m.error??m);if(m.reply){pending.get(m.reply)?.(m.result);pending.delete(m.reply);}});await until(()=>port);}
function fixture(mode){return new Promise(resolve=>{const id=++seq;pending.set(id,resolve);worker.send({kind:'fixture',mode,id});});}
function summary(values){const v=[...values].sort((a,b)=>a-b);return {min:v[0],mean:v.reduce((a,b)=>a+b,0)/v.length,p95:v[Math.floor(v.length*.95)],max:v.at(-1)};}
try{
 await start();const chats=Array.from({length:12},()=>[]),last=Array(12).fill(0),sent=Array(12).fill(null);
 clients=Array.from({length:12},(_,i)=>new WorldClient({url:`ws://127.0.0.1:${port}/hub`,name:'Aluno '+(i+1),credential:randomBytes(32).toString('hex'),protocol:4,Socket,onChat:m=>chats[i].push(m),onNotice:m=>{if(report.notices.length<100)report.notices.push(m);},onStatus:s=>{if(!expected&&s==='Reconectando…')report.unexpectedDisconnects++;},onSnapshot:m=>{const now=performance.now();if(last[i]&&report.snapshotIntervals.length<300000)report.snapshotIntervals.push(now-last[i]);last[i]=now;if(sent[i]&&m.players.find(p=>p.id===clients[i]?.id)?.seq>=sent[i].seq){report.commandLatency.push(now-sent[i].at);sent[i]=null;}}}));clients.forEach(c=>c.connect());await until(()=>clients.every(c=>c.snapshot?.players.length===12));assert.equal(new Set(clients.map(c=>c.id)).size,12);report.checks.push('12 distinct authenticated identities, visible together');
 for(const offset of[0,6])clients[offset].command({kind:'party:create'});await until(()=>clients[0].snapshot.social.group&&clients[6].snapshot.social.group);
 for(let i=1;i<6;i++){for(const offset of[0,6])clients[offset].command({kind:'party:invite',target:clients[offset+i].id});await until(()=>[i,i+6].every(j=>clients[j].snapshot.social.invitations.length));for(const j of[i,i+6])clients[j].command({kind:'party:accept',target:clients[j].snapshot.social.invitations[0].id});await until(()=>[0,6].every(j=>clients[j].snapshot.social.group.members.length===i+1));}
 for(const offset of[0,6])clients[offset].command({kind:'chat',channel:'party',text:'Grupo '+offset});await until(()=>chats.every(v=>v.length===1));for(let i=0;i<12;i++)assert.equal(chats[i][0].text,'Grupo '+(i<6?0:6));report.checks.push('Two independent parties of six, simultaneous invitations, isolated party chat');
 await wait(1100);clients.forEach((c,i)=>c.command({kind:'chat',channel:'global',text:'Presente '+i}));await until(()=>chats.every(v=>v.filter(m=>m.channel==='global').length===12));report.checks.push('Global chat from all twelve');
 if(clients.some(c=>c.mapId==='shared-city')){await fixture('portal');clients.forEach(c=>c.command({kind:'travel',portal:'tower-portal'}));await until(()=>clients.every(c=>c.mapId==='shared-floor-1'&&c.snapshot));}
 const started=Date.now();report.started=new Date(started).toISOString();let iteration=0;
 while(Date.now()-started<duration*1000){
  if(iteration%30===0){const targets=await fixture('enemy');for(const c of clients){const e=targets.find(p=>p.id===c.id)?.enemy;if(e)c.command({kind:'attack',target:e.id,generation:e.generation});}}
  else if(iteration%30>=15&&iteration%30<25)clients.forEach((c,i)=>{const at=performance.now();c.command({kind:'move',x:(iteration%2?1:-1)*(i%2?1:-1),z:0});sent[i]={seq:c.seq,at};});
  if(iteration%30===25)clients.forEach(c=>c.command({kind:'stop'}));
  for(const c of clients){const d=c.snapshot?.drops?.[0];if(d)c.command({kind:'pickup',target:d.id});}
  if(iteration%60===40)clients.forEach((c,i)=>c.command({kind:'chat',channel:i%2?'party':'global',text:'Teste '+iteration+' aluno '+i}));
  await wait(1000);iteration++;
  if(iteration%60===0){fs.writeFileSync(path.join(directory,'progress.json'),JSON.stringify({elapsedSeconds:iteration,connections:clients.filter(c=>c.status==='Online').length,errors:report.errors,metrics:report.metrics.at(-1)},null,2));console.log('Sustained seconds:',iteration);}
 }
 report.elapsedSeconds=(Date.now()-started)/1000;report.checks.push('Sustained movement, combat, snapshots and chat');
 report.finalProfiles=clients.map(c=>({id:c.id,profile:c.snapshot?.profile}));
 // Reconnect every identity, then restart the isolated server with the same data.
 expected=true;clients.forEach(c=>c.disconnect());await wait(11000);clients.forEach(c=>c.connect());await until(()=>clients.every(c=>c.snapshot?.profile));report.checks.push('12 concurrent reconnects');
 clients.forEach(c=>c.disconnect());await wait(500);worker.send({kind:'close'});await new Promise(r=>worker.once('exit',r));await start();await wait(1000);clients.forEach(c=>{c.url=`ws://127.0.0.1:${port}/hub`;c.connect();});await until(()=>clients.every(c=>c.snapshot?.profile));for(let i=0;i<12;i++){assert.equal(clients[i].id,report.finalProfiles[i].id);assert.deepEqual(clients[i].snapshot.profile.inventory,report.finalProfiles[i].profile.inventory);}report.checks.push('Server restart preserves all identities and inventory');
 report.result='passed';
}catch(error){report.result='failed';report.errors.push(error.stack);process.exitCode=1;}
finally{expected=true;clients.forEach(c=>c.disconnect());worker?.send({kind:'close'});report.summary={cpuPercent:summary(report.metrics.map(m=>m.cpuPercent)),rssBytes:summary(report.metrics.map(m=>m.rss)),tickHz:summary(report.metrics.map(m=>m.tickHz)),snapshotIntervalMs:summary(report.snapshotIntervals),commandLatencyMs:summary(report.commandLatency)};fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify(report,null,2));console.log(path.join(directory,'report.json'));}
