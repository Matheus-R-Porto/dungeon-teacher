import * as THREE from 'three';
function shieldTexture(back=false){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#392d27';g.fillRect(12,8,40,32);g.fillRect(16,40,32,8);g.fillRect(24,48,16,8);g.fillStyle='#b98648';g.fillRect(16,12,32,28);g.fillRect(20,40,24,4);g.fillRect(28,44,8,8);g.fillStyle='#60432d';for(let x=22;x<48;x+=8)g.fillRect(x,13,2,27);g.fillStyle='#d5ccb1';g.fillRect(16,22,32,4);g.fillRect(26,26,12,10);g.fillStyle='#918773';g.fillRect(30,29,4,4);if(back){g.fillStyle='#61452e';g.fillRect(16,12,32,28);g.fillStyle='#302c27';g.fillRect(24,18,5,24);g.fillRect(38,18,5,24);g.fillStyle='#bc9861';g.fillRect(26,24,15,6);}const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;}
// One neutral shield, placed by direction; no anatomical solver or item variants.
export class SheetShield {
 constructor(scene){this.scene=scene;}
 update(input,direction,frame,body,camera){
  const visible=input.equipmentVisual?.offhand?.definitionId==='woodenShield'&&input.equipmentVisual?.weapon?.definitionId!=='pairedDaggers'&&frame!==32;
  if(visible&&!this.sprite){this.front=shieldTexture();this.back=shieldTexture(true);this.sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.front,transparent:true,alphaTest:.12,depthWrite:false,toneMapped:false}));this.scene.add(this.sprite);}
  if(!this.sprite)return;const s=this.sprite;s.visible=visible;if(!visible)return;
  s.material.map=direction===2?this.back:this.front;camera?.updateMatrixWorld();const e=camera?.matrixWorld.elements??[1,0,0,0,0,1,0,0,0,0,1],dx=([63,54,33,42][direction]-48)*body.scale.x/96,dy=24*body.scale.y/96,depth=direction===1?-.01:.01;
  s.position.set(body.position.x+e[0]*dx+e[4]*dy+e[8]*depth,body.position.y+e[1]*dx+e[5]*dy+e[9]*depth,body.position.z+e[2]*dx+e[6]*dy+e[10]*depth);s.scale.set(body.scale.x*(direction%2?.17:.24),body.scale.y*.3,1);s.material.rotation=frame===30?-.15:0;s.material.opacity=body.material.opacity;s.layers.mask=body.layers.mask;s.renderOrder=body.renderOrder+(direction===1?-1:1);
 }
 hide(){if(this.sprite)this.sprite.visible=false;}
 dispose(){if(this.sprite){this.sprite.removeFromParent();this.sprite.material.dispose();this.front.dispose();this.back.dispose();}}
}
