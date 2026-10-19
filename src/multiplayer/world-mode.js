import {AbilityHud} from '../ui/ability-hud.js';
import {normalizeHotbar} from '../domain/abilities/hotbar.js';
import {drawWorldMap} from '../ui/hud.js';
import {createGameShell} from '../ui/game-shell.js';
import {playerHudMarkup,updatePlayerHud} from '../ui/player-hud.js';
import {attachDiagnostic} from './performance-diagnostic.js';
import {createNpcDialog} from '../ui/npc-dialog.js';
import {onlineUI} from './online-ui.js';
import {WorldClient} from './world-client.js';
import {SceneView} from '../adapters/rendering/scene.js';
import {CombatVisual} from '../adapters/rendering/combat-visual.js';
import {RemotePlayers} from '../adapters/rendering/remote-players.js';
import {RemoteState} from './remote-state.js';
import {InputController} from '../adapters/input/input.js';
import {Game,cameraDirection} from '../simulation/game.js';
import {createEnemies} from '../domain/enemies/spawns.js';
import {InteractionSystem} from '../simulation/interaction.js';

// This entry point deliberately never creates a CharacterSave or opens IndexedDB.
export async function startWorldMode(params){
  const persistent=params.get('online')==='1';let credential=null,social;
  if(persistent){try{if(!window.onlineIdentity)throw Error('Personagem online persistente requer o cliente desktop.');credential=await window.onlineIdentity.load();}catch(e){document.getElementById('loading').textContent=e.message;return;}}
  const $=id=>document.getElementById(id),canvas=$('world');let game,view,input,combat,own,interactions,last=performance.now(),lastSend=0,lastAxis='',frame,observer;
  document.body.classList.add('shared-world');$('app').classList.add('in-tower');
  for(const selector of ['.left-panel','.map-panel','.chapter-tag','#sprite-debug','#landmark-label','#interact','#npc-label'])document.querySelector(selector).hidden=true;
  document.querySelector('.location h1').textContent='Clareira Compartilhada';document.querySelector('.location .eyebrow').textContent='MUNDO COMPARTILHADO · TESTE';
  const panel=document.createElement('section');panel.className='panel shared-status';panel.innerHTML='<strong>Conectando…</strong><p data-hp>Personagem temporário · Espada de treino</p><p data-target>Clique em um monstro para atacar.</p><p data-event></p><small>Sem recompensas permanentes. A campanha e seu save ficam separados.</small><div><button data-connect>Desconectar</button><button data-local>Voltar à campanha</button></div>';
  $('app').append(panel);const status=panel.querySelector('strong'),hp=panel.querySelector('[data-hp]'),target=panel.querySelector('[data-target]'),eventLabel=panel.querySelector('[data-event]');
  let toastTimer,lastNotice='';const notify=message=>{if(!message)return;$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3500);};
  const pause=$('pause-dialog');pause.querySelector('h2').textContent='Você está em um mundo compartilhado.';pause.querySelector('p').textContent='Seus comandos foram interrompidos. Os jogadores e monstros continuam ativos.';
  const help=$('help-dialog');help.querySelector('.notice').textContent='Teste compartilhado: clique no Slime para aproximar e atacar com a espada. WASD, clique no chão ou Esc cancelam o ataque. Slimes reagem a impactos, retornam ao se afastar e reaparecem após morrer. Seu personagem também retorna após morrer. Sem habilidades ou profissões neste mapa; elas continuam disponíveis na campanha.';
  const blocked=()=>!view||client.status!=='Online'||document.hidden||[...document.querySelectorAll('dialog')].some(d=>d.open);
  const stop=()=>{input?.clear();client.command({kind:'stop'});lastAxis='';};
  const open=id=>{stop();if(!$(id).open)$(id).showModal();};
  const shell=createGameShell({open,blocked,actions:{inventory:()=>social?.show('inventory'),equipment:()=>social?.show('inventory'),attributes:()=>social?.show('inventory'),party:()=>social?.show('party'),skills:()=>open('online-skills-dialog')}});
  document.querySelector('.left-panel').hidden=false;document.querySelector('.character').innerHTML=playerHudMarkup();document.getElementById('character-button').onclick=()=>social?.show('inventory');
  const skills=document.createElement('dialog');skills.id='online-skills-dialog';skills.innerHTML='<button class="close-button" data-close>×</button><h2>Habilidades do Novato</h2><p>As habilidades ativas estão disponíveis na campanha local. Este servidor ainda oferece apenas o ataque básico automático com a arma equipada.</p>';document.getElementById('app').append(skills);
  // UI preferences are namespaced by authenticated identity, never campaign data.
  let preferenceIdentity=null;const uiData={knownAbilities:[],inventory:{slots:[],capacity:0}};
  const hotbarRuntime={character:{data:uiData},combat:{game:{areaId:'online',world:{id:'online'}}},get hotbar(){return normalizeHotbar(uiData.hotbar,uiData.knownAbilities);},weapon:null,cooldowns:new Map(),remaining:()=>0,targetRef:()=>null,reason:()=> 'Habilidades ativas ainda indisponíveis neste servidor.',request(){eventLabel.textContent='Habilidades ativas disponíveis na campanha local.';},periodic:{items:[]},projectiles:{items:[]},metrics:{},time:0};
  const hotbar=new AbilityHud(hotbarRuntime,{isBlocked:blocked,debug:false,save:async()=>{if(!preferenceIdentity)throw Error('Aguarde a conexão.');localStorage.setItem('dungeon.online.hotbar.'+preferenceIdentity,JSON.stringify(uiData.hotbar));}});
  document.getElementById('pause-dialog').append(panel);
  for(const dialog of document.querySelectorAll('dialog')){for(const b of dialog.querySelectorAll('[data-close]'))b.onclick=()=>dialog.close();dialog.addEventListener('close',()=>canvas.focus());}
  let lastEvent=0;const labels=new Map(),npcLabels=new Map(),floaters=[];const ownLabel=document.createElement('span');ownLabel.className='remote-name own-name';$('app').append(ownLabel);const flash=document.createElement('div');flash.className='damage-flash';flash.hidden=true;$('app').append(flash);let flashUntil=0;const dialogue=createNpcDialog({root:$('app'),stop,notice:notify,focus:()=>canvas.focus()});
  const interact=()=>{const command=interactions?.activate(game.player,blocked());if(command?.type==='examine')notify(command.content.text);else if(command)client.command({kind:'travel',portal:command.targetId});};
  const client=new WorldClient({url:params.get('server')||'ws://127.0.0.1:8787/hub',name:params.get('name')||'Viajante',protocol:persistent?4:params.get('tower')==='1'?3:2,credential,onChat:m=>social?.chat(m),onNotice:notify,
    onStatus:s=>{status.textContent=s;document.querySelector('.location-state').textContent=s;panel.querySelector('[data-connect]').textContent=client.desired?'Desconectar':'Conectar';if(s!=='Online'){dialogue.close();ownLabel.hidden=true;own=null;input?.clear();if(combat)combat.currentTarget=null;}},
    onMap:map=>{
      dialogue.close();for(const n of npcLabels.values())n.remove();npcLabels.clear();for(const f of floaters)f.node.remove();floaters.length=0;input?.dispose();view?.dispose();observer?.disconnect();for(const label of labels.values())label.remove();labels.clear();own=null;lastEvent=0;eventLabel.textContent='';
      game=new Game(map);interactions=new InteractionSystem(map,map.interactables);document.querySelector('.location h1').textContent=map.name;lastAxis='';
      $('floor-objective').hidden=client.protocol<3||map.environment==='city';$('floor-objective').textContent=map.environment==='city'?'Cidade do Limiar · converse com os moradores · F no portal para entrar na Torre':'Torre experimental · andares 1 a 12 · portais livres para teste · F para viajar';
      view=new SceneView(canvas,map);combat={game,enemies:createEnemies(map.enemySpawns,map),projectiles:{items:[]},events:[],playerCycle:{phase:'idle'},currentTarget:null};
      view.combatVisual=new CombatVisual(view,combat);view.remotePlayers=new RemotePlayers(view,client);
      if(params.get('diagnostic')==='1')attachDiagnostic({view,game,combat,client});
      for(const e of combat.enemies){const label=document.createElement('span');label.className='enemy-label shared-enemy';$('app').append(label);label.innerHTML='<span></span><i class="hp-track"><i class="hp-fill"></i></i>';labels.set(e.id,label);}
      for(const n of map.npcs??[]){const label=document.createElement('span');label.className='npc-name';label.textContent=n.name;$('app').append(label);npcLabels.set(n.id,label);}
      input=new InputController(canvas,{isBlocked:blocked,zoom:d=>view.zoom(d),drag:x=>view.orbit.drag(x),interact,help:()=>open('help-dialog'),escape:()=>{if(combat.currentTarget){stop();combat.currentTarget=null;}else open('pause-dialog');},blur:stop,
        moveTo:(x,y)=>{const npc=(view.world.npcs??[]).find(n=>{const p=view.screenPoint(n.x,1,n.z);return p.visible&&Math.hypot(p.x-x,p.y-y)<45;});if(npc){dialogue.open(view.world,game.player,npc);return;}const id=view.combatVisual.pick(x,y);if(id){const e=combat.enemies.find(e=>e.id===id);client.command({kind:'attack',target:id,generation:e.generation});combat.currentTarget=id;}else{const point=view.pick(x,y);if(point){client.command({kind:'destination',x:point.x,z:point.z,...(view.world.surfaces?{surface:point.surface??'ground'}:{})});combat.currentTarget=null;}}}});
      input.bindOrbitButton($('rotate-left'),-1);input.bindOrbitButton($('rotate-right'),1);
      observer=new ResizeObserver(()=>view.resize());observer.observe(canvas);$('loading').hidden=true;canvas.focus();
    },
    onSnapshot:s=>{social?.update(s);if(s.profile?.notice&&s.profile.notice!==lastNotice){lastNotice=s.profile.notice;notify(lastNotice);}const p=s.players.find(p=>p.id===client.id);if(!p)return;client.displayName=p.name;
      if(!own)own=new RemoteState({id:p.id,name:p.name,state:p},performance.now());else own.push(p,performance.now());
      document.querySelector('.map-panel').hidden=!game.world.safe;if(game.world.safe)drawWorldMap({context:$('minimap').getContext('2d'),gameState:game,view});
      uiData.knownAbilities=s.profile?.knownAbilities??[];if(preferenceIdentity!==client.id){preferenceIdentity=client.id;try{uiData.hotbar=normalizeHotbar(JSON.parse(localStorage.getItem('dungeon.online.hotbar.'+client.id)),uiData.knownAbilities);}catch{uiData.hotbar=normalizeHotbar([],uiData.knownAbilities);}}hotbarRuntime.weapon=p.weaponType;hotbar.update();
      updatePlayerHud({name:p.name,className:p.className,level:s.profile?.level??p.level,hp:p.hp,maxHP:p.maxHP,mp:p.mp,maxMP:p.maxMP,xp:s.profile?.xp,nextXP:s.profile?.nextXP});combat.playerCycle.phase=p.phase;combat.currentTarget=p.target;hp.textContent=`Você · HP ${p.hp} / ${p.maxHP}${p.hp===0?' · retornando em instantes…':''} · ${s.players.length} jogador(es)`;
      for(const data of s.monsters){const e=combat.enemies.find(e=>e.id===data.id);if(e)Object.assign(e,{...data,targetId:data.target});}
      const selected=s.monsters.find(e=>e.id===p.target);target.textContent=selected?`${selected.name} · ${selected.hp} / ${selected.maxHP} HP · ${p.moving?'Aproximando…':p.phase==='idle'?'Aproxime-se por um caminho livre.':'Em combate'}`:game.world.environment==='city'?'Clique em um morador para conversar.':'Clique em um monstro para atacar; aproximamos automaticamente.';
      combat.players=s.players;for(const event of s.events??[])if(event.id>lastEvent){lastEvent=event.id;if(s.time-event.time>.7)continue;eventLabel.textContent=`${event.source===client.id?'Você':s.players.some(p=>p.id===event.source)?'Outro jogador':'Slime'}: ${event.hit?event.damage+' de dano':'errou'}`;const e=combat.enemies.find(e=>e.id===event.target);if(e)combat.events.push({...event,source:'player',x:e.x,z:e.z});else{const victim=s.players.find(p=>p.id===event.target);if(victim)combat.events.push({...event,x:victim.x,z:victim.z});}const entity=e??s.players.find(p=>p.id===event.target);if(entity){const node=document.createElement('span');node.className='damage-number'+(event.target===client.id?' received':'');node.textContent=event.hit?String(event.damage):'Errou';$('app').append(node);floaters.push({node,x:entity.x,z:entity.z,at:performance.now()});if(floaters.length>48)floaters.shift().node.remove();}if(event.target===client.id&&event.hit)flashUntil=performance.now()+180;}
      combat.events=combat.events.filter(e=>s.time-e.time<1);game.elapsed=s.time;
    }});
  if(persistent){social=onlineUI(client,stop,$('app'));panel.querySelector('small').textContent='Personagem online salvo no servidor. Campanha local independente.';}
  panel.querySelector('[data-connect]').onclick=()=>{stop();if(client.desired)client.disconnect();else client.connect();};
  panel.querySelector('[data-local]').onclick=()=>{client.disconnect();const next=new URL(location.href);next.searchParams.delete('shared');location.href=next.href;};
  $('help-button').onclick=()=>open('help-dialog');$('pause-button').onclick=()=>open('pause-dialog');$('zoom-in').onclick=()=>view?.zoom(-2);$('zoom-out').onclick=()=>view?.zoom(2);
  $('interact-button').onclick=interact;
  const animate=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;if(view){
    if(!blocked())view.orbit.update(dt,input.orbitAxis,false);
    if(own){Object.assign(game.player,own.sample(now,100));game.previous={...game.player};}
    if(!blocked()&&now-lastSend>=1000/15){lastSend=now;const axis=cameraDirection(input.axis.x,input.axis.z,view.azimuth),signature=axis.x+','+axis.z;if(axis.x||axis.z||signature!==lastAxis){client.command({kind:'move',...axis});lastAxis=signature;}}
    game.interactionTarget=interactions.update(game.player,blocked());$('interact').hidden=!game.interactionTarget;if(game.interactionTarget)$('interaction-label').textContent=game.interactionTarget.label;
    view.update(game,1,dt,false);social?.frame(view);for(const e of combat.enemies){const label=labels.get(e.id),point=view.screenPoint(e.x,1.5,e.z);label.hidden=!point.visible||!e.alive||e.state==='returning'||combat.hoveredEnemy!==e.id;label.style.left=point.x+'px';label.style.top=point.y+'px';label.querySelector('span').textContent=`${e.name} · ${e.hp}/${e.stats.maxHP}${e.hp===0?' · derrotado':''}`;label.querySelector('.hp-fill').style.width=(100*e.hp/e.stats.maxHP)+'%';}
    for(const n of view.world.npcs??[]){const label=npcLabels.get(n.id),p=view.screenPoint(n.x,3.5,n.z);label.hidden=!p.visible||Math.hypot(n.x-game.player.x,n.z-game.player.z)>5;label.style.left=p.x+'px';label.style.top=p.y+'px';}const me=view.screenPoint(game.player.x,(game.player.y??0)+2.4,game.player.z);ownLabel.textContent=client.displayName??client.name;ownLabel.hidden=!own||!me.visible;ownLabel.style.left=me.x+'px';ownLabel.style.top=me.y+'px';flash.hidden=now>flashUntil;view.actor.sprite.material.color.setHex(now<flashUntil?0xffaaa0:0xffffff);for(let i=floaters.length-1;i>=0;i--){const f=floaters[i],age=(now-f.at)/1000;if(age>1){f.node.remove();floaters.splice(i,1);continue;}const p=view.screenPoint(f.x,1.8+age,f.z);f.node.style.left=p.x+'px';f.node.style.top=p.y+'px';f.node.style.opacity=String(1-age);}
    $('camera-caption').textContent=`ÓRBITA · ${view.orbit.degrees.toFixed(1)}°`;
  }frame=requestAnimationFrame(animate);};
  const dispose=()=>{clearTimeout(toastTimer);shell.dispose();hotbar.dispose();skills.remove();dialogue.dispose();ownLabel.remove();flash.remove();social?.dispose();client.disconnect();cancelAnimationFrame(frame);input?.dispose();observer?.disconnect();view?.dispose();};
  window.addEventListener('pagehide',()=>client.disconnect());window.desktopLifecycle?.onCloseRequested(async()=>client.disconnect());
  if(import.meta.hot)import.meta.hot.dispose(dispose);
  $('loading').hidden=true;client.connect();frame=requestAnimationFrame(animate);
}
