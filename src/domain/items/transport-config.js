// Iteration 29.1 proposals. Personal overload curve is intentionally unchanged.
export const TRANSPORT=Object.freeze({backpackBonusGrams:20000,cartCapacityGrams:100000,cartSlots:16,cartEmptyMultiplier:.95,cartFullMultiplier:.75,dropLimit:256,pickupRadius:2.6});
export const emptyCart=()=>({version:1,capacity:TRANSPORT.cartSlots,slots:Array(TRANSPORT.cartSlots).fill(null)});
export const discardProtected=definition=>!!definition&&(definition.unique||definition.type==='chest'||['backpack','cart'].includes(definition.equipSlot));
