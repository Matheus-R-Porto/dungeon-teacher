import {Character} from '../../src/domain/character/character.js';
import {adoptJobs,gainJob,serafina,confirmBuild} from '../../src/domain/character/job-progress.js';
import {jobRequired} from '../../src/domain/character/professions.js';
import {CLASS_SKILLS,classAbility} from '../../src/domain/abilities/class-skills.js';
import {Inventory,ITEMS} from '../../src/domain/items/inventory.js';
import {validateJobs} from '../../src/domain/character/job-validation.js';
import {defaultAppearance} from '../../src/domain/appearance.js';
import {consumeFood} from '../../src/domain/food-service.js';
export const CLASSES=['warrior','archer','rogue','priest','mage'];
export const PROFILES={new:{base:10,job:5,gear:false},intermediate:{base:15,job:15,gear:true},prepared:{base:20,job:25,gear:true},exceptional:{base:45,job:50,gear:true}};
const priorities={warrior:['breakingStrike','weaponMastery','ironSkin','ironVitality','unshakableStance','taunt','battleRhythm','combatBreath','secondWind'],archer:['piercingShot','eagleEyes','focusedShot','lightSteps','tacticalRetreat','hunterReflexes','agileShot','slowingArrow','distanceMastery','arrowRain'],rogue:['concealment','surpriseAttack','quickLunge','keenReflexes','daggerSequence','poisonBlade','weaknessKnowledge','treacherousBlow'],priest:['heal','purifyingTouch','courageBlessing','divineProtection','punishingLight','sacredKnowledge','condemnationSeal','conviction','sacredExpansion','renewal'],mage:['magicProjectile','elementalMastery','fireball','iceLance','iceField','arcaneBarrier','acceleratedCasting','arcaneReserve','arcaneMeditation','arcaneOverload']};
const bars={warrior:['taunt','secondWind','aggressiveStance','counterAttack','breakingStrike'],archer:['arrowRain','focusedShot','slowingArrow','piercingShot','agileShot'],rogue:['poisonBlade','daggerSequence','treacherousBlow','quickLunge','bladeDance'],priest:['heal','renewal','divineProtection','courageBlessing','sanctuary','condemnationSeal','punishingLight'],mage:['arcaneBarrier','iceField','fireball','chainLightning','iceLance','magicProjectile']};
export function profile(cls,kind='prepared',now=Date.now()){
 const spec=PROFILES[kind],c=new Character();adoptJobs(c.data);while(c.data.level<spec.base)c.gainXP(c.nextLevelXP,{jobAmount:0});while(c.data.jobs.origins.novice.level<20)c.gainXP(10*jobRequired(c.data.jobs.origins.novice.level));c.data.gold=100;serafina(c.data,{service:'promote',classId:cls},{nearSerafina:true,inCombat:false,dead:false,reached:3});while(c.data.jobs.origins[cls].level<spec.job)c.gainXP(10*jobRequired(c.data.jobs.origins[cls].level));
 const weights=cls==='warrior'?{str:4,vit:4,dex:1,agi:1}:cls==='rogue'?{str:4,agi:3,vit:2,dex:1}:cls==='archer'?{str:3,dex:3,agi:2,vit:2}:{int:6,vit:3,dex:1},points=c.data.attributePoints,draft={};let used=0;for(const [key,w]of Object.entries(weights)){draft[key]=Math.floor(points*w/10);used+=draft[key];}draft.vit+=(points-used);c.allocate(draft,{safeHub:true});
 const order=[...priorities[cls],...Object.values(CLASS_SKILLS).filter(s=>s.classId===cls).map(s=>s.id)];let remaining=c.data.jobs.origins[cls].earned;if(cls==='warrior'&&spec.job>=25){const spent={breakingStrike:3,weaponMastery:3,aggressiveStance:1,ironSkin:3,ironVitality:2,unshakableStance:2,taunt:1,battleRhythm:2,combatBreath:2,secondWind:2,counterAttack:1,finalDetermination:1,growingMomentum:1};confirmBuild(c.data,{revision:c.data.jobs.revision,investments:{warrior:spent}});remaining-=24;}for(let round=1;round<=5&&remaining;round++)for(const id of [...new Set(order)]){if(!remaining)break;const j=c.data.jobs,spent={...j.origins[cls].spent},next=(spent[id]??0)+1;if(next>round)continue;spent[id]=next;try{confirmBuild(c.data,{revision:j.revision,investments:{[cls]:spent}});remaining--;}catch{}}
 const mastery=c.data.jobs.origins[cls].spent.elementalMastery??0;if(mastery)c.data.jobs.elements={fire:Math.ceil(mastery/2),ice:Math.floor(mastery/2),lightning:0};
 c.data.hotbar=bars[cls].filter(id=>c.data.knownAbilities.includes(id)).slice(0,8);while(c.data.hotbar.length<8)c.data.hotbar.push(null);c.data.appearance=defaultAppearance();
 const bag=new Inventory(c),weapon={warrior:'trainingSword',archer:'trainingBow',rogue:'pairedDaggers',priest:'trainingStaff',mage:'trainingStaff'}[cls];bag.acquire(weapon);bag.equip(0);if(cls==='archer')for(let i=0;i<500;i++)bag.acquire('arrows');if(spec.gear)for(const id of ['travelerVest','travelerBoots',cls==='mage'||cls==='priest'?'apprenticeHood':'travelerCap',cls==='mage'||cls==='priest'?'focusRing':'strengthRing',...(cls==='warrior'?['woodenShield']:[]),...(['mage','priest'].includes(cls)?['unwaveringCharm']:[])]){bag.acquire(id);bag.equip(c.data.inventory.slots.findIndex(i=>i?.definitionId===id),ITEMS[id].equipSlot);}
 if(spec.gear){bag.acquire('limiarStew');consumeFood(c,bag,c.data.inventory.slots.find(i=>i?.definitionId==='limiarStew').instanceId,now);}
 c.recalculate(now);c.restoreHP();c.restoreMP();validateJobs(c.data);return c;
}
export function actionFor(p,w,target,{dodge=true,turn=0}={}){
 if(!p.character.isAlive||!target?.alive)return null;const pos=p.game.player,d=Math.hypot(target.x-pos.x,target.z-pos.z),r=p.abilities,sp=target.special;
 if(dodge&&sp?.phase==='windup'&&sp.skill!=='howl'&&sp.skill!=='intro'&&sp.skill!=='last-oath'){
  const dx=pos.x-target.x,dz=pos.z-target.z,projection=dx*(sp.dx??0)+dz*(sp.dz??1),side=Math.abs(dx*(sp.dz??1)-dz*(sp.dx??0));const danger=sp.skill==='rupture'?d<7:sp.skill==='bite'?d<2.7:projection>-.5&&projection<(sp.range??10)&&side<(sp.width??2)+.6;
  if(danger){const n=Math.max(.01,d);return {kind:'move',x:sp.skill==='rupture'?dx/n:-(sp.dz??1),z:sp.skill==='rupture'?dz/n:(sp.dx??0)};}
 }
 if(p.axis?.x||p.axis?.z)return {kind:'move',x:0,z:0};if(r?.active||r?.pending)return null;
 const allies=[...w.players.values()].filter(q=>q.ws&&q.character.isAlive&&Math.hypot(q.game.player.x-pos.x,q.game.player.z-pos.z)<7).sort((a,b)=>a.character.data.hp/a.character.stats.maxHP-b.character.data.hp/b.character.stats.maxHP);
 for(const [index,id]of p.character.data.hotbar.entries()){const a=classAbility(p.character.data,id);if(!a||r?.remaining(id)>.01||p.character.data.mp<a.manaCost)continue;const aim={x:target.x,z:target.z};if(['heal','allyBuff'].includes(a.mechanic)){const q=allies[0]??p;if(a.mechanic==='heal'&&q.character.data.hp/q.character.stats.maxHP>.75)continue;if(a.mechanic==='allyBuff'&&q.abilities?.classEngine?.buffs[id])continue;aim.ally=q.id;}else if(a.mechanic==='buff'){if(r?.classEngine?.buffs[id])continue;}else if(a.mechanic==='taunt'){if(d>3||target.classTaunt?.end>w.time)continue;}else if(a.range&&d>a.range-.1)continue;
  if(a.requiresTarget&&p.target?.id!==target.id)return {kind:'attack',target:target.id,generation:target.generation};return {kind:'ability',slot:index+1,aim};
 }
 if(p.target?.id!==target.id)return {kind:'attack',target:target.id,generation:target.generation};return null;
}
