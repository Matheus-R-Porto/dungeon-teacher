import {seedOf,seeded} from '../domain/random.js';

// Chance that the NEXT floor starts a transition, indexed by how many pure floors have passed since the run began
// (first transition) or since the last transition (recurring). The index is clamped, so the last entry is a guarantee.
// Index 0 is always 0%: the floor right after a transition is a pure floor of the destination biome.
export const BIOME_RULES=Object.freeze({
 firstTransitionChances:Object.freeze([0,0,.5,.75,1]),
 recurringTransitionChances:Object.freeze([0,.1,.5,.75,1]),
});
export const ENVIRONMENTS=Object.freeze({
 FOREST:{name:'Floresta',from:'FOREST',to:'FOREST'},
 CAVE:{name:'Caverna',from:'CAVE',to:'CAVE'},
 FOREST_TO_CAVE:{name:'Floresta → Caverna',from:'FOREST',to:'CAVE'},
 CAVE_TO_FOREST:{name:'Caverna → Floresta',from:'CAVE',to:'FOREST'},
});
export function environmentRecord(type){
 const definition=Object.hasOwn(ENVIRONMENTS,type)?ENVIRONMENTS[type]:null;if(!definition)throw Error('Ambiente inválido.');
 return {type,...definition,transitionDirection:definition.from===definition.to?null:type};
}
export const initialBiomeState=()=>({currentBiome:'FOREST',pureFloors:0,transitions:0});
// Decision 1 — WHEN: how likely is a transition on the next floor.
export function transitionChance(state){
 const table=state.transitions>0?BIOME_RULES.recurringTransitionChances:BIOME_RULES.firstTransitionChances;
 return table[Math.min(state.pureFloors,table.length-1)];
}
// Decision 2 — WHERE: which transition leaves the current biome. A single candidate today; more biomes only extend this list.
export function transitionTargets(currentBiome){return Object.keys(ENVIRONMENTS).filter(k=>ENVIRONMENTS[k].from===currentBiome&&ENVIRONMENTS[k].to!==currentBiome);}
export function advanceBiome(state,type){
 const e=environmentRecord(type),chance=transitionChance(state);
 if(e.from!==state.currentBiome||!Number.isInteger(state.pureFloors)||state.pureFloors<0||!Number.isInteger(state.transitions)||state.transitions<0)throw Error('Transição incompatível.');
 if(e.transitionDirection&&chance<=0)throw Error('Transição não permitida neste andar.');
 if(!e.transitionDirection&&chance>=1)throw Error('Transição obrigatória neste andar.');
 return {currentBiome:e.to,pureFloors:e.transitionDirection?0:state.pureFloors+1,transitions:state.transitions+(e.transitionDirection?1:0)};
}
// An independent stream: changing geometry never changes the tower's biome sequence. One draw per floor, always.
export function biomeSequence(seed,count=50){
 if(!Number.isInteger(count)||count<1||count>10000)throw Error('Quantidade de andares inválida.');
 const random=seeded(seedOf(seed+':biome-sequence:v2')),result=[];
 let state=initialBiomeState();
 for(let floorNumber=1;floorNumber<=count;floorNumber++){
  const roll=random(),transition=roll<transitionChance(state);
  const type=transition?transitionTargets(state.currentBiome)[0]:state.currentBiome;
  const before={...state};state=advanceBiome(state,type);
  result.push({floorNumber,environment:environmentRecord(type),before,nextBiomeState:{...state}});
 }
 return result;
}
export const environmentFor=(seed,floor)=>biomeSequence(seed,floor).at(-1).environment;
// Main path runs toward negative Z. Optional pockets inherit their longitudinal zone.
export function caveAmount(environment,progress){
 const e=environmentRecord(typeof environment==='string'?environment:environment.type);
 const t=Math.max(0,Math.min(1,(progress-.2)/.6)),blend=t*t*(3-2*t);
 return e.from===e.to?(e.from==='CAVE'?1:0):e.from==='FOREST'?blend:1-blend;
}
export function caveAt(world,z){
 const exit=world.graph.regions.find(r=>r.id===world.graph.exit);
 return caveAmount(world.floorEnvironment??'FOREST',z/exit.z);
}
