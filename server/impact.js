import {acceptImpact,abilityInterruptible,impactLocked,impactState,enemyImpactKind,cycleImpactProtection} from '../src/domain/combat/impact.js';
import {ITEMS} from '../src/domain/items/inventory.js';
export {impactLocked,impactState};
export function receiveImpact(world,target,damage){
 const p=world.players.get(target),e=p?null:world.enemies.find(e=>e.id===target),entity=p??e;
 if(!entity)return null;
 const alive=p?p.character.isAlive:e.alive,cycle=p?.cycle??world.cycles.get(target),controller=world.guardian?.e===e?world.guardian:world.bossEncounter?.e===e?world.bossEncounter:null;
 const special=e?.special,controllerEligible=controller&&(controller.interruptible?.()??false);
 const eligible=cycle?.phase==='windup'||abilityInterruptible(p?.abilities)||controllerEligible;
 const kind=p?'player':controller===world.guardian?'boss':enemyImpactKind(e);
 const unwavering=p&&p.abilities?.active&&Object.values(p.character.data.equipment??{}).some(i=>ITEMS[i?.definitionId]?.unwavering);
 const result=acceptImpact(entity,{time:world.time,damage,maxHP:p?p.character.stats.maxHP:e.stats.maxHP,alive,eligible,kind,rules:entity.impactRules,minimumProtection:cycleImpactProtection(cycle,p?p.character.stats.attackSpeed:e.stats.attackSpeed),protectedAction:!!unwavering&&cycle?.phase!=='windup'},()=>{
  if(cycle?.phase==='windup')cycle.cancel();
  if(abilityInterruptible(p?.abilities))p.abilities.interrupt('impact');
  if(controllerEligible)controller.interruptImpact();
  if(p){p.game.cancel();p.axis={x:0,z:0};}else {e.path=[];e.moving=false;}
 });
 if(result){world.events.push({id:++world.eventId,type:'recoil',target,time:world.time,serial:result.serial,until:result.recoilUntil,recoverUntil:result.recoverUntil,protectedUntil:result.protectedUntil,skill:special?.skill??null});if(world.events.length>40)world.events.shift();}
 return result;
}
