import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {FloorStore,sharedFloor,geographyHash} from '../server/floor-store.js';
import {SharedTower} from '../server/tower.js';
import {FLOOR_IDS,decodeTowerMessage,towerMessage} from '../shared/tower.js';
import {canStand} from '../src/world/collision.js';
import {generateFloor} from '../src/world/tower.js';
const directory=t=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dm-tower-'));t.after(()=>{assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));fs.rmSync(dir,{recursive:true,force:true});});return dir;};
const join=t=>{const ws={close(){}};t.join(ws,'Viajante',null);return ws;};
const input=(t,ws,action,patch={})=>{const p=ws.worldPlayer;return t.command(ws,decodeTowerMessage(JSON.stringify(towerMessage('world:input',{seq:p.seq+1,mapId:p.mapId,epoch:p.epoch,action,...patch}))));};
const travel=(t,ws,id='return-portal')=>{const w=t.world(ws.worldPlayer.mapId),portal=w.map.interactables.find(i=>i.id===id);Object.assign(ws.worldPlayer.game.player,{x:portal.x,z:portal.z});return input(t,ws,{kind:'travel',portal:id});};

test('A: deterministic shared geography reuses existing generator and does not mutate local policy',()=>{
 for(const floor of [1,2]){const a=sharedFloor(17,floor),b=sharedFloor(17,floor),local=generateFloor(17,floor,'refuge');assert.equal(geographyHash(a),geographyHash(b));assert.deepEqual(a.walkable,local.walkable);assert.deepEqual(a.trails,local.trails);assert.deepEqual(a.obstacles,local.obstacles);assert.ok(a.gates.every(g=>g.open));assert.ok(local.gates.every(g=>!g.open));assert.ok(local.enemySpawns.every(s=>s.overrides.noRespawn));assert.ok(a.enemySpawns.every(s=>s.id.startsWith(a.id+':')));}
});
test('B: full geography persists without invoking generator after reopening with different seed',t=>{
 const dir=directory(t),store=new FloorStore(dir,{seed:12}),a=store.load(1),original=fs.readFileSync(path.join(dir,'floor-1.json'),'utf8');
 const next=new FloorStore(dir,{seed:999,generate(){throw Error('must not generate');}});assert.deepEqual(next.load(1),a);assert.equal(fs.readFileSync(path.join(dir,'floor-1.json'),'utf8'),original);assert.equal(fs.readdirSync(dir).length,1);
});
test('invalid JSON, hash or generator version is preserved without regeneration',t=>{
 const dir=directory(t),file=path.join(dir,'floor-1.json'),record=new FloorStore(dir).load(1);
 for(const broken of ['{"schema":',JSON.stringify({...record,hash:'wrong'}),JSON.stringify({...record,generatorVersion:'future'}),JSON.stringify({...record,seed:999})]){fs.writeFileSync(file,broken);assert.throws(()=>new FloorStore(dir).load(1),/preservad/);assert.equal(fs.readFileSync(file,'utf8'),broken);}
});
test('D/E: portal validation, independent populations, up/down and area epoch prevent stale commands',t=>{
 const tower=new SharedTower({directory:directory(t)}),a=join(tower),b=join(tower),p=a.worldPlayer,w1=tower.world(FLOOR_IDS[0]);
 const early=input(tower,a,{kind:'travel',portal:'return-portal'});assert.equal(early.type,'world:notice');assert.equal(w1.players.size,2);
 const old={mapId:p.mapId,epoch:p.epoch},welcome=travel(tower,a),w2=tower.world(FLOOR_IDS[1]);assert.equal(welcome.map.id,FLOOR_IDS[1]);assert.equal(w1.players.size,1);assert.equal(w2.players.size,1);assert.ok(canStand(w2.map,p.game.player.x,p.game.player.z,.32));
 assert.equal(tower.snapshot(b.worldPlayer).players.length,1);assert.ok(tower.snapshot(p).monsters.every(m=>m.id.startsWith(FLOOR_IDS[1]+':')));
 assert.equal(input(tower,a,{kind:'attack',target:w1.enemies[0].id,generation:0},old),null);assert.equal(p.target,null);
 travel(tower,a,'abandon-run');assert.equal(p.mapId,FLOOR_IDS[0]);assert.notEqual(p.epoch,old.epoch);assert.equal(input(tower,a,{kind:'move',x:1,z:0},old),null);assert.equal(p.axis.x,0);assert.equal(w1.players.size,2);assert.equal(w2.players.size,0);
});
test('F/G: enemies lose transferred targets; reconnect has exactly one owning area',t=>{
 const tower=new SharedTower({directory:directory(t)}),a=join(tower),p=a.worldPlayer,w=tower.world(p.mapId),e=w.enemies[0];e.targetId=p.id;e.state='chasing';p.target={id:e.id,generation:0};travel(tower,a);assert.equal(e.targetId,null);assert.equal(e.state,'returning');assert.equal(p.target,null);
 tower.leave(a);const replacement={close(){}};tower.join(replacement,'Viajante',p.token);assert.equal(replacement.worldPlayer,p);assert.equal(p.mapId,FLOOR_IDS[1]);tower.leave(a);assert.equal([...tower.worlds.values()].reduce((n,w)=>n+w.players.size,0),1);assert.throws(()=>input(tower,a,{kind:'stop'}),/inativa/);
});
test('transition failure never publishes membership in an invalid destination',t=>{
 const dir=directory(t),tower=new SharedTower({directory:dir}),a=join(tower),p=a.worldPlayer;fs.writeFileSync(path.join(dir,'floor-2.json'),'corrupt');assert.throws(()=>travel(tower,a),/preservad/);assert.equal(p.mapId,FLOOR_IDS[0]);assert.equal(tower.world(FLOOR_IDS[0]).players.get(p.id),p);assert.equal(tower.worlds.size,1);
});
