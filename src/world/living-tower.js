import {installWaterGeometry} from './water-geometry.js';
import {seeded,seedOf} from '../domain/random.js';
import {canStand,clearSegment} from './collision.js';
import {findPath} from './navigation.js';
import {EXPEDITION} from '../domain/expedition.js';

export const LIVING_TOWER_VERSION=1;
const identities=['Bosque das Ruínas','Jardim Esquecido','Clareira Ancestral'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

// Additive runtime migration: the immutable persisted geography remains the source.
// No IDs, entrances, exits, encounters or coordinates in that source are replaced.
export function expandLivingTower(source){
 if(source.floorId<1||source.floorId>3)return installWaterGeometry(structuredClone(source));
 if(source.livingTower){if(source.livingTower.version!==LIVING_TOWER_VERSION)throw Error('Versão da Torre Viva incompatível.');return installWaterGeometry(structuredClone(source));}
 const w=structuredClone(source),floor=w.floorId,random=seeded(seedOf(w.runSeed+':living:'+floor)),shared=!!w.sharedPolicy;
 w.livingTower={version:LIVING_TOWER_VERSION,identity:identities[floor-1],baseBounds:{...w.bounds},regions:[],props:[],water:[],respawn:{slime:24,wolf:32,clearance:6}};
 const living=w.livingTower,main=w.graph.mainPath.map(id=>w.graph.regions.find(r=>r.id===id));
 // Two short loops leave and rejoin a single clearing: they cannot bypass campaign gates.
 for(let i=0;i<2;i++){
  const anchor=main[i===0?1:5],side=anchor.x>=0?1:-1;
  const r={id:'living-'+floor+'-'+i,type:'grove',optional:true,x:anchor.x+side*(36+floor*3),z:anchor.z,radius:11+floor,name:i?'Memorial das raízes':'Margem dos viajantes',landmark:i?3:2};
  living.regions.push(r.id);w.graph.regions.push(r);w.walkable.push({x:r.x,z:r.z,radius:r.radius});
  for(const sign of [-1,1]){
   const points=[{x:anchor.x,z:anchor.z},{x:(anchor.x+r.x)/2,z:r.z+sign*(10+floor)},{x:r.x,z:r.z}];
   const trail={id:r.id+'-trail-'+sign,from:anchor.id,to:r.id,main:false,points,radius:3.6};
   w.graph.connections.push({id:trail.id,from:anchor.id,to:r.id,main:false});w.trails.push(trail);
   for(let k=1;k<points.length;k++)w.walkable.push({a:points[k-1],b:points[k],radius:trail.radius});
  }
  living.water.push({id:r.id+'-pool',x:r.x,z:r.z+6,radiusX:3.2,radiusZ:2.1,traversable:false});
  const count=i===0?floor:floor-1;
  for(let k=0;k<count;k++)w.enemySpawns.push({id:w.id+':'+r.id+'-wolf-'+k,enemyType:'wolf',position:{x:r.x+(k-(count-1)/2)*3,z:r.z-2},overrides:{optional:true,aggressive:floor>1,ambient:floor===1,noRespawn:!shared,respawnTime:32,ambientSeed:seedOf(r.id+k),rewardXP:EXPEDITION.xp[floor-1],rewardGold:0,stats:{maxHP:70+floor*15,physicalAttack:8+floor}}});
 }
 // Space for the future encounter; no boss or progression dependency is introduced.
 if(floor===3)living.futureArena={...living.regions.map(id=>w.graph.regions.find(r=>r.id===id)).at(-1),purpose:'future-boss',active:false};
 for(const r of w.graph.regions){
  w.bounds.minX=Math.min(w.bounds.minX,r.x-r.radius-4);w.bounds.maxX=Math.max(w.bounds.maxX,r.x+r.radius+4);
  const count=5+floor*2;
  for(let i=0;i<count;i++){
   const angle=i*Math.PI*2/count+(random()-.5)*.2,p={x:r.x+Math.sin(angle)*(r.radius-1.4),z:r.z+Math.cos(angle)*(r.radius-1.4)};
   // Protect all route centerlines, existing spawns, fishing/mining interactions and portals.
   const nearTrail=w.trails.some(t=>t.points.slice(1).some((b,k)=>{const a=t.points[k],dx=b.x-a.x,dz=b.z-a.z,t0=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));return distance(p,{x:a.x+dx*t0,z:a.z+dz*t0})<t.radius+1.1;}));
   if(nearTrail||(w.waterBodies??[]).some(b=>distance(p,b)<Math.max(b.radiusX,b.radiusZ)*1.06+2.7)||living.water.some(b=>distance(p,b)<Math.max(b.radiusX,b.radiusZ)*1.06+2.7)||w.enemySpawns.some(s=>distance(p,s.position)<3)||w.interactables.some(s=>distance(p,s)<4)||!canStand(w,p.x,p.z,1))continue;
   const id='living-tree-'+r.id+'-'+i;
   w.obstacles.push({id,shape:'circle',kind:'livingTree',...p,radius:.55});
   living.props.push({id,kind:'tree',...p,variant:i%3,size:5.8+random()*1.2+floor*.35});
  }
  living.props.push({id:'living-ruin-'+r.id,kind:'ruin',x:r.x-4,z:r.z+3,variant:3,size:3.2});
 }
 installWaterGeometry(w);
 // Validate additions with the actual collision model, not just graph connectivity.
 for(const t of w.trails.filter(t=>t.id.startsWith('living-')))for(let i=1;i<t.points.length;i++)if(!clearSegment(w,t.points[i-1],t.points[i],.85)&&!findPath(w,t.points[i-1],t.points[i],.85))throw Error('Expansão bloqueou uma trilha.');
 for(const s of w.enemySpawns)if(!canStand(w,s.position.x,s.position.z,.85))throw Error('Spawn inválido na Torre Viva: '+s.id);
 w.navRevision=(w.navRevision??0)+1;return w;
}
