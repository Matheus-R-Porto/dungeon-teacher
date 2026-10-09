import {MINING} from '../domain/mining.js';
import {seeded,seedOf} from '../domain/random.js';
import {caveAt} from './biomes.js';
import {canStand} from './collision.js';
import {findPath} from './navigation.js';
import {inWater} from './water-features.js';

const segmentDistance=(p,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,length2=dx*dx+dz*dz,t=length2?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/length2)):0;return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);};
function shuffled(list,random){const result=[...list];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}

// Veins live beside the existing generation: own seed stream, own list, and no change to graph, trails, spawns or POIs.
// Pure forest floors get none; transition floors only qualify where the terrain is already subterranean.
export function addMineralVeins(world,config=MINING){
  world.mineralVeins=[];
  if(!world.floorEnvironment||world.floorEnvironment.type==='FOREST')return;
  const random=seeded(seedOf(world.runSeed+':'+world.floorId+':mineral-veins')),{regions}=world.graph;
  const physical={...world,obstacles:[...world.obstacles,...world.gates]};
  const eligible=regions.filter(r=>!['entrance','exit','boss','encounter'].includes(r.type));
  // Optional detours first, so veins reward leaving the main trail; main-path groves fill what remains.
  const order=[...shuffled(eligible.filter(r=>r.optional),random),...shuffled(eligible.filter(r=>!r.optional),random)];
  const trailSegments=world.trails.flatMap(t=>t.points.slice(1).map((b,i)=>({a:t.points[i],b,radius:t.radius})));
  const blockers=world.interactables.map(i=>({x:i.x,z:i.z}));
  const radius=config.veinRadius;
  const valid=(p,region)=>{
    if(caveAt(world,p.z)<config.minCaveAmount)return false;
    if(!canStand(physical,p.x,p.z,radius+config.approachClearance))return false;
    if(Math.hypot(p.x-world.spawn.x,p.z-world.spawn.z)<8||Math.hypot(p.x-world.portal.x,p.z-world.portal.z)<8)return false;
    if(regions.some(r=>['encounter','boss'].includes(r.type)&&Math.hypot(p.x-r.x,p.z-r.z)<r.radius+2))return false;
    if(world.waterFeatures.some(w=>inWater(w,p,radius+1.5))||world.fishingSpots.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<3))return false;
    if(world.enemySpawns.some(e=>Math.hypot(p.x-e.position.x,p.z-e.position.z)<3.5))return false;
    if(blockers.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<3))return false;
    if(world.mineralVeins.some(v=>Math.hypot(p.x-v.x,p.z-v.z)<config.minSpacing))return false;
    if(trailSegments.some(s=>segmentDistance(p,s.a,s.b)<s.radius+radius+.5))return false;
    const distance=Math.hypot(region.x-p.x,region.z-p.z)||1,approach={x:p.x+(region.x-p.x)/distance*(radius+1.3),z:p.z+(region.z-p.z)/distance*(radius+1.3)};
    // The vein must be reachable from the clearing it sits in, with the new rock already counted.
    const withVein={...physical,obstacles:[...physical.obstacles,{id:'candidate',shape:'circle',x:p.x,z:p.z,radius}]};
    return canStand(withVein,approach.x,approach.z,.85)&&!!findPath(withVein,region,approach,.85);
  };
  for(const region of order){
    if(world.mineralVeins.length>=Math.min(config.targetPerFloor,config.maxPerFloor))break;
    for(let attempt=0;attempt<24;attempt++){
      const angle=random()*Math.PI*2,distance=region.radius*(.5+random()*.25),p={x:region.x+Math.sin(angle)*distance,z:region.z+Math.cos(angle)*distance};
      if(!valid(p,region))continue;
      const n=world.mineralVeins.length,vein={id:'vein-'+world.floorId+'-'+n,x:p.x,z:p.z,radius,regionId:region.id,optional:!!region.optional,caveAmount:Number(caveAt(world,p.z).toFixed(3)),obstacleId:'rock-vein-'+world.floorId+'-'+n,state:'available'};
      const obstacle={id:vein.obstacleId,shape:'circle',kind:'mineralVein',x:p.x,z:p.z,radius};
      world.mineralVeins.push(vein);world.obstacles.push(obstacle);physical.obstacles.push(obstacle);
      world.interactables.push({id:vein.id,x:p.x,z:p.z,radius:config.interactionRadius,priority:2,label:'Minerar · veio mineral',action:'mining',content:{veinId:vein.id},ignoreObstacles:[vein.obstacleId],highlightRadius:1.2});
      break;
    }
  }
}
