import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {actorLabelPoint} from '../src/adapters/rendering/actor-label.js';
test('names stay above standing billboard head at oblique camera angles',()=>{
 for(const pitch of [.3,.7,1.1]){
  const camera=new THREE.PerspectiveCamera(50,1.6,.1,100);camera.position.set(8,Math.tan(pitch)*12,8);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const sprite=new THREE.Sprite();sprite.position.set(1,.055,2);const sheet={labelHeight:3.2};
  const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1),head=sprite.position.clone().addScaledVector(up,3.2).project(camera);
  const point=actorLabelPoint({camera,screenPoint:(x,y,z)=>new THREE.Vector3(x,y,z).project(camera)},{sprite,sheet});
  assert.ok(point.y>head.y);assert.ok(Math.abs(point.x-head.x)<1e-12);
 }
});
