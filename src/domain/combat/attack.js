import {COMBAT} from './config.js';
import {clamp} from '../character/stats.js';
export const hitChance=(attacker,defender)=>clamp((attacker.accuracy-defender.evasion)/100,COMBAT.minHit,COMBAT.maxHit);
export function resolveAttack(attacker,defender,random=Math.random){
  if(random()>=hitChance(attacker,defender))return {hit:false,critical:false,damage:0};
  const critical=random()<clamp(attacker.criticalChance/100,0,1);
  const variation=1+(random()*2-1)*COMBAT.variation;
  const damage=Math.max(COMBAT.minimumDamage,Math.round(Math.max(COMBAT.minimumDamage,attacker.physicalAttack-defender.physicalDefense)*variation*(critical?COMBAT.criticalMultiplier:1)));
  return {hit:true,critical,damage};
}
// A cycle owns preparation, one impact, and recovery. Cancellation keeps recovery
// debt, so repeatedly clicking cannot bypass Attack Speed.
export class AttackCycle {
  constructor(){this.phase='idle';this.remaining=0;this.recovery=0;}
  cancel(){if(this.phase==='windup'){this.remaining+=this.recovery;this.recovery=0;this.phase='recovery';}}
  advance(dt,speed,valid,impact,canStart=()=>true){
    if(!Number.isFinite(dt)||dt<0||!Number.isFinite(speed)||speed<=0)throw Error('Tempo ou velocidade de ataque inválidos.');
    if(!valid()){this.cancel();this.remaining=Math.max(0,this.remaining-dt);if(!this.remaining)this.phase='idle';return;}
    let left=dt;
    while(left>1e-10){
      if(this.phase==='idle'){if(!canStart())break;const interval=1/speed;this.phase='windup';this.remaining=interval*COMBAT.windupFraction;this.recovery=interval-this.remaining;}
      const consumed=Math.min(left,this.remaining);left-=consumed;this.remaining-=consumed;
      if(this.remaining>1e-10)break;
      if(this.phase==='windup'){this.phase='recovery';this.remaining=this.recovery;this.recovery=0;if(valid())impact();}
      else this.phase='idle';
      if(!valid()){this.cancel();this.remaining=Math.max(0,this.remaining-left);if(!this.remaining)this.phase='idle';break;}
    }
  }
}
