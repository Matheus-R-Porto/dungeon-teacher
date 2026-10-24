import * as THREE from 'three';
import {resolveFacing} from '../../core/actor-animation.js';
import {VisualCombat} from '../../core/visual-combat.js';
import {ActivityAnimation} from '../../core/activity-animation.js';
import {selectAtlasFrame} from '../../core/atlas.js';
import {artTexture} from './art.js';
const families=new Set(['sword','bow','dagger','staff']);
export class SpriteActor {
 constructor(scene,{atlas=artTexture('/assets/characters/adventurer-v043.png',6,4),width=3,height=3}={}){
  this.baseTexture=atlas;this.texture=atlas;this.width=width;this.height=height;
  this.visual=new VisualCombat();this.activity=new ActivityAnimation();this.textures=new Map();
  this.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:atlas,transparent:true,alphaTest:.1,depthWrite:true,toneMapped:false}));
  this.sprite.center.set(.5,.1);this.sprite.scale.set(width,height,1);scene.add(this.sprite);
  this.shadow=new THREE.Mesh(new THREE.CircleGeometry(.39,24),new THREE.MeshBasicMaterial({color:0x263c37,transparent:true,opacity:.25,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;this.shadow.scale.y=.8;scene.add(this.shadow);
 }
 atlas(name,columns,rows,version='v043'){
  const key=name+'-'+version;if(name==='bow-transition'||name==='staff-transition'){columns=3;rows=8;}
  if(!this.textures.has(key)){const t=artTexture('/assets/characters/'+key+'.png',columns,rows);t.userData.cell=['fishing','fishing-reel','staff-transition','sword-action'].includes(name)?512:version==='v042'?256:320;this.textures.set(key,t);}return this.textures.get(key);
 }
 update(input,azimuth,time,reducedMotion,camera){
  const {x,z,y=0,heading,moving,phase,hp,weaponType}=input,v=this.visual.update(input,time);
  this.facing=resolveFacing(heading,azimuth,this.facing?.direction);this.facing.animationState=v.state;
  const direction=Math.round(this.facing.direction/2)%4;
  if(input.activity){this.atlas('fishing',5,4);this.atlas('fishing-reel',2,2,'v064');this.atlas('mining',5,4);}
  if(phase!==this.lastPhase){this.phaseAt=time;this.lastPhase=phase;}
  let texture=this.baseTexture,frame=moving?1+v.walkFrame:0,row=direction,scale=1,anchor=.1;
  if(families.has(weaponType)){
   texture=this.atlas(weaponType,6,8);this.atlas(weaponType+'-transition',8,4);this.atlas(weaponType+'-action',3,4);
   row=direction+(v.blend>=1?4:0);
   // One complete pose per frame. Movement changes variants without resetting
   // equipment progress; sheath retraces draw, and reversal retains progress.
   if(v.blend>0&&v.blend<1){texture=this.atlas(weaponType+'-transition',8,4);row=direction;
    if(texture.userData.atlas.columns===3){row=direction+(moving?4:0);frame=Math.min(2,Math.floor(v.blend*3));}
    else frame=moving?3+Math.min(4,Math.floor(v.blend*5)):Math.min(2,Math.floor(v.blend*3));
   }else if(v.state==='attacking'){
    texture=this.atlas(weaponType+'-action',3,4);row=direction;frame=phase==='windup'?0:1;
   }
  }
  if(v.state==='hurt'&&v.blend>=1&&families.has(weaponType)){texture=this.atlas(weaponType+'-action',3,4);frame=2;row=direction;}
  const activity=this.activity.update(input.activity,time);this.currentActivity=activity;
  if(activity&&v.state!=='hurt'&&hp!==0){texture=this.atlas(activity.type,5,4);frame=activity.frame;row=direction;scale=activity.type==='fishing'?1.6:1;anchor=.1;}
  if(activity?.type==='fishing'&&activity.frame===5&&v.state!=='hurt'&&hp!==0){texture=this.atlas('fishing-reel',2,2,'v064');frame=direction%2;row=Math.floor(direction/2);}
  if(hp===0){texture=this.atlas('adventurer-death',8,4,'v042');frame=7;row=direction;scale=.8;anchor=22/256;}
  this.sprite.position.set(x,y+.055,z);this.shadow.position.set(x,y+.035,z);
  // Keep the last complete pose while a newly requested atlas decodes.
  if(typeof document!=='undefined'&&!texture.image?.width)return;
  scale=(texture.userData.cell??320)/320;this.texture=texture;this.sprite.material.map=texture;selectAtlasFrame(texture,frame,row);
  this.normalTint??=this.sprite.material.color.getHex();this.sprite.material.color.setHex(v.state==='hurt'?0xffb7a0:this.normalTint);
  this.sprite.material.rotation=v.state==='hurt'&&!reducedMotion?.08*Math.sin((v.hurtUntil-time)*Math.PI/.24):0;
  this.sprite.scale.set(this.width*scale,this.height*scale,1);this.sprite.center.y=anchor;
  this.sprite.position.set(x,y+.055,z);this.shadow.position.set(x,y+.035,z);
 }
 dispose(){this.baseTexture.dispose();for(const t of this.textures.values())t.dispose();this.textures.clear();this.sprite.removeFromParent();this.sprite.material.dispose();this.shadow.removeFromParent();this.shadow.geometry.dispose();this.shadow.material.dispose();}
}
