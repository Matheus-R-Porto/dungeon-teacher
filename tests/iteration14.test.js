import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Character} from '../src/domain/character/character.js';
import {Inventory,equippedDefinition} from '../src/domain/items/inventory.js';
import {EXPEDITION as E,TOWER_LIMIT,POST_THREE,floorScale} from '../src/domain/expedition.js';
import {emptyTower,decodeTower,markFloorCleared,claimReward,rewardClaimed,TOWER_REWARDS} from '../src/domain/tower-progress.js';
import {biomeSequence,environmentFor,advanceBiome,transitionChance,initialBiomeState,transitionTargets,BIOME_RULES,environmentRecord} from '../src/world/biomes.js';
import {generateFloor} from '../src/world/tower.js';
import {canStand} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {decodeSave,encodeSave} from '../src/adapters/persistence/character-save.js';
const hub=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url)));
const run=(s,n)=>{for(let i=0;i<n*30;i++)s.update(1/30,{x:0,z:0},0);};
const clear=s=>{s.combat.retaliation=false;for(const e of s.combat.enemies.filter(e=>!e.dormant))e.damage(9999);run(s,.1);};
const seedWhere=(predicate,limit=500)=>{for(let seed=0;seed<limit;seed++)if(predicate(biomeSequence(seed,8)))return seed;throw Error('no seed found');};
const SEED_FOREST3=seedWhere(q=>q[2].environment.type==='FOREST'),SEED_CAVE3=seedWhere(q=>q[2].environment.type==='FOREST_TO_CAVE');
function make({seed=42,character=new Character(),stress=false,tower}={}){
  const calls=[],messages=[];if(tower)character.data.tower=structuredClone(tower);
  const s=new AreaSession(createAreas(hub),character,{seed,stress,notify:m=>messages.push(m),onFloorCleared:n=>calls.push(n)});
  if(!equippedDefinition(character.data)){const bag=new Inventory(character);bag.acquire('trainingStaff');bag.equip(0);}
  s.startRun();return {s,c:character,calls,messages};
}
const up=s=>s.travel({targetId:'return-portal'});
// Plays floors 1 and 2, then floor 3 up to the dead boss standing on its chest.
function toBossDefeated(x){const {s}=x;clear(s);up(s);clear(s);up(s);assert.equal(s.area.floorId,3);clear(s);Object.assign(s.game.player,s.boss.spawnPosition);run(s,2.1);s.boss.damage(9999);run(s,.1);return x;}
const standOnChest=s=>Object.assign(s.game.player,s.area.interactables.find(i=>i.id==='boss-chest'));

// ───────────── Biome rules ─────────────
test('rule tables are exactly the specified probabilities and the index clamps to a guarantee',()=>{
  assert.deepEqual([...BIOME_RULES.firstTransitionChances],[0,0,.5,.75,1]);assert.deepEqual([...BIOME_RULES.recurringTransitionChances],[0,.1,.5,.75,1]);
  const first=n=>transitionChance({currentBiome:'FOREST',pureFloors:n,transitions:0}),again=n=>transitionChance({currentBiome:'CAVE',pureFloors:n,transitions:1});
  assert.deepEqual([0,1,2,3,4,5,40].map(first),[0,0,.5,.75,1,1,1]);assert.deepEqual([0,1,2,3,4,5,40].map(again),[0,.1,.5,.75,1,1,1]);
  assert.deepEqual(initialBiomeState(),{currentBiome:'FOREST',pureFloors:0,transitions:0});
});
test('floors 1 and 2 are always Forest and the first possible transition is floor 3',()=>{
  for(let seed=0;seed<600;seed++){const q=biomeSequence(seed,3);assert.equal(q[0].environment.type,'FOREST');assert.equal(q[1].environment.type,'FOREST');assert.ok(['FOREST','FOREST_TO_CAVE'].includes(q[2].environment.type));}
  assert.equal(environmentFor(1234,1).type,'FOREST');assert.equal(environmentFor(1234,2).type,'FOREST');
});
test('first transition follows 50% at floor 3, 75% at floor 4 and is guaranteed by floor 5 (sampled with tolerance)',()=>{
  let at3=0,reach4=0,at4=0;const N=4000;
  for(let seed=0;seed<N;seed++){
    const q=biomeSequence(seed,6),index=q.findIndex(r=>r.environment.transitionDirection);
    assert.ok(index>=2&&index<=4,'first transition at floor '+(index+1));
    if(index===2)at3++;else{reach4++;if(index===3)at4++;}
  }
  assert.ok(Math.abs(at3/N-.5)<.04,'floor 3 rate '+at3/N);assert.ok(Math.abs(at4/reach4-.75)<.05,'floor 4 conditional rate '+at4/reach4);
});
test('recurring cycle: the floor after a transition is pure, then 10% -> 50% -> 75% -> 100% (sampled with tolerance)',()=>{
  const gaps=[];
  for(let seed=0;seed<2500;seed++){const t=biomeSequence(seed,50).filter(r=>r.environment.transitionDirection).map(r=>r.floorNumber);for(let i=1;i<t.length;i++)gaps.push(t[i]-t[i-1]);}
  assert.ok(gaps.length>10000);assert.ok(Math.min(...gaps)>=2,'two transitions in a row or no pure floor between them');assert.ok(Math.max(...gaps)<=5);
  const share=(pool,value)=>pool.filter(g=>g===value).length/pool.length,over=n=>gaps.filter(g=>g>n);
  assert.ok(Math.abs(share(gaps,2)-.1)<.02,'gap 2 '+share(gaps,2));assert.ok(Math.abs(share(over(2),3)-.5)<.03,'gap 3 '+share(over(2),3));assert.ok(Math.abs(share(over(3),4)-.75)<.03,'gap 4 '+share(over(3),4));assert.equal(share(over(4),5),1);
});
test('every transition has the right direction, leaves the right biome and is followed by a pure floor of its destination',()=>{
  for(let seed=0;seed<300;seed++){
    const q=biomeSequence(seed,50);let state=initialBiomeState();
    q.forEach((r,i)=>{
      const e=r.environment;assert.deepEqual(r.before,state);assert.equal(e.from,state.currentBiome);
      if(e.transitionDirection){
        assert.equal(e.type,state.currentBiome==='FOREST'?'FOREST_TO_CAVE':'CAVE_TO_FOREST');
        const next=q[i+1];if(next){assert.equal(next.environment.transitionDirection,null);assert.equal(next.environment.type,e.to);}
      }else assert.equal(e.type,state.currentBiome);
      state=advanceBiome(state,e.type);assert.deepEqual(state,r.nextBiomeState);
    });
  }
});
test('illegal steps are rejected: wrong direction, transitions at 0%, staying at 100% and back-to-back transitions',()=>{
  const fresh=initialBiomeState();
  for(const type of ['CAVE','CAVE_TO_FOREST'])assert.throws(()=>advanceBiome(fresh,type),/incompat/i);
  assert.throws(()=>advanceBiome(fresh,'FOREST_TO_CAVE'),/não permitida/);                       // floor 1: 0%
  const floor2=advanceBiome(fresh,'FOREST');assert.throws(()=>advanceBiome(floor2,'FOREST_TO_CAVE'),/não permitida/); // floor 2: 0%
  const floor3=advanceBiome(floor2,'FOREST');assert.equal(advanceBiome(floor3,'FOREST_TO_CAVE').transitions,1);assert.equal(advanceBiome(floor3,'FOREST').pureFloors,3);
  const forced={currentBiome:'FOREST',pureFloors:4,transitions:0};assert.throws(()=>advanceBiome(forced,'FOREST'),/obrigatória/);
  const after=advanceBiome(floor3,'FOREST_TO_CAVE');assert.throws(()=>advanceBiome(after,'CAVE_TO_FOREST'),/incompat|não permitida/);assert.throws(()=>advanceBiome(after,'FOREST_TO_CAVE'),/incompat/);
  const recurring={currentBiome:'CAVE',pureFloors:1,transitions:1};assert.equal(advanceBiome(recurring,'CAVE_TO_FOREST').currentBiome,'FOREST');assert.throws(()=>advanceBiome({...recurring,pureFloors:0},'CAVE_TO_FOREST'),/não permitida/);
  assert.throws(()=>environmentRecord('UNKNOWN'));assert.throws(()=>environmentRecord('__proto__'));assert.throws(()=>biomeSequence(1,0));
});
test('when and where are separate decisions and only Forest and Cave are reachable today',()=>{
  assert.deepEqual(transitionTargets('FOREST'),['FOREST_TO_CAVE']);assert.deepEqual(transitionTargets('CAVE'),['CAVE_TO_FOREST']);assert.deepEqual(transitionTargets('RUINS'),[]);
  const seen=new Set();for(let seed=0;seed<200;seed++)for(const r of biomeSequence(seed,50))seen.add(r.environment.type);assert.deepEqual([...seen].sort(),['CAVE','CAVE_TO_FOREST','FOREST','FOREST_TO_CAVE']);
});
test('the biome sequence is deterministic per seed and independent of floor generation',()=>{
  for(const seed of [0,1,42,99,2105391735]){const a=biomeSequence(seed,50);assert.deepEqual(a,biomeSequence(seed,50));for(const f of [1,3,7,20,50])assert.deepEqual(environmentFor(seed,f),a[f-1].environment);}
  const before=biomeSequence(42,50);generateFloor(42,4,'hub',{environment:'CAVE'});generateFloor(42,3,'hub');assert.deepEqual(biomeSequence(42,50),before);
});
test('layout, encounters and landmarks of every environment are byte-identical to the Iteration 13 generator',()=>{
  const baseline=JSON.parse(fs.readFileSync(new URL('./iteration14-layout-baseline.json',import.meta.url)));assert.ok(baseline.length>=12);
  for(const {seed,type,hash}of baseline){const w=generateFloor(seed,3,'hub',{environment:type}),content={graph:w.graph,trails:w.trails,enemySpawns:w.enemySpawns,pois:w.pois,gates:w.gates,mineralVeins:w.mineralVeins,obstacles:w.obstacles.filter(o=>o.kind!=='refuge')};assert.equal(createHash('sha256').update(JSON.stringify(content)).digest('hex'),hash,type+' seed '+seed);}
});
test('floor 3 keeps its boss and its role whatever its biome, and its exits keep both ways usable',()=>{
  const kinds=new Set();
  for(let seed=0;seed<80;seed++){
    const w=generateFloor(seed,3,'hub');kinds.add(w.floorEnvironment.type);
    assert.equal(w.floorRole,'boss');assert.equal(w.enemySpawns.filter(e=>e.overrides.boss).length,1);assert.equal(w.graph.regions.at(w.graph.mainPath.length-1).type,'boss');
    const exit=w.graph.regions.find(r=>r.id===w.graph.exit),travel=w.interactables.filter(i=>i.action==='travel');
    assert.deepEqual(travel.map(i=>i.id+'>'+i.content.areaId).sort(),['abandon-run>hub','refuge-portal>hub','return-portal>tower-floor-4']);
    assert.ok(canStand(w,w.refugePortal.x,w.refugePortal.z,.85)&&findPath(w,exit,w.refugePortal,.85));assert.ok(Math.hypot(w.refugePortal.x-w.portal.x,w.refugePortal.z-w.portal.z)>3);
  }
  assert.deepEqual([...kinds].sort(),['FOREST','FOREST_TO_CAVE']);
});

// ───────────── Provisional balance after floor 3 ─────────────
test('enemy growth past floor 3 is gentle, monotonic, capped at the tower limit and untouched up to floor 3',()=>{
  assert.equal(TOWER_LIMIT,50);assert.equal(floorScale(1,.03),1);assert.equal(floorScale(3,.03),1);assert.ok(Math.abs(floorScale(4,.03)-1.03)<1e-12);assert.equal(floorScale(80,.03),floorScale(50,.03));
  const stat=f=>{const w=generateFloor(7,f,'hub',{environment:'FOREST',floorRole:'normal'}),o=w.enemySpawns[0].overrides;return {hp:o.stats.maxHP,attack:o.stats.physicalAttack,xp:o.rewardXP,base:Math.round(E.hp[Math.min(f,3)-1]*w.encounter[0].hpScale)};};
  const three=stat(3);assert.equal(three.hp,three.base);assert.equal(three.attack,E.attack[2]);assert.equal(three.xp,E.xp[2]);
  let previous=three;for(let f=4;f<=50;f++){const now=stat(f);assert.ok(now.hp>=previous.hp&&now.attack>=previous.attack&&now.xp>=previous.xp);assert.ok(Number.isSafeInteger(now.xp)&&Number.isSafeInteger(now.hp)&&Number.isSafeInteger(now.attack));previous=now;}
  const last=stat(50);assert.ok(last.hp/three.hp<3.5&&last.attack/three.attack<2.5&&last.xp/three.xp<2.5);assert.ok(POST_THREE.hp>0&&POST_THREE.attack>0&&POST_THREE.xp>0);
});

// ───────────── Save and persistence ─────────────
test('tower progress starts empty, round-trips and validates strictly',()=>{
  const c=new Character();assert.deepEqual(c.data.tower,emptyTower());
  c.data.tower={highestClearedFloor:12,claimedRewards:['boss-floor-3']};assert.deepEqual(decodeSave(encodeSave(c.snapshot(),1)).tower,c.data.tower);
  for(const bad of [null,[],{highestClearedFloor:-1},{highestClearedFloor:51},{highestClearedFloor:1.5},{highestClearedFloor:'3'},{claimedRewards:['unknown']},{claimedRewards:'boss-floor-3'},{claimedRewards:['__proto__']}])assert.throws(()=>decodeTower(bad),undefined,JSON.stringify(bad));
  assert.deepEqual(decodeTower({highestClearedFloor:1,claimedRewards:['boss-floor-3','boss-floor-3']}),{highestClearedFloor:3,claimedRewards:['boss-floor-3']});
});
test('older saves keep everything and never infer a clear from level, items or chests',()=>{
  const c=new Character();c.data.gold=321;c.data.level=40;c.data.xp=5;c.data.lifeSkills.mining={level:3,xp:4};c.data.lifeSkills.fishing={level:2,xp:1};const bag=new Inventory(c);bag.acquire('trainingStaff');bag.equip(0);bag.acquire('expeditionChest',{rewardSeed:5});bag.acquire('simplePickaxe');
  const old=c.snapshot();delete old.tower;const loaded=decodeSave(encodeSave(old,1));
  assert.deepEqual(loaded.tower,emptyTower());assert.equal(loaded.gold,321);assert.equal(loaded.level,40);assert.deepEqual(loaded.lifeSkills,c.data.lifeSkills);assert.deepEqual(loaded.inventory,c.data.inventory);assert.deepEqual(loaded.equipment,c.data.equipment);
});
test('markers only advance in order, never beyond the limit, and unique rewards cannot be claimed twice',()=>{
  const d=new Character().data;assert.equal(markFloorCleared(d,2),false);assert.equal(markFloorCleared(d,1),true);assert.equal(markFloorCleared(d,1),false);assert.equal(markFloorCleared(d,2),true);assert.equal(d.tower.highestClearedFloor,2);
  for(const bad of [0,-1,1.5,NaN,51,null])assert.equal(markFloorCleared(d,bad),false);d.tower.highestClearedFloor=49;assert.equal(markFloorCleared(d,50),true);assert.equal(markFloorCleared(d,51),false);
  assert.equal(rewardClaimed(d,'boss-floor-3'),false);claimReward(d,'boss-floor-3');assert.equal(rewardClaimed(d,'boss-floor-3'),true);assert.throws(()=>claimReward(d,'boss-floor-3'),/já/);assert.throws(()=>claimReward(d,'nope'),/desconhecida/);assert.deepEqual(Object.keys(TOWER_REWARDS),['boss-floor-3']);
});

// ───────────── Campaign progression ─────────────
for(const [label,seed] of [['Forest floor 3',SEED_FOREST3],['Forest→Cave floor 3',SEED_CAVE3]])test(label+': the boss can be followed by continuing to floor 4 or by returning, never automatically',async()=>{
  const x=toBossDefeated(make({seed})),{s,c}=x;assert.equal(s.run.mode,'campaign');
  assert.throws(()=>up(s),/baú/);assert.throws(()=>s.travel({targetId:'refuge-portal'}),/baú/);
  standOnChest(s);await s.collectChest(async()=>{});assert.equal(s.area.floorId,3);assert.equal(s.run.rewardCollected,true);
  run(s,3);assert.equal(s.area.floorId,3,'floor 4 must wait for the player');assert.equal(s.areas['tower-floor-4'],undefined);
  const chests=()=>c.data.inventory.slots.filter(i=>i?.definitionId==='expeditionChest').length;assert.equal(chests(),1);
  up(s);assert.equal(s.area.safe,false);assert.equal(s.area.floorId,4);assert.equal(s.area.floorRole,'normal');assert.ok(s.run);assert.equal(s.area.floorEnvironment.type,environmentFor(seed,4).type);assert.equal(chests(),1);
  assert.equal(c.data.tower.highestClearedFloor,3);assert.deepEqual(x.calls,[1,2,3]);
  // the boss flags belong to floor 3 only: floor 4 must not look like a won boss floor
  assert.equal(s.run.bossDefeated,false);assert.equal(s.run.rewardCollected,false);assert.equal(s.run.bossStarted,false);assert.doesNotMatch(s.objectiveText,/baú|Guardião/i);
});
test('returning to the Refuge after the boss ends the run, keeps the clear and the single chest',async()=>{
  const x=toBossDefeated(make({seed:SEED_FOREST3})),{s,c}=x;standOnChest(s);await s.collectChest(async()=>{});
  s.travel({targetId:'refuge-portal'});assert.equal(s.area.safe,true);assert.equal(s.run,null);assert.equal(s.lastRun.result,'success');assert.equal(c.data.tower.highestClearedFloor,3);assert.equal(c.data.inventory.slots.filter(i=>i?.definitionId==='expeditionChest').length,1);
});
test('both exits of floor 3 stay sealed until the boss is dead, and the main portal is a normal climb on other floors',()=>{
  const {s}=make({seed:SEED_FOREST3});assert.throws(()=>up(s),/encontros/);clear(s);up(s);assert.equal(s.area.floorId,2);assert.equal(s.area.interactables.some(i=>i.id==='refuge-portal'),false);clear(s);up(s);
  assert.throws(()=>s.travel({targetId:'refuge-portal'}),/encontros/);assert.throws(()=>up(s),/encontros/);clear(s);assert.equal(s.complete,false);assert.throws(()=>s.travel({targetId:'refuge-portal'}),/encontros/);
});
test('floors become cleared only through valid campaign completion',()=>{
  const x=make({seed:42}),{s,c,calls}=x;assert.equal(c.data.tower.highestClearedFloor,0);run(s,5);assert.equal(c.data.tower.highestClearedFloor,0);                       // entering is not clearing
  Object.assign(s.game.player,s.area.portal);run(s,1);assert.equal(c.data.tower.highestClearedFloor,0);assert.throws(()=>up(s));                                          // teleporting is not clearing
  s.combat.retaliation=false;const enemy=s.combat.enemies.find(e=>!e.optional&&!e.boss);enemy.damage(9999);run(s,.1);assert.equal(c.data.tower.highestClearedFloor,0);          // partial progress is not clearing
  clear(s);assert.equal(c.data.tower.highestClearedFloor,1);assert.deepEqual(calls,[1]);assert.match(x.messages.at(-1),/ANDAR 1 CONCLUÍDO/);
  up(s);clear(s);assert.equal(c.data.tower.highestClearedFloor,2);
});
test('abandoning a floor, dying on it or finishing a run without clearing leave the marker alone',()=>{
  const a=make({seed:42});a.s.travel({targetId:'abandon-run'});assert.equal(a.c.data.tower.highestClearedFloor,0);
  const b=make({seed:42});b.c.damage(99999);run(b.s,3.5);assert.equal(b.s.run,null);assert.equal(b.c.data.tower.highestClearedFloor,0);assert.deepEqual(b.calls,[]);
  const c=make({seed:42});clear(c.s);up(c.s);c.c.damage(99999);run(c.s,3.5);assert.equal(c.c.data.tower.highestClearedFloor,1,'floor 1 was cleared before dying on floor 2');
});
test('the persistent marker survives a save and reload and can be re-saved at the callback',async()=>{
  const x=make({seed:42});let saved;x.s.onFloorCleared=()=>{saved=structuredClone(x.c.snapshot());};clear(x.s);
  assert.equal(saved.tower.highestClearedFloor,1);const loaded=new Character(decodeSave(encodeSave(saved,1)));assert.equal(loaded.data.tower.highestClearedFloor,1);
});

// ───────────── Revisits ─────────────
test('cleared floors open their gates, keep every enemy alive and never block the exit',()=>{
  const fresh=make({seed:42}),revisit=make({seed:42,tower:{highestClearedFloor:2,claimedRewards:[]}});
  assert.ok(fresh.s.area.gates.length>0&&fresh.s.area.gates.every(g=>!g.open));assert.equal(fresh.s.complete,false);
  const {s}=revisit;assert.ok(s.area.gates.length>0&&s.area.gates.every(g=>g.open));assert.equal(s.revisit,true);assert.equal(s.complete,true);
  assert.equal(s.combat.enemies.length,fresh.s.combat.enemies.length);assert.ok(s.combat.enemies.every(e=>e.alive));assert.ok(s.combat.ai);assert.ok(s.run.encounters.every(e=>e.state==='completed'));
  assert.match(s.objectiveText,/já concluído/);run(s,.1);assert.match(s.returnInteraction.label,/Subir/);
  up(s);assert.equal(s.area.floorId,2);assert.ok(s.area.gates.every(g=>g.open));assert.ok(s.combat.enemies.every(e=>e.alive));
  up(s);assert.equal(s.area.floorId,3);assert.equal(s.revisit,false);assert.ok(s.area.gates.every(g=>!g.open),'floor 3 was never cleared');assert.equal(s.complete,false);
});
test('enemies on a revisited floor still fight, still pay XP and can still be ignored',()=>{
  const {s,c}=make({seed:42,tower:{highestClearedFloor:1,claimedRewards:[]}});const xp=c.data.xp,enemy=s.combat.enemies.find(e=>!e.optional&&!e.boss);
  assert.ok(s.combat.ai&&enemy.alive);enemy.damage(9999);run(s,.1);assert.ok(c.data.xp>xp,'XP is still granted');assert.ok(s.combat.enemies.some(e=>e.alive));
  s.combat.retaliation=true;const target=s.combat.enemies.find(e=>e.alive);target.damage(1);assert.ok(target.hp<target.stats.maxHP);
  assert.equal(c.isAlive,true);
});
test('a cleared floor 3 has no boss, no duplicate chest and a free exit; floor 4 still demands its encounters',()=>{
  const {s,c}=make({seed:SEED_FOREST3,tower:{highestClearedFloor:3,claimedRewards:['boss-floor-3']}});up(s);up(s);
  assert.equal(s.area.floorId,3);assert.equal(s.revisit,true);assert.equal(s.boss,undefined);assert.ok(!s.combat.enemies.some(e=>e.boss));assert.equal(s.area.interactables.some(i=>i.id==='boss-chest'),false);assert.equal(s.complete,true);
  const before=c.data.inventory.slots.filter(i=>i?.definitionId==='expeditionChest').length;run(s,5);assert.equal(c.data.inventory.slots.filter(i=>i?.definitionId==='expeditionChest').length,before);
  assert.ok(s.area.gates.every(g=>g.open));up(s);assert.equal(s.area.floorId,4);assert.equal(s.revisit,false);assert.ok(s.area.gates.every(g=>!g.open));assert.equal(s.complete,false);assert.throws(()=>up(s),/encontros/);
});
test('a floor 3 cleared without taking the chest still offers it exactly once',async()=>{
  const x=make({seed:SEED_FOREST3,tower:{highestClearedFloor:3,claimedRewards:[]}}),{s,c}=x;up(s);up(s);
  const chest=s.area.interactables.find(i=>i.id==='boss-chest');assert.ok(chest&&chest.enabled);assert.equal(s.boss,undefined);assert.throws(()=>up(s),/baú/);
  Object.assign(s.game.player,chest);await s.collectChest(async()=>{});assert.equal(c.data.tower.claimedRewards.length,1);assert.equal(c.data.inventory.slots.filter(i=>i?.definitionId==='expeditionChest').length,1);
  await assert.rejects(()=>s.collectChest(async()=>{}));up(s);assert.equal(s.area.floorId,4);
});
test('the unique boss reward is granted once per character across runs and rolls back with a failed save',async()=>{
  const x=toBossDefeated(make({seed:SEED_FOREST3})),{s,c}=x;standOnChest(s);
  await assert.rejects(()=>s.collectChest(async()=>{throw Error('disk failure');}));assert.deepEqual(c.data.tower.claimedRewards,[]);assert.equal(c.data.inventory.slots.filter(i=>i?.definitionId==='expeditionChest').length,0);assert.equal(s.run.rewardCollected,false);
  await s.collectChest(async()=>{});assert.deepEqual(c.data.tower.claimedRewards,['boss-floor-3']);s.travel({targetId:'refuge-portal'});
  // second run, same character: floors 1-3 are free to cross and nothing drops again
  s.startRun();for(let i=0;i<3;i++){assert.equal(s.revisit,true);up(s);}assert.equal(s.area.floorId,4);
  s.travel({targetId:'abandon-run'});assert.equal(c.data.inventory.slots.filter(i=>i?.definitionId==='expeditionChest').length,1);
});
test('Fishing and Mining stay available on revisited floors',()=>{
  const {s,c}=make({seed:42,tower:{highestClearedFloor:1,claimedRewards:[]}});new Inventory(c).acquire('fishingRod');const spot=s.area.fishingSpots[0];assert.ok(spot);
  Object.assign(s.game.player,spot);s.game.previous={...s.game.player};assert.equal(s.fishing.start(spot.id),true);s.fishing.cancel();
});

// ───────────── Explorar biomas and debug isolation ─────────────
test('the biome explorer never advances campaign progress or claims rewards',()=>{
  for(const type of ['FOREST','FOREST_TO_CAVE','CAVE','CAVE_TO_FOREST']){
    const calls=[],c=new Character(),bag=new Inventory(c);bag.acquire('trainingStaff');bag.equip(0);const s=new AreaSession(createAreas(hub),c,{seed:42,onFloorCleared:n=>calls.push(n)});
    s.startBiomePlaytest(type);assert.equal(s.run.mode,'biome-playtest');assert.equal(s.area.floorEnvironment.type,type);
    clear(s);assert.equal(s.complete,true);up(s);clear(s);up(s);
    assert.deepEqual(c.data.tower,emptyTower());assert.deepEqual(calls,[]);assert.equal(s.recordClear(),false);assert.equal(s.revisit,false);
  }
});
test('the explorer does not treat floors as revisits even for a character that cleared the campaign',()=>{
  const c=new Character();c.data.tower={highestClearedFloor:40,claimedRewards:['boss-floor-3']};const bag=new Inventory(c);bag.acquire('trainingStaff');bag.equip(0);
  const s=new AreaSession(createAreas(hub),c,{seed:42});s.startBiomePlaytest('CAVE');assert.equal(s.revisit,false);assert.ok(s.area.gates.every(g=>!g.open));assert.equal(s.complete,false);
});
test('stress mode and simple floor entry never record progress',()=>{
  const x=make({seed:42,stress:true});clear(x.s);assert.equal(x.s.complete,true);assert.equal(x.c.data.tower.highestClearedFloor,0);assert.deepEqual(x.calls,[]);
});

// ───────────── Tower limit ─────────────
test('floor 50 ends the campaign safely and explicitly, with no floor 51 and no false final boss',()=>{
  const x=make({seed:42}),{s,c}=x;c.data.tower.highestClearedFloor=49;
  const world=generateFloor(s.run.seed,TOWER_LIMIT,s.hubId,{floorRole:'normal'});assert.equal(world.towerLimit,true);assert.ok(!world.enemySpawns.some(e=>e.overrides.boss));assert.equal(world.floorRole,'normal');
  s.areas[world.id]=world;s.enter(world.id);assert.equal(s.area.floorId,50);clear(s);assert.equal(c.data.tower.highestClearedFloor,50);assert.match(s.returnInteraction.label,/limite/);
  up(s);assert.equal(s.area.safe,true);assert.equal(s.run,null);assert.match(x.messages.at(-1),/limite atual da Torre/);assert.equal(s.areas['tower-floor-51'],undefined);
  assert.equal(markFloorCleared(c.data,51),false);assert.throws(()=>decodeTower({highestClearedFloor:51}));assert.equal(generateFloor(1,49,'hub').towerLimit,false);
});
test('a long climb can be generated on demand floor by floor up to the limit',()=>{
  const {s,c}=make({seed:SEED_FOREST3});c.data.tower.highestClearedFloor=0;let floors=[];
  for(let f=4;f<=8;f++){const w=generateFloor(s.run.seed,f,s.hubId,{floorRole:'normal'});s.areas[w.id]=w;floors.push(w.floorEnvironment.type);}
  assert.deepEqual(floors,[4,5,6,7,8].map(f=>environmentFor(s.run.seed,f).type));
});

// ───────────── Mining reaches the normal campaign ─────────────
test('the normal campaign reaches caves and veins can be mined without the biome explorer',()=>{
  const x=make({seed:SEED_CAVE3}),{s,c}=x;assert.equal(s.areas['tower-floor-3'].floorEnvironment.type,'FOREST_TO_CAVE');assert.ok(s.areas['tower-floor-3'].mineralVeins.length>=1,'underground part of the transition has veins');
  assert.equal(environmentFor(SEED_CAVE3,4).type,'CAVE');
  toBossDefeated(x);standOnChest(s);return s.collectChest(async()=>{}).then(()=>{
    up(s);assert.equal(s.area.floorId,4);assert.equal(s.area.floorEnvironment.type,'CAVE');assert.ok(s.area.mineralVeins.length>=1);
    new Inventory(c).acquire('simplePickaxe');const vein=s.area.mineralVeins[0],region=s.area.graph.regions.find(r=>r.id===vein.regionId),d=Math.hypot(region.x-vein.x,region.z-vein.z)||1;
    Object.assign(s.game.player,{x:vein.x+(region.x-vein.x)/d*2.2,z:vein.z+(region.z-vein.z)/d*2.2});s.game.previous={...s.game.player};
    assert.equal(s.mining.start(vein.id),true);assert.equal(c.data.tower.highestClearedFloor,3);
  });
});
test('the mining result banner data reports MISS, GOOD and PERFECT with their XP',async()=>{
  const x=make({seed:SEED_CAVE3});const s=new AreaSession(createAreas(hub),new Character(),{seed:42});const c=s.combat.character,bag=new Inventory(c);bag.acquire('trainingStaff');bag.equip(0);bag.acquire('simplePickaxe');s.startBiomePlaytest('CAVE');
  const m=s.mining;const go=async index=>{const vein=s.area.mineralVeins[index],region=s.area.graph.regions.find(r=>r.id===vein.regionId),d=Math.hypot(region.x-vein.x,region.z-vein.z)||1;Object.assign(s.game.player,{x:vein.x+(region.x-vein.x)/d*2.2,z:vein.z+(region.z-vein.z)/d*2.2});s.game.previous={...s.game.player};m.start(vein.id);m.update(m.strikeAt-m.time+.01);return vein;};
  assert.equal(m.result,null);
  await go(0);m.time=m.strikeAt+(m.center>.5?m.center-.2:m.center+.2)*m.config.sweepSeconds;assert.equal(await m.strike(),false);assert.deepEqual({kind:m.result.kind,xp:m.result.xp,text:m.result.text},{kind:'MISS',xp:0,text:'ERROU!'});const missId=m.result.id;
  m.update(10);await go(0);m.time=m.strikeAt+(m.center+.08)*m.config.sweepSeconds;assert.equal(await m.strike(),true);assert.deepEqual({kind:m.result.kind,xp:m.result.xp,text:m.result.text},{kind:'GOOD',xp:8,text:'BOM!'});assert.ok(m.result.id>missId);
  await go(1);m.time=m.strikeAt+m.center*m.config.sweepSeconds;assert.equal(await m.strike(),true);assert.deepEqual({kind:m.result.kind,xp:m.result.xp,text:m.result.text},{kind:'PERFECT',xp:12,text:'PERFEITO!'});
  assert.equal(c.data.lifeSkills.mining.xp,20);
});
