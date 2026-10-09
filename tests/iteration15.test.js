import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Character} from '../src/domain/character/character.js';
import {Inventory,ITEMS,equippedDefinition} from '../src/domain/items/inventory.js';
import {SMITHING,HAMMERS,QUALITIES,QUALITY_ORDER,SMITHING_RECIPES,recipeById,gradeHammer,scoreOf,qualityFor,decodeMastery,practiceOf} from '../src/domain/smithing.js';
import {SmithingService} from '../src/domain/smithing-service.js';
import {gainLifeXP,lifeXPRequired,decodeLifeSkills,LIFE_SKILLS,emptyLifeSkills} from '../src/domain/life-skills.js';
import {decodeSave,encodeSave} from '../src/adapters/persistence/character-save.js';
import {resolveAttack} from '../src/domain/combat/attack.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {InteractionSystem} from '../src/simulation/interaction.js';
import {canStand} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
const hubData=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url)));

function fixture({ore=10,safe=true,blocked=false,save}={}){
  const c=new Character(),inv=new Inventory(c);for(let i=0;i<ore;i++)inv.acquire('rawOre');
  const ctx={safe,blocked},saves=[];
  const svc=new SmithingService(c,{save:save??(async data=>{saves.push(structuredClone(data));}),context:()=>ctx});
  return {c,inv,svc,ctx,saves};
}
const oreOf=c=>new Inventory(c).count('rawOre');
const forged=c=>c.data.inventory.slots.filter(i=>i&&ITEMS[i.definitionId]?.forged);
const others=c=>({xp:c.data.xp,level:c.data.level,gold:c.data.gold,attributes:c.data.attributes,points:c.data.attributePoints,fishing:c.data.lifeSkills.fishing,cooking:c.data.lifeSkills.cooking,mining:c.data.lifeSkills.mining});
// Marker positions that grade as each outcome, whatever the target centre is.
const offset=(grade,center)=>grade==='PRECISE'?center:grade==='OK'?center+.09:(center>=.5?center-.3:center+.3);
async function play(svc,recipeId,grades){
  svc.start(recipeId);svc.update(SMITHING.heatSeconds+.01);
  for(let i=0;i<HAMMERS;i++){assert.equal(svc.state,'hammer');svc.time=offset(grades[i],svc.center)*SMITHING.sweepSeconds[i];assert.equal(svc.strike(),grades[i]);const done=svc.update(SMITHING.gapSeconds+.01);if(i===HAMMERS-1)return await done;}
}
const FAIL=['MISS','MISS','MISS'],GOOD=['PRECISE','OK','MISS'],PERFECT=['PRECISE','PRECISE','OK'];
const WEAPON_STAT={sword:'physicalAttack',dagger:'physicalAttack',bow:'physicalAttack',staff:'magicAttack'};

// ───────────── Recipes ─────────────
test('the recipe catalog is valid, stable and only uses things that exist',()=>{
  assert.deepEqual(SMITHING_RECIPES.map(r=>r.id),['forged-sword','forged-dagger','forged-bow','forged-staff']);
  assert.equal(new Set(SMITHING_RECIPES.map(r=>r.id)).size,SMITHING_RECIPES.length);
  const types=new Set();
  for(const r of SMITHING_RECIPES){
    assert.match(r.id,/^forged-[a-z]+$/);assert.ok(r.name);assert.equal(recipeById(r.id),r);types.add(r.weaponType);
    assert.ok(r.materials.length>=1);for(const m of r.materials){assert.ok(ITEMS[m.itemId],'material '+m.itemId);assert.ok(Number.isSafeInteger(m.quantity)&&m.quantity>0);}
    assert.equal(ITEMS[r.baseItemId].weaponType,r.weaponType);assert.equal(ITEMS[r.baseItemId].forged,undefined);
    assert.deepEqual(Object.keys(r.outputs),QUALITY_ORDER);
    for(const q of QUALITY_ORDER){const out=ITEMS[r.outputs[q]];assert.ok(out,'output '+r.outputs[q]);assert.equal(out.type,'weapon');assert.equal(out.equipSlot,'weapon');assert.deepEqual(out.forged,{recipeId:r.id,quality:q,damageStat:WEAPON_STAT[r.weaponType],referenceItemId:r.baseItemId});assert.equal(out.weaponType,r.weaponType);}
    assert.ok(Object.values(r.xp).every(n=>Number.isSafeInteger(n)&&n>0));assert.ok(r.xp.FAILURE<r.xp.GOOD&&r.xp.GOOD<r.xp.PERFECT);
  }
  assert.deepEqual([...types].sort(),['bow','dagger','staff','sword'],'one recipe per weapon category that combat supports');
  assert.equal(recipeById('forged-axe'),null);assert.ok(SMITHING_RECIPES.every(r=>r.materials.every(m=>m.itemId==='rawOre')));
});
test('output ids are stable and the data is frozen',()=>{
  assert.deepEqual(recipeById('forged-sword').outputs,{FAILURE:'forgedSwordFailure',GOOD:'forgedSwordGood',PERFECT:'forgedSwordPerfect'});
  assert.ok(Object.isFrozen(SMITHING_RECIPES)&&Object.isFrozen(SMITHING_RECIPES[0])&&Object.isFrozen(SMITHING_RECIPES[0].materials)&&Object.isFrozen(QUALITIES)&&Object.isFrozen(SMITHING));
});
test('without enough ore nothing starts and nothing changes, for every recipe',()=>{
  for(const r of SMITHING_RECIPES){
    const {c,svc}=fixture({ore:r.materials[0].quantity-1}),before=c.snapshot();
    assert.match(svc.reason(r.id),/Faltam materiais/);assert.throws(()=>svc.start(r.id),/Faltam materiais/);assert.equal(svc.state,'idle');assert.deepEqual(c.data,before);
  }
  const none=fixture({ore:0});assert.throws(()=>none.svc.start('forged-sword'),/Faltam materiais/);assert.deepEqual(none.c.data.smithingMastery,{});
});
for(const [label,grades,quality] of [['FALHA',FAIL,'FAILURE'],['BOM',GOOD,'GOOD'],['PERFEITO',PERFECT,'PERFECT']])test(label+': consumes the ore, yields exactly one weapon of that quality, XP and practice',async()=>{
  const {c,svc,saves}=fixture({ore:10}),recipe=recipeById('forged-sword'),before=others(c);
  const result=await play(svc,'forged-sword',grades);
  assert.equal(result.ok,true);assert.equal(result.quality,quality);assert.equal(result.label,QUALITIES[quality].label);
  assert.equal(oreOf(c),10-3);assert.equal(result.oreSpent,3);
  assert.equal(forged(c).length,1);assert.equal(forged(c)[0].definitionId,recipe.outputs[quality]);assert.equal(result.itemId,recipe.outputs[quality]);
  assert.equal(c.data.lifeSkills.smithing.xp,recipe.xp[quality]);assert.equal(result.xp,recipe.xp[quality]);assert.equal(practiceOf(c.data,'forged-sword'),1);
  assert.deepEqual(others(c),before);assert.equal(saves.length,1);assert.equal(svc.state,'idle');assert.match(svc.message,new RegExp(QUALITIES[quality].label));
});
test('hammer grades map to quality exactly at the boundaries',()=>{
  assert.equal(gradeHammer(.5,.5),'PRECISE');assert.equal(gradeHammer(.5+SMITHING.perfectHalf,.5),'PRECISE');assert.equal(gradeHammer(.5+SMITHING.goodHalf,.5),'OK');assert.equal(gradeHammer(.5+SMITHING.goodHalf+.01,.5),'MISS');
  assert.equal(scoreOf(['PRECISE','PRECISE','PRECISE']),6);assert.equal(scoreOf(['MISS','MISS','MISS']),0);
  const table=[[0,'FAILURE'],[2,'FAILURE'],[3,'GOOD'],[4,'GOOD'],[5,'PERFECT'],[6,'PERFECT']];for(const [score,quality] of table)assert.equal(qualityFor(score),quality,'score '+score);
  for(const [grades,quality] of [[['PRECISE','MISS','MISS'],'FAILURE'],[['OK','OK','OK'],'GOOD'],[['PRECISE','PRECISE','MISS'],'GOOD'],[['PRECISE','PRECISE','PRECISE'],'PERFECT']])assert.equal(qualityFor(scoreOf(grades)),quality);
});
test('every recipe forges every quality and each result is the right item for its category',async()=>{
  for(const r of SMITHING_RECIPES)for(const [grades,quality] of [[FAIL,'FAILURE'],[GOOD,'GOOD'],[PERFECT,'PERFECT']]){
    const {c,svc}=fixture({ore:r.materials[0].quantity});const result=await play(svc,r.id,grades);
    assert.equal(result.itemId,r.outputs[quality]);assert.equal(oreOf(c),0);assert.equal(forged(c).length,1);assert.equal(ITEMS[result.itemId].weaponType,r.weaponType);
  }
});
test('one attempt never yields two weapons, however much input arrives',async()=>{
  const {c,svc,saves}=fixture({ore:20});svc.start('forged-sword');svc.update(SMITHING.heatSeconds+.01);
  for(let i=0;i<30;i++)svc.strike();assert.equal(svc.grades.length,1,'only one hammer per window');
  svc.update(SMITHING.gapSeconds+.01);for(let i=0;i<30;i++)svc.strike();svc.update(SMITHING.gapSeconds+.01);svc.strike();
  const result=await svc.update(SMITHING.gapSeconds+.01);assert.equal(result.ok,true);
  assert.equal(await svc.resolve(),null);assert.equal(svc.strike(),null);for(let i=0;i<5;i++)assert.equal(await svc.update(1),null);
  assert.equal(forged(c).length,1);assert.equal(oreOf(c),17);assert.equal(saves.length,1);assert.equal(practiceOf(c.data,'forged-sword'),1);
});
test('input outside a hammer window is ignored: heating, the gaps between hammers and saving',async()=>{
  const {svc}=fixture();svc.start('forged-sword');assert.equal(svc.strike(),null);svc.update(SMITHING.heatSeconds+.01);assert.equal(svc.state,'hammer');
  svc.time=.1;assert.ok(svc.strike());assert.equal(svc.state,'gap');assert.equal(svc.strike(),null);assert.equal(svc.grades.length,1);
});
test('closing or cancelling before the first hammer costs nothing and records nothing',()=>{
  const {c,svc,saves}=fixture(),before=c.snapshot();
  svc.start('forged-sword');assert.equal(svc.committed,false);svc.update(SMITHING.heatSeconds/2);assert.equal(svc.cancel(),true);
  assert.equal(svc.state,'idle');assert.deepEqual(c.data,before);assert.equal(saves.length,0);assert.equal(svc.cancel(),false);
  svc.reason('forged-sword');svc.reason('forged-bow');svc.reason('forged-dagger');assert.deepEqual(c.data,before,'browsing recipes is free');
  svc.start('forged-bow');assert.equal(svc.recipeId,'forged-bow');assert.equal(svc.cancel(),true);assert.deepEqual(c.data,before);
});
test('after the first hammer opens the attempt is committed: it cannot be cancelled and always finishes',async()=>{
  const {c,svc}=fixture();svc.start('forged-sword');svc.update(SMITHING.heatSeconds+.01);assert.equal(svc.committed,true);assert.equal(svc.cancel(),false);assert.equal(svc.state,'hammer');
  const result=await svc.update(60);assert.equal(result.ok,true);assert.equal(result.quality,'FAILURE');assert.equal(forged(c).length,1);assert.equal(oreOf(c),7);
});
test('doing nothing resolves as a FAILURE through timeouts, never as silent loss',async()=>{
  const {c,svc}=fixture({ore:4}),before=c.data.lifeSkills.smithing.xp;
  svc.start('forged-sword');const result=await svc.update(1000);
  assert.equal(result.ok,true);assert.deepEqual(result.grades,['MISS','MISS','MISS']);assert.equal(result.quality,'FAILURE');assert.equal(forged(c).length,1);assert.equal(oreOf(c),1);assert.ok(c.data.lifeSkills.smithing.xp>before);assert.equal(svc.state,'idle');
});
test('a second attempt cannot start while one is running or being saved',async()=>{
  let release;const {c,svc}=fixture({save:()=>new Promise(r=>release=r)});
  svc.start('forged-sword');assert.throws(()=>svc.start('forged-sword'),/em andamento/);assert.throws(()=>svc.start('forged-bow'),/em andamento/);
  svc.update(SMITHING.heatSeconds+.01);for(let i=0;i<HAMMERS;i++){svc.time=.2;svc.strike();if(i<HAMMERS-1)svc.update(SMITHING.gapSeconds+.01);}
  const pending=svc.update(SMITHING.gapSeconds+.01);await Promise.resolve();
  assert.equal(svc.busy,true);assert.throws(()=>svc.start('forged-dagger'),/em andamento/);assert.equal(svc.strike(),null);assert.equal(await svc.resolve(),null);assert.equal(svc.cancel(),false);
  assert.equal(oreOf(c),10,'nothing is applied before the save returns');release();const result=await pending;assert.equal(result.ok,true);assert.equal(forged(c).length,1);assert.equal(svc.busy,false);
});
test('a failed save changes nothing: no ore spent, no weapon, no XP and no practice',async()=>{
  const {c,svc}=fixture({save:async()=>{throw Error('disk failure');}}),before=c.snapshot();
  const result=await play(svc,'forged-sword',PERFECT);
  assert.equal(result.ok,false);assert.match(result.error,/disk failure/);assert.deepEqual(c.data,before);assert.equal(practiceOf(c.data,'forged-sword'),0);assert.equal(svc.state,'idle');assert.match(svc.message,/Nada foi consumido/);assert.equal(svc.busy,false);
  svc.save=async()=>{};const again=await play(svc,'forged-sword',PERFECT);assert.equal(again.ok,true);assert.equal(oreOf(c),7);
});
test('the saved snapshot holds the ore, the weapon, the XP and the practice together',async()=>{
  const {c,svc,saves}=fixture({ore:5});await play(svc,'forged-dagger',GOOD);
  assert.equal(saves.length,1);const loaded=decodeSave(encodeSave(saves[0],1));
  assert.deepEqual(loaded.inventory,c.data.inventory);assert.deepEqual(loaded.lifeSkills,c.data.lifeSkills);assert.deepEqual(loaded.smithingMastery,c.data.smithingMastery);assert.equal(new Inventory(new Character(loaded)).count('rawOre'),3);
});
test('a full bag refuses before the ore is touched; freeing the ore stack makes room',()=>{
  const full=fixture({ore:5}),inv=full.inv;while(full.c.data.inventory.slots.includes(null))inv.acquire('travelerCap');
  assert.match(full.svc.reason('forged-sword'),/Mochila cheia/);assert.throws(()=>full.svc.start('forged-sword'),/Mochila cheia/);assert.equal(oreOf(full.c),5);
  const exact=fixture({ore:3});while(exact.c.data.inventory.slots.includes(null))exact.inv.acquire('travelerCap');assert.equal(exact.svc.reason('forged-sword'),'','the emptied ore stack gives its slot to the weapon');
});
test('the forge is refused outside the Refuge, during combat and when dead',()=>{
  assert.match(fixture({safe:false}).svc.reason('forged-sword'),/Refúgio/);assert.match(fixture({blocked:true}).svc.reason('forged-sword'),/combate/);
  const dead=fixture();dead.c.damage(99999);assert.match(dead.svc.reason('forged-sword'),/morto/);assert.throws(()=>dead.svc.start('forged-sword'));
  assert.throws(()=>fixture().svc.start('forged-axe'),/desconhecida/);
});

// ───────────── Damage ─────────────
test('for every weapon category: FAILURE < Armorer < GOOD < PERFECT on the damage stat',()=>{
  for(const r of SMITHING_RECIPES){
    const stat=WEAPON_STAT[r.weaponType],base=ITEMS[r.baseItemId].stats[stat],value=q=>ITEMS[r.outputs[q]].stats[stat];
    assert.ok(value('FAILURE')<base&&base<value('GOOD')&&value('GOOD')<value('PERFECT'),r.id);
    assert.ok([value('FAILURE'),base,value('GOOD'),value('PERFECT')].every(Number.isInteger));assert.ok(value('PERFECT')-base<=3&&base-value('FAILURE')<=2,'modest steps');
  }
});
test('quality changes the damage stat and nothing else about the weapon',()=>{
  for(const r of SMITHING_RECIPES){
    const base=ITEMS[r.baseItemId],stat=WEAPON_STAT[r.weaponType];
    for(const q of QUALITY_ORDER){
      const item=ITEMS[r.outputs[q]];
      assert.deepEqual(Object.keys(item.stats).sort(),Object.keys(base.stats).sort());
      for(const key of Object.keys(base.stats))if(key!==stat)assert.equal(item.stats[key],base.stats[key],key+' must match the Armorer weapon');
      assert.deepEqual(item.basicAttack,base.basicAttack);assert.equal(item.weaponType,base.weaponType);assert.equal(item.equipSlot,base.equipSlot);assert.equal(item.attributes,undefined);assert.equal(item.effects,undefined);assert.equal(item.unique,false);assert.equal(item.stackable,false);
    }
  }
});
test('equipped, a forged weapon changes only the damage stat of the character, never attributes or other stats',()=>{
  for(const r of SMITHING_RECIPES){
    const stat=WEAPON_STAT[r.weaponType],reference=new Character(),ri=new Inventory(reference);ri.acquire(r.baseItemId);ri.equip(0);
    for(const q of QUALITY_ORDER){
      const c=new Character(),inv=new Inventory(c);inv.acquire(r.outputs[q]);inv.equip(0);
      assert.deepEqual(c.data.attributes,reference.data.attributes);
      for(const key of Object.keys(c.stats))if(key!==stat)assert.equal(c.stats[key],reference.stats[key],r.id+' '+q+' '+key);
      assert.equal(c.stats[stat]-reference.stats[stat],QUALITIES[q].damageDelta,r.id+' '+q);
      assert.equal(c.data.equippedWeaponType,r.weaponType);assert.equal(equippedDefinition(c.data).id,r.outputs[q]);
    }
  }
});
test('combat damage follows the quality: forged FAILURE < Armorer < GOOD < PERFECT',()=>{
  const rand=()=>{const seq=[.1,.99,.5];let i=0;return()=>seq[i++%3];};
  const dealt=itemId=>{const c=new Character(),inv=new Inventory(c);inv.acquire(itemId);inv.equip(0);return resolveAttack({...c.stats},{evasion:0,physicalDefense:3},rand());};
  const r=recipeById('forged-sword');
  const damage=[dealt(r.outputs.FAILURE),dealt('trainingSword'),dealt(r.outputs.GOOD),dealt(r.outputs.PERFECT)].map(x=>{assert.equal(x.hit,true);return x.damage;});
  assert.ok(damage[0]<damage[1]&&damage[1]<damage[2]&&damage[2]<damage[3],JSON.stringify(damage));
});
test('the real combat system uses the forged weapon: a run can start with it and enemies take its damage',()=>{
  const rand=()=>{const seq=[.1,.99,.5];let i=0;return()=>seq[i++%3];};
  const hit=itemId=>{const c=new Character(),inv=new Inventory(c);inv.acquire(itemId);inv.equip(0);const s=new AreaSession(createAreas(hubData),c,{seed:42});s.startRun();assert.equal(s.area.safe,false);assert.equal(s.combat.canAttack,true);
    const enemy=s.combat.enemies[0],before=enemy.hp;s.combat.random=rand();s.combat.basicImpact(equippedDefinition(c.data).basicAttack,c.stats,enemy,'player');return before-enemy.hp;};
  const r=recipeById('forged-sword'),dealt=[r.outputs.FAILURE,'trainingSword',r.outputs.GOOD,r.outputs.PERFECT].map(hit);
  assert.ok(dealt[0]>0&&dealt[0]<dealt[1]&&dealt[1]<dealt[2]&&dealt[2]<dealt[3],JSON.stringify(dealt));
});
test('weapons of the same recipe keep their own quality: several coexist, equip and unequip, and survive a reload',()=>{
  const c=new Character(),inv=new Inventory(c),r=recipeById('forged-sword');
  for(const q of QUALITY_ORDER)inv.acquire(r.outputs[q]);inv.acquire(r.outputs.GOOD);inv.acquire('trainingSword');
  assert.deepEqual(forged(c).map(i=>i.definitionId),[r.outputs.FAILURE,r.outputs.GOOD,r.outputs.PERFECT,r.outputs.GOOD]);assert.equal(new Set(forged(c).map(i=>i.instanceId)).size,4);
  const perfectIndex=c.data.inventory.slots.findIndex(i=>i?.definitionId===r.outputs.PERFECT);inv.equip(perfectIndex);
  assert.equal(c.data.equipment.weapon.definitionId,r.outputs.PERFECT);assert.equal(c.stats.physicalAttack-new Character().stats.physicalAttack,ITEMS[r.outputs.PERFECT].stats.physicalAttack);
  const loaded=new Character(decodeSave(encodeSave(c.snapshot(),1)));
  assert.equal(loaded.data.equipment.weapon.definitionId,r.outputs.PERFECT);assert.deepEqual(loaded.stats,c.stats);assert.deepEqual(loaded.data.inventory,c.data.inventory);
  new Inventory(loaded).unequip('weapon');assert.equal(loaded.data.equipment.weapon,null);assert.equal(forged(loaded).length,4);assert.equal(loaded.data.equippedWeaponType,null);
});
test('the Armorer is untouched: same four free weapons, none of the forged ones, and legacy saves still map to the Armorer weapon',()=>{
  assert.deepEqual(ITEMS.trainingSword.stats,{physicalAttack:5});assert.deepEqual(ITEMS.trainingDagger.stats,{physicalAttack:3,attackSpeed:.65});assert.deepEqual(ITEMS.trainingBow.stats,{physicalAttack:4});assert.deepEqual(ITEMS.trainingStaff.stats,{magicAttack:6});
  const shop=Object.values(ITEMS).filter(i=>(i.type==='weapon'&&!i.forged)||i.type==='tool').map(i=>i.id);
  assert.deepEqual(shop.filter(id=>id.startsWith('training')),['trainingSword','trainingDagger','trainingBow','trainingStaff']);assert.ok(!shop.some(id=>ITEMS[id].forged));assert.ok(Object.values(ITEMS).filter(i=>i.forged).every(i=>i.price===0&&!i.unique));
  const legacy=new Character().snapshot();delete legacy.inventory;delete legacy.equipment;legacy.equippedWeaponType='sword';
  assert.equal(decodeSave(encodeSave(legacy,1)).equipment.weapon.definitionId,'trainingSword');
});

// ───────────── Profession and practice ─────────────
test('Smithing is an active, independent profession and never touches the others or combat',async()=>{
  assert.equal(LIFE_SKILLS.smithing.active,true);assert.deepEqual(new Character().data.lifeSkills.smithing,{level:1,xp:0});
  const {c,svc}=fixture({ore:30}),before=others(c);
  await play(svc,'forged-sword',PERFECT);await play(svc,'forged-bow',GOOD);await play(svc,'forged-dagger',FAIL);
  assert.deepEqual(others(c),before);assert.equal(c.data.lifeSkills.smithing.xp,12+8+2);
  const d=new Character();gainLifeXP(d.data,'fishing',20);gainLifeXP(d.data,'mining',10);gainLifeXP(d.data,'cooking',5);assert.deepEqual(d.data.lifeSkills.smithing,{level:1,xp:0});
  const e=new Character();gainLifeXP(e.data,'smithing',lifeXPRequired(1)+lifeXPRequired(2)+3);assert.deepEqual(e.data.lifeSkills.smithing,{level:3,xp:3});assert.deepEqual(others(e),others(new Character()));
});
test('XP is granted in every quality and is ordered FAILURE < GOOD < PERFECT for every recipe',async()=>{
  for(const r of SMITHING_RECIPES){
    const gains=[];for(const grades of [FAIL,GOOD,PERFECT]){const {c,svc}=fixture({ore:r.materials[0].quantity});const result=await play(svc,r.id,grades);gains.push(c.data.lifeSkills.smithing.xp);assert.equal(result.xp,gains.at(-1));assert.ok(gains.at(-1)>0);}
    assert.ok(gains[0]<gains[1]&&gains[1]<gains[2],r.id+' '+gains);
  }
});
test('levels follow the shared curve, including exact thresholds and the level-up message',async()=>{
  const {c,svc}=fixture();c.data.lifeSkills.smithing={level:1,xp:lifeXPRequired(1)-8};
  const result=await play(svc,'forged-sword',GOOD);assert.equal(result.levels,1);assert.deepEqual(c.data.lifeSkills.smithing,{level:2,xp:0});assert.equal(result.level,2);assert.match(svc.message,/FERRARIA NÍVEL 2/);assert.equal(result.xpNeeded,lifeXPRequired(2));
  const near=fixture();near.c.data.lifeSkills.smithing={level:1,xp:lifeXPRequired(1)-9};const r2=await play(near.svc,'forged-sword',GOOD);assert.equal(r2.levels,0);assert.deepEqual(near.c.data.lifeSkills.smithing,{level:1,xp:lifeXPRequired(1)-1});
});
test('practice counts every completed attempt per recipe and nothing else',async()=>{
  const {c,svc}=fixture({ore:30});
  await play(svc,'forged-sword',PERFECT);await play(svc,'forged-sword',FAIL);await play(svc,'forged-dagger',GOOD);
  assert.equal(practiceOf(c.data,'forged-sword'),2,'success and failure both count');assert.equal(practiceOf(c.data,'forged-dagger'),1);assert.equal(practiceOf(c.data,'forged-bow'),0);assert.equal(c.data.smithingMastery['forged-bow'],undefined);
  const snapshot=structuredClone(c.data.smithingMastery);
  svc.start('forged-bow');svc.cancel();svc.reason('forged-staff');assert.deepEqual(c.data.smithingMastery,snapshot,'opening, selecting and cancelling do not count');
  const poor=fixture({ore:1});assert.throws(()=>poor.svc.start('forged-sword'));assert.deepEqual(poor.c.data.smithingMastery,{},'rejected for lack of ore');
  const broken=fixture({save:async()=>{throw Error('x');}});await play(broken.svc,'forged-sword',GOOD);assert.deepEqual(broken.c.data.smithingMastery,{},'a technical failure is not a completed attempt');
});
test('the bar is reproducible per character, recipe and practice, and varies between attempts',async()=>{
  const centers=()=>{const {svc}=fixture();svc.start('forged-sword');const list=[...svc.centers];svc.cancel();return list;};
  const a=centers();assert.deepEqual(a,centers());assert.equal(a.length,HAMMERS);assert.ok(a.every(v=>v>=SMITHING.zoneMin&&v<=SMITHING.zoneMax));
  const {svc}=fixture({ore:30}),seen=new Set();for(let i=0;i<6;i++){svc.start('forged-sword');seen.add(svc.centers.join());svc.update(1000);await Promise.resolve();while(svc.busy)await Promise.resolve();}assert.ok(seen.size>1);
});
for(const fps of [30,60,144])test('hammer timing is independent of frame rate at '+fps+' FPS',async()=>{
  const {c,svc}=fixture();svc.start('forged-sword');const step=1/fps;while(svc.state==='heating')svc.update(step);
  for(let i=0;i<HAMMERS;i++){while(svc.state!=='hammer')svc.update(step);while(svc.marker<svc.center)svc.update(step);assert.equal(svc.strike(),'PRECISE','hammer '+(i+1));let done;while(svc.state==='gap'){done=svc.update(step);}if(i===HAMMERS-1){const result=await done;assert.equal(result.quality,'PERFECT');}}
  assert.equal(forged(c)[0].definitionId,'forgedSwordPerfect');
});

// ───────────── Saves ─────────────
test('older saves without Smithing load unchanged with level 1, no XP and no practice',()=>{
  const c=new Character();c.data.gold=77;c.data.lifeSkills.fishing={level:3,xp:4};c.data.lifeSkills.cooking={level:2,xp:5};c.data.lifeSkills.mining={level:4,xp:6};c.data.tower={highestClearedFloor:5,claimedRewards:['boss-floor-3']};
  const bag=new Inventory(c);bag.acquire('trainingStaff');bag.equip(0);bag.acquire('simplePickaxe');for(let i=0;i<5;i++)bag.acquire('rawOre');
  const old=c.snapshot();delete old.lifeSkills.smithing;delete old.smithingMastery;const loaded=decodeSave(encodeSave(old,1));
  assert.deepEqual(loaded.lifeSkills,{fishing:{level:3,xp:4},cooking:{level:2,xp:5},mining:{level:4,xp:6},smithing:{level:1,xp:0}});assert.deepEqual(loaded.smithingMastery,{});
  assert.equal(loaded.gold,77);assert.deepEqual(loaded.tower,c.data.tower);assert.deepEqual(loaded.inventory,c.data.inventory);assert.deepEqual(loaded.equipment,c.data.equipment);
  const oldest=c.snapshot();delete oldest.lifeSkills;delete oldest.smithingMastery;assert.deepEqual(decodeSave(encodeSave(oldest,1)).lifeSkills,emptyLifeSkills());
});
test('a new save round-trips Smithing XP, level, practice and the forged weapons',async()=>{
  const {c,svc}=fixture({ore:30});await play(svc,'forged-sword',PERFECT);await play(svc,'forged-staff',GOOD);await play(svc,'forged-sword',FAIL);
  new Inventory(c).equip(c.data.inventory.slots.findIndex(i=>i?.definitionId==='forgedSwordPerfect'));
  const loaded=new Character(decodeSave(encodeSave(c.snapshot(),1)));
  assert.deepEqual(loaded.data.lifeSkills.smithing,c.data.lifeSkills.smithing);assert.deepEqual(loaded.data.smithingMastery,{'forged-sword':{attempts:2},'forged-staff':{attempts:1}});
  assert.deepEqual(loaded.data.inventory,c.data.inventory);assert.equal(loaded.data.equipment.weapon.definitionId,'forgedSwordPerfect');assert.deepEqual(loaded.stats,c.stats);
});
test('invalid Smithing data in a save is rejected instead of being trusted',()=>{
  for(const bad of [null,[],'x',{'forged-axe':{attempts:1}},{'forged-sword':null},{'forged-sword':{attempts:-1}},{'forged-sword':{attempts:1.5}},{'forged-sword':{attempts:'2'}},{'forged-sword':[]},{__proto__x:{attempts:1}},{'forged-sword':{attempts:SMITHING.maxPractice+1}}])assert.throws(()=>decodeMastery(bad),undefined,JSON.stringify(bad));
  assert.deepEqual(decodeMastery(undefined),{});assert.deepEqual(decodeMastery({'forged-bow':{attempts:3,extra:9}}),{'forged-bow':{attempts:3}});
  const c=new Character();for(const bad of [{level:0,xp:0},{level:1,xp:30},{level:1,xp:-1}])assert.throws(()=>decodeLifeSkills({...c.data.lifeSkills,smithing:bad}));
  const snap=c.snapshot();snap.smithingMastery={'nope':{attempts:1}};assert.throws(()=>decodeSave(encodeSave(snap,1)));
  const bag=c.snapshot();bag.inventory.slots[0]={instanceId:'item-1',definitionId:'forgedSwordGood',quantity:2};bag.inventory.nextId=2;assert.throws(()=>decodeSave(encodeSave(bag,1)),'non-stackable forged weapon cannot be a stack');
});

// ───────────── The forge station in the Refuge ─────────────
test('the Refuge has a reachable forge that blocks nothing and the Armorer is unchanged',()=>{
  const hub=Object.values(createAreas(hubData)).find(a=>a.safe),forge=hub.obstacles.find(o=>o.id==='forge'),it=hub.interactables.find(i=>i.id==='forge');
  assert.ok(forge&&it);assert.equal(forge.kind,'forge');assert.equal(it.action,'forge');assert.deepEqual([it.x,it.z],[forge.x,forge.z]);assert.ok(it.ignoreObstacles.includes('forge'));assert.match(it.label,/Forja/);
  assert.equal(new Set(hub.obstacles.map(o=>o.id)).size,hub.obstacles.length);
  for(const o of hub.obstacles){if(o.id==='forge')continue;const gap=o.shape==='circle'?Math.hypot(o.x-forge.x,o.z-forge.z)-o.radius-forge.radius:Math.hypot(forge.x-Math.max(o.x-o.halfX,Math.min(forge.x,o.x+o.halfX)),forge.z-Math.max(o.z-o.halfZ,Math.min(forge.z,o.z+o.halfZ)))-forge.radius;assert.ok(gap>=.4,'forge too close to '+o.id+' ('+gap.toFixed(2)+')');}
  const reach=(x,z)=>canStand(hub,x,z,.32)&&!!findPath(hub,hub.spawn,{x,z},.32);
  for(const [dx,dz] of [[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]])assert.ok(reach(forge.x+dx,forge.z+dz),'forge side '+dx+','+dz);
  for(const p of [hub.portal,{x:2.4,z:2},{x:-3,z:5.3},{x:-4,z:3.2}])assert.ok(reach(p.x,p.z));
  const smith=hub.interactables.find(i=>i.id==='weaponsmith');assert.deepEqual([smith.x,smith.z,smith.action],[2.4,3.5,'shop']);assert.ok(hub.interactables.some(i=>i.id==='cook')&&hub.interactables.some(i=>i.id==='cooking-station')&&hub.interactables.some(i=>i.id==='tower-portal'));
  const system=new InteractionSystem(hub,hub.interactables);
  assert.equal(system.update({x:forge.x,z:forge.z+1.3,heading:Math.PI})?.id,'forge');assert.equal(system.update({x:forge.x-1.4,z:forge.z,heading:Math.PI/2})?.id,'forge');assert.equal(system.update({x:2.4,z:2.6,heading:0})?.id,'weaponsmith');assert.equal(system.update({x:0,z:-4.5,heading:Math.PI})?.id,'tower-portal');
  assert.equal(system.activate({x:forge.x,z:forge.z+1.3,heading:Math.PI}).type,'forge');assert.equal(system.activate({x:0,z:4,heading:0}),null);
});
test('a forged weapon opens the Tower like any other weapon, and the Refuge forge is blocked while in a run',()=>{
  const c=new Character(),inv=new Inventory(c);for(let i=0;i<3;i++)inv.acquire('rawOre');
  const s=new AreaSession(createAreas(hubData),c,{seed:42});assert.throws(()=>s.travel({targetId:'tower-portal'}),/arma/);
  let blocked=false;const svc=new SmithingService(c,{context:()=>({safe:s.area.safe,blocked})});
  assert.equal(svc.reason('forged-sword'),'');svc.start('forged-sword');svc.cancel();
  inv.acquire('forgedSwordGood');inv.equip(c.data.inventory.slots.findIndex(i=>i?.definitionId==='forgedSwordGood'));s.travel({targetId:'tower-portal'});
  assert.equal(s.area.safe,false);assert.match(svc.reason('forged-sword'),/Refúgio/);s.travel({targetId:'abandon-run'});assert.equal(s.area.safe,true);assert.equal(c.data.equipment.weapon.definitionId,'forgedSwordGood');assert.equal(svc.reason('forged-sword'),'');
});
