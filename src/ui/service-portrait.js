export function showServicePortrait(dialog,npc){
 let header=dialog.querySelector('.service-npc');
 if(!npc){header?.remove();return;}
 if(!header){header=document.createElement('div');header.className='service-npc';header.innerHTML='<div class="service-portrait" role="img"></div><strong></strong>';dialog.querySelector('h2')?.before(header);}
 header.querySelector('strong').textContent=npc.name;const art=header.querySelector('.service-portrait');art.style.backgroundPosition=`${npc.art%3*50}% ${Math.floor(npc.art/3)*100}%`;art.setAttribute('aria-label','Retrato de '+npc.name);
}
