import * as THREE from 'three';
import {artTexture} from './art.js';
import {selectAtlasFrame} from '../../core/atlas.js';
// Four authored views, attached as one stable overlay. No limb solver or per-item art.
export class SheetBackpack {
 constructor(scene){this.scene=scene;}
 prepare(input){if(input.equipmentVisual?.backpack?.definitionId==='travelerBackpack'&&!this.sprite){this.texture=artTexture('/assets/characters-v37-rv1/backpack.png',4,1);this.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.texture,transparent:true,alphaTest:.12,depthWrite:false,toneMapped:false}));this.scene.add(this.sprite);}}
 update(input,direction,frame,body,camera){
  this.prepare(input);if(!this.sprite)return;const s=this.sprite;s.visible=input.equipmentVisual?.backpack?.definitionId==='travelerBackpack';if(!s.visible)return;
  const dead=[13,15,32].includes(frame),recoil=frame===30,walking=[2,3,4,5,6,7,8,9,10,12,14,16].includes(frame),step=walking?Math.floor((frame-(frame<10?2:10))/2):0;
  let px=[48,61,48,35][direction],py=63-(walking&&step%2?1:0),angle=0;
  if(recoil){px+=direction===1?3:direction===3?-3:1;py-=2;angle=direction===1?-.12:direction===3?.12:0;}
  if(frame===19||frame===20){px+=direction===1?-2:direction===3?2:0;py+=2;}
  if(dead){px=48;py=frame===13?72:80;angle=frame===13?0:(direction===1?-1:1)*(frame===15?.65:Math.PI/2);}
  selectAtlasFrame(this.texture,direction,0);camera?.updateMatrixWorld();const e=camera?.matrixWorld.elements??[1,0,0,0,0,1,0,0,0,0,1],w=body.scale.x,h=body.scale.y,dx=(px-48)*w/96,dy=(88-py)*h/96,depth=direction===2?.008:-.008;
  s.position.set(body.position.x+e[0]*dx+e[4]*dy+e[8]*depth,body.position.y+e[1]*dx+e[5]*dy+e[9]*depth,body.position.z+e[2]*dx+e[6]*dy+e[10]*depth);s.scale.set((direction%2?21:26)*w/96,29*h/96,1);s.material.rotation=angle;s.material.opacity=body.material.opacity;s.layers.mask=body.layers.mask;s.renderOrder=body.renderOrder+(direction===2?1:-1);
 }
 ready(){return this.texture?.userData.ready?.()??Promise.resolve();}
 hide(){if(this.sprite)this.sprite.visible=false;}
 dispose(){if(this.sprite){this.sprite.removeFromParent();this.sprite.material.dispose();this.texture.dispose();}}
}
