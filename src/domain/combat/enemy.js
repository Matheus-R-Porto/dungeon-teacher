import {TRAINING_ENEMY,COMBAT} from './config.js';
export class Enemy {
  constructor(definition=TRAINING_ENEMY){Object.assign(this,structuredClone(definition));this.hp=this.stats.maxHP;this.state='idle';this.deathTime=0;}
  get alive(){return this.hp>0&&this.state!=='removed'&&this.state!=='dead';}
  damage(amount){if(!this.alive||this.state==='returning')return;this.hp=Math.max(0,this.hp-amount);if(!this.hp)this.state='dead';}
  update(dt){if(this.state==='dead'){this.deathTime+=dt;if(this.deathTime>=COMBAT.enemyRemovalDelay)this.state='removed';}}
}
