export const CONFIG = Object.freeze({
  tick: 1 / 30,
  maxCatchUpTicks: 5,
  playerSpeed: 3.6,
  playerRadius: 0.32,
  navigationCell: 0.5,
  cameraElevation: Math.atan(1 / Math.sqrt(2)),
  cameraHeight: 23,
  minCameraHeight: 16,
  maxCameraHeight: 30,
  cameraOrbitSpeed: 1.45,
  cameraDragSensitivity: 0.006,
  cameraZoomResponse: 12,
});

export function validateHub(hub) {
  const finite = (...values) => values.every(Number.isFinite);
  const b = hub?.bounds;
  if (!b || !finite(b.minX, b.maxX, b.minZ, b.maxZ) || b.minX >= b.maxX || b.minZ >= b.maxZ) throw new Error('Limites inválidos do refúgio.');
  if (!finite(hub.spawn?.x, hub.spawn?.z, hub.portal?.x, hub.portal?.z, hub.portal?.interactRadius) || hub.portal.interactRadius <= 0) throw new Error('Entrada ou portal inválido.');
  if (!Array.isArray(hub.obstacles)) throw new Error('Obstáculos ausentes.');
  const ids = new Set();
  for (const o of hub.obstacles) {
    if (!o.id || ids.has(o.id) || !finite(o.x, o.z)) throw new Error(`Obstáculo inválido: ${o.id}`);
    ids.add(o.id);
    if (o.shape === 'circle' && finite(o.radius) && o.radius > 0) continue;
    if (o.shape === 'rect' && finite(o.halfX, o.halfZ) && o.halfX > 0 && o.halfZ > 0) continue;
    throw new Error(`Forma inválida: ${o.id}`);
  }
  return hub;
}
