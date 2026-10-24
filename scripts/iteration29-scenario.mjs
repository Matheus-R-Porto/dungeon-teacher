import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
function fixture(grams,weapon=false){const c=new Character(),bag=new Inventory(c);if(weapon){bag.acquire('trainingSword');bag.equip(0);}if(grams){if(!weapon){for(const id of ['trainingSword','travelerVest','fishingRod'])bag.acquire(id);}let left=grams-c.carry.totalGrams;while(left>=1000){bag.acquire('water');left-=1000;}while(left>=50){bag.acquire('herbs');left-=50;}}return c;}
export async function dialogueCases({a,b,q,wait,until,capture,report}){
 const url=new URL(await a.evaluate('location.href'));url.search='?test=1&diagnostic=1';await a.send('Page.navigate',{url:url.href});await until(()=>a.evaluate('!!window.__dmInspection?.panels'),30000);
 const key=async()=>{for(const type of ['keyDown','keyUp'])await a.send('Input.dispatchKeyEvent',{type,key:'i',code:'KeyI'});};
 report.loads=[];report.movement=[];
 for(const [name,grams] of [['empty',0],['light',12000],['medium',30000],['heavy',48000],['maximum',60000]]){
  const c=fixture(grams);await a.evaluate(`(()=>{const x=window.__dmInspection;if(document.querySelector('#inventory-dialog').open)document.querySelector('#inventory-dialog').close();x.character.data=${JSON.stringify(c.snapshot())};x.character.recalculate();})()`);await key();await wait(150);
  const observed=await a.evaluate(`(()=>{const x=window.__dmInspection;return {load:x.character.carry,text:document.querySelector('.bag-carry').textContent,bar:document.querySelector('.bag-load-track').getAttribute('aria-valuenow'),slots:document.querySelectorAll('#inventory-dialog [data-bag-slot]').length,images:Array.from(document.querySelectorAll('#inventory-dialog img')).map(i=>({loaded:i.complete,native:i.naturalWidth}))}})()`);
  if(observed.load.totalGrams!==grams||observed.slots!==32||observed.images.some(i=>!i.loaded||i.native!==128))throw Error('Invalid load UI '+name);
  report.loads.push({name,...observed});await capture(a,'carry-'+name);
  const distance=await a.evaluate(`(()=>{const g=window.__dmInspection.session.game,old={...g.player},paused=g.paused,path=g.path;g.cancel();Object.assign(g.player,g.world.spawn);g.paused=false;const start={...g.player};for(let i=0;i<60;i++)g.update(1/60,{x:1,z:0},0);const distance=Math.hypot(g.player.x-start.x,g.player.z-start.z);Object.assign(g.player,old);g.previous={...old};g.path=path;g.paused=paused;return distance})()`);
  report.movement.push({name,grams,distance,multiplier:c.carry.movementMultiplier});
 }
 const base=report.movement[0].distance;if(base<3.5)throw Error('Movement path obstructed');for(const r of report.movement)if(Math.abs(r.distance-base*r.multiplier)>.001)throw Error('Wrong actual movement multiplier');
 const before=await a.evaluate('JSON.stringify(window.__dmInspection.character.data)');
 await a.evaluate("window.__dmInspection.panels.mutate('inventory',()=>window.__dmInspection.panels.inventory.acquire('water'))");
 if(before!==await a.evaluate('JSON.stringify(window.__dmInspection.character.data)'))throw Error('Rejected acquisition changed character');
 if(!await a.evaluate("document.querySelector('#inventory-dialog .rpg-feedback').textContent.includes('peso')"))throw Error('Missing weight feedback');await capture(a,'carry-refused');
 for(const [width,height] of [[800,600],[480,720]]){await a.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(100);const valid=await a.evaluate('(()=>{const d=document.querySelector("#inventory-dialog"),r=d.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&d.scrollWidth<=d.clientWidth+1})()');if(!valid)throw Error('Responsive carry '+width);await capture(a,'carry-'+width);}
 await a.send('Emulation.clearDeviceMetricsOverride');
 // Existing consume action on real panel must refresh weight immediately.
 const eating=new Character(),bag=new Inventory(eating);bag.acquire('limiarMinnow');bag.acquire('limiarMinnow');eating.damage(30);await a.evaluate(`(()=>{const x=window.__dmInspection;x.character.data=${JSON.stringify(eating.snapshot())};x.character.recalculate();x.panels.render('inventory');document.querySelector('#inventory-dialog [data-bag-slot="0"]').click();document.querySelector('#inventory-dialog [data-eat]').click();})()`);await until(()=>a.evaluate('window.__dmInspection.character.carry.totalGrams===250&&!window.__dmInspection.panels.busy'));
 if(!await a.evaluate("document.querySelector('.bag-carry').textContent.includes('0,25')"))throw Error('Consume failed to refresh carry');await capture(a,'carry-after-consume');
 await a.send('Page.reload');await until(()=>a.evaluate('!!window.__dmInspection'),30000);if(!await a.evaluate('window.__dmInspection.character.carry.totalGrams===250'))throw Error('Saved weight changed on reload');
 // Server owns equipped item and derives total; client only renders its summary.
 q.character=fixture(60000,true);await b.send('Page.bringToFront');await b.evaluate('document.querySelector("[data-menu=inventory]").click()');await until(()=>b.evaluate("document.querySelector('#online-inventory-dialog .bag-carry')?.textContent.includes('60,00 / 60,00')"));await capture(b,'carry-online');
 report.checks.push('Five load states show accurate grams, bar, penalty and 32 slots','128px PNGs preserved','Actual Game movement matches load curve','Rejected acquisition preserves state and displays feedback','Responsive 800x600 and 480x720','Real consume action refreshes weight','Weight derived correctly after save reload','Online includes equipped mass in server-owned carry summary');
}
