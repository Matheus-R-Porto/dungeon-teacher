import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {startHub} from '../server/hub.js';import {WorldClient} from '../src/multiplayer/world-client.js';
const {WebSocket}=createRequire(new URL('../server/package.json',import.meta.url))('ws');
class Socket extends WebSocket{constructor(url){super(url,{origin:'dungeon://game'});}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const until=async(fn)=>{const end=Date.now()+6000;while(!fn()){if(Date.now()>end)throw Error('Snapshot expected');await sleep(10);}};
test('37 network: authoritative recoil, boss protection and reconnect cross real sockets',async t=>{
 const hub=await startHub({port:0,log(){},worldOptions:{random:()=>.1}});t.after(()=>hub.close());
 const clients=['Impact A','Impact B'].map(name=>{const c=new WorldClient({url:`ws://127.0.0.1:${hub.port}/hub`,name,Socket});t.after(()=>c.disconnect());c.connect();return c;});const [a,b]=clients;
 await until(()=>a.snapshot?.players.length===2&&b.snapshot?.players.length===2);
 const w=hub.world,p=w.players.get(a.id),e=w.enemies[0];p.character.stats.maxHP=p.character.data.hp=1000;p.impactRules={recoil:1,recovery:.5,protection:3};p.cycle.phase='windup';p.cycle.remaining=2;p.cycle.recovery=.5;
 w.impact(e.id,p.id,{physicalAttack:200,accuracy:100,criticalChance:0},{physicalDefense:0,evasion:0},d=>p.character.damage(d));
 await until(()=>clients.every(c=>c.snapshot.players.find(x=>x.id===a.id)?.impact?.phase==='recoil'));
 assert.equal(p.cycle.phase,'recovery');assert.equal(p.impactState.serial,1);
 for(const c of clients){const q=c.snapshot.players.find(x=>x.id===a.id);assert.equal(q.hp,p.character.data.hp);assert.equal(q.impact.serial,1);assert.ok(c.snapshot.events.some(ev=>ev.type==='recoil'&&ev.target===a.id));}
 a.command({kind:'move',x:1,z:0});await sleep(60);assert.deepEqual(p.axis,{x:0,z:0});
 const id=a.id;a.disconnect();await until(()=>!p.ws);a.connect();await until(()=>a.status==='Online'&&a.snapshot?.players.find(x=>x.id===id)?.impact?.serial===1);assert.equal(a.id,id);assert.equal(w.players.get(id),p);assert.equal(p.cycle.phase,'recovery');
 e.hp=e.stats.maxHP=10000;e.isBoss=true;e.impactRules={recoil:1,recovery:.5,protection:4};const cycle=w.cycles.get(e.id);cycle.phase='windup';cycle.remaining=2;cycle.recovery=.5;
 const hit=()=>w.impact(p.id,e.id,{physicalAttack:1500,accuracy:100,criticalChance:0},{physicalDefense:0,evasion:0},d=>e.damage(d));hit();
 await until(()=>clients.every(c=>c.snapshot.monsters.find(x=>x.id===e.id)?.impact?.phase==='recoil'));
 const untilProtected=e.impactState.protectedUntil,hp=e.hp;hit();assert.ok(e.hp<hp);assert.equal(e.impactState.protectedUntil,untilProtected);assert.equal(e.impactState.serial,1);
 await until(()=>clients.every(c=>c.snapshot.monsters.find(x=>x.id===e.id)?.hp===e.hp));
});
