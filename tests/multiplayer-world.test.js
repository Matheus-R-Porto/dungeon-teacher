import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {startHub} from '../server/hub.js';
import {WorldClient} from '../src/multiplayer/world-client.js';
import {worldMessage} from '../shared/world.js';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
const Socket=class extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const until=async(fn,ms=10000)=>{const end=Date.now()+ms;while(!fn()){if(Date.now()>end)throw Error('Estado esperado não recebido.');await sleep(20);}};
async function fixture(t){const hub=await startHub({port:0,log(){},worldOptions:{random:()=>.5}});t.after(()=>hub.close());return hub;}
function client(t,hub,name){const snapshots=[],c=new WorldClient({url:`ws://127.0.0.1:${hub.port}/hub`,name,Socket,onSnapshot:s=>snapshots.push(s)});t.after(()=>c.disconnect());c.connect();return {c,snapshots};}

test('real clients share movement, combat, late join, unique death, respawn and reconnect',async t=>{
 const h=await fixture(t),a=client(t,h,'Teste A'),b=client(t,h,'Teste B');await until(()=>a.c.snapshot?.players.length===2&&b.c.snapshot?.players.length===2);
 assert.equal(a.c.remotes.size,1);assert.equal(b.c.remotes.size,1);
 const start=b.c.snapshot.players.find(p=>p.id===a.c.id);a.c.command({kind:'move',x:-1,z:0});await until(()=>b.c.snapshot.players.find(p=>p.id===a.c.id).x<start.x-.2);a.c.command({kind:'stop'});
 for(const x of [a,b])x.c.command({kind:'attack',target:'slime-1',generation:0});
 await until(()=>b.c.snapshot.monsters[0].hp<100);const late=client(t,h,'Teste C');await until(()=>late.c.snapshot?.monsters[0].hp<100);assert.equal(late.c.remotes.size,2);
 await until(()=>a.c.snapshot.monsters[0].hp===0&&b.c.snapshot.monsters[0].hp===0);
 const events=a.c.snapshot.events.filter(e=>e.target==='slime-1');assert.ok(events.some(e=>e.source===a.c.id));assert.ok(events.some(e=>e.source===b.c.id));
 const matching=a.snapshots.find(s=>s.tick===b.c.snapshot.tick);assert.deepEqual(matching.monsters,b.c.snapshot.monsters);
 for(const x of [a,b])x.c.command({kind:'destination',x:0,z:9});
 await until(()=>a.c.snapshot.monsters[0].generation===1&&b.c.snapshot.monsters[0].generation===1,12000);
 a.c.command({kind:'attack',target:'slime-1',generation:0});await sleep(200);assert.equal(a.c.snapshot.monsters[0].hp,100);
 const id=a.c.id;a.c.disconnect();await until(()=>!b.c.snapshot.players.some(p=>p.id===id));a.c.connect();await until(()=>a.c.snapshot?.players.length===3&&b.c.snapshot.players.some(p=>p.id===id));assert.equal(a.c.id,id);assert.equal(new Set(b.c.snapshot.players.map(p=>p.id)).size,3);
});
test('real socket rejects invented damage and cannot mutate after replacement',async t=>{
 const h=await fixture(t),a=client(t,h,'Teste A');await until(()=>a.c.status==='Online');
 const old=a.c.socket,b=client(t,h,'Teste B');b.c.disconnect();b.c.token=a.c.token;b.c.connect();await until(()=>b.c.status==='Online');assert.equal(h.world.players.size,1);await until(()=>a.c.desired===false);
 assert.notEqual(old.readyState,WebSocket.OPEN);
 b.c.socket.send(JSON.stringify(worldMessage('world:input',{seq:1,action:{kind:'damage',target:'slime-1',damage:9999}})));
 await until(()=>!b.c.desired);assert.equal(h.world.enemies[0].hp,100);
});
