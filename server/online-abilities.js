import {impactLocked} from './impact.js';
import {ClassCombat} from './class-combat.js';
import {AbilityRuntime} from '../src/simulation/abilities.js';
import {Projectiles} from '../src/domain/abilities/effects.js';
import {clearSegment} from '../src/world/collision.js';
import {VISUAL_COMBAT} from '../src/core/visual-combat.js';
// Adapter for the existing ability runtime. Damage still passes through the
// world's authoritative impact/reward hooks; no second cast/cooldown machine.
export function onlineAbilities(tower,p,w){
 if(p.abilities?.world===w){p.abilities.character=p.character;return p.abilities;}
 p.abilities?.interrupt('death');
 const combat={game:p.game,get character(){return p.character;},enemies:w.enemies,projectiles:new Projectiles(),random:w.random,state:'idle',playerCycle:p.cycle,pursuitRepath:0,
  get target(){return w.enemies.find(e=>e.id===p.target?.id&&e.generation===p.target?.generation);},get currentTarget(){return p.target?.id;},
  approach(target){if(!target)return false;return p.game.moveTo({x:target.x,z:target.z,surface:target.surface})!==false;},cancel(){p.target=null;p.game.cancel();p.cycle.cancel();},emit(){},
  onResourceChange(){p.character.data.onlineAbilityCooldowns=Object.fromEntries([...p.abilities.cooldowns].map(([id,end])=>[id,tower.now()+Math.max(0,end-p.abilities.time)*1000]));}
 };
 const r=p.abilities=new AbilityRuntime(combat,{notify:m=>p.notice=m});r.world=w;r.impactBlocked=()=>impactLocked(p,w.time);r.classEngine=new ClassCombat(tower,p,w,r);
 for(const [id,end]of Object.entries(p.character.data.onlineAbilityCooldowns??{}))if(end>tower.now())r.cooldowns.set(id,(end-tower.now())/1000);
 const inRange=r.inRange.bind(r);r.inRange=(a,target)=>!a.requiresTarget||((p.game.player.surface??'ground')===(target?.surface??'ground')&&inRange(a,target));
 r.damage=(effect,target,stats,source)=>{
  if(!target?.alive||target.state==='returning')return;
  const attack={...stats,physicalAttack:(effect.damageType==='magic'?stats.magicAttack:stats.physicalAttack)*effect.power},defense={...target.stats,physicalDefense:effect.damageType==='magic'?(target.stats.magicDefense??0):target.stats.physicalDefense};
  r.classEngine.attackContext={a:{id:source,magic:effect.damageType==='magic'},element:effect.damageType==='magic'?'neutral':'physical',skill:true};let result;try{result=w.impact(p.id,target.id,attack,defense,damage=>target.damage(damage));}finally{r.classEngine.attackContext=null;}r.character=p.character;r.metrics.impacts++;p.lastCombat=tower.now();
  if(result.hit&&target.alive){target.targetId=r.classEngine.threatTarget(target);target.state='chasing';}if(!target.alive){target.targetId=null;target.deadAt=w.time;target.path=[];w.cycles.get(target.id)?.cancel();}
 };
 return r;
}
export function tickOnlineAbilities(tower,p,w,dt){if(!p.character.data.jobs)return;const r=onlineAbilities(tower,p,w);r.combat.state=!p.character.isAlive?'dead':r.active?r.combat.state:p.target?'chasing':'idle';r.character.updateFoodTime(tower.now());r.update(dt);r.projectiles.update(dt,ref=>r.target(ref),(a,b)=>clearSegment(w.map,a,b,.05),(shot,target)=>r.damage(shot.effect,target,shot.stats,shot.ability));if(r.busy)p.visualCombatRemaining=VISUAL_COMBAT.restSeconds;return r.busy;}
