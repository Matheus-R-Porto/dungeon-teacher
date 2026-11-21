import {PoseTransition,renderTarget,equipmentPresentation,articulateDraw,stowMount} from '../../core/carry-pose.js';
import {anatomyFor} from '../../core/anatomy.js';
import {gripFor,billboardPoint,equipmentDepth} from '../../core/equipment-pose.js';
import {ITEMS} from '../../domain/items/inventory.js';
import {MODULAR_COLUMNS,actionFrame,framePose,handSocket,torsoPoint} from '../../core/modular-pose.js';
import * as THREE from 'three';
import {prepareAppearance,appearancePose,normalizedParts,equipmentVisualKey} from './appearance-compositor.js';
import {selectAtlasFrame} from '../../core/atlas.js';
import {defaultAppearance} from '../../domain/appearance.js';
const textures=new WeakMap();
function shieldTexture(back=false){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#392d27';g.fillRect(12,8,40,32);g.fillRect(16,40,32,8);g.fillRect(24,48,16,8);g.fillStyle='#b98648';g.fillRect(16,12,32,28);g.fillRect(20,40,24,4);g.fillRect(28,44,8,8);g.fillStyle='#60432d';for(let x=22;x<48;x+=8)g.fillRect(x,13,2,27);g.fillStyle='#d5ccb1';g.fillRect(16,22,32,4);g.fillRect(26,26,12,10);g.fillStyle='#918773';g.fillRect(30,29,4,4);if(back){g.fillStyle='#61452e';g.fillRect(16,12,32,28);g.fillStyle='#302c27';g.fillRect(24,18,5,24);g.fillRect(38,18,5,24);g.fillStyle='#bc9861';g.fillRect(26,24,15,6);}const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;}

function texture(canvas,columns){let source=textures.get(canvas);if(!source){source=new THREE.CanvasTexture(canvas);source.colorSpace=THREE.SRGBColorSpace;source.magFilter=THREE.NearestFilter;source.minFilter=THREE.NearestFilter;source.generateMipmaps=false;textures.set(canvas,source);}const t=new THREE.Texture();t.source=source.source;t.colorSpace=source.colorSpace;t.magFilter=source.magFilter;t.minFilter=source.minFilter;t.generateMipmaps=false;t.userData.atlas={columns,rows:4};t.needsUpdate=true;return t;}
const weaponFamily=id=>ITEMS[id]?.weaponType??null;
export class ModularActor {
 constructor(scene,body){this.scene=scene;this.body=body;this.generation=0;this.poseTransition=new PoseTransition();this.weapon=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,alphaTest:.12,depthWrite:false,toneMapped:false}));this.sheath=new THREE.Sprite(this.weapon.material.clone());this.secondary=new THREE.Sprite(this.weapon.material.clone());this.weapon.visible=this.sheath.visible=this.secondary.visible=false;}
 prepare(input){if(!this.attached){this.scene.add(this.weapon,this.sheath,this.secondary);this.attached=true;}const appearance=input.appearance??defaultAppearance(),gear=input.equipmentVisual??{},key=JSON.stringify([input.classId,appearance,equipmentVisualKey(gear)]);if(key===this.key)return;this.key=key;const generation=++this.generation;this.bodyPending=prepareAppearance(input.classId??'novice',appearance,gear).then(model=>{if(generation!==this.generation)return;this.bodyTexture?.dispose();this.model=model;this.frameCanvas=document.createElement('canvas');this.frameCanvas.width=this.frameCanvas.height=128;this.bodyTexture=texture(this.frameCanvas,1);this.bodyTexture.userData.atlas.rows=1;this.lastFrameImage=null;}).catch(e=>{this.error=e.message;console.error(e);});
  if(!this.loadingParts){this.loadingParts=true;this.weaponPending=normalizedParts('weapons',8).then(c=>{if(!this.disposed){this.weaponTexture=texture(c,8);this.weapon.material.map=this.weaponTexture;}}).catch(console.error);this.sheathPending=normalizedParts('gear',8).then(c=>{if(!this.disposed){this.sheathTexture=texture(c,8);this.sheath.material.map=this.sheathTexture;}}).catch(console.error);}
 }
 update(input,direction,visual,azimuth,time,width,height,camera){
  this.prepare(input);if(!this.bodyTexture)return false;
  const {x,y=0,z}=input,frame=actionFrame(input,visual,input.casting),classId=input.classId??'novice',bodyType=input.appearance?.bodyType??'masculine';if(!this.model)selectAtlasFrame(this.bodyTexture,frame,direction);this.body.material.map=this.bodyTexture;this.body.position.set(x,y+.055,z);this.body.center.set(.5,.1);this.body.scale.set(width,height,1);this.body.material.opacity=input.classEffects?.concealment?.remaining>0?.4:1;this.weapon.material.opacity=this.secondary.material.opacity=this.body.material.opacity;this.body.material.color.setHex(visual.state==='hurt'?0xffb7a0:0xffffff);this.body.material.rotation=0;
  const id=input.equipmentVisual?.weapon?.definitionId,family=weaponFamily(id),index=['sword','dagger','bow','staff'].indexOf(family),visible=index>=0&&input.hp!==0&&!!this.weaponTexture;
  const off=input.equipmentVisual?.offhand?.definitionId,twin=id==='pairedDaggers',hasShield=!twin&&off==='woodenShield',hasDagger=twin||weaponFamily(off)==='dagger';
  const pose=articulateDraw(this.poseTransition.update(renderTarget(frame,direction,family,visual.blend,hasShield),time),family,classId,bodyType,twin),rig=anatomyFor(classId,direction,bodyType),socket=handSocket(pose,false,classId,bodyType),otherSocket=handSocket(pose,true,classId,bodyType),primary=rig.primary,secondary=primary==='left'?'right':'left';
  this.pose=pose;this.frame=frame;
  if(this.model){const image=appearancePose(this.model,frame,direction,pose);if(image!==this.lastFrameImage){const g=this.frameCanvas.getContext('2d');g.clearRect(0,0,128,128);g.drawImage(image,0,0);this.bodyTexture.needsUpdate=true;this.lastFrameImage=image;}}
  const presentation=equipmentPresentation(pose,family,direction,classId,bodyType),{hip,pixel,angle}=presentation,blend=presentation.draw,held=presentation.held;this.presentation=presentation;
  camera?.updateMatrixWorld();const basis=camera?.matrixWorld.elements??[Math.cos(azimuth),0,-Math.sin(azimuth),0,0,1,0,0,Math.sin(azimuth),0,Math.cos(azimuth)],factor=height/3;
  const place=(sprite,pixel,grip,rotation,size,layer)=>{const p=billboardPoint(input,pixel,width,height,basis,layer*.003);sprite.position.set(p.x,p.y,p.z);sprite.center.set(grip.x/256,1-grip.y/256);sprite.scale.set(size[0]*factor,size[1]*factor,1);sprite.material.rotation=rotation;sprite.renderOrder=this.body.renderOrder+layer;sprite.layers.mask=this.body.layers.mask;};
  this.weapon.visible=visible;this.sheath.visible=visible&&index<2&&held&&!!this.sheathTexture;
  this.secondary.visible=input.hp!==0&&(hasShield||hasDagger)&&!!this.weaponTexture;
  if(this.secondary.visible){if(hasShield){this.shieldTexture??=shieldTexture();this.shieldBackTexture??=shieldTexture(true);this.secondary.material.map=direction===2?this.shieldBackTexture:this.shieldTexture;
   const attack=pose.action??0,shieldWidth=(direction===2?.56:direction%2?.60:.80)+(direction===2?.12:.1)*attack;
   place(this.secondary,otherSocket,{x:128,y:132},-(pose[secondary]+(pose[secondary+'Elbow']??0)*.35+pose.lean),[shieldWidth,.92+.13*attack],equipmentDepth(direction,true));
  }else{this.offhandTexture??=this.weaponTexture.clone();selectAtlasFrame(this.offhandTexture,held?3:2,direction);this.secondary.material.map=this.offhandTexture;
   const mount=held?otherSocket:torsoPoint(stowMount(rig,direction,true),pose);
   place(this.secondary,mount,gripFor('dagger',direction,held),held?pose.wrist:0,[.95*presentation.width,.95*presentation.length],equipmentDepth(direction,true));}}
  if(!visible)return true;
  const size=index===1?.95:index===3?1.9:index===2?1.6:1.4;
  selectAtlasFrame(this.weaponTexture,index*2+(held?1:0),direction);place(this.weapon,pixel,gripFor(family,direction,held),angle,[size*(held?presentation.width:.8),size*(held?presentation.length:.9)],equipmentDepth(direction,false,held));
  this.weapon.material.color.setHex(id?.includes('Perfect')?0xffe6b0:id?.includes('Failure')?0xc9c2bb:0xffffff);
  if(this.sheath.visible){selectAtlasFrame(this.sheathTexture,7,direction);const mouth={x:[170,92,128,166][direction],y:34};place(this.sheath,hip,mouth,-pose.lean,[index===1?.7:1.05,index===1?.7:1.05],equipmentDepth(direction,false,false));}
  return true;
 }
 ready(){return Promise.all([this.bodyPending,this.weaponPending,this.sheathPending]);}
 hide(){this.weapon.visible=this.sheath.visible=this.secondary.visible=false;}
 dispose(){this.disposed=true;this.generation++;this.bodyTexture?.dispose();this.weaponTexture?.dispose();this.sheathTexture?.dispose();this.offhandTexture?.dispose();this.shieldTexture?.dispose();this.shieldBackTexture?.dispose();this.secondary.removeFromParent();this.secondary.material.dispose();this.weapon.removeFromParent();this.sheath.removeFromParent();this.weapon.material.dispose();this.sheath.material.dispose();}
}
