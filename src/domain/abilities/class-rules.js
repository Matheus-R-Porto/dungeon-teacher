import {classAbility,classValue} from './class-skills.js';
import {ABILITIES} from './definitions.js';
export function resolvedAbility(data,id,buffs={}){
 const base=classAbility(data,id)??ABILITIES[id];if(!base)return null;
 const a=structuredClone(base);if(data.jobs&&a.weaponRequirements.includes('bow')&&!a.ammo)a.ammo=a.effects.filter(e=>e.type==='projectile').length;const v=key=>classValue(data,key),cost=1-(v('enduringResistance').costReduction??0),cast=(1-(v('acceleratedCasting').castReduction??0))*(buffs.arcaneBarrier?.barrier>0?1-(v('defensiveConcentration').barrierCast??0):1);
 a.manaCost=Number((a.manaCost*cost*(1+(buffs.arcaneOverload?.costIncrease??0))).toFixed(2));
 a.castTime=a.castTime?Math.max(.08,a.castTime*cast):0;
 a.cooldown*=1-Math.min(.4,Math.max(0,data.cooldownReduction??0));
 if(a.weaponRequirements.includes('bow'))a.range+=v('distanceMastery').bowRange??0;
 return a;
}
export function elementalAllocation(data){const n=classValue(data,'elementalMastery').elementPoints??0,stored=data.jobs?.elements??{fire:0,ice:0,lightning:0};return Object.values(stored).reduce((a,b)=>a+b,0)<=n?stored:{fire:0,ice:0,lightning:0};}
