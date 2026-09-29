import { worldFacingLabel } from '../core/actor-animation.js';
import { wrapAngle } from '../core/orbit.js';
const $ = selector => document.querySelector(selector);
export class Hud {
  constructor(game, view, session) {
    this.session=session;
    this.game = game; this.view = view;
    this.map = $('#minimap'); this.context = this.map.getContext('2d'); this.toastUntil = 0;
    this.nodes = Object.fromEntries(['orientation', 'camera-caption', 'journey-complete', 'interact', 'landmark-label', 'toast'].map(id => [id, document.getElementById(id)]));
  }
  toast(message) { this.nodes.toast.textContent = message; this.nodes.toast.hidden = false; this.toastUntil = performance.now() + 3500; }
  update() {
    const g = this.game, n = this.nodes;
    $('#app').classList.toggle('in-tower',g.world.safe===false);$('.location .eyebrow').textContent=g.world.safe===false?'TORRE · FLORESTA':'UM LUGAR ENTRE JORNADAS';$('.chapter-tag').hidden=g.world.safe===false;$('#world').setAttribute('aria-label',(g.world.name??'Refúgio')+'. Use WASD ou clique no chão para caminhar; Q e E giram a câmera.');
    $('.location h1').textContent=g.world.name??'Refúgio do Limiar';$('.location-state').textContent=g.world.safe===false?'ÁREA DE COMBATE · ANDAR '+g.world.floorId:'ÁREA SEGURA';
    $('.map-panel .section-label span').textContent=g.world.safe===false?'ANDAR '+g.world.floorId:'REFÚGIO';
    $('.journey').hidden=false;n['landmark-label'].querySelector('strong').textContent=g.world.safe===false?(g.world.floorId<3?'Portal de subida':'Portal de retorno'):'Portal da Torre';
    const npc=g.world.npcs?.[0],label=$('#npc-label');if(label){label.hidden=!npc||g.paused;if(npc){const p=this.view.screenPoint(npc.x,2.4,npc.z);label.hidden=!p.visible||g.paused;label.style.left=p.x+'px';label.style.top=p.y+'px';}}

    if(this.session){const quest=this.session.quest,description=quest.describe(this.session);$('#quest-current').textContent=description.title;$('#quest-hint').textContent=description.hint;$('#quest-count').textContent=Object.values(quest.state).filter(Boolean).length+' / '+Object.keys(quest.state).length;
      for(const node of document.querySelectorAll('[data-quest]')){node.classList.toggle('done',quest.state[node.dataset.quest]);node.classList.toggle('active',quest.current?.id===node.dataset.quest);}
      n['journey-complete'].hidden=!!quest.current;
    }
    const degrees = this.view.orbit.degrees.toFixed(1);
    n.orientation.textContent = `${degrees}°`;
    n['camera-caption'].textContent = `ÓRBITA · ${degrees}°`;
    n.interact.hidden = !g.interactionTarget || g.paused;
    if (g.interactionTarget) document.getElementById('interaction-label').textContent = g.interactionTarget.label;
    const point = this.view.screenPoint(g.world.portal.x, 5.2, g.world.portal.z);
    const underHeader = point.y < 145 && Math.abs(point.x - this.view.canvas.clientWidth / 2) < 210;
    n['landmark-label'].hidden = !point.visible || g.paused || underHeader;
    n['landmark-label'].style.left = `${point.x}px`; n['landmark-label'].style.top = `${point.y}px`;
    if (performance.now() > this.toastUntil) n.toast.hidden = true;
    const facing = this.view.actor.facing;
    if (facing) {
      const degrees = radians => (wrapAngle(radians)*180/Math.PI).toFixed(1)+'°';
      document.getElementById('debug-world').textContent = worldFacingLabel(facing.worldFacing)+' · '+degrees(facing.worldFacing);
      document.getElementById('debug-camera').textContent = degrees(facing.cameraYaw);
      document.getElementById('debug-relative').textContent = degrees(facing.relativeAngle);
      document.getElementById('debug-visual').textContent = facing.visualFacing;
      document.getElementById('debug-animation').textContent = facing.animationState;
    }
    $('.map-panel').hidden=g.world.safe===false;
    if(g.world.safe!==false)this.drawMap();
    if(!this.trailLabels){this.trailLabels=document.createElement('div');this.trailLabels.id='trail-labels';document.querySelector('#app').append(this.trailLabels);}
    const visible=[];
    for(const trail of g.world.trails??[])for(const [i,p]of trail.points.flatMap((b,j)=>{if(!j)return [b];const a=trail.points[j-1],count=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/7);return Array.from({length:count},(_,k)=>({x:a.x+(b.x-a.x)*(k+1)/count,z:a.z+(b.z-a.z)*(k+1)/count}));}).entries()){if(i===0)continue;const distance=Math.hypot(p.x-g.player.x,p.z-g.player.z);if(distance<6||distance>18)continue;const screen=this.view.screenPoint(p.x,.15,p.z);if(!screen.visible||screen.y<160||screen.y>530||screen.x<305||screen.x>1050)continue;const to=g.world.graph.regions.find(r=>r.id===trail.to);visible.push({id:trail.id+'-'+i,x:screen.x,y:screen.y,text:trail.main?'◆ Trilha dourada':'◇ Desvio · '+to.name});}
    const signature=visible.map(p=>p.id).join(',');if(this.trailSignature!==signature){this.trailLabels.replaceChildren(...visible.map(p=>{const label=document.createElement('span');label.dataset.trailLabel=p.id;label.textContent=p.text;label.style.cssText='position:fixed;pointer-events:none;background:#193f32ba;color:#efdfad;padding:4px 7px;font-size:11px;border-radius:8px;transform:translate(-50%,-50%)';return label;}));this.trailSignature=signature;}
    visible.forEach((p,i)=>{const node=this.trailLabels.children[i];node.style.left=p.x+'px';node.style.top=p.y+'px';});this.trailLabels.hidden=g.paused;

  }
  drawMap() {
    const c = this.context, game = this.game;
    c.clearRect(0, 0, 180, 180); c.save(); c.translate(90, 90);
    c.rotate(this.view.azimuth);
    c.fillStyle = '#253b33'; c.strokeStyle = '#79907055'; c.lineWidth = 1;
    const bounds=game.world.bounds,scale=128/Math.max(bounds.maxX-bounds.minX,bounds.maxZ-bounds.minZ);c.scale(scale/5.3,scale/5.3);c.fillRect(bounds.minX*5.3,bounds.minZ*5.3,(bounds.maxX-bounds.minX)*5.3,(bounds.maxZ-bounds.minZ)*5.3);
    c.fillStyle = '#7f86604a'; c.fillRect(-8, -37, 16, 79);
    for (const o of game.world.obstacles) {
      c.fillStyle = o.kind === 'tree' ? '#42604c' : '#84917c';
      if (o.shape === 'circle') { c.beginPath(); c.arc(o.x * 5.3, o.z * 5.3, Math.max(2.3, o.radius * 5.3), 0, Math.PI * 2); c.fill(); }
      else c.fillRect((o.x - o.halfX) * 5.3, (o.z - o.halfZ) * 5.3, o.halfX * 10.6, o.halfZ * 10.6);
    }
    for(const enemy of this.session?.combat.enemies??[]){if(!enemy.alive||enemy.dormant)continue;c.fillStyle=enemy.boss?'#ff876e':'#deabc5';c.beginPath();c.arc(enemy.x*5.3,enemy.z*5.3,enemy.boss?4:2.5,0,Math.PI*2);c.fill();}
    c.strokeStyle = '#d9bc7f'; c.lineWidth = 2; c.beginPath(); c.arc(game.world.portal.x * 5.3, game.world.portal.z * 5.3, 6, 0, Math.PI * 2); c.stroke();
    if (game.path.length) { c.strokeStyle = '#d2bf8066'; c.lineWidth = 1; c.beginPath(); c.moveTo(game.player.x * 5.3, game.player.z * 5.3); game.path.forEach(p => c.lineTo(p.x * 5.3, p.z * 5.3)); c.stroke(); }
    c.translate(game.player.x * 5.3, game.player.z * 5.3); c.rotate(-game.player.heading);
    c.fillStyle = '#eff0d6'; c.shadowColor = '#eff0d6'; c.shadowBlur = 6; c.beginPath(); c.moveTo(0, 6); c.lineTo(-3.4, -3.6); c.lineTo(3.4, -3.6); c.closePath(); c.fill(); c.restore();
  }
}
