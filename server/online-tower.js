import {layerWorld,surfaceHeight,containsSurface} from '../src/world/surfaces.js';
import {canStand} from '../src/world/collision.js';
import {CITY_ID,cityMap} from '../shared/city.js';
import {SharedWorld} from './world.js';
import {geographyHash} from './floor-store.js';
import {randomUUID} from 'node:crypto';
import {SharedTower} from './tower.js';
import {OnlineStore} from './online-store.js';
import {Parties} from './parties.js';
import {Character} from '../src/domain/character/character.js';
import {Inventory} from '../src/domain/items/inventory.js';
import {EXPEDITION,POST_THREE,floorScale} from '../src/domain/expedition.js';
import {FLOOR_IDS} from '../shared/tower.js';
import {ONLINE_RULES as R} from '../shared/online.js';
import {clearSegment} from '../src/world/collision.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export class OnlineTower extends SharedTower {
 constructor(options){super(options);this.db=new OnlineStore(options.characterDirectory);this.people=new Map();this.boot=randomUUID();this.now=options.now??(()=>Date.now());this.send=options.send;this.parties=new Parties(id=>this.people.get(id),id=>this.inBossCombat(id),this.now);this.hits=new Map();this.lastChat=new Map();this.failed=false;}
 world(id){if(id===CITY_ID&&!this.worlds.has(id)){const map=cityMap();this.worlds.set(id,new SharedWorld({...this.worldOptions,map}));this.records.set(id,{hash:geographyHash(map),generatorVersion:'city/3',seed:0});}const w=id===CITY_ID?this.worlds.get(id):super.world(id);if(id===FLOOR_IDS[0]&&!w.map.interactables.some(i=>i.id==='city-return'))w.map.interactables.push({id:'city-return',...w.map.spawn,radius:2.6,priority:1,label:'Voltar à Cidade do Limiar',action:'travel',content:{areaId:CITY_ID}});if(!w.onlineHooks){w.onlineHooks=true;const impact=w.impact.bind(w);w.impact=(source,target,stats,defender,apply)=>{const e=w.enemies.find(e=>e.id===target),before=e?.hp;const r=impact(source,target,stats,defender,apply);if(e&&r.hit&&before>e.hp)this.contribution(w,e,source,before-e.hp);return r;};}return w;}
 state(p,character=p.character){return {character:character.snapshot(),floor:Math.max(1,FLOOR_IDS.indexOf(p.mapId)+1),reached:p.reached,...(p.savedPosition?{position:p.savedPosition}:{}),...(p.mapId===CITY_ID?{area:CITY_ID}:{})};}
 save(p){const state=this.state(p),json=JSON.stringify(state);if(json!==p.saved){this.db.save(p.id,state);p.saved=json;}}
 join(ws,name,credential){if(this.failed)throw Error('Persistência indisponível.');const record=this.db.authenticate(credential,name);let p=this.people.get(record.id);if(p){const old=p.ws;if(old&&old!==ws){this.leave(old);old.close(4009,'Sessão substituída.');}const w=this.world(p.mapId);if(w.players.size>=this.capacity&&!w.players.has(p.id))throw Error('Andar cheio.');p.expires=Infinity;w.tokens.set(p.token,p);w.join(ws,p.name,p.token);}
 else{const w=this.world(record.area===CITY_ID?CITY_ID:FLOOR_IDS[record.floor-1]);if(w.players.size>=this.capacity)throw Error('Andar cheio.');p=w.join(ws,record.name,null);w.players.delete(p.id);p.id=record.id;p.name=record.name;p.character=new Character(record.character);p.mapId=w.map.id;p.reached=record.reached;
 const pos=record.position;if(pos?.mapId===w.map.id&&[pos.x,pos.z,pos.y].every(Number.isFinite)){const surf=w.map.surfaces?.find(s=>s.id===pos.surface),valid=pos.surface==='ground'?canStand(layerWorld(w.map,'ground'),pos.x,pos.z,.32):surf&&containsSurface(surf,pos.x,pos.z,.32)&&Math.abs(pos.y-surfaceHeight(surf,pos.z))<.05;if(valid){Object.assign(p.game.player,{x:pos.x,z:pos.z,y:pos.y,surface:pos.surface});p.game.previous={...p.game.player};p.savedPosition=pos;}}
 w.players.set(p.id,p);this.people.set(p.id,p);}
 p.ws=ws;p.epoch=randomUUID();p.seq=0;ws.worldPlayer=p;ws.towerSession=true;ws.onlineSession=true;this.save(p);return this.welcome(p);}
 welcome(p){return {...super.welcome(p),v:4};}
 checkpoint(p){const q=p.game.player;p.savedPosition={mapId:p.mapId,x:q.x,z:q.z,y:q.y??0,surface:q.surface??'ground'};}
 leave(ws){const p=ws.worldPlayer;if(!p||p.ws!==ws)return;try{this.checkpoint(p);this.save(p);}catch{this.failed=true;}super.leave(ws);this.parties.offline(p.id);}
 inBossCombat(id){const p=this.people.get(id),w=p&&this.worlds.get(p.mapId);return !!w?.enemies.some(e=>(e.isBoss||e.isMiniBoss)&&(e.targetId===id||p.target?.id===e.id));}
 inCombat(id){const p=this.people.get(id);if(!p)return false;const w=this.worlds.get(p.mapId);return !!p.target||w.enemies.some(e=>e.targetId===id)||this.now()-(p.lastCombat??-Infinity)<5000;}
 contribution(w,e,id,damage){const p=this.people.get(id);if(!p)return;p.lastCombat=this.now();const key=this.boot+':'+e.id+':'+e.generation;let hit=this.hits.get(key);if(!hit){hit={entries:new Map(),groups:new Map()};this.hits.set(key,hit);}const group=this.parties.party(id),tag=group?.id??id;let entry=hit.entries.get(id);if(!entry){entry={id,tag,party:group?.id??null,damage:0};hit.entries.set(id,entry);if(!hit.groups.has(tag))hit.groups.set(tag,group?[...group.members]:[id]);}entry.damage+=damage;if(!e.alive)this.reward(w,e,key,hit);}
 reward(w,e,key,hit){if(this.db.db.prepare('SELECT id FROM deaths WHERE id=?').get(key))return;const total=[...hit.entries.values()].reduce((n,v)=>n+v.damage,0),plans=[];
 for(const [tag,roster]of hit.groups){const entries=[...hit.entries.values()].filter(v=>v.tag===tag),party=entries[0].party;if(!entries.some(v=>v.damage>=e.stats.maxHP*R.contribution))continue;
 const eligible=roster.map(id=>this.people.get(id)).filter(p=>p?.ws&&p.character.isAlive&&p.mapId===w.map.id&&distance(p.game.player,e)<=R.xpRadius&&(party?this.parties.members.get(p.id)===party:!this.parties.members.has(p.id)));
 if(!eligible.length)continue;eligible.sort((a,b)=>a.id.localeCompare(b.id));const base=Math.round(EXPEDITION.xp[Math.min(w.map.floorId,3)-1]*floorScale(w.map.floorId,POST_THREE.xp));const pool=Math.floor(base*entries.reduce((n,v)=>n+v.damage,0)/total*(party?1+R.bonusPerMember*(eligible.length-1):1));
 eligible.forEach((p,i)=>{const xp=Math.floor(pool/eligible.length)+(i<pool%eligible.length?1:0),c=new Character(p.character.snapshot());c.gainXP(xp);plans.push({p,c,xp,drop:{id:randomUUID(),owner:p.id,mapId:w.map.id,x:e.x,z:e.z,item:R.dropItem,quantity:1,expires:this.now()+R.dropMs}});});}
 this.db.transaction(()=>{this.db.db.prepare('INSERT INTO deaths VALUES(?)').run(key);for(const plan of plans){this.db.save(plan.p.id,this.state(plan.p,plan.c));if(this.db.drops(plan.p.id,this.now()).length<R.maxDrops)this.db.putDrop(plan.drop);}});
 for(const {p,c,xp}of plans){p.character=c;p.saved=JSON.stringify(this.state(p));p.notice=`+${xp} XP · recompensa disponível para coletar`;}this.hits.delete(key);
 }
 command(ws,m){if(this.failed)throw Error('Persistência indisponível.');const p=ws.worldPlayer;if(!p||p.ws!==ws||!ws.onlineSession)throw Error('Sessão inativa.');if(m.mapId!==p.mapId||m.epoch!==p.epoch||m.seq<=p.seq)return null;const a=m.action;
 if(!a.kind.startsWith('party:')&&!['chat','pickup','allocate'].includes(a.kind)){const response=super.command(ws,m);p.reached=Math.max(p.reached,FLOOR_IDS.indexOf(p.mapId)+1);this.save(p);return response?{...response,v:4}:null;}
 p.seq=m.seq;try{
 if(a.kind.startsWith('party:'))this.parties.command(p,a);
 if(a.kind==='chat'){if(this.now()-(this.lastChat.get(p.id)??-Infinity)<R.chatIntervalMs)throw Error('Aguarde antes de enviar outra mensagem.');const group=this.parties.party(p.id);if(a.channel==='party'&&!group)throw Error('Você não está em grupo.');this.lastChat.set(p.id,this.now());const message={v:4,type:'online:chat',channel:a.channel,party:group?.id??null,from:p.id,name:p.name,text:a.text.trim()};for(const q of this.people.values())if(q.ws&&(a.channel==='global'||group.members.includes(q.id)))this.send(q.ws,message);}
 if(a.kind==='pickup'){const d=this.db.drops(p.id,this.now()).find(d=>d.id===a.target),w=this.world(p.mapId);if(!d||d.mapId!==p.mapId||!p.character.isAlive||distance(p.game.player,d)>R.pickupRadius||!clearSegment(w.map,p.game.player,d,.1))throw Error('Recompensa indisponível ou distante.');const c=new Character(p.character.snapshot());new Inventory(c).acquire(d.item);this.db.transaction(()=>{if(this.db.db.prepare('DELETE FROM drops WHERE id=? AND owner=?').run(d.id,p.id).changes!==1)throw Error('Recompensa já coletada.');this.db.save(p.id,this.state(p,c));});p.character=c;p.saved=JSON.stringify(this.state(p));p.notice='Item coletado e salvo.';}
 if(a.kind==='allocate'){const w=this.world(p.mapId);if(distance(p.game.player,w.map.spawn)>2.6||this.inCombat(p.id)||!p.character.isAlive)throw Error('Distribua pontos na entrada do andar, fora de combate.');const c=new Character(p.character.snapshot());c.allocate({[a.attribute]:1},{safeHub:true,inCombat:false});this.db.save(p.id,this.state(p,c));p.character=c;p.saved=JSON.stringify(this.state(p));}
 return null;
 }catch(error){return {v:4,type:'world:notice',message:error.message};}}
 snapshot(p){const s=super.snapshot(p);return {...s,v:4,profile:{knownAbilities:p.character.data.knownAbilities,name:p.name,level:p.character.data.level,xp:p.character.data.xp,nextXP:p.character.nextLevelXP,attributePoints:p.character.data.attributePoints,attributes:p.character.data.attributes,inventory:p.character.data.inventory,reached:p.reached,notice:p.notice??''},social:{...this.parties.view(p.id),players:[...this.people.values()].filter(q=>q.ws).map(q=>({id:q.id,name:q.name,level:q.character.data.level}))},drops:this.db.drops(p.id,this.now()).filter(d=>d.mapId===p.mapId)};}
 step(){if(this.failed)return;try{super.step();for(const p of this.people.values())if(p.ws)this.save(p);for(const [key]of this.hits){const e=[...this.worlds.values()].flatMap(w=>w.enemies).find(e=>key===this.boot+':'+e.id+':'+e.generation);if(!e||e.state==='returning')this.hits.delete(key);}this.parties.expire();if(this.now()-(this.lastCleanup??0)>60000){this.db.db.prepare("DELETE FROM drops WHERE json_extract(data,'$.expires')<=?").run(this.now());this.lastCleanup=this.now();}}catch{this.failed=true;for(const p of this.people.values())p.ws?.close(4011,'Persistência indisponível. Reinicie após verificar o armazenamento.');}}
 close(){try{for(const p of this.people.values())if(p.ws){this.checkpoint(p);this.save(p);}}finally{this.db.close();}}
}
