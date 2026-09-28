import {BALANCE} from '../character/balance.js';
import {Inventory} from './inventory.js';
import {chestReward} from './loot.js';
const prepared=new WeakMap();
function available(character,instanceId,safe){
  if(!safe)throw Error('Abra este baú no Refúgio.');
  const item=character.data.inventory.slots.find(i=>i?.instanceId===instanceId);
  if(item?.definitionId!=='expeditionChest')throw Error('Baú inválido.');
  if(!character.data.inventory.slots.includes(null))throw Error('Libere um espaço no inventário.');
  return item;
}
export function validateChest(character,instanceId,safe,weights){
  const item=available(character,instanceId,safe),reward=chestReward(item,weights);
  if(character.data.gold+reward.gold>BALANCE.maxGainXP)throw Error('Limite de ouro atingido.');
  const result=Object.freeze({reward});
  prepared.set(result,{character,instanceId,seed:item.rewardSeed});return result;
}
export function grantChest(character,selection,safe){
  const ticket=prepared.get(selection);if(!ticket||ticket.character!==character)throw Error('Recompensa inválida.');
  const item=available(character,ticket.instanceId,safe),{reward}=selection;
  if(item.rewardSeed!==ticket.seed)throw Error('Baú alterado.');
  if(character.data.gold+reward.gold>BALANCE.maxGainXP)throw Error('Limite de ouro atingido.');
  new Inventory(character).acquire(reward.itemId);character.data.gold+=reward.gold;
  character.data.inventory.slots[character.data.inventory.slots.indexOf(item)]=null;
  return reward;
}
export function openChest(character,instanceId,safe){return grantChest(character,validateChest(character,instanceId,safe),safe);}
