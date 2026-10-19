import {WorldClient} from '../src/multiplayer/world-client.js';
import {randomBytes} from 'node:crypto';
import {createRequire} from 'node:module';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws'),Socket=class extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}};
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
export async function runIteration21Scenario({hub,a,b,until,wait,button,capture,report}){
 await until(()=>hub.online.people.size===2);const p=[...hub.online.people.values()].find(p=>p.name==='Teste '+a.profile),city=hub.online.world(p.mapId).map;
 await wait(1200);await capture(a,'21-online-hud');
 const extras=[];try{for(let i=0;i<10;i++){const c=new WorldClient({url:'ws://127.0.0.1:'+hub.port+'/hub',protocol:4,credential:randomBytes(32).toString('hex'),name:'Viajante '+(i+1),Socket});extras.push(c);c.connect();}await until(()=>extras.every(c=>c.snapshot?.players.length===12));[...hub.online.people.values()].filter(p=>p.ws).forEach((p,i)=>Object.assign(p.game.player,{x:-3+(i%6)*1.2,z:4+Math.floor(i/6)*2}));await wait(700);await capture(a,'21-twelve-players');}finally{extras.forEach(c=>c.disconnect());}

 for(const d of city.districts){Object.assign(p.game.player,{x:d.x,z:d.z+2});await wait(500);await capture(a,'21-city-'+d.id);}
 await a.evaluate("document.querySelector('.game-menu').open=true");await button(a,'[data-menu=professions]');await capture(a,'21-online-professions');await button(a,'#professions-dialog [data-close]');
 await a.evaluate("document.querySelector('.game-menu').open=true");await button(a,'[data-menu=party]');await button(a,'#online-party-dialog [data-party] button');await until(()=>a.evaluate("!document.querySelector('.party-compact').hidden"));await capture(a,'21-party');await button(a,'#online-party-dialog .close-button');await a.evaluate("document.querySelector('.party-compact').open=true");await capture(a,'21-party-compact');
 const npc=city.npcs.find(n=>n.id==='blacksmith');Object.assign(p.game.player,{x:npc.x,z:npc.z+1.3});await wait(500);
 const point=await a.evaluate(`(()=>{const e=[...document.querySelectorAll('.npc-name')].find(e=>e.textContent===${JSON.stringify(npc.name)});return {x:parseFloat(e.style.left),y:parseFloat(e.style.top)+45};})()`);await a.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await a.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await until(()=>a.evaluate("document.querySelector('.npc-dialog').open"));await capture(a,'21-dialogue-hud');await button(a,'.npc-dialog [data-exit]');
 Object.assign(p.game.player,city.spawn);await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await wait(180);await capture(a,'21-walking');await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
 report.checks.push('Expanded city districts, common online HUD, professions availability, party menu, NPC dialog and movement rendered in two Electron clients');
}

export async function runLocal21Scenario({a,until,wait,button,capture,report}){
 const url=new URL(await a.evaluate('location.href'));url.searchParams.set('diagnostic','1');await a.send('Page.navigate',{url:url.href});await until(()=>a.evaluate('!!window.__dmInspection'));
 const c=new Character();c.data.knownAbilities=['powerStrike','doubleAttack','doubleShot','energyBall','regeneration'];const bag=new Inventory(c);for(const id of ['trainingSword','trainingDagger','trainingBow','trainingStaff'])bag.acquire(id);bag.equip(0);
 await a.evaluate(`window.__dmInspection.character.data=${JSON.stringify(c.snapshot())};window.__dmInspection.character.recalculate()`);await wait(500);await capture(a,'21-local-hud');
 const menu=async id=>{await a.evaluate("document.querySelector('.game-menu').open=true");await button(a,'[data-menu='+id+']');};
 await menu('professions');await capture(a,'21-local-professions');await button(a,'#professions-dialog [data-close]');await menu('skills');await capture(a,'21-local-skills');await button(a,'#skills-dialog [data-close]');
 await a.evaluate("document.querySelector('.hotbar-editor').open=true");await wait(100);await a.evaluate("document.querySelector('[data-position]').value='0';document.querySelector('[data-ability]').value='energyBall'");await button(a,'.hotbar-editor [data-assign]');await until(()=>a.evaluate("document.querySelector('[data-feedback]').textContent.includes('salvos')"));await capture(a,'21-hotbar-reordered');await a.send('Page.reload');await until(()=>a.evaluate(`document.querySelector('[data-slot="1"]')?.getAttribute('aria-label').includes('Energia')`));report.checks.push('Local hotbar reordered through editor and preserved after page reload');
 for(const [i,type]of ['sword','dagger','bow','staff'].entries()){
 const snapshot=structuredClone(c.snapshot());const item=snapshot.inventory.slots.find(v=>v?.definitionId==='training'+type[0].toUpperCase()+type.slice(1));if(item){const previous=snapshot.equipment.weapon;snapshot.inventory.slots[snapshot.inventory.slots.indexOf(item)]=previous;snapshot.equipment.weapon=item;}
 await a.evaluate(`window.__dmInspection.character.data=${JSON.stringify(snapshot)};window.__dmInspection.character.recalculate()`);await wait(200);await capture(a,'21-weapon-'+type);
 }
 await a.evaluate("const d=window.__dmInspection;d.session.game.player.heading=d.view.azimuth+Math.PI;d.session.game.player.moving=true;d.session.game.paused=true");await capture(a,'21-north-inspection');await a.evaluate("window.__dmInspection.view.orbit.targetHeight=55;window.__dmInspection.view.orbit.height=55");await wait(150);await capture(a,'21-city-overview');await a.evaluate("window.__dmInspection.view.orbit.targetHeight=23;window.__dmInspection.view.orbit.height=23");await a.send('Emulation.setDeviceMetricsOverride',{width:800,height:600,deviceScaleFactor:1,mobile:false});await wait(250);await capture(a,'21-small-window');await a.send('Emulation.clearDeviceMetricsOverride');
 report.checks.push('Four actual equipment families, local professions and skills menus rendered using explicit test fixture in isolated profile');
}
