import {seeded,seedOf} from '../domain/random.js';
import {clearSegment,moveWithCollision} from '../world/collision.js';
import {surfaceId} from '../world/surfaces.js';
export const roamingEnabled=(map,e)=>Number.isInteger(map.floorId)&&!e.isBoss&&!e.isMiniBoss&&!e.reinforcement&&!e.roamingSuppressed;
export function inWolfRoom(map,p,radius=0){const den=map.awakening?.cave?.den;return !!den&&surfaceId(p)===surfaceId(den)&&Math.hypot(p.x-den.x,p.z-den.z)<=10.5-radius;}
export function resumeExploration(e,time=0){e.targetId=null;e.path=[];e.state='idle';e.roam=null;e.explorationOrigin={x:e.x,z:e.z};e.perceptionAt=time+2;e.hp=e.stats.maxHP;}
// Short, collision-checked segments do not need A*. At most six choices per 1–3 seconds.
export function roam(map,e,dt,time,{territory=null,speed=.8,peers=[]}={}){
 const a=e.roam??={random:seeded(seedOf(e.id+':'+e.generation)),at:time+.25,goal:null,phase:"pause",decisions:0};
 if(e.ai){e.ai.ambientPhase=a.goal?"wander":a.phase;e.ai.ambientTimer=a.at-time;}
 if(a.goal){const dx=a.goal.x-e.x,dz=a.goal.z-e.z,d=Math.hypot(dx,dz),step=Math.min(d,speed*dt),next=moveWithCollision(map,e,dx/Math.max(d,.001)*step,dz/Math.max(d,.001)*step,e.radius),travel=Math.hypot(next.x-e.x,next.z-e.z);
  if(d<.08||travel<.00001||territory&&!territory(next)){a.goal=null;a.phase="pause";a.at=time+.8+a.random()*1.7;}
  else{e.heading=Math.atan2(next.x-e.x,next.z-e.z);Object.assign(e,{x:next.x,z:next.z,y:next.y??0,surface:surfaceId(next)});}return;
 }
 if(time<a.at)return;if(a.phase==="pause"){a.phase="turn";e.heading=a.random()*Math.PI*2;a.at=time+.3+a.random()*.4;return;}a.decisions++;a.at=time+1+a.random()*2;
 for(let i=0;i<6;i++){const angle=a.random()*Math.PI*2,r=1.2+a.random()*2.6,p={x:e.x+Math.sin(angle)*r,z:e.z+Math.cos(angle)*r,y:e.y??0,surface:surfaceId(e)};
  if(territory?!territory(p):Math.hypot(p.x-(e.explorationOrigin??e.spawnPosition).x,p.z-(e.explorationOrigin??e.spawnPosition).z)>e.leashRange*.9)continue;
  if((map.interactables??[]).some(q=>q.action==='travel'&&Math.hypot(p.x-q.x,p.z-q.z)<(q.radius??2)+e.radius))continue;
  if(peers.some(q=>q!==e&&q.alive&&surfaceId(q)===surfaceId(e)&&Math.hypot(p.x-q.x,p.z-q.z)<e.radius+q.radius+.4))continue;
  if(clearSegment(map,e,p,e.radius)){a.goal=p;break;}
 }
}
