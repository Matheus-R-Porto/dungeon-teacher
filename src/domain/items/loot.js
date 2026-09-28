import {seeded} from '../random.js';
import {EXPEDITION} from '../expedition.js';

export const LOOT_POOL=Object.freeze(['travelerCap','travelerVest','travelerBoots','focusRing','apprenticeHood','lightVest','agileBoots','strengthRing']);
export const LOOT_WEIGHTS=Object.freeze(LOOT_POOL.map(()=>1));
export function selectReward(pool,weights,roll){
  if(!pool.length||pool.length!==weights.length||weights.some(w=>!Number.isFinite(w)||w<0)||!Number.isFinite(roll)||roll<0||roll>=1)throw Error('Probabilidades inválidas.');
  const total=weights.reduce((a,b)=>a+b,0);if(!Number.isFinite(total)||total<=0)throw Error('Probabilidades inválidas.');
  let cursor=roll*total;for(let i=0;i<pool.length;i++){cursor-=weights[i];if(cursor<0)return pool[i];}
  return pool[weights.findLastIndex(w=>w>0)];
}
export function chestReward(item,weights=LOOT_WEIGHTS){
  if(item?.definitionId!=='expeditionChest'||!Number.isSafeInteger(item.rewardSeed))throw Error('Baú inválido.');
  const random=seeded(item.rewardSeed);
  return Object.freeze({itemId:selectReward(LOOT_POOL,weights,random()),gold:EXPEDITION.chestGold+Math.floor(random()*EXPEDITION.chestGoldVariation)});
}
