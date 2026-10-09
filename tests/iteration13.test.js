import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Character} from '../src/domain/character/character.js';
import {Inventory,ITEMS,equipmentBlocked} from '../src/domain/items/inventory.js';
import {gainLifeXP,lifeXPRequired,decodeLifeSkills,emptyLifeSkills,LIFE_SKILLS} from '../src/domain/life-skills.js';
import {MINING,PICKAXE,RAW_ORE,PICKAXE_PRICE,indicatorAt,strikeResult} from '../src/domain/mining.js';
import {purchaseItem,ARMORER_STOCK} from '../src/domain/shop.js';
import {FoodService} from '../src/domain/food-service.js';
import {AreaSession,createAreas} from '../src/simulation/areas.js';
import {generateFloor} from '../src/world/tower.js';
import {caveAt} from '../src/world/biomes.js';
import {canStand} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {inWater} from '../src/world/water-features.js';
import {decodeSave,encodeSave} from '../src/adapters/persistence/character-save.js';
const hub=JSON.parse(fs.readFileSync(new URL('../src/data/hub.json',import.meta.url)));
const definitions=createAreas(hub);
const types=['FOREST','FOREST_TO_CAVE','CAVE','CAVE_TO_FOREST'];
const tick=s=>s.update(1/30,{x:0,z:0},0);
const unchanged=d=>({xp:d.xp,level:d.level,gold:d.gold,attributes:d.attributes,attributePoints:d.attributePoints,skillSpaces:d.skillSpaces,fishing:d.lifeSkills.fishing,cooking:d.lifeSkills.cooking});
function approach(s,vein,distance=2.2){const r=s.area.graph.regions.find(r=>r.id===vein.regionId),d=Math.hypot(r.x-vein.x,r.z-vein.z)||1;return {x:vein.x+(r.x-vein.x)/d*distance,z:vein.z+(r.z-vein.z)/d*distance};}
function fixture({pickaxe=true,type='CAVE'}={}){
  const c=new Character(),s=new AreaSession(definitions,c,{seed:42}),i=new Inventory(c);
  i.acquire('trainingStaff');i.equip(0);if(pickaxe)i.acquire(PICKAXE);
  s.startBiomePlaytest(type);
  const vein=s.area.mineralVeins[0];Object.assign(s.game.player,approach(s,vein));s.game.previous={...s.game.player};
  return {s,c,i,m:s.mining,vein};
}
const start=x=>x.m.start(x.vein.id);
// Brings the swing into the strike phase with the indicator at an exact position.
function swing(m,position){m.update(m.strikeAt-m.time+.01);assert.equal(m.state,'strike');m.time=m.strikeAt+position*m.config.sweepSeconds;}
const onCenter=m=>swing(m,m.center);
const nearCenter=m=>swing(m,m.center+.08);
const offCenter=m=>swing(m,m.center>.5?m.center-.2:m.center+.2);
const ore=c=>new Inventory(c).count(RAW_ORE);

test('Picareta Simples and Minério Bruto exist in the catalog with the required metadata',()=>{
  const p=ITEMS[PICKAXE],o=ITEMS[RAW_ORE];
  assert.equal(p.type,'tool');assert.equal(p.unique,true);assert.equal(p.equipSlot,undefined);assert.equal(p.price,PICKAXE_PRICE);assert.ok(p.price>0);
  assert.ok(p.name&&p.description&&p.icon);
  assert.equal(o.type,'resource');assert.equal(o.stackable,true);assert.equal(o.maxStack,99);assert.ok(o.name&&o.icon);
  assert.match(o.description,/forja/);assert.equal(o.baseSellValue,undefined);assert.ok(!o.tradeable);
  assert.deepEqual(ARMORER_STOCK,[PICKAXE]);
});
test('purchase spends gold once, stores the pickaxe and cannot be repeated',()=>{
  const c=new Character();c.data.gold=100;const def=purchaseItem(c,PICKAXE);
  assert.equal(def.id,PICKAXE);assert.equal(c.data.gold,100-PICKAXE_PRICE);assert.equal(new Inventory(c).owns(PICKAXE),true);
  assert.throws(()=>purchaseItem(c,PICKAXE),/possuído/);assert.equal(c.data.gold,100-PICKAXE_PRICE);
  assert.equal(c.data.inventory.slots.filter(i=>i?.definitionId===PICKAXE).length,1);
});
test('purchase refuses insufficient gold, a full bag and unlisted items without changing anything',()=>{
  const c=new Character();c.data.gold=PICKAXE_PRICE-1;const before=c.snapshot();
  assert.throws(()=>purchaseItem(c,PICKAXE),/Ouro insuficiente/);assert.deepEqual(c.data,before);
  c.data.gold=500;const inv=new Inventory(c);while(c.data.inventory.slots.includes(null))inv.acquire('travelerCap');const full=c.snapshot();
  assert.throws(()=>purchaseItem(c,PICKAXE),/cheio/);assert.deepEqual(c.data,full);
  for(const id of ['trainingSword','fishingRod',RAW_ORE,'nope','__proto__'])assert.throws(()=>purchaseItem(c,id),/não vendido/);assert.deepEqual(c.data,full);
});
test('purchase at exactly the price leaves zero gold, and a failed save can be rolled back by the panel snapshot',()=>{
  const c=new Character();c.data.gold=PICKAXE_PRICE;const snapshot=c.snapshot();purchaseItem(c,PICKAXE);assert.equal(c.data.gold,0);
  c.data=snapshot;assert.equal(c.data.gold,PICKAXE_PRICE);assert.equal(new Inventory(c).owns(PICKAXE),false);
});
test('pickaxe and ore persist; ore stacks merge and spill at 99; invalid stack is rejected',()=>{
  const c=new Character(),i=new Inventory(c);i.acquire(PICKAXE);for(let n=0;n<100;n++)i.acquire(RAW_ORE);
  assert.equal(i.count(RAW_ORE),100);
  const loaded=new Character(decodeSave(encodeSave(c.snapshot(),1))),l=new Inventory(loaded);
  assert.equal(l.owns(PICKAXE),true);assert.equal(l.count(RAW_ORE),100);
  assert.deepEqual(loaded.data.inventory.slots.filter(s=>s?.definitionId===RAW_ORE).map(s=>s.quantity),[99,1]);
  const bad=c.snapshot();bad.inventory.slots.find(s=>s?.definitionId===RAW_ORE).quantity=100;assert.throws(()=>decodeSave(encodeSave(bad,1)));
});
test('Mining is an active independent life skill and old saves receive it without losing anything',()=>{
  assert.equal(LIFE_SKILLS.mining.active,true);assert.deepEqual(new Character().data.lifeSkills.mining,{level:1,xp:0});
  const c=new Character();c.data.gold=33;c.data.lifeSkills.fishing={level:3,xp:10};c.data.lifeSkills.cooking={level:2,xp:5};
  const old=c.snapshot();delete old.lifeSkills.mining;
  const loaded=decodeSave(encodeSave(old,1));
  assert.equal(loaded.gold,33);assert.deepEqual(loaded.lifeSkills,{fishing:{level:3,xp:10},cooking:{level:2,xp:5},mining:{level:1,xp:0}});
  const older=c.snapshot();delete older.lifeSkills;assert.deepEqual(decodeSave(encodeSave(older,1)).lifeSkills,emptyLifeSkills());
  const mixed=c.snapshot();mixed.lifeSkills.mining={level:4,xp:20};assert.deepEqual(decodeSave(encodeSave(mixed,1)).lifeSkills.mining,{level:4,xp:20});
  for(const bad of [{level:0,xp:0},{level:1,xp:30},{level:1,xp:-1}])assert.throws(()=>decodeLifeSkills({fishing:{level:1,xp:0},cooking:{level:1,xp:0},mining:bad}));
  assert.throws(()=>decodeLifeSkills({fishing:{level:1,xp:0},smithing:{level:1,xp:0}}));
  assert.throws(()=>gainLifeXP(new Character().data,'smithing',1));
});
test('Mining XP follows the shared curve, handles exact thresholds and never touches combat or other professions',()=>{
  const c=new Character(),before=unchanged(c.snapshot());
  assert.equal(gainLifeXP(c.data,'mining',lifeXPRequired(1)+lifeXPRequired(2)+4),2);
  assert.deepEqual(c.data.lifeSkills.mining,{level:3,xp:4});assert.deepEqual(unchanged(c.data),before);
  for(const amount of [-1,NaN,1.5,100001])assert.throws(()=>gainLifeXP(c.data,'mining',amount));
  const d=new Character();gainLifeXP(d.data,'fishing',20);gainLifeXP(d.data,'cooking',10);assert.deepEqual(d.data.lifeSkills.mining,{level:1,xp:0});
});
test('timing helpers: sweep is a fixed ping-pong and zones are exact',()=>{
  assert.equal(indicatorAt(0),0);assert.equal(indicatorAt(MINING.sweepSeconds),1);assert.equal(indicatorAt(MINING.sweepSeconds*2),0);assert.ok(Math.abs(indicatorAt(MINING.sweepSeconds*1.25)-.75)<1e-9);assert.equal(indicatorAt(-1),0);
  assert.equal(strikeResult(.5,.5),'PERFECT');assert.equal(strikeResult(.5+MINING.perfectHalf,.5),'PERFECT');assert.equal(strikeResult(.5+MINING.goodHalf,.5),'GOOD');assert.equal(strikeResult(.5+MINING.goodHalf+.01,.5),'MISS');
  assert.ok(MINING.perfectHalf<MINING.goodHalf&&MINING.zoneMin-MINING.goodHalf>=0&&MINING.zoneMax+MINING.goodHalf<=1);
});

for(const type of ['CAVE','FOREST_TO_CAVE','CAVE_TO_FOREST'])test(type+': veins are deterministic, subterranean, off every corridor and reachable across seeds',()=>{
  for(let seed=0;seed<40;seed++){
    const w=generateFloor(seed,4,'hub',{environment:type}),again=generateFloor(seed,4,'hub',{environment:type});
    assert.deepEqual(w.mineralVeins,again.mineralVeins);assert.deepEqual(w.obstacles,again.obstacles);
    assert.ok(w.mineralVeins.length>=1&&w.mineralVeins.length<=MINING.maxPerFloor,type+' seed '+seed);
    const ids=new Set(w.obstacles.map(o=>o.id));assert.equal(ids.size,w.obstacles.length);
    for(const v of w.mineralVeins){
      assert.ok(caveAt(w,v.z)>=MINING.minCaveAmount,'vein on forest terrain');
      assert.ok(Math.hypot(v.x-w.spawn.x,v.z-w.spawn.z)>=8&&Math.hypot(v.x-w.portal.x,v.z-w.portal.z)>=8);
      assert.ok(w.waterFeatures.every(f=>!inWater(f,v,v.radius)));
      for(const t of w.trails)for(let k=1;k<t.points.length;k++){const a=t.points[k-1],b=t.points[k],dx=b.x-a.x,dz=b.z-a.z,u=Math.max(0,Math.min(1,((v.x-a.x)*dx+(v.z-a.z)*dz)/(dx*dx+dz*dz)));assert.ok(Math.hypot(v.x-a.x-u*dx,v.z-a.z-u*dz)>=t.radius+v.radius,'vein inside corridor');}
      const rock=w.obstacles.find(o=>o.id===v.obstacleId),it=w.interactables.find(i=>i.id===v.id);
      assert.ok(rock&&rock.shape==='circle'&&rock.kind==='mineralVein'&&rock.radius===v.radius);
      assert.ok(it&&it.action==='mining'&&it.content.veinId===v.id&&it.ignoreObstacles.includes(v.obstacleId));
      assert.equal(v.state,'available');
    }
    for(let a=0;a<w.mineralVeins.length;a++)for(let b=a+1;b<w.mineralVeins.length;b++)assert.ok(Math.hypot(w.mineralVeins[a].x-w.mineralVeins[b].x,w.mineralVeins[a].z-w.mineralVeins[b].z)>=MINING.minSpacing);
  }
});
test('pure Forest never has veins, including the three floors of the normal expedition',()=>{
  for(let seed=0;seed<30;seed++)for(let floor=1;floor<=3;floor++){const w=generateFloor(seed,floor,'hub');assert.deepEqual(w.mineralVeins,[]);assert.ok(!w.obstacles.some(o=>o.kind==='mineralVein'));assert.ok(!w.interactables.some(i=>i.action==='mining'));}
  for(let seed=0;seed<20;seed++)assert.deepEqual(generateFloor(seed,5,'hub',{environment:'FOREST'}).mineralVeins,[]);
  const c=new Character(),s=new AreaSession(definitions,c,{seed:7}),i=new Inventory(c);i.acquire('trainingStaff');i.equip(0);s.startRun();
  for(const id of ['tower-floor-1','tower-floor-2','tower-floor-3'])assert.deepEqual(s.areas[id].mineralVeins,[]);
});
test('transitions only place veins on the underground side, in both directions',()=>{
  for(let seed=0;seed<40;seed++){
    for(const type of ['FOREST_TO_CAVE','CAVE_TO_FOREST']){
      const w=generateFloor(seed,4,'hub',{environment:type}),exit=w.graph.regions.find(r=>r.id===w.graph.exit);
      for(const v of w.mineralVeins){const progress=v.z/exit.z;if(type==='FOREST_TO_CAVE')assert.ok(progress>=.5,'forest half of F2C');else assert.ok(progress<=.5,'forest half of C2F');}
    }
  }
});
test('veins keep spawn, gates, encounters, detours and exit reachable and standable (15 seeds x 3 biomes)',()=>{
  for(const type of ['CAVE','FOREST_TO_CAVE','CAVE_TO_FOREST'])for(let seed=0;seed<15;seed++){
    const w=generateFloor(seed,4,'hub',{environment:type});assert.ok(canStand(w,w.spawn.x,w.spawn.z,.85));w.obstacles.push(...w.gates);
    let cursor=w.spawn;
    for(const id of w.graph.mainPath){const r=w.graph.regions.find(r=>r.id===id);assert.ok(findPath(w,cursor,r,.85),'main path blocked');cursor=r;const gate=w.gates.find(g=>g.encounterId==='enc-'+id);if(gate)gate.open=true;}
    assert.ok(findPath(w,cursor,w.portal,.85));
    for(const t of w.trails.filter(t=>!t.main))assert.ok(findPath(w,t.points[0],t.points.at(-1),.85));
    for(const e of w.enemySpawns)assert.ok(canStand(w,e.position.x,e.position.z,.85));
    for(const v of w.mineralVeins){const r=w.graph.regions.find(r=>r.id===v.regionId),d=Math.hypot(r.x-v.x,r.z-v.z),p={x:v.x+(r.x-v.x)/d*(v.radius+1.3),z:v.z+(r.z-v.z)/d*(v.radius+1.3)};assert.ok(canStand(w,p.x,p.z,.85));assert.ok(findPath(w,r,p,.85),'vein unreachable');}
  }
});
test('veins appear on cave playtest floors for every explorable environment and the biome selector still starts all four',()=>{
  for(const type of types){const c=new Character(),s=new AreaSession(definitions,c,{seed:42}),i=new Inventory(c);i.acquire('trainingStaff');i.equip(0);s.startBiomePlaytest(type);assert.equal(s.area.floorEnvironment.type,type);if(type!=='FOREST')assert.ok(s.area.mineralVeins.length>=1);else assert.equal(s.area.mineralVeins.length,0);s.travel({targetId:'abandon-run'});assert.ok(s.area.safe);}
});

test('mining requires being near the vein and owning the pickaxe, and the pickaxe is never consumed',()=>{
  const x=fixture({pickaxe:false});assert.throws(()=>start(x),/picareta/);assert.equal(x.m.state,'idle');
  x.i.acquire(PICKAXE);Object.assign(x.s.game.player,{x:x.vein.x+30,z:x.vein.z});assert.throws(()=>start(x),/Aproxime/);
  Object.assign(x.s.game.player,approach(x.s,x.vein));assert.equal(start(x),true);assert.equal(x.m.state,'prepare');
  assert.equal(x.c.data.equipment.weapon.definitionId,'trainingStaff');assert.equal(x.i.owns(PICKAXE),true);
  assert.throws(()=>x.i.equip(x.c.data.inventory.slots.findIndex(s=>s?.definitionId===PICKAXE)));
  assert.equal(start(x),false);x.m.cancel();assert.throws(()=>x.m.start('absent'),/indisponível/);
});
test('the world interaction targets the vein, shows the mining prompt and only within range',()=>{
  const x=fixture();const command=x.s.interactions.activate(x.s.game.player);assert.equal(command.type,'mining');assert.equal(command.content.veinId,x.vein.id);
  assert.match(x.s.interactions.selected.label,/Minerar/);Object.assign(x.s.game.player,{x:x.vein.x+x.m.config.interactionRadius+3,z:x.vein.z});assert.notEqual(x.s.interactions.activate(x.s.game.player)?.targetId,x.vein.id);
});
test('veins are solid rock: the player cannot stand inside one',()=>{const x=fixture();assert.equal(canStand(x.s.area,x.vein.x,x.vein.z,.32),false);});
test('prepare phase ignores early input, then the strike phase opens and times out as a miss',()=>{
  const x=fixture();start(x);assert.equal(x.m.indicator,0);return x.m.strike().then(result=>{assert.equal(result,false);assert.equal(x.m.active,true);assert.equal(x.m.state,'prepare');
    x.m.update(x.m.strikeAt-x.m.time+.01);assert.equal(x.m.state,'strike');x.m.update(MINING.timeoutSeconds+1);assert.equal(x.m.active,false);assert.match(x.m.message,/errou/);assert.equal(ore(x.c),0);assert.equal(x.vein.state,'available');});
});
test('PERFECT grants one ore and the bonus XP, saved together',async()=>{
  const x=fixture(),before=unchanged(x.c.snapshot());let saved;x.m.save=async d=>{saved=structuredClone(d);};
  start(x);onCenter(x.m);assert.equal(await x.m.strike(),true);
  assert.equal(ore(x.c),1);assert.equal(x.c.data.lifeSkills.mining.xp,MINING.xp.PERFECT);assert.equal(x.vein.state,'exhausted');assert.deepEqual(unchanged(x.c.data),before);
  assert.match(x.m.message,/Golpe perfeito/);assert.match(x.m.message,/\+1 Minério Bruto/);assert.match(x.m.message,/bônus/);
  const loaded=decodeSave(encodeSave(saved,1));assert.deepEqual(loaded.inventory,x.c.data.inventory);assert.deepEqual(loaded.lifeSkills,x.c.data.lifeSkills);
});
test('GOOD grants one ore and normal XP, below the PERFECT bonus',async()=>{
  const x=fixture();start(x);nearCenter(x.m);assert.equal(await x.m.strike(),true);
  assert.equal(ore(x.c),1);assert.equal(x.c.data.lifeSkills.mining.xp,MINING.xp.GOOD);assert.ok(MINING.xp.GOOD<MINING.xp.PERFECT);assert.match(x.m.message,/Mineração concluída/);
});
test('MISS grants nothing, costs nothing, keeps the vein and allows a controlled retry',async()=>{
  const x=fixture(),before=x.c.snapshot();start(x);offCenter(x.m);assert.equal(await x.m.strike(),false);
  assert.match(x.m.message,/errou o golpe/);assert.equal(x.m.active,false);assert.equal(x.vein.state,'available');assert.deepEqual(x.c.data,before);
  assert.throws(()=>start(x),/fôlego/);x.m.update(MINING.retrySeconds);assert.equal(start(x),true);x.m.cancel();
  assert.equal(x.c.data.hp,before.hp);assert.equal(x.c.data.gold,before.gold);
});
test('a vein pays at most once: duplicate input while saving, restart after success and a second approach',async()=>{
  const x=fixture();let calls=0,release;x.m.save=()=>{calls++;return new Promise(r=>release=r);};
  start(x);onCenter(x.m);const operation=x.m.strike();await Promise.resolve();
  assert.equal(x.m.state,'saving');assert.equal(x.vein.state,'reserved');assert.equal(ore(x.c),0);
  assert.equal(x.m.strike(),operation);assert.equal(x.m.start(x.vein.id),false);assert.equal(x.m.busy,true);
  release();assert.equal(await operation,true);assert.equal(calls,1);assert.equal(ore(x.c),1);assert.equal(x.c.data.lifeSkills.mining.xp,MINING.xp.PERFECT);
  assert.equal(x.m.strike() instanceof Promise,true);assert.equal(await x.m.strike(),false);
  assert.throws(()=>start(x),/já foi minerado/);x.m.update(10);assert.throws(()=>start(x),/já foi minerado/);
  assert.match(x.s.area.interactables.find(i=>i.id===x.vein.id).label,/esgotado/);assert.equal(ore(x.c),1);
});
test('save failure rolls the logical grant back and frees the vein',async()=>{
  const x=fixture(),before=x.c.snapshot();x.m.save=async()=>{x.c.damage(3);throw Error('disk failure');};
  start(x);onCenter(x.m);assert.equal(await x.m.strike(),false);
  assert.deepEqual(x.c.data.inventory,before.inventory);assert.deepEqual(x.c.data.lifeSkills,before.lifeSkills);assert.equal(x.c.data.hp,before.hp-3);
  assert.equal(x.vein.state,'available');assert.equal(x.m.pending,null);assert.match(x.m.message,/não salva/);assert.equal(x.m.busy,false);
});
test('a full bag grants neither ore nor XP; a partial ore stack still fits',async()=>{
  const x=fixture();while(x.c.data.inventory.slots.includes(null))x.i.acquire('travelerCap');
  assert.throws(()=>start(x),/mochila/);
  const y=fixture();for(let n=0;n<5;n++)y.i.acquire(RAW_ORE);while(y.c.data.inventory.slots.includes(null))y.i.acquire('travelerCap');
  assert.equal(y.i.canAcquire(RAW_ORE),true);start(y);onCenter(y.m);assert.equal(await y.m.strike(),true);assert.equal(ore(y.c),6);
  const z=fixture();start(z);while(z.c.data.inventory.slots.includes(null))z.i.acquire('travelerCap');onCenter(z.m);const before=z.c.snapshot();assert.equal(await z.m.strike(),false);assert.deepEqual(z.c.data,before);assert.match(z.m.message,/mochila/);
});
test('losing the pickaxe before the blow lands denies the reward',async()=>{
  const x=fixture();start(x);onCenter(x.m);const slot=x.c.data.inventory.slots.findIndex(s=>s?.definitionId===PICKAXE);x.c.data.inventory.slots[slot]=null;
  assert.equal(await x.m.strike(),false);assert.match(x.m.message,/picareta/);assert.equal(ore(x.c),0);assert.equal(x.c.data.lifeSkills.mining.xp,0);assert.equal(x.vein.state,'available');
});
test('level up message appears when the XP threshold is crossed',async()=>{
  const x=fixture();x.c.data.lifeSkills.mining={level:1,xp:lifeXPRequired(1)-1};start(x);onCenter(x.m);await x.m.strike();
  assert.equal(x.c.data.lifeSkills.mining.level,2);assert.match(x.m.message,/MINERAÇÃO NÍVEL 2/);assert.equal(x.c.data.level,1);
});
for(const reason of ['escape','damage','death','floor','refuge','abandon','hostile','reset'])test(reason+' cancels mining with no reward and a late blow cannot pay',async()=>{
  const x=fixture();start(x);onCenter(x.m);
  if(reason==='escape')x.m.cancel();
  else if(reason==='damage'){x.c.damage(1);tick(x.s);}
  else if(reason==='death'){x.c.damage(99999);tick(x.s);}
  else if(reason==='floor'){const next=generateFloor(42,x.s.area.floorId+1,x.s.hubId,{floorRole:'normal'});x.s.areas[next.id]=next;x.s.enter(next.id);}
  else if(reason==='refuge')x.s.endRun('failure');
  else if(reason==='abandon')x.s.endRun();
  else if(reason==='hostile'){x.s.combat.random=()=>.1;x.s.combat.basicImpact({damageType:'physical',power:1},{physicalAttack:50,hit:100,criticalChance:0},x.s.game.player,'enemy');}
  else x.m.reset(5);
  assert.equal(x.m.active,false);if(reason!=='death')assert.equal(equipmentBlocked(x.s.combat),false);
  assert.equal(await x.m.strike(),false);assert.equal(ore(x.c),0);assert.equal(x.c.data.lifeSkills.mining.xp,0);assert.equal(x.vein.state,'available');assert.equal(x.m.pending,null);
});
test('closing the session mid-swing leaves no pending work',()=>{const x=fixture();start(x);x.m.cancel('Sessão encerrada.');assert.equal(x.m.busy,false);assert.equal(x.m.state,'idle');assert.equal(x.m.pending,null);});
test('paused simulation freezes the swing and the indicator',()=>{const x=fixture();start(x);x.m.update(.2);const t=x.m.time;x.s.game.paused=true;x.s.update(1,{x:0,z:0},0);assert.equal(x.m.time,t);});
test('mining blocks movement, skills, attacks and equipment, but the world keeps running',()=>{
  const x=fixture();x.c.data.knownAbilities=['energyBall'];start(x);const pos={x:x.s.game.player.x,z:x.s.game.player.z},time=x.s.game.elapsed;
  assert.equal(x.s.combat.moveTo({x:0,z:0}),false);assert.equal(x.s.combat.select(x.s.combat.enemies[0].id),false);assert.equal(x.s.combat.abilities.request(4),false);
  assert.equal(equipmentBlocked(x.s.combat),true);x.s.update(.1,{x:1,z:1},0);assert.ok(x.s.game.elapsed>time);assert.deepEqual({x:x.s.game.player.x,z:x.s.game.player.z},pos);assert.equal(x.s.game.paused,false);
});
test('mining and fishing exclude each other, and combat blocks mining before it starts',()=>{
  const x=fixture();x.s.fishing.state='waiting';assert.throws(()=>start(x),/pesca/);x.s.fishing.state='idle';
  start(x);assert.throws(()=>x.s.fishing.start('anything'),/mineração/);x.m.cancel();
  x.s.game.inCombat=true;assert.throws(()=>start(x),/combate/);assert.equal(x.m.state,'idle');
});
test('mining does not open gates, finish encounters or wake the boss',async()=>{
  const x=fixture(),before=structuredClone(x.s.run.encounters);start(x);onCenter(x.m);await x.m.strike();
  assert.deepEqual(x.s.run.encounters,before);assert.ok(x.s.area.gates.every(g=>!g.open));assert.equal(x.s.run.bossStarted,false);
});
for(const fps of [30,60,144])test('swing timing and reward are identical at '+fps+' FPS',async()=>{
  const x=fixture();start(x);const target=x.m.strikeAt+x.m.center*MINING.sweepSeconds;
  while(x.m.time<target-1e-9)x.m.update(Math.min(1/fps,target-x.m.time));
  assert.equal(x.m.state,'strike');assert.ok(Math.abs(x.m.indicator-x.m.center)<1e-6);assert.equal(await x.m.strike(),true);assert.equal(x.c.data.lifeSkills.mining.xp,MINING.xp.PERFECT);
});
test('swing target positions are reproducible per seed and vary between attempts',()=>{
  const centers=()=>{const x=fixture(),list=[];for(let n=0;n<12;n++){start(x);list.push(x.m.center);x.m.cancel();x.m.update(MINING.retrySeconds);}return list;};
  const a=centers();assert.deepEqual(a,centers());assert.ok(new Set(a).size>1);assert.ok(a.every(v=>v>=MINING.zoneMin&&v<=MINING.zoneMax));
});
test('the ore cannot be sold to the cook and mining leaves Fishing and Cooking untouched',async()=>{
  const x=fixture();start(x);onCenter(x.m);await x.m.strike();
  const food=new FoodService(x.c,{save:async()=>{},context:()=>({safe:true,blocked:false})}),slot=x.c.data.inventory.slots.find(s=>s?.definitionId===RAW_ORE);
  await assert.rejects(async()=>food.sell(slot.instanceId,1),/não compra/);assert.equal(ore(x.c),1);
  assert.deepEqual(x.c.data.lifeSkills.fishing,{level:1,xp:0});assert.deepEqual(x.c.data.lifeSkills.cooking,{level:1,xp:0});
});
