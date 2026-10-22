import test from 'node:test';
import assert from 'node:assert/strict';
import {runSceneWork,bounded} from '../src/core/scene-work.js';
import {PreparationSlot} from '../src/core/preparation-slot.js';
import {WorldClient} from '../src/multiplayer/world-client.js';
import {testMap} from '../shared/world.js';
import * as THREE from 'three';
import {artTexture,dropUnusedArt} from '../src/adapters/rendering/art.js';
import {warmScene} from '../src/adapters/rendering/scene-warmup.js';
import {SceneView} from '../src/adapters/rendering/scene.js';

test('scene work preserves dependencies and yields within budget',async()=>{
 let now=0,frames=0;const order=[];function* build(){for(let i=0;i<9;i++){order.push(i);now+=2;yield 'unit';}}
 await runSceneWork(build(),{budget:3,now:()=>now,yieldFrame:async()=>frames++});assert.deepEqual(order,[0,1,2,3,4,5,6,7,8]);assert.equal(frames,4);
});
test('cancel closes partial builder without publishing remaining units',async()=>{
 const controller=new AbortController();let closed=false,count=0;function* build(){try{for(;;){count++;yield;}}finally{closed=true;}}
 await assert.rejects(runSceneWork(build(),{signal:controller.signal,budget:0,yieldFrame:async()=>controller.abort()}),{name:'AbortError'});assert.equal(count,1);assert.ok(closed);
});
test('partial builder failure closes its resource scope',async()=>{
 let closed=false;function* build(){try{yield 'floor';throw Error('missing');}finally{closed=true;}}
 await assert.rejects(runSceneWork(build()),/missing/);assert.ok(closed);
});
test('work can be retried after failure',async()=>{
 await assert.rejects(runSceneWork((function*(){throw Error('shader');})()));let ready=false;await runSceneWork((function*(){yield 'floor';ready=true;})());assert.ok(ready);
});
test('bounded waits reject timeout and cancellation',async()=>{
 await assert.rejects(bounded(new Promise(()=>{}),null,5),/limite/);const c=new AbortController(),promise=bounded(new Promise(()=>{}),c.signal);c.abort();await assert.rejects(promise,{name:'AbortError'});
});
test('speculative preparation deduplicates and releases completed resource',async()=>{
 const slot=new PreparationSlot();let loads=0,disposed=0;const load=()=>{loads++;return {dispose(){disposed++;}};};const first=slot.request('a',5,load);assert.equal(slot.request('a',5,load),first);await first;assert.equal(loads,1);slot.cancel();slot.cancel();assert.equal(disposed,1);
});
test('destination replacement discards late completion exactly once',async()=>{
 const slot=new PreparationSlot();let finish,disposed=0;const first=slot.request('a',5,()=>new Promise(r=>finish=r));await Promise.resolve();const second=slot.request('b',5,()=>({dispose(){}}));finish({dispose(){disposed++;}});await first;await second;assert.equal(disposed,1);assert.equal(slot.current.key,'b');slot.dispose();
});
test('budget refuses oversized resource without starting work',async()=>{
 const slot=new PreparationSlot({limit:10});let called=false;assert.equal(await slot.request('large',11,()=>called=true),null);assert.equal(called,false);assert.equal(slot.current,null);
});
test('failed preparation releases slot and permits retry',async()=>{
 const slot=new PreparationSlot();await slot.request('a',5,()=>{throw Error('missing');});assert.equal(slot.current,null);assert.ok(await slot.request('a',5,()=>({dispose(){}})));slot.dispose();
});
test('disconnect cancellation aborts loader and rejects late ownership',async()=>{
 const slot=new PreparationSlot();let signal,resolve,disposed=false;const promise=slot.request('a',1,s=>{signal=s;return new Promise(r=>resolve=r);});await Promise.resolve();slot.dispose();assert.ok(signal.aborted);resolve({dispose(){disposed=true;}});await promise;assert.ok(disposed);assert.equal(slot.current,null);
});

class Socket{
 constructor(){this.listeners={};this.readyState=1;this.bufferedAmount=0;}
 addEventListener(k,f){this.listeners[k]=f;}send(){}close(){this.readyState=3;}
 message(m){this.listeners.message({data:JSON.stringify(m)});}
}
function fixture(t,onMap){const seen=[],c=new WorldClient({url:'ws://localhost',Socket,onMap,onSnapshot:s=>seen.push(s.tick)});c.connect();t.after(()=>c.disconnect());const welcome=()=>c.socket.message({v:2,type:'world:welcome',id:'player',token:'token',map:testMap()});const snapshot=tick=>c.socket.message({v:2,type:'world:snapshot',mapId:testMap().id,tick,time:tick/20,players:[],monsters:[]});return {c,seen,welcome,snapshot};}
test('snapshots continue arriving during preparation; only latest is presented',async t=>{let ready;const f=fixture(t,()=>new Promise(r=>ready=r));f.welcome();f.snapshot(1);f.snapshot(2);assert.equal(f.c.lastTick,2);assert.deepEqual(f.seen,[]);ready();await Promise.resolve();await Promise.resolve();assert.deepEqual(f.seen,[2]);f.snapshot(3);assert.deepEqual(f.seen,[2,3]);});
test('completion from disconnected socket cannot publish stale snapshot',async t=>{let ready;const f=fixture(t,()=>new Promise(r=>ready=r));f.welcome();f.snapshot(1);f.c.disconnect();ready();await Promise.resolve();await Promise.resolve();assert.deepEqual(f.seen,[]);assert.equal(f.c.status,'Offline');});
test('map preparation rejection disconnects cleanly instead of hanging online',async t=>{const f=fixture(t,()=>Promise.reject(Error('shader')));f.welcome();await Promise.resolve();await Promise.resolve();await Promise.resolve();assert.match(f.c.status,/shader/);assert.equal(f.c.desired,false);});
test('superseded welcome cannot publish or disconnect the latest destination',async t=>{
 const pending=[];const f=fixture(t,()=>new Promise((resolve,reject)=>pending.push({resolve,reject})));f.welcome();f.welcome();f.snapshot(2);pending[0].reject(Error('obsolete'));await Promise.resolve();await Promise.resolve();assert.equal(f.c.status,'Online');assert.deepEqual(f.seen,[]);pending[1].resolve();await Promise.resolve();await Promise.resolve();assert.deepEqual(f.seen,[2]);
});
test('UV atlas instances share unchanged pixels without dirtying source again',t=>{
 const oldDocument=globalThis.document,load=THREE.TextureLoader.prototype.load;globalThis.document={};THREE.TextureLoader.prototype.load=()=>{const texture=new THREE.Texture({width:1280,height:640});texture.needsUpdate=true;return texture;};t.after(()=>{globalThis.document=oldDocument;THREE.TextureLoader.prototype.load=load;});
 const a=artTexture('/test-atlas-232',8,4),version=a.source.version,b=artTexture('/test-atlas-232',8,4,1,0);assert.equal(a.source,b.source);assert.equal(b.source.version,version);assert.ok(b.version>0);assert.notEqual(a.offset.x,b.offset.x);a.dispose();b.dispose();dropUnusedArt('/test-atlas-232');
});
test('GPU preparation failure restores visibility, culling, target and full shadows',async t=>{
 const raf=globalThis.requestAnimationFrame,caf=globalThis.cancelAnimationFrame;globalThis.requestAnimationFrame=fn=>setTimeout(fn,0);globalThis.cancelAnimationFrame=clearTimeout;t.after(()=>{globalThis.requestAnimationFrame=raf;globalThis.cancelAnimationFrame=caf;});
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1,.1,100);camera.position.z=5;const sun=new THREE.DirectionalLight();sun.position.set(0,10,5);sun.shadow.mapSize.set(1024,1024);scene.add(sun);const mesh=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());scene.add(mesh);let target=null,disposed=0;
 const renderer={getRenderTarget:()=>null,setRenderTarget:value=>{target=value;if(value&&!value.testObserved){value.testObserved=true;value.addEventListener('dispose',()=>disposed++);}},compileAsync:async()=>{},render:()=>{throw Error('GPU lost');}};
 await assert.rejects(warmScene({renderer,scene,camera,sun},new AbortController().signal,()=>{}),/GPU lost/);assert.equal(mesh.visible,true);assert.equal(mesh.frustumCulled,true);assert.equal(target,null);assert.equal(sun.shadow.mapSize.x,1024);assert.equal(disposed,1);mesh.geometry.dispose();mesh.material.dispose();
});
test('unchanged canvas size preserves the previous frame during preparation',()=>{
 let width=800,resizes=0;const view={height:24,canvas:{getBoundingClientRect:()=>({width,height:600})},renderer:{getSize:v=>v.set(800,600),setSize:()=>resizes++},camera:new THREE.OrthographicCamera()};SceneView.prototype.resize.call(view);assert.equal(resizes,0);width=900;SceneView.prototype.resize.call(view);assert.equal(resizes,1);
});
