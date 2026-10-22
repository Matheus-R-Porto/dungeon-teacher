// Cooperative work never changes simulation state. Each yielded unit is atomic.
export const aborted = () => new DOMException('Preparação cancelada', 'AbortError');
export function nextFrame(signal){return new Promise((resolve,reject)=>{
 if(signal?.aborted){reject(aborted());return;}
 let timer;const cancel=()=>{cancelAnimationFrame(id);clearTimeout(timer);reject(aborted());};
 const finish=()=>{cancelAnimationFrame(id);clearTimeout(timer);signal?.removeEventListener('abort',cancel);resolve();};
 const id=requestAnimationFrame(finish);timer=setTimeout(finish,100);signal?.addEventListener('abort',cancel,{once:true});
});}
export async function runSceneWork(iterator,{signal,budget=3,now=()=>performance.now(),yieldFrame=nextFrame,record=()=>{}}={}){
 try{let start=now();for(;;){if(signal?.aborted)throw aborted();const at=now(),step=iterator.next();record(step.value??'finish',now()-at);if(step.done)return;
  if(now()-start>=budget){await yieldFrame(signal);start=now();}
 }}finally{iterator.return?.();}
}
export async function bounded(promise,signal,ms=12000){
 if(signal?.aborted){Promise.resolve(promise).catch(()=>{});throw aborted();}let timer,listener;
 try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Tempo limite na preparação gráfica.')),ms);listener=()=>reject(aborted());signal?.addEventListener('abort',listener,{once:true});})]);}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',listener);}
}
