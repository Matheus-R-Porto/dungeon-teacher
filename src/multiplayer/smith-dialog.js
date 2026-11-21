import {conversation} from '../domain/dialogue-state.js';
import {ITEMS} from '../domain/items/inventory.js';
import {ARMORER_STOCK,SUPPLY_STOCK} from '../domain/shop.js';
// Brasa's online services. Every choice is confirmed by the server ('shop' progression); this only presents them.
export const SMITH_WEAPONS=Object.freeze(['trainingSword','trainingDagger','trainingBow','trainingStaff','fishingRod']);
export function smithConversation(npc){
 const base=conversation(npc,npc.lines.slice(0,1)),menu='page-menu';
 const weapons=SMITH_WEAPONS.map(id=>({id:'weapon-'+id,label:ITEMS[id].name+' · grátis',action:{kind:'weapon',id},next:menu}));
 const stock=ARMORER_STOCK.map(id=>({id:'buy-'+id,label:ITEMS[id].name+' · '+ITEMS[id].price+' ouro',action:{kind:'buy',id},next:menu}));
 const supplies=SUPPLY_STOCK.map(id=>({id:'supply-'+id,label:ITEMS[id].name+(id==='arrows'?' ×20':'')+' · '+ITEMS[id].price*(id==='arrows'?20:1)+' ouro',action:{kind:'supplies',id},next:menu}));
 base.nodes[base.nodes.length-1].next=menu;
 base.nodes.push({id:menu,text:'Escolha uma arma de treino ou a vara de pesca gratuitas, ou compre ferramentas e transporte. Feche a conversa quando terminar.',choices:[...weapons,...stock,...supplies,{id:'forge',label:'Usar a forja',action:{kind:'forge'},next:menu}]});
 return base;
}
// The effect receives the action object itself; refresh its nonce after a refusal so a retry is a new request.
export function smithEffect(client,notify,openForge=()=>{}){
 return async action=>{if(action.kind==='forge'){openForge();return;}try{await client.progression('shop',{action:action.kind,id:action.id,nonce:action.nonce??0});notify(action.kind==='weapon'?ITEMS[action.id].name+' entregue.':ITEMS[action.id].name+' comprado.');}catch(error){action.nonce=(action.nonce??0)+1;notify(error.message);throw error;}};
}
