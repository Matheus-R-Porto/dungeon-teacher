import fs from 'node:fs';
import path from 'node:path';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {metrics} from './iteration242-performance.mjs';
import {canStand} from '../src/world/collision.js';
import {MINING} from '../src/domain/mining.js';
export async function waterCases({a,wait,until,capture,report,output}){
 const url=new URL(await a.evaluate('location.href'));url.search='?test=1&diagnostic=1';await a.send('Page.navigate',{url:url.href});await until(()=>a.evaluate('!!window.__dmInspection'),30000);
 const c=new Character(),bag=new Inventory(c);bag.acquire('trainingSword');bag.equip(0);bag.acquire('fishingRod');bag.acquire('simplePickaxe');c.data.attributes.vit=1000;c.recalculate();c.data.hp=c.stats.maxHP;
 await a.evaluate(`window.__dmInspection.character.data=${JSON.stringify(c.snapshot())};window.__dmInspection.character.recalculate();window.__dmInspection.session.seedOverride=42`);
 const ready=()=>until(()=>a.evaluate('window.__dmInspection.view.world.id===window.__dmInspection.session.area.id&&!window.__dmInspection.session.transitioning'),40000);
 await a.evaluate('window.__dmInspection.session.startRun()');await ready();
 await a.evaluate("(()=>{const d=window.__dmInspection,s=d.session;Object.assign(s.game.player,s.area.fishingSpots[0]);s.game.previous={...s.game.player};d.view.orbit.azimuth=0;})()");await wait(1000);
 // Identical no-screenshot benchmark on A+B reference and C: same legacy lake,
 // random sequence, real waiting/pull and cancellation, no renderer mock.
 await a.evaluate(`(()=>{const r=window.__waterMeasure={frames:[],resources:[],running:true,programs:[],seen:new Set()};let last=0,resource=0;const tick=t=>{if(!r.running)return;const info=window.__dmInspection.view.renderer.info;if(last)r.frames.push({at:t,ms:t-last});last=t;if(t-resource>500){resource=t;r.resources.push({at:t,heap:performance.memory.usedJSHeapSize,...info.memory,draws:info.render.calls,triangles:info.render.triangles,programs:info.programs.length});}for(const p of info.programs)if(!r.seen.has(p.id)){r.seen.add(p.id);r.programs.push({at:t,id:p.id});}requestAnimationFrame(tick);};requestAnimationFrame(tick);})()`);
 for(let i=0;i<12;i++){
  await a.evaluate("(()=>{const s=window.__dmInspection.session;s.fishing.start(s.area.fishingSpots[0].id);})()");
  if(i%2){await until(()=>a.evaluate("window.__dmInspection.session.fishing.state==='bite'"),6000);await a.evaluate('window.__dmInspection.session.fishing.pull()');await wait(1500);}else{await wait(200);await a.evaluate('window.__dmInspection.session.fishing.cancel()');}
  await wait(2600);
 }
 const raw=await a.evaluate('window.__waterMeasure.running=false;({frames:window.__waterMeasure.frames,resources:window.__waterMeasure.resources,programs:window.__waterMeasure.programs})');fs.writeFileSync(path.join(output,'water-frames.json'),JSON.stringify(raw));report.metrics=metrics(raw.frames);report.resources=raw.resources;report.programs=raw.programs;report.checks.push('12 fishing cycles with real grant/wait/cancel, isolated local save');
 if(process.env.WATER_MEASURE_ONLY)return;
 // Additional C-only visual evidence, after stopping the measurement.
 const lake=await a.evaluate("window.__dmInspection.session.area.waterBodies.find(b=>b.id.startsWith('living-'))");
 await a.evaluate(`(()=>{const d=window.__dmInspection,p=d.session.game.player;Object.assign(p,{x:${lake.x+lake.radiusX+1},z:${lake.z},surface:'ground',y:0});d.session.game.previous={...p};d.view.orbit.azimuth=Math.PI/2;})()`);await wait(500);
 await capture(a,'water-living-pool');
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await wait(1400);await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});await capture(a,'water-manual-shore');
 await a.evaluate(`(()=>{const s=window.__dmInspection.session;Object.assign(s.game.player,{x:${lake.x+lake.radiusX+1},z:${lake.z},surface:'ground',y:0});s.game.previous={...s.game.player};})()`);
 const clickPoint=await a.evaluate(`(()=>{const v=window.__dmInspection.view,p=v.actor.sprite.position.clone().set(${lake.x+lake.radiusX*.65},${lake.y},${lake.z}).project(v.camera),r=v.renderer.domElement.getBoundingClientRect();return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};})()`);for(const type of ['mousePressed','mouseReleased'])await a.send('Input.dispatchMouseEvent',{type,...clickPoint,button:'left',clickCount:1});if(!await a.evaluate('window.__dmInspection.session.fishing.active'))throw Error('Water click did not start fishing');
 await wait(140);await capture(a,'fishing-cast-arc');await wait(250);await capture(a,'fishing-water-impact');
 await until(()=>a.evaluate("window.__dmInspection.session.fishing.state==='bite'"),6000);await a.evaluate('window.__dmInspection.session.fishing.pull()');await wait(220);await capture(a,'fishing-reel-new-frame');await wait(400);await capture(a,'fishing-reel-return');
 report.checks.push('real click fishes living pool; cast and reel rendered');
 await wait(2600);await a.evaluate("(()=>{const s=window.__dmInspection.session;Object.assign(s.game.player,s.area.fishingSpots[0]);s.game.previous={...s.game.player};})()");await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'f',code:'KeyF'});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'f',code:'KeyF'});await wait(400);if(!await a.evaluate('window.__dmInspection.session.fishing.active'))throw Error('F did not start fishing');await capture(a,'fishing-second-water');await a.evaluate('window.__dmInspection.session.fishing.pull()');await wait(150);if(!await a.evaluate('window.__dmInspection.session.fishing.presenting'))throw Error('No retrieval presentation');await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await wait(100);
 if(await a.evaluate('window.__dmInspection.view.fishingVisual.group.visible'))throw Error('Fishing geometry survived cancellation');
 report.checks.push('real F fishes second water; real Escape during retrieval hides fishing resources');
 await a.evaluate('window.__dmInspection.session.enter(window.__dmInspection.session.hubId)');await ready();
 if(await a.evaluate('window.__dmInspection.view.fishingVisual.group.visible'))throw Error('Fishing geometry survived map change');
 await a.evaluate("window.__dmInspection.session.startBiomePlaytest('CAVE')");await ready();
 const w=await a.evaluate('window.__dmInspection.session.area'),vein=w.mineralVeins[0];let shore;
 for(let i=0;i<24&&!shore;i++){const p={x:vein.x+Math.sin(i*Math.PI/12)*(MINING.interactionRadius-.15),z:vein.z+Math.cos(i*Math.PI/12)*(MINING.interactionRadius-.15),surface:'ground',y:0};if(canStand(w,p.x,p.z,.32))shore=p;}
 if(!shore)throw Error('No dry mining approach');
 await a.evaluate(`Object.assign(window.__dmInspection.session.game.player,${JSON.stringify(shore)});window.__dmInspection.session.game.previous={...window.__dmInspection.session.game.player}`);
 report.miningResources=[];
 for(const [width,height]of [[1280,720],[1024,768],[800,600]]){
  await a.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(400);
  await a.evaluate(`window.__dmInspection.session.mining.start(${JSON.stringify(vein.id)})`);await wait(700);await capture(a,'mining-'+width+'x'+height);
  report.miningResources.push(await a.evaluate('({heap:performance.memory.usedJSHeapSize,...window.__dmInspection.view.renderer.info.memory,programs:window.__dmInspection.view.renderer.info.programs.length,phase:window.__dmInspection.session.mining.state})'));
  await a.evaluate('window.__dmInspection.session.mining.cancel()');await wait(1600);
 }
 await a.send('Emulation.clearDeviceMetricsOverride');await wait(300);
 await a.evaluate(`window.__dmInspection.session.mining.start(${JSON.stringify(vein.id)})`);
 await until(()=>a.evaluate("(()=>{const m=window.__dmInspection.session.mining;return m.state==='strike'&&Math.abs(m.indicator-m.center)<.025;})()"),7000);
 await a.evaluate('window.__dmInspection.session.mining.strike()');await wait(800);await capture(a,'mining-result');
 report.miningResult=await a.evaluate('window.__dmInspection.session.mining.result');
 if(!['GOOD','PERFECT'].includes(report.miningResult.kind))throw Error('Mining strike did not grant expected result');
 report.checks.push('mining three window sizes, repeated cancel, real successful strike; fishing cleared on map change');
}
