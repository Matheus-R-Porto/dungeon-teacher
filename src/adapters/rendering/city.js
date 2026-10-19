import {buildNpcActivities,updateNpcActivities} from './npc-ambient.js';
import {buildCitySurroundings} from './city-surroundings.js';
import {batchStatic} from './static-batch.js';
import * as THREE from 'three';
import {artTexture,artSprite} from './art.js';
export function buildCity(view){
 const buildings=[];const s=view.scene,mat=(color,map)=>new THREE.MeshStandardMaterial({color,roughness:1,...(map?{map:artTexture(map)}:{})}),wood=mat(0x72513d),stone=mat(0xb6b6a2),grass=mat(0x79a966),leaf=mat(0x4d8759),plaster=mat(0xffffff,'/assets/environment/plaster.svg'),paving=mat(0xffffff,'/assets/environment/paving.svg'),roof=mat(0xffffff,'/assets/environment/roof.svg'),gold=mat(0xe4c47e);
 for(const [m,n]of[[roof,3]]){m.map.wrapS=m.map.wrapT=THREE.RepeatWrapping;m.map.repeat.set(n,n);m.map.needsUpdate=true;}
 const bounds=view.world.bounds;buildCitySurroundings(view);
 const stones=[];for(let z=bounds.minZ;z<bounds.maxZ;z++)for(let x=bounds.minX;x<bounds.maxX;x++){const cx=x+.5,cz=z+.5;if(Math.abs(cx)<3.5||Math.abs(cz-7)<2||Math.abs(cz+8)<2||Math.abs(cz-17)<2||Math.abs(cx-17)<2||Math.abs(cx+17)<2||Math.hypot(cx,cz)<6)stones.push([cx,cz]);}
 const dummy=new THREE.Object3D();for(const [residential,material]of [[false,paving],[true,mat(0xffffff,'/assets/environment/brick-path.svg')]]){const cells=stones.filter(([x,z])=>(z>15&&x<12)===residential);const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(.99,.04,.99),material,cells.length);cells.forEach(([x,z],i)=>{dummy.position.set(x,0,z);dummy.updateMatrix();tiles.setMatrixAt(i,dummy.matrix);});tiles.receiveShadow=true;s.add(tiles);}
 const angel=view.world.npcs.find(n=>n.art===0),ax=angel.x,az=angel.z;view.mesh(new THREE.CylinderGeometry(2.4,2.4,.1,32),mat(0xe5d9b8),s,ax,.05,az);for(let i=0;i<8;i++){const angle=i*Math.PI/4;view.mesh(new THREE.OctahedronGeometry(.12),gold,s,ax+Math.cos(angle)*2.2,.2,az+Math.sin(angle)*2.2);}
 const text=(label,x,y,z)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=80;const c=canvas.getContext('2d');c.fillStyle='#263f3c';c.fillRect(0,0,512,80);c.strokeStyle='#d9c18b';c.lineWidth=5;c.strokeRect(3,3,506,74);c.fillStyle='#fff0cb';c.font='bold 27px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(label,256,40);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));sign.position.set(x,y,z);sign.scale.set(3.5,.55,1);s.add(sign);};
 for(const o of view.world.obstacles){
  if(o.kind==='building'){const group=new THREE.Group();buildings.push(group);group.position.set(o.x,0,o.z);s.add(group);const h=o.height??2.5;if(o.style==='tower'){view.box(group,o.halfX*2,.18,o.halfZ*2,0,.09,0,stone);view.mesh(new THREE.CylinderGeometry(Math.min(o.halfX,o.halfZ),Math.min(o.halfX,o.halfZ),h,12),stone,group,0,h/2,0);}else view.box(group,o.halfX*2,h,o.halfZ*2,0,h/2,0,plaster);const r=view.mesh(new THREE.ConeGeometry(1,o.style==='tower'?2.5:1.5,o.style==='tower'?12:4),roof,group,0,h+.6,0);r.material=roof.clone();r.material.color.setHex(o.roof);r.rotation.y=Math.PI/4;r.scale.set(o.halfX*1.55,1,o.halfZ*1.55);if(['house-west','house-garden'].includes(o.id)){r.geometry.dispose();const shape=new THREE.Shape();shape.moveTo(-o.halfX-.2,0);shape.lineTo(0,1.7);shape.lineTo(o.halfX+.2,0);shape.closePath();r.geometry=new THREE.ExtrudeGeometry(shape,{depth:o.halfZ*2+.4,bevelEnabled:false});r.rotation.y=0;r.scale.set(1,1,1);r.position.set(0,h,-o.halfZ-.2);}view.box(group,.85,1.6,.08,0,.8,o.halfZ+.03,wood);for(const x of[-1.2,1.2]){view.box(group,.65,.8,.09,x,1.4,o.halfZ+.06,wood);view.box(group,.5,.6,.1,x,1.4,o.halfZ+.08,gold);}view.box(group,.55,1.3,.55,1.1,h+.6,0,stone);if(o.label)text(o.label,o.x,2.6,o.z+o.halfZ+.2);
   // Fade a whole building when the orbit places it between the camera and player.
   if(o.style==='tavern'||o.style==='house'){for(const dx of[-o.halfX+.1,0,o.halfX-.1])view.box(group,.13,h,.14,dx,h/2,o.halfZ+.1,wood);view.box(group,o.halfX*2,.14,.14,0,h*.65,o.halfZ+.1,wood);}
   if(o.style==='workshop'||o.style==='warehouse'){view.box(group,o.halfX*1.8,.12,1.6,0,2,o.halfZ+.6,roof);for(const dx of[-o.halfX*.8,o.halfX*.8])view.box(group,.12,2,.12,dx,1,o.halfZ+1.2,wood);}
   if(o.style==='tavern'){view.box(group,o.halfX*1.7,.18,1,0,h*.62,o.halfZ+.45,wood);for(const dx of[-2,-1,0,1,2])view.box(group,.08,.65,.08,dx,h*.62+.35,o.halfZ+.85,wood);view.box(group,4.4,.08,.08,0,h*.62+.7,o.halfZ+.85,wood);}
   if(o.style==='sanctuary'){for(const dx of[-2.7,2.7])view.mesh(new THREE.CylinderGeometry(.24,.3,h,10),stone,group,dx,h/2,o.halfZ+.4);view.mesh(new THREE.OctahedronGeometry(.6),gold,group,0,h+1.7,0);}
   // Reuse a single cloned material per source per building, while retaining independent fading.
   const clones=new Map();group.traverse(n=>{if(n.material){if(!clones.has(n.material)){const m=n.material.clone();m.transparent=true;clones.set(n.material,m);}n.material=clones.get(n.material);}});const materials=new Set(clones.values());view.occluders.push({center:new THREE.Vector3(o.x,1.7,o.z),radius:Math.max(o.halfX,o.halfZ)+.5,materials:[...materials]});
  }else if(o.kind==='fountain'){view.mesh(new THREE.CylinderGeometry(1.7,1.8,.55,24),stone,s,o.x,.3,o.z);view.mesh(new THREE.CylinderGeometry(1.45,1.45,.06,24),mat(0x72c6ce),s,o.x,.6,o.z);view.mesh(new THREE.CylinderGeometry(.25,.4,1.1,12),stone,s,o.x,1,o.z);view.mesh(new THREE.SphereGeometry(.32,12,8),gold,s,o.x,1.7,o.z);
  }else if(o.kind==='tree'){view.mesh(new THREE.CylinderGeometry(.18,.35,2,7),wood,s,o.x,1,o.z);const tree=view.mesh(o.x>10?new THREE.ConeGeometry(1.15,2.8,8):new THREE.IcosahedronGeometry(1.15,1),leaf,s,o.x,o.x>10?2.8:2.5,o.z);if(o.z>18)tree.scale.set(1.15,1.2,1.15);
  }else if(o.kind==='lamp'){view.mesh(new THREE.CylinderGeometry(.06,.1,2.4,6),wood,s,o.x,1.2,o.z);view.box(s,.35,.5,.35,o.x,2.5,o.z,gold);}
 }
 // Decorative objects use the authoritative obstacle coordinates too.
 for(const o of view.world.obstacles){const {x,z}=o;
  if(o.kind==='garden'){view.box(s,o.halfX*2,.08,o.halfZ*2,x,.02,z,stone);for(let i=0;i<5;i++)view.mesh(new THREE.IcosahedronGeometry(.3,0),leaf,s,x-1.2+i*.6,.3,z);view.box(s,o.halfX*2,.1,.1,x,.45,z+o.halfZ,wood);}
  if(o.kind==='stall'){view.box(s,2.6,.7,1.5,x,.35,z,wood);view.box(s,2.8,.12,1.8,x,2,z,roof);for(const dx of[-1.2,1.2])view.box(s,.1,2,.1,x+dx,1,z,wood);for(let i=0;i<4;i++)view.mesh(new THREE.SphereGeometry(.15,6,4),gold,s,x-.8+i*.5,.85,z);}
  if(o.kind==='supplies'){view.box(s,.8,.8,.8,x-.3,.4,z,wood);view.mesh(new THREE.CylinderGeometry(.35,.35,.9,10),wood,s,x+.5,.45,z);}
  if(o.kind==='anvil'||o.kind==='forge'){const forge=new THREE.Group();forge.position.set(x,0,z);s.add(forge);view.buildForge(forge);}
  if(o.kind==='cooking'){view.box(s,1,.7,1,x,.35,z,stone);view.mesh(new THREE.CylinderGeometry(.4,.3,.4,12),wood,s,x,.9,z);}
 }
 // Benches flank the plaza; their footprints are also present in the shared map.
 for(const o of view.world.obstacles.filter(o=>o.kind==='bench')){view.box(s,2,.16,.65,o.x,.5,o.z,wood);view.box(s,2,.65,.1,o.x,.85,o.z-.3,wood);for(const dx of[-.75,.75])view.box(s,.12,.5,.5,o.x+dx,.25,o.z,stone);}
 const chimneys=view.world.obstacles.filter(o=>['workshop','tavern'].includes(o.style));
 const smoke=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.25,1),new THREE.MeshBasicMaterial({color:0xd8dfd5,transparent:true,opacity:.23,depthWrite:false}),chimneys.length*3);smoke.frustumCulled=false;s.add(smoke);view.citySmoke={mesh:smoke,dummy:new THREE.Object3D(),chimneys};

 for(const x of[-3,3]){view.box(s,.12,4,.12,x,2,-21,wood);const flag=view.box(s,1.3,.9,.06,x+.6,3.4,-21,roof);view.flags.push(flag);}

 for(const building of buildings)batchStatic(building);batchStatic(s,{spatial:true,exclude:new Set([...buildings,...view.flags])});
}
export function buildCityNpcs(view){view.npcModels=new Map();for(const npc of view.world.npcs){const sprite=artSprite('/assets/npcs/townsfolk-v043.png',3,2,npc.art%3,Math.floor(npc.art/3),4.5,4.5);sprite.center.y=.1;sprite.position.set(npc.x,.04,npc.z);view.scene.add(sprite);view.npcModels.set(npc.id,sprite);}buildNpcActivities(view);}

export function updateCityAmbient(view,time,reducedMotion){updateNpcActivities(view,time,reducedMotion);const smoke=view.citySmoke;if(!smoke)return;let i=0;for(const o of smoke.chimneys)for(let k=0;k<3;k++){const age=reducedMotion?k*.5:(time*.45+k*.67)%2;smoke.dummy.position.set(o.x+1.1+age*.15,o.height+1+age,o.z);smoke.dummy.scale.setScalar(.6+age*.5);smoke.dummy.updateMatrix();smoke.mesh.setMatrixAt(i++,smoke.dummy.matrix);}smoke.mesh.instanceMatrix.needsUpdate=true;}
