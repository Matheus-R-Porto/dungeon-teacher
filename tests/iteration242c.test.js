import {Game} from '../src/simulation/game.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {installWaterGeometry,waterAt,touchesWater,crossesWater} from '../src/world/water-geometry.js';
import {castTarget,nearestCast} from '../src/world/fishing-water.js';
import {canStand,clearSegment,moveWithCollision} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {layerWorld} from '../src/world/surfaces.js';
import {fishingArc,castProgress} from '../src/core/fishing-trajectory.js';
import {ActivityAnimation} from '../src/core/activity-animation.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {awakenTower} from '../src/world/awakened-tower.js';
import {sharedFloor} from '../server/floor-store.js';
import * as THREE from 'three';
import {FishingVisual} from '../src/adapters/rendering/fishing-visual.js';
const hub=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url)));
const world=()=>installWaterGeometry({bounds:{minX:-20,maxX:20,minZ:-20,maxZ:20},obstacles:[],waterFeatures:[{id:'pond',x:0,z:0,waterBounds:{radiusX:3,radiusZ:2}}]});
test('water blocks manual motion, click destinations, diagonal segments and enemy routes',()=>{
 const w=world();assert.equal(canStand(w,0,0,.32),false);assert.equal(findPath(w,{x:-6,z:0},{x:0,z:0},.32),null);
 for(const d of [{x:12,z:0},{x:12,z:8}]){const p=moveWithCollision(w,{x:-6,z:-d.z/2},d.x,d.z,.32);assert.ok(canStand(w,p.x,p.z,.32));}
 assert.equal(clearSegment(w,{x:-6,z:-3},{x:6,z:3},.32),false);
 const route=findPath(w,{x:-6,z:0,enemyType:'wolf'},{x:6,z:0},.85);assert.ok(route?.length>1);let p={x:-6,z:0};for(const q of route){assert.ok(clearSegment(w,p,q,.85));p=q;}
 assert.ok(canStand(w,2.8,1.8,.1),'dry bounding-box corners are not blocked');
});
test('visible contour, casting and collision share vertices; layers isolate water',()=>{
 const w=world(),b=w.waterBodies[0];for(const v of b.vertices){assert.ok(touchesWater(b,v,.01));assert.ok(crossesWater(b,{x:0,z:0},v,.01));}
 w.surfaces=[{id:'bridge',kind:'deck',x:0,z:0,halfX:9,halfZ:9,y:4,obstacles:[]}];
 assert.ok(canStand(layerWorld(w,'bridge'),0,0,.32));assert.equal(canStand(layerWorld(w,'ground'),0,0,.32),false);
 assert.throws(()=>castTarget(w,{x:3.5,z:0,y:4,surface:'bridge'},{x:2,z:0}),/margem/);
});
test('natural shores respect reach, water endpoint and solid obstacles',()=>{
 const w=world(),p={x:3.6,z:0},b=nearestCast(w,p);assert.ok(b);assert.ok(waterAt(w,b.bobber));assert.equal(w.fishingSpots,undefined);
 assert.throws(()=>castTarget(w,{x:10,z:0},{x:1,z:0}),/alcance/);
 assert.throws(()=>castTarget(w,{x:0,z:0},{x:1,z:0}),/margem/);
 assert.throws(()=>castTarget(w,p,{x:7,z:0}),/dentro/);
 w.obstacles.push({shape:'rect',x:3.05,z:0,halfX:.1,halfZ:1});assert.throws(()=>castTarget(w,p,{x:2,z:0}),/obstáculo/);
});
test('living lakes block shared navigation; source and population remain intact',()=>{
 const source=sharedFloor(42,1),before=JSON.stringify(source),w=awakenTower(source);assert.equal(JSON.stringify(source),before);
 for(const lake of w.livingTower.water){assert.equal(lake.traversable,false);assert.ok(w.waterBodies.some(b=>b.id===lake.id));assert.equal(canStand(layerWorld(w,'ground'),lake.x,lake.z,.32),false);}
 assert.ok(findPath(w,w.spawn,w.portal,.32));for(const e of w.enemySpawns)assert.ok(canStand(layerWorld(w,e.position.surface??'ground'),e.position.x,e.position.z,.32));
});
test('campaign fishes in a previously unsupported pool with unchanged grant',async()=>{
 const c=new Character(),s=new AreaSession(createAreas(hub),c,{seed:42});new Inventory(c).acquire('fishingRod');s.startRun();
 const lake=s.area.waterBodies.find(b=>b.id.startsWith('living-'));Object.assign(s.game.player,{x:lake.x+lake.radiusX+.8,z:lake.z});
 assert.ok(s.fishing.start());const fish=s.fishing.result;s.fishing.update(s.fishing.biteAt-s.fishing.time+.05);assert.ok(await s.fishing.pull());assert.equal(c.data.lifeSkills.fishing.xp,fish.xp);
 assert.throws(()=>s.fishing.start(),/acalmar/);
 s.fishing.update(3);s.fishing.start();s.game.player.x+=.2;s.fishing.update(.01);assert.equal(s.fishing.active,false);
});
test('arcs preserve endpoints and height independently of frame rate',()=>{
 const a={x:0,y:2,z:0},b={x:3,y:.05,z:2},out={};assert.deepEqual({...fishingArc(out,a,b,0,1.5)},a);const end=fishingArc(out,a,b,1,1.5);assert.ok(Math.abs(end.y-b.y)<1e-9);assert.equal(end.x,b.x);assert.equal(end.z,b.z);
 assert.ok(fishingArc(out,a,b,.5,1.5).y>2);assert.ok(fishingArc(out,b,a,.5,1.25).y>2);
 assert.equal(castProgress(.35,.35),1);for(const fps of [30,60,144])assert.equal(castProgress(Math.ceil(.35*fps)/fps,.35),1);
});
test('new reel pose is distinct and cancellation clears presentation',()=>{
 const a=new ActivityAnimation(),f={active:true,state:'cast',time:0,started:0,visualCancelRevision:0};a.update({fishing:f},0);
 f.active=false;f.visualReelRevision=1;a.update({fishing:f},1);assert.equal(a.update({fishing:f},1.3).frame,5);f.visualCancelRevision++;assert.equal(a.update({fishing:f},1.31),null);
 const png=fs.readFileSync(new URL('../public/assets/characters/fishing-reel-v064.png',import.meta.url));assert.equal(png.readUInt32BE(16),1024);assert.equal(png.readUInt32BE(20),1024);
});
test('fishing buffers survive repeated casts and all orientations; damage and map changes hide them',()=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();camera.updateMatrixWorld();const texture=new THREE.Texture();texture.userData.frame={column:1,row:0};
 const actor={texture,textures:new Map([['fishing-v043',texture]]),sprite:new THREE.Sprite()};actor.sprite.scale.set(4.8,4.8,1);
 const view={scene,camera,actor,mesh(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}};
 const visual=new FishingVisual(view),geometry=visual.line.geometry,buffer=geometry.attributes.position.array,world={};
 const f={active:true,area:world,character:{damageRevision:0,isAlive:true},damageRevision:0,config:{castSeconds:.35},spot:{bobber:{x:3,y:.05,z:0}},time:0,started:0,attempts:1};
 const game={world,player:{x:0,z:0,y:0,moving:false},elapsed:0,activity:{fishing:f}};
 for(let i=0;i<120;i++){texture.userData.frame.row=i%4;f.time=i/100;game.elapsed=i/100;visual.update(game);assert.equal(visual.line.geometry,geometry);assert.equal(geometry.attributes.position.array,buffer);assert.ok(buffer.every(Number.isFinite));}
 f.character.damageRevision++;visual.update(game);assert.equal(visual.group.visible,false);f.character.damageRevision=0;game.world={};visual.update(game);assert.equal(visual.group.visible,false);
 scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});texture.dispose();
});


test("initial position uses its declared elevated layer above blocked water",()=>{const w=world();w.surfaces=[{id:"bridge",kind:"deck",x:0,z:0,halfX:4,halfZ:4,y:4,obstacles:[]}];w.spawn={x:0,z:0,y:4,surface:"bridge"};assert.equal(new Game(w).player.surface,"bridge");w.spawn={x:0,z:0};assert.throws(()=>new Game(w),/bloqueada/);});
