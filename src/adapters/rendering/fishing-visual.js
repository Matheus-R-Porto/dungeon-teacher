import * as THREE from 'three';
export class FishingVisual {
  constructor(view){
    this.view=view;this.group=new THREE.Group();view.scene.add(this.group);
    const mat=new THREE.MeshBasicMaterial({color:0xffdf88});
    this.bobber=view.mesh(new THREE.SphereGeometry(.13,8,6),mat,this.group,0,.15,0);
    this.splash=view.mesh(new THREE.RingGeometry(.27,.33,24),new THREE.MeshBasicMaterial({color:0xc4f8ef,transparent:true,opacity:.8,side:THREE.DoubleSide}),this.group,0,.09,0);this.splash.rotation.x=-Math.PI/2;
    this.line=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3)),new THREE.LineBasicMaterial({color:0xf4e7c2}));this.group.add(this.line);this.group.visible=false;
    for(const spot of view.world.fishingSpots??[]){const ring=view.mesh(new THREE.RingGeometry(.5,.64,24),new THREE.MeshBasicMaterial({color:0xaee4d4,side:THREE.DoubleSide}),view.scene,spot.x,.08,spot.z);ring.rotation.x=-Math.PI/2;view.box(view.scene,.15,.9,.15,spot.x+.65,.45,spot.z,view.mats.bark);}
  }
  update(game){const f=game.activity?.fishing;this.group.visible=!!f?.active;if(!f?.active)return;const b=f.spot.bobber,p=game.player,t=f.time-f.started,bite=f.state==='bite';this.bobber.position.set(b.x,.18+Math.sin(t*(bite?30:4))*(bite?.14:.035),b.z);this.splash.position.set(b.x,.09,b.z);this.splash.scale.setScalar(bite?1+Math.sin(t*15)*.3:.7+Math.sin(t*3)*.1);this.bobber.material.color.setHex(bite?0xff8168:0xffdf88);const points=this.line.geometry.attributes.position;points.setXYZ(0,p.x,1,p.z);points.setXYZ(1,(p.x+b.x)/2,1.7,(p.z+b.z)/2);points.setXYZ(2,b.x,this.bobber.position.y,b.z);points.needsUpdate=true;this.line.geometry.computeBoundingSphere();}
}
