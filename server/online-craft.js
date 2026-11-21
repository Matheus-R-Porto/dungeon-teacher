import {recordProfessionVisual} from './profession-visual.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {MINING,PICKAXE,RAW_ORE,indicatorAt,strikeResult} from '../src/domain/mining.js';
import {SmithingService} from '../src/domain/smithing-service.js';
import {SMITHING,gradeHammer,scoreOf,qualityFor,recipeById} from '../src/domain/smithing.js';
import {gainLifeXP} from '../src/domain/life-skills.js';
import {canTalk} from '../src/domain/dialogue.js';
import {clearSegment} from '../src/world/collision.js';
import {surfaceId,layerWorld} from '../src/world/surfaces.js';
import {randomInt} from 'node:crypto';

const nearSmith=(tower,p)=>{const map=tower.world(p.mapId).map;return p.mapId==='shared-city'&&canTalk(map,p.game.player,map.npcs.find(n=>n.id==='blacksmith'));};
const commit=(tower,p,c,receipt)=>{c.recalculate(tower.now());c.data.progressionReceipts=[...(c.data.progressionReceipts??[]).slice(-63),receipt];tower.db.save(p.id,tower.state(p,c));p.character=c;p.saved=JSON.stringify(tower.state(p));};
function veinFor(tower,p,id){return tower.world(p.mapId).map.mineralVeins?.find(v=>v.id===id);}
function miningValid(tower,p,m){const vein=veinFor(tower,p,m.veinId);return p.mapId===m.mapId&&p.character.isAlive&&p.character.data.hp>=m.hp&&vein&&surfaceId(vein)===surfaceId(p.game.player)&&Math.hypot(vein.x-p.game.player.x,vein.z-p.game.player.z)<=MINING.interactionRadius&&clearSegment({...layerWorld(tower.world(p.mapId).map,surfaceId(vein)),obstacles:layerWorld(tower.world(p.mapId).map,surfaceId(vein)).obstacles.filter(o=>o.id!==vein.obstacleId)},p.game.player,vein,.05);}
// Persistent per-character depletion avoids both shared-map mutations and reconnect farming.
export function craftView(tower,p){return {mining:p.mining??null,forge:p.forge??null,result:p.craftResult??null,retryAt:p.mineRetry??0,mined:p.character.data.minedVeins?.[p.mapId]??[]};}
export function advanceCraft(tower,p){
 const now=tower.now();
 if(p.mining&&(!miningValid(tower,p,p.mining)||now>=p.mining.endsAt)){p.mining=null;p.notice='Mineração interrompida ou tempo esgotado.';}
 const f=p.forge;if(!f)return;
 // A disconnected attempt remains on the server and resolves; closing a client cannot reroll quality.
 if(!p.character.isAlive||!nearSmith(tower,p)){p.forge=null;p.notice='Forja interrompida. Nenhum material consumido.';return;}
 for(let guard=0;guard<10&&p.forge;guard++){
  const duration=f.state==='heating'?SMITHING.heatSeconds:f.state==='hammer'?SMITHING.sweepSeconds[f.index]:SMITHING.gapSeconds;
  if(now-f.at<duration*1000)break;
  f.at+=duration*1000;
  if(f.state==='heating'){f.state='hammer';f.committed=true;}
  else if(f.state==='hammer'){f.grades.push('MISS');f.state='gap';}
  else if(f.index<2){f.index++;f.state='hammer';}
  else{
   const c=new Character(p.character.snapshot()),recipe=recipeById(f.recipeId),quality=qualityFor(scoreOf(f.grades));
   try{const outcome=new SmithingService(c).prepare(c,recipe,quality,f.grades);commit(tower,p,c,f.receipt);p.craftResult={id:f.receipt,kind:'forge',quality,item:recipe.outputs[quality],xp:outcome.xp};p.notice='Forja concluída · '+quality+' · +'+outcome.xp+' Ferraria XP';}
   catch(error){p.notice='Forja não concluída: '+error.message;}
   p.forge=null;
  }
 }
}
export function craftCommand(tower,p,a){
 const result=(ok,message)=>({v:4,type:'progression:result',request:a.request,ok,message,profile:tower.snapshot(p).profile});
 try{
  if(!p.character.data.jobs||!p.character.isAlive)throw Error('Personagem indisponível para esta atividade.');
  if(p.character.data.progressionReceipts?.includes(a.request))return result(true);
  advanceCraft(tower,p);const now=tower.now(),d=a.data;
  if(a.operation==='mine'){
   if(d.action==='cancel'){p.professionVisual=null;p.mining=null;return result(true,'Mineração cancelada.');}
   if(d.action==='start'){
    if(p.mining||p.forge||p.fishing||p.cook||tower.inCombat(p.id)||p.instanceId)throw Error('Encerre o combate ou a atividade atual.');
    const vein=veinFor(tower,p,d.id),bag=new Inventory(p.character),m={veinId:d.id,mapId:p.mapId,hp:p.character.data.hp,started:now,strikeAt:now+MINING.prepareSeconds*1000,endsAt:now+(MINING.prepareSeconds+MINING.timeoutSeconds)*1000,center:MINING.zoneMin+randomInt(0,1000000)/1000000*(MINING.zoneMax-MINING.zoneMin)};
    if(!vein||!miningValid(tower,p,m))throw Error('Aproxime-se do veio por um caminho livre.');
    if(p.character.data.minedVeins?.[p.mapId]?.includes(d.id))throw Error('Este veio já foi minerado pelo personagem.');
    if(!bag.owns(PICKAXE))throw Error('Você precisa de uma picareta.');
    const error=bag.acquisitionError(RAW_ORE);if(error)throw Error(error);
    if((p.mineRetry??0)>now)throw Error('Recupere o fôlego antes de tentar novamente.');
    p.axis={x:0,z:0};p.target=null;p.game.cancel();p.cycle.cancel();p.professionVisual=null;p.mining=m;return result(true,'Prepare o golpe.');
   }
   if(d.action!=='strike'||!p.mining)throw Error('Nenhuma mineração em andamento.');
   const m=p.mining;if(now<m.strikeAt)throw Error('Prepare o golpe; aguarde o indicador.');
   if(!miningValid(tower,p,m))throw Error('Mineração interrompida.');
   const vein=veinFor(tower,p,m.veinId);recordProfessionVisual(tower,p,'mining','strike',{x:vein.x,y:(vein.y??0)+1,z:vein.z});const quality=strikeResult(indicatorAt((now-m.strikeAt)/1000),m.center);p.mining=null;p.mineRetry=now+MINING.retrySeconds*1000;
   if(quality==='MISS')return result(false,'Golpe errado. Tente novamente.');
   const c=new Character(p.character.snapshot()),bag=new Inventory(c);if(!bag.owns(PICKAXE))throw Error('Você precisa de uma picareta.');
   bag.acquire(RAW_ORE);gainLifeXP(c.data,'mining',MINING.xp[quality]);c.data.minedVeins??={};c.data.minedVeins[p.mapId]=[...(c.data.minedVeins[p.mapId]??[]),m.veinId];
   commit(tower,p,c,a.request);p.craftResult={id:a.request,kind:'mine',quality,item:RAW_ORE,xp:MINING.xp[quality]};return result(true,quality+' · +1 Minério Bruto');
  }
  if(!nearSmith(tower,p))throw Error('Aproxime-se de Brasa para usar a forja.');
  if(d.action==='start'){
   if(p.forge||p.mining||p.fishing||p.cook||tower.inCombat(p.id)||p.instanceId)throw Error('Encerre o combate ou a atividade atual.');
   const service=new SmithingService(p.character);service.start(d.id);
   p.forge={recipeId:d.id,receipt:a.request,strikes:[],centers:service.centers,grades:[],index:0,state:'heating',at:now,committed:false};p.game.cancel();p.axis={x:0,z:0};return result(true,'Aquecendo a peça…');
  }
  const f=p.forge;if(!f)throw Error('Nenhuma fabricação em andamento.');
  if(d.action==='cancel'){if(f.committed)throw Error('A fabricação já começou; aguarde o resultado.');p.forge=null;return result(true,'Fabricação cancelada sem custo.');}
  if(d.action==='strike'){if(f.strikes.includes(a.request))return result(true,'Golpe já registrado.');if(f.state!=='hammer')throw Error('Aguarde a próxima martelada.');f.strikes.push(a.request);f.grades.push(gradeHammer((now-f.at)/(1000*SMITHING.sweepSeconds[f.index]),f.centers[f.index]));f.state='gap';f.at=now;return result(true,'Golpe registrado.');}
  throw Error('Operação inválida.');
 }catch(error){return result(false,error.message);}
}

// Persisted floors contain travel portals only. Restore mining actions at runtime
// without regenerating geography or changing the stored floor schema/hash.
export function installMiningInteractions(map){
 for(const vein of map.mineralVeins??[])if(!map.interactables.some(i=>i.id===vein.id))map.interactables.push({id:vein.id,x:vein.x,z:vein.z,radius:MINING.interactionRadius,priority:2,label:'Minerar · veio mineral',action:'mining',content:{veinId:vein.id},ignoreObstacles:[vein.obstacleId],highlightRadius:1.2});
}
