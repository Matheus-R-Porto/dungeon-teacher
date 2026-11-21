// Billboards grow along camera-up; a fixed world-Y name anchor cuts through hats
// in an oblique camera. Use the standing body height, never the raised tool tip.
export function actorLabelPoint(view,actor){
 const p=actor.sprite.position,m=view.camera.matrixWorld.elements,h=(actor.sheet?.labelHeight??3.2)+.18;
 return view.screenPoint(p.x+m[4]*h,p.y+m[5]*h,p.z+m[6]*h);
}
