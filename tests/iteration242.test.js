import test from 'node:test';
import assert from 'node:assert/strict';
import {sharedFloor} from '../server/floor-store.js';
import {awakenTower} from '../src/world/awakened-tower.js';
import {installCastle,castleInterior,CASTLE_ID} from '../src/world/castle.js';
import {createEnemies} from '../src/domain/enemies/spawns.js';
import {findPath} from '../src/world/navigation.js';
import {layerWorld} from '../src/world/surfaces.js';
import {InteractionSystem} from '../src/simulation/interaction.js';
import {decodeOnline} from '../shared/online.js';
import {validateHub} from '../src/core/config.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {passageStatus,creditPassageKill} from '../src/domain/passage-progress.js';
import {encodeSave,decodeSave} from '../src/adapters/persistence/character-save.js';
import {Game} from '../src/simulation/game.js';

test('normal click movement reaches castle gate from floor spawn and descends again',()=>{
 for(const seed of [1,42,217021]){
  const w=installCastle(awakenTower(sharedFloor(seed,3))),game=new Game(w),gate=w.castle.entrance;
  assert.ok(game.moveTo(gate));
  for(let i=0;i<18000&&game.path.length;i++)game.update(1/30,{x:0,z:0},0);
  assert.equal(game.player.surface,gate.surface);assert.ok(Math.hypot(game.player.x-gate.x,game.player.z-gate.z)<.1);
  assert.equal(new InteractionSystem(w,w.interactables).activate(game.player)?.targetId,'castle-entry');
  assert.ok(game.moveTo(w.spawn));
  for(let i=0;i<18000&&game.path.length;i++)game.update(1/30,{x:0,z:0},0);
  assert.equal(game.player.surface,'ground');assert.ok(Math.hypot(game.player.x-w.spawn.x,game.player.z-w.spawn.z)<.1);
 }
});

test('passage kills survive save, remain character-owned and preserve previous unlocks',()=>{
 const c=new Character(),other=new Character();
 for(let i=0;i<3;i++)creditPassageKill(c.data,1);
 const restored=decodeSave(encodeSave(c.snapshot(),1));
 assert.equal(passageStatus(restored,1).open,true);
 assert.equal(passageStatus(other.data,1).open,false);
 assert.equal(passageStatus(other.data,1,{legacyReached:2}).open,true);
 assert.equal(passageStatus(c.data,3).open,false);
 assert.equal(passageStatus(c.data,3,{guardian:true}).open,true);
 const invalid=c.snapshot();invalid.tower.kills[1]=-1;
 assert.throws(()=>decodeSave(encodeSave(invalid,1)));
});

test('castle visits do not respawn local enemies or award their XP twice in one run',()=>{
 const c=new Character(),s=new AreaSession(createAreas({id:'refuge'}),c,{seed:42});
 s.startRun();s.enter('tower-floor-3');
 const enemy=s.combat.enemies[0];enemy.damage(100000);s.update(.05,{x:0,z:0},0);
 const xp=c.data.xp,level=c.data.level;
 s.travel({targetId:'castle-entry'});s.travel({targetId:'castle-exit'});
 assert.equal(s.combat.enemies.find(e=>e.id===enemy.id).alive,false);
 s.update(.05,{x:0,z:0},0);assert.equal(c.data.xp,xp);assert.equal(c.data.level,level);
 s.startRun();s.enter('tower-floor-3');assert.equal(s.combat.enemies.find(e=>e.id===enemy.id).alive,true);
});

test('local castle is freely accessible, uses shared knight controller and unlocks floor four only on victory',async()=>{
 const c=new Character(),s=new AreaSession(createAreas({id:'test-refuge'}),c,{seed:42});
 new Inventory(c).acquire('trainingSword');new Inventory(c).equip(0);c.data.tower.highestClearedFloor=2;
 s.startRun();s.enter('tower-floor-3');assert.equal(s.complete,false);
 const entry=s.area.interactables.find(i=>i.id==='castle-entry');Object.assign(s.game.player,entry);
 s.travel({targetId:entry.id});assert.equal(s.area.environment,'castle');assert.equal(c.data.level,1);
 Object.assign(s.game.player,s.area.guardianHall.door);s.enterGuardian();assert.equal(s.boss.enemyType,'oathKnight');
 for(let i=0;i<55;i++)s.update(.05,{x:0,z:0},0);
 assert.equal(s.combat.guardian.state,'active');assert.equal(s.complete,false);
 s.boss.damage(100000);s.update(.05,{x:0,z:0},0);assert.equal(s.complete,true);assert.equal(c.data.tower.highestClearedFloor,3);
 const chest=s.area.interactables.find(i=>i.id==='boss-chest');Object.assign(s.game.player,chest);await s.collectChest(async()=>{});
 s.travel({targetId:'arena-exit'});s.travel({targetId:'castle-exit'});assert.equal(s.area.id,'tower-floor-3');assert.equal(s.complete,true);
 s.travel({targetId:'return-portal'});assert.equal(s.area.floorId,4);
});

test('castle composition preserves persisted geography and exposes reachable open gate',()=>{
 for(const seed of [1,42,217021]){
  const source=sharedFloor(seed,3),before=JSON.stringify(source),w=installCastle(awakenTower(source)),entry=w.interactables.find(i=>i.id==='castle-entry'),r=w.surfaces.find(s=>s.id===w.awakening.fortress.ramp);
  assert.equal(JSON.stringify(source),before);assert.equal(entry.content.areaId,CASTLE_ID);assert.equal(entry.content.requiresCompletion,undefined);
  assert.ok(findPath(layerWorld(w,'ground'),w.spawn,{x:r.x,z:r.z-r.halfZ-1},.32));
  assert.ok(findPath(layerWorld(w,entry.surface),{x:r.x,z:r.z+r.halfZ+.5},entry,.32));
  assert.equal(new InteractionSystem(w,w.interactables).activate({...entry,heading:0}).targetId,'castle-entry');
  assert.equal(installCastle(w),w);
 }
});
test('castle interior is traversable without kills, contains valid enemies and a distinct arena door',()=>{
 const w=castleInterior(installCastle(awakenTower(sharedFloor(217021,3))));
 validateHub(w);assert.equal(createEnemies(w.enemySpawns,w).length,6);
 assert.ok(findPath(w,w.spawn,w.guardianHall.door,.32));
 assert.equal(w.interactables.find(i=>i.action==='travel').content.areaId,'shared-floor-3');
 assert.equal(new InteractionSystem(w,w.interactables).activate({...w.guardianHall.door,heading:0}).type,'guardian');
 assert.ok(decodeOnline(JSON.stringify({v:4,type:'world:input',mapId:CASTLE_ID,epoch:'1'.repeat(36),seq:1,action:{kind:'stop'}})));
});
