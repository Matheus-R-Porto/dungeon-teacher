import {CONFIG} from '../core/config.js';
import {canStand,clearSegment} from '../world/collision.js';
import {layerWorld,surfaceId} from '../world/surfaces.js';
import {pointInWater} from '../world/water-geometry.js';
export const EXPLORATION_VERSION=1;
export const emptyExploration=()=>({version:1,maps:{}});
export function decodeExploration(value){
 if(value===undefined)return emptyExploration();
 if(!value||value.version!==1||!value.maps||typeof value.maps!=='object'||Array.isArray(value.maps)||Object.keys(value.maps).length>2048)throw Error('Exploração inválida; save preservado.');
 const maps={};let size=0;
 for(const [key,bits] of Object.entries(value.maps)){if(!/^[\w:.-]{1,220}$/.test(key)||typeof bits!=='string'||bits.length>65536||!/^[0-9a-f]*$/.test(bits)||(size+=bits.length)>4000000)throw Error('Dados de exploração inválidos; save preservado.');maps[key]=bits;}
 return {version:1,maps};
}
function hash(text){let a=2166136261,b=5381;for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619);b=Math.imul(b,33)^text.charCodeAt(i);}return (a>>>0).toString(16)+(b>>>0).toString(16);}
export function navigationEnvironment(world,player){
 const surface=surfaceId(player),layer=layerWorld(world,surface),bounds=layer.bounds;
 const signature=JSON.stringify([bounds,layer.walkable,layer.obstacles.map(({open,...o})=>o),layer.waterBodies]);
 const key='v1:'+world.id+':'+surface+':'+hash(signature);
 const step=Math.max(.75,Math.max(bounds.maxX-bounds.minX,bounds.maxZ-bounds.minZ)/384);
 return {key,world,layer,surface,bounds,step,width:Math.ceil((bounds.maxX-bounds.minX)/step),height:Math.ceil((bounds.maxZ-bounds.minZ)/step),name:surface==='white-wolf-cave'?'Covil do Lobo Branco':surface.includes('ramp')?'Passagem · '+world.name:world.name};
}
// Broad-phase filtering only: exact existing collision predicates still decide visibility.
function box(o){if(o.vertices)return {minX:Math.min(...o.vertices.map(p=>p.x)),maxX:Math.max(...o.vertices.map(p=>p.x)),minZ:Math.min(...o.vertices.map(p=>p.z)),maxZ:Math.max(...o.vertices.map(p=>p.z))};if(o.a)return {minX:Math.min(o.a.x,o.b.x)-o.radius,maxX:Math.max(o.a.x,o.b.x)+o.radius,minZ:Math.min(o.a.z,o.b.z)-o.radius,maxZ:Math.max(o.a.z,o.b.z)+o.radius};const x=o.halfX??o.radius??o.radiusX,z=o.halfZ??o.radius??o.radiusZ;return {minX:o.x-x,maxX:o.x+x,minZ:o.z-z,maxZ:o.z+z};}
export class Exploration {
 constructor(character,onChange=()=>{}){this.character=character;this.onChange=onChange;this.revision=0;this.visible=new Set();this.changed=[];}
 bind(world,player){
  const surface=surfaceId(player);if(this.world===world&&this.surface===surface&&this.navRevision===world.navRevision)return false;
  const env=navigationEnvironment(world,player);this.world=world;this.surface=surface;this.navRevision=world.navRevision;this.environment=env;this.spatial={};for(const k of ['obstacles','walkable','waterBodies'])if(env.layer[k])this.spatial[k]=env.layer[k].map(o=>({o,b:box(o)}));
  const store=this.character.data.exploration??=emptyExploration(),length=Math.ceil(env.width*env.height/4),saved=store.maps[env.key];
  this.bits=Array.from({length},(_,i)=>parseInt(saved?.[i]??'0',16));this.types=new Uint8Array(env.width*env.height);this.lastCell=-1;this.visible.clear();this.revision++;return true;
 }
 index(x,z){const e=this.environment,c=Math.floor((x-e.bounds.minX)/e.step),r=Math.floor((z-e.bounds.minZ)/e.step);return c<0||r<0||c>=e.width||r>=e.height?-1:r*e.width+c;}
 point(i){const e=this.environment;return {x:e.bounds.minX+(i%e.width+.5)*e.step,z:e.bounds.minZ+(Math.floor(i/e.width)+.5)*e.step};}
 known(i){return i>=0&&!!(this.bits[i>>2]&(1<<(i&3)));}
 type(i,w=this.environment.layer){if(this.types[i])return this.types[i];const p=this.point(i);return this.types[i]=(w.waterBodies??[]).some(b=>pointInWater(b,p))?3:canStand(w,p.x,p.z,CONFIG.playerRadius)?1:2;}
 update(world,player){
  const rebound=this.bind(world,player),cell=this.index(player.x,player.z);this.changed=[];if(cell<0||cell===this.lastCell)return rebound;this.lastCell=cell;this.visible.clear();
  const e=this.environment,radius=7,steps=Math.ceil(radius/e.step),cx=cell%e.width,cy=Math.floor(cell/e.width),w={...e.layer};
  const reach=radius+e.step*2;for(const [k,items]of Object.entries(this.spatial))w[k]=items.filter(({b})=>b.maxX>=player.x-reach&&b.minX<=player.x+reach&&b.maxZ>=player.z-reach&&b.minZ<=player.z+reach).map(v=>v.o);
  // Reachable points must have direct clearance, so corridors never reveal around bends.
  for(let y=Math.max(0,cy-steps);y<=Math.min(e.height-1,cy+steps);y++)for(let x=Math.max(0,cx-steps);x<=Math.min(e.width-1,cx+steps);x++){
   const i=y*e.width+x,p=this.point(i);if(Math.hypot(p.x-player.x,p.z-player.z)>radius||this.type(i,w)!==1)continue;
   if(!clearSegment(w,player,p,CONFIG.playerRadius))continue;this.visible.add(i);
  }
  this.visible.add(cell);
  // First boundary cells communicate the shore/wall, never propagate through it.
  const edge=[];for(const i of this.visible){const x=i%e.width,y=Math.floor(i/e.width);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){if(x+dx<0||x+dx>=e.width||y+dy<0||y+dy>=e.height)continue;const j=i+dx+dy*e.width;if(this.type(j,w)!==1)edge.push(j);}}
  for(const i of edge)this.visible.add(i);
  for(const i of this.visible)if(!this.known(i)){this.bits[i>>2]|=1<<(i&3);this.changed.push(i);}
  if(this.changed.length){this.character.data.exploration.maps[e.key]=this.bits.map(n=>n.toString(16)).join('');this.onChange();}this.revision++;return true;
 }
 markers(){const e=this.environment,points=(e.world.interactables??[]).filter(p=>p.id&&p.enabled!==false&&['travel','guardian'].includes(p.action));
  for(const ramp of e.world.surfaces??[])if(ramp.kind==='ramp'){points.push({id:ramp.id+':entry',x:ramp.x,z:ramp.z-ramp.halfZ-.4,surface:'ground'});points.push({id:ramp.id+':exit',x:ramp.x,z:ramp.z+ramp.halfZ+.4,surface:ramp.to});}
  return points.filter(p=>surfaceId(p)===e.surface&&this.known(this.index(p.x,p.z)));
 }
}
