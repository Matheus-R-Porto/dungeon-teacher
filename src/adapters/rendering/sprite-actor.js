import * as THREE from 'three';
import { animationFrame, resolveFacing } from '../../core/actor-animation.js';
import { createPlaceholderAtlas } from './placeholder-poses.js';

// Temporary original 2D pixel art. Replace the atlas with production art without
// changing movement, heading or the animation selection contract.
function makeAtlas() {
  const canvas = createPlaceholderAtlas();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false;
  texture.repeat.set(1 / 6, 1 / 8);
  return texture;
}

export class SpriteActor {
  constructor(scene, { atlas = makeAtlas(), width = 1.38, height = 2.07 } = {}) {
    this.texture = atlas;
    this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: atlas, transparent: true, alphaTest: 0.1, depthWrite: true, toneMapped: false }));
    // Camera-facing quad, anchored at its feet in world coordinates.
    this.sprite.center.set(0.5, 0.04); this.sprite.scale.set(width, height, 1); scene.add(this.sprite);
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.39, 24), new THREE.MeshBasicMaterial({ color: 0x263c37, transparent: true, opacity: 0.25, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.scale.y = 0.8; scene.add(this.shadow);
  }
  update({ x, z, heading, moving, animation }, azimuth, time, reducedMotion) {
    const animationState = animation ?? (moving ? 'walk' : 'idle');
    this.facing = resolveFacing(heading, azimuth, this.facing?.direction);
    this.facing.animationState = animationState;
    const direction = this.facing.direction;
    const frame = animationFrame(animationState, reducedMotion ? 0 : time);
    this.texture.offset.set(frame / 6, 1 - (direction + 1) / 8);
    this.sprite.position.set(x, 0.055, z); this.shadow.position.set(x, 0.035, z);
  }
  dispose() { this.texture.dispose(); }
}
