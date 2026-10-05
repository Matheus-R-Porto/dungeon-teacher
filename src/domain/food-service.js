import {Character} from './character/character.js';
import {BALANCE} from './character/balance.js';
import {Inventory,ITEMS} from './items/inventory.js';
import {gainLifeXP} from './life-skills.js';
import {RECIPES,INGREDIENTS,FOOD_CONFIG} from './food.js';

export class FoodService {
  constructor(character,{save=async()=>{},context=()=>({safe:true,blocked:false}),now=()=>Date.now(),onChange=()=>{}}={}){Object.assign(this,{character,save,context,now,onChange});this.busy=false;this.cooking=null;}
  remaining(){return Math.max(0,((this.character.data.consumableCooldowns?.food??0)-this.now())/1000);}
  guard(hub=false){if(this.busy)throw Error('Aguarde o salvamento.');if(!this.character.isAlive)throw Error('Você não pode agir enquanto está morto.');if(this.context().blocked)throw Error('Aguarde o fim do combate ou da atividade.');if(hub&&!this.context().safe)throw Error('Serviço disponível somente no Refúgio.');}
  quantity(q){if(!Number.isSafeInteger(q)||q<1||q>FOOD_CONFIG.maxQuantity)throw Error('Quantidade inválida (1–99).');}
  async transact(action){if(this.busy)throw Error('Aguarde o salvamento.');this.busy=true;try{const draft=new Character(this.character.snapshot());const message=action(draft,new Inventory(draft));await this.save(draft.snapshot());this.character.data=draft.snapshot();this.character.recalculate(this.now());this.onChange();return message;}finally{this.busy=false;}}
  consume(instanceId){this.guard();if(this.cooking)throw Error('Encerre o preparo primeiro.');const wait=this.remaining();if(wait>0)throw Error(`Comida em recarga: ${Math.ceil(wait)}s.`);
    return this.transact((c,inv)=>{const item=c.data.inventory.slots.find(i=>i?.instanceId===instanceId),effect=ITEMS[item?.definitionId]?.consume;if(!effect)throw Error('Este item não pode ser comido.');c.recalculate(this.now());const hp=effect.hp&&c.data.hp<c.stats.maxHP,mp=effect.mp&&c.data.mp<c.stats.maxMP;
      if(!hp&&!mp&&!effect.buff)throw Error(effect.hp&&effect.mp?'Sua vida e mana já estão cheias.':effect.mp?'Sua mana já está cheia.':'Sua vida já está cheia.');
      inv.removeInstance(instanceId,1);if(effect.buff)c.data.foodBuff={id:effect.buff,expiresAt:this.now()+FOOD_CONFIG.buffSeconds*1000};c.recalculate(this.now());c.heal(effect.hp??0);c.restoreMP(effect.mp??0);c.data.consumableCooldowns??={};c.data.consumableCooldowns[effect.category]=this.now()+FOOD_CONFIG.cooldownSeconds*1000;return 'Alimento consumido. Recarga de comida: '+FOOD_CONFIG.cooldownSeconds+'s.';});
  }
  buy(id,q=1){this.guard(true);if(this.cooking)throw Error('Encerre o preparo primeiro.');this.quantity(q);const def=INGREDIENTS.find(i=>i.id===id);if(!def)throw Error('Ingrediente não vendido aqui.');return this.transact((c,inv)=>{const total=def.npcBuyValue*q;if(c.data.gold<total)throw Error('Ouro insuficiente.');for(let i=0;i<q;i++)inv.acquire(id);c.data.gold-=total;return `${q} × ${def.name} comprado(s) por ${total} ouro.`;});}
  sell(instanceId,q=1){this.guard(true);if(this.cooking)throw Error('Encerre o preparo primeiro.');this.quantity(q);return this.transact((c,inv)=>{const item=c.data.inventory.slots.find(i=>i?.instanceId===instanceId),def=ITEMS[item?.definitionId];if(!def?.baseSellValue||!def.tradeable)throw Error('A Cozinheira não compra este item.');const total=def.baseSellValue*q;if(c.data.gold+total>BALANCE.maxGainXP)throw Error('Limite de ouro atingido.');inv.removeInstance(instanceId,q);c.data.gold+=total;return `${q} × ${def.name} vendido(s) por ${total} ouro.`;});}
  recipe(id){const r=RECIPES.find(r=>r.id===id);if(!r)throw Error('Receita desconhecida.');return r;}
  prepare(c,id){const r=this.recipe(id),inv=new Inventory(c);if(c.data.lifeSkills.cooking.level<r.minLevel)throw Error(`Requer Cooking nível ${r.minLevel}.`);for(const [id,q]of Object.entries(r.ingredients)){if(inv.count(id)<q)throw Error('Falta ingrediente: '+ITEMS[id].name);inv.remove(id,q);}for(let i=0;i<r.quantity;i++)inv.acquire(r.result);return r;}
  recipeReason(id){try{this.prepare(new Character(this.character.snapshot()),id);return '';}catch(e){return e.message;}}
  start(id){this.guard(true);if(this.cooking)throw Error('Já existe um preparo em andamento.');const reason=this.recipeReason(id);if(reason)throw Error(reason);this.cooking={id,started:this.now()};return this.cooking;}
  progress(){return this.cooking?Math.min(1,Math.max(0,(this.now()-this.cooking.started)/(this.recipe(this.cooking.id).seconds*1000))):0;}
  cancel(){if(this.busy)return false;this.cooking=null;return true;}
  resolve(){this.guard(true);if(!this.cooking)throw Error('Nenhum preparo em andamento.');const {id}=this.cooking,p=this.progress();const result=p>=FOOD_CONFIG.perfect[0]&&p<=FOOD_CONFIG.perfect[1]?'PERFEITO':p>=FOOD_CONFIG.good[0]&&p<=FOOD_CONFIG.good[1]?'BOM':'ERRO';this.cooking=null;
    return this.transact(c=>{const r=this.prepare(c,id),xp=Math.max(1,Math.floor(r.xp*({ERRO:.5,BOM:1,PERFEITO:1.5}[result]))),levels=gainLifeXP(c.data,'cooking',xp);return `${result} · ${ITEMS[r.result].name} pronto! Cooking XP +${xp}${levels?' · CULINÁRIA NÍVEL '+c.data.lifeSkills.cooking.level+'!':''}${result==='ERRO'?' O prato foi preservado; você ganhou menos XP.':''}`;});
  }
}
