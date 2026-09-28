export class RewardReel {
  constructor(reward,pool){if(!pool.includes(reward.itemId))throw Error('Recompensa inválida.');this.reward=reward;this.offset=0;this.phase='spinning';this.elapsed=0;this.cards=Array.from({length:100},(_,i)=>pool[i%pool.length]);}
  stop(){if(this.phase!=='spinning')return;this.phase='slowing';this.from=this.offset;this.target=Math.ceil(this.offset)+16;this.cards[this.target]=this.reward.itemId;this.elapsed=0;}
  update(dt){if(!Number.isFinite(dt)||dt<0)throw Error('Tempo inválido.');if(this.phase==='spinning'){this.offset=(this.offset+dt*12)%40;return;}if(this.phase!=='slowing')return;this.elapsed=Math.min(3,this.elapsed+dt);const t=this.elapsed/3;this.offset=this.from+(this.target-this.from)*(1-(1-t)**3);if(t===1)this.phase='stopped';}
}
