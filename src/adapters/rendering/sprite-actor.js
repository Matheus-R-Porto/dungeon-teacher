import {professionPose} from '../../core/profession-presentation.js';
import {SheetActor} from './sheet-actor.js';
import {ActorAccessories} from './actor-accessories.js';
import * as THREE from 'three';
import {resolveFacing} from '../../core/actor-animation.js';
import {VisualCombat} from '../../core/visual-combat.js';
import {ActivityAnimation} from '../../core/activity-animation.js';
import {selectAtlasFrame} from '../../core/atlas.js';
import {artTexture} from './art.js';
export class SpriteActor {
 constructor(scene,{atlas=artTexture('/assets/characters/adventurer-v043.png',6,4),width=3,height=3}={}){
  this.accessories=new ActorAccessories(scene);this.baseTexture=atlas;this.texture=atlas;this.width=width;this.height=height;this.textures=new Map();
  this.visual=new VisualCombat();this.activity=new ActivityAnimation();
  this.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:atlas,transparent:true,alphaTest:.1,depthWrite:true,toneMapped:false}));
  this.sprite.center.set(.5,.1);this.sprite.scale.set(width,height,1);scene.add(this.sprite);this.sheet=new SheetActor(scene,this.sprite);
  this.shadow=new THREE.Mesh(new THREE.CircleGeometry(.39,24),new THREE.MeshBasicMaterial({color:0x263c37,transparent:true,opacity:.25,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;this.shadow.scale.y=.8;scene.add(this.shadow);
 }
 atlas(name,columns,rows,version='v043'){
  const key=name+'-'+version;if(!this.textures.has(key)){const t=artTexture('/assets/characters/'+key+'.png',columns,rows);t.userData.cell=['fishing','fishing-reel'].includes(name)?512:320;this.textures.set(key,t);}return this.textures.get(key);
 }
 update(input,azimuth,time,reducedMotion,camera){
  const {x,z,y=0,heading,phase,hp}=input,v=this.visual.update(input,time);
  this.facing=resolveFacing(input.profession?.heading??heading,azimuth,this.facing?.direction);this.facing.animationState=v.state;
  const direction=Math.round(this.facing.direction/2)%4;this.shadow.position.set(x,y+.035,z);
  if(phase!==this.lastPhase){this.phaseAt=time;this.lastPhase=phase;}
  const activity=input.profession?professionPose(input.profession):this.activity.update(input.activity,time);this.currentActivity=hp===0||['recoil','impactRecovery'].includes(input.impact?.phase)?null:activity;
  if(!activity||hp===0||['recoil','impactRecovery'].includes(input.impact?.phase)){
   if(this.sheet.update(input,direction,v,azimuth,time,this.width,this.height,camera)){this.texture=this.sprite.material.map;this.accessories.update({...input,walkDistance:v.walkDistance},direction,this.sprite,camera);return;}
   this.sprite.position.set(x,y+.055,z);return;
  }
  if(this.sheet.update({...input,professionPose:activity},direction,v,azimuth,time,this.width,this.height,camera)){this.texture=this.sprite.material.map;this.accessories.update({...input,cart:false},direction,this.sprite,camera);}

 }
 dispose(){this.sheet.dispose();this.accessories.dispose();this.baseTexture.dispose();for(const t of this.textures.values())t.dispose();this.textures.clear();this.sprite.removeFromParent();this.sprite.material.dispose();this.shadow.removeFromParent();this.shadow.geometry.dispose();this.shadow.material.dispose();}
}
