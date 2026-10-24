import {MINING} from '../src/domain/mining.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {canStand} from '../src/world/collision.js';
export async function miningCapture({a,wait,until,capture,report}){
 const url=new URL(await a.evaluate('location.href'));url.search='?test=1&diagnostic=1';await a.send('Page.navigate',{url:url.href});await until(()=>a.evaluate('!!window.__dmInspection'),30000);
 const c=new Character(),bag=new Inventory(c);bag.acquire('trainingSword');bag.equip(0);bag.acquire('simplePickaxe');
 await a.evaluate(`window.__dmInspection.character.data=${JSON.stringify(c.snapshot())};window.__dmInspection.character.recalculate();window.__dmInspection.session.seedOverride=42`);
 const ready=()=>until(()=>a.evaluate('window.__dmInspection.view.world.id===window.__dmInspection.session.area.id&&!window.__dmInspection.session.transitioning'),30000);
 await a.evaluate('window.__dmInspection.session.startRun()');await ready();await a.evaluate("window.__dmInspection.session.enter('tower-floor-2')");await ready();
 await a.evaluate("(()=>{const d=window.__dmInspection;Object.assign(d.session.game.player,d.session.area.awakening.cave.den);d.session.game.previous={...d.session.game.player};d.view.orbit.azimuth=Math.PI;})()");await wait(600);await capture(a,'campaign-cave');if(await a.evaluate('document.querySelectorAll("[data-trail-label]").length'))throw Error('Exterior trail labels visible underground');
 await a.evaluate('window.__dmInspection.session.enter(window.__dmInspection.session.hubId)');await ready();await a.evaluate("window.__dmInspection.session.startBiomePlaytest('CAVE')");await ready();
 const w=await a.evaluate('window.__dmInspection.session.area'),vein=w.mineralVeins[0];if(!vein)throw Error('No real mineral vein in cave biome');
 let point;for(let i=0;i<24&&!point;i++){const p={x:vein.x+Math.sin(i*Math.PI/12)*(MINING.interactionRadius-.15),z:vein.z+Math.cos(i*Math.PI/12)*(MINING.interactionRadius-.15),y:0,surface:'ground'};if(canStand(w,p.x,p.z,.32))point=p;}if(!point)throw Error('Vein approach unavailable');
 await a.evaluate(`(()=>{const d=window.__dmInspection;Object.assign(d.session.game.player,${JSON.stringify(point)});d.session.game.previous={...d.session.game.player};d.session.mining.start(${JSON.stringify(vein.id)});})()`);await wait(700);await capture(a,'mining-preserved');
 report.checks.push('campaign cave renders; real mineral vein remains accessible and mining starts with existing pickaxe');report.mining=await a.evaluate('({state:window.__dmInspection.session.mining.state,vein:window.__dmInspection.session.mining.vein.id})');
 if(!['prepare','strike'].includes(report.mining.state))throw Error('Mining not active');
}
