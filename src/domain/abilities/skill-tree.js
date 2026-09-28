import {BALANCE} from '../character/balance.js';
import {ABILITIES} from './definitions.js';
export const NOVICE_TREE = Object.freeze(Object.keys(ABILITIES).map((abilityId,index)=>({id:abilityId,abilityId,branch:['Guerreiro','Assassino','Arqueiro','Feiticeiro','Sacerdote'][index],requirements:[]})));
export function nodeState(character,node){if(character.data.knownAbilities.includes(node.abilityId))return 'learned';return node.requirements.length?'locked':character.data.skillSpaces>=BALANCE.skillCost?'available':'unlearned';}
export function learnAbility(character,id){const node=NOVICE_TREE.find(n=>n.id===id);if(!node)throw Error('Habilidade inválida.');const state=nodeState(character,node);if(state==='locked')throw Error('Habilidade bloqueada.');if(state==='learned')return false;if(state==='unlearned')throw Error('Você precisa de 1 Espaço de Habilidade.');character.data.skillSpaces-=BALANCE.skillCost;character.data.knownAbilities.push(node.abilityId);return true;}
