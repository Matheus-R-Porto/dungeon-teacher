// Presentation only. The authoritative activity still owns timings and rewards.
export const PROFESSION_SHEET=Object.freeze({cell:128,columns:8,rows:8,framesPerDirection:16,feetY:104});
export function professionPose(p){
 if(!p||!['fishing','mining'].includes(p.type))return null;const t=Math.max(0,p.elapsed??0);let frame;
 if(p.type==='fishing'){
  if(p.phase==='cast')frame=t<.1?0:t<.2?1:2;
  else if(p.phase==='waiting')frame=3;
  else if(p.phase==='bite')frame=4;
  else if(p.phase==='reel'&&t<1.35)frame=t<.15?4:t<.85?5+Math.floor((t-.15)/.16)%2:7;
  else return null;
 }else{
  if(p.phase==='prepare')frame=t<.18?0:t<.38?1:2;
  else if(p.phase==='ready')frame=2;
  else if(p.phase==='strike'&&t<.95)frame=t<.12?3:t<.38?4:t<.62?5:t<.8?6:7;
  else return null;
 }
 return {...p,poseFrame:frame+(p.type==='mining'?8:0),impact:p.type==='mining'&&p.phase==='strike'&&t>=.12&&t<.38};
}

export const PROFESSION_TIPS=[[[40, 31], [80, 60], [101, 108], [97, 96], [94, 79], [89, 61], [94, 71], [99, 103], [43, 83], [86, 44], [89, 36], [90, 62], [92, 102], [88, 93], [45, 85], [43, 83]], [[87, 28], [28, 42], [9, 61], [21, 43], [23, 32], [28, 28], [23, 36], [11, 69], [43, 80], [69, 42], [88, 37], [44, 54], [39, 101], [41, 89], [42, 81], [43, 80]], [[40, 31], [78, 36], [103, 44], [97, 38], [94, 29], [89, 26], [94, 32], [103, 51], [43, 83], [86, 44], [89, 36], [90, 62], [92, 71], [88, 63], [45, 85], [43, 83]], [[41, 28], [100, 42], [119, 61], [107, 43], [105, 32], [100, 28], [105, 36], [117, 69], [85, 80], [59, 42], [40, 37], [84, 54], [89, 101], [87, 89], [86, 81], [85, 80]]];
