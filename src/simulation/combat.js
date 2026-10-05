import {Projectiles} from '../domain/abilities/effects.js';
import {ABILITY_CONFIG} from '../domain/abilities/definitions.js';
import {equippedDefinition} from '../domain/items/inventory.js';
import {AI_CONFIG} from '../domain/enemies/config.js';
import {resolvePlayerBodies} from './bodies.js';
import {COMBAT,PLAYER_STATE as S} from '../domain/combat/config.js';
import {AttackCycle,resolveAttack} from '../domain/combat/attack.js';
import {Enemy} from '../domain/combat/enemy.js';
import {CONFIG} from '../core/config.js';
import {findPath} from '../world/navigation.js';
import {clearSegment} from '../world/collision.js';
export class Combat {
  constructor(game,character,{random=Math.random,onResourceChange=()=>{},enemies=null}={}){
    this.game=game;this.character=character;this.random=random;this.onResourceChange=onResourceChange;
    this.enemies=enemies??[new Enemy()];this.currentTarget=null;this.state=S.IDLE;this.playerCycle=new AttackCycle();
    this.projectiles=new Projectiles();this.enemyCycles=new Map();this.retaliation=true;this.events=[];this.lastResult='—';this.deathTime=0;this.attackRange=COMBAT.playerRange;this.pursuitRepath=0;this.pursuitPoint=null;
  }
  get canAttack(){return !this.game.activity?.busy&&!!equippedDefinition(this.character.data);}
  get target(){return this.enemies.find(e=>e.id===this.currentTarget&&e.alive&&e.state!=='returning')??null;}
  distance(enemy){return Math.hypot(enemy.x-this.game.player.x,enemy.z-this.game.player.z);}
  inRange(enemy,range=this.attackRange){return enemy.alive&&this.distance(enemy)<=range&&clearSegment(this.game.world,this.game.player,enemy,0.05);}
  emit(event){this.events.push({...event,time:this.game.elapsed});if(this.events.length>30)this.events.shift();this.lastResult=event.text;}
  cancel(clear=false){this.abilities?.interrupt();this.playerCycle.cancel();this.game.cancel();if(clear)this.currentTarget=null;if(this.state!==S.DEAD)this.state=S.IDLE;}
  select(id){if(this.game.activity?.busy)return false;if(!this.character.isAlive||this.state===S.DEAD)return false;if(!this.canAttack){this.abilities?.feedback('Equipe uma arma em I para atacar.');return false;}const target=this.enemies.find(e=>e.id===id&&e.alive&&e.state!=='returning');if(!target)return false;this.cancel();this.currentTarget=id;this.state=S.CHASING;this.pursuitPoint=null;this.pursuitRepath=0;return true;}
  moveTo(point){if(this.game.activity?.busy)return false;if(this.state===S.DEAD||!this.character.isAlive)return false;this.cancel();const success=this.game.moveTo(point);this.state=success?S.MOVING:S.IDLE;return success;}
  interact(){if(this.state===S.DEAD)return;this.cancel();this.state=S.INTERACTING;}
  approach(target,range=this.attackRange){
    const game=this.game,r=range-COMBAT.approachMargin;
    const angle=Math.atan2(game.player.x-target.x,game.player.z-target.z);let best=null,bestLength=Infinity;
    for(let i=0;i<COMBAT.approachSamples;i++){
      const a=angle+i*Math.PI*2/COMBAT.approachSamples,p={x:target.x+Math.sin(a)*r,z:target.z+Math.cos(a)*r};
      if(!clearSegment(game.world,p,target,0.05))continue;
      const route=findPath(game.world,game.player,p,CONFIG.playerRadius,CONFIG.navigationCell);if(!route)continue;
      let length=0,previous=game.player;for(const node of route){length+=Math.hypot(node.x-previous.x,node.z-previous.z);previous=node;}
      if(length<bestLength){best=route;bestLength=length;}
    }
    game.path=best??[];this.pursuitPoint={x:target.x,z:target.z};this.pursuitRepath=AI_CONFIG.repathInterval;return !!best;
  }
  strike(attacker,defender,receiver,position,source){
    const result=resolveAttack(attacker,defender,this.random);receiver(result.damage);
    this.emit({x:position.x,z:position.z,source,...result,text:result.hit?`${result.damage}${result.critical?'!':''}`:'MISS'});
  }
  projectileTarget(ref,p){
    if(p?.owner){const owner=this.enemies.find(e=>e.id===p.owner.id&&(e.generation??0)===p.owner.generation);if(!owner?.alive||owner.state==='returning')return null;}
    if(ref?.id===this.character.data.id)return this.character.isAlive?this.game.player:null;
    return this.enemies.find(e=>e.id===ref?.id&&(e.generation??0)===ref.generation&&e.alive&&e.state!=='returning')??null;
  }
  basicImpact(profile,stats,target,source){
    const enemy=source==='player',defender=enemy?target.stats:this.character.stats,magic=profile.damageType==='magic';
    this.strike({...stats,physicalAttack:(magic?stats.magicAttack:stats.physicalAttack)*(profile.power??1)},{...defender,physicalDefense:magic?(defender.magicDefense??0):defender.physicalDefense},damage=>{
      if(enemy){target.damage(damage);if(damage>0&&target.alive)this.ai?.onDamaged(target,this.character.data.id);}else this.character.damage(damage);
    },target,source);
    const event=this.events.at(-1);if(event){event.impact=profile.impact;event.damageType=profile.damageType;}
    if(enemy&&!target.alive){this.emit({x:target.x,z:target.z,text:target.name+' derrotado',death:true});if(this.currentTarget===target.id)this.cancel(true);}
    if(!enemy){if(event?.hit)this.onHostileImpact?.();this.onResourceChange();if(!this.character.isAlive)this.die();}
  }
  basicAttack(profile,stats,target,source,owner){
    if(profile.delivery==='projectile')this.projectiles.launch({x:owner.x,z:owner.z,target:{id:source==='player'?target.id:this.character.data.id,generation:target.generation??0},owner:source==='enemy'?{id:owner.id,generation:owner.generation??0}:null,speed:profile.projectileSpeed,lifetime:ABILITY_CONFIG.projectileLifetime,effect:{...profile,power:profile.power??1},stats:{...stats},source});
    else this.basicImpact(profile,stats,target,source);
  }
  die(){this.game.activity?.cancel('Pesca interrompida.');if(this.state===S.DEAD)return;this.cancel(true);this.state=S.DEAD;this.deathTime=0;this.projectiles.clear();this.ai?.playerDied();this.abilities?.interrupt('death');for(const cycle of this.enemyCycles.values())cycle.cancel();this.emit({x:this.game.player.x,z:this.game.player.z,text:'Você caiu · retornando ao Refúgio',death:true});this.onResourceChange();}
  update(dt,axis,azimuth){
    if(this.game.paused)return;
    const g=this.game,c=this.character;if(g.activity?.busy){axis={x:0,z:0};g.cancel();}this.attackRange=equippedDefinition(c.data)?.basicAttack.attackRange??this.abilities?.autoRange??COMBAT.playerRange;
    if(!this.ai)this.enemies.forEach(e=>e.update(dt));
    this.pursuitRepath=Math.max(0,this.pursuitRepath-dt);
    if(!c.isAlive)this.die();
    if(axis.x||axis.z)this.cancel();
    this.projectiles.update(dt,(ref,p)=>this.projectileTarget(ref,p),(a,b)=>clearSegment(g.world,a,b,.05),(p,target)=>{if(p.ability)this.abilities?.damage(p.effect,target,p.stats,p.ability);else this.basicImpact(p.effect,p.stats,target,p.source);});
    this.abilities?.update(dt);
    if(this.state===S.DEAD){g.previous={...g.player};g.elapsed+=dt;this.deathTime+=dt;g.inCombat=false;this.ai?.update(dt);
      if(this.deathTime>=COMBAT.playerReturnDelay){Object.assign(g.player,g.world.spawn,{heading:Math.PI,moving:false});g.previous={...g.player};c.restoreHP();c.restoreMP();this.state=S.IDLE;this.onResourceChange();this.onPlayerReturn?.();}return;}
    if(this.currentTarget&&(!this.target||!this.canAttack))this.cancel(true);
    const target=this.target;
    if(!this.abilities?.busy&&(this.state===S.CHASING||this.state===S.ATTACKING)&&target){
      if(this.inRange(target)){g.cancel();this.state=S.ATTACKING;}
      else {this.playerCycle.cancel();this.state=S.CHASING;if((!g.path.length||(this.ai&&this.pursuitRepath<=0&&this.pursuitPoint&&Math.hypot(target.x-this.pursuitPoint.x,target.z-this.pursuitPoint.z)>AI_CONFIG.targetMoveThreshold))&&!this.approach(target)){this.cancel();this.emit({x:target.x,z:target.z,text:'Sem caminho livre'});}}
    }
    g.update(dt,axis,azimuth);
    if(this.ai){resolvePlayerBodies(g,this.enemies);this.ai.update(dt);if(this.currentTarget&&!this.target)this.cancel(true); }
    if(!this.abilities?.busy&&this.state===S.CHASING&&target&&this.inRange(target)){g.cancel();this.state=S.ATTACKING;}
    if(this.state===S.ATTACKING&&target)g.player.heading=Math.atan2(target.x-g.player.x,target.z-g.player.z);
    this.playerCycle.advance(dt,c.stats.attackSpeed,()=>this.canAttack&&this.state===S.ATTACKING&&!!this.target&&this.inRange(this.target),()=>{
      const e=this.target;this.basicAttack(equippedDefinition(c.data).basicAttack,c.stats,e,'player',g.player);
    },()=>!this.abilities?.busy);
    for(const enemy of this.enemies){
      if(!this.enemyCycles.has(enemy.id))this.enemyCycles.set(enemy.id,new AttackCycle());
      const cycle=this.enemyCycles.get(enemy.id),valid=()=>this.retaliation&&enemy.alive&&c.isAlive&&(!this.ai||(enemy.state==='attacking'&&enemy.targetId===c.data.id))&&this.inRange(enemy,enemy.stats.attackRange);
      if(!this.ai)enemy.state=enemy.alive?(valid()?'attacking':'idle'):enemy.state;
      if(valid())enemy.heading=Math.atan2(g.player.x-enemy.x,g.player.z-enemy.z);
      cycle.advance(dt,enemy.stats.attackSpeed,valid,()=>{this.basicAttack(enemy.basicAttack??{delivery:'melee',damageType:'physical'},enemy.stats,g.player,'enemy',enemy);});
    }
    if(![S.ATTACKING,S.CHASING,S.DEAD,'casting','usingSkill','recovering','skillApproach'].includes(this.state))this.state=g.player.moving?S.MOVING:S.IDLE;
    g.inCombat=[S.ATTACKING,S.CHASING,'casting','usingSkill','recovering','skillApproach'].includes(this.state)||this.enemies.some(e=>['alert','chasing','attacking'].includes(e.state));
  }
}
