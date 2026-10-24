// Provisional Iteration 29 balance, not historical approved values. Integers in grams.
export const BASE_CARRY_CAPACITY_GRAMS=60000;
export const CARRY_CURVE=Object.freeze([
 {ratio:0,multiplier:1,state:'light',label:'Carga leve'},
 {ratio:.4,multiplier:1,state:'medium',label:'Carga intermediária'},
 {ratio:.65,multiplier:.9,state:'heavy',label:'Carga elevada'},
 {ratio:.85,multiplier:.65,state:'near',label:'Próximo ao limite'},
 {ratio:1,multiplier:.35,state:'full',label:'Carga máxima'},
].map(Object.freeze));
const weights={fishingRod:900,simplePickaxe:2800,rawOre:400,limiarMinnow:250,fireflyCarp:600,mossCatfish:900,moonFish:700,runeFish:500,salt:100,flour:500,herbs:50,oil:250,water:1000,roastMinnow:350,limiarStew:900,goldenCarp:800,lunarSoup:1000,runicDish:650,herbCatfish:1100,expeditionChest:3500,travelerCap:450,travelerVest:1800,travelerBoots:1000,focusRing:100,apprenticeHood:350,lightVest:900,agileBoots:700,strengthRing:150,trainingSword:1800,trainingDagger:650,trainingBow:1000,trainingStaff:1400};
for(const type of ['Sword','Dagger','Bow','Staff'])for(const quality of ['Failure','Good','Perfect'])weights['forged'+type+quality]=weights['training'+type];
export const ITEM_WEIGHT_GRAMS=Object.freeze(weights);
