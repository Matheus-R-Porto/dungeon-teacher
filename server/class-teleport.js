import {randomUUID} from 'node:crypto';
import {Game} from '../src/simulation/game.js';
import {Character} from '../src/domain/character/character.js';
import {FLOOR_IDS} from '../shared/tower.js';
import {clearSegment} from '../src/world/collision.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function validate(t,p,floor,source){if(!p?.ws||!p.character.isAlive||p.instanceId||t.inCombat(p.id))throw Error('Teleporte exige participantes vivos e fora de combate.');if(p.mapId!==source.mapId||p.game.player.surface!==source.surface||distance(p.game.player,source)>3||!clearSegment(t.world(p.mapId).map,p.game.player,source,.1))throw Error('Permaneça próximo ao sacerdote.');if(!Number.isInteger(floor)||floor<1||floor>FLOOR_IDS.length||floor<=FLOOR_IDS.indexOf(p.mapId)+1||p.reached<floor||Array.isArray(p.character.data.jobs?.visitedFloors)&&!p.character.data.jobs.visitedFloors.includes(floor)||floor>=4&&!t.arenas.unlocked(p.id))throw Error('O destino deve ser superior, já visitado e desbloqueado por todos.');}
export function teleportOffer(t,p,aim,a,preview=false){const source={...p.game.player,mapId:p.mapId},floor=aim.floor;validate(t,p,floor,source);const cost=a.manaCost+(floor-Math.max(0,FLOOR_IDS.indexOf(p.mapId)+1))*a.parameters.mpPerFloor;if(p.character.data.mp<(preview?cost:cost-a.manaCost))throw Error('MP insuficiente para a distância.');if(preview)return;
 t.teleportOffers??=new Map();for(const [id,o]of t.teleportOffers)if(o.caster===p.id)t.teleportOffers.delete(id);
 const passengers=[...t.people.values()].filter(q=>q.id!==p.id&&q.ws&&q.mapId===p.mapId&&distance(q.game.player,source)<=3).map(q=>q.id);
 const offer={id:randomUUID(),caster:p.id,floor,source,passengers,accepted:[],expires:t.now()+15000,cost:cost-a.manaCost};t.teleportOffers.set(offer.id,offer);p.notice='Teleporte preparado. Aguarde os consentimentos e confirme a viagem.';return offer;
}
export function teleportView(t,p){return [...(t.teleportOffers?.values()??[])].filter(o=>o.expires>t.now()&&(o.caster===p.id||o.passengers.includes(p.id))).map(o=>({...o,casterName:t.people.get(o.caster)?.name}));}
export function teleportCommand(t,p,a){const offer=t.teleportOffers?.get(a.offer);if(!offer||offer.expires<=t.now())throw Error('Convite de teleporte expirado.');if(a.kind==='teleport:accept'){if(!offer.passengers.includes(p.id))throw Error('Convite indisponível.');validate(t,p,offer.floor,offer.source);if(!offer.accepted.includes(p.id))offer.accepted.push(p.id);return;}
 if(a.kind==='teleport:decline'){offer.accepted=offer.accepted.filter(id=>id!==p.id);offer.passengers=offer.passengers.filter(id=>id!==p.id);return;}
 if(a.kind!=='teleport:confirm'||offer.caster!==p.id)throw Error('Somente o sacerdote pode confirmar.');
 const caster=t.people.get(offer.caster),roster=[caster,...offer.accepted.map(id=>t.people.get(id))];for(const q of roster)validate(t,q,offer.floor,offer.source);if(!caster.character.hasMP(offer.cost))throw Error('MP insuficiente.');const dest=t.world(FLOOR_IDS[offer.floor-1]);if(dest.players.size+roster.length>t.capacity)throw Error('Destino cheio.');
 const plans=roster.map(q=>{const c=new Character(q.character.snapshot()),game=new Game(dest.map);if(q===caster)c.spendMP(offer.cost);return {q,c,game,state:{character:c.snapshot(),floor:offer.floor,reached:q.reached,position:{mapId:dest.map.id,...game.player}}};});
 t.db.transaction(()=>{for(const plan of plans)t.db.save(plan.q.id,plan.state);});t.teleportOffers.delete(offer.id);
 for(const {q,c,game}of plans){q.abilities?.interrupt('travel');q.character=c;t.arenas.move(q,dest,game);t.checkpoint(q);q.saved=JSON.stringify(t.state(q));t.send?.(q.ws,t.welcome(q));}
}
