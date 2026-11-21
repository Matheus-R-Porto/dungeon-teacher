import test from 'node:test';
import assert from 'node:assert/strict';
import {sharedFloor} from '../server/floor-store.js';
import {awakenTower} from '../src/world/awakened-tower.js';
import {createEnemies} from '../src/domain/enemies/spawns.js';
import {COMMON_DIFFICULTY,commonDifficulty,spawnDepth} from '../src/domain/enemies/difficulty.js';
import {ENEMY_TYPES} from '../src/domain/enemies/config.js';
import {SharedWorld} from '../server/world.js';

test('41: níveis seguem o percurso, mantêm faixa de até oito e não alteram definições/mapas',()=>{
 for(const seed of [217021,41,9001])for(let floor=1;floor<=3;floor++){
  const world=awakenTower(sharedFloor(seed,floor)),before=JSON.stringify(world),enemies=createEnemies(world.enemySpawns,world),normal=enemies.filter(e=>e.difficulty);
  assert.equal(JSON.stringify(world),before);assert.ok(normal.length>10);
  const [low,high]=COMMON_DIFFICULTY.ranges[floor];assert.ok(high-low<=8);
  assert.ok(normal.every(e=>e.level>=low&&e.level<=high));
  assert.ok(spawnDepth(world,world.spawn)<.05);assert.ok(spawnDepth(world,world.portal)>.95);
  const sorted=normal.toSorted((a,b)=>a.difficulty.depth-b.difficulty.depth),n=Math.ceil(sorted.length/4),mean=a=>a.reduce((s,e)=>s+e.level,0)/a.length;
  assert.ok(mean(sorted.slice(0,n))<mean(sorted.slice(-n)));
  for(const e of normal){const b=e.difficulty.baseStats;assert.ok(e.stats.maxHP>=Math.floor(b.maxHP*1.06));assert.ok(e.stats.maxHP<=Math.ceil(b.maxHP*1.16));assert.equal(e.stats.physicalDefense,b.physicalDefense);assert.equal(e.stats.attackSpeed,b.attackSpeed);}
  assert.deepEqual(createEnemies(world.enemySpawns,world).map(e=>[e.id,e.level,e.stats]),enemies.map(e=>[e.id,e.level,e.stats]));
 }
});
test('41: Cavaleiro, MVP e reforços mantêm os atributos exatos',()=>{
 const world=awakenTower(sharedFloor(217021,2));
 for(const key of ['oathKnight','whiteWolf']){const d=structuredClone(ENEMY_TYPES[key]),before=structuredClone(d);commonDifficulty(d,world);assert.deepEqual(d,before);}
 const d={...structuredClone(ENEMY_TYPES.wolf),reinforcement:true},before=structuredClone(d);commonDifficulty(d,world);assert.deepEqual(d,before);
 const boss=createEnemies(world.enemySpawns,world).find(e=>e.isMiniBoss);assert.equal(boss.stats.maxHP,ENEMY_TYPES.whiteWolf.stats.maxHP);assert.equal(boss.stats.physicalAttack,ENEMY_TYPES.whiteWolf.stats.physicalAttack);assert.equal(boss.level,ENEMY_TYPES.whiteWolf.level);
});

test('41: respawn autoritativo conserva o nível e atributos do território de origem',()=>{
 for(let floor=1;floor<=3;floor++){
  const world=new SharedWorld({map:awakenTower(sharedFloor(217021,floor)),random:()=>.5});
  const enemies=world.enemies.filter(e=>e.difficulty),before=new Map(enemies.map(e=>[e.id,{level:e.level,stats:{...e.stats},generation:e.generation,spawn:{...e.spawnPosition}}]));
  for(const e of enemies){e.damage(e.hp);e.deadAt=0;}
  world.time=100;world.step(.05);
  assert.ok(enemies.some(e=>e.alive),'há espaço válido para ao menos um respawn');
  for(const e of enemies){const b=before.get(e.id);assert.equal(e.level,b.level);assert.deepEqual(e.stats,b.stats);assert.deepEqual(e.spawnPosition,b.spawn);if(e.alive){assert.equal(e.generation,b.generation+1);assert.ok(Math.hypot(e.x-b.spawn.x,e.z-b.spawn.z)<=11.2);}}
 }
});
