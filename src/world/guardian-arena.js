import {GUARDIAN as G} from '../../shared/guardian.js';
export function installGuardianDoor(w){
 if(w.floorId!==G.floor||!w.awakening?.fortress||w.guardianHall)return w;
 const deck=w.surfaces.find(s=>s.id===w.awakening.fortress.deck),x=deck.x,z=deck.z;
 w.guardianHall={x,z:z+14,y:6.4,halfX:11,halfZ:10,door:{x,z:z+2,y:6.4,surface:deck.id}};
 deck.visualBase={x,z,halfX:deck.halfX,halfZ:deck.halfZ};deck.z=z+9;deck.halfX=11;deck.halfZ=14;
 const wall={id:'guardian-sealed-door',shape:'rect',x,z:z+4,halfX:11,halfZ:.35};deck.obstacles.push(wall);
 w.interactables=w.interactables.filter(i=>i.id!=='lookout-3');
 w.interactables.push({id:'guardian-door',...w.guardianHall.door,radius:G.entryRadius,priority:5,label:'Enfrentar o guardião · F',action:'guardian',content:{encounter:G.id}});w.navRevision++;
 return w;
}
export function guardianArena(source,id){
 const h=structuredClone(source.guardianHall),vertices=[{x:h.x-11,z:h.z-10},{x:h.x+11,z:h.z-10},{x:h.x+11,z:h.z+10},{x:h.x-11,z:h.z+10}];
 const obstacles=[];for(const dx of [-8,8])for(const dz of [-4,4])obstacles.push({id:`pillar-${dx}-${dz}`,shape:'circle',x:h.x+dx,z:h.z+dz,radius:.8});
 const surface={id:'guardian-floor',kind:'deck',x:h.x,z:h.z,halfX:11,halfZ:10,y:h.y,obstacles};
 return {id,name:'Salão do Último Juramento',floorId:3,environment:'guardian',safe:false,navRevision:1,guardianHall:h,arena:{encounter:G.id,origin:source.id},bounds:{minX:h.x-11,maxX:h.x+11,minZ:h.z-10,maxZ:h.z+10},walkable:[{shape:'polygon',vertices}],obstacles,surfaces:[surface],spawn:{x:h.x,z:h.z-8,y:h.y,surface:surface.id},portal:{x:h.x,z:h.z-8,interactRadius:2},interactables:[],npcs:[],enemySpawns:[{id:id+':knight',enemyType:'oathKnight',position:{x:h.x,z:h.z+3,y:h.y,surface:surface.id},overrides:{noRespawn:true}}]};
}
