import * as THREE from 'three';
import {insideTerrain} from '../../world/collision.js';
import {belowGround,configureCaveCamera,followsPlayer,regionLayer} from './cave-visibility.js';

export function buildWolfCave(v){
 const a=v.world.awakening.cave,c=v.world.surfaces.find(s=>s.id===a.surface),r=v.world.surfaces.find(s=>s.id===a.ramp);
 // Keep the same light set in both sectors so shader variants remain prepared.
 for(const light of v.scene.children)if(light.isLight)light.layers.enableAll();
 const group=new THREE.Group();v.scene.add(group);v.caveGroup=group;
 const groundColor=v.scene.background.clone(),fogColor=v.scene.fog.color.clone(),dark=new THREE.Color(0x172022);
 const stone=new THREE.MeshStandardMaterial({color:0x999b8c,roughness:1,flatShading:true}),earth=new THREE.MeshStandardMaterial({color:0x747668,roughness:1});
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const context=canvas.getContext('2d');let seed=711;
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=165+(seed%75);context.fillStyle='rgb('+n+','+n+','+n+')';context.fillRect(x,y,1,1);}
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;stone.map=texture;earth.map=texture;
 const rockGeometry=new THREE.DodecahedronGeometry(1,0),dummy=new THREE.Object3D();
 const outlines=[];
 for(const s of c.walkable){
  const points=[];
  if(s.a){const angle=Math.atan2(s.b.z-s.a.z,s.b.x-s.a.x);for(let i=0;i<=16;i++){const t=angle-Math.PI/2+i*Math.PI/16;points.push({x:s.b.x+Math.cos(t)*s.radius,z:s.b.z+Math.sin(t)*s.radius});}for(let i=0;i<=16;i++){const t=angle+Math.PI/2+i*Math.PI/16;points.push({x:s.a.x+Math.cos(t)*s.radius,z:s.a.z+Math.sin(t)*s.radius});}}
  else for(let i=0;i<40;i++){const t=i*Math.PI/20;points.push({x:s.x+Math.cos(t)*s.radius,z:s.z+Math.sin(t)*s.radius});}
  const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,-p.z))),geometry=new THREE.ShapeGeometry(shape);geometry.rotateX(-Math.PI/2);
  const floor=v.mesh(geometry,earth,group,0,c.y,0);floor.castShadow=false;floor.userData.surface=c.id;v.walkableMeshes.push(floor);
  for(const [i,p]of points.entries())if(!(Math.abs(p.x-r.x)<r.halfX+1&&p.z<c.z-c.halfZ+1)&&!c.walkable.some(other=>other!==s&&insideTerrain({walkable:[other]},p.x,p.z,.2))){
   let center=s;if(s.a){const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,t=Math.max(0,Math.min(1,((p.x-s.a.x)*dx+(p.z-s.a.z)*dz)/(dx*dx+dz*dz)));center={x:s.a.x+dx*t,z:s.a.z+dz*t};}const n=Math.hypot(p.x-center.x,p.z-center.z);outlines.push({x:p.x+(p.x-center.x)/n,z:p.z+(p.z-center.z)/n,index:i});
  }
 }
 // Shared, instanced wall rocks follow the navigable contour instead of box partitions.
 const walls=new THREE.InstancedMesh(rockGeometry,stone,outlines.length);
 outlines.forEach((p,i)=>{const height=1.8+.5*Math.sin(i*2.13);dummy.position.set(p.x,c.y+height*.35,p.z);dummy.scale.set(1.3,height,1.25);dummy.rotation.set(i*.17,i*.81,.1);dummy.updateMatrix();walls.setMatrixAt(i,dummy.matrix);walls.setColorAt(i,new THREE.Color().setHSL(.12,.07,.29+(i%5)*.025));});walls.castShadow=true;walls.receiveShadow=true;group.add(walls);
 for(const o of c.obstacles){const mesh=v.mesh(rockGeometry,stone,group,o.x,c.y+.7,o.z);mesh.scale.set(o.radius,1.4,o.radius);}
 // Sparse lair detail, with no crystal/reward implication.
 const bed=v.mesh(new THREE.CircleGeometry(3.4,18),new THREE.MeshStandardMaterial({color:0x655f4b,roughness:1}),group,a.den.x,c.y+.012,a.den.z);bed.rotation.x=-Math.PI/2;bed.scale.y=.7;
 for(let i=0;i<7;i++){const bone=v.mesh(new THREE.CapsuleGeometry(.07,.5,2,4),v.mats.stoneLight,group,a.den.x+Math.cos(i*2)*3,c.y+.09,a.den.z+Math.sin(i*2)*2);bone.rotation.set(Math.PI/2,0,i);}
 const grave=v.box(group,1.1,1.7,.4,a.den.x,c.y+.85,a.den.z,v.mats.stoneLight);grave.visible=false;v.grave=grave;
 regionLayer(group,true);
 const rampGeo=new THREE.PlaneGeometry(r.halfX*2,Math.hypot(r.halfZ*2,r.top));rampGeo.rotateX(-Math.PI/2-Math.atan2(r.top,r.halfZ*2));
 const slope=v.mesh(rampGeo,earth,v.scene,r.x,r.top/2,r.z);slope.material.side=THREE.DoubleSide;slope.layers.enable(1);slope.userData.surface=r.id;v.walkableMeshes.push(slope);
 const mouth=new THREE.Group();v.scene.add(mouth);
 for(const [i,p]of a.rocks.entries()){const mesh=v.mesh(rockGeometry,stone,mouth,p.x,1.2,p.z);mesh.scale.set(p.radius,3.1+i*.3,p.radius);mesh.rotation.y=i*.7;}
 const roof=v.mesh(rockGeometry,stone,mouth,r.x,2.5,r.z+1);roof.scale.set(5.2,2.1,5.5);
 // Faceted rock arch: an irregular vault, open below, connected to the side masses.
 for(let i=0;i<7;i++){const t=i*Math.PI/6,mesh=v.mesh(rockGeometry,stone,mouth,r.x+Math.cos(t)*3.9,1.1+Math.sin(t)*3.2,r.z-r.halfZ+.7);mesh.scale.set(1.5,1.2,2.1);mesh.rotation.z=t*.6;}
 const throat=v.mesh(new THREE.PlaneGeometry(5,4.5),new THREE.MeshBasicMaterial({color:0x151b16,side:THREE.DoubleSide}),mouth,r.x,1.3,r.z-r.halfZ+2);throat.castShadow=false;
 const shade=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({color:0x101713,transparent:true,opacity:0,depthTest:false,depthWrite:false}));shade.position.z=-1;shade.renderOrder=100000;followsPlayer(shade);v.camera.add(shade);v.scene.add(v.camera);
 let blend=0;
 v.updateAwakened=(player,dt=1/60)=>{
  const under=belowGround(player),depth=Math.max(0,Math.min(1,-(player.y??0)/1.8));
  v.caveUnder=under;configureCaveCamera(v.camera,under);v.sun.layers.enableAll();v.hemisphere.layers.enableAll();v.sun.shadow.camera.layers.mask=v.camera.layers.mask;
  blend+=(Math.max(0,Math.min(1,-(player.y??0)/3))-blend)*(1-Math.exp(-dt*9));
  v.scene.background.copy(groundColor).lerp(dark,blend);v.scene.fog.color.copy(fogColor).lerp(dark,blend);v.hemisphere.intensity=1.8-.5*blend;v.sun.intensity=2.6-1.5*blend;
  shade.material.opacity=Math.sin(depth*Math.PI)*.92;shade.visible=shade.material.opacity>.01;shade.scale.set(v.height*(v.canvas.clientWidth/Math.max(1,v.canvas.clientHeight))/2,v.height/2,1);
  grave.visible=under&&!!v.encounter?.respawnAt;
 };
}
