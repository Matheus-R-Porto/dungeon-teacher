import {BiomePanel} from './ui/biome-panel.js';
import {saveBeforeClose} from './adapters/desktop/lifecycle.js';
import multiplayerConfig from '../config/multiplayer.json';
import {loadIdentity} from './multiplayer/identity.js';
import {HubClient} from './multiplayer/client.js';
import {RemotePlayers} from './adapters/rendering/remote-players.js';
import {MultiplayerPanel} from './ui/multiplayer-panel.js';
import {FoodService} from './domain/food-service.js';
import {KitchenPanel} from './ui/kitchen-panel.js';
import {SmithingService} from './domain/smithing-service.js';
import {ForgePanel} from './ui/forge-panel.js';
import {equipmentBlocked} from './domain/items/inventory.js';
import {FishingHud} from './ui/fishing-hud.js';
import {MiningHud} from './ui/mining-hud.js';
import {RewardPanel} from './ui/reward-panel.js';
import {FeedbackSound} from './ui/feedback.js';
import {validateChest} from './domain/items/chest.js';
import {CONFIG} from './core/config.js';
import {AreaSession,createAreas} from './simulation/areas.js';
import {RpgPanels} from './ui/rpg-panels.js';
import './style.css';
import hubData from './data/hub.json';


import { SceneView } from './adapters/rendering/scene.js';
import { InputController } from './adapters/input/input.js';
import { Hud } from './ui/hud.js';


import { Character,createCharacter } from './domain/character/character.js';
import { CharacterSave } from './adapters/persistence/character-save.js';
import { CharacterPanel } from './ui/character-panel.js';

import { CombatVisual } from './adapters/rendering/combat-visual.js';
import { CombatHud } from './ui/combat-hud.js';





import {AbilityHud} from './ui/ability-hud.js';
const $ = id => document.getElementById(id);
let game, view, input, frameId, resizeObserver;
function fatal(error) {
  console.error(error);
  cancelAnimationFrame(frameId); input?.dispose();
  $('loading').hidden = true; $('fatal').hidden = false;
  $('fatal-message').textContent = `Não foi possível continuar: ${error.message}. O último save confirmado foi preservado. Tente recarregar; a cena exige WebGL 2.`;
}
$('reload-button').addEventListener('click', () => location.reload());
async function bootstrap() {
try {
  const params=new URLSearchParams(location.search);
  const testProfile=params.get('test')==='1';
  const saves=new CharacterSave(testProfile?'iteration03-test':'current');
  const character=new Character(await saves.open());const sound=new FeedbackSound();
  const notify=message=>{hud.toast(message);sound.play();};
  $('sprite-debug').hidden=params.get('debug')!=='1';
  let dirty=false, saveElapsed=0, saveFailed=false, desktopClosing=false;
  const session=new AreaSession(createAreas(hubData),character,{seed:params.get('debug')==='1'&&params.has('seed')?params.get('seed'):null,stress:params.get('stress')==='1'&&params.get('debug')==='1',onResourceChange:()=>{dirty=true;},notify});
  game=session.game;const combat=session.combat;
  view=new SceneView($('world'),game.world);
  const hud=new Hud(game,view,session);const fishingHud=new FishingHud(session);const miningHud=new MiningHud(session);session.fishing.save=snapshot=>saves.save(snapshot);session.mining.save=snapshot=>saves.save(snapshot);
  view.combatVisual=new CombatVisual(view,combat);
  let combatHud=new CombatHud(combat,view,params.get('debug')==='1');
  const characterPanel=new CharacterPanel(character,{
    debug:params.get('debug')==='1',testProfile,notify,
    onReset:async()=>{game.paused=true;input?.clear();const wasDirty=dirty;dirty=false;try{await saves.save(createCharacter());location.reload();}catch(error){dirty=wasDirty;throw error;}},
    context:()=>({safeHub:session.area.safe,inCombat:combat.abilities.busy||game.inCombat===true||['chasing','attacking','dead'].includes(combat.state)}),
    open:()=>{if(!isBlocked()){characterPanel.render();openDialog('character-dialog');}},
    onChange:async()=>{try{session.quest.sync(session);await saves.save(character.snapshot());dirty=false;saveFailed=false;characterPanel.status(testProfile?'Perfil de teste · Salvo':'Salvo neste navegador');}catch(error){saveFailed=true;characterPanel.status(error.message);throw error;}}
  });
  const flush=()=>{if(!desktopClosing&&dirty&&!saveFailed&&!session.fishing.pending&&!session.mining.pending&&!food.busy&&!smithing.busy){dirty=false;saves.save(character.snapshot()).then(()=>characterPanel.status(testProfile?'Perfil de teste · Salvo':'Salvo neste navegador')).catch(error=>{saveFailed=true;characterPanel.status(error.message);});}};
  session.onFloorCleared=()=>{characterPanel.onChange().catch(()=>{});};
  const rewardPanel=new RewardPanel(character,{open:id=>openDialog(id),save:()=>characterPanel.onChange(),safe:()=>session.area.safe,notify});
  const food=new FoodService(character,{save:snapshot=>saves.save(snapshot),context:()=>({safe:session.area.safe,blocked:equipmentBlocked(combat)||session.collecting}),onChange:()=>{dirty=true;characterPanel.render();}});
  const kitchen=new KitchenPanel(food,session,{open:id=>openDialog(id),notify});
  const smithing=new SmithingService(character,{save:snapshot=>saves.save(snapshot),context:()=>({safe:session.area.safe,blocked:equipmentBlocked(combat)||session.collecting}),onChange:()=>{characterPanel.render();}});
  const forgePanel=new ForgePanel(smithing,session,{open:id=>openDialog(id),notify});
  const panels=new RpgPanels(character,combat,{food,open:id=>openDialog(id),isBlocked:()=>isBlocked()||session.fishing.busy||session.mining.busy,save:()=>characterPanel.onChange(),onChest:id=>{validateChest(character,id,session.area.safe);panels.dialogs.inventory.close();rewardPanel.show(id);},onEquipment:()=>{combat.attackRange=combat.abilities.autoRange;characterPanel.render();}});
  let multiplayerPanel,identityStore,identityError;
  try{identityStore=loadIdentity(localStorage,()=>crypto.randomUUID(),testProfile?'dungeon-multiplayer.test.v1':'dungeon-multiplayer.identity.v1');}catch(error){identityError='Não foi possível salvar a identidade multiplayer. O modo individual continua disponível.';}
  const multiplayer=new HubClient({url:multiplayerConfig.serverUrl,identity:identityStore?.identity??{id:'',name:'Viajante'},getPlayer:()=>game.player,isPaused:()=>game.paused,onChange:()=>multiplayerPanel?.update()});
  multiplayerPanel=new MultiplayerPanel({client:multiplayer,identityStore,open:id=>{if(!isBlocked())openDialog(id);},debug:params.get('debug')==='1'});
  if(identityError){multiplayer.changed('Erro',identityError);multiplayerPanel.connectButton.disabled=true;}
  view.remotePlayers=new RemotePlayers(view,multiplayer);
  const biomePanel=new BiomePanel({session,debug:testProfile&&params.get('debug')==='1',open:id=>{if(!isBlocked())openDialog(id);},notify});
  const dialogs = [...document.querySelectorAll('dialog')];
  const isBlocked = () => !!session.fishing.pending || !!session.mining.pending || session.collecting || dialogs.some(dialog => dialog.open) || !$('fatal').hidden;
  const openDialog = id => { if(session.fishing.busy||session.mining.busy){hud.toast('Encerre a atividade com Esc antes de abrir painéis.');return;}input?.clear(); game.paused = true; game.previous = { ...game.player }; $(id).showModal(); };
  const focusWorld = () => $('world').focus({ preventScroll: true });
  dialogs.forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {if(!button.disabled)dialog.close();}));
    dialog.addEventListener('close', () => { input?.clear(); game.paused = isBlocked(); focusWorld(); });
  });
  const characterKey=event=>{if(event.repeat||event.target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key.toLowerCase()==='c'){event.preventDefault();if(characterPanel.dialog.open){if(!characterPanel.busy)characterPanel.dialog.close();}else if(!isBlocked()){characterPanel.render();openDialog('character-dialog');}}};
  window.addEventListener('keydown',characterKey);
  window.addEventListener('pagehide',flush);
  const removeDesktopClose=window.desktopLifecycle?.onCloseRequested(async()=>{
    desktopClosing=true;
    try {
      await saveBeforeClose({
        pause:()=>{game.paused=true;input?.clear();},
        cancel:()=>{multiplayer.disconnect();session.fishing.cancel();session.mining.cancel();food.cancel();smithing.cancel();if(rewardPanel.busy)rewardPanel.stop();},
        isBusy:()=>food.busy||smithing.busy||panels.busy||characterPanel.busy||rewardPanel.busy||session.collecting||!!session.fishing.pending||!!session.mining.pending,
        save:async()=>{await saves.save(character.snapshot());dirty=false;saveFailed=false;}
      });
    } catch(error) {desktopClosing=false;game.paused=isBlocked();throw error;}
  });
  let abilityHud=new AbilityHud(combat.abilities,{isBlocked,debug:params.get('debug')==='1',save:()=>characterPanel.onChange()});
  session.onTransition=()=>{
    multiplayer.setHub(session.area.safe);
    input?.clear();const orbit=view.orbit;abilityHud.dispose();combatHud.dispose();view.dispose();
    view=new SceneView($('world'),game.world);view.orbit=orbit;view.combatVisual=new CombatVisual(view,combat);hud.view=view;
    if(session.area.safe)view.remotePlayers=new RemotePlayers(view,multiplayer);
    combatHud=new CombatHud(combat,view,params.get('debug')==='1');abilityHud=new AbilityHud(combat.abilities,{isBlocked,debug:params.get('debug')==='1',save:()=>characterPanel.onChange()});
    view.update(game,1,0,true);hud.update();focusWorld();
  };
  const zoom = delta => { if (!isBlocked()) view.zoom(delta); };
  const interactionHandlers = {
    fishing:command=>{try{session.fishing.start(command.targetId);input?.clear();}catch(error){hud.toast(error.message);}},
    mining:command=>{try{session.mining.start(command.content.veinId);input?.clear();}catch(error){hud.toast(error.message);}},
    cook:command=>kitchen.show(!!command.content.station),
    forge:()=>forgePanel.show(),
    shop:()=>{session.quest.mark('smith');panels.show('shop');},
    chest:()=>{input?.clear();session.collectChest(()=>characterPanel.onChange()).catch(error=>hud.toast(error.message));},
    travel:command=>{try{session.travel(command);}catch(error){hud.toast(error.message);}},
    examine: command => {
      for (const field of ['eyebrow','title','text','notice']) $(`interaction-${field}`).textContent = command.content[field] ?? '';
      openDialog('interaction-dialog');
    },
  };
  const interact = () => {
    if(session.fishing.active){session.fishing.pull();return;}
    if(session.mining.active){session.mining.strike();return;}
    const command = session.interactions.activate(game.player, isBlocked());
    if (command && character.isAlive) { if(command.type!=='fishing'&&command.type!=='mining')combat.interact(); interactionHandlers[command.type]?.(command); }
    else if (!isBlocked()) hud.toast('Aproxime-se de um objeto para ver sua ação disponível.');
  };
  input = new InputController($('world'), {
    isBlocked, zoom, interact,pull:()=>{if(session.fishing.active)session.fishing.pull();else if(session.mining.active)session.mining.strike();},
    drag: deltaX => { if (!isBlocked()) view.orbit.drag(deltaX); },
    help: () => openDialog('help-dialog'),
    escape: () => { if(session.fishing.active){session.fishing.cancel();input.clear();return;}if(session.mining.active){session.mining.cancel();input.clear();return;}if (combat.abilities.busy||['chasing','attacking'].includes(combat.state)) {combat.cancel();hud.toast('Ataque automático cancelado.');} else if (game.path.length) { game.cancel(); hud.toast('Caminho cancelado.'); } else openDialog('pause-dialog'); },
    blur: () => { flush(); if (!isBlocked()) openDialog('pause-dialog'); },
    moveTo: (x, y) => { if(session.fishing.busy||session.mining.busy)return;if(!character.isAlive)return;const enemy=view.combatVisual.pick(x,y);if(enemy){combat.select(enemy);return;}const destination = view.pick(x, y); if (!destination || !combat.moveTo(destination)) hud.toast('Não há um caminho livre até esse ponto. Clique no chão da clareira.'); },
  });
  input.bindOrbitButton($('rotate-left'), -1);
  input.bindOrbitButton($('rotate-right'), 1);
  $('zoom-in').addEventListener('click', () => zoom(-2));
  $('zoom-out').addEventListener('click', () => zoom(2));
  $('help-button').addEventListener('click', () => openDialog('help-dialog'));
  $('pause-button').addEventListener('click', () => openDialog('pause-dialog'));
  $('interact-button').addEventListener('click', interact);
  $('world').addEventListener('webglcontextlost', event => { event.preventDefault(); game.paused = true; fatal(new Error('WebGL context lost')); });
  resizeObserver = new ResizeObserver(() => view.resize()); resizeObserver.observe($('world'));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const perf=params.get('perf')==='1'?document.createElement('output'):null;let frameSamples=[];if(perf){perf.id='performance-sample';perf.style.cssText='position:fixed;bottom:100px;right:25px;z-index:20;background:#142b28;color:#fff;padding:8px;font:12px monospace;pointer-events:none';document.querySelector('#app').append(perf);}
  let last = performance.now(), accumulator = 0, uiElapsed = 0;
  const animate = now => {
    try {
      if(perf&&!game.paused&&now>last){frameSamples.push(now-last);if(frameSamples.length>=120){const sorted=[...frameSamples].sort((a,b)=>a-b),mean=frameSamples.reduce((a,b)=>a+b,0)/frameSamples.length;perf.textContent='FPS '+(1000/mean).toFixed(1)+' · frame p95 '+sorted[Math.floor(sorted.length*.95)].toFixed(1)+' ms · projéteis '+combat.projectiles.items.length+' · draws '+view.renderer.info.render.calls+' · tri '+view.renderer.info.render.triangles+'\n'+(session.run?'Andar '+session.run.floor+' · '+(game.elapsed-session.run.floorTimeStart).toFixed(0)+'s · '+(game.distance-session.run.floorDistanceStart).toFixed(0)+'m · regiões '+session.run.visitedRegions.length+' · '+(session.currentRegion?.name??'trilha'):'Última run: '+JSON.stringify(session.lastRun?.exploration??[]));perf.style.whiteSpace='pre-wrap';perf.style.maxWidth='430px';frameSamples=[];}}else if(game.paused)frameSamples=[];
      const dt = Math.min((now - last) / 1000, CONFIG.tick * CONFIG.maxCatchUpTicks); last = now;
      if(desktopClosing)game.paused=true;
      if (!game.paused) {
        view.orbit.update(dt, input.orbitAxis, reducedMotion.matches);
        accumulator += dt;
        while (accumulator >= CONFIG.tick) { session.update(CONFIG.tick, input.axis, view.azimuth); dirty=character.regenerate(CONFIG.tick)||dirty; accumulator -= CONFIG.tick; }
      } else { accumulator = 0; game.previous = { ...game.player }; }
      game.interactionTarget = session.interactions.update(game.player, game.paused||session.fishing.busy||session.mining.busy);
      view.update(game, game.paused ? 1 : accumulator / CONFIG.tick, dt, reducedMotion.matches);
      if(!food.busy)dirty=character.updateFoodTime()||dirty;
      biomePanel.update();kitchen.update(view);forgePanel.update(dt,view);panels.updateFoodUI();combatHud.update();abilityHud.update();fishingHud.update(view);miningHud.update(view);session.quest.observe(game,view.orbit);
      const boss=session.boss;$('boss-health').hidden=!boss||boss.dormant||!boss.alive;if(boss){$('boss-health-label').textContent=`BOSS · Slime Guardião · ${Math.ceil(boss.hp)} / ${boss.stats.maxHP}`;$('boss-health-bar').max=boss.stats.maxHP;$('boss-health-bar').value=boss.hp;}
      $('run-debug').hidden=params.get('debug')!=='1'||!session.run;if(session.run)$('run-debug').textContent=`Run ${session.run.seed} · Andar ${session.area.floorId} · Seed ${session.area.seed} · ${session.area.floorEnvironment?.type}`;
      $('floor-objective').hidden=session.area.safe;$('floor-objective').textContent=session.objectiveText;
      saveElapsed+=dt;if(saveElapsed>=2){flush();saveElapsed=0;}
      uiElapsed += dt; if (uiElapsed >= 0.05) { hud.update(); characterPanel.updateHUD(); uiElapsed = 0; }
      frameId = requestAnimationFrame(animate);
    } catch (error) { fatal(error); }
  };
  view.update(game, 1, 1, reducedMotion.matches); hud.update();
  $('loading').hidden = true; frameId = requestAnimationFrame(animate); focusWorld();
  if (import.meta.hot) import.meta.hot.dispose(() => { biomePanel.dispose();multiplayer.dispose();multiplayerPanel.dispose();removeDesktopClose?.();window.removeEventListener('keydown',characterKey);window.removeEventListener('pagehide',flush);perf?.remove();kitchen.dispose();forgePanel.dispose();fishingHud.dispose();miningHud.dispose();characterPanel.dialog.remove();rewardPanel.dispose();sound.dispose();panels.dispose();combatHud.dispose();abilityHud.dispose();saves.db.close();cancelAnimationFrame(frameId); input.dispose(); resizeObserver.disconnect(); view.dispose(); });
} catch (error) { fatal(error); }

}
bootstrap();
