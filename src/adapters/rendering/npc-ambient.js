import * as THREE from 'three';
import {npcAmbient} from '../../core/npc-ambient.js';
import {artTexture} from './art.js';
import {selectAtlasFrame} from '../../core/atlas.js';
export function buildNpcActivities(v){
 v.npcActivities=[];const wood=v.mats.bark,metal=v.mats.darkStone,gold=v.mats.gold;
 for(const npc of v.world.npcs){
  const group=new THREE.Group();group.position.set(npc.x,.05,npc.z);v.scene.add(group);
  let tool;
  if(npc.id==='blacksmith'||npc.id==='weaponsmith'){
   const sprite=v.npcModels.get(npc.id);sprite.material.map.dispose();sprite.material.map=artTexture('/assets/npcs/blacksmith-v051.png',4,1);sprite.center.y=.18;
   v.box(group,.65,.6,.65,-.65,.3,.55,wood);v.box(group,1.25,.22,.6,-.65,.76,.55,metal);v.box(group,.45,.07,.22,-.65,.91,.55,gold);
   tool=new THREE.Group();tool.visible=false;group.add(tool);
  }else if(npc.id==='cook'){
   v.mesh(new THREE.SphereGeometry(.3,12,6,0,Math.PI*2,0,Math.PI/2),metal,group,-.6,.85,.4).rotation.x=Math.PI;tool=v.box(group,.06,.7,.06,-.6,1.1,.4,wood);
  }else if(npc.id==='potion-mage'){
   tool=v.mesh(new THREE.SphereGeometry(.13,10,8),new THREE.MeshStandardMaterial({color:0xb18fe0,emissive:0x624483,emissiveIntensity:.4}),group,-.6,1.4,.3);
  }else if(npc.id==='reset-angel'){
   tool=v.mesh(new THREE.TorusGeometry(.35,.025,5,20),gold,group,0,2.9,0);
  }else{
   tool=v.box(group,.55,.06,.4,-.6,1.1,.4,v.mats.stoneLight);tool.rotation.z=.2;
  }
  v.npcActivities.push({npc,tool,sprite:v.npcModels.get(npc.id)});
 }
}
export function updateNpcActivities(v,time,reduced){
 // 20 Hz is sufficient for a subtle ambient routine; rendering still interpolates the scene normally.
 const tick=Math.floor(time*20);if(tick===v.npcAmbientTick)return;v.npcAmbientTick=tick;
 for(const {npc,tool,sprite} of v.npcActivities??[]){const a=npcAmbient(npc.id,reduced?0:time);
  sprite.scale.set(4.5*(1-a.breath*.3),4.5*(1+a.breath),1);sprite.material.rotation=reduced?0:a.lean;
  if(npc.id==='blacksmith'||npc.id==='weaponsmith'){
   const cycle=((a.phase-3)%1.25+1.25)%1.25,frame=!a.active?0:cycle<.42?1:cycle<.68?2:cycle<1?3:0;
   selectAtlasFrame(sprite.material.map,frame,0);const side=-.65*Math.cos(v.azimuth)-.55*Math.sin(v.azimuth);
   sprite.scale.x=3.375*(side<0?-1:1);sprite.material.rotation=0;
  }
  else if(npc.id==='cook'){tool.rotation.z=a.active?Math.sin(a.phase*4)*.18:0;}
  else if(npc.id==='reset-angel'){tool.rotation.y=time*.12;tool.visible=a.active;}
  else tool.rotation.z=a.active?Math.sin(a.phase*2)*.12:0;
 }
}
