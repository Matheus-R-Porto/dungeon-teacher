import {Game} from '../src/simulation/game.js';
import {frameMetrics} from '../src/core/frame-metrics.js';
export async function transitions({a,t,p,cmd,wait,until,enter,capture,report}){
 report.transitions=[];
 report.method={clients:2,profile:await a.evaluate('window.__dm.graphics.quality.active'),repetitions:5,settleMs:1200,request:'server fixture welcome; arena uses actual request/ready',presentation:'RAF proxy, not physical display timestamp'};
 p.character.data.attributes.vit=1000;p.character.recalculate();p.character.data.hp=p.character.stats.maxHP;
 await a.evaluate(`window.__timeline=[];window.__tlRun=true;window.__tlLast=0;requestAnimationFrame(function f(n){if(window.__tlLast)window.__timeline.push({at:n,ms:n-window.__tlLast,loading:!!window.__dm?.graphics?.loading});window.__tlLast=n;if(window.__tlRun)requestAnimationFrame(f);});`);
 async function measured(name,action){
  const start=await a.evaluate('performance.now()');await action();
  await until(()=>a.evaluate(`window.__dm?.client.epoch===${JSON.stringify(p.epoch)}&&!window.__dm?.graphics?.loading`),30000);
  const ready=await a.evaluate('performance.now()');await wait(1200);
  const data=await a.evaluate(`({frames:window.__timeline.filter(f=>f.at>=${start}).map(f=>f.ms),inventory:window.__dm.inventory(),heap:performance.memory?.usedJSHeapSize,events:window.__dm.graphics.events,transition:window.__dm.view.transitionReport})`);
  report.transitions.push({name,latency:ready-start,...frameMetrics(data.frames),...data,frames:undefined});console.log(name,ready-start,frameMetrics(data.frames).max,JSON.stringify(data.transition?.stages.filter(s=>s.ms>20))); 
 }
 let caveTurn=0;
 async function move(f){const w=t.world('shared-floor-'+f),g=new Game(w.map);Object.assign(g.player,f===3?w.map.guardianHall.door:process.env.BENCH_SOAK232&&f===2?(caveTurn++%2?w.map.awakening.cave.den:w.map.awakening.cave.entry):w.map.spawn);t.arenas.move(p,w,g);p.reached=3;t.send(p.ws,t.welcome(p));}
 const soak=Number(process.env.BENCH_SOAK232??0),deadline=performance.now()+soak*1000;
 async function activity(){if(!soak)return;let k=0;const timer=setInterval(()=>{k++;const e=[...t.worlds.values()].find(w=>w.players.has(p.id))?.enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-p.game.player.x,a.z-p.game.player.z)-Math.hypot(b.x-p.game.player.x,b.z-p.game.player.z))[0];if(k%120<60)cmd(a,{kind:'move',x:k%240<120?.2:-.2,z:0}).catch(()=>{});else if(k%120===60&&e)cmd(a,{kind:'attack',target:e.id,generation:e.generation}).catch(()=>{});},1000/15);try{await wait(10000);}finally{clearInterval(timer);await cmd(a,{kind:'stop'});}}
 for(let i=0;soak?performance.now()<deadline:i<Number(process.env.BENCH_REPEATS??5);i++){
  for(const f of [1,2,1,2,3]){await measured(`${i===0?'first':'revisit'}-${i}-floor-${f}`,()=>move(f));if(soak&&f===2)await activity();}
  await activity();
  if(soak)await measured('door-return-'+i,()=>move(3));
  await measured('arena-enter-'+i,()=>enter(a));
  await activity();
  await measured('arena-return-'+i,async()=>{p.character.damage(999999);await until(()=>p.mapId==='shared-floor-3',20000);p.character.data.hp=p.character.stats.maxHP;});
 }
 await capture(a,'transitions-final');report.timeline=await a.evaluate('window.__tlRun=false;window.__timeline');report.aggregate=frameMetrics(report.timeline.map(f=>f.ms));report.gameplay=frameMetrics(report.timeline.filter(f=>!f.loading).map(f=>f.ms));report.loading=frameMetrics(report.timeline.filter(f=>f.loading).map(f=>f.ms));report.arenasRemaining=t.arenas.instances.size;
}

