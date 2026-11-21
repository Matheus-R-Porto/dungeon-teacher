import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {NativeProfession} from '../src/adapters/rendering/native-profession.js';
import {sharedTextureView} from '../src/adapters/rendering/shared-texture-view.js';
const input=(type='fishing',frame=0)=>({classId:'mage',appearance:{bodyType:'masculine'},professionPose:{type,poseFrame:frame}});
function fixture(loaded){
 const entries=new Map(),pending=[];
 const resources={acquire(key){let e=entries.get(key);if(!e){e={key,refs:0,loaded,texture:new THREE.Texture({width:2048,height:2048}),mask:new THREE.Texture()};e.ready=loaded?Promise.resolve(e):new Promise(resolve=>pending.push(()=>{e.loaded=true;resolve(e);}));entries.set(key,e);}e.refs++;return e;},release(e){e.refs--;assert.ok(e.refs>=0);}};
 return {entries,pending,sheet:new NativeProfession({mask:{value:null}},resources)};
}
test('NPC texture views share source without causing repeated pixel upload',()=>{
 const source=new THREE.Texture();source.needsUpdate=true;const version=source.source.version;
 const a=sharedTextureView(source),b=sharedTextureView(source);a.offset.set(.2,.4);
 assert.equal(a.source,source.source);assert.equal(b.source,source.source);assert.equal(source.source.version,version);assert.equal(b.offset.x,0);a.dispose();assert.equal(b.source,source.source);
});
test('cold visible direction becomes native without loading the other three directions',async()=>{
 const {sheet,pending,entries}=fixture(false),body=new THREE.Sprite(new THREE.SpriteMaterial());sheet.prepare(input());
 assert.equal(sheet.apply(input(),0,body,3,3),false);pending.forEach(f=>f());await sheet.ready();
 assert.equal(entries.size,1);for(let f=0;f<8;f++)assert.equal(sheet.apply(input('fishing',f),0,body,3,3),true);
 sheet.prepare({});assert.ok([...entries.values()].every(e=>e.refs===0));sheet.prepare(input());
 for(let d=0;d<4;d++){sheet.prepare(input(),d);pending.forEach(f=>f());await sheet.ready();for(let f=0;f<8;f++){body.position.set(8,.055,7);assert.equal(sheet.apply(input('fishing',f),d,body,3,3),true);assert.deepEqual(body.position.toArray(),[8,.055,7]);assert.ok(sheet.tip.every(v=>v>=0&&v<=1));assert.ok(body.scale.x>0&&body.scale.y>0);}}
 sheet.dispose();assert.ok([...entries.values()].every(e=>e.refs===0));
});
test('cancelling pending native art and changing identity releases every reference exactly once',async()=>{
 const {sheet,pending,entries}=fixture(false);sheet.prepare(input());sheet.prepare({...input(),classId:'warrior'});pending.forEach(f=>f());await Promise.all([...entries.values()].map(e=>e.ready));
 assert.equal(sheet.views.filter(Boolean).length,1);assert.ok([...entries.values()].filter(e=>e.key.includes('mage-')).every(e=>e.refs===0));assert.ok([...entries.values()].filter(e=>e.key.includes('warrior-')).every(e=>e.refs===1));sheet.prepare({});assert.ok([...entries.values()].every(e=>e.refs===0));sheet.dispose();assert.ok([...entries.values()].every(e=>e.refs===0));
});
test('warm native action preserves exact frame and tool identity through camera turns',()=>{
 const {sheet,entries}=fixture(true),body=new THREE.Sprite(new THREE.SpriteMaterial());sheet.prepare(input('mining',12));
 for(let d=0;d<4;d++){sheet.prepare(input('mining',12),d);assert.equal(sheet.apply(input('mining',12),d,body,3,3),true);assert.equal(body.material.map.userData.sourceFrame,4);assert.match(body.material.map.userData.nativeProfession,/mining-/);assert.equal(sheet.tip,null);}
 sheet.prepare({});assert.ok([...entries.values()].every(e=>e.refs===0));
});

test('41: turning during decode and disposing never installs a stale direction or retains references',async()=>{
 const {sheet,pending,entries}=fixture(false);sheet.prepare(input(),0);sheet.prepare(input(),3);pending.forEach(f=>f());await sheet.ready();assert.equal(sheet.views.filter(Boolean).length,1);assert.ok(sheet.views[3]);assert.equal([...entries.values()].filter(e=>e.refs>0).length,1);sheet.prepare(input('mining'),2);sheet.dispose();pending.forEach(f=>f());await Promise.all([...entries.values()].map(e=>e.ready));assert.equal(sheet.views.length,0);assert.ok([...entries.values()].every(e=>e.refs===0));
});
