import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {Character} from '../src/domain/character/character.js';
import {Inventory,ITEMS} from '../src/domain/items/inventory.js';
import {validateChest,grantChest} from '../src/domain/items/chest.js';
import {chestReward,LOOT_POOL,LOOT_WEIGHTS,selectReward} from '../src/domain/items/loot.js';
import {RewardReel} from '../src/ui/reward-reel.js';
import {openingPose,REWARD_TIMING} from '../src/ui/reward-animation.js';
import {confirmedChestReward} from '../src/multiplayer/online-reward.js';
import {itemArt} from '../src/ui/inventory-presentation.js';
import {encodeSave,decodeSave} from '../src/adapters/persistence/character-save.js';
import {OnlineTower} from '../server/online-tower.js';
const setup=(seed=17)=>{const c=new Character(),bag=new Inventory(c),chest=bag.acquire('expeditionChest',{rewardSeed:seed});return {c,bag,chest};};

test('opening presents a closed chest, anticipation, physical opening and transition in order',()=>{
 const phases=[];for(let time=0;time<2;time+=.005){const pose=openingPose(time);if(phases.at(-1)?.phase!==pose.phase)phases.push(pose);}
 assert.deepEqual(phases.map(p=>p.phase),['closed','anticipation','crack','half','open','transition','reel']);
 assert.deepEqual(phases.map(p=>p.frame),[0,0,1,2,3,3,3]);
 assert.ok(Object.values(REWARD_TIMING).every(Number.isFinite));
 assert.equal(openingPose(0,{...REWARD_TIMING,closed:0,anticipation:0,crack:0,half:0,open:0,transition:0}).phase,'reel');
});
test('unchanged uniform loot intervals and deterministic quantities for all eight items',()=>{
 assert.equal(LOOT_POOL.length,8);assert.deepEqual(LOOT_WEIGHTS,Array(8).fill(1));
 for(let n=0;n<8;n++){assert.equal(selectReward(LOOT_POOL,LOOT_WEIGHTS,(n+.5)/8),LOOT_POOL[n]);assert.equal(ITEMS[LOOT_POOL[n]].stackable,false);}
 for(let seed=0;seed<100;seed++){const {c,chest}=setup(seed),before=c.snapshot(),selected=validateChest(c,chest.instanceId,true);assert.deepEqual(selected.reward,chestReward(chest));assert.deepEqual(c.snapshot(),before);}
});
test('every skip timing and frame rate lands on the original reward without modifying it',()=>{
 for(const fps of [20,30,60,144])for(const time of [0,.1,1,8,45]){
  const reward=chestReward(setup().chest),reel=new RewardReel(reward,LOOT_POOL,{duration:2.4,speed:12});
  for(let i=0;i<time*fps;i++)reel.update(1/fps);reel.finish();const offset=reel.offset;
  assert.equal(reel.phase,'stopped');assert.equal(reel.cards[offset],reward.itemId);reel.finish();reel.stop();reel.update(100);assert.equal(reel.offset,offset);
 }
});
test('gradual reel deceleration is monotone and lands on the same result as skip',()=>{
 const reward=chestReward(setup().chest),r=new RewardReel(reward,LOOT_POOL,{duration:2.4});r.update(.85);r.stop();let prev=r.offset,delta=Infinity;
 for(let i=0;i<25;i++){r.update(.1);assert.ok(r.offset>=prev);assert.ok(r.offset-prev<=delta+1e-8);delta=r.offset-prev;prev=r.offset;}
 assert.equal(r.cards[r.offset],reward.itemId);assert.equal(r.phase,'stopped');
 assert.throws(()=>new RewardReel(reward,LOOT_POOL,{duration:0}));assert.throws(()=>r.update(-1));
});
test('prepared opening cancelled or reloaded preserves chest ID, seed, transport and result',()=>{
 const {c,chest}=setup();c.data.gold=90;const before=c.snapshot(),selection=validateChest(c,chest.instanceId,true);
 const restored=new Character(decodeSave(encodeSave(c.snapshot(),1)));assert.deepEqual(restored.snapshot(),before);
 assert.deepEqual(validateChest(restored,chest.instanceId,true).reward,selection.reward);
 assert.throws(()=>grantChest(restored,selection,true));assert.deepEqual(restored.snapshot(),before);
});
test('full inventory, unsafe area and changed seed fail without granting or consuming',()=>{
 const {c,bag,chest}=setup(),selection=validateChest(c,chest.instanceId,true);
 assert.throws(()=>grantChest(c,selection,false),/Refúgio/);for(let i=1;i<32;i++)bag.acquire('focusRing');const full=c.snapshot();
 assert.throws(()=>grantChest(c,selection,true),/Libere/);assert.deepEqual(c.snapshot(),full);
 c.data.inventory.slots[31]=null;chest.rewardSeed++;const changed=c.snapshot();assert.throws(()=>grantChest(c,selection,true),/alterado/);assert.deepEqual(c.snapshot(),changed);
});
test('successful grant is indivisible, cannot repeat, and survives save/reload',()=>{
 const {c,chest}=setup(),selection=validateChest(c,chest.instanceId,true),reward=grantChest(c,selection,true),after=c.snapshot();
 assert.equal(c.data.gold,reward.gold);assert.equal(c.data.inventory.slots.filter(Boolean).length,1);assert.equal(c.data.inventory.slots.find(Boolean).quantity,1);
 assert.throws(()=>grantChest(c,selection,true));assert.deepEqual(c.snapshot(),after);assert.deepEqual(new Character(decodeSave(encodeSave(after,1))).snapshot(),after);
});
test('overloaded legacy chest opening preserves the net weight exception for every seed',()=>{
 for(let seed=0;seed<40;seed++){const {c,chest}=setup(seed);c.data.inventory.slots[1]={definitionId:'water',instanceId:'item-100',quantity:90};c.data.inventory.nextId=101;c.recalculate();const old=c.carry.totalGrams;
  const reward=grantChest(c,validateChest(c,chest.instanceId,true),true);assert.ok(c.carry.totalGrams<=old);assert.equal(new Inventory(c).count('water'),90);assert.ok(ITEMS[reward.itemId].weightGrams<=ITEMS.expeditionChest.weightGrams);
 }
});
test('all real reel rewards map to existing 128px PNGs and atlas has four cells with alpha',()=>{
 for(const id of [...LOOT_POOL,'expeditionChest']){const file=new URL('../public'+itemArt(id).inventoryIcon,import.meta.url),png=fs.readFileSync(file);assert.equal(png.readUInt32BE(16),128);assert.equal(png.readUInt32BE(20),128);assert.equal(png[25],6);}
 const atlas=fs.readFileSync(new URL('../public/assets/rewards-v30/chest-opening.png',import.meta.url));assert.equal(atlas.readUInt32BE(16)%2,0);assert.equal(atlas.readUInt32BE(20)%2,0);assert.equal(atlas[25],6);
});
test('online display requires a server receipt, actual new item, quantity and consumed target',()=>{
 const {c,chest}=setup(),before=c.snapshot(),r=grantChest(c,validateChest(c,chest.instanceId,true),true),after={...c.snapshot(),notice:`Baú aberto: ${r.itemId} e ${r.gold} Ouro.`};
 assert.deepEqual(confirmedChestReward(before,after,chest.instanceId),r);
 for(const change of [a=>a.notice='',a=>a.gold++,a=>a.inventory.slots.find(Boolean).quantity=2,a=>a.inventory.slots.push(chest)]){const bad=structuredClone(after);change(bad);assert.equal(confirmedChestReward(before,bad,chest.instanceId),null);}
 assert.equal(confirmedChestReward(before,{...before,notice:after.notice},chest.instanceId),null);
});
test('existing authoritative online opening persists once, preserves full-bag behavior and rolls back failed save',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dm-chest30-'));let tower=new OnlineTower({directory:path.join(dir,'maps'),characterDirectory:path.join(dir,'people'),worldOptions:{random:()=>.5}});
 t.after(()=>{tower?.close();assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));fs.rmSync(dir,{recursive:true,force:true});});
 const ws={close(){}};tower.join(ws,'Tesouro','a'.repeat(64));const p=ws.worldPlayer,{c,bag,chest}=setup(41);for(let n=1;n<32;n++)bag.acquire('focusRing');p.character=c;
 const cmd=()=>tower.command(ws,{mapId:p.mapId,epoch:p.epoch,seq:p.seq+1,action:{kind:'open-chest',target:chest.instanceId}}),before=c.snapshot();
 const save=tower.db.save;tower.db.save=()=>{throw Error('disco de teste indisponível');};assert.match(cmd().message,/disco/);assert.deepEqual(p.character.snapshot(),before);tower.db.save=save;
 const expected=chestReward(chest);assert.equal(cmd(),null);const after=p.character.snapshot();assert.equal(after.gold,expected.gold);assert.equal(after.inventory.slots.filter(Boolean).length,32);assert.ok(cmd().message);assert.deepEqual(p.character.snapshot(),after);
 const id=p.id;tower.close();tower=new OnlineTower({directory:path.join(dir,'maps'),characterDirectory:path.join(dir,'people')});assert.deepEqual(tower.db.read(id).character,after);
});
