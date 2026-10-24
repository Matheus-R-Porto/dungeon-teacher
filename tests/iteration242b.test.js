import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {sharedFloor} from '../server/floor-store.js';
import {awakenTower} from '../src/world/awakened-tower.js';
import {Game} from '../src/simulation/game.js';
import {layerWorld} from '../src/world/surfaces.js';
import {canStand,moveWithCollision} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {regionLayer,followsPlayer,configureCaveCamera} from '../src/adapters/rendering/cave-visibility.js';
import {compileScene} from '../src/adapters/rendering/scene-compilation.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {Character} from '../src/domain/character/character.js';
const walk=(g,to)=>{assert.ok(g.moveTo(to),'route exists');for(let i=0;i<12000&&g.path.length;i++)g.update(1/30,{x:0,z:0},0);assert.ok(Math.hypot(g.player.x-to.x,g.player.z-to.z)<.1,JSON.stringify({at:g.player,to,path:g.path.length}));};
test('cave front entry, every passage, den and exit are walkable in three layouts',()=>{
 for(const seed of [1,42,217021]){const w=awakenTower(sharedFloor(seed,2)),a=w.awakening.cave,c=w.surfaces.find(s=>s.id===a.surface),g=new Game(w);Object.assign(g.player,a.entry);
  for(const p of c.route.slice(1))walk(g,{...p,y:c.y,surface:c.id});walk(g,a.den);assert.equal(g.player.y,-5);assert.equal(g.player.surface,c.id);
  walk(g,a.entry);assert.equal(g.player.y,0);assert.equal(g.player.surface,'ground');assert.ok(Math.abs(Math.abs(g.player.heading)-Math.PI)<.1);
 }
});
test('manual back and side approaches cannot enter the cave surface',()=>{
 const w=awakenTower(sharedFloor(42,2)),r=w.surfaces[0];
 for(const p of [{x:r.x,z:r.z+r.halfZ+8},{x:r.x-10,z:r.z},{x:r.x+10,z:r.z}]){let at={...p,y:0,surface:'ground'};for(let i=0;i<150;i++)at=moveWithCollision(w,at,(r.x-at.x)*.05,(r.z-at.z)*.05,.32);assert.equal(at.surface,'ground');}
});
test('a new click at the exact ramp/deck seam completes the crossing without teleporting',()=>{
 const w=awakenTower(sharedFloor(217021,2)),g=new Game(w),a=w.awakening.cave,c=w.surfaces[1];Object.assign(g.player,a.entry);assert.ok(g.moveTo(a.den));
 for(let i=0;i<3000&&g.player.surface!==c.id;i++)g.update(1/30,{x:0,z:0},0);
 assert.equal(g.player.surface,c.id);const before={...g.player};assert.ok(g.moveTo({...c.route[2],surface:c.id,y:c.y}));assert.deepEqual(g.player,before);walk(g,a.den);walk(g,a.entry);
});
test('rock walls block player and monster paths; exterior obstacles do not block underground',()=>{
 const w=awakenTower(sharedFloor(217021,2)),c=w.surfaces[1],a=w.awakening.cave,layer=layerWorld(w,c.id);
 assert.equal(canStand(layer,c.x+17,c.z-20,.32),false);assert.equal(findPath(w,a.den,{x:c.x+17,z:c.z-20,y:-5,surface:c.id},1),null);
 for(const e of w.enemySpawns.filter(e=>e.position.surface===c.id)){assert.ok(canStand(layer,e.position.x,e.position.z,e.enemyType==='whiteWolf'?1:.8),e.id);assert.ok(findPath(w,{...e.position,enemyType:e.enemyType},a.den,.32),e.id);}
 w.obstacles.push({shape:'circle',...a.den,radius:4});w.navRevision++;assert.ok(canStand(layerWorld(w,c.id),a.den.x,a.den.z,1));
});
test('camera layer policy excludes late exterior objects and includes only the correct dynamic region',()=>{
 const camera=new THREE.Camera(),scene=new THREE.Scene(),cave=new THREE.Group(),rock=new THREE.Mesh();cave.add(rock);scene.add(cave);regionLayer(cave,true);
 configureCaveCamera(camera,true);const lateTree=new THREE.Sprite();scene.add(lateTree);assert.equal(lateTree.layers.test(camera.layers),false);assert.equal(rock.layers.test(camera.layers),true);
 const remote=new THREE.Sprite();scene.add(remote);regionLayer(remote,false);assert.equal(remote.layers.test(camera.layers),false);regionLayer(remote,true);assert.equal(remote.layers.test(camera.layers),true);
 const player=new THREE.Sprite();followsPlayer(player);assert.equal(player.layers.test(camera.layers),true);configureCaveCamera(camera,false);assert.equal(player.layers.test(camera.layers),true);assert.equal(rock.layers.test(camera.layers),false);assert.equal(lateTree.layers.test(camera.layers),true);
});
test('cave composition preserves source, real mining resources and public wolf contract',()=>{
 const source=sharedFloor(42,2),before=JSON.stringify(source),w=awakenTower(source);assert.equal(JSON.stringify(source),before);assert.deepEqual(w.mineralVeins,source.mineralVeins);
 const wolf=w.enemySpawns.find(e=>e.enemyType==='whiteWolf');assert.ok(wolf.overrides.isMiniBoss&&wolf.overrides.optional);assert.equal(wolf.overrides.rewardXP,undefined);assert.equal(wolf.position.surface,'white-wolf-cave');
});
test('cave shaders prepare both regions without changing the visible camera mask',async()=>{
 const camera=new THREE.PerspectiveCamera(),scene=new THREE.Scene(),mesh=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());regionLayer(mesh,true);scene.add(mesh);let calls=0;
 await compileScene({world:{awakening:{cave:{}}},scene,camera,renderer:{compileAsync:async(_,prepared)=>{calls++;assert.ok(prepared.layers.test(mesh.layers));assert.notEqual(prepared,camera);}}},new AbortController().signal,()=>{});
 assert.equal(calls,1);assert.equal(camera.layers.isEnabled(1),false);mesh.geometry.dispose();mesh.material.dispose();
});
test('campaign uses the same connected cave geography without importing the persistent public boss',()=>{
 const session=new AreaSession(createAreas({id:'test-refuge'}),new Character(),{seed:42});session.startRun();session.enter('tower-floor-2');const cave=session.area.awakening.cave;
 Object.assign(session.game.player,cave.entry);walk(session.game,cave.den);walk(session.game,cave.entry);
 assert.ok(session.combat.enemies.some(e=>e.surface===cave.surface));assert.equal(session.combat.enemies.some(e=>e.enemyType==='whiteWolf'),false);
});
