import * as THREE from 'three';
import {insideTerrain} from '../../world/collision.js';
import {seeded,seedOf} from '../../domain/random.js';
export function buildForest(v){
 const w=v.world,b=w.bounds,random=seeded(seedOf(w.seed+':decoration')),mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true,...extra});
 v.scene.background=new THREE.Color([0x9ab9a0,0x769885,0x667e78][w.floorId-1]);v.scene.fog=new THREE.FogExp2(v.scene.background,.014);
 v.box(v.scene,b.maxX-b.minX+8,.5,b.maxZ-b.minZ+8,(b.minX+b.maxX)/2,-.35,(b.minZ+b.maxZ)/2,mat(0x304d36));
 const ground=mat([0x789e54,0x62874d,0x526e49][w.floorId-1]),path=mat(0xa99c6a),low=mat(0x456b42),stone=mat(0x738266);
 const disk=new THREE.CircleGeometry(1,16);disk.rotateX(-Math.PI/2);
 for(const r of w.graph.regions){const patch=v.mesh(disk,ground,v.scene,r.x,.005,r.z);patch.scale.setScalar(r.radius);patch.castShadow=false;}
 for(const s of w.walkable.filter(s=>s.a)){const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,d=Math.hypot(dx,dz),strip=v.box(v.scene,s.radius*2,.04,d,(s.a.x+s.b.x)/2,0,(s.a.z+s.b.z)/2,ground);strip.rotation.y=Math.atan2(dx,dz);for(const p of [s.a,s.b]){const cap=v.mesh(disk,ground,v.scene,p.x,.026,p.z);cap.scale.setScalar(s.radius);cap.castShadow=false;}}
 const stones=[],shrubs=[],trees=[],arrows=[],grass=[];
 for(const t of w.trails)for(let k=1;k<t.points.length;k++){const a=t.points[k-1],b=t.points[k],d=Math.hypot(b.x-a.x,b.z-a.z);for(let n=0;n<d;n+=1.8){const f=n/d;stones.push({x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,scale:t.main?.48:.3,color:t.main?0xc6b978:0x92b49a});if(t.main&&n>3&&Math.floor(n/1.8)%4===0)arrows.push({x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,scale:.65,angle:Math.atan2(b.x-a.x,b.z-a.z)});}}
 for(let z=b.minZ;z<b.maxZ;z+=2)for(let x=b.minX;x<b.maxX;x+=2){if(insideTerrain(w,x,z,0)||!insideTerrain(w,x,z,-2.4))continue;shrubs.push({x,z,scale:1+random()*.45});if(random()<.1+w.floorId*.025&&!insideTerrain(w,x,z,-.7))trees.push({x,z,scale:2+random()*1.4});}
 function instances(geometry,material,points,height,scaleY=1){const mesh=new THREE.InstancedMesh(geometry,material,points.length),d=new THREE.Object3D();points.forEach((p,i)=>{d.position.set(p.x,height*p.scale,p.z);d.scale.set(p.scale,p.scale*scaleY,p.scale);d.rotation.y=p.angle??random()*6.28;d.updateMatrix();mesh.setMatrixAt(i,d.matrix);if(p.color)mesh.setColorAt(i,new THREE.Color(p.color));});mesh.receiveShadow=true;v.scene.add(mesh);return mesh;}
 for(const r of w.graph.regions)for(let i=0;i<65;i++){const a=random()*6.28,d=3+random()*(r.radius-3);grass.push({x:r.x+Math.sin(a)*d,z:r.z+Math.cos(a)*d,scale:.18+random()*.22});}
 instances(new THREE.ConeGeometry(.4,1,3),mat(0x88a96c),grass,.4);
 instances(new THREE.CylinderGeometry(.65,.65,.04,3),v.mats.gold,arrows,.08);
 instances(new THREE.DodecahedronGeometry(1,0),low,shrubs,.34,.6);
 instances(new THREE.DodecahedronGeometry(1,0),mat(0xffffff),stones,.035,.1);
 instances(new THREE.ConeGeometry(1,2,7),mat(0x326646),trees,.75,1);
 for(const o of w.obstacles.filter(o=>!o.encounterId)){const rock=v.mesh(new THREE.DodecahedronGeometry(1,0),stone,v.scene,o.x,.7,o.z);rock.scale.set(o.halfX,1.1,o.halfZ);if(o.kind==='ruin')v.box(v.scene,1.5,.35,1.4,o.x,1.5,o.z,v.mats.stoneLight);}
 v.forestGates=[];for(const gate of w.gates){const group=new THREE.Group();group.position.set(gate.x,0,gate.z);v.scene.add(group);const root=v.mesh(new THREE.SphereGeometry(gate.radius,16,8),mat(0x597d68,{transparent:true,opacity:.48,emissive:0x3b755d,emissiveIntensity:.5}),group,0,.25,0);root.scale.y=.5;for(let i=0;i<6;i++){const a=i*Math.PI/3,branch=v.box(group,.28,2,gate.radius*1.6,0,.8,0,v.mats.bark);branch.rotation.set(.3,a,.3);}v.forestGates.push({gate,group});}
 for(const p of w.pois.filter(p=>p.type!=='futureResource')){const group=new THREE.Group();group.position.set(p.x,0,p.z);v.scene.add(group);group.userData.kind='ruin';
  if(p.kind===0){v.buildTree(group,5.5);v.mesh(new THREE.TorusGeometry(1.3,.08,5,20),v.mats.gold,group,0,1,0).rotation.x=Math.PI/2;}
  if(p.kind===1){v.mesh(new THREE.OctahedronGeometry(1.3),v.mats.darkStone,group,0,1.3,0);v.mesh(new THREE.OctahedronGeometry(.32),mat(0x72d3bc,{emissive:0x48bbaa,emissiveIntensity:.7}),group,0,2.6,0);}
  if(p.kind===2){const lake=v.mesh(disk,mat(0x428f92,{metalness:.2,roughness:.25}),group,0,.05,0);lake.scale.set(2.5,1,1.8);for(let i=0;i<5;i++)v.mesh(new THREE.OctahedronGeometry(.12),v.mats.gold,group,Math.cos(i)*2,.5,Math.sin(i)*1.5);}
  if(p.kind===3){for(const x of [-1.5,1.5])v.box(group,.8,2.5,.8,x,1.25,0,v.mats.stone);v.box(group,3.8,.45,.9,0,2.5,0,v.mats.stoneLight);}
  if(p.kind===4){const log=v.mesh(new THREE.CylinderGeometry(.55,.8,4,7),v.mats.bark,group,0,.65,0);log.rotation.z=Math.PI/2;}
 }
 const boss=w.graph.regions.find(r=>r.type==='boss');if(boss){const ring=v.mesh(new THREE.RingGeometry(8.5,8.8,48),v.mats.stoneLight,v.scene,boss.x,.055,boss.z);ring.rotation.x=-Math.PI/2;for(const x of [-7,7])v.box(v.scene,.9,3,.9,boss.x+x,1.5,boss.z-5,v.mats.stone);}
 v.forestStats={regions:w.graph.regions.length,trees:trees.length,shrubs:shrubs.length,stones:stones.length};
}
