import {ABILITIES,INITIAL_HOTBAR} from './definitions.js';
export const HOTBAR_SIZE=8;
export function normalizeHotbar(slots,known){
  const allowed=new Set(known??[]),source=Array.isArray(slots)?slots:INITIAL_HOTBAR,used=new Set();
  return Array.from({length:HOTBAR_SIZE},(_,i)=>{const id=source[i];if(!Object.hasOwn(ABILITIES,id)||!allowed.has(id)||used.has(id))return null;used.add(id);return id;});
}
export function assignHotbar(data,slot,id){
  if(!Number.isInteger(slot)||slot<0||slot>=HOTBAR_SIZE)throw Error('Slot inválido.');
  if(id!==null&&(!Object.hasOwn(ABILITIES,id)||!data.knownAbilities.includes(id)))throw Error('Aprenda a habilidade antes de atribuí-la.');
  const slots=normalizeHotbar(data.hotbar,data.knownAbilities),previous=slots.indexOf(id);
  if(id&&previous>=0&&previous!==slot)slots[previous]=slots[slot];
  slots[slot]=id;data.hotbar=slots;return slots;
}
