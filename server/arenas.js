import {randomUUID} from 'node:crypto';
import {GUARDIAN as G} from '../shared/guardian.js';
import {guardianArena} from '../src/world/guardian-arena.js';
import {Game} from '../src/simulation/game.js';
import {AttackCycle} from '../src/domain/combat/attack.js';
import {Character} from '../src/domain/character/character.js';
import {SharedWorld} from './world.js';
import {OathKnight} from './oath-knight.js';
import {geographyHash} from './floor-store.js';
const transitions={preparing:['combat','defeat'],combat:['victory','defeat'],victory:['closing'],defeat:['closing'],closing:['cleaned']};
export class Arenas {
 constructor(tower,{definition=G,mapFactory=guardianArena,controllerFactory=w=>new OathKnight(w)}={}){this.definition=definition;this.origin='shared-floor-'+definition.floor;this.mapFactory=mapFactory;this.controllerFactory=controllerFactory;this.t=tower;this.pending=new Map();this.instances=new Map();this.metrics={created:0,cleaned:0,createMs:0,cleanupMs:0};tower.db.db.exec('CREATE TABLE IF NOT EXISTS guardian_unlocks(character TEXT NOT NULL, encounter TEXT NOT NULL, result TEXT NOT NULL, PRIMARY KEY(character,encounter)); CREATE TABLE IF NOT EXISTS arena_results(id TEXT PRIMARY KEY, encounter TEXT NOT NULL, roster TEXT NOT NULL, outcome TEXT NOT NULL, at INTEGER NOT NULL);');}
 unlocked(id){return !!this.t.db.db.prepare('SELECT 1 FROM guardian_unlocks WHERE character=? AND encounter=?').get(id,this.definition.id);}
 near(p){const w=this.t.worlds.get(p?.mapId),d=w?.map.interactables.find(i=>i.action==='guardian'&&i.content?.encounter===this.definition.id);return !!p?.ws&&p.character.isAlive&&!p.instanceId&&p.mapId===this.origin&&!!d&&p.game.player.surface===d.surface&&Math.hypot(p.game.player.x-d.x,p.game.player.z-d.z)<=this.definition.entryRadius;}
 roster(p){const g=this.t.parties.party(p.id);return {party:g?.id??null,ids:g?[...g.members]:[p.id]};}
 valid(r){if(this.t.now()>=r.expires)return false;const p=this.t.people.get(r.ids[0]);if(!p)return false;const live=this.roster(p);return live.party===r.party&&live.ids.length===r.ids.length&&live.ids.every(id=>r.ids.includes(id))&&r.ids.every(id=>this.near(this.t.people.get(id)));}
 cancel(r,message='Entrada cancelada. Reúna a Party e tente novamente.'){this.pending.delete(r.id);for(const id of r.ids){const p=this.t.people.get(id);if(p)p.notice=message;}}
 command(p,a){
  if(a.kind==='arena:request'){if(!this.near(p))throw Error('Aproxime-se da porta do guardião, na plataforma da fortaleza.');const {party,ids}=this.roster(p);if(ids.length>6||!ids.every(id=>this.near(this.t.people.get(id))))throw Error('Aguarde todos os membros da sua Party se aproximarem para entrar na sala do guardião.');if([...this.pending.values()].some(r=>r.ids.some(id=>ids.includes(id))))throw Error('Já existe uma confirmação de entrada pendente.');const r={id:randomUUID(),encounter:this.definition.id,party,ids,ready:new Set(),expires:this.t.now()+this.definition.readyMs};this.pending.set(r.id,r);return;}
  const r=this.pending.get(a.target);if(!r||!r.ids.includes(p.id))throw Error('Confirmação expirada ou inválida.');if(a.kind==='arena:cancel'){this.cancel(r);return;}if(a.kind!=='arena:ready')throw Error('Ação de arena inválida.');if(!this.valid(r)){this.cancel(r);throw Error('Entrada cancelada: presença ou composição mudou.');}r.ready.add(p.id);if(r.ready.size===r.ids.length){this.create(r);this.pending.delete(r.id);}
 }
 move(p,dest,game){const old=this.t.worlds.get(p.mapId);old?.players.delete(p.id);old?.tokens.delete(p.token);for(const e of old?.enemies??[])if(e.targetId===p.id)old.returnEnemy(e);Object.assign(p,{game,cycle:new AttackCycle(),mapId:dest.map.id,epoch:randomUUID(),seq:0,target:null,axis:{x:0,z:0},deathAt:null,inputAt:dest.time,expires:Infinity});dest.tokens.set(p.token,p);if(p.ws)dest.players.set(p.id,p);}
 create(r){const start=performance.now();if(!this.valid(r))throw Error('Entrada coletiva inválida.');const t=this.t,id='arena-'+randomUUID(),source=t.world(this.origin),map=this.mapFactory(source.map,id),w=new SharedWorld({...t.worldOptions,map});w.holdDead=true;w.guardian=this.controllerFactory(w);w.customEnemyStep=(e,dt)=>{w.guardian.step(dt);return true;};w.returnEnemy=e=>{e.targetId=null;};
  const participants=r.ids.map(id=>t.people.get(id)),games=participants.map((p,i)=>new Game({...map,spawn:{...map.spawn,x:map.spawn.x+(i%3-1)*1.3,z:map.spawn.z+Math.floor(i/3)*1.3}}));games.forEach(g=>g.world=map);
  const instance={id,encounter:r.encounter,origin:source.map.id,arena:'fortress-hall',party:r.party,participants:Object.freeze([...r.ids]),state:'preparing',created:t.now(),w,granted:false};
  t.db.transaction(()=>{for(const p of participants)t.db.save(p.id,{character:p.character.snapshot(),floor:this.definition.floor,reached:Math.max(this.definition.floor,p.reached),position:{mapId:source.map.id,...p.game.player}});});
  t.worlds.set(id,w);t.records.set(id,{hash:geographyHash(map),generatorVersion:'guardian-arena/1',seed:0});this.instances.set(id,instance);
  participants.forEach((p,i)=>{p.arenaReturn={...p.game.player};this.move(p,w,games[i]);p.instanceId=id;p.arenaOrigin=source.map.id;});
  for(const p of participants){t.checkpoint(p);if(p.ws)t.send?.(p.ws,t.welcome(p));}this.metrics.created++;this.metrics.createMs+=performance.now()-start;
 }
 transition(i,state){if(!transitions[i.state]?.includes(state))throw Error('Transição de encontro inválida.');i.state=state;i.changed=this.t.now();}
 result(i,outcome){if(!['combat','preparing'].includes(i.state))return;const t=this.t,plans=[];
  t.db.transaction(()=>{if(t.db.db.prepare('INSERT OR IGNORE INTO arena_results VALUES(?,?,?,?,?)').run(i.id,i.encounter,JSON.stringify(i.participants),outcome,t.now()).changes!==1)return;
   if(outcome==='victory')for(const id of i.participants){const p=t.people.get(id);if(!p)throw Error('Participante original ausente.');const first=t.db.db.prepare('INSERT OR IGNORE INTO guardian_unlocks VALUES(?,?,?)').run(id,i.encounter,i.id).changes===1,c=new Character(p.character.snapshot());if(first)c.gainXP(this.definition.xp);t.db.save(id,t.state(p,c));plans.push({p,c,first});}
  });for(const {p,c,first}of plans){p.character=c;p.saved=JSON.stringify(t.state(p));p.notice=first?`Vitória! Quarto andar desbloqueado · +${this.definition.xp} XP`:'Vitória! Seu acesso ao quarto andar está preservado.';}
  this.transition(i,outcome);i.granted=outcome==='victory';i.w.guardian.state='finished';i.w.guardian.projectiles=[];for(const p of i.w.players.values()){p.target=null;p.axis={x:0,z:0};p.game.cancel();p.cycle=new AttackCycle();if(outcome==='defeat')p.notice='Derrota. Reúna-se novamente para tentar o guardião.';}
 }
 disconnected(p){for(const r of this.pending.values())if(r.ids.includes(p.id))this.cancel(r,'Entrada cancelada: um integrante desconectou.');const i=this.instances.get(p.instanceId);if(!i)return false;p.ws=null;p.offlineUntil=this.t.now()+this.definition.reconnectMs;p.axis={x:0,z:0};p.target=null;p.game.cancel();p.cycle=new AttackCycle();p.expires=Infinity;return true;}
 rejoin(p,ws){const i=this.instances.get(p.instanceId);if(!i)return false;if(p.offlineUntil&&this.t.now()>p.offlineUntil){this.exit(p,i);return false;}p.ws=ws;p.offlineUntil=null;i.w.players.set(p.id,p);return true;}
 exit(p,i){if(p.instanceId!==i.id)return;const dest=this.t.world(i.origin),spawn=p.character.isAlive?p.arenaReturn:dest.map.spawn,game=new Game({...dest.map,spawn});game.world=dest.map;this.move(p,dest,game);delete p.instanceId;delete p.arenaOrigin;delete p.arenaReturn;delete p.offlineUntil;if(!p.ws){dest.players.delete(p.id);p.expires=dest.time+60;}this.t.checkpoint(p);this.t.save(p);if(p.ws)this.t.send?.(p.ws,this.t.welcome(p));}
 cleanup(i){const at=performance.now();this.transition(i,'closing');this.t.db.transaction(()=>{for(const id of i.participants){const p=this.t.people.get(id);if(p)this.exit(p,i);}});i.w.players.clear();i.w.tokens.clear();i.w.guardian.projectiles=[];this.t.worlds.delete(i.id);this.t.records.delete(i.id);this.transition(i,'cleaned');this.instances.delete(i.id);this.metrics.cleaned++;this.metrics.cleanupMs+=performance.now()-at;}
 step(){const t=this.t;for(const r of this.pending.values())if(!this.valid(r))this.cancel(r);
  for(const i of this.instances.values()){
   for(const p of [...i.w.players.values()])if(!p.ws&&p.offlineUntil<=t.now())this.exit(p,i);
   if(i.state==='preparing'&&i.w.time>=this.definition.introSeconds){this.transition(i,'combat');i.w.guardian.state='active';i.w.guardian.e.special=null;}
   if(i.state==='combat'&&!i.w.guardian.e.alive)this.result(i,'victory');
   if(['combat','preparing'].includes(i.state)&&(![...i.w.players.values()].some(p=>p.character.isAlive)||t.now()-i.created>=this.definition.maxMs))this.result(i,'defeat');
   if(['victory','defeat'].includes(i.state)&&t.now()-i.changed>=this.definition.resultSeconds*1000)this.cleanup(i);
  }
 }
 view(p){const r=[...this.pending.values()].find(r=>r.ids.includes(p.id)),i=this.instances.get(p.instanceId);return {unlocked:this.unlocked(p.id),ready:r?{id:r.id,expires:r.expires,confirmed:r.ready.has(p.id),count:r.ready.size,total:r.ids.length}:null,encounter:i?{id:i.id,state:i.state,name:this.definition.name,granted:i.granted,...i.w.guardian.snapshot()}:null};}
}
