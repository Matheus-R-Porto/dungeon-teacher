import {BASE_CARRY_CAPACITY_GRAMS,CARRY_CURVE,ITEM_WEIGHT_GRAMS} from './carry-config.js';
const cache=new WeakMap();
export const invalidateCarry=data=>cache.delete(data);
export function itemWeightGrams(id){if(!Object.hasOwn(ITEM_WEIGHT_GRAMS,id))throw Error('Peso de item desconhecido.');return ITEM_WEIGHT_GRAMS[id];}
export function stackWeightGrams(item){if(!item)return 0;if(!Number.isSafeInteger(item.quantity)||item.quantity<1)throw Error('Quantidade inválida para peso.');return itemWeightGrams(item.definitionId)*item.quantity;}
export function totalWeightGrams(data){return [...(data.inventory?.slots??[]),...Object.values(data.equipment??{})].reduce((n,item)=>n+stackWeightGrams(item),0);}
export function capacityGrams(bonusGrams=0){if(!Number.isSafeInteger(bonusGrams)||bonusGrams<0)throw Error('Bônus de transporte inválido.');return {baseGrams:BASE_CARRY_CAPACITY_GRAMS,bonusGrams,effectiveGrams:BASE_CARRY_CAPACITY_GRAMS+bonusGrams};}
export function loadPenalty(ratio){
 if(!Number.isFinite(ratio)||ratio<0)throw Error('Taxa de carga inválida.');
 let point=CARRY_CURVE[0],multiplier=point.multiplier;
 for(let i=1;i<CARRY_CURVE.length;i++){const next=CARRY_CURVE[i];if(ratio<next.ratio){const t=(ratio-point.ratio)/(next.ratio-point.ratio);multiplier=point.multiplier+(next.multiplier-point.multiplier)*t;break;}point=next;multiplier=point.multiplier;}
 return {multiplier,state:point.state,label:point.label};
}
export function calculateCarry(data,bonusGrams=0){const capacity=capacityGrams(bonusGrams),totalGrams=totalWeightGrams(data),ratio=totalGrams/capacity.effectiveGrams,penalty=loadPenalty(ratio);return {...capacity,totalGrams,ratio,movementMultiplier:penalty.multiplier,state:penalty.state,label:ratio>1?'Acima da capacidade':penalty.label,overloaded:ratio>1};}
// No redundant save fields. Mutation sites invalidate; movement reads in O(1).
export function carryOf(data){let entry=cache.get(data);if(!entry||entry.inventory!==data.inventory||entry.equipment!==data.equipment){entry={inventory:data.inventory,equipment:data.equipment,value:Object.freeze(calculateCarry(data))};cache.set(data,entry);}return entry.value;}
export const kg=grams=>(grams/1000).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
export const CARRY_LIMIT_MESSAGE='Você não consegue carregar mais peso.';
