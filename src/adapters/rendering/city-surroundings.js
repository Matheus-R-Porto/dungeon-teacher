import * as THREE from 'three';
import {batchStatic} from './static-batch.js';
import {CITY_WATCHTOWERS} from '../../../shared/city.js';
// Exterior is decorative. The existing authoritative city bounds remain the
// inside face of these walls and closed gates, in both game modes.
export function buildCitySurroundings(view){
 const root=new THREE.Group();root.name='city-surroundings';view.scene.add(root);
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true});
 const stone=material(0x9eaa9a),cap=material(0xc4c4a8),wood=material(0x624b37),roof=material(0x4b6676),grass=material(0x739763),dirt=material(0xb6a17b);
 const mesh=(g,m,x,y,z)=>view.mesh(g,m,root,x,y,z),box=(w,h,d,x,y,z,m=stone)=>view.box(root,w,h,d,x,y,z,m);
 const height=(x,z)=>{const edge=Math.max(Math.abs(x)-34,Math.abs(z)-32,0);return -.08+Math.min(1,edge/20)*(Math.sin(x*.065)*Math.cos(z*.055)*3+Math.sin((x+z)*.03)*2);};
 // Same 6-unit terrain lattice, partitioned for actual frustum culling.
 for(let z=-270;z<300;z+=60)for(let x=-270;x<300;x+=60){
  const ground=new THREE.PlaneGeometry(60,60,10,10);ground.rotateX(-Math.PI/2);const positions=ground.attributes.position;
  for(let i=0;i<positions.count;i++)positions.setY(i,height(x+positions.getX(i),z+positions.getZ(i)));ground.computeVertexNormals();const terrain=mesh(ground,grass,x,0,z);terrain.castShadow=false;terrain.receiveShadow=true;
 }
 const surfaceHeight=(x,z)=>{const x0=Math.floor((x+300)/6)*6-300,z0=Math.floor((z+300)/6)*6-300,tx=(x-x0)/6,tz=(z-z0)/6,a=height(x0,z0),b=height(x0+6,z0),c=height(x0,z0+6),d=height(x0+6,z0+6);return tx+tz<=1?a+(b-a)*tx+(c-a)*tz:d+(c-d)*(1-tx)+(b-d)*(1-tz);};
 // Winding road ribbons continue well beyond the gates, following terrain.
 for(const side of ['south','east']){const vertices=[];for(let i=0;i<=45;i++){const t=i*3,x=side==='south'?Math.sin(t*.025)*8:31+t,z=side==='south'?29+t:7+Math.sin(t*.03)*8;for(const sign of [-1,1]){const px=x+(side==='south'?sign*2:0),pz=z+(side==='east'?sign*2:0);vertices.push(px,surfaceHeight(px,pz)+.12,pz);}}const indices=[];for(let i=0;i<45;i++){const n=i*2;if(side==='south')indices.push(n,n+2,n+1,n+1,n+2,n+3);else indices.push(n,n+1,n+2,n+1,n+3,n+2);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const road=mesh(geometry,dirt,0,0,0);road.castShadow=false;}
 const occludable=start=>{const group=new THREE.Group(),clones=new Map();for(const child of root.children.slice(start)){group.add(child);child.traverse(n=>{if(n.material){if(!clones.has(n.material)){const m=n.material.clone();m.transparent=true;clones.set(n.material,m);}n.material=clones.get(n.material);}});}root.add(group);group.updateMatrixWorld(true);view.occluders.push({box:new THREE.Box3().setFromObject(group),materials:[...clones.values()]});};
 const wall=(x,z,length,vertical=false)=>{const start=root.children.length;box(vertical?1.2:length,3.5,vertical?length:1.2,x,1.65,z);box(vertical?1.4:length,.22,vertical?length:1.4,x,3.5,z,cap);for(let t=-length/2+.6;t<length/2;t+=1.8)box(vertical?1.3:.9,.65,vertical?.9:1.3,x+(vertical?0:t),3.88,z+(vertical?t:0),cap);occludable(start);};
 wall(0,-29,62);wall(-31,0,58,true);wall(-17,29,28);wall(17,29,28);wall(31,-12,34,true);wall(31,20,18,true);
 const tower=(x,z,h,conical=true)=>{const start=root.children.length;mesh(new THREE.CylinderGeometry(2,2.3,h,10),stone,x,h/2-.1,z);mesh(new THREE.CylinderGeometry(2.25,2.25,.4,10),cap,x,h-.1,z);if(conical)mesh(new THREE.ConeGeometry(2.65,2.7,10),roof,x,h+1.4,z);else for(let i=0;i<8;i++){const a=i*Math.PI/4;box(.65,.7,.65,x+Math.sin(a)*1.9,h+.4,z+Math.cos(a)*1.9,cap);}for(const dy of [2,4])if(dy<h)box(.23,.7,.07,x,dy,z+2.02,wood);occludable(start);};
 for(const t of CITY_WATCHTOWERS)tower(t.x,t.z,t.height,t.roof);
 // Closed gates explain the non-navigable exterior without adding a public map.
 const gateStart=root.children.length;box(6,1.2,1.8,0,4.2,29,cap);box(5.4,3.6,.22,0,1.7,29,wood);for(const x of [-2,-1,0,1,2])box(.08,3.5,.3,x,1.7,29,cap);occludable(gateStart);const eastGate=root.children.length;box(.24,3.6,6,31,1.7,7,wood);box(1.8,1.2,6,31,4.2,7,cap);occludable(eastGate);
 // Deterministic forest clusters leave roads and the city silhouette readable.
 let seed=42021;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const trees=[];for(let i=0;i<430;i++){const x=(rnd()-.5)*240,z=(rnd()-.5)*240;if(Math.abs(x)<37&&Math.abs(z)<35||z>28&&Math.abs(x-Math.sin((z-29)*.025)*8)<5||x>30&&Math.abs(z-(7+Math.sin((x-31)*.03)*8))<5)continue;trees.push({x,z,s:.8+rnd()*1.2,y:height(x,z),t:rnd()});}
 const dummy=new THREE.Object3D(),instanced=(geometry,m,items,transform)=>{
  const regions=new Map();for(const p of items){const key=Math.floor(p.x/24)+','+Math.floor(p.z/24);if(!regions.has(key))regions.set(key,[]);regions.get(key).push(p);}
  for(const region of regions.values()){const inst=new THREE.InstancedMesh(geometry,m,region.length);region.forEach((item,i)=>{transform(item,dummy);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.castShadow=true;inst.receiveShadow=true;root.add(inst);inst.computeBoundingSphere();}
 };
 instanced(new THREE.CylinderGeometry(.19,.32,2.8,6),wood,trees,(p,d)=>{d.position.set(p.x,p.y+1.4*p.s,p.z);d.scale.setScalar(p.s);});
 instanced(new THREE.ConeGeometry(1.7,4.5,7),material(0x3c6951),trees.filter(p=>p.t<.6),(p,d)=>{d.position.set(p.x,p.y+4*p.s,p.z);d.scale.setScalar(p.s);});
 instanced(new THREE.IcosahedronGeometry(1.9,1),material(0x537b50),trees.filter(p=>p.t>=.6),(p,d)=>{d.position.set(p.x,p.y+3.4*p.s,p.z);d.scale.set(p.s,p.s*1.15,p.s);});
 const rocks=trees.filter((_,i)=>i%4===0);instanced(new THREE.DodecahedronGeometry(.7,0),stone,rocks,(p,d)=>{d.position.set(p.x+2,p.y+.35,p.z-1);d.scale.set(p.s*1.4,p.s*.7,p.s);});
 batchStatic(root,{spatial:true});view.cityExterior=root;
}
