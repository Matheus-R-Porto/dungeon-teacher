import {framePose,torsoPoint,handSocket} from './modular-pose.js';
import {anatomyFor} from './anatomy.js';
// Presentation only. The server/VisualCombat still decides whether the weapon is drawn.
// Resting arms bend at the elbow; the wrist keeps carried blades down, unlike attacks.
export function carryPose(frame,direction,family,blend=1,shield=false){
 const p=framePose(frame,direction),rig=anatomyFor('novice',direction),primary=rig.primary,secondary=primary==='left'?'right':'left';
 const inward=side=>side==='left'?-1:1,cycle=frame?Math.sin((frame-1)/5*Math.PI*2):0;
 const bend={sword:.18,dagger:.22,bow:.38,staff:.30}[family]??0;
 p.left*=.55;p.right*=.55;p.lean*=.65;p.bob*=.8;
 if(family){p[primary]+=inward(primary)*.07*blend;p[primary+'Elbow']=inward(primary)*bend*blend;}
 if(family==='dagger'){p[secondary]+=inward(secondary)*.07*blend;p[secondary+'Elbow']=inward(secondary)*bend*blend;}
 if(shield){p[secondary]+=inward(secondary)*.05;p[secondary+'Elbow']=inward(secondary)*.13;p[secondary]*=.65;}
 p.wrist=family==='sword'||family==='dagger'?Math.PI+(primary==='left'?-.08:.08)+cycle*.025:family==='bow'?(primary==='left'?-.10:.10):.035*cycle;
 return p;
}
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function stowMount(rig,direction,secondary=false){
 const side=secondary?(rig.primary==='left'?'right':'left'):rig.primary,arm=rig[side];
 const mount={x:secondary?256-[116,139,140,116][direction]:[116,139,140,116][direction],y:150};
 const dx=mount.x-arm.shoulder.x,dy=mount.y-arm.shoulder.y,d=Math.hypot(dx,dy),reach=Math.hypot(arm.elbow.x-arm.shoulder.x,arm.elbow.y-arm.shoulder.y)+Math.hypot(arm.hand.x-arm.elbow.x,arm.hand.y-arm.elbow.y)-.5;
 return d>reach?{x:arm.shoulder.x+dx*reach/d,y:arm.shoulder.y+dy*reach/d}:mount;
}
function reach(pose,side,arm,target){
 const dx=target.x-arm.shoulder.x,dy=target.y-arm.shoulder.y,a=Math.hypot(arm.elbow.x-arm.shoulder.x,arm.elbow.y-arm.shoulder.y),b=Math.hypot(arm.hand.x-arm.elbow.x,arm.hand.y-arm.elbow.y);
 const bend=(side==='left'?-1:1)*Math.acos(Math.max(-1,Math.min(1,(dx*dx+dy*dy-a*a-b*b)/(2*a*b))));
 const upper=Math.atan2(arm.elbow.y-arm.shoulder.y,arm.elbow.x-arm.shoulder.x),lower=Math.atan2(arm.hand.y-arm.elbow.y,arm.hand.x-arm.elbow.x);
 pose[side]=Math.atan2(dy,dx)-Math.atan2(b*Math.sin(bend),a+b*Math.cos(bend))-upper;
 pose[side+'Elbow']=bend-(lower-upper);
}
export function articulateDraw(source,family,classId,bodyType,twin=false){
 const draw=source.draw;if(!family||!(draw>0&&draw<1))return source;
 const pose={...source},rig=anatomyFor(classId,pose.direction,bodyType),amount=draw<=.5?smooth(draw*2):smooth((1-draw)*2);
 for(const secondary of twin?[false,true]:[false]){
  const side=secondary?(rig.primary==='left'?'right':'left'):rig.primary;
  // Solve in torso-local space. The arm first reaches the fixed holster, then
  // carries the weapon back to its active wrist; sheathing follows the reverse path.
  const local=handSocket({...source,lean:0,bob:0},secondary,classId,bodyType),mount=stowMount(rig,pose.direction,secondary);
  reach(pose,side,rig[side],{x:mix(local.x,mount.x,amount),y:mix(local.y,mount.y,amount)});
 }
 const carried=carryPose(0,pose.direction,family,1).wrist;
 pose.wrist=mix(carried,source.wrist??carried,smooth((draw-.5)*2));return pose;
}
const keys=['left','right','leftElbow','rightElbow','lean','bob','wrist','draw','action'];
export function renderTarget(frame,direction,family,blend,shield){
 const action=frame>=6&&frame<=20,p=frame<6?carryPose(frame,direction,family,blend,shield):framePose(frame,direction),primary=direction===0?'right':'left';
 if(frame>=6)p.wrist=-(p[primary]+p.lean);
 p.draw=action?1:blend;p.action=action?1:0;return p;
}
export class PoseTransition{
 update(target,time){
  const previousTime=this.time,dt=time-previousTime;this.time=time;
  // Discontinuous time means a new scene/sample, not an animation interval.
  if(!this.pose||dt<=0||dt>.4||target.direction!==this.pose.direction){this.pose={...target};this.target={...target};this.from=null;return this.pose;}
  // Advance the previous segment before accepting a new target. Draw progress can
  // change every tick; restarting first would freeze the pose until progress stops.
  if(this.from){const t=Math.min(1,(time-this.start)/this.duration),ease=t*t*(3-2*t);this.pose={...this.target};for(const k of keys)this.pose[k]=mix(this.from[k]??0,this.target[k]??0,ease);if(t===1)this.from=null;}
  if(keys.some(k=>(target[k]??0)!==(this.target[k]??0))){this.from={...this.pose};this.target={...target};this.start=time;this.duration=target.action!==this.pose.action ? .14 : .10;}
  return this.pose;
 }
}
export function equipmentPresentation(pose,family,direction,classId,bodyType){
 const draw=Math.max(0,Math.min(1,pose.draw)),action=pose.action??0,hand=handSocket(pose,false,classId,bodyType);
 // The opposite hip is a torso mount, behind the backpack when viewed from behind.
 const hip=torsoPoint(stowMount(anatomyFor(classId,direction,bodyType),direction),pose);
 const stowedAngle=family==='sword'||family==='dagger'?-.08:.16;
 const heldAngle=pose.wrist??0;
 const held=draw>=.5;
 return {hip,hand,draw,held,pixel:held?hand:hip,
  // No 180-degree sweep during drawing. A sheathed blade and a down-carried blade
  // share their physical axis; the two source cells have opposite artwork axes.
  angle:held?heldAngle:stowedAngle-pose.lean,
  width:mix(direction%2?.65:direction===2?.72:.88,1,action),
  length:mix(family==='sword'?.82:family==='dagger'?.92:1,1,action)};
}
