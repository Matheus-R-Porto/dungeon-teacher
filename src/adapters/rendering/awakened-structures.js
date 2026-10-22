import * as THREE from 'three';
export function buildAwakened(v){
 const a=v.world.awakening;if(!a)return;
 if(a.fortress){const layer=v.world.surfaces.find(s=>s.id===a.fortress.deck),d={...layer,...layer.visualBase};for(const dx of [-6,6])for(const dz of [-5,5]){v.mesh(new THREE.CylinderGeometry(1.4,1.8,9,8),v.mats.darkStone,v.scene,d.x+dx,4.5,d.z+dz);for(let k=0;k<6;k++){const angle=k*Math.PI/3;v.box(v.scene,.45,.8,.45,d.x+dx+Math.cos(angle)*1.2,9,d.z+dz+Math.sin(angle)*1.2,v.mats.stoneLight);}}}
 if(!a.cave)return;for(const o of v.occluders)o.surface='ground';
 const cave=v.world.surfaces.find(s=>s.id===a.cave.surface),r=v.world.surfaces.find(s=>s.id===a.cave.ramp),ground=[...v.scene.children].filter(o=>o.isMesh||o.isSprite||o.isGroup),group=new THREE.Group();v.scene.add(group);
 const mat=new THREE.MeshStandardMaterial({color:0x45515c,roughness:1}),floor=v.box(group,cave.halfX*2,.25,cave.halfZ*2,cave.x,cave.y-.125,cave.z,mat);floor.userData.surface=cave.id;v.walkableMeshes??=[];v.walkableMeshes.push(floor);
 const walls=[...cave.obstacles,{shape:'rect',x:cave.x-18,z:cave.z,halfX:.7,halfZ:26},{shape:'rect',x:cave.x+18,z:cave.z,halfX:.7,halfZ:26},{shape:'rect',x:cave.x,z:cave.z+26,halfX:18,halfZ:.7}];
 for(const o of walls){const material=mat.clone();material.transparent=true;const mesh=o.shape==='circle'?v.mesh(new THREE.DodecahedronGeometry(o.radius),material,group,o.x,cave.y+1,o.z):v.box(group,o.halfX*2,4,o.halfZ*2,o.x,cave.y+2,o.z,material);v.occluders.push({surface:cave.id,box:new THREE.Box3().setFromObject(mesh),materials:[material]});}
 const slope=new THREE.PlaneGeometry(r.halfX*2,Math.hypot(r.halfZ*2,r.top));slope.rotateX(-Math.PI/2-Math.atan2(r.top,r.halfZ*2));const ramp=v.mesh(slope,v.mats.darkStone,v.scene,r.x,r.top/2,r.z);ramp.material.side=THREE.DoubleSide;ramp.userData.surface=r.id;v.walkableMeshes.push(ramp);
 const arch=new THREE.Group();v.scene.add(arch);for(const dx of [-3.2,3.2])v.mesh(new THREE.DodecahedronGeometry(2),v.mats.darkStone,arch,r.x+dx,.9,r.z-r.halfZ);v.box(arch,7,1.1,2,r.x,2.4,r.z-r.halfZ,v.mats.stone);
 for(let i=0;i<8;i++){const x=cave.x+(i%2?15:-15),z=cave.z-22+i*6;v.mesh(new THREE.OctahedronGeometry(.35),new THREE.MeshStandardMaterial({color:0x9bd5e8,emissive:0x4785aa,emissiveIntensity:1}),group,x,cave.y+1,z);}
 const grave=v.box(group,1.1,1.7,.4,a.cave.den.x,cave.y+.85,a.cave.den.z,v.mats.stoneLight);grave.visible=false;v.grave=grave;
 v.updateAwakened=player=>{const under=(player.y??0)<-.4;for(const o of ground)o.visible=!under;group.visible=under;floor.visible=under;if(under){v.scene.background.setHex(0x18232f);v.scene.fog.color.setHex(0x18232f);v.hemisphere.intensity=1.25;v.sun.intensity=1.1;}grave.visible=under&&!!v.encounter?.respawnAt;};
}
