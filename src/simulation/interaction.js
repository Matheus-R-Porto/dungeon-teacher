import { clearSegment } from '../world/collision.js';

export function validateInteractables(items) {
  if (!Array.isArray(items)) throw new Error('Lista de interações inválida.');
  const ids = new Set();
  for (const item of items) {
    if (!item.id || ids.has(item.id) || ![item.x, item.z, item.radius, item.priority ?? 0].every(Number.isFinite) || item.radius <= 0 || !item.label || !item.action || !item.content) throw new Error(`Interação inválida: ${item.id}`);
    ids.add(item.id);
  }
  return items;
}

export class InteractionSystem {
  constructor(world, items) { this.world = world; this.items = validateInteractables(items); this.selected = null; }
  update(player, blocked = false) {
    if (blocked) { this.selected = null; return null; }
    const candidates = [];
    for (const item of this.items) {
      if (item.enabled === false) continue;
      const dx = item.x - player.x, dz = item.z - player.z, distance = Math.hypot(dx, dz);
      if (distance > item.radius) continue;
      const visibleWorld = { ...this.world, obstacles: this.world.obstacles.filter(o => !(item.ignoreObstacles ?? []).includes(o.id)) };
      if (!clearSegment(visibleWorld, player, item, 0.025)) continue;
      const facing = distance ? (Math.sin(player.heading) * dx + Math.cos(player.heading) * dz) / distance : 1;
      candidates.push({ item, score: (item.priority ?? 0) * 10 - distance + facing * 0.35 });
    }
    candidates.sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id, 'en'));
    const best = candidates[0], previous = candidates.find(c => c.item.id === this.selected?.id);
    // Small hysteresis prevents flashing between two almost equally suitable targets.
    this.selected = previous && best.score - previous.score < 0.15 ? previous.item : best?.item ?? null;
    return this.selected;
  }
  activate(player, blocked = false) {
    const item = this.update(player, blocked); // Revalidate at F, not only when the prompt appeared.
    return item ? { type: item.action, targetId: item.id, content: item.content } : null;
  }
}
