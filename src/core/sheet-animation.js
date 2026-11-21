import {CLASS_SKILLS} from '../domain/abilities/class-skills.js';
import {ABILITIES} from '../domain/abilities/definitions.js';
export const SHEET=Object.freeze({version:37,cell:96,columns:9,rows:16,frames:36,directions:4,walkFrames:4,strideLength:1.8});
const mechanics={strike:'physical',lunge:'physical',sequence:'physical',burst:'area',projectile:'ranged',retreatShot:'ranged',chain:'offensiveCast',dot:'offensiveCast',zone:'area',heal:'heal',allyBuff:'support',buff:'support',cleanse:'support',aura:'support',taunt:'support',teleport:'movement',dash:'movement',shadow:'movement'};
export function skillMotion(id){
 const skill=CLASS_SKILLS[id],a=ABILITIES[id];if(skill?.type==='passive')return 'passive';if(!a)return null;
 if(a.mechanic){if(a.magic&&['projectile','strike','sequence'].includes(a.mechanic))return 'offensiveCast';return mechanics[a.mechanic]??null;}
 if(a.effects.some(e=>e.type==='periodic'))return 'heal';
 if(a.weaponRequirements.includes('bow'))return 'ranged';
 if(a.effects.some(e=>e.damageType==='magic'))return 'offensiveCast';return 'physical';
}
export const SKILL_MOTIONS=Object.freeze(Object.fromEntries([...new Set([...Object.keys(CLASS_SKILLS),...Object.keys(ABILITIES)])].map(id=>[id,skillMotion(id)])));
export function sheetFrame(input,visual,time){
 if(input.hp===0)return input.deathElapsed<.14?13:input.deathElapsed<.32?15:32;
 if(input.impact?.phase==='recoil')return 30;
 if(input.impact?.phase==='impactRecovery')return 31;
 const action=input.action;
 if(action){const motion=skillMotion(action.id),prepare=action.phase==='preparation',recover=action.phase==='recovery';
  if(motion==='physical'||motion==='ranged')return prepare?18:recover?21:action.elapsed>=.06?20:19;
  if(motion==='heal')return prepare?25:recover?24:26;
  if(motion==='support')return prepare?33:recover?24:27;
  if(motion==='area'){const a=ABILITIES[action.id];if(a.weaponRequirements.includes('bow')||!a.magic)return prepare?18:recover?21:19;return prepare?22:28;}
  if(motion==='movement')return 29;
  return prepare?22:recover?24:23;
 }
 if(input.casting)return 22;
 if(input.basicReleaseRemaining>0)return input.basicReleaseRemaining>.06?19:20;
 if(input.phase==='windup')return 18;
 if(['impact','active'].includes(input.phase))return 19;
 if(input.phase==='recovery')return 21;
 // Weak damage can flash without taking over the authorized action pose.
 if(visual.blend>0&&visual.blend<1)return visual.blend<.35?33:visual.blend<.7?34:35;
 const held=visual.blend>=1;
 if(input.cart)return input.moving?3+2*(Math.floor(visual.walkDistance/SHEET.strideLength*SHEET.walkFrames)%SHEET.walkFrames):11;
 if(input.moving)return (held?10:2)+2*(Math.floor(visual.walkDistance/SHEET.strideLength*SHEET.walkFrames)%SHEET.walkFrames);
 return held?1:0;
}
export function sheetCell(frame,direction){const index=direction*SHEET.frames+frame;return {column:index%SHEET.columns,row:Math.floor(index/SHEET.columns)};}
