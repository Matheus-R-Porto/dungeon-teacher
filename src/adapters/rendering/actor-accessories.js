import {artSprite} from './art.js';
import {selectAtlasFrame} from '../../core/atlas.js';
// Shared authored contact points: avatar pixels and cart pixels meet exactly.
// No body articulation, network fields or gameplay position changes.
export const CART_CONTACTS=Object.freeze({cell:128,scale:.66,hand:[[33,70],[59,71],[63,70],[35,71]],shaft:[[53,69],[15,55],[78,49],[113,55]]});
export class ActorAccessories {
 constructor(scene){this.scene=scene;this.travel=0;}
 update(input,direction,actor,camera){
  if(input.cart&&!this.cart){this.cart=artSprite('/assets/characters-v37-rv1/cart.png',2,4,0,0,2.1,2.1);this.cart.material.depthWrite=false;this.scene.add(this.cart);}
  if(this.previous){const distance=Math.hypot(input.x-this.previous.x,input.z-this.previous.z);if(input.moving&&distance<2)this.travel+=distance;}
  this.previous={x:input.x,z:input.z};if(!this.cart)return;const c=this.cart;c.visible=!!input.cart;c.layers.mask=actor.layers.mask;if(!input.cart)return;
  const phase=Math.floor((input.walkDistance??this.travel)/1.8*4)%4,bob=input.moving&&phase%2?1:0,[hx,hy]=CART_CONTACTS.hand[direction],[sx,sy]=CART_CONTACTS.shaft[direction];
  camera?.updateMatrixWorld();const e=camera?.matrixWorld.elements??[1,0,0,0,0,1,0,0,0,0,1],w=actor.scale.x,h=actor.scale.y,dx=(hx-48)*w/96,dy=(88-hy+bob)*h/96,depth=direction===2?.012:-.012;
  c.position.set(actor.position.x+e[0]*dx+e[4]*dy+e[8]*depth,actor.position.y+e[1]*dx+e[5]*dy+e[9]*depth,actor.position.z+e[2]*dx+e[6]*dy+e[10]*depth);
  c.center.set(sx/128,1-sy/128);c.scale.set(w*128/96*.66,h*128/96*.66,1);c.renderOrder=actor.renderOrder+(direction===2?2:-2);c.material.opacity=actor.material.opacity;
  selectAtlasFrame(c.material.map,Math.floor(this.travel/.22)%2,direction);
  c.userData.contact={hand:[hx,hy-bob],shaft:[sx,sy],direction};
 }
 dispose(){if(this.cart){this.cart.removeFromParent();this.cart.material.map.dispose();this.cart.material.dispose();}}
}
