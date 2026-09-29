// Playable forest is the union of clearings and trail capsules. Borders are rendered as roots/forest.
export function insideTerrain(world,x,z,radius=0){
 if(!world.walkable)return true;
 return world.walkable.some(s=>{if(!s.a)return Math.hypot(x-s.x,z-s.z)<=s.radius-radius;const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,t=Math.max(0,Math.min(1,((x-s.a.x)*dx+(z-s.a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-s.a.x-t*dx,z-s.a.z-t*dz)<=s.radius-radius;});
}
export function canStand(world, x, z, radius) {
  if (![x, z, radius].every(Number.isFinite) || radius <= 0) return false;
  if(!insideTerrain(world,x,z,radius))return false;
  const b = world.bounds;
  if (x - radius < b.minX || x + radius > b.maxX || z - radius < b.minZ || z + radius > b.maxZ) return false;
  for (const obstacle of world.obstacles) {
    if(obstacle.open)continue;
    if (obstacle.shape === 'circle') {
      if (Math.hypot(x - obstacle.x, z - obstacle.z) < radius + obstacle.radius) return false;
    } else {
      const nx = Math.max(obstacle.x - obstacle.halfX, Math.min(x, obstacle.x + obstacle.halfX));
      const nz = Math.max(obstacle.z - obstacle.halfZ, Math.min(z, obstacle.z + obstacle.halfZ));
      if (Math.hypot(x - nx, z - nz) < radius) return false;
    }
  }
  return true;
}

// Exact segment tests use conservatively expanded boxes; no sampled corner cutting.
export function clearSegment(world, a, b, radius) {
  if (!canStand(world, a.x, a.z, radius) || !canStand(world, b.x, b.z, radius)) return false;
  const dx = b.x - a.x, dz = b.z - a.z;
  if(world.walkable&&!terrainSegmentClear(world,a,b,radius))return false;
  for (const o of world.obstacles) {
    if(o.open)continue;
    if (o.shape === 'circle') {
      const length2 = dx * dx + dz * dz;
      const t = length2 ? Math.max(0, Math.min(1, ((o.x - a.x) * dx + (o.z - a.z) * dz) / length2)) : 0;
      if (Math.hypot(a.x + t * dx - o.x, a.z + t * dz - o.z) < o.radius + radius) return false;
    } else {
      let near = 0, far = 1;
      for (const [p, d, min, max] of [[a.x, dx, o.x - o.halfX - radius, o.x + o.halfX + radius], [a.z, dz, o.z - o.halfZ - radius, o.z + o.halfZ + radius]]) {
        if (Math.abs(d) < 1e-10) { if (p <= min || p >= max) { near = 2; break; } }
        else { const t1 = (min - p) / d, t2 = (max - p) / d; near = Math.max(near, Math.min(t1, t2)); far = Math.min(far, Math.max(t1, t2)); }
      }
      if (near < far && far > 0 && near < 1) return false;
    }
  }
  return true;
}

// Exact interval union avoids missing tiny concave gaps between overlapping clearings.
function terrainSegmentClear(world,a,b,radius){
 const dx=b.x-a.x,dz=b.z-a.z,length2=dx*dx+dz*dz,intervals=[];
 if(length2<1e-20)return insideTerrain(world,a.x,a.z,radius);
 const circle=(x,z,r)=>{const ox=a.x-x,oz=a.z-z,p=ox*dx+oz*dz,q=ox*ox+oz*oz-r*r,disc=p*p-length2*q;if(disc<0)return;const root=Math.sqrt(disc);intervals.push([Math.max(0,(-p-root)/length2),Math.min(1,(-p+root)/length2)]);};
 for(const s of world.walkable){const r=s.radius-radius;if(r<=0)continue;if(!s.a){circle(s.x,s.z,r);continue;}circle(s.a.x,s.a.z,r);circle(s.b.x,s.b.z,r);const sx=s.b.x-s.a.x,sz=s.b.z-s.a.z,len=Math.hypot(sx,sz),ux=sx/len,uz=sz/len,ox=a.x-s.a.x,oz=a.z-s.a.z;let near=0,far=1;for(const [p,d,min,max]of [[ox*ux+oz*uz,dx*ux+dz*uz,0,len],[-ox*uz+oz*ux,-dx*uz+dz*ux,-r,r]]){if(Math.abs(d)<1e-12){if(p<min||p>max){near=2;break;}}else{const t1=(min-p)/d,t2=(max-p)/d;near=Math.max(near,Math.min(t1,t2));far=Math.min(far,Math.max(t1,t2));}}if(near<=far)intervals.push([near,far]);}
 intervals.sort((x,y)=>x[0]-y[0]);let covered=0;for(const [from,to]of intervals){if(to<covered)continue;if(from>covered+1e-10)return false;covered=Math.max(covered,to);if(covered>=1-1e-10)return true;}return false;
}

export function moveWithCollision(world, position, dx, dz, radius) {
  const result = { ...position };
  // Substeps keep large deltas from tunneling through thin obstacles.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (radius * 0.45)));
  for (let i = 0; i < steps; i++) {
    const x = dx / steps, z = dz / steps;
    if (canStand(world, result.x + x, result.z + z, radius)) { result.x += x; result.z += z; }
    else {
      if (canStand(world, result.x + x, result.z, radius)) result.x += x;
      if (canStand(world, result.x, result.z + z, radius)) result.z += z;
    }
  }
  return result;
}
