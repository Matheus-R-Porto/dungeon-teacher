import {Inventory,ITEMS} from './inventory.js';
import {carryOf,cartCarry,invalidateCarry,itemWeightGrams} from './carry.js';
import {emptyCart,TRANSPORT} from './transport-config.js';

export function quantity(value,max){if(!Number.isSafeInteger(value)||value<1||value>max)throw Error('Quantidade indisponível.');return value;}
export function transfer(character,instanceId,amount,toCart){
 const data=structuredClone(character.data);data.cartStorage??=emptyCart();
 if(!cartCarry(data).equipped)throw Error('Equipe um carrinho primeiro.');
 const source=toCart?data.inventory:data.cartStorage,destination=toCart?data.cartStorage:data.inventory;
 const index=source.slots.findIndex(i=>i?.instanceId===instanceId),item=source.slots[index];if(!item)throw Error('Item indisponível.');quantity(amount,item.quantity);
 const load=toCart?cartCarry(data):carryOf(data);if(load.totalGrams+itemWeightGrams(item.definitionId)*amount>load.effectiveGrams)throw Error('Capacidade de peso insuficiente no destino.');
 const def=ITEMS[item.definitionId];let remaining=amount;
 if(def.stackable)for(const stack of destination.slots){if(stack?.definitionId===item.definitionId){const n=Math.min(remaining,def.maxStack-stack.quantity);stack.quantity+=n;remaining-=n;if(!remaining)break;}}
 while(remaining){const slot=destination.slots.indexOf(null);if(slot<0)throw Error('Não há espaços suficientes no destino.');const n=Math.min(remaining,def.maxStack);if(!Number.isSafeInteger(data.inventory.nextId)||data.inventory.nextId>=Number.MAX_SAFE_INTEGER)throw Error('Limite de identificadores de itens.');destination.slots[slot]={...item,quantity:n,instanceId:'item-'+data.inventory.nextId++};remaining-=n;}
 item.quantity-=amount;if(!item.quantity)source.slots[index]=null;
 character.data.inventory=data.inventory;character.data.cartStorage=data.cartStorage;invalidateCarry(character.data);
 return 'Transferência concluída.';
}
// Grant an entire stack or nothing. Metadata such as chest seed survives round trips.
export function acquireStack(character,item,amount){
 quantity(amount,ITEMS[item.definitionId]?.maxStack??0);const draft={data:structuredClone(character.data)},bag=new Inventory(draft);
 for(let n=0;n<amount;n++)bag.acquire(item.definitionId,item);
 character.data.inventory=draft.data.inventory;invalidateCarry(character.data);
}
