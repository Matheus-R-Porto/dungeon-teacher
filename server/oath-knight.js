import {GUARDIAN as G,GUARDIAN_SKILLS as SKILLS} from '../shared/guardian.js';
import {moveWithCollision,clearSegment} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function segmentDistance(p,a,b){const x=b.x-a.x,z=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*x+(p.z-a.z)*z)/(x*x+z*z||1)));return Math.hypot(p.x-a.x-x*t,p.z-a.z-z*t);}
export class OathKnight {
 constructor(world){this.w=world;this.e=world.enemies[0];this.index=0;this.projectiles=[];this.serial=0;this.phase=1;this.next=0;this.state='intro';this.e.special={skill:'intro',phase:'windup',until:G.introSeconds};}
 targets(){return [...this.w.players.values()].filter(p=>p.character.isAlive);}
 hit(p,power){const e=this.e;this.w.impact(e.id,p.id,{...e.stats,physicalAttack:e.stats.physicalAttack*power},p.character.stats,d=>p.character.damage(d));}
 begin(skill,target){const e=this.e,s=SKILLS[skill],d=Math.max(.001,distance(e,target.game.player));e.heading=Math.atan2(target.game.player.x-e.x,target.game.player.z-e.z);e.targetId=target.id;e.state='attacking';e.special={skill,phase:'windup',until:this.w.time+s.windup,dx:(target.game.player.x-e.x)/d,dz:(target.game.player.z-e.z)/d,x:e.x,z:e.z,range:s.range,width:s.width};}
 step(dt){const w=this.w,e=this.e;if(!e.alive){this.projectiles=[];e.special=null;e.deathTime+=dt;return;}
 if(this.state!=='active')return;
 if(this.phase===1&&e.hp<=e.stats.maxHP*G.phaseAt){this.phase=2;e.frenzy=true;e.special={skill:'last-oath',phase:'windup',until:w.time+1.5};this.next=w.time+1.5;}
 const targets=this.targets();
 for(const shot of this.projectiles){const before={...shot},next=moveWithCollision(w.map,{...shot,y:e.y,surface:e.surface},shot.dx*shot.speed*dt,shot.dz*shot.speed*dt,.15);Object.assign(shot,next);shot.distance+=distance(before,shot);for(const p of targets)if(!shot.hit.has(p.id)&&segmentDistance(p.game.player,before,shot)<=shot.width&&clearSegment(w.map,before,p.game.player,.1)){shot.hit.add(p.id);this.hit(p,shot.power);}if(distance(before,next)<shot.speed*dt*.5||shot.distance>=shot.range)shot.done=true;}
 this.projectiles=this.projectiles.filter(s=>!s.done);
 const sp=e.special;
 if(sp){if(sp.phase==='windup'&&w.time>=sp.until){const s=SKILLS[sp.skill];if(!s){e.special=null;return;}
   if(sp.skill==='arc')this.projectiles.push({id:++this.serial,x:e.x,z:e.z,y:e.y,surface:e.surface,dx:sp.dx,dz:sp.dz,...s,distance:0,hit:new Set()});
   if(sp.skill==='charge'){sp.phase='charge';sp.remaining=s.range;sp.hit=new Set();return;}
   if(sp.skill==='sword'||sp.skill==='rupture')for(const p of targets){const q=p.game.player,dx=q.x-e.x,dz=q.z-e.z;const inArea=sp.skill==='rupture'?distance(e,q)<=s.range:dx*sp.dx+dz*sp.dz>=-.2&&distance(e,q)<=s.range&&Math.abs(dx*sp.dz-dz*sp.dx)<=s.width;if(inArea&&clearSegment(w.map,e,q,.1))this.hit(p,s.power);}
   sp.phase='recovery';sp.until=w.time+s.recovery*(this.phase===2?.75:1);
  }else if(sp.phase==='charge'){const s=SKILLS.charge,before={x:e.x,z:e.z,y:e.y,surface:e.surface},next=moveWithCollision(w.map,e,sp.dx*s.speed*dt,sp.dz*s.speed*dt,e.radius);Object.assign(e,next);const moved=distance(before,e);sp.remaining-=moved;for(const p of targets)if(!sp.hit.has(p.id)&&segmentDistance(p.game.player,before,e)<=s.width&&clearSegment(w.map,before,p.game.player,.1)){sp.hit.add(p.id);this.hit(p,s.power);}if(sp.remaining<=0||moved<s.speed*dt*.5){sp.phase='recovery';sp.until=w.time+s.recovery;}}
  else if(sp.phase==='recovery'&&w.time>=sp.until){e.special=null;this.next=w.time+.25;}return;
 }
 const target=targets.sort((a,b)=>distance(e,a.game.player)-distance(e,b.game.player)||a.id.localeCompare(b.id))[0];e.targetId=target?.id??null;if(!target)return;
 const order=this.phase===2?['arc','sword','charge','sword','rupture']:['sword','arc','rupture','charge'],skill=order[this.index%order.length];
 if(w.time>=this.next&&(skill!=='sword'||distance(e,target.game.player)<3)){this.index++;this.begin(skill,target);return;}
 if(w.time>=(this.repath??0)){e.path=findPath(w.map,e,target.game.player,e.radius,.5)??[];this.repath=w.time+.5;}
 const q=e.path[0];e.state='chasing';if(q){const d=distance(e,q);if(d<.15)e.path.shift();else{const next=moveWithCollision(w.map,e,(q.x-e.x)/d*Math.min(d,2.5*dt),(q.z-e.z)/d*Math.min(d,2.5*dt),e.radius);e.heading=Math.atan2(next.x-e.x,next.z-e.z);Object.assign(e,next);}}
 }
 snapshot(){return {phase:this.phase,projectiles:this.projectiles.map(({hit,...p})=>p)};}
}
