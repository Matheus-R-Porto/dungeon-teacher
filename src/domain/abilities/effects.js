// Reusable periodic scheduling. Applying an effect never grants an instant tick.
export class PeriodicEffects {
  constructor(){this.items=[];}
  apply(effect){const item={...effect,elapsed:0,next:effect.interval,ticks:0};this.items=this.items.filter(e=>e.key!==item.key);this.items.push(item);return item;}
  update(dt,valid,apply){for(const e of [...this.items]){if(!valid(e)){this.items=this.items.filter(x=>x!==e);continue;}e.elapsed+=dt;while(e.next<=e.duration+1e-9&&e.next<=e.elapsed+1e-9){apply(e);e.ticks++;e.next+=e.interval;if(!valid(e))break;}if(e.elapsed>=e.duration-1e-9||!valid(e))this.items=this.items.filter(x=>x!==e);}}
  clear(){this.items=[];}
}
export class Projectiles {
  constructor(){this.items=[];this.sequence=0;}
  launch(definition){const p={...definition,id:++this.sequence,age:0};this.items.push(p);return p;}
  update(dt,resolveTarget,clearSegment,onImpact){
    this.items=this.items.filter(p=>{const target=resolveTarget(p.target,p);if(!target)return false;const available=Math.min(dt,p.lifetime-p.age);if(available<=0)return false;const dx=target.x-p.x,dz=target.z-p.z,distance=Math.hypot(dx,dz),step=Math.min(distance,p.speed*available),next={x:p.x+(distance?dx/distance*step:0),z:p.z+(distance?dz/distance*step:0)};
      if(!clearSegment(p,next))return false;p.x=next.x;p.z=next.z;p.age+=available;if(distance<=step+1e-9){onImpact(p,target);return false;}return p.age<p.lifetime;
    });
  }
  clear(){this.items=[];}
}
