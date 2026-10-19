import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {startHub} from '../server/hub.js';
import {WorldClient} from '../src/multiplayer/world-client.js';
import {FLOOR_IDS,towerMessage} from '../shared/tower.js';
import {canStand} from '../src/world/collision.js';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const Socket=class extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const until=async(fn,ms=10000)=>{const end=Date.now()+ms;while(!fn()){if(Date.now()>end)throw Error('Estado esperado não recebido.');await sleep(20);}};

test('B/C/D/E/F/G: real tower clients isolate floors, fight, transition, resume and reuse geography after server restart',async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'dm-tower-network-'));let h;const clients=[];
 t.after(async()=>{clients.forEach(c=>c.disconnect());await h?.close();assert.equal(path.dirname(path.resolve(directory)),path.resolve(os.tmpdir()));fs.rmSync(directory,{recursive:true,force:true});});
 h=await startHub({port:0,worldDataDir:directory,log(){},worldOptions:{random:()=>.5}});
 const maps=[[],[]],a=new WorldClient({url:`ws://127.0.0.1:${h.port}/hub`,name:'Teste A',protocol:3,Socket,onMap:m=>maps[0].push(m)}),b=new WorldClient({url:`ws://127.0.0.1:${h.port}/hub`,name:'Teste B',protocol:3,Socket,onMap:m=>maps[1].push(m)});clients.push(a,b);a.connect();b.connect();
 await until(()=>a.snapshot?.players.length===2&&b.snapshot?.players.length===2);assert.deepEqual(maps[0][0],maps[1][0]);assert.equal(a.remotes.size,1);
 const w1=h.tower.world(FLOOR_IDS[0]),p=w1.players.get(a.id),q=w1.players.get(b.id),enemy=w1.enemies[0];
 // Test fixture positions only: combat commands, damage, death and respawn use the real transport/simulation.
 Object.assign(p.game.player,{x:enemy.x-1,z:enemy.z});Object.assign(q.game.player,{x:enemy.x+1,z:enemy.z});
 for(const c of [a,b])c.command({kind:'attack',target:enemy.id,generation:0});await until(()=>enemy.hp===0);
 await until(()=>a.snapshot.monsters.find(e=>e.id===enemy.id).hp===0&&b.snapshot.monsters.find(e=>e.id===enemy.id).hp===0);
 assert.ok(w1.events.some(e=>e.source===p.id));assert.ok(w1.events.some(e=>e.source===q.id));
 for(const player of [p,q]){player.target=null;player.game.cancel();Object.assign(player.game.player,w1.map.spawn);}
 await until(()=>a.snapshot.monsters.find(e=>e.id===enemy.id).generation===1&&b.snapshot.monsters.find(e=>e.id===enemy.id).generation===1,35000);
 const stale={mapId:a.mapId,epoch:a.epoch};Object.assign(p.game.player,w1.map.portal);a.command({kind:'travel',portal:'return-portal'});
 await until(()=>a.mapId===FLOOR_IDS[1]&&a.snapshot?.players.length===1&&b.snapshot?.players.length===1);assert.equal(a.remotes.size,0);assert.equal(b.remotes.size,0);assert.equal(q.mapId,FLOOR_IDS[0]);
 assert.ok(a.snapshot.monsters.every(e=>e.id.startsWith(FLOOR_IDS[1])));assert.equal(a.snapshot.events.length,0);
 a.socket.send(JSON.stringify(towerMessage('world:input',{...stale,seq:100,action:{kind:'move',x:1,z:0}})));await sleep(100);assert.equal(p.seq,0);assert.equal(p.axis.x,0);
 const id=a.id;a.disconnect();await until(()=>h.tower.world(FLOOR_IDS[1]).players.size===0);a.connect();await until(()=>a.snapshot?.mapId===FLOOR_IDS[1]);assert.equal(a.id,id);
 a.command({kind:'travel',portal:'abandon-run'});await until(()=>a.snapshot?.mapId===FLOOR_IDS[0]&&b.snapshot.players.length===2);assert.ok(canStand(w1.map,p.game.player.x,p.game.player.z,.32));
 a.socket.send(JSON.stringify(towerMessage('world:input',{...stale,seq:101,action:{kind:'move',x:1,z:0}})));await sleep(100);assert.equal(p.seq,0);

 // Real transport through all twelve areas; the server fixture only skips walking.
 for(let f=2;f<=12;f++){
  const current=h.tower.world(p.mapId);Object.assign(p.game.player,current.map.portal);a.command({kind:'travel',portal:'return-portal'});
  await until(()=>a.snapshot?.mapId===FLOOR_IDS[f-1]);assert.equal(b.snapshot.mapId,FLOOR_IDS[0]);
  if(f===7){a.disconnect();await until(()=>h.tower.world(FLOOR_IDS[6]).players.size===0);a.connect();await until(()=>a.snapshot?.mapId===FLOOR_IDS[6]);assert.equal(a.id,id);}
 }
 const saved=FLOOR_IDS.map((_,i)=>fs.readFileSync(path.join(directory,`floor-${i+1}.json`),'utf8'));
 for(let f=11;f>=1;f--){Object.assign(p.game.player,h.tower.world(p.mapId).map.spawn);a.command({kind:'travel',portal:'abandon-run'});await until(()=>a.snapshot?.mapId===FLOOR_IDS[f-1]);}
 const bytes=fs.readFileSync(path.join(directory,'floor-1.json'),'utf8'),hash=a.geography.hash,port=h.port;a.disconnect();b.disconnect();await h.close();h=null;
 h=await startHub({port,worldDataDir:directory,towerSeed:99,log(){}});a.connect();b.connect();await until(()=>a.snapshot?.players.length===2&&b.snapshot?.players.length===2);for(let f=1;f<=12;f++){h.tower.world(FLOOR_IDS[f-1]);assert.equal(fs.readFileSync(path.join(directory,`floor-${f}.json`),'utf8'),saved[f-1]);}assert.equal(a.geography.hash,hash);assert.deepEqual(maps[0].at(-1),maps[0][0]);assert.equal(fs.readFileSync(path.join(directory,'floor-1.json'),'utf8'),bytes);
});
