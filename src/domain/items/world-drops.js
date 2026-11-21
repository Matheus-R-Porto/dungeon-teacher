import {Inventory,ITEMS} from './inventory.js';
import {quantity,acquireStack} from './transport.js';
import {TRANSPORT} from './transport-config.js';
import {invalidateCarry} from './carry.js';
import {canStand,clearSegment} from '../../world/collision.js';
import {layerWorld,surfaceId,sameLevel,surfaceHeight} from '../../world/surfaces.js';

export function dropPositions(world,player,count,existing=[]){
 const result=[],surface=surfaceId(player),map=layerWorld(world,surface);
 for(let ring=0;ring<4&&result.length<count;ring++)for(let i=0;i<16&&result.length<count;i++){
  const angle=(i/16)*Math.PI*2+(ring%2)*Math.PI/16,radius=.65+ring*.45;
  const z=player.z+Math.cos(angle)*radius,plane=world.surfaces?.find(s=>s.id===surface),p={x:player.x+Math.sin(angle)*radius,z,y:plane?surfaceHeight(plane,z):player.y??0,surface};
  if(canStand(map,p.x,p.z,.18)&&clearSegment(world,player,p,.18)&&[...existing,...result].every(d=>!sameLevel(d,p)||Math.hypot(d.x-p.x,d.z-p.z)>.45))result.push(p);
 }
 if(result.length!==count)throw Error('Não há chão livre próximo. Os itens continuam no inventário.');return result;
}
export function prepareDiscard(character,requests,{world,player,mapId,owner=character.data.id,id=()=>crypto.randomUUID(),existing=character.data.worldDrops??[]}){
 if(!Array.isArray(requests)||!requests.length||requests.length>32||existing.filter(d=>d.source==='manual').length+requests.length>TRANSPORT.dropLimit)throw Error('Limite de descartes. Recolha itens antes de descartar mais.');
 const draft={data:structuredClone(character.data)},bag=new Inventory(draft),positions=dropPositions(world,player,requests.length,existing.filter(d=>d.mapId===mapId));
 const drops=requests.map((r,index)=>{const item=draft.data.inventory.slots.find(i=>i?.instanceId===r.instanceId);if(!item)throw Error('Item indisponível para descarte.');quantity(r.quantity,item.quantity);const drop={id:id(),owner,mapId,layout:world.seed??null,item:item.definitionId,quantity:r.quantity,...positions[index],state:'available',source:'manual',expires:null,...(item.rewardSeed!==undefined?{rewardSeed:item.rewardSeed}:{})};bag.removeInstance(item.instanceId,r.quantity);return drop;});
 const ids=new Set(existing.map(d=>d.id));for(const d of drops){if(typeof d.id!=='string'||!d.id||ids.has(d.id))throw Error('Identificador de drop inválido.');ids.add(d.id);}
 return {inventory:draft.data.inventory,drops};
}
export function discard(character,requests,context){const plan=prepareDiscard(character,requests,context);character.data.inventory=plan.inventory;character.data.worldDrops=[...(character.data.worldDrops??[]),...plan.drops];invalidateCarry(character.data);return plan.drops;}
export function pickup(character,id,{world,player,mapId}){const drops=character.data.worldDrops??[],d=drops.find(d=>d.id===id);if(!d||d.state!=='available'||d.mapId!==mapId||(d.layout??null)!==(world.seed??null)||!sameLevel(d,player)||Math.hypot(d.x-player.x,d.z-player.z)>TRANSPORT.pickupRadius||!clearSegment(world,player,d,.18))throw Error('Item distante ou inacessível.');acquireStack(character,{definitionId:d.item,rewardSeed:d.rewardSeed},d.quantity);character.data.worldDrops=drops.filter(i=>i.id!==id);return 'Item recolhido.';}
// Offline expeditions regenerate. Recovery in the refuge prevents abandoned layouts
// from making persisted property inaccessible; it still needs normal ground pickup.
export function recoverDrop(character,id,{world,player,mapId}){if(!world.safe)throw Error('Recupere descartes no Refúgio.');const drops=character.data.worldDrops??[],d=drops.find(d=>d.id===id);if(!d)throw Error('Drop indisponível.');const [p]=dropPositions(world,player,1,drops.filter(i=>i.id!==id&&i.mapId===mapId));character.data.worldDrops=drops.map(i=>i.id===id?{...i,...p,mapId,layout:world.seed??null}:i);}
export function decodeWorldDrops(source){if(source===undefined)return [];if(!Array.isArray(source)||source.length>TRANSPORT.dropLimit)throw Error('Drops inválidos no save.');const ids=new Set();for(const d of source){const def=ITEMS[d?.item];if(!d||typeof d.id!=='string'||!d.id||ids.has(d.id)||!def||typeof d.mapId!=='string'||!d.mapId||typeof d.surface!=='string'||![d.x,d.y,d.z].every(Number.isFinite)||d.state!=='available'||d.source!=='manual'||d.expires!==null)throw Error('Drop inválido no save.');quantity(d.quantity,def.maxStack);if(def.type==='chest'&&(!Number.isSafeInteger(d.rewardSeed)||d.rewardSeed<0||d.rewardSeed>4294967295))throw Error('Seed de drop inválida.');ids.add(d.id);}return structuredClone(source);}
