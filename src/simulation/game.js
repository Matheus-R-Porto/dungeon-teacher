import { CONFIG } from '../core/config.js';
import { canStand, moveWithCollision } from '../world/collision.js';
import { findPath } from '../world/navigation.js';

export function cameraDirection(horizontal, vertical, azimuth) {
  const length = Math.hypot(horizontal, vertical);
  if (!length) return { x: 0, z: 0 };
  return { x: (horizontal * Math.cos(azimuth) + vertical * Math.sin(azimuth)) / length, z: (-horizontal * Math.sin(azimuth) + vertical * Math.cos(azimuth)) / length };
}

export class Game {
  constructor(world) {
    this.world = world;
    if (!canStand(world, world.spawn.x, world.spawn.z, CONFIG.playerRadius)) throw new Error('A posição inicial está bloqueada.');
    this.player = { ...world.spawn, heading: Math.PI, moving: false };
    this.previous = { ...this.player };
    this.path = [];
    this.distance = 0;
    this.portalFound = false;
    this.paused = false;
    this.elapsed = 0;
  }
  moveTo(destination) {
    const route = findPath(this.world, this.player, destination, CONFIG.playerRadius, CONFIG.navigationCell);
    this.path = route ?? [];
    return route !== null;
  }
  cancel() { this.path = []; this.player.moving = false; }
  get nearPortal() { return Math.hypot(this.player.x - this.world.portal.x, this.player.z - this.world.portal.z) <= this.world.portal.interactRadius; }
  update(dt, axis, azimuth) {
    this.previous = { ...this.player };
    if (this.paused) return;
    this.elapsed += dt;
    let direction = { x: 0, z: 0 }, step = CONFIG.playerSpeed * dt;
    if (axis.x || axis.z) { this.path = []; direction = cameraDirection(axis.x, axis.z, azimuth); }
    else if (this.path.length) {
      const target = this.path[0], dx = target.x - this.player.x, dz = target.z - this.player.z, distance = Math.hypot(dx, dz);
      if (distance < 0.025) { this.path.shift(); return; }
      direction = { x: dx / distance, z: dz / distance }; step = Math.min(step, distance);
    }
    const next = moveWithCollision(this.world, this.player, direction.x * step, direction.z * step, CONFIG.playerRadius);
    const traveled = Math.hypot(next.x - this.player.x, next.z - this.player.z);
    this.player.moving = traveled > 0.0001;
    if (this.player.moving) this.player.heading = Math.atan2(next.x - this.player.x, next.z - this.player.z);
    this.player.x = next.x; this.player.z = next.z; this.distance += traveled;
    if (!this.player.moving && this.path.length && step > 0.001) this.path = [];
    if (this.nearPortal) this.portalFound = true;
  }
}
