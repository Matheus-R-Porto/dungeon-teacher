import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONFIG, validateHub } from '../src/core/config.js';
import { canStand, clearSegment, moveWithCollision } from '../src/world/collision.js';
import { findPath } from '../src/world/navigation.js';
import { Game, cameraDirection } from '../src/simulation/game.js';

const hub = JSON.parse(await readFile(new URL('../src/data/hub.json', import.meta.url), 'utf8'));
const emptyWorld = () => ({ bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 }, obstacles: [], spawn: { x: 0, z: 0 }, portal: { x: 10, z: 10, interactRadius: 3 } });
const radius = CONFIG.playerRadius;

test('hub validates and rejects malformed data and duplicate IDs', () => {
  assert.equal(validateHub(hub), hub);
  assert.throws(() => validateHub({ ...hub, bounds: { ...hub.bounds, maxX: NaN } }));
  assert.throws(() => validateHub({ ...hub, obstacles: [...hub.obstacles, hub.obstacles[0]] }));
  assert.throws(() => validateHub({ ...hub, obstacles: [{ id: 'invalid', x: 0, z: 0, shape: 'circle', radius: -1 }] }));
});

test('spawn is walkable and obstacle centers are not', () => {
  assert.ok(canStand(hub, hub.spawn.x, hub.spawn.z, radius));
  for (const o of hub.obstacles) assert.equal(canStand(hub, o.x, o.z, radius), false, o.id);
  assert.equal(canStand(hub, 12, 0, radius), false);
  assert.equal(canStand(hub, NaN, 0, radius), false);
});

test('camera-relative cardinal and diagonal vectors are normalized in all four views', () => {
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 2;
    for (const [h, v] of [[1, 0], [0, -1], [1, 1], [-1, -1]]) {
      const direction = cameraDirection(h, v, angle);
      assert.ok(Math.abs(Math.hypot(direction.x, direction.z) - 1) < 1e-10);
    }
    const up = cameraDirection(0, -1, angle);
    assert.ok(up.x * Math.sin(angle) + up.z * Math.cos(angle) < -0.999);
  }
  assert.deepEqual(cameraDirection(0, 0, 0), { x: 0, z: 0 });
});

test('diagonal travel has the same speed as cardinal travel', () => {
  const a = new Game(emptyWorld()), b = new Game(emptyWorld());
  for (let i = 0; i < 60; i++) { a.update(CONFIG.tick, { x: 1, z: 0 }, 0); b.update(CONFIG.tick, { x: 1, z: 1 }, 0); }
  assert.ok(Math.abs(a.distance - 7.2) < 1e-8);
  assert.ok(Math.abs(a.distance - b.distance) < 1e-8);
});

test('large movement cannot tunnel through a thin wall', () => {
  const world = emptyWorld(); world.obstacles = [{ shape: 'rect', x: 0, z: 0, halfX: 0.08, halfZ: 8 }];
  const end = moveWithCollision(world, { x: -3, z: 0 }, 10, 0, radius);
  assert.ok(end.x < -0.39); assert.ok(canStand(world, end.x, end.z, radius));
});

test('movement slides along walls without penetrating them', () => {
  const world = emptyWorld(); world.obstacles = [{ shape: 'rect', x: 0, z: 0, halfX: 0.5, halfZ: 8 }];
  const end = moveWithCollision(world, { x: -1, z: -2 }, 2, 2, radius);
  assert.ok(end.x <= -0.82); assert.ok(end.z > -0.2);
});

test('segment collision covers circles, rectangles, boundaries and parallel lines', () => {
  const world = emptyWorld();
  world.obstacles = [{ shape: 'circle', x: 0, z: 0, radius: 1 }, { shape: 'rect', x: 5, z: 0, halfX: 0.5, halfZ: 2 }];
  assert.equal(clearSegment(world, { x: -3, z: 0 }, { x: 3, z: 0 }, radius), false);
  assert.equal(clearSegment(world, { x: 3, z: 0 }, { x: 7, z: 0 }, radius), false);
  assert.equal(clearSegment(world, { x: 3, z: 4 }, { x: 7, z: 4 }, radius), true);
  assert.equal(clearSegment(world, { x: -3, z: 4 }, { x: -3, z: -4 }, radius), true);
  assert.equal(clearSegment(world, { x: -3, z: 4 }, { x: 21, z: 4 }, radius), false);
});

test('A* routes around an obstacle, with collision-free smoothed segments', () => {
  const world = emptyWorld(); world.obstacles = [{ shape: 'rect', x: 0, z: 0, halfX: 1, halfZ: 2 }];
  const start = { x: -4, z: 0 }, end = { x: 4, z: 0 };
  const route = findPath(world, start, end, radius);
  assert.ok(route && route.length > 1);
  let previous = start;
  for (const point of route) { assert.ok(clearSegment(world, previous, point, radius)); previous = point; }
  assert.deepEqual(route.at(-1), end);
});

test('blocked and disconnected destinations are rejected', () => {
  const world = emptyWorld(); world.obstacles = [{ shape: 'rect', x: 0, z: 0, halfX: 0.5, halfZ: 20 }];
  assert.equal(findPath(world, { x: -3, z: 0 }, { x: 3, z: 0 }, radius), null);
  assert.equal(findPath(hub, hub.spawn, { x: -4.7, z: 0.7 }, radius), null);
  assert.equal(findPath(hub, hub.spawn, { x: 40, z: 0 }, radius), null);
});

test('diagonal gaps narrower than the player do not allow corner cutting', () => {
  const world = { ...emptyWorld(), bounds: { minX: -2, maxX: 2, minZ: -2, maxZ: 2 }, obstacles: [
    { shape: 'rect', x: -1, z: 1, halfX: 1, halfZ: 1 },
    { shape: 'rect', x: 1, z: -1, halfX: 1, halfZ: 1 },
  ] };
  assert.equal(findPath(world, { x: -1, z: -1 }, { x: 1, z: 1 }, radius), null);
});

test('twenty hub destinations remain reachable and every route avoids collision', () => {
  const destinations = [[-10,-10],[-6,-8],[0,-9],[7,-8],[10,-10],[-10,-3],[-6,-1],[0,-3],[4,-3],[10,-2],[-10,4],[-5,4],[0,3],[7,4],[10,5],[-8,9],[-5,10],[0,10],[6,10],[10,10]];
  for (const [x,z] of destinations) {
    const route = findPath(hub, hub.spawn, { x,z }, radius);
    assert.ok(route, `${x}, ${z}`);
    let previous = hub.spawn;
    for (const point of route) { assert.ok(clearSegment(hub, previous, point, radius), `${x}, ${z}`); previous = point; }
  }
});

test('click movement arrives at destination and stops', () => {
  const game = new Game(hub), destination = { x: -6, z: -1 };
  assert.ok(game.moveTo(destination));
  for (let i = 0; i < 900; i++) { game.update(CONFIG.tick, { x: 0, z: 0 }, 0); assert.ok(canStand(hub, game.player.x, game.player.z, radius)); }
  assert.ok(Math.hypot(game.player.x - destination.x, game.player.z - destination.z) < 0.05);
  assert.equal(game.path.length, 0); assert.equal(game.player.moving, false);
});

test('WASD and explicit cancel interrupt the click path', () => {
  const game = new Game(hub);
  game.moveTo({ x: 0, z: 0 }); game.update(CONFIG.tick, { x: 1, z: 0 }, 0);
  assert.equal(game.path.length, 0);
  game.moveTo({ x: 0, z: 0 }); game.cancel(); assert.equal(game.path.length, 0);
});

test('pause preserves position, elapsed time and current path', () => {
  const game = new Game(hub); game.moveTo({ x: 0, z: 0 }); game.paused = true;
  const before = JSON.stringify({ player: game.player, path: game.path, elapsed: game.elapsed });
  for (let i = 0; i < 30; i++) game.update(CONFIG.tick, { x: 1, z: 1 }, 0);
  assert.equal(JSON.stringify({ player: game.player, path: game.path, elapsed: game.elapsed }), before);
});

test('portal proximity completes discovery with unchanged movement', () => {
  const game = new Game(hub);
  assert.ok(game.moveTo({ x: 0, z: -3.8 }));
  for (let i = 0; i < 180; i++) game.update(CONFIG.tick, { x: 0, z: 0 }, 0);
  assert.ok(game.nearPortal); assert.ok(game.portalFound);
});
