import fs from 'node:fs';
import path from 'node:path';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
export async function startVideo(a){await a.evaluate(`(()=>{const chunks=[],r=new MediaRecorder(document.getElementById('world').captureStream(24),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2500000});r.ondataavailable=e=>chunks.push(e.data);window.__video={r,chunks};r.start();})()`);}
export async function finishVideo(a,file){const b64=await a.evaluate(`new Promise(resolve=>{const {r,chunks}=window.__video;r.onstop=()=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};r.stop();})`);fs.writeFileSync(file,Buffer.from(b64,'base64'));}
export async function runCity211({hub,a,b,wait,capture,report}){
 const people=[...hub.online.people.values()];people.forEach((p,i)=>Object.assign(p.game.player,{x:-2+i*3,z:5}));await wait(700);await capture(a,'211-two-players-city');
 for(const s of[a,b])await s.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await wait(500);await capture(a,'211-two-players-walking');for(const s of[a,b])await s.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
 const p=people.find(p=>p.name==='Teste '+a.profile);for(const pos of [{x:0,z:24,id:'south-gate'},{x:26,z:7,id:'east-road'},{x:-17,z:-17,id:'sanctuary'}]){Object.assign(p.game.player,{x:pos.x,z:pos.z});await wait(500);await capture(a,'211-city-'+pos.id);}
 for(const npc of hub.online.world(p.mapId).map.npcs){Object.assign(p.game.player,{x:npc.x,z:npc.z+1.3});await wait(300);const point=await a.evaluate(`(()=>{const n=[...document.querySelectorAll('.npc-name')].find(n=>n.textContent===${JSON.stringify(npc.name)});return {x:parseFloat(n.style.left),y:parseFloat(n.style.top)+45};})()`);await a.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await a.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await wait(100);if(!await a.evaluate("!!document.querySelector('.npc-dialog[open]')"))throw Error('NPC dialog failed: '+npc.id);await capture(a,'211-npc-'+npc.id);await a.evaluate("document.querySelector('.npc-dialog').close()");}
 report.checks.push('Two actual clients move simultaneously; walls, gates, forest and roads rendered in the shared city');
}
export async function runLocal211({a,until,wait,button,capture,report,output}){
 const url=new URL(await a.evaluate('location.href'));url.searchParams.set('diagnostic','1');await a.send('Page.navigate',{url:url.href});await until(()=>a.evaluate('!!window.__dmInspection'));
 const start=await a.evaluate('({...window.__dmInspection.session.game.player})');await a.send('Input.dispatchKeyEvent',{type:'keyDown',key:'d',code:'KeyD'});await wait(400);await a.send('Input.dispatchKeyEvent',{type:'keyUp',key:'d',code:'KeyD'});
 const after=await a.evaluate('({...window.__dmInspection.session.game.player})');if(Math.hypot(start.x-after.x,start.z-after.z)<.1)throw Error('Local keyboard movement failed');
 const point=await a.evaluate('(()=>{const d=window.__dmInspection,p=d.session.game.player;return d.view.screenPoint(p.x+2,0,p.z+1);})()');await a.send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});await a.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});await wait(1000);const clicked=await a.evaluate('({...window.__dmInspection.session.game.player})');if(Math.hypot(clicked.x-after.x,clicked.z-after.z)<.1)throw Error('Local click movement failed');
 await a.evaluate('(()=>{const d=window.__dmInspection;d.session.game.cancel();d.session.game.paused=true;d.view.orbit.height=65;d.view.orbit.targetHeight=65;})()');await wait(300);await capture(a,'211-city-overview');
 for(const direction of [0,Math.PI/2,Math.PI,Math.PI*1.5]){await a.evaluate(`window.__dmInspection.view.orbit.azimuth=${direction}`);await wait(150);await capture(a,'211-city-orbit-'+Math.round(direction*100));}
 await a.evaluate(`(()=>{const d=window.__dmInspection;d.view.orbit.height=7;d.view.orbit.targetHeight=7;d.view.orbit.azimuth=0;window.__actorUpdate=d.view.actor.update.bind(d.view.actor);window.__pose={weaponType:null,hp:100,phase:'idle',moving:false,heading:0};window.__poseAt=performance.now();d.view.actor.update=(input,azimuth,time,reduced,camera)=>{const age=(performance.now()-window.__poseAt)/1000;window.__actorUpdate({...input,...window.__pose,x:input.x+(window.__pose.moving?Math.sin(age*2)*.65:0)},azimuth,performance.now()/1000,reduced,camera);};})()`);
 await startVideo(a);
 for(const [i,name]of ['south','west','north','east'].entries()){
  await a.evaluate(`Object.assign(window.__pose,{heading:${-i*Math.PI/2},moving:false})`);await wait(200);await capture(a,'211-idle-'+name);
  await a.evaluate('window.__pose.moving=true');await wait(2200);await capture(a,'211-walk-'+name);
 }
 await finishVideo(a,path.join(output,'211-walk-four-directions.webm'));
 const c=new Character(),bag=new Inventory(c);for(const id of ['trainingSword','trainingDagger','trainingBow','trainingStaff'])bag.acquire(id);bag.equip(0);
 await a.evaluate(`window.__dmInspection.character.data=${JSON.stringify(c.snapshot())};window.__dmInspection.character.recalculate()`);
 for(const type of ['sword','bow','dagger','staff']){
  const index=c.data.inventory.slots.findIndex(i=>i?.definitionId==='training'+type[0].toUpperCase()+type.slice(1));if(index>=0)bag.equip(index);await a.evaluate(`window.__dmInspection.character.data=${JSON.stringify(c.snapshot())};window.__dmInspection.character.recalculate()`);
  await a.evaluate(`Object.assign(window.__pose,{weaponType:${JSON.stringify(type)},heading:0,phase:'idle',moving:true});window.__dmInspection.view.actor.visual.lastAction=-Infinity;window.__dmInspection.view.actor.visual.blend=0`);await wait(900);await capture(a,'211-'+type+'-sheathed-walk');await startVideo(a);
  await a.evaluate("window.__pose.phase='windup'");await wait(120);await capture(a,'211-'+type+'-draw');await wait(400);await capture(a,'211-'+type+'-windup');await a.evaluate("window.__pose.phase='recovery'");await wait(150);await capture(a,'211-'+type+'-attack');await a.evaluate("window.__pose.phase='idle'");await wait(350);await capture(a,'211-'+type+'-armed-walk');
  for(const [i,direction]of ['south','west','north','east'].entries()){await a.evaluate(`Object.assign(window.__pose,{heading:${-i*Math.PI/2},phase:'windup',moving:false})`);await wait(160);await capture(a,'211-'+type+'-ready-'+direction);await a.evaluate("window.__pose.phase='recovery'");await wait(120);await capture(a,'211-'+type+'-release-'+direction);}
  await a.evaluate("Object.assign(window.__pose,{heading:0,phase:'idle',moving:false})");await wait(5100);await capture(a,'211-'+type+'-sheath');await wait(500);await capture(a,'211-'+type+'-rest');await finishVideo(a,path.join(output,'211-'+type+'-draw-attack-sheath.webm'));
 }
 await a.evaluate('window.__dmInspection.view.actor.update=window.__actorUpdate;window.__dmInspection.session.game.paused=false');
 report.checks.push('Local keyboard and ground-click movement; actual renderer captures four directions and four weapon transitions, including intermediate draw and sheath frames');
 report.visualFixture='Isolated profile only. Close-up recordings drive presentation inputs on the real SpriteActor in the city; they do not claim gameplay attacks. Social scenario separately tests authoritative mouse attacks, travel and reconnection.';
}
