import fs from 'node:fs';
import path from 'node:path';
import {Game} from '../src/simulation/game.js';
import {frameMetrics} from '../src/core/frame-metrics.js';
import {installCapture} from './iteration233-capture.mjs';
export function metrics(frames){const values=frames.map(f=>f.ms),m=frameMetrics(values);if(!m.n)return m;m.thresholds=Object.fromEntries([16.67,33.33,50,100,150,200].map(n=>{const count=values.filter(v=>v>n).length;return [n,{count,perMinute:count*60/m.seconds,ratio:count/m.n}];}));return m;}
export async function investigate({a,t,p,cmd,wait,until,report,enter,output}){
 if(process.env.OVERHEAD233)return overhead({a,t,p,wait,until,report,output});
 const enabled=process.env.CAPTURE233!=='0',panel=process.env.PANEL233==='1',trace=process.env.TRACE233==='1';
 report.method={enabled,panel,trace,postTransitionMs:2000,clients:2,repetitions:Number(process.env.REPEATS233??5),duration:Number(process.env.SECONDS233??0),fixture:'authoritative server transfers, actual arena request/readiness; 15Hz commands',inventory:await a.evaluate('window.__dm.inventory()')};
 await a.evaluate(`(${installCapture.toString()})(${JSON.stringify({enabled,panel,gpu:trace})})`);
 let traceDone;
 if(trace){traceDone=new Promise(resolve=>{const listen=raw=>{const m=JSON.parse(raw);if(m.method==='Tracing.tracingComplete'){a.ws.off('message',listen);resolve(m.params);}};a.ws.on('message',listen);});await a.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing,gpu,disabled-by-default-v8.gc,disabled-by-default-devtools.timeline',transferMode:'ReturnAsStream'});await a.evaluate("console.timeStamp('iteration233-anchor:'+performance.now())");await a.send('Profiler.enable');await a.send('Profiler.setSamplingInterval',{interval:2000});await a.send('Profiler.start');}
 report.transitions=[];report.samples=[];p.character.data.attributes.vit=1000;p.character.recalculate();p.character.data.hp=p.character.stats.maxHP;
 async function ready(){await until(()=>a.evaluate(`window.__dm.client.epoch===${JSON.stringify(p.epoch)}&&window.__dm.view.world.id===window.__dm.client.mapId&&!window.__dm.graphics.loading`),30000);}
 async function move(f,pos){const w=t.world('shared-floor-'+f),g=new Game(w.map);Object.assign(g.player,pos??w.map.spawn);t.arenas.move(p,w,g);p.reached=3;t.send(p.ws,t.welcome(p));await ready();return w;}
 async function transfer(name,action){const start=await a.evaluate('performance.now()');await action();await ready();report.transitions.push({name,start,end:await a.evaluate('performance.now()'),detail:await a.evaluate('window.__dm.view.transitionReport')});}
 async function activity(name,seconds=8,target){const start=await a.evaluate('performance.now()');let k=0;await a.evaluate("window.__cam233=setInterval(()=>window.__dm.view.orbit.azimuth+=.012,100)");const timer=setInterval(()=>{k++;if(target&&k%45===1)cmd(a,{kind:'attack',target:target.id,generation:target.generation}).catch(()=>{});else if(!target)cmd(a,{kind:'move',x:k%120<60?.2:-.2,z:0}).catch(()=>{});},1000/15);try{await wait(seconds*1000);}finally{clearInterval(timer);await cmd(a,{kind:'stop'});await a.evaluate('clearInterval(window.__cam233)');}report.samples.push({name,start,end:await a.evaluate('performance.now()')});}
 const started=performance.now(),seconds=Number(process.env.SECONDS233??0);
 for(let i=0;seconds?performance.now()-started<seconds*1000:i<report.method.repetitions;i++){
  await transfer('floor1-'+i,()=>move(1));await activity('floor1-'+i,Number(process.env.ACTIVITY233??8));
  if(process.env.FLOOR1_ONLY)continue;
  if(seconds){const enemy=t.world('shared-floor-1').enemies.find(e=>e.alive);if(enemy){await transfer('common-approach-'+i,()=>move(1,{x:enemy.x-1,z:enemy.z,y:enemy.y??0,surface:enemy.surface??'ground'}));await activity('common-combat-'+i,6,enemy);}}
  const w2=t.world('shared-floor-2'),w3=t.world('shared-floor-3');
  if(seconds){await transfer('cave-entry-'+i,()=>move(2,w2.map.awakening.cave.entry));const ramp=w2.map.surfaces.find(s=>s.kind==='ramp');await cmd(a,{kind:'destination',x:ramp.x,z:ramp.z+ramp.halfZ+1,surface:'white-wolf-cave'});await until(()=>p.game.player.surface==='white-wolf-cave',30000);report.checks.push('soak cave ramp walked');}
  await transfer('cave-'+i,()=>move(2,w2.map.awakening.cave.den));await activity('wolf-'+i,8,w2.enemies.find(e=>e.behaviorType==='whiteWolf'&&e.alive));
  if(seconds){const stairs=w3.map.surfaces.find(s=>s.kind==='ramp');await transfer('stairs-approach-'+i,()=>move(3,{x:stairs.x,z:stairs.z-stairs.halfZ-1,y:0,surface:'ground'}));await cmd(a,{kind:'destination',x:stairs.x,z:stairs.z+stairs.halfZ+1,surface:stairs.to});await until(()=>p.game.player.surface===stairs.to,30000);report.checks.push('soak fortress stairs walked');}
  await transfer('fortress-'+i,()=>move(3,w3.map.guardianHall.door));await activity('fortress-'+i,5);
  await transfer('door-'+i,()=>move(3,w3.map.guardianHall.door));await transfer('arena-entry-'+i,()=>enter(a));await activity('knight-'+i,8,seconds?t.arenas.instances.get(p.instanceId)?.w.enemies[0]:null);
  await transfer('arena-return-'+i,async()=>{p.character.damage(999999);await until(()=>p.mapId==='shared-floor-3',20000);p.character.data.hp=p.character.stats.maxHP;await ready();});await activity('returned-'+i,5);
 }
 const raw=await a.evaluate('window.__stutter.stop()');fs.writeFileSync(path.join(output,'frames.json'),JSON.stringify(raw));report.capture={...raw,frames:undefined,events:undefined,windows:undefined};report.metrics=metrics(raw.frames);report.categories=Object.fromEntries([...new Set(raw.frames.map(f=>f.category))].map(c=>[c,metrics(raw.frames.filter(f=>f.category===c))]));report.arenaReturn=metrics(raw.frames.filter(f=>f.returning));report.worst=raw.frames.toSorted((a,b)=>b.ms-a.ms).slice(0,30);report.samples=report.samples.map(s=>({...s,...metrics(raw.frames.filter(f=>f.at>=s.start&&f.at<=s.end))}));report.arenasRemaining=t.arenas.instances.size;
 if(trace){fs.writeFileSync(path.join(output,'cpu-profile.json'),JSON.stringify(await a.send('Profiler.stop')));await a.send('Tracing.end');const result=await traceDone;const file=fs.openSync(path.join(output,'trace.json'),'w');try{let part;do{part=await a.send('IO.read',{handle:result.stream,size:1048576});fs.writeSync(file,part.base64Encoded?Buffer.from(part.data,'base64'):part.data);}while(!part.eof);}finally{fs.closeSync(file);await a.send('IO.close',{handle:result.stream});}}
}

async function overhead({a,t,p,wait,until,report,output}){
 const w=t.world('shared-floor-1'),g=new Game(w.map);Object.assign(g.player,w.map.spawn);t.arenas.move(p,w,g);t.send(p.ws,t.welcome(p));await until(()=>a.evaluate(`window.__dm.client.epoch===${JSON.stringify(p.epoch)}&&!window.__dm.graphics.loading`));await wait(5000);
 report.samples=[];report.method={repetitions:5,seconds:12,order:'rotating three conditions per repetition',scene:'floor1 stationary camera and player; live simulation',clients:2,inventory:await a.evaluate('window.__dm.inventory()')};
 const modes=[{name:'minimal',enabled:false,panel:false},{name:'capture',enabled:true,panel:false},{name:'capture-panel',enabled:true,panel:true}];
 for(let i=0;i<5;i++)for(let j=0;j<3;j++){const mode=modes[(i+j)%3];await a.evaluate(`(${installCapture.toString()})(${JSON.stringify(mode)})`);await wait(12000);const raw=await a.evaluate('window.__stutter.stop()');fs.writeFileSync(path.join(output,`overhead-${i}-${mode.name}.json`),JSON.stringify(raw));report.samples.push({repetition:i,...mode,...metrics(raw.frames),captureMsPerFrame:raw.overheadMs/raw.callbacks});}
}
