import {canTalk} from '../domain/dialogue.js';
import './npc-dialog.css';
export function createNpcDialog({root,stop,notice,focus}){
 const dialog=document.createElement('dialog');dialog.className='npc-dialog';dialog.setAttribute('aria-label','Conversa');dialog.innerHTML='<div class="npc-portrait" role="img"></div><section><small>CIDADE DO LIMIAR</small><h2></h2><p></p><div class="npc-actions"><button data-next>Continuar</button><button data-exit>Fechar</button></div></section>';root.append(dialog);let current=null,index=0;
 const draw=()=>{dialog.querySelector('h2').textContent=current.name;dialog.querySelector('p').textContent=current.lines[index];const art=dialog.querySelector('.npc-portrait');art.style.backgroundPosition=`${current.art%3*50}% ${Math.floor(current.art/3)*100}%`;art.setAttribute('aria-label','Retrato de '+current.name);dialog.querySelector('[data-next]').textContent=index===current.lines.length-1?'Concluir':'Continuar';};
 const close=()=>{dialog.close();current=null;};dialog.querySelector('[data-exit]').onclick=close;dialog.querySelector('[data-next]').onclick=()=>{if(index+1<current.lines.length){index++;draw();}else close();};dialog.addEventListener('close',focus);dialog.addEventListener('keydown',e=>e.stopPropagation());
 return {open(world,player,npc){if(!canTalk(world,player,npc)){notice('Aproxime-se do NPC por um caminho livre para conversar.');return false;}stop();current=npc;index=0;draw();if(!dialog.open)dialog.showModal();return true;},close,dispose(){dialog.remove();},get isOpen(){return dialog.open;}};
}
