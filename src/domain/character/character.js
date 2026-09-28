import {emptyFirstSteps} from '../first-steps.js';
import {emptyInventory,emptyEquipment} from '../items/inventory.js';
import { ATTRIBUTES,BALANCE,CLASS_DEFINITIONS } from './balance.js';
import { calculateStats,clamp,xpRequired } from './stats.js';

export function createCharacter(){const data={id:'local-player',name:'Viajante',classId:'novice',progressionVersion:BALANCE.progressionVersion,skillSpaces:0,gold:0,upgrades:Object.fromEntries(Object.keys(ATTRIBUTES).map(k=>[k,0])),equippedWeaponType:null,inventory:emptyInventory(),equipment:emptyEquipment(),knownAbilities:[],firstSteps:emptyFirstSteps(),level:1,xp:0,attributePoints:0,attributes:{...BALANCE.initialAttributes}};const stats=calculateStats(data);return {...data,hp:stats.maxHP,mp:stats.maxMP};}
export class Character {
  constructor(data=createCharacter()){this.data=structuredClone(data);this.modifiers={equipment:{},buffs:{},other:{}};this.recalculate();}
  recalculate(){this.stats=calculateStats(this.data,this.modifiers);this.data.hp=clamp(this.data.hp,0,this.stats.maxHP);this.data.mp=clamp(this.data.mp,0,this.stats.maxMP);}
  get isAlive(){return this.data.hp>0;}
  get nextLevelXP(){return xpRequired(this.data.level);}
  get className(){return CLASS_DEFINITIONS[this.data.classId].name;}
  snapshot(){return structuredClone(this.data);}
  gainXP(amount){
    if(!Number.isSafeInteger(amount)||amount<0||amount>BALANCE.maxGainXP)throw Error('Quantidade de XP inválida.');
    this.data.xp+=amount;let levels=0;
    while(this.data.level<BALANCE.maxLevel&&this.data.xp>=this.nextLevelXP){this.data.xp-=this.nextLevelXP;this.data.level++;this.data.attributePoints+=BALANCE.pointsPerLevel;this.data.skillSpaces=Math.min(BALANCE.maxPoints,this.data.skillSpaces+BALANCE.skillSpacesPerLevel);levels++;}
    if(this.data.level===BALANCE.maxLevel)this.data.xp=Math.min(this.data.xp,this.nextLevelXP-1);
    this.data.attributePoints=Math.min(BALANCE.maxPoints,this.data.attributePoints);this.recalculate();return levels;
  }
  allocate(draft,context){
    if(!context?.safeHub||context.inCombat)throw Error('Distribuição disponível apenas no Hub seguro.');
    let spent=0;
    for(const [key,amount]of Object.entries(draft)){if(!(Object.hasOwn(ATTRIBUTES,key))||!Number.isSafeInteger(amount)||amount<0||this.data.attributes[key]+amount>BALANCE.maxAttribute)throw Error('Distribuição inválida.');spent+=amount;}
    if(spent>this.data.attributePoints)throw Error('Pontos insuficientes.');
    for(const [key,amount]of Object.entries(draft))this.data.attributes[key]+=amount;
    this.data.attributePoints-=spent;this.recalculate();return spent;
  }
  amount(value){if(!Number.isFinite(value)||value<0)throw Error('Valor de recurso inválido.');return value;}
  damage(amount){this.data.hp=clamp(this.data.hp-this.amount(amount),0,this.stats.maxHP);}
  heal(amount){this.data.hp=clamp(this.data.hp+this.amount(amount),0,this.stats.maxHP);}
  restoreHP(){this.data.hp=this.stats.maxHP;}
  hasMP(amount){return this.data.mp>=this.amount(amount);}
  spendMP(amount){if(!this.hasMP(amount))return false;this.data.mp-=amount;return true;}
  restoreMP(amount=this.stats.maxMP){this.data.mp=clamp(this.data.mp+this.amount(amount),0,this.stats.maxMP);}
  regenerate(dt){if(!Number.isFinite(dt)||dt<0)throw Error('Tempo inválido.');if(!this.isAlive)return false;const hp=this.data.hp,mp=this.data.mp;this.heal(this.stats.hpRegen*dt);this.restoreMP(this.stats.mpRegen*dt);return hp!==this.data.hp||mp!==this.data.mp;}
}
