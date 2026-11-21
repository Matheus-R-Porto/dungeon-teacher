import {MINING,indicatorAt} from '../domain/mining.js';
import {SMITHING,SMITHING_RECIPES} from '../domain/smithing.js';
import {ITEMS} from '../domain/items/inventory.js';
// Presentation only: the server clock and confirmed snapshots drive both activities.
export class RemoteCraft {
 constructor(client,notify,stop){Object.assign(this,{client,notify,stop});this.profile={};this.pending=false;this.offset=0;this.abort=new AbortController();
  this.dialog=document.createElement('dialog');this.dialog.id='online-forge-dialog';this.dialog.className='rpg-dialog kitchen-dialog forge-dialog';
  this.dialog.innerHTML='<button class="close-button" data-close>×</button><h2>Forja do Brasa</h2><p data-stock></p><div data-recipes></div><section data-game hidden><p data-phase></p><div class="forge-meter"><span class="forge-zone-good"></span><span class="forge-zone-perfect"></span><i data-forge-marker></i></div><button data-strike>Martelar · F / Espaço</button><button data-cancel>Cancelar</button></section><p data-result role="status"></p>';
  document.getElementById('app').append(this.dialog);
  for(const r of SMITHING_RECIPES){const b=document.createElement('button');b.textContent=r.name+' · '+r.materials[0].quantity+' Minério Bruto';b.dataset.recipe=r.id;b.onclick=()=>this.run('forge',{action:'start',id:r.id});this.dialog.querySelector('[data-recipes]').append(b);}
  this.dialog.querySelector('[data-strike]').onclick=()=>this.run('forge',{action:'strike'});this.dialog.querySelector('[data-cancel]').onclick=()=>this.run('forge',{action:'cancel'});
  this.dialog.querySelector('[data-close]').onclick=()=>{if(!this.forge?.committed)this.dialog.close();};
  this.dialog.addEventListener('cancel',e=>{if(this.forge?.committed)e.preventDefault();});this.dialog.addEventListener('close',()=>{if(this.forge&&!this.forge.committed)this.run('forge',{action:'cancel'});});
  window.addEventListener('keydown',e=>{if(!this.dialog.open||e.repeat||e.target.matches('input,select,textarea'))return;if(e.key===' '||e.key.toLowerCase()==='f'){e.preventDefault();e.stopImmediatePropagation();if(this.forge?.state==='hammer')this.run('forge',{action:'strike'});}},{capture:true,signal:this.abort.signal});
 }
 sync(profile){if(!profile)return;this.profile=profile;this.offset=profile.serverNow-Date.now();}
 get now(){return Date.now()+this.offset;}
 get forge(){return this.profile.craft?.forge;}
 get mining(){return this.profile.craft?.mining;}
 get active(){return !!this.mining;}
 get busy(){return this.pending||this.active;}
 get state(){return this.mining?(this.now<this.mining.strikeAt?'prepare':'strike'):'idle';}
 get center(){return this.mining?.center??.5;}
 get indicator(){return indicatorAt((this.now-(this.mining?.strikeAt??this.now))/1000);}
 get result(){const r=this.profile.craft?.result;return r?.kind==='mine'?{id:r.id,kind:r.quality,text:r.quality==='PERFECT'?'PERFEITO!':'BOM!',xp:r.xp}:null;}
 remaining(){return Math.max(0,((this.profile.craft?.retryAt??0)-this.now)/1000);}
 start(id){this.stop();return this.run('mine',{action:'start',id});}
 strike(){return this.run('mine',{action:'strike'});}
 cancel(){return this.run('mine',{action:'cancel'});}
 async run(operation,data){if(this.pending)return;this.pending=true;try{const r=await this.client.progression(operation,data);this.sync(r.profile??this.client.snapshot?.profile);if(r.message)this.notify(r.message);}catch(e){this.notify(e.message);this.dialog.querySelector('[data-result]').textContent=e.message;}finally{this.pending=false;}}
 show(){this.stop();this.dialog.showModal();this.update();}
 update(){if(!this.dialog.open)return;const f=this.forge,root=this.dialog,ore=this.profile.inventory?.slots.reduce((n,i)=>n+(i?.definitionId==='rawOre'?i.quantity:0),0)??0;
  root.querySelector('[data-stock]').textContent='Minério Bruto: '+ore+' · Ferraria nível '+(this.profile.lifeSkills?.smithing.level??1);
  root.querySelector('[data-recipes]').hidden=!!f;root.querySelector('[data-game]').hidden=!f;root.querySelector('[data-close]').disabled=!!f?.committed;
  if(f){const hammer=f.state==='hammer',duration=hammer?SMITHING.sweepSeconds[f.index]:SMITHING.heatSeconds;root.querySelector('[data-phase]').textContent=f.state==='heating'?'Aquecendo…':hammer?'Martelada '+(f.index+1)+' de 3':'Golpe registrado';root.querySelector('[data-strike]').disabled=!hammer||this.pending;root.querySelector('[data-cancel]').disabled=f.committed||this.pending;const center=f.centers[f.index];for(const [name,half]of [['good',SMITHING.goodHalf],['perfect',SMITHING.perfectHalf]]){const n=root.querySelector('.forge-zone-'+name);n.style.left=(center-half)*100+'%';n.style.width=half*200+'%';}root.querySelector('[data-forge-marker]').style.left=(hammer?Math.max(0,Math.min(1,(this.now-f.at)/(duration*1000)))*100:0)+'%';}
  const result=this.profile.craft?.result;if(result?.kind==='forge')root.querySelector('[data-result]').textContent=ITEMS[result.item].name+' · '+result.quality+' · +'+result.xp+' Ferraria XP';
 }
 dispose(){this.abort.abort();this.dialog.remove();}
}
