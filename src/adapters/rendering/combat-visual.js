import {COMBAT} from '../../domain/combat/config.js';
import * as THREE from 'three';
export class CombatVisual {
  constructor(view,combat){this.view=view;this.combat=combat;this.models=new Map();this.projectileModels=new Map();this.projectileGeometry=new THREE.SphereGeometry(.11,8,6);this.projectileMaterials={physical:new THREE.MeshBasicMaterial({color:0xffdc8a}),magic:new THREE.MeshBasicMaterial({color:0x80dcff})};
    for(const enemy of combat.enemies){
      const group=new THREE.Group();group.position.set(enemy.x,0,enemy.z);
      const body=new THREE.Mesh(new THREE.SphereGeometry(0.6,16,10),new THREE.MeshStandardMaterial({color:0xbb739b,roughness:0.65}));body.scale.set(1,0.7,1);body.position.y=0.43;body.castShadow=true;group.add(body);
      const ring=new THREE.Mesh(new THREE.RingGeometry(0.72,0.78,40),new THREE.MeshBasicMaterial({color:0xffcf75,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=0.05;group.add(ring);
      const face=new THREE.Group();for(const x of [-0.2,0.2]){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.065,8,6),new THREE.MeshBasicMaterial({color:0x162828}));eye.position.set(x,0.55,0.5);face.add(eye);}group.add(face);
      view.scene.add(group);this.models.set(enemy.id,{group,body,ring,face});
      if(combat.ai)this.createDebug(enemy);
    }
  }
  createDebug(enemy){
    const root=new THREE.Group(),circle=(radius,color)=>{const points=[];for(let i=0;i<=64;i++){const a=i*Math.PI*2/64;points.push(new THREE.Vector3(Math.sin(a)*radius,0.09,Math.cos(a)*radius));}const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity:0.6,depthTest:false,depthWrite:false}));line.renderOrder=20;root.add(line);return line;};
    const detection=circle(enemy.detectionRange,0x75cbef),attack=circle(enemy.stats.attackRange,0xff8775),leash=circle(enemy.leashRange,0xe6cf76),origin=circle(.15,0xffffff);
    leash.position.set(enemy.spawnPosition.x,0,enemy.spawnPosition.z);origin.position.copy(leash.position);
    const path=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xeeefca,depthTest:false,depthWrite:false}));root.add(path);root.visible=false;this.view.scene.add(root);this.models.get(enemy.id).debug={root,detection,attack,path,next:0};
  }
  pick(clientX,clientY){
    const v=this.view,rect=v.canvas.getBoundingClientRect();v.raycaster.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),v.camera);
    let selected=null,nearest=Infinity;for(const enemy of this.combat.enemies){if(enemy.dormant||!enemy.alive||enemy.state==='returning')continue;const model=this.models.get(enemy.id);model.group.updateMatrixWorld(true);const hit=v.raycaster.intersectObject(model.body,false)[0];if(hit&&hit.distance<nearest){nearest=hit.distance;selected=enemy.id;}}
    return selected;
  }
  dispose(){this.projectileGeometry.dispose();Object.values(this.projectileMaterials).forEach(m=>m.dispose());}
  updateProjectiles(){const live=new Set();for(const p of this.combat.projectiles.items){live.add(p.id);let model=this.projectileModels.get(p.id);if(!model){model=new THREE.Mesh(this.projectileGeometry,this.projectileMaterials[p.effect.damageType]);if(p.effect.damageType==='physical')model.scale.set(.55,.55,2.6);this.view.scene.add(model);this.projectileModels.set(p.id,model);}model.position.set(p.x,.85,p.z);const target=this.combat.projectileTarget(p.target,p);if(target)model.lookAt(target.x,.85,target.z);}for(const [id,model] of this.projectileModels)if(!live.has(id)){this.view.scene.remove(model);this.projectileModels.delete(id);}}
  update(){this.updateProjectiles();const combat=this.combat,time=combat.game.elapsed;
    for(const enemy of combat.enemies){const m=this.models.get(enemy.id);m.group.position.set(enemy.x,0,enemy.z);m.group.visible=!enemy.dormant&&!['removed','respawning'].includes(enemy.state);m.group.scale.setScalar((enemy.scale??1)*(enemy.alive?1:Math.max(0.04,1-enemy.deathTime/COMBAT.enemyRemovalDelay)));m.ring.visible=combat.currentTarget===enemy.id&&enemy.alive;m.face.rotation.y=enemy.heading;
      if(m.debug){const d=m.debug;d.root.visible=!!combat.ai.debug;d.detection.position.set(enemy.x,0,enemy.z);d.attack.position.copy(d.detection.position);if(d.root.visible&&time>=d.next){d.next=time+.15;d.path.geometry.dispose();d.path.geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(enemy.x,.12,enemy.z),...enemy.path.map(p=>new THREE.Vector3(p.x,.12,p.z))]);}}
      m.body.material.color.setHex(combat.ai?.debug?({idle:0x94c58d,alert:0xf5d171,chasing:0xeb936b,attacking:0xd96566,returning:0x6dbee2,dead:0x777777,respawning:0x777777}[enemy.state]??0xbb739b):(enemy.color??0xbb739b));
      const hit=combat.events.findLast(e=>e.source==='player'&&e.hit&&e.x===enemy.x&&e.z===enemy.z&&time-e.time<0.16);m.body.material.emissive.setHex(hit?.impact==='heavy'?0xc9783c:hit?0x704441:0);m.body.scale.set(hit?.impact==='heavy'?1.25:1,hit?.impact==='heavy'?.48:.7,1);m.body.position.y=.43+(enemy.behaviorType==='mobile'&&enemy.state==='chasing'?Math.abs(Math.sin(time*10))*.25:0)+(enemy.state==='attacking'?Math.sin(time*8)*.035:enemy.ai?.ambientPhase==='wander'?Math.abs(Math.sin(time*5))*.08:0);
    }
    this.view.selection.material.color.setHex(combat.abilities?.active?0x80dcff:combat.playerCycle.phase==='windup'?0xff835e:0xe1cb93);
  }
}
