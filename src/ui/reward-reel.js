export class RewardReel {
  constructor(reward,pool,{speed=12,duration=3}={}){
    if(!pool.includes(reward.itemId))throw Error('Recompensa inválida.');
    if(!Number.isFinite(speed)||speed<=0||!Number.isFinite(duration)||duration<=0)throw Error('Duração inválida.');
    Object.assign(this,{reward,speed,duration});this.offset=0;this.phase='spinning';this.elapsed=0;
    this.cards=Array.from({length:100},(_,i)=>pool[i%pool.length]);
  }
  stop(){if(this.phase!=='spinning')return;this.phase='slowing';this.from=this.offset;this.target=Math.ceil(this.offset)+16;this.cards[this.target]=this.reward.itemId;this.elapsed=0;}
  // Skip reaches the SAME target; it never invokes a grant or a random source.
  finish(){this.stop();this.update(this.duration);}
  update(dt){
    if(!Number.isFinite(dt)||dt<0)throw Error('Tempo inválido.');
    if(this.phase==='spinning'){this.offset=(this.offset+dt*this.speed)%40;return;}
    if(this.phase!=='slowing')return;
    this.elapsed=Math.min(this.duration,this.elapsed+dt);const t=this.elapsed/this.duration;
    this.offset=this.from+(this.target-this.from)*(1-(1-t)**3);if(t===1)this.phase='stopped';
  }
}
