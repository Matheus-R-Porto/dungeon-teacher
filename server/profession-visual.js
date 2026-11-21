import {FISHING} from '../src/domain/fishing.js';
import {MINING} from '../src/domain/mining.js';
// Transient public animation descriptors; never persisted or used to award items.
export function recordProfessionVisual(tower,p,type,phase,target,{caught=false}={}){
 p.professionVisual={type,phase,target:{x:target.x,y:target.y??(type==='fishing'?.05:1),z:target.z},caught,at:tower.now(),mapId:p.mapId,origin:{x:p.game.player.x,z:p.game.player.z},hp:p.character.data.hp,heading:Math.atan2(target.x-p.game.player.x,target.z-p.game.player.z)};
}
export function professionView(tower,p){
 if(!p?.character.isAlive)return null;const now=tower.now(),position=p.game.player,f=p.fishing,m=p.mining;
 if(f&&p.mapId===f.mapId&&p.character.data.hp>=f.hp&&Math.hypot(position.x-f.origin.x,position.z-f.origin.z)<=.1&&now<f.endsAt){const start=f.castAt-FISHING.castSeconds*1000;return {type:'fishing',phase:now<f.castAt?'cast':now<f.biteAt?'waiting':'bite',elapsed:(now-start)/1000,target:{...f.spot.bobber},heading:f.spot.heading,caught:false};}
 if(m&&p.mapId===m.mapId&&p.character.data.hp>=m.hp&&now<m.endsAt){const vein=tower.world(p.mapId).map.mineralVeins?.find(v=>v.id===m.veinId);if(vein&&Math.hypot(position.x-vein.x,position.z-vein.z)<=MINING.interactionRadius)return {type:'mining',phase:now<m.strikeAt?'prepare':'ready',elapsed:(now-(m.strikeAt-MINING.prepareSeconds*1000))/1000,target:{x:vein.x,y:(vein.y??0)+1,z:vein.z},heading:Math.atan2(vein.x-position.x,vein.z-position.z)};}
 const e=p.professionVisual;if(!e||e.mapId!==p.mapId||p.character.data.hp<e.hp||Math.hypot(position.x-e.origin.x,position.z-e.origin.z)>.1)return null;const elapsed=(now-e.at)/1000;if(elapsed<0||elapsed>(e.type==='fishing'?1.35:.95))return null;
 return {type:e.type,phase:e.phase,elapsed,target:e.target,heading:e.heading,caught:e.caught};
}
