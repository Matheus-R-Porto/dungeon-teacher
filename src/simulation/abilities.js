import {Inventory,ITEMS,equippedDefinition,equipmentBlocked} from '../domain/items/inventory.js';
import {ABILITIES,INITIAL_HOTBAR,WEAPONS,ABILITY_CONFIG as A} from '../domain/abilities/definitions.js';
import {PeriodicEffects} from '../domain/abilities/effects.js';
import {resolveAttack} from '../domain/combat/attack.js';
import {COMBAT} from '../domain/combat/config.js';
import {clearSegment} from '../world/collision.js';
export class AbilityRuntime {
  constructor(combat,{notify=()=>{}}={}){this.combat=combat;this.character=combat.character;this.notify=notify;this.hotbar=[...INITIAL_HOTBAR];this.time=0;this.cooldowns=new Map();this.pending=null;this.active=null;this.projectiles=combat.projectiles;this.periodic=new PeriodicEffects();this.lastMessage='';this.metrics={started:0,impacts:0,launched:0,ticks:0};}
  get busy(){return !!(this.pending||this.active);}
  get weapon(){return equippedDefinition(this.character.data)?.weaponType??null;}
  get autoRange(){return equippedDefinition(this.character.data)?.basicAttack.attackRange??WEAPONS[this.weapon]?.basicAttackOverrides.range??COMBAT.playerRange;}
  remaining(id){return Math.max(0,(this.cooldowns.get(id)??0)-this.time);}
  feedback(message){this.lastMessage=message;this.notify(message);return false;}
  target(ref){return ref?this.combat.enemies.find(e=>e.id===ref.id&&(e.generation??0)===ref.generation&&e.alive&&e.state!=='returning')??null:null;}
  targetRef(){const e=this.combat.target;return e?{id:e.id,generation:e.generation??0}:null;}
  reason(a,ref,{buffer=false}={}){
    if(this.combat.game.activity?.busy)return 'Encerre a pesca para usar habilidades';
    if(!a||!(this.character.data.knownAbilities??[]).includes(a.id))return 'Aprenda esta habilidade com TAB';
    if(!this.character.isAlive||this.combat.state==='dead')return 'Você não pode agir agora';
    if(a.weaponRequirements.length&&!a.weaponRequirements.includes(this.weapon))return 'Requer '+a.weaponRequirements.map(w=>WEAPONS[w].name).join(' / ');
    if(a.requiresTarget&&!this.target(ref))return 'Selecione um inimigo válido';
    if(this.remaining(a.id)>(buffer?A.inputBuffer:1e-8))return 'Habilidade em recarga';
    if(!this.character.hasMP(a.manaCost))return 'MP insuficiente';return null;
  }
  request(slot){const id=this.hotbar[slot-1],a=ABILITIES[id];if(!a)return this.feedback('Slot vazio');if(this.combat.game.paused)return false;const ref=this.targetRef(),reason=this.reason(a,ref,{buffer:true});if(reason)return this.feedback(reason);
    this.pending={ability:a,target:ref,expires:this.time+A.intentTimeout,resumeAuto:a.requiresTarget||this.active?.resumeAuto||['attacking','chasing'].includes(this.combat.state)};
    this.feedback('Preparando '+a.name);return true;
  }
  changeWeapon(type){if(!Object.hasOwn(WEAPONS,type))return this.feedback('Arma inválida');if(equipmentBlocked(this.combat))return this.feedback('Não é possível trocar equipamento durante combate.');const inventory=new Inventory(this.character),item=Object.values(ITEMS).find(i=>i.weaponType===type);if(this.weapon===type)return true;try{if(!inventory.owns(item.id))inventory.acquire(item.id);inventory.equip(this.character.data.inventory.slots.findIndex(i=>i?.definitionId===item.id));this.combat.attackRange=this.autoRange;this.combat.onResourceChange();return true;}catch(error){return this.feedback(error.message);}}
  interrupt(reason='cancel'){this.pending=null;this.active=null;if(reason==='death'){this.periodic.clear();this.projectiles.clear();} }
  inRange(a,target){return !a.requiresTarget||(!!target&&Math.hypot(target.x-this.combat.game.player.x,target.z-this.combat.game.player.z)<=a.range&&(!a.requiresLineOfSight||clearSegment(this.combat.game.world,this.combat.game.player,target,.05)));}
  finish(execution){if(this.active!==execution)return;this.active=null;this.combat.state=execution.resumeAuto&&this.combat.target?'chasing':'idle';}
  damage(effect,target,stats,source){if(!target?.alive||target.state==='returning')return;
    const attacker={...stats,physicalAttack:(effect.damageType==='magic'?stats.magicAttack:stats.physicalAttack)*effect.power},defender={...target.stats,physicalDefense:effect.damageType==='magic'?(target.stats.magicDefense??0):target.stats.physicalDefense};
    const result=resolveAttack(attacker,defender,this.combat.random);target.damage(result.damage);this.metrics.impacts++;this.combat.emit({...result,x:target.x,z:target.z,source:'player',ability:source,text:result.hit?`${result.damage}${result.critical?'!':''}`:'MISS'});
    if(result.damage>0&&target.alive)this.combat.ai?.onDamaged(target,this.character.data.id);
    if(!target.alive){this.combat.emit({x:target.x,z:target.z,text:'Slime derrotado',death:true});if(this.combat.currentTarget===target.id)this.combat.cancel(true);}
  }
  apply(effect,execution){const a=execution.ability,target=this.target(execution.target),player=this.combat.game.player,stats=execution.stats;
    if(effect.type==='periodic'){this.periodic.apply({...effect,key:a.id+':'+this.character.data.id,source:this.character.data.id,target:this.character.data.id,value:effect.power+(stats[effect.stat]??0)*(effect.scaling??0)});return;}
    if(!this.inRange(a,target))return;
    if(effect.type==='damage')this.damage(effect,target,stats,a.id);
    if(effect.type==='projectile'){this.projectiles.launch({x:player.x,z:player.z,target:execution.target,speed:effect.speed,lifetime:A.projectileLifetime,effect,stats,ability:a.id});this.metrics.launched++;}
  }
  update(dt){
    this.time+=dt;
    if(!this.character.isAlive||this.combat.state==='dead'){this.interrupt('death');return;}

    this.periodic.update(dt,e=>e.target===this.character.data.id&&this.character.isAlive,e=>{if(e.effectType==='heal'){this.character.heal(e.value);this.combat.onResourceChange();this.metrics.ticks++;this.combat.emit({x:this.combat.game.player.x,z:this.combat.game.player.z,text:'+'+Math.round(e.value),heal:true});}});
    if(this.active){const execution=this.active,a=execution.ability,target=this.target(execution.target);if(a.requiresTarget&&!target){this.interrupt();this.combat.game.cancel();this.combat.state='idle';return;}
      if(target)this.combat.game.player.heading=Math.atan2(target.x-this.combat.game.player.x,target.z-this.combat.game.player.z);
      const elapsed=this.time-execution.started;this.combat.state=elapsed<a.castTime?'casting':elapsed<execution.lastImpact?'usingSkill':'recovering';
      while(execution.index<a.effects.length&&elapsed+1e-9>=a.castTime+a.effects[execution.index].at){this.apply(a.effects[execution.index++],execution);if(this.active!==execution)return;}
      if(elapsed+1e-9>=execution.duration)this.finish(execution);
      if(this.active)return;
    }
    if(!this.pending)return;
    const pending=this.pending,a=pending.ability,reason=this.reason(a,pending.target,{buffer:true});
    if(reason||this.time>pending.expires){this.pending=null;this.combat.game.cancel();this.combat.state='idle';this.feedback(reason??'Intenção expirada');return;}
    const target=this.target(pending.target);
    if(!this.inRange(a,target)){
      this.combat.playerCycle.cancel();this.combat.state='skillApproach';if(!this.combat.game.path.length||this.combat.pursuitRepath<=0){if(!this.combat.approach(target,a.range)){this.pending=null;this.combat.state='idle';this.feedback('Sem caminho livre para a habilidade');}}return;
    }
    this.combat.game.cancel();
    if(this.remaining(a.id)>1e-8||this.combat.playerCycle.phase!=='idle')return;
    const finalReason=this.reason(a,pending.target);if(finalReason){this.pending=null;this.feedback(finalReason);return;}
    this.character.spendMP(a.manaCost);this.cooldowns.set(a.id,this.time+a.cooldown);this.combat.onResourceChange();this.metrics.started++;
    this.pending=null;this.active={...pending,started:this.time,index:0,stats:{...this.character.stats},lastImpact:a.castTime+Math.max(...a.effects.map(e=>e.at)),duration:a.castTime+Math.max(...a.effects.map(e=>e.at))+a.recovery};this.combat.state='casting';this.feedback(a.name);
  }
}
