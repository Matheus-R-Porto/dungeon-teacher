import {bounded,nextFrame} from '../../core/scene-work.js';

// Only atlases already requested by actors in this destination. No asset list,
// map cache or speculative equipment is introduced.
export async function prepareActorAtlases(view,signal,record){
 const actors=[view.actor,...Array.from(view.remotePlayers?.actors?.values()??[],entry=>entry.actor)],sources=new Set();
 for(const actor of actors){
  if(!actor)continue;
  await bounded(actor.sheet?.ready?.()??Promise.resolve(),signal);
  // Once the prepared body is ready, the next prepared pose replaces the legacy
  // fallback. Do not upload every fallback weapon atlas for that invisible body.
  // Activity sprites still use the legacy path and retain their preparation.
  const legacy=(actor.sheet?.bodyTexture||actor.sheet?.original?.texture)&&!actor.currentActivity?[]:[actor.baseTexture,...(actor.textures?.values()??[])];
  for(const texture of [actor.sheet?.bodyTexture,actor.sheet?.original?.texture,actor.sheet?.nativeAction?.texture,actor.sheet?.nativeAction?.entry?.mask,...(actor.sheet?.nativeProfession?.views??[]),...(actor.sheet?.nativeProfession?.entries??[]).map(e=>e?.mask),actor.sheet?.palette?.mask.value,actor.sheet?.backpack?.texture,actor.accessories?.cart?.material.map,...legacy]){
   if(!texture||sources.has(texture.source))continue;sources.add(texture.source);
   await bounded(texture.userData.ready?.()??Promise.resolve(),signal);
   await nextFrame(signal);
   const at=performance.now();view.renderer.initTexture(texture);record('actor-upload',performance.now()-at);
  }
 }
}
