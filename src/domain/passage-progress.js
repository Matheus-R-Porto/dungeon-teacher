import {EXPEDITION} from './expedition.js';

// Retain floors 1/2 kill counts. On floor 3 the knight replaces the old local
// slime encounter; preserve the online guardian-only gate, with no extra grind.
// The guardian requirement remains independently authoritative in each mode.
export const PASSAGES=Object.freeze({1:{level:1,kills:EXPEDITION.counts[0]},2:{level:1,kills:EXPEDITION.counts[1]},3:{level:1,kills:0,guardian:true}});
export function passageStatus(data,floor,{legacyReached=0,guardian=false}={}){
 const rule=PASSAGES[floor];if(!rule)return {open:true,missing:[]};
 const inherited=data.tower.highestClearedFloor>=floor||legacyReached>floor;
 const kills=data.tower.kills?.[floor]??0,missing=[];
 if(!inherited){if(data.level<rule.level)missing.push('nível '+rule.level);if(kills<rule.kills)missing.push((rule.kills-kills)+' derrotas neste andar ('+kills+'/'+rule.kills+')');}
 if(rule.guardian&&!guardian&&!inherited)missing.push('vencer o Cavaleiro do Último Juramento');
 return {open:missing.length===0,missing};
}
export function creditPassageKill(data,floor){if(!PASSAGES[floor])return;data.tower.kills??={};data.tower.kills[floor]=Math.min(1000000,(data.tower.kills[floor]??0)+1);}
