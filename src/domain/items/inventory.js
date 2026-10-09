import {RAW_FOOD,INGREDIENTS,DISHES} from '../food.js';
import {FISH,FISHING} from '../fishing.js';
import {MINING,PICKAXE_PRICE} from '../mining.js';
export const EQUIPMENT_SLOTS = Object.freeze(['weapon','head','chest','legs','boots','ring','necklace','talisman']);
export const INVENTORY_CAPACITY = 32;
const weapon = (id,name,weaponType,icon,stats,attackRange=1.45,damageType='physical') => ({id,name,weaponType,icon,stats,description:({sword:'Golpes físicos próximos, firmes e pesados.',dagger:'Golpes físicos mais fracos e rápidos, a curtíssima distância.',bow:'Flechas físicas que causam dano ao atingir o alvo.',staff:'Orbes mágicos que atingem à distância e enfrentam defesa mágica.'})[weaponType],type:'weapon',stackable:false,maxStack:1,equipSlot:'weapon',unique:true,price:0,basicAttack:{attackRange,damageType,attackSpeedModifier:0,delivery:attackRange>2?'projectile':'melee',projectileSpeed:damageType==='magic'?8:12,power:weaponType==='dagger'?.72:1,impact:weaponType==='sword'?'heavy':'light'}});
const gear=(id,name,icon,equipSlot,stats)=>({id,name,icon,equipSlot,stats,type:'equipment',unique:false,description:'Equipamento obtido nas expedições.',stackable:false,maxStack:1});
export const ITEMS = Object.freeze({
  fishingRod:{id:'fishingRod',name:'Vara de Pesca',icon:'♧',type:'tool',stats:{},unique:true,stackable:false,maxStack:1,description:'Leve na mochila para pescar. Não substitui sua arma.'},
  simplePickaxe:{id:'simplePickaxe',name:'Picareta Simples',icon:'⛏',type:'tool',stats:{},unique:true,stackable:false,maxStack:1,price:PICKAXE_PRICE,description:'Leve na mochila para minerar veios nas cavernas da Torre. Não substitui sua arma e não se desgasta.'},
  rawOre:{id:'rawOre',name:'Minério Bruto',icon:'◆',type:'resource',stats:{},unique:false,stackable:true,maxStack:MINING.maxStack,description:'Um fragmento mineral extraído das cavernas da Torre. Poderá ser utilizado futuramente em trabalhos de forja.'},
  ...Object.fromEntries(FISH.map(f=>[f.id,{id:f.id,name:f.name,description:f.description+' Coma cru, venda ou use em receitas.',icon:'≈',type:'resource',tags:f.tags,stats:{},unique:false,stackable:true,maxStack:FISHING.maxStack,tradeable:true,baseSellValue:RAW_FOOD[f.id].baseSellValue,consume:{hp:RAW_FOOD[f.id].hp??0,mp:RAW_FOOD[f.id].mp??0,category:'food'}}])),
  ...Object.fromEntries([...INGREDIENTS,...DISHES].map(i=>[i.id,i])),
  expeditionChest:{id:'expeditionChest',name:'Baú',icon:'▣',type:'chest',stats:{},unique:false,description:'Abra no Refúgio para receber um equipamento e ouro.',stackable:false,maxStack:1},
  travelerCap:gear('travelerCap','Capuz do Viajante','♜','head',{physicalDefense:2}),
  travelerVest:gear('travelerVest','Colete do Viajante','◇','chest',{maxHP:25}),
  travelerBoots:gear('travelerBoots','Botas do Viajante','♧','boots',{physicalDefense:1,evasion:2}),
  focusRing:gear('focusRing','Anel de Foco','○','ring',{magicAttack:3,maxMP:10}),
  apprenticeHood:gear('apprenticeHood','Capuz do Aprendiz','♜','head',{maxMP:18,magicAttack:2}),
  lightVest:gear('lightVest','Colete Leve','◇','chest',{evasion:5}),
  agileBoots:gear('agileBoots','Botas Ágeis','♧','boots',{attackSpeed:.12}),
  strengthRing:gear('strengthRing','Anel de Força','○','ring',{physicalAttack:4}),
  trainingSword:weapon('trainingSword','Espada de Treino','sword','⚔',{physicalAttack:5}),
  trainingDagger:weapon('trainingDagger','Adaga de Treino','dagger','Ⅱ',{physicalAttack:3,attackSpeed:.65},1.35),
  trainingBow:weapon('trainingBow','Arco de Treino','bow','⇉',{physicalAttack:4},6),
  trainingStaff:weapon('trainingStaff','Cajado de Treino','staff','◉',{magicAttack:6},6,'magic'),
});
export const emptyInventory = () => ({version:1,capacity:INVENTORY_CAPACITY,nextId:1,slots:Array(INVENTORY_CAPACITY).fill(null)});
export const emptyEquipment = () => Object.fromEntries(EQUIPMENT_SLOTS.map(slot=>[slot,null]));
export function equipmentStats(data){const stats={};for(const item of Object.values(data.equipment??{})){for(const [key,value] of Object.entries(ITEMS[item?.definitionId]?.stats??{}))stats[key]=(stats[key]??0)+value;}return {stats};}
export const equippedDefinition = data => ITEMS[data.equipment?.weapon?.definitionId]??null;
export function equipmentBlocked(combat){return combat.game.activity?.busy||!combat.character.isAlive||combat.game.inCombat===true||combat.abilities?.busy||combat.abilities?.projectiles.items.length>0||['attacking','chasing','dead'].includes(combat.state)||combat.playerCycle.phase!=='idle'||combat.enemies.some(e=>['alert','chasing','attacking'].includes(e.state));}

export class Inventory {
  constructor(character){this.character=character;}
  get data(){return this.character.data;}
  owns(id){return [...this.data.inventory.slots,...Object.values(this.data.equipment)].some(item=>item?.definitionId===id);}
  canAcquire(id){const def=ITEMS[id];return !!def&&(!def.unique||!this.owns(id))&&(this.data.inventory.slots.includes(null)||def.stackable&&this.data.inventory.slots.some(i=>i?.definitionId===id&&i.quantity<def.maxStack));}
  acquire(id,metadata={}){const definition=Object.hasOwn(ITEMS,id)?ITEMS[id]:null;if(!definition)throw Error('Item inválido.');if(definition.unique&&this.owns(id))throw Error('Já possuído');const inventory=this.data.inventory;const stack=definition.stackable&&inventory.slots.find(i=>i?.definitionId===id&&i.quantity<definition.maxStack);if(stack){stack.quantity++;return stack;}const index=inventory.slots.indexOf(null);if(index<0)throw Error('Inventário cheio.');if(!Number.isSafeInteger(inventory.nextId)||inventory.nextId>=Number.MAX_SAFE_INTEGER)throw Error('Limite de identificadores de itens.');if(id==='expeditionChest'&&(!Number.isSafeInteger(metadata.rewardSeed)||metadata.rewardSeed<0||metadata.rewardSeed>4294967295))throw Error('Seed de baú inválida.');const item={...(id==='expeditionChest'?{rewardSeed:metadata.rewardSeed}:{}),instanceId:'item-'+inventory.nextId++,definitionId:id,quantity:1};inventory.slots[index]=item;return item;}
  count(id){return this.data.inventory.slots.reduce((n,i)=>n+(i?.definitionId===id?i.quantity:0),0);}
  removeInstance(instanceId,quantity=1){const slots=this.data.inventory.slots,index=slots.findIndex(i=>i?.instanceId===instanceId),item=slots[index];if(!item||!Number.isSafeInteger(quantity)||quantity<1||quantity>item.quantity)throw Error('Quantidade indisponível.');item.quantity-=quantity;if(!item.quantity)slots[index]=null;}
  remove(id,quantity){if(!Number.isSafeInteger(quantity)||quantity<1||this.count(id)<quantity)throw Error('Ingredientes insuficientes.');for(const item of [...this.data.inventory.slots]){if(item?.definitionId===id){const amount=Math.min(quantity,item.quantity);this.removeInstance(item.instanceId,amount);quantity-=amount;if(!quantity)break;}}}
  equip(index,slot='weapon',blocked=false){if(blocked)throw Error('Não é possível trocar equipamento durante combate.');if(!EQUIPMENT_SLOTS.includes(slot))throw Error('Slot incompatível.');const item=this.data.inventory.slots[index],definition=ITEMS[item?.definitionId];if(!definition)throw Error('Item inválido.');if(definition.equipSlot!==slot)throw Error('Slot incompatível.');const previous=this.data.equipment[slot];this.data.equipment[slot]=item;this.data.inventory.slots[index]=previous;this.sync();}
  unequip(slot='weapon',blocked=false){if(blocked)throw Error('Não é possível trocar equipamento durante combate.');if(!EQUIPMENT_SLOTS.includes(slot))throw Error('Slot incompatível.');const item=this.data.equipment[slot];if(!item)return false;const index=this.data.inventory.slots.indexOf(null);if(index<0)throw Error('Inventário cheio.');this.data.inventory.slots[index]=item;this.data.equipment[slot]=null;this.sync();return true;}
  sync(){this.data.equippedWeaponType=equippedDefinition(this.data)?.weaponType??null;this.character.recalculate();}
}

// Additive migration: old beta saves keep their provisional weapon as a real item.
export function decodeInventory(source){
  if(source.inventory===undefined){if(source.equipment!==undefined)throw Error('Equipamento sem inventário.');const inventory=emptyInventory(),equipment=emptyEquipment(),type=source.equippedWeaponType===undefined?'sword':source.equippedWeaponType;const definition=Object.values(ITEMS).find(item=>item.weaponType===type);if(type!==null&&!definition)throw Error('Arma desconhecida no save.');if(definition){equipment.weapon={instanceId:'item-1',definitionId:definition.id,quantity:1};inventory.nextId=2;}return {inventory,equipment,equippedWeaponType:definition?.weaponType??null};}
  const inventory=structuredClone(source.inventory),equipment=structuredClone(source.equipment);
  if(!inventory||inventory.version!==1||inventory.capacity!==INVENTORY_CAPACITY||!Array.isArray(inventory.slots)||inventory.slots.length!==inventory.capacity||!Number.isSafeInteger(inventory.nextId)||inventory.nextId<1)throw Error('Inventário inválido no save.');
  if(!equipment||typeof equipment!=='object'||Array.isArray(equipment)||Object.keys(equipment).some(slot=>!EQUIPMENT_SLOTS.includes(slot)))throw Error('Equipamento inválido no save.');
  const ids=new Set(),unique=new Set();let maxId=0;
  const validate=(item,slot)=>{if(item===null)return;if(!item||typeof item.instanceId!=='string'||!/^item-[1-9]\d*$/.test(item.instanceId)||ids.has(item.instanceId))throw Error('Instância de item inválida.');const definition=Object.hasOwn(ITEMS,item.definitionId)?ITEMS[item.definitionId]:null;if(!definition||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>definition.maxStack||slot&&definition.equipSlot!==slot||definition.unique&&unique.has(item.definitionId))throw Error('Item inválido ou duplicado no save.');const n=Number(item.instanceId.slice(5));if(!Number.isSafeInteger(n))throw Error('Identificador inválido.');maxId=Math.max(maxId,n);ids.add(item.instanceId);if(definition.unique)unique.add(item.definitionId);if(definition.type==='chest'&&(!Number.isSafeInteger(item.rewardSeed)||item.rewardSeed<0||item.rewardSeed>4294967295))throw Error('Seed de baú inválida.');};
  Array.from(inventory.slots).forEach(item=>validate(item));for(const slot of EQUIPMENT_SLOTS){equipment[slot]??=null;validate(equipment[slot],slot);}if(inventory.nextId<=maxId)throw Error('Sequência de itens inválida.');
  return {inventory,equipment,equippedWeaponType:ITEMS[equipment.weapon?.definitionId]?.weaponType??null};
}
