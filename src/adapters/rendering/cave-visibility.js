// Default layer 0 is exterior, including objects added after scene construction.
// Layer 1 is underground; layer 2 follows the player (selection/effects/UI).
export const CAVE_LAYER=1,FOLLOW_LAYER=2;
export function regionLayer(object,underground){
 const layer=underground?CAVE_LAYER:0;
 if(object.userData.regionLayer===layer)return;
 object.userData.regionLayer=layer;object.traverse(o=>o.layers.set(layer));
}
export function followsPlayer(object){object.traverse(o=>o.layers.set(FOLLOW_LAYER));}
export function belowGround(p){return (p.y??0)<-.9;}
export function configureCaveCamera(camera,under){camera.layers.set(under?CAVE_LAYER:0);camera.layers.enable(FOLLOW_LAYER);}
