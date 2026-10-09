export const LIFE_SKILLS = Object.freeze({fishing:{id:'fishing',name:'Pesca',active:true},cooking:{id:'cooking',name:'Culinária',active:true},mining:{id:'mining',name:'Mineração',active:true},smithing:{id:'smithing',name:'Ferraria',active:false}});
export const LIFE_BALANCE = Object.freeze({baseXP:30,stepXP:20,maxLevel:50,maxGain:100000});
export const lifeXPRequired = level => LIFE_BALANCE.baseXP+(level-1)*LIFE_BALANCE.stepXP;
export const emptyLifeSkills = () => ({fishing:{level:1,xp:0},cooking:{level:1,xp:0},mining:{level:1,xp:0}});
export function gainLifeXP(data,id,amount){
  if(!LIFE_SKILLS[id]?.active||!Number.isSafeInteger(amount)||amount<0||amount>LIFE_BALANCE.maxGain)throw Error('XP de profissão inválido.');
  const p=data.lifeSkills[id];p.xp+=amount;let levels=0;
  while(p.level<LIFE_BALANCE.maxLevel&&p.xp>=lifeXPRequired(p.level)){p.xp-=lifeXPRequired(p.level);p.level++;levels++;}
  if(p.level===LIFE_BALANCE.maxLevel)p.xp=Math.min(p.xp,lifeXPRequired(p.level)-1);
  return levels;
}
export function decodeLifeSkills(source){
 if(source===undefined)return emptyLifeSkills();
 if(!source||typeof source!=='object'||Array.isArray(source)||Object.keys(source).some(id=>!Object.hasOwn(LIFE_SKILLS,id)||!LIFE_SKILLS[id].active))throw Error('Profissões inválidas no save.');
 const result=emptyLifeSkills();for(const id of Object.keys(result)){const p=source[id];if(p===undefined&&(id==='cooking'||id==='mining'))continue;if(!p||!Number.isSafeInteger(p.level)||p.level<1||p.level>LIFE_BALANCE.maxLevel||!Number.isSafeInteger(p.xp)||p.xp<0||p.xp>=lifeXPRequired(p.level))throw Error('Progresso de profissão inválido.');result[id]={level:p.level,xp:p.xp};}return result;
}
