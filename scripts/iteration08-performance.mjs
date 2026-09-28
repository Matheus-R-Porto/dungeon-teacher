import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {createEnemies} from '../src/domain/enemies/spawns.js';
import {EnemyAI} from '../src/simulation/enemy-ai.js';
const hub=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url)));
const results=[];
for(const count of [5,20]){
  const c=new Character(),s=new AreaSession(createAreas(hub),c,{seed:42}),bag=new Inventory(c);
  bag.acquire('trainingStaff');bag.equip(0);s.startRun();s.area.obstacles=[];
  Object.assign(s.game.player,{x:0,z:0});
  const types=['trainingSlime','jumpingSlime','magicSlime'];
  s.combat.enemies=createEnemies(Array.from({length:count},(_,i)=>({id:'bench-'+i,enemyType:types[i%3],position:{x:Math.cos(i*2*Math.PI/count)*5,z:Math.sin(i*2*Math.PI/count)*5},overrides:{aggressive:false,ambient:false,noRespawn:true,leashRange:100,stats:{maxHP:100000}}})),s.area);
  s.combat.ai=new EnemyAI(s.combat);s.combat.random=()=>.5;
  for(const e of s.combat.enemies)s.combat.ai.onDamaged(e,c.data.id);
  s.combat.select(s.combat.enemies[0].id);
  const samples=[];let maxProjectiles=0,activeProjectileSteps=0;
  for(let i=0;i<3600;i++){
    // Synthetic stress fixture: restore health outside the timed step to sustain combat.
    c.restoreHP();const start=performance.now();s.update(1/60,{x:0,z:0},0);samples.push(performance.now()-start);
    maxProjectiles=Math.max(maxProjectiles,s.combat.projectiles.items.length);
    if(s.combat.projectiles.items.length)activeProjectileSteps++;
  }
  samples.sort((a,b)=>a-b);
  results.push({enemies:count,simulatedSeconds:60,meanStepMs:samples.reduce((a,b)=>a+b,0)/samples.length,p95StepMs:samples[Math.floor(samples.length*.95)],maxProjectiles,activeProjectileSteps,paths:s.combat.ai.metrics.paths,fallbacks:s.combat.ai.metrics.fallbacks});
}
fs.writeFileSync(new URL('../docs/ITERACAO-08-PERFORMANCE.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
