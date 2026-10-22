import {Game} from '../src/simulation/game.js';
import {frameMetrics} from '../src/core/frame-metrics.js';
export async function anticipationCases({a,t,p,until,wait,enter,report}){
 report.cases=[];p.character.data.attributes.vit=1000;p.character.recalculate();p.character.data.hp=p.character.stats.maxHP;
 await a.evaluate('window.__anticipate=window.__dm.anticipation.update.bind(window.__dm.anticipation);window.__dm.anticipation.update=()=>{}');
 const w=t.world('shared-floor-3');
 async function door(){const g=new Game(w.map);Object.assign(g.player,w.map.guardianHall.door);t.arenas.move(p,w,g);p.reached=3;t.send(p.ws,t.welcome(p));await until(()=>a.evaluate(`window.__dm.client.epoch===${JSON.stringify(p.epoch)}&&window.__dm.view.world.id==='shared-floor-3'&&!window.__dm.graphics.loading`),30000);}
 const hint=()=>a.evaluate('window.__dm.anticipation.next=0;window.__anticipate(window.__dm.view.world,window.__dm.game.player,performance.now())');
 for(const kind of ['none','complete','partial-at-request','cancelled']){
  await door();await hint();await until(()=>a.evaluate('!!window.__dm.anticipation.slot.current?.resource'));await a.evaluate('window.__dm.anticipation.dispose()');
  if(kind==='complete'||kind==='cancelled'){await hint();if(kind==='complete')await until(()=>a.evaluate('!!window.__dm.anticipation.slot.current?.resource'));if(kind==='cancelled')await a.evaluate('window.__dm.anticipation.dispose()');}
  await a.evaluate('window.__preFrames=[];window.__preLast=0;window.__preRun=true;requestAnimationFrame(function f(n){if(window.__preLast)window.__preFrames.push(n-window.__preLast);window.__preLast=n;if(window.__preRun)requestAnimationFrame(f);})');
  const initial=await a.evaluate(`(()=>{if(${JSON.stringify(kind)}==='partial-at-request'){window.__dm.anticipation.next=0;window.__anticipate(window.__dm.view.world,window.__dm.game.player,performance.now());}const initial={state:window.__dm.anticipation.slot.current?(window.__dm.anticipation.slot.current.resource?'ready':'pending'):'none',at:performance.now()};window.__dm.client.command({kind:'arena:request'});return initial;})()`);
  await until(()=>a.evaluate('!!document.querySelector("dialog [data-ready]")?.closest("dialog")?.open'));await a.evaluate('document.querySelector("[data-ready]").click()');await until(()=>a.evaluate('!!window.__dm.view.world.arena&&!window.__dm.graphics.loading'),30000);const controlAt=await a.evaluate('performance.now()');await wait(1200);const frames=await a.evaluate('window.__preRun=false;window.__preFrames');report.cases.push({kind,initial,latency:controlAt-initial.at,...frameMetrics(frames),publicLivingEnemies:w.enemies.filter(e=>e.alive).length});
  p.character.damage(999999);await until(()=>p.mapId==='shared-floor-3',20000);await until(()=>a.evaluate('window.__dm.view.world.id==="shared-floor-3"&&!window.__dm.graphics.loading'),30000);p.character.data.hp=p.character.stats.maxHP;
 }
 report.method='One exploratory sample per anticipation condition; same client/profile. Partial describes state at request, may finish while server readiness is pending. Not a significance test.';
}
