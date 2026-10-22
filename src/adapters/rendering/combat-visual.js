import {updateKnight} from './guardian.js';
import {surfaceId} from '../../world/surfaces.js';
import {resolveFacing} from '../../core/actor-animation.js';
import {artSprite} from './art.js';
import {selectAtlasFrame} from '../../core/atlas.js';
import {COMBAT} from '../../domain/combat/config.js';
import * as THREE from 'three';
export class CombatVisual {
  constructor(view,combat){this.view=view;this.combat=combat;this.pointer=null;this.nextHover=0;this.hoverAbort=new AbortController();
    view.canvas.addEventListener?.('pointermove',e=>{this.pointer={x:e.clientX,y:e.clientY};},{signal:this.hoverAbort.signal});
    view.canvas.addEventListener?.('pointerleave',()=>{this.pointer=null;this.clearHover();},{signal:this.hoverAbort.signal});
    this.models=new Map();this.projectileModels=new Map();this.hoverPoint=new THREE.Vector3();this.hoverSphere=new THREE.Sphere();this.projectileStart=new THREE.Vector3();this.projectileEnd=new THREE.Vector3();
    for(const enemy of combat.enemies){
      const group=new THREE.Group();group.position.set(enemy.x,0,enemy.z);
      const row=enemy.behaviorType==='mobile'?1:enemy.behaviorType==='ranged'?2:0;const white=enemy.behaviorType==='whiteWolf',wolf=enemy.behaviorType==='wolf';const knight=enemy.behaviorType==='oathKnight';const body=knight?artSprite('/assets/monsters/oath-knight-v060.svg',8,4,0,0,4.5,4.5):white?artSprite('/assets/monsters/white-wolf-v052.svg',9,4,0,0,5,5):wolf?artSprite('/assets/monsters/wolf-v050.png',7,4,0,0,3,3):artSprite('/assets/monsters/slimes-v042.png',6,3,0,row,2.2,2.2);if(knight)body.userData.knight=true;if(wolf)body.userData.wolf=true;if(white)body.userData.whiteWolf=true;body.center.y=wolf?.08:22/256;body.userData.row=row;group.add(body);
      const ring=new THREE.Mesh(new THREE.RingGeometry(0.72,0.78,40),new THREE.MeshBasicMaterial({color:0xffcf75,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=0.05;group.add(ring);
      const face=new THREE.Group();
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
    let selected=null,nearest=Infinity;for(const enemy of this.combat.enemies){if(enemy.dormant||!enemy.alive||enemy.state==='returning')continue;const model=this.models.get(enemy.id);if(!model?.group.visible||!model.body.visible||v.screenPoint?.(enemy.x,(enemy.y??0)+.85,enemy.z)?.visible===false)continue;model.group.updateMatrixWorld(true);const hit=v.raycaster.intersectObject(model.body,false)[0];if(hit&&hit.distance<nearest){let occluded=false;for(const o of v.occluders??[]){if(o.surface&&o.surface!==surfaceId(this.combat.game.player))continue;if(o.materials?.every(m=>(m.opacity??1)<.8))continue;const p=o.box?v.raycaster.ray.intersectBox(o.box,this.hoverPoint):v.raycaster.ray.intersectSphere(this.hoverSphere.set(o.center,o.radius),this.hoverPoint);if(p&&v.raycaster.ray.origin.distanceTo(p)<hit.distance-.1){occluded=true;break;}}if(!occluded){nearest=hit.distance;selected=enemy.id;}}}
    return selected;
  }
  clearHover(){this.combat.hoveredEnemy=null;this.view.canvas.classList?.remove('enemy-hover');}
  updateHover(){
    if(typeof document==='undefined')return;const canvas=this.view.canvas,p=this.pointer,now=performance.now();
    if(!p||document.hidden||document.querySelector('dialog[open]')||canvas.classList.contains('orbiting')||document.elementFromPoint(p.x,p.y)!==canvas){this.clearHover();return;}
    if(now<this.nextHover)return;this.nextHover=now+60;
    const id=this.pick(p.x,p.y);this.combat.hoveredEnemy=id;
    canvas.classList.toggle('enemy-hover',!!id);
  }
  dispose(){this.hoverAbort.abort();this.clearHover();for(const m of this.projectileModels.values())this.removeEffect(m);for(const e of this.impacts?.values()??[])this.removeEffect(e.sprite);if(this.castSprite)this.removeEffect(this.castSprite);}
  effect(frame,size){const m=artSprite('/assets/effects/combat-v043.png',3,2,frame%3,Math.floor(frame/3),size,size);m.center.set(.5,.5);m.material.depthWrite=false;this.view.scene.add(m);return m;}
  removeEffect(m){m.removeFromParent();m.material.map.dispose();m.material.dispose();}
  updateProjectiles(){const live=new Set();for(const p of this.combat.projectiles.items){live.add(p.id);let model=this.projectileModels.get(p.id);if(!model){const physical=p.effect.damageType==='physical';model=this.effect(physical?0:1,physical?1.25:p.ability==='energyBall'?1.35:.8);this.projectileModels.set(p.id,model);}model.position.set(p.x,(p.y??0)+.95,p.z);const target=this.combat.projectileTarget(p.target,p);if(target){const a=this.projectileStart.set(p.x,.95,p.z).project(this.view.camera),b=this.projectileEnd.set(target.x,.95,target.z).project(this.view.camera);model.material.rotation=Math.atan2((b.y-a.y)*this.view.canvas.clientHeight,(b.x-a.x)*this.view.canvas.clientWidth);}}for(const [id,m]of this.projectileModels)if(!live.has(id)){this.removeEffect(m);this.projectileModels.delete(id);}
    const active=this.combat.abilities?.active,casting=active&&this.combat.state==='casting';
    if(casting){const id=active.ability.id,frame=id==='regeneration'?4:id==='energyBall'?1:id==='powerStrike'?2:id==='doubleAttack'?3:0;this.castSprite??=this.effect(frame,.65);selectAtlasFrame(this.castSprite.material.map,frame%3,Math.floor(frame/3));this.castSprite.visible=true;this.castSprite.position.set(this.combat.game.player.x,1.3,this.combat.game.player.z);const progress=Math.min(1,(this.combat.abilities.time-active.started)/Math.max(.01,active.ability.castTime));this.castSprite.scale.setScalar(.3+progress*.45);this.castSprite.material.opacity=.35+progress*.4;}else if(this.castSprite)this.castSprite.visible=false;
  }
  update(){this.updateHover();this.updateProjectiles();const combat=this.combat,time=combat.game.elapsed;this.updateImpacts(time);
    for(const enemy of combat.enemies){const m=this.models.get(enemy.id);m.group.position.set(enemy.x,enemy.y??0,enemy.z);m.group.visible=!enemy.dormant&&!(enemy.isMiniBoss&&!enemy.alive&&enemy.deathTime>=COMBAT.enemyRemovalDelay)&&!['removed','respawning'].includes(enemy.state);if(enemy.surface==='white-wolf-cave')m.group.visible=m.group.visible&&surfaceId(combat.game.player)==='white-wolf-cave'&&Math.hypot(enemy.x-combat.game.player.x,enemy.z-combat.game.player.z)<24;else if(surfaceId(combat.game.player)==='white-wolf-cave')m.group.visible=false;m.body.material.opacity=enemy.surface==='white-wolf-cave'?Math.max(0,Math.min(1,(24-Math.hypot(enemy.x-combat.game.player.x,enemy.z-combat.game.player.z))/4)):1;m.group.scale.setScalar((enemy.scale??1)*(enemy.alive?1:Math.max(0.04,1-enemy.deathTime/COMBAT.enemyRemovalDelay)));m.ring.visible=combat.currentTarget===enemy.id&&enemy.alive;m.face.rotation.y=enemy.heading;
      if(m.debug){const d=m.debug;d.root.visible=!!combat.ai.debug;d.detection.position.set(enemy.x,0,enemy.z);d.attack.position.copy(d.detection.position);if(d.root.visible&&time>=d.next){d.next=time+.15;d.path.geometry.dispose();d.path.geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(enemy.x,.12,enemy.z),...enemy.path.map(p=>new THREE.Vector3(p.x,.12,p.z))]);}}
      const hit=combat.events.findLast(e=>e.hit&&(e.target===enemy.id||e.source==='player'&&e.x===enemy.x&&e.z===enemy.z)&&time-e.time<.18);
      const moving=['chasing','returning'].includes(enemy.state)||enemy.ai?.ambientPhase==='wander';
      // Squash, extend, land, settle: slimes have no legs. Locomotion phase
      // belongs to this renderer and cannot restart on each network update.
      const distance=m.lastPosition?Math.hypot(enemy.x-m.lastPosition.x,enemy.z-m.lastPosition.z):0;
      m.travel=(m.travel??0)+(distance<2?distance:0);m.lastPosition??={x:0,z:0};m.lastPosition.x=enemy.x;m.lastPosition.z=enemy.z;
      if(m.body.userData.knight){updateKnight(m,enemy,this.view,time);continue;}if(m.body.userData.whiteWolf){const sp=enemy.special,wind=sp?.phase==='windup';m.facing=resolveFacing(enemy.heading,this.view.azimuth,m.facing?.direction);const frame=!enemy.alive?6:sp?.skill==='howl'&&wind?7:sp?.phase==='charge'?2:sp?.skill==='bite'&&wind?4:enemy.frenzy?8:moving?1+Math.floor(m.travel/.35)%3:0;selectAtlasFrame(m.body.material.map,frame,Math.round(m.facing.direction/2)%4);m.body.center.y=.12;m.body.scale.set(5,5,1);if(!m.telegraph){m.telegraph=new THREE.Mesh(new THREE.PlaneGeometry(2,8),new THREE.MeshBasicMaterial({color:0xea6c51,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));m.telegraph.rotation.x=-Math.PI/2;m.group.add(m.telegraph);}if(!m.howlRing){m.howlRing=new THREE.Mesh(new THREE.RingGeometry(2.7,3,40),new THREE.MeshBasicMaterial({color:0xb28cdb,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));m.howlRing.rotation.x=-Math.PI/2;m.howlRing.position.y=.07;m.group.add(m.howlRing);}m.howlRing.visible=wind&&sp?.skill==='howl';m.telegraph.visible=wind&&sp?.skill!=='howl';const bite=sp?.skill==='bite';m.telegraph.scale.set(bite?1.8:1,bite?.3:1,1);m.telegraph.position.set((sp?.dx??0)*(bite?1.2:4),.06,(sp?.dz??1)*(bite?1.2:4));m.body.material.color.setHex(enemy.frenzy?0xffaaa0:0xffffff);m.telegraph.rotation.z=-enemy.heading;m.telegraph.material.color.setHex(sp?.skill==='howl'?0xb28cdb:0xea6c51);continue;}
      if(m.body.userData.wolf){m.facing=resolveFacing(enemy.heading,this.view.azimuth,m.facing?.direction);const row=Math.round(m.facing.direction/2)%4,frame=!enemy.alive?6:hit?5:enemy.state==='attacking'?((enemy.phase??combat.enemyCycles?.get(enemy.id)?.phase)==='recovery'?0:4):moving?1+Math.floor(m.travel/.28)%3:0;selectAtlasFrame(m.body.material.map,frame,row);m.body.position.y=.03;m.body.scale.set(3,3,1);continue;}
      const cycle=(m.travel/1.25)%1,frame=!enemy.alive?5:hit?4:enemy.state==='attacking'?3:moving?[1,2,2,0][Math.floor(cycle*4)]:0;
      selectAtlasFrame(m.body.material.map,frame,m.body.userData.row);m.body.material.color.setHex(hit?0xffd7b0:0xffffff);m.body.scale.set(2.2,2.2,1);m.body.position.y=.04+(moving&&cycle>.25&&cycle<.75?Math.sin((cycle-.25)*Math.PI*2)*.22:0);

    }
    this.view.selection.material.color.setHex(combat.abilities?.active?0x80dcff:combat.playerCycle.phase==='windup'?0xff835e:0xe1cb93);
  }
  updateImpacts(time){
    this.impacts??=new Map();
    for(const event of this.combat.events){if((!event.hit&&!event.heal)||time-event.time>(event.heal?.65:.3))continue;const key=event.id??`${event.time}:${event.source}:${event.x}:${event.z}`;if(this.impacts.has(key)||this.impacts.size>=48)continue;
      const frame=event.heal?4:event.ability==='energyBall'||event.damageType==='magic'?1:event.ability==='doubleAttack'?3:event.ability==='powerStrike'||event.impact==='heavy'?2:5;
      const size=event.ability==='powerStrike'?1.5:event.heal?1.15:.85,sprite=this.effect(frame,size);sprite.position.set(event.x,(event.y??0)+1,event.z);const entry={sprite,at:event.time,size,duration:event.heal?.65:.3,heal:!!event.heal};
      const source=this.combat.enemies.find(e=>e.id===event.source);if(source?.behaviorType==='ranged'){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(source.x,(source.y??0)+.9,source.z),new THREE.Vector3(event.x,(event.y??0)+1,event.z)]),new THREE.LineBasicMaterial({color:0xa2eaff,transparent:true,opacity:.9}));this.view.scene.add(line);entry.line=line;}
      this.impacts.set(key,entry);
    }
    for(const [key,e]of this.impacts){const age=time-e.at;if(age>e.duration){this.view.scene.remove(e.sprite);e.sprite.material.map.dispose();e.sprite.material.dispose();if(e.line){this.view.scene.remove(e.line);e.line.geometry.dispose();e.line.material.dispose();}this.impacts.delete(key);}else{e.sprite.material.opacity=Math.max(0,1-age/e.duration);e.sprite.scale.setScalar(e.size*(.8+age/e.duration*.35));if(e.heal)e.sprite.position.y=1+age*.6;if(e.line)e.line.material.opacity=Math.max(0,1-age/e.duration);}}
  }
}
