// Provisional values are centralized; milestones and existing map IDs are independent.
export const PROFESSIONS=Object.freeze({novice:{id:'novice',name:'Novato',parent:null,maxJob:20},warrior:{id:'warrior',name:'Guerreiro',parent:'novice',maxJob:50},archer:{id:'archer',name:'Arqueiro',parent:'novice',maxJob:50},rogue:{id:'rogue',name:'Ladino',parent:'novice',maxJob:50},priest:{id:'priest',name:'Sacerdote',parent:'novice',maxJob:50},mage:{id:'mage',name:'Mago',parent:'novice',maxJob:50}});
export const PROMOTIONS=Object.freeze({first:{baseLevel:10,jobLevel:20,from:'novice',requiresUnlock:false},second:{floor:36,requiresUnlock:true,slotsPerClass:2}});
export const JOB_RULES=Object.freeze({xpBase:50,xpStep:25,combatRatio:.1,educationRepeat:[1,.2,0]});
export const SERAFINA_PRICES=Object.freeze({skills:100,attributes:100,regress:50,resume:50,promote:100,appearance:25});
export const lineage=id=>{const result=[];for(let n=PROFESSIONS[id];n;n=PROFESSIONS[n.parent])result.unshift(n.id);return result;};
export const jobRequired=level=>JOB_RULES.xpBase+(level-1)*JOB_RULES.xpStep;
