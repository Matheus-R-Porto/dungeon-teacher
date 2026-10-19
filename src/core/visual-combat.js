// Presentation only: no timers here can delay or authorize gameplay attacks.
export const VISUAL_COMBAT = Object.freeze({restSeconds:5,drawSeconds:.24,sheathSeconds:.32,strideLength:3.2,walkFrames:5});
const offensive = new Set(['windup','impact','active','recovery']);
export class VisualCombat {
  constructor(){this.state='exploration';this.blend=0;this.lastAction=-Infinity;this.walkDistance=0;}
  update(input,time){
    const dt=Math.max(0,Math.min(.1,time-(this.time??time)));this.time=time;
    const distance=this.position?Math.hypot(input.x-this.position.x,input.z-this.position.z):0;
    if(input.moving&&distance<2)this.walkDistance+=distance;
    this.position??={x:0,z:0};this.position.x=input.x;this.position.z=input.z;
    const hurt=Number.isFinite(input.hp)&&Number.isFinite(this.hp)&&input.hp<this.hp;this.hp=input.hp;
    const attack=offensive.has(input.phase)||input.animation==='attack';
    if(hurt)this.hurtUntil=time+.24;
    if(attack||hurt)this.lastAction=time;
    if(input.weaponType!==this.weapon){this.weapon=input.weaponType;this.blend=0;this.lastAction=attack||hurt?time:-Infinity;}
    if(input.visualCombatRemaining>0)this.lastAction=Math.max(this.lastAction,time-VISUAL_COMBAT.restSeconds+input.visualCombatRemaining);
    const active=!!this.weapon&&input.hp!==0&&(attack||time<this.hurtUntil||time-this.lastAction<VISUAL_COMBAT.restSeconds);
    if(!(time<this.hurtUntil))this.blend=Math.max(0,Math.min(1,this.blend+(active?dt/VISUAL_COMBAT.drawSeconds:-dt/VISUAL_COMBAT.sheathSeconds)));
    this.state=input.hp===0?'dead':time<this.hurtUntil?'hurt':active?(this.blend<1?'drawing':attack?'attacking':'combat'):(this.blend>0?'sheathing':'exploration');
    this.walkFrame=Math.floor(this.walkDistance/VISUAL_COMBAT.strideLength*VISUAL_COMBAT.walkFrames)%VISUAL_COMBAT.walkFrames;
    return this;
  }
}
