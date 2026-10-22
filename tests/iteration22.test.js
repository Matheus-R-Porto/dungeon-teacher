import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {expandLivingTower} from '../src/world/living-tower.js';
import {sharedFloor,FloorStore,geographyHash} from '../server/floor-store.js';
import {SharedTower} from '../server/tower.js';
import {SharedWorld} from '../server/world.js';
import {canStand} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {createEnemies} from '../src/domain/enemies/spawns.js';
const expanded=(f=1,seed=217021)=>expandLivingTower(sharedFloor(seed,f));

test('living migration is deterministic, idempotent and preserves original identities and portals',()=>{
 for(let f=1;f<=3;f++)for(const seed of [0,1,17,217021,4294967295]){
  const base=sharedFloor(seed,f),before=JSON.stringify(base),w=expandLivingTower(base);
  assert.equal(JSON.stringify(base),before);assert.deepEqual(expandLivingTower(w),w);assert.equal(geographyHash(expandLivingTower(base)),geographyHash(w));
  assert.deepEqual(w.interactables,base.interactables);assert.deepEqual(w.enemySpawns.slice(0,base.enemySpawns.length),base.enemySpawns);assert.deepEqual(w.graph.mainPath,base.graph.mainPath);
  assert.equal(w.enemySpawns.filter(s=>s.enemyType==='wolf').length,2*f-1);
  assert.ok(w.walkable.length>base.walkable.length);assert.ok(w.livingTower.water.every(p=>p.traversable));
  createEnemies(w.enemySpawns,w);
  for(const t of w.trails)for(let i=1;i<t.points.length;i++)assert.ok(findPath(w,t.points[i-1],t.points[i],.85),t.id);
  for(const i of w.interactables)assert.ok(canStand(w,i.x,i.z,.85),i.id);
  for(const p of w.livingTower.props.filter(p=>p.kind==='tree'))assert.equal(canStand(w,p.x,p.z,.32),false);
 }
});

test('floors 4–12 stay byte-equivalent after runtime expansion',()=>{for(let f=4;f<=12;f++){const w=sharedFloor(217021,f);assert.equal(JSON.stringify(expandLivingTower(w)),JSON.stringify(w));}});

test('loading expanded tower never writes back base geography or invokes migration on personal data',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dm-living-'));t.after(()=>{assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));fs.rmSync(dir,{recursive:true,force:true});});
 const store=new FloorStore(dir),base=store.load(1),file=path.join(dir,'floor-1.json'),bytes=fs.readFileSync(file);
 const first=new SharedTower({directory:dir}).world('shared-floor-1'),second=new SharedTower({directory:dir,seed:999}).world('shared-floor-1');
 assert.deepEqual(first.map,second.map);assert.deepEqual(fs.readFileSync(file),bytes);assert.equal(base.hash,geographyHash(base.definition));assert.equal(fs.readdirSync(dir).length,1);
});

test('wolf perception, grounded pursuit, cooldown, leash and player-safe bounded respawn',()=>{
 const w=new SharedWorld({map:expanded(2),random:()=>.5}),e=w.enemies.find(e=>e.enemyType==='wolf'),ws={close(){}},p=w.join(ws,'Test');ws.worldPlayer=p;
 Object.assign(p.game.player,{x:e.x,z:e.z+3});const hp=p.character.data.hp;for(let i=0;i<60;i++)w.step();assert.equal(e.targetId,p.id);assert.ok(p.character.data.hp<hp);assert.ok(canStand(w.map,e.x,e.z,e.radius));
 Object.assign(p.game.player,w.map.spawn);for(let i=0;i<200;i++)w.step();assert.equal(e.targetId,null);assert.equal(e.state,'idle');assert.ok(Math.hypot(e.x-e.spawnPosition.x,e.z-e.spawnPosition.z)<.2);
 e.damage(10000);e.deadAt=w.time;Object.assign(p.game.player,e.spawnPosition);const count=w.enemies.length;
 for(let i=0;i<660;i++)w.step();assert.equal(e.hp,0,'respawn waits while a player is nearby');
 Object.assign(p.game.player,w.map.spawn);w.step();assert.equal(e.generation,1);assert.equal(e.hp,e.stats.maxHP);assert.equal(w.enemies.length,count);assert.equal(new Set(w.snapshot().monsters.map(m=>m.id)).size,count);
});

test('first floor wolves and Slimes do not aggro merely by proximity',()=>{const w=new SharedWorld({map:expanded(1)}),ws={close(){}},p=w.join(ws,'Test');for(const e of w.enemies){Object.assign(p.game.player,{x:e.x,z:e.z+2});for(let i=0;i<10;i++)w.step();assert.equal(e.targetId,null);}});

test('new atlases have complete declared frames and transparent safe gutters',()=>{for(const [name,columns,rows] of [['monsters/wolf',7,4],['environment/living',4,2]]){const file='public/assets/'+name+'-v050.png',png=fs.readFileSync(file),m=JSON.parse(fs.readFileSync(file+'.json'));assert.equal(png.readUInt32BE(16),m.cell*columns);assert.equal(png.readUInt32BE(20),m.cell*rows);assert.equal(m.frames.length,columns*rows);for(const f of m.frames)assert.ok(f.bounds[0]>=8&&f.bounds[1]>=8&&f.bounds[2]<m.cell-8&&f.bounds[3]<m.cell-8);}});
import * as THREE from 'three';
import {buildCityNpcs} from '../src/adapters/rendering/city.js';
import {buildLivingForest} from '../src/adapters/rendering/living-forest.js';
import {SceneView} from '../src/adapters/rendering/scene.js';

test('NPC scale keeps foot anchoring, proportions and interaction coordinates',()=>{const npcs=Array.from({length:6},(_,i)=>({id:String(i),art:i,x:i*3,z:2})),before=structuredClone(npcs),view={scene:new THREE.Scene(),world:{npcs},mats:{stoneLight:new THREE.MeshBasicMaterial()},box:SceneView.prototype.box,mesh:SceneView.prototype.mesh};buildCityNpcs(view);assert.deepEqual(npcs,before);for(const [id,s]of view.npcModels){assert.equal(s.scale.x,4.5);assert.equal(s.scale.y,4.5);assert.equal(s.center.y,.1);assert.equal(s.position.x,npcs[+id].x);assert.equal(s.position.y,.04);}});

test('living renderer shares low vegetation materials, culls distant props and disposes scene resources',()=>{const view={scene:new THREE.Scene(),world:expanded(),occluders:[],actor:{dispose(){}},renderer:{dispose(){}}};buildLivingForest(view);const sprites=view.scene.children.filter(s=>s.isSprite),geometries=new Set(),materials=new Set();view.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});let disposed=0;for(const m of materials)m.addEventListener('dispose',()=>disposed++);view.updateLivingForest(1,{x:999,z:999},false);assert.ok(sprites.every(s=>!s.visible));assert.ok(materials.size<sprites.length);SceneView.prototype.dispose.call(view);assert.equal(disposed,materials.size);});
