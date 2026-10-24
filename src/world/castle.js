import {GUARDIAN} from '../../shared/guardian.js';
import {canStand} from './collision.js';
import {layerWorld} from './surfaces.js';

export const CASTLE_ID='shared-oath-castle';
export const LOCAL_CASTLE_ID='tower-oath-castle';
export const isCastleId=id=>id===CASTLE_ID||id===LOCAL_CASTLE_ID;

// A runtime composition: persisted floor geography is never rewritten.
export function installCastle(w){
 if(w.floorId!==3||!w.awakening?.fortress||w.castle)return w;
 const deck=w.surfaces.find(s=>s.id===w.awakening.fortress.deck);
 const base=deck.visualBase??deck,x=base.x,z=base.z,y=deck.y;
 w.castle={x,z,y,halfX:10,halfZ:9,entrance:{x:x-3,z:z-3,y,surface:deck.id}};
 deck.x=x;deck.z=z+2;deck.halfX=10;deck.halfZ=7;
 deck.obstacles=[];delete deck.visualBase;delete w.guardianHall;
 w.obstacles=w.obstacles.filter(o=>!o.id?.startsWith('fortress-tower-')&&!o.id?.startsWith('ruin-column-'));
 const foundation={id:'castle-foundation',shape:'rect',x,z:z+2,halfX:10,halfZ:7};
 // Solid foundation replaces the old open space beneath the lookout platform.
 const inside=p=>Math.abs(p.x-x)<11&&Math.abs(p.z-(z+2))<8;
 const removed=new Set((w.livingTower?.props??[]).filter(inside).map(p=>p.id));
 if(w.livingTower)w.livingTower.props=w.livingTower.props.filter(p=>!removed.has(p.id));
 w.obstacles=w.obstacles.filter(o=>!removed.has(o.id));w.obstacles.push(foundation);w.navRevision++;
 for(const e of w.enemySpawns){if((e.position.surface??'ground')!=='ground'||!inside(e.position))continue;
  let found=false;for(let radius=12;radius<=24&&!found;radius+=2)for(let k=0;k<24&&!found;k++){
   const a=k*Math.PI/12,p={x:x+Math.sin(a)*radius,z:z+2+Math.cos(a)*radius,y:0,surface:'ground'};
   if(canStand(layerWorld(w,'ground'),p.x,p.z,.9)&&w.enemySpawns.every(other=>other===e||Math.hypot(other.position.x-p.x,other.position.z-p.z)>2.4)){e.position=p;found=true;}
  }if(!found)throw Error('Não foi possível preservar um spawn próximo ao castelo.');
 }
 // Impassable facade around the open gate; no access from behind the building.
 for(const [suffix,dx,hx]of [['left',-8,2],['right',5,5]])deck.obstacles.push({id:'castle-front-'+suffix,shape:'rect',x:x+dx,z:z-1,halfX:hx,halfZ:.6});
 deck.obstacles.push({id:'castle-back',shape:'rect',x,z:z+7,halfX:10,halfZ:.6});
 for(const dx of [-10,10])deck.obstacles.push({id:'castle-side-'+dx,shape:'rect',x:x+dx,z:z+3,halfX:.6,halfZ:4});
 w.interactables=w.interactables.filter(i=>i.id!=='guardian-door'&&i.id!=='lookout-3');
 w.interactables.push({id:'castle-entry',...w.castle.entrance,radius:2,priority:5,label:'Entrar no Castelo do Último Juramento · F',action:'travel',content:{areaId:w.sharedPolicy?CASTLE_ID:LOCAL_CASTLE_ID,castle:true}});
 w.exits=w.interactables.filter(i=>i.action==='travel').map(i=>({interactionId:i.id,...i.content}));
 w.navRevision++;return w;
}

export function castleInterior(source){
 const shared=!!source.sharedPolicy,id=shared?CASTLE_ID:LOCAL_CASTLE_ID;
 const rect=(id,x,z,halfX,halfZ)=>({id,shape:'rect',x,z,halfX,halfZ});
 // Entry court, two side galleries and a northern hall, with wide connecting doors.
 const obstacles=[rect('west-wall',-15,0,.6,23),rect('east-wall',15,0,.6,23),rect('north-wall',0,23,15,.6),rect('south-left',-9,-23,6,.6),rect('south-right',9,-23,6,.6)];
 for(const x of [-6,6])for(const z of [-13,1,15])obstacles.push(rect('gallery-'+x+'-'+z,x,z,.45,4));
 for(const x of [-11,11])for(const z of [-7,7])obstacles.push({id:'column-'+x+'-'+z,shape:'circle',x,z,radius:.7});
 const spawn={x:0,z:-19,y:0,surface:'ground'},door={x:0,z:19,y:0,surface:'ground'};
 const interactables=[{id:'castle-exit',...spawn,radius:2.5,priority:5,label:'Voltar à pradaria · F',action:'travel',content:{areaId:source.id,castle:true}},
 {id:'guardian-door',...door,radius:GUARDIAN.entryRadius,priority:5,label:'Entrar na sala do Cavaleiro · F',action:'guardian',content:{encounter:GUARDIAN.id}}];
 const positions=[[-10,-12],[10,-8],[-10,3],[10,10],[-10,15],[10,17]];
 return {id,name:'Castelo do Último Juramento',floorId:3,environment:'castle',safe:false,navRevision:1,castleInterior:{origin:source.id,returnSpawn:{...source.castle.entrance},rooms:3},
 bounds:{minX:-15,maxX:15,minZ:-23,maxZ:23},walkable:[{shape:'polygon',vertices:[{x:-15,z:-23},{x:15,z:-23},{x:15,z:23},{x:-15,z:23}]}],obstacles,surfaces:[],spawn,portal:{...door,interactRadius:2.5},interactables,exits:interactables.filter(i=>i.action==='travel').map(i=>({interactionId:i.id,...i.content})),npcs:[],gates:[],pois:[],trails:[],encounters:[],
 guardianHall:{x:0,z:33,y:0,halfX:11,halfZ:10,door},
 enemySpawns:positions.map(([x,z],i)=>({id:id+':sentinel-'+i,enemyType:i%2?'wolf':'trainingSlime',position:{x,z},overrides:{optional:true,aggressive:true,noRespawn:!shared,respawnTime:32,rewardXP:20,rewardGold:0}}))};
}
