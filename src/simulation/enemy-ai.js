import {seeded} from '../domain/random.js';
import {AI_CONFIG as A} from '../domain/enemies/config.js';
import {COMBAT} from '../domain/combat/config.js';
import {CONFIG} from '../core/config.js';
import {findPath} from '../world/navigation.js';
import {clearSegment,moveWithCollision} from '../world/collision.js';
import {separateBodies,spawnIsClear} from './bodies.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const engaged=new Set(['alert','chasing','attacking']);
export class EnemyAI {
  constructor(combat){this.combat=combat;this.world=combat.game.world;this.metrics={paths:0,fallbacks:0,updates:0};this.debug=false;
    combat.enemies.forEach((e,i)=>{e.ai={perception:i*A.perceptionInterval/combat.enemies.length,repath:i*0.025,alert:0,outside:0,stuck:0,returnTime:0,...(e.noRespawn?{}:{respawnRetry:0}),lastTarget:null,ambientTimer:.5+i*.43,ambientPhase:'idle',random:seeded(e.ambientSeed??i+1)};});
  }
  resolveTarget(id){const c=this.combat;return id===c.character.data.id&&c.character.isAlive&&c.state!=='dead'?c.game.player:null;}
  acquire(e,targetId,reason){if(!e.alive||e.state==='returning'||!this.resolveTarget(targetId))return;e.targetId=targetId;e.aggroReason=reason;e.state='alert';e.ai.alert=A.alertDuration;e.ai.outside=0;e.ai.repath=0;e.ai.stuck=0;e.path=[];}
  onDamaged(e,attackerId){if(!e.targetId)this.acquire(e,attackerId,'damage');}
  returning(e,reason){if(!e.alive||e.state==='returning')return;e.state='returning';e.targetId=null;e.aggroReason=reason;e.path=[];e.ai.repath=0;e.ai.returnTime=0;e.ai.stuck=0;this.combat.enemyCycles.get(e.id)?.cancel();}
  playerDied(){for(const e of this.combat.enemies){if(engaged.has(e.state))this.returning(e,'target-dead');e.targetId=null;this.combat.enemyCycles.get(e.id)?.cancel();}}
  reset(e){Object.assign(e,e.spawnPosition);e.heading=e.spawnHeading;e.hp=e.stats.maxHP;e.state='idle';e.targetId=null;e.aggroReason=null;e.path=[];e.deathTime=0;e.generation++;Object.assign(e.ai,{perception:A.perceptionInterval,repath:0,alert:0,outside:0,stuck:0,returnTime:0,lastTarget:null,ambientPhase:'idle',ambientTimer:.5});this.combat.enemyCycles.delete(e.id);}
  plan(e,destination){this.metrics.paths++;e.path=findPath(this.world,e,destination,e.radius,CONFIG.navigationCell)??[];e.ai.repath=A.repathInterval;e.ai.lastTarget={...destination};return e.path.length>0;}
  approach(e,target,index){
    const start=Math.atan2(e.x-target.x,e.z-target.z),radius=e.stats.attackRange-0.15;
    // Prefer the monster's own approach side, with a small stable angular bias.
    for(let n=0;n<A.approachSamples;n++){const angle=start+(index%3-1)*0.18+n*Math.PI*2/A.approachSamples,p={x:target.x+Math.sin(angle)*radius,z:target.z+Math.cos(angle)*radius};
      if(!clearSegment(this.world,p,target,0.05))continue;
      if(this.plan(e,p)){e.ai.lastTarget={...target};return true;}
    }e.ai.repath=A.repathInterval;e.ai.lastTarget={...target};return false;
  }
  move(e,dt,speed){let remaining=speed*dt,moved=0;
    while(remaining>0.0001&&e.path.length){const point=e.path[0],d=distance(e,point);if(d<A.routeArrival){e.path.shift();continue;}
      const step=Math.min(d,remaining),before={x:e.x,z:e.z},next=moveWithCollision(this.world,e,(point.x-e.x)/d*step,(point.z-e.z)/d*step,e.radius),travel=distance(e,next);e.x=next.x;e.z=next.z;remaining-=step;moved+=travel;
      if(travel>0.0001)e.heading=Math.atan2(e.x-before.x,e.z-before.z);else{e.path=[];break;}
    }return moved;
  }
  ambient(e,dt){const a=e.ai;a.ambientTimer-=dt;if(a.ambientPhase==='wander'){this.move(e,dt,.65);if(!e.path.length){a.ambientPhase='pause';a.ambientTimer=.8+a.random()*1.2;}}if(a.ambientTimer>0)return;if(a.ambientPhase==='pause'){a.ambientPhase='turn';e.heading=a.random()*Math.PI*2;a.ambientTimer=.5+a.random();return;}if(a.ambientPhase==='wander'){e.path=[];a.ambientPhase='pause';a.ambientTimer=1+a.random();return;}const angle=a.random()*Math.PI*2,r=.7+a.random()*.8,destination={x:e.spawnPosition.x+Math.sin(angle)*r,z:e.spawnPosition.z+Math.cos(angle)*r};a.ambientPhase=this.plan(e,destination)?'wander':'idle';a.ambientTimer=2+a.random()*2;}
  reposition(e,target,dt){
    const a=e.ai,c=this.combat;if(e.behaviorType!=='ranged'||distance(e,target)>=e.retreatDistance)return false;
    if(a.repath<=0){const angle=Math.atan2(e.x-target.x,e.z-target.z);for(const offset of [0,.7,-.7,1.4,-1.4]){const p={x:target.x+Math.sin(angle+offset)*e.preferredDistance,z:target.z+Math.cos(angle+offset)*e.preferredDistance};if(distance(p,e.spawnPosition)>e.leashRange||!clearSegment(this.world,p,target,.05))continue;if(this.plan(e,p))break;}}
    if(!e.path.length)return false;e.state='chasing';c.enemyCycles.get(e.id)?.cancel();this.move(e,dt,e.chaseSpeed);return true;
  }
  update(dt){const c=this.combat;this.metrics.updates++;const player=this.resolveTarget(c.character.data.id);
    for(let index=0;index<c.enemies.length;index++){const e=c.enemies[index],a=e.ai;if(e.dormant)continue;a.repath=Math.max(0,a.repath-dt);
      if(!e.alive){e.targetId=null;e.path=[];c.enemyCycles.get(e.id)?.cancel();e.deathTime=e.noRespawn?Math.min(COMBAT.enemyRemovalDelay,e.deathTime+dt):e.deathTime+dt;e.state=e.deathTime<COMBAT.enemyRemovalDelay?'dead':e.noRespawn?'removed':'respawning';if(e.noRespawn)continue;a.respawnRetry-=dt;
        if(e.deathTime>=e.respawnTime&&a.respawnRetry<=0){a.respawnRetry=A.respawnRetry;if(spawnIsClear(this.world,e,c.enemies,c.game.player))this.reset(e);}continue;}
      if(engaged.has(e.state)){
        const target=this.resolveTarget(e.targetId);if(!target||!c.retaliation){this.returning(e,'target-lost');}
        else {const fromSpawn=distance(target,e.spawnPosition);if(fromSpawn>e.leashRange+A.leashMargin)a.outside+=dt;else if(fromSpawn<e.leashRange)a.outside=0;
          if(a.outside>=A.leashGrace||distance(e,e.spawnPosition)>e.leashRange+A.hardLeashMargin)this.returning(e,'leash');}
      }
      if(e.state==='returning'){
        e.hp=Math.min(e.stats.maxHP,e.hp+e.returnRegen*dt);a.returnTime+=dt;
        if(distance(e,e.spawnPosition)<=A.spawnArrival){e.hp=e.stats.maxHP;e.state='idle';e.path=[];e.aggroReason=null;a.perception=A.reacquireDelay;a.ambientPhase='idle';a.ambientTimer=.5;continue;}
        if(a.repath<=0&&(!e.path.length||a.stuck>0.3))this.plan(e,e.spawnPosition);
        const moved=this.move(e,dt,e.returnSpeed);a.stuck=moved>0.0001?0:a.stuck+dt;
        if((a.stuck>=A.stuckTimeout||a.returnTime>=A.returnTimeout)&&spawnIsClear(this.world,e,c.enemies,c.game.player)){this.reset(e);this.metrics.fallbacks++;}continue;
      }
      if(e.state==='idle'){
        if(e.ambient&&!e.aggressive)this.ambient(e,dt);
        a.perception-=dt;if(a.perception<=0){a.perception=A.perceptionInterval;if(c.retaliation&&e.aggressive&&player&&distance(e,player)<=e.detectionRange&&(!e.requiresLOS||clearSegment(this.world,e,player,0.05)))this.acquire(e,c.character.data.id,'perception');}continue;
      }
      if(e.state==='alert'){a.alert-=dt;if(a.alert<=0)e.state='chasing';continue;}
      const target=this.resolveTarget(e.targetId);if(!target)continue;
      if(this.reposition(e,target,dt))continue;
      if(c.inRange(e,e.stats.attackRange)){e.state='attacking';e.path=[];a.stuck=0;e.heading=Math.atan2(target.x-e.x,target.z-e.z);}
      else {if(e.state==='attacking')c.enemyCycles.get(e.id)?.cancel();e.state='chasing';
        if(a.repath<=0&&(!e.path.length||!a.lastTarget||distance(target,a.lastTarget)>=A.targetMoveThreshold))this.approach(e,target,index);
        const moved=this.move(e,dt,e.chaseSpeed);a.stuck=moved>0.0001?0:a.stuck+dt;
        if(a.stuck>=A.stuckTimeout)this.returning(e,'unreachable');
      }
    }
    separateBodies(this.world,c.enemies,player,dt);
  }
}
