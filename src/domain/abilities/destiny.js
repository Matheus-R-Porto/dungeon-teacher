import {NOVICE_TREE,nodeState,learnAbility} from './skill-tree.js';
import {ABILITIES} from './definitions.js';
import {BALANCE,CLASS_DEFINITIONS} from '../character/balance.js';
import {assignHotbar,normalizeHotbar} from './hotbar.js';

// Presentation projection of the existing binary acquisition model. No invented classes/ranks.
export function destinyNodes(data){
 if(data.classId!=='novice')return [];
 return NOVICE_TREE.map(n=>({...n,ability:ABILITIES[n.abilityId],classId:'novice',className:CLASS_DEFINITIONS.novice.name,tier:0,type:'active',level:data.knownAbilities.includes(n.abilityId)?1:0,maxLevel:1,cost:BALANCE.skillCost,state:nodeState({data},n)}));
}
export function editDestiny(data,action){
 if(action.kind==='restore'){if(data.hotbar===undefined)data.hotbar=normalizeHotbar(action.slots,data.knownAbilities);return;}
 if(action.kind==='learn'){const slots=normalizeHotbar(data.hotbar,data.knownAbilities);if(learnAbility({data},action.id))data.hotbar=slots;return;}
 if(action.kind==='assign'){assignHotbar(data,action.slot,action.id);return;}
 if(action.kind==='replace'){
  const next={...data,hotbar:normalizeHotbar(data.hotbar,data.knownAbilities).map(id=>id===action.id?null:id)};
  assignHotbar(next,action.slot,action.id);data.hotbar=next.hotbar;return;
 }
 if(action.kind==='quick'){
  const slots=normalizeHotbar(data.hotbar,data.knownAbilities),empty=quickSlot(slots,action.id);
  if(slots[empty]===action.id)return empty;
  assignHotbar(data,empty,action.id);return empty;
 }
 throw Error('Operação de habilidade inválida.');
}
// One writer for learning and hotbar edits. Failure rolls back only owned fields,
// retaining XP, HP and newly earned points while the save was in flight.
export function localDestiny(character,save,{blocked=()=>false}={}){
 const service={busy:false,async perform(action){
  if(service.busy||blocked())throw Error('Aguarde a operação atual.');
  service.busy=true;const data=character.data,before={knownAbilities:[...data.knownAbilities],hotbar:data.hotbar?.slice(),skillSpaces:data.skillSpaces};let spent=0;
  try{const result=editDestiny(data,action);spent=before.skillSpaces-data.skillSpaces;await save();return result;}
  catch(error){data.knownAbilities=before.knownAbilities;if(before.hotbar)data.hotbar=before.hotbar;else delete data.hotbar;data.skillSpaces+=spent;throw error;}
  finally{service.busy=false;}
 }};return service;
}

export function quickSlot(slots,id){const existing=slots.indexOf(id);if(existing>=0)return existing;const empty=slots.indexOf(null);if(empty<0)throw Error('As oito posições estão ocupadas. Arraste para substituir uma delas.');return empty;}
