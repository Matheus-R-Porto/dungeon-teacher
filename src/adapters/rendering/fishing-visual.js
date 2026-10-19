import * as THREE from 'three';
// Hand-authored rod tips in the 512px full-body atlas, S/W/N/E.
const FISHING_TIPS=[[[300,264],[382,264],[367,325],[368,264],[340,332]],[[210,264],[81,264],[138,307],[144,264],[162,307]],[[220,264],[399,264],[367,312],[153,264],[351,315]],[[302,264],[431,264],[374,307],[368,264],[350,307]]];
export class FishingVisual {
  constructor(view){
    this.view=view;this.tip=new THREE.Vector3();this.right=new THREE.Vector3();this.up=new THREE.Vector3();this.group=new THREE.Group();view.scene.add(this.group);
    const mat=new THREE.MeshBasicMaterial({color:0xffdf88});
    this.bobber=view.mesh(new THREE.SphereGeometry(.13,8,6),mat,this.group,0,.15,0);
    this.splash=view.mesh(new THREE.RingGeometry(.27,.33,24),new THREE.MeshBasicMaterial({color:0xc4f8ef,transparent:true,opacity:.8,side:THREE.DoubleSide}),this.group,0,.09,0);this.splash.rotation.x=-Math.PI/2;
    this.line=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3)),new THREE.LineBasicMaterial({color:0xf4e7c2}));this.group.add(this.line);this.group.visible=false;
    this.fish=new THREE.Group();this.group.add(this.fish);const fishMat=new THREE.MeshStandardMaterial({color:0x9fd9d0,roughness:.45});const body=view.mesh(new THREE.SphereGeometry(.16,10,6),fishMat,this.fish);body.scale.set(1,.6,1.8);const tail=view.mesh(new THREE.ConeGeometry(.15,.22,3),fishMat,this.fish,0,0,-.32);tail.rotation.x=-Math.PI/2;view.mesh(new THREE.SphereGeometry(.025,6,4),new THREE.MeshBasicMaterial({color:0x172b38}),this.fish,.12,.04,.14);this.fish.visible=false;
    this.miningImpact=view.mesh(new THREE.OctahedronGeometry(.22),new THREE.MeshBasicMaterial({color:0xffd485}),view.scene);this.miningImpact.visible=false;
    for(const spot of view.world.fishingSpots??[]){const ring=view.mesh(new THREE.RingGeometry(.5,.64,24),new THREE.MeshBasicMaterial({color:0xaee4d4,side:THREE.DoubleSide}),view.scene,spot.x,.08,spot.z);ring.rotation.x=-Math.PI/2;view.box(view.scene,.15,.9,.15,spot.x+.65,.45,spot.z,view.mats.bark);}
  }
  update(game){const m=game.activity?.mining;this.miningImpact.visible=!!this.view.actor.currentActivity?.impact&&m?.area===game.world;if(this.miningImpact.visible){this.miningImpact.position.set(m.vein.x,1.1,m.vein.z);this.miningImpact.rotation.y=game.elapsed*8;}const f=game.activity?.fishing;const now=game.elapsed;
    if(f!==this.runtime){this.runtime=f;this.catchRevision=f?.visualCatchRevision;this.catchUntil=0;this.reelUntil=0;this.reelRevision=f?.visualReelRevision;}
    if(f?.visualReelRevision!==this.reelRevision){this.reelRevision=f?.visualReelRevision;this.reelUntil=now+1.35;}
    if(f?.visualCatchRevision!==this.catchRevision){this.catchRevision=f?.visualCatchRevision;this.catchUntil=now+1.35;this.reelUntil=now+1.35;}
    const presenting=now<(this.reelUntil??0)&&!!f?.spot&&f.area===game.world&&!game.player.moving;
    this.group.visible=!!f?.active||presenting;this.fish.visible=presenting&&now<(this.catchUntil??0);if(!this.group.visible)return;
    const b={...f.spot.bobber},p=game.player,t=f.time-f.started,bite=f.state==='bite';
    const cast=Math.min(1,Math.max(0,(t-.28)/.52)),reel=presenting?Math.min(1,(now-(this.reelUntil-1.35))/.85):0;
    b.x=p.x+(b.x-p.x)*cast*(1-reel*.85);b.z=p.z+(b.z-p.z)*cast*(1-reel*.85);this.bobber.position.set(b.x,(presenting?reel*1.5:0)+.18+Math.sin(t*(bite?30:4))*(bite?.14:.035),b.z);this.splash.position.set(b.x,.09,b.z);this.splash.scale.setScalar(bite?1+Math.sin(t*15)*.3:.7+Math.sin(t*3)*.1);this.bobber.material.color.setHex(bite?0xff8168:0xffdf88);const points=this.line.geometry.attributes.position;const actor=this.view.actor,frame=actor.texture.userData.frame,anchors=FISHING_TIPS;this.tip.set(p.x,1,p.z);if(actor.texture===actor.textures.get('fishing-v043')){const [ax,ay]=anchors[frame.row][frame.column];this.right.setFromMatrixColumn(this.view.camera.matrixWorld,0);this.up.setFromMatrixColumn(this.view.camera.matrixWorld,1);this.tip.copy(actor.sprite.position).addScaledVector(this.right,(ax/512-.5)*actor.sprite.scale.x).addScaledVector(this.up,(.9-ay/512)*actor.sprite.scale.y);}points.setXYZ(0,this.tip.x,this.tip.y,this.tip.z);points.setXYZ(1,(this.tip.x+b.x)/2,Math.max(.2,this.tip.y*.45),(this.tip.z+b.z)/2);points.setXYZ(2,b.x,this.bobber.position.y,b.z);points.needsUpdate=true;this.line.geometry.computeBoundingSphere();this.fish.position.copy(this.bobber.position);this.fish.position.y-=.23;this.fish.rotation.z=Math.sin(now*12)*.2;this.bobber.visible=!this.fish.visible;}
}
