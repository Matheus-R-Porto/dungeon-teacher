import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {biomeSequence,advanceBiome,environmentRecord,caveAt,BIOME_RULES} from '../src/world/biomes.js';
import {generateFloorGraph,validateFloorGraph} from '../src/world/floor-graph.js';
import {generateFloor} from '../src/world/tower.js';
import {canStand} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {Game} from '../src/simulation/game.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
const types=['FOREST','FOREST_TO_CAVE','CAVE','CAVE_TO_FOREST'];

test('100 seeds x 50 floors: legal transitions, dwell bounds, determinism and complete graph generation',()=>{
 const lengths=new Set(),seen=new Set();
 for(let seed=0;seed<100;seed++){
  const sequence=biomeSequence(seed,50);assert.deepEqual(sequence,biomeSequence(seed,50));
  let state={currentBiome:'FOREST',pureFloors:0};
  for(const record of sequence){
   assert.deepEqual(record.before,state);const e=record.environment;seen.add(e.type);
   assert.equal(e.from,state.currentBiome);
   if(e.transitionDirection){assert.ok(state.pureFloors>=3&&state.pureFloors<=7);lengths.add(state.pureFloors);}
   state=advanceBiome(state,e.type);assert.deepEqual(state,record.nextBiomeState);
   const graph=generateFloorGraph(seed,record.floorNumber);validateFloorGraph(graph);
   assert.deepEqual(graph,generateFloorGraph(seed,record.floorNumber));
  }
  assert.deepEqual(sequence.slice(0,3).map(r=>r.environment.type),['FOREST','FOREST','FOREST']);
 }
 assert.equal(seen.size,4);assert.ok(lengths.size>=4);assert.equal(BIOME_RULES.maximumPureFloors,7);
});
test('invalid environmental jumps, premature transitions and excessive dwell are rejected',()=>{
 for(const currentBiome of ['FOREST','CAVE']){
  const opposite=currentBiome==='FOREST'?'CAVE':'FOREST',state={currentBiome,pureFloors:3};
  assert.throws(()=>advanceBiome(state,opposite));assert.throws(()=>advanceBiome(state,opposite+'_TO_'+currentBiome));
  assert.throws(()=>advanceBiome({currentBiome,pureFloors:2},currentBiome+'_TO_'+opposite));
  assert.throws(()=>advanceBiome({currentBiome,pureFloors:7},currentBiome));
  assert.equal(advanceBiome(state,currentBiome).pureFloors,4);
 }
 assert.throws(()=>environmentRecord('UNKNOWN'));assert.throws(()=>biomeSequence(1,0));
});
for(const type of types)test(type+': 10 materialized seeds have usable spawns, gates, enemies, detours and exits',()=>{
 for(let seed=0;seed<10;seed++){
  const w=generateFloor(seed,4,'hub',{environment:type});
  assert.deepEqual(w,generateFloor(seed,4,'hub',{environment:type}));
  assert.deepEqual(JSON.parse(JSON.stringify(w.floorEnvironment)),environmentRecord(type));
  assert.equal(caveAt(w,w.spawn.z),type.startsWith('CAVE')?1:0);
  assert.equal(caveAt(w,w.portal.z),type.endsWith('CAVE')?1:0);
  assert.ok(canStand(w,w.spawn.x,w.spawn.z,.85));w.obstacles.push(...w.gates);
  let cursor=w.spawn;
  for(const id of w.graph.mainPath){const r=w.graph.regions.find(r=>r.id===id);assert.ok(findPath(w,cursor,r,.85));cursor=r;const gate=w.gates.find(g=>g.encounterId==='enc-'+id);if(gate)gate.open=true;}
  assert.ok(findPath(w,cursor,w.portal,.85));
  for(const e of w.enemySpawns){assert.ok(Number.isFinite(e.overrides.stats.maxHP));assert.ok(canStand(w,e.position.x,e.position.z,.85));}
  for(const t of w.trails.filter(t=>!t.main))assert.ok(findPath(w,t.points[0],t.points.at(-1),.85));
 }
});
test('boss role is independent of cave and transitions, with original reward and return route',()=>{
 for(const type of types){const w=generateFloor(12,3,'hub',{environment:type,floorRole:'boss'});assert.equal(w.enemySpawns.filter(e=>e.overrides.boss).length,1);assert.equal(w.graph.regions.at(w.graph.mainPath.length-1).type,'boss');assert.equal(w.exits[0].areaId,'hub');}
 const normal=generateFloor(12,3,'hub',{environment:'CAVE',floorRole:'normal'});assert.ok(!normal.enemySpawns.some(e=>e.overrides.boss));assert.equal(normal.exits[0].areaId,'tower-floor-4');
});
test('actual movement traverses a cave and both directed transitions',()=>{
 for(const type of types.slice(1)){
  const w=generateFloor(42,4,'hub',{environment:type}),game=new Game(w);
  for(const t of w.trails.filter(t=>t.main))for(const p of t.points){assert.ok(game.moveTo(p));for(let i=0;i<12000&&game.path.length;i++)game.update(1/60,{x:0,z:0},0);assert.ok(Math.hypot(game.player.x-p.x,game.player.z-p.z)<.05);}
 }
});
test('playtest starts at a real sequence location and ascends without floor-three boss coupling',()=>{
 const hub=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url))),c=new Character(),s=new AreaSession(createAreas(hub),c,{seed:42}),bag=new Inventory(c);
 assert.throws(()=>s.startBiomePlaytest('CAVE'));bag.acquire('trainingStaff');bag.equip(0);
 s.startBiomePlaytest('CAVE_TO_FOREST');assert.equal(s.area.floorEnvironment.type,'CAVE_TO_FOREST');
 const number=s.area.floorId;for(const enemy of s.combat.enemies)enemy.damage(99999);s.update(1/30,{x:0,z:0},0);assert.ok(s.complete);
 s.travel({targetId:'return-portal'});assert.equal(s.area.floorId,number+1);assert.equal(s.area.floorEnvironment.type,'FOREST');assert.equal(s.run.currentBiome,'FOREST');
 s.travel({targetId:'abandon-run'});assert.ok(s.area.safe);assert.equal(s.run,null);
 s.startRun();assert.equal(s.area.floorId,1);assert.equal(s.areas['tower-floor-3'].floorRole,'boss');
});
