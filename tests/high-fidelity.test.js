import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {originalPose,OriginalSheet} from '../src/adapters/rendering/high-fidelity.js';
import {ORIGINALS} from '../src/adapters/rendering/original-manifest.js';

test('experimental originals retain native resolution and valid pivots in all twelve identities',()=>{
 assert.equal(Object.keys(ORIGINALS).length,12);
 for(const [id,m]of Object.entries(ORIGINALS)){
  assert.equal(m.sourceScale,1);assert.equal(m.frames.length,64);
  for(const suffix of ['', '-mask']){
   const b=fs.readFileSync(new URL('../public/assets/originals-hf/'+id+suffix+'.png',import.meta.url));
   assert.equal(b.readUInt32BE(16),m.atlasWidth??m.cellWidth*8);assert.equal(b.readUInt32BE(20),m.atlasHeight??m.cellHeight*8);
  }
  for(const f of m.frames){assert.ok(f.pivot.every(v=>v>=0&&v<=1));assert.ok(f.size[0]+f.offset[0]<=(f.textureRect?.[2]??m.cellWidth));assert.ok(f.size[1]+f.offset[1]<=(f.textureRect?.[3]??m.cellHeight));}
 }
});
test('unavailable original states keep complete production poses',()=>{
 for(const frame of [1,11,13,15,17,29,32,33,34,35])assert.equal(originalPose(frame),null);
 assert.equal(originalPose(0,'none',{cart:true}),null);
 assert.equal(originalPose(0,'none',{professionPose:{type:'mining'}}),null);
 for(const frame of [18,19,20])assert.equal(originalPose(frame,'none'),null);
 assert.deepEqual(originalPose(18,'bow'),{source:'actions',column:0});
 assert.deepEqual(originalPose(20,'staff'),{source:'actions',column:3});
 assert.deepEqual(originalPose(30),{source:'main',column:6});
 assert.equal(originalPose(32),null);assert.equal(originalPose(21,'none'),null);
});
test('native atlas transforms preserve rest height and foot anchor without changing authority',()=>{
 for(const [id,m]of Object.entries(ORIGINALS))for(let direction=0;direction<4;direction++){
  const body=new THREE.Sprite(new THREE.SpriteMaterial());body.scale.set(3,3,1);body.position.set(17,.055,12);
  const sheet=new OriginalSheet({mask:{value:null}});sheet.id=id;sheet.meta=m;
  sheet.texture=new THREE.Texture({width:m.cellWidth*8,height:m.cellHeight*8});sheet.resource={key:'original:'+id,mask:new THREE.Texture()};
  assert.equal(sheet.apply(0,direction,'none',{},body),true);
  assert.ok(Math.abs(body.scale.y-3*(m.frames[direction*8].textureRect?.[3]??m.cellHeight)*m.scalePerDirection[direction]/96)<1e-12);
  assert.deepEqual(body.position.toArray(),[17,.055,12]);assert.deepEqual(body.center.toArray(),m.frames[direction*8].pivot);
  assert.equal(sheet.apply(0,direction,'none',{cart:true},body),false);
 }
});
