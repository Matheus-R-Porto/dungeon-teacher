import {receiveImpact,impactLocked,impactState} from './impact.js';
import {roam,resumeExploration,roamingEnabled,inWolfRoom} from '../src/simulation/roaming.js';
import {WhiteWolfEncounter} from './white-wolf.js';
import {tryRespawn} from './respawn.js';
import {surfaceId} from '../src/world/surfaces.js';
import {VISUAL_COMBAT} from '../src/core/visual-combat.js';
import {randomUUID,randomBytes} from 'node:crypto';
import {testMap,WORLD_NET,worldMessage} from '../shared/world.js';
import {Game} from '../src/simulation/game.js';
import {CONFIG} from '../src/core/config.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory,equippedDefinition} from '../src/domain/items/inventory.js';
import {AttackCycle,resolveAttack} from '../src/domain/combat/attack.js';
import {createEnemies} from '../src/domain/enemies/spawns.js';
import {moveWithCollision,clearSegment,canStand} from '../src/world/collision.js';
import {findPath} from '../src/world/navigation.js';
import {separateBodies} from '../src/simulation/bodies.js';

// One simulation per room, never one monster simulation per connected player.
export class SharedWorld {
  constructor({map=testMap(),random=Math.random}={}){this.map=map;this.random=random;this.players=new Map();this.tokens=new Map();this.enemies=createEnemies(map.enemySpawns,map);this.enemies.forEach((e,i)=>e.enemyType=map.enemySpawns[i].enemyType);this.time=0;this.tick=0;this.events=[];this.eventId=0;this.cycles=new Map(this.enemies.map(e=>[e.id,new AttackCycle()]));if(this.enemies.some(e=>e.isMiniBoss))this.bossEncounter=new WhiteWolfEncounter(this);}
  join(ws,name,token){
    let p=token&&this.tokens.get(token);
    if(p&&p.expires<=this.time){this.tokens.delete(token);p=null;}
    if(!p){const character=new Character();const bag=new Inventory(character);bag.acquire('trainingSword');bag.equip(0);
      p={id:randomUUID(),token:randomBytes(32).toString('hex'),name,character,game:new Game(this.map),cycle:new AttackCycle(),seq:0,target:null,axis:{x:0,z:0},deathAt:null};this.tokens.set(p.token,p);}
    // Reconnection replaces the socket; late close/input from the old socket cannot own this entity.
    const old=p.ws;p.ws=ws;p.expires=Infinity;p.seq=0;p.axis={x:0,z:0};p.target=null;p.game.cancel();p.cycle.cancel();p.inputAt=this.time;
    this.players.set(p.id,p);if(old&&old!==ws)old.close(4009,'Sessão substituída.');return p;
  }
  leave(ws){const p=ws.worldPlayer;if(!p||p.ws!==ws)return;p.ws=null;p.expires=this.time+60;p.axis={x:0,z:0};p.target=null;p.game.cancel();p.cycle.cancel();this.players.delete(p.id);for(const e of this.enemies)if(e.targetId===p.id)this.returnEnemy(e);}
  command(ws,m){const p=ws.worldPlayer;if(!p||p.ws!==ws||this.players.get(p.id)!==p)throw Error('Sessão inativa.');if(m.seq<=p.seq)return false;p.seq=m.seq;p.inputAt=this.time;
    if(!p.character.isAlive||impactLocked(p,this.time))return false;const a=m.action;
    if(a.kind==='stop'){p.axis={x:0,z:0};p.target=null;p.game.cancel();p.cycle.cancel();}
    if(a.kind==='move'){p.axis={x:a.x,z:a.z};if(a.x||a.z){p.target=null;p.game.cancel();p.cycle.cancel();}}
    if(a.kind==='destination'){p.axis={x:0,z:0};p.target=null;p.cycle.cancel();p.game.moveTo(a);}
    if(a.kind==='attack'){const e=this.enemies.find(e=>e.id===a.target);if(!e?.alive||e.generation!==a.generation||e.state==='returning')return false;if(p.target?.id!==e.id||p.target?.generation!==e.generation)p.cycle.cancel();p.axis={x:0,z:0};p.game.cancel();p.target={id:e.id,generation:e.generation};p.repathAt=0;}
    return true;
  }
  returnEnemy(e){if(!e.alive)return;e.threat={};e.classTaunt=null;e.conditions={};e.classSlow=0;e.targetId=null;e.state='returning';e.path=[];e.repathAt=0;this.cycles.get(e.id)?.cancel();if(roamingEnabled(this.map,e))resumeExploration(e,this.time);}
  validHit(a,b,range){return Math.hypot(a.x-b.x,a.z-b.z)<=range&&clearSegment(this.map,a,b,.1);}
  impact(source,target,stats,defender,apply){const context=this.beforeImpact?.(source,target,stats,defender)??{stats,defender};const result=resolveAttack(context.stats,context.defender,this.random);if(context.transform)result.damage=context.transform(result.damage);this.guardian?.participation?.damage(source,target,result.damage);const victim=this.players.get(target)?.character??this.enemies.find(e=>e.id===target),beforeHP=victim?.data?.hp??victim?.hp;apply(result.damage);const lost=Math.max(0,(beforeHP??0)-(victim?.data?.hp??victim?.hp??0));receiveImpact(this,target,lost);this.afterImpact?.(source,target,result);if(result.damage>0&&this.players.has(target))this.players.get(target).visualCombatRemaining=VISUAL_COMBAT.restSeconds;if(this.bossEncounter?.e.id===target&&!this.bossEncounter.e.alive)this.bossEncounter.defeat(this.players.get(source)?.name??'Aventureiro');this.events.push({id:++this.eventId,source,target,damage:result.damage,hit:result.hit,time:this.time});if(this.events.length>40)this.events.shift();return result;}
  step(dt=WORLD_NET.tick){
    this.time+=dt;this.tick++;this.metrics={navigationMs:0,playerNavigationMs:0,aiMs:0,respawnMs:0};
    for(const [token,p] of this.tokens)if(!p.ws&&p.expires<=this.time)this.tokens.delete(token);
    for(const p of this.players.values()){
      p.visualCombatRemaining=Math.max(0,(p.visualCombatRemaining??0)-dt);if(p.cycle.phase!=='idle')p.visualCombatRemaining=VISUAL_COMBAT.restSeconds;
      const abilityBusy=this.updateAbilities?.(p,dt);
      if(!p.character.isAlive){p.deathAt??=this.time;p.axis={x:0,z:0};p.target=null;p.game.cancel();p.cycle.cancel();if(!this.holdDead&&this.time-p.deathAt>=WORLD_NET.playerRespawn){p.character.data.hp=p.character.stats.maxHP;p.deathAt=null;p.impactState=null;p.basicConfirmedAt=null;Object.assign(p.game.player,{y:0,surface:'ground'},this.map.spawn,{moving:false});p.game.previous={...p.game.player};}continue;}
      if(impactLocked(p,this.time)){p.game.cancel();p.axis={x:0,z:0};p.game.update(dt,p.axis,0);p.cycle.advance(dt,p.character.stats.attackSpeed,()=>false,()=>{});continue;}
      if(this.time-p.inputAt>WORLD_NET.inputExpiry)p.axis={x:0,z:0};
      const e=this.enemies.find(e=>e.id===p.target?.id),valid=()=>!!e?.alive&&e.generation===p.target?.generation&&e.state!=='returning';
      if(p.target&&!valid()){p.target=null;p.game.cancel();p.cycle.cancel();}
      const weapon=equippedDefinition(p.character.data),range=(weapon?.basicAttack.attackRange??(p.character.data.jobs?1.2:0))+(weapon?.weaponType==='bow'?(p.abilities?.classEngine?.value('distanceMastery').bowRange??0):0),inRange=()=>range>0&&valid()&&this.validHit(p.game.player,e,range);
      if(valid()){if(inRange())p.game.cancel();else if(this.time>=p.repathAt&&(!p.game.path.length||!p.repathTarget||p.repathTarget.surface!==e.surface||Math.hypot(e.x-p.repathTarget.x,e.z-p.repathTarget.z)>.75)){p.repathTarget={x:e.x,z:e.z,surface:e.surface};const pathStart=performance.now();p.game.moveTo(p.repathTarget);this.metrics.playerNavigationMs+=performance.now()-pathStart;p.repathAt=this.time+.3;}}
      p.game.character=p.character;
      p.game.update(dt,p.axis,0);
      if(valid())p.game.player.heading=Math.atan2(e.x-p.game.player.x,e.z-p.game.player.z);
      p.cycle.advance(dt,p.character.stats.attackSpeed,inRange,()=>{
        if(equippedDefinition(p.character.data)?.weaponType==='bow'&&p.character.data.jobs){const bag=new Inventory(p.character);if(!bag.count('arrows')){p.notice='Flechas insuficientes';p.target=null;return;}const v=p.abilities?.classEngine?.value('arrowConservation')??{};if(this.random()>=Math.min(v.cap??0,(v.ammoSave??0)+(p.character.data.attributes.luk??0)*(v.luckScaling??0)))bag.remove('arrows',1);}
        p.basicConfirmedAt=this.time;const result=this.impact(p.id,e.id,p.character.stats,e.stats,damage=>e.damage(damage));
        if(result.hit&&e.alive){e.targetId=p.abilities?.classEngine?.threatTarget(e)??p.id;e.state='chasing';} // Selection/proximity/miss never provoke.
        if(!e.alive){e.targetId=null;e.deadAt=this.time;e.path=[];this.cycles.get(e.id).cancel();}
      },()=>!abilityBusy);
    }
    const aiStart=performance.now();
    for(const e of this.enemies){
      const cycle=this.cycles.get(e.id);if(this.customEnemyStep?.(e,dt))continue;if(e.isMiniBoss&&this.bossEncounter){this.bossEncounter.step(dt);continue;}
      if(!e.alive){e.deadAt??=this.time;e.deathTime=this.time-e.deadAt;const policy=this.map.livingTower?.respawn,delay=policy?(e.enemyType==='wolf'?policy.wolf:policy.slime):WORLD_NET.respawn;if(!e.noRespawn&&e.deathTime>=delay){
        let spawn=e.spawnPosition;if(this.map.awakening){const respawnStart=performance.now();spawn=tryRespawn(this,e);this.metrics.respawnMs+=performance.now()-respawnStart;if(!spawn)continue;}else if(!canStand(this.map,e.spawnPosition.x,e.spawnPosition.z,e.radius)||this.map.interactables.some(i=>i.action==='travel'&&Math.hypot(i.x-e.spawnPosition.x,i.z-e.spawnPosition.z)<(i.radius??2)+e.radius)||[...this.players.values()].some(p=>Math.hypot(p.game.player.x-e.spawnPosition.x,p.game.player.z-e.spawnPosition.z)<(policy?.clearance??1.6))||this.enemies.some(other=>other!==e&&other.alive&&Math.hypot(other.x-e.spawnPosition.x,other.z-e.spawnPosition.z)<other.radius+e.radius))continue;
        Object.assign(e,spawn,{explorationOrigin:null,roam:null,threat:{},classTaunt:null,conditions:{},classSlow:0,hp:e.stats.maxHP,state:'idle',deathTime:0,deadAt:null,targetId:null,generation:e.generation+1,impactState:null,path:[],perceptionAt:this.time+2});this.cycles.set(e.id,new AttackCycle());
      }continue;}
      if(impactLocked(e,this.time)){e.state=impactState(e,this.time).phase;e.path=[];cycle.advance(dt,e.stats.attackSpeed,()=>false,()=>{});continue;}
      // Only territorial wolves acquire by perception; passive Slime rules stay unchanged.
      if(e.enemyType==='wolf'&&e.aggressive&&!e.targetId&&e.state==='idle'&&this.time>=(e.perceptionAt??0)){
        e.perceptionAt=this.time+.18;let nearest=null,best=e.detectionRange;
        for(const candidate of this.players.values()){const d=Math.hypot(candidate.game.player.x-e.x,candidate.game.player.z-e.z);if(candidate.character.isAlive&&!candidate.abilities?.classEngine?.buffs.concealment&&d<best&&clearSegment(this.map,e,candidate.game.player,.1)){nearest=candidate;best=d;}}
        if(nearest){e.targetId=nearest.id;e.state='chasing';e.repathAt=0;}
      }
      if(e.classTaunt?.end>this.time&&this.players.get(e.classTaunt.source)?.character.isAlive)e.targetId=e.classTaunt.source;
      const p=this.players.get(e.targetId);if(p?.abilities?.classEngine?.buffs.concealment){this.returnEnemy(e);continue;}
      if(e.targetId&&(!p?.character.isAlive||surfaceId(p.game.player)!==surfaceId(e)||Math.hypot(e.x-(e.explorationOrigin??e.spawnPosition).x,e.z-(e.explorationOrigin??e.spawnPosition).z)>e.leashRange))this.returnEnemy(e);
      const returning=e.state==='returning',target=returning?e.spawnPosition:e.targetId&&p?.character.isAlive?p.game.player:null;
      if(!target){cycle.advance(dt,e.stats.attackSpeed,()=>false,()=>{});if(roamingEnabled(this.map,e)&&this.time>=(e.perceptionAt??0)-1.8)roam(this.map,e,dt,this.time,{peers:this.enemies});continue;}
      if(returning&&Math.hypot(e.x-target.x,e.z-target.z)<.15){Object.assign(e,e.spawnPosition,{hp:e.stats.maxHP,state:'idle',path:[],targetId:null,perceptionAt:this.time+2});continue;}
      const canHit=()=>!returning&&p?.character.isAlive&&this.players.get(p.id)===p&&this.validHit(e,p.game.player,e.stats.attackRange);
      if(!canHit()){
        if(this.time>=(e.repathAt??0)){const navStart=performance.now();e.path=findPath(this.map,e,target,e.radius,CONFIG.navigationCell)??[];this.metrics.navigationMs+=performance.now()-navStart;e.repathAt=this.time+.4;}
        const point=e.path[0];if(point){const dx=point.x-e.x,dz=point.z-e.z,d=Math.hypot(dx,dz),step=Math.min(d,(returning?e.returnSpeed:e.chaseSpeed)*(1-(e.classSlow??0))*dt);if(d<.05)e.path.shift();else{const next=moveWithCollision(this.map,e,dx/d*step,dz/d*step,e.radius);if(Math.hypot(next.x-e.x,next.z-e.z)>.00001)e.heading=Math.atan2(next.x-e.x,next.z-e.z);Object.assign(e,next);}}
        if(!returning)e.state='chasing';
      }else{e.state='attacking';e.heading=Math.atan2(target.x-e.x,target.z-e.z);}
      cycle.advance(dt,e.stats.attackSpeed,canHit,()=>this.impact(e.id,p.id,e.stats,p.character.stats,damage=>{p.character.damage(damage);if(damage>0)p.visualCombatRemaining=VISUAL_COMBAT.restSeconds;if(!p.character.isAlive){p.target=null;p.game.cancel();for(const other of this.enemies)if(other.targetId===p.id)this.returnEnemy(other);}}));
    }
    this.metrics.aiMs=performance.now()-aiStart;
    if(this.respawnMetrics)this.respawnMetrics.pending=this.enemies.filter(e=>!e.alive&&!e.noRespawn&&e.deathTime>=(e.enemyType==='wolf'?16:12)).length;
    const bodies=[...this.players.values()].map(p=>({...p.game.player,radius:CONFIG.playerRadius,alive:p.character.isAlive,player:p}));
    const boss=this.bossEncounter?.e,beforeBoss=boss?{x:boss.x,z:boss.z,y:boss.y,surface:boss.surface}:null;separateBodies(this.map,[...this.enemies,...bodies],null,dt);if(boss?.alive&&!inWolfRoom(this.map,boss,boss.radius)&&inWolfRoom(this.map,beforeBoss,boss.radius))Object.assign(boss,beforeBoss);
    for(const body of bodies)Object.assign(body.player.game.player,{x:body.x,z:body.z,y:body.y??0,surface:body.surface??'ground'});
  }
  snapshot(){return worldMessage('world:snapshot',{mapId:this.map.id,tick:this.tick,time:this.time,
    players:[...this.players.values()].map(p=>({id:p.id,name:p.name,...p.game.player,level:p.character.data.level,className:p.character.className,classId:p.character.data.classId,appearance:p.character.data.appearance??null,classEffects:p.abilities?.classEngine?.snapshot().buffs??{},hand:p.abilities?.classEngine?.hand??0,equipmentVisual:p.character.data.jobs?p.character.data.equipment:null,hp:p.character.data.hp,maxHP:p.character.stats.maxHP,mp:p.character.data.mp,maxMP:p.character.stats.maxMP,cart:p.character.data.equipment?.cart?.definitionId==='woodenCart',weaponType:equippedDefinition(p.character.data)?.weaponType??null,impact:impactState(p,this.time,p.character.isAlive),action:p.abilities?.animationAction?.()??null,basicReleaseRemaining:Math.max(0,.12-(this.time-(p.basicConfirmedAt??-Infinity))),phase:p.abilities?.active?'active':p.cycle.phase,casting:!!p.abilities?.active,visualCombatRemaining:p.visualCombatRemaining??0,seq:p.seq,target:p.target?.id??null})),
    monsters:this.enemies.map(e=>({id:e.id,type:e.enemyType,name:e.name,x:e.x,z:e.z,y:e.y??0,surface:e.surface??'ground',heading:e.heading,hp:e.hp,maxHP:e.stats.maxHP,state:e.alive&&impactLocked(e,this.time)?impactState(e,this.time).phase:e.state,impact:impactState(e,this.time,e.alive),generation:e.generation,target:e.targetId,deathTime:e.deathTime,conditions:Object.fromEntries(Object.entries(e.conditions??{}).map(([id,c])=>[id,{remaining:Math.max(0,c.end-this.time),stacks:c.stacks?.length??1}])),dormant:e.dormant??false,special:e.special??null,frenzy:e.frenzy??false,...(e.enemyType==='wolf'?{phase:this.cycles.get(e.id).phase}:{})})),skillVisuals:(this.skillVisuals??[]).filter(v=>this.time-v.time<Math.max(1,v.duration??1)),events:this.events,encounter:this.bossEncounter?.snapshot()??null});}
}
