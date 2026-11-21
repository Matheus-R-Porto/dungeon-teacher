import {prerequisiteReason} from '../abilities/class-skills.js';
import {PROFESSIONS,lineage,jobRequired,JOB_RULES,SERAFINA_PRICES,PROMOTIONS} from './professions.js';
import {RANKED_SKILLS} from '../abilities/ranked-skills.js';
import {ABILITIES} from '../abilities/definitions.js';
import {BALANCE} from './balance.js';
import {validateAppearance} from '../appearance.js';
const integer=(v,max=100000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const origin=()=>({level:1,xp:0,earned:0,spent:{}});
export function adoptJobs(data){
 if(data.jobs)return data.jobs;
 const legacy=(data.skillSpaces??0)+(data.knownAbilities??[]).filter(id=>Object.hasOwn(ABILITIES,id)).length;
 data.jobs={version:1,revision:0,active:'novice',unlocked:['novice'],origins:{novice:{...origin(),earned:legacy}},promotionUnlocks:[],education:{},migration:{redistribute:legacy>0,legacyPoints:legacy}};
 data.classId='novice';data.knownAbilities=[];data.hotbar=Array(8).fill(null);data.skillSpaces=legacy;return data.jobs;
}
export function activeOrigins(jobs){return lineage(jobs.active).filter(id=>jobs.unlocked.includes(id));}
export function effectiveRanks(jobs,catalog=RANKED_SKILLS){const ranks={};for(const id of activeOrigins(jobs))for(const [skill,n]of Object.entries(jobs.origins[id]?.spent??{}))if(catalog[skill]&&lineage(id).includes(catalog[skill].classId))ranks[skill]=(ranks[skill]??0)+n;return ranks;}
export const available=(jobs,id)=>(jobs.origins[id]?.earned??0)-Object.values(jobs.origins[id]?.spent??{}).reduce((a,b)=>a+b,0);
export function syncJobs(data,catalog=RANKED_SKILLS){const j=data.jobs;if(!j)return;const ranks=effectiveRanks(j,catalog);data.classId=j.active;data.knownAbilities=Object.keys(ranks).filter(id=>ranks[id]>0&&catalog[id].type==='active');data.skillSpaces=activeOrigins(j).reduce((n,id)=>n+available(j,id),0);data.hotbar=(data.hotbar??Array(8).fill(null)).map(id=>id?.startsWith('item:')||data.knownAbilities.includes(id)?id:null);}
export function normalizeDependencies(jobs,catalog=RANKED_SKILLS){
 // Remove invalid dependent investments, refunding their original budgets. Repeat
 // until stable so chains of dependencies cannot retain an orphaned bonus.
 let changed=true;while(changed){changed=false;const ranks=effectiveRanks(jobs,catalog);for(const id of activeOrigins(jobs)){const p=jobs.origins[id];for(const key of Object.keys(p.spent)){const node=catalog[key];if(!node||!lineage(id).includes(node.classId)||prerequisiteReason(node,ranks[key],jobs,ranks,catalog)){delete p.spent[key];changed=true;}}}}
}
export function confirmBuild(data,{revision,investments,elements},catalog=RANKED_SKILLS){
 const j=data.jobs;if(!j||revision!==j.revision)throw Error('A progressão mudou. Reabra a árvore para conferir seus pontos.');
 if(!investments||typeof investments!=='object'||Array.isArray(investments))throw Error('Distribuição inválida.');
 const draft=structuredClone(j),active=activeOrigins(j);
 for(const [id,spent]of Object.entries(investments)){
  if(!active.includes(id)||!spent||typeof spent!=='object'||Array.isArray(spent))throw Error('Origem de pontos indisponível.');
  const p=draft.origins[id];let total=0;
  for(const [key,n]of Object.entries(spent)){const node=catalog[key];if(!node||!integer(n,node.ranks.length)||!lineage(id).includes(node.classId)||!j.unlocked.includes(node.classId))throw Error('Investimento incompatível com a origem.');if(n<(p.spent[key]??0))throw Error('Pontos confirmados exigem reset em Serafina.');total+=n;}
  for(const [key,n]of Object.entries(p.spent))if((spent[key]??0)<n)throw Error('Pontos confirmados exigem reset em Serafina.');
  if(total>p.earned)throw Error('Pontos insuficientes.');p.spent={...spent};
 }
 const ranks=effectiveRanks(draft,catalog);for(const [id,level]of Object.entries(ranks)){const n=catalog[id];if(level>n.ranks.length||prerequisiteReason(n,level,draft,ranks,catalog))throw Error('Nível máximo ou pré-requisitos não atendidos.');}
 if(elements!==undefined){if(!elements||Object.keys(elements).sort().join(',')!=='fire,ice,lightning'||Object.values(elements).some(n=>!integer(n,5))||Object.values(elements).reduce((a,b)=>a+b,0)>(ranks.elementalMastery??0))throw Error('Distribuição elemental inválida.');for(const key of Object.keys(elements))if(elements[key]<(j.elements?.[key]??0))throw Error('Pontos elementais confirmados exigem reset.');draft.elements={...elements};}
 draft.revision++;draft.migration.redistribute=false;data.jobs=draft;syncJobs(data,catalog);return ranks;
}
export function gainJob(data,amount){if(!data.jobs)return 0;if(!integer(amount,1000000))throw Error('Job XP inválida.');const j=data.jobs,p=j.origins[j.active],cap=PROFESSIONS[j.active].maxJob;if(p.level===cap)return 0;p.xp+=amount;let levels=0;while(p.level<cap&&p.xp>=jobRequired(p.level)){p.xp-=jobRequired(p.level);p.level++;p.earned++;levels++;}if(p.level===cap)p.xp=0;if(levels)j.revision++;syncJobs(data);return levels;}
export function jobBonuses(data){const stats={};if(data.jobs)for(const [id,n]of Object.entries(effectiveRanks(data.jobs)))for(const [key,value]of Object.entries(RANKED_SKILLS[id].ranks[n-1]?.stats??{}))stats[key]=(stats[key]??0)+value;return {stats};}
export function chosenFirstClass(j){return j.firstClass??lineage(j.active).find(id=>PROFESSIONS[id]?.parent==='novice')??j.unlocked.find(id=>PROFESSIONS[id]?.parent==='novice')??null;}
export function bindFirstClass(data){const j=data.jobs;if(j&&!j.firstClass){const first=chosenFirstClass(j);if(first)j.firstClass=first;}return j?.firstClass??null;}
export function changeProfession(data,target){const j=data.jobs;if(!j?.unlocked.includes(target)||!PROFESSIONS[target])throw Error('Profissão não desbloqueada.');if(j.active===target)throw Error('Esta profissão já está ativa.');if(chosenFirstClass(j)&&target!=='novice'&&!lineage(target).includes(chosenFirstClass(j)))throw Error('A primeira classe escolhida é permanente.');for(const id of activeOrigins(j))if(id!=='novice'&&!lineage(target).includes(id))j.origins[id].spent={};j.active=target;j.origins[target].spent={};if(target==='novice')j.origins.novice.spent={};normalizeDependencies(j);j.revision++;syncJobs(data);}
export function serafina(data,action,context,prices=SERAFINA_PRICES){
 if(!context?.nearSerafina||context.inCombat||context.dead)throw Error('Converse com Serafina fora de combate.');
 const cost=prices[action.service];if(!Number.isSafeInteger(cost)||cost<0||!data.jobs)throw Error('Serviço indisponível.');if(data.gold<cost)throw Error('Ouro insuficiente.');const draft=structuredClone(data),j=draft.jobs;bindFirstClass(draft);
 if(action.service==='skills'){j.elements={fire:0,ice:0,lightning:0};for(const id of activeOrigins(j))j.origins[id].spent={};j.revision++;syncJobs(draft);}
 else if(action.service==='attributes'){for(const key of Object.keys(BALANCE.initialAttributes)){draft.attributePoints+=Math.max(0,draft.attributes[key]-BALANCE.initialAttributes[key]);draft.attributes[key]=BALANCE.initialAttributes[key];}}
 else if(action.service==='regress')changeProfession(draft,'novice');
 else if(action.service==='resume')changeProfession(draft,action.classId);
 else if(action.service==='promote'){
  const target=PROFESSIONS[action.classId],first=j.active==='novice',stage=first?PROMOTIONS.first:PROMOTIONS.second;if(!target||target.parent!==j.active)throw Error('Promoção indisponível.');
  if(first){if(j.firstClass||j.unlocked.some(id=>PROFESSIONS[id]?.parent==='novice'))throw Error('Sua primeira classe já foi escolhida. Use o retorno à profissão.');if(draft.level<10||j.origins.novice.level<20)throw Error('Requer Base 10 e Job de Novato 20.');j.firstClass=action.classId;}
  else if(context.reached<stage.floor||j.origins[j.active].level<PROFESSIONS[j.active].maxJob||!j.promotionUnlocks.includes(action.classId))throw Error('Alcance o andar '+stage.floor+', o Job máximo e o desbloqueio do mestre.');
  if(j.unlocked.includes(action.classId))throw Error('Use o retorno à profissão já desbloqueada.');j.unlocked.push(action.classId);j.origins[action.classId]=origin();changeProfession(draft,action.classId);
 }else if(action.service==='appearance')draft.appearance=validateAppearance(action.appearance);
 else throw Error('Serviço indisponível.');draft.gold-=cost;Object.assign(data,draft);return cost;
}
export function educationReward(data,activityId,definition){
 if(!data.jobs||!definition||!integer(definition.baseXP,1000000)||!integer(definition.jobXP,1000000)||typeof activityId!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(activityId))throw Error('Atividade educacional não configurada.');
 const count=Object.hasOwn(data.jobs.education,activityId)?data.jobs.education[activityId]:0,multiplier=(definition.repeat??JOB_RULES.educationRepeat)[count]??0;if(!Number.isFinite(multiplier)||multiplier<0||multiplier>1)throw Error('Regra de repetição inválida.');data.jobs.education[activityId]=count+1;return {baseXP:Math.floor(definition.baseXP*multiplier),jobXP:Math.floor(definition.jobXP*multiplier)};
}
