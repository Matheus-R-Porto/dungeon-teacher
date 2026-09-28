import { CONFIG } from './config.js';

export const wrapAngle = angle => ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

// No angular easing: releasing the control leaves the exact last orientation.
export class OrbitState {
  constructor() {
    this.azimuth = Math.PI / 4;
    this.height = CONFIG.cameraHeight;
    this.targetHeight = this.height;
    this.traveled = 0;
  }
  rotate(radians) {
    if (!Number.isFinite(radians) || radians === 0) return;
    this.azimuth = wrapAngle(this.azimuth + radians);
    this.traveled += Math.abs(radians);
  }
  drag(deltaX) { this.rotate(deltaX * CONFIG.cameraDragSensitivity); }
  zoom(delta) {
    if (Number.isFinite(delta)) this.targetHeight = Math.max(CONFIG.minCameraHeight, Math.min(CONFIG.maxCameraHeight, this.targetHeight + delta));
  }
  update(dt, direction = 0, reducedMotion = false) {
    this.rotate(Math.max(-1, Math.min(1, direction)) * CONFIG.cameraOrbitSpeed * dt);
    this.height += (this.targetHeight - this.height) * (reducedMotion ? 1 : 1 - Math.exp(-dt * CONFIG.cameraZoomResponse));
    if (Math.abs(this.height - this.targetHeight) < 0.001) this.height = this.targetHeight;
  }
  get degrees() { return this.azimuth * 180 / Math.PI; }
}
