import {FishingVisual} from './fishing-visual.js';
import {buildForest} from './forest.js';
import * as THREE from 'three';
import { CONFIG } from '../../core/config.js';
import { OrbitState } from '../../core/orbit.js';
import { SpriteActor } from './sprite-actor.js';

const palette = { stone: 0xb6ad8e, stoneLight: 0xe3d2ac, darkStone: 0x757767, moss: 0x75a947, gold: 0xf3c66b, bark: 0x86603d, leaf: 0x358d56 };
const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, ...extra });
function randomSource(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }

export class SceneView {
  constructor(canvas, world) {
    this.canvas = canvas; this.world = world;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaccfc7);
    this.scene.fog = new THREE.FogExp2(0xaccfc7, 0.007);
    this.camera = new THREE.OrthographicCamera(-20, 20, 12, -12, 0.1, 120);
    this.orbit = new OrbitState();
    this.lookAt = new THREE.Vector3(world.spawn.x, 0.75, world.spawn.z);
    this.raycaster = new THREE.Raycaster();
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.occluders = [];
    this.mats = Object.fromEntries(Object.entries(palette).map(([name, color]) => [name, material(color)]));
    this.hemisphere=new THREE.HemisphereLight(0xe3f3ff, 0x718b45, 1.8);this.scene.add(this.hemisphere);
    const sun = new THREE.DirectionalLight(0xffe6b7, 2.6);
    sun.position.set(-8, 18, 8); sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 50 });
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.normalBias = 0.04;
    this.sun=sun;this.scene.add(sun);
    const rim = new THREE.DirectionalLight(0xb9e6f1, 1.0); rim.position.set(10, 6, -12); this.scene.add(rim);
    this.flags=[]; if(['forest','biome'].includes(world.environment))buildForest(this);else if(world.environment==='dungeon')this.buildDungeon();else {this.buildGround();this.buildEnvironment();this.buildLife();} this.buildPortal();this.buildNpcs();this.buildPlayer();this.buildParticles();
    this.fishingVisual=new FishingVisual(this);this.registerStructureOcclusion();
    this.interactionRing = this.mesh(new THREE.RingGeometry(0.8, 0.86, 48), new THREE.MeshBasicMaterial({ color: 0xffdf88, transparent: true, opacity: 0.8, depthWrite: false }), this.scene, 0, 0.25, 0);
    this.interactionRing.rotation.x = -Math.PI / 2; this.interactionRing.visible = false; this.interactionRing.castShadow = false;
    this.destination = this.mesh(new THREE.RingGeometry(0.28, 0.35, 32), new THREE.MeshBasicMaterial({ color: palette.gold, transparent: true, opacity: 0.8, depthWrite: false }), this.scene, 0, 0.045, 0);
    this.destination.rotation.x = -Math.PI / 2; this.destination.visible = false;
    this.pathLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: 0xd6c18a, transparent: true, opacity: 0.36, dashSize: 0.14, gapSize: 0.2 }));
    this.scene.add(this.pathLine);
    this.resize();
  }
  mesh(geometry, mat, parent, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geometry, mat); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  box(parent, width, height, depth, x, y, z, mat = this.mats.stone) { return this.mesh(new THREE.BoxGeometry(width, height, depth), mat, parent, x, y, z); }
  buildDungeon() {
    this.scene.background=new THREE.Color(0x1b2733);this.scene.fog=new THREE.FogExp2(0x1b2733,.01);
    const b=this.world.bounds,w=b.maxX-b.minX,d=b.maxZ-b.minZ;
    this.box(this.scene,w+.5,.5,d+.5,0,-.3,0,this.mats.darkStone);
    const tile=new THREE.PlaneGeometry(1.9,1.9);tile.rotateX(-Math.PI/2);
    const cols=Math.floor(w/2),rows=Math.floor(d/2),floor=new THREE.InstancedMesh(tile,material(0x596a70),cols*rows),dummy=new THREE.Object3D();
    for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){dummy.position.set(b.minX+1+x*2,0,b.minZ+1+z*2);dummy.updateMatrix();floor.setMatrixAt(z*cols+x,dummy.matrix);}floor.receiveShadow=true;this.scene.add(floor);
    for(const x of [b.minX-.25,b.maxX+.25])this.box(this.scene,.5,1.1,d+1,x,.55,0,this.mats.darkStone);
    for(const z of [b.minZ-.25,b.maxZ+.25])this.box(this.scene,w,1.1,.5,0,.55,z,this.mats.darkStone);
    for(const o of this.world.obstacles)this.box(this.scene,o.halfX*2,2.5,o.halfZ*2,o.x,1.25,o.z,this.mats.stone);
    for(const [x,z] of [[-10,-9],[10,-9],[-10,8],[10,8]])this.buildLantern(x,z);
  }
  buildForge(group){
    const iron=material(0x3d4048),coal=material(0xff7a2a,{emissive:0xff5a10,emissiveIntensity:1.1});
    this.box(group,.5,.42,.5,.18,.21,0,this.mats.darkStone);
    this.box(group,.9,.2,.36,.18,.52,0,iron);
    this.box(group,.5,.14,.28,.18,.69,0,iron);
    const horn=this.mesh(new THREE.ConeGeometry(.15,.38,5),iron,group,.7,.55,0);horn.rotation.z=-Math.PI/2;
    this.mesh(new THREE.CylinderGeometry(.3,.26,.46,10),this.mats.stone,group,-.42,.23,0);
    this.mesh(new THREE.CylinderGeometry(.24,.24,.05,10),coal,group,-.42,.47,0);
    this.forgeCoal=coal;
  }
  buildNpcs(){for(const npc of this.world.npcs??[]){const group=new THREE.Group();group.position.set(npc.x,0,npc.z);this.scene.add(group);this.box(group,.55,.85,.4,0,.8,0,material(0x926f49));this.mesh(new THREE.SphereGeometry(.25,8,6),material(0xddb890),group,0,1.48,0);for(const x of [-.17,.17])this.box(group,.17,.4,.2,x,.23,0,this.mats.darkStone);this.box(group,.7,npc.id==='cook'?.35:.1,.55,0,1.7,0,npc.id==='cook'?this.mats.stoneLight:this.mats.darkStone);if(npc.id==='cook'){this.box(group,.42,.6,.1,0,.8,.25,this.mats.stoneLight);const station=this.world.obstacles.find(o=>o.id==='cooking-station');this.box(this.scene,1.2,.6,1.2,station.x,.3,station.z,this.mats.darkStone);this.mesh(new THREE.CylinderGeometry(.45,.35,.4,12),this.mats.darkStone,this.scene,station.x,.85,station.z);this.mesh(new THREE.CylinderGeometry(.33,.33,.02,12),material(0xd2a85b),this.scene,station.x,1.06,station.z);}this.mesh(new THREE.OctahedronGeometry(.18),this.mats.gold,group,0,2.05,0);}}
  buildGround() {
    this.box(this.scene, 26, 1.5, 26, 0, -0.8, 0, this.mats.darkStone);
    this.box(this.scene, 25.6, 0.28, 25.6, 0, -0.15, 0, material(0x78a84e));
    const random = randomSource(8905);
    // A patchwork of low-poly ground tiles gives the clearing a hand-built feel.
    const tile = new THREE.PlaneGeometry(1.6, 1.6); tile.rotateX(-Math.PI / 2);
    const tiles = new THREE.InstancedMesh(tile, material(0xffffff), 256);
    const dummy = new THREE.Object3D();
    for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
      const index = z * 16 + x; dummy.position.set(-12 + x * 1.6, 0.001 + random() * 0.007, -12 + z * 1.6); dummy.updateMatrix(); tiles.setMatrixAt(index, dummy.matrix);
      tiles.setColorAt(index, new THREE.Color().setHSL(0.22 + random() * 0.035, 0.45, 0.35 + random() * 0.055));
    }
    tiles.receiveShadow = true; this.scene.add(tiles);
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 3; col++) {
        const z = 7.2 - row * 0.66, bend = Math.sin(row * 0.25) * 0.4;
        const block = this.box(this.scene, 0.8 + random() * 0.13, 0.075, 0.53 + random() * 0.1, (col - 1) * 0.88 + bend, 0.02, z, random() > 0.5 ? this.mats.stone : this.mats.stoneLight);
        block.rotation.y = (random() - 0.5) * 0.14;
      }
    }
    for (let i = 0; i < 25; i++) {
      const x = -5 + i * 0.45, z = 1.8 + Math.sin(i / 5) * 0.5;
      this.box(this.scene, 0.37, 0.055, 0.55, x, 0.018, z, this.mats.stone).rotation.y = random() * 0.6;
    }
    // Boundary stones match the square playable limits; the cliff is never walkable.
    for (let side = 0; side < 4; side++) for (let i = 0; i < 18; i++) {
      const group = new THREE.Group(); group.rotation.y = side * Math.PI / 2; this.scene.add(group);
      const stone = this.box(group, 1.18, 0.35 + random() * 0.27, 0.5, -12 + i * 1.42, 0.12, -12.3, i % 3 ? this.mats.darkStone : this.mats.stone);
      stone.rotation.y = (random() - 0.5) * 0.12;
    }
    const grassGeometry = new THREE.ConeGeometry(0.09, 0.32, 3);
    const grass = new THREE.InstancedMesh(grassGeometry, material(0x8fc75b), 900);
    let count = 0;
    while (count < 900) {
      const x = (random() - 0.5) * 24.5, z = (random() - 0.5) * 24.5;
      if (Math.abs(x) < 1.9 && z < 8 && z > -7) continue;
      dummy.position.set(x, 0.14, z); dummy.scale.setScalar(0.6 + random() * 1.1); dummy.rotation.y = random() * 6.28; dummy.updateMatrix(); grass.setMatrixAt(count++, dummy.matrix);
    }
    this.scene.add(grass);
    for (let i = 0; i < 35; i++) {
      const side = i % 4, g = new THREE.Group(); g.rotation.y = side * Math.PI / 2; this.scene.add(g);
      const stone = this.mesh(new THREE.DodecahedronGeometry(1, 0), this.mats.darkStone, g, -11 + random() * 22, -1.1, -12.1);
      stone.scale.set(0.8 + random(), 0.65 + random(), 0.6 + random()); stone.rotation.set(random(), random(), random());
    }
  }
  buildEnvironment() {
    for (const o of this.world.obstacles) {
      const group = new THREE.Group(); group.position.set(o.x, 0, o.z); group.userData.kind = o.kind; this.scene.add(group);
      if (o.kind === 'sign') { this.box(group, 0.15, 1.5, 0.15, 0, 0.75, 0, this.mats.bark); this.box(group, 1.05, 0.55, 0.12, 0, 1.3, 0, material(0xb58751)); for (let i=0;i<3;i++) this.box(group, 0.63-i*0.1, 0.035, 0.015, 0, 1.45-i*0.13, 0.069, this.mats.gold); }
      if (o.kind === 'tree') this.buildTree(group, o.height);
      if (o.kind === 'forge') this.buildForge(group);
      if (o.kind === 'rock') { const rock = this.mesh(new THREE.DodecahedronGeometry(o.radius, 0), this.mats.stone, group, 0, o.radius * 0.45, 0); rock.scale.y = 0.85; rock.rotation.set(0.2, o.x, 0.4); this.mesh(new THREE.DodecahedronGeometry(o.radius * 0.7, 0), this.mats.moss, group, 0.1, o.radius * 0.8, 0.1).scale.y = 0.2; }
      if (o.kind === 'well') {
        this.mesh(new THREE.CylinderGeometry(1.04, 1.08, 0.18, 10), this.mats.darkStone, group, 0, 0.1, 0);
        this.water = this.mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 24), material(0x22bacc, { metalness: 0.2, roughness: 0.22, emissive: 0x126977, emissiveIntensity: 0.3 }), group, 0, 0.5, 0);
        for (let i = 0; i < 10; i++) { const angle = i / 10 * Math.PI * 2; const block = this.box(group, 0.53, 0.6, 0.33, Math.sin(angle) * 0.85, 0.43, Math.cos(angle) * 0.85, this.mats.stoneLight); block.rotation.y = angle; }
        this.box(group, 0.15, 1.85, 0.15, -0.88, 0.9, 0, this.mats.bark); this.box(group, 0.15, 1.85, 0.15, 0.88, 0.9, 0, this.mats.bark); this.box(group, 2.15, 0.16, 0.2, 0, 1.8, 0, this.mats.bark);
      }
      if (o.kind === 'camp') {
        const roof = this.mesh(new THREE.ConeGeometry(1.8, 1.65, 4), material(0xc76948), group, 0, 0.9, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1.2, 1, 0.85);
        this.box(group, 2.9, 0.12, 2.05, 0, 0.06, 0, this.mats.bark);
        this.box(group, 0.85, 0.95, 0.025, 0, 0.56, 0.93, material(0x34463c));
        this.box(group, 0.08, 1.85, 0.08, 0, 0.95, 0.97, this.mats.bark);
      }
      if (o.kind === 'crates') {
        for (const [x, z, y] of [[-0.43, 0, 0.4], [0.44, 0.1, 0.35], [-0.38, 0, 1.1]]) {
          this.box(group, 0.78, 0.68, 0.74, x, y, z, material(0xa77945));
          for (const d of [-0.26, 0.26]) this.box(group, 0.075, 0.72, 0.79, x + d, y, z, this.mats.darkStone);
        }
      }
      if (o.kind === 'ruin') {
        for (let i = 0; i < 4; i++) { this.box(group, 0.77, 0.6, 0.87, -1.24 + i * 0.82, 0.3, 0); if (i < 3) this.box(group, 0.77, 0.52, 0.85, -1.24 + i * 0.82, 0.85, 0, this.mats.stoneLight); }
        this.box(group, 0.78, 0.55, 0.86, -1.24, 1.38, 0);
      }
    }
    for (const [x, z] of [[-2.7, -3.8], [2.7, -3.8], [-2.8, 5.8], [2.5, 5.8]]) this.buildLantern(x, z);
  }
  buildLife() {
    this.flags = [];
    for (const [x,z,color] of [[-3.3,-6,0x347cc6],[3.3,-6,0x347cc6],[6.6,1.8,0xc76548],[-6.4,-4.8,0xb777b9]]) {
      this.box(this.scene, 0.1, 3.1, 0.1, x, 1.55, z, this.mats.bark);
      this.mesh(new THREE.OctahedronGeometry(0.12), this.mats.gold, this.scene, x, 3.2, z);
      const flag = new THREE.Group(); flag.position.set(x, 2.8, z); this.scene.add(flag);
      const cloth = this.mesh(new THREE.PlaneGeometry(0.7, 1.05, 1, 1), material(color, { side: THREE.DoubleSide }), flag, 0.38, -0.4, 0);
      this.mesh(new THREE.PlaneGeometry(0.06, 1.05), material(0xf7d990, { side: THREE.DoubleSide }), flag, 0.12, -0.4, 0.005);
      this.flags.push(flag); cloth.castShadow = false;
    }
    const random = randomSource(4560), dummy = new THREE.Object3D();
    const flowers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.09, 0), material(0xffffff), 180);
    const colors = [0xf2c352,0xeb7d8e,0xa17bcc,0xf2e8c0];
    for (let i=0;i<180;i++) {
      const bed = [[-7,7],[7,7],[-7,-7],[7,-7],[-5,2],[5,-2]][i%6];
      dummy.position.set(bed[0]+(random()-.5)*2.7,0.22+random()*.12,bed[1]+(random()-.5)*1.4); dummy.updateMatrix(); flowers.setMatrixAt(i,dummy.matrix); flowers.setColorAt(i,new THREE.Color(colors[i%4]));
    }
    this.scene.add(flowers);
    // Floor-only placeholders reserve space without introducing premature services.
    const training = this.mesh(new THREE.RingGeometry(1.5,1.57,40), material(0xdac392), this.scene, 6,0.018,-0.8); training.rotation.x=-Math.PI/2;
    for (const side of [-1,1]) this.box(this.scene,0.12,0.5,0.5,-6.2+side*.65,0.25,2.8,this.mats.bark);
    this.box(this.scene,1.7,0.13,0.65,-6.2,0.52,2.8,material(0xb5844b));
    this.box(this.scene,1.7,0.5,0.12,-6.2,0.86,2.5,this.mats.bark);
  }
  registerStructureOcclusion() {
    const structures = [...this.scene.children.filter(g => ['ruin','camp','well','crates','sign'].includes(g.userData.kind)),this.portal];
    for (const group of structures) {
      const materials = new Map();
      group.traverse(object => {
        if (!object.isMesh || object.material.isShaderMaterial) return;
        const original = object.material;
        if (!materials.has(original)) { const copy = original.clone(); copy.transparent = true; materials.set(original,copy); }
        object.material = materials.get(original);
      });
      const box = new THREE.Box3().setFromObject(group), sphere = box.getBoundingSphere(new THREE.Sphere());
      this.occluders.push({center:sphere.center,radius:sphere.radius*0.8,materials:[...materials.values()],shader:group===this.portal?this.portalSurface:null});
    }
  }
  buildTree(group, height) {
    const trunk = material(palette.bark, { transparent: true });
    const leaves = material(group.position.x > 0 ? 0x398c53 : 0x489951, { transparent: true });
    this.mesh(new THREE.CylinderGeometry(0.18, 0.44, height * 0.6, 6), trunk, group, 0, height * 0.3, 0);
    for (let i = 0; i < 3; i++) {
      const crown = this.mesh(new THREE.ConeGeometry(height * (0.29 - i * 0.045), height * 0.48, 7), leaves, group, 0, height * (0.46 + i * 0.16), 0);
      crown.rotation.y = i * 0.6 + group.position.x;
    }
    for (let i = 0; i < 4; i++) { const root = this.mesh(new THREE.ConeGeometry(0.2, 1.3, 4), trunk, group, Math.sin(i * Math.PI / 2) * 0.27, 0.22, Math.cos(i * Math.PI / 2) * 0.27); root.rotation.z = Math.cos(i * Math.PI / 2) * 0.8; root.rotation.x = Math.sin(i * Math.PI / 2) * 0.8; }
    this.occluders.push({ center: new THREE.Vector3(group.position.x, height * 0.55, group.position.z), radius: height * 0.32, materials: [trunk, leaves] });
  }
  buildLantern(x, z) {
    this.box(this.scene, 0.38, 0.18, 0.38, x, 0.1, z, this.mats.stone);
    this.box(this.scene, 0.1, 1.22, 0.1, x, 0.73, z, this.mats.bark);
    this.box(this.scene, 0.33, 0.45, 0.33, x, 1.49, z, material(0xf7ca77, { emissive: 0xe7a040, emissiveIntensity: 2 }));
    this.mesh(new THREE.ConeGeometry(0.32, 0.25, 4), this.mats.darkStone, this.scene, x, 1.85, z).rotation.y = Math.PI / 4;
    const light = new THREE.PointLight(0xf4bc65, 3, 4, 2); light.position.set(x, 1.5, z); this.scene.add(light);
  }
  buildPortal() {
    const p = this.world.portal;
    this.portal = new THREE.Group(); this.portal.position.set(p.x, 0, p.z); this.scene.add(this.portal);
    this.mesh(new THREE.CylinderGeometry(2.55, 2.7, 0.18, 12), this.mats.darkStone, this.portal, 0, 0.07, 0);
    this.mesh(new THREE.CylinderGeometry(2.35, 2.45, 0.14, 12), this.mats.stone, this.portal, 0, 0.2, 0);
    for (const x of [-1.8, 1.8]) {
      this.box(this.portal, 1.05, 0.3, 1.12, x, 0.35, 0, this.mats.darkStone);
      for (let i = 0; i < 4; i++) this.box(this.portal, 0.78, 0.59, 0.86, x, 0.77 + i * 0.6, 0, i % 2 ? this.mats.stoneLight : this.mats.stone);
      this.box(this.portal, 0.11, 1.78, 0.018, x, 1.55, 0.442, material(0xe9cc87, { emissive: 0xe2b854, emissiveIntensity: 1.2 }));
    }
    for (let i = 0; i < 9; i++) {
      const a = (i + 0.5) / 9 * Math.PI;
      const block = this.box(this.portal, 0.66, 0.71, 0.9, Math.cos(a) * 1.8, 2.7 + Math.sin(a) * 1.6, 0, i % 3 ? this.mats.stoneLight : this.mats.stone);
      block.rotation.z = a - Math.PI / 2;
    }
    const ring = this.mesh(new THREE.TorusGeometry(1.3, 0.035, 8, 64), material(0xe9d394, { emissive: 0xf4c475, emissiveIntensity: 2 }), this.portal, 0, 2.1, 0.04); ring.scale.y = 1.42;
    this.portalSurface = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, transparent: true, depthWrite: false,
      uniforms: { time: { value: 0 }, fade: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec2 vUv; uniform float time; uniform float fade; void main(){vec2 p=vUv*2.0-1.0;float r=length(p);float a=atan(p.y,p.x);float swirl=sin(a*5.0-r*18.0+time*1.1)*0.5+0.5;float inner=1.0-smoothstep(0.0,0.94,r);float edge=smoothstep(0.65,1.0,r);vec3 col=mix(vec3(0.02,0.34,0.68),vec3(0.15,0.88,0.98),edge*0.7+swirl*0.18);col+=inner*vec3(0.15,0.36,0.55);gl_FragColor=vec4(col,fade*(0.72+edge*0.2)*(1.0-smoothstep(0.92,1.02,r)));}',
    });
    const surface = this.mesh(new THREE.CircleGeometry(1.27, 64), this.portalSurface, this.portal, 0, 2.1, 0.03); surface.scale.y = 1.42; surface.castShadow = false;
    const core = this.mesh(new THREE.OctahedronGeometry(0.23), material(0xffdea0, { emissive: 0xffcf70, emissiveIntensity: 2.5 }), this.portal, 0, 2.08, 0.08); core.scale.y = 1.5; this.portalCore = core;
    const light = new THREE.PointLight(0xffce79, 9, 8, 2); light.position.set(p.x, 2.2, p.z + 0.8); this.scene.add(light);
    this.mesh(new THREE.OctahedronGeometry(0.35), this.mats.gold, this.portal, 0, 4.5, 0).scale.y = 1.3;
    for (let i = 0; i < 6; i++) {
      const root = this.mesh(new THREE.CylinderGeometry(0.05, 0.16, 2.5, 5), this.mats.bark, this.portal, (i % 2 ? 1 : -1) * (2.03 + i * 0.035), 1.2, -0.3 + i * 0.1); root.rotation.z = (i % 2 ? 1 : -1) * 0.12;
    }
  }
  buildPlayer() {
    this.actor = new SpriteActor(this.scene);
    this.selection = this.mesh(new THREE.RingGeometry(0.41, 0.45, 40), new THREE.MeshBasicMaterial({ color: 0xe1cb93, transparent: true, opacity: 0.85, depthWrite: false }), this.scene, 0, 0.06, 0); this.selection.rotation.x = -Math.PI / 2; this.selection.castShadow = false;
  }
  buildParticles() {
    const random = randomSource(788), positions = new Float32Array(100 * 3);
    this.particleOrigins = [];
    for (let i = 0; i < 100; i++) { const p = { x: (random() - 0.5) * 22, y: 0.5 + random() * 4, z: (random() - 0.5) * 22, phase: random() * 6.28 }; this.particleOrigins.push(p); positions.set([p.x, p.y, p.z], i * 3); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xdacf8c, size: 0.055, transparent: true, opacity: 0.7, depthWrite: false })); this.scene.add(this.particles);
  }
  get azimuth() { return this.orbit.azimuth; }
  get height() { return this.orbit.height; }
  rotate(radians) { this.orbit.rotate(radians); }
  zoom(delta) { this.orbit.zoom(delta); }
  resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.renderer.setSize(width, height, false);
    const aspect = width / Math.max(height, 1);
    this.camera.left = -this.height * aspect / 2; this.camera.right = this.height * aspect / 2; this.camera.top = this.height / 2; this.camera.bottom = -this.height / 2;
    this.camera.updateProjectionMatrix();
  }
  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), this.camera);
    const point = this.raycaster.ray.intersectPlane(this.floorPlane, new THREE.Vector3());
    return point ? { x: point.x, z: point.z } : null;
  }
  screenPoint(x, y, z) {
    const point = new THREE.Vector3(x, y, z).project(this.camera);
    return { x: (point.x * 0.5 + 0.5) * this.canvas.clientWidth, y: (-point.y * 0.5 + 0.5) * this.canvas.clientHeight, visible: Math.abs(point.x) < 0.92 && Math.abs(point.y) < 0.92 && point.z < 1 };
  }
  update(game, alpha, dt, reducedMotion = false) {
    const time = game.elapsed;this.updateBiomeAtmosphere?.(game.player.z);
    const x = THREE.MathUtils.lerp(game.previous.x, game.player.x, alpha), z = THREE.MathUtils.lerp(game.previous.z, game.player.z, alpha);
    this.selection.position.set(x, 0.06, z);
    this.actor.update({ ...game.player, x, z }, this.azimuth, time, reducedMotion);
    // Exact player pivot: rotation never displaces the actor from the focus point.
    this.lookAt.set(x, 0.75, z);
    const aspect = this.canvas.clientWidth / Math.max(1, this.canvas.clientHeight);
    this.camera.left = -this.height * aspect / 2; this.camera.right = this.height * aspect / 2;
    this.camera.top = this.height / 2; this.camera.bottom = -this.height / 2; this.camera.updateProjectionMatrix();
    const distance = 36, horizontal = Math.cos(CONFIG.cameraElevation) * distance;
    this.camera.position.set(this.lookAt.x + Math.sin(this.azimuth) * horizontal, this.lookAt.y + Math.sin(CONFIG.cameraElevation) * distance, this.lookAt.z + Math.cos(this.azimuth) * horizontal);
    this.camera.lookAt(this.lookAt); this.camera.updateMatrixWorld();
    this.portalSurface.uniforms.time.value = reducedMotion ? 0 : time;
    this.portalCore.rotation.y = reducedMotion ? 0 : time * 0.5;
    if (this.forgeCoal) this.forgeCoal.emissiveIntensity = 1 + (reducedMotion ? 0 : Math.sin(time * 4) * 0.25);
    this.portalCore.position.y = 2.08 + (reducedMotion ? 0 : Math.sin(time * 1.3) * 0.1);
    this.destination.visible = game.path.length > 0;
    if (game.path.length) { const dest = game.path.at(-1); this.destination.position.set(dest.x, 0.08, dest.z); this.destination.scale.setScalar(1 + Math.sin(time * 5) * 0.07); }
    if (game.path.length) {
      const points = [new THREE.Vector3(x, 0.1, z), ...game.path.map(p => new THREE.Vector3(p.x, 0.1, p.z))];
      // Release the old GPU buffer; idle frames do not allocate a route geometry.
      this.pathLine.geometry.dispose(); this.pathLine.geometry = new THREE.BufferGeometry().setFromPoints(points); this.pathLine.computeLineDistances();
    }
    this.pathLine.visible = game.path.length > 0;
    if (!reducedMotion) {
      const positions = this.particles.geometry.attributes.position;
      this.particleOrigins.forEach((p, i) => positions.setXYZ(i, p.x + Math.sin(time * 0.25 + p.phase) * 0.3, p.y + Math.sin(time * 0.5 + p.phase) * 0.3, p.z + Math.cos(time * 0.3 + p.phase) * 0.3)); positions.needsUpdate = true;
    }
    const target = new THREE.Vector3(x, 1, z), ray = target.clone().sub(this.camera.position), distanceToPlayer = ray.length(); ray.normalize();
    for (const o of this.occluders) {
      const offset = o.center.clone().sub(this.camera.position), along = offset.dot(ray);
      const obscured = along > 0 && along < distanceToPlayer && offset.addScaledVector(ray, -along).length() < o.radius;
      if (o.shader) o.shader.uniforms.fade.value = THREE.MathUtils.lerp(o.shader.uniforms.fade.value, obscured ? 0.2 : 1, 1 - Math.exp(-dt * 8));
      for (const mat of o.materials) { mat.opacity = THREE.MathUtils.lerp(mat.opacity, obscured ? 0.2 : 1, 1 - Math.exp(-dt * 8)); mat.depthWrite = mat.opacity > 0.8; }
    }
    const selected = game.interactionTarget;
    this.interactionRing.visible = !!selected && !game.paused;
    if (selected) { this.interactionRing.position.set(selected.x, selected.highlightHeight ?? 0.06, selected.z); this.interactionRing.scale.setScalar((selected.highlightRadius ?? 0.6) / 0.83); }
    this.flags.forEach((flag,i) => { flag.rotation.y = reducedMotion ? 0 : Math.sin(time*1.8+i)*0.08; });
    if (this.water) this.water.material.emissiveIntensity = 0.3 + (reducedMotion ? 0 : Math.sin(time*1.5)*0.08);
    for(const entry of this.forestGates??[])entry.group.visible=!entry.gate.open;this.updateMineralVeins?.(time);
    if(this.world.safe===false){if(!this.chestModel){this.chestModel=new THREE.Group();this.box(this.chestModel,1,.7,.7,0,.4,0,this.mats.bark);this.box(this.chestModel,1.05,.15,.75,0,.8,0,this.mats.gold);this.scene.add(this.chestModel);}const drop=this.world.interactables.find(i=>i.id==='boss-chest'&&i.enabled);this.chestModel.visible=!!drop;if(drop)this.chestModel.position.set(drop.x,0,drop.z);}
    this.combatVisual?.update();this.fishingVisual.update(game);
    this.remotePlayers?.update(reducedMotion);
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.remotePlayers?.dispose();
    const geometries = new Set(), materials = new Set();
    this.scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) for (const m of Array.isArray(object.material) ? object.material : [object.material]) materials.add(m); });
    this.combatVisual?.dispose();
    this.actor.dispose();
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); this.renderer.dispose();
  }
}
