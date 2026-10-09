import {Inventory,ITEMS} from './items/inventory.js';
import {PICKAXE} from './mining.js';
// Paid stock of the Armorer. Training weapons and the fishing rod stay free through the original path.
export const ARMORER_STOCK=Object.freeze([PICKAXE]);
// Validate everything first, then mutate: a refusal never leaves gold or items half-changed.
export function purchaseItem(character,id){
  const def=Object.hasOwn(ITEMS,id)?ITEMS[id]:null;
  if(!def||!ARMORER_STOCK.includes(id)||!Number.isSafeInteger(def.price)||def.price<1)throw Error('Item não vendido aqui.');
  const inventory=new Inventory(character);
  if(inventory.owns(id))throw Error('Já possuído');
  if(character.data.gold<def.price)throw Error('Ouro insuficiente.');
  if(!inventory.canAcquire(id))throw Error('Inventário cheio.');
  inventory.acquire(id);character.data.gold-=def.price;
  return def;
}
