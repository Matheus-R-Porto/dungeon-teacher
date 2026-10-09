// Smithing prototype: raw ore becomes one weapon whose quality depends on a three-hammer timing minigame.
// Pure data and pure helpers; the item definitions are derived from it in items/inventory.js.

// Hammer minigame. Time is simulation time advanced by update(dt), never wall clock or frame count.
export const SMITHING = Object.freeze({
  heatSeconds:.8,                          // preparation: closing here costs nothing
  sweepSeconds:Object.freeze([1.4,1.2,1.0]), // time the marker needs to cross the bar, per hammer (a hammer left unused is a miss)
  gapSeconds:.4,                           // pause between hammers; input is ignored
  zoneMin:.3,zoneMax:.75,                  // where the target may be centred
  goodHalf:.13,perfectHalf:.05,            // hit windows around the centre
  points:Object.freeze({PRECISE:2,OK:1,MISS:0}),
  goodScore:3,perfectScore:5,              // out of 6: FAILURE below 3, PERFECT from 5
  maxPractice:1e9,
});
export const HAMMERS = SMITHING.sweepSeconds.length;

// Quality changes only the weapon's damage stat, relative to the equivalent weapon sold by the Armorer.
export const QUALITIES = Object.freeze({
  FAILURE:Object.freeze({id:'FAILURE',label:'FALHA',tier:'Inferior',suffix:' — Inferior',damageDelta:-1}),
  GOOD:Object.freeze({id:'GOOD',label:'BOM',tier:'Normal',suffix:'',damageDelta:1}),
  PERFECT:Object.freeze({id:'PERFECT',label:'PERFEITO',tier:'Superior',suffix:' — Superior',damageDelta:2}),
});
export const QUALITY_ORDER = Object.freeze(['FAILURE','GOOD','PERFECT']);

export function gradeHammer(position,center,config=SMITHING){
  const distance=Math.abs(position-center);
  return distance<=config.perfectHalf+1e-9?'PRECISE':distance<=config.goodHalf+1e-9?'OK':'MISS';
}
export function scoreOf(grades,config=SMITHING){return grades.reduce((n,g)=>n+config.points[g],0);}
export function qualityFor(score,config=SMITHING){return score>=config.perfectScore?'PERFECT':score>=config.goodScore?'GOOD':'FAILURE';}

// Recipes are data with stable ids (they key the per-recipe practice record). Materials are a list so that
// bars or components can be listed later; today every recipe asks for raw ore.
const recipe=(id,name,weaponType,baseItemId,outputs,materials,xp)=>Object.freeze({
  id,name,weaponType,baseItemId,
  outputs:Object.freeze(outputs),
  materials:Object.freeze(materials.map(m=>Object.freeze(m))),
  xp:Object.freeze(xp),
});
export const SMITHING_RECIPES = Object.freeze([
  recipe('forged-sword','Espada Forjada','sword','trainingSword',{FAILURE:'forgedSwordFailure',GOOD:'forgedSwordGood',PERFECT:'forgedSwordPerfect'},[{itemId:'rawOre',quantity:3}],{FAILURE:3,GOOD:8,PERFECT:12}),
  recipe('forged-dagger','Adaga Forjada','dagger','trainingDagger',{FAILURE:'forgedDaggerFailure',GOOD:'forgedDaggerGood',PERFECT:'forgedDaggerPerfect'},[{itemId:'rawOre',quantity:2}],{FAILURE:2,GOOD:6,PERFECT:9}),
  recipe('forged-bow','Arco Forjado','bow','trainingBow',{FAILURE:'forgedBowFailure',GOOD:'forgedBowGood',PERFECT:'forgedBowPerfect'},[{itemId:'rawOre',quantity:3}],{FAILURE:3,GOOD:8,PERFECT:12}),
  recipe('forged-staff','Cajado Forjado','staff','trainingStaff',{FAILURE:'forgedStaffFailure',GOOD:'forgedStaffGood',PERFECT:'forgedStaffPerfect'},[{itemId:'rawOre',quantity:3}],{FAILURE:3,GOOD:8,PERFECT:12}),
]);
export const recipeById = id => SMITHING_RECIPES.find(r=>r.id===id)??null;

// Per-recipe practice. Every completed attempt counts, whatever its quality; nothing else does.
export const emptyMastery = () => ({});
export function decodeMastery(raw){
  if(raw===undefined)return emptyMastery();
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Maestria de forja inválida.');
  const result={};
  for(const [id,entry] of Object.entries(raw)){
    if(!recipeById(id))throw Error('Receita desconhecida no save.');
    if(!entry||typeof entry!=='object'||Array.isArray(entry)||!Number.isSafeInteger(entry.attempts)||entry.attempts<0||entry.attempts>SMITHING.maxPractice)throw Error('Prática de receita inválida.');
    result[id]={attempts:entry.attempts};
  }
  return result;
}
export const practiceOf = (data,recipeId) => data.smithingMastery?.[recipeId]?.attempts??0;
