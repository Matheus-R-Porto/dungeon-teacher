import {canStand,moveWithCollision} from '../world/collision.js';
import {CONFIG} from '../core/config.js';
import {AI_CONFIG as A} from '../domain/enemies/config.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// Bodies are soft for the player: contact pushes the monster when the static
// world permits it. The player's own swept move still cannot cross a body.
export function resolvePlayerBodies(game,enemies){
  const alive=enemies.filter(e=>e.alive),p=game.player,old=game.previous;
  const dx=p.x-old.x,dz=p.z-old.z,length=Math.hypot(dx,dz);
  if(length){
    for(const e of alive){const t=Math.max(0,Math.min(1,((e.x-old.x)*dx+(e.z-old.z)*dz)/(length*length))),near={x:old.x+t*dx,z:old.z+t*dz};
      if(distance(e,near)<e.radius+CONFIG.playerRadius+A.bodyPadding){const moved=moveWithCollision(game.world,e,dx,dz,e.radius);e.x=moved.x;e.z=moved.z;}
    }
    const bodyWorld={...game.world,obstacles:[...game.world.obstacles,...alive.map(e=>({shape:'circle',x:e.x,z:e.z,radius:e.radius}))]};
    const moved=moveWithCollision(bodyWorld,old,dx,dz,CONFIG.playerRadius);
    game.distance-=Math.max(0,length-distance(old,moved));p.x=moved.x;p.z=moved.z;p.moving=distance(old,p)>0.0001;
    if(p.moving)p.heading=Math.atan2(p.x-old.x,p.z-old.z);
  }
}
export function separateBodies(world,enemies,player,dt){
  const alive=enemies.filter(e=>e.alive),maxStep=A.separationSpeed*dt;
  const shift=(e,dx,dz)=>{const next=moveWithCollision(world,e,dx,dz,e.radius);e.x=next.x;e.z=next.z;};
  for(let pass=0;pass<A.separationPasses;pass++){
    for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){
      const a=alive[i],b=alive[j],d=distance(a,b),overlap=a.radius+b.radius+A.bodyPadding-d;if(overlap<=0)continue;
      const angle=(i*2.399+j)*1.7,nx=d?(a.x-b.x)/d:Math.cos(angle),nz=d?(a.z-b.z)/d:Math.sin(angle),step=Math.min(overlap/2,maxStep);
      shift(a,nx*step,nz*step);shift(b,-nx*step,-nz*step);
    }
    if(player)for(const e of alive){const d=distance(e,player),overlap=e.radius+CONFIG.playerRadius+A.bodyPadding-d;if(overlap<=0)continue;const nx=d?(e.x-player.x)/d:1,nz=d?(e.z-player.z)/d:0;shift(e,nx*overlap,nz*overlap);
      // If a wall prevented the yielding body from moving, slide the player out
      // only to a valid static position; no teleport through geometry.
      const remaining=e.radius+CONFIG.playerRadius-distance(e,player);if(remaining>0.001){const next=moveWithCollision(world,player,-nx*remaining,-nz*remaining,CONFIG.playerRadius);player.x=next.x;player.z=next.z;}
    }
  }
}
export function spawnIsClear(world,enemy,enemies,player){const p=enemy.spawnPosition;return canStand(world,p.x,p.z,enemy.radius)&&(!player||distance(p,player)>A.respawnClearance)&&enemies.every(e=>e===enemy||!e.alive||distance(p,e)>enemy.radius+e.radius+A.bodyPadding);}
