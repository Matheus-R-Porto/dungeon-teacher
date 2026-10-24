import { canStand, clearSegment } from './collision.js';
import {surfaceId,layerWorld,surfaceHeight,containsSurface} from './surfaces.js';

export function findPath(world, start, destination, radius, cell = 0.5, local = false) {
  if(world.surfaces){
    const from=surfaceId(start),to=surfaceId(destination),surfaces=world.surfaces;
    if(start.enemyType&&from!==to)return null;
    if(to!=='ground'&&!surfaces.some(s=>s.id===to&&containsSurface(s,destination.x,destination.z,radius)))return null;
    const point=(p,id)=>({...p,surface:id,y:id==='ground'?0:surfaceHeight(surfaces.find(s=>s.id===id),p.z)});
    // A surface switch happens at the connector center, before the whole actor
    // clears its edge. A new click there must finish the short crossing first.
    if(!start.enemyType&&from!=='ground'&&!canStand(layerWorld(world,from),start.x,start.z,radius)){
      const s=surfaces.find(s=>s.id===from),r=s.kind==='ramp'?s:surfaces.find(r=>r.kind==='ramp'&&r.to===from);
      if(r&&Math.abs(start.x-r.x)<r.halfX-radius){
        const edge=s.kind==='ramp'?(start.z<s.z?s.z-s.halfZ:s.z+s.halfZ):r.z+r.halfZ;
        if(Math.abs(start.z-edge)<radius+.3){
          const z=s.kind==='ramp'?Math.max(s.z-s.halfZ+radius+.15,Math.min(s.z+s.halfZ-radius-.15,start.z)):edge+radius+.15;
          const safe=point({x:start.x,z},from);
          if(canStand(layerWorld(world,from),safe.x,safe.z,radius)){const rest=findPath(world,safe,destination,radius,cell,local);if(rest)return [safe,...rest];}
        }
      }
    }
    if(from===to){const route=findPath(layerWorld(world,from),start,destination,radius,cell,local);return route?.map(p=>point(p,from))??null;}
    const nodes=[{...start,id:'start',surface:from},{...destination,id:'end',surface:to}],edges=[];
    for(const s of surfaces.filter(s=>s.kind==='ramp')){
      const offset=nodes.length;
      nodes.push({id:offset,x:s.x,z:s.z-s.halfZ-radius-.15,surface:'ground'}, {id:offset+1,x:s.x,z:s.z-s.halfZ+radius+.15,surface:s.id}, {id:offset+2,x:s.x,z:s.z+s.halfZ-radius-.15,surface:s.id}, {id:offset+3,x:s.x,z:s.z+s.halfZ+radius+.15,surface:s.to});
      edges.push([offset,offset+1],[offset+2,offset+3]);
    }
    const queue=[0],seen=new Set(queue),parents=new Map();
    for(let k=0;k<queue.length&&!seen.has(1);k++){const i=queue[k];for(let j=0;j<nodes.length;j++){
      if(seen.has(j))continue;let route;
      if(edges.some(([a,b])=>a===i&&b===j||a===j&&b===i))route=[point(nodes[j],nodes[j].surface)];
      else if(nodes[i].surface===nodes[j].surface)route=findPath(layerWorld(world,nodes[i].surface),nodes[i],nodes[j],radius,cell,nodes[i].surface!=='ground')?.map(p=>point(p,nodes[j].surface));
      if(route){seen.add(j);parents.set(j,{i,route});queue.push(j);}
    }}
    if(!seen.has(1))return null;const route=[];let j=1;while(j){const p=parents.get(j);route.unshift(...p.route);j=p.i;}return route;
  }
  if (!canStand(world, destination.x, destination.z, radius)) return null;
  if (clearSegment(world, start, destination, radius)) return [{ ...destination }];
  if(world.graph&&!local&&Math.hypot(destination.x-start.x,destination.z-start.z)>24){
    const nearest=p=>world.graph.regions.reduce((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)<Math.hypot(b.x-p.x,b.z-p.z)?a:b);
    const first=nearest(start),last=nearest(destination),queue=[first.id],seen=new Set(queue),parents=new Map();
    for(let i=0;i<queue.length&&!seen.has(last.id);i++)for(const t of world.trails){if(t.gateId&&world.obstacles.some(o=>o.id===t.gateId&&!o.open))continue;const to=t.from===queue[i]?t.to:t.to===queue[i]?t.from:null;if(to&&!seen.has(to)){seen.add(to);parents.set(to,{from:queue[i],trail:t});queue.push(to);}}
    if(!seen.has(last.id))return null;const edges=[];let id=last.id;while(id!==first.id){const p=parents.get(id);edges.unshift(p.trail.from===p.from?p.trail.points:[...p.trail.points].reverse());id=p.from;}
    let cursor=start;const route=[];for(const point of [first,...edges.flat(),destination]){if(Math.hypot(point.x-cursor.x,point.z-cursor.z)<.01)continue;const part=findPath(world,cursor,point,radius,cell,true);if(!part)return null;route.push(...part);cursor=point;}if(world.openTower){const smooth=[];let origin=start,k=0;while(k<route.length){let next=route.length-1;while(next>k&&!clearSegment(world,origin,route[next],radius))next--;smooth.push(route[next]);origin=route[next];k=next+1;}return smooth;}let skip=0;for(let i=1;i<route.length;i++)if(clearSegment(world,start,route[i],radius))skip=i;return route.slice(skip);
  }
  const b = world.graph?{minX:Math.max(world.bounds.minX,Math.min(start.x,destination.x)-14),maxX:Math.min(world.bounds.maxX,Math.max(start.x,destination.x)+14),minZ:Math.max(world.bounds.minZ,Math.min(start.z,destination.z)-14),maxZ:Math.min(world.bounds.maxZ,Math.max(start.z,destination.z)+14)}:world.bounds;
  // Every grid point and smoothing segment lies in this convex search rectangle.
  // Cull only obstacles whose expanded bounds cannot intersect it. Query-local:
  // moving/open obstacles are reread on every search, no stale global cache.
  const searchWorld={...world,obstacles:world.obstacles.filter(o=>{const x=o.shape==='circle'?o.radius:o.halfX,z=o.shape==='circle'?o.radius:o.halfZ;return o.x+x+radius>=b.minX&&o.x-x-radius<=b.maxX&&o.z+z+radius>=b.minZ&&o.z-z-radius<=b.maxZ;})};
  const width = Math.floor((b.maxX - b.minX) / cell) + 1;
  const height = Math.floor((b.maxZ - b.minZ) / cell) + 1;
  const point = (id) => ({ x: b.minX + (id % width) * cell, z: b.minZ + Math.floor(id / width) * cell });
  const adjacentId = (p) => {
    let best = -1, distance = Infinity;
    const cx = Math.round((p.x - b.minX) / cell), cz = Math.round((p.z - b.minZ) / cell);
    for (let z = cz - 2; z <= cz + 2; z++) for (let x = cx - 2; x <= cx + 2; x++) {
      if (x < 0 || z < 0 || x >= width || z >= height) continue;
      const id = z * width + x, candidate = point(id), d = Math.hypot(p.x - candidate.x, p.z - candidate.z);
      if (d < distance && clearSegment(searchWorld, p, candidate, radius)) { distance = d; best = id; }
    }
    return best;
  };
  const first = adjacentId(start), last = adjacentId(destination);
  const occupancy=new Map();const stand=id=>{if(!occupancy.has(id)){const p=point(id);occupancy.set(id,canStand(searchWorld,p.x,p.z,radius));}return occupancy.get(id);};
  if (first < 0 || last < 0) return null;
  const heuristic = (id) => {
    const dx = Math.abs(id % width - last % width), dz = Math.abs(Math.floor(id / width) - Math.floor(last / width));
    return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
  };
  const heap=[];const push=(id,score)=>{let i=heap.length;heap.push({id,score});while(i){const parent=(i-1)>>1;if(heap[parent].score<=score)break;heap[i]=heap[parent];i=parent;}heap[i]={id,score};};const pop=()=>{const first=heap[0],tail=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].score<heap[child].score)child++;if(heap[child].score>=tail.score)break;heap[i]=heap[child];i=child;}heap[i]=tail;}return first;};push(first,heuristic(first));
  const open = new Set([first]), closed = new Set(), parents = new Map(), costs = new Map([[first, 0]]), scores = new Map([[first, heuristic(first)]]);
  while (heap.length) {
    const candidate=pop();let current=candidate.id;if(closed.has(current)||candidate.score!==scores.get(current))continue;
    if (current === last) {
      const route = [destination, point(last)];
      while (parents.has(current)) { current = parents.get(current); route.push(point(current)); }
      route.push(start); route.reverse();
      const smoothed = [];
      let index = 0;
      while (index < route.length - 1) {
        let next = route.length - 1;
        while (next > index + 1 && !clearSegment(searchWorld, route[index], route[next], radius)) next--;
        smoothed.push(route[next]); index = next;
      }
      return smoothed;
    }
    open.delete(current); closed.add(current);
    const cx = current % width, cz = Math.floor(current / width), from = point(current);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dz) continue;
      const x = cx + dx, z = cz + dz;
      if (x < 0 || x >= width || z < 0 || z >= height) continue;
      const id = z * width + x;
      if (closed.has(id)) continue;
      if(!stand(id))continue;
      if (dx && dz && (!stand(cz*width+x) || !stand(z*width+cx))) continue;
      if (!clearSegment(searchWorld, from, point(id), radius, true)) continue;
      const cost = costs.get(current) + (dx && dz ? Math.SQRT2 : 1);
      if (cost >= (costs.get(id) ?? Infinity)) continue;
      parents.set(id, current); costs.set(id, cost); scores.set(id, cost + heuristic(id)); open.add(id);push(id,scores.get(id));
    }
  }
  return null;
}
