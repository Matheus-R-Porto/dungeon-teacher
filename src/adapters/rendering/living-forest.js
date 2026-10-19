import * as THREE from 'three';
import {artSprite} from './art.js';
import {seeded,seedOf} from '../../domain/random.js';
import {insideTerrain} from '../../world/collision.js';

export function buildLivingForest(v){
 const w=v.world,l=w.livingTower,random=seeded(seedOf(w.seed+':living-art')),props=[],waters=[],materials=new Map();
 const add=(variant,x,z,size)=>{const sprite=materials.has(variant)?new THREE.Sprite(materials.get(variant)):artSprite('/assets/environment/living-v050.png',4,2,variant%4,Math.floor(variant/4),size,size);if(variant>=3)materials.set(variant,sprite.material);sprite.scale.set(size,size,1);sprite.center.y=.08;sprite.position.set(x,.03,z);v.scene.add(sprite);props.push(sprite);return sprite;};
 const shadowGeometry=new THREE.CircleGeometry(1,20);shadowGeometry.rotateX(-Math.PI/2);
 const shadowMaterial=new THREE.MeshBasicMaterial({color:0x203c31,transparent:true,opacity:.2,depthWrite:false});
 for(const p of l.props){const sprite=add(p.variant,p.x,p.z,p.size);
  if(p.kind==='tree'){
   const shadow=new THREE.Mesh(shadowGeometry,shadowMaterial);shadow.position.set(p.x,.04,p.z);shadow.scale.set(p.size*.25,1,p.size*.16);v.scene.add(shadow);
   v.occluders.push({center:new THREE.Vector3(p.x,p.size*.4,p.z),radius:p.size*.27,materials:[sprite.material]});
  }
 }
 for(const o of w.obstacles.filter(o=>o.kind!=='livingTree'&&o.kind!=='mineralVein'&&!o.id?.startsWith('ruin-column-')))add(o.kind==='ruin'?7:4,o.x,o.z,Math.max(2.6,(o.halfX??1)*3));
 for(const r of w.graph.regions)for(let i=0;i<9+w.floorId*3;i++){
  const a=random()*Math.PI*2,d=r.radius*(.65+random()*.3);add(5,r.x+Math.sin(a)*d,r.z+Math.cos(a)*d,1.8+random()*.9);
 }
 // Forest fringe is outside the walkable union, so its trunks cannot hide a valid passage.
 for(const r of w.graph.regions)for(let i=0;i<12;i++){const a=i*Math.PI/6,x=r.x+Math.sin(a)*(r.radius+3),z=r.z+Math.cos(a)*(r.radius+3);if(!insideTerrain(w,x,z,-1.2)){const size=6+random()*2,sprite=add(w.floorId===3?2:i%3,x,z,size);v.occluders.push({center:new THREE.Vector3(x,size*.4,z),radius:size*.27,materials:[sprite.material]});}}
 const pools=[...(w.waterFeatures??[]).map(p=>({...p,radiusX:p.waterBounds.radiusX,radiusZ:p.waterBounds.radiusZ,traversable:true})),...l.water];
 const waterMaterial=new THREE.MeshStandardMaterial({color:0x528d87,roughness:.32,metalness:.15,transparent:true,opacity:.88});
 const rimMaterial=new THREE.MeshStandardMaterial({color:0x6c8970,roughness:1});
 for(const p of pools){
  const shape=new THREE.Shape();for(let i=0;i<=32;i++){const a=i*Math.PI*2/32,r=1+.06*Math.sin(a*5+p.x);const x=Math.cos(a)*p.radiusX*r,y=Math.sin(a)*p.radiusZ*r;if(!i)shape.moveTo(x,y);else shape.lineTo(x,y);}
  const geometry=new THREE.ShapeGeometry(shape);geometry.rotateX(-Math.PI/2);
  const rim=new THREE.Mesh(geometry,rimMaterial);rim.position.set(p.x,.045,p.z);rim.scale.set(1.1,1,1.1);v.scene.add(rim);
  const water=new THREE.Mesh(geometry,waterMaterial);water.position.set(p.x,.058,p.z);v.scene.add(water);waters.push(water);
  for(let i=0;i<3;i++)add(6,p.x+(i-1)*p.radiusX*.7,p.z+p.radiusZ*.85,2.4);
 }
 if(l.futureArena){const a=l.futureArena;for(let i=0;i<5;i++){const angle=i*Math.PI*2/5;add(7,a.x+Math.sin(angle)*9,a.z+Math.cos(angle)*9,3.8);} }
 v.updateLivingForest=(time,player,reducedMotion)=>{
  // Bounded local updates; distant props still use standard renderer frustum culling.
  for(const p of props)p.visible=Math.abs(p.position.x-player.x)<48&&Math.abs(p.position.z-player.z)<48;
  for(const p of waters){p.visible=Math.abs(p.position.z-player.z)<48&&Math.abs(p.position.x-player.x)<48;if(p.visible)p.position.y=.058+(reducedMotion?0:Math.sin(time*.8+p.position.x)*.003);}
 };
 v.forestStats={...v.forestStats,livingProps:props.length,livingTrees:l.props.filter(p=>p.kind==='tree').length,pools:pools.length};
}
