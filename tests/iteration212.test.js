import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {SpriteActor} from '../src/adapters/rendering/sprite-actor.js';
import {ActivityAnimation} from '../src/core/activity-animation.js';
import {VisualCombat,VISUAL_COMBAT} from '../src/core/visual-combat.js';

test('each family renders complete stored and held five-frame walks in all directions',()=>{
 for(const type of ['sword','bow','dagger','staff'])for(let direction=0;direction<4;direction++){
  const scene=new THREE.Scene(),actor=new SpriteActor(scene),input={x:0,z:0,heading:-direction*Math.PI/2,moving:true,hp:100,weaponType:type,phase:'idle'};
  actor.update(input,0,0);const stored=new Set(),held=new Set();
  for(let i=1;i<=24;i++){input.x+=VISUAL_COMBAT.strideLength/24;actor.update(input,0,i*.02);stored.add(actor.texture.userData.frame.column);assert.equal(actor.texture.userData.frame.row,direction);}
  input.visualCombatRemaining=5;for(let i=25;i<50;i++){input.x+=VISUAL_COMBAT.strideLength/24;actor.update(input,0,i*.02);}
  for(let i=50;i<=74;i++){input.x+=VISUAL_COMBAT.strideLength/24;actor.update(input,0,i*.02);held.add(actor.texture.userData.frame.column);assert.equal(actor.texture.userData.frame.row,direction+4);}
  assert.deepEqual([...stored].sort(),[1,2,3,4,5]);assert.deepEqual([...held].sort(),[1,2,3,4,5]);
  assert.equal(scene.children.length,2,'only complete body and ground shadow');actor.dispose();assert.equal(scene.children.length,0);
 }
});

test('starting and stopping movement changes transition variant without resetting equipment progress',()=>{
 for(const weaponType of ['sword','bow','dagger','staff']){
  const a=new SpriteActor(new THREE.Scene()),input={x:0,z:0,hp:100,heading:0,weaponType,moving:false,phase:'idle'};a.update(input,0,0);
  input.visualCombatRemaining=5;a.update(input,0,.04);const before=a.visual.blend;
  input.moving=true;input.x=.05;a.update(input,0,.08);assert.ok(a.visual.blend>before);const atlas=a.texture.userData.atlas,frame=a.texture.userData.frame;assert.ok(atlas.columns===3?frame.row===4:frame.column>=3);
  input.moving=false;a.update(input,0,.12);assert.ok(a.visual.blend>.45);assert.equal(a.texture.userData.frame.row,0);assert.ok(a.texture.userData.frame.column<3);a.dispose();
 }
});

test('damage reaction pauses equip transition and preserves gameplay inputs',()=>{
 const v=new VisualCombat(),input={x:0,z:0,hp:100,weaponType:'sword',phase:'idle'};v.update(input,0);v.update({...input,hp:90},.016);assert.equal(v.state,'hurt');assert.equal(v.blend,0);
 for(let t=.032;t<.2;t+=.016)v.update({...input,hp:90},t);assert.equal(v.blend,0);
 v.update({...input,hp:90},.3);assert.equal(v.state,'drawing');assert.equal(input.hp,100);assert.equal(input.phase,'idle');
});

test('mining presents a strike only for a real strike event, never for timeout',()=>{
 const a=new ActivityAnimation(),m={state:'prepare',active:true,time:0,started:0},activity={mining:m};assert.equal(a.update(activity,0).frame,0);
 m.state='strike';m.time=.6;assert.equal(a.update(activity,.6).frame,1);
 m.state='idle';m.active=false;m.resultId=1;assert.equal(a.update(activity,1),null,'timeout is not a swing');
 m.visualStrikeRevision=1;assert.deepEqual(a.update(activity,2),{type:'mining',frame:3,impact:false});assert.equal(a.update(activity,2.2).frame,2);assert.equal(a.update(activity,2.7).frame,4);assert.equal(a.update(activity,3),null);
});

test('fishing follows real cast, wait, bite and reel events without changing them',()=>{
 const a=new ActivityAnimation(),f={active:true,state:'cast',time:0,started:0},activity={fishing:f};assert.equal(a.update(activity,0).frame,0);f.time=.4;assert.equal(a.update(activity,.4).frame,1);f.state='waiting';f.time=.9;assert.equal(a.update(activity,.9).frame,2);f.state='bite';assert.equal(a.update(activity,2).frame,3);f.state='idle';f.active=false;f.visualReelRevision=1;assert.equal(a.update(activity,2.1).frame,4);assert.equal(a.update(activity,3.6),null);assert.equal(f.state,'idle');
});

test('current PNGs match integer manifests with complete silhouettes inside safe margins',()=>{
 for(const name of ['adventurer','sword','bow','dagger','staff','sword-transition','bow-transition','dagger-transition','staff-transition','sword-action','bow-action','dagger-action','staff-action','mining','fishing']){
  const file=new URL('../public/assets/characters/'+name+'-v043.png',import.meta.url),png=fs.readFileSync(file),m=JSON.parse(fs.readFileSync(new URL(file.href+'.json')));
  assert.equal(png.readUInt32BE(16),m.cell*m.columns,name);assert.equal(png.readUInt32BE(20),m.cell*m.rows,name);assert.equal(m.frames.length,m.rows*m.columns,name);
  for(const f of m.frames){assert.ok(f.bounds[0]>=8&&f.bounds[1]>=8&&f.bounds[2]<m.cell-8&&f.bounds[3]<m.cell-8,name+' clipped frame');}
 }
});
