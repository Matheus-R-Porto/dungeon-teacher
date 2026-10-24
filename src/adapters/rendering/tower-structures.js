import * as THREE from 'three';
export function buildTowerStructures(v){
 v.walkableMeshes=[];
 for(const structure of v.world.openTower?.structures??[]){
  const layer=v.world.surfaces.find(s=>s.id===structure.deck),deck={...layer,...layer.visualBase},ramp=v.world.surfaces.find(s=>s.id===structure.ramp);
  const stone=v.mats.stone.clone();stone.transparent=true;
  const slab=v.box(v.scene,deck.halfX*2,.32,deck.halfZ*2,deck.x,deck.y-.16,deck.z,stone);
  slab.userData.surface=deck.id;v.walkableMeshes.push(slab);
  const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(1.94,.06,1.94),stone,30),dummy=new THREE.Object3D();
  for(let i=0;i<30;i++){dummy.position.set(deck.x-5+(i%6)*2,deck.y+.03,deck.z-4+Math.floor(i/6)*2);dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);tiles.setColorAt(i,new THREE.Color(i%7===0?0x7e896c:i%3===0?0xaaa58b:0xc1b99b));}tiles.receiveShadow=true;v.scene.add(tiles);
  v.occluders.push({box:new THREE.Box3().setFromObject(slab),materials:[stone]});
  if(!v.world.castle)for(const dx of [-5.5,5.5])for(const dz of [-4.5,4.5])v.box(v.scene,.8,deck.y,.8,deck.x+dx,deck.y/2,deck.z+dz,v.mats.stone);
  for(let i=0;i<16;i++){const h=ramp.top*(i+1)/16,z=ramp.z-ramp.halfZ+(i+.5)*ramp.halfZ*2/16;v.box(v.scene,ramp.halfX*2,h,ramp.halfZ*2/16,ramp.x,h/2,z,v.mats.stoneLight);}
  const geometry=new THREE.PlaneGeometry(ramp.halfX*2,Math.hypot(ramp.halfZ*2,ramp.top));
  geometry.rotateX(-Math.PI/2-Math.atan2(ramp.top,ramp.halfZ*2));
  const pick=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));pick.position.set(ramp.x,ramp.top/2+.015,ramp.z);pick.userData.surface=ramp.id;v.scene.add(pick);v.walkableMeshes.push(pick);
  // Low broken parapets make the edge readable without hiding the upper floor.
  for(const dx of [-deck.halfX,deck.halfX])v.box(v.scene,.3,.65,deck.halfZ*2,deck.x+dx,deck.y+.325,deck.z,v.mats.darkStone);
  v.box(v.scene,deck.halfX*2,.65,.3,deck.x,deck.y+.325,deck.z+deck.halfZ,v.mats.darkStone);
  if(v.world.castle)continue;
  const marker=v.mesh(new THREE.OctahedronGeometry(.35),v.mats.gold,v.scene,deck.x+2,deck.y+.9,deck.z+1);
  marker.userData.landmark='Mirante das ruínas';
 }
}
