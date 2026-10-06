import {seedOf,seeded} from '../domain/random.js';

export const BIOME_RULES=Object.freeze({minimumPureFloors:3,maximumPureFloors:7,transitionChance:.4});
export const ENVIRONMENTS=Object.freeze({
 FOREST:{name:'Floresta',from:'FOREST',to:'FOREST'},
 CAVE:{name:'Caverna',from:'CAVE',to:'CAVE'},
 FOREST_TO_CAVE:{name:'Floresta → Caverna',from:'FOREST',to:'CAVE'},
 CAVE_TO_FOREST:{name:'Caverna → Floresta',from:'CAVE',to:'FOREST'},
});
export function environmentRecord(type){
 const definition=ENVIRONMENTS[type];if(!definition)throw Error('Ambiente inválido.');
 return {type,...definition,transitionDirection:definition.from===definition.to?null:type};
}
export function advanceBiome(state,type){
 const e=environmentRecord(type),r=BIOME_RULES;
 if(e.from!==state.currentBiome||!Number.isInteger(state.pureFloors)||state.pureFloors<0)throw Error('Transição incompatível.');
 if(e.transitionDirection&&state.pureFloors<r.minimumPureFloors)throw Error('Permanência mínima não atingida.');
 if(!e.transitionDirection&&state.pureFloors>=r.maximumPureFloors)throw Error('Permanência máxima atingida.');
 return {currentBiome:e.to,pureFloors:e.transitionDirection?0:state.pureFloors+1};
}
// An independent stream: changing geometry never changes the tower's biome sequence.
export function biomeSequence(seed,count=50){
 if(!Number.isInteger(count)||count<1||count>10000)throw Error('Quantidade de andares inválida.');
 const random=seeded(seedOf(seed+':biome-sequence:v1')),result=[];
 let state={currentBiome:'FOREST',pureFloors:0};
 for(let floorNumber=1;floorNumber<=count;floorNumber++){
  const transition=state.pureFloors>=BIOME_RULES.minimumPureFloors&&(state.pureFloors>=BIOME_RULES.maximumPureFloors||random()<BIOME_RULES.transitionChance);
  const type=transition?Object.keys(ENVIRONMENTS).find(k=>ENVIRONMENTS[k].from===state.currentBiome&&ENVIRONMENTS[k].to!==state.currentBiome):state.currentBiome;
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
