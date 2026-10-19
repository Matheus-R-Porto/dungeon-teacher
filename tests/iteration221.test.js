import test from 'node:test';
import assert from 'node:assert/strict';
import {sharedFloor} from '../server/floor-store.js';
import {expandOpenTower} from '../src/world/open-tower.js';
import {expandLivingTower} from '../src/world/living-tower.js';
import {insideTerrain,canStand,clearSegment,moveWithCollision} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {Game} from '../src/simulation/game.js';
import {SharedWorld} from '../server/world.js';
import {RemoteState} from '../src/multiplayer/remote-state.js';
import {ActivityAnimation} from '../src/core/activity-animation.js';
import {npcAmbient} from '../src/core/npc-ambient.js';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {OnlineTower} from '../server/online-tower.js';
const map=f=>expandOpenTower(sharedFloor(217021,f));
test('v2 composition preserves v1 and source, is deterministic and reversible without writes',()=>{
 for(let f=1;f<=3;f++){const base=sharedFloor(217021,f),before=JSON.stringify(base),v1=expandLivingTower(base),w=expandOpenTower(base);
 assert.equal(JSON.stringify(base),before);assert.deepEqual(expandOpenTower(w),w);assert.deepEqual(expandOpenTower(base,{enabled:false}),v1);assert.deepEqual(w.interactables.slice(0,v1.interactables.length),v1.interactables);assert.deepEqual(w.enemySpawns,v1.enemySpawns);assert.deepEqual(w.livingTower.futureArena,v1.livingTower.futureArena);
 let added=0;for(let x=w.bounds.minX;x<w.bounds.maxX;x+=3)for(let z=w.bounds.minZ;z<w.bounds.maxZ;z+=3)if(insideTerrain(w,x,z,.32)&&!insideTerrain(v1,x,z,.32))added++;assert.ok(added>200);
 }
 for(let f=4;f<=12;f++){const base=sharedFloor(217021,f);assert.deepEqual(expandOpenTower(base),base);}
});
test('all structures allow continuous climb, upper navigation and descent in the same map',()=>{
 for(let f=1;f<=3;f++){const w=map(f),r=w.surfaces[0],d=w.surfaces[1],g=new Game(w);Object.assign(g.player,{x:r.x,z:r.z-r.halfZ-1});const initial=w.id;
 assert.ok(g.moveTo({x:d.x,z:d.z,surface:d.id}));let maximum=0;for(let i=0;i<400;i++){const y=g.player.y;g.update(.05,{x:0,z:0},0);assert.ok(Math.abs(g.player.y-y)<.2);maximum=Math.max(maximum,g.player.y);}assert.equal(maximum,3.2);assert.equal(g.player.surface,d.id);assert.equal(g.world.id,initial);
 const blocked=moveWithCollision(w,g.player,30,0,.32);assert.equal(blocked.surface,d.id);assert.ok(blocked.x<=d.x+d.halfX-.3);
 assert.ok(g.moveTo({x:r.x,z:r.z-r.halfZ-2,surface:'ground'}));for(let i=0;i<400;i++)g.update(.05,{x:0,z:0},0);assert.equal(g.player.y,0);assert.equal(g.player.surface,'ground');
 }
});
test('overlapping floors are distinct for movement, visibility, combat and monster navigation',()=>{
 const w=map(1),d=w.surfaces[1],ground={x:d.x,z:d.z,y:0},upper={...ground,y:d.y,surface:d.id};
 assert.ok(canStand(w,ground.x,ground.z,.32));assert.equal(clearSegment(w,ground,upper,.1),false);assert.equal(new SharedWorld({map:w}).validHit(ground,upper,100),false);
 assert.equal(findPath(w,{...ground,enemyType:'wolf'},upper,.5),null);
 assert.equal(findPath(w,ground,{...upper,surface:'forged'},.32),null);
 const remote=new RemoteState({id:'a',name:'A',state:{...ground,heading:0}},0);remote.push({...upper,heading:0},100);assert.equal(remote.sample(50,0).y,1.6);
});
test('mining shows preparation, downward contact then recovery; presentation never mutates runtime',()=>{
 const a=new ActivityAnimation(),m={active:true,state:'strike',visualStrikeRevision:0},input={mining:m};a.update(input,0);m.visualStrikeRevision++;m.active=false;
 assert.equal(a.update(input,.1).frame,3);assert.equal(a.update(input,.3).frame,2);assert.equal(a.update(input,.8).frame,4);assert.equal(a.update(input,1.1),null);assert.equal(m.state,'strike');
});
test('NPC cycles are deterministic, unsynchronized and include work and rest',()=>{
 const ids=['blacksmith','cook','warehouse','reset-angel','potion-mage','tower-guide'];for(const id of ids){const states=Array.from({length:60},(_,t)=>npcAmbient(id,t).active);assert.ok(states.includes(true)&&states.includes(false));assert.deepEqual(npcAmbient(id,5),npcAmbient(id,5));}assert.notDeepEqual(npcAmbient(ids[0],4),npcAmbient(ids[1],4));
});
test('online clean restart restores validated upper surface without rewriting geography',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dm221-')),options={directory:path.join(dir,'maps'),characterDirectory:path.join(dir,'characters'),send(){}};
 t.after(()=>{assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));fs.rmSync(dir,{recursive:true,force:true});});
 const credential='a'.repeat(64);let tower=new OnlineTower(options),ws={close(){}};tower.join(ws,'Teste',credential);const p=ws.worldPlayer;
 Object.assign(p.game.player,tower.world(p.mapId).map.portal);tower.command(ws,{mapId:p.mapId,epoch:p.epoch,seq:1,action:{kind:'travel',portal:'tower-portal'}});
 const w=tower.world(p.mapId),d=w.map.surfaces[1];Object.assign(p.game.player,{x:d.x,z:d.z,y:d.y,surface:d.id});const bytes=fs.readFileSync(path.join(dir,'maps','floor-1.json'));tower.leave(ws);tower.close();
 tower=new OnlineTower(options);ws={close(){}};tower.join(ws,'Teste',credential);assert.equal(ws.worldPlayer.game.player.y,3.2);assert.equal(ws.worldPlayer.game.player.surface,d.id);assert.deepEqual(fs.readFileSync(path.join(dir,'maps','floor-1.json')),bytes);tower.close();
});
