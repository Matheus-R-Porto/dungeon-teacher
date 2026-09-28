import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveFacing, worldFacingLabel } from '../src/core/actor-animation.js';
import { placeholderPose } from '../src/adapters/rendering/placeholder-poses.js';
import { Game } from '../src/simulation/game.js';
const rad=degrees=>degrees*Math.PI/180;
const empty={bounds:{minX:-50,maxX:50,minZ:-50,maxZ:50},obstacles:[],spawn:{x:0,z:0},portal:{x:40,z:40,interactRadius:2}};

test('stationary actor keeps world facing throughout a 360 degree camera sweep',()=>{
  const game=new Game(empty);const original=game.player.heading;let previous=null;const visited=new Set();
  for(let degree=0;degree<=360;degree++){
    game.update(1/60,{x:0,z:0},rad(degree));
    const state=resolveFacing(game.player.heading,rad(degree),previous);previous=state.direction;visited.add(state.visualFacing);
    assert.equal(game.player.heading,original);
  }
  assert.equal(visited.size,8);
  assert.equal(resolveFacing(Math.PI,0).visualFacing,'N');
  assert.equal(resolveFacing(Math.PI,Math.PI).visualFacing,'S');
});
test('hysteresis stabilizes each boundary, including the 360 degree seam',()=>{
  for(let index=0;index<8;index++){
    let prev=index;
    for(const offset of [22.2,22.7,22.4,23.1,22.1,24.9]){prev=resolveFacing(0,rad(index*45+offset),prev).direction;assert.equal(prev,index);}
    prev=resolveFacing(0,rad(index*45+26),prev).direction;assert.equal(prev,(index+1)%8);
    assert.equal(resolveFacing(0,rad(index*45+22.3),prev).direction,prev);
  }
  assert.equal(resolveFacing(0,rad(359),0).direction,0);
});
test('movement at 77 degrees updates logical facing and idle/camera changes preserve it',()=>{
  const game=new Game(empty);
  for(const axis of [{x:0,z:-1},{x:1,z:0},{x:-1,z:1},{x:0,z:1}]){
    const before={...game.player};game.update(.1,axis,rad(77));
    assert.ok(Math.abs(game.player.heading-Math.atan2(game.player.x-before.x,game.player.z-before.z))<1e-9);
    const facing=game.player.heading;
    for(const angle of [0,77,180,285,359]){game.update(.1,{x:0,z:0},rad(angle));assert.equal(game.player.heading,facing);}
  }
  assert.equal(worldFacingLabel(Math.PI),'N');assert.equal(worldFacingLabel(0),'S');
});
test('every direction contains full body parts and distinct projected torso and feet',()=>{
  const torsoViews=new Set(),footViews=new Set();
  for(let direction=0;direction<8;direction++){
    const pose=placeholderPose(direction,0);
    for(const part of ['torso','hood','arm--1','arm-1','leg--1','leg-1','foot--1','foot-1','backpack','staff']) assert.ok(pose.some(f=>f.part===part),part);
    torsoViews.add(JSON.stringify(pose.filter(f=>f.part==='torso').map(f=>f.points)));
    footViews.add(JSON.stringify(pose.filter(f=>f.part==='foot-1').map(f=>f.points)));
    for(const face of pose)for(const [x,y] of face.points){assert.ok(x>=0&&x<=64);assert.ok(y>=0&&y<=96);}
  }
  assert.ok(torsoViews.size>=4);assert.equal(footViews.size,8);
});
test('face is absent from rear and strict profile views; backpack is behind torso',()=>{
  for(const direction of [2,3,4,5,6])assert.equal(placeholderPose(direction,0).some(f=>f.part==='face'),false);
  const front=placeholderPose(0,0),back=placeholderPose(4,0);
  const depth=(pose,part)=>Math.max(...pose.filter(f=>f.part===part).map(f=>f.depth));
  assert.ok(depth(front,'backpack')<depth(front,'torso'));
  assert.ok(depth(back,'backpack')>depth(back,'torso'));
});
test('walk strides and arm poses change across all eight directions without rotating only the head',()=>{
  for(let dir=0;dir<8;dir++)for(const part of ['arm-1','foot-1','staff']){
    const points=frame=>placeholderPose(dir,frame).filter(f=>f.part===part).map(f=>f.points);
    assert.notDeepEqual(points(3),points(5));
  }
});
