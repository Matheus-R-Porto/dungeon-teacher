import {fishingArc,castProgress} from '../../core/fishing-trajectory.js';
import * as THREE from 'three';
// Hand-authored rod tips in the 512px full-body atlas, S/W/N/E.
const FISHING_TIPS=[[[300,264],[382,264],[367,325],[368,264],[340,332]],[[210,264],[81,264],[138,307],[144,264],[162,307]],[[220,264],[399,264],[367,312],[153,264],[351,315]],[[302,264],[431,264],[374,307],[368,264],[350,307]]];
const REEL_TIPS=[[407,282],[76,282],[400,282],[428,282]];
export class FishingVisual {
  constructor(view){
    this.view=view;this.tip=new THREE.Vector3();this.right=new THREE.Vector3();this.up=new THREE.Vector3();this.castOrigin=new THREE.Vector3();this.endpoint=new THREE.Vector3();this.destination=new THREE.Vector3();this.group=new THREE.Group();view.scene.add(this.group);
    const mat=new THREE.MeshBasicMaterial({color:0xffdf88});
    this.bobber=view.mesh(new THREE.SphereGeometry(.13,8,6),mat,this.group,0,.15,0);
    this.splash=view.mesh(new THREE.RingGeometry(.27,.33,24),new THREE.MeshBasicMaterial({color:0xc4f8ef,transparent:true,opacity:.8,side:THREE.DoubleSide}),this.group,0,.09,0);this.splash.rotation.x=-Math.PI/2;
    this.line=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(51),3)),new THREE.LineBasicMaterial({color:0xf4e7c2}));this.line.frustumCulled=false;this.group.add(this.line);this.group.visible=false;
    this.fish=new THREE.Group();this.group.add(this.fish);const fishMat=new THREE.MeshStandardMaterial({color:0x9fd9d0,roughness:.45});const body=view.mesh(new THREE.SphereGeometry(.16,10,6),fishMat,this.fish);body.scale.set(1,.6,1.8);const tail=view.mesh(new THREE.ConeGeometry(.15,.22,3),fishMat,this.fish,0,0,-.32);tail.rotation.x=-Math.PI/2;view.mesh(new THREE.SphereGeometry(.025,6,4),new THREE.MeshBasicMaterial({color:0x172b38}),this.fish,.12,.04,.14);this.fish.visible=false;
    this.miningImpact=view.mesh(new THREE.OctahedronGeometry(.22),new THREE.MeshBasicMaterial({color:0xffd485}),view.scene);this.miningImpact.visible=false;
  }
  update(game){
    const m=game.activity?.mining,actor=this.view.actor,p=game.player,now=game.elapsed;
    this.miningImpact.visible=!!actor.currentActivity?.impact&&m?.area===game.world;
    if(this.miningImpact.visible){this.miningImpact.position.set(m.vein.x,1.1,m.vein.z);this.miningImpact.rotation.y=now*8;}
    const f=game.activity?.fishing;
    if(f!==this.runtime){this.runtime=f;this.reelRevision=f?.visualReelRevision;this.catchRevision=f?.visualCatchRevision;this.cancelRevision=f?.visualCancelRevision;this.reelUntil=0;this.catchUntil=0;}
    if(f?.visualReelRevision!==this.reelRevision){this.reelRevision=f?.visualReelRevision;this.reelUntil=now+1.35;}
    if(f?.visualCatchRevision!==this.catchRevision){this.catchRevision=f?.visualCatchRevision;this.catchUntil=this.reelUntil;}
    if(f?.visualCancelRevision!==this.cancelRevision){this.cancelRevision=f?.visualCancelRevision;this.reelUntil=0;this.catchUntil=0;}
    const valid=f?.area===game.world&&!p.moving&&f.character.damageRevision===f.damageRevision&&f.character.isAlive;
    const presenting=valid&&now<(this.reelUntil??0);
    this.group.visible=valid&&(!!f?.active||presenting);this.fish.visible=presenting&&now<(this.catchUntil??0);
    if(!this.group.visible)return;
    this.tip.set(p.x,(p.y??0)+1,p.z);
    const frame=actor.texture.userData.frame;
    let anchor;
    if(actor.texture===actor.textures.get('fishing-v043'))anchor=FISHING_TIPS[frame.row][frame.column];
    if(actor.texture===actor.textures.get('fishing-reel-v064'))anchor=REEL_TIPS[frame.row*2+frame.column];
    if(anchor){this.right.setFromMatrixColumn(this.view.camera.matrixWorld,0);this.up.setFromMatrixColumn(this.view.camera.matrixWorld,1);this.tip.copy(actor.sprite.position).addScaledVector(this.right,(anchor[0]/512-.5)*actor.sprite.scale.x).addScaledVector(this.up,(.9-anchor[1]/512)*actor.sprite.scale.y);}
    if(this.attempt!==f.attempts||this.castStarted!==f.started){this.attempt=f.attempts;this.castStarted=f.started;this.castOrigin.copy(this.tip);}
    const b=f.spot.bobber,t=f.time-f.started,bite=f.state==='bite',cast=castProgress(t,f.config.castSeconds),reel=presenting?Math.min(1,(now-(this.reelUntil-1.35))/.85):0;
    this.destination.set(b.x,b.y??.05,b.z);
    if(presenting)fishingArc(this.endpoint,this.destination,this.tip,reel,1.25);
    else fishingArc(this.endpoint,this.castOrigin,this.destination,cast,1.65);
    if(!presenting&&cast===1)this.endpoint.y+=Math.sin(t*(bite?30:4))*(bite?.06:.015);
    this.bobber.position.copy(this.endpoint);this.splash.visible=!presenting&&cast===1;this.splash.position.set(b.x,(b.y??.05)+.015,b.z);this.splash.scale.setScalar(bite?1+Math.sin(t*15)*.3:.7+Math.sin(t*3)*.1);
    this.bobber.material.color.setHex(bite?0xff8168:0xffdf88);
    const points=this.line.geometry.attributes.position;
    for(let i=0;i<points.count;i++){const u=i/(points.count-1);points.setXYZ(i,this.tip.x+(this.endpoint.x-this.tip.x)*u,this.tip.y+(this.endpoint.y-this.tip.y)*u-.22*4*u*(1-u),this.tip.z+(this.endpoint.z-this.tip.z)*u);}
    points.needsUpdate=true;
    this.fish.position.copy(this.endpoint);this.fish.position.y-=.23;this.fish.rotation.z=Math.sin(now*12)*.2;this.bobber.visible=!this.fish.visible;
  }
}
