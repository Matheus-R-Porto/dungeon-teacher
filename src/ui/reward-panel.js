import {RewardReel} from './reward-reel.js';
import {REWARD_TIMING,openingPose} from './reward-animation.js';
import {LOOT_POOL} from '../domain/items/loot.js';
import {validateChest,grantChest} from '../domain/items/chest.js';
import {ITEMS} from '../domain/items/inventory.js';
import {itemArt,escapeHTML,itemFacts} from './inventory-presentation.js';

const icon=id=>`<img src="${itemArt(id).inventoryIcon}" alt="" width="128" height="128" decoding="async">`;
export class RewardPanel {
  constructor(character,{open,save,safe,notify=()=>{},id='reward-dialog',timing={}}){
    Object.assign(this,{character,openDialog:open,save,safe,notify});this.timing={...REWARD_TIMING,...timing};
    this.dialog=document.createElement('dialog');this.dialog.id=id;this.dialog.className='rpg-dialog reward-experience';
    this.dialog.setAttribute('aria-labelledby',id+'-title');
    this.dialog.innerHTML=`<button class="close-button" data-close aria-label="Fechar recompensa">×</button>
      <header><span class="eyebrow">TESOUROS DA EXPEDIÇÃO</span><h2 id="${id}-title">Uma nova descoberta</h2><p class="reward-subtitle">Baú da Expedição</p></header>
      <div class="reward-stage"><div class="reward-chest" role="img" aria-label="Baú da Expedição fechado"><div class="reward-glow"></div><div class="reward-chest-sprite"></div></div>
      <div class="reward-wheel" hidden><div class="reel-window" aria-hidden="true"><div class="reel-indicator">◆</div><div class="reel-track"></div></div><span class="reward-wheel-caption">Um achado para a próxima jornada</span></div>
      <section class="reward-result" hidden aria-label="Recompensa recebida"></section></div>
      <ol class="reward-steps" aria-label="Etapas da descoberta"><li>O baú</li><li>A descoberta</li><li>Seu tesouro</li></ol>
      <p class="reel-status" role="status" aria-live="polite" aria-atomic="true"></p>
      <button class="primary-button" id="stop-reel" data-reward-action>Pular animação · Espaço</button><small class="reward-hint"></small>`;
    document.querySelector('#app').append(this.dialog);
    this.track=this.dialog.querySelector('.reel-track');this.action=this.dialog.querySelector('[data-reward-action]');
    this.closeButton=this.dialog.querySelector('[data-close]');this.status=this.dialog.querySelector('.reel-status');
    this.motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    this.action.onclick=()=>this.busy?this.stop():this.dialog.close();
    this.closeButton.onclick=()=>{if(!this.closeButton.disabled)this.dialog.close();};
    this.dialog.addEventListener('cancel',e=>{if(this.committing||this.phase==='waiting')e.preventDefault();});
    this.dialog.addEventListener('close',()=>{cancelAnimationFrame(this.frame);if(!this.committing)this.busy=false;});
    this.dialog.closeForSafety=()=>this.dialog.close();
    this.key=e=>{if(!this.dialog.open)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!this.committing&&this.phase!=='waiting')this.dialog.close();}else if(e.code==='Space'&&this.busy){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)this.stop();}};
    window.addEventListener('keydown',this.key,true);
    this.reduce=()=>{this.dialog.classList.toggle('reduced-motion',this.motion.matches);if(this.motion.matches&&this.busy&&this.reel)this.stop();};
    this.motion.addEventListener('change',this.reduce);
    this.dialog.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.dataset.fallback){e.target.dataset.fallback='true';e.target.src='/assets/items/inventory-v28/fallback.svg';}},true);
    // Preload the single atlas before a player invokes the presentation.
    this.atlas=new Image();this.atlas.src='/assets/rewards-v30/chest-opening.png';
  }
  reset(){
    cancelAnimationFrame(this.frame);this.busy=true;this.committing=false;this.reel=null;this.elapsed=0;this.spinElapsed=0;
    this.dialog.classList.toggle('reduced-motion',this.motion.matches);this.dialog.querySelector('.reward-result').hidden=true;
    this.dialog.querySelector('.reward-wheel').hidden=true;this.dialog.querySelector('.reward-chest').hidden=false;
    this.dialog.querySelector('.reward-result').replaceChildren();this.action.disabled=false;this.closeButton.disabled=false;
    this.action.textContent='Pular animação · Espaço';this.dialog.querySelector('h2').textContent='Uma nova descoberta';this.setPhase('closed',0);
  }
  show(instanceId){
    if(this.busy||this.dialog.open)return false;
    const selection=validateChest(this.character,instanceId,this.safe());
    this.selection=selection;this.reset();this.online=false;
    this.resolve=async()=>{const before=this.character.snapshot();try{const reward=grantChest(this.character,selection,this.safe());await this.save();return reward;}catch(error){this.character.data=before;this.character.recalculate();throw error;}};
    this.begin(selection.reward);this.openDialog(this.dialog.id);this.action.focus({preventScroll:true});this.animate();return true;
  }
  waitForServer(){
    if(this.busy||this.dialog.open)return false;this.reset();this.online=true;this.setPhase('waiting',0);
    this.closeButton.disabled=true;this.action.disabled=true;this.action.textContent='Aguardando confirmação…';
    this.status.textContent='O Refúgio está conferindo seu baú.';this.dialog.querySelector('.reward-hint').textContent='A recompensa será confirmada pelo servidor.';
    this.openDialog(this.dialog.id);return true;
  }
  showConfirmed(reward){
    if(this.phase!=='waiting'||!this.dialog.open)return;this.reset();this.online=true;
    this.resolve=async()=>reward;this.begin(reward);this.action.focus({preventScroll:true});this.animate();
  }
  begin(reward){
    this.reel=new RewardReel(reward,LOOT_POOL,{speed:this.timing.speed,duration:this.timing.slow});this.reel.update(LOOT_POOL.length/this.timing.speed);this.renderCards();this.position();
    this.status.textContent='A aventura guardou algo para você.';
    this.dialog.querySelector('.reward-hint').textContent=this.online?'Recompensa já salva no inventário.':'Esc para guardar o baú e abrir depois.';
  }
  setPhase(phase,frame){
    this.phase=phase;this.dialog.dataset.phase=phase;
    if(frame!==undefined){const sprite=this.dialog.querySelector('.reward-chest-sprite');sprite.style.backgroundPosition=`${frame%2*100}% ${Math.floor(frame/2)*100}%`;this.dialog.querySelector('.reward-chest').setAttribute('aria-label',frame===3?'Baú da Expedição aberto':frame===0?'Baú da Expedição fechado':'Baú da Expedição abrindo');}
    const step=['result','error'].includes(phase)?2:['reel','slowing','saving'].includes(phase)?1:0;
    this.dialog.querySelectorAll('.reward-steps li').forEach((el,i)=>{if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  }
  animate(){
    if(this.motion.matches){this.stop();return;}
    let previous=performance.now();const frame=now=>{if(!this.dialog.open)return;this.advance(Math.max(0,Math.min(.1,(now-previous)/1000)));previous=now;if(this.busy&&!this.committing)this.frame=requestAnimationFrame(frame);};
    this.frame=requestAnimationFrame(frame);
  }
  advance(dt){
    if(!this.busy||this.committing||!this.reel)return;
    this.elapsed+=dt;const pose=openingPose(this.elapsed,this.timing);
    if(pose.phase!=='reel'){this.setPhase(pose.phase,pose.frame);return;}
    if(this.phase!=='reel'&&this.phase!=='slowing'){
      this.setPhase('reel',3);this.dialog.querySelector('.reward-wheel').hidden=false;this.status.textContent='Revelando sua recompensa…';
    }
    this.spinElapsed+=dt;
    if(this.spinElapsed>=this.timing.spin&&this.reel.phase==='spinning'){this.reel.stop();this.renderCards();this.setPhase('slowing');}
    this.reel.update(dt);this.position();if(this.reel.phase==='stopped')this.commit();
  }
  renderCards(){this.track.innerHTML=this.reel.cards.map((id,i)=>`<div class="reel-item${i===this.reel.target?' selected':''}" data-item="${id}">${icon(id)}<small>${escapeHTML(ITEMS[id].name)}</small><b>×1</b></div>`).join('');}
  position(){this.track.style.transform=`translateX(calc(50% - ${this.reel.offset*112+56}px))`;}
  stop(){
    if(!this.busy||this.committing||!this.reel)return;
    cancelAnimationFrame(this.frame);this.reel.finish();this.renderCards();this.position();this.commit();
  }
  async commit(){
    if(!this.busy||this.committing)return;this.committing=true;this.setPhase('saving');
    this.closeButton.disabled=true;this.action.disabled=true;this.action.textContent='Guardando seu tesouro…';this.status.textContent='Confirmando a recompensa…';
    this.dialog.querySelector('.reward-hint').textContent='Aguarde a confirmação para continuar.';
    try{
      const reward=await this.resolve();if(this.disposed)return;
      const def=ITEMS[reward.itemId],result=this.dialog.querySelector('.reward-result');
      result.innerHTML=`<div class="reward-item-halo">${icon(reward.itemId)}<span>×1</span></div><span class="eyebrow">ADICIONADO AO INVENTÁRIO</span><h3>${escapeHTML(def.name)}</h3><p class="reward-facts">${escapeHTML(itemFacts(def,{quantity:1}).filter(x=>!x.startsWith('Quantidade:')).join(' · '))}</p><div class="reward-gold">+${reward.gold} <span>ouro</span></div>`;
      result.hidden=false;this.dialog.querySelector('.reward-chest').hidden=true;this.dialog.querySelector('.reward-wheel').hidden=true;
      this.dialog.querySelector('h2').textContent='Seu tesouro';this.setPhase('result');
      this.status.textContent=`Recebido: ${def.name} ×1 e ${reward.gold} ouro. Recompensa salva.`;
      this.dialog.querySelector('.reward-hint').textContent='Tudo pronto para a próxima aventura.';this.action.textContent='Continuar aventura';this.notify('Recompensa recebida · +'+reward.gold+' ouro');
    }catch(error){this.fail(error.message+' O baú foi preservado. Feche e tente novamente.');}
    finally{this.busy=false;this.committing=false;if(!this.disposed){this.closeButton.disabled=false;this.action.disabled=false;if(this.dialog.open)this.action.focus({preventScroll:true});}}
  }
  fail(message){
    cancelAnimationFrame(this.frame);this.busy=false;this.setPhase('error',0);this.status.textContent=message;
    this.dialog.querySelector('.reward-wheel').hidden=true;this.dialog.querySelector('h2').textContent='Ainda não foi desta vez';
    this.action.textContent='Voltar à aventura';this.action.disabled=false;this.closeButton.disabled=false;this.dialog.querySelector('.reward-hint').textContent='';
    if(this.dialog.open)this.action.focus({preventScroll:true});
  }
  dispose(){this.disposed=true;cancelAnimationFrame(this.frame);window.removeEventListener('keydown',this.key,true);this.motion.removeEventListener('change',this.reduce);if(!this.committing)this.busy=false;this.dialog.remove();}
}
