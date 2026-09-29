import { canStand, clearSegment } from './collision.js';

export function findPath(world, start, destination, radius, cell = 0.5, local = false) {
  if (!canStand(world, destination.x, destination.z, radius)) return null;
  if (clearSegment(world, start, destination, radius)) return [{ ...destination }];
  if(world.graph&&!local&&Math.hypot(destination.x-start.x,destination.z-start.z)>24){
    const nearest=p=>world.graph.regions.reduce((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)<Math.hypot(b.x-p.x,b.z-p.z)?a:b);
    const first=nearest(start),last=nearest(destination),queue=[first.id],seen=new Set(queue),parents=new Map();
    for(let i=0;i<queue.length&&!seen.has(last.id);i++)for(const t of world.trails){if(t.gateId&&world.obstacles.some(o=>o.id===t.gateId&&!o.open))continue;const to=t.from===queue[i]?t.to:t.to===queue[i]?t.from:null;if(to&&!seen.has(to)){seen.add(to);parents.set(to,{from:queue[i],trail:t});queue.push(to);}}
    if(!seen.has(last.id))return null;const edges=[];let id=last.id;while(id!==first.id){const p=parents.get(id);edges.unshift(p.trail.from===p.from?p.trail.points:[...p.trail.points].reverse());id=p.from;}
    let cursor=start;const route=[];for(const point of [first,...edges.flat(),destination]){if(Math.hypot(point.x-cursor.x,point.z-cursor.z)<.01)continue;const part=findPath(world,cursor,point,radius,cell,true);if(!part)return null;route.push(...part);cursor=point;}let skip=0;for(let i=1;i<route.length;i++)if(clearSegment(world,start,route[i],radius))skip=i;return route.slice(skip);
  }
  const b = world.graph?{minX:Math.max(world.bounds.minX,Math.min(start.x,destination.x)-14),maxX:Math.min(world.bounds.maxX,Math.max(start.x,destination.x)+14),minZ:Math.max(world.bounds.minZ,Math.min(start.z,destination.z)-14),maxZ:Math.min(world.bounds.maxZ,Math.max(start.z,destination.z)+14)}:world.bounds;
  const width = Math.floor((b.maxX - b.minX) / cell) + 1;
  const height = Math.floor((b.maxZ - b.minZ) / cell) + 1;
  const point = (id) => ({ x: b.minX + (id % width) * cell, z: b.minZ + Math.floor(id / width) * cell });
  const adjacentId = (p) => {
    let best = -1, distance = Infinity;
    const cx = Math.round((p.x - b.minX) / cell), cz = Math.round((p.z - b.minZ) / cell);
    for (let z = cz - 2; z <= cz + 2; z++) for (let x = cx - 2; x <= cx + 2; x++) {
      if (x < 0 || z < 0 || x >= width || z >= height) continue;
      const id = z * width + x, candidate = point(id), d = Math.hypot(p.x - candidate.x, p.z - candidate.z);
      if (d < distance && clearSegment(world, p, candidate, radius)) { distance = d; best = id; }
    }
    return best;
  };
  const first = adjacentId(start), last = adjacentId(destination);
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
        while (next > index + 1 && !clearSegment(world, route[index], route[next], radius)) next--;
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
      if (dx && dz && (!canStand(world, from.x + dx * cell, from.z, radius) || !canStand(world, from.x, from.z + dz * cell, radius))) continue;
      if (!clearSegment(world, from, point(id), radius)) continue;
      const cost = costs.get(current) + (dx && dz ? Math.SQRT2 : 1);
      if (cost >= (costs.get(id) ?? Infinity)) continue;
      parents.set(id, current); costs.set(id, cost); scores.set(id, cost + heuristic(id)); open.add(id);push(id,scores.get(id));
    }
  }
  return null;
}
