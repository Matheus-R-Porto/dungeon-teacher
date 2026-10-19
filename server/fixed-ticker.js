// Deadlines stay anchored to monotonic time. Late Windows timers must not slow
// simulation time. Bound each callback's work, then yield without dropping debt.
export function fixedTicker(step,periodMs,{now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout,maxSteps=5}={}){
 if(!Number.isFinite(periodMs)||!(periodMs>0)||!Number.isInteger(maxSteps)||maxSteps<1)throw Error('Invalid fixed ticker configuration');
 let next=now()+periodMs,stopped=false,timer;
 const arm=()=>{timer=schedule(run,Math.max(1,Math.ceil(next-now())));timer?.unref?.();};
 const run=()=>{if(stopped)return;let steps=0;while(!stopped&&now()>=next&&steps<maxSteps){next+=periodMs;steps++;step();}if(!stopped)arm();};
 arm();return {stop(){stopped=true;cancel(timer);}};
}
