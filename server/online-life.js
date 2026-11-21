import {recordProfessionVisual} from './profession-visual.js';
import {randomInt} from 'node:crypto';
import {Character} from '../src/domain/character/character.js';
import {canTalk} from '../src/domain/dialogue.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {gainLifeXP} from '../src/domain/life-skills.js';
import {FOOD_CONFIG} from '../src/domain/food.js';
import {FISHING,eligibleFish,selectFish} from '../src/domain/fishing.js';
import {buyIngredient,cookDish,prepareDish,recipeOf,sellProduct} from '../src/domain/food-service.js';
import {nearestCast} from '../src/world/fishing-water.js';
// Life skills of the shared world. Timing is judged on the server clock; clients only present it.
const random=()=>randomInt(0,1e9)/1e9;
export const cookView=(tower,p)=>p.cook?{id:p.cook.id,started:p.cook.started,seconds:recipeOf(p.cook.id).seconds}:null;
export function fishingView(tower,p){
 const f=p.fishing;if(!f)return null;settle(tower,p);if(!p.fishing)return null;
 const now=tower.now(),state=now<f.castAt?'cast':now<f.biteAt?'waiting':'bite';
 return {state,castAt:f.castAt,biteAt:f.biteAt,endsAt:f.endsAt,bobber:f.spot.bobber,heading:f.spot.heading};
}
const cooldownKey=f=>f.spot.waterFeatureId;
function end(tower,p,message){const f=p.fishing;if(!f)return;(p.fishCooldowns??=new Map()).set(cooldownKey(f),tower.now()+FISHING.cooldownSeconds*1000);p.fishing=null;if(message)p.notice=message;}
// Lazy rules (no timer): leaving the spot, map, health or time ends the attempt.
export function settle(tower,p){
 const f=p.fishing;if(!f)return;const g=p.game.player,now=tower.now();
 if(p.mapId!==f.mapId||!p.character.isAlive||p.character.data.hp<f.hp||Math.hypot(g.x-f.origin.x,g.z-f.origin.z)>.1)end(tower,p,'Pesca interrompida.');
 else if(now>=f.endsAt)end(tower,p,'O peixe escapou.');
}
function near(tower,p,id){const w=tower.world(p.mapId),npc=w.map.npcs?.find(n=>n.id===id);return p.mapId==='shared-city'&&npc&&canTalk(w.map,p.game.player,npc);}
export function lifeCommand(tower,p,a){
 const result=(ok,message)=>({v:4,type:'progression:result',request:a.request,ok,message,profile:tower.snapshot(p).profile});
 try{
  if(!p.character.data.jobs)throw Error('Use uma conta escolar para esta atividade.');
  if(!p.character.isAlive)throw Error('Aguarde o retorno do personagem.');
  const d=a.data;if(p.forge||p.mining)throw Error('Encerre a mineração ou forja primeiro.');
  if(a.operation==='fish')return fish(tower,p,a,d,result);
  if(d.action==='cancel'){p.cook=null;return result(true);}
  if(!near(tower,p,'cook'))throw Error('Aproxime-se de Lina, na cidade.');
  if(tower.inCombat(p.id)||p.instanceId)throw Error('Encerre o combate antes de cozinhar.');
  if(d.action==='start'){if(p.cook)throw Error('Já existe um preparo em andamento.');prepareDish(new Character(p.character.snapshot()),d.id);p.cook={id:d.id,started:tower.now()};return result(true,'Preparo iniciado.');}
  if(p.character.data.progressionReceipts?.includes(a.request))return result(true);
  if(p.cook&&d.action!=='resolve')throw Error('Encerre o preparo primeiro.');
  const c=new Character(p.character.snapshot());let message;
  if(d.action==='buy')message=buyIngredient(c,new Inventory(c),d.id,d.quantity);
  else if(d.action==='sell')message=sellProduct(c,new Inventory(c),d.instanceId,d.quantity);
  else if(d.action==='resolve'){if(!p.cook)throw Error('Nenhum preparo em andamento.');const cook=p.cook;p.cook=null;message=cookDish(c,cook.id,Math.min(1,Math.max(0,(tower.now()-cook.started)/(recipeOf(cook.id).seconds*1000))));}
  else throw Error('Operação inválida.');
  c.recalculate(tower.now());c.data.progressionReceipts=[...(c.data.progressionReceipts??[]).slice(-63),a.request];
  tower.db.save(p.id,tower.state(p,c));p.character=c;p.saved=JSON.stringify(tower.state(p));return result(true,message);
 }catch(error){return result(false,error.message);}
}
function fish(tower,p,a,d,result){
 settle(tower,p);
 if(d.action==='cancel'){p.professionVisual=null;end(tower,p,'Pesca cancelada.');return result(true);}
 const now=tower.now();
 if(d.action==='start'){
  if(p.fishing)throw Error('Você já está pescando.');
  if(tower.inCombat(p.id)||p.instanceId||p.mapId==='shared-city')throw Error('Você só pode pescar nas margens da Torre, fora de combate.');
  const bag=new Inventory(p.character);if(!bag.owns('fishingRod'))throw Error('Você precisa de uma Vara de Pesca. Brasa a entrega de graça.');
  const level=p.character.data.lifeSkills.fishing.level,pool=eligibleFish(level);
  if(!pool.some(f=>bag.canAcquire(f.itemDefinition)))throw Error('Sua mochila está cheia.');
  const spot=nearestCast(tower.world(p.mapId).map,p.game.player);
  if(!spot)throw Error('Aproxime-se de uma margem, fora da água.');
  if((p.fishCooldowns?.get(spot.waterFeatureId)??0)>now)throw Error('Aguarde a água se acalmar.');
  const wait=FISHING.waitMin+random()*(FISHING.waitMax-FISHING.waitMin),castAt=now+FISHING.castSeconds*1000,biteAt=castAt+wait*1000;
  p.axis={x:0,z:0};p.target=null;p.game.cancel();p.cycle.cancel();
  p.professionVisual=null;p.fishing={spot,mapId:p.mapId,origin:{x:p.game.player.x,z:p.game.player.z},hp:p.character.data.hp,castAt,biteAt,endsAt:biteAt+FISHING.reactionSeconds*1000,fish:selectFish(level,random)};
  return result(true,'Lançando…');
 }
 if(d.action==='pull'){
  const f=p.fishing;if(!f)throw Error('Você não está pescando.');
  if(now<f.biteAt){recordProfessionVisual(tower,p,'fishing','reel',f.spot.bobber);end(tower,p,'Muito cedo!');return result(false,'Muito cedo!');}
  if(p.character.data.progressionReceipts?.includes(a.request))return result(true);
  const c=new Character(p.character.snapshot()),bag=new Inventory(c);
  if(!bag.canAcquire(f.fish.itemDefinition)){end(tower,p);throw Error('Sua mochila está cheia para este peixe. Nenhuma recompensa concedida.');}
  bag.acquire(f.fish.itemDefinition);const levels=gainLifeXP(c.data,'fishing',f.fish.xp);
  c.recalculate(now);c.data.progressionReceipts=[...(c.data.progressionReceipts??[]).slice(-63),a.request];
  tower.db.save(p.id,tower.state(p,c));p.character=c;p.saved=JSON.stringify(tower.state(p));recordProfessionVisual(tower,p,'fishing','reel',f.spot.bobber,{caught:true});end(tower,p);
  return result(true,'PESCADO! '+f.fish.name+' · Pesca XP +'+f.fish.xp+(levels?' · PESCA NÍVEL '+c.data.lifeSkills.fishing.level+'!':''));
 }
 throw Error('Operação inválida.');
}
