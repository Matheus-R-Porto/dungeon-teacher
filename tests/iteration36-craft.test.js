import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {randomBytes} from 'node:crypto';
import {OnlineTower} from '../server/online-tower.js';import {adoptJobs} from '../src/domain/character/job-progress.js';import {Inventory} from '../src/domain/items/inventory.js';import {decodeOnline} from '../shared/online.js';import {CITY_NPCS} from '../shared/city.js';import {SMITHING} from '../src/domain/smithing.js';import {advanceCraft,craftCommand} from '../server/online-craft.js';
function setup(t){let clock=Date.now();const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dt36-craft-')),tower=new OnlineTower({directory:path.join(dir,'maps'),characterDirectory:path.join(dir,'chars'),now:()=>clock,send:()=>{}});t.after(()=>{tower.close();fs.rmSync(dir,{recursive:true,force:true});});const ws={close(){}};tower.join(ws,'Teste',randomBytes(32).toString('hex'));const p=ws.worldPlayer;adoptJobs(p.character.data);let n=0;return {tower,p,ws,set:v=>clock=v,now:()=>clock,op:(operation,data,request='craft-'+(++n))=>tower.command(ws,decodeOnline(JSON.stringify({v:4,type:'world:input',seq:p.seq+1,mapId:p.mapId,epoch:p.epoch,action:{kind:'progression',operation,data,request}})))};}
test('36: forge validates proximity, materials, server timing and persists one result without client quality',t=>{
 const {tower,p,op,set,now}=setup(t);assert.equal(op('forge',{action:'start',id:'forged-dagger'}).ok,false);
 const npc=CITY_NPCS.find(n=>n.id==='blacksmith');Object.assign(p.game.player,{x:npc.x-1.2,z:npc.z});
 assert.equal(op('forge',{action:'start',id:'forged-dagger'}).ok,false);new Inventory(p.character).acquire('rawOre');new Inventory(p.character).acquire('rawOre');
 assert.equal(op('forge',{action:'start',id:'forged-dagger'},'attempt').ok,true);assert.equal(op('forge',{action:'strike',quality:'PERFECT'}).ok,false);
 set(now()+SMITHING.heatSeconds*1000);advanceCraft(tower,p);assert.equal(p.forge.state,'hammer');assert.equal(op('forge',{action:'cancel'}).ok,false);
 for(let i=0;i<3;i++){const f=p.forge;set(f.at+SMITHING.sweepSeconds[i]*1000*f.centers[i]);assert.equal(op('forge',{action:'strike'}).ok,true);assert.equal(op('forge',{action:'strike'}).ok,false);set(p.forge.at+SMITHING.gapSeconds*1000);advanceCraft(tower,p);}
 assert.equal(p.forge,null);assert.equal(new Inventory(p.character).count('rawOre'),0);assert.equal(new Inventory(p.character).owns('forgedDaggerPerfect'),true);assert.equal(p.character.data.smithingMastery['forged-dagger'].attempts,1);assert.equal(op('forge',{action:'start',id:'forged-dagger'},'attempt').ok,true);assert.equal(p.forge,null);assert.equal(tower.db.read(p.id).character.smithingMastery['forged-dagger'].attempts,1);
});
test('36: mine judges its clock, validates tool and surface, saves ore/XP/depletion once',t=>{
 const {tower,p,op,set}=setup(t);const map=Array.from({length:12},(_,i)=>tower.world('shared-floor-'+(i+1)).map).find(m=>m.mineralVeins?.length);assert.ok(map);p.mapId=map.id;p.reached=12;const vein=map.mineralVeins[0];
 Object.assign(p.game.player,{x:vein.x,z:vein.z+1.9,y:vein.y??0,surface:vein.surface??'ground'});p.game.world=map;
 assert.equal(op('mine',{action:'start',id:vein.id}).ok,false);new Inventory(p.character).acquire('simplePickaxe');
 const start=op('mine',{action:'start',id:vein.id});assert.equal(start.ok,true,start.message);assert.equal(op('mine',{action:'strike'}).ok,false);
 set(p.mining.strikeAt+1.6*1000*p.mining.center);assert.equal(op('mine',{action:'strike',quality:'MISS'},'hit').ok,true);assert.equal(new Inventory(p.character).count('rawOre'),1);assert.equal(p.character.data.lifeSkills.mining.xp,12);
 assert.equal(op('mine',{action:'strike'},'hit').ok,true);assert.equal(new Inventory(p.character).count('rawOre'),1);assert.equal(op('mine',{action:'start',id:vein.id}).ok,false);assert.deepEqual(tower.db.read(p.id).character.minedVeins[p.mapId],[vein.id]);
});
test('36: completed forge with no strikes cannot award perfect and keeps inventory atomic on save failure',t=>{
 const {tower,p,op,set,now}=setup(t);const npc=CITY_NPCS.find(n=>n.id==='blacksmith');Object.assign(p.game.player,{x:npc.x-1.2,z:npc.z});for(let i=0;i<3;i++)new Inventory(p.character).acquire('rawOre');
 assert.equal(op('forge',{action:'start',id:'forged-sword'}).ok,true);set(now()+20000);advanceCraft(tower,p);assert.equal(new Inventory(p.character).owns('forgedSwordFailure'),true);
 for(let i=0;i<3;i++)new Inventory(p.character).acquire('rawOre');assert.equal(op('forge',{action:'start',id:'forged-sword'}).ok,true);const before=p.character.snapshot(),save=tower.db.save;tower.db.save=()=>{throw Error('fixture de falha');};set(now()+20000);advanceCraft(tower,p);tower.db.save=save;assert.deepEqual(p.character.snapshot(),before);assert.match(p.notice,/fixture/);
});

test('36: smith paid supplies use existing prices, reject distant purchase and deduplicate receipts',t=>{
 const {tower,p,op}=setup(t);p.character.data.gold=40;
 assert.equal(op('shop',{action:'supplies',id:'pairedDaggers'},'purchase').ok,false);
 const npc=CITY_NPCS.find(n=>n.id==='blacksmith');Object.assign(p.game.player,{x:npc.x-1.2,z:npc.z});
 assert.equal(op('shop',{action:'supplies',id:'pairedDaggers'},'purchase').ok,true);
 assert.equal(op('shop',{action:'supplies',id:'pairedDaggers'},'purchase').ok,true);
 assert.equal(p.character.data.gold,10);assert.equal(new Inventory(p.character).count('pairedDaggers'),1);
 assert.equal(op('shop',{action:'supplies',id:'pairedDaggers'}).ok,false);assert.equal(p.character.data.gold,10);
});
test('36: forge retries cannot hit the following hammer and committed crafting blocks skills',t=>{
 const {tower,p,ws,op,set,now}=setup(t),npc=CITY_NPCS.find(n=>n.id==='blacksmith');Object.assign(p.game.player,{x:npc.x-1.2,z:npc.z});for(let i=0;i<3;i++)new Inventory(p.character).acquire('rawOre');
 op('forge',{action:'start',id:'forged-sword'});set(now()+SMITHING.heatSeconds*1000);advanceCraft(tower,p);
 assert.throws(()=>tower.command(ws,{mapId:p.mapId,epoch:p.epoch,seq:p.seq+1,action:{kind:'ability',slot:1}}),/forja/);
 op('forge',{action:'strike'},'same-hammer');set(now()+SMITHING.gapSeconds*1000);advanceCraft(tower,p);
 assert.equal(p.forge.index,1);assert.equal(op('forge',{action:'strike'},'same-hammer').ok,true);assert.equal(p.forge.grades.length,1);assert.equal(p.forge.state,'hammer');
});

test('36: persisted floors expose mining to the actual F interaction once without changing geography',async t=>{
 const {InteractionSystem}=await import('../src/simulation/interaction.js');const {geographyHash}=await import('../server/floor-store.js');
 const {tower,p}=setup(t),w=Array.from({length:12},(_,i)=>tower.world('shared-floor-'+(i+1))).find(w=>w.map.mineralVeins?.length),vein=w.map.mineralVeins[0],hash=geographyHash(w.map);
 tower.world(w.map.id);tower.world(w.map.id);assert.equal(w.map.interactables.filter(i=>i.id===vein.id).length,1);assert.equal(geographyHash(w.map),hash);
 Object.assign(p.game.player,{x:vein.x,z:vein.z+1.9,heading:0});const command=new InteractionSystem(w.map,w.map.interactables).activate(p.game.player);
 assert.equal(command?.type,'mining');assert.equal(command.content.veinId,vein.id);
});
