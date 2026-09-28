import {BALANCE} from './character/balance.js';
export const EXPEDITION=Object.freeze({counts:[3,4,5],hp:[80,100,120],attack:[9,10,11],xp:[12,15,18],enemyGold:0,bossHP:300,bossAttack:15,bossXP:70,bossDelay:2,chestGold:80,chestGoldVariation:41});
export {seedOf,seeded} from './random.js';
export function earnResources(character,xp,gold=0){for(const n of [xp,gold])if(!Number.isSafeInteger(n)||n<0||n>BALANCE.maxGainXP)throw Error('Recurso inválido.');if(character.data.gold+gold>BALANCE.maxGainXP)throw Error('Limite de ouro atingido.');const levels=character.gainXP(xp);character.data.gold+=gold;return levels;}
