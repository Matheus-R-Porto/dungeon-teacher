import {CLASS_SKILLS} from './class-skills.js';
import {ABILITIES} from './definitions.js';
// Rank one of the five approved active abilities is unchanged. Further active
// ranks await authored definitions; passive ranks below are provisional balance.
const passive=(id,name,stat,values)=>({id,name,classId:'novice',type:'passive',jobLevel:1,requires:[],ranks:values.map(value=>({stats:{[stat]:value}}))});
export const RANKED_SKILLS=Object.freeze({
 ...CLASS_SKILLS,
 ...Object.fromEntries(Object.values(ABILITIES).filter(a=>!CLASS_SKILLS[a.id]).map(a=>[a.id,{id:a.id,name:a.name,classId:'novice',type:'active',jobLevel:1,requires:[],ranks:[a]}])),
 physicalTraining:passive('physicalTraining','Dano físico','physicalAttack',[1,2,3,4,5]),
 attackSpeed:passive('attackSpeed','Velocidade de ataque','attackSpeed',[.02,.04,.06]),
 hpRecovery:passive('hpRecovery','Regeneração de HP','hpRegen',[.1,.2,.3,.4,.5]),
 mpRecovery:passive('mpRecovery','Regeneração de MP','mpRegen',[.1,.2,.3,.4]),
 magicTraining:passive('magicTraining','Dano mágico','magicAttack',[1,2,3,4,5])
});
export function skillEffect(id,level,catalog=RANKED_SKILLS){return level>0?catalog[id]?.ranks[level-1]??null:null;}
