import { wrapAngle } from './orbit.js';

// Atlas rows are screen-relative: South/front, SW, W, NW, N/back, NE, E, SE.
export const SPRITE_DIRECTIONS = ['S', 'SO', 'O', 'NO', 'N', 'NE', 'E', 'SE'];
export const ACTOR_ANIMATIONS = Object.freeze({
  idle: { first: 0, frames: 2, fps: 2 },
  walk: { first: 2, frames: 4, fps: 8 },
});
export function visualDirection(heading, cameraAzimuth) {
  return Math.round(wrapAngle(cameraAzimuth - heading) / (Math.PI / 4)) % 8;
}
export function resolveFacing(worldFacing, cameraYaw, previousDirection = null, hysteresis = 3 * Math.PI / 180) {
  const relativeAngle = wrapAngle(worldFacing - cameraYaw);
  const viewAngle = wrapAngle(-relativeAngle);
  let direction = visualDirection(worldFacing, cameraYaw);
  if (Number.isInteger(previousDirection) && previousDirection >= 0 && previousDirection < 8) {
    const difference = Math.atan2(Math.sin(viewAngle - previousDirection * Math.PI / 4), Math.cos(viewAngle - previousDirection * Math.PI / 4));
    if (Math.abs(difference) <= Math.PI / 8 + hysteresis) direction = previousDirection;
  }
  return { worldFacing, cameraYaw: wrapAngle(cameraYaw), relativeAngle, direction, visualFacing: SPRITE_DIRECTIONS[direction] };
}
export function worldFacingLabel(angle) {
  // Existing world convention: zero = +Z (S); PI = -Z (N); PI/2 = +X (E).
  return ['S', 'SE', 'E', 'NE', 'N', 'NO', 'O', 'SO'][Math.round(wrapAngle(angle) / (Math.PI / 4)) % 8];
}
export function animationFrame(state, time, animations = ACTOR_ANIMATIONS) {
  // Future attack/skill/hit/death clips can be data entries; absent art uses idle.
  const clip = animations[state] ?? animations.idle;
  return clip.first + Math.floor(Math.max(0, time) * clip.fps) % clip.frames;
}
