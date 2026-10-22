import {bounded,nextFrame} from '../../core/scene-work.js';

// Only atlases already requested by actors in this destination. No asset list,
// map cache or speculative equipment is introduced.
export async function prepareActorAtlases(view,signal,record){
 const actors=[view.actor,...Array.from(view.remotePlayers?.actors?.values()??[],entry=>entry.actor)],sources=new Set();
 for(const actor of actors){
  if(!actor)continue;
  for(const texture of [actor.baseTexture,...(actor.textures?.values()??[])]){
   if(!texture||sources.has(texture.source))continue;sources.add(texture.source);
   await bounded(texture.userData.ready?.()??Promise.resolve(),signal);
   await nextFrame(signal);
   const at=performance.now();view.renderer.initTexture(texture);record('actor-upload',performance.now()-at);
  }
 }
}
