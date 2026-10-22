import {Game} from '../src/simulation/game.js';
import {frameMetrics} from '../src/core/frame-metrics.js';
export async function scenarios({a,b,t,p,q,cmd,wait,until,capture,report,enter}){
 const soakFrames=[];report.rows=[];report.method={seconds:Number(process.env.BENCH_SECONDS??30),seed:217021,clients:2,driver:'15 Hz movement; continuous camera; server fixture transfers; no hidden monster removal',profile:await a.evaluate("window.__dm.graphics?.quality.active??'legacy'"),occlusion:'disabled OS occlusion throttling, game occlusion enabled',fpsLimit:'none; requestAnimationFrame',vsync:'Electron default',warmupSeconds:3};
 async function move(f,position){const at=performance.now(),w=t.world('shared-floor-'+f),g=new Game(w.map);Object.assign(g.player,position??w.map.spawn);t.arenas.move(p,w,g);p.reached=3;t.send(p.ws,t.welcome(p));await until(()=>a.evaluate(`window.__dm?.client.snapshot?.epoch===${JSON.stringify(p.epoch)}`));report.transitions??=[];report.transitions.push({floor:f,ms:performance.now()-at});return w;}
 p.character.data.attributes.vit=1000;p.character.recalculate();p.character.data.hp=p.character.stats.maxHP;
 async function sample(name,seconds=report.method.seconds,action){
  await wait(3000);await a.evaluate(`window.__dm.view.orbit.azimuth=0;window.__dm.enableGpuTiming();window.__benchCamera=setInterval(()=>window.__dm.view.orbit.azimuth+=.012,100)`);
  await a.send('Performance.enable');await a.send('HeapProfiler.enable');await a.send('Profiler.enable');await a.send('Profiler.setSamplingInterval',{interval:2000});await a.send('Profiler.start');await a.evaluate('window.__dm.reset()');
  let k=0;const timer=setInterval(()=>{k++;cmd(a,{kind:'move',x:k%120<60?.25:-.25,z:0}).catch(()=>{});action?.(k);},1000/15);
  await wait(seconds*1000);clearInterval(timer);await cmd(a,{kind:'stop'});
  const data=await a.evaluate(`(()=>{clearInterval(window.__benchCamera);const d=window.__dm;d.stop();d.disableGpuTiming?.();return {frames:d.frames,samples:d.samples,activity:d.activity,inventory:d.inventory(),heap:performance.memory?.usedJSHeapSize,graphics:d.graphics?.diagnostic()};})()`);
  if(process.env.BENCH_SOAK)soakFrames.push(...data.frames);const profile=await a.send('Profiler.stop');const counts=new Map();for(const id of profile.profile.samples??[])counts.set(id,(counts.get(id)??0)+1);const cpu=profile.profile.nodes.map(n=>({name:n.callFrame.functionName,url:n.callFrame.url.split('/').slice(-2).join('/'),samples:counts.get(n.id)??0})).sort((a,b)=>b.samples-a.samples).slice(0,20);
  report.rows.push({name,...frameMetrics(data.frames),activity:data.activity,inventory:data.inventory,heap:data.heap,graphics:data.graphics,stages:Object.fromEntries(Object.entries(data.samples).map(([k,v])=>[k,frameMetrics(v)])),cpu,performance:await a.send('Performance.getMetrics')});await capture(a,name);console.log(JSON.stringify({sample:name,frames:data.frames.length,heap:data.heap,fps:frameMetrics(data.frames).fps,textures:data.inventory.gpuTextures,geometries:data.inventory.gpuGeometries}));
 }
 if(process.env.BENCH_KNIGHT){await move(3);await move(3,t.world('shared-floor-3').map.guardianHall.door);await enter(a);const arena=t.arenas.instances.get(p.instanceId);arena.w.enemies[0].hp=arena.w.enemies[0].stats.maxHP*.39;await sample('E-knight');return;}
 if(process.env.BENCH_PANEL){await move(3);await move(3,t.world('shared-floor-3').map.guardianHall.door);await enter(a);for(const [name,show]of [['off1',false],['on1',true],['off2',false],['on2',true]]){await a.evaluate('window.__dm.graphics.toggle('+show+')');await sample('panel-'+name,20);}return;}
 if(process.env.BENCH_SOAK){for(let cycle=0;cycle<10;cycle++){const f=cycle%3+1;const w=await move(f);if(f===3){await move(3,w.map.guardianHall.door);await enter(a);const i=t.arenas.instances.get(p.instanceId);i.w.enemies[0].hp=i.w.enemies[0].stats.maxHP*.39;}await sample('soak-'+cycle+'-floor-'+f,Number(process.env.BENCH_SOAK)/10);if(f===3){p.character.damage(999999);await until(()=>p.mapId==='shared-floor-3',20000);p.character.data.hp=p.character.stats.maxHP;}}report.aggregate=frameMetrics(soakFrames);report.arenasRemaining=t.arenas.instances.size;return;}
 await move(1);await sample('A-exploration');
 const w2=await move(2);await sample('B-populated');
 await move(2,{...w2.map.awakening.cave.den,x:w2.map.awakening.cave.den.x-2});const wolf=w2.enemies.find(e=>e.behaviorType==='whiteWolf');await cmd(a,{kind:'attack',target:wolf.id,generation:wolf.generation});await sample('C-white-wolf',undefined,k=>{if(k%60===0)cmd(a,{kind:'attack',target:wolf.id,generation:wolf.generation});});
 const w3=await move(3);await move(3,w3.map.guardianHall.door);await sample('D-fortress');
 await move(3,w3.map.guardianHall.door);await enter(a);const arena=t.arenas.instances.get(p.instanceId);arena.w.enemies[0].hp=arena.w.enemies[0].stats.maxHP*.39;await sample('E-knight');
 // Resolve only this isolated fixture; then measure revisits including rebuild frames.
 p.character.damage(999999);await until(()=>p.mapId==='shared-floor-3',20000);p.character.data.hp=p.character.stats.maxHP;
 await a.evaluate(`window.__transitionFrames=[];window.__transitionLast=0;window.__transitionRun=true;requestAnimationFrame(function f(n){if(window.__transitionLast)window.__transitionFrames.push(n-window.__transitionLast);window.__transitionLast=n;if(window.__transitionRun)requestAnimationFrame(f);});`);
 for(const f of [2,1,3,2,3]){await move(f);await wait(1200);}const frames=await a.evaluate('window.__transitionRun=false;window.__transitionFrames');report.rows.push({name:'F-transitions',...frameMetrics(frames)});
}

