import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {NativeAction,expandedPose} from '../src/adapters/rendering/native-action.js';
test('weapon movement uses held family and preserves existing attack and skill gestures',()=>{
 for(const family of ['sword','bow','staff','dagger']){
  assert.deepEqual([10,12,14,16].map(f=>expandedPose(f,family).index),[1,2,3,0]);
  assert.equal(expandedPose(21,family).group,family);
  assert.equal(expandedPose(18,family),null);
  assert.equal(expandedPose(33,family,{action:{id:'support'}}),null);
  assert.equal(expandedPose(10,family,{professionPose:{type:'fishing'}}),null);
 }
 assert.deepEqual(expandedPose(18,'none'),{group:'core',index:0});
 for(const [frame,index] of [[19,1],[20,2],[21,3],[13,4],[15,5],[32,6],[29,7]])assert.deepEqual(expandedPose(frame,'none'),{group:'core',index});
 for(const [frame,index] of [[11,8],[3,9],[5,10],[7,11],[9,8]])assert.deepEqual(expandedPose(frame,'none',{cart:true}),{group:'core',index});
});
test('family changes during loading release stale resources and cannot install wrong weapon',async()=>{
 const entries=[],callbacks=[],released=new Set();
 const resources={acquire(key){const e={key,texture:new THREE.Texture({width:1024,height:1024}),mask:new THREE.Texture(),loaded:false};e.ready=new Promise(r=>callbacks.push(()=>{e.loaded=true;r(e);}));entries.push(e);return e;},release(e){if(e){assert.ok(!released.has(e));released.add(e);}}};
 const a=new NativeAction({mask:{value:null}},resources),input={classId:'warrior',appearance:{bodyType:'feminine'}},body=new THREE.Sprite(new THREE.SpriteMaterial());
 a.prepare(input,0,10,'sword');assert.equal(a.apply(body,3,3),false);a.prepare(input,0,14,'bow');callbacks.forEach(f=>f());await a.ready();
 assert.equal(a.apply(body,3,3),true);assert.equal(body.material.map.userData.nativeAction,'warrior-feminine-bow-0');assert.equal(body.material.map.userData.sourceFrame,7);assert.ok(released.has(entries[0]));
 const source=body.material.map.source,version=source.version;a.prepare(input,0,12,'bow');a.apply(body,3,3);assert.equal(body.material.map.source,source);assert.equal(source.version,version);assert.equal(entries.length,2);
 a.dispose();assert.equal(released.size,2);
});
