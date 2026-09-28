export function canStand(world, x, z, radius) {
  if (![x, z, radius].every(Number.isFinite) || radius <= 0) return false;
  const b = world.bounds;
  if (x - radius < b.minX || x + radius > b.maxX || z - radius < b.minZ || z + radius > b.maxZ) return false;
  for (const obstacle of world.obstacles) {
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
  for (const o of world.obstacles) {
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
