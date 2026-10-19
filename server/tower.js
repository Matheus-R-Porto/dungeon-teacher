import {randomUUID} from 'node:crypto';
import {expandOpenTower} from '../src/world/open-tower.js';
import {SharedWorld} from './world.js';
import {FloorStore,applyTowerAccess,geographyHash} from './floor-store.js';
import {FLOOR_IDS,towerMessage} from '../shared/tower.js';
import {InteractionSystem} from '../src/simulation/interaction.js';
import {AttackCycle} from '../src/domain/combat/attack.js';
import {Game} from '../src/simulation/game.js';
import {canStand} from '../src/world/collision.js';
export class SharedTower {
 constructor({directory,seed,worldOptions={},capacity=16}){this.store=new FloorStore(directory,{seed});this.worldOptions=worldOptions;this.capacity=capacity;this.worlds=new Map();this.records=new Map();}
 world(id){if(!FLOOR_IDS.includes(id))throw Error('Andar indisponível.');if(!this.worlds.has(id)){const record=this.store.load(FLOOR_IDS.indexOf(id)+1);this.records.set(id,record);this.worlds.set(id,new SharedWorld({...this.worldOptions,map:expandOpenTower(applyTowerAccess(record.definition))}));}return this.worlds.get(id);}
 find(token){for(const w of this.worlds.values()){const p=w.tokens.get(token);if(p&&p.expires>w.time)return {w,p};}return null;}
 join(ws,name,token){const existing=token&&this.find(token),w=existing?.w??this.world(FLOOR_IDS[0]);if(w.players.size>=this.capacity&&!existing?.p.ws)throw Error('Andar cheio.');if([...this.worlds.values()].reduce((n,w)=>n+w.tokens.size,0)>=256&&!existing)throw Error('Aguarde antes de criar uma sessão.');
  const p=w.join(ws,name,token);p.mapId=w.map.id;p.epoch=randomUUID();ws.worldPlayer=p;ws.towerSession=true;return this.welcome(p);
 }
 welcome(p){return towerMessage('world:welcome',{id:p.id,token:p.token,epoch:p.epoch,map:this.world(p.mapId).map,geography:{hash:geographyHash(this.world(p.mapId).map),storedHash:this.records.get(p.mapId).hash,accessPolicy:2,generatorVersion:this.records.get(p.mapId).generatorVersion,seed:this.records.get(p.mapId).seed}});}
 leave(ws){const p=ws.worldPlayer;if(p)this.worlds.get(p.mapId)?.leave(ws);}
 command(ws,m){const p=ws.worldPlayer;if(!p||p.ws!==ws||!ws.towerSession)throw Error('Sessão inativa.');
  const old=this.worlds.get(p.mapId);if(m.mapId!==p.mapId||m.epoch!==p.epoch||m.seq<=p.seq)return null;
  if(m.action.kind!=='travel'){old.command(ws,m);return null;}
  p.seq=m.seq;if(!p.character.isAlive)return towerMessage('world:notice',{message:'Aguarde o retorno do personagem.'});
  const interaction=new InteractionSystem(old.map,old.map.interactables).activate(p.game.player);
  if(!interaction||interaction.targetId!==m.action.portal)return towerMessage('world:notice',{message:'Aproxime-se do portal para viajar.'});
  // Prepare/validate/persist destination before changing any membership or combat state.
  if(interaction.content.unavailable)return towerMessage('world:notice',{message:'Andar 13 indisponível nesta versão. Você pode retornar pelo portal de entrada.'});
  const destination=FLOOR_IDS.indexOf(interaction.content.areaId)+1;if(Math.abs(destination-old.map.floorId)!==1)throw Error('Destino de portal inválido.');
  const dest=this.world(interaction.content.areaId);if(dest.players.size>=this.capacity)return towerMessage('world:notice',{message:'Andar cheio. Tente novamente.'});
  let spawn=dest.map.spawn;
  if(dest.map.floorId<old.map.floorId){const near={x:dest.map.portal.x,z:dest.map.portal.z+2};if(canStand(dest.map,near.x,near.z,.32))spawn=near;}
  const game=new Game({...dest.map,spawn});game.world=dest.map;
  old.leave(ws);old.tokens.delete(p.token);p.game=game;p.cycle=new AttackCycle();p.deathAt=null;p.mapId=dest.map.id;p.epoch=randomUUID();p.seq=0;p.target=null;p.axis={x:0,z:0};p.ws=ws;p.expires=Infinity;p.inputAt=dest.time;
  dest.players.set(p.id,p);dest.tokens.set(p.token,p);return this.welcome(p);
 }
 step(){for(const w of this.worlds.values()){if(w.players.size||w.tokens.size)w.step();}}
 snapshot(p){return {...this.worlds.get(p.mapId).snapshot(),v:3,epoch:p.epoch};}
}
