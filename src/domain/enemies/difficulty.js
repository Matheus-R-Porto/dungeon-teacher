import {findPath} from '../../world/navigation.js';
import {clearSegment} from '../../world/collision.js';
import {layerWorld} from '../../world/surfaces.js';
import {seedOf} from '../random.js';

// Shared local/authoritative rule. Bosses, MVPs and their reinforcements keep
// their own definitions. Level spread never becomes a party-size multiplier.
export const COMMON_DIFFICULTY=Object.freeze({version:1,ranges:{1:[1,5],2:[3,9],3:[5,13]},hpBase:1.06,hpDepth:.10,attackBase:1.12,attackDepth:.08});
const routes=new WeakMap(),clamp=v=>Math.max(0,Math.min(1,v));
function route(world){
 if(routes.has(world))return routes.get(world);
 const target=world.portal??world.guardianHall?.door,points=target&&(findPath(world,world.spawn,target,.32)??findPath(world,world.spawn,target,.32,.5,true)),segments=[];let distance=0,from=world.spawn;
 for(const to of points??[]){const length=Math.hypot(to.x-from.x,to.z-from.z);if(length)segments.push({from,to,length,start:distance});distance+=length;from=to;}
 const value={segments,total:distance};routes.set(world,value);return value;
}
export function spawnDepth(world,position){
 const r=route(world);if(!r.total)return 0;
 // Underground branches enter the same main route at their walkable entrance.
 const p=position.surface==='white-wolf-cave'?world.awakening?.cave?.entry??position:position,ground=layerWorld(world,p.surface??'ground');let best=null;
 for(const segment of r.segments){const {from,to,length,start}=segment,t=clamp(((p.x-from.x)*(to.x-from.x)+(p.z-from.z)*(to.z-from.z))/(length*length)),q={x:from.x+(to.x-from.x)*t,z:from.z+(to.z-from.z)*t},distance=Math.hypot(p.x-q.x,p.z-q.z);
  // Favor a point connected by a clear walkable segment, not an endpoint
  // across a wall. The route itself is produced by the existing navigator.
  const reachable=clearSegment(ground,p,q,.32),score=distance+(reachable?0:10000);
  if(!best||score<best.score)best={score,depth:(start+t*length)/r.total};
 }
 return clamp(best?.depth??0);
}
export function commonDifficulty(definition,world){
 const range=COMMON_DIFFICULTY.ranges[world.floorId];if(!range||world.arena||world.safe||definition.isBoss||definition.isMiniBoss||definition.boss||definition.reinforcement||['oathKnight','whiteWolf'].includes(definition.behaviorType))return definition;
 const depth=spawnDepth(world,definition),[low,high]=range,jitter=((seedOf(definition.id)%1001)/1000-.5)*.7;
 definition.level=Math.max(low,Math.min(high,Math.round(low+(high-low)*depth+jitter)));
 const t=(definition.level-low)/(high-low),base={...definition.stats},stats={...base};
 stats.maxHP=Math.round(base.maxHP*(COMMON_DIFFICULTY.hpBase+COMMON_DIFFICULTY.hpDepth*t));
 for(const key of ['physicalAttack','magicAttack'])if(base[key]>0)stats[key]=Math.max(base[key]+1,Math.round(base[key]*(COMMON_DIFFICULTY.attackBase+COMMON_DIFFICULTY.attackDepth*t)));
 definition.stats=stats;definition.difficulty={version:1,depth,level:definition.level,range:[...range],baseStats:base};return definition;
}
