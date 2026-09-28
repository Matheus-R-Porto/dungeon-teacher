import {armFixture} from './armed-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Character} from '../src/domain/character/character.js';
import {AttackCycle,hitChance,resolveAttack} from '../src/domain/combat/attack.js';
import {COMBAT} from '../src/domain/combat/config.js';
import {Combat} from '../src/simulation/combat.js';
import {Game} from '../src/simulation/game.js';
import {canStand} from '../src/world/collision.js';
const hub=JSON.parse(readFileSync(new URL('../src/data/hub.json',import.meta.url)));
const setup=()=>{const game=new Game(structuredClone(hub)),character=new Character(),combat=new Combat(game,character,{random:()=>0.5});armFixture(character);return {game,character,combat,enemy:combat.enemies[0]};};
const tick=(s,seconds,axis={x:0,z:0},yaw=0)=>{for(let t=0;t<Math.round(seconds*120);t++)s.combat.update(1/120,axis,yaw);};
const nearby=s=>{s.enemy.x=s.game.player.x+1;s.enemy.z=s.game.player.z;};
test('training enemy stands on walkable ground, approach reaches range and stops',()=>{const s=setup();s.combat.retaliation=false;assert.ok(canStand(s.game.world,s.enemy.x,s.enemy.z,.32));s.combat.select(s.enemy.id);tick(s,3);assert.equal(s.combat.state,'attacking');assert.ok(s.combat.distance(s.enemy)<=COMBAT.playerRange);assert.equal(s.game.path.length,0);assert.ok(s.enemy.hp<120);});
test('attack cycle has delayed one-time impact and exact low/normal/high frequency at 30/60/144 FPS',()=>{for(const speed of [.25,1.075,4]){const counts=[];for(const fps of [30,60,144]){const cycle=new AttackCycle();let hits=0;for(let i=0;i<fps*20;i++)cycle.advance(1/fps,speed,()=>true,()=>hits++);counts.push(hits);}assert.equal(new Set(counts).size,1);assert.equal(counts[0],Math.floor((20-COMBAT.windupFraction/speed)*speed+1e-8)+1);}const cycle=new AttackCycle();let hits=0;cycle.advance(.1,1,()=>true,()=>hits++);assert.equal(hits,0);assert.equal(cycle.phase,'windup');cycle.advance(.15,1,()=>true,()=>hits++);assert.equal(hits,1);});
test('cancelled windup causes no damage and clicking again cannot erase cooldown',()=>{const cycle=new AttackCycle();let hits=0;cycle.advance(.1,1,()=>true,()=>hits++);cycle.cancel();cycle.advance(.8,1,()=>true,()=>hits++);assert.equal(hits,0);cycle.advance(.35,1,()=>true,()=>hits++);assert.equal(hits,1);});
test('central hit, minimum damage, variation, critical and miss formulas',()=>{const a={physicalAttack:20,accuracy:80,criticalChance:20},d={physicalDefense:5,evasion:5};assert.equal(hitChance(a,d),.75);assert.equal(hitChance({...a,accuracy:10000},d),.95);assert.equal(hitChance({...a,accuracy:0},d),.05);assert.equal(resolveAttack(a,d,()=>.99).hit,false);let rolls=[.1,.1,.5];assert.deepEqual(resolveAttack(a,d,()=>rolls.shift()),{hit:true,critical:true,damage:23});assert.ok(resolveAttack(a,{...d,physicalDefense:9999},()=>0).damage>=1);const damages=[0,1].map(v=>{let r=[.1,.9,v];return resolveAttack(a,d,()=>r.shift()).damage;});assert.ok(damages[1]>damages[0]);});
test('STR AGI DEX LUK VIT change actual damage, cadence, chance, critical frequency and survival',()=>{const s=setup(),base=s.character.stats;for(const [attribute,stat] of [['str','physicalAttack'],['agi','attackSpeed'],['dex','accuracy'],['luk','criticalChance'],['vit','physicalDefense']]){const c=new Character();c.data.attributes[attribute]+=50;c.recalculate();assert.ok(c.stats[stat]>base[stat]);if(attribute==='str')assert.ok(resolveAttack(c.stats,s.enemy.stats,()=>.5).damage>resolveAttack(base,s.enemy.stats,()=>.5).damage);if(attribute==='dex')assert.ok(hitChance(c.stats,s.enemy.stats)>hitChance(base,s.enemy.stats));if(attribute==='vit'){assert.ok(c.stats.maxHP>base.maxHP);assert.ok(resolveAttack(s.enemy.stats,c.stats,()=>.5).damage<resolveAttack(s.enemy.stats,base,()=>.5).damage);}}
 const sample=stats=>{let critical=0,hit=0;for(let i=0;i<10000;i++){let rolls=[(i%100)/100,Math.floor(i/100)/100,.5];const r=resolveAttack(stats,s.enemy.stats,()=>rolls.shift());critical+=r.critical;hit+=r.hit;}return {critical,hit};};const c=new Character();c.data.attributes.luk+=50;c.data.attributes.dex+=30;c.recalculate();assert.ok(sample(c.stats).critical>sample(base).critical);assert.ok(sample(c.stats).hit>sample(base).hit);
});
test('manual WASD and floor click cancel pursuit but preserve selected target',()=>{const s=setup();s.combat.retaliation=false;s.combat.select(s.enemy.id);tick(s,.1,{x:1,z:0});assert.equal(s.combat.currentTarget,s.enemy.id);assert.equal(s.combat.state,'moving');const hp=s.enemy.hp;tick(s,2);assert.equal(s.enemy.hp,hp);assert.ok(s.combat.moveTo(s.game.world.spawn));assert.equal(s.combat.currentTarget,s.enemy.id);assert.notEqual(s.combat.state,'attacking');});
test('range revalidated at impact; removed target cannot be struck',()=>{const s=setup();nearby(s);s.combat.retaliation=false;s.combat.select(s.enemy.id);tick(s,.1);s.enemy.x+=10;tick(s,.2);assert.equal(s.enemy.hp,120);s.combat.enemies=[];tick(s,1);assert.equal(s.combat.currentTarget,null);assert.notEqual(s.combat.state,'attacking');});
test('enemy death clamps HP, clears target, ends attack and removes after delay without XP',()=>{const s=setup();nearby(s);s.combat.retaliation=false;s.enemy.hp=1;s.combat.select(s.enemy.id);tick(s,.4);assert.equal(s.enemy.hp,0);assert.equal(s.enemy.state,'dead');assert.equal(s.combat.currentTarget,null);assert.equal(s.character.data.xp,0);tick(s,2);assert.equal(s.enemy.state,'removed');assert.equal(s.combat.select(s.enemy.id),false);});
test('passive validation, retaliation shares formulas, and death returns player with full resources',()=>{const s=setup();nearby(s);s.combat.retaliation=false;tick(s,2);assert.equal(s.character.data.hp,160);s.combat.retaliation=true;tick(s,.5);assert.ok(s.character.data.hp<160);s.character.data.hp=1;s.character.spendMP(20);tick(s,1.2);assert.equal(s.combat.state,'dead');assert.equal(s.character.data.hp,0);assert.equal(s.combat.currentTarget,null);assert.equal(s.game.player.moving,false);tick(s,3.1);assert.equal(s.character.data.hp,s.character.stats.maxHP);assert.equal(s.character.data.mp,s.character.stats.maxMP);assert.equal(s.game.player.x,hub.spawn.x);assert.equal(s.game.player.z,hub.spawn.z);});
test('pausing freezes both cycles, movement, HP and death timer',()=>{const s=setup();nearby(s);s.combat.select(s.enemy.id);tick(s,.1);s.game.paused=true;const before={hp:s.enemy.hp,player:s.character.data.hp,phase:s.combat.playerCycle.remaining,time:s.game.elapsed};tick(s,20);assert.deepEqual({hp:s.enemy.hp,player:s.character.data.hp,phase:s.combat.playerCycle.remaining,time:s.game.elapsed},before);});
test('combat facing and damage independent of seven camera angles',()=>{const results=[];for(const degrees of [0,45,90,137,180,243,318]){const s=setup();nearby(s);s.combat.retaliation=false;s.combat.select(s.enemy.id);tick(s,2,{x:0,z:0},degrees*Math.PI/180);assert.equal(s.game.player.heading,Math.PI/2);results.push(s.enemy.hp);}assert.equal(new Set(results).size,1);});
test('interaction explicitly cancels windup and combat blocks attribute allocation',()=>{const s=setup();nearby(s);s.combat.select(s.enemy.id);tick(s,.1);s.character.data.attributePoints=5;assert.throws(()=>s.character.allocate({str:1},{safeHub:true,inCombat:s.game.inCombat}));s.combat.interact();assert.equal(s.combat.state,'interacting');const hp=s.enemy.hp;tick(s,.3);assert.equal(s.enemy.hp,hp);});
test('enemy attacks continue at high player attack speed without stun lock',()=>{const s=setup();nearby(s);s.enemy.hp=100000;s.character.modifiers.other={stats:{attackSpeed:100}};s.character.recalculate();s.combat.select(s.enemy.id);tick(s,2);assert.ok(s.character.data.hp<160);assert.ok(s.enemy.hp<100000);});

// Real Three.js camera projection/raycast, without a WebGL renderer or browser.
import * as THREE from 'three';
import {CombatVisual} from '../src/adapters/rendering/combat-visual.js';
test('ray targeting hits the enemy at all requested orbital camera angles',()=>{
  for(const degrees of [0,45,90,137,180,243,318]){
    const s=setup(),camera=new THREE.OrthographicCamera(-10,10,8,-8,.1,120),yaw=degrees*Math.PI/180;
    camera.position.set(s.enemy.x+Math.sin(yaw)*20,18,s.enemy.z+Math.cos(yaw)*20);camera.lookAt(s.enemy.x,.5,s.enemy.z);camera.updateMatrixWorld();
    const view={scene:new THREE.Scene(),camera,raycaster:new THREE.Raycaster(),canvas:{getBoundingClientRect:()=>({left:0,top:0,width:1000,height:800})}};
    const visual=new CombatVisual(view,s.combat),projected=new THREE.Vector3(s.enemy.x,.43,s.enemy.z).project(camera);
    assert.equal(visual.pick((projected.x+1)*500,(1-projected.y)*400),s.enemy.id);
    assert.equal(visual.pick(0,0),null);s.enemy.hp=0;s.enemy.state='dead';assert.equal(visual.pick((projected.x+1)*500,(1-projected.y)*400),null);
    view.scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  }
});
test('switching targets cancels the first pending impact',()=>{
  const s=setup();nearby(s);s.combat.retaliation=false;const other=new (s.enemy.constructor)({...s.enemy,id:'second-training-target',x:s.enemy.x,z:s.enemy.z+.3});s.combat.enemies.push(other);
  s.combat.select(s.enemy.id);tick(s,.1);s.combat.select(other.id);tick(s,1.3);assert.equal(s.enemy.hp,120);assert.ok(other.hp<120);
});
