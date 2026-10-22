// Timer fallback also covers hidden windows where RAF stops. A blocked driver
// cannot be preempted by JavaScript; cleanup runs when the event loop resumes.
export function sampleAssessment(render,{duration=4000,warmup=750,timeout=8000,request=cb=>requestAnimationFrame(cb),cancel=id=>cancelAnimationFrame(id),hidden=()=>document.hidden}={}){
 return new Promise(resolve=>{
  const values=[];let frame,start,last,done=false;
  const finish=status=>{if(done)return;done=true;clearTimeout(timer);cancel(frame);resolve({status,values:status==='complete'?values:[]});};
  const timer=setTimeout(()=>finish('timeout'),timeout);
  const tick=now=>{if(done)return;try{start??=now;if(last!==undefined&&now-start>warmup&&!hidden())values.push(now-last);last=now;render(now);if(now-start>=duration)finish('complete');else frame=request(tick);}catch{finish('failed');}};
  try{frame=request(tick);}catch{finish('failed');}
 });
}
