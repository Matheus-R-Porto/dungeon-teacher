// Shared finite contours for rendering, navigation and casting. No GPU dependency.
export function pointInWater(w,p){
 if(Math.abs(p.x-w.x)>w.radiusX*1.06||Math.abs(p.z-w.z)>w.radiusZ*1.06)return false;
 let inside=false;const v=w.vertices;
 for(let i=0,j=v.length-1;i<v.length;j=i++){const a=v[i],b=v[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)inside=!inside;}
 return inside;
}
const distanceSegment=(p,a,b)=>{const x=b.x-a.x,z=b.z-a.z,l=x*x+z*z,t=l?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.z-a.z)*z)/l)):0;return Math.hypot(p.x-a.x-t*x,p.z-a.z-t*z);};
export function touchesWater(w,p,r=0){if(Math.abs(p.x-w.x)>w.radiusX*1.06+r||Math.abs(p.z-w.z)>w.radiusZ*1.06+r)return false;return pointInWater(w,p)||w.vertices.some((a,i)=>distanceSegment(p,a,w.vertices[(i+1)%w.vertices.length])<r+1e-8);}
export function crossesWater(w,a,b,r=0){
 if(Math.max(a.x,b.x)<w.x-w.radiusX*1.06-r||Math.min(a.x,b.x)>w.x+w.radiusX*1.06+r||Math.max(a.z,b.z)<w.z-w.radiusZ*1.06-r||Math.min(a.z,b.z)>w.z+w.radiusZ*1.06+r)return false;
 if(touchesWater(w,a,r)||touchesWater(w,b,r))return true;
 const cross=(p,q,s)=>(q.x-p.x)*(s.z-p.z)-(q.z-p.z)*(s.x-p.x);
 return w.vertices.some((c,i)=>{const d=w.vertices[(i+1)%w.vertices.length];return cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0&&Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))<=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))&&Math.max(Math.min(a.z,b.z),Math.min(c.z,d.z))<=Math.min(Math.max(a.z,b.z),Math.max(c.z,d.z))||Math.min(distanceSegment(c,a,b),distanceSegment(d,a,b),distanceSegment(a,c,d),distanceSegment(b,c,d))<r;});
}
export function installWaterGeometry(w){
 const living=!!w.livingTower;
 const bodies=[...(w.waterFeatures??[]),...(w.livingTower?.water??[])].map(p=>{
  const rx=p.waterBounds?.radiusX??p.radiusX,rz=p.waterBounds?.radiusZ??p.radiusZ,n=living?32:16;
  const vertices=Array.from({length:n},(_,i)=>{const a=i*Math.PI*2/n,r=living?1+.06*Math.sin(a*5+p.x):1;return {x:p.x+Math.cos(a)*rx*r,z:p.z-Math.sin(a)*rz*r};});
  return {...p,radiusX:rx,radiusZ:rz,y:p.y??(living?.058:.05),surface:p.surface??'ground',fishingCompatible:true,traversable:false,vertices};
 });
 for(const p of w.livingTower?.water??[])p.traversable=false;
 // A dry bank around each pond connects the trail to the clearing even where
 // the old decorative pond overlapped a narrow terrain neck. Water stays solid.
 if(w.walkable&&!w.openTower){const land=w.walkable.filter(p=>!p.waterBank);for(const b of bodies)if(b.surface==='ground')land.push({waterBank:b.id,x:b.x,z:b.z,radius:Math.max(b.radiusX,b.radiusZ)*1.06+1.8});w.walkable=land;}
 if(JSON.stringify(w.waterBodies)!==JSON.stringify(bodies)){w.waterBodies=bodies;w.navRevision=(w.navRevision??0)+1;}return w;
}
export const waterAt=(w,p)=>(w.waterBodies??[]).find(b=>b.surface===(p.surface??'ground')&&pointInWater(b,p));
