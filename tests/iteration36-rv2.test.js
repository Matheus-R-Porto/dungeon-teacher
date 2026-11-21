import test from 'node:test';import assert from 'node:assert/strict';
import {carryPose,renderTarget,PoseTransition,equipmentPresentation,articulateDraw} from '../src/core/carry-pose.js';
import {framePose,handSocket,actionFrame} from '../src/core/modular-pose.js';
import {anatomyFor,ANATOMY_CLASSES} from '../src/core/anatomy.js';
import {VisualCombat} from '../src/core/visual-combat.js';
import {equipmentDepth} from '../src/core/equipment-pose.js';
import * as THREE from 'three';
import {ModularActor} from '../src/adapters/rendering/modular-actor.js';
const families=['sword','bow','staff','dagger'],bodies=['masculine','feminine'];
test('36 RV2: the first walk cell is one, with independently retained drawn/stowed state',()=>{
 for(const drawn of [false,true]){const v=new VisualCombat(),p={x:0,z:0,hp:100,moving:true,phase:'idle',weaponType:'sword'};if(drawn){v.blend=1;v.weapon='sword';p.visualCombatRemaining=5;}
 const state=v.update(p,1);assert.equal(actionFrame(p,state),1);assert.equal(state.blend,drawn?1:0);const pose=renderTarget(1,2,'sword',state.blend,true),s=equipmentPresentation(pose,'sword',2,'warrior','masculine');assert.equal(s.held,drawn);assert.equal(s.draw,drawn?1:0);assert.deepEqual(s.pixel,drawn?s.hand:s.hip);}
});
test('36 RV2: carried swords point down within a narrow walking arc in all classes and bodies',()=>{
 for(const cls of ANATOMY_CLASSES)for(const body of bodies)for(let d=0;d<4;d++)for(let f=1;f<=5;f++){const p=renderTarget(f,d,'sword',1,true),s=equipmentPresentation(p,'sword',d,cls,body);assert.ok(Math.abs(s.angle-Math.PI)<.12);assert.equal(s.length,.82);assert.ok(s.width<1);assert.ok(Math.abs(p.left)<.16&&Math.abs(p.right)<.16);assert.deepEqual(s.pixel,handSocket(p,false,cls,body));}
});
test('36 RV2: carried pose bends actual forearms differently for each family',()=>{
 const poses=families.map(f=>carryPose(1,2,f,1,true)),elbows=poses.map(p=>p.leftElbow);assert.equal(new Set(elbows).size,4);
 for(const p of poses){const base=handSocket(framePose(1,2),false,'warrior'),hand=handSocket(p,false,'warrior');assert.ok(hand.x>base.x);assert.ok(Math.hypot(hand.x-base.x,hand.y-base.y)<18);}
});
test('36 RV2: all five walking cells, closing seam and shield hand stay bounded',()=>{
 for(const cls of ANATOMY_CLASSES)for(const body of bodies)for(let d=0;d<4;d++)for(const family of families){const poses=Array.from({length:5},(_,i)=>renderTarget(i+1,d,family,1,true));for(let i=0;i<5;i++){const a=poses[i],b=poses[(i+1)%5];assert.ok(Math.abs(a.wrist-b.wrist)<.08);for(const secondary of [false,true]){const x=handSocket(a,secondary,cls,body),y=handSocket(b,secondary,cls,body);assert.ok(Math.hypot(x.x-y.x,x.y-y.y)<8);}assert.ok(Math.abs(a.lean)<.01&&Math.abs(a.bob)<1.3);}}
});
test('36 RV2: walk and strike are separate poses, with continuous transitions in both directions',()=>{
 for(const family of families)for(let direction=0;direction<4;direction++){const transition=new PoseTransition(),walk=renderTarget(1,direction,family,1,true),attack=renderTarget(6+families.indexOf(family)*3,direction,family,1,true);assert.notEqual(walk.wrist,attack.wrist);let last=transition.update(walk,1),time=1;for(const target of [attack,walk,renderTarget(0,direction,family,1,true)]){for(let n=0;n<14;n++){const p=transition.update(target,time+=1/60);assert.ok(Math.abs(p.wrist-last.wrist)<.7);const a=handSocket(p),b=handSocket(last);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<15);last={...p};}assert.ok(Math.abs(last.wrist-target.wrist)<.001);}}
});
test('36 RV2: backpack occludes both stowed and carried rear equipment without a depth pop',()=>{
 assert.equal(equipmentDepth(2,false,false),-1);assert.equal(equipmentDepth(2,false,true),-1);assert.equal(equipmentDepth(2,true),-1);
 for(const family of families)for(let f=0;f<6;f++){const p=renderTarget(f,2,family,1,true);assert.equal(p.direction,2);assert.ok(Math.abs(p.bob)<1.3);}
});
test('36 RV2: drawing never uses the old lateral half-turn and does not change authorized gear',()=>{
 const equipment={weapon:{definitionId:'trainingSword'},offhand:{definitionId:'woodenShield'},backpack:{definitionId:'travelerBackpack'}},saved=structuredClone(equipment);
 for(let n=0;n<=20;n++){const blend=n/20,p=renderTarget(1,2,'sword',blend,true),s=equipmentPresentation(p,'sword',2,'warrior','masculine');assert.equal(s.held,n>=10);if(n>=10)assert.ok(Math.abs(s.angle-Math.PI)<.12);assert.equal(s.draw,blend);}
 assert.deepEqual(equipment,saved);
});
test('36 RV2: deterministic snapshots produce identical poses for local and remote clients',()=>{
 const a=new PoseTransition(),b=new PoseTransition();for(let n=0;n<180;n++){const f=n<60?1+n%5:n<90?6:1+n%5,target=renderTarget(f,2,'sword',1,true);assert.deepEqual(a.update(target,n/60),b.update(target,n/60));}
});
test('36 RV2: continuously changing draw targets advance instead of restarting a frozen tween',()=>{
 const t=new PoseTransition();t.update(renderTarget(0,2,'sword',0,true),0);let previous=0;
 for(let n=1;n<=60;n++){const p=t.update(renderTarget(0,2,'sword',n/60,true),n/60);assert.ok(p.draw>=previous);if(n>2)assert.ok(p.draw>previous);previous=p.draw;}
 assert.ok(previous>.7);for(let n=61;n<=72;n++)t.update(renderTarget(0,2,'sword',1,true),n/60);assert.equal(t.pose.draw,1);
});
test('36 RV2: every anatomy reaches its holster before the blade becomes hand-held',()=>{
 for(const cls of ANATOMY_CLASSES)for(const body of bodies)for(let d=0;d<4;d++)for(const family of families){
  const p=articulateDraw(renderTarget(1,d,family,.5,true),family,cls,body,family==='dagger'),s=equipmentPresentation(p,family,d,cls,body);
  assert.ok(Math.hypot(s.hand.x-s.hip.x,s.hand.y-s.hip.y)<1e-7,cls+'/'+body+'/'+d+'/'+family);assert.ok(s.held);
  const reaching=equipmentPresentation(articulateDraw(renderTarget(1,d,family,.25,true),family,cls,body),family,d,cls,body);assert.equal(reaching.held,false);assert.deepEqual(reaching.pixel,reaching.hip);
 }
});
test('36 RV2: drawing and sheathing follow the wrist or fixed mount with no free-floating path',()=>{
 for(const cls of ANATOMY_CLASSES)for(const body of bodies)for(let d=0;d<4;d++)for(const family of families){let previous;
  for(let n=0;n<=80;n++){const blend=n<=40?n/40:(80-n)/40,p=articulateDraw(renderTarget(1,d,family,blend,true),family,cls,body),s=equipmentPresentation(p,family,d,cls,body);
   assert.deepEqual(s.pixel,s.held?s.hand:s.hip);if(previous)assert.ok(Math.hypot(s.pixel.x-previous.x,s.pixel.y-previous.y)<8);previous=s.pixel;
  }
 }
});
test('36 RV2: the real equipment sprites follow the interpolated wrist at every walk/attack transition',()=>{
 const c=new THREE.PerspectiveCamera(45,1,.1,100);c.position.set(7,9,7);c.lookAt(0,1.3,0);c.updateMatrixWorld();
 const map=()=>{const t=new THREE.Texture();t.userData.atlas={columns:24,rows:4};return t;};
 for(const cls of ANATOMY_CLASSES)for(const bodyType of bodies)for(let d=0;d<4;d++)for(const [i,family]of families.entries()){
  const a=new ModularActor(new THREE.Scene(),new THREE.Sprite(new THREE.SpriteMaterial()));a.prepare=()=>{};for(const k of ['bodyTexture','weaponTexture','sheathTexture','shieldTexture','shieldBackTexture'])a[k]=map();
  const p={x:0,y:0,z:0,hp:100,moving:true,phase:'idle',weaponType:family,classId:cls,appearance:{bodyType},equipmentVisual:{weapon:{definitionId:['trainingSword','trainingBow','trainingStaff','pairedDaggers'][i]},offhand:family==='sword'?{definitionId:'woodenShield'}:null}};
  try{for(let n=0;n<40;n++){p.phase=n<10||n>=26?'idle':n<18?'windup':'recovery';a.update(p,d,{state:'combat',blend:1,walkFrame:Math.floor(n/4)%5},Math.PI/4,1+n/60,3,3,c);
   for(const secondary of [false,true]){if(secondary&&!a.secondary.visible)continue;const point=handSocket(a.pose,secondary,cls,bodyType),expected=new THREE.Vector3((point.x/256-.5)*3,(.9-point.y/256)*3,0).applyQuaternion(c.quaternion).add(a.body.position).project(c),actual=(secondary?a.secondary:a.weapon).position.clone().project(c);assert.ok(expected.distanceTo(actual)<.002,cls+'/'+bodyType+'/'+d+'/'+family+'/'+n);}
  }}finally{a.dispose();}
 }
});
