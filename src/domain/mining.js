export const PICKAXE='simplePickaxe';
export const RAW_ORE='rawOre';
export const PICKAXE_PRICE=30;
// Timing is simulation time, never frame count: the bar sweeps 0 -> 1 -> 0 every sweepSeconds.
export const MINING = Object.freeze({
  maxStack:99,interactionRadius:2.4,veinRadius:.9,
  prepareSeconds:.5,sweepSeconds:1.6,timeoutSeconds:7,retrySeconds:1.5,
  zoneMin:.3,zoneMax:.7,goodHalf:.11,perfectHalf:.04,
  xp:Object.freeze({GOOD:8,PERFECT:12}),
  targetPerFloor:3,maxPerFloor:4,minSpacing:6,minCaveAmount:.6,approachClearance:.85,
});
export function indicatorAt(elapsed,config=MINING){
  if(!Number.isFinite(elapsed)||elapsed<0)return 0;
  const phase=(elapsed/config.sweepSeconds)%2;return phase<=1?phase:2-phase;
}
export function strikeResult(position,center,config=MINING){
  const distance=Math.abs(position-center);
  return distance<=config.perfectHalf+1e-9?'PERFECT':distance<=config.goodHalf+1e-9?'GOOD':'MISS';
}
