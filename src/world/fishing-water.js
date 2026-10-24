import {waterAt,pointInWater} from './water-geometry.js';
import {layerWorld} from './surfaces.js';
import {canStand,clearSegment} from './collision.js';
import {FISHING} from '../domain/fishing.js';
// Existing shore-to-bobber reach (2.4) plus the 1.4 interaction margin.
export function castTarget(world,player,target,config=FISHING){
 const water=waterAt(world,target),layer=layerWorld(world,player.surface??'ground');
 if(!water?.fishingCompatible)throw Error('Escolha um ponto dentro da água.');
 if(water.surface!==(player.surface??'ground')||!canStand(layer,player.x,player.z,.32))throw Error('Você precisa estar em uma margem, fora da água.');
 if(Math.hypot(player.x-target.x,player.z-target.z,(player.y??0)-water.y)>config.maxCastDistance)throw Error('Água fora do alcance. Aproxime-se da margem.');
 if(!clearSegment({...layer,waterBodies:[]},player,{...target,surface:player.surface},.05))throw Error('Não é possível lançar através desse obstáculo.');
 return {id:water.id,waterFeatureId:water.id,x:player.x,z:player.z,y:player.y??0,surface:water.surface,bobber:{x:target.x,z:target.z,y:water.y},heading:Math.atan2(target.x-player.x,target.z-player.z)};
}
export function nearestCast(world,player,config=FISHING){
 let best=null,distance=Infinity;
 for(const water of world.waterBodies??[]){if(water.surface!==(player.surface??'ground')||Math.abs(water.x-player.x)>water.radiusX*1.06+config.maxCastDistance||Math.abs(water.z-player.z)>water.radiusZ*1.06+config.maxCastDistance)continue;
  for(const vertex of water.vertices){const target={x:vertex.x+(water.x-vertex.x)*.12,z:vertex.z+(water.z-vertex.z)*.12,surface:water.surface},d=Math.hypot(target.x-player.x,target.z-player.z);
   if(d>=distance||d>config.maxCastDistance||!pointInWater(water,target))continue;
   try{best=castTarget(world,player,target,config);distance=d;}catch{}
  }
 }return best;
}
