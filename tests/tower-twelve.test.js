import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {FloorStore,sharedFloor,geographyHash,LEGACY_GENERATOR_VERSION} from '../server/floor-store.js';
import {SharedTower} from '../server/tower.js';
import {FLOOR_IDS,towerMessage,decodeTowerMessage} from '../shared/tower.js';
import {canStand} from '../src/world/collision.js';
const temp=t=>{const d=fs.mkdtempSync(path.join(os.tmpdir(),'dm-twelve-'));t.after(()=>{assert.equal(path.dirname(path.resolve(d)),path.resolve(os.tmpdir()));fs.rmSync(d,{recursive:true,force:true});});return d;};
const join=t=>{const ws={close(){}};t.join(ws,'Explorador',null);return ws;};
const command=(t,ws,action,patch={})=>{const p=ws.worldPlayer;return t.command(ws,decodeTowerMessage(JSON.stringify(towerMessage('world:input',{seq:p.seq+1,mapId:p.mapId,epoch:p.epoch,action,...patch}))));};
const travel=(t,ws,id)=>{const w=t.world(ws.worldPlayer.mapId),i=w.map.interactables.find(i=>i.id===id);Object.assign(ws.worldPlayer.game.player,{x:i.x,z:i.z});return command(t,ws,{kind:'travel',portal:id});};
test('18 A: all twelve real floors deterministic, valid, persisted and legacy bytes preserved',t=>{
 const d=temp(t),times=[],before=process.memoryUsage().heapUsed;
 // Reproduce the previous release record, including its now obsolete floor-2 exit.
 for(const floor of [1,2]){const definition=sharedFloor(217021,floor);for(const i of definition.interactables){i.content={areaId:FLOOR_IDS[floor===1?1:0]};i.label='Portal da versão anterior';}definition.exits=definition.interactables.map(i=>({interactionId:i.id,...i.content}));fs.writeFileSync(path.join(d,`floor-${floor}.json`),JSON.stringify({schema:1,generatorVersion:LEGACY_GENERATOR_VERSION,floor,seed:217021,definition,hash:geographyHash(definition)}));}
 const legacy=[1,2].map(f=>fs.readFileSync(path.join(d,`floor-${f}.json`),'utf8')),store=new FloorStore(d),records=[];
 for(let f=1;f<=12;f++){const start=performance.now(),r=store.load(f);times.push(+(performance.now()-start).toFixed(2));records.push(r);assert.equal(r.definition.id,FLOOR_IDS[f-1]);assert.equal(r.definition.floorId,f);assert.equal(r.seed,217021);assert.equal(r.hash,geographyHash(r.definition));const fresh=sharedFloor(217021,f);assert.equal(geographyHash(fresh),geographyHash(sharedFloor(217021,f)));assert.ok(fresh.enemySpawns.length);assert.ok(fresh.enemySpawns.every(e=>canStand(fresh,e.position.x,e.position.z,.2)));assert.equal(fresh.floorRole,'normal');}
 const start=performance.now(),again=new FloorStore(d,{seed:999,generate(){throw Error('Regeneration forbidden');}});for(let f=1;f<=12;f++)assert.deepEqual(again.load(f),records[f-1]);
 assert.ok(records.some(r=>r.definition.floorEnvironment.type==='CAVE'));assert.deepEqual([1,2].map(f=>fs.readFileSync(path.join(d,`floor-${f}.json`),'utf8')),legacy);
 t.diagnostic(JSON.stringify({generationOrLoadMs:times,reload12Ms:+(performance.now()-start).toFixed(2),heapDeltaMB:+((process.memoryUsage().heapUsed-before)/1048576).toFixed(2)}));
 const tower=new SharedTower({directory:d});assert.equal(tower.world(FLOOR_IDS[1]).map.interactables.find(i=>i.id==='return-portal').content.areaId,FLOOR_IDS[2]);assert.deepEqual([1,2].map(f=>fs.readFileSync(path.join(d,`floor-${f}.json`),'utf8')),legacy);
});
test('18 B/C/E: climb all twelve, reunite, reconnect mid-tower, descend, reject old visits and floor 13',t=>{
 const tower=new SharedTower({directory:temp(t)}),a=join(tower),b=join(tower),p=a.worldPlayer;
 for(let f=2;f<=12;f++){const stale={mapId:p.mapId,epoch:p.epoch};travel(tower,a,'return-portal');assert.equal(p.mapId,FLOOR_IDS[f-1]);const w=tower.world(p.mapId);assert.ok(canStand(w.map,p.game.player.x,p.game.player.z,.32));command(tower,a,{kind:'move',x:1,z:0},stale);assert.equal(p.axis.x,0);assert.equal(tower.snapshot(p).players.length,1);assert.equal(tower.snapshot(b.worldPlayer).players.length,1);
 if(f===7){tower.leave(a);tower.join(a,'Explorador',p.token);assert.equal(a.worldPlayer,p);assert.equal(p.mapId,FLOOR_IDS[6]);}}
 const limit=travel(tower,a,'return-portal');assert.equal(limit.type,'world:notice');assert.match(limit.message,/13 indisponível/);assert.equal(tower.worlds.size,12);assert.throws(()=>tower.world('shared-floor-13'));
 for(let f=2;f<=12;f++)travel(tower,b,'return-portal');assert.equal(tower.snapshot(p).players.length,2);
 for(let f=11;f>=1;f--){travel(tower,a,'abandon-run');assert.equal(p.mapId,FLOOR_IDS[f-1]);assert.ok(canStand(tower.world(p.mapId).map,p.game.player.x,p.game.player.z,.32));}
 assert.equal([...tower.worlds.values()].reduce((n,w)=>n+w.players.size,0),2);
});
test('18 performance: empty areas sleep after reconnection grace; occupied areas continue',t=>{
 const tower=new SharedTower({directory:temp(t)});for(const id of FLOOR_IDS)tower.world(id);const start=performance.now();for(let i=0;i<1000;i++)tower.step();assert.ok([...tower.worlds.values()].every(w=>w.tick===0));t.diagnostic('1000 idle twelve-area steps ms: '+(performance.now()-start).toFixed(2));
 const a=join(tower),w=tower.world(a.worldPlayer.mapId);tower.step();assert.equal(w.tick,1);tower.leave(a);for(let i=0;i<1202;i++)tower.step();assert.equal(w.tokens.size,0);const tick=w.tick;tower.step();assert.equal(w.tick,tick);
});
test('18 D: two attackers share real damage in every floor with independent HP and targets',t=>{
 const tower=new SharedTower({directory:temp(t),worldOptions:{random:()=>.5}});let maxStepMs=0;
 for(const id of FLOOR_IDS){const w=tower.world(id),a={close(){}},b={close(){}},p=w.join(a,'A'),q=w.join(b,'B');a.worldPlayer=p;b.worldPlayer=q;const e=w.enemies[0],hp=e.hp;
 Object.assign(p.game.player,{x:e.x-1,z:e.z});Object.assign(q.game.player,{x:e.x+1,z:e.z});
 for(const ws of[a,b])w.command(ws,{seq:1,action:{kind:'attack',target:e.id,generation:0}});
 const start=performance.now();for(let i=0;i<20;i++)w.step();maxStepMs=Math.max(maxStepMs,(performance.now()-start)/20);
 assert.ok(e.hp<hp,id);assert.ok(w.events.some(v=>v.source===p.id),id+' A');assert.ok(w.events.some(v=>v.source===q.id),id+' B');assert.ok(w.snapshot().monsters.every(m=>m.id.startsWith(id+':')));w.leave(a);w.leave(b);
 }
 const all=[...tower.worlds.values()].flatMap(w=>w.enemies.map(e=>e.id));assert.equal(new Set(all).size,all.length);t.diagnostic('max mean occupied-floor step ms: '+maxStepMs.toFixed(2));
});
