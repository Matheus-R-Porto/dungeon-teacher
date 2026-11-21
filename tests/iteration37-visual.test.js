import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {SHEET,sheetFrame,sheetCell,SKILL_MOTIONS,skillMotion} from '../src/core/sheet-animation.js';
import {CLASS_SKILLS} from '../src/domain/abilities/class-skills.js';import {ABILITIES} from '../src/domain/abilities/definitions.js';
import {SpriteActor} from '../src/adapters/rendering/sprite-actor.js';import {SheetActor} from '../src/adapters/rendering/sheet-actor.js';import {sheetCacheStats} from '../src/adapters/rendering/sheet-resources.js';import {defaultAppearance} from '../src/domain/appearance.js';import {RemoteState} from '../src/multiplayer/remote-state.js';
const v={blend:1,walkDistance:0,state:'attacking'},input={hp:100,phase:'windup',moving:true,action:{id:'fireball',phase:'preparation'}};
test('37 visual: every skill has a semantic motion; passives do not invent actions',()=>{
 assert.equal(Object.keys(SKILL_MOTIONS).length,85);for(const [id,s]of Object.entries(CLASS_SKILLS))assert.equal(skillMotion(id)==='passive',s.type==='passive',id);
 for(const [id,a]of Object.entries(ABILITIES)){assert.ok(skillMotion(id),id);for(const phase of ['preparation','execution','recovery'])assert.ok(Number.isInteger(sheetFrame({hp:100,action:{id,phase}},v,0)),id);}
 assert.equal(skillMotion('punishingLight'),'offensiveCast');assert.equal(skillMotion('redemptionLight'),'offensiveCast');assert.equal(skillMotion('doubleShot'),'ranged');assert.equal(skillMotion('regeneration'),'heal');assert.equal(skillMotion('unknown'),null);
});
test('37 visual: death, confirmed recoil and recovery override all attack inputs',()=>{
 assert.equal(sheetFrame({...input,hp:0,impact:{phase:'recoil'}},v,0),32);assert.equal(sheetFrame({...input,impact:{phase:'recoil'}},v,0),30);assert.equal(sheetFrame({...input,impact:{phase:'impactRecovery'}},v,0),31);
 assert.equal(sheetFrame(input,{...v,state:'hurt'},0),22,'light damage cannot replace cast');
 assert.equal(sheetFrame({hp:100,phase:'recovery',basicReleaseRemaining:.1},v,0),19);
});
test('37 visual: arrow rain draws a bow; sacred strikes and magic areas cast',()=>{
 for(const phase of ['preparation','execution']){assert.equal(sheetFrame({hp:100,action:{id:'arrowRain',phase}},v,0),phase==='preparation'?18:19);assert.equal(sheetFrame({hp:100,action:{id:'punishingLight',phase}},v,0),phase==='preparation'?22:23);assert.equal(sheetFrame({hp:100,action:{id:'sanctuary',phase}},v,0),phase==='preparation'?22:28);}
});
test('37 visual: four distinct stride phases loop by distance in stored and held states',()=>{
 for(const blend of [0,1]){const frames=Array.from({length:4},(_,i)=>sheetFrame({hp:100,moving:true},{...v,blend,walkDistance:i*SHEET.strideLength/4},0));assert.equal(new Set(frames).size,4);assert.equal(sheetFrame({hp:100,moving:true},{...v,blend,walkDistance:SHEET.strideLength},0),frames[0]);}
 for(let d=0;d<4;d++)for(let f=0;f<36;f++){const c=sheetCell(f,d);assert.ok(c.column>=0&&c.column<9&&c.row>=0&&c.row<16);}
});
test('37 visual: same family shares sheet despite armor, item rarity, colors and stored hair',async()=>{
 const a=new SheetActor(new THREE.Scene(),new THREE.Sprite(new THREE.SpriteMaterial())),appearance=defaultAppearance(),base={classId:'warrior',appearance,equipmentVisual:{weapon:{definitionId:'trainingSword'}}};a.prepare(base);await a.ready();const resource=a.resource;
 a.prepare({...base,appearance:{...appearance,primary:'#9a4544',hairStyle:'tied'},equipmentVisual:{...base.equipmentVisual,chest:{definitionId:'lightVest'}}});await a.ready();assert.equal(a.resource,resource);assert.equal(a.key,'warrior-masculine-sword');a.dispose();
});
test('37 visual: rapid class changes and disposal release pending sheet references',async()=>{
 const a=new SheetActor(new THREE.Scene(),new THREE.Sprite(new THREE.SpriteMaterial()));for(const classId of ['mage','warrior','priest','rogue','archer','novice'])a.prepare({classId,appearance:defaultAppearance()});a.dispose();await a.ready();await Promise.resolve();assert.equal(sheetCacheStats().active,0);assert.ok(sheetCacheStats().idle<=8);
});
test('37 visual: inactive activities do not hide class art; real mining retains event pose',async()=>{
 const a=new SpriteActor(new THREE.Scene()),s={x:0,z:0,heading:0,hp:100,impact:{phase:'idle'},activity:{mining:{active:false},fishing:{active:false}}};a.update(s,0,0);await a.sheet.ready();a.update(s,0,.1);assert.equal(a.sheet.palette.enabled.value,1);s.activity.mining={active:true,state:'prepare',time:0,started:0};a.update(s,0,.2);assert.equal(a.currentActivity.type,'mining');await a.sheet.ready();a.update(s,0,.21);assert.equal(a.sheet.palette.enabled.value,1);assert.ok(a.sheet.key.startsWith('profession:'));a.update({...s,impact:{phase:'recoil'}},0,.3);await a.sheet.ready();a.update({...s,impact:{phase:'recoil'}},0,.31);assert.equal(a.sheet.frame,30);a.dispose();
});
test('37 visual: remote interpolation retains authorized action and impact without inventing it',()=>{
 const state={x:0,z:0,heading:0,hp:100,moving:false,impact:{phase:'recoil',serial:4},action:{id:'fireball',phase:'preparation'},basicReleaseRemaining:.1};const r=new RemoteState({id:'other',name:'Other',state},0),q=r.sample(100);assert.deepEqual(q.impact,state.impact);assert.deepEqual(q.action,state.action);assert.equal(q.basicReleaseRemaining,.1);
});
test('37 visual: all sixty family sheets and masks have the documented grid',()=>{
 for(const c of ['novice','warrior','archer','rogue','priest','mage'])for(const b of ['masculine','feminine'])for(const f of ['none','sword','bow','staff','dagger'])for(const suffix of ['', '-mask']){const png=fs.readFileSync(new URL(`../public/assets/characters-v37/${c}-${b}-${f}${suffix}.png`,import.meta.url));assert.equal(png.readUInt32BE(16),864);assert.equal(png.readUInt32BE(20),1536);}
});

test('37 visual: cart wheels retain phase and contact while moving in four views',async()=>{
 const {ActorAccessories,CART_CONTACTS}=await import('../src/adapters/rendering/actor-accessories.js');
 for(let direction=0;direction<4;direction++){const a=new ActorAccessories(new THREE.Scene()),body=new THREE.Sprite(new THREE.SpriteMaterial()),camera=new THREE.PerspectiveCamera();body.scale.set(3,3,1);body.position.set(0,3,0);const input={x:0,z:0,y:3,heading:-direction*Math.PI/2,cart:true,moving:false};a.update(input,direction,body,camera);const first=a.cart.position.clone();assert.deepEqual(a.cart.userData.contact.shaft,CART_CONTACTS.shaft[direction]);input.x=.23;body.position.x=.23;input.moving=true;a.update(input,direction,body,camera);assert.ok(Math.abs(a.cart.position.x-first.x-.23)<1e-10);assert.equal(a.cart.material.map.userData.frame.row,direction);assert.equal(a.cart.material.map.userData.frame.column,1);input.moving=false;a.update(input,direction,body,camera);assert.equal(a.cart.material.map.userData.frame.column,1);input.cart=false;a.update(input,direction,body,camera);assert.equal(a.cart.visible,false);a.dispose();}
});
