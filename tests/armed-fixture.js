import {Inventory,ITEMS} from '../src/domain/items/inventory.js';
// Combat formula fixtures use a real weapon while neutralizing its bonuses.
export function armFixture(character,weapon='sword'){const definition=Object.values(ITEMS).find(i=>i.weaponType===weapon),bag=new Inventory(character);bag.acquire(definition.id);bag.equip(character.data.inventory.slots.findIndex(i=>i?.definitionId===definition.id));character.modifiers.other={stats:Object.fromEntries(Object.entries(definition.stats).map(([key,value])=>[key,-value]))};character.recalculate();}
