import * as THREE from 'three';
import {castleStone} from './castle-stone.js';

export function buildCastle(v){
 const outside=v.world.castle,inside=v.world.castleInterior;if(!outside&&!inside)return;
 const group=new THREE.Group();v.scene.add(group);
 const stone=new THREE.MeshStandardMaterial({color:0x858781,roughness:1}),dark=new THREE.MeshStandardMaterial({color:0x424d52,roughness:1}),trim=new THREE.MeshStandardMaterial({color:0xb3ad93,roughness:.9}),wood=new THREE.MeshStandardMaterial({color:0x413b35,roughness:1});
 const cloth=new THREE.MeshStandardMaterial({color:0x374c69,roughness:1,side:THREE.DoubleSide});
 castleStone(stone);stone.color.setHex(0xffffff);
 const x=outside?.x??0,y=outside?.y??0,z=outside?.z??0;
 const box=(w,h,d,dx,dy,dz,mat=stone)=>v.box(group,w,h,d,x+dx,y+dy,z+dz,mat);
 const arch=(dx,dz,width,height)=>{
  const r=width/2,shape=new THREE.Shape();shape.moveTo(-r-.55,0);shape.lineTo(-r-.55,height);shape.lineTo(r+.55,height);shape.lineTo(r+.55,0);shape.lineTo(r,0);shape.lineTo(r,height-r-.5);shape.absarc(0,height-r-.5,r,0,Math.PI,false);shape.lineTo(-r,0);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.75,bevelEnabled:false,curveSegments:8});v.mesh(geometry,trim,group,x+dx,y,z+dz-.35);
 };
 const blocks=[];
 if(outside){
  box(20,y,14,0,-y/2,2,stone);
  box(4,5,1.2,-8,2.5,-1);box(10,5,1.2,5,2.5,-1);box(20,5,1.2,0,2.5,7);
  for(const dx of [-10,10])box(1.2,5,8,dx,2.5,3);
  arch(-3,-1,6,6.4);
  // Cylindrical corner towers, machicolations, merlons and a narrow keep silhouette.
  for(const dx of [-9,9])for(const dz of [-1,7]){
   v.mesh(new THREE.CylinderGeometry(1.8,2.2,8,12),stone,group,x+dx,y+4,z+dz);
   v.mesh(new THREE.CylinderGeometry(2.25,1.85,.65,12),trim,group,x+dx,y+7.2,z+dz);
   for(let k=0;k<8;k++){const a=k*Math.PI/4;blocks.push([dx+Math.sin(a)*1.9,8, dz+Math.cos(a)*1.9,.65,1,.65]);}
   box(.3,1.4,.07,dx,5,dz-2.02,dark);
  }
  for(let dx=-8;dx<=8;dx+=1.5){if(dx<-6||dx>0)blocks.push([dx,5.4,-1,.8,.9,1.25]);blocks.push([dx,5.4,7,.8,.9,1.25]);}
  box(6,8,4,3,4,5);v.mesh(new THREE.ConeGeometry(5,3,4),dark,group,x+3,y+9.5,z+5).rotation.y=Math.PI/4;
  for(const dx of [-6,1]){box(1.1,2.5,.08,dx,3.5,-1.7,cloth);box(.1,1.5,.1,dx,3.5,-1.78,trim);}
 }else{
  const floor=box(30,.25,46,0,-.125,0,dark);floor.userData.surface='ground';v.walkableMeshes??=[];v.walkableMeshes.push(floor);
  for(const o of v.world.obstacles){if(o.shape==='circle'){v.mesh(new THREE.CylinderGeometry(.65,.85,4,10),stone,group,o.x,2,o.z);box(2,.25,2,o.x,4,o.z,trim);}else box(o.halfX*2,4,o.halfZ*2,o.x,2,o.z);}
  // Repeated flagstones share a single geometry/material/draw call.
  for(let dz=-21;dz<=21;dz+=2)for(let dx=-13;dx<=13;dx+=2)blocks.push([dx,.025,dz,1.93,.045,1.93]);
  arch(0,21,5,5.6);arch(0,-22,6,5);
  for(const dx of [-10,10])for(const dz of [-17,1,17]){box(1.8,2.8,.12,dx,2.7,dz,cloth);box(.16,1.7,.14,dx,2.7,dz-.1,trim);box(1,.15,.14,dx,3,dz-.12,trim);}
  for(const dx of [-13,13])for(const dz of [-16,0,16]){box(.6,.9,.7,dx,.45,dz,wood);v.mesh(new THREE.ConeGeometry(.3,.8,6),new THREE.MeshBasicMaterial({color:0xffc580}),group,dx,1.2,dz);}
  v.scene.background.setHex(0x222a32);v.scene.fog.color.setHex(0x222a32);v.hemisphere.intensity=1.4;v.sun.intensity=2;
 }
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),trim,blocks.length),dummy=new THREE.Object3D();blocks.forEach(([dx,dy,dz,w,h,d],i)=>{dummy.position.set(x+dx,y+dy,z+dz);dummy.scale.set(w,h,d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.receiveShadow=true;mesh.castShadow=!!outside;group.add(mesh);
 group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||(o.geometry.parameters.height??0)<1)return;const original=o.material;o.material=original.clone();o.material.onBeforeCompile=original.onBeforeCompile;o.material.customProgramCacheKey=original.customProgramCacheKey;o.material.transparent=true;v.occluders.push({box:new THREE.Box3().setFromObject(o),materials:[o.material]});});
}
