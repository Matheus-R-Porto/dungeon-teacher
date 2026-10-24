import fs from 'node:fs';
import path from 'node:path';
import {canStand} from '../src/world/collision.js';
import {layerWorld} from '../src/world/surfaces.js';
import {Game} from '../src/simulation/game.js';
import {installCapture} from './iteration233-capture.mjs';
import {metrics} from './iteration242-performance.mjs';
export async function caveCases({a,t,p,cmd,wait,until,capture,report,output}){
 const shot=(...args)=>process.env.CAVE_MEASURE_ONLY?Promise.resolve():capture(...args);
 const w=t.world('shared-floor-2'),c=w.map.awakening.cave,r=w.map.surfaces.find(s=>s.id===c.ramp);
 const ready=()=>until(()=>a.evaluate(`window.__dm?.view.world.id==='shared-floor-2'&&!window.__dm.graphics.loading&&window.__dm.client.epoch===${JSON.stringify(p.epoch)}`),30000);
 const place=async point=>{const g=new Game(w.map);Object.assign(g.player,point);t.arenas.move(p,w,g);t.send(p.ws,t.welcome(p));await ready();await wait(700);};
 p.character.data.attributes.vit=1000;p.character.recalculate();p.character.data.hp=p.character.stats.maxHP;
 await place(c.entry);await a.evaluate('window.__dm.view.orbit.azimuth=Math.PI');await wait(300);await shot(a,'cave-front');
 await a.evaluate('window.__dm.view.orbit.azimuth=Math.PI/2');await wait(300);await shot(a,'cave-side');
 await a.evaluate('window.__dm.view.orbit.azimuth=0');await wait(300);await shot(a,'cave-back');
 await a.evaluate('window.__dm.view.orbit.azimuth=Math.PI');
 await a.evaluate(`(${installCapture.toString()})({enabled:true,panel:false,gpu:${!!process.env.CAVE_TRACE}})`);
 let trace=[],traceDone,listener;if(process.env.CAVE_TRACE){traceDone=new Promise(resolve=>{listener=raw=>{const m=JSON.parse(raw);if(m.method==='Tracing.dataCollected')trace.push(...m.params.value);if(m.method==='Tracing.tracingComplete')resolve();};a.ws.on('message',listener);});await a.send('Tracing.start',{categories:'devtools.timeline,v8,gpu',transferMode:'ReportEvents'});await a.evaluate("console.timeStamp('cave-anchor:'+performance.now())");}
 await a.evaluate("window.__cavePrograms=[];window.__caveSeen=new Set();window.__caveTimer=setInterval(()=>{for(const p of window.__dm.view.renderer.info.programs)if(!window.__caveSeen.has(p.id)){window.__caveSeen.add(p.id);window.__cavePrograms.push({at:performance.now(),id:p.id,key:p.cacheKey});}},50)");
 report.samples=[];report.resources=[];
 for(let i=0;i<Number(process.env.CAVE_CYCLES??5);i++){
  await cmd(a,{kind:'destination',x:r.x,z:r.z+r.halfZ+2,surface:c.surface});await until(()=>p.game.player.surface===c.surface,20000);
  if(i===0){await shot(a,'cave-first-passage');const mid=w.map.surfaces.find(s=>s.id===c.surface).route?.[2]??{x:c.den.x,z:c.den.z-15};await cmd(a,{kind:'destination',x:mid.x,z:mid.z,surface:c.surface});await until(()=>Math.hypot(p.game.player.x-mid.x,p.game.player.z-mid.z)<1,25000);await shot(a,'cave-rocky-passage');await cmd(a,{kind:'destination',x:c.den.x,z:c.den.z,surface:c.den.surface});await until(()=>Math.hypot(p.game.player.x-c.den.x,p.game.player.z-c.den.z)<1,25000);await shot(a,'cave-wolf-den');}
  const start=await a.evaluate('performance.now()');await wait(5000);report.samples.push({name:'inside-'+i,start,end:await a.evaluate('performance.now()')});
  report.resources.push(await a.evaluate('({heap:performance.memory?.usedJSHeapSize,geometry:window.__dm.view.renderer.info.memory.geometries,textures:window.__dm.view.renderer.info.memory.textures,draws:window.__dm.view.renderer.info.render.calls})'));
  await cmd(a,{kind:'destination',x:c.entry.x,z:c.entry.z,surface:'ground'});await until(()=>p.game.player.surface==='ground',25000);await until(()=>Math.hypot(p.game.player.x-c.entry.x,p.game.player.z-c.entry.z)<1,10000);
  if(i===0)await shot(a,'cave-return');
  const outside=await a.evaluate('performance.now()');await wait(3000);report.samples.push({name:'outside-'+i,start:outside,end:await a.evaluate('performance.now()')});
 }
 if(process.env.CAVE_TRACE){await a.send('Tracing.end');await traceDone;a.ws.off('message',listener);fs.writeFileSync(path.join(output,'trace.json'),JSON.stringify({traceEvents:trace}));}
 report.programs=await a.evaluate('clearInterval(window.__caveTimer);window.__cavePrograms');
 const raw=await a.evaluate('window.__stutter.stop()');fs.writeFileSync(path.join(output,'frames.json'),JSON.stringify(raw));report.metrics=metrics(raw.frames);report.samples=report.samples.map(s=>({...s,...metrics(raw.frames.filter(f=>f.at>=s.start&&f.at<=s.end))}));report.checks.push(`${Number(process.env.CAVE_CYCLES??5)} real cave entries and exits in the same shared map`);
 if(process.env.CAVE_MEASURE_ONLY){await capture(a,'cave-front-final');await place(c.den);await capture(a,'cave-wolf-den-final');}

 const vein=w.map.mineralVeins?.[0];if(vein){let spot;for(let i=0;i<24&&!spot;i++){const q={x:vein.x+Math.sin(i*Math.PI/12)*2.5,z:vein.z+Math.cos(i*Math.PI/12)*2.5,y:0,surface:'ground'};if(canStand(layerWorld(w.map,'ground'),q.x,q.z,.32))spot=q;}if(spot){await place(spot);await shot(a,'mining-preserved');}}

}
