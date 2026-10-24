import {canStand} from '../src/world/collision.js';
import {layerWorld} from '../src/world/surfaces.js';
import assert from 'node:assert/strict';
import {Game} from '../src/simulation/game.js';
export async function castleCases({a,b,t,p,q,cmd,wait,until,capture,report,enter}){
 const ready=async(s,person)=>until(()=>s.evaluate(`window.__dm?.view.world.id===${JSON.stringify(person.mapId)}&&!window.__dm.graphics.loading&&window.__dm.client.epoch===${JSON.stringify(person.epoch)}`),40000);
 const place=async(s,person,w,point)=>{assert.ok(canStand(layerWorld(w.map,point.surface??'ground'),point.x,point.z,.32),'fixture must stand on its actual layer');const g=new Game(w.map);Object.assign(g.player,point);g.previous={...g.player};t.arenas.move(person,w,g);person.reached=3;t.send(person.ws,t.welcome(person));await ready(s,person);await wait(500);};
 const floor=t.world('shared-floor-3'),gate=floor.map.castle.entrance;
 await place(a,p,floor,{...gate,z:gate.z-1});await a.evaluate('window.__dm.view.orbit.azimuth=Math.PI');await wait(400);await capture(a,'castle-exterior');
 await cmd(a,{kind:'travel',portal:'castle-entry'});await until(()=>p.mapId==='shared-oath-castle');await ready(a,p);await capture(a,'castle-interior');assert.equal(p.character.data.level,1);
 await place(b,q,t.world(p.mapId),{x:2,z:-19,y:0,surface:'ground'});await until(()=>a.evaluate('window.__dm.client.snapshot.players.length===2'));report.checks.push('level-one gate entry reaches shared castle with second player');
 await cmd(a,{kind:'destination',x:0,z:18});await until(()=>p.game.player.z>16,18000);await capture(a,'castle-arena-door');assert.ok(t.world(p.mapId).enemies.every(e=>e.alive));report.checks.push('player traverses castle with real movement and no common-enemy kills');
 await enter(a);await ready(a,p);await wait(700);await capture(a,'castle-knight-arena');assert.equal(t.world(p.mapId).enemies[0].enemyType,'oathKnight');assert.equal(q.mapId,'shared-oath-castle');report.checks.push('guardian arena is separate from shared interior');
 const instance=t.arenas.instances.get(p.instanceId);instance.w.enemies[0].damage(99999);await until(()=>!p.instanceId,15000);await ready(a,p);assert.equal(p.mapId,'shared-oath-castle');report.checks.push('arena victory returns to castle and persists unlock');
 await cmd(b,{kind:'travel',portal:'castle-exit'});await until(()=>q.mapId==='shared-floor-3');await ready(b,q);assert.equal(q.game.player.surface,gate.surface);await capture(b,'castle-return');
 const one=t.world('shared-floor-1');await place(a,p,one,{...one.enemies[12].spawnPosition});await a.evaluate('window.__dm.view.zoom(100)');await wait(800);await capture(a,'floor-one-max-zoom');report.visual=await a.evaluate('({height:window.__dm.view.height,draws:window.__dm.view.renderer.info.render.calls,triangles:window.__dm.view.renderer.info.render.triangles,textures:window.__dm.view.renderer.info.memory.textures})');
}
