import {SharedTower} from '../server/tower.js';
import {applyTowerAccess} from '../server/floor-store.js';
// Diagnostic-only process; never points at player data.
import {startHub} from '../server/hub.js';
import {SharedWorld} from '../server/world.js';
import {OnlineTower} from '../server/online-tower.js';
import {OnlineStore} from '../server/online-store.js';
import {monitorEventLoopDelay,performance} from 'node:perf_hooks';
import {stats} from './performance-stats.mjs';
import path from 'node:path';
let samples={},ticks=[],timers=[],last=0,lastTimer=0,commands={},transitions=0,impacts=0; 
for(const [proto,name,label] of [[OnlineTower.prototype,'save','persistenceCheck'],[OnlineStore.prototype,'save','sqliteSave'],[OnlineStore.prototype,'transaction','sqliteTransaction'],[OnlineStore.prototype,'drops','sqliteRead']]){const fn=proto[name];proto[name]=function(...a){const at=performance.now();try{return fn.apply(this,a);}finally{(samples[label]??=[]).push(performance.now()-at);}};}
const command=OnlineTower.prototype.command;OnlineTower.prototype.command=function(ws,m){commands[m.action.kind]=(commands[m.action.kind]??0)+1;const before=ws.worldPlayer?.mapId,at=performance.now();try{return command.call(this,ws,m);}finally{if(before!==ws.worldPlayer?.mapId)transitions++;(samples.command??=[]).push(performance.now()-at);}};
const impact=SharedWorld.prototype.impact;SharedWorld.prototype.impact=function(...a){const r=impact.apply(this,a);if(r?.hit)impacts++;return r;};
const delay=monitorEventLoopDelay({resolution:10});delay.enable();let elu=performance.eventLoopUtilization(),cpu=process.cpuUsage(),started=performance.now();
// Diagnostic control only: original immutable maps, in this isolated worker.
if(process.env.DIAGNOSTIC_BASE_GEOGRAPHY)SharedTower.prototype.world=function(id){if(!this.worlds.has(id)){const record=this.store.load(Number(id.split('-').at(-1)));this.records.set(id,record);this.worlds.set(id,new SharedWorld({...this.worldOptions,map:applyTowerAccess(record.definition)}));}return this.worlds.get(id);};
const hub=await startHub({port:0,...(process.env.DIAGNOSTIC_LEGACY?{ticker:(step,ms)=>{const t=setInterval(step,ms);return {stop:()=>clearInterval(t)};}}:{}),worldDataDir:path.join(process.argv[2],'maps'),characterDataDir:path.join(process.argv[2],'characters'),worldOptions:{random:()=>.5},log(){},onSendSample:s=>{for(const [k,v]of Object.entries(s))(samples[k]??=[]).push(v);},onTickSample:s=>{if(last)s.interval=s.at-last;last=s.at;ticks.push(s);}});
const timer=setInterval(()=>{const now=performance.now();if(lastTimer)timers.push(now-lastTimer);lastTimer=now;},50);
process.send({ready:hub.port});
function reset(){commands={};transitions=0;impacts=0;samples={};ticks=[];timers=[];last=0;lastTimer=0;delay.reset();elu=performance.eventLoopUtilization();cpu=process.cpuUsage();started=performance.now();}
process.on('message',async m=>{try{let result;
 if(m.kind==='reset'){reset();result=true;}
 if(m.kind==='report'){const elapsed=performance.now()-started,usage=process.cpuUsage(cpu);result={elapsedMs:elapsed,commands,transitions,impacts,tickHz:ticks.length*1000/elapsed,ticks:Object.fromEntries(['total','simulation','snapshots','interval'].map(k=>[k,stats(ticks.map(t=>t[k]).filter(Number.isFinite))])),latenessMs:stats(ticks.filter(t=>t.interval).map(t=>Math.max(0,t.interval-50))),noopTimerMs:stats(timers),methods:Object.fromEntries(Object.entries(samples).map(([k,v])=>[k,stats(v)])),eventLoopDelayMs:{p50:delay.percentile(50)/1e6,p95:delay.percentile(95)/1e6,p99:delay.percentile(99)/1e6,max:delay.max/1e6},eventLoopUtilization:performance.eventLoopUtilization(elu).utilization,cpuPercentOneCore:100*(usage.user+usage.system)/(elapsed*1000),memory:process.memoryUsage(),connections:hub.connections.size};}
 if(m.kind==='fixture'){result=[];for(const p of hub.online?.people.values()??[]){if(!p.ws)continue;const w=hub.online.world(p.mapId),e=w.enemies.find(e=>e.alive&&(m.mode!=='wolf'||e.enemyType==='wolf'));p.target=null;p.game.cancel();p.axis={x:0,z:0};let point=w.map.spawn;if(m.mode==='portal')point=w.map.portal;if(m.mode==='transition'){point=w.map.floorId===1?w.map.portal:w.map.interactables.find(i=>i.content?.areaId==='shared-floor-1')??w.map.portal;}if(['enemy','wolf'].includes(m.mode)&&e)point={x:e.x+1,z:e.z};Object.assign(p.game.player,point);result.push({id:p.id,mapId:p.mapId,enemy:e&&{id:e.id,generation:e.generation},portals:w.map.interactables,fixturePoint:point});}}
 if(m.kind==='close'){clearInterval(timer);delay.disable();await hub.close();process.exit(0);}
 process.send({reply:m.id,result});
 }catch(e){process.send({reply:m.id,error:e.stack});}});
