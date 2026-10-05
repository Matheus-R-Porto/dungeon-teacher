export class RemoteState {
  constructor(player,now){this.id=player.id;this.name=player.name;this.samples=[];this.push(player.state,now);}
  push(state,now){this.samples.push({...state,at:now});if(this.samples.length>12)this.samples.shift();}
  sample(now,delay=100){
    const time=now-delay;
    while(this.samples.length>2&&this.samples[1].at<=time)this.samples.shift();
    const a=this.samples[0],b=this.samples[1]??a;
    const t=a===b?1:Math.max(0,Math.min(1,(time-a.at)/Math.max(1,b.at-a.at)));
    const delta=Math.atan2(Math.sin(b.heading-a.heading),Math.cos(b.heading-a.heading));
    return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,heading:a.heading+delta*t,moving:time<=this.samples.at(-1).at+250&&(t<1?a.moving:b.moving)};
  }
}
