import {RANKED_SKILLS} from '../domain/abilities/ranked-skills.js';
import {prerequisiteReason} from '../domain/abilities/class-skills.js';
import {activeOrigins,effectiveRanks,available,confirmBuild} from '../domain/character/job-progress.js';
import {lineage} from '../domain/character/professions.js';
export function skillNodeModel(data,id,origin=data.jobs.active){
 const skill=RANKED_SKILLS[id],jobs=data.jobs,ranks=effectiveRanks(jobs),rank=ranks[id]??0,max=rank===skill.ranks.length,next=Math.min(rank+1,skill.ranks.length);
 const requirement=prerequisiteReason(skill,next,jobs,ranks,RANKED_SKILLS);
 const sourceAllowed=activeOrigins(jobs).includes(origin)&&lineage(origin).includes(skill.classId)&&jobs.unlocked.includes(skill.classId);
 const reason=max?'Nível máximo.':!sourceAllowed?'Esta origem não pode investir nesta habilidade.':requirement|| (available(jobs,origin)<1?'Sem pontos nesta origem.':'');
 return {skill,rank,next,max,reason,requirement,canInvest:!reason,state:max?'max':requirement||!sourceAllowed?'locked':available(jobs,origin)<1?'no-points':rank?'learned':'available',learned:rank>0};
}
export function skillInvestment(data,id,origin=data.jobs.active){
 const state=skillNodeModel(data,id,origin);if(state.reason)throw Error(state.reason);
 const investments=Object.fromEntries(activeOrigins(data.jobs).map(key=>[key,{...data.jobs.origins[key].spent}]));investments[origin][id]=(investments[origin][id]??0)+1;
 const payload={revision:data.jobs.revision,investments};if(data.jobs.elements)payload.elements={...data.jobs.elements};confirmBuild(structuredClone(data),payload);return payload;
}
