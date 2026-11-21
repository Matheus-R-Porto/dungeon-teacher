// Iteration 37. Provisional tuning: fractions refer to actual HP lost / max HP.
// Authority owns this state; presentation cannot request an interruption.
export const IMPACT_RULES=Object.freeze({
 player:Object.freeze({threshold:.10,resistance:1,recoil:.22,recovery:.18,protection:.7}),
 common:Object.freeze({threshold:.08,resistance:1,recoil:.26,recovery:.14,protection:.9}),
 special:Object.freeze({threshold:.08,resistance:1.25,recoil:.28,recovery:.22,protection:1.4}),
 boss:Object.freeze({threshold:.08,resistance:1.5,recoil:.32,recovery:.5,protection:4}),
 mvp:Object.freeze({threshold:.08,resistance:1.75,recoil:.4,recovery:.65,protection:6})
});
export function impactRules(kind='common',overrides={}){
 const r={...(IMPACT_RULES[kind]??IMPACT_RULES.common),...overrides};
 for(const key of ['threshold','resistance','recoil','recovery','protection'])if(!Number.isFinite(r[key])||r[key]<0)throw Error('Invalid impact rule: '+key);
 if(r.threshold<=0||r.resistance<=0||r.protection<r.recoil+r.recovery)throw Error('Impact protection must cover recovery');
 return r;
}
export function impactState(entity,time,alive=true){
 const s=entity.impactState;
 if(!alive)return {phase:'dead',remaining:0,recoveryRemaining:0,protectedRemaining:0,serial:s?.serial??0};
 return {phase:s&&time<s.recoilUntil?'recoil':s&&time<s.recoverUntil?'impactRecovery':'idle',remaining:Math.max(0,(s?.recoilUntil??0)-time),recoveryRemaining:Math.max(0,(s?.recoverUntil??0)-time),protectedRemaining:Math.max(0,(s?.protectedUntil??0)-time),serial:s?.serial??0};
}
// A canceled basic attack keeps its existing recovery debt. Protect enough time
// to pay that debt and complete one fresh cycle, even for slow attackers.
export const cycleImpactProtection=(cycle,speed)=>cycle?.phase==='windup'&&speed>0?cycle.remaining+cycle.recovery+1/speed+.05:0;
export const enemyImpactKind=e=>e.isMiniBoss?'mvp':e.isBoss?'boss':['ranged','mobile'].includes(e.behaviorType)?'special':'common';
export const impactLocked=(entity,time)=>time<(entity.impactState?.recoverUntil??-Infinity);
export function acceptImpact(entity,{time,damage,maxHP,alive=true,eligible=false,kind='common',rules,protectedAction=false,minimumProtection=0},cancel){
 if(!alive||!eligible||protectedAction||!Number.isFinite(time)||!Number.isFinite(damage)||damage<=0||!Number.isFinite(maxHP)||maxHP<=0)return null;
 const r=impactRules(kind,rules);
 if(time<(entity.impactState?.protectedUntil??-Infinity)||damage/maxHP+1e-12<r.threshold*r.resistance)return null;
 const s={serial:(entity.impactState?.serial??0)+1,at:time,recoilUntil:time+r.recoil,recoverUntil:time+r.recoil+r.recovery,protectedUntil:time+Math.max(r.protection,Number.isFinite(minimumProtection)?minimumProtection:0),damage,kind};
 // Set protection first: a counter-hit in cancellation cannot duplicate this state.
 entity.impactState=s;cancel?.(s);return s;
}
export const abilityInterruptible=runtime=>!!((runtime?.active?.ability.interruptible!==false&&runtime?.active&&runtime.active.index<runtime.active.ability.effects.length)||runtime?.classEngine?.sequences.some(s=>s.remaining>0));
