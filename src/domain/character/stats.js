import {foodStats} from '../food.js';
import {equipmentStats} from '../items/inventory.js';
import { ATTRIBUTES, BALANCE, CLASS_DEFINITIONS } from './balance.js';
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function calculateStats(data, sources = {}, now=Date.now()) {
  const a={...data.attributes}, bonuses={};
  const layers=[equipmentStats(data),foodStats(data,now),CLASS_DEFINITIONS[data.classId]?.modifiers??{},sources.equipment??{},sources.buffs??{},sources.other??{}];
  for(const layer of layers){
    for(const [key,value] of Object.entries(layer.attributes??{})){if(!(Object.hasOwn(ATTRIBUTES,key))||!Number.isFinite(value))throw Error('Modificador de atributo inválido.');a[key]+=value;}
    for(const [key,value] of Object.entries(layer.stats??{})){if(!(Object.hasOwn(BALANCE.base,key))||!Number.isFinite(value))throw Error('Modificador de estatística inválido.');bonuses[key]=(bonuses[key]??0)+value;}
  }
  for(const key of Object.keys(a))a[key]=Math.max(0,a[key]);
  const b=BALANCE.base,c=BALANCE.coefficients,l=data.level-1;
  const stats={maxHP:b.maxHP+a.vit*c.hpVit+l*c.hpLevel,maxMP:b.maxMP+a.int*c.mpInt+l*c.mpLevel,
    physicalAttack:b.physicalAttack+a.str*c.attackStr+a.dex*c.attackDex,magicAttack:b.magicAttack+a.int*c.magicInt,
    physicalDefense:b.physicalDefense+a.vit*c.defenseVit,magicDefense:b.magicDefense+a.int*c.magicDefenseInt,
    attackSpeed:b.attackSpeed*(1+a.agi*c.speedAgi),accuracy:b.accuracy+a.dex*c.accuracyDex,evasion:b.evasion+a.agi*c.evasionAgi,
    criticalChance:b.criticalChance+a.luk*c.criticalLuk,carryCapacity:b.carryCapacity+a.str*c.carryStr,
    hpRegen:b.hpRegen+a.vit*c.regenVit,mpRegen:b.mpRegen+a.int*c.regenInt};
  for(const key of Object.keys(stats)){stats[key]=Math.max(0,stats[key]+(bonuses[key]??0));if(BALANCE.limits[key])stats[key]=clamp(stats[key],...BALANCE.limits[key]);}
  stats.maxHP=Math.max(1,Math.floor(stats.maxHP));stats.maxMP=Math.floor(stats.maxMP);stats.carryCapacity=Math.floor(stats.carryCapacity);
  return stats;
}
export const xpRequired=level=>BALANCE.xpBase+(level-1)*BALANCE.xpPerLevel;
