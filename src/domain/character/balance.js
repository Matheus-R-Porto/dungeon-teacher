export const ATTRIBUTES = Object.freeze({
  str: {label:'STR',name:'Força',description:'Aumenta o ataque físico e a capacidade de carga.'},
  agi: {label:'AGI',name:'Agilidade',description:'Aumenta a velocidade de ataque e a esquiva.'},
  vit: {label:'VIT',name:'Vitalidade',description:'Aumenta HP, defesa física e regeneração de HP.'},
  int: {label:'INT',name:'Inteligência',description:'Aumenta poder mágico, MP, defesa mágica e regeneração de MP.'},
  dex: {label:'DEX',name:'Destreza',description:'Aumenta a precisão e contribui para o ataque físico.'},
  luk: {label:'LUK',name:'Sorte',description:'Aumenta a chance de crítico.'},
});
export const BALANCE = Object.freeze({
  initialAttributes:{str:5,agi:5,vit:5,int:5,dex:5,luk:5},
  progressionVersion:4,skillSpacesPerLevel:1,skillCost:1,pointsPerLevel:5,xpBase:100,xpPerLevel:250,maxLevel:100,maxAttribute:999,maxPoints:100000,
  maxGainXP:1000000,
  base:{maxHP:100,maxMP:40,physicalAttack:5,magicAttack:3,physicalDefense:2,magicDefense:2,attackSpeed:1,accuracy:75,evasion:2,criticalChance:3,carryCapacity:100,hpRegen:0.5,mpRegen:0.4},
  coefficients:{hpVit:12,hpLevel:8,mpInt:8,mpLevel:3,attackStr:2,attackDex:0.5,magicInt:2.5,defenseVit:0.8,magicDefenseInt:0.7,speedAgi:0.015,accuracyDex:0.5,evasionAgi:0.3,criticalLuk:0.2,carryStr:3,regenVit:0.1,regenInt:0.12},
  limits:{attackSpeed:[0.25,4],accuracy:[5,98],evasion:[0,75],criticalChance:[0,25]},
});
export const CLASS_DEFINITIONS = Object.freeze({novice:{id:'novice',name:'Novato',modifiers:{}}});
