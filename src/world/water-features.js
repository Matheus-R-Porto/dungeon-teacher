import {FISHING} from '../domain/fishing.js';
import {seeded,seedOf} from '../domain/random.js';
import {canStand} from './collision.js';
import {findPath} from './navigation.js';
// Matches the existing 16-sided lake disk in forest.js; gameplay never reads names.
export function inWater(w,p,padding=0){return ((p.x-w.x)/(w.waterBounds.radiusX+padding))**2+((p.z-w.z)/(w.waterBounds.radiusZ+padding))**2<=1;}
export function addWaterFeatures(world,config=FISHING){
  world.waterFeatures=[];world.fishingSpots=[];
  const physical={...world,obstacles:[...world.obstacles,...world.gates]};
  for(const poi of world.pois.filter(p=>p.kind===2&&p.type!=='futureResource')){
    const region=world.graph.regions.find(r=>r.id===poi.regionId);
    const water={id:'water-'+poi.id,regionId:region.id,x:poi.x,z:poi.z,waterBounds:{radiusX:2.5,radiusZ:1.8},shoreline:[],fishingCompatible:region.optional&&!region.id.endsWith('tip')};
    world.waterFeatures.push(water);
    if(!water.fishingCompatible)continue;
    const random=seeded(seedOf(world.runSeed+':'+world.floorId+':fishing-spots:'+water.id)),offset=(random()-.5)*.5;
    for(let i=0;i<16&&water.shoreline.length<config.spotsPerLake;i++){
      const angle=offset+i*Math.PI*2/16,p={x:water.x+Math.cos(angle)*3.5,z:water.z+Math.sin(angle)*2.8};
      if(inWater(water,p,.85)||!canStand(physical,p.x,p.z,.85)||!findPath(physical,region,p,.85))continue;
      if(world.graph.regions.some(r=>r.type==='encounter'&&Math.hypot(r.x-p.x,r.z-p.z)<r.radius))continue;
      if(water.shoreline.some(s=>Math.hypot(s.x-p.x,s.z-p.z)<2.5))continue;
      const spot={id:'fishing-'+water.id+'-'+water.shoreline.length,waterFeatureId:water.id,regionId:region.id,...p,bobber:{x:water.x+Math.cos(angle)*1.1,z:water.z+Math.sin(angle)*.8},heading:Math.atan2(water.x-p.x,water.z-p.z)};
      water.shoreline.push({...p});world.fishingSpots.push(spot);
      world.interactables.push({id:spot.id,...p,radius:config.interactionRadius,priority:2,label:'Pescar · margem do lago',action:'fishing',content:{spotId:spot.id},highlightRadius:.7});
    }
    if(!water.shoreline.length)throw Error('Lago opcional sem margem de pesca válida.');
  }
}
