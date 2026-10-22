import * as THREE from 'three';
// The visible slab top is 0.08 above the simulation surface.
export const GUARDIAN_INDICATOR_HEIGHT=.12;
import {selectAtlasFrame} from '../../core/atlas.js';
import {resolveFacing} from '../../core/actor-animation.js';
export function buildGuardianHall(v){const h=v.world.guardianHall;if(!h)return;const g=new THREE.Group();v.scene.add(g);const privateRoom=!!v.world.arena;
 const stone=new THREE.MeshStandardMaterial({color:0x59616b,roughness:1}),dark=new THREE.MeshStandardMaterial({color:0x303d4b,roughness:.8}),gold=new THREE.MeshStandardMaterial({color:0xb69b57,metalness:.5,roughness:.6}),cloth=new THREE.MeshStandardMaterial({color:0x424b80,side:THREE.DoubleSide});
 const floor=v.box(g,22,.25,20,h.x,h.y-.045,h.z,stone);floor.userData.surface=privateRoom?'guardian-floor':h.door.surface;v.walkableMeshes??=[];v.walkableMeshes.push(floor);
 for(const dx of [-11,11])v.box(g,.6,3,20,h.x+dx,h.y+1.5,h.z,dark);
 v.box(g,22,3,.6,h.x,h.y+1.5,h.z+10,dark);
 for(const dx of [-7,7])v.box(g,8,4,.7,h.x+dx,h.y+2,h.z-10,dark);
 for(const dx of [-8,8])for(const dz of [-4,4]){v.mesh(new THREE.CylinderGeometry(.7,.9,4,8),stone,g,h.x+dx,h.y+2,h.z+dz);v.box(g,1.8,.2,1.8,h.x+dx,h.y+4,h.z+dz,gold);}
 for(const dx of [-7,7]){v.box(g,2.5,3,.12,h.x+dx,h.y+3,h.z+9.5,cloth);v.box(g,.16,2,.18,h.x+dx,h.y+3,h.z+9.35,gold);v.box(g,1,.16,.18,h.x+dx,h.y+3.5,h.z+9.3,gold);}
 for(let n=0;n<9;n++){const crack=v.box(g,.06,.02,1.4,h.x+(n%3-1)*3,h.y+.02,h.z+Math.floor(n/3)*2-2,dark);crack.rotation.y=n*.9;}
 for(const dx of [-3,3])v.box(g,.6,5,1,h.x+dx,h.y+2.5,h.z-10,stone);v.box(g,7,.7,1,h.x,h.y+5,h.z-10,gold);
 const doors=[-1,1].map(sign=>{const m=v.box(g,3,4.8,.3,h.x+sign*1.5,h.y+2.4,h.z-10,gold);return {m,sign};});
 const occlusion=[];g.traverse(o=>{if(o.isMesh&&(o.geometry.parameters.height??0)>=1){o.material=o.material.clone();o.material.transparent=true;const entry={box:new THREE.Box3().setFromObject(o),materials:[o.material]};if(privateRoom&&o.geometry.type==='BoxGeometry'&&((o.geometry.parameters.width??0)>=3||(o.geometry.parameters.depth??0)>=10))entry.arenaWall={x:o.position.x-h.x,z:o.position.z-h.z,cx:h.x,cz:h.z};v.occluders.push(entry);occlusion.push({o,entry});}});
 let age=0;v.updateGuardian=(dt)=>{age+=dt;const progress=privateRoom?Math.min(1,age/1.6):1;for(const {m,sign}of doors)m.position.x=h.x+sign*(1.5+(1-progress)*2.8);if(age<1.7)for(const {o,entry}of occlusion)if(doors.some(d=>d.m===o))entry.box.setFromObject(o);};
 if(privateRoom){v.scene.background.setHex(0x1c2432);v.scene.fog.color.setHex(0x1c2432);v.hemisphere.intensity=1.2;v.sun.intensity=2;v.sun.position.set(h.x-8,h.y+18,h.z-6);v.sun.target.position.set(h.x,h.y,h.z);v.scene.add(v.sun.target);}
}
export function updateKnight(model,e,view,time){const sp=e.special;model.facing=resolveFacing(e.heading,view.azimuth,model.facing?.direction);const frame=!e.alive?7:sp?.skill==='last-oath'?6:sp?.skill==='rupture'&&sp.phase==='windup'?5:sp?.phase==='windup'?3:sp?.phase==='charge'||sp?.phase==='recovery'?4:e.state==='chasing'?1+Math.floor((model.travel??0)/.3)%2:0;
 selectAtlasFrame(model.body.material.map,frame,Math.round(model.facing.direction/2)%4);model.body.center.y=.08;model.body.scale.set(4.5,4.5,1);model.body.material.color.setHex(e.frenzy?0xbdd7ff:0xffffff);
 if(!model.line){model.line=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xb28bea,transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false}));model.line.rotation.x=-Math.PI/2;model.group.add(model.line);model.circle=new THREE.Mesh(new THREE.RingGeometry(6.1,6.5,64),model.line.material.clone());model.circle.rotation.x=-Math.PI/2;model.circle.position.y=GUARDIAN_INDICATOR_HEIGHT;model.group.add(model.circle);}
 const wind=sp?.phase==='windup';model.line.visible=wind&&['sword','arc','charge'].includes(sp.skill);model.circle.visible=!!sp&&sp.skill==='rupture'&&['windup','recovery'].includes(sp.phase);if(model.line.visible){const b=view.world.bounds,rx=Math.abs(sp.dx)<.001?Infinity:((sp.dx>0?b.maxX:b.minX)-e.x)/sp.dx,rz=Math.abs(sp.dz)<.001?Infinity:((sp.dz>0?b.maxZ:b.minZ)-e.z)/sp.dz,range=Math.max(.1,Math.min(sp.range,rx,rz));model.line.scale.set(sp.width*2,range,1);model.line.position.set(sp.dx*range/2,GUARDIAN_INDICATOR_HEIGHT,sp.dz*range/2);model.line.rotation.z=-e.heading;model.line.material.opacity=.25+.12*Math.sin(time*9);}
}
