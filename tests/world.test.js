import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SharedWorld} from '../server/world.js';
import {decodeWorld,worldMessage,testMap} from '../shared/world.js';
import {Character} from '../src/domain/character/character.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {canStand} from '../src/world/collision.js';
import profiles from '../desktop/test-profile.cjs';
const join=(w,name='Teste')=>{const ws={close(){}};ws.worldPlayer=w.join(ws,name,null);return ws;};
const command=(w,ws,action,seq=ws.worldPlayer.seq+1)=>w.command(ws,decodeWorld(JSON.stringify(worldMessage('world:input',{seq,action}))));
const advance=(w,seconds)=>{for(let i=0;i<seconds*20;i++)w.step();};
const attack=(w,ws,e=w.enemies[0])=>command(w,ws,{kind:'attack',target:e.id,generation:e.generation});

test('new campaign discards floor 4 from old seed and preserves individual progress',()=>{
 const hub=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url))),c=new Character();
 c.data.tower.highestClearedFloor=4;const before=structuredClone(c.data.tower),s=new AreaSession(createAreas(hub),c,{seed:42});
 const climb=()=>{s.startRun();s.travel({targetId:'return-portal'});s.travel({targetId:'return-portal'});s.run.rewardCollected=true;s.travel({targetId:'return-portal'});};
 climb();const old=s.areas['tower-floor-4'];s.endRun();s.seedOverride=99;climb();assert.notEqual(s.areas['tower-floor-4'],old);assert.notEqual(s.area.seed,old.seed);assert.deepEqual(c.data.tower,before);
});
test('test profiles are distinct, leave main path unchanged and cannot traverse directories',()=>{
 const main=profiles.testOptions([],'C:/profiles','wss://example.org/hub'),a=profiles.testOptions(['--test-profile=A'],'C:/profiles',''),b=profiles.testOptions(['--test-profile=B'],'C:/profiles','');
 assert.notEqual(a.profile,b.profile);assert.notEqual(main.profile,a.profile);assert.equal(main.query,'');assert.match(a.query,/shared=1/);
 for(const name of ['../main','','A/B','a'.repeat(25),'CON','nul'])assert.throws(()=>profiles.testOptions(['--test-profile='+name],'C:/profiles',''));
 assert.throws(()=>profiles.testOptions(['--test-profile'],'C:/profiles',''));
 assert.throws(()=>profiles.testOptions(['--server=ws://127.0.0.1:8787/hub'],'C:/profiles',''));
});
test('protocol rejects forged damage, absolute player state, excessive movement and old versions',()=>{
 for(const action of [{kind:'damage',damage:999},{kind:'move',x:2,z:0},{kind:'move',x:0,z:0,hp:999},{kind:'attack',target:'slime-1',generation:-1},{kind:'destination',x:99,z:0}])assert.throws(()=>decodeWorld(JSON.stringify(worldMessage('world:input',{seq:1,action}))));
 assert.throws(()=>decodeWorld('{'));assert.throws(()=>decodeWorld(JSON.stringify({v:1,type:'world:hello'})));
});
test('server normalizes diagonal speed, expires held input and bounds movement',()=>{
 const w=new SharedWorld(),a=join(w),p=a.worldPlayer;command(w,a,{kind:'move',x:1,z:1});advance(w,.2);assert.ok(Math.hypot(p.game.player.x,p.game.player.z-7)<=.721);
 advance(w,2);const pos={...p.game.player};advance(w,2);assert.deepEqual(p.game.player,pos);
 for(let i=0;i<200;i++){command(w,a,{kind:'move',x:1,z:1});w.step();assert.ok(canStand(w.map,p.game.player.x,p.game.player.z,.32));}
});
test('movement cannot tunnel through cover and navigation routes around it',()=>{
 const w=new SharedWorld(),a=join(w),p=a.worldPlayer;Object.assign(p.game.player,{x:1,z:0});
 for(let i=0;i<50;i++){command(w,a,{kind:'move',x:1,z:0});w.step();}assert.ok(p.game.player.x<2.7);
 command(w,a,{kind:'destination',x:7,z:0});advance(w,6);assert.ok(Math.hypot(p.game.player.x-7,p.game.player.z)<.1);
});
test('selection and approach do not provoke until a valid hostile impact',()=>{
 const w=new SharedWorld({random:()=>.5}),a=join(w),e=w.enemies[0];attack(w,a);advance(w,.2);assert.equal(e.targetId,null);assert.equal(e.hp,e.stats.maxHP);
 advance(w,2);assert.equal(e.targetId,a.worldPlayer.id);assert.ok(e.hp<e.stats.maxHP);
});
test('two players damage one monster, with one death, respawn and no permanent rewards',()=>{
 const w=new SharedWorld({random:()=>.5}),a=join(w,'Teste A'),b=join(w,'Teste B'),e=w.enemies[0];
 Object.assign(a.worldPlayer.game.player,{x:-1,z:0});Object.assign(b.worldPlayer.game.player,{x:1,z:0});const before=[a,b].map(ws=>ws.worldPlayer.character.snapshot());attack(w,a);attack(w,b);advance(w,4);
 assert.ok(w.events.some(x=>x.source===a.worldPlayer.id&&x.target===e.id));assert.ok(w.events.some(x=>x.source===b.worldPlayer.id&&x.target===e.id));
 assert.equal(e.hp,0);const impacts=w.events.filter(x=>x.target===e.id).length;advance(w,1);assert.equal(w.events.filter(x=>x.target===e.id).length,impacts);assert.equal(e.generation,0);
 for(const ws of [a,b]){command(w,ws,{kind:'stop'});Object.assign(ws.worldPlayer.game.player,{x:0,z:9});}advance(w,7);assert.equal(e.generation,1);assert.equal(e.hp,e.stats.maxHP);
 for(const [i,ws]of[a,b].entries()){const after=ws.worldPlayer.character.snapshot();for(const k of ['xp','gold','inventory','tower','lifeSkills'])assert.deepEqual(after[k],before[i][k]);}
 assert.equal(command(w,a,{kind:'attack',target:e.id,generation:0}),false);
});
test('cadence cannot be bypassed by repeated attack commands and impact checks range',()=>{
 const w=new SharedWorld({random:()=>.5}),a=join(w),e=w.enemies[0];Object.assign(a.worldPlayer.game.player,{x:0,z:1});
 for(let i=0;i<20;i++){attack(w,a);w.step();}assert.ok(w.events.filter(x=>x.source===a.worldPlayer.id).length<=2);
 const hp=e.hp;Object.assign(a.worldPlayer.game.player,{x:0,z:10});advance(w,.2);assert.equal(e.hp,hp);
});
test('line of sight blocks damage through cover',()=>{
 const w=new SharedWorld({random:()=>.5}),a=join(w),e=w.enemies[0];Object.assign(e,{x:5.4,z:0});Object.assign(a.worldPlayer.game.player,{x:2.6,z:0});assert.equal(w.validHit(a.worldPlayer.game.player,e,10),false);
});
test('shared player and monster bodies separate without crossing static geometry',()=>{
 const w=new SharedWorld(),a=join(w),b=join(w);advance(w,.5);assert.ok(Math.hypot(a.worldPlayer.game.player.x-b.worldPlayer.game.player.x,a.worldPlayer.game.player.z-b.worldPlayer.game.player.z)>=.63);
 for(const ws of [a,b])assert.ok(canStand(w.map,ws.worldPlayer.game.player.x,ws.worldPlayer.game.player.z,.32));
});
test('session replacement rejects stale socket and sequence without removing the new player',()=>{
 const w=new SharedWorld(),old=join(w),p=old.worldPlayer,replacement={close(){}};replacement.worldPlayer=w.join(replacement,'Teste',p.token);assert.equal(w.players.size,1);
 assert.throws(()=>command(w,old,{kind:'move',x:1,z:0}),/Sessão/);w.leave(old);assert.equal(w.players.size,1);
 command(w,replacement,{kind:'move',x:1,z:0},3);assert.equal(command(w,replacement,{kind:'stop'},2),false);assert.equal(p.axis.x,1);
 w.leave(replacement);assert.equal(w.players.size,0);advance(w,61);assert.equal(w.tokens.size,0);
});
test('disconnect clears enemy target, completes leash and restores passive state',()=>{
 const w=new SharedWorld({random:()=>.5}),a=join(w),e=w.enemies[0];Object.assign(a.worldPlayer.game.player,{x:0,z:1});attack(w,a);advance(w,.5);w.leave(a);assert.equal(e.targetId,null);advance(w,3);assert.equal(e.state,'idle');assert.equal(e.hp,e.stats.maxHP);
});
test('dead players cannot issue attacks and return without inventory loss',()=>{
 const w=new SharedWorld(),a=join(w),p=a.worldPlayer,bag=structuredClone(p.character.data.inventory);p.character.damage(99999);assert.equal(attack(w,a),false);advance(w,4.2);assert.ok(p.character.isAlive);assert.deepEqual(p.character.data.inventory,bag);assert.equal(p.game.player.z,testMap().spawn.z);
});
