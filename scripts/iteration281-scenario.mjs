import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
const ids=['trainingSword','trainingDagger','trainingBow','trainingStaff','travelerVest','limiarMinnow','oil'];
export async function dialogueCases({a,wait,until,capture,report}){
 const url=new URL(await a.evaluate('location.href'));url.search='?test=1&diagnostic=1';await a.send('Page.navigate',{url:url.href});await until(()=>a.evaluate('!!window.__dmInspection'),30000);
 const fixture=new Character(),bag=new Inventory(fixture);for(const id of ids)bag.acquire(id);
 await a.evaluate(`window.__dmInspection.character.data=${JSON.stringify(fixture.data)};window.__dmInspection.character.recalculate()`);
 for(const type of ['keyDown','keyUp'])await a.send('Input.dispatchKeyEvent',{type,key:'i',code:'KeyI'});
 await until(()=>a.evaluate('document.querySelector("#inventory-dialog").open'));await wait(300);
 const before=await a.evaluate('JSON.stringify(window.__dmInspection.character.data.inventory)');
 // Presentation-only substitution in this isolated browser; catalog and saves are untouched.
 for(const selected of [0,4,5,6]){
  await a.evaluate(`document.querySelector('#inventory-dialog [data-bag-slot="${selected}"]').click()`);
  await a.evaluate(`(()=>{const ids=${JSON.stringify(ids)};for(const slot of document.querySelectorAll('#inventory-dialog [data-bag-slot]')){const id=window.__dmInspection.character.data.inventory.slots[+slot.dataset.bagSlot]?.definitionId;const img=slot.querySelector('img');if(img&&ids.includes(id)){img.src='/assets/items/sample-v281/'+id+'.png';img.style.imageRendering='pixelated';}}const img=document.querySelector('#inventory-dialog .bag-preview');img.src='/assets/items/sample-v281/'+ids[${selected}]+'.png';img.style.imageRendering='pixelated';document.activeElement.blur()})()`);
  await until(()=>a.evaluate('Array.from(document.querySelectorAll("#inventory-dialog img")).every(i=>i.complete&&i.naturalWidth===64)'));
  await capture(a,'sprites-'+ids[selected]);
 }
 if(before!==await a.evaluate('JSON.stringify(window.__dmInspection.character.data.inventory)'))throw Error('Preview changed inventory');
 report.checks.push('Seven PNGs loaded in real inventory at 64 native pixels','Four real selected-item previews captured','Inventory data preserved by visual substitution');
 report.display=await a.evaluate('Array.from(document.querySelectorAll("#inventory-dialog .bag-slot img")).map(i=>({src:i.getAttribute("src"),width:i.clientWidth,height:i.clientHeight,native:i.naturalWidth}))');
}
