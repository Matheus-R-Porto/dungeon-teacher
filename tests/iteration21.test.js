import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeHotbar,assignHotbar} from '../src/domain/abilities/hotbar.js';
import {Character} from '../src/domain/character/character.js';
import {decodeSave,encodeSave} from '../src/adapters/persistence/character-save.js';
import {cityMap} from '../shared/city.js';
import {createAreas} from '../src/simulation/areas.js';
import {canStand} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {SpriteActor} from '../src/adapters/rendering/sprite-actor.js';
import * as THREE from 'three';
const hub=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url),'utf8'));
test('configurable hotbar accepts only learned skills, swaps, clears and survives save',()=>{
 const c=new Character();c.data.knownAbilities=['powerStrike','regeneration'];const mp=c.data.mp,xp=c.data.xp;
 assignHotbar(c.data,7,'powerStrike');assignHotbar(c.data,6,'regeneration');assignHotbar(c.data,7,'regeneration');
 assert.equal(c.data.hotbar[6],'powerStrike');assert.equal(c.data.hotbar[7],'regeneration');assert.throws(()=>assignHotbar(c.data,2,'energyBall'));
 assert.throws(()=>assignHotbar(c.data,-1,null));assert.deepEqual(decodeSave(encodeSave(c.snapshot(),1)).hotbar,c.data.hotbar);
 assignHotbar(c.data,7,null);assert.equal(c.data.hotbar[7],null);assert.equal(c.data.mp,mp);assert.equal(c.data.xp,xp);
 assert.deepEqual(normalizeHotbar(['powerStrike','powerStrike','invalid'],['powerStrike']),['powerStrike',null,null,null,null,null,null,null]);
});
test('local city shares geography and keeps reachable local services and safe entry',()=>{
 const city=cityMap(),local=createAreas(hub)[hub.id];assert.deepEqual(local.bounds,city.bounds);assert.equal(local.environment,'city');assert.equal(local.npcs.length,6);assert.equal(local.districts.length,7);
 for(const spawn of [local.spawn,local.returnSpawn])assert.ok(canStand(local,spawn.x,spawn.z,.32));
 for(const id of ['weaponsmith','cook','cooking-station','forge','tower-portal']){const target=local.interactables.find(i=>i.id===id),point={x:target.x,z:target.z+1.2};assert.ok(findPath(local,local.spawn,point,.32)?.length,'reachable '+id);}
 assert.equal(local.interactables.find(i=>i.id==='tower-portal').content.areaId,'tower-floor-1');assert.equal(city.interactables[0].content.areaId,'shared-floor-1');
});
test('sprite walk keeps direction, phases do not reset on equal snapshots and weapon follows equipment',()=>{
 const a=new SpriteActor(new THREE.Scene());const state={x:0,z:0,heading:Math.PI,moving:true,hp:100,weaponType:'bow',phase:'idle'};
 a.update(state,0,1,false);const row=a.texture.offset.y;a.update(state,0,1.3,false);assert.equal(a.texture.offset.y,row);assert.equal(a.texture.userData.atlas.columns,6);
 a.update({...state,phase:'windup'},0,2,false);a.update({...state,phase:'windup'},0,2.1,false);assert.equal(a.phaseAt,2);assert.equal(a.visual.state,'drawing');assert.equal(a.weaponRoot,undefined);
 a.update({...state,hp:0},0,3,false);assert.equal(a.texture.userData.frame.column,7);assert.equal(a.weaponRoot,undefined);a.dispose();
});
test('static batching retains world geometry, material, shadow flags and dynamic objects',async()=>{
 const {batchStatic}=await import('../src/adapters/rendering/static-batch.js');const scene=new THREE.Group();scene.position.set(4,0,2);const mat=new THREE.MeshStandardMaterial(),nodes=[];
 for(const x of [0,2,4]){const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,2,3),mat);mesh.position.x=x;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);nodes.push(mesh);}
 const before=new THREE.Box3().setFromObject(scene),dynamic=nodes[2];batchStatic(scene,{exclude:new Set([dynamic])});assert.equal(scene.children.length,2);assert.ok(scene.children.includes(dynamic));assert.ok(new THREE.Box3().setFromObject(scene).equals(before));const merged=scene.children.find(n=>n!==dynamic);assert.equal(merged.material,mat);assert.equal(merged.castShadow,true);assert.equal(merged.receiveShadow,true);assert.equal(merged.geometry.attributes.position.count,72);
});
