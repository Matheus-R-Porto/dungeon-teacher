import {canTalk} from '../domain/dialogue.js';
import {conversation,DialogueState} from '../domain/dialogue-state.js';
import {npcPortrait} from './npc-portraits.js';
import './npc-dialog.css';
export function createNpcDialog({root,stop=()=>{},notice=()=>{},focus=()=>{},effect}={}){
 const dialog=document.createElement('dialog');dialog.className='npc-dialog';dialog.setAttribute('aria-label','Conversa');
 dialog.innerHTML='<section class="npc-dialog-box"><small>CIDADE DO LIMIAR</small><h2></h2><p aria-live="polite"></p><div class="npc-choices" role="group" aria-label="Respostas"></div><div class="npc-actions"><button data-next>Continuar</button><button data-exit>Fechar</button></div><span class="npc-status" role="status"></span></section><div class="npc-portrait" role="img" hidden></div>';root.append(dialog);
 const box=dialog.querySelector('section'),portrait=dialog.querySelector('.npc-portrait'),choices=dialog.querySelector('.npc-choices'),next=dialog.querySelector('[data-next]'),status=dialog.querySelector('.npc-status');
 const abort=new AbortController();let image=null,generation=0,previousFocus=null,renderedNode=null,wasPending=false;
 const clearPortrait=()=>{generation++;if(image){image.onload=image.onerror=null;image=null;}portrait.hidden=true;portrait.classList.remove('faces-center');portrait.style.backgroundImage='';dialog.classList.remove('has-portrait');};
 const loadPortrait=r=>{clearPortrait();if(!r?.src)return;const token=generation;image=new Image();image.onload=()=>{if(token!==generation||!dialog.open)return;const cols=r.columns??1,rows=r.rows??1;portrait.style.aspectRatio=`${image.naturalWidth/cols} / ${image.naturalHeight/rows}`;portrait.style.backgroundImage=`url(${JSON.stringify(r.src)})`;portrait.style.backgroundSize=`${cols*100}% ${rows*100}%`;portrait.style.backgroundPosition=`${cols>1?(r.column??0)/(cols-1)*100:0}% ${rows>1?(r.row??0)/(rows-1)*100:0}%`;portrait.classList.toggle('faces-center',r.flipX===true);portrait.hidden=false;dialog.classList.add('has-portrait');const focused=document.activeElement;if(dialog.contains(focused)&&focused.tagName==='BUTTON')focused.scrollIntoView({block:'nearest',inline:'nearest'});image.onload=image.onerror=null;image=null;};image.onerror=()=>{if(token===generation)clearPortrait();};image.src=r.src;};
 const draw=()=>{
  if(!state.content){renderedNode=null;wasPending=false;if(dialog.open)dialog.close();clearPortrait();return;}
  const n=state.node,nodeChanged=renderedNode!==n.id;renderedNode=n.id;if(nodeChanged)status.textContent='';dialog.querySelector('h2').textContent=state.content.name;dialog.querySelector('p').textContent=n.text;portrait.setAttribute('aria-label','Retrato de '+state.content.name);
  const active=document.activeElement?.dataset.choice;choices.replaceChildren();for(const c of n.choices??[]){const b=document.createElement('button');b.textContent=c.label;b.dataset.choice=c.id;b.disabled=state.pending;b.onclick=()=>{status.textContent='';void state.choose(c.id);};choices.append(b);}
  choices.hidden=!choices.childElementCount;next.hidden=!!choices.childElementCount;next.disabled=state.pending;next.textContent=n.next?'Continuar':'Concluir';box.setAttribute('aria-busy',String(state.pending));if(state.pending)status.textContent='Aguarde a confirmação…';
  if((active||nodeChanged||wasPending)&&!state.pending&&dialog.open)([...choices.children].find(b=>b.dataset.choice===active)??choices.firstElementChild??next).focus();wasPending=state.pending;
 };
 const state=new DialogueState({effect,onChange:draw,onError:e=>{status.textContent=e.message;notice(e.message);}});
 const close=()=>state.close();dialog.querySelector('[data-exit]').onclick=close;next.onclick=()=>state.advance();
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('close',()=>{if(dialog.open)return;if(state.content)state.close();clearPortrait();stop();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null;focus();});
 dialog.addEventListener('keydown',e=>{e.stopPropagation();if(e.repeat){e.preventDefault();return;}if(e.key==='Escape'){e.preventDefault();close();return;}if((e.key==='Enter'||e.code==='Space')&&e.target.tagName==='BUTTON'){e.preventDefault();if(!e.target.disabled)e.target.click();return;}if(choices.childElementCount&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const buttons=[...choices.children].filter(b=>!b.disabled);if(!buttons.length)return;const i=buttons.indexOf(document.activeElement),step=['ArrowUp','ArrowLeft'].includes(e.key)?-1:1;buttons[(i+step+buttons.length)%buttons.length].focus();}});
 window.addEventListener('blur',()=>{if(dialog.open)close();},{signal:abort.signal});
 function present(c){stop();if(!dialog.open)previousFocus=document.activeElement;status.textContent='';state.open(c);if(!dialog.open)dialog.showModal();loadPortrait(c.portrait);(choices.firstElementChild??next).focus();return true;}
 return {dialog,open(world,player,npc){if(!canTalk(world,player,npc)){notice('Aproxime-se do NPC por um caminho livre para conversar.');return false;}return present({...conversation(npc),portrait:npc.portrait===null?null:npc.portrait??npcPortrait(npc.id)});},
 // Only call after the existing interaction/domain authority validates access.
 present,close,dispose(){abort.abort();close();dialog.remove();},get isOpen(){return dialog.open;}};
}
