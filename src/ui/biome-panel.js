import {ENVIRONMENTS} from '../world/biomes.js';

export class BiomePanel {
 constructor({session,open,notify,debug=false}){
  this.button=document.createElement('button');this.button.id='biome-playtest-button';this.button.textContent='Explorar biomas';this.button.className='biome-playtest-button';
  this.dialog=document.createElement('dialog');this.dialog.id='biome-playtest-dialog';
  this.dialog.innerHTML='<button class="close-button" aria-label="Fechar" data-close>×</button><span class="eyebrow">CAVE BIOME · PLAYTEST</span><h2>Explorar biomas</h2><p>Escolha onde iniciar a exploração. Depois, as saídas seguem a sequência natural daquela expedição. Equipe uma arma antes de partir.</p><p>O portal normal preserva a aventura de três andares e o Guardião. Esta exploração não tem boss nem baú final; use o portal da entrada para voltar ao Refúgio. XP e itens obtidos continuam no seu personagem.</p><div class="biome-choices"></div>';
  for(const [type,e]of Object.entries(ENVIRONMENTS)){const button=document.createElement('button');button.className='primary-button';button.textContent=e.name;button.onclick=()=>{try{session.startBiomePlaytest(type);this.dialog.close();}catch(error){notify(error.message);}};this.dialog.querySelector('.biome-choices').append(button);}
  document.querySelector('#app').append(this.button,this.dialog);
  this.button.onclick=()=>open(this.dialog.id);
  this.inspector=document.createElement('div');this.inspector.className='biome-inspector';
  if(debug){for(const [label,fraction]of [['Inspecionar entrada',0],['Inspecionar meio',.5],['Inspecionar saída',1]]){const button=document.createElement('button');button.textContent=label;button.onclick=()=>{if(session.area.safe||session.game.paused||session.fishing.busy)return;const w=session.area,region=w.graph.regions.find(r=>r.id===w.graph.mainPath[Math.round((w.graph.mainPath.length-1)*fraction)]);session.combat.cancel(true);session.game.path=[];Object.assign(session.game.player,{x:region.x,z:region.z,moving:false});session.game.previous={...session.game.player};};this.inspector.append(button);}document.querySelector('#app').append(this.inspector);}
  this.update=()=>{this.button.hidden=!session.area.safe;this.inspector.hidden=session.area.safe;};this.update();
 }
 dispose(){this.button.remove();this.dialog.remove();this.inspector.remove();}
}
