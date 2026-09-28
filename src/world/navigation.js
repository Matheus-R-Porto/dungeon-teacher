import { canStand, clearSegment } from './collision.js';

export function findPath(world, start, destination, radius, cell = 0.5) {
  if (!canStand(world, destination.x, destination.z, radius)) return null;
  if (clearSegment(world, start, destination, radius)) return [{ ...destination }];
  const b = world.bounds;
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
  const open = new Set([first]), closed = new Set(), parents = new Map(), costs = new Map([[first, 0]]), scores = new Map([[first, heuristic(first)]]);
  while (open.size) {
    let current = -1, best = Infinity;
    for (const id of open) if (scores.get(id) < best) { current = id; best = scores.get(id); }
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
      parents.set(id, current); costs.set(id, cost); scores.set(id, cost + heuristic(id)); open.add(id);
    }
  }
  return null;
}
