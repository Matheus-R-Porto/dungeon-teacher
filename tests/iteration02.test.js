import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/core/config.js';
import { OrbitState } from '../src/core/orbit.js';
import { visualDirection, animationFrame } from '../src/core/actor-animation.js';
import { InteractionSystem, validateInteractables } from '../src/simulation/interaction.js';
import { cameraDirection } from '../src/simulation/game.js';
import { InputController } from '../src/adapters/input/input.js';

const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const world = {bounds:{minX:-20,maxX:20,minZ:-20,maxZ:20},obstacles:[]};
const player = {x:0,z:0,heading:0};
const item = (id,x,z,extra={}) => ({id,x,z,radius:4,priority:0,label:`Examinar ${id}`,action:'examine',content:{title:id},...extra});

test('Q/E orbit continuously, reverse, and stop at an arbitrary angle without drift', () => {
  const orbit=new OrbitState();
  for(let i=0;i<47;i++) orbit.update(1/60,1);
  const stopped=orbit.azimuth;
  assert.ok(Math.abs(stopped/(Math.PI/2)-Math.round(stopped/(Math.PI/2)))>.01);
  for(let i=0;i<600;i++) orbit.update(1/60,0);
  close(orbit.azimuth,stopped);
  for(let i=0;i<47;i++) orbit.update(1/60,-1);
  close(orbit.azimuth,Math.PI/4);
});

test('orbital speed is independent of frame rate and wraps after many turns', () => {
  const a=new OrbitState(),b=new OrbitState();
  for(let i=0;i<30;i++)a.update(1/30,1);
  for(let i=0;i<144;i++)b.update(1/144,1);
  close(a.azimuth,b.azimuth);
  a.rotate(1000*Math.PI*2); close(a.azimuth,b.azimuth);
});

test('horizontal drag is proportional and releases at the exact angle', () => {
  const orbit=new OrbitState(); orbit.drag(123); close(orbit.azimuth,Math.PI/4+123*CONFIG.cameraDragSensitivity);
  const angle=orbit.azimuth; orbit.update(.1,0); close(orbit.azimuth,angle);
  orbit.drag(-123); close(orbit.azimuth,Math.PI/4);
});

test('zoom eases toward a clamped target without changing azimuth', () => {
  const orbit=new OrbitState(); orbit.zoom(-1000);
  assert.equal(orbit.targetHeight,CONFIG.minCameraHeight);
  orbit.update(1/60,0); assert.ok(orbit.height>CONFIG.minCameraHeight&&orbit.height<CONFIG.cameraHeight);
  for(let i=0;i<200;i++)orbit.update(1/60,0);
  assert.equal(orbit.height,CONFIG.minCameraHeight);
  orbit.zoom(1000); orbit.update(1,0,true); assert.equal(orbit.height,CONFIG.maxCameraHeight);
  close(orbit.azimuth,Math.PI/4);
});

test('WASD remains screen-relative at non-cardinal camera angles', () => {
  for(const degrees of [37,124,213,359.8]) {
    const a=degrees*Math.PI/180,up=cameraDirection(0,-1,a),right=cameraDirection(1,0,a);
    close(up.x*Math.cos(a)-up.z*Math.sin(a),0);
    close(right.x*Math.sin(a)+right.z*Math.cos(a),0);
    close(Math.hypot(up.x,up.z),1);
  }
});

test('sprites select all eight directions relative to camera, including angle wrapping', () => {
  for(let i=0;i<8;i++)assert.equal(visualDirection(0,i*Math.PI/4),i);
  assert.equal(visualDirection(1.3,1.3),0);
  assert.equal(visualDirection(1.3+Math.PI,1.3),4);
  assert.equal(visualDirection(0,2*Math.PI-.01),0);
  assert.equal(visualDirection(.5,1.1),visualDirection(.5+1,1.1+1));
});

test('animation clips have independent frame ranges and missing art falls back to idle', () => {
  for(const t of [0,.14,.3,.7,20]) {
    assert.ok(animationFrame('idle',t)<2);
    assert.ok(animationFrame('walk',t)>=2&&animationFrame('walk',t)<6);
    assert.equal(animationFrame('attack',t),animationFrame('idle',t));
  }
});

test('generic interaction supports multiple types and deterministic distance/priority/facing selection', () => {
  const system=new InteractionSystem(world,[item('back',0,-2),item('front',0,2)]);
  assert.equal(system.update(player).id,'front');
  system.items.push(item('near',1,0)); assert.equal(system.update(player).id,'near');
  system.items.push(item('priority',3,0,{priority:1})); assert.equal(system.update(player).id,'priority');
  const command=system.activate(player); assert.equal(command.content.title,'priority'); assert.equal(command.type,'examine');
});

test('interaction rejects out-of-range, disabled, paused and obstructed targets', () => {
  const blocked={...world,obstacles:[{id:'wall',shape:'rect',x:0,z:1,halfX:2,halfZ:.1}]};
  const s=new InteractionSystem(blocked,[item('target',0,2)]);
  assert.equal(s.update(player),null);
  s.world=world; assert.ok(s.update(player));
  assert.equal(s.activate({...player,z:-10}),null);
  assert.equal(s.activate(player,true),null);
  s.items[0].enabled=false; assert.equal(s.update(player),null);
});

test('F revalidates a previously selected target and ignores only its declared collider', () => {
  const s=new InteractionSystem({...world,obstacles:[{id:'sign',shape:'circle',x:0,z:2,radius:.2}]},[item('sign',0,2,{ignoreObstacles:['sign']})]);
  assert.equal(s.update(player).id,'sign');
  s.items[0].enabled=false; assert.equal(s.activate(player),null);
});

test('interaction ties have stable IDs and small motion does not flicker targets', () => {
  const s=new InteractionSystem(world,[item('b',-1,0),item('a',1,0)]);
  assert.equal(s.update(player).id,'a');
  assert.equal(s.update({...player,x:-.02}).id,'a');
  assert.equal(s.update({...player,x:-.5}).id,'b');
  assert.throws(()=>validateInteractables([item('x',0,1),item('x',1,0)]));
});

test('actual input adapter holds Q/E, captures middle drag, ignores vertical motion, and clears on blur', () => {
  const saved={window:globalThis.window,document:globalThis.document,HTMLElement:globalThis.HTMLElement};
  class Element extends EventTarget { constructor(){super();this.captures=new Set();this.classList={add(){},remove(){}};} matches(){return false;} focus(){} setPointerCapture(id){this.captures.add(id);} hasPointerCapture(id){return this.captures.has(id);} releasePointerCapture(id){this.captures.delete(id);} }
  globalThis.HTMLElement=Element; globalThis.window=new EventTarget(); globalThis.document=new EventTarget();
  const canvas=new Element(), orbit=new OrbitState(); let moves=0,blurred=0;
  const actions={isBlocked:()=>false,drag:dx=>orbit.drag(dx),moveTo:()=>moves++,zoom:()=>{},interact:()=>{},help:()=>{},escape:()=>{},blur:()=>blurred++};
  const dispatch=(target,type,data={})=>{const event=new Event(type,{cancelable:true});Object.assign(event,data);target.dispatchEvent(event);return event;};
  const input=new InputController(canvas,actions);
  try {
    dispatch(window,'keydown',{key:'e',repeat:false});
    for(let i=0;i<60;i++)orbit.update(1/60,input.orbitAxis);
    close(orbit.azimuth,Math.PI/4+CONFIG.cameraOrbitSpeed);
    dispatch(window,'keyup',{key:'e'}); const stop=orbit.azimuth; orbit.update(1,input.orbitAxis); close(orbit.azimuth,stop);
    assert.ok(dispatch(canvas,'pointerdown',{button:1,pointerId:4,clientX:100}).defaultPrevented);
    dispatch(canvas,'pointermove',{pointerId:4,buttons:4,clientX:100,clientY:300}); close(orbit.azimuth,stop);
    dispatch(canvas,'pointermove',{pointerId:4,buttons:4,clientX:150,clientY:600}); close(orbit.azimuth,stop+.3);
    dispatch(canvas,'pointerup',{pointerId:4,button:1});
    dispatch(canvas,'pointermove',{pointerId:4,buttons:0,clientX:300}); close(orbit.azimuth,stop+.3); assert.equal(moves,0);
    dispatch(canvas,'pointerdown',{button:0,pointerId:5,clientX:100,clientY:100}); assert.equal(moves,1);
    dispatch(window,'keydown',{key:'q',repeat:false}); assert.equal(input.orbitAxis,-1);
    dispatch(window,'blur'); assert.equal(input.orbitAxis,0); assert.equal(blurred,1); assert.equal(input.dragPointer,null);
  } finally {input.dispose();Object.assign(globalThis,saved);}
});
