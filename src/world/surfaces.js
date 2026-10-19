// Small layered navigation contract. Ground remains the legacy surface (missing id).
export const surfaceId=p=>p.surface??'ground';
export const sameLevel=(a,b)=>Math.abs((a.y??0)-(b.y??0))<.75;
export const spatialDistance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z,(a.y??0)-(b.y??0));
export function containsSurface(s,x,z,r=0){return Math.abs(x-s.x)<=s.halfX-r+1e-6&&Math.abs(z-s.z)<=s.halfZ-r+1e-6;}
export function surfaceHeight(s,z){return s.kind==='ramp'?s.y+(s.top-s.y)*Math.max(0,Math.min(1,(z-(s.z-s.halfZ))/(2*s.halfZ))):s.y;}
const layerCache=new WeakMap();
export function layerWorld(w,id){
 if(!w.surfaces)return w;
 let cache=layerCache.get(w);
 if(!cache||cache.revision!==w.navRevision||cache.obstacles!==w.obstacles||cache.count!==w.obstacles.length||cache.walkable!==w.walkable||cache.graph!==w.graph){cache={revision:w.navRevision,obstacles:w.obstacles,count:w.obstacles.length,walkable:w.walkable,graph:w.graph,layers:new Map()};layerCache.set(w,cache);}
 if(cache.layers.has(id))return cache.layers.get(id);
 const s=w.surfaces.find(s=>s.id===id);
 const layer={...w,surfaces:undefined,graph:s?undefined:w.graph,bounds:s?{minX:s.x-s.halfX,maxX:s.x+s.halfX,minZ:s.z-s.halfZ,maxZ:s.z+s.halfZ}:w.bounds,walkable:s?[{shape:'polygon',vertices:[{x:s.x-s.halfX,z:s.z-s.halfZ},{x:s.x+s.halfX,z:s.z-s.halfZ},{x:s.x+s.halfX,z:s.z+s.halfZ},{x:s.x-s.halfX,z:s.z+s.halfZ}]}]:w.walkable,
 obstacles:s?[]:[...w.obstacles,...w.surfaces.filter(s=>s.kind==='ramp').map(s=>({shape:'rect',x:s.x,z:s.z+.35,halfX:s.halfX,halfZ:s.halfZ-.35}))]};
 cache.layers.set(id,layer);return layer;
}
export function stepSurface(w,p,x,z,r,valid){
 const id=surfaceId(p),s=w.surfaces.find(s=>s.id===id);
 if(!s){
  for(const ramp of w.surfaces.filter(s=>s.kind==='ramp'))if(!p.enemyType&&Math.abs(x-ramp.x)<ramp.halfX-r&&p.z<=ramp.z-ramp.halfZ+.12&&z>=ramp.z-ramp.halfZ&&z<ramp.z-ramp.halfZ+.3)return {x,z,y:surfaceHeight(ramp,z),surface:ramp.id};
  if(valid(layerWorld(w,'ground'),x,z,r))return {x,z,y:0,surface:'ground'};
 }else{
  if(containsSurface(s,x,z,r)&&valid(layerWorld(w,id),x,z,r))return {x,z,y:surfaceHeight(s,z),surface:id};
  // End connectors permit full width traversal; sides remain solid boundaries.
  if(s.kind==='ramp'&&Math.abs(x-s.x)<=s.halfX-r){
   if(z<p.z&&z<s.z-s.halfZ+.05&&valid(layerWorld(w,'ground'),x,z,r))return {x,z,y:0,surface:'ground'};
   const deck=w.surfaces.find(d=>d.id===s.to);
   if(z>=s.z+s.halfZ-r&&z<=s.z+s.halfZ+r+.3)return {x,z,y:surfaceHeight(s,z),surface:z>=s.z+s.halfZ?deck.id:id};
  }
  if(s.kind==='deck')for(const ramp of w.surfaces.filter(r=>r.to===id))if(Math.abs(x-ramp.x)<=ramp.halfX-r&&Math.abs(z-(ramp.z+ramp.halfZ))<=r+.3)return {x,z,y:surfaceHeight(ramp,z),surface:z<s.z-s.halfZ?ramp.id:id};
  if(s.kind==='ramp'&&Math.abs(x-s.x)<=s.halfX-r&&z>=s.z-s.halfZ&&z<=s.z+s.halfZ)return {x,z,y:surfaceHeight(s,z),surface:id};
 }
 return null;
}
