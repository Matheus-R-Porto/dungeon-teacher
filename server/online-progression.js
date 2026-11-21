import {Character} from '../src/domain/character/character.js';
import {confirmBuild,serafina} from '../src/domain/character/job-progress.js';
import {canTalk} from '../src/domain/dialogue.js';
import {assignHotbar} from '../src/domain/abilities/hotbar.js';
import {Inventory,ITEMS} from '../src/domain/items/inventory.js';
import {consumeFood} from '../src/domain/food-service.js';
import {purchaseItem,purchaseSupply} from '../src/domain/shop.js';
// Free weapons of the Armorer, identical to the campaign's training stock.
export const TRAINING_WEAPONS=Object.freeze(['trainingSword','trainingDagger','trainingBow','trainingStaff','fishingRod']);
export function progressionCommand(tower,p,a){
 const result=(ok,message)=>({v:4,type:'progression:result',request:a.request,ok,message,profile:tower.snapshot(p).profile});
 try{
  if(!p.character.data.jobs)throw Error('Use uma conta escolar para esta progressão.');
  if(p.character.data.progressionReceipts?.includes(a.request))return result(true);
  if(!p.character.isAlive)throw Error('Aguarde o retorno do personagem.');
  const c=new Character(p.character.snapshot()),w=tower.world(p.mapId),d=a.data;
  if(a.operation==='tutorial'){if(Object.keys(d).join(',')!=='camera'||d.camera!==true)throw Error('Observação inválida.');c.data.firstSteps.camera=true;}
  else if(a.operation==='build'){if(tower.inCombat(p.id))throw Error('Encerre o combate para confirmar a distribuição.');confirmBuild(c.data,d);}
  else if(a.operation==='service'){
   const npc=w.map.npcs?.find(n=>n.id==='reset-angel');serafina(c.data,d,{nearSerafina:canTalk(w.map,p.game.player,npc),inCombat:tower.inCombat(p.id),dead:!c.isAlive,reached:p.reached});
  }else if(a.operation==='hotbar')assignHotbar(c.data,d.slot,d.id);
  else if(a.operation==='consume'){
   if(tower.inCombat(p.id))throw Error('Encerre o combate para comer.');if(typeof d.id!=='string'||!ITEMS[d.id]?.consume)throw Error('Consumível inválido.');const item=c.data.inventory.slots.find(i=>i?.definitionId===d.id);if(!item)throw Error('Consumível indisponível.');consumeFood(c,new Inventory(c),item.instanceId,tower.now());
  }else if(a.operation==='supplies'){if(p.mapId!=='shared-city'||tower.inCombat(p.id))throw Error('Compre suprimentos no Refúgio fora de combate.');purchaseSupply(c,d.id);
  }else if(a.operation==='shop'){
   const npc=w.map.npcs?.find(n=>n.id==='blacksmith');if(p.mapId!=='shared-city'||!npc||!canTalk(w.map,p.game.player,npc))throw Error('Aproxime-se de Brasa, na cidade, para negociar.');if(tower.inCombat(p.id)||p.instanceId)throw Error('Encerre o combate antes de negociar.');
   const bag=new Inventory(c);
   if(d.action==='weapon'){if(!TRAINING_WEAPONS.includes(d.id))throw Error('Arma inválida.');if(bag.owns(d.id))throw Error('Você já possui esta arma.');bag.acquire(d.id);if(ITEMS[d.id].weaponType&&!c.data.equipment.weapon)bag.equip(c.data.inventory.slots.findIndex(i=>i?.definitionId===d.id));}
   else if(d.action==='buy')purchaseItem(c,d.id);
   else if(d.action==='supplies')purchaseSupply(c,d.id);
   else throw Error('Operação inválida.');
  }else if(a.operation==='equipment'){
   if(tower.inCombat(p.id)||p.instanceId)throw Error('Encerre o combate antes de trocar equipamento.');const bag=new Inventory(c);if(d.unequip)bag.unequip(d.slot);else bag.equip(d.index,d.slot);
  }else throw Error('Operação inválida.');
  c.recalculate(tower.now());c.data.progressionReceipts=[...(c.data.progressionReceipts??[]).slice(-63),a.request];
  tower.db.save(p.id,tower.state(p,c));p.character=c;if(a.operation==='service'&&['skills','regress','resume','promote'].includes(d.service))p.abilities?.interrupt('death');p.saved=JSON.stringify(tower.state(p));return result(true);
 }catch(error){return result(false,error.message);}
}
