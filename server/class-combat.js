import {classValue,classRank} from '../src/domain/abilities/class-skills.js';
import {elementalAllocation} from '../src/domain/abilities/class-rules.js';
import {Inventory,ITEMS,equippedDefinition} from '../src/domain/items/inventory.js';
import {clearSegment,canStand} from '../src/world/collision.js';
import {layerWorld} from '../src/world/surfaces.js';
import {teleportOffer} from './class-teleport.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const key=e=>e.id+':'+e.generation;
const ELEMENTS=['fire','ice','lightning'];
const negative=e=>Object.values(e?.conditions??{}).some(Boolean);
const undead=e=>e.undead===true||e.tags?.includes('undead')||e.enemyType==='skeleton';
export class ClassCombat {
 constructor(tower,p,w,r){Object.assign(this,{tower,p,w,r});this.buffs={};this.zones=[];this.shots=[];this.sequences=[];this.trinity=new Map();this.castId=0;this.hand=0;this.lastHit=-Infinity;this.lastAction=-Infinity;this.stationary=0;this.hitStacks=0;this.combatSeconds=0;this.lastPosition={...p.game.player};this.damageRevision=p.character.damageRevision;this.sequence=0;this.lastClass=this.data.classId;this.miracleAt=this.now+Math.max(0,((this.data.classInternalCooldowns?.faithMiracle??0)-tower.now())/1000);this.emergencyUsed=(this.data.classInternalCooldowns?.unbreakableSpirit??0)>tower.now();this.lastElement=null;this.convictionCasts=new Set();this.followups=[];installClassWorld(w);}
 get character(){return this.p.character;}
 get data(){return this.character.data;}
 get now(){return this.w.time;}
 value(id){return classValue(this.data,id);}
 position(q=this.p){return q.game.player;}
 sameSurface(a,b){return (a.surface??'ground')===(b.surface??'ground');}
 valid(e){return e?.alive&&e.state!=='returning'&&this.sameSurface(this.position(),e);}
 nearby(point,radius){return this.w.enemies.filter(e=>this.valid(e)&&distance(point,e)<=radius&&clearSegment(layerWorld(this.w.map,point.surface??'ground'),point,e,.05));}
 allies(point,radius){return [...this.w.players.values()].filter(q=>q.character.isAlive&&this.sameSurface(point,this.position(q))&&distance(point,this.position(q))<=radius&&clearSegment(layerWorld(this.w.map,point.surface??'ground'),point,this.position(q),.05));}
 ally(aim){return this.w.players.get(aim.ally??this.p.id);}
 incapacitated(){return Object.values(this.p.conditions??{}).some(c=>c.incapacitating&&c.end>this.now);}
 reason(a,aim){
  if(this.incapacitated())return 'Você está incapacitado';
  if(a.shield&&!ITEMS[this.data.equipment.offhand?.definitionId]?.shield)return 'Requer escudo na mão secundária';
  if(a.shield&&this.position().moving)return 'Permaneça imóvel para contra-atacar';
  if(a.ammo&&new Inventory(this.character).count('arrows')<a.ammo)return 'Flechas insuficientes';
  if(['ground','direction'].includes(a.targetingType)&&(!Number.isFinite(aim.x)||!Number.isFinite(aim.z)))return 'Escolha a direção ou posição no chão';
  if(a.targetingType==='ground'&&(distance(this.position(),aim)>a.range||!clearSegment(layerWorld(this.w.map,this.position().surface??'ground'),this.position(),aim,.05)))return 'Área fora de alcance ou atrás de obstáculo';
  if(['ally','allyOrUndead'].includes(a.targetingType)){
   if(a.targetingType==='allyOrUndead'&&aim.enemy){const e=this.w.enemies.find(e=>e.id===aim.enemy);if(!this.valid(e)||!undead(e)||distance(this.position(),e)>a.range||!clearSegment(this.w.map,this.position(),e,.05))return 'Selecione um morto-vivo ao alcance';}
   else {const q=this.ally(aim);if(!q?.character.isAlive||!this.sameSurface(this.position(),this.position(q))||distance(this.position(),this.position(q))>a.range||!clearSegment(this.w.map,this.position(),this.position(q),.05))return 'Aliado fora de alcance';}
  }
  if(a.mechanic==='teleport'){try{teleportOffer(this.tower,this.p,aim,a,true);}catch(e){return e.message;}}
  return null;
 }
 begin(execution){const {ability:a,aim={}}=execution,reason=this.reason(a,aim);if(reason)return this.r.feedback(reason);this.lastAction=this.now;execution.castId=++this.castId;
  if(a.ammo){const save=this.value('arrowConservation'),chance=Math.min(save.cap??0,(save.ammoSave??0)+(this.data.attributes.luk??0)*(save.luckScaling??0));let used=0;for(let i=0;i<a.ammo;i++)if(this.w.random()>=chance)used++;if(used)new Inventory(this.character).remove('arrows',used);}
  if(a.mechanic&&!['heal','allyBuff','buff','aura','cleanse','teleport','dash','shadow'].includes(a.mechanic))execution.opening=this.reveal(true);
  return true;
 }
 reveal(offensive=false){const hidden=!!this.buffs.concealment,prepared=!!this.buffs.preparedOpening;if(hidden){delete this.buffs.concealment;if(!offensive)this.buffs.preparedOpening={expires:this.now+3};if(offensive&&classRank(this.data,'invisiblePredator'))this.buff('invisiblePredator',this.value('invisiblePredator'));}if(offensive)delete this.buffs.preparedOpening;return hidden||offensive&&prepared;}
 buff(id,values,target=this.p){const engine=target.abilities?.classEngine;if(target!==this.p){if(engine){engine.buff(id,values);this.w.guardian?.participation?.support(this.p.id,target.id,values.duration??5);}return;}if(id==='courageBlessing'&&this.data.classId==='mage')values={...values,magicDamage:values.attack,attack:0};const value={...values,expires:this.now+(values.duration??5)};if(id==='arcaneBarrier')value.barrier+=this.character.stats.magicAttack*(values.scaling??0);if(id==='poisonBlade')value.weapons=Object.values(this.data.equipment).filter(i=>ITEMS[i?.definitionId]?.weaponType==='dagger').map(i=>i.instanceId);this.buffs[id]=value;this.visual(id,this.position(),{kind:'buff',duration:values.duration??5});}
 visual(ability,point,extra={}){this.w.skillVisuals??=[];this.w.skillVisuals.push({id:extra.kind==='buff'?'buff:'+this.p.id+':'+ability:this.p.id+':'+(++this.sequence),source:this.p.id,ability,x:point.x,z:point.z,y:point.y??this.position().y??0,time:this.now,...extra});this.w.skillVisuals=this.w.skillVisuals.filter(v=>this.now-v.time<Math.max(1,v.duration??1)).slice(-160);}
 direction(aim={}){const from=this.position(),dx=(aim.x??from.x+Math.sin(from.heading))-from.x,dz=(aim.z??from.z+Math.cos(from.heading))-from.z,d=Math.hypot(dx,dz);return d>.001?{x:dx/d,z:dz/d}:{x:Math.sin(from.heading),z:Math.cos(from.heading)};}
 displace(target,destination,strict=false){const from=target.game?.player??target,map=layerWorld(this.w.map,from.surface??'ground');if(!this.sameSurface(from,destination)||!clearSegment(map,from,destination,.32)||!canStand(map,destination.x,destination.z,.32))return false;if(this.w.enemies.some(e=>e.alive&&e!==target&&distance(e,destination)<e.radius+.32)&&strict)return false;Object.assign(from,{x:destination.x,z:destination.z});if(target.game){target.game.cancel();target.axis={x:0,z:0};}return true;}
 dash(a,aim,backward=false){const dir=this.direction(aim),sign=backward?-1:1,from=this.position(),map=layerWorld(this.w.map,from.surface??'ground'),length=a.parameters.distance;let end={...from};for(let t=.1;t<=length+.001;t+=.1){const next={...from,x:from.x+dir.x*t*sign,z:from.z+dir.z*t*sign};if(!clearSegment(map,end,next,.32)||!canStand(map,next.x,next.z,.32))break;end=next;}this.displace(this.p,end);}
 apply(execution){const {ability:a,aim={},castId,opening}=execution;const releaseReason=a.mechanic==='teleport'?null:this.reason({...a,ammo:0},aim);if(releaseReason){this.r.feedback(releaseReason);return;}const v=a.parameters,target=this.r.target(execution.target),point={...this.position(),...aim},context={a,castId,opening};
  this.visual(a.id,this.position(),{kind:a.mechanic,target:target?.id,element:v.element});
  switch(a.mechanic){
   case 'strike': if(this.valid(target))this.hit(target,v,context);break;
   case 'projectile': this.projectile(a,aim,target,context);break;
   case 'retreatShot':this.projectile(a,aim,target,context);this.dash({...a,parameters:{distance:v.distance}},target??aim,true);break;
   case 'sequence':this.sequences.push({target:execution.target,context,remaining:v.hits,next:this.now,position:{...this.position()}});break;
   case 'buff':this.buff(a.id,v);if(a.id==='concealment'){this.p.target=null;this.p.game.cancel();this.p.cycle.cancel();}break;
   case 'allyBuff':{const q=this.ally(aim);if(q)this.buff(a.id,v,q);break;}
   case 'dash':this.dash(a,aim,v.backward);break;
   case 'shadow':if(this.valid(target)){const end={...target,x:target.x-Math.sin(target.heading??0)*1.1,z:target.z-Math.cos(target.heading??0)*1.1};if(distance(this.position(),end)<=v.distance)this.displace(this.p,end,true);}break;
   case 'lunge':if(this.valid(target)){const d=distance(this.position(),target),s=Math.max(0,d-1.1)/d,end={...this.position(),x:this.position().x+(target.x-this.position().x)*s,z:this.position().z+(target.z-this.position().z)*s};if(this.displace(this.p,end))this.hit(target,v,context);}break;
   case 'burst':for(const e of this.nearby(this.position(),v.radius)){this.hit(e,v,context);if(v.knockback&&!e.isBoss&&!e.isMiniBoss){const d=distance(this.position(),e)||1,end={...e,x:e.x+(e.x-this.position().x)/d*v.knockback,z:e.z+(e.z-this.position().z)/d*v.knockback};this.displace(e,end);}}break;
   case 'chain':this.projectile(a,aim,null,context);break;
   case 'dot':if(this.valid(target))this.condition(target,a.id,{...v,context,owner:this.p.id,severity:2});break;
   case 'zone':{const radius=v.radius*(a.magic&&v.element==='holy'?1+(this.value('sacredExpansion').holyRadius??0):1);this.zones.push({ability:a,context,point:{...point,surface:this.position().surface},radius,next:this.now+v.interval,end:this.now+v.duration});this.visual(a.id,point,{kind:'zone',radius,duration:v.duration});break;}
   case 'taunt':for(const e of this.nearby(this.position(),v.radius)){e.classTaunt={source:this.p.id,end:this.now+v.duration};e.threat??={};e.threat[this.p.id]=Math.max(0,...Object.values(e.threat))+v.threat;e.targetId=this.p.id;e.state='chasing';if(e===this.w.guardian?.e)this.w.guardian.participation.engage(this.p.id);}break;
   case 'heal':if(aim.enemy){const e=this.w.enemies.find(e=>e.id===aim.enemy);if(this.valid(e)&&undead(e))this.hit(e,v,{...context,a:{...a,magic:true}});}else {const q=a.id==='secondWind'?this.p:this.ally(aim);if(q){let amount=v.healPercent?q.character.stats.maxHP*v.healPercent:(v.heal??0)+this.character.stats.magicAttack*(a.id==='renewal'?0:v.scaling??0);const miracle=this.value('faithMiracle');if(a.id==='heal'&&q.character.data.hp/q.character.stats.maxHP<(miracle.threshold??0)&&this.now>=this.miracleAt){amount*=1+miracle.healBonus;this.visual('faithMiracle',this.position(q),{kind:'heal'});this.miracleAt=this.now+miracle.cooldown;this.data.classInternalCooldowns??={};this.data.classInternalCooldowns.faithMiracle=this.tower.now()+miracle.cooldown*1000;}this.heal(q,amount,a.id);if(v.duration)this.hot(q,a.id,{value:v.hotPercent?q.character.stats.maxHP*v.hotPercent:(v.hot??0)+this.character.stats.magicAttack*(v.scaling??0),duration:v.duration,interval:v.interval??1});}}break;
   case 'cleanse':{const q=this.ally(aim);if(q)for(const [id,c]of Object.entries(q.conditions??{}))if(c.severity<=v.severity)delete q.conditions[id];break;}
   case 'aura':if(this.buffs.hopeAura)delete this.buffs.hopeAura;else this.buff(a.id,{...v,radius:v.radius*(1+(this.value('sacredExpansion').holyRadius??0))});break;
   case 'teleport':try{teleportOffer(this.tower,this.p,aim,a);}catch(e){this.r.feedback(e.message);}break;
  }
 }
 heal(q,amount,id,source=this.p.id){if(!q.character.isAlive)return;const before=q.character.data.hp;q.character.heal(Math.max(0,amount));if(q.character.data.hp>before)this.w.guardian?.participation?.support(source,q.id);this.visual(id,this.position(q),{kind:'heal'});}
 hot(q,id,v){q.classHOT??={};const old=q.classHOT[id],value=Math.max(old?.end>this.now?old.value:0,v.value);q.classHOT[id]={...v,value,source:this.p.id,next:old?.next>this.now?old.next:this.now+v.interval,end:this.now+v.duration};}
 condition(e,id,c){e.conditions??={};const previous=e.conditions[id];e.conditions[id]={...c,generation:e.generation,next:previous?.generation===e.generation&&previous.end>this.now?previous.next:this.now+(c.interval??1),end:this.now+c.duration};}
 poison(e,power,duration,context){const boost=this.value('persistentToxins'),existing=e.conditions?.poison,stacks=existing?.generation===e.generation&&existing.end>this.now?existing.stacks:[];const entry={owner:this.p.id,power:power*(1+(boost.poisonDamage??0)),context,attack:this.character.stats.physicalAttack};if(stacks.length<3)stacks.push(entry);else{const index=stacks.reduce((best,s,i)=>s.power*s.attack<stacks[best].power*stacks[best].attack?i:best,0);if(entry.power*entry.attack>=stacks[index].power*stacks[index].attack)stacks[index]=entry;}this.condition(e,'poison',{stacks,duration:duration*(1+(boost.poisonTime??0)),interval:1,severity:1});}
 hit(e,v,context={}){if(!this.valid(e))return 0;const a=context.a??{id:'basic',magic:false};if(a.weaponRequirements?.includes('dagger')){const off=this.data.equipment.offhand;this.currentWeapon=this.hand&&ITEMS[off?.definitionId]?.weaponType==='dagger'?off:this.data.equipment.weapon;}const stats={...this.character.stats},element=v.element??(a.magic?'neutral':'physical');let power=v.power??1;
  if(v.backBonus){const dx=this.position().x-e.x,dz=this.position().z-e.z;if(dx*Math.sin(e.heading??0)+dz*Math.cos(e.heading??0)<0)power*=1+v.backBonus;}
  if(v.poisonBonus&&e.conditions?.poison)power*=1+v.poisonBonus;if(v.stealthBonus&&context.opening)power*=1+v.stealthBonus;
  if(context.opening){power*=1+(this.value('surpriseAttack').stealthDamage??0);stats.criticalChance+=(this.value('lethalPreparation').openingCrit??0)*100;}
  if(negative(e))power*=1+(this.value('weaknessKnowledge').conditionDamage??0);
  if(e.conditions?.slow){power*=1+(this.value('relentlessHunt').slowBonus??0);const hunt=this.value('relentlessHunt');if(hunt.moveAfterHit)this.buff('relentlessHunt',{moveSpeed:hunt.moveAfterHit,duration:hunt.duration});}
  const elem=elementalAllocation(this.data),mastery=this.value('elementalMastery').elementBonus??0;
  const parts=[{element,power}];if(a.id==='magicProjectile')for(const type of ELEMENTS)if(elem[type])parts.push({element:type,power:power*elem[type]*mastery});
  let damage=0;for(const part of parts){let amount=part.power;if(ELEMENTS.includes(part.element)&&a.id!=='magicProjectile')amount*=1+elem[part.element]*mastery;if(part.element==='holy')amount*=1+(this.value('sacredKnowledge').holyDamage??0)+(e.conditions?.condemnationSeal?.holyVulnerability??0);amount*=1-clamp(e.resistances?.[part.element]??0,-1,.9);
   this.attackContext={...context,a,element:part.element,penetration:clamp((v.penetration??0)+(context.opening?this.value('lethalPreparation').openingPenetration??0:0),0,.8),skill:true};
   const attack={...stats,physicalAttack:(a.magic||part.element!=='physical'?stats.magicAttack:stats.physicalAttack)*amount};const defense={...e.stats,physicalDefense:a.magic||part.element!=='physical'?e.stats.magicDefense??0:e.stats.physicalDefense};
   try{const result=this.w.impact(this.p.id,e.id,attack,defense,d=>e.damage(d));damage+=result.damage;if(result.hit&&e.alive){e.targetId=this.threatTarget(e);e.state='chasing';}}finally{this.attackContext=null;}
   if(!e.alive){e.targetId=null;e.deadAt=this.now;e.path=[];this.w.cycles.get(e.id)?.cancel();break;}
  }
  if(damage>0){this.p.lastCombat=this.tower.now();if(v.slow)this.condition(e,'slow',{amount:v.slow,duration:v.duration??2,severity:1});if(v.burn)this.condition(e,'burn',{power:v.burn,duration:v.duration,interval:1,owner:this.p.id,context:{...context,a:{...a,magic:true}},element:'fire',severity:2});if(v.poisonPower)this.poison(e,v.poisonPower,v.poisonDuration,context);if(v.lifeSteal)this.heal(this.p,damage*v.lifeSteal,a.id);
   if(element==='holy'&&context.castId!==undefined&&!this.convictionCasts.has(context.castId)){this.character.restoreMP(this.value('conviction').convictionMP??0);this.convictionCasts.add(context.castId);if(this.convictionCasts.size>256)this.convictionCasts.delete(this.convictionCasts.values().next().value);}
   if(!context.periodic){
    if(ELEMENTS.includes(element)&&a.id!=='magicProjectile'){if(this.flowCast!==context.castId){if(this.lastElement&&this.lastElement!==element)this.character.restoreMP(this.value('arcaneFlow').flowMP??0);this.lastElement=element;this.flowCast=context.castId;}this.trinityHit(e,element,context);}
   }
  }return damage;
 }
 trinityHit(e,element,context){const v=this.value('arcaneTrinity');if(!v.window)return;const id=key(e),track=this.trinity.get(id)??{elements:{},next:0};track.elements[element]=this.now;this.trinity.set(id,track);if(this.now>=track.next&&ELEMENTS.every(t=>this.now-(track.elements[t]??-Infinity)<=v.window)){track.next=this.now+v.cooldown;track.elements={};this.hit(e,{power:v.power,element:'neutral'},{a:{id:'arcaneTrinity',magic:true},castId:context.castId,periodic:true});this.visual('arcaneTrinity',e,{kind:'burst',radius:1});}}
 chain(target,v,context){const a=context.a;let next=target,power=v.power;const seen=new Set();for(let i=0;i<=v.jumps&&this.valid(next);i++){seen.add(next.id);const damage=this.hit(next,{...v,power},context);if(i===0&&!damage)break;this.visual(a.id,next,{kind:'lightning'});const previous=next;next=this.nearby(previous,v.jumpRange).filter(e=>!seen.has(e.id)).sort((a,b)=>distance(previous,a)-distance(previous,b))[0];power*=v.decay;}}
 projectile(a,aim,target,context){const dir=this.direction(a.guided&&target?target:aim),p=this.position();this.shots.push({id:this.p.id+':shot:'+ ++this.sequence,x:p.x,z:p.z,y:p.y,surface:p.surface,dx:dir.x,dz:dir.z,remaining:a.range,ability:a.id,a,context,target:a.guided&&target?{id:target.id,generation:target.generation}:null,guided:!!a.guided,hits:new Set()});}
 updateShots(dt){for(const s of [...this.shots]){if(s.guided){const target=this.r.target(s.target);if(!target){s.remaining=0;continue;}const d=distance(s,target);if(d){s.dx=(target.x-s.x)/d;s.dz=(target.z-s.z)/d;}}
   let left=Math.min(s.remaining,s.a.parameters.speed*dt);while(left>1e-8&&s.remaining>0){const length=Math.min(.15,left),next={...s,x:s.x+s.dx*length,z:s.z+s.dz*length};if(!clearSegment(layerWorld(this.w.map,s.surface??'ground'),s,next,.04)){if(s.a.parameters.radius)this.explode(s);s.remaining=0;break;}Object.assign(s,{x:next.x,z:next.z});left-=length;s.remaining-=length;
    const e=this.w.enemies.find(e=>this.valid(e)&&!s.hits.has(key(e))&&distance(s,e)<(e.radius??.35)+.15);if(e){s.hits.add(key(e));if(s.a.parameters.radius){this.explode(s);s.remaining=0;break;}if(s.a.mechanic==='chain')this.chain(e,s.a.parameters,s.context);else this.hit(e,s.a.parameters,s.context);s.guided=false;if(s.hits.size>=(s.a.parameters.pierce??1)){s.remaining=0;break;}}
   }
  }this.shots=this.shots.filter(s=>s.remaining>0);
 }
 explode(s){for(const e of this.nearby(s,s.a.parameters.radius))this.hit(e,s.a.parameters,s.context);this.visual(s.a.id,s,{kind:'burst',radius:s.a.parameters.radius,element:s.a.parameters.element});}
 threatTarget(e){if(e.classTaunt?.end>this.now&&this.w.players.get(e.classTaunt.source)?.character.isAlive)return e.classTaunt.source;return Object.entries(e.threat??{}).filter(([id])=>this.w.players.get(id)?.character.isAlive&&!this.w.players.get(id)?.abilities?.classEngine?.buffs.concealment).sort((a,b)=>b[1]-a[1])[0]?.[0]??this.p.id;}
 outgoing(stats,e){const a=this.attackContext,basic=!a;let out={...stats},mult=1;
  if(basic){this.lastAction=this.now;const opening=this.reveal(true);if(negative(e))mult*=1+(this.value('weaknessKnowledge').conditionDamage??0);if(e?.conditions?.slow)mult*=1+(this.value('relentlessHunt').slowBonus??0);if(opening){mult*=1+(this.value('surpriseAttack').stealthDamage??0);out.criticalChance+=(this.value('lethalPreparation').openingCrit??0)*100;}const weapon=equippedDefinition(this.data);this.hand=(this.hand+1)%2;const off=ITEMS[this.data.equipment.offhand?.definitionId];this.currentWeapon=weapon?.weaponType==='dagger'&&this.hand&&off?.weaponType==='dagger'?this.data.equipment.offhand:this.data.equipment.weapon;
   if(!weapon)mult*=.35;else{mult*=weapon.basicAttack.power??1;if(weapon.weaponType==='staff')out.physicalAttack=this.character.stats.magicAttack;}
  }
  if(['sword','dagger'].includes(equippedDefinition(this.data)?.weaponType)&&!a?.a.magic)mult*=1+(this.value('weaponMastery').meleeAttack??0);
  for(const b of Object.values(this.buffs))if(a?.a.magic){if(['neutral',...ELEMENTS].includes(a.element))mult*=1+(b.magicDamage??0);if(b.attack&&this.data.classId==='priest')mult*=1+b.attack;}else mult*=1+(b.attack??0);
  mult*=1+(this.value('growingMomentum').consecutiveDamage??0)*(this.now-this.lastHit<=4?this.hitStacks:0);
  out.physicalAttack*=mult;out.criticalMultiplier=1.5+(this.value('weakPointKnowledge').criticalDamage??0);return out;
 }
 incoming(amount,source){if(amount>0)this.reveal();// Impact interruption is evaluated after mitigation and HP application.
  let reduction=0;
  if(this.stationary>=1)reduction+=this.value('unshakableStance').stationaryReduction??0;
  const determination=this.value('finalDetermination');if(this.data.hp/this.character.stats.maxHP<(determination.threshold??0))reduction+=determination.lowHPReduction;
  for(const b of Object.values(this.buffs))reduction+=b.reduction??0;
  const counter=this.buffs.counterAttack;if(amount>0&&counter&&this.stationary>=.1&&counter.block>0&&ITEMS[this.data.equipment.offhand?.definitionId]?.shield){counter.block=0;amount=0;const e=this.w.enemies.find(e=>e.id===source);if(e&&distance(this.position(),e)<=1.8)this.hit(e,{power:counter.counterPower},{a:{id:'counterAttack',magic:false},castId:++this.castId});}
  amount*=1-clamp(reduction,0,.75);const barrier=this.buffs.arcaneBarrier;if(barrier?.barrier>0){const absorb=Math.min(barrier.barrier,amount);barrier.barrier-=absorb;amount-=absorb;if(barrier.barrier<=0)delete this.buffs.arcaneBarrier;}
  return Math.max(0,Math.round(amount));
 }
 afterHit(e,damage){if(damage<=0)return;if(!this.attackContext?.periodic){this.hitStacks=this.now-this.lastHit<=4?Math.min(5,this.hitStacks+1):1;this.lastHit=this.now;if(!this.attackContext&&e.conditions?.slow){const hunt=this.value('relentlessHunt');if(hunt.moveAfterHit)this.buff('relentlessHunt',{moveSpeed:hunt.moveAfterHit,duration:hunt.duration});}}e.threat??={};e.threat[this.p.id]=(e.threat[this.p.id]??0)+damage*(1-(this.value('discreetPresence').threatReduction??0));
  if(!this.attackContext||!this.attackContext.periodic&&this.attackContext.a.weaponRequirements?.includes('dagger')){const poison=this.buffs.poisonBlade;if(poison?.weapons.includes(this.currentWeapon?.instanceId))this.poison(e,poison.poisonPower,poison.poisonDuration,{a:{id:'poisonBlade',magic:false},castId:++this.castId});const holy=this.buffs.consecratedWeapon;if(holy&&e.alive&&!this.attackContext){const base=equippedDefinition(this.data);if(base)this.followups.push(()=>this.hit(e,{power:holy.holyWeapon*(this.character.stats.physicalAttack/Math.max(1,this.character.stats.magicAttack)),element:'holy'},{a:{id:'consecratedWeapon',magic:true},castId:++this.castId,periodic:true}));}}
 }
 animationAction(){const s=this.sequences.find(s=>s.remaining>0),last=this.lastSequenceAction;if(last&&this.now-last.at<.12)return {id:last.id,phase:'execution',elapsed:this.now-last.at,duration:.12};return s?{id:s.context.a.id,phase:'preparation',elapsed:0,duration:Math.max(0,s.next-this.now)}:null;}
 interrupt(reason){if(reason!=='movement'||!this.r.active?.ability.moving){for(const s of this.sequences)s.remaining=0;this.sequences=[];}if(['death','travel'].includes(reason)){this.lastSequenceAction=null;this.zones=[];this.shots=[];this.buffs={};}}
 update(dt){const p=this.p,c=this.character,pos=this.position();if(!c.isAlive){this.interrupt('death');return;}for(const [id,condition]of Object.entries(p.conditions??{}))if(condition.end<=this.now)delete p.conditions[id];if(this.incapacitated()){this.r.interrupt('incapacitation');p.target=null;p.axis={x:0,z:0};p.game.cancel();p.cycle.cancel();}const moved=distance(pos,this.lastPosition)>.015;this.stationary=moved?0:this.stationary+dt;this.lastPosition={...pos};const followups=this.followups.splice(0);for(const apply of followups)apply();if(moved)this.lastAction=this.now;
  if(this.data.classId!==this.lastClass){this.buffs={};this.lastClass=this.data.classId;}
  for(const [id,b]of Object.entries(this.buffs))if(b.expires<=this.now){if(id==='concealment')this.buffs.preparedOpening={expires:this.now+3};delete this.buffs[id];}
  const inCombat=this.tower.inCombat(p.id);this.combatSeconds=inCombat?this.combatSeconds+dt:0;if(!inCombat)this.emergencyUsed=false;
  const spirit=this.value('unbreakableSpirit');if(inCombat&&!this.emergencyUsed&&this.data.hp/c.stats.maxHP<(spirit.threshold??0)){this.buff('unbreakableSpirit',spirit);this.emergencyUsed=true;this.data.classInternalCooldowns??={};this.data.classInternalCooldowns.unbreakableSpirit=this.tower.now()+30000;}
  const aura=this.buffs.hopeAura;if(aura){if(!c.spendMP(aura.upkeep*dt))delete this.buffs.hopeAura;else for(const q of this.allies(pos,aura.radius))this.buff('auraProtection',{reduction:aura.reduction,duration:.3},q);}
  const stat={};
  for(const b of Object.values(this.buffs)){for(const id of ['accuracy','criticalChance'])stat[id]=(stat[id]??0)+(b[id]??0);stat.attackSpeed=(stat.attackSpeed??0)+(b.attackSpeed??0);}
  stat.attackSpeed=(stat.attackSpeed??0)+(this.value('battleRhythm').combatSpeed??0)*Math.min(5,Math.floor(this.combatSeconds/2))+(this.value('acceleratedRhythm').hitSpeed??0)*(this.now-this.lastHit<=4?this.hitStacks:0);
  const stance=this.buffs.aggressiveStance;if(stance)stat.physicalDefense=-(c.stats.physicalDefense-(c.modifiers.buffs.stats?.physicalDefense??0))*(-stance.defense);for(const k of Object.keys(stat))if(!stat[k])delete stat[k];
  if(JSON.stringify(c.modifiers.buffs.stats??{})!==JSON.stringify(stat)){c.modifiers.buffs={stats:stat};c.recalculate(this.tower.now());}p.game.movementMultiplier=this.incapacitated()?0:(1+(this.value('lightSteps').moveSpeed??0)+Object.values(this.buffs).reduce((n,b)=>n+(b.moveSpeed??0),0))*(1-clamp(Math.max(0,...Object.values(p.conditions??{}).map(c=>c.slow??0)),0,.8));
  if(!this.buffs.hopeAura){c.regenerate(dt);if(inCombat)c.restoreMP((this.value('combatBreath').combatMP??0)*dt);if(this.stationary>=2&&this.now-this.lastAction>=2&&!this.r.active&&!p.target)c.restoreMP((this.value('arcaneMeditation').meditationMP??0)*dt);}else c.heal(c.stats.hpRegen*dt);
  for(const [id,h]of Object.entries(p.classHOT??{})){while(h.next<=this.now+1e-9&&h.next<=h.end){this.heal(p,h.value,id,h.source);h.next+=h.interval;}if(h.end<=this.now)delete p.classHOT[id];}
  for(const s of this.sequences){if(distance(pos,s.position)>.05){s.remaining=0;continue;}while(s.remaining>0&&s.next<=this.now){const e=this.r.target(s.target);if(!this.valid(e)||distance(pos,e)>s.context.a.range){s.remaining=0;break;}this.hand=(this.hand+1)%2;this.lastSequenceAction={id:s.context.a.id,at:this.now};this.hit(e,s.context.a.parameters,s.context);this.visual('daggerSequence',e,{kind:'slash',hand:this.hand});s.remaining--;s.next+=s.context.a.parameters.interval;}}
  this.sequences=this.sequences.filter(s=>s.remaining>0);
  for(const z of this.zones)while(z.next<=this.now+1e-9&&z.next<=z.end){const v=z.ability.parameters;if(v.heal){for(const q of this.allies(z.point,z.radius)){this.heal(q,v.heal,z.ability.id);this.buff('sanctuaryProtection',{reduction:v.reduction,duration:1.1},q);}}
   for(const e of this.nearby(z.point,z.radius))if(!v.heal||undead(e))this.hit(e,v,{...z.context,periodic:true});z.next+=v.interval;}
  this.zones=this.zones.filter(z=>z.end>this.now);this.updateShots(dt);tickConditions(this.w,dt);
 }
 snapshot(){return {buffs:Object.fromEntries(Object.entries(this.buffs).map(([id,b])=>[id,{...b,remaining:Math.max(0,b.expires-this.now)}])),hand:this.hand,stealth:!!this.buffs.concealment,shots:this.shots.map(s=>({id:s.id,x:s.x,z:s.z,y:s.y,ability:s.ability,target:s.target,dx:s.dx,dz:s.dz,effect:{damageType:s.a.magic?'magic':'physical'}}))};}
}
function tickConditions(w,dt){if(w.conditionTick===w.tick)return;w.conditionTick=w.tick;for(const e of w.enemies){let slow=0;for(const [id,c]of Object.entries(e.conditions??{})){if(!e.alive||e.state==='returning'||c.generation!==e.generation){delete e.conditions[id];continue;}if(id==='slow')slow=Math.max(slow,c.amount);while(c.next<=w.time+1e-9&&c.next<=c.end+1e-9){c.next+=c.interval??1;if(id==='poison')for(const s of c.stacks){const engine=w.players.get(s.owner)?.abilities?.classEngine;if(engine)engine.hit(e,{power:s.power,element:'physical'},{...s.context,periodic:true});}else if(c.power){const engine=w.players.get(c.owner)?.abilities?.classEngine;if(engine)engine.hit(e,{power:c.power,element:c.element},{...c.context,periodic:true});}}if(c.end<=w.time)delete e.conditions[id];}e.classSlow=slow;}}
export function installClassWorld(w){if(w.classHooks)return;w.classHooks=true;w.beforeImpact=(source,target,stats,defender)=>{const engine=w.players.get(source)?.abilities?.classEngine,victim=w.players.get(target)?.abilities?.classEngine,e=w.enemies.find(e=>e.id===target),ctx=engine?.attackContext;let defense={...defender};if(ctx)defense.physicalDefense*=1-(ctx.penetration??0);else if(engine&&equippedDefinition(engine.data)?.weaponType==='staff')defense.physicalDefense=e?.stats.magicDefense??0;return {stats:engine?engine.outgoing(stats,e):stats,defender:defense,transform:damage=>victim?victim.incoming(damage,source):damage};};w.afterImpact=(source,target,result)=>{const engine=w.players.get(source)?.abilities?.classEngine,e=w.enemies.find(e=>e.id===target);if(engine&&e)engine.afterHit(e,result.damage);};}
