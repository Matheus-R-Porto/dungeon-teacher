import {TOWER_LIMIT} from './expedition.js';
// One-time rewards of the campaign. A claimed reward never drops again for this character.
export const TOWER_REWARDS=Object.freeze({'boss-floor-3':Object.freeze({floor:3,name:'Baú do Guardião'})});
export const emptyTower=()=>({highestClearedFloor:0,claimedRewards:[]});
export function decodeTower(raw){
  if(raw===undefined)return emptyTower();
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Progresso da Torre inválido.');
  const highest=raw.highestClearedFloor??0,claimed=raw.claimedRewards??[];
  if(!Number.isSafeInteger(highest)||highest<0||highest>TOWER_LIMIT)throw Error('Maior andar concluído inválido.');
  if(!Array.isArray(claimed)||claimed.some(id=>!Object.hasOwn(TOWER_REWARDS,id)))throw Error('Recompensa única inválida no save.');
  const unique=[...new Set(claimed)];
  // A reward can only be claimed after its floor was cleared, so a claim lifts a lagging marker.
  return {highestClearedFloor:Math.max(highest,...unique.map(id=>TOWER_REWARDS[id].floor)),claimedRewards:unique};
}
export const rewardClaimed=(data,id)=>!!data.tower?.claimedRewards.includes(id);
// Only floors are cleared in order; returns true when the marker advanced.
export function markFloorCleared(data,floor){
  const tower=data.tower;
  if(!Number.isSafeInteger(floor)||floor<1||floor>TOWER_LIMIT||floor>tower.highestClearedFloor+1)return false;
  if(floor<=tower.highestClearedFloor)return false;
  tower.highestClearedFloor=floor;return true;
}
export function claimReward(data,id){
  if(!Object.hasOwn(TOWER_REWARDS,id))throw Error('Recompensa única desconhecida.');
  if(rewardClaimed(data,id))throw Error('Recompensa já obtida.');
  data.tower.claimedRewards.push(id);
}
