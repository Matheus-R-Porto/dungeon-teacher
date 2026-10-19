import {expandLivingTower} from './living-tower.js';
import {seeded,seedOf} from '../domain/random.js';

// v1 is deliberately unchanged. This opt-in composition never writes its source.
export function expandOpenTower(source,{enabled=true}={}){
 if(!enabled)return expandLivingTower(source);
 const w=expandLivingTower(source);if(w.floorId<1||w.floorId>3)return w;
 if(w.openTower){if(w.openTower.version!==2)throw Error('Expansão aberta incompatível.');return w;}
 const regions=w.graph.regions,first=regions.find(r=>r.id===w.livingTower.regions[0]);
 const x=first.x+(first.x<0?-1:1)*17,z=first.z-8;
 const deck={id:'ruin-'+w.floorId+'-upper',kind:'deck',x,z:z+12,halfX:6,halfZ:5,y:3.2};
 const ramp={id:'ruin-'+w.floorId+'-stairs',kind:'ramp',x:x-3,z:z+3,halfX:1.7,halfZ:4,y:0,top:3.2,to:deck.id};
 w.surfaces=[ramp,deck];
 // One continuous convex meadow, with an irregular silhouette; trails are landmarks only.
 const points=regions.flatMap(r=>Array.from({length:8},(_,i)=>({x:r.x+Math.cos(i*Math.PI/4)*(r.radius+7),z:r.z+Math.sin(i*Math.PI/4)*(r.radius+7)})));
 for(const dx of [-14,14])for(const dz of [-7,23])points.push({x:x+dx,z:z+dz});
 points.sort((a,b)=>a.x-b.x||a.z-b.z);const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
 const half=list=>{const out=[];for(const p of list){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}return out;};
 const vertices=[...half(points).slice(0,-1),...half([...points].reverse()).slice(0,-1)];
 w.openTower={version:2,baseVersion:1,vertices,structures:[{id:'ruin-'+w.floorId,x,z,deck:deck.id,ramp:ramp.id}],groundOnlyMonsters:true};
 w.walkable.push({shape:'polygon',vertices});
 w.bounds={minX:Math.min(...vertices.map(p=>p.x))-2,maxX:Math.max(...vertices.map(p=>p.x))+2,minZ:Math.min(...vertices.map(p=>p.z))-2,maxZ:Math.max(...vertices.map(p=>p.z))+2};
 const random=seeded(seedOf(w.runSeed+':open-v2:'+w.floorId));
 // Sparse groves across the new meadow, leaving broad routes between recognizable landmarks.
 for(let i=0;i<100;i++){
  const p={x:w.bounds.minX+random()*(w.bounds.maxX-w.bounds.minX),z:w.bounds.minZ+random()*(w.bounds.maxZ-w.bounds.minZ)};
  if(Math.abs(p.x-x)<11&&p.z>z-6&&p.z<z+20||w.enemySpawns.some(s=>Math.hypot(s.position.x-p.x,s.position.z-p.z)<4)||w.interactables.some(s=>Math.hypot(s.x-p.x,s.z-p.z)<5)||regions.some(r=>Math.hypot(r.x-p.x,r.z-p.z)<r.radius+2))continue;
  if(!vertices.every((a,k)=>cross(a,vertices[(k+1)%vertices.length],p)>3))continue;
  const id='open-tree-'+w.floorId+'-'+i;
  w.obstacles.push({id,shape:'circle',kind:'livingTree',...p,radius:.55});w.livingTower.props.push({id,kind:'tree',...p,size:5.8+random(),variant:i%3});
 }
 for(const dx of [-5.5,5.5])for(const dz of [7.5,16.5])w.obstacles.push({id:`ruin-column-${w.floorId}-${dx}-${dz}`,shape:'rect',x:x+dx,z:z+dz,halfX:.4,halfZ:.4});
 w.interactables.push({id:'lookout-'+w.floorId,x:deck.x+2,z:deck.z+1,y:deck.y,surface:deck.id,radius:2,priority:1,label:'Examinar o mirante · F',action:'examine',content:{eyebrow:'RUÍNAS DA TORRE',title:'Mirante dos viajantes',text:'A antiga sentinela contemplava a floresta daqui. A escadaria liga este mirante ao terreno do mesmo andar.'},highlightHeight:deck.y+.06});
 w.navRevision++;return w;
}
