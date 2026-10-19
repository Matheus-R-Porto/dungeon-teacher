import {seedOf} from '../domain/random.js';
// Pure time-based choreography: no timers, RNG per frame or simulation state.
export function npcAmbient(id,time){
 const seed=seedOf(id),period=13+(seed%7),phase=(time+(seed%113)*.37)%period,active=phase>3&&phase<8;
 return {active,phase,breath:Math.sin(time*1.7+seed)*.008,lean:active?Math.sin((phase-3)*2)*.025:0,strike:active?Math.pow(Math.max(0,Math.sin((phase-3)*5)),3):0};
}
