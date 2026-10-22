import {canStand} from '../src/world/collision.js';
import {layerWorld,surfaceId} from '../src/world/surfaces.js';
import {AWAKENING as A} from '../src/domain/tower-awakening.js';
export function safeSpawn(w,e,p){
 if(!canStand(layerWorld(w.map,surfaceId(p)),p.x,p.z,e.radius))return false;
 if(w.map.interactables.some(i=>i.action==='travel'&&Math.hypot(i.x-p.x,i.z-p.z)<6))return false;
 // Camera orbit is client-side. This is a conservative distance envelope, NOT proven occlusion.
 if([...w.players.values()].some(q=>{const same=surfaceId(q.game.player)===surfaceId(p);if(surfaceId(p)==='white-wolf-cave'&&surfaceId(q.game.player)==='ground')return false;const distance=Math.hypot(q.game.player.x-p.x,q.game.player.z-p.z);return distance<(same&&surfaceId(p)==='white-wolf-cave'?26:A.respawn.safeDistance);}))return false;
 return !w.enemies.some(q=>q!==e&&q.alive&&surfaceId(q)===surfaceId(p)&&Math.hypot(q.x-p.x,q.z-p.z)<q.radius+e.radius+.4);
}
export function tryRespawn(w,e){
 w.respawnMetrics??={attempts:0,success:0,pending:0};if(w.time<(e.respawnRetryAt??0))return null;e.respawnRetryAt=w.time+A.respawn.retry;
 for(let k=0;k<A.respawn.attempts;k++){w.respawnMetrics.attempts++;const n=(e.respawnCursor??0)+k,angle=n*2.399963,p={...e.spawnPosition};if(n){const radius=3+(n%5)*2;p.x+=Math.cos(angle)*radius;p.z+=Math.sin(angle)*radius;}if(safeSpawn(w,e,p)){e.respawnCursor=0;w.respawnMetrics.success++;return p;}}
 e.respawnCursor=((e.respawnCursor??0)+A.respawn.attempts)%40;return null;
}
