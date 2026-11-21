import {framePose,rotatePoint} from '../../core/modular-pose.js';
import {anatomyFor} from '../../core/anatomy.js';
const surface=()=>{const c=document.createElement('canvas');c.width=c.height=256;c.getContext('2d').imageSmoothingEnabled=false;return c;};
function armPath(g,arm,left){const edge=left?0:256,side=left?1:-1;g.beginPath();g.moveTo(edge,110);g.lineTo(arm.shoulder.x+side*7,110);g.lineTo(arm.shoulder.x+side*8,arm.shoulder.y+8);g.lineTo(arm.hand.x+side*12,arm.hand.y+9);g.lineTo(edge,arm.hand.y+9);g.closePath();}
function armPart(source,arm,left){const c=surface(),g=c.getContext('2d');g.save();armPath(g,arm,left);g.clip();g.drawImage(source,0,0);g.restore();return c;}
export function splitBody(body,rig){const left=armPart(body,rig.left,true),right=armPart(body,rig.right,false),torso=surface(),g=torso.getContext('2d');g.drawImage(body,0,0);g.globalCompositeOperation='destination-out';g.drawImage(left,0,0);g.drawImage(right,0,0);g.globalCompositeOperation='source-over';return {left,right,torso};}
function full(g,source){if(source)g.drawImage(source,0,0,source.width,source.height,0,0,256,256);}
function draw(g,source,pivot,angle){if(!source)return;g.save();g.translate(pivot.x,pivot.y);g.rotate(angle);g.translate(-pivot.x,-pivot.y);full(g,source);g.restore();}
// Equipment is kept intact until its anatomical transform. A backpack is never
// passed through an arm mask. Every output starts transparent and owns its pixels.
export function poseFrame(layers,frame,direction,classId='novice',bodyType='masculine',override=null,size=256){
 const out=surface();out.width=out.height=size;const g=out.getContext('2d');g.imageSmoothingEnabled=false;g.scale(size/256,size/256);const pose=override??framePose(frame,direction),rig=layers.rig??anatomyFor(classId,direction,bodyType);
 if(frame>=22){const rest=poseFrame(layers,0,direction,classId,bodyType);g.translate(128,frame===23?174:148);g.rotate((direction===1?-1:1)*(frame===23?Math.PI/2:.55));g.drawImage(rest,-128,-128);return out;}
 full(g,layers.legs);g.save();g.translate(rig.hip.x,rig.hip.y+pose.bob);g.rotate(pose.lean);g.translate(-rig.hip.x,-rig.hip.y);
 if(direction!==2)full(g,layers.backpack);
 const arms=layers.parts??splitBody(layers.body,rig),drawArm=side=>{const arm=rig[side],bend=pose[side+'Elbow']??0;if(!bend){draw(g,arms[side],arm.shoulder,pose[side]);return;}g.save();g.translate(arm.shoulder.x,arm.shoulder.y);g.rotate(pose[side]);g.translate(-arm.shoulder.x,-arm.shoulder.y);
 // Two overlapping segments preserve the shoulder and move the actual forearm/wrist.
 g.save();g.translate(arm.elbow.x,arm.elbow.y);g.rotate(bend);g.translate(-arm.elbow.x,-arm.elbow.y);g.beginPath();g.rect(0,arm.elbow.y-3,256,256);g.clip();full(g,arms[side]);g.restore();
 g.save();g.beginPath();g.rect(0,0,256,arm.elbow.y+3);g.clip();full(g,arms[side]);g.restore();g.restore();};
 const far=rig.near?(rig.near==='left'?'right':'left'):'left';drawArm(far);full(g,arms.torso);full(g,layers.vest);
 if(direction===2)full(g,layers.backpack);
 drawArm(far==='left'?'right':'left');
 if(layers.ring){const side=rig.primary;const arm=rig[side];g.save();g.translate(arm.shoulder.x,arm.shoulder.y);g.rotate(pose[side]);g.translate(-arm.shoulder.x,-arm.shoulder.y);draw(g,layers.ring,arm.elbow,pose[side+'Elbow']??0);g.restore();}
 full(g,layers.head);g.restore();return out;
}
