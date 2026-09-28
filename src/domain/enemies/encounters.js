import {seeded,seedOf} from '../random.js';
export const ENCOUNTERS=Object.freeze({
  1:{required:['trainingSlime'],pool:['trainingSlime'],hpScale:{trainingSlime:1}},
  2:{required:['trainingSlime','jumpingSlime'],pool:['trainingSlime','jumpingSlime'],hpScale:{trainingSlime:1,jumpingSlime:.75}},
  3:{required:['trainingSlime','jumpingSlime','magicSlime'],pool:['trainingSlime','jumpingSlime','magicSlime'],hpScale:{trainingSlime:1,jumpingSlime:.75,magicSlime:.7}},
});
// Composition owns no geometry or run lifecycle; spatial generation assigns valid positions.
export function generateEncounter(seed,floor,count){
  const rule=ENCOUNTERS[floor];if(!rule||count<rule.required.length)throw Error('Encontro inválido.');
  const random=seeded(seedOf(seed+':encounter:'+floor)),types=[...rule.required];
  while(types.length<count)types.push(rule.pool[Math.floor(random()*rule.pool.length)]);
  for(let i=types.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
  return types.map(enemyType=>({enemyType,hpScale:rule.hpScale[enemyType]}));
}
