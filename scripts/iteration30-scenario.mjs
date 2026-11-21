import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {chestReward} from '../src/domain/items/loot.js';
import {isDeepStrictEqual} from 'node:util';
const fixture=()=>{const c=new Character(),bag=new Inventory(c);bag.acquire('trainingSword');bag.equip(0);for(const seed of [17,41,90,133,8,11,12,88,123])bag.acquire('expeditionChest',{rewardSeed:seed});return c;};
export async function rewardCases({a,b,t,wait,until,capture,report,baseline}){
 const c=fixture();
 const local=async()=>{const url=new URL(await a.evaluate('location.href'));url.search='?test=1&diagnostic=1';await a.send('Page.navigate',{url:url.href});await until(()=>a.evaluate('!!window.__dmInspection?.panels'));};
 await local();await a.evaluate(`(()=>{const x=window.__dmInspection;x.character.data=${JSON.stringify(c.snapshot())};x.character.recalculate();})()`);
 const evaluate=e=>a.evaluate(e),check=async(e,message)=>{if(!await evaluate(e))throw Error(message);report.checks.push(message);};
 const click=async(s,selector)=>{await until(()=>s.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`));const p=await s.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);for(const type of ['mousePressed','mouseReleased'])await s.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});};
 const open=async()=>{await evaluate("window.__dmInspection.panels.show('inventory')");const index=await evaluate("window.__dmInspection.character.data.inventory.slots.findIndex(i=>i?.definitionId==='expeditionChest')");await click(a,`[data-bag-slot="${index}"]`);await click(a,'[data-open-chest]');};
 await evaluate("window.__dmInspection.panels.show('inventory')");await click(a,'[data-bag-slot="0"]');await capture(a,baseline?'00-before-inventory':'01-inventory');
 if(baseline){await click(a,'[data-open-chest]');await wait(300);await capture(a,'00-before-reel');report.checks.push('Original production inventory and reel captured');return;}
 await evaluate("window.__dmInspection.panels.dialogs.inventory.close()");
 await open();await evaluate('cancelAnimationFrame(window.__dmInspection.rewardPanel.frame)');
 // Freeze only the diagnostic clock; invoke the real production phase renderer.
 for(const [name,elapsed] of [['02-closed',0],['03-anticipation',.48],['04-crack',.72],['05-half',.91],['06-open',1.14],['07-transition',1.46],['08-reel',1.65]]){
  await evaluate(`(()=>{const p=window.__dmInspection.rewardPanel;p.elapsed=${elapsed};p.advance(0);})()`);await capture(a,name);
 }
 await check("[...document.querySelectorAll('.reel-item img')].every(i=>i.complete&&i.naturalWidth===128)",'Real reward PNGs loaded');
 await evaluate('window.__dmInspection.rewardPanel.advance(.95)');await capture(a,'09-slowing');
 await evaluate('window.__dmInspection.rewardPanel.advance(.8)');await capture(a,'10-approaching');
 const expected=chestReward(c.data.inventory.slots.find(i=>i?.definitionId==='expeditionChest'));
 await evaluate('window.__firstSave=window.__dmInspection.rewardPanel.save;window.__dmInspection.rewardPanel.save=async()=>{await new Promise(r=>window.__finishSave=r);await window.__firstSave();};window.__dmInspection.rewardPanel.advance(3)');await capture(a,'10-selected-saving');await evaluate('window.__finishSave();window.__dmInspection.rewardPanel.save=window.__firstSave');await until(()=>evaluate("window.__dmInspection.rewardPanel.phase==='result'"));await capture(a,'11-result');
 await check(`window.__dmInspection.character.data.gold===${expected.gold}`,'Exact offline gold and quantity');
 await check(`window.__dmInspection.character.data.inventory.slots.filter(i=>i?.definitionId===${JSON.stringify(expected.itemId)}).length===1`,'Offline item matches seed');
 await evaluate('window.__dmInspection.rewardPanel.stop();window.__dmInspection.rewardPanel.stop();');await check(`window.__dmInspection.character.data.gold===${expected.gold}`,'Repeated skip cannot duplicate rewards');
 await wait(400);await check("document.querySelector('.reward-result').hidden===false&&document.querySelector('#reward-dialog').open",'Result remains until acknowledged');
 await click(a,'[data-reward-action]');
 // Escape during opening cancels without touching the seed or inventory.
 await open();const before=await evaluate('JSON.stringify(window.__dmInspection.character.snapshot())');
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
 await until(()=>evaluate('!window.__dmInspection.rewardPanel.dialog.open'));await check(`JSON.stringify(window.__dmInspection.character.snapshot())===${JSON.stringify(before)}&&!window.__dmInspection.rewardPanel.busy`,'Escape preserves chest and clears busy');
 // Real repeat opening and Space; test key-repeat suppression and re-entry.
 await open();await evaluate("window.__dmInspection.rewardPanel.show('not-a-chest')");
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space'});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space'});await until(()=>evaluate("window.__dmInspection.rewardPanel.phase==='result'"));await capture(a,'12-repeat-result');report.checks.push('Repeated opening, re-entry guard and keyboard skip');
 // Responsive actual DOM bounds; then result reload from IndexedDB.
 for(const [width,height] of [[800,600],[480,720],[640,480]]){await a.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await capture(a,`13-window-${width}x${height}`);await check("(()=>{const d=document.querySelector('#reward-dialog'),r=d.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&d.scrollWidth<=d.clientWidth+1})()",`Fits ${width}×${height}`);}
 await a.send('Emulation.clearDeviceMetricsOverride');
 const saved=await evaluate('window.__dmInspection.character.snapshot()');await a.send('Page.reload');await until(()=>evaluate('!!window.__dmInspection?.rewardPanel'));const reloaded=await evaluate('window.__dmInspection.character.snapshot()');report.reloadChangedFields=Object.keys(saved).filter(k=>!isDeepStrictEqual(saved[k],reloaded[k]));for(const key of ['inventory','equipment','cartStorage','worldDrops','gold'])if(!isDeepStrictEqual(saved[key],reloaded[key])){report.reloadBefore=saved;report.reloadAfter=reloaded;throw Error('Reload changed '+key);}report.checks.push('Offline save reload preserves all items, gold and seeds');
 await open();const interruptedBefore=await evaluate('window.__dmInspection.character.snapshot()');await evaluate("window.__dmInspection.safety.close('transition')");await until(()=>evaluate('!window.__dmInspection.rewardPanel.busy'));if(!isDeepStrictEqual(interruptedBefore,await evaluate('window.__dmInspection.character.snapshot()')))throw Error('Safety closure changed character');report.checks.push('Safety transition cancels only presentation, keeping chest');
 // Save failure and locked close while asynchronous transaction is unresolved.
 await open();const failureBefore=await evaluate('JSON.stringify(window.__dmInspection.character.snapshot())');
 await evaluate("window.__oldRewardSave=window.__dmInspection.rewardPanel.save;window.__dmInspection.rewardPanel.save=()=>new Promise((resolve,reject)=>window.__rejectChest=reject);window.__dmInspection.rewardPanel.stop();");
 await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await check('window.__dmInspection.rewardPanel.dialog.open&&window.__dmInspection.rewardPanel.busy','Save in progress blocks Escape');
 await evaluate("window.__rejectChest(Error('Falha de gravação simulada'));new Promise(r=>setTimeout(r,30))");await check(`JSON.stringify(window.__dmInspection.character.snapshot())===${JSON.stringify(failureBefore)}&&window.__dmInspection.rewardPanel.phase==='error'`,'Save failure restores chest, seed, items and gold');await capture(a,'14-save-failure');
 await evaluate('window.__dmInspection.rewardPanel.save=window.__oldRewardSave');await click(a,'[data-reward-action]');
 await a.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await open();await until(()=>evaluate("window.__dmInspection.rewardPanel.phase==='result'"));await capture(a,'15-reduced-motion');report.checks.push('Reduced motion skips cosmetic movement and grants once');await click(a,'[data-reward-action]');await a.send('Emulation.setEmulatedMedia',{features:[]});
 // Full bag refuses before presentation, without consumption.
 const full=fixture(),fullBag=new Inventory(full);while(full.data.inventory.slots.includes(null))fullBag.acquire('focusRing');await evaluate(`window.__dmInspection.character.data=${JSON.stringify(full.snapshot())};window.__dmInspection.character.recalculate()`);await open();await check("!window.__dmInspection.rewardPanel.dialog.open&&document.querySelector('.rpg-feedback').textContent.includes('Libere')",'Full inventory refuses without starting animation');await capture(a,'16-full-inventory');
 // Online uses the unchanged server, both clients and authoritative snapshot.
 const q=t.people.get(await b.evaluate('window.__dm.client.id'));q.character=fixture();await until(()=>b.evaluate("window.__dm.client.snapshot?.profile.inventory.slots.some(i=>i?.definitionId==='expeditionChest')"));
 const chest=q.character.data.inventory.slots.find(i=>i?.definitionId==='expeditionChest'),onlineExpected=chestReward(chest);
 await b.evaluate("document.querySelector('[data-menu=inventory]').click()");await click(b,'[data-bag-slot="0"]');await click(b,'[data-online-chest]');
 await until(()=>b.evaluate("document.querySelector('#online-reward-dialog')?.dataset.phase==='result'"));await capture(b,'17-online-result');
 if(q.character.data.gold!==onlineExpected.gold)throw Error('Server gold mismatch');const onlineAfter=q.character.snapshot();
 await b.evaluate(`window.__dm.client.command({kind:'open-chest',target:${JSON.stringify(chest.instanceId)}})`);await wait(250);if(JSON.stringify(q.character.snapshot())!==JSON.stringify(onlineAfter))throw Error('Server duplicate grant');report.checks.push('Online presentation uses actual server result; replay rejected');
 if(JSON.stringify(t.db.read(q.id).character)!==JSON.stringify(onlineAfter))throw Error('Online persistence mismatch');report.checks.push('Online result persisted in SQLite');
 await b.send('Page.reload');await until(()=>b.evaluate('window.__dm?.client.mapReady===true&&!!window.__dm.client.snapshot?.profile'));if(await b.evaluate('window.__dm.client.snapshot.profile.gold')!==onlineExpected.gold)throw Error('Online reconnect mismatch');report.checks.push('Online reconnect retains reward without replay');
 // Reject a real opening transaction with a simulated disk error on the isolated server.
 const current=t.people.get(await b.evaluate('window.__dm.client.id')),beforeRejected=current.character.snapshot(),realSave=t.db.save;
 t.db.save=()=>{throw Error('Falha de gravação de teste');};
 try{await b.evaluate("document.querySelector('[data-menu=inventory]').click()");const nextIndex=current.character.data.inventory.slots.findIndex(i=>i?.definitionId==='expeditionChest');await click(b,`[data-bag-slot="${nextIndex}"]`);await click(b,'[data-online-chest]');await until(()=>b.evaluate("document.querySelector('#online-reward-dialog').dataset.phase==='error'"));await capture(b,'18-online-failure');if(!isDeepStrictEqual(current.character.snapshot(),beforeRejected))throw Error('Rejected server grant mutated inventory');}finally{t.db.save=realSave;}
 report.checks.push('Online save rejection preserves chest and reports failure');await click(b,'#online-reward-dialog [data-reward-action]');
 // Drop presentation callbacks after the request while retaining actual server processing.
 await b.evaluate("document.querySelector('[data-menu=inventory]').click()");const lastIndex=current.character.data.inventory.slots.findIndex(i=>i?.definitionId==='expeditionChest'),lastChest=current.character.data.inventory.slots[lastIndex],lastExpected=chestReward(lastChest),goldBefore=current.character.data.gold;
 await click(b,`[data-bag-slot="${lastIndex}"]`);await b.evaluate('window.__savedSnapshotCallback=window.__dm.client.onSnapshot;window.__dm.client.onSnapshot=()=>{}');await click(b,'[data-online-chest]');await until(()=>current.character.data.gold===goldBefore+lastExpected.gold);await b.evaluate('window.__dm.client.disconnect()');await until(()=>b.evaluate("document.querySelector('#online-reward-dialog').dataset.phase==='error'"));await capture(b,'19-online-interrupted');
 await b.evaluate('window.__dm.client.onSnapshot=window.__savedSnapshotCallback;window.__dm.client.connect()');await until(()=>b.evaluate('!!window.__dm.client.snapshot?.profile'));if(await b.evaluate('window.__dm.client.snapshot.profile.gold')!==goldBefore+lastExpected.gold)throw Error('Lost authoritative reward during disconnect');report.checks.push('Lost online confirmation recovers saved reward on reconnect, without resending');
}
