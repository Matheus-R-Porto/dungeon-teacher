import {AWAKENING as A} from '../src/domain/tower-awakening.js';
import {safeSpawn} from './respawn.js';
import {moveWithCollision,clearSegment} from '../src/world/collision.js';
import {surfaceId} from '../src/world/surfaces.js';
import {AttackCycle} from '../src/domain/combat/attack.js';
export class WhiteWolfEncounter {
 constructor(w,{now=()=>Date.now(),saved=null,persist=()=>{}}={}){this.w=w;this.now=now;this.persist=persist;this.e=w.enemies.find(e=>e.isMiniBoss);this.data=saved??{state:'alive',generation:0,respawnAt:null,killer:null};this.e.generation=this.data.generation;this.phase='idle';this.until=0;this.cooldown=0;this.howlAt=0;if(this.data.respawnAt){this.e.hp=0;this.e.state='dead';}}
 cleanup(){for(const e of this.w.enemies.filter(e=>e.encounterAssist)){e.leashRange=e.originalLeash;e.encounterAssist=false;this.w.returnEnemy(e);}for(const e of this.w.enemies.filter(e=>e.reinforcement)){e.hp=0;e.state='removed';e.targetId=null;e.dormant=true;e.path=[];}}
 defeat(killer){if(this.data.respawnAt)return;this.data={state:'waiting',generation:this.e.generation,respawnAt:this.now()+A.boss.respawnMs,killer};this.phase='dead';this.e.targetId=null;this.e.special=null;this.e.path=[];this.cleanup();}
 reset(){this.cleanup();this.phase='idle';this.summonUntil=0;this.e.special=null;this.e.frenzy=false;this.e.targetId=null;this.e.hp=this.e.stats.maxHP;Object.assign(this.e,this.e.spawnPosition,{state:'idle',path:[]});this.data.state='alive';this.persist(this.data);this.onReset?.();}
 howl(target){const w=this.w,e=this.e,allies=w.enemies.filter(q=>q!==e&&q.enemyType==='wolf'&&!q.reinforcement&&q.alive&&surfaceId(q)===surfaceId(e)&&Math.hypot(q.x-e.x,q.z-e.z)<45);let n=0;for(const q of allies.slice(0,A.boss.reinforcements)){q.originalLeash??=q.leashRange;q.leashRange=60;q.encounterAssist=true;q.targetId=target.id;q.state='chasing';q.repathAt=0;n++;}if(!n)this.summonUntil=w.time+5;this.howlAt=w.time+A.boss.howlCooldown;}
 summon(target){if(!(this.summonUntil>this.w.time))return;const w=this.w,c=w.map.surfaces.find(s=>s.id==='white-wolf-cave');if(w.time<(this.summonRetry??0))return;this.summonRetry=w.time+1;for(const [i,e]of w.enemies.filter(q=>q.reinforcement&&!q.alive).entries()){const p=c.summonPoints?.[i]??{x:c.x-12+i*12,z:c.z-23,y:c.y,surface:c.id};if(!safeSpawn(w,e,p))continue;e.spawnPosition={...p};e.leashRange=60;Object.assign(e,p,{hp:e.stats.maxHP,state:'chasing',dormant:false,targetId:target.id,generation:e.generation+1,path:[],repathAt:0});w.cycles.set(e.id,new AttackCycle());}}
 step(dt){const w=this.w,e=this.e,t=w.time; e.frenzy=e.hp>0&&e.hp/e.stats.maxHP<=.3;
 if(!e.alive){e.deathTime=(e.deathTime??0)+dt;if(this.data.respawnAt&&this.now()>=this.data.respawnAt){this.data.state='ready';if(t>=(this.retry??0)){this.retry=t+1;if(safeSpawn(w,e,e.spawnPosition)){this.data={state:'alive',generation:e.generation+1,respawnAt:null,killer:null};Object.assign(e,e.spawnPosition,{hp:e.stats.maxHP,generation:this.data.generation,state:'idle',deathTime:0});this.phase='idle';this.persist(this.data);}}}return;}
 const candidates=[...w.players.values()].filter(p=>p.character.isAlive&&surfaceId(p.game.player)===surfaceId(e)&&Math.hypot(p.game.player.x-e.spawnPosition.x,p.game.player.z-e.spawnPosition.z)<=e.leashRange);
 let target=candidates.find(p=>p.id===e.targetId);if(!target)target=candidates.find(p=>Math.hypot(p.game.player.x-e.x,p.game.player.z-e.z)<e.detectionRange&&clearSegment(w.map,e,p.game.player,.1));
 if(!target){if(this.data.state==='combat')this.reset();return;}e.targetId=target.id;this.data.state='combat';this.summon(target);const p=target.game.player;
 if(this.phase==='charge'){const dx=this.direction.x*dt*(e.frenzy?11:9),dz=this.direction.z*dt*(e.frenzy?11:9),next=moveWithCollision(w.map,e,dx,dz,e.radius);Object.assign(e,next);for(const q of candidates)if(!this.struck.has(q.id)&&w.validHit(e,q.game.player,1.8)){this.struck.add(q.id);w.impact(e.id,q.id,{...e.stats,physicalAttack:e.stats.physicalAttack*1.2},q.character.stats,d=>q.character.damage(d));}if(t>=this.until)this.recover();}
 else if(this.phase==='windup'&&t>=this.until){if(this.skill==='charge'){this.phase='charge';this.until=t+.9;this.struck=new Set();}else if(this.skill==='bite'){if(w.validHit(e,p,2.4))w.impact(e.id,target.id,{...e.stats,physicalAttack:e.stats.physicalAttack*1.35},target.character.stats,d=>target.character.damage(d));this.recover();}else{this.howl(target);this.recover();}}
 else if(this.phase==='recovery'){if(t>=this.until)this.phase='idle';}
 else if(this.phase==='idle'){
  const distance=Math.hypot(p.x-e.x,p.z-e.z);this.skill=t>=this.howlAt?'howl':distance>3?'charge':'bite';this.phase='windup';this.until=t+(this.skill==='howl'?1.4:this.skill==='charge'?1.1:.85);const n=Math.max(.001,distance);this.direction={x:(p.x-e.x)/n,z:(p.z-e.z)/n};e.heading=Math.atan2(this.direction.x,this.direction.z);
 }
 e.state=this.phase==='charge'?'chasing':'attacking';e.special={skill:this.skill,phase:this.phase,until:this.until,dx:this.direction?.x??0,dz:this.direction?.z??1};
 }
 recover(){this.phase='recovery';this.until=this.w.time+(this.e.frenzy?.7:1.2);}
 snapshot(){return {...this.data,phase:this.phase,frenzy:this.e.frenzy};}
}
