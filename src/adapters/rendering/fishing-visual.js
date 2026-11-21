import {fishingArc} from '../../core/fishing-trajectory.js';
import * as THREE from 'three';
// One lightweight effect per visible participant. Character/tool poses are baked.
export class FishingVisual {
 constructor(view){this.view=view;this.tip=new THREE.Vector3();this.right=new THREE.Vector3();this.up=new THREE.Vector3();this.endpoint=new THREE.Vector3();this.destination=new THREE.Vector3();this.group=new THREE.Group();view.scene.add(this.group);this.group.visible=false;}
 prepare(){if(this.line)return;const v=this.view;
  this.bobber=v.mesh(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:0xffdf88}),this.group);
  this.line=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(51),3)),new THREE.LineBasicMaterial({color:0xf4e7c2}));this.line.frustumCulled=false;this.group.add(this.line);
  this.splash=v.mesh(new THREE.RingGeometry(.27,.33,20),new THREE.MeshBasicMaterial({color:0xc4f8ef,transparent:true,opacity:.7,side:THREE.DoubleSide}),this.group);this.splash.rotation.x=-Math.PI/2;
  this.fish=v.mesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({color:0x9fd9d0}),this.group);this.fish.scale.set(1,.6,1.8);
  this.miningImpact=v.mesh(new THREE.OctahedronGeometry(.2),new THREE.MeshBasicMaterial({color:0xffd485}),this.group);
 }
 update(game,actor=this.view.actor,player=game.player){
  const pose=actor.currentActivity,target=pose?.target;this.group.visible=!!target&&player.hp!==0;
  if(!this.group.visible)return;this.prepare();const now=game.elapsed??0;this.line.visible=this.bobber.visible=this.splash.visible=this.fish.visible=false;this.miningImpact.visible=!!pose.impact;
  if(pose.type==='mining'){if(this.miningImpact.visible){this.miningImpact.position.set(target.x,target.y??1,target.z);this.miningImpact.rotation.y=now*8;}return;}
  if(!actor.sheet.professionTip||!actor.sheet.professionPose){this.group.visible=false;return;}
  const anchor=actor.sheet.professionTip,body=actor.sprite;this.view.camera.updateMatrixWorld();this.right.setFromMatrixColumn(this.view.camera.matrixWorld,0);this.up.setFromMatrixColumn(this.view.camera.matrixWorld,1);
  this.tip.copy(body.position).addScaledVector(this.right,(anchor[0]/128-.5)*body.scale.x).addScaledVector(this.up,(104-anchor[1])/128*body.scale.y);
  this.destination.set(target.x,target.y??.05,target.z);const reel=pose.phase==='reel',cast=pose.phase==='cast'?Math.max(0,Math.min(1,((pose.elapsed??0)-.14)/.21)):1;
  if(reel)fishingArc(this.endpoint,this.destination,this.tip,Math.min(1,(pose.elapsed??0)/.85),1.25);
  else fishingArc(this.endpoint,this.tip,this.destination,cast,1.5);
  if(!reel&&cast===1)this.endpoint.y+=Math.sin(now*(pose.phase==='bite'?30:4))*(pose.phase==='bite'?.06:.015);
  this.line.visible=true;this.bobber.visible=!reel||!pose.caught;this.bobber.position.copy(this.endpoint);this.bobber.material.color.setHex(pose.phase==='bite'?0xff8168:0xffdf88);this.splash.visible=!reel&&cast===1;this.splash.position.set(target.x,(target.y??.05)+.015,target.z);this.splash.scale.setScalar(pose.phase==='bite'?1+Math.sin(now*15)*.3:.8);
  this.fish.visible=reel&&!!pose.caught;this.fish.position.copy(this.endpoint);this.fish.position.y-=.23;this.fish.rotation.z=Math.sin(now*12)*.2;
  const points=this.line.geometry.attributes.position;for(let i=0;i<points.count;i++){const u=i/(points.count-1);points.setXYZ(i,this.tip.x+(this.endpoint.x-this.tip.x)*u,this.tip.y+(this.endpoint.y-this.tip.y)*u-.22*4*u*(1-u),this.tip.z+(this.endpoint.z-this.tip.z)*u);}points.needsUpdate=true;
 }
 dispose(){this.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.group.removeFromParent();}
}
